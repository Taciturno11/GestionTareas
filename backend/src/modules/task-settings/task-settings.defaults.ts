export function createInitialTaskSettings(user: { id: string; name: string }) {
  const initials = user.name
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return {
    projects: [],
    assignees: [
      {
        id: user.id,
        initials,
        fullName: user.name,
        bg: '#E0E7FF',
        text: '#3730A3',
      },
    ],
    labels: [],
    priorities: [
      { id: 'Alta', label: 'Alta', bg: '#FEE2E2', text: '#B91C1C' },
      { id: 'Media', label: 'Media', bg: '#FEF3C7', text: '#92400E' },
      { id: 'Baja', label: 'Baja', bg: '#F1F5F9', text: '#64748B' },
    ],
    statuses: [
      { id: 'pendiente', label: 'Pendiente', dot: '#F59E0B' },
      { id: 'progreso', label: 'En Progreso', dot: '#3B82F6' },
      { id: 'hecho', label: 'Hecho', dot: '#10B981' },
    ],
  }
}
