'use client'

import { useState } from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { ArrowLeft, Link2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getBlogPost, BLOG_POSTS } from '@/lib/blogs'
import { useToastStore } from '@/store/useToastStore'

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>()
  const post = getBlogPost(params.slug)
  const showToast = useToastStore((s) => s.showToast)
  const [copied, setCopied] = useState(false)

  if (!post) notFound()

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2)
  const relatedFallback = related.length > 0 ? related : BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    showToast('Link copied to clipboard!', 'info')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-surface-800/50 hover:text-surface-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">{post.category}</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-surface-900 mt-4 text-balance">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-surface-800/50 mt-4">
          <span>{post.author}</span>
          <span>·</span>
          <span>{formatDate(post.date)}</span>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>

        <div className="aspect-[16/9] rounded-xl overflow-hidden mt-8">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <article className="mt-8 flex flex-col gap-4">
          {post.body.map((block, i) => {
            if (block.type === 'h2') {
              return <h2 key={i} className="font-display font-semibold text-xl text-surface-900 mt-4">{block.text}</h2>
            }
            if (block.type === 'li') {
              return (
                <ul key={i} className="list-disc list-inside text-surface-800 -mt-2">
                  <li>{block.text}</li>
                </ul>
              )
            }
            return <p key={i} className="text-surface-800 leading-relaxed">{block.text}</p>
          })}
        </article>

        <div className="flex items-center gap-3 mt-10 pt-6 border-t border-surface-200">
          <span className="text-sm text-surface-800/50">Share this post</span>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full"
          >
            <Link2 className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {relatedFallback.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display font-bold text-xl text-surface-900 mb-5">Related Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedFallback.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group block glass-card rounded-xl overflow-hidden hover:border-brand-300 transition-colors">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-sm text-surface-900 group-hover:text-brand-600 transition-colors">{p.title}</h3>
                    <p className="text-xs text-surface-800/40 mt-2">{formatDate(p.date)}</p>
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
