import { Component, OnInit } from '@angular/core';
import { NavController, Platform, MenuController, PopoverController, IonContent, ModalController } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
// service
import { AuthService } from '../../../../providers/auth.service';
import { FulltimerService } from '../../../../providers/logged-in/fulltimer.service';
import { TranslateLabelService } from '../../../../providers/translate-label.service';
import { EventService } from '../../../../providers/event.service';
import { AlgoliaService } from 'src/app/providers/algolia.service';
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

  public request_uuid;

  public refining: boolean = false;
  public showFilter: boolean = false;

  public loading: boolean;
  public isMobile: boolean;
  public nbHits = null;
  public nbPages;
  public page;
  public query = '';
  public showSearchBox = true;
  public haveLocationFilter = false;
  public scrollPosition = 0;
  public borderLimit = false;

  public instantSearchInstance: any;

  constructor(
    public httpClient: HttpClient,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public platform: Platform,
    public auth: AuthService,
    public algoliaService: AlgoliaService,
    public fulltimerService: FulltimerService,
    public translateService: TranslateLabelService,
    public eventService: EventService,
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
        indexName: environment.algoliaFulltimerIndex,
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
                <h2>{{#helpers.highlight}}{ "attribute": "fulltimer_name" }{{/helpers.highlight}}</h2>
                <p>{{{_highlightResult.fulltimer_phone.value}}}</p>
                <p>{{{_highlightResult.fulltimer_email.value}}}</p>
                <p>{{{_highlightResult.area.area_name_en.value}}}, {{{_highlightResult.country.country_name_en.value}}}</p>
              </div>
            `
          }
        })
      ]);

      // Add pagination widget
      this.instantSearchInstance.addWidgets([
        instantsearch.widgets.pagination({
          container: '#pagination',
          scrollTo: false,
          showFirstLast: false,
          cssClasses: {
            root: 'pagination-root',
            item: 'pagination-item',
            selectedItem: 'pagination-item-selected',
            disabledItem: 'pagination-item-disabled',
          },
          templates: {
            item: `
              <a href="#" class="{{#cssClasses.item}} {{^isSelected}} {{/isSelected}}{{#isSelected}} {{cssClasses.selectedItem}}{{/isSelected}} {{#isDisabled}} {{cssClasses.disabledItem}}{{/isDisabled}}">
                {{#isPreviousPage}}«{{/isPreviousPage}}
                {{#isNextPage}}»{{/isNextPage}}
                {{^isPreviousPage}}{{^isNextPage}}
                  {{#isRefined}}
                    <strong>{{data}}</strong>
                  {{/isRefined}}
                  {{^isRefined}}
                    {{data}}
                  {{/isRefined}}
                {{/isPreviousPage}}{{/isNextPage}}
              </a>
            `
          }
        })
      ]);

      // Start the instance
      this.instantSearchInstance.start();
    });
  }

  dismiss() {
    this.showFilter = !this.showFilter;
  }

  allFulltimers() {
    this.navCtrl.navigateForward('/fulltimer-list');
  }

  onResize() {
    this.showFilter = false;
  }

  /**
   * open filter page
   */
  openFilter() {
    this.showFilter = true;
  }

  /**
   * Check if object is empty
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
        }, 2000);//give time to backend to sync with algolia
      }
    });
    return await modal.present();
  }

  /**
   * Refresh fulltimer list
   */
  async refreshFulltimers() {
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