import { Component, OnInit } from '@angular/core';
import { Contract } from 'src/app/models/contract';

@Component({
  selector: 'app-company-contract-view',
  templateUrl: './company-contract-view.page.html',
  styleUrls: ['./company-contract-view.page.scss'],
})
export class CompanyContractViewPage implements OnInit {

  public contract: Contract;
  
  constructor() { }

  ngOnInit() {
  }

}
