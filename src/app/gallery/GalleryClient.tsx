'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function GalleryClient() {
  const galleryItems = [
    { id: 1, image: 'https://picsum.photos/1920/1080?random=10' },
    { id: 2, image: 'https://picsum.photos/1200/600?random=11' },
    { id: 3, image: 'https://picsum.photos/800/400?random=12' },
    { id: 4, image: 'https://picsum.photos/1920/720?random=13' },
    { id: 5, image: 'https://picsum.photos/1920/1080?random=14' },
    { id: 6, image: 'https://picsum.photos/1280/720?random=15' },
    { id: 7, image: 'https://picsum.photos/1440/720?random=16' },
    { id: 8, image: 'https://picsum.photos/1200/600?random=17' },
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
        <div className="max-w-7xl mx-auto px-2 md:px-6">
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
      <Footer />
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