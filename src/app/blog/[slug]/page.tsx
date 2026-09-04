import type { Metadata } from 'next'
import { getBlogPost } from '@/lib/blogs'
import BlogDetailClient from './BlogDetailClient'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPost(params.slug)

  if (!post) {
    return { title: 'Post Not Found — CricBooking' }
  }

  const title = `${post.title} — CricBooking Blog`

  return {
    title,
    description: post.excerpt,
    openGraph: {
      title,
      description: post.excerpt,
      images: [{ url: post.image, width: 1200, height: 630 }],
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description: post.excerpt },
  }
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return <BlogDetailClient slug={params.slug} />
}
