import { Component, signal, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import {
  InventoryDataService,
  Customer,
  SearchService,
  SkeletonComponent,
  NotificationService,
} from "ui-shared";

@Component({
  selector: "app-customers",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonComponent],
  template: `
    <div class="p-3 sm:p-5 max-w-7xl mx-auto">
      <!-- Header Section -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5"
      >
        <div>
          <h2
            class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
          >
            Customer Directory
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your business relationships and client history.
          </p>
        </div>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto"
        >
          <div
            class="flex items-center gap-3 bg-white dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 w-full sm:w-auto shadow-sm"
          >
            <div
              class="px-4 py-2 text-center border-r border-slate-100 dark:border-white/5"
            >
              <p
                class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
              >
                Total Clients
              </p>
              <p
                class="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center min-h-[28px]"
              >
                @if (isLoading()) {
                  <span class="dots-wave"
                    ><span></span><span></span><span></span
                  ></span>
                } @else {
                  {{ customers().length }}
                }
              </p>
            </div>
            <div class="px-4 py-2 text-center">
              <p
                class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
              >
                Active
              </p>
              <p
                class="text-lg font-black text-primary flex items-center justify-center min-h-[28px]"
              >
                @if (isLoading()) {
                  <span class="dots-wave"
                    ><span></span><span></span><span></span
                  ></span>
                } @else {
                  {{ activeCount() }}
                }
              </p>
            </div>
          </div>
          <button
            (click)="addCustomer()"
            [disabled]="isAddingCustomer()"
            [class.btn-loading]="isAddingCustomer()"
            class="btn-primary-premium w-full sm:w-auto !px-6 !py-3.5 flex items-center justify-center gap-2 group"
          >
            <svg
              class="w-4 h-4 group-hover:rotate-45 transition-transform duration-300"
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
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="mb-6">
        <div class="flex flex-col sm:flex-row items-end gap-5">
          <div class="floating-input-group w-full sm:w-72">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder=" "
              class="floating-input"
              id="customer-search"
            />
            <label class="floating-label" for="customer-search"
              >Search Customers</label
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

          <div
            class="flex bg-slate-100 dark:bg-white/[0.05] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08]"
          >
            <button
              (click)="filterStatus.set('All')"
              [class.bg-white]="filterStatus() === 'All'"
              [class.dark:bg-white/10]="filterStatus() === 'All'"
              class="px-4 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest"
              [class.text-primary]="filterStatus() === 'All'"
            >
              All
            </button>
            <button
              (click)="filterStatus.set('Active')"
              [class.bg-white]="filterStatus() === 'Active'"
              [class.dark:bg-white/10]="filterStatus() === 'Active'"
              class="px-4 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest"
              [class.text-primary]="filterStatus() === 'Active'"
            >
              Active
            </button>
            <button
              (click)="filterStatus.set('Inactive')"
              [class.bg-white]="filterStatus() === 'Inactive'"
              [class.dark:bg-white/10]="filterStatus() === 'Inactive'"
              class="px-4 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest"
              [class.text-primary]="filterStatus() === 'Inactive'"
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area: Defer loading actual grid -->
      @defer (when !isLoading()) {
        <div class="mt-8 animate-fade-in">
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            @for (customer of filteredCustomers(); track customer.id) {
              <div
                [routerLink]="['/inventory/customers', customer.id]"
                class="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 hover:border-primary/50 transition-all group hover:shadow-sm cursor-pointer"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors text-lg font-black"
                  >
                    {{ customer.name.charAt(0) }}
                  </div>
                  <div>
                    <h3
                      class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1"
                    >
                      {{ customer.name }}
                    </h3>
                    <p
                      class="text-[10px] text-slate-400 font-bold uppercase tracking-widest"
                    >
                      {{ customer.company }}
                    </p>
                  </div>
                </div>

                <div class="space-y-2 mb-4">
                  <div class="flex items-center gap-3 text-xs text-slate-500">
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {{ customer.email }}
                  </div>
                  <div class="flex items-center gap-3 text-xs text-slate-500">
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {{ customer.phone }}
                  </div>
                </div>

                <div
                  class="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between"
                >
                  <span
                    class="text-[9px] font-black uppercase tracking-widest text-slate-400"
                    >Joined {{ customer.joinDate | date: "MMM YYYY" }}</span
                  >
                  <span
                    [ngClass]="{
                      'bg-green-500/10 text-green-500 border-green-500/20':
                        customer.status === 'Active',
                      'bg-slate-500/10 text-slate-500 border-slate-500/20':
                        customer.status === 'Inactive',
                    }"
                    class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-current/20"
                  >
                    {{ customer.status }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      } @placeholder {
        <div class="mt-8">
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
              <div
                class="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 space-y-4"
              >
                <div class="flex items-center gap-4">
                  <lib-skeleton
                    width="48px"
                    height="48px"
                    shape="rounded"
                  ></lib-skeleton>
                  <div class="space-y-2">
                    <lib-skeleton width="96px" height="1rem"></lib-skeleton>
                    <lib-skeleton width="64px" height="0.5rem"></lib-skeleton>
                  </div>
                </div>
                <div class="space-y-3">
                  <lib-skeleton width="100%" height="0.75rem"></lib-skeleton>
                  <lib-skeleton width="66%" height="0.75rem"></lib-skeleton>
                </div>
                <div
                  class="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between"
                >
                  <lib-skeleton width="64px" height="0.75rem"></lib-skeleton>
                  <lib-skeleton
                    width="48px"
                    height="1rem"
                    shape="rounded"
                  ></lib-skeleton>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class CustomersComponent implements OnInit {
  private dataService = inject(InventoryDataService);
  private searchService = inject(SearchService);

  customers = this.dataService.customers;
  activeCount = computed(
    () => this.customers().filter((c) => c.status === "Active").length,
  );
  isLoading = signal(true);
  isAddingCustomer = signal(false);
  searchQuery = signal("");
  filterStatus = signal("All");

  private notificationService = inject(NotificationService);

  filteredCustomers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.filterStatus();

    return this.customers().filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query);
      const matchesStatus = status === "All" || c.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.registerSearchItems();
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }

  addCustomer(): void {
    this.isAddingCustomer.set(true);
    setTimeout(() => {
      this.isAddingCustomer.set(false);
      this.notificationService.success(
        "Customer Added",
        "The new customer has been added to the directory.",
      );
    }, 2000);
  }

  private registerSearchItems(): void {
    const items = this.customers().map((c) => ({
      id: `cust-${c.id}`,
      title: c.name,
      path: `/inventory/customers/${c.id}`,
      category: "Customer",
      keywords: [c.company, c.email],
    }));
    this.searchService.register(items);
  }
}
