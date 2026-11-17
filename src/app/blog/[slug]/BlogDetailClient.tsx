'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Link2, ArrowUpRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getBlogPost, BLOG_POSTS } from '@/lib/blogs'
import { useToastStore } from '@/store/useToastStore'

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function BlogDetailClient({ slug }: { slug: string }) {
  const post = getBlogPost(slug)
  const showToast = useToastStore((s) => s.showToast)
  const [copied, setCopied] = useState(false)

  if (!post) notFound()

  const related = BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && p.category === post.category
  ).slice(0, 2)
  const relatedFallback =
    related.length > 0
      ? related
      : BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      showToast('Link copied to clipboard!', 'info')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Could not copy link', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Geist'] flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-[880px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[14px] text-[#50555c] hover:text-black mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to all guides</span>
        </Link>

        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2">
            <span className="bg-[#c9f13e] px-3 py-1 rounded-full text-[12px] font-medium text-black">
              {post.category}
            </span>
            <span className="text-[13px] text-[#6c6c6c]">{post.readTime}</span>
          </div>

          <h1 className="text-[34px] sm:text-[46px] font-normal tracking-tight text-black leading-tight text-balance">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-[14px] text-[#50555c] pb-2 border-b border-[#e3e5e8]/80">
            <span className="font-medium text-black">{post.author}</span>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
          </div>
        </div>

        <div className="aspect-[16/9] rounded-[24px] overflow-hidden mt-8 relative bg-[#dde3ea]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 880px) 100vw, 880px"
          />
        </div>

        <article className="mt-10 flex flex-col gap-5 text-[16px] sm:text-[17px] text-[#2b2f38] leading-[1.75]">
          {post.body.map((block, i) => {
            if (block.type === 'h2') {
              return (
                <h2
                  key={i}
                  className="text-[24px] sm:text-[28px] font-medium text-black tracking-tight mt-6"
                >
                  {block.text}
                </h2>
              )
            }
            if (block.type === 'li') {
              return (
                <div key={i} className="flex items-start gap-3 pl-2 -mt-1">
                  <span className="size-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                  <p className="text-[#2b2f38]">{block.text}</p>
                </div>
              )
            }
            return (
              <p key={i} className="text-[#2b2f38]">
                {block.text}
              </p>
            )
          })}
        </article>

        {/* Share Section */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-[#e3e5e8]">
          <span className="text-[14px] font-medium text-[#50555c]">Enjoyed this guide?</span>
          <button
            onClick={handleCopyLink}
            className="bg-[#f4f6f8] hover:bg-[#eef1f4] transition-colors text-black px-4 py-2 rounded-full text-[13px] font-medium inline-flex items-center gap-2"
          >
            <Link2 className="size-3.5" />
            <span>{copied ? 'Copied to clipboard!' : 'Share article'}</span>
          </button>
        </div>

        {/* Related Posts */}
        {relatedFallback.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#e3e5e8]">
            <h2 className="text-[24px] font-normal tracking-tight text-black mb-6">
              More cricket guides from Surat
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedFallback.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group bg-[#f4f6f8] rounded-[20px] p-3 flex flex-col gap-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="aspect-[16/10] rounded-[16px] overflow-hidden relative bg-[#dde3ea]">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 p-2">
                    <span className="text-[12px] font-medium text-[#50555c]">
                      {p.category} · {p.readTime}
                    </span>
                    <h3 className="text-[16px] font-medium text-black line-clamp-2 group-hover:text-black">
                      {p.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#e3e5e8]/60">
                      <span className="text-[12px] text-[#6c6c6c]">{formatDate(p.date)}</span>
                      <span className="size-6 rounded-full bg-[#c9f13e] text-black flex items-center justify-center">
                        <ArrowUpRight className="size-3" strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
