import {Component, Input, OnInit} from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-request-filter',
  templateUrl: './request-filter.component.html',
  styleUrls: ['./request-filter.component.scss'],
})
export class RequestFilterComponent implements OnInit {

  @Input() tab = null;
  public filters = {
    requestStatus: null,
    storyStatus: null,
    position_type: null,
    startDate: null,
    endDate: null,
  };

  constructor(
    public modalCtrl: ModalController
  ) {
  }

  ngOnInit() {
  }

  filterByStatus($event, requestStatus) {
    this.filters.requestStatus = requestStatus;
  }

  filterByStoryStatus($event, requestStatus) {
    this.filters.storyStatus = requestStatus;
  }

  filterByType($event, positionType) {
    this.filters.position_type = positionType;
  }

  filter() {
    this.modalCtrl.dismiss(this.filters);
  }

  reset() {
    this.filters = {
      storyStatus: null,
      requestStatus: null,
      position_type: null,
      startDate: null,
      endDate: null,
    };
  }
}
