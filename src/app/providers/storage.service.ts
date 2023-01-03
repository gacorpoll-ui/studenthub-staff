import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    if(!this._storage)
      this._storage = await this.storage.create();
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public set(key: string, value: any) {
    return this._storage?.set(key, value);
  }

  public remove(key: string) {
    return this._storage?.remove(key);
  }

  public get(key: string) {
    return this._storage.get(key);
  }

  public clear() {
    return this._storage?.clear();
  }
}