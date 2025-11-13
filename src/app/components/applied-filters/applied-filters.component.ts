import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Platform } from "@ionic/angular";
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AgePipe } from 'src/app/pipes/age.pipe';
import { Subscription } from 'rxjs';

//services
import { AuthService } from '../../providers/auth.service';
import { CandidateSearchService } from '../../services/candidate-search.service';


/**
 * Display filter selection
 */
@Component({
    selector: 'applied-filters',
    templateUrl: './applied-filters.component.html',
    styleUrls: ['./applied-filters.component.scss'],
})
export class AppliedFiltersComponent implements OnInit, OnDestroy {
    @Input() loading;
    @Input() transformItems;
    @Input() attributes;
    @Input() currencies;
    @Input() labelWithFilter;
    @Input() labelWithoutFilter;

    public total: number = 0;
    public average = null;
    public currentSelectionsList: any[] = [];

    private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    public platform: Platform,
    public currencyPipe: CurrencyPipe,
    public searchService: CandidateSearchService
  ) {
    }

    ngOnInit() {
        // Subscribe to results to get total count
        this.subscriptions.push(
            this.searchService.results$.subscribe(results => {
                if (results) {
                    this.total = results.pagination.total;
                }
            })
        );

        // Subscribe to state changes to update current selections
        this.subscriptions.push(
            this.searchService.state$.subscribe(() => {
                this.currentSelectionsList = this.currentSelections();
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    /**
     * @return boolean
     */
    isHidden() {
        return this.currentSelectionsList.length === 0;
    }

    /**
     * remove current selection
     * @param currentSelection
     */
    toggleCurrentSelection(currentSelection: any) {
        if (currentSelection.attribute) {
            if (currentSelection.operator === '>=' || currentSelection.operator === '<=') {
                // Range filter - remove the entire filter
                this.searchService.removeFilter(currentSelection.attribute);
            } else {
                // Regular filter - toggle the value
                this.searchService.toggleFilter(currentSelection.attribute, currentSelection.value);
            }
            this.searchService.search();
        } else if (currentSelection.type === 'geo') {
            // Remove geo filter
            this.searchService.setGeo(undefined);
            this.searchService.search();
        }
    }

    committedTransformItems = (item) => {

        //if(!items)
        //    return [];

        //return items.map(item => {
            if (item.value == "Yes" || item.computedLabel == "Yes")
                item.label = 'Committed';
            else if (item.value == "No" || item.computedLabel == "No")
                item.label = 'Not committed';

            return item;
        //});
    };

    haveVideoTransformItems = (item) => {

        //if(!items)
        //    return [];

        //return items.map(item => {
            if (item.value == "Yes" || item.computedLabel == "Yes")
                item.label = 'Have video';
            else if (item.value == "No" || item.computedLabel == "No")
                item.label = 'Not have video';

            return item;
        //});
    };

    haveResumeTransformItems = (item) => {

        //if(!items)
        //    return [];

        //return items.map(item => {
            if (item.value == "Yes" || item.computedLabel == "Yes")
                item.label = 'Have resume';
            else if (item.value == "No" || item.computedLabel == "No")
                item.label = 'Not have resume';

            return item;
        //});
    };

    licenseTransformItems = (item) => {

        if(!item)
            return [];

        //return items.map(item => {
            if (item.value == "1" || item.computedLabel == "1")
                item.label = 'Have license';
            else if (item.value == "2" || item.computedLabel == "2")
                item.label = 'Not have license';
            else if (item.value == "0" || item.computedLabel == "0")
                item.label = 'No data';

            return item;
        //});
    };

    assignedTransformItems = (item) => {

        if(!item)
            return [];

      //return items.map(item => {
        if (item.value == 'No' || item.value == '0' || item.computedLabel == '0') {
          item.label = 'Not Assigned';
        }
        else if (item.value == 'Yes' || item.value == '1' || item.computedLabel == '1') {
          item.label = 'Assigned';
        }

        return item;
      //});
    };

    kuwaitiMomTransformItems = (item) => {

        if(!item)
            return [];

      //return items.map(item => {
        if (item.value == '1' || item.computedLabel == '1') {
          item.label = 'Mom Kuwaiti';
        }
        else if (item.value == '2' || item.computedLabel == '2') {
          item.label = 'Mom Not Kuwaiti';
        }

        return item;
        //});
    }

    genderTransformItems = (item) => {

        if(!item)
            return [];

        if (item.value == '1' || item.label == '1') {
            item.label = 'Male';
        }
        else if (item.value == '2' || item.label == '2') {
            item.label = 'Female';
        }
        else if (item.value == '3' || item.label == '3') {
            item.label = 'Other';
        }

        return item;
    }

    birthTimestampItems(item) {
      // console.log(item);
        const agePipe = new AgePipe();
        const label = item.operator == '>='? 'Age Upto' : 'Age From';
        item.label =  label + ' ' + agePipe.transform(item.value);
        return item;
    }

    dateTimestampItems(item) {

        const agePipe = new DatePipe('en-US');

        item.label =  item.operator + ' ' + agePipe.transform(new Date(item.value * 1000), 'yyyy-MM-dd');

        return item;
    }

    /**
     * Return current selections from search state
     */
    currentSelections(): any[] {
        const buttons: any[] = [];
        const state = this.searchService.getState();

        // Add query if present
        if (state.query && state.query.length > 0) {
            buttons.push({
                type: 'query',
                label: state.query,
                value: state.query
            });
        }

        // Add filters
        Object.keys(state.filters).forEach(attribute => {
            const values = state.filters[attribute];
            values.forEach(value => {
                let item: any = {
                    attribute: attribute,
                    value: value,
                    label: value
                };

                // Apply transformations
                if (attribute === 'candidate_committed') {
                    item = this.committedTransformItems(item);
                } else if (attribute === 'have_video') {
                    item = this.haveVideoTransformItems(item);
                } else if (attribute === 'have_resume') {
                    item = this.haveResumeTransformItems(item);
                } else if (attribute === 'candidate_driving_license' || attribute === 'fulltimer_driving_license') {
                    item = this.licenseTransformItems(item);
                } else if (attribute === 'assigned' || attribute === 'fulltimer_employed') {
                    item = this.assignedTransformItems(item);
                } else if (attribute === 'candidate_mom_kuwaiti') {
                    item = this.kuwaitiMomTransformItems(item);
                }

                buttons.push(item);
            });
        });

        // Add geo filter if present
        if (state.geo) {
            buttons.push({
                type: 'geo',
                label: `Location (${(state.geo.radius / 1000).toFixed(1)}km)`,
                attribute: '_geo'
            });
        }

        return buttons;
    }

}
