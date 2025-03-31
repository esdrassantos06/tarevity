interface QueryConfig {
  staleTime: number
  gcTime: number
  refetchOnWindowFocus: boolean
  refetchOnMount: boolean
  refetchOnReconnect: boolean
  retry?: number
  refetchInterval: number | false
}

export const QUERY_CACHE_CONFIG = {
  default: {
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    refetchInterval: false,
  },
  profile: {
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  },
  stats: {
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  },
  todos: {
    staleTime: 5000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30000,
    refetchOnMount: true,
    refetchOnReconnect: true,
  },
} as const

export const CACHE_HEADERS = {
  api: {
    default: {
      'Cache-Control': 'no-store, max-age=0',
    },
    auth: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
    stats: {
      'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
    },
  },
  static: {
    immutable: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    assets: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    },
    images: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  },
  security: {
    noStore: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  },
} as const

export const MEMORY_CACHE_TTL = {
  emailCheck: 60 * 1000,
  notificationUpdate: 60 * 1000,
  profileData: 5 * 60 * 1000,
}

export function addCacheHeaders(
  headers: Headers,
  type: keyof typeof CACHE_HEADERS,
  subType: string,
) {
  const cacheConfig =
    CACHE_HEADERS[type][subType as keyof (typeof CACHE_HEADERS)[typeof type]]
  if (cacheConfig) {
    Object.entries(cacheConfig).forEach(([key, value]) => {
      headers.set(key, value as string)
    })
  }
  return headers
}

export function createQueryConfig<T extends keyof typeof QUERY_CACHE_CONFIG>(
  type: T,
): QueryConfig {
  return {
    ...QUERY_CACHE_CONFIG.default,
    ...QUERY_CACHE_CONFIG[type],
  }
}
