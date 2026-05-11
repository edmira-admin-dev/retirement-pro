import type { ConnectionStatus } from '../../types/broker'

interface Props {
  status: ConnectionStatus
}

const CONFIG: Record<ConnectionStatus, { label: string; classes: string }> = {
  CONNECTED:    { label: 'Connected',    classes: 'bg-green-100 text-green-700' },
  DISCONNECTED: { label: 'Disconnected', classes: 'bg-gray-100 text-gray-500'  },
  ERROR:        { label: 'Error',        classes: 'bg-red-100 text-red-600'     },
}

export function BrokerStatusBadge({ status }: Props) {
  const { label, classes } = CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'CONNECTED' ? 'bg-green-500' :
          status === 'ERROR'     ? 'bg-red-500'   : 'bg-gray-400'
        }`}
      />
      {label}
    </span>
  )
}
