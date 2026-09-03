'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { BLOG_POSTS } from '@/lib/blogs'

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS

  return (
    <div className="min-h-screen bg-surface-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-surface-900">CricBooking Blog</h1>
        <p className="text-surface-800/50 mt-2 text-lg">Tips, guides, and stories from the Surat cricket scene</p>

        {featured && (
          <ScrollReveal>
            <Link href={`/blog/${featured.slug}`} className="group block glass-card rounded-2xl overflow-hidden mt-10 hover:border-brand-300 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="aspect-[16/9] md:aspect-auto md:h-full overflow-hidden">
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-center">
                  <span className="w-fit text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">{featured.category}</span>
                  <h2 className="font-display font-bold text-2xl text-surface-900 mt-4 group-hover:text-brand-600 transition-colors">{featured.title}</h2>
                  <p className="text-surface-800/70 mt-3 leading-relaxed">{featured.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-surface-800/50 mt-5">
                    <span>{formatDate(featured.date)}</span>
                    <span>·</span>
                    <span>{featured.readTime}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 mt-4">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {rest.map((post, index) => (
            <ScrollReveal key={post.slug} delay={(index % 3) * 100}>
              <Link href={`/blog/${post.slug}`} className="group block glass-card rounded-xl overflow-hidden hover:border-brand-300 transition-colors h-full">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">{post.category}</span>
                  <h3 className="font-display font-semibold text-surface-900 mt-3 group-hover:text-brand-600 transition-colors">{post.title}</h3>
                  <p className="text-sm text-surface-800/50 mt-1.5 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-surface-800/40 mt-4">
                    <span>{formatDate(post.date)}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
