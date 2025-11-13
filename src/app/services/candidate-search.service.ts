import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MeilisearchService, MeilisearchSearchRequest, MeilisearchSearchResponse } from '../providers/logged-in/meilisearch.service';
import { environment } from '../../environments/environment';

export interface SearchState {
  query: string;
  filters: Record<string, string[]>;
  geo?: { lat: number; lng: number; radius: number; unit: string };
  sort: string[];
  page: number;
  hitsPerPage: number;
  facets?: string[];
}

export interface SearchResults {
  hits: any[];
  pagination: {
    total: number;
    page: number;
    hitsPerPage: number;
    totalPages: number;
  };
  facets?: Record<string, Record<string, number>>;
  processingTimeMs: number;
  query: string;
}

interface CachedFacets {
  data: Record<string, Record<string, number>>;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateSearchService {
  private stateSubject = new BehaviorSubject<SearchState>({
    query: '',
    filters: {},
    sort: [],
    page: 0,
    hitsPerPage: 20,
    facets: [
      'candidate_gender',
      'candidate_driving_license',
      'university.university_id',
      'bank.bank_id',
      'have_video',
      'have_resume',
      'candidate_committed',
      'assigned',
      'candidate_mom_kuwaiti',
      'isProfileCompleted',
      'currency_code',
      'country.country_id',
      'store.store_id'
    ]
  });

  private resultsSubject = new BehaviorSubject<SearchResults | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<any>(null);

  // Facet cache with 5min TTL
  private facetCache: CachedFacets | null = null;
  private readonly FACET_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  public state$: Observable<SearchState> = this.stateSubject.asObservable();
  public results$: Observable<SearchResults | null> = this.resultsSubject.asObservable();
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();
  public error$: Observable<any> = this.errorSubject.asObservable();

  constructor(private meilisearchService: MeilisearchService) {
    // Load state from URL on init
    this.loadStateFromUrl();
  }

  /**
   * Get current search state
   */
  getState(): SearchState {
    return this.stateSubject.value;
  }

  /**
   * Set search query
   */
  setQuery(query: string): void {
    const state = this.getState();
    this.updateState({ ...state, query, page: 0 });
  }

  /**
   * Set filter value for a specific attribute
   */
  setFilter(attribute: string, values: string[]): void {
    const state = this.getState();
    const filters = { ...state.filters };
    
    if (values.length === 0) {
      delete filters[attribute];
    } else {
      filters[attribute] = values;
    }
    
    this.updateState({ ...state, filters, page: 0 });
  }

  /**
   * Toggle a filter value (add if not present, remove if present)
   */
  toggleFilter(attribute: string, value: string): void {
    const state = this.getState();
    const currentValues = state.filters[attribute] || [];
    const index = currentValues.indexOf(value);
    
    let newValues: string[];
    if (index > -1) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    this.setFilter(attribute, newValues);
  }

  /**
   * Set geo search parameters
   */
  setGeo(geo: { lat: number; lng: number; radius: number; unit: string } | undefined): void {
    const state = this.getState();
    this.updateState({ ...state, geo, page: 0 });
  }

  /**
   * Set sort order
   */
  setSort(sort: string[]): void {
    const state = this.getState();
    this.updateState({ ...state, sort, page: 0 });
  }

  /**
   * Set current page
   */
  setPage(page: number): void {
    const state = this.getState();
    this.updateState({ ...state, page });
  }

  /**
   * Set hits per page
   */
  setHitsPerPage(hitsPerPage: number): void {
    const state = this.getState();
    this.updateState({ ...state, hitsPerPage, page: 0 });
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    const state = this.getState();
    this.updateState({
      ...state,
      filters: {},
      geo: undefined,
      query: '',
      page: 0
    });
  }

  /**
   * Remove a specific filter
   */
  removeFilter(attribute: string): void {
    this.setFilter(attribute, []);
  }

  /**
   * Get facet counts for a specific attribute
   */
  getFacetCount(attribute: string, value: string): number {
    const results = this.resultsSubject.value;
    if (!results || !results.facets || !results.facets[attribute]) {
      return 0;
    }
    return results.facets[attribute][value] || 0;
  }

  /**
   * Get all facet counts for an attribute
   */
  getFacetCounts(attribute: string): Record<string, number> {
    const results = this.resultsSubject.value;
    if (!results || !results.facets || !results.facets[attribute]) {
      return {};
    }
    return results.facets[attribute];
  }

  /**
   * Perform search
   */
  async search(): Promise<SearchResults> {
    const state = this.getState();
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      // Auto-add distance sorting if geo search is active
      let sort = [...state.sort];
      if (state.geo && sort.length === 0) {
        sort = [`_geoPoint(${state.geo.lat}, ${state.geo.lng}):asc`];
      }

      const request: MeilisearchSearchRequest = {
        indexName: environment.meilisearchCandidateIndex,
        query: state.query || undefined,
        filters: Object.keys(state.filters).length > 0 ? state.filters : undefined,
        geo: state.geo,
        sort: sort.length > 0 ? sort : undefined,
        page: state.page,
        hitsPerPage: state.hitsPerPage,
        facets: state.facets && state.facets.length > 0 ? state.facets : undefined
      };

      const response = await this.meilisearchService.search(request);
      
      const results: SearchResults = {
        hits: response.hits,
        pagination: response.pagination,
        facets: response.facets,
        processingTimeMs: response.processingTimeMs,
        query: response.query
      };

      this.resultsSubject.next(results);
      this.updateUrlState();
      return results;
    } catch (error) {
      this.errorSubject.next(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Update state and trigger search
   */
  private updateState(newState: SearchState): void {
    this.stateSubject.next(newState);
    this.updateUrlState();
  }

  /**
   * Update URL query parameters with current state
   */
  private updateUrlState(): void {
    // TODO: Implement URL state persistence if needed
    // This can use Angular Router to update query params
  }

  /**
   * Load state from URL query parameters
   */
  private loadStateFromUrl(): void {
    // TODO: Implement URL state loading if needed
    // This can read from Angular Router query params
  }

  /**
   * Get cached facets or null if expired
   */
  private getCachedFacets(): Record<string, Record<string, number>> | null {
    if (!this.facetCache) {
      return null;
    }
    
    const now = Date.now();
    if (now - this.facetCache.timestamp > this.FACET_CACHE_TTL) {
      this.facetCache = null;
      return null;
    }
    
    return this.facetCache.data;
  }

  /**
   * Cache facets
   */
  private setCachedFacets(facets: Record<string, Record<string, number>>): void {
    this.facetCache = {
      data: facets,
      timestamp: Date.now()
    };
  }
}

