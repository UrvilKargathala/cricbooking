'use client'

import { useState } from 'react'
import { DEMO_ADMIN_VENUES } from '@/lib/demo-data'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'

const STATUS_TABS = ['all', 'approved', 'pending', 'rejected'] as const

function countFor(status: (typeof STATUS_TABS)[number]) {
  return status === 'all' ? DEMO_ADMIN_VENUES.length : DEMO_ADMIN_VENUES.filter((v) => v.status === status).length
}

export default function AdminVenuesPage() {
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>('all')

  const tabs = STATUS_TABS.map((status) => ({
    key: status,
    label: `${status[0].toUpperCase() + status.slice(1)} (${countFor(status)})`,
  }))

  const filtered = activeTab === 'all' ? DEMO_ADMIN_VENUES : DEMO_ADMIN_VENUES.filter((v) => v.status === activeTab)

  const toggleFeatured = (name: string) => alert('Featured status toggled for ' + name)

  const handleAction = (name: string, action: string) => alert(action + ' action confirmed for "' + name + '".')

  return (
    <div>
      <h1 className="font-display font-bold text-xl text-surface-900 mb-6">All Venues</h1>

      <div className="mb-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(key) => setActiveTab(key as (typeof STATUS_TABS)[number])} />
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-surface-800/50">No {activeTab === 'all' ? '' : activeTab} venues</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-800/50 border-b border-surface-200 bg-surface-50">
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Venue Name</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Owner</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Area</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide text-center">Courts</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide text-center">Bookings</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Revenue</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Featured</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((venue) => (
                  <tr key={venue.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-surface-900">{venue.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {venue.sports.map((sport) => (
                          <span key={sport} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-800">
                            {sport === 'turf' ? 'Turf' : 'Cricket Ground'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-surface-800/70">
                      {venue.owner_name}
                      <p className="text-xs text-surface-800/40">{venue.owner_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-surface-800/70">{venue.area}</td>
                    <td className="px-4 py-3 text-surface-800/70 text-center">{venue.courts_count}</td>
                    <td className="px-4 py-3 font-medium text-center">{venue.bookings_count}</td>
                    <td className="px-4 py-3 font-medium">{venue.revenue ? formatPrice(venue.revenue) : '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={venue.status}>{venue.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {venue.status === 'approved' ? (
                        <button
                          onClick={() => toggleFeatured(venue.name)}
                          className={`w-9 h-5 rounded-full transition-colors relative ${venue.is_featured ? 'bg-brand-600' : 'bg-surface-200'}`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${venue.is_featured ? 'translate-x-4' : 'translate-x-0.5'}`}
                          />
                        </button>
                      ) : (
                        <span className="text-surface-800/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {venue.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(venue.name, 'Approve')}
                            className="text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg px-2.5 py-1 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(venue.name, 'Reject')}
                            className="text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg px-2.5 py-1 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {venue.status === 'approved' && (
                        <button onClick={() => handleAction(venue.name, 'Suspend')} className="text-xs text-red-600 hover:underline">
                          Suspend
                        </button>
                      )}
                      {venue.status === 'rejected' && (
                        <button onClick={() => handleAction(venue.name, 'Re-review')} className="text-xs text-brand-600 hover:underline">
                          Re-review
                        </button>
                      )}
                      {(venue.status as string) === 'suspended' && (
                        <button onClick={() => handleAction(venue.name, 'Reinstate')} className="text-xs text-emerald-600 hover:underline">
                          Reinstate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
