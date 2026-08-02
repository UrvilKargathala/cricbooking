'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Area } from '@/types'

interface AreaSelectorProps {
  areas: Area[]
  selectedArea: string | null
  onChange: (slug: string | null) => void
}

export function AreaSelector({ areas, selectedArea, onChange }: AreaSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => observer.disconnect()
  }, [areas])

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const pillClass = (active: boolean) =>
    cn(
      'shrink-0 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors',
      active
        ? 'bg-brand-600 text-white border-brand-600'
        : 'bg-surface-100 text-surface-800 border-transparent hover:border-brand-400 hover:bg-white'
    )

  return (
    <div className="relative flex items-center">
      {canScrollLeft && (
        <button
          onClick={() => scrollBy(-160)}
          aria-label="Scroll left"
          className="hidden sm:flex absolute left-0 z-10 w-8 h-8 items-center justify-center rounded-full bg-white border border-surface-200 shadow-sm hover:bg-surface-100"
        >
          <ChevronLeft className="w-4 h-4 text-surface-800" />
        </button>
      )}

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth"
        >
          <button onClick={() => onChange(null)} className={pillClass(selectedArea === null)}>
            All Areas
          </button>
          {areas.map((area) => (
            <button
              key={area.slug}
              onClick={() => onChange(area.slug)}
              className={pillClass(selectedArea === area.slug)}
            >
              {area.name}
            </button>
          ))}
        </div>

        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-white to-transparent" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-white to-transparent" />
        )}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scrollBy(160)}
          aria-label="Scroll right"
          className="hidden sm:flex absolute right-0 z-10 w-8 h-8 items-center justify-center rounded-full bg-white border border-surface-200 shadow-sm hover:bg-surface-100"
        >
          <ChevronRight className="w-4 h-4 text-surface-800" />
        </button>
      )}
    </div>
  )
}
