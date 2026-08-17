import { create } from 'zustand'

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (message: string, type?: Notification['type']) => void
  removeNotification: (id: string) => void
}

let nid = 0
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>()

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message, type = 'success') => {
    const id = String(++nid)
    set((s) => ({ notifications: [...s.notifications, { id, message, type }] }))
    const timer = setTimeout(() => {
      activeTimers.delete(id)
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }))
    }, 3500)
    activeTimers.set(id, timer)
  },
  removeNotification: (id) => {
    const timer = activeTimers.get(id)
    if (timer) { clearTimeout(timer); activeTimers.delete(id) }
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }))
  },
}))
