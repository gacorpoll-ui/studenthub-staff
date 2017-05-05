import { Component, Input } from '@angular/core';
import { Platform, ToastController, AlertController } from 'ionic-angular';

/*
  AWS S3 Image Upload Component 
  Uploads file then emits event with its details
*/
@Component({
  selector: 'image-upload',
  templateUrl: 'image-upload.html'
})
export class ImageUploadComponent {

  // Default value the component should have 
  // (In case an image has already been uploaded for it)
  @Input() value = false;

  // Icon to use, by default its a regular image icon
  @Input() icon: string = "image";


  constructor(
    private _platform: Platform,
    private _toastCtrl: ToastController,
    private _alertCtrl: AlertController
    ) {
  }

    
}
