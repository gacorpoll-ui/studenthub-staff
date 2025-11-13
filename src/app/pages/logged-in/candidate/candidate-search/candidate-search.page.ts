import {Component, ViewChild, OnInit, ChangeDetectorRef, ViewRef, OnDestroy} from '@angular/core';
import { NavController, Platform, MenuController, PopoverController, IonContent, AlertController } from '@ionic/angular';
// import { Storage } from '@ionic/storage';
import { environment } from '../../../../../environments/environment';
// service
import { AuthService } from '../../../../providers/auth.service';
import { CandidateService } from '../../../../providers/logged-in/candidate.service';
import { TranslateLabelService } from '../../../../providers/translate-label.service';
import { EventService } from '../../../../providers/event.service';
import { CandidateIdCardService } from 'src/app/providers/logged-in/candidate.id.card.service';
import { CandidateSearchService } from 'src/app/services/candidate-search.service';
//pages
import { CandidateMergeSelectPage } from '../candidate-merge-select/candidate-merge-select.page';
import { AnalyticsService } from 'src/app/providers/analytics.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';



@Component({
  selector: 'app-candidate-search',
  templateUrl: './candidate-search.page.html',
  styleUrls: ['./candidate-search.page.scss'],
})
export class CandidateSearchPage implements OnInit, OnDestroy {

  @ViewChild(IonContent, { static: true }) content: IonContent;

  public downloading;
  public merging;
  public eleInfinite;
  public loading: boolean = false;
  public isMobile: boolean;
  public nbHits: number | null = null;
  public nbPages: number = 0;
  public page: number = 0;
  public refreshingCandidates = false;
  public noCandidateList = false;
  public showSearchBox = true;
  public scrollPosition = 0;
  public borderLimit = false;
  public showFilter = false;
  public candidates: any[] = [];
  public searchQuery: string = '';

  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public platform: Platform,
    public auth: AuthService,
    public candidateService: CandidateService,
    public candidateIdCardService: CandidateIdCardService,
    public changeDetector: ChangeDetectorRef,
    public eventService: EventService,
    public translateService: TranslateLabelService,
    public analyticService: AnalyticsService,
    public popoverCtrl: PopoverController,
    public _menuCtrl: MenuController,
    public searchService: CandidateSearchService
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchService.setQuery(query);
      this.performSearch();
    });
  }

  ngOnInit() {
    this.analyticService.page('Candidate Search Page');

    this.platform.ready().then(() => {
      if (this.platform.is('mobile')) {
        this.isMobile = true;
      }
    });

    // Subscribe to search service observables
    this.subscriptions.push(
      this.searchService.results$.subscribe(results => {
        if (results) {
          this.candidates = results.hits;
          this.nbHits = results.pagination.total;
          this.nbPages = results.pagination.totalPages;
          this.page = results.pagination.page;
          this.noCandidateList = results.pagination.total === 0;
          this.showSearchBox = !this.noCandidateList || (this.searchQuery && this.searchQuery.length > 0);
        }
      })
    );

    this.subscriptions.push(
      this.searchService.loading$.subscribe(loading => {
        this.loading = loading;
        this.refreshingCandidates = loading;
      })
    );

    // Perform initial search
    this.performSearch();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ionViewWillEnter() {
    this.content.scrollToPoint(0, this.scrollPosition);
  }

  ionViewDidEnter() {
    // Refresh search if needed
    this.performSearch();
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
   * Open filter for mobile users
   */
  openFilter() {
    this.showFilter = true;
  }

  dismiss() {
    this.showFilter = false;
  }

  /**
   * Handle search input with debouncing
   */
  onSearch(event) {
    this.searchQuery = event.target.value;
    this.searchSubject.next(event.target.value);
  }

  /**
   * Perform search using CandidateSearchService
   */
  async performSearch() {
    try {
      await this.searchService.search();
    } catch (error) {
      this._handleError(error);
    }
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
   * Load more results (pagination)
   */
  loadMore() {
    if (this.loading || this.page >= this.nbPages - 1) {
      return;
    }
    this.searchService.setPage(this.page + 1);
    this.performSearch();
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
    this.searchService.setPage(0);
    this.searchService.setQuery('');
    this.searchQuery = '';
    await this.performSearch();
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
