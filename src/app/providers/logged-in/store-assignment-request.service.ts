import { Injectable } from '@angular/core';
import { AuthHttpService } from './authhttp.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreAssignmentRequestService {

  private _endpoint = '/store-assignment-requests';

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * Return list 
   * @returns {Observable<any>}
   */
  list(page: number = 1, urlParams = ''): Observable<any>{
    const url = this._endpoint + '?page=' + page + urlParams;
    return this._authhttp.getRaw(url);
  }

  /**
   * return details
   * @param sar_uuid 
   * @param urlParams 
   * @returns 
   */
  view(sar_uuid: string, urlParams = ''): Observable<any>{
    const url = this._endpoint + '/' + sar_uuid +'?' + urlParams;
    return this._authhttp.get(url);
  }

  accept(sar_uuid: string): Observable<any>{
    const url = this._endpoint + '/accept/' + sar_uuid;
    return this._authhttp.patch(url, {});
  }

  reject(sar_uuid: string): Observable<any>{
    const url = this._endpoint + '/reject/' + sar_uuid;
    return this._authhttp.patch(url, {});
  }
}
