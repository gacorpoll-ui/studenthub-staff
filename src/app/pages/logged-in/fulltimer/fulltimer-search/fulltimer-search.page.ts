import {Component, ViewChild, OnInit, ChangeDetectorRef, ViewRef} from '@angular/core';
import { NavController, Platform, MenuController, PopoverController, IonContent, ModalController } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { TransferState, makeStateKey } from '@angular/platform-browser';
// service
import { AuthService } from '../../../../providers/auth.service';
import { FulltimerService } from '../../../../providers/logged-in/fulltimer.service';
import { TranslateLabelService } from '../../../../providers/translate-label.service';
import { EventService } from '../../../../providers/event.service';
import { MeilisearchService } from 'src/app/providers/logged-in/meilisearch.service';
import { AuthHttpService } from 'src/app/providers/logged-in/authhttp.service';
//models
import { Fulltimer } from 'src/app/models/fulltimer';
//pages
import { FulltimerFormPage } from '../fulltimer-form/fulltimer-form.page';
import { AnalyticsService } from 'src/app/providers/analytics.service';



@Component({
  selector: 'app-fulltimer-search',
  templateUrl: './fulltimer-search.page.html',
  styleUrls: ['./fulltimer-search.page.scss'],
})
export class FulltimerSearchPage implements OnInit {

  @ViewChild(IonContent, { static: true }) content: IonContent;

  @ViewChild('instantSearch', { static: false }) public instantSearch;

  public request_uuid;

  public lastQuery;

  public eleInfinite;

  public showFilter: boolean = false;

  public loading: boolean;

  public isMobile: boolean;

  public instantSearchConfig;

  public nbHits = null;
  public nbPages;
  public page;
  public searchParameters = {};
  public refreshingFulltimers = false;
  public dirty = false;
  public noFulltimerList = false;
  public showSearchForm = false;
  public showSearchBox = true;
  public haveLocationFilter = false;
  public lastRefinements;
  public lastQueryId;
  public scrollPosition = 0;
  public borderLimit = false;

  constructor(
    public transferState: TransferState,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public auth: AuthService,
    public meilisearchService: MeilisearchService,
    private _authhttp: AuthHttpService,
    public fulltimerService: FulltimerService,
    public changeDetector: ChangeDetectorRef,
    public eventService: EventService,
    public translateService: TranslateLabelService,
    public analyticService: AnalyticsService,
    public popoverCtrl: PopoverController,
    public _menuCtrl: MenuController
  ) {
  }

  ngOnInit() {

    this.analyticService.page('Fulltimer Search Page');

    this.platform.ready().then(() => {
      if (this.platform.is('mobile')) {
        this.isMobile = true;
      }
    });

    /*window.onresize = (e) => {
      this.onResize();
    };*/
  }

  ionViewWillEnter() {

    if (
      this.fulltimerService.meilisearchConfig &&
      this.fulltimerService.meilisearchConfig.searchParameters &&
      this.instantSearch &&
      this.instantSearch.instantSearchInstance.helper &&
      (
        JSON.stringify(this.instantSearch.instantSearchInstance.helper.state.numericRefinements) != JSON.stringify(this.fulltimerService.meilisearchConfig.searchParameters.numericRefinements) ||
        JSON.stringify(this.instantSearch.instantSearchInstance.helper.state.facetFilters) != JSON.stringify(this.fulltimerService.meilisearchConfig.searchParameters.facetFilters) ||
        JSON.stringify(this.instantSearch.instantSearchInstance.helper.state.disjunctiveFacetsRefinements) != JSON.stringify(this.fulltimerService.meilisearchConfig.searchParameters.disjunctiveFacetsRefinements)
      )
    ) {
      this.scrollPosition = 0;
      this.dirty = true;
      // this.refreshingFulltimers = true;
    } else {
      setTimeout(() => {
        this.refreshingFulltimers = false;
      });
    }

    this.content.scrollToPoint(0, this.scrollPosition);

    if (this.instantSearchConfig && this.dirty) {
      this.initializeSearchParameters();
    }
  }

  dismiss() {
    this.showFilter = !this.showFilter;
  }

  allFulltimers() {
    this.navCtrl.navigateForward('/fulltimer-list');
  }

  ionViewDidEnter() {

    if (!this.instantSearchConfig) { // on first time app load
      this.initializeSearchParameters();

      this.setConfig();
    }
  }

  ionViewWillLeave() {
    this.content.getScrollElement().then(ele => {
      this.scrollPosition = ele.scrollTop;
    });
  }

