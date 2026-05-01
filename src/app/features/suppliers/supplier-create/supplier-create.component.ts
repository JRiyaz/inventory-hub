import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { InventoryDataService, Supplier, NotificationService } from "ui-shared";

@Component({
  selector: "app-supplier-create",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-3 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <nav
        class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6"
      >
        <a
          routerLink="/inventory/suppliers"
          class="hover:text-primary transition-colors"
          >Suppliers</a
        >
        <svg
          class="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 5l7 7-7 7"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="text-slate-900 dark:text-white">New Vendor</span>
      </nav>

      <div class="card-premium p-8">
        <div
          class="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100 dark:border-white/5"
        >
          <div
            class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h2
              class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
            >
              Onboard New Supplier
            </h2>
            <p
              class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1"
            >
              Supply Chain Node Registration
            </p>
          </div>
        </div>

        <form (ngSubmit)="submitForm()" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <!-- Name -->
            <div class="floating-input-group md:col-span-2">
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="formData.name"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="name" class="floating-label"
                >Supplier Entity Name</label
              >
            </div>

            <!-- Category -->
            <div class="floating-input-group">
              <input
                type="text"
                id="category"
                name="category"
                [(ngModel)]="formData.category"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="category" class="floating-label"
                >Primary Goods Category</label
              >
            </div>

            <!-- Reliability -->
            <div class="floating-input-group">
              <input
                type="number"
                id="reliability"
                name="reliability"
                [(ngModel)]="formData.reliability"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="reliability" class="floating-label"
                >Reliability Score (0-100)</label
              >
            </div>

            <!-- Email -->
            <div class="floating-input-group">
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="formData.email"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="email" class="floating-label"
                >Procurement Email</label
              >
            </div>

            <!-- Phone -->
            <div class="floating-input-group">
              <input
                type="tel"
                id="phone"
                name="phone"
                [(ngModel)]="formData.phone"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="phone" class="floating-label">Contact Number</label>
            </div>

            <!-- Location -->
            <div class="floating-input-group md:col-span-2">
              <input
                type="text"
                id="location"
                name="location"
                [(ngModel)]="formData.location"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="location" class="floating-label"
                >Operational HQ Location</label
              >
            </div>
          </div>

          <div
            class="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-white/5 mt-10"
          >
            <button
              type="button"
              routerLink="/inventory/suppliers"
              class="btn-secondary-premium"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting() || !isValid()"
              [class.btn-loading]="isSubmitting()"
              class="btn-primary-premium min-w-[160px]"
            >
              Finalize Onboarding
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SupplierCreateComponent {
  private dataService = inject(InventoryDataService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isSubmitting = signal(false);

  formData = {
    name: "",
    category: "",
    email: "",
    phone: "",
    location: "",
    reliability: 100,
  };

  isValid(): boolean {
    return !!(
      this.formData.name &&
      this.formData.category &&
      this.formData.email
    );
  }

  submitForm() {
    if (!this.isValid()) return;

    this.isSubmitting.set(true);

    const newSupplier: Supplier = {
      id: "SUP-" + Math.floor(1000 + Math.random() * 9000),
      ...this.formData,
      status: "Active",
    };

    // Simulate backend call
    setTimeout(() => {
      this.dataService.addSupplier(newSupplier);
      this.notificationService.success(
        "Onboarding Successful",
        `${newSupplier.name} has been added to the vendor network.`,
      );
      this.isSubmitting.set(false);
      this.router.navigate(["/inventory/suppliers", newSupplier.id]);
    }, 1500);
  }
}
