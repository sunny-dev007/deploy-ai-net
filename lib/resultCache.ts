// Shared result cache for long-running requests
// In a production environment, this should be stored in Redis or another distributed cache

interface CacheResult {
  result?: string;
  status: 'processing' | 'completed' | 'error';
  error?: string;
  timestamp: number;
}

// In-memory cache
const resultCache = new Map<string, CacheResult>();

// Clean up old results periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [requestId, data] of resultCache.entries()) {
      // Remove entries older than 15 minutes
      if (now - data.timestamp > 15 * 60 * 1000) {
        resultCache.delete(requestId);
      }
    }
  }, 5 * 60 * 1000);
}

// Store a result in the cache
export function storeResult(requestId: string, result: string): void {
  resultCache.set(requestId, {
    result,
    status: 'completed',
    timestamp: Date.now()
  });
}

// Mark a request as processing
export function markAsProcessing(requestId: string): void {
  resultCache.set(requestId, {
    status: 'processing',
    timestamp: Date.now()
  });
}

// Store an error in the cache
export function storeError(requestId: string, error: string): void {
  resultCache.set(requestId, {
    error,
    status: 'error',
    timestamp: Date.now()
  });
}

// Get a result from the cache
export function getResult(requestId: string): CacheResult | undefined {
  return resultCache.get(requestId);
}

export default {
  storeResult,
  markAsProcessing,
  storeError,
  getResult
}; 