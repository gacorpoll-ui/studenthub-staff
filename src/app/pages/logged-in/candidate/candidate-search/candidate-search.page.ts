import { Component, OnInit } from '@angular/core';
import { NavController, Platform, MenuController, PopoverController, IonContent, AlertController } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
// service
import { AuthService } from '../../../../providers/auth.service';
import { CandidateService } from '../../../../providers/logged-in/candidate.service';
import { TranslateLabelService } from '../../../../providers/translate-label.service';
import { EventService } from '../../../../providers/event.service';
import { AlgoliaService } from 'src/app/providers/algolia.service';
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

  public downloading;
  public merging;
  public loading: boolean;
  public isMobile: boolean;
  public query = '';
  public showSearchBox = true;
  public haveLocationFilter = false;
  public scrollPosition = 0;
  public borderLimit = false;
  public showFilter = false;
  public refining = false;
  public instantSearchInstance: any;

  constructor(
    public httpClient: HttpClient,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public platform: Platform,
    public auth: AuthService,
    public algoliaService: AlgoliaService,
    public candidateService: CandidateService,
    public candidateIdCardService: CandidateIdCardService,
    public translateService: TranslateLabelService,
    public eventService: EventService,
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
    // Initialize instantsearch instance when entering the view
    this.initializeInstantSearch();
  }

  ionViewDidEnter() {
    // Additional setup if needed
  }

  ionViewWillLeave() {
    // Clean up instantsearch instance when leaving
    if (this.instantSearchInstance) {
      this.instantSearchInstance.dispose();
      this.instantSearchInstance = null;
    }
  }

  /**
   * Initialize instantsearch.js instance
   */
  initializeInstantSearch() {
    // Get Algolia credentials
    this.algoliaService.getKey().then(({ appId, securedApiKey }) => {
      // Create instantsearch instance
      this.instantSearchInstance = instantsearch({
        indexName: environment.algoliaCandidateIndex,
        searchClient: algoliasearch(appId, securedApiKey),
      });

      // Add search box widget
      this.instantSearchInstance.addWidgets([
        instantsearch.widgets.searchBox({
          container: '#searchbox',
          placeholder: 'Type to filter from these results',
          cssClasses: {
            input: 'searchbox-input',
            root: 'searchbox',
            submitIcon: 'searchbox-submit-icon',
            resetIcon: 'searchbox-reset-icon',
          },
        })
      ]);

      // Add hits widget
      this.instantSearchInstance.addWidgets([
        instantsearch.widgets.hits({
          container: '#hits',
          templates: {
            item: `
              <div class="hit">
                <h2>{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}</h2>
                <p>{{{_highlightResult.position.value}}}</p>
                <p>{{{_highlightResult.company.value}}}</p>
              </div>
            `
          }
        })
      ]);

      // Start the instance
      this.instantSearchInstance.start();
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
    if (this.instantSearchInstance) {
      this.instantSearchInstance.refresh();
    }
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