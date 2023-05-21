import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
//services
import { EventService } from 'src/app/providers/event.service';
import { CandidateService } from 'src/app/providers/logged-in/candidate.service';


@Component({
  selector: 'app-candidate-tags',
  templateUrl: './candidate-tags.page.html',
  styleUrls: ['./candidate-tags.page.scss'],
})
export class CandidateTagsPage implements OnInit {

  public borderLimit;
  public loading: boolean = false;
  public candidate;
  public candidate_id;

  constructor(
    public modalCtrl: ModalController,
    public activatedRoute: ActivatedRoute,
    public eventService: EventService,
    public candidateService: CandidateService
  ) {
  }

  ngOnInit() {

    if (!this.candidate_id)
      this.candidate_id = this.activatedRoute.snapshot.paramMap.get('candidate_id');

    const state = window.history.state;

    if (state && state.candidate) {
      this.candidate = state.candidate;
    }

    if (!this.candidate) {
      this.loadData();
    }

    this.eventService.reloadCandiate$.subscribe((res) => {
      this.loadData();
    });
  }
 

  /**
   * load candidate notes without pagination
   */
  loadData() {
    this.loading = true;

    this.candidateService.detail(this.candidate_id).subscribe(response => {

      this.loading = false;

      this.candidate = response;
       
    }, () => {
      this.loading = false;
    });
  }

  logScrolling(e) {
    this.borderLimit = (e.detail.scrollTop > 20);
  }

  /**
   * Make date readable by Safari
   * @param date
   */
  toDate(date) {
    if (!date)
      return null;

    if (date) {
      return new Date(date.replace(/-/g, '/'));
    }
  }
}