import {Component, ViewChild, OnInit, ChangeDetectorRef, ViewRef} from '@angular/core';
import { NavController, Platform, MenuController, PopoverController, IonContent, AlertController } from '@ionic/angular';
// import { Storage } from '@ionic/storage';
import { environment } from '../../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { TransferState, makeStateKey } from '@angular/platform-browser';
// service
import { AuthService } from '../../../../providers/auth.service';
import { CandidateService } from '../../../../providers/logged-in/candidate.service';
import { TranslateLabelService } from '../../../../providers/translate-label.service';
import { EventService } from '../../../../providers/event.service';
import { MeilisearchService } from 'src/app/providers/logged-in/meilisearch.service';
import { AuthHttpService } from 'src/app/providers/logged-in/authhttp.service';
import { CandidateIdCardService } from 'src/app/providers/logged-in/candidate.id.card.service';
//pages
import { CandidateMergeSelectPage } from '../candidate-merge-select/candidate-merge-select.page';
import { AnalyticsService } from 'src/app/providers/analytics.service';



@Component({
  selector: 'app-candidate-search',
  templateUrl: './candidate-search.page.html',
  styleUrls: ['./candidate-search.page.scss'],
})
export class CandidateSearchPage implements OnInit {

  @ViewChild(IonContent, { static: true }) content: IonContent;

  @ViewChild('instantSearch', { static: false }) public instantSearch;

  public lastQuery;

  public downloading;

  public merging;

  public eleInfinite;

  public loading: boolean;

  public isMobile: boolean;

  public instantSearchConfig;

  public nbHits = null;
  public nbPages;
  public page;
  public searchParameters = {};
  public refreshingCandidates = false;
  public dirty = false;
  public noCandidateList = false;
  public showSearchForm = false;
  public showSearchBox = true;
  public haveLocationFilter = false;
  public lastRefinements;
  public lastQueryId;
  public scrollPosition = 0;
  public borderLimit = false;
  public showFilter = false;

  constructor(
    public transferState: TransferState,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public platform: Platform,
    public auth: AuthService,
    public meilisearchService: MeilisearchService,
    private _authhttp: AuthHttpService,
    public candidateService: CandidateService,
    public candidateIdCardService: CandidateIdCardService,
    public changeDetector: ChangeDetectorRef,
    public eventService: EventService,
    public translateService: TranslateLabelService,
    public analyticService: AnalyticsService,
    public popoverCtrl: PopoverController,
    public _menuCtrl: MenuController
  ) {
  }

  ngOnInit() {
    this.analyticService.page('Candidate Search Page');

    this.platform.ready().then(() => {
      if (this.platform.is('mobile')) {
        this.isMobile = true;
      }
    });
  }

