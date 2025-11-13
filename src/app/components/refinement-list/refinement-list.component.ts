import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
//services
import { TranslateLabelService } from 'src/app/providers/translate-label.service';
import { EventService } from 'src/app/providers/event.service';
import { CandidateSearchService } from 'src/app/services/candidate-search.service';
import { Subscription } from 'rxjs';

const noop = () => {};

@Component({
    selector: 'refinement-list',
    templateUrl: './refinement-list.component.html',
    styleUrls: ['./refinement-list.component.scss'],
})
export class RefinementListComponent implements OnInit, OnDestroy {

    @Input() label;
    @Input() searchable;
    @Input() searchPlaceholder;
    @Input() showMoreLabel;
    @Input() showLessLabel;
    @Input() showMoreLimit;
    @Input() operator;
    @Input() attribute;
    @Input() transformItems;

    @Output() change: EventEmitter<any> = new EventEmitter();

    public open: boolean = false;

    public state: any = {
        canRefine: false,
        canToggleShowMore: true,
        createURL: noop,
        isShowingMore: false,
        items: [],
        refine: noop,
        toggleShowMore: noop,
        searchForItems: noop,
        isFormSearch: false
    };

    public limit: number = 5;
    public sortBy: any;
    public autoHideContainer: boolean = false;

    private subscriptions: Subscription[] = [];

    constructor(
        public eventService: EventService,
        public translateService: TranslateLabelService,
        public searchService: CandidateSearchService
    ) {
        this.eventService.filterCollapse$.subscribe(() => {
            this.open = false;
        });
    }

    public ngOnInit() {
        // Subscribe to facet counts for this attribute
        this.subscriptions.push(
            this.searchService.results$.subscribe(results => {
                if (results && results.facets && this.attribute) {
                    const facetCounts = results.facets[this.attribute] || {};
                    this.state.items = Object.keys(facetCounts).map(value => ({
                        value: value,
                        label: value,
                        count: facetCounts[value],
                        isRefined: this.isValueSelected(value)
                    }));
                    this.state.canRefine = this.state.items.length > 0;
                }
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    /**
     * Check if a value is selected in current filters
     */
    private isValueSelected(value: string): boolean {
        const state = this.searchService.getState();
        const values = state.filters[this.attribute] || [];
        return values.includes(value);
    }

    /**
     * @return {?}
     */
    isHidden() {
        return this.state.canRefine == false && this.autoHideContainer;
    }

    /**
     * @return {?}
     * */
    get items() {
        return typeof this.transformItems === "function"
            ? this.transformItems(this.state.items)
            : this.state.items;
    }

    /**
     * @param {?} event
     * @param {?} item
     * @return {?}
     */
    refine(event, item) {
        event.preventDefault();
        event.stopPropagation();

        if (this.state.canRefine) {
            // Toggle filter value
            this.searchService.toggleFilter(this.attribute, item.value);
            this.searchService.search();
            this.change.emit();
        }
    }

    /**
     * Can show `show more` button or not
     * @return boolean
     */
    canShowMore() {
        return this.state.canToggleShowMore
            && typeof this.state.toggleShowMore != 'undefined';
    }

    /**
     * Is current filter value selected
     */
    isRefined() {
        for (let i of this.state.items) {
            if (i && i.isRefined)
                return true;
        }
    }

    /**
     * Toggle filter open/close
     */
    toggleOpen() {
        this.open = !this.open;
    }

    /**
     * CSS class helper (stub for template compatibility)
     */
    cx(classes?: string): string {
        return classes || '';
    }

    /**
     * Get item CSS class (stub for template compatibility)
     */
    getItemClass(item: any): string {
        return item && item.isRefined ? 'is-refined' : '';
    }
}
