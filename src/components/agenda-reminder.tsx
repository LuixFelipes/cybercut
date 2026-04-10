'use client'
import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'

export default function AgendaReminder() {
  const store = useStore()
  const toast = useToast()
  const notified = useRef(new Set<string>())

  useEffect(() => {
    // Run immediately once, then every 30 seconds
    function checkReminders() {
      const now = new Date()
      const todayStr = now.toISOString().split('T')[0]
      const nowMs = now.getTime()

      store.agendamentos.forEach(a => {
        if (a.data === todayStr && a.status === 'Confirmado') {
           const [h, m] = a.hora.split(':').map(Number)
           const eventTime = new Date()
           eventTime.setHours(h, m, 0, 0)
           const diffMs = eventTime.getTime() - nowMs
           const diffMins = Math.floor(diffMs / 60000)

           // Se faltam exatos 10 minutos
           if (diffMins === 10 && !notified.current.has(a.id)) {
             toast(`Daqui 10 minutos: ${a.cliente_nome} vai fazer ${a.servico_nome}`, 'info')
             notified.current.add(a.id)
           }
        }
      })
    }

    checkReminders()
    const interval = setInterval(checkReminders, 30000)

    return () => clearInterval(interval)
  }, [store.agendamentos, toast])

  return null
}
