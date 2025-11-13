import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
// Services
import { AuthHttpService } from "./authhttp.service";
import { AuthService } from '../auth.service';

export interface MeilisearchSearchRequest {
  indexName: string;
  query?: string;
  filters?: Record<string, string[]>;
  geo?: { lat: number; lng: number; radius: number; unit: string };
  sort?: string[];
  page?: number;
  hitsPerPage?: number;
  facets?: string[];
}

export interface MeilisearchSearchResponse {
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

@Injectable({ 
  providedIn: 'root' 
})
export class MeilisearchService {

  private cachedKey: { apiKey: string; apiKeyValidUntil: number; host?: string } | null = null;
  private _apiEndpoint: string = "/meilisearch"; // Note: environment.apiEndpoint already includes /v1

  public sourceSaveSearch: any;
  public searchParameters: any;
  public recentSearch: any;

  constructor(
    private _authhttp: AuthHttpService,
    private _http: HttpClient,
    private _auth: AuthService
  ) {
  }

  /**
   * Get temporary search key (cached, auto-refreshes on expiry)
   * @param forceRefresh Force refresh even if key is still valid
   * @returns Promise with apiKey and apiKeyValidUntil
   */
  async getKey(forceRefresh = false): Promise<{ apiKey: string; apiKeyValidUntil: number; host?: string }> {
    const now = Math.floor(Date.now() / 1000);
    
    // Check cache (with 30 second buffer before expiry)
    if (!forceRefresh && this.cachedKey && this.cachedKey.apiKeyValidUntil > now + 30) {
      return this.cachedKey;
    }

    try {
      // Use HttpClient directly to bypass AuthHttpService error handler
      // This allows us to see the actual HTTP error status
      // environment.apiEndpoint already includes /v1, so we just need /meilisearch/key
      const url = environment.apiEndpoint + this._apiEndpoint + '/key';
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + this._auth.getAccessToken(),
        'Content-Type': 'application/json',
        'Language': 'en'
      });

      const response: any = await this._http.get(url, { headers })
        .pipe(
          catchError((error: any) => {
            // Log the actual error before re-throwing
            console.error('Meilisearch key request failed:', {
              status: error.status,
              statusText: error.statusText,
              error: error.error,
              message: error.message,
              url: url
            });
            return throwError(error);
          })
        )
        .toPromise();
      
      // Check if response exists and is valid
      if (!response) {
        console.error('Empty response from Meilisearch key endpoint');
        throw new Error('Empty response from Meilisearch key endpoint');
      }
      
      // Check if response has required fields
      if (!response.apiKey) {
        console.error('Invalid response from Meilisearch key endpoint - missing apiKey:', response);
        throw new Error('Invalid response from Meilisearch key endpoint: missing apiKey');
      }
      
      this.cachedKey = {
        apiKey: response.apiKey,
        apiKeyValidUntil: response.apiKeyValidUntil || (Math.floor(Date.now() / 1000) + 3600), // Default to 1 hour if not provided
        host: response.host // Optional, for reference only
      };
      return this.cachedKey;
    } catch (error: any) {
      console.error('Error getting Meilisearch key:', error);
      if (error && (error.status === 400 || error.status === 401)) {
        // Key expired, retry once
        return this.getKey(true);
      }
      throw error;
    }
  }

  /**
   * Search via backend proxy
   * @param request MeilisearchSearchRequest
   * @returns Promise<MeilisearchSearchResponse>
   */
  async search(request: MeilisearchSearchRequest): Promise<MeilisearchSearchResponse> {
    await this.getKey(); // Ensure key is valid
    
    const httpResponse: any = await this._authhttp.post(
      `${this._apiEndpoint}/search`,
      request
    ).toPromise();
    
    // AuthHttpService.post() returns body by default, but handle both cases
    const response = httpResponse.body || httpResponse;
    
    if (!response) {
      throw new Error('Empty response from Meilisearch search endpoint');
    }
    
    return response as MeilisearchSearchResponse;
  }

  /**
   * Legacy method for backward compatibility (deprecated)
   * @deprecated Use search() instead
   */
  list(indexName: string, searchParameters = {}): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      this.getKey(false).then(() => {
        this._authhttp.post(this._apiEndpoint + '/search', {
          indexName: indexName,
          params: searchParameters
        }).subscribe(
          response => {
            observer.next(response);
            observer.complete();
          },
          err => {
            if (err.status === 400) {
              this.getKey(true).then(() => {
                this._authhttp.post(this._apiEndpoint + '/search', {
                  indexName: indexName,
                  params: searchParameters
                }).subscribe(
                  response => {
                    observer.next(response);
                    observer.complete();
                  },
                  error => observer.error(error)
                );
              });
            } else {
              observer.error(err);
            }
          }
        );
      });
    });
  }

  getCurrentTimeUTC() {
    // Returns Unix timestamp in seconds (backend returns seconds)
    return Math.floor((new Date()).getTime() / 1000);
  }
}

