import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import {
  CustomDropdownComponent,
  Customer,
  DropdownOption,
  InventoryDataService,
  PageHeaderComponent,
  SearchService,
  SkeletonComponent,
  StatusBadgeComponent,
} from "ui-shared";

@Component({
  selector: "app-customers",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SkeletonComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    CustomDropdownComponent,
  ],
  template: `
    <div class="p-3 sm:p-6 max-w-7xl mx-auto min-h-screen animate-fade-in">
      <lib-page-header
        title="Customer Directory"
        subtitle="Manage your business relationships and client history."
        [stats]="headerStats()"
        [breadcrumbs]="breadcrumbs"
        [count]="allFilteredCustomers().length"
        [loading]="isLoading()"
        actionLabel="Add New Customer"
        backLink="/inventory"
        (action)="router.navigate(['/inventory/customers/create'])"
      ></lib-page-header>

      <!-- Filters Bar (High Density) -->
      <div
        class="mb-5 flex flex-col md:flex-row gap-4 items-end bg-white dark:bg-white/5 p-2 rounded-xl"
      >
        <div class="flex-1 w-full relative group">
          <div class="floating-input-group">
            <input
              type="text"
              id="cust-search"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder=" "
              class="floating-input"
            />
            <label for="cust-search" class="floating-label"
              >Search Customer</label
            >
            <div class="absolute right-1 top-6">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="w-full md:w-40">
          <lib-custom-dropdown
            [options]="pageSizeOptions"
            [value]="pageSize()"
            [placeholder]="'Per Page'"
            (valueChange)="pageSize.set($event); currentPage.set(1)"
          ></lib-custom-dropdown>
        </div>

        <div
          class="flex bg-slate-100 dark:bg-white/[0.05] p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner"
        >
          @for (status of ["All", "Active", "Inactive"]; track status) {
            <button
              (click)="filterStatus.set(status)"
              [class.bg-white]="filterStatus() === status"
              [class.dark:bg-white/10]="filterStatus() === status"
              [class.shadow-sm]="filterStatus() === status"
              [class.text-primary]="filterStatus() === status"
              class="px-4 py-1.5 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              {{ status }}
            </button>
          }
        </div>
      </div>

      @if (isLoading()) {
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
            <div class="card-premium p-6 space-y-4">
              <div class="flex items-center gap-4">
                <lib-skeleton
                  width="50px"
                  height="50px"
                  shape="rounded"
                ></lib-skeleton>
                <div class="space-y-2 flex-1">
                  <lib-skeleton width="80%" height="1rem"></lib-skeleton>
                  <lib-skeleton width="40%" height="0.5rem"></lib-skeleton>
                </div>
              </div>
              <lib-skeleton width="100%" height="3rem"></lib-skeleton>
            </div>
          }
        </div>
      } @else {
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in"
        >
          @for (customer of paginatedCustomers(); track customer.id) {
            <div
              [routerLink]="[customer.id]"
              class="card-premium p-4 group hover:border-primary/50 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
            >
              <div class="flex items-center gap-3 mb-4 relative z-10">
                <div
                  class="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-slate-100 dark:border-white/10"
                >
                  {{ customer.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3
                    class="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors"
                  >
                    {{ customer.name }}
                  </h3>
                  <p
                    class="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate"
                  >
                    {{ customer.company }}
                  </p>
                </div>
              </div>

              <div class="space-y-2 mb-4 flex-1 relative z-10">
                <div
                  class="flex items-center gap-2 text-[10px] font-medium text-slate-600 dark:text-slate-400 p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5"
                >
                  <svg
                    class="w-3.5 h-3.5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span class="truncate">{{ customer.email }}</span>
                </div>
              </div>

              <div
                class="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between relative z-10"
              >
                <div class="flex flex-col">
                  <span
                    class="text-[8px] font-black uppercase tracking-widest text-slate-400"
                    >Since</span
                  >
                  <span
                    class="text-[10px] font-black text-slate-900 dark:text-white"
                    >{{ customer.joinDate | date: "MMM d, yyyy" }}</span
                  >
                </div>
                <lib-status-badge
                  [status]="customer.status"
                  class="scale-90 origin-right"
                ></lib-status-badge>
              </div>
            </div>
          }
        </div>

        <!-- Pagination (Compact) -->
        <div
          *ngIf="allFilteredCustomers().length > 0"
          class="mt-8 p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm shadow-sm"
        >
          <div class="flex items-center gap-4">
            <span
              class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
            >
              Records:
              <span class="text-slate-900 dark:text-white">{{
                paginatedCustomers().length
              }}</span>
              / {{ allFilteredCustomers().length }}
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
              @for (p of [].constructor(totalPages()); track $index) {
                @if ($index < 5 || $index === totalPages() - 1) {
                  <button
                    (click)="setPage($index + 1)"
                    [class.bg-primary]="currentPage() === $index + 1"
                    [class.text-white]="currentPage() === $index + 1"
                    class="w-8 h-8 rounded-lg text-[10px] font-black transition-all hover:bg-primary/10"
                  >
                    {{ $index + 1 }}
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

        @if (allFilteredCustomers().length === 0) {
          <div
            class="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 animate-fade-in"
          >
            <div
              class="w-20 h-20 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-400 mb-6"
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">
              No Customers Found
            </h3>
            <p class="text-slate-500 font-medium">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
        }
      }
    </div>
  `,
  styles: [],
})
export class CustomersComponent implements OnInit {
  private dataService = inject(InventoryDataService);
  private searchService = inject(SearchService);
  public router = inject(Router);

  isLoading = signal(true);
  searchQuery = signal("");
  filterStatus = signal("All");
  currentPage = signal(1);
  pageSize = signal(12);

  breadcrumbs = [
    { label: "Dashboard", link: "/dashboard" },
    { label: "Inventory", link: "/inventory" },
    { label: "Customers" },
  ];

  pageSizeOptions: DropdownOption[] = [
    { value: 12, label: "12 Per Page" },
    { value: 24, label: "24 Per Page" },
    { value: 48, label: "48 Per Page" },
    { value: 100, label: "100 Per Page" },
  ];

  customers = this.dataService.customers;

  headerStats = computed(() => [
    {
      label: "Total Clients",
      value: this.customers().length,
      color: "primary" as const,
    },
    {
      label: "Active Business",
      value: this.customers().filter((c: Customer) => c.status === "Active")
        .length,
      color: "success" as const,
    },
    {
      label: "Avg. Retention",
      value: "94%",
      color: "info" as const,
    },
  ]);

  allFilteredCustomers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.filterStatus();

    return this.customers().filter((c: Customer) => {
      const matchesSearch =
        c.name.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query);
      const matchesStatus = status === "All" || c.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  paginatedCustomers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.allFilteredCustomers().slice(start, start + this.pageSize());
  });

  totalPages = computed(() =>
    Math.ceil(this.allFilteredCustomers().length / this.pageSize()),
  );

  ngOnInit(): void {
    this.registerSearchItems();
    setTimeout(() => this.isLoading.set(false), 800);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  private registerSearchItems(): void {
    const items = this.customers().map((c: Customer) => ({
      id: `cust-${c.id}`,
      title: c.name,
      path: `/inventory/customers/${c.id}`,
      category: "Customer",
      keywords: [c.company, c.email],
    }));
    this.searchService.register(items);
  }
}
