'use client'

import { useState } from 'react'
import { Check, Plus, Users, Ruler } from 'lucide-react'
import { cn, formatPrice, AMENITY_LABELS, AMENITY_ICONS, SPORT_LABELS, SURFACE_LABELS } from '@/lib/utils'
import { DEMO_AREAS } from '@/lib/demo-data'
import { Button } from '@/components/ui/Button'
import { VenueGallery } from '@/components/venue/VenueGallery'
import type { Venue, Court, SportType, SurfaceType } from '@/types'

interface VenueEditFormProps {
  venue: Venue
  onSave: (venue: Venue) => void
  onCancel: () => void
}

const inputClass =
  'w-full px-4 py-2.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent'

const MIN_ADVANCE_OPTIONS = [1, 2, 3, 6, 12, 24]
const MAX_ADVANCE_OPTIONS = [3, 7, 14, 21, 30]
const CANCELLATION_OPTIONS = [2, 4, 6, 12, 24, 0]
const REFUND_OPTIONS = [100, 80, 50, 0]

function emptyCourt(venueId: string): Court {
  return {
    id: crypto.randomUUID(),
    venue_id: venueId,
    name: '',
    surface: 'turf',
    sport: 'turf',
    max_players: 12,
    dimensions: '',
    price_per_slot: 0,
    weekend_price: null,
    night_price: null,
    is_active: true,
  }
}

function Pill({ label, checked, onClick, icon: Icon }: { label: string; checked: boolean; onClick: () => void; icon?: typeof Users }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm',
        checked ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-surface-200 text-surface-800/70'
      )}
    >
      <span className={cn('w-4 h-4 rounded border flex items-center justify-center shrink-0', checked ? 'bg-brand-600 border-brand-600' : 'border-surface-300')}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </span>
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {label}
    </button>
  )
}

