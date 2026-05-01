import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import {
  InventoryDataService,
  Warehouse,
  NotificationService,
} from "ui-shared";

@Component({
  selector: "app-warehouse-create",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-3 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <nav
        class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6"
      >
        <a
          routerLink="/inventory/warehouses"
          class="hover:text-primary transition-colors"
          >Logistics</a
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
        <span class="text-slate-900 dark:text-white">New Facility</span>
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
              Register New Logistics Node
            </h2>
            <p
              class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1"
            >
              Spatial Asset Initialization
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
              <label for="name" class="floating-label">Facility Name</label>
            </div>

            <!-- Location -->
            <div class="floating-input-group">
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
                >Geographic Location</label
              >
            </div>

            <!-- Capacity -->
            <div class="floating-input-group">
              <input
                type="number"
                id="capacity"
                name="capacity"
                [(ngModel)]="formData.totalCapacity"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="capacity" class="floating-label"
                >Total Unit Capacity</label
              >
            </div>

            <!-- Manager -->
            <div class="floating-input-group md:col-span-2">
              <input
                type="text"
                id="manager"
                name="manager"
                [(ngModel)]="formData.manager"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="manager" class="floating-label"
                >Operational Lead / Manager</label
              >
            </div>
          </div>

          <div
            class="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-white/5 mt-10"
          >
            <button
              type="button"
              routerLink="/inventory/warehouses"
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
              Initialize Facility
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
export class WarehouseCreateComponent {
  private dataService = inject(InventoryDataService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isSubmitting = signal(false);

  formData = {
    name: "",
    location: "",
    totalCapacity: 50000,
    manager: "",
  };

  isValid(): boolean {
    return !!(
      this.formData.name &&
      this.formData.location &&
      this.formData.totalCapacity > 0
    );
  }

  submitForm() {
    if (!this.isValid()) return;

    this.isSubmitting.set(true);

    const newWarehouse: Warehouse = {
      id: "WH-" + Math.floor(100 + Math.random() * 900),
      ...this.formData,
      currentStock: 0,
      utilization: 0,
      zones: [
        {
          id: "Z1",
          name: "Zone Alpha",
          description: "Primary high-capacity storage area",
          capacity: Math.floor(this.formData.totalCapacity * 0.4),
          currentStock: 0,
          category: "General",
        },
        {
          id: "Z2",
          name: "Zone Beta",
          description: "Secondary logistics and sorting bay",
          capacity: Math.floor(this.formData.totalCapacity * 0.6),
          currentStock: 0,
          category: "High Priority",
        },
      ],
      lastAudit: new Date().toISOString().split("T")[0],
    };

    // Simulate backend call
    setTimeout(() => {
      this.dataService.addWarehouse(newWarehouse);
      this.notificationService.success(
        "Facility Registered",
        `${newWarehouse.name} is now active in the logistics network.`,
      );
      this.isSubmitting.set(false);
      this.router.navigate(["/inventory/warehouses", newWarehouse.id]);
    }, 1500);
  }
}
