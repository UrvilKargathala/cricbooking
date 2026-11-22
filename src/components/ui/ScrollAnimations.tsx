'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const EXTRA_SELECTOR = 'main section, [data-reveal], footer > *'

const SKIP_TAGS = new Set(['HEADER', 'NAV', 'SCRIPT', 'STYLE', 'FOOTER'])

function contentBlocks(el: Element, depth: number): HTMLElement[] {
  const kids = Array.from(el.children).filter((kid): kid is HTMLElement => {
    if (!(kid instanceof HTMLElement) || SKIP_TAGS.has(kid.tagName)) return false
    const position = getComputedStyle(kid).position
    return kid.offsetHeight > 40 && position !== 'fixed' && position !== 'sticky'
  })
  return kids.flatMap((kid) =>
    depth < 3 && kid.offsetHeight > window.innerHeight * 1.2 && kid.children.length > 1 ? contentBlocks(kid, depth + 1) : [kid]
  )
}

function pageRoots(): Element[] {
  const mains = Array.from(document.querySelectorAll('main'))
  if (mains.length) return mains
  return document.body.firstElementChild ? [document.body.firstElementChild] : []
}

function gridCards(): HTMLElement[] {
  return pageRoots().flatMap((root) =>
    Array.from(root.querySelectorAll<HTMLElement>('.grid')).flatMap((grid) =>
      grid.children.length > 1 && grid.children.length <= 12 ? (Array.from(grid.children) as HTMLElement[]) : []
    )
  )
}

const SKIP_INSIDE = '#book-a-slot, [data-no-reveal], [role="dialog"], form'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function ScrollAnimations() {
  const pathname = usePathname()

  useEffect(() => {
    if (prefersReducedMotion()) return

    const finish = (el: HTMLElement) => {
      el.classList.add('reveal-in')
      const cleanup = () => {
        el.classList.remove('reveal', 'reveal-in')
        el.style.removeProperty('--reveal-delay')
        el.removeEventListener('transitionend', onEnd)
      }
      const onEnd = (event: TransitionEvent) => {
        if (event.target === el && event.propertyName === 'transform') cleanup()
      }
      el.addEventListener('transitionend', onEnd)
      window.setTimeout(cleanup, 1900)
    }

    const pending = new Set<HTMLElement>()

    const checkPending = () => {
      const trigger = window.innerHeight * 0.88
      pending.forEach((el) => {
        if (!el.isConnected) {
          pending.delete(el)
          return
        }
        if (el.getBoundingClientRect().top < trigger) {
          pending.delete(el)
          finish(el)
        }
      })
    }

    let checkTimer = 0
    const scheduleCheck = () => {
      if (checkTimer) return
      checkTimer = window.setTimeout(() => {
        checkTimer = 0
        checkPending()
      }, 50)
    }

    window.addEventListener('scroll', scheduleCheck, { passive: true })
    window.addEventListener('resize', scheduleCheck)

    const prepare = (el: HTMLElement, delay = 0) => {
      if (el.dataset.revealInit) return
      el.dataset.revealInit = 'true'
      if (el.closest(SKIP_INSIDE)) return
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.92) return
      if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`)
      el.classList.add('reveal')
      pending.add(el)
    }

    const scan = () => {
      pageRoots().forEach((root) => contentBlocks(root, 0).forEach((el) => prepare(el)))
      document.querySelectorAll<HTMLElement>(EXTRA_SELECTOR).forEach((el) => prepare(el))
      gridCards().forEach((el) => {
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : []
        prepare(el, Math.min(siblings.indexOf(el), 7) * 90)
      })
      checkPending()
    }

    let timer = 0
    const scheduleScan = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(scan, 60)
    }

    scheduleScan()
    const mutations = new MutationObserver(scheduleScan)
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.clearTimeout(timer)
      mutations.disconnect()
      window.clearTimeout(checkTimer)
      window.removeEventListener('scroll', scheduleCheck)
      window.removeEventListener('resize', scheduleCheck)
      pending.clear()
      document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => el.classList.remove('reveal', 'reveal-in'))
    }
  }, [pathname])

  return null
}
