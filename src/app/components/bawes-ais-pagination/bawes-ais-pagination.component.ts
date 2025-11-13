import { Component, OnInit, OnDestroy } from '@angular/core';
import { CandidateSearchService } from '../../services/candidate-search.service';
import { Subscription } from 'rxjs';
 
@Component({
  selector: 'bawes-ais-pagination',
  templateUrl: './bawes-ais-pagination.component.html',
  styleUrls: ['./bawes-ais-pagination.component.scss'],
})
export class BawesAisPaginationComponent implements OnInit, OnDestroy {
    
  public currentPage: number = 0;
  public totalPages: number = 0;
  public isLastPage: boolean = false;

  private subscriptions: Subscription[] = [];

    constructor(
      public searchService: CandidateSearchService
    ) {
    }

    ngOnInit() {
      // Subscribe to results to get pagination info
      this.subscriptions.push(
        this.searchService.results$.subscribe(results => {
          if (results) {
            this.currentPage = results.pagination.page;
            this.totalPages = results.pagination.totalPages;
            this.isLastPage = this.currentPage >= this.totalPages - 1;
          }
        })
      );

      // Subscribe to state changes
      this.subscriptions.push(
        this.searchService.state$.subscribe(state => {
          this.currentPage = state.page;
        })
      );
    }

    ngOnDestroy() {
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    async doInfinite(event) {
      if (this.isLastPage) {
        event.target.complete();
        return;
      }

      const state = this.searchService.getState();
      this.searchService.setPage(state.page + 1);
      await this.searchService.search();
      event.target.complete();
    }
  }
  