  /**
   * initialize search parameters from state
   */
  initializeSearchParameters() {

    if (this.fulltimerService.meilisearchConfig) {
      this.searchParameters = Object.assign({}, this.fulltimerService.meilisearchConfig.searchParameters);
    /*} else {
      this.searchParameters = {
        'getRankingInfo': true,
        'aroundLatLngViaIP': true,
        'aroundRadius': 'all'
      };*/
    }
  }

  onResize() {
    this.showFilter = false;
  }

  /**
   * open filter page
   */
  openFilter() {

    this.showFilter = true;
    /*
    this.updateMeilisearchState();

    this.navCtrl.navigateForward('/fulltimer-filter', {
      animated: false,
      animationDirection: 'forward'
    });*/
  }

  /**
   * update meilisearch state
   */
  async updateMeilisearchState() {
    if(!this.fulltimerService.meilisearchConfig) {
      this.fulltimerService.meilisearchConfig = {};
    }

    this.fulltimerService.meilisearchConfig.instantSearchConfig = Object.assign({}, this.instantSearchConfig);
    this.fulltimerService.meilisearchConfig.searchParameters = this.instantSearch ? Object.assign({}, this.instantSearch.instantSearchInstance.helper.state) : Object.assign({}, this.searchParameters);
    this.fulltimerService.meilisearchConfig.nbHits = this.nbHits;
    this.fulltimerService.meilisearchConfig.nbPages = this.nbPages;
  }

