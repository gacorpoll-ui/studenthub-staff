import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
//models
import { Candidate } from 'src/app/models/candidate';
import { RequestInterview } from 'src/app/models/request-interview';
//services
import { CompanyRequestService } from 'src/app/providers/logged-in/company-request.service';


@Component({
  selector: 'app-request-interview-list',
  templateUrl: './request-interview-list.page.html',
  styleUrls: ['./request-interview-list.page.scss'],
})
export class RequestInterviewListPage implements OnInit {

  public requestInterviews: RequestInterview[] = [];

  public loading: boolean = false; 

  public pageCount = 0;

  public currentPage: any = 1;

  public totalCount = 0;

  public company;
  
  public borderLimit = false;

  constructor(
    public navCtrl: NavController,
    public requestService: CompanyRequestService
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.loadData();
  }

  loadData() {

    this.loading = true;

    this.requestService.listInterviewRequests(1).subscribe(response => {
      this.loading = false;

      this.requestInterviews = response.body; 

      this.totalCount = parseInt(response.headers.get('X-Pagination-Total-Count'));
      this.pageCount = parseInt(response.headers.get('X-Pagination-Page-Count'));
      this.currentPage = parseInt(response.headers.get('X-Pagination-Current-Page'));

    }, () => {
      this.loading = false;
    });
  }

  /**
   * load more on scroll to bottom
   * @param event
   */
  doInfinite(event) {
 
    this.loading = true;

    this.currentPage++;

    this.requestService.listInterviewRequests(this.currentPage).subscribe(response => {

      this.loading = false;

      this.totalCount = parseInt(response.headers.get('X-Pagination-Total-Count'));
      this.pageCount = parseInt(response.headers.get('X-Pagination-Page-Count'));
      this.currentPage = parseInt(response.headers.get('X-Pagination-Current-Page'));

      this.requestInterviews = this.requestInterviews.concat(response.body);
    },
      () => { },
      () => { event.target.complete(); }
    );
  }

  /**
   * On candidate selected from list
   */
  candidateSelected(candidate: Candidate) {
    this.navCtrl.navigateForward('candidate-view/' + candidate.candidate_id, {
      state: {
        model: candidate
      }
    });
  }

  logScrolling(e) {
    this.borderLimit = (e.detail.scrollTop > 20);
  }
}
