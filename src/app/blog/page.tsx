'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BLOG_POSTS } from '@/lib/blogs'

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS

  return (
    <div className="bg-[#f7f9f7] min-h-screen text-black font-['Geist'] flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-14">
        {/* Title Header */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#061923] px-6 py-10 sm:px-12 sm:py-14 mb-10 sm:mb-14">
          <div className="absolute -right-24 -top-24 size-80 rounded-full bg-[#F59E0B]/10 blur-3xl" />
          <div className="relative max-w-[700px]"><div className="bg-[#F59E0B] text-[#042644] px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-[0.1em] w-fit mb-5">The CricBooking Blog</div>
          <h1 className="text-[38px] sm:text-[52px] font-semibold tracking-[-0.05em] leading-[1.05] text-white">Stories from the <span className="text-[#FBBF24]">Surat cricket scene.</span></h1>
          <p className="text-[16px] sm:text-[18px] text-white/70 mt-5 leading-relaxed">Guides on booking the best turfs, box cricket tournaments, and gear for the local pitch.</p></div>
        </div>

        {/* Featured Post Card */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group bg-white border border-[#e0e6e8] rounded-[28px] sm:rounded-[36px] p-4 sm:p-6 mb-12 sm:mb-16 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center hover:shadow-[0_20px_42px_rgb(4_38_68_/_0.12)] transition-all"
          >
            <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] rounded-[20px] sm:rounded-[28px] overflow-hidden bg-[#dde3ea]">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute top-4 left-4 bg-[#F59E0B] px-3.5 py-1.5 rounded-full text-[13px] font-medium text-black">
                Featured
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between gap-6 px-2 sm:px-4">
              <div className="flex flex-col gap-3">
                <span className="bg-[#FEF7E6] px-3 py-1 rounded-full text-[12px] font-bold text-[#92400E] w-fit">
                  {featured.category}
                </span>

                <h2 className="text-[26px] sm:text-[34px] font-semibold tracking-[-0.035em] text-black leading-tight group-hover:text-[#92400E]">
                  {featured.title}
                </h2>

                <p className="text-[15px] text-[#50555c] leading-relaxed line-clamp-3">
                  {featured.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#e3e5e8]">
                <span className="text-[13px] text-[#767b82]">
                  {formatDate(featured.date)} · {featured.readTime}
                </span>

                <span className="bg-black text-white pl-4 pr-1.5 py-1.5 rounded-full text-[13px] font-medium inline-flex items-center gap-2">
                  <span>Read post</span>
                  <span className="size-6 rounded-full bg-[#F59E0B] text-black flex items-center justify-center">
                    <ArrowUpRight className="size-3" strokeWidth={2.5} />
                  </span>
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Other Blog Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white border border-[#e3e5e8] rounded-[24px] p-4 flex flex-col justify-between gap-4 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgb(4_38_68_/_0.10)] transition-all duration-300"
            >
              <div className="relative aspect-[16/10] rounded-[16px] overflow-hidden bg-[#dde3ea]">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute top-3 left-3 bg-[#F59E0B] px-3 py-1 rounded-full text-[11px] font-semibold text-black shadow-sm">
                  {post.category}
                </div>
              </div>

              <div className="flex flex-col gap-2 px-1">
                <h3 className="text-[18px] sm:text-[20px] font-medium tracking-tight text-black line-clamp-2 group-hover:text-neutral-700">
                  {post.title}
                </h3>
                <p className="text-[13px] text-[#50555c] line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#e3e5e8] px-1 mt-auto">
                <span className="text-[12px] text-[#767b82]">
                  {formatDate(post.date)} · {post.readTime}
                </span>
                <span className="size-7 rounded-full bg-black text-[#FBBF24] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
