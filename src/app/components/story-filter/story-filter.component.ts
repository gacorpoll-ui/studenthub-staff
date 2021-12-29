import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-story-filter',
  templateUrl: './story-filter.component.html',
  styleUrls: ['./story-filter.component.scss'],
})
export class StoryFilterComponent implements OnInit {

  public filters = {
    status: null,
    startDate: null,
    endDate: null,
  };

  constructor(
    public modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  filterByStatus($event, status) {
    this.filters.status = status;
  }

  filter() {
    this.modalCtrl.dismiss(this.filters);
  }

  reset() {
    this.filters = {
      status: null,
      startDate: null,
      endDate: null,
    }
  }
}
