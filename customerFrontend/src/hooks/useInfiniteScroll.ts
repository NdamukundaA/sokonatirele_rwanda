import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

interface UseInfiniteScrollReturn {
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  lastElementRef: (node: HTMLElement | null) => void;
  reset: () => void;
}

export const useInfiniteScroll = (
  fetchFunction: (page: number) => Promise<any>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn => {
  const { threshold = 0.1, rootMargin = '100px' } = options;
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    setError(null);
    
    try {
      const nextPage = currentPage + 1;
      const response = await fetchFunction(nextPage);
      
      // Check if response has more data
      if (response && response.length > 0) {
        setCurrentPage(nextPage);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more items';
      setError(errorMessage);
      throw err;
    } finally {
      setLoadingMore(false);
    }
  }, [fetchFunction, currentPage, loadingMore, hasMore]);

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading || loadingMore) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, loadMore, threshold, rootMargin]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    setLoading(false);
    setLoadingMore(false);
  }, []);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    loading,
    loadingMore,
    hasMore,
    error,
    lastElementRef,
    reset,
  };
}; 