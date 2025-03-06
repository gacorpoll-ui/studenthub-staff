import { Injectable } from '@angular/core';
import { AuthHttpService } from './authhttp.service';
import { Observable } from 'rxjs';
import { Contract } from 'src/app/models/contract';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private _endpoint = '/contracts';

  constructor(private authHttp: AuthHttpService) { }

  /**
   * load Contract detail
   * @param contract_uuid
   */
  view(contract_uuid) {
    return this.authHttp.get(this._endpoint + '/' + contract_uuid + '?expand=amount,candidate,company,parentCompany,store');
  }

  /**
   * List of all Contract
   * @returns {Observable<any>}
   */
  list(page: number, urlParams: string): Observable<any>{
    let url = this._endpoint + '?expand=amount,candidate,company,parentCompany,store&page=' + page + '&' + urlParams;
    return this.authHttp.getRaw(url);
  }
 
  /**
   * create Contract
   * @param model
   */
  create(model: Contract): Observable<any>{
    return this.authHttp.post(this._endpoint, model);
  }

  /**
   * update Contract
   * @param model
   */
  update(model: Contract): Observable<any>{
    return this.authHttp.patch(`${this._endpoint}/${model.contract_uuid}`, model);
  }

  /**
   * delete Contract
   * @param model
   */
  delete(model: Contract): Observable<any>{
    return this.authHttp.delete(`${this._endpoint}/${model.contract_uuid}`);
  }
}
