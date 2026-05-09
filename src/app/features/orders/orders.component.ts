import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import {
  CustomDropdownComponent,
  DropdownOption,
  InventoryDataService,
  PageHeaderComponent,
  SkeletonComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
} from "ui-shared";

@Component({
  selector: "app-orders",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SkeletonComponent,
    CustomDropdownComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="p-3 sm:p-6 max-w-7xl mx-auto min-h-screen animate-fade-in">
      <lib-page-header
        title="Order Tracking"
        subtitle="Monitor and manage all incoming industrial orders in real-time."
        [stats]="headerStats()"
        [breadcrumbs]="breadcrumbs"
        [count]="allFilteredOrders().length"
        [loading]="isLoading()"
        actionLabel="Create New Order"
        backLink="/dashboard"
        (action)="router.navigate(['/inventory/orders/create'])"
      ></lib-page-header>

      <!-- Filters Bar (Ultra Compact) -->
      <div
        class="mb-3 flex flex-col lg:flex-row justify-between items-end gap-3 bg-white dark:bg-white/5 p-2 rounded-xl"
      >
        <div class="flex flex-col sm:flex-row items-end gap-3 w-full lg:w-auto">
          <div class="floating-input-group w-full sm:w-60">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder=" "
              class="floating-input"
              id="order-search"
            />
            <label class="floating-label" for="order-search"
              >Search Orders</label
            >
            <div class="absolute right-1 top-6">
              @if (!searchQuery()) {
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
              } @else {
                <button
                  (click)="searchQuery.set('')"
                  class="p-1 text-slate-400 hover:text-rose-500 transition-colors"
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
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              }
            </div>
          </div>

          <div class="w-full sm:w-48">
            <lib-custom-dropdown
              [options]="statusOptions"
              [value]="selectedStatus()"
              [placeholder]="'Order Status'"
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
      </div>

      @if (isLoading()) {
        <div class="card-premium p-6 space-y-4">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div
              class="flex justify-between items-center py-4 border-b border-slate-50 dark:border-white/5 last:border-0"
            >
              <div class="flex gap-10">
                <lib-skeleton width="80px" height="20px"></lib-skeleton>
                <lib-skeleton width="180px" height="20px"></lib-skeleton>
              </div>
              <lib-skeleton
                width="100px"
                height="30px"
                shape="rounded"
              ></lib-skeleton>
            </div>
          }
        </div>
      } @else {
        <div
          class="card-premium overflow-hidden animate-fade-in shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          @if (allFilteredOrders().length > 0) {
            <div class="overflow-x-auto custom-scrollbar">
              <table class="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr
                    class="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.06]"
                  >
                    <th
                      (click)="toggleSort('id')"
                      class="px-6 py-4 cursor-pointer group"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors"
                          >ID</span
                        >
                        <svg
                          class="w-2.5 h-2.5 transition-all duration-300"
                          [class.text-primary]="sortField() === 'id'"
                          [class.text-slate-200]="sortField() !== 'id'"
                          [class.rotate-180]="
                            sortField() === 'id' && sortOrder() === 'desc'
                          "
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </th>
                    <th
                      (click)="toggleSort('customerName')"
                      class="px-6 py-4 cursor-pointer group"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors"
                          >Client</span
                        >
                        <svg
                          class="w-2.5 h-2.5 transition-all duration-300"
                          [class.text-primary]="sortField() === 'customerName'"
                          [class.text-slate-200]="
                            sortField() !== 'customerName'
                          "
                          [class.rotate-180]="
                            sortField() === 'customerName' &&
                            sortOrder() === 'desc'
                          "
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </th>
                    <th class="px-6 py-4">
                      <span
                        class="text-[9px] font-black uppercase tracking-widest text-slate-400"
                        >Status</span
                      >
                    </th>
                    <th
                      (click)="toggleSort('date')"
                      class="px-6 py-4 cursor-pointer group"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors"
                          >Date</span
                        >
                        <svg
                          class="w-2.5 h-2.5 transition-all duration-300"
                          [class.text-primary]="sortField() === 'date'"
                          [class.text-slate-200]="sortField() !== 'date'"
                          [class.rotate-180]="
                            sortField() === 'date' && sortOrder() === 'desc'
                          "
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </th>
                    <th
                      (click)="toggleSort('totalAmount')"
                      class="px-6 py-4 text-right cursor-pointer group"
                    >
                      <div class="flex items-center justify-end gap-2">
                        <span
                          class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors"
                          >Amount</span
                        >
                        <svg
                          class="w-2.5 h-2.5 transition-all duration-300"
                          [class.text-primary]="sortField() === 'totalAmount'"
                          [class.text-slate-200]="sortField() !== 'totalAmount'"
                          [class.rotate-180]="
                            sortField() === 'totalAmount' &&
                            sortOrder() === 'desc'
                          "
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="divide-y divide-slate-100 dark:divide-white/[0.04]"
                >
                  @for (order of paginatedOrders(); track order.id) {
                    <tr
                      [routerLink]="[order.id]"
                      class="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all group cursor-pointer"
                    >
                      <td class="px-6 py-3">
                        <span class="text-xs font-black text-primary"
                          >#{{ order.id }}</span
                        >
                      </td>
                      <td class="px-6 py-3">
                        <div class="flex flex-col">
                          <p
                            class="text-xs font-bold text-slate-900 dark:text-white"
                          >
                            {{ order.customerName }}
                          </p>
                          <p
                            class="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none"
                          >
                            Industrial Sector
                          </p>
                        </div>
                      </td>
                      <td class="px-6 py-3">
                        <lib-status-badge
                          [status]="order.status"
                          class="scale-90 origin-left"
                        ></lib-status-badge>
                      </td>
                      <td class="px-6 py-3">
                        <span class="text-[10px] font-bold text-slate-500">{{
                          order.date
                        }}</span>
                      </td>
                      <td class="px-6 py-3 text-right">
                        <span
                          class="text-sm font-black text-slate-900 dark:text-white"
                          >{{ order.totalAmount | currency }}</span
                        >
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination (Compact) -->
            <div
              class="px-5 py-3 bg-slate-50/50 dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <span
                class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
              >
                Records:
                <span class="text-slate-900 dark:text-white">{{
                  paginatedOrders().length
                }}</span>
                / {{ allFilteredOrders().length }}
              </span>
              <div class="flex items-center gap-2">
                <button
                  [disabled]="currentPage() === 1"
                  (click)="setPage(currentPage() - 1)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/5 transition-all disabled:opacity-20 text-slate-600 dark:text-slate-400"
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
                        [class.bg-primary]="$index + 1 === currentPage()"
                        [class.text-white]="$index + 1 === currentPage()"
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
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/5 transition-all disabled:opacity-20 text-slate-600 dark:text-slate-400"
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
              title="No Orders Located"
              message="Adjust your search query or status filter to refine your order tracking."
              actionLabel="Reset Filters"
              (action)="searchQuery.set(''); selectedStatus.set('All Statuses')"
            ></lib-empty-state>
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
export class OrdersComponent implements OnInit {
  public dataService = inject(InventoryDataService);
  public router = inject(Router);

  isLoading = signal(true);
  searchQuery = signal("");
  selectedStatus = signal("All Statuses");
  sortField = signal<string>("id");
  sortOrder = signal<"asc" | "desc">("desc");
  currentPage = signal(1);
  pageSize = signal(10);

  breadcrumbs = [
    { label: "Dashboard", link: "/dashboard" },
    { label: "Inventory", link: "/inventory" },
    { label: "Orders" },
  ];

  pageSizeOptions: DropdownOption[] = [
    { value: 10, label: "10 Per Page" },
    { value: 25, label: "25 Per Page" },
    { value: 50, label: "50 Per Page" },
    { value: 100, label: "100 Per Page" },
  ];

  statusOptions: DropdownOption[] = [
    { value: "All Statuses", label: "All Statuses" },
    { value: "Pending", label: "Pending" },
    { value: "Processing", label: "Processing" },
    { value: "Shipped", label: "Shipped" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  orders = this.dataService.orders;

  headerStats = computed(() => [
    {
      label: "Total Orders",
      value: this.orders().length,
      color: "primary" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>',
    },
    {
      label: "Pending",
      value: this.orders().filter((o) => o.status === "Pending").length,
      color: "warning" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
    },
    {
      label: "Revenue",
      value:
        "$" +
        this.orders()
          .reduce((acc, o) => acc + (o.totalAmount || 0), 0)
          .toLocaleString(),
      color: "success" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
    },
  ]);

  ngOnInit(): void {
    setTimeout(() => this.isLoading.set(false), 1000);
  }

  allFilteredOrders = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const field = this.sortField();
    const order = this.sortOrder();

    let result = this.orders().filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(query) ||
        (o.customerName || "").toLowerCase().includes(query);
      const matchesStatus = status === "All Statuses" || o.status === status;
      return matchesSearch && matchesStatus;
    });

    return result.sort((a: any, b: any) => {
      const valA = a[field];
      const valB = b[field];
      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });
  });

  paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.allFilteredOrders().slice(start, start + this.pageSize());
  });

  totalPages = computed(() =>
    Math.ceil(this.allFilteredOrders().length / this.pageSize()),
  );

  selectStatus(status: string) {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  toggleSort(field: string) {
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === "asc" ? "desc" : "asc");
    } else {
      this.sortField.set(field);
      this.sortOrder.set("asc");
    }
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
