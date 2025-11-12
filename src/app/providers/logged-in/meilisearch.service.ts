import { Injectable } from '@angular/core';
import { Observable, Observer, throwError } from 'rxjs';
// Services
import { AuthHttpService } from "./authhttp.service";


@Injectable({ 
  providedIn: 'root' 
})
export class MeilisearchService {

  public host: string;
  public apiKey: string;
  public apiKeyValidUntil: number;

  public sourceSaveSearch: any;
  public searchParameters: any;

  public recentSearch: any;

  private _apiEndpoint: string = "/meilisearch";

  constructor(
    private _authhttp: AuthHttpService
  ) {
  }

  /**
   * Return temporary search key from Meilisearch backend
   * @returns {Promise<any>}
   */
  getKey(isExpired = false): Promise<any> {

    // Check cache first
    if (!isExpired && this.apiKey && this.apiKeyValidUntil && 
        this.getCurrentTimeUTC() < this.apiKeyValidUntil) {
      return Promise.resolve({
        host: this.host,
        apiKey: this.apiKey,
        apiKeyValidUntil: this.apiKeyValidUntil
      });
    }

    // Clear cache if expired
    if (isExpired) {
      this.apiKey = null;
      this.apiKeyValidUntil = null;
    }

    return new Promise((resolve, reject) => {

      let url = this._apiEndpoint + '/key';

      this._authhttp.get(url).subscribe(response => {

        this.host = response.host;
        this.apiKey = response.apiKey;
        this.apiKeyValidUntil = response.apiKeyValidUntil;

        resolve(response);
      }, error => {
        reject(error);
      });
    });
  }

  /**
   * Search Meilisearch index via backend proxy
   * @param indexName string  
   * @param searchParameters
   */
  list(indexName, searchParameters = {}): Observable<any> {

    return Observable.create((observer: Observer<any>) => {

      this.getKey(false).then(() => {
        // Use backend proxy endpoint
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
              // Key expired, retry with fresh key
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
    // Ensure comparison is consistent - both in seconds
    return Math.floor((new Date()).getTime() / 1000);
  }
}

