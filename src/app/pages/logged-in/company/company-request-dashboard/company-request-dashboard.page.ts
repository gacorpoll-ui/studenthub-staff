import { Component, OnInit, ViewChild } from '@angular/core';
//models
import { Request } from 'src/app/models/request';
//services
import { CompanyRequestService } from 'src/app/providers/logged-in/company-request.service';
import {IonContent, NavController} from "@ionic/angular";
import { EventService } from 'src/app/providers/event.service';


@Component({
  selector: 'app-company-request-dashboard',
  templateUrl: './company-request-dashboard.page.html',
  styleUrls: ['./company-request-dashboard.page.scss'],
})
export class CompanyRequestDashboardPage implements OnInit {

  @ViewChild(IonContent, { static: true }) content: IonContent;

  public loading: boolean = false;

  public borderLimit = false;

  public activeRequests: Request[] = [];

  public scrollPosition = 0;
  public partTimeRequests: Request[] = [];
  public fullTimeRequests: Request[] = [];

  public pageCount = 0;
  public currentPage = 1;

  public partPageCount = 0;
  public partCurrentPage = 1;

  public fullPageCount = 0;
  public fullCurrentPage = 1;

  public section = 'part';

  constructor(
    public requestService: CompanyRequestService,
    public eventService: EventService,
    public navCtrl: NavController
  ) { }

  ngOnInit() {
    this.loadAllRequest();
    this.eventService.companyRequestUpdate$.subscribe(() => {
      this.loadAllRequest();
    });
  }

  ionViewWillEnter() {
    this.content.scrollToPoint(0, this.scrollPosition);
  }

  ionViewWillLeave() {
    this.content.getScrollElement().then(ele => {
      this.scrollPosition = ele.scrollTop;
    });
  }

  loadAllRequest() {
    this.loadPartTimeRequests();
    this.loadFullTimeRequests();
  }

  /**
   * load part time request
   */
  loadPartTimeRequests() {
    this.requestService.listActiveWithPages(1, '&position_type=2').subscribe(response => {
      this.partTimeRequests = response.body;
      this.partPageCount = parseInt(response.headers.get('X-Pagination-Page-Count'));
      this.partCurrentPage = parseInt(response.headers.get('X-Pagination-Current-Page'));
      this.loading = false;
      this.segmentChange();
    });
  }

  /**
   * load Full time request
   */
  loadFullTimeRequests() {
    this.requestService.listActiveWithPages(1, '&position_type=1').subscribe(response => {
      this.fullPageCount = parseInt(response.headers.get('X-Pagination-Page-Count'));
      this.fullCurrentPage = parseInt(response.headers.get('X-Pagination-Current-Page'));
      this.fullTimeRequests = response.body;
      this.loading = false;
      this.segmentChange();
    });
  }

  logScrolling(e) {
    this.borderLimit = (e.detail.scrollTop > 20);
  }

  /**
   * open request detail page
   * @param request
   */
  requestDetail(request) {
    this.navCtrl.navigateForward('/request-view/' + request.request_uuid, {
      state : {
        from: 'company-request-dashboard'
      }
    });
  }

  urlParams() {
    return (this.section == 'full')  ? '&position_type=1' : '&position_type=2';
  }

  segmentChange($event = null) {
    if (this.section == 'full') {
      this.currentPage = this.fullCurrentPage;
      this.pageCount = this.fullPageCount;
    } else {
      this.currentPage = this.partCurrentPage;
      this.pageCount = this.partPageCount;
    }
  }

  /**
   * load more on scroll to bottom
   * @param event
   */
  doInfinite(event) {

    this.loading = true;

    this.currentPage++;
    this.requestService.listActiveWithPages(this.currentPage, this.urlParams()).subscribe(response => {

        if (this.section == 'full') {
          this.fullTimeRequests = this.fullTimeRequests.concat(response.body);
          this.fullPageCount = parseInt(response.headers.get('X-Pagination-Page-Count'));
          this.fullCurrentPage = parseInt(response.headers.get('X-Pagination-Current-Page'));
        } else  {
          this.partTimeRequests = this.partTimeRequests.concat(response.body);
          this.partPageCount = parseInt(response.headers.get('X-Pagination-Page-Count'));
          this.partCurrentPage = parseInt(response.headers.get('X-Pagination-Current-Page'));
        }
        this.segmentChange();
      },
      error => { },
      () => {
        this.loading = false;
        event.target.complete();
      }
    );
  }
}
