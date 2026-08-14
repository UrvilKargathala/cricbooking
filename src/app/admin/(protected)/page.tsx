'use client'

import { MapPin, Users, Calendar, IndianRupee } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { DEMO_ADMIN_VENUES, DEMO_ADMIN_ACTIVITY } from '@/lib/demo-data'

const STATS = [
  { label: 'Total Venues', value: '52', icon: MapPin, bg: 'bg-blue-50', text: 'text-blue-600', subtext: '3 pending approval' },
  { label: 'Total Users', value: '1,247', icon: Users, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { label: 'Total Bookings', value: '8,432', icon: Calendar, bg: 'bg-brand-50', text: 'text-brand-600' },
  { label: 'Platform Revenue', value: formatPrice(6750000), icon: IndianRupee, bg: 'bg-purple-50', text: 'text-purple-600' },
]

export default function AdminOverviewPage() {
  const pendingVenues = DEMO_ADMIN_VENUES.filter((v) => v.status === 'pending')

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-800/60">{stat.label}</p>
                <p className="font-display font-bold text-2xl text-surface-900 mt-1">{stat.value}</p>
                {stat.subtext && <p className="text-xs text-amber-600 mt-0.5">{stat.subtext}</p>}
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.text}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-semibold text-surface-900">Pending Approvals</h2>
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
            {pendingVenues.length}
          </span>
        </div>

        {pendingVenues.length === 0 ? (
          <p className="py-8 text-center text-sm text-surface-800/50">No pending approvals</p>
        ) : (
          pendingVenues.map((venue) => (
            <div key={venue.id} className="flex items-center justify-between py-4 border-b border-surface-100 last:border-0">
              <div>
                <p className="font-medium text-surface-900">{venue.name}</p>
                <p className="text-sm text-surface-800/60">by {venue.owner_name} · {venue.area}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {venue.sports.map((sport) => (
                    <span key={sport} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-800">
                      {sport === 'turf' ? 'Turf' : 'Cricket Ground'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Venue "' + venue.name + '" approved! Owner will now get dashboard access.')}
                  className="text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => alert('Venue "' + venue.name + '" rejected.')}
                  className="text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5 mt-6">
        <h2 className="font-display font-semibold text-surface-900 mb-4">Recent Activity</h2>
        {DEMO_ADMIN_ACTIVITY.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-surface-100 last:border-0">
            <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: activity.color }} />
            <div>
              <p className="text-sm text-surface-800">{activity.message}</p>
              <p className="text-xs text-surface-800/40 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