  ionViewWillEnter() {

    if (
      this.candidateService.meilisearchConfig &&
      this.candidateService.meilisearchConfig.searchParameters &&
      this.instantSearch &&
      this.instantSearch.instantSearchInstance.helper &&
      (
        JSON.stringify(this.instantSearch.instantSearchInstance.helper.state.numericRefinements) != JSON.stringify(this.candidateService.meilisearchConfig.searchParameters.numericRefinements) ||
        JSON.stringify(this.instantSearch.instantSearchInstance.helper.state.facetFilters) != JSON.stringify(this.candidateService.meilisearchConfig.searchParameters.facetFilters) ||
        JSON.stringify(this.instantSearch.instantSearchInstance.helper.state.disjunctiveFacetsRefinements) != JSON.stringify(this.candidateService.meilisearchConfig.searchParameters.disjunctiveFacetsRefinements)
      )
    ) {
      this.scrollPosition = 0;
      this.dirty = true;
      // this.refreshingCandidates = true;
    } else {
      setTimeout(() => {
        this.refreshingCandidates = false;
      });
    }

    this.content.scrollToPoint(0, this.scrollPosition);

    if (this.instantSearchConfig && this.dirty) {
      this.initializeSearchParameters();
    }
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
   * Merge to account
   */
  async merge(e) {

    if (this.candidateService.candidates.length != 2) {
      const prompt = await this.alertCtrl.create({
        message: 'Please select any 2 candidates',
        buttons: ['Okay']
      });
      prompt.present();

      return false;
    }

    const popover = await this.popoverCtrl.create({
      component: CandidateMergeSelectPage,
      event: e,
      cssClass: 'candidate-merge-select'
    });

    popover.onDidDismiss().then(e => {

      if(!e.data || !e.data.candidate) {
        return false;
      }

      let source;

      if(e.data.candidate.candidate_id == this.candidateService.candidates[1].candidate_id) {
        source = this.candidateService.candidates[0].candidate_id;
      } else {
        source = this.candidateService.candidates[1].candidate_id;
      }

      this.merging = true;

      this.candidateService.merge(source, e.data.candidate.candidate_id).subscribe(response => {
      }, (err) => {
      }, () => {
        this.merging = false;

        this.deselect();
        
        this.refreshCandidates();
      });
    });
    popover.present();
  }


  /**
   * Generate id cards
   */
  async generate() {

    if (this.candidateIdCardService.candidates.length == 0) {
      const prompt = await this.alertCtrl.create({
        message: 'Please select candidate(s)',
        buttons: ['Ok']
      });
      prompt.present();

      return false;
    }

    this.downloading = true;

    this.candidateIdCardService.generate(this.candidateIdCardService.candidates).subscribe(async response => {
      if (response.operation == "success") {
        this.navCtrl.navigateForward('/candidate-id-request/' + response.cir_uuid);
      } else {
        const alert = await this.alertCtrl.create({ 
          message: response.message,
          buttons: ['Okay']
        });
        alert.present();
      }
    }, (err) => {
    }, () => {
      this.downloading = false;
      this.deselect();
    });
  }

  deselect() {
    this.candidateService.candidates = [];
    this.candidateIdCardService.candidates = [];

    this.eventService.clearCandidateSelection$.next({});
  }

  /**
   * initialize search parameters from state
   */
  initializeSearchParameters() {

    if (this.candidateService.meilisearchConfig) {
      this.searchParameters = Object.assign({}, this.candidateService.meilisearchConfig.searchParameters);
    }
  }

  /**
   * Open filter for mobile users
   */
  openFilter() {

    this.showFilter = true;
    
    //this.updateMeilisearchState();
    //
    // this.router.navigate(['job-with-filter']);
  }

  dismiss() {
    this.showFilter = false;
  }

  /**
   * update meilisearch state
   */
  async updateMeilisearchState() {
    if(!this.candidateService.meilisearchConfig) {
      this.candidateService.meilisearchConfig = {};
    }

    this.candidateService.meilisearchConfig.instantSearchConfig = Object.assign({}, this.instantSearchConfig);
    this.candidateService.meilisearchConfig.searchParameters = this.instantSearch ? Object.assign({}, this.instantSearch.instantSearchInstance.helper.state) : Object.assign({}, this.searchParameters);
    this.candidateService.meilisearchConfig.nbHits = this.nbHits;
    this.candidateService.meilisearchConfig.nbPages = this.nbPages;
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
        if (transferState.hasKey(transferStateKey) && !this.refreshingCandidates) {
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

    if (this.eleInfinite) {
      this.eleInfinite.complete();
    }

    setTimeout(() => {
      this.loading = false;
      this.refreshingCandidates = false;
    });

    if (resp.body && resp.body.results && resp.body.results[0]) {
      const results = resp.body.results[0];

      setTimeout(() => {
        this.nbHits = results.nbHits;
        this.nbPages = results.nbPages;
        this.page = results.page;
        this.noCandidateList = (results.page == 0 && results.nbHits == 0);
      });
    }

    // either need candidates in result or query in search box

    // TF condition
    setTimeout(() => {

      this.showSearchBox = (
        !this.noCandidateList ||
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

  /**
   * set loader on scroll to bottom if have more data
   * @param e
   */
  doInfinite(e) {

    // if already loading

    if (this.loading) {
      e.target.complete();
      return false;
    }

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
      indexName: environment.meilisearchCandidateIndex,
      searchClient: this.createSSRSearchClient({
        makeStateKey,
        HttpHeaders,
        transferState: this.transferState
      })
    };
  }

  /**
   * When its selected
   */
  rowSelected(model) {
    this.navCtrl.navigateForward('candidate-view/' + model.candidate_id, {
      state: {
        model
      }
    });
  }


  /**
   * Refresh list
   */
  async refreshCandidates() {

    if (!this.instantSearch) {
      return null;
    }

    this.nbPages = 0;

    //this.loading = true;
    this.refreshingCandidates = true;

    this.instantSearch.instantSearchInstance.helper.clearCache().setPage(0).setQuery('').search();
  }

  logScrolling(e) {
    if(e.target) {
      this.borderLimit = e.target.scrollTop > 20;
    } else {
      this.borderLimit = (e.detail.scrollTop > 20);
    }
  }
  
  allCandidate() {
    this.navCtrl.navigateForward('/candidate-list');
  }
}
