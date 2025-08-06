'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';

interface GalleryItem {
  id: number;
  image: string;
  alt?: string;
  thumbnail?: string;
}

export default function GalleryClient() {
  const galleryItems: GalleryItem[] = [
    { id: 1, image: '/images/gallery/1.webp', alt: 'Gallery image 1' },
    { id: 2, image: '/images/gallery/2.webp', alt: 'Gallery image 2' },
    { id: 3, image: '/images/gallery/3.webp', alt: 'Gallery image 3' },
    { id: 4, image: '/images/gallery/4.webp', alt: 'Gallery image 4' },
    { id: 5, image: '/images/gallery/5.webp', alt: 'Gallery image 5' },
    { id: 6, image: '/images/gallery/6.webp', alt: 'Gallery image 6' },
    { id: 7, image: '/images/gallery/7.webp', alt: 'Gallery image 7' },
    { id: 8, image: '/images/gallery/8.webp', alt: 'Gallery image 8' },
    { id: 9, image: '/images/gallery/9.webp', alt: 'Gallery image 9' },
    { id: 10, image: '/images/gallery/10.webp', alt: 'Gallery image 10' },
    { id: 11, image: '/images/gallery/11.webp', alt: 'Gallery image 11' },
    { id: 12, image: '/images/gallery/12.webp', alt: 'Gallery image 12' },
    { id: 13, image: '/images/gallery/13.webp', alt: 'Gallery image 13' },
    { id: 14, image: '/images/gallery/14.webp', alt: 'Gallery image 14' },
    { id: 15, image: '/images/gallery/15.webp', alt: 'Gallery image 15' },
    { id: 16, image: '/images/gallery/16.webp', alt: 'Gallery image 16' },
    { id: 17, image: '/images/gallery/17.webp', alt: 'Gallery image 17' },
    { id: 18, image: '/images/gallery/18.webp', alt: 'Gallery image 18' },
    { id: 19, image: '/images/gallery/19.webp', alt: 'Gallery image 19' },
    { id: 20, image: '/images/gallery/20.webp', alt: 'Gallery image 20' },
    { id: 21, image: '/images/gallery/21.webp', alt: 'Gallery image 21' },
    { id: 22, image: '/images/gallery/22.webp', alt: 'Gallery image 22' },
    { id: 23, image: '/images/gallery/23.webp', alt: 'Gallery image 23' },
    { id: 24, image: '/images/gallery/24.webp', alt: 'Gallery image 24' },
    { id: 25, image: '/images/gallery/25.webp', alt: 'Gallery image 25' },
    { id: 26, image: '/images/gallery/26.webp', alt: 'Gallery image 26' },
    { id: 27, image: '/images/gallery/27.webp', alt: 'Gallery image 27' },
    { id: 28, image: '/images/gallery/28.webp', alt: 'Gallery image 28' },
    { id: 29, image: '/images/gallery/29.webp', alt: 'Gallery image 29' },
    { id: 30, image: '/images/gallery/30.webp', alt: 'Gallery image 30' },
    { id: 31, image: '/images/gallery/31.webp', alt: 'Gallery image 31' },
    { id: 32, image: '/images/gallery/32.webp', alt: 'Gallery image 32' },
    { id: 33, image: '/images/gallery/33.webp', alt: 'Gallery image 33' },
  ];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Memoized image dimensions for better performance
  const imageDimensions = useMemo(() => {
    const dimensions = new Map<number, { width: number; height: number }>();
    galleryItems.forEach((item, index) => {
      // Calculate optimal dimensions based on position in masonry
      const column = index % 4; // Assuming 4 columns max
      const width = 400;
      const height = 300 + (index % 3) * 50; // Vary height for masonry effect
      dimensions.set(item.id, { width, height });
    });
    return dimensions;
  }, [galleryItems]);

  // Advanced intersection observer with better performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const newVisibleItems = new Set(visibleItems);
        let hasChanges = false;

        entries.forEach((entry) => {
          const itemId = parseInt(entry.target.getAttribute('data-item-id') || '0');
          
          if (entry.isIntersecting) {
            if (!newVisibleItems.has(itemId)) {
              newVisibleItems.add(itemId);
              hasChanges = true;
            }
          }
        });

        if (hasChanges) {
          setVisibleItems(newVisibleItems);
        }
      },
      {
        rootMargin: '100px 0px', // Increased margin for better preloading
        threshold: [0, 0.1, 0.5, 1.0] // Multiple thresholds for better detection
      }
    );

    observerRef.current = observer;

    // Observe all gallery items
    const items = document.querySelectorAll('[data-item-id]');
    items.forEach(item => observer.observe(item));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleItems]);

  // Advanced preloading strategy
  useEffect(() => {
    if (lightboxOpen) {
      const preloadImage = (index: number) => {
        const item = galleryItems[index];
        if (!item || preloadedImages.has(item.id)) return;

        const img = new window.Image();
        img.onload = () => {
          setPreloadedImages(prev => new Set([...prev, item.id]));
          imageCache.current.set(item.image, img);
        };
        img.src = item.image;
      };

      // Preload next 2 and previous 2 images
      const indices = [
        (lightboxIndex + 1) % galleryItems.length,
        (lightboxIndex + 2) % galleryItems.length,
        (lightboxIndex - 1 + galleryItems.length) % galleryItems.length,
        (lightboxIndex - 2 + galleryItems.length) % galleryItems.length
      ];

      indices.forEach(index => preloadImage(index));
    }
  }, [lightboxOpen, lightboxIndex, galleryItems, preloadedImages]);

  // Performance monitoring
  useEffect(() => {
    const handleScroll = () => {
      // Throttle scroll events for better performance
      if (!isLoading) {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  // Memory cleanup
  useEffect(() => {
    return () => {
      imageCache.current.clear();
    };
  }, []);

  const openLightbox = useCallback((idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const prevImage = useCallback(() => 
    setLightboxIndex((i) => (i - 1 + galleryItems.length) % galleryItems.length), 
    [galleryItems.length]
  );

  const nextImage = useCallback(() => 
    setLightboxIndex((i) => (i + 1) % galleryItems.length), 
    [galleryItems.length]
  );

  const handleImageLoad = useCallback((itemId: number) => {
    setLoadedImages(prev => new Set([...prev, itemId]));
  }, []);

  // Optimized image loading with error handling
  const handleImageError = useCallback((itemId: number) => {
    console.warn(`Failed to load image for item ${itemId}`);
    // Could implement fallback image logic here
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Home':
          setLightboxIndex(0);
          break;
        case 'End':
          setLightboxIndex(galleryItems.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, prevImage, nextImage, closeLightbox, galleryItems.length]);

  // Optimized gallery items with virtual scrolling concept
  const optimizedGalleryItems = useMemo(() => {
    return galleryItems.map((item, index) => {
      const dimensions = imageDimensions.get(item.id);
      return {
        ...item,
        dimensions,
        priority: index < 8, // First 8 images get priority loading
        loading: (index < 4 ? 'eager' : 'lazy') as 'eager' | 'lazy'
      };
    });
  }, [galleryItems, imageDimensions]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-amber-50">
      <Navigation />
      <main className="flex-1 pt-32 pb-10">
        <div className="max-w-[95vw] mx-auto px-2 md:px-6">

          
          {/* Masonry Grid */}
          <div 
            ref={containerRef}
            className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 [column-fill:_balance]"
          >
            <div className="w-full h-0"></div>
            {optimizedGalleryItems.map((item, idx) => (
              <button
                key={item.id}
                data-item-id={item.id}
                className="mb-6 w-full rounded-3xl overflow-hidden shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white group transition-all duration-300"
                style={{ breakInside: 'avoid' }}
                onClick={() => openLightbox(idx)}
                aria-label={`Open ${item.alt || `Gallery image ${item.id}`}`}
              >
                <div className="relative w-full h-auto">
                  {visibleItems.has(item.id) && (
                    <Image
                      src={item.image}
                      alt={item.alt || `Gallery image ${item.id}`}
                      width={item.dimensions?.width || 400}
                      height={item.dimensions?.height || 300}
                      className="w-full h-auto object-cover rounded-3xl transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:brightness-90"
                      draggable={false}
                      loading={item.loading}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      onLoad={() => handleImageLoad(item.id)}
                      onError={() => handleImageError(item.id)}
                      style={{
                        opacity: loadedImages.has(item.id) ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out'
                      }}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      quality={item.priority ? 85 : 75}
                    />
                  )}
                  {!loadedImages.has(item.id) && visibleItems.has(item.id) && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-3xl" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lightbox Overlay */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in">
            <button
              className="cursor-pointer absolute top-6 right-8 bg-white/20 hover:bg-amber-400/30 text-white text-3xl font-bold rounded-full px-4 py-2 shadow-lg backdrop-blur-md transition-all focus:outline-none"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              ×
            </button>
            <button
              className="cursor-pointer absolute left-4 md:left-12 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-amber-400/30 text-white text-4xl font-bold rounded-full px-3 py-2 shadow-lg backdrop-blur-md transition-all focus:outline-none"
              onClick={prevImage}
              aria-label="Previous image"
            >
              ‹
            </button>
            <div className="relative max-h-[80vh] max-w-full">
              <Image
                src={galleryItems[lightboxIndex].image}
                alt={galleryItems[lightboxIndex].alt || `Gallery large ${lightboxIndex + 1}`}
                width={0}
                height={0}
                className="max-h-[80vh] max-w-full w-auto h-auto object-contain rounded-3xl shadow-2xl border-4 border-white animate-scale-in"
                draggable={false}
                priority
                quality={95}
                sizes="(max-width: 768px) 95vw, 80vw"
                unoptimized
              />
            </div>
            <button
              className="cursor-pointer absolute right-4 md:right-12 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-amber-400/30 text-white text-4xl font-bold rounded-full px-3 py-2 shadow-lg backdrop-blur-md transition-all focus:outline-none"
              onClick={nextImage}
              aria-label="Next image"
            >
              ›
            </button>
            
            {/* Enhanced image counter with keyboard hints */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm">
              {lightboxIndex + 1} / {galleryItems.length}
              <span className="block text-xs opacity-75 mt-1">
                Use ← → keys or click to navigate
              </span>
            </div>
          </div>
        )}
      </main>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
} 