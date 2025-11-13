import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject, timer, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, debounce } from 'rxjs/operators';
// services
import { TranslateLabelService } from 'src/app/providers/translate-label.service';
import { CandidateSearchService } from 'src/app/services/candidate-search.service';
import { Subscription } from 'rxjs';


@Component({
    selector: 'is-search-box',
    templateUrl: './is-search-box.component.html',
    styleUrls: ['./is-search-box.component.scss'],
})
export class IsSearchBoxComponent implements OnInit, OnDestroy {

    @Input() placeholder;
    @Input() submitTitle;
    @Input() resetTitle;
    @Input() searchAsYouType;

    @Output() submit: EventEmitter<any> = new EventEmitter();
    @Output() reset: EventEmitter<any> = new EventEmitter();
    @Output() change: EventEmitter<any> = new EventEmitter();
    @Output() focus: EventEmitter<any> = new EventEmitter();
    @Output() blur: EventEmitter<any> = new EventEmitter();

    state: any = {
        query: "",
        refine: (query: string) => {}
    };

    modelChanged: Subject<{query: string, code: number }> = new Subject();
    private subscriptions: Subscription[] = [];

    constructor(
        public _translateService: TranslateLabelService,
        public searchService: CandidateSearchService
    ) {
        this.modelChanged.pipe(
            debounce(ev => ev.code != 13 ? timer(800) : EMPTY),
            distinctUntilChanged(),
        ).subscribe(ev => {
            this.searchService.setQuery(ev.query);
            this.searchService.search();
        });
    }

    /**
     * Initialize widget
     */
    public ngOnInit() {
        // Subscribe to search state to get current query
        this.subscriptions.push(
            this.searchService.results$.subscribe(() => {
                const state = this.searchService.getState();
                this.state.query = state.query || '';
            })
        );
    }

    ngOnDestroy() {
        // don't destroy search box
    }

    handleChange(event) { 

        if (this.searchAsYouType) {
            this.modelChanged.next({
                code: event.keyCode,
                query: event.target.value
            });
        }
    }

    handleSubmit(event) {
        // send submit event to parent component
        this.submit.emit(event);
        event.preventDefault();

        if (!this.searchAsYouType) {
            this.state.refine(this.state.query);
        }
    }

    handleReset(event) {
        // send reset event to parent component
        this.reset.emit(event);
        // reset search
        this.searchService.setQuery('');
        this.searchService.search();
    }

    /**
     * CSS class helper (stub for template compatibility)
     */
    cx(classes?: string): string {
        return classes || '';
    }
}
