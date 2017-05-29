import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';

// Pages
import { StoreViewPage } from '../store-view/store-view';
import { StoreFormPage } from '../store-form/store-form';
// Providers
import { StoreService } from '../../../../providers/logged-in/store.service';
// Models
import { Store } from '../../../../models/store';

@Component({
  selector: 'page-store-list',
  templateUrl: 'store-list.html'
})
export class StoreListPage {

  public pageCount = 0;
  public currentPage = 1;
  public pages: number[] = [];

  public stores: Store[];

  private _companyId: number;

  constructor(
    params: NavParams,
    public navCtrl: NavController,
    public storeService: StoreService,
    private _modalCtrl: ModalController,
    private _loadingCtrl: LoadingController,
  ) {
    this._companyId = params.get("companyId");
  }

  ionViewDidLoad() {
    this.loadData(this.currentPage);
  }

  pageLinkColor(page: number) {

    if(page == this.currentPage) 
      return 'light';
    
    return '';
  }

  loadData(page: number) {
    // Load list of ALL stores
    let loader = this._loadingCtrl.create();
    loader.present();
    this.storeService.getStoresBelongingToCompany(this._companyId).subscribe(response => {

      this.pageCount = response.headers.get('X-Pagination-Page-Count');
      this.currentPage = response.headers.get('X-Pagination-Current-Page');

      this.pages = [];

      for(var i = 1; i <= this.pageCount; i++){
         this.pages.push(i);
      }

      //hide if no page = 1 

      if(this.pageCount == 1)
        this.pages = [];

      this.stores = response.json();
      },
    error => {},
    () => {loader.dismiss();}
    );
  }

  /**
   * When its selected
   */
  rowSelected(model){
    // Load Detail Page
    this.navCtrl.push(StoreViewPage, {
      'model': model
    });
  }

  /**
   * Loads the create page
   */
  create(){
    let store = new Store();
    store.company_id = this._companyId;

    let modal = this._modalCtrl.create(StoreFormPage, {
      model: store,
    });
    // Refresh List if required
    modal.onDidDismiss(data => {
      if(data){
        if(data.refresh){
          this.loadData(this.currentPage);
        }
      }
    });
    modal.present();
  }

  /**
   * Delete the provided model
   */
  delete(store: Store){
    let loader = this._loadingCtrl.create();
    loader.present();

    this.storeService.delete(store).subscribe(jsonResp => {
      loader.dismiss();
      this.loadData(this.currentPage);
    });
  }

}
