import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
// services
import {AuthHttpService} from './authhttp.service';


@Injectable({
  providedIn: 'root'
})
export class RequestActivityService {

  public requestEndpoint = '/request-activity/';

  constructor(
      public authhttp: AuthHttpService
  ) {
  }

  /**
   * List requests activity
   * @returns {Observable<any>}
   */
  list(page = 1, uuid = null): Observable<any> {
    const url = this.requestEndpoint + 'request-activities/' + uuid + '?page=' + page + '&expand=staff,updatedBy';
    return this.authhttp.getRaw(url);
  }
}
