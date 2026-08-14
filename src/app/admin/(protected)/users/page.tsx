'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { DEMO_ADMIN_USERS } from '@/lib/demo-data'
import { Tabs } from '@/components/ui/Tabs'

const ROLE_TABS = ['all', 'user', 'owner', 'admin'] as const
const ROLE_LABELS: Record<(typeof ROLE_TABS)[number], string> = {
  all: 'All', user: 'Users', owner: 'Owners', admin: 'Admins',
}

const ROLE_BADGE: Record<string, string> = {
  user: 'bg-blue-50 text-blue-700',
  owner: 'bg-brand-50 text-brand-700',
  admin: 'bg-red-50 text-red-700',
}
const ROLE_AVATAR: Record<string, string> = {
  user: 'bg-blue-100 text-blue-700',
  owner: 'bg-brand-100 text-brand-700',
  admin: 'bg-red-100 text-red-700',
}

function initials(name: string) {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

function countFor(role: (typeof ROLE_TABS)[number]) {
  return role === 'all' ? DEMO_ADMIN_USERS.length : DEMO_ADMIN_USERS.filter((u) => u.role === role).length
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<(typeof ROLE_TABS)[number]>('all')

  const tabs = ROLE_TABS.map((role) => ({ key: role, label: `${ROLE_LABELS[role]} (${countFor(role)})` }))

  const filtered = DEMO_ADMIN_USERS.filter((user) => {
    if (activeTab !== 'all' && user.role !== activeTab) return false
    const q = search.trim().toLowerCase()
    if (!q) return true
    return user.full_name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.phone.toLowerCase().includes(q)
  })

  return (
    <div>
      <h1 className="font-display font-bold text-xl text-surface-900 mb-6">Users & Owners</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone..."
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div className="mb-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(key) => setActiveTab(key as (typeof ROLE_TABS)[number])} />
      </div>

      <p className="text-sm text-surface-800/50 mb-3">Showing {filtered.length} users</p>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="w-10 h-10 text-surface-800/20 mx-auto" />
            <p className="text-surface-800/50 mt-2">No users match your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-800/50 border-b border-surface-200 bg-surface-50">
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">User</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Phone</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Role</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide text-center">Bookings</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Joined</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${ROLE_AVATAR[user.role]}`}>
                          {initials(user.full_name)}
                        </div>
                        <span className="font-medium text-surface-900">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-surface-800/60">{user.email}</td>
                    <td className="px-4 py-3 text-surface-800/60 font-mono text-xs">{user.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${ROLE_BADGE[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-center">
                      {user.role === 'user' ? user.bookings_count : '—'}
                    </td>
                    <td className="px-4 py-3 text-surface-800/70">
                      {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue={user.role}
                        disabled={user.role === 'admin'}
                        onChange={(e) => alert('Role changed to ' + e.target.value + ' for ' + user.full_name)}
                        className="text-xs px-2 py-1 bg-surface-50 border border-surface-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="user">user</option>
                        <option value="owner">owner</option>
                        <option value="admin">admin</option>
                      </select>
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
