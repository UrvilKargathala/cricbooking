'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Check, Clock3, MapPin, ShieldCheck, Star, Zap } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/home/Hero'
import { fetchAreas, fetchReviewStats, fetchVenues, fetchTodaySlotCounts, type ReviewStats, type VenueSlotInfo } from '@/lib/supabase-queries'
import { formatTime } from '@/lib/utils'
import type { Area, Venue } from '@/types'

function lowestPrice(venue: Venue) {
  const prices = (venue.courts ?? []).map((court) => Number(court.price_per_slot)).filter((price) => Number.isFinite(price) && price > 0)
  return prices.length ? Math.min(...prices) : null
}



const SURAT_AREAS_FEATURED = [
  { name: 'Vesu', slug: 'vesu', image: '/figma/venue-surat-arena.png' },
  { name: 'Varachha', slug: 'varachha', image: '/figma/venue-green-pitch.png' },
  { name: 'Adajan', slug: 'adajan', image: '/figma/venue-surat-arena.png' },
  { name: 'Katargam', slug: 'katargam', image: '/figma/venue-royal-box.png' },
  { name: 'Pal', slug: 'pal', image: '/figma/venue-sunset-turf.png' },
]

export default function Home() {
  const router = useRouter()
  const [areas, setAreas] = useState<Area[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [venuesLoading, setVenuesLoading] = useState(true)
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [slotCounts, setSlotCounts] = useState<Record<string, VenueSlotInfo>>({})
  const [reviewStats, setReviewStats] = useState<Record<string, ReviewStats>>({})
  const ratingLabel = (venue: Venue) => (reviewStats[venue.id]?.count ? reviewStats[venue.id].average.toFixed(1) : null)

  useEffect(() => {
    fetchAreas().then((res) => {
      if (res?.length) setAreas(res)
    }).catch(() => setAreas([]))
    fetchVenues()
      .then(setVenues)
      .catch(() => setVenues([]))
      .finally(() => setVenuesLoading(false))
    fetchTodaySlotCounts().then(setSlotCounts).catch(() => setSlotCounts({}))
    fetchReviewStats().then(setReviewStats).catch(() => setReviewStats({}))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (selectedArea) params.set('area', selectedArea)
    if (selectedTime) params.set('time', selectedTime)
    router.push(`/venues${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const tonightVenues = venues.filter((venue) => slotCounts[venue.id]?.slots.length).slice(0, 4)
  const openSlotsToday = Object.values(slotCounts).filter((info) => info.isToday).reduce((sum, info) => sum + info.available, 0)
  const featuredVenue = venues[0]
  const otherVenues = venues.slice(1, 4)
  const featuredPrice = featuredVenue ? lowestPrice(featuredVenue) : null
  const featuredRating = featuredVenue ? ratingLabel(featuredVenue) : null
  const venueCountForArea = (slug: string) => venues.filter((venue) => venue.area?.slug === slug).length
  const areaCountLabel = (slug: string) => {
    const count = venueCountForArea(slug)
    return count ? `${count} ${count === 1 ? 'turf' : 'turfs'}` : 'Coming soon'
  }

  return (
    <div className="bg-[#020B12] min-h-screen text-white font-['Geist']">
      <Header />

      {/* ========================================================
          1. HERO SECTION (FULL-SCREEN 100svh VIEWPORT + INTRO ANIMATION)
          ======================================================== */}
      <Hero
        areas={areas}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        handleSearch={handleSearch}
        venueCount={venuesLoading ? null : venues.length}
        openSlotsToday={openSlotsToday || null}
      />

      <main className="home-canvas flex flex-col bg-[#fbfcfa] text-black">
        {/* ========================================================
            2. MARQUEE BANNER
            ======================================================== */}
        <section className="px-4 sm:px-6 lg:px-10 w-full max-w-[1440px] mx-auto py-2">
          <div className="marquee-mask bg-[#F59E0B] rounded-[16px] py-4 sm:py-5 overflow-hidden select-none" aria-hidden="true">
            <div className="flex gap-8 items-center whitespace-nowrap animate-marquee">
              {[1, 2].map((set) => (
                <div key={set} className="flex shrink-0 gap-8 pr-8 items-center text-[22px] sm:text-[26px] font-medium tracking-tight text-black">
                  <span>Box cricket</span>
                  <span className="opacity-60 text-lg">✦</span>
                  <span>Floodlit turfs</span>
                  <span className="opacity-60 text-lg">✦</span>
                  <span>Instant booking</span>
                  <span className="opacity-60 text-lg">✦</span>
                  <span>No booking fee</span>
                  <span className="opacity-60 text-lg">✦</span>
                  <span>Surat venues</span>
                  <span className="opacity-60 text-lg">✦</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tonight's availability leads with the job players came to do. */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 pb-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="section-kicker mb-3">Ready to book</p>
              <h2 className="text-[32px] sm:text-[46px] font-semibold tracking-[-0.04em] text-black leading-none">
                Available tonight
                <span className="text-[#64707a] font-normal"> in Surat</span>
              </h2>
              <p className="text-[15px] text-[#56616a] mt-3">Choose a real open slot and get confirmed in under a minute.</p>
            </div>
            <Link href="/venues?time=tonight" className="group w-fit text-[14px] font-semibold text-black inline-flex items-center gap-2 hover:text-[#92400E] transition-colors">
              See all available slots <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {venuesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-busy="true" aria-label="Loading available turfs">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-[20px] border border-[#e0e5e8] bg-white">
                  <div className="aspect-[16/9] animate-pulse bg-[#e6ebee]" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-[#e6ebee]" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-[#eef1f3]" />
                    <div className="h-9 w-full animate-pulse rounded-full bg-[#eef1f3]" />
                  </div>
                </div>
              ))}
            </div>
          ) : tonightVenues.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-[#d5dde1] bg-white px-6 py-10 text-center">
              <p className="text-[17px] font-semibold text-black">No open slots right now</p>
              <p className="mt-1 text-[14px] text-[#56616a]">Turfs add new slots every day. Browse venues to pick a date that works for your team.</p>
              <Link href="/venues" className="mt-5 inline-flex rounded-full bg-[#020b12] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#F59E0B] hover:text-black transition-colors">Browse all turfs</Link>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tonightVenues.map((venue) => {
              const info = slotCounts[venue.id]
              const time = formatTime(info.slots[0].start)
              const dayLabel = info.isToday ? 'today' : 'tomorrow onwards'
              const price = lowestPrice(venue)
              const rating = ratingLabel(venue)
              const openSlots = info.available
              return (
                <Link key={venue.id} href={`/venues/${venue.slug}?date=${info.date}&time=${info.slots[0].start.slice(0, 5)}#book-a-slot`} className="group relative overflow-hidden rounded-[20px] bg-white border border-[#e0e5e8] hover:border-[#042644]/35 hover:shadow-[0_16px_32px_rgb(4_38_68_/_0.12)] transition-all">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#dce4e7]">
                    <Image src={venue.cover_image || '/figma/venue-surat-arena.png'} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <span className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-[#F59E0B] px-2.5 py-1 text-[12px] font-bold text-black"><Clock3 className="size-3" />{info.isToday ? time : `${time}, ${info.date.slice(8, 10)}/${info.date.slice(5, 7)}`}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[17px] text-black tracking-tight line-clamp-1">{venue.name}</h3>
                        <p className="text-[13px] text-[#63707a] mt-1">{venue.area?.name || 'Surat'}{venue.courts?.length ? ` · ${venue.courts.length} ${venue.courts.length === 1 ? 'court' : 'courts'}` : ''}</p>
                      </div>
                      {price ? <span className="text-[13px] text-[#56616a] whitespace-nowrap">from <span className="text-[15px] font-bold text-black">₹{price}</span></span> : null}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-y border-[#edf0f1] py-2 text-[12px] text-[#50616c]">
                      <span className="inline-flex items-center gap-1"><MapPin className="size-3 text-[#D97706]" />{venue.area?.name || 'Surat'}</span>
                      {rating ? <span className="inline-flex items-center gap-1 font-semibold text-black"><Star className="size-3 fill-[#F59E0B] text-[#D97706]" />{rating}</span> : <span className="text-[#7a868f]">New on CricBooking</span>}
                    </div>
                    <p className={`mt-3 text-[12px] font-semibold ${openSlots <= 1 ? 'text-[#d63b40]' : 'text-[#92400E]'}`}>{openSlots <= 1 ? `Last open slot ${dayLabel}` : `${openSlots} slots open ${dayLabel}`}</p>
                    <div className="mt-4 w-full rounded-full bg-[#020b12] group-hover:bg-[#F59E0B] py-2.5 text-center text-[13px] font-bold text-white group-hover:text-black transition-colors">Book {time}</div>
                  </div>
                </Link>
              )
            })}
            {tonightVenues.length < 4 && (
              <Link
                href="/venues"
                className={`group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[20px] bg-[#042644] p-6 sm:p-8 text-white transition-colors hover:bg-[#06345c] ${
                  tonightVenues.length === 1 ? 'lg:col-span-3' : tonightVenues.length === 2 ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[#F59E0B]/10 blur-3xl" />
                <div className="relative">
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#FBBF24]">More turfs in Surat</p>
                  <h3 className="mt-3 max-w-[420px] text-[24px] sm:text-[30px] font-semibold leading-tight tracking-[-0.03em]">
                    {venues.length} turfs to choose from. Pick a date that suits your team.
                  </h3>
                  <p className="mt-3 max-w-[460px] text-[14px] leading-relaxed text-white/70">Owners add new slots every day, so tomorrow and the weekend often have more open hours.</p>
                </div>
                <span className="relative mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#F59E0B] px-5 py-2.5 text-[14px] font-bold text-[#042644] transition-transform group-hover:translate-x-0.5">
                  Browse all turfs <ArrowUpRight className="size-4" />
                </span>
              </Link>
            )}
          </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#56636c]">Quick filters</span>
            {[
              ['Tonight', '/venues?time=tonight'], ['Under ₹700', '/venues?max_price=700'], ['Floodlights', '/venues?amenity=lighting'], ['Open late', '/venues?timing=late'],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="rounded-full border border-[#dce3e6] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#263640] hover:border-[#020b12] hover:bg-[#FEF7E6] transition-colors">{label}</Link>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-[20px] border border-[#dfe6df] bg-[#FEF7E6] text-[#422006]">
            <div className="col-span-2 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-[#F6E3BD] p-4 sm:p-5">
              <p className="text-[20px] font-bold tracking-tight">{venuesLoading ? '–' : venues.length}</p>
              <p className="mt-0.5 text-[12px] text-[#7C5A35]">Turfs bookable online</p>
            </div>
            <div className="flex items-center gap-2 border-r border-[#F6E3BD] p-4 sm:p-5 text-[12px] font-semibold"><Zap className="size-4 text-[#D97706]" />Instant confirmation</div>
            <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-r border-[#F6E3BD] p-4 sm:p-5 text-[12px] font-semibold"><ShieldCheck className="size-4 text-[#D97706]" />Secure UPI payment</div>
            <div className="flex items-center gap-2 border-t lg:border-t-0 border-[#F6E3BD] p-4 sm:p-5 text-[12px] font-semibold"><Check className="size-4 text-[#D97706]" />No booking fee</div>
          </div>
        </section>

        {/* ========================================================
            4. BROWSE BY TYPE (CATEGORIES)
            ======================================================== */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 w-full">
          <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#061923] p-6 sm:p-10">
            <div className="pointer-events-none absolute -right-24 -top-20 size-80 rounded-full bg-[#F59E0B]/10 blur-3xl" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7">
            <div>
              <p className="section-kicker mb-3 text-white/70">Find your game</p>
              <h2 className="text-[32px] sm:text-[42px] font-semibold tracking-[-0.04em] text-white">Built for every kind of match</h2>
            </div>
            <p className="max-w-[280px] text-[14px] leading-relaxed text-white/70">Choose what matters most, then see only the places that fit.</p>
          </div>
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Box cricket */}
            <Link
              href="/venues?type=box_cricket"
              className="category-card sport-category min-h-[205px] bg-white/5 border border-white/12 hover:border-[#F59E0B]/60 hover:bg-white/10 p-5 rounded-[20px] flex flex-col justify-between gap-4 group"
            >
              <div className="category-icon size-12 rounded-full bg-[#042644] border border-[#F59E0B]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image src="/figma/box-cricket-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <div><span className="text-[11px] font-bold tracking-[0.14em] text-[#FBBF24]">01 / PLAY FAST</span><span className="mt-2 text-[16px] font-semibold text-white block">Box cricket</span><span className="text-[12px] text-white/70">Fast, social games</span></div>
            </Link>

            {/* Open turfs */}
            <Link
              href="/venues?type=open_turf"
              className="category-card sport-category min-h-[205px] bg-white/5 border border-white/12 hover:border-[#F59E0B]/60 hover:bg-white/10 p-5 rounded-[20px] flex flex-col justify-between gap-4 group"
            >
              <div className="category-icon size-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[#FBBF24] group-hover:scale-105 transition-transform">
                <Image src="/figma/open-turf-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <div><span className="text-[11px] font-bold tracking-[0.14em] text-[#FBBF24]">02 / GO BIG</span><span className="mt-2 text-[16px] font-semibold text-white block">Open turfs</span><span className="text-[12px] text-white/70">Room for the squad</span></div>
            </Link>

            {/* Floodlit */}
            <Link
              href="/venues?amenity=lighting"
              className="category-card sport-category min-h-[205px] bg-[#F59E0B] hover:bg-[#FBBF24] p-5 rounded-[20px] flex flex-col justify-between gap-4 group"
            >
              <div className="category-icon size-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Image src="/figma/floodlit-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <div><span className="text-[11px] font-bold tracking-[0.14em] text-black/55">03 / MATCH NIGHT</span><span className="mt-2 text-[16px] font-semibold text-black block">Floodlit</span><span className="text-[12px] text-black/65">Made for after dark</span></div>
            </Link>

            {/* Open late */}
            <Link
              href="/venues?timing=late"
              className="category-card sport-category min-h-[205px] bg-[#0b2f42] border border-[#1b4b60] hover:border-[#F59E0B]/60 p-5 rounded-[20px] flex flex-col justify-between gap-4 group"
            >
              <div className="category-icon size-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[#FBBF24] group-hover:scale-105 transition-transform">
                <Image src="/figma/open-late-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <div><span className="text-[11px] font-bold tracking-[0.14em] text-[#FBBF24]">04 / STAY OUT</span><span className="mt-2 text-[16px] font-semibold text-white block">Open late</span><span className="text-[12px] text-white/70">Play past 10 PM</span></div>
            </Link>

          </div>
          </div>
        </section>

        {/* ========================================================
            4B. EXPLORE BY AREA IN SURAT
            ======================================================== */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-10 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
            <div><p className="section-kicker mb-3">Pick a side of the city</p><h3 className="text-[30px] sm:text-[40px] font-semibold tracking-[-0.04em] text-black">Your next turf is nearby.</h3><p className="mt-2 text-[14px] text-[#64707a]">Start with an area, then choose the time that works.</p></div>
            <Link
              href="/venues"
              className="group w-fit rounded-full border border-[#dce4e7] bg-white px-4 py-2 text-[14px] font-semibold text-[#263640] hover:border-[#042644] inline-flex items-center gap-2 transition-colors"
            >
              <span>See every area</span>
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="rounded-[28px] border border-[#e0e6e8] bg-white p-3 sm:p-4 shadow-[0_14px_34px_rgb(4_38_68_/_0.06)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
              <Link href={`/venues?area=${SURAT_AREAS_FEATURED[0].slug}`} className="group relative lg:col-span-5 min-h-[280px] sm:min-h-[340px] overflow-hidden rounded-[22px] bg-[#042644] p-5 sm:p-6 flex flex-col justify-between">
                <Image
                  src={SURAT_AREAS_FEATURED[0].image}
                  alt={SURAT_AREAS_FEATURED[0].name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#021019]/95 via-[#021019]/20 to-transparent" />
                <div className="relative z-10 flex items-start justify-between gap-3"><span className="rounded-full bg-[#F59E0B] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#042644]">Start here</span><span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[12px] font-semibold text-white">{areaCountLabel(SURAT_AREAS_FEATURED[0].slug)}</span></div>
                <div className="relative z-10"><p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#FBBF24]">Surat</p><div className="mt-2 flex items-end justify-between"><div><h4 className="text-[30px] font-semibold tracking-[-0.04em] text-white">{SURAT_AREAS_FEATURED[0].name}</h4><p className="mt-1 text-[13px] text-white/70">Popular evening slots and floodlit courts</p></div><span className="grid size-10 place-items-center rounded-full bg-white text-[#042644] transition-transform group-hover:translate-x-1"><ArrowUpRight className="size-4" /></span></div></div>
              </Link>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {SURAT_AREAS_FEATURED.slice(1).map((item, index) => (
                  <Link key={item.slug} href={`/venues?area=${item.slug}`} className="group relative min-h-[160px] overflow-hidden rounded-[20px] bg-[#dce4e7] p-4 flex flex-col justify-between">
                    <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 30vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/20 group-hover:from-black/90 transition-colors" />
                    <div className="relative z-10 flex justify-between items-start"><span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">{areaCountLabel(item.slug)}</span><span className="grid size-7 place-items-center rounded-full bg-[#F59E0B] text-[#042644] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"><ArrowUpRight className="size-3.5" /></span></div>
                    <div className="relative z-10"><p className="text-[11px] font-bold tracking-[0.13em] text-[#FBBF24]">0{index + 2} / SURAT</p><h4 className="mt-1 text-[20px] font-semibold tracking-tight text-white">{item.name}</h4></div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#FEF7E6] px-4 py-3 text-[13px] text-[#78502A]"><span className="inline-flex items-center gap-2"><MapPin className="size-4 text-[#D97706]" />Five neighbourhoods. One easy booking flow.</span><Link href="/venues" className="font-semibold text-[#92400E] hover:underline">Browse all Surat turfs →</Link></div>
          </div>
        </section>

        {/* ========================================================
            5. POPULAR IN SURAT
            ======================================================== */}
        {featuredVenue ? (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 my-6 w-full">
          <div className="rounded-[28px] sm:rounded-[36px] bg-[#071720] px-5 py-8 sm:px-10 sm:py-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="section-kicker mb-3 text-white/70">Book with confidence</p>
              <h2 className="text-[34px] sm:text-[48px] font-semibold tracking-[-0.04em] text-white">Popular in <span className="bg-[#F59E0B] px-3.5 py-0.5 rounded-[12px] text-[#042644]">Surat</span></h2>
              <p className="mt-3 text-[14px] text-white/70">The courts players return to, week after week.</p>
            </div>

            <Link
              href="/venues"
              className="group border border-white/20 hover:border-[#F59E0B] bg-white/10 pl-5 pr-2 py-2 rounded-full text-[15px] font-medium text-white inline-flex items-center gap-2.5 transition-colors"
            >
              <span>See all turfs</span>
              <span className="size-8 rounded-full bg-black text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <ArrowUpRight className="size-4" strokeWidth={2} />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-white rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between gap-4 group shadow-[0_18px_45px_rgb(0_0_0_/_0.20)]">
              <Link href={`/venues/${featuredVenue.slug}`} className="relative aspect-[16/11] sm:aspect-[16/9] rounded-[19px] overflow-hidden bg-[#dde3ea] block">
                <Image
                  src={featuredVenue.cover_image || '/figma/venue-green-pitch.png'}
                  alt={featuredVenue.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute top-4 left-4 bg-[#F59E0B] px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-[0.08em] text-[#042644] shadow-sm">
                  {featuredRating ? `Player favourite · ★ ${featuredRating}` : 'Featured turf'}
                </div>
                <div className="absolute bottom-4 left-4 rounded-full bg-[#042644]/90 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur-md">
                  {featuredVenue.area?.name || 'Surat'}
                </div>
                {featuredPrice ? (
                  <div className="absolute bottom-4 right-4 bg-white px-4 py-1.5 rounded-full text-[14px] font-bold text-[#042644] shadow-md">
                    From ₹{featuredPrice}/hr
                  </div>
                ) : null}
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 px-1">
                <div>
                  <Link href={`/venues/${featuredVenue.slug}`}>
                    <h3 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.035em] text-black group-hover:text-[#92400E]">
                      {featuredVenue.name}
                    </h3>
                  </Link>
                  <p className="text-[14px] text-[#50555c] mt-0.5">
                    {formatTime(featuredVenue.opening_time)} – {formatTime(featuredVenue.closing_time)} · instant confirmation · ₹0 booking fee
                  </p>
                </div>

                <Link
                  href={`/venues/${featuredVenue.slug}`}
                  className="bg-[#F59E0B] hover:bg-[#D97706] transition-colors text-black pl-5 pr-2 py-2 rounded-full text-[15px] font-medium inline-flex items-center gap-2.5 w-fit"
                >
                  <span>Book this turf</span>
                  <span className="size-8 rounded-full bg-black text-[#FBBF24] flex items-center justify-center">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-3">
              {otherVenues.map((venue) => {
                const price = lowestPrice(venue)
                const rating = ratingLabel(venue)
                const courtCount = Math.max(venue.courts?.length ?? 0, 1)
                const openSlots = slotCounts[venue.id]?.isToday ? slotCounts[venue.id].available : 0
                const image = venue.cover_image || '/figma/venue-surat-arena.png'
                return (
                  <Link key={venue.id} href={`/venues/${venue.slug}`} className="group grid grid-cols-[78px_1fr_auto] sm:grid-cols-[100px_1fr_auto] items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 p-2.5 sm:p-3 hover:border-[#F59E0B]/60 hover:bg-white/10 transition-all">
                    <div className="relative h-[76px] sm:h-[86px] overflow-hidden rounded-[13px] bg-[#123449]"><Image src={image} alt={venue.name} fill sizes="100px" className="object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                    <div className="min-w-0"><div className="flex items-center justify-between gap-2"><h3 className="truncate text-[15px] sm:text-[17px] font-semibold text-white">{venue.name}</h3>{rating ? <span className="hidden sm:inline rounded-full bg-[#F59E0B]/15 px-2 py-0.5 text-[11px] font-bold text-[#FBBF24]">★ {rating}</span> : null}</div><p className="mt-1 truncate text-[12px] text-white/70">{venue.area?.name || 'Surat'} · {courtCount} court{courtCount > 1 ? 's' : ''}{openSlots ? ` · ${openSlots} open today` : ''}</p>{price ? <p className="mt-2 text-[14px] font-bold text-[#FBBF24]">From ₹{price}/hr</p> : null}</div>
                    <span className="grid size-8 sm:size-9 place-items-center rounded-full border border-white/15 text-[#FBBF24] transition-all group-hover:bg-[#F59E0B] group-hover:text-[#042644]"><ArrowUpRight className="size-3.5" /></span>
                  </Link>
                )
              })}

              <Link
                href="/venues"
                className="bg-[#F59E0B] hover:bg-[#FBBF24] rounded-[18px] p-4 flex items-center justify-between group transition-all min-h-[82px]"
              >
                <div className="size-10 rounded-full bg-[#042644] flex items-center justify-center text-[#FBBF24] group-hover:scale-105 transition-transform order-2">
                  <ArrowUpRight className="size-5" />
                </div>
                <div>
                  <h4 className="text-[17px] font-semibold text-[#042644] tracking-tight">
                    See every turf
                  </h4>
                  <p className="text-[12px] text-[#042644]/70 mt-1">
                    Filter by area, price and timing
                  </p>
                </div>
              </Link>
            </div>
          </div>
          </div>
        </section>
        ) : null}

        {/* ========================================================
            7. THREE TAPS TO THE PITCH (HOW IT WORKS)
            ======================================================== */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20 w-full">
          <div className="max-w-[620px] mb-9"><p className="section-kicker mb-3">Simple from search to wicket</p><h2 className="text-[34px] sm:text-[48px] font-semibold tracking-[-0.04em] text-black">Three taps. One confirmed game.</h2><p className="mt-3 text-[15px] text-[#64707a]">No calls, no waiting, no surprise fees. Just choose your court and show up.</p></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="process-card bg-white border border-[#e3e5e8] rounded-[20px] p-7 flex flex-col justify-between min-h-[250px]">
              <span className="text-[56px] sm:text-[64px] font-medium tracking-tighter text-[#042644] leading-none">
                01
              </span>
              <div>
                <h3 className="text-[20px] font-normal text-black tracking-tight">Pick a turf</h3>
                <span className="inline-block mt-2 rounded-full bg-[#FEF7E6] px-2.5 py-1 text-[11px] font-bold text-[#92400E]">Area · time · price</span>
                <p className="text-[14px] text-[#50555c] mt-1.5 leading-relaxed">
                  Filter by area, price and time. Every slot shown is really free.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="process-card bg-[#eef1f4] rounded-[20px] p-7 flex flex-col justify-between min-h-[250px]">
              <span className="text-[56px] sm:text-[64px] font-medium tracking-tighter text-[#042644] leading-none">
                02
              </span>
              <div>
                <h3 className="text-[20px] font-normal text-black tracking-tight">Choose your hour</h3>
                <span className="inline-block mt-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#40515d]">Real-time availability</span>
                <p className="text-[14px] text-[#50555c] mt-1.5 leading-relaxed">
                  Tap a slot, add players and see the total upfront. No surprises.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="process-card bg-[#042644] rounded-[20px] p-7 flex flex-col justify-between min-h-[250px]">
              <span className="text-[56px] sm:text-[64px] font-medium tracking-tighter text-[#FBBF24] leading-none">
                03
              </span>
              <div>
                <h3 className="text-[20px] font-normal text-white tracking-tight">Pay and play</h3>
                <span className="inline-block mt-2 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-[#FBBF24]">Ticket sent instantly</span>
                <p className="text-[14px] text-white/65 mt-1.5 leading-relaxed">
                  Pay with UPI or card. Your booking ticket arrives instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            10. FOR TURF OWNERS SECTION
            ======================================================== */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 pb-12 w-full">
          <div className="owner-panel bg-[#042644] rounded-[28px] sm:rounded-[36px] overflow-hidden p-8 sm:p-12 md:p-14 text-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-[#F59E0B] text-black px-3.5 py-1.5 rounded-full text-[13px] font-medium w-fit">
                For turf owners
              </div>

              <h2 className="text-[32px] sm:text-[46px] md:text-[52px] font-normal tracking-[-0.035em] leading-[1.1] text-white">
                Fill your empty daytime and weekday slots.
              </h2>

              <p className="text-[16px] sm:text-[18px] text-white/75 max-w-[560px] leading-relaxed">
                List free, take online payments and manage every slot and booking from one dashboard.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/list-venue"
                  className="group bg-[#F59E0B] hover:bg-[#D97706] transition-colors text-black pl-6 pr-2 py-2.5 rounded-full text-[15px] font-medium inline-flex items-center gap-3"
                >
                  <span>List your venue free</span>
                  <span className="size-8 rounded-full bg-black text-[#FBBF24] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </Link>

                <Link
                  href="/contact"
                  className="border border-white/30 hover:border-white px-6 py-3 rounded-full text-[15px] font-medium text-white transition-colors"
                >
                  Contact sales
                </Link>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="lg:col-span-4 relative aspect-[4/3] rounded-[24px] overflow-hidden bg-[#dde3ea]">
              <Image
                src="/figma/owner-banner.png"
                alt="Turf Owner Dashboard"
                fill
                className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
