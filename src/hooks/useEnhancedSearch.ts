import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/simpleStore';

export interface SearchFilters {
  category?: string;
  niche?: string;
  minFollowers?: number;
  maxFollowers?: number;
  sortBy?: 'relevance' | 'followers' | 'recent' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  query: string;
  filters: SearchFilters;
}

interface UseEnhancedSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
}

export function useEnhancedSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  options: UseEnhancedSearchOptions = {}
) {
  const {
    debounceMs = 300,
    minQueryLength = 1,
    maxResults = 50,
  } = options;

  const { addToSearchHistory } = useAppStore();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    sortOrder: 'desc',
  });
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Add to search history when query is meaningful
  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      addToSearchHistory(debouncedQuery);
    }
  }, [debouncedQuery, addToSearchHistory]);

  const searchResults = useMemo<SearchResult<T>>(() => {
    if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
      return {
        items: applySorting(items, filters).slice(0, maxResults),
        totalCount: items.length,
        hasMore: items.length > maxResults,
        query: debouncedQuery,
        filters,
      };
    }

    // Perform search
    const queryLower = debouncedQuery.toLowerCase();
    const filteredItems = items.filter(item => {
      // Text search across specified fields
      const textMatch = searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(queryLower);
        }
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(queryLower)
          );
        }
        return false;
      });

      if (!textMatch) return false;

      // Apply filters
      return applyFilters(item, filters);
    });

    // Apply sorting
    const sortedItems = applySorting(filteredItems, filters);

    return {
      items: sortedItems.slice(0, maxResults),
      totalCount: filteredItems.length,
      hasMore: filteredItems.length > maxResults,
      query: debouncedQuery,
      filters,
    };
  }, [debouncedQuery, items, searchFields, filters, minQueryLength, maxResults]);

  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setFilters({ sortBy: 'relevance', sortOrder: 'desc' });
  };

  return {
    query,
    debouncedQuery,
    filters,
    searchResults,
    isSearching,
    updateQuery,
    updateFilters,
    clearSearch,
  };
}

// Helper function to apply filters
function applyFilters<T>(item: T, filters: SearchFilters): boolean {
  // Category filter
  if (filters.category && 'category' in item) {
    if (item.category !== filters.category) return false;
  }

  // Niche filter
  if (filters.niche && 'niche' in item) {
    const itemNiche = item.niche;
    if (Array.isArray(itemNiche)) {
      if (!itemNiche.includes(filters.niche)) return false;
    } else if (itemNiche !== filters.niche) {
      return false;
    }
  }

  // Follower count filters
  if (filters.minFollowers && 'followersCount' in item) {
    const followers = item.followersCount as number;
    if (followers < filters.minFollowers) return false;
  }

  if (filters.maxFollowers && 'followersCount' in item) {
    const followers = item.followersCount as number;
    if (followers > filters.maxFollowers) return false;
  }

  return true;
}

// Helper function to apply sorting
function applySorting<T>(items: T[], filters: SearchFilters): T[] {
  const { sortBy = 'relevance', sortOrder = 'desc' } = filters;

  return [...items].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'followers':
        if ('followersCount' in a && 'followersCount' in b) {
          comparison = (a.followersCount as number) - (b.followersCount as number);
        }
        break;
      case 'alphabetical':
        if ('name' in a && 'name' in b) {
          comparison = (a.name as string).localeCompare(b.name as string);
        } else if ('hashtag' in a && 'hashtag' in b) {
          comparison = (a.hashtag as string).localeCompare(b.hashtag as string);
        }
        break;
      case 'recent':
        if ('createdAt' in a && 'createdAt' in b) {
          comparison = new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
        }
        break;
      case 'relevance':
      default:
        // For relevance, keep original order or implement scoring
        return 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

// Search suggestions hook
export function useSearchSuggestions(query: string, maxSuggestions = 5) {
  const { searchHistory } = useAppStore();

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) {
      // Return recent searches if no query
      return searchHistory.slice(0, maxSuggestions).map(term => ({
        text: term,
        type: 'history' as const,
      }));
    }

    const queryLower = query.toLowerCase();
    
    // Common Zimbabwe creator/trend keywords
    const popularTerms = [
      'dance', 'comedy', 'music', 'fashion', 'food', 'lifestyle',
      'fitness', 'beauty', 'tech', 'education', 'art', 'photography',
      'challenges', 'trends', 'viral', 'zimbabwe', 'harare', 'bulawayo'
    ];

    const matchingSuggestions = [];

    // Add matching history
    const historyMatches = searchHistory
      .filter(term => term.toLowerCase().includes(queryLower))
      .slice(0, 3)
      .map(term => ({ text: term, type: 'history' as const }));
    
    matchingSuggestions.push(...historyMatches);

    // Add matching popular terms
    const popularMatches = popularTerms
      .filter(term => term.toLowerCase().includes(queryLower))
      .slice(0, maxSuggestions - matchingSuggestions.length)
      .map(term => ({ text: term, type: 'popular' as const }));

    matchingSuggestions.push(...popularMatches);

    return matchingSuggestions.slice(0, maxSuggestions);
  }, [query, searchHistory, maxSuggestions]);

  return suggestions;
}