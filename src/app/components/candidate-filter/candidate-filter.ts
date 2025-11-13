import { Component, OnInit, OnDestroy } from '@angular/core';
// services
import { TranslateLabelService } from '../../providers/translate-label.service';
import { CandidateSearchService } from '../../services/candidate-search.service';
import { Subscription } from 'rxjs';


/**
 * Display candidate filter
 */
@Component({
    selector: 'candidate-filter',
    templateUrl: 'candidate-filter.html',
    styleUrls: ['./candidate-filter.scss']
})
export class CandidateFilterComponent implements OnInit, OnDestroy {

    public current_language;

    public arrRefined: Record<string, boolean> = {};
    public facetCounts: Record<string, Record<string, number>> = {};

    private subscriptions: Subscription[] = [];

    genderTransformItems = (items) => {

        return items.map(item => {
            if (item.name == '1' || item.label == '1') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('Male');
            }
            else if (item.name == '2' || item.label == '2') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('Female');
            }
            else if (item.name == '3' || item.label == '3') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('Other');
            }

            return item;
        }).filter(item => ['Male', 'Female', 'Other'].indexOf(item.label) > -1);
    }

    studyingTransformItems = (items) => {

        return items.map(item => {
            if (item.name == '0' || item.label == '0') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('Not Studying');
            }
            else if (item.name == '1' || item.label == '1') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('Studying');
            }

            return item;
        }).filter(item => ['Studying', 'Not Studying'].indexOf(item.label) > -1);
    }

  assignedTransformItems = (items) => {

        return items.map(item => {
            if (item.name == '0' || item.label == '0') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('Not Assigned');
            }
            else if (item.name == '1' || item.label == '1') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('Assigned');
            }

            return item;
        }).filter(item => ['Assigned', 'Not Assigned'].indexOf(item.label) > -1);
    }

    profileCompletedTransformItems = (items) => {

        return items.map(item => {
            if (item.label == 'true') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('Yes');
            }
            else if (item.label == 'false') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('No');
            }

            return item;
        });
    }

    kuwaitiMomTransformItems = (items) => {

        return items.map(item => {
            if (item.name == '1' || item.label == '1') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('Yes');
            }
            else if (item.name == '2' || item.label == '2') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('No');
            }

            return item;
        }).filter(item => ['Yes', 'No'].indexOf(item.label) > -1);
    }

    booleanTransformItems = (items) => {

        return items.map(item => {
            if (item.name == '1' || item.label == '1') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('Yes');
            }
            else if (item.name == '2' || item.label == '2') {
                item.label = item.highlighted = item.name = this.translateLabel.transform('No');
            }

            return item;
        });
    }

    constructor(
        public translateLabel: TranslateLabelService,
        public searchService: CandidateSearchService
    ) {
        //this.current_language = this.translateLabel.currentLang;
    }

    ngOnInit() {
        // Subscribe to search results to get facet counts
        this.subscriptions.push(
            this.searchService.results$.subscribe(results => {
                if (results && results.facets) {
                    this.facetCounts = results.facets;
                }
            })
        );

        // Subscribe to state changes to update arrRefined
        this.subscriptions.push(
            this.searchService.state$.subscribe(state => {
                this.arrRefined = {};
                Object.keys(state.filters).forEach(key => {
                    if (state.filters[key] && state.filters[key].length > 0) {
                        this.arrRefined[key] = true;
                    }
                });
                if (state.geo) {
                    this.arrRefined['_geo'] = true;
                }
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    /**
     * Get facet count for a specific attribute and value
     */
    getFacetCount(attribute: string, value: string): number {
        return this.searchService.getFacetCount(attribute, value);
    }

    /**
     * Check if a filter value is selected
     */
    isFilterSelected(attribute: string, value: string): boolean {
        const state = this.searchService.getState();
        const values = state.filters[attribute] || [];
        return values.includes(value);
    }

    /**
     * Toggle a filter value
     */
    toggleFilter(attribute: string, value: string): void {
        this.searchService.toggleFilter(attribute, value);
        this.searchService.search();
    }

    /**
     * sort refinement list to show selected filters on top in group
     */
    sortRefinementLists() {

        const parents = document.querySelectorAll('.filter-groups') as any as Array<HTMLElement>;

        // get all children element and convert into array
        // for newer browser you can use `Array.from` instead
        // of `[].slice.call()`

        parents.forEach(parent => {

            [].slice.call(parent.children)
                // sort them using custom sort function
                .sort(function (a, b) {

                    if (!a) {
                        return null;
                    }

                    let p = a.getAttribute('data-sort-order');

                    if (a.classList.contains('is-refined')) {
                        p -= 10; // just random number to show on top
                    }

                    let q = b.getAttribute('data-sort-order');

                    if (b.classList.contains('is-refined')) {
                        q -= 10; // just random number to show on top
                    }
                    return parseInt(p) - parseInt(q);

                    // iterate and append again in new sorted order
                }).forEach(function (ele) {
                    parent.appendChild(ele);
                });
        });
    }
}
