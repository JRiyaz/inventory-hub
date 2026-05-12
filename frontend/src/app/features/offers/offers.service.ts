import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { finalize, firstValueFrom, from } from 'rxjs';
import { InventoryDataService, type Offer } from 'ui-shared';

@Injectable({
  providedIn: 'root',
})
export class OffersService {
  private dataService = inject(InventoryDataService);
  private http = inject(HttpClient);

  // State
  isLoading = signal(false);
  isActionLoading = signal(false);
  offers = this.dataService.offers;

  // Actions
  async loadOffers() {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.http.get<Offer[]>(`${this.dataService.baseUrl}/offers`));
      this.dataService.setOffers(data);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  addOffer(offer: Offer) {
    this.isActionLoading.set(true);
    const promise = firstValueFrom(this.http.post<Offer>(`${this.dataService.baseUrl}/offers`, offer)).then((data) => {
      this.dataService.addOfferToState(data);
    });
    return from(promise).pipe(finalize(() => this.isActionLoading.set(false)));
  }

  deleteOffer(id: string) {
    this.isActionLoading.set(true);
    const promise = firstValueFrom(this.http.delete(`${this.dataService.baseUrl}/offers/${id}`)).then(() => {
      this.dataService.removeOfferFromState(id);
    });
    return from(promise).pipe(finalize(() => this.isActionLoading.set(false)));
  }

  updateOffer(offer: Offer) {
    this.isActionLoading.set(true);
    const promise = firstValueFrom(this.http.put<Offer>(`${this.dataService.baseUrl}/offers/${offer.id}`, offer)).then(
      (data) => {
        this.dataService.updateOfferInState(data);
      },
    );
    return from(promise).pipe(finalize(() => this.isActionLoading.set(false)));
  }
}
