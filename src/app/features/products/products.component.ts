import { Component, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

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
  selector: "app-products",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-8 max-w-7xl mx-auto">
      <!-- Header Section -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h2
            class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
          >
            Products Hub
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage and monitor your industrial inventory levels.
          </p>
        </div>
        <button
          class="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          Add New Product
        </button>
      </div>

      <!-- Filters & Controls Bar -->
      <div class="mb-12">
        <div class="flex flex-col lg:flex-row justify-between items-end gap-8">
          <!-- Search & Category -->
          <div
            class="flex flex-col sm:flex-row items-end gap-8 w-full lg:w-auto"
          >
            <!-- Search Input -->
            <div class="floating-input-group w-full sm:w-72">
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                placeholder=" "
                class="floating-input"
                id="product-search"
              />
              <label class="floating-label" for="product-search"
                >Search Products</label
              >
              <svg
                class="w-4 h-4 absolute right-0 top-7 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>

            <!-- Modern Custom Category Dropdown -->
            <div class="relative w-full sm:w-64 group">
              <label
                class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2 block px-1"
                >Filter Category</label
              >
              <div
                (click)="categoryMenuOpen.set(!categoryMenuOpen())"
                class="flex items-center justify-between w-full bg-slate-50 dark:bg-white/[0.03] border-b-2 border-slate-200 dark:border-white/[0.1] py-2.5 px-1 cursor-pointer group hover:border-primary transition-all"
              >
                <span
                  class="text-sm font-bold text-slate-900 dark:text-white"
                  >{{ selectedCategory() }}</span
                >
                <svg
                  class="w-4 h-4 text-slate-400 group-hover:text-primary transition-all duration-300"
                  [class.rotate-180]="categoryMenuOpen()"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>

              <!-- Dropdown Menu -->
              <div
                *ngIf="categoryMenuOpen()"
                class="absolute left-0 right-0 mt-2 bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-2xl z-50 overflow-hidden animate-dropdown-in backdrop-blur-xl"
              >
                <div
                  *ngFor="let cat of categories"
                  (click)="selectCategory(cat)"
                  [class.bg-primary/10]="selectedCategory() === cat"
                  [class.text-primary]="selectedCategory() === cat"
                  class="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:text-primary cursor-pointer transition-all flex items-center justify-between group/item"
                >
                  {{ cat }}
                  <svg
                    *ngIf="selectedCategory() === cat"
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- View Toggle -->
          <div
            class="flex items-center gap-4 w-full lg:w-auto justify-end pb-1"
          >
            <span
              class="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2"
              >Layout</span
            >
            <div
              class="flex bg-slate-100 dark:bg-white/[0.05] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08]"
            >
              <button
                (click)="viewType.set('grid')"
                [class.bg-white]="viewType() === 'grid'"
                [class.dark:bg-white/10]="viewType() === 'grid'"
                [class.shadow-md]="viewType() === 'grid'"
                class="p-2.5 rounded-lg transition-all text-slate-500 hover:text-primary"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  ></path>
                </svg>
              </button>
              <button
                (click)="viewType.set('list')"
                [class.bg-white]="viewType() === 'list'"
                [class.dark:bg-white/10]="viewType() === 'list'"
                [class.shadow-md]="viewType() === 'list'"
                class="p-2.5 rounded-lg transition-all text-slate-500 hover:text-primary"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid View -->
      <div
        *ngIf="viewType() === 'grid'"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in"
      >
        <div
          *ngFor="let product of filteredProducts()"
          class="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 hover:border-primary/50 transition-all group shadow-sm hover:shadow-xl hover:shadow-primary/5"
        >
          <div
            class="w-full aspect-square bg-slate-50 dark:bg-white/5 rounded-xl mb-4 overflow-hidden relative"
          >
            <div
              class="absolute inset-0 flex items-center justify-center text-slate-200 dark:text-white/5"
            >
              <svg
                class="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                ></path>
              </svg>
            </div>
            <div class="absolute top-3 right-3">
              <span
                class="px-2 py-1 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/10"
              >
                {{ product.category }}
              </span>
            </div>
          </div>
          <h3
            class="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors"
          >
            {{ product.name }}
          </h3>
          <p
            class="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed"
          >
            {{ product.description }}
          </p>
          <div
            class="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5"
          >
            <div class="flex flex-col">
              <span class="text-lg font-black text-primary leading-none">{{
                product.price | currency
              }}</span>
              <span
                class="text-[9px] text-slate-400 uppercase tracking-tighter mt-1"
                >Unit Price</span
              >
            </div>
            <span
              class="text-[9px] font-bold px-2 py-1 bg-green-500/10 text-green-500 rounded-lg uppercase tracking-wider border border-green-500/20"
            >
              {{ product.stock }} In Stock
            </span>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div *ngIf="viewType() === 'list'" class="space-y-4 animate-fade-in">
        <div
          *ngFor="let product of filteredProducts()"
          class="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 flex items-center gap-6 hover:border-primary/50 transition-all shadow-sm"
        >
          <div
            class="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-200 dark:text-white/5"
          >
            <svg
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              ></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h3
                class="text-sm font-bold text-slate-900 dark:text-white truncate"
              >
                {{ product.name }}
              </h3>
              <span
                class="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >{{ product.category }}</span
              >
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
              {{ product.description }}
            </p>
          </div>
          <div class="text-right flex flex-col items-end gap-2 pr-4">
            <span class="text-base font-black text-primary">{{
              product.price | currency
            }}</span>
            <span
              class="text-[9px] font-bold px-2 py-1 bg-green-500/10 text-green-500 rounded-lg uppercase tracking-wider"
              >{{ product.stock }} units</span
            >
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="filteredProducts().length === 0"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div
          class="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-300 dark:text-white/10 mb-6"
        >
          <svg
            class="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          No products found
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <button
          (click)="resetFilters()"
          class="mt-6 text-sm font-bold text-primary hover:underline uppercase tracking-widest"
        >
          Clear all filters
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.4s ease-out forwards;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-dropdown-in {
        animation: dropdownIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      @keyframes dropdownIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
          scale: 0.95;
        }
        to {
          opacity: 1;
          transform: translateY(0);
          scale: 1;
        }
      }
    `,
  ],
})
export class ProductsComponent {
  viewType = signal<"grid" | "list">("grid");
  searchQuery = signal("");
  selectedCategory = signal("All");
  categoryMenuOpen = signal(false);

  categories = ["All", "Electronics", "Industrial", "Raw Materials"];

  products = signal<Product[]>([
    {
      id: 1,
      name: "Precision Logic Controller",
      category: "Industrial",
      price: 1240,
      stock: 45,
      description:
        "High-speed automated processing unit with dual redundancy support.",
      image: "",
    },
    {
      id: 2,
      name: "Thermal Flux Sensor",
      category: "Electronics",
      price: 450,
      stock: 120,
      description:
        "Advanced temperature monitoring with ±0.1°C precision accuracy.",
      image: "",
    },
    {
      id: 3,
      name: "Reinforced Steel Alloy",
      category: "Raw Materials",
      price: 89,
      stock: 2500,
      description:
        "High-tensile strength industrial grade steel for structural components.",
      image: "",
    },
    {
      id: 4,
      name: "Quantum Circuit Breaker",
      category: "Electronics",
      price: 2100,
      stock: 12,
      description:
        "Next-gen energy protection system with instant isolation capabilities.",
      image: "",
    },
    {
      id: 5,
      name: "Pneumatic Actuator X5",
      category: "Industrial",
      price: 670,
      stock: 88,
      description: "Heavy-duty air pressure driven mechanical movement system.",
      image: "",
    },
    {
      id: 6,
      name: "Industrial Grade Coolant",
      category: "Raw Materials",
      price: 150,
      stock: 430,
      description:
        "Non-corrosive heat dissipation fluid for high-temperature machinery.",
      image: "",
    },
    {
      id: 7,
      name: "Logic Gate Array V2",
      category: "Electronics",
      price: 320,
      stock: 15,
      description:
        "Programmable logic controller for complex sequence automation.",
      image: "",
    },
    {
      id: 8,
      name: "Heavy Duty Gear Box",
      category: "Industrial",
      price: 4500,
      stock: 5,
      description:
        "Ultra-durable transmission system for mining and heavy lifting.",
      image: "",
    },
  ]);

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();

    return this.products().filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);
      const matchesCat = cat === "All" || p.category === cat;
      return matchesSearch && matchesCat;
    });
  });

  selectCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.categoryMenuOpen.set(false);
  }

  resetFilters() {
    this.searchQuery.set("");
    this.selectedCategory.set("All");
  }
}
