'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface VenueGalleryProps {
  images: string[]
  alt: string
}

export function VenueGallery({ images, alt }: VenueGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-brand-200 to-brand-600 flex items-center justify-center">
        <span className="font-display font-bold text-6xl text-white/80">{alt.charAt(0)}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-100">
        <img src={images[activeIndex]} alt={alt} className="w-full h-full object-cover" />
      </div>
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
    </div>
  )
}
