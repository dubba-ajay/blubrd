/**
 * Secure, Reusable REST API Client for The Bluberd Full-Stack Integration
 * Supports automatic JWT token injection and automatic 401 token refresh.
 */

const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private getTokens() {
    try {
      const accessToken = localStorage.getItem('bluberd_access_token');
      const refreshToken = localStorage.getItem('bluberd_refresh_token');
      return { accessToken, refreshToken };
    } catch {
      return { accessToken: null, refreshToken: null };
    }
  }

  private saveTokens(accessToken: string, refreshToken?: string) {
    try {
      localStorage.setItem('bluberd_access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('bluberd_refresh_token', refreshToken);
      }
    } catch (e) {
      console.error('[ApiClient] Failed to save tokens:', e);
    }
  }

  public clearTokens() {
    try {
      localStorage.removeItem('bluberd_access_token');
      localStorage.removeItem('bluberd_refresh_token');
    } catch (e) {
      console.error('[ApiClient] Failed to clear tokens:', e);
    }
  }

  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      throw new Error('Refresh token expired or invalid');
    }

    const data = await res.json();
    if (!data.accessToken) {
      throw new Error('No access token returned from refresh endpoint');
    }

    this.saveTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  }

  public async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    // Setup headers
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Inject Access Token
    if (!options.skipAuth) {
      const { accessToken } = this.getTokens();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, fetchOptions);

      // Handle 401 Unauthorized for Auto-Refresh
      if (response.status === 401 && !options.skipAuth) {
        const { refreshToken } = this.getTokens();
        if (refreshToken) {
          // If we are already refreshing, queue this request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.subscribeTokenRefresh((newAccessToken) => {
                headers.set('Authorization', `Bearer ${newAccessToken}`);
                fetch(url, fetchOptions)
                  .then((res) => {
                    if (!res.ok) {
                      return res.json().then((err) => reject(new Error(err.error || 'Request failed')));
                    }
                    resolve(res.json());
                  })
                  .catch(reject);
              });
            });
          }

          this.isRefreshing = true;

          try {
            const newAccessToken = await this.refreshAccessToken(refreshToken);
            this.isRefreshing = false;
            this.onRefreshed(newAccessToken);

            // Retry original request with new token
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            const retryResponse = await fetch(url, fetchOptions);
            if (!retryResponse.ok) {
              const errData = await retryResponse.json().catch(() => ({}));
              throw new Error(errData.error || 'Retry request failed');
            }
            return await retryResponse.json();
          } catch (refreshErr) {
            this.isRefreshing = false;
            this.clearTokens();
            // Force a page-level logout event / notify listeners if possible
            window.dispatchEvent(new Event('bluberd-auth-failed'));
            throw refreshErr;
          }
        } else {
          // No refresh token available - session is completely unauthenticated or invalid
          this.clearTokens();
          window.dispatchEvent(new Event('bluberd-auth-failed'));
        }
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      // Handle empty responses
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error: any) {
      console.error(`[ApiClient] Request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  public get(endpoint: string, options: RequestOptions = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  public post(endpoint: string, body?: any, options: RequestOptions = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put(endpoint: string, body?: any, options: RequestOptions = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete(endpoint: string, options: RequestOptions = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  public setTokens(accessToken: string, refreshToken: string) {
    this.saveTokens(accessToken, refreshToken);
  }
}

export const apiClient = new ApiClient();
