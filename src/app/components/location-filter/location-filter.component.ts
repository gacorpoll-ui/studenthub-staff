import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CandidateSearchService } from '../../services/candidate-search.service';
import { Subscription } from 'rxjs';

import * as L from 'leaflet';

@Component({
  selector: 'location-filter',
  templateUrl: './location-filter.component.html',
  styleUrls: ['./location-filter.component.scss']
})
export class LocationFilterComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef;

  private map: any;
  private marker: any;
  private circle: any;
  private subscriptions: Subscription[] = [];
  
  public radius: number = 10; // km
  public searchCenter: { lat: number; lng: number } | null = null;
  public addressSearch: string = '';
  public isSearching: boolean = false;

  // Default center (Kuwait)
  private defaultCenter = { lat: 29.3759, lng: 47.9774 };

  constructor(public searchService: CandidateSearchService) {}

  ngOnInit() {
    // Subscribe to state changes to update map
    this.subscriptions.push(
      this.searchService.state$.subscribe(state => {
        if (state.geo) {
          this.searchCenter = { lat: state.geo.lat, lng: state.geo.lng };
          this.radius = state.geo.radius / 1000; // Convert meters to km
          this.updateMap();
        } else {
          this.searchCenter = null;
          this.updateMap();
        }
      })
    );
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.map) {
      this.map.remove();
    }
  }

  /**
   * Initialize Leaflet map
   */
  initMap() {
    if (!this.mapContainer || !this.mapContainer.nativeElement) {
      return;
    }

    const center = this.searchCenter || this.defaultCenter;

    this.map = L.map(this.mapContainer.nativeElement).setView([center.lat, center.lng], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Click handler for setting search center
    this.map.on('click', (e: any) => {
      this.setSearchCenter(e.latlng.lat, e.latlng.lng);
    });

    this.updateMap();
  }

  /**
   * Set search center from map click or address search
   */
  setSearchCenter(lat: number, lng: number) {
    this.searchCenter = { lat, lng };
    this.updateMap();
    this.updateSearch();
  }

  /**
   * Update map markers and circle
   */
  updateMap() {
    if (!this.map) {
      return;
    }

    // Remove existing marker and circle
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
    if (this.circle) {
      this.map.removeLayer(this.circle);
      this.circle = null;
    }

    // Add marker and circle if search center is set
    if (this.searchCenter) {
      this.marker = L.marker([this.searchCenter.lat, this.searchCenter.lng])
        .addTo(this.map);

      // Add circle to show radius
      this.circle = L.circle([this.searchCenter.lat, this.searchCenter.lng], {
        radius: this.radius * 1000, // Convert km to meters
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 0.2
      }).addTo(this.map);

      // Fit map to show circle
      this.map.fitBounds(this.circle.getBounds());
    }
  }

  /**
   * Handle radius change
   */
  onRadiusChange() {
    this.updateMap();
    if (this.searchCenter) {
      this.updateSearch();
    }
  }

  /**
   * Search for address using OpenStreetMap Nominatim API
   */
  async searchAddress() {
    if (!this.addressSearch || this.addressSearch.trim().length === 0) {
      return;
    }

    this.isSearching = true;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.addressSearch)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        this.setSearchCenter(parseFloat(result.lat), parseFloat(result.lon));
        this.addressSearch = result.display_name;
      } else {
        alert('Address not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error searching for address');
    } finally {
      this.isSearching = false;
    }
  }

  /**
   * Clear location filter
   */
  clearLocation() {
    this.searchCenter = null;
    this.addressSearch = '';
    this.radius = 10;
    this.updateMap();
    this.searchService.setGeo(undefined);
    this.searchService.search();
  }

  /**
   * Update search with current geo settings
   */
  private updateSearch() {
    if (this.searchCenter) {
      this.searchService.setGeo({
        lat: this.searchCenter.lat,
        lng: this.searchCenter.lng,
        radius: this.radius * 1000, // Convert km to meters
        unit: 'm'
      });
      this.searchService.search();
    }
  }
}

