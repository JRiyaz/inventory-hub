import { Component, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AuthStateService } from "ui-shared";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
}

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in">
      <!-- Breadcrumbs -->
      <nav
        class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8"
      >
        <a
          routerLink="/inventory/products"
          class="hover:text-primary transition-colors"
          >Products</a
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
        <span class="text-slate-900 dark:text-white">{{
          product()?.name || "Loading..."
        }}</span>
      </nav>

      <div
        *ngIf="product()"
        class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl dark:shadow-none"
      >
        <div class="flex flex-col lg:flex-row">
          <!-- Left: Image/Visual -->
          <div
            class="w-full lg:w-2/5 bg-slate-50 dark:bg-white/[0.02] p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/[0.08]"
          >
            <div class="relative group">
              <div
                class="w-64 h-64 bg-white dark:bg-white/5 rounded-3xl shadow-inner flex items-center justify-center text-slate-200 dark:text-white/5 overflow-hidden"
              >
                <svg
                  class="w-32 h-32"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  ></path>
                </svg>
              </div>
              <div
                class="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/10 rounded-2xl blur-2xl group-hover:blur-xl transition-all"
              ></div>
            </div>
          </div>

          <!-- Right: Details -->
          <div class="flex-1 p-8 sm:p-12">
            <div class="flex justify-between items-start mb-8">
              <div>
                <span
                  *ngIf="!isEditing()"
                  class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20 mb-3 block w-fit"
                >
                  {{ product()?.category }}
                </span>
                <div
                  *ngIf="isEditing()"
                  class="floating-input-group w-full sm:w-64 mb-6"
                >
                  <select
                    [(ngModel)]="editBuffer.category"
                    class="floating-input py-2"
                    id="edit-cat"
                  >
                    <option value="Industrial">Industrial</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Raw Materials">Raw Materials</option>
                  </select>
                  <label class="floating-label" for="edit-cat">Category</label>
                </div>
                <h1
                  *ngIf="!isEditing()"
                  class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none"
                >
                  {{ product()?.name }}
                </h1>
                <div
                  *ngIf="isEditing()"
                  class="floating-input-group w-full sm:w-96"
                >
                  <input
                    type="text"
                    [(ngModel)]="editBuffer.name"
                    class="floating-input"
                    id="edit-name"
                    placeholder=" "
                  />
                  <label class="floating-label" for="edit-name"
                    >Product Name</label
                  >
                </div>
              </div>
              <button
                *ngIf="auth.isAdmin()"
                (click)="toggleEdit()"
                class="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors"
              >
                <svg
                  *ngIf="!isEditing()"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  ></path>
                </svg>
                <span
                  class="text-[10px] font-black uppercase tracking-widest"
                  >{{ isEditing() ? "Cancel" : "Edit" }}</span
                >
              </button>
            </div>

            <div class="space-y-8">
              <!-- Description -->
              <div>
                <label
                  class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block"
                  >Description</label
                >
                <p
                  *ngIf="!isEditing()"
                  class="text-slate-600 dark:text-slate-400 leading-relaxed"
                >
                  {{ product()?.description }}
                </p>
                <div *ngIf="isEditing()" class="floating-input-group">
                  <textarea
                    [(ngModel)]="editBuffer.description"
                    class="floating-input min-h-[100px] py-4"
                    id="edit-desc"
                    placeholder=" "
                  ></textarea>
                  <label class="floating-label" for="edit-desc"
                    >Description</label
                  >
                </div>
              </div>

              <!-- Metrics -->
              <div class="grid grid-cols-2 gap-8">
                <div>
                  <label
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block"
                    >Price</label
                  >
                  <div
                    *ngIf="!isEditing()"
                    class="text-2xl font-black text-primary"
                  >
                    {{ product()?.price | currency }}
                  </div>
                  <div *ngIf="isEditing()" class="floating-input-group">
                    <input
                      type="number"
                      [(ngModel)]="editBuffer.price"
                      class="floating-input"
                      id="edit-price"
                      placeholder=" "
                    />
                    <label class="floating-label" for="edit-price">Price</label>
                  </div>
                </div>
                <div>
                  <label
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block"
                    >In Stock</label
                  >
                  <div *ngIf="!isEditing()" class="flex items-center gap-2">
                    <span
                      class="text-2xl font-black text-slate-900 dark:text-white"
                      >{{ product()?.stock }}</span
                    >
                    <span class="text-[10px] font-bold text-green-500 uppercase"
                      >Available</span
                    >
                  </div>
                  <div *ngIf="isEditing()" class="floating-input-group">
                    <input
                      type="number"
                      [(ngModel)]="editBuffer.stock"
                      class="floating-input"
                      id="edit-stock"
                      placeholder=" "
                    />
                    <label class="floating-label" for="edit-stock"
                      >Stock Level</label
                    >
                  </div>
                </div>
              </div>

              <!-- Image URL Editing -->
              <div *ngIf="isEditing()" class="pt-2">
                <div class="floating-input-group">
                  <input
                    type="text"
                    [(ngModel)]="editBuffer.image"
                    class="floating-input"
                    id="edit-image"
                    placeholder=" "
                  />
                  <label class="floating-label" for="edit-image"
                    >Product Image URL</label
                  >
                </div>
              </div>

              <!-- Save Button -->
              <div
                *ngIf="isEditing()"
                class="pt-8 border-t border-slate-100 dark:border-white/[0.05]"
              >
                <button
                  (click)="saveChanges()"
                  class="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  isEditing = signal(false);
  editBuffer: any = {};

  // Mock database
  private products: Product[] = [
    {
      id: 1,
      name: "Precision Logic Controller",
      category: "Industrial",
      price: 1240,
      stock: 45,
      description:
        "High-speed automated processing unit with dual redundancy support for mission-critical industrial applications. Features advanced thermal management and modular I/O expandability.",
      image: "",
    },
    {
      id: 2,
      name: "Thermal Flux Sensor",
      category: "Electronics",
      price: 450,
      stock: 120,
      description:
        "Advanced temperature monitoring with ±0.1°C precision accuracy. Ideal for semiconductor manufacturing and high-precision chemical processing environments.",
      image: "",
    },
    {
      id: 3,
      name: "Reinforced Steel Alloy",
      category: "Raw Materials",
      price: 89,
      stock: 2500,
      description:
        "High-tensile strength industrial grade steel for structural components. Certified for extreme load-bearing environments and corrosive maritime conditions.",
      image: "",
    },
    {
      id: 4,
      name: "Quantum Circuit Breaker",
      category: "Electronics",
      price: 2100,
      stock: 12,
      description:
        "Next-gen energy protection system with instant isolation capabilities. Utilizes solid-state switching for near-zero latency interruption of power surges.",
      image: "",
    },
    {
      id: 5,
      name: "Pneumatic Actuator X5",
      category: "Industrial",
      price: 670,
      stock: 88,
      description:
        "Heavy-duty air pressure driven mechanical movement system. Provides high torque output with minimal maintenance requirements for robotic assembly lines.",
      image: "",
    },
    {
      id: 6,
      name: "Industrial Grade Coolant",
      category: "Raw Materials",
      price: 150,
      stock: 430,
      description:
        "Non-corrosive heat dissipation fluid for high-temperature machinery. Chemically stable across a wide operating range from -40°C to +220°C.",
      image: "",
    },
    {
      id: 7,
      name: "Logic Gate Array V2",
      category: "Electronics",
      price: 320,
      stock: 15,
      description:
        "Programmable logic controller for complex sequence automation. Supports multiple fieldbus protocols including EtherCAT, PROFINET, and Modbus TCP.",
      image: "",
    },
    {
      id: 8,
      name: "Heavy Duty Gear Box",
      category: "Industrial",
      price: 4500,
      stock: 5,
      description:
        "Ultra-durable transmission system for mining and heavy lifting. Engineered for high-torque applications with a 10-year service life under continuous operation.",
      image: "",
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthStateService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    const found = this.products.find((p) => p.id === id);
    if (found) {
      this.product.set(found);
    } else {
      // Redirect back if not found
      this.router.navigate(["/inventory/products"]);
    }
  }

  toggleEdit() {
    if (!this.isEditing()) {
      this.editBuffer = { ...this.product() };
    }
    this.isEditing.set(!this.isEditing());
  }

  saveChanges() {
    // In a real app, this would be an API call
    this.product.set({ ...this.editBuffer });
    this.isEditing.set(false);

    // Show a success state or notification would go here
    console.log("Product updated:", this.product());
  }
}
