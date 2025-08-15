'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';

interface GalleryItem {
  id: number;
  image: string;
  alt?: string;
  thumbnail?: string;
  mobileImage?: string; // Mobile-optimized image
}

export default function GalleryClient() {
  const galleryItems: GalleryItem[] = [
    { 
      id: 1, 
      image: '/images/gallery/1.webp', 
      mobileImage: '/images/gallery/1.webp?w=400&q=75', // Mobile optimized
      alt: 'Gallery image 1' 
    },
    { 
      id: 2, 
      image: '/images/gallery/2.webp', 
      mobileImage: '/images/gallery/2.webp?w=400&q=75',
      alt: 'Gallery image 2' 
    },
    { 
      id: 3, 
      image: '/images/gallery/3.webp', 
      mobileImage: '/images/gallery/3.webp?w=400&q=75',
      alt: 'Gallery image 3' 
    },
    { 
      id: 4, 
      image: '/images/gallery/4.webp', 
      mobileImage: '/images/gallery/4.webp?w=400&q=75',
      alt: 'Gallery image 4' 
    },
    { 
      id: 5, 
      image: '/images/gallery/5.webp', 
      mobileImage: '/images/gallery/5.webp?w=400&q=75',
      alt: 'Gallery image 5' 
    },
    { 
      id: 6, 
      image: '/images/gallery/6.webp', 
      mobileImage: '/images/gallery/6.webp?w=400&q=75',
      alt: 'Gallery image 6' 
    },
    { 
      id: 7, 
      image: '/images/gallery/7.webp', 
      mobileImage: '/images/gallery/7.webp?w=400&q=75',
      alt: 'Gallery image 7' 
    },
    { 
      id: 8, 
      image: '/images/gallery/8.webp', 
      mobileImage: '/images/gallery/8.webp?w=400&q=75',
      alt: 'Gallery image 8' 
    },
    { 
      id: 9, 
      image: '/images/gallery/9.webp', 
      mobileImage: '/images/gallery/9.webp?w=400&q=75',
      alt: 'Gallery image 9' 
    },
    { 
      id: 10, 
      image: '/images/gallery/10.webp', 
      mobileImage: '/images/gallery/10.webp?w=400&q=75',
      alt: 'Gallery image 10' 
    },
    { 
      id: 11, 
      image: '/images/gallery/11.webp', 
      mobileImage: '/images/gallery/11.webp?w=400&q=75',
      alt: 'Gallery image 11' 
    },
    { 
      id: 12, 
      image: '/images/gallery/12.webp', 
      mobileImage: '/images/gallery/12.webp?w=400&q=75',
      alt: 'Gallery image 12' 
    },
    { 
      id: 13, 
      image: '/images/gallery/13.webp', 
      mobileImage: '/images/gallery/13.webp?w=400&q=75',
      alt: 'Gallery image 13' 
    },
    { 
      id: 14, 
      image: '/images/gallery/14.webp', 
      mobileImage: '/images/gallery/14.webp?w=400&q=75',
      alt: 'Gallery image 14' 
    },
    { 
      id: 15, 
      image: '/images/gallery/15.webp', 
      mobileImage: '/images/gallery/15.webp?w=400&q=75',
      alt: 'Gallery image 15' 
    },
    { 
      id: 16, 
      image: '/images/gallery/16.webp', 
      mobileImage: '/images/gallery/16.webp?w=400&q=75',
      alt: 'Gallery image 16' 
    },
    { 
      id: 17, 
      image: '/images/gallery/17.webp', 
      mobileImage: '/images/gallery/17.webp?w=400&q=75',
      alt: 'Gallery image 17' 
    },
    { 
      id: 18, 
      image: '/images/gallery/18.webp', 
      mobileImage: '/images/gallery/18.webp?w=400&q=75',
      alt: 'Gallery image 18' 
    },
    { 
      id: 19, 
      image: '/images/gallery/19.webp', 
      mobileImage: '/images/gallery/19.webp?w=400&q=75',
      alt: 'Gallery image 19' 
    },
    { 
      id: 20, 
      image: '/images/gallery/20.webp', 
      mobileImage: '/images/gallery/20.webp?w=400&q=75',
      alt: 'Gallery image 20' 
    },
    { 
      id: 21, 
      image: '/images/gallery/21.webp', 
      mobileImage: '/images/gallery/21.webp?w=400&q=75',
      alt: 'Gallery image 21' 
    },
    { 
      id: 22, 
      image: '/images/gallery/22.webp', 
      mobileImage: '/images/gallery/22.webp?w=400&q=75',
      alt: 'Gallery image 22' 
    },
    { 
      id: 23, 
      image: '/images/gallery/23.webp', 
      mobileImage: '/images/gallery/23.webp?w=400&q=75',
      alt: 'Gallery image 23' 
    },
    { 
      id: 24, 
      image: '/images/gallery/24.webp', 
      mobileImage: '/images/gallery/24.webp?w=400&q=75',
      alt: 'Gallery image 24' 
    },
    { 
      id: 25, 
      image: '/images/gallery/25.webp', 
      mobileImage: '/images/gallery/25.webp?w=400&q=75',
      alt: 'Gallery image 25' 
    },
    { 
      id: 26, 
      image: '/images/gallery/26.webp', 
      mobileImage: '/images/gallery/26.webp?w=400&q=75',
      alt: 'Gallery image 26' 
    },
    { 
      id: 27, 
      image: '/images/gallery/27.webp', 
      mobileImage: '/images/gallery/27.webp?w=400&q=75',
      alt: 'Gallery image 27' 
    },
    { 
      id: 28, 
      image: '/images/gallery/28.webp', 
      mobileImage: '/images/gallery/28.webp?w=400&q=75',
      alt: 'Gallery image 28' 
    },
    { 
      id: 29, 
      image: '/images/gallery/29.webp', 
      mobileImage: '/images/gallery/29.webp?w=400&q=75',
      alt: 'Gallery image 29' 
    },
    { 
      id: 30, 
      image: '/images/gallery/30.webp', 
      mobileImage: '/images/gallery/30.webp?w=400&q=75',
      alt: 'Gallery image 30' 
    },
    { 
      id: 31, 
      image: '/images/gallery/31.webp', 
      mobileImage: '/images/gallery/31.webp?w=400&q=75',
      alt: 'Gallery image 31' 
    },
    { 
      id: 32, 
      image: '/images/gallery/32.webp', 
      mobileImage: '/images/gallery/32.webp?w=400&q=75',
      alt: 'Gallery image 32' 
    },
    { 
      id: 33, 
      image: '/images/gallery/33.webp', 
      mobileImage: '/images/gallery/33.webp?w=400&q=75',
      alt: 'Gallery image 33' 
    },
    { 
      id: 34, 
      image: '/images/gallery/34.webp', 
      mobileImage: '/images/gallery/34.webp?w=400&q=75',
      alt: 'Gallery image 34' 
    },
    { 
      id: 35, 
      image: '/images/gallery/35.webp', 
      mobileImage: '/images/gallery/35.webp?w=400&q=75',
      alt: 'Gallery image 35' 
    },
    { 
      id: 36, 
      image: '/images/gallery/36.webp', 
      mobileImage: '/images/gallery/36.webp?w=400&q=75',
      alt: 'Gallery image 36' 
    },
    { 
      id: 37, 
      image: '/images/gallery/37.webp', 
      mobileImage: '/images/gallery/37.webp?w=400&q=75',
      alt: 'Gallery image 37' 
    },
    { 
      id: 38, 
      image: '/images/gallery/38.webp', 
      mobileImage: '/images/gallery/38.webp?w=400&q=75',
      alt: 'Gallery image 38' 
    },
    { 
      id: 39, 
      image: '/images/gallery/39.webp', 
      mobileImage: '/images/gallery/39.webp?w=400&q=75',
      alt: 'Gallery image 39' 
    },
    { 
      id: 40, 
      image: '/images/gallery/40.webp', 
      mobileImage: '/images/gallery/40.webp?w=400&q=75',
      alt: 'Gallery image 40' 
    },
    { 
      id: 41, 
      image: '/images/gallery/41.webp', 
      mobileImage: '/images/gallery/41.webp?w=400&q=75',
      alt: 'Gallery image 41' 
    },
    { 
      id: 42, 
      image: '/images/gallery/42.webp', 
      mobileImage: '/images/gallery/42.webp?w=400&q=75',
      alt: 'Gallery image 42' 
    },
    { 
      id: 43, 
      image: '/images/gallery/43.webp', 
      mobileImage: '/images/gallery/43.webp?w=400&q=75',
      alt: 'Gallery image 43' 
    },
    { 
      id: 44, 
      image: '/images/gallery/44.webp', 
      mobileImage: '/images/gallery/44.webp?w=400&q=75',
      alt: 'Gallery image 44' 
    },
    { 
      id: 45, 
      image: '/images/gallery/45.webp', 
      mobileImage: '/images/gallery/45.webp?w=400&q=75',
      alt: 'Gallery image 45' 
    },
    { 
      id: 46, 
      image: '/images/gallery/46.webp', 
      mobileImage: '/images/gallery/46.webp?w=400&q=75',
      alt: 'Gallery image 46' 
    },
    { 
      id: 47, 
      image: '/images/gallery/47.webp', 
      mobileImage: '/images/gallery/47.webp?w=400&q=75',
      alt: 'Gallery image 47' 
    },
    { 
      id: 48, 
      image: '/images/gallery/48.webp', 
      mobileImage: '/images/gallery/48.webp?w=400&q=75',
      alt: 'Gallery image 48' 
    },
    { 
      id: 49, 
      image: '/images/gallery/49.webp', 
      mobileImage: '/images/gallery/49.webp?w=400&q=75',
      alt: 'Gallery image 49' 
    },
    { 
      id: 50, 
      image: '/images/gallery/50.webp', 
      mobileImage: '/images/gallery/50.webp?w=400&q=75',
      alt: 'Gallery image 50' 
    },
    { 
      id: 51, 
      image: '/images/gallery/51.webp', 
      mobileImage: '/images/gallery/51.webp?w=400&q=75',
      alt: 'Gallery image 51' 
    },
    { 
      id: 52, 
      image: '/images/gallery/52.webp', 
      mobileImage: '/images/gallery/52.webp?w=400&q=75',
      alt: 'Gallery image 52' 
    },
    { 
      id: 53, 
      image: '/images/gallery/53.webp', 
      mobileImage: '/images/gallery/53.webp?w=400&q=75',
      alt: 'Gallery image 53' 
    },
    { 
      id: 54, 
      image: '/images/gallery/54.webp', 
      mobileImage: '/images/gallery/54.webp?w=400&q=75',
      alt: 'Gallery image 54' 
    },
    { 
      id: 55, 
      image: '/images/gallery/55.webp', 
      mobileImage: '/images/gallery/55.webp?w=400&q=75',
      alt: 'Gallery image 55' 
    },
    { 
      id: 56, 
      image: '/images/gallery/56.webp', 
      mobileImage: '/images/gallery/56.webp?w=400&q=75',
      alt: 'Gallery image 56' 
    },
    { 
      id: 57, 
      image: '/images/gallery/57.webp', 
      mobileImage: '/images/gallery/57.webp?w=400&q=75',
      alt: 'Gallery image 57' 
    },
    { 
      id: 58, 
      image: '/images/gallery/58.webp', 
      mobileImage: '/images/gallery/58.webp?w=400&q=75',
      alt: 'Gallery image 58' 
    },
    { 
      id: 59, 
      image: '/images/gallery/59.webp', 
      mobileImage: '/images/gallery/59.webp?w=400&q=75',
      alt: 'Gallery image 59' 
    },
  ];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Swipe gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!lightboxOpen) return;
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, [lightboxOpen]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!lightboxOpen) return;
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, [lightboxOpen]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !lightboxOpen) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const minSwipeDistance = 50;

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // Swipe left - next image
        nextImage();
      } else {
        // Swipe right - previous image
        prevImage();
      }
    }

    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, lightboxOpen]);

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

  // Advanced preloading strategy with mobile optimization
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
        
        // Use mobile-optimized image for mobile devices
        const imageSrc = isMobile && item.mobileImage ? item.mobileImage : item.image;
        img.src = imageSrc;
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
  }, [lightboxOpen, lightboxIndex, galleryItems, preloadedImages, isMobile]);

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

  // Optimized gallery items with virtual scrolling concept and mobile optimization
  const optimizedGalleryItems = useMemo(() => {
    return galleryItems.map((item, index) => {
      const dimensions = imageDimensions.get(item.id);
      return {
        ...item,
        dimensions,
        priority: index < 8, // First 8 images get priority loading
        loading: (index < 4 ? 'eager' : 'lazy') as 'eager' | 'lazy',
        // Mobile-specific optimization
        mobileOptimized: isMobile && item.mobileImage ? item.mobileImage : item.image
      };
    });
  }, [galleryItems, imageDimensions, isMobile]);

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
                      src={item.mobileOptimized}
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
                      sizes={isMobile ? "100vw" : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"}
                      quality={isMobile ? 75 : (item.priority ? 85 : 75)}
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

        {/* Lightbox Overlay with Swipe Support */}
        {lightboxOpen && (
          <div 
            ref={lightboxRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
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
            
            {/* Enhanced image counter with mobile swipe hints */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm">
              {lightboxIndex + 1} / {galleryItems.length}
              <span className="block text-xs opacity-75 mt-1">
                {isMobile ? 'Swipe left/right to navigate' : 'Use ← → keys or click to navigate'}
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