  /**
   * check is empty
   * @param obj
   */
  isEmpty(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * return current refinements
   */
  currentRefinements() {

    const instantSearchInstance = Object.assign({}, this.instantSearch.instantSearchInstance);

    return {
      query: instantSearchInstance.helper.state.query,
      tagRefinements: instantSearchInstance.helper.state.tagRefinements,
      numericRefinements: instantSearchInstance.helper.state.numericRefinements,
      disjunctiveFacetsRefinements: instantSearchInstance.helper.state.disjunctiveFacetsRefinements
    };
  }

  onSearch(event) {
    if(this.instantSearch && this.instantSearch.instantSearchInstance)
      this.instantSearch.instantSearchInstance.helper.setQuery(event.target.value).search();
  }

  /**
   * Set meilisearch config
   */
  async setConfig() {

    setTimeout(_ => {
    //  this.loading = true;
    });

    this.meilisearchService.getKey().then(response => {
      this.instantSearchConfig = this.instantSearchConfigRefactor(makeStateKey, HttpHeaders, response);
    });
  }

  /**
   * Create search client that proxies through backend
   */
  createSSRSearchClient(_a) {

    const transferState = _a.transferState;
    const makeStateKey = _a.makeStateKey;
    // Use AuthHttpService for authenticated requests (not raw httpClient)
    
    // Create search client that proxies through backend
    return {
      search: (requests) => {
        const transferStateKey = makeStateKey(`meilisearch(${JSON.stringify(requests)})`);
        
        // Check cache
        if (transferState.hasKey(transferStateKey) && !this.refreshingFulltimers) {
          const cached = JSON.parse(transferState.get(transferStateKey, JSON.stringify({})));
          return Promise.resolve({
            status: cached.status,
            content: JSON.stringify(cached.body),
            isTimedOut: false
          });
        }
        
        // Extract search parameters
        const request = requests[0];
        const searchParams = {
          indexName: request.indexName,
          params: request.params || {}
        };
        
        // Call backend proxy using authenticated HTTP service
        // AuthHttpService automatically adds auth headers and uses environment.apiEndpoint
        return new Promise((resolve, reject) => {
          this._authhttp.post('/meilisearch/search', searchParams).subscribe(
            response => {
              // Cache response (AuthHttpService returns body directly)
              transferState.set(transferStateKey, JSON.stringify({
                status: 200,
                body: response
              }));
              
              resolve({
                status: 200,
                content: JSON.stringify(response),
                isTimedOut: false
              });
            },
            error => {
              if (error.status === 400) {
                // Key expired, refresh and retry
                this.meilisearchService.getKey(true).then(() => {
                  this.setConfig();
                  this._authhttp.post('/meilisearch/search', searchParams).subscribe(
                    response => resolve({
                      status: 200,
                      content: JSON.stringify(response),
                      isTimedOut: false
                    }),
                    err => reject(err)
                  );
                });
              } else {
                reject(error);
              }
            }
          );
        });
      }
    };
  }

  /**
   * process response from meilisearch
   * @param resp
   * @param transferState
   * @param transferStateKey
   */
  processResponse(resp, transferState = null, transferStateKey = null) {

    if (transferState) {
      transferState.set(transferStateKey, JSON.stringify(resp));
    }

    setTimeout(() => {
      this.loading = false;
      this.refreshingFulltimers = false;
    });

    if (resp.body && resp.body.results && resp.body.results[0]) {
      const results = resp.body.results[0];

      setTimeout(() => {
        this.nbHits = results.nbHits;
        this.nbPages = results.nbPages;
        this.page = results.page;
        this.noFulltimerList = (results.page == 0 && results.nbHits == 0);
      });
    }

    // either need fulltimers in result or query in search box

    // TF condition
    setTimeout(() => {

      this.showSearchBox = (
        !this.noFulltimerList ||
        (
          this.instantSearch &&
          this.instantSearch.instantSearchInstance &&
          this.instantSearch.instantSearchInstance.helper.state.query &&
          this.instantSearch.instantSearchInstance.helper.state.query.length > 0
        )
      );

      if (this.changeDetector !== null &&
        this.changeDetector !== undefined &&
        !(this.changeDetector as ViewRef).destroyed) {
        this.changeDetector.detectChanges();
      }

      if (this.eleInfinite) {
        this.eleInfinite.complete();
      }
    });
  }

  /**
   * Handles Caught Errors from All Authorized Requests Made to Server
   * @returns {Observable}
   */
  public _handleError(error: any) {

    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';

    // Handle No Internet Connection Error
    if (error.status == 0 || !navigator.onLine) {
      return this.eventService.internetOffline$.next({});
    }

    // Handle internal server error - 500 or 400
    if (error.status === 500) {
      console.error(error);
      return this.eventService.error500$.next({});
    }

    if (error.status === 404) {
      return this.eventService.error404$.next({});
    }

    alert('Error: ' + errMsg);
  }

  onRender(event) {
    console.log(event);
  }

  /**
   * set loader on scroll to bottom if have more data
   * @param e
   */
  doInfinite(e, state = null, showMoreHandler = null) {

    console.log(state, showMoreHandler);

    //showMoreHandler(e);

    // if already loading

    /*if (this.loading) {
      e.target.complete();
      return false;
    }*/

    setTimeout(_ => {
      this.loading = true;
    });

    this.eleInfinite = event.target;

    return true;
  }

  /**
   * promise resolve response
   * @param resp
   */
  resolveResponse(resp) {
    return {
      statusCode: resp.status,
      body: resp.body,
      headers: resp.headers
    };
  }

  /**
   * createSSRSearchClient refactor
   * @param makeStateKey
   * @param HttpHeaders
   * @param response
   */
  instantSearchConfigRefactor(makeStateKey, HttpHeaders, response) {
    // Note: host field is internal-only (http://meilisearch:7700), do not use for direct connections
    // Only use backend proxy endpoint via AuthHttpService
    return {
      indexName: environment.meilisearchFulltimerIndex,
      searchClient: this.createSSRSearchClient({
        makeStateKey,
        HttpHeaders,
        transferState: this.transferState
      })
    };
  }

  /**
   * Loads the create page
   */
  async createModal($event, fulltimer: Fulltimer = new Fulltimer()) {
    $event.preventDefault();
    $event.stopPropagation();

    window.history.pushState({ navigationId: window.history.state?.navigationId }, null, window.location.pathname);

    const modal = await this.modalCtrl.create({
      component: FulltimerFormPage,
      componentProps: {
        model: fulltimer,
        request_uuid: this.request_uuid
      },
      cssClass: "popup-modal"
    });
    modal.onDidDismiss().then(e => {

      if (!e.data || e.data.from != 'native-back-btn') {
        window['history-back-from'] = 'onDidDismiss';
        window.history.back();
      }

      if (e.data && e.data.refresh) {

        if(this.request_uuid) {
          setTimeout(() => {
            this.modalCtrl.dismiss({ refresh: true });
          }, 500);
        }

        this.refreshingFulltimers = true;

        //refresh listing

        setTimeout(() => {
          this.refreshFulltimers();
        }, 2000);//give time to backend to sync with meilisearch
      }
    });
    return await modal.present();
  }

  /**
   * Refresh fulltimer list
   */
  async refreshFulltimers() {

    if (!this.instantSearch) {
      return null;
    }

    this.nbPages = 0;

    this.loading = true;
    this.refreshingFulltimers = true;

    this.instantSearch.instantSearchInstance.helper.clearCache().setPage(0).setQuery('').search();
  }

  logScrolling(e) {
    if(e.target) {
      this.borderLimit = e.target.scrollTop > 20;
    } else {
      this.borderLimit = (e.detail.scrollTop > 20);
    }
  }

  onFulltimerClicked(hit) {
    //[routerLink]="'/fulltimer/' + hit.objectID"
    if(!this.request_uuid) {
      this.navCtrl.navigateForward('/fulltimer/' + hit.objectID);
    } else {
      this.modalCtrl.dismiss({
        fulltimer_uuid: hit.objectID
      });
    }
  }
}
