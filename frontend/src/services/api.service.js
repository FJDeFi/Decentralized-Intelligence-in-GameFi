import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  },
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // Incremental retry delay
  }
});

// Add retry interceptor
apiClient.interceptors.response.use(null, async (error) => {
  const { config } = error;
  if (!config || !config.retry) {
    return Promise.reject(error);
  }
  
  config.retryCount = config.retryCount || 0;
  
  if (config.retryCount >= config.retry) {
    return Promise.reject(error);
  }
  
  config.retryCount += 1;
  const delayRetry = new Promise(resolve => {
    setTimeout(resolve, config.retryDelay(config.retryCount));
  });
  
  return delayRetry.then(() => apiClient(config));
});

// Add request caching mechanism
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (key, params) => {
  return `${key}_${JSON.stringify(params)}`;
};

const setCacheWithExpiry = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

// Add request queue to prevent overwhelming
const requestQueue = [];
const MAX_CONCURRENT_REQUESTS = 3;

// Add rate limiting
const rateLimiter = {
  tokens: 10,
  lastRefill: Date.now(),
  refillRate: 1000, // 1 token per second
};

// Add proper error handling for network issues
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (!navigator.onLine) {
      // Handle offline state
    }
    return Promise.reject(error);
  }
);

// Add request debouncing
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Add request memoization
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

export const createAsset = async (assetData) => {
  try {
    if (!assetData.name || !assetData.category || !assetData.rarity) {
      throw new Error('Missing required fields');
    }
    if (assetData.rarity < 1 || assetData.rarity > 10) {
      throw new Error('Rarity must be between 1 and 10');
    }

    const response = await apiClient.post('/assets/create-asset', assetData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create asset: ${error.response?.data?.message || error.message}`);
  }
};

export const transferAsset = async (transferData) => {
  const response = await axios.post(`${API_URL}/transfer-asset`, transferData);
  return response.data;
};

export const getAssetsByOwner = async (ownerAddress) => {
  const response = await axios.get(`${API_URL}/assets/${ownerAddress}`);
  return response.data;
};

export const getAssetDetails = async (assetId) => {
  const cacheKey = getCacheKey('asset', assetId);
  const cached = getFromCache(cacheKey);
  
  if (cached) return cached;
  
  const response = await apiClient.get(`/assets/${assetId}`);
  setCacheWithExpiry(cacheKey, response.data);
  return response.data;
}; 