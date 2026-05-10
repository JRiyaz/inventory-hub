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
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">
            Promotions & Offers
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Manage storefront carousels and product discounts.
          </p>
        </div>
        <button
          (click)="showForm.set(true)"
          class="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          Create New Offer
        </button>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Offers List -->
        <div class="lg:col-span-2 space-y-4">
          <div
            *ngFor="let offer of inventory.offers()"
            class="bg-white dark:bg-dark-card border border-slate-100 dark:border-white/5 rounded-2xl p-5 flex items-center gap-6 shadow-sm hover:shadow-md transition-all"
          >
            <div
              class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
              [style.background]="offer.color + '22'"
              [style.color]="offer.color"
            >
              🎁
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                  [style.background]="offer.color + '22'"
                  [style.color]="offer.color"
                >
                  {{ offer.discount }}% OFF
                </span>
                <span
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                  *ngIf="offer.category"
                  >Category: {{ offer.category }}</span
                >
                <span
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                  *ngIf="offer.productId"
                  >Product ID: {{ offer.productId }}</span
                >
              </div>
              <h3 class="font-bold text-slate-900 dark:text-white">
                {{ offer.title }}
              </h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                {{ offer.description }}
              </p>
            </div>
            <div class="text-right">
              <span
                class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"
                >Expires: {{ offer.expiryDate }}</span
              >
              <button
                class="text-rose-500 text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Create Form Sidebar/Modal -->
        <div
          *ngIf="showForm()"
          class="bg-white dark:bg-dark-card border border-slate-100 dark:border-white/5 rounded-2xl p-6 shadow-2xl sticky top-6"
        >
          <div class="flex justify-between items-center mb-6">
            <h2
              class="font-black text-slate-900 dark:text-white uppercase tracking-tight"
            >
              New Promotion
            </h2>
            <button
              (click)="showForm.set(false)"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          <form
            [formGroup]="offerForm"
            (ngSubmit)="saveOffer()"
            class="space-y-5"
          >
            <div>
              <label
                class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5"
                >Offer Title</label
              >
              <input
                type="text"
                formControlName="title"
                placeholder="e.g. Summer Sale"
                class="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-3 text-sm outline-none focus:border-primary transition-all dark:text-white"
              />
            </div>

            <div>
              <label
                class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5"
                >Description</label
              >
              <textarea
                formControlName="description"
                rows="3"
                placeholder="Tell users about this offer..."
                class="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-3 text-sm outline-none focus:border-primary transition-all dark:text-white"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5"
                  >Discount %</label
                >
                <input
                  type="number"
                  formControlName="discount"
                  class="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-3 text-sm outline-none focus:border-primary transition-all dark:text-white"
                />
              </div>
              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5"
                  >Color (HEX)</label
                >
                <input
                  type="text"
                  formControlName="color"
                  placeholder="#4f46e5"
                  class="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-3 text-sm outline-none focus:border-primary transition-all dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5"
                >Expiry Date</label
              >
              <input
                type="date"
                formControlName="expiryDate"
                class="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-3 text-sm outline-none focus:border-primary transition-all dark:text-white"
              />
            </div>

            <div class="pt-4">
              <button
                type="submit"
                [disabled]="offerForm.invalid"
                class="w-full bg-primary text-white py-3.5 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/25 transition-all"
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
