import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { BrokerConnection, BrokerSlug } from '../types/broker'

export function useBrokerConnectionsQuery() {
  return useQuery<BrokerConnection[]>({
    queryKey: ['broker-connections'],
    queryFn: async () => {
      const res = await api.get('/integrations')
      return res.data.data
    },
  })
}

export function useDisconnectBrokerMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (broker: BrokerSlug) => api.delete(`/integrations/${broker}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['broker-connections'] }),
  })
}
