import React, { useState, useRef } from 'react';
import { Share2, ChevronLeft, ChevronRight, Play, Volume2, VolumeX, Maximize2, X } from 'lucide-react';

interface ProductGalleryProps {
  images?: string[];
  onShare?: () => void;
}

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

export default function ProductGallery({ images = [] , onShare }: ProductGalleryProps) {
  const safeImages = images || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  
  // Fullscreen Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const touchStartX = useRef<number | null>(null);

  // Elegant fashion model video placeholder for the brand
  const videoUrl = 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba207810ef13017d072eef902e07&profile_id=139&oauth2_token_id=57447761';
  
  // Combine images and video into a single slider list
  const mediaItems: MediaItem[] = [
    ...safeImages.map(img => ({ type: 'image' as const, url: img })),
    { type: 'video' as const, url: videoUrl }
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    const threshold = 40; // 40px threshold to navigate

    if (deltaX > threshold) {
      handlePrev();
    } else if (deltaX < -threshold) {
      handleNext();
    }
    touchStartX.current = null;
  };

  // Mouse Drag navigation
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStartX === null) return;
    const deltaX = e.clientX - dragStartX;
    const threshold = 40;

    if (deltaX > threshold) {
      handlePrev();
    } else if (deltaX < -threshold) {
      handleNext();
    }
    setDragStartX(null);
  };

  return (
    <div id="product-gallery-root" className="flex flex-col-reverse md:flex-row gap-4 items-start w-full">
      {/* Side Thumbnails Column */}
      <div
        id="side-thumbnails-selector"
        className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto w-full md:w-16 lg:w-20 shrink-0 pb-1 md:pb-0 scrollbar-none"
      >
        {mediaItems.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={`thumb-${idx}`}
              onClick={() => setActiveIndex(idx)}
              className={`w-14 h-[74px] md:w-full md:h-auto md:aspect-[3/4] overflow-hidden border transition-all duration-300 cursor-pointer rounded-none shrink-0 relative ${
                isActive
                  ? 'border-brand-accent ring-1 ring-brand-accent'
                  : 'border-stone-200 hover:border-stone-400'
              }`}
              aria-label={`View item ${idx + 1}`}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={`Product thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-stone-900 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play size={16} className="text-brand-accent" />
                  </div>
                  <span className="absolute bottom-1 right-1 text-[8px] text-white font-sans bg-black/60 px-1 uppercase tracking-widest font-semibold">Video</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Image Stage */}
      <div className="flex-grow w-full relative">
        <div
          id="main-gallery-stage"
          className="aspect-[3/4] w-full rounded-none bg-stone-100 overflow-hidden border border-stone-200 relative select-none group cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={() => {
            if (mediaItems[activeIndex].type === 'image') {
              setLightboxOpen(true);
            }
          }}
        >
          {/* Media Player or Image display */}
          {mediaItems[activeIndex].type === 'image' ? (
            <div className="w-full h-full overflow-hidden relative">
              <img
                src={mediaItems[activeIndex].url}
                alt="Active product view"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-black relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <video
                src={mediaItems[activeIndex].url}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted={isMuted}
                playsInline
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="absolute bottom-3 left-3 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full border border-stone-800 transition-colors cursor-pointer"
                title={isMuted ? "Unmute Video" : "Mute Video"}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <div className="absolute top-3 left-3 bg-[#C78147]/95 text-white text-[10px] font-sans uppercase font-bold tracking-widest px-2.5 py-1">
                Runway Preview
              </div>
            </div>
          )}

          {/* Slide Navigation Arrows */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-brand-black w-8 h-8 flex items-center justify-center shadow-md border border-stone-200 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            title="Previous view"
          >
            <ChevronLeft size={18} />
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-brand-black w-8 h-8 flex items-center justify-center shadow-md border border-stone-200 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            title="Next view"
          >
            <ChevronRight size={18} />
          </button>

          {/* Floating Share Button on top right */}
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-brand-black p-2 rounded-full shadow-md backdrop-blur-xs transition-all hover:scale-105 active:scale-95 border border-stone-200/50 cursor-pointer flex items-center justify-center"
              title="Share Product"
            >
              <Share2 size={15} />
            </button>
          )}

          {/* Fullscreen lightbox expand option on top left */}
          {mediaItems[activeIndex].type === 'image' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(true);
              }}
              className="absolute top-3 left-3 z-10 bg-white/90 hover:bg-white text-brand-black p-2 rounded-full shadow-md backdrop-blur-xs transition-all hover:scale-105 active:scale-95 border border-stone-200/50 cursor-pointer flex items-center justify-center"
              title="Expand Fullscreen"
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>

        {/* Dotted Circular Slide Indicator Row for all screens */}
        <div id="dotted-slide-indicators" className="flex items-center justify-center gap-3 py-3">
          {mediaItems.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={`dot-${idx}`}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                  isActive
                    ? 'bg-brand-accent scale-125 w-3'
                    : 'bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* LUXURY INTERACTIVE FULLSCREEN LIGHTBOX MODAL */}
      {lightboxOpen && mediaItems[activeIndex].type === 'image' && (
        <div 
          className="fixed inset-0 bg-black/98 z-50 flex flex-col justify-between p-4 sm:p-6 select-none animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between w-full z-10" onClick={(e) => e.stopPropagation()}>
            <div className="text-white/70 font-sans text-xs tracking-widest uppercase">
              Full View — {activeIndex + 1} / {mediaItems.filter(m => m.type === 'image').length}
            </div>
            
            <button 
              onClick={() => setLightboxOpen(false)}
              className="w-9 h-9 flex items-center justify-center bg-brand-accent text-white transition-all hover:bg-[#a95a18] active:scale-95 cursor-pointer ml-2"
              title="Close Fullscreen"
            >
              <X size={18} />
            </button>
          </div>

          {/* Central Stage */}
          <div className="flex-grow w-full flex items-center justify-center relative overflow-hidden my-4">
            {/* Lightbox Prev / Next Arrows */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-4 z-20 bg-zinc-900/80 hover:bg-zinc-800 text-white w-10 h-10 flex items-center justify-center border border-white/20 cursor-pointer transition-all"
              title="Previous image"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-4 z-20 bg-zinc-900/80 hover:bg-zinc-800 text-white w-10 h-10 flex items-center justify-center border border-white/20 cursor-pointer transition-all"
              title="Next image"
            >
              <ChevronRight size={22} />
            </button>

            <div onClick={(e) => e.stopPropagation()}>
              <img 
                src={mediaItems[activeIndex].url} 
                alt="Product High Resolution view" 
                className="max-h-[78vh] max-w-[88vw] object-contain shadow-2xl border border-white/5 pointer-events-none select-none"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Bottom Bar Thumbnail Strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10" onClick={(e) => e.stopPropagation()}>
            {mediaItems.filter(item => item.type === 'image').map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={`lightbox-thumb-${idx}`}
                  onClick={() => {
                    setActiveIndex(idx);
                  }}
                  className={`w-12 h-16 shrink-0 overflow-hidden border transition-all cursor-pointer ${
                    isActive ? 'border-brand-accent scale-105' : 'border-stone-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

