import { Component, signal, inject, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import {
  InventoryDataService,
  Product,
  NotificationService,
  CustomDropdownComponent,
  DropdownOption,
} from "ui-shared";

@Component({
  selector: "app-product-create",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CustomDropdownComponent],
  template: `
    <div class="p-3 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <nav
        class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6"
      >
        <a
          routerLink="/inventory/products"
          class="hover:text-primary transition-colors"
          >Inventory</a
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
        <span class="text-slate-900 dark:text-white">New SKU</span>
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <h2
              class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
            >
              Register New Product
            </h2>
            <p
              class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1"
            >
              Catalog Entry & Stock Initialization
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
                >Product Name / Label</label
              >
            </div>

            <!-- Price -->
            <div class="floating-input-group">
              <input
                type="number"
                id="price"
                name="price"
                [(ngModel)]="formData.price"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="price" class="floating-label">Unit Price (USD)</label>
            </div>

            <!-- Stock -->
            <div class="floating-input-group">
              <input
                type="number"
                id="stock"
                name="stock"
                [(ngModel)]="formData.stock"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="stock" class="floating-label"
                >Initial Inventory Count</label
              >
            </div>

            <!-- Category Dropdown -->
            <div class="w-full">
              <label
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block"
                >Category</label
              >
              <lib-custom-dropdown
                [options]="categoryOptions"
                [value]="formData.category"
                [placeholder]="'Select Category'"
                (valueChange)="formData.category = $event"
              ></lib-custom-dropdown>
            </div>

            <!-- Supplier Dropdown -->
            <div class="w-full">
              <label
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block"
                >Primary Source</label
              >
              <lib-custom-dropdown
                [options]="supplierOptions()"
                [value]="formData.supplierId"
                [placeholder]="'Assign Supplier'"
                (valueChange)="formData.supplierId = $event"
              ></lib-custom-dropdown>
            </div>

            <!-- Description -->
            <div class="floating-input-group md:col-span-2">
              <input
                type="text"
                id="description"
                name="description"
                [(ngModel)]="formData.description"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="description" class="floating-label"
                >Product Specifications / Description</label
              >
            </div>
          </div>

          <div
            class="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-white/5 mt-10"
          >
            <button
              type="button"
              routerLink="/inventory/products"
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
              Initialize SKU
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
export class ProductCreateComponent {
  private dataService = inject(InventoryDataService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isSubmitting = signal(false);

  formData = {
    name: "",
    price: 0,
    stock: 0,
    category: "Electronics",
    description: "",
    supplierId: "",
  };

  categoryOptions: DropdownOption[] = [
    { value: "Electronics", label: "Electronics" },
    { value: "Industrial", label: "Industrial" },
    { value: "Raw Materials", label: "Raw Materials" },
    { value: "Computing", label: "Computing" },
  ];

  supplierOptions = computed(() =>
    this.dataService.suppliers().map((s) => ({ value: s.id, label: s.name })),
  );

  isValid(): boolean {
    return !!(
      this.formData.name &&
      this.formData.price > 0 &&
      this.formData.category
    );
  }

  submitForm() {
    if (!this.isValid()) return;

    this.isSubmitting.set(true);

    const newProduct: Product = {
      id: Math.floor(10000 + Math.random() * 90000),
      ...this.formData,
    };

    // Simulate backend call
    setTimeout(() => {
      this.dataService.addProduct(newProduct);
      this.notificationService.success(
        "Product Initialized",
        `${newProduct.name} has been added to the master catalog.`,
      );
      this.isSubmitting.set(false);
      this.router.navigate(["/inventory/products", newProduct.id]);
    }, 1500);
  }
}
