export function cookieDomainFor(host: string | null | undefined): { domain?: string } {
  const hostname = (host ?? '').split(':')[0]
  return hostname === 'cricbooking.in' || hostname.endsWith('.cricbooking.in') ? { domain: '.cricbooking.in' } : {}
}
