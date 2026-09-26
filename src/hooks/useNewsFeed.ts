import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { DashboardResponse } from '../types/news'

const QUERY_KEY = ['news-dashboard']

export function useNewsFeed() {
  return useQuery<DashboardResponse>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await api.get<{ data: DashboardResponse }>('/news')
      return res.data.data
    },
    staleTime: Infinity,
  })
}

export function useRefreshNewsFeed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ data: DashboardResponse }>('/news/refresh')
      return res.data.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data)
    },
  })
}
