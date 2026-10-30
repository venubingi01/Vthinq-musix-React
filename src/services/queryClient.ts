import { QueryClient } from '@tanstack/react-query';

// Universal QueryClient instance for caching all music API requests
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes cache
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection in memory
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1
    }
  }
});
