'use client'
import { useState } from 'react'
import Sidebar from '@/components/sidebar'
import Topbar from '@/components/topbar'
import AgendaReminder from '@/components/agenda-reminder'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <AgendaReminder />
      <div className="min-h-screen flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen">
          <Topbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
