import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Company } from 'src/app/models/company';
import { AnalyticsService } from 'src/app/providers/analytics.service';
import { CompanyService } from 'src/app/providers/logged-in/company.service';
import { ContractService } from 'src/app/providers/logged-in/contract.service';
import { CompanyContractFormPage } from '../company-contract-form/company-contract-form.page';
import { Contract } from 'src/app/models/contract';
import { TranslateLabelService } from 'src/app/providers/translate-label.service';
import { AuthService } from 'src/app/providers/auth.service';
import { EventService } from 'src/app/providers/event.service';

@Component({
  selector: 'app-company-contract-list',
  templateUrl: './company-contract-list.page.html',
  styleUrls: ['./company-contract-list.page.scss'],
})
export class CompanyContractListPage implements OnInit {

  public company_id;

  public company: Company;

  public borderLimit = false;
  
  public loading = false;

  public deleting = false; 

  constructor(
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public authService: AuthService,
    public eventService: EventService,
    public contractService: ContractService,
    public companyService: CompanyService,
    public translateService: TranslateLabelService,
    public analyticService: AnalyticsService
  ) { }

  ngOnInit() {
    this.analyticService.page('Company Contracts Page');

    if (!this.company || !this.company.contracts) {
      this.loadCompanyDetail(); 
    }
  }

  doRefresh(event) {
    this.loadCompanyDetail();
    event.target.complete();
  }
   
  delete(contract, event) {
    event.preventDefault();
    event.stopPropagation();

    this.deleting = true;

    this.contractService.delete(contract).subscribe(async jsonResponse => {

      this.deleting = false;
    
      // On Success
      if (jsonResponse.operation == 'success') {

        this.eventService.reloadStats$.next({
          company_id: this.company.company_id
        });

        // Close the page
        const data = { refresh: true };
        this.modalCtrl.dismiss(data);

        const toast = await this.toastCtrl.create({
          message: 'Contract deleted successfully',
          duration: 3000
        });
        toast.present();
      }

      // On Failure
      if (jsonResponse.operation == 'error') {

        const prompt = await this.alertCtrl.create({
          message: this.authService.errorMessage(jsonResponse.message),
          buttons: ['Ok']
        });
        prompt.present();
      }
    }, err => {
      this.deleting = false;
    });
  }

  /**
   * form to add new contract
   */
  async addContract() {
    window.history.pushState({ navigationId: window.history.state?.navigationId }, null, window.location.pathname);

    const contract = new Contract();
    contract.company_id = this.company.company_id;

    const modal = await this.modalCtrl.create({
      component: CompanyContractFormPage,
      componentProps: {
        model: contract
      },
      cssClass: "popup-modal"
    });
    modal.onDidDismiss().then(e => {

      if (!e.data || e.data.from != 'native-back-btn') {
        window['history-back-from'] = 'onDidDismiss';
        window.history.back();
      }

      if (e && e.data && e.data.refresh) {
        this.loadCompanyDetail();
      }
    });
    modal.present();
  }

  async contractSelected(contract) {
    window.history.pushState({ navigationId: window.history.state?.navigationId }, null, window.location.pathname);
 
    const modal = await this.modalCtrl.create({
      component: CompanyContractFormPage,
      componentProps: {
        model: contract
      },
      cssClass: "popup-modal"
    });
    modal.onDidDismiss().then(e => {

      if (!e.data || e.data.from != 'native-back-btn') {
        window['history-back-from'] = 'onDidDismiss';
        window.history.back();
      }

      if (e && e.data && e.data.refresh) {
        this.loadCompanyDetail();
      }
    });
    modal.present();
  }

  dismiss(data = null) {
    this.modalCtrl.getTop().then(o => {
      if(o) {
        o.dismiss(data);
      }
    });
  }

  logScrolling(e) {
    this.borderLimit = (e.detail.scrollTop > 20);
  }

  /**
   * load company detail
   */
  loadCompanyDetail() {
    this.companyService.view(this.company.company_id, 'contracts,contracts.amount').subscribe(response => {
      this.company = response;
    }, () => {
    });
  }
}
