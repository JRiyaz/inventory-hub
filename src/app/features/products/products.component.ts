import { Component, signal, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SearchService } from "ui-shared";

import {
  InventoryDataService,
  Product,
} from "../../core/services/inventory-data.service";

@Component({
  selector: "app-products",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
        <div
          class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto"
        >
          <div
            class="flex items-center gap-3 bg-white dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm w-full sm:w-auto"
          >
            <div class="px-4 py-2 text-center">
              <p
                class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
              >
                Total Stock
              </p>
              <p class="text-lg font-black text-primary">
                {{ products().length }}
              </p>
            </div>
          </div>
          <button
            class="w-full sm:w-auto px-6 py-3.5 bg-primary text-white rounded-2xl font-black text-[11px] hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 uppercase tracking-[0.15em] flex items-center justify-center gap-3 group"
          >
            <svg
              class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Add New Product
          </button>
        </div>
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
          *ngFor="let product of paginatedProducts()"
          [routerLink]="['/inventory/products', product.id]"
          class="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 hover:border-primary/50 transition-all group shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
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
          *ngFor="let product of paginatedProducts()"
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

      <!-- Pagination Bar -->
      <div
        *ngIf="allFilteredProducts().length > 0"
        class="mt-10 px-6 py-5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm"
      >
        <div class="flex flex-wrap items-center gap-6">
          <!-- Count Display -->
          <div class="flex items-center gap-3">
            <span
              class="text-[10px] font-black uppercase tracking-widest text-slate-400"
              >Showing</span
            >
            <div
              class="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm"
            >
              <span class="text-xs font-black text-primary">{{
                paginatedProducts().length
              }}</span>
              <span
                class="text-[9px] font-bold text-slate-400 uppercase tracking-tight"
                >of</span
              >
              <span class="text-xs font-black text-slate-900 dark:text-white">{{
                allFilteredProducts().length
              }}</span>
            </div>
            <span
              class="text-[10px] font-black uppercase tracking-widest text-slate-400"
              >Matches</span
            >
            <span
              *ngIf="searchQuery() || selectedCategory() !== 'All'"
              class="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-md border border-primary/20 animate-fade-in"
              >Filtered</span
            >
          </div>

          <!-- Page Size Selector -->
          <div
            class="flex items-center gap-3 border-l border-slate-200 dark:border-white/10 pl-6"
          >
            <span
              class="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap"
              >Show per page</span
            >
            <div
              class="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10"
            >
              <button
                *ngFor="let size of [8, 16, 32]"
                (click)="setPageSize(size)"
                [class.bg-white]="pageSize() === size"
                [class.dark:bg-white/10]="pageSize() === size"
                [class.shadow-sm]="pageSize() === size"
                [class.text-primary]="pageSize() === size"
                [class.text-slate-400]="pageSize() !== size"
                class="px-3 py-1.5 text-[10px] font-black rounded-lg transition-all hover:text-primary"
              >
                {{ size }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button
            [disabled]="currentPage() === 1"
            (click)="setPage(currentPage() - 1)"
            class="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all shadow-sm"
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
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>

          <div class="flex items-center gap-1 mx-2">
            <button
              *ngFor="let page of pagesArray()"
              (click)="setPage(page)"
              [class.bg-primary]="currentPage() === page"
              [class.text-white]="currentPage() === page"
              [class.border-primary]="currentPage() === page"
              [class.border-slate-200]="currentPage() !== page"
              [class.dark:border-white/10]="currentPage() !== page"
              class="w-10 h-10 rounded-xl text-xs font-black border transition-all hover:border-primary shadow-sm"
            >
              {{ page }}
            </button>
          </div>

          <button
            [disabled]="currentPage() === totalPages()"
            (click)="setPage(currentPage() + 1)"
            class="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all shadow-sm"
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
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="allFilteredProducts().length === 0"
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
  styles: [],
})
export class ProductsComponent implements OnInit {
  private dataService = inject(InventoryDataService);
  private searchService = inject(SearchService);
  viewType = signal<"grid" | "list">("grid");
  searchQuery = signal("");
  selectedCategory = signal("All");
  categoryMenuOpen = signal(false);

  // Pagination Signals
  currentPage = signal(1);
  pageSize = signal(8);

  categories = ["All", "Electronics", "Industrial", "Raw Materials"];

  products = this.dataService.products;

  ngOnInit(): void {
    this.registerSearchItems();
  }

  private registerSearchItems(): void {
    const items = this.products().map((p) => ({
      id: `prod-${p.id}`,
      title: p.name,
      path: `/inventory/products/${p.id}`,
      category: "Product",
      keywords: [p.category, p.description],
    }));
    this.searchService.register(items);
  }

  allFilteredProducts = computed(() => {
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

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.allFilteredProducts().slice(start, end);
  });

  totalPages = computed(() =>
    Math.ceil(this.allFilteredProducts().length / this.pageSize()),
  );

  pagesArray = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  selectCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.categoryMenuOpen.set(false);
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  setPageSize(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  resetFilters() {
    this.searchQuery.set("");
    this.selectedCategory.set("All");
    this.currentPage.set(1);
  }
}
