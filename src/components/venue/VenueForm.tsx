'use client'

import { useMemo, useRef, useState } from 'react'
import { Check, Upload, X, Plus } from 'lucide-react'
import { cn, formatPrice, SPORT_LABELS, SURFACE_LABELS, AMENITY_LABELS } from '@/lib/utils'
import { DEMO_AREAS } from '@/lib/demo-data'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { CourtFormData, VenueFormData, SurfaceType, SportType } from '@/types'

interface VenueFormProps {
  onSubmit: (data: VenueFormData) => void
  isInsideDashboard?: boolean
}

const STEPS = [
  { n: 1, label: 'Basic Info' },
  { n: 2, label: 'Photos' },
  { n: 3, label: 'Courts' },
  { n: 4, label: 'Settings' },
  { n: 5, label: 'Review' },
]

const MIN_ADVANCE_OPTIONS = [1, 2, 3, 6, 12, 24]
const MAX_ADVANCE_OPTIONS = [3, 7, 14, 21, 30]
const CANCELLATION_OPTIONS = [2, 4, 6, 12, 24, 0]
const REFUND_OPTIONS = [100, 80, 50, 0]

const inputClass =
  'w-full px-4 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent'
const errorClass = 'border-red-300 focus:ring-red-400'

function emptyCourt(): CourtFormData {
  return {
    id: crypto.randomUUID(),
    name: '',
    surface: 'turf',
    sport: 'turf',
    max_players: 12,
    dimensions: '',
    price_per_slot: 0,
    weekend_price: 0,
    night_price: 0,
  }
}

function initialFormData(): VenueFormData {
  return {
    name: '', address: '', area: '', phone: '', description: '',
    photos: [],
    courts: [emptyCourt()],
    sports: ['turf'],
    amenities: [],
    opening_time: '06:00', closing_time: '23:00',
    slot_duration: 60,
    min_advance_hours: 1, max_advance_days: 14,
    cancellation_hours: 4, cancellation_refund_pct: 100,
  }
}

function PriceInput({ value, onChange, placeholder, error }: { value: number; onChange: (v: number) => void; placeholder: string; error?: boolean }) {
  return (
    <div className="flex">
      <span className="bg-surface-200 border border-surface-200 rounded-l-lg px-3 flex items-center text-sm text-surface-800/60 shrink-0">₹</span>
      <input
        type="number"
        min={0}
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={placeholder}
        className={cn(inputClass, 'rounded-l-none', error && errorClass)}
      />
    </div>
  )
}

function CheckboxPill({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
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
      {label}
    </button>
  )
}

