'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';

export default function GalleryClient() {
  const galleryItems = [
    { id: 1, image: '/images/gallery/1.webp' },
    { id: 2, image: '/images/gallery/2.webp' },
    { id: 3, image: '/images/gallery/3.webp' },
    { id: 4, image: '/images/gallery/4.webp' },
    { id: 5, image: '/images/gallery/5.webp' },
    { id: 6, image: '/images/gallery/6.webp' },
    { id: 7, image: '/images/gallery/7.webp' },
    { id: 8, image: '/images/gallery/8.webp' },
    { id: 9, image: '/images/gallery/9.webp' },
    { id: 10, image: '/images/gallery/10.webp' },
    { id: 11, image: '/images/gallery/11.webp' },
    { id: 12, image: '/images/gallery/12.webp' },
    { id: 13, image: '/images/gallery/13.webp' },
    { id: 14, image: '/images/gallery/14.webp' },
    { id: 15, image: '/images/gallery/15.webp' },
    { id: 16, image: '/images/gallery/16.webp' },
    { id: 17, image: '/images/gallery/17.webp' },
    { id: 18, image: '/images/gallery/18.webp' },
    { id: 19, image: '/images/gallery/19.webp' },
    { id: 20, image: '/images/gallery/20.webp' },
    { id: 21, image: '/images/gallery/21.webp' },
    { id: 22, image: '/images/gallery/22.webp' },
    { id: 23, image: '/images/gallery/23.webp' },
    { id: 24, image: '/images/gallery/24.webp' },
    { id: 25, image: '/images/gallery/25.webp' },
    { id: 26, image: '/images/gallery/26.webp' },
    { id: 27, image: '/images/gallery/27.webp' },
    { id: 28, image: '/images/gallery/28.webp' },
    { id: 29, image: '/images/gallery/29.webp' },
    { id: 30, image: '/images/gallery/30.webp' },
    { id: 31, image: '/images/gallery/31.webp' },
    { id: 32, image: '/images/gallery/32.webp' },
    { id: 33, image: '/images/gallery/33.webp' },
  ];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImage = () => setLightboxIndex((i) => (i - 1 + galleryItems.length) % galleryItems.length);
  const nextImage = () => setLightboxIndex((i) => (i + 1) % galleryItems.length);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-amber-50">
      <Navigation />
      <main className="flex-1 pt-32 pb-10">
        <div className="max-w-[95vw] mx-auto px-2 md:px-6">
          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 [column-fill:_balance]"><div className="w-full h-0"></div>{galleryItems.map((item, idx) => (
            <button
              key={item.id}
              className="mb-6 w-full rounded-3xl overflow-hidden shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white group transition-all duration-300"
              style={{ breakInside: 'avoid' }}
              onClick={() => openLightbox(idx)}
              aria-label="Open image"
            >
              <img
                src={item.image}
                alt="Gallery image"
                className="w-full h-auto object-cover rounded-3xl transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:brightness-90"
                draggable={false}
              />
            </button>
          ))}</div>
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
            <img
              src={galleryItems[lightboxIndex].image}
              alt="Gallery large"
              className="max-h-[80vh] max-w-full rounded-3xl shadow-2xl border-4 border-white animate-scale-in"
              draggable={false}
            />
            <button
              className="cursor-pointer absolute right-4 md:right-12 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-amber-400/30 text-white text-4xl font-bold rounded-full px-3 py-2 shadow-lg backdrop-blur-md transition-all focus:outline-none"
              onClick={nextImage}
              aria-label="Next image"
            >
              ›
            </button>
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