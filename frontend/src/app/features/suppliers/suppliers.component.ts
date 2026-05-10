import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import {
  CustomDropdownComponent,
  DropdownOption,
  InventoryDataService,
  SearchService,
  SkeletonComponent,
  PageHeaderComponent,
  EmptyStateComponent,
} from "ui-shared";

@Component({
  selector: "app-suppliers",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SkeletonComponent,
    CustomDropdownComponent,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="p-3 sm:p-5 max-w-7xl mx-auto animate-fade-in">
      <lib-page-header
        title="Suppliers Network"
        subtitle="Manage your global vendor relationships and procurement sources."
        [stats]="headerStats()"
        [breadcrumbs]="breadcrumbs"
        [count]="allFilteredSuppliers().length"
        [loading]="isLoading()"
        [isActionLoading]="isActionLoading()"
        actionLabel="Add New Supplier"
        backLink="/dashboard"
        (action)="router.navigate(['/inventory/suppliers/create'])"
      ></lib-page-header>

      <!-- Filters & Controls Bar -->
      <div class="mb-6">
        <div class="flex flex-col lg:flex-row justify-between items-end gap-5">
          <!-- Search & Status -->
          <div
            class="flex flex-col sm:flex-row items-end gap-5 w-full lg:w-auto"
          >
            <!-- Search Input -->
            <div class="floating-input-group w-full sm:w-72">
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                placeholder=" "
                class="floating-input"
                id="supplier-search"
              />
              <label class="floating-label" for="supplier-search"
                >Search Suppliers</label
              >
              <div class="absolute right-0 top-7">
                @if (searchQuery()) {
                  <button
                    (click)="searchQuery.set('')"
                    class="p-1 text-slate-400 hover:text-rose-500 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                } @else {
                  <svg
                    class="w-4 h-4 text-slate-400"
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
                }
              </div>
            </div>

            <div class="w-full sm:w-56">
              <lib-custom-dropdown
                [options]="statusOptions"
                [value]="selectedStatus()"
                [placeholder]="'Filter Status'"
                (valueChange)="selectStatus($event)"
              ></lib-custom-dropdown>
            </div>

            <div class="w-full sm:w-40">
              <lib-custom-dropdown
                [options]="pageSizeOptions"
                [value]="pageSize()"
                [placeholder]="'Per Page'"
                (valueChange)="pageSize.set($event); currentPage.set(1)"
              ></lib-custom-dropdown>
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

      <!-- Content Area -->
      @defer (when !isLoading()) {
        <div class="mt-5 animate-fade-in">
          @if (viewType() === "grid") {
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in"
            >
              @for (supplier of paginatedSuppliers(); track supplier.id) {
                <div
                  [routerLink]="[supplier.id]"
                  class="card-premium p-3 hover:border-primary/50 transition-all group cursor-pointer"
                >
                  <div class="flex items-center gap-3 mb-4">
                    <div
                      class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xl"
                    >
                      {{ supplier.name[0] }}
                    </div>
                    <div>
                      <h3
                        class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors"
                      >
                        {{ supplier.name }}
                      </h3>
                      <p
                        class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest"
                      >
                        {{ supplier.category }}
                      </p>
                    </div>
                  </div>

                  <div class="space-y-2 mb-4">
                    <div
                      class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
                    >
                      <svg
                        class="w-3.5 h-3.5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                      {{ supplier.email }}
                    </div>
                    <div
                      class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
                    >
                      <svg
                        class="w-3.5 h-3.5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      {{ supplier.location }}
                    </div>
                  </div>

                  <div
                    class="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5"
                  >
                    <span
                      [class]="getStatusClass(supplier.status)"
                      class="text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider border"
                    >
                      {{ supplier.status }}
                    </span>
                    <span
                      class="text-[10px] font-black text-slate-400 uppercase"
                    >
                      Score:
                      <span class="text-primary"
                        >{{ supplier.reliability }}%</span
                      >
                    </span>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="space-y-2 animate-fade-in">
              @for (supplier of paginatedSuppliers(); track supplier.id) {
                <div
                  [routerLink]="[supplier.id]"
                  class="card-premium p-2 px-3 flex items-center gap-3 hover:border-primary/50 transition-all shadow-sm group cursor-pointer"
                >
                  <div
                    class="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center text-primary font-black"
                  >
                    {{ supplier.name[0] }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-0.5">
                      <h3
                        class="text-sm font-bold text-slate-900 dark:text-white truncate"
                      >
                        {{ supplier.name }}
                      </h3>
                      <span
                        class="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                      >
                        {{ supplier.category }}
                      </span>
                    </div>
                    <p
                      class="text-xs text-slate-500 dark:text-slate-400 truncate"
                    >
                      {{ supplier.email }} • {{ supplier.location }}
                    </p>
                  </div>
                  <div class="text-right flex flex-col items-end gap-2 pr-4">
                    <span
                      [class]="getStatusClass(supplier.status)"
                      class="text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider border"
                    >
                      {{ supplier.status }}
                    </span>
                    <span class="text-[10px] font-black text-slate-400"
                      >Reliability: {{ supplier.reliability }}%</span
                    >
                  </div>
                </div>
              }
            </div>
          }

          <!-- Pagination (Compact) -->
          @if (allFilteredSuppliers().length > 0) {
            <div
              class="mt-6 p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm backdrop-blur-sm"
            >
              <div class="flex items-center gap-4">
                <span
                  class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
                >
                  Records:
                  <span class="text-slate-900 dark:text-white">{{
                    paginatedSuppliers().length
                  }}</span>
                  / {{ allFilteredSuppliers().length }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  [disabled]="currentPage() === 1"
                  (click)="setPage(currentPage() - 1)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 hover:border-primary/50 hover:bg-white dark:hover:bg-white/5 transition-all disabled:opacity-20"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                </button>

                <div class="flex items-center gap-1">
                  @for (p of pages(); track p) {
                    @if (p <= 5 || p === totalPages()) {
                      <button
                        (click)="setPage(p)"
                        [class.bg-primary]="currentPage() === p"
                        [class.text-white]="currentPage() === p"
                        class="w-8 h-8 rounded-lg text-[10px] font-black transition-all hover:bg-primary/10"
                      >
                        {{ p }}
                      </button>
                    }
                  }
                </div>

                <button
                  [disabled]="currentPage() === totalPages()"
                  (click)="setPage(currentPage() + 1)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 hover:border-primary/50 hover:bg-white dark:hover:bg-white/5 transition-all disabled:opacity-20"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          } @else {
            <lib-empty-state
              title="No Suppliers Found"
              message="We couldn't find any vendors matching your current search or status filter."
              actionLabel="Clear Filters"
              (action)="searchQuery.set(''); selectedStatus.set('All')"
            ></lib-empty-state>
          }
        </div>
      } @placeholder {
        <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (i of [1, 2, 3, 4]; track i) {
            <div
              class="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 space-y-3"
            >
              <lib-skeleton
                width="100%"
                height="100px"
                shape="rounded"
              ></lib-skeleton>
              <lib-skeleton width="75%" height="1rem"></lib-skeleton>
            </div>
          }
        </div>
      }
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
export class SuppliersComponent implements OnInit {
  public dataService = inject(InventoryDataService);
  private searchService = inject(SearchService);
  public router = inject(Router);

  isLoading = signal(true);
  isActionLoading = signal(false);
  viewType = signal<"grid" | "list">("grid");
  searchQuery = signal("");
  selectedStatus = signal("All");
  currentPage = signal(1);
  pageSize = signal(8);

  breadcrumbs = [
    { label: "Dashboard", link: "/dashboard" },
    { label: "Inventory", link: "/inventory" },
    { label: "Suppliers" },
  ];

  pageSizeOptions: DropdownOption[] = [
    { value: 8, label: "8 Per Page" },
    { value: 16, label: "16 Per Page" },
    { value: 32, label: "32 Per Page" },
    { value: 50, label: "50 Per Page" },
  ];

  statusOptions: DropdownOption[] = [
    { value: "All", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Pending", label: "Pending" },
    { value: "Inactive", label: "Inactive" },
  ];

  suppliers = this.dataService.suppliers;

  headerStats = computed(() => [
    {
      label: "Active Vendors",
      value: this.suppliers().length.toString(),
      color: "primary" as const,
    },
    {
      label: "Network Reach",
      value: "Global",
      color: "info" as const,
    },
    {
      label: "Reliability",
      value: "98.4%",
      color: "success" as const,
    },
  ]);

  ngOnInit(): void {
    setTimeout(() => this.isLoading.set(false), 1000);
  }

  allFilteredSuppliers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();

    return this.suppliers().filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query);
      const matchesStatus = status === "All" || s.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  paginatedSuppliers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.allFilteredSuppliers().slice(start, start + this.pageSize());
  });

  totalPages = computed(() =>
    Math.ceil(this.allFilteredSuppliers().length / this.pageSize()),
  );

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  selectStatus(status: string) {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case "Active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Inactive":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  }
}
