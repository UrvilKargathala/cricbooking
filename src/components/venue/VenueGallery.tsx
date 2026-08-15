'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VenueGalleryProps {
  images: string[]
  alt: string
}

export function VenueGallery({ images, alt }: VenueGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-brand-200 to-brand-600 flex items-center justify-center">
        <span className="font-display font-bold text-6xl text-white/80">{alt.charAt(0)}</span>
      </div>
    )
  }

  const step = (delta: number) => setActiveIndex((i) => (i + delta + images.length) % images.length)

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-100 w-full"
      >
        <img src={images[activeIndex]} alt={alt} className="w-full h-full object-cover" />
        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <Expand className="w-3.5 h-3.5" />
          View fullscreen
        </span>
      </button>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image + index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'aspect-[4/3] rounded-lg overflow-hidden border-2 transition-colors',
                index === activeIndex ? 'border-brand-600' : 'border-transparent hover:border-surface-200'
              )}
            >
              <img src={image} alt={`${alt} photo ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); step(-1) }}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); step(1) }}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <img
            src={images[activeIndex]}
            alt={alt}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="absolute bottom-4 text-white/70 text-sm">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  )
}