export function VenueEditForm({ venue, onSave, onCancel }: VenueEditFormProps) {
  const [form, setForm] = useState<Venue>(venue)

  const update = <K extends keyof Venue>(field: K, value: Venue[K]) => setForm((prev) => ({ ...prev, [field]: value }))

  const updateCourt = (id: string, field: keyof Court, value: string | number | null) => {
    update('courts', (form.courts ?? []).map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }
  const addCourt = () => update('courts', [...(form.courts ?? []), emptyCourt(form.id)])
  const removeCourt = (id: string) => update('courts', (form.courts ?? []).filter((c) => c.id !== id))

  const toggleSport = (sport: SportType) => {
    update('sports', form.sports.includes(sport) ? form.sports.filter((s) => s !== sport) : [...form.sports, sport])
  }
  const toggleAmenity = (key: string) => {
    update('amenities', form.amenities.includes(key) ? form.amenities.filter((a) => a !== key) : [...form.amenities, key])
  }

  const setArea = (slug: string) => {
    const area = DEMO_AREAS.find((a) => a.slug === slug)
    setForm((prev) => ({ ...prev, area_id: area?.id ?? null, area }))
  }

  const directionsQuery = encodeURIComponent(form.address || form.name)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg text-surface-900">Edit {venue.name}</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(form)}>Save Changes</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5">
        <h4 className="font-display font-semibold text-surface-900 mb-3">Photos</h4>
        <VenueGallery images={form.images.length ? form.images : form.cover_image ? [form.cover_image] : []} alt={form.name} />
        <p className="text-sm text-surface-800/50 mt-3">Photo re-upload isn&apos;t available yet — add new ones by resubmitting via the venue form.</p>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5 flex flex-col gap-4">
        <h4 className="font-display font-semibold text-surface-900">Basic Info</h4>

        <div>
          <label className="block text-sm font-medium text-surface-800 mb-1.5">Venue Name</label>
          <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-800 mb-1.5">Full Address</label>
          <textarea rows={2} className={cn(inputClass, 'resize-none')} value={form.address} onChange={(e) => update('address', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-800 mb-1.5">Area in Surat</label>
          <select className={inputClass} value={form.area?.slug ?? ''} onChange={(e) => setArea(e.target.value)}>
            <option value="">Select area...</option>
            {DEMO_AREAS.map((area) => (
              <option key={area.slug} value={area.slug}>{area.name}</option>
            ))}
          </select>
        </div>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${directionsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg overflow-hidden border border-surface-200 h-40"
        >
          <iframe
            src={`https://www.google.com/maps?q=${directionsQuery}&output=embed`}
            className="w-full h-full pointer-events-none"
            loading="lazy"
            title={`Map showing location of ${form.name}`}
          />
        </a>

        <div>
          <label className="block text-sm font-medium text-surface-800 mb-1.5">Contact Number</label>
          <div className="flex gap-2">
            <span className="flex items-center px-3 bg-surface-100 border border-surface-200 rounded-lg text-sm text-surface-800">+91</span>
            <input
              type="tel"
              maxLength={10}
              className={cn(inputClass, 'flex-1')}
              value={form.phone?.replace(/^\+91/, '') ?? ''}
              onChange={(e) => update('phone', `+91${e.target.value.replace(/\D/g, '')}`)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-800 mb-1.5">Description</label>
          <textarea
            rows={4}
            maxLength={500}
            className={cn(inputClass, 'resize-none')}
            value={form.description ?? ''}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5">
        <h4 className="font-display font-semibold text-surface-900 mb-3">Sports</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SPORT_LABELS).map(([key, label]) => (
            <Pill key={key} label={label} checked={form.sports.includes(key as SportType)} onClick={() => toggleSport(key as SportType)} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5">
        <h4 className="font-display font-semibold text-surface-900 mb-3">Amenities</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(AMENITY_LABELS).map(([key, label]) => (
            <Pill
              key={key}
              label={label}
              icon={AMENITY_ICONS[key]}
              checked={form.amenities.includes(key)}
              onClick={() => toggleAmenity(key)}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5">
        <h4 className="font-display font-semibold text-surface-900 mb-3">Courts & Pricing</h4>
        {(form.courts ?? []).map((court) => (
          <div key={court.id} className="bg-surface-50 rounded-lg border border-surface-200 p-4 mb-3">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-surface-900">{court.name || 'New Court'}</span>
              {(form.courts?.length ?? 0) > 1 && (
                <button type="button" onClick={() => removeCourt(court.id)} className="text-red-600 text-sm hover:underline">
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-surface-800 mb-1">Court Name</label>
                <input className={inputClass} value={court.name} onChange={(e) => updateCourt(court.id, 'name', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-800 mb-1">Surface Type</label>
                <select className={inputClass} value={court.surface} onChange={(e) => updateCourt(court.id, 'surface', e.target.value as SurfaceType)}>
                  {Object.entries(SURFACE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-800 mb-1">Sport Type</label>
                <select className={inputClass} value={court.sport} onChange={(e) => updateCourt(court.id, 'sport', e.target.value as SportType)}>
                  {Object.entries(SPORT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-800 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Max Players</label>
                <input
                  type="number"
                  min={2}
                  max={30}
                  className={inputClass}
                  value={court.max_players || ''}
                  onChange={(e) => updateCourt(court.id, 'max_players', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-800 mb-1 flex items-center gap-1"><Ruler className="w-3 h-3" /> Dimensions</label>
                <input
                  className={inputClass}
                  placeholder="e.g. 60x40 ft"
                  value={court.dimensions ?? ''}
                  onChange={(e) => updateCourt(court.id, 'dimensions', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-800 mb-1">Base Price</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={court.price_per_slot || ''}
                  onChange={(e) => updateCourt(court.id, 'price_per_slot', Number(e.target.value))}
                />
                <p className="text-xs text-surface-800/40 mt-1">{formatPrice(court.price_per_slot)}/slot</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-800 mb-1">Weekend Price</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={court.weekend_price ?? ''}
                  onChange={(e) => updateCourt(court.id, 'weekend_price', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-800 mb-1">Night Price</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={court.night_price ?? ''}
                  onChange={(e) => updateCourt(court.id, 'night_price', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addCourt}
          className="border border-dashed border-surface-200 text-surface-800/60 hover:border-brand-400 hover:text-brand-600 rounded-lg py-3 w-full flex items-center justify-center gap-2 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Another Court
        </button>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5 flex flex-col gap-4">
        <h4 className="font-display font-semibold text-surface-900">Hours & Policies</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1.5">Opening Time</label>
            <input type="time" className={inputClass} value={form.opening_time} onChange={(e) => update('opening_time', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1.5">Closing Time</label>
            <input type="time" className={inputClass} value={form.closing_time} onChange={(e) => update('closing_time', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1.5">Minimum advance booking</label>
            <select className={inputClass} value={form.min_advance_hours} onChange={(e) => update('min_advance_hours', Number(e.target.value))}>
              {MIN_ADVANCE_OPTIONS.map((h) => (
                <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1.5">Maximum advance booking</label>
            <select className={inputClass} value={form.max_advance_days} onChange={(e) => update('max_advance_days', Number(e.target.value))}>
              {MAX_ADVANCE_OPTIONS.map((d) => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1.5">Free cancellation window</label>
            <select className={inputClass} value={form.cancellation_hours} onChange={(e) => update('cancellation_hours', Number(e.target.value))}>
              {CANCELLATION_OPTIONS.map((h) => (
                <option key={h} value={h}>{h === 0 ? 'No cancellation' : `${h} hours`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1.5">Refund percentage</label>
            <select className={inputClass} value={form.cancellation_refund_pct} onChange={(e) => update('cancellation_refund_pct', Number(e.target.value))}>
              {REFUND_OPTIONS.map((p) => (
                <option key={p} value={p}>{p === 0 ? 'No refund' : `${p}%`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave(form)}>Save Changes</Button>
      </div>
    </div>
  )
}
