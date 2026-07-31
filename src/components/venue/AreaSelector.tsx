'use client'

import { cn } from '@/lib/utils'
import type { Area } from '@/types'

interface AreaSelectorProps {
  areas: Area[]
  selectedArea: string | null
  onChange: (slug: string | null) => void
}

export function AreaSelector({ areas, selectedArea, onChange }: AreaSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors',
          selectedArea === null
            ? 'bg-brand-600 text-white border-brand-600'
            : 'bg-white text-surface-800 border-surface-200 hover:border-brand-400'
        )}
      >
        All Areas
      </button>
      {areas.map((area) => (
        <button
          key={area.slug}
          onClick={() => onChange(area.slug)}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors',
            selectedArea === area.slug
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-surface-800 border-surface-200 hover:border-brand-400'
          )}
        >
          {area.name}
        </button>
      ))}
    </div>
  )
}
