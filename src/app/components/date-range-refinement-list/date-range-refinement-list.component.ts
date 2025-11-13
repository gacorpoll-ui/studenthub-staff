import { Component, Input, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import {CalendarModal, CalendarModalOptions, CalendarResult} from 'ion2-calendar';
import { ModalController } from '@ionic/angular';
import {Options} from "ng5-slider";
import { CandidateSearchService } from 'src/app/services/candidate-search.service';
import { Subscription } from 'rxjs';

const noop = () => {};

@Component({
  selector: 'date-range-refinement-list',
  templateUrl: './date-range-refinement-list.component.html',
  styleUrls: ['./date-range-refinement-list.component.scss'],
})
export class DateRangeRefinementListComponent implements OnInit, OnDestroy {

  @Input() title;
  @Input() subTitle;

  @Input() pips;
  @Input() tooltips;
  @Input() attribute;
  @Input() min;
  @Input() max;
  @Input() precision;
  @Input() currencies;

  @Output() change: EventEmitter<any> = new EventEmitter();

  state;
  slider;
  updateState;

  open = false;
  dirty = false;

  value;

  average;
  lowerDate;
  upperDate;

  options: Options = {
    floor: 0,
    ceil: 1,
  }

  private subscriptions: Subscription[] = [];

  constructor(
      public modalCtrl: ModalController,
      public searchService: CandidateSearchService
  ) {
      // render options
      this.pips = true;
      this.tooltips = true;
      this.precision = 2;
      this.state = {
          range: {min: 0, max: 1},
          refine: noop,
          start: [0, 1],
      };
  }

  ngOnInit() {
      // Initialize component
  }

  ngOnDestroy() {
      this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  handleChange = () => {
      if (this.value && this.attribute) {
          // Set date range filter
          const lowerTimestamp = Math.floor(this.value.lower);
          const upperTimestamp = Math.floor(this.value.upper);
          this.searchService.setFilter(this.attribute, [`>= ${lowerTimestamp}`, `<= ${upperTimestamp}`]);
          this.searchService.search();
      }
  };

  formatTooltip = (value: number) => {
      return value.toFixed(this.precision || 2);
  };

  /**
   * on range change by user
   * @param ev
   */
  onChange(ev) {
      this.setLabel();
      this.handleChange();
  }


  /**
   * @return {?}
   */
  get step() {
      // compute step from the precision value
      /** @type {?} */
      const precision = this.precision || 2;
      return 1 / Math.pow(10, precision);
  }

  /**
   * Set value range label
   */
  setLabel() {
    this.average = (Math.floor(this.min) + Math.floor(this.max)) / 2;
  }

  /**
   * Clear range selection
   */
  handleClearAllClick(event) {
      this.value = { lower: this.min, upper: this.max };
      this.dirty = false;
      this.searchService.removeFilter(this.attribute);
      this.searchService.search();
      event.preventDefault();
      event.stopPropagation();
  }

  /**
   * Toggle filter open/close
   */
  toggleOpen() {
      this.open = !this.open;
  }

  /**
   * open calender to select range
   */
  async openCalendarPopup(string) {

    const options: CalendarModalOptions = {
      canBackwardsSelected: true,
      pickMode: 'single',
      title: '',
      //defaultScrollTo: new Date(this.value.upper),
      defaultDateRange: {
        from: new Date(this.value.lower),
        to:  new Date(this.value.upper)
      }
    };

    const myCalendar = await this.modalCtrl.create({
      component: CalendarModal,
      cssClass: 'modal-calender',
      componentProps: { options }
    });

    myCalendar.present();

    const eventCloseData: any = await myCalendar.onDidDismiss();
    const date = eventCloseData.data;

    if (date) {

      if (string =='l') {
        this.lowerDate = date.string;
        this.value.lower = date.unix;
      } else if (string =='h') {
        this.upperDate = date.string;
        this.value.upper = date.unix;
      }
      //this.value.upper = date.unix + (60*60*24);

      // this.date = date.from.string + ' - ' + date.to.string;

      this.handleChange();
    }
  }

  refineDates() {
    this.value.lower = Math.floor(new Date(this.lowerDate).getTime() / 1000)
    this.value.upper = Math.floor(new Date(this.upperDate).getTime() / 1000);

    this.handleChange();
    this.change.emit();
  }
}
