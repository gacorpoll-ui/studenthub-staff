import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AgePipe } from 'src/app/pipes/age.pipe';
import { CandidateSearchService } from 'src/app/services/candidate-search.service';
import { Subscription } from 'rxjs';

const noop = () => {};

@Component({
    selector: 'current-refinement',
    templateUrl: './current-refinement.component.html',
    styleUrls: ['./current-refinement.component.scss'],
    // encapsulation: ViewEncapsulation.None
})
export class CurrentRefinementComponent implements OnInit, OnDestroy {

    @Input() attribute;
    @Input() transformItems;

    public attributes;
    public clearsQuery;
    public state;

    private subscriptions: Subscription[] = [];

    constructor(
        public searchService: CandidateSearchService
    ) {
        this.clearsQuery = false;
        this.state = {
            attributes: {},
            clearAllClick: noop,
            clearAllURL: noop,
            createURL: noop,
            refine: noop,
            items: []
        };
    }

    /**
     * Initialize widget
     */
    public ngOnInit() {
        this.attributes = [this.attribute];
        // Subscribe to search state to get current refinements
        this.subscriptions.push(
            this.searchService.results$.subscribe(() => {
                const state = this.searchService.getState();
                // Build items from current filters
                this.state.items = [];
                if (state.filters[this.attribute]) {
                    state.filters[this.attribute].forEach(value => {
                        this.state.items.push({
                            attribute: this.attribute,
                            label: value,
                            value: value,
                            refine: () => {
                                const values = this.searchService.getState().filters[this.attribute] || [];
                                const newValues = values.filter(v => v !== value);
                                if (newValues.length > 0) {
                                    this.searchService.setFilter(this.attribute, newValues);
                                } else {
                                    this.searchService.removeFilter(this.attribute);
                                }
                            }
                        });
                    });
                }
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    json() {
        return JSON.stringify(this.state.refinements, null, 4);
    }

    /**
     * @param {?} event
     * @param array refinement
     * @return null
     */
    handleClick(event, refinement) {
        event.preventDefault();
        event.stopPropagation();
        if (refinement.refine) {
            refinement.refine();
            this.searchService.search();
        }
    }

    /**
     * @param {?} event
     * @return null
     */
    handleClearAllClick(event) {

        //let helper = this.instantSearchInstance.instantSearchInstance.helper;

        //on location clear, show results sorted by location

        /*if(this.attribute == 'currentLocations.ar' || this.attribute == 'currentLocations.en') {
            helper.setQueryParameter('getRankingInfo', true);
            helper.setQueryParameter('aroundLatLngViaIP', true);
            helper.setQueryParameter('aroundRadius', 'all');
        }*/

        this.searchService.removeFilter(this.attribute);
        this.searchService.search();

        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * @return boolean
     */
    isHidden() {
        return this.state.refinements &&
            this.state.refinements.filter(b => b.attributeName == this.attribute).length === 0;// && this.autoHideContainer;
    }

    birthTimestampItems(item) {
        const agePipe = new AgePipe();

        item.computedLabel = agePipe.transform(item.value);

        return item;
    }

    /**
     * CSS class helper (stub for template compatibility)
     */
    cx(classes?: string): string {
        return classes || '';
    }

    /**
     * Return current selection comma(,) separated
     */
    currentSelections(): string {
      // console.log(this.state);

        if(!this.state || !this.state.canRefine || !this.state.items || this.state.items.length === 0) {
            return '';
        }


        let a = [];

        for (let b of this.state.items) {

            if(this.attribute && b.attribute != this.attribute)
                continue;

          if (b.attribute == 'candidate_birth_timestamp') {
                b = this.birthTimestampItems(b.refinements);
            }

            if (b.attribute == 'candidate_gender') {
                b = this.genderTransformItems(b.refinements);
              a.push(b.map(item => item.label));
            }

            else if (b.attribute == 'candidate_driving_license') {
                b = this.licenseTransformItems(b.refinements);
                a.push(b.map(item => item.label));
            }

            else if (b.attribute == 'assigned') {
                b = this.assignedTransformItems(b.refinements);
                a.push(b.map(item => item.label));
            }

            else if (b.attribute == 'candidate_mom_kuwaiti') {
                b = this.kuwaitiMomTransformItems(b.refinements);
                a.push(b.map(item => item.label));
            }

           /* if (b.attributeName == 'candidate_committed') {
                b = this.committedTransformItems(b);
            }

            else if (b.attributeName == 'have_video') {
                b = this.haveVideoTransformItems(b);
            }

            else if (b.attributeName == 'have_resume') {
                b = this.haveResumeTransformItems(b);
            }*/


            // a.push(b.label);
        }

        return a.join(', ');
    }

    committedTransformItems = (item) => {

        //if(!items)
        //    return [];

        //return items.map(item => {
            if (item.name == "Yes" || item.computedLabel == "Yes")
                item.label = item.highlighted = item.name = 'Committed';
            else if (item.name == "No" || item.computedLabel == "No")
                item.label = item.highlighted = item.name = 'Not committed';

            return item;
        //});
    };

    haveVideoTransformItems = (item) => {

        //if(!items)
        //    return [];

        //return items.map(item => {
            if (item.name == "Yes" || item.computedLabel == "Yes")
                item.label = item.highlighted = item.name = 'Have video';
            else if (item.name == "No" || item.computedLabel == "No")
                item.label = item.highlighted = item.name = 'Not have video';

            return item;
        //});
    };

    haveResumeTransformItems = (item) => {

        //if(!items)
        //    return [];

        //return items.map(item => {
            if (item.name == "Yes" || item.computedLabel == "Yes")
                item.label = item.highlighted = item.name = 'Have resume';
            else if (item.name == "No" || item.computedLabel == "No")
                item.label = item.highlighted = item.name = 'Not have resume';

            return item;
        //});
    };

    licenseTransformItems = (item) => {

        if(!item)
            return [];

        return item.map(data => {
            if (data.name == "1" || data.computedLabel == "1")
              data.label = data.highlighted = data.name = 'Yes';
            else if (data.name == "2" || data.computedLabel == "2")
              data.label = data.highlighted = data.name = 'No';
            else if (data.name == "0" || data.computedLabel == "0")
              data.label = data.highlighted = data.name = 'No data';

            return data;
        });
    };

    assignedTransformItems = (item) => {

        if(!item)
            return [];

      return item.map(data => {
        if (data.label == '0' || data.name == '0' || data.computedLabel == '0') {
          data.label = data.highlighted = data.name = 'Not Assigned';
        }
        else if (data.label == '1' || data.name == '1' || data.computedLabel == '1') {
          data.label = data.highlighted = data.name = 'Assigned';
        }
        return data;
      });
    };

    kuwaitiMomTransformItems = (item) => {

        if(!item)
            return [];

      //return items.map(item => {
        if (item.name == '1' || item.computedLabel == '1') {
          item.label = item.highlighted = item.name = 'Mom Kuwaiti';
        }
        else if (item.name == '2' || item.computedLabel == '2') {
          item.label = item.highlighted = item.name = 'Mom Not Kuwaiti';
        }

        return item;
        //});
    }

    genderTransformItems = (item) => {
        if(!item)
            return [];

      return item.map(data => {
        return data;
      });
    }
}
