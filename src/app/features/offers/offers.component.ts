import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { InventoryDataService, Offer, NotificationService } from "ui-shared";

@Component({
  selector: "app-offers-admin",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="offers-admin p-6 animate-fade-in">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-black text-gray-900">Promotions & Offers</h1>
          <p class="text-sm text-gray-500">
            Manage storefront carousels and product discounts.
          </p>
        </div>
        <button
          (click)="showForm.set(true)"
          class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
        >
          Create New Offer
        </button>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Offers List -->
        <div class="lg:col-span-2 space-y-4">
          <div
            *ngFor="let offer of inventory.offers()"
            class="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              class="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
              [style.background]="offer.color + '22'"
              [style.color]="offer.color"
            >
              🎁
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded"
                  [style.background]="offer.color + '22'"
                  [style.color]="offer.color"
                >
                  {{ offer.discount }}% OFF
                </span>
                <span
                  class="text-xs font-bold text-gray-400"
                  *ngIf="offer.category"
                  >Category: {{ offer.category }}</span
                >
                <span
                  class="text-xs font-bold text-gray-400"
                  *ngIf="offer.productId"
                  >Product ID: {{ offer.productId }}</span
                >
              </div>
              <h3 class="font-bold text-gray-900">{{ offer.title }}</h3>
              <p class="text-sm text-gray-500">{{ offer.description }}</p>
            </div>
            <div class="text-right">
              <span class="block text-xs font-bold text-gray-400 mb-2"
                >Expires: {{ offer.expiryDate }}</span
              >
              <button
                class="text-red-500 text-xs font-black uppercase hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Create Form Sidebar/Modal -->
        <div
          *ngIf="showForm()"
          class="bg-white border border-gray-100 rounded-2xl p-6 shadow-xl sticky top-6"
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="font-black text-gray-900">New Promotion</h2>
            <button
              (click)="showForm.set(false)"
              class="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <form
            [formGroup]="offerForm"
            (ngSubmit)="saveOffer()"
            class="space-y-4"
          >
            <div>
              <label
                class="block text-xs font-black text-gray-400 uppercase mb-1"
                >Offer Title</label
              >
              <input
                type="text"
                formControlName="title"
                placeholder="e.g. Summer Sale"
                class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                class="block text-xs font-black text-gray-400 uppercase mb-1"
                >Description</label
              >
              <textarea
                formControlName="description"
                rows="3"
                placeholder="Tell users about this offer..."
                class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-xs font-black text-gray-400 uppercase mb-1"
                  >Discount %</label
                >
                <input
                  type="number"
                  formControlName="discount"
                  class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-black text-gray-400 uppercase mb-1"
                  >Color (HEX)</label
                >
                <input
                  type="text"
                  formControlName="color"
                  placeholder="#4f46e5"
                  class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label
                class="block text-xs font-black text-gray-400 uppercase mb-1"
                >Expiry Date</label
              >
              <input
                type="date"
                formControlName="expiryDate"
                class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div class="pt-4">
              <button
                type="submit"
                [disabled]="offerForm.invalid"
                class="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-sm hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200"
              >
                Publish Promotion
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background: #fafafa;
        min-height: 100vh;
      }
    `,
  ],
})
export class OffersComponent {
  inventory = inject(InventoryDataService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  showForm = signal(false);

  offerForm = this.fb.group({
    title: ["", Validators.required],
    description: ["", Validators.required],
    discount: [10, [Validators.required, Validators.min(1)]],
    color: ["#4f46e5", Validators.required],
    expiryDate: ["", Validators.required],
    category: [""],
    productId: [null],
  });

  saveOffer() {
    if (this.offerForm.invalid) return;

    const newOffer: Offer = {
      id: "OFFER-" + Math.random().toString(36).substr(2, 5).toUpperCase(),
      ...this.offerForm.value,
    } as Offer;

    this.inventory.addOffer(newOffer);
    this.notify.success(
      "Offer Created",
      `"${newOffer.title}" is now live on the storefront.`,
    );
    this.offerForm.reset({ color: "#4f46e5", discount: 10 });
    this.showForm.set(false);
  }
}
