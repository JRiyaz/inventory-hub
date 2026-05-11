import { Injectable, inject, signal } from "@angular/core";
import { InventoryDataService, Offer } from "ui-shared";
import { delay, of, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class OffersService {
  private dataService = inject(InventoryDataService);

  // State
  isLoading = signal(false);
  isActionLoading = signal(false);
  offers = this.dataService.offers;

  // Actions
  loadOffers() {
    this.isLoading.set(true);
    return of(null)
      .pipe(
        delay(800),
        tap(() => this.isLoading.set(false)),
      )
      .subscribe();
  }

  addOffer(offer: Offer) {
    this.isActionLoading.set(true);
    return of(offer).pipe(
      delay(1500),
      tap((newOffer) => {
        this.dataService.addOffer(newOffer);
        this.isActionLoading.set(false);
      }),
    );
  }

  deleteOffer(id: string) {
    // Note: InventoryDataService might need a deleteOffer method if we want to support deletion
    // For now, we'll just mock it or assume it exists
    this.isActionLoading.set(true);
    return of(id).pipe(
      delay(1000),
      tap(() => {
        this.dataService.deleteOffer(id);
        this.isActionLoading.set(false);
      }),
    );
  }

  updateOffer(offer: Offer) {
    this.isActionLoading.set(true);
    return of(offer).pipe(
      delay(1200),
      tap((updated) => {
        this.dataService.updateOffer(updated);
        this.isActionLoading.set(false);
      }),
    );
  }
}
