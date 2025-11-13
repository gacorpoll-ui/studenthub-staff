import { Component, Input, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Options } from 'ng5-slider';
import { CandidateSearchService } from 'src/app/services/candidate-search.service';
import { Subscription } from 'rxjs';

const noop = () => {};

interface RangeRenderState {
    range: {min: number, max: number};
    refine: (values: [number, number]) => void;
    canRefine: boolean | null;
    sendEvent: () => void;
    format: (value: number) => string;
    start: [number, number];
}

@Component({
    selector: 'range-refinement-list',
    templateUrl: 'range-refinement-list.html',
    styleUrls: ['./range-refinement-list.scss']
})
export class RangeRefinementComponent implements OnInit, OnDestroy {

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


    public state: RangeRenderState = {
        range: {min: 0, max: 1},
        refine: noop,
        canRefine: null,
        sendEvent: noop,
        format: (v: number) => v.toString(),
        start: [0, 1],
    };

    slider;

    open = false;
    dirty = false;

    value;

    average = 0;

    options: Options = {
        floor: 0,
        ceil: 1,
    }

    private subscriptions: Subscription[] = [];

    constructor(
        public searchService: CandidateSearchService
    ) {
        // render options
        this.pips = true;
        this.tooltips = true;
        this.precision = 2;
        this.min = this.min || 0;
        this.max = this.max || 100;
        this.value = { lower: this.min, upper: this.max };
        this.options.floor = this.min;
        this.options.ceil = this.max;
    }

    ngOnInit() {
        this.setLabel();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    handleChange = () => {
        if (this.value && this.attribute) {
            this.searchService.setFilter(this.attribute, [`>= ${this.value.lower}`, `<= ${this.value.upper}`]);
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
}