export function VenueForm({ onSubmit, isInsideDashboard = false }: VenueFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<VenueFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cardClass = cn('rounded-xl border border-surface-200 p-6', isInsideDashboard ? 'bg-surface-50' : 'bg-white')

  const updateField = <K extends keyof VenueFormData>(field: K, value: VenueFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateCourt = (id: string, field: keyof CourtFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      courts: prev.courts.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }))
  }

  const addCourt = () => updateField('courts', [...formData.courts, emptyCourt()])
  const removeCourt = (id: string) => updateField('courts', formData.courts.filter((c) => c.id !== id))

  const toggleSport = (sport: SportType) => {
    updateField('sports', formData.sports.includes(sport) ? formData.sports.filter((s) => s !== sport) : [...formData.sports, sport])
  }
  const toggleAmenity = (key: string) => {
    updateField('amenities', formData.amenities.includes(key) ? formData.amenities.filter((a) => a !== key) : [...formData.amenities, key])
  }

  const photoUrls = useMemo(() => formData.photos.map((f) => URL.createObjectURL(f)), [formData.photos])

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) updateField('photos', [...formData.photos, ...files])
    e.target.value = ''
  }
  const removePhoto = (index: number) => updateField('photos', formData.photos.filter((_, i) => i !== index))

  const validateStep = (step: number) => {
    const next: Record<string, string> = {}
    if (step === 1) {
      if (!formData.name.trim()) next.name = 'Venue name is required'
      if (!formData.address.trim()) next.address = 'Address is required'
      if (!formData.area) next.area = 'Please select an area'
    }
    if (step === 3) {
      formData.courts.forEach((c) => {
        if (!c.name.trim()) next[`court_${c.id}_name`] = 'Court name is required'
        if (!c.price_per_slot || c.price_per_slot <= 0) next[`court_${c.id}_price`] = 'Base price is required'
      })
    }
    if (step === 4) {
      if (!formData.opening_time) next.opening_time = 'Opening time is required'
      if (!formData.closing_time) next.closing_time = 'Closing time is required'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = () => {
    if (!validateStep(currentStep)) return
    setCurrentStep((s) => Math.min(5, s + 1))
  }
  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1))
  const jumpTo = (step: number) => setCurrentStep(step)

  const areaName = DEMO_AREAS.find((a) => a.slug === formData.area)?.name

  return (
    <div className="flex flex-col gap-6">
      {/* Stepper */}
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const completed = step.n < currentStep
          const active = step.n === currentStep
          return (
            <div key={step.n} className={cn('flex items-center', i < STEPS.length - 1 && 'flex-1')}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    completed || active ? 'bg-brand-600 text-white' : 'bg-surface-200 text-surface-800/50'
                  )}
                >
                  {completed ? <Check className="w-4 h-4" /> : step.n}
                </div>
                <span className={cn('text-xs mt-1.5 whitespace-nowrap', active ? 'text-brand-600 font-medium' : 'text-surface-800/50')}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('h-0.5 flex-1 mx-2', completed ? 'bg-brand-600' : 'bg-surface-200')} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className={cardClass}>
          {!isInsideDashboard && <h2 className="font-display font-semibold text-lg text-surface-900 mb-4">Venue Details</h2>}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1.5">Venue Name</label>
              <input
                className={cn(inputClass, errors.name && errorClass)}
                placeholder="e.g. Surat Cricket Arena"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1.5">Full Address</label>
              <textarea
                rows={3}
                className={cn(inputClass, 'resize-none', errors.address && errorClass)}
                placeholder="e.g. Plot 45, Near Gajera Circle, VIP Road, Vesu, Surat"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
              {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1.5">Area in Surat</label>
              <select
                className={cn(inputClass, errors.area && errorClass)}
                value={formData.area}
                onChange={(e) => updateField('area', e.target.value)}
              >
                <option value="">Select area...</option>
                {DEMO_AREAS.map((area) => (
                  <option key={area.slug} value={area.slug}>{area.name}</option>
                ))}
              </select>
              {errors.area && <p className="text-xs text-red-600 mt-1">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1.5">Contact Number</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-surface-100 border border-surface-200 rounded-lg text-sm text-surface-800">+91</span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  className={cn(inputClass, 'flex-1')}
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1.5">Description (optional)</label>
              <textarea
                rows={4}
                maxLength={500}
                className={cn(inputClass, 'resize-none')}
                placeholder="Tell players about your venue — facilities, highlights, special features..."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
              <p className="text-xs text-surface-800/40 text-right mt-1">{formData.description.length}/500</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Photos */}
      {currentStep === 2 && (
        <div className={cardClass}>
          {!isInsideDashboard && <h2 className="font-display font-semibold text-lg text-surface-900 mb-4">Venue Photos</h2>}

          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-surface-200 rounded-xl p-8 text-center hover:border-brand-400 hover:bg-brand-50/30 transition-colors cursor-pointer"
          >
            <Upload className="w-10 h-10 text-surface-800/30 mx-auto" />
            <p className="text-sm text-surface-800/60 mt-2">Click to upload or drag and drop</p>
            <p className="text-xs text-surface-800/40 mt-1">PNG, JPG up to 5MB each. First photo becomes cover image.</p>
          </div>

          {formData.photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
              {formData.photos.map((photo, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden relative group">
                  <img src={photoUrls[i]} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded">Cover</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-surface-800/50 mt-3">
            Photos will be uploaded when your venue is approved. For now, they&apos;re saved locally.
          </p>
        </div>
      )}

      {/* Step 3: Courts */}
      {currentStep === 3 && (
        <div className={cardClass}>
          {!isInsideDashboard && <h2 className="font-display font-semibold text-lg text-surface-900">Courts & Pricing</h2>}
          <p className="text-sm text-surface-800/60 mb-4">Add at least one court or box. You can add more later.</p>

          {formData.courts.map((court, index) => (
            <div key={court.id} className="bg-surface-50 rounded-lg border border-surface-200 p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-surface-900">{court.name || `Court ${index + 1}`}</span>
                {formData.courts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCourt(court.id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-surface-800 mb-1">Court Name</label>
                  <input
                    className={cn(inputClass, errors[`court_${court.id}_name`] && errorClass)}
                    placeholder="e.g. Box-1, Ground A, Turf-1"
                    value={court.name}
                    onChange={(e) => updateCourt(court.id, 'name', e.target.value)}
                  />
                  {errors[`court_${court.id}_name`] && <p className="text-xs text-red-600 mt-1">{errors[`court_${court.id}_name`]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-800 mb-1">Surface Type</label>
                  <select
                    className={inputClass}
                    value={court.surface}
                    onChange={(e) => updateCourt(court.id, 'surface', e.target.value as SurfaceType)}
                  >
                    {Object.entries(SURFACE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-800 mb-1">Sport Type</label>
                  <select
                    className={inputClass}
                    value={court.sport}
                    onChange={(e) => updateCourt(court.id, 'sport', e.target.value as SportType)}
                  >
                    {Object.entries(SPORT_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-800 mb-1">Max Players</label>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    className={inputClass}
                    placeholder="12"
                    value={court.max_players || ''}
                    onChange={(e) => updateCourt(court.id, 'max_players', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-800 mb-1">Dimensions</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. 60x40 ft"
                    value={court.dimensions}
                    onChange={(e) => updateCourt(court.id, 'dimensions', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-800 mb-1">Base Price (per slot)</label>
                  <PriceInput
                    value={court.price_per_slot}
                    onChange={(v) => updateCourt(court.id, 'price_per_slot', v)}
                    placeholder="800"
                    error={!!errors[`court_${court.id}_price`]}
                  />
                  {errors[`court_${court.id}_price`] && <p className="text-xs text-red-600 mt-1">{errors[`court_${court.id}_price`]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-800 mb-1">Weekend Price</label>
                  <PriceInput value={court.weekend_price} onChange={(v) => updateCourt(court.id, 'weekend_price', v)} placeholder="1000" />
                  <p className="text-xs text-surface-800/40 mt-1">Saturday & Sunday pricing (optional)</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-800 mb-1">Night Price (after 6 PM)</label>
                  <PriceInput value={court.night_price} onChange={(v) => updateCourt(court.id, 'night_price', v)} placeholder="1200" />
                  <p className="text-xs text-surface-800/40 mt-1">Evening/night pricing (optional)</p>
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
      )}

      {/* Step 4: Settings */}
      {currentStep === 4 && (
        <div className={cardClass}>
          {!isInsideDashboard && <h2 className="font-display font-semibold text-lg text-surface-900 mb-4">Venue Settings</h2>}

          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-surface-800 mb-2">What sports can players book?</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SPORT_LABELS).map(([key, label]) => (
                  <CheckboxPill key={key} label={label} checked={formData.sports.includes(key as SportType)} onClick={() => toggleSport(key as SportType)} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-800 mb-2">Available Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(AMENITY_LABELS).map(([key, label]) => (
                  <CheckboxPill key={key} label={label} checked={formData.amenities.includes(key)} onClick={() => toggleAmenity(key)} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1.5">Opening Time</label>
                <input
                  type="time"
                  className={cn(inputClass, errors.opening_time && errorClass)}
                  value={formData.opening_time}
                  onChange={(e) => updateField('opening_time', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1.5">Closing Time</label>
                <input
                  type="time"
                  className={cn(inputClass, errors.closing_time && errorClass)}
                  value={formData.closing_time}
                  onChange={(e) => updateField('closing_time', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-800 mb-2">Slot Duration</label>
              <div className="flex gap-2">
                {[60, 90].map((mins) => (
                  <CheckboxPill key={mins} label={`${mins} minutes`} checked={formData.slot_duration === mins} onClick={() => updateField('slot_duration', mins)} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1.5">Minimum advance booking</label>
                <select
                  className={inputClass}
                  value={formData.min_advance_hours}
                  onChange={(e) => updateField('min_advance_hours', Number(e.target.value))}
                >
                  {MIN_ADVANCE_OPTIONS.map((h) => (
                    <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1.5">Maximum advance booking</label>
                <select
                  className={inputClass}
                  value={formData.max_advance_days}
                  onChange={(e) => updateField('max_advance_days', Number(e.target.value))}
                >
                  {MAX_ADVANCE_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1.5">Free cancellation window</label>
                <select
                  className={inputClass}
                  value={formData.cancellation_hours}
                  onChange={(e) => updateField('cancellation_hours', Number(e.target.value))}
                >
                  {CANCELLATION_OPTIONS.map((h) => (
                    <option key={h} value={h}>{h === 0 ? 'No cancellation' : `${h} hours`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1.5">Refund percentage</label>
                <select
                  className={inputClass}
                  value={formData.cancellation_refund_pct}
                  onChange={(e) => updateField('cancellation_refund_pct', Number(e.target.value))}
                >
                  {REFUND_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p === 0 ? 'No refund' : `${p}%`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {currentStep === 5 && (
        <div className={cardClass}>
          <h2 className="font-display font-semibold text-lg text-surface-900">Review Your Venue</h2>
          <p className="text-sm text-surface-800/60 mb-4">Please review all details before submitting.</p>

          <div className="border-b border-surface-100 pb-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-surface-900">Basic Info</h3>
              <button onClick={() => jumpTo(1)} className="text-brand-600 text-sm hover:underline">Edit</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p><span className="text-surface-800/50">Venue Name: </span>{formData.name}</p>
              <p><span className="text-surface-800/50">Area: </span>{areaName}</p>
              <p><span className="text-surface-800/50">Address: </span>{formData.address}</p>
              <p><span className="text-surface-800/50">Phone: </span>{formData.phone ? `+91 ${formData.phone}` : <span className="text-surface-800/40">Not provided</span>}</p>
              <p className="sm:col-span-2"><span className="text-surface-800/50">Description: </span>{formData.description || <span className="text-surface-800/40">Not provided</span>}</p>
            </div>
          </div>

          <div className="border-b border-surface-100 pb-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-surface-900">Photos ({formData.photos.length} photos)</h3>
              <button onClick={() => jumpTo(2)} className="text-brand-600 text-sm hover:underline">Edit</button>
            </div>
            {formData.photos.length > 0 ? (
              <div className="flex gap-2">
                {formData.photos.map((_, i) => (
                  <div key={i} className="w-[60px] h-[60px] rounded-lg overflow-hidden shrink-0">
                    <img src={photoUrls[i]} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-800/40">No photos uploaded</p>
            )}
          </div>

          <div className="border-b border-surface-100 pb-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-surface-900">Courts ({formData.courts.length} courts)</h3>
              <button onClick={() => jumpTo(3)} className="text-brand-600 text-sm hover:underline">Edit</button>
            </div>
            {formData.courts.map((court, i) => (
              <div key={court.id} className="bg-surface-50 rounded-lg p-3 mb-2">
                <p className="font-medium text-surface-900">
                  {court.name || `Court ${i + 1}`}
                  <span className="font-normal text-surface-800/50"> · {SURFACE_LABELS[court.surface]} · {SPORT_LABELS[court.sport]} · {court.max_players} players</span>
                </p>
                <p className="text-sm text-surface-800/70 mt-0.5">
                  {formatPrice(court.price_per_slot)}/slot
                  {court.weekend_price > 0 && ` · ${formatPrice(court.weekend_price)} weekend`}
                  {court.night_price > 0 && ` · ${formatPrice(court.night_price)} night`}
                </p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-surface-900">Settings</h3>
              <button onClick={() => jumpTo(4)} className="text-brand-600 text-sm hover:underline">Edit</button>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex flex-wrap gap-1.5">
                {formData.sports.map((s) => (
                  <span key={s} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800">{SPORT_LABELS[s]}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.amenities.length > 0 ? formData.amenities.map((a) => (
                  <span key={a} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-surface-100 text-surface-800">{AMENITY_LABELS[a]}</span>
                )) : <span className="text-surface-800/40 text-xs">No amenities selected</span>}
              </div>
              <p className="text-surface-800/70">{formData.opening_time} - {formData.closing_time}</p>
              <p className="text-surface-800/70">Slot duration: {formData.slot_duration} minutes</p>
              <p className="text-surface-800/70">Advance booking: {formData.min_advance_hours} hour{formData.min_advance_hours > 1 ? 's' : ''} to {formData.max_advance_days} days</p>
              <p className="text-surface-800/70">
                Cancellation: {formData.cancellation_hours === 0 ? 'No cancellation' : `Free up to ${formData.cancellation_hours} hours before`} · {formData.cancellation_refund_pct === 0 ? 'No refund' : `${formData.cancellation_refund_pct}% refund`}
              </p>
            </div>
          </div>

          <Button variant="primary" size="lg" className="w-full mt-6" onClick={() => onSubmit(formData)}>
            {isInsideDashboard ? 'Add Venue' : 'Submit for Review'}
          </Button>
          <p className="text-sm text-surface-800/50 text-center mt-3">
            {isInsideDashboard
              ? 'Your venue will be added to your account and is ready to manage right away.'
              : "Your venue will be reviewed by our team. You'll receive a notification once it's approved."}
          </p>
        </div>
      )}

      {/* Bottom navigation */}
      {currentStep < 5 && (
        <div className="flex items-center justify-between">
          {currentStep > 1 ? (
            <Button variant="secondary" onClick={goBack}>Back</Button>
          ) : <span />}
          <span className="text-sm text-surface-800/50">Step {currentStep} of 5</span>
          <Button variant="primary" onClick={goNext}>Next</Button>
        </div>
      )}
    </div>
  )
}
