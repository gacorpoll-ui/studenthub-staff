import { Injectable } from '@angular/core';
import {AuthHttpService} from './authhttp.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BankService {

  private _bankEndpoint = '/banks';

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * List of all banks without pagination
   * @returns {Observable<any>}
   */
  listAll(): Observable<any> {
    return this._authhttp.get(this._bankEndpoint + '/all');
  }

  /**
   * list bank listing
   * @param page
   */
  list(page: number): Observable<any> {
    return this._authhttp.getRaw(this._bankEndpoint + '?page=' + page + '&expand=candidateCount');
  }
}
