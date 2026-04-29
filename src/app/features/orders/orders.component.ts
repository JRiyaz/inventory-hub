import { Component, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface Order {
  id: string;
  customer: string;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  amount: number;
  date: string;
  priority: boolean;
}

@Component({
  selector: "app-orders",
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
            Order Tracking
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Monitor and manage all incoming industrial orders in real-time.
          </p>
        </div>
        <div
          class="flex items-center gap-3 bg-white dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm"
        >
          <div
            class="px-4 py-2 text-center border-r border-slate-100 dark:border-white/5"
          >
            <p
              class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
            >
              Total
            </p>
            <p class="text-lg font-black text-primary">{{ orders().length }}</p>
          </div>
          <div class="px-4 py-2 text-center">
            <p
              class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
            >
              Pending
            </p>
            <p class="text-lg font-black text-amber-500">
              {{ pendingCount() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Filters & Controls Bar -->
      <div class="mb-8">
        <div
          class="flex flex-col lg:flex-row justify-between items-end gap-6 bg-white dark:bg-white/[0.02] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm"
        >
          <div
            class="flex flex-col sm:flex-row items-end gap-6 w-full lg:w-auto"
          >
            <!-- Search Input -->
            <div class="floating-input-group w-full sm:w-72">
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

            <!-- Status Dropdown -->
            <div class="relative w-full sm:w-64 group">
              <label
                class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2 block px-1"
                >Order Status</label
              >
              <div
                (click)="statusMenuOpen.set(!statusMenuOpen())"
                class="flex items-center justify-between w-full bg-slate-50 dark:bg-white/[0.03] border-b-2 border-slate-200 dark:border-white/[0.1] py-2.5 px-1 cursor-pointer group hover:border-primary transition-all"
              >
                <span
                  class="text-sm font-bold text-slate-900 dark:text-white"
                  >{{ selectedStatus() }}</span
                >
                <svg
                  class="w-4 h-4 text-slate-400 group-hover:text-primary transition-all duration-300"
                  [class.rotate-180]="statusMenuOpen()"
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
                *ngIf="statusMenuOpen()"
                class="absolute left-0 right-0 mt-2 bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-2xl z-50 overflow-hidden animate-dropdown-in backdrop-blur-xl"
              >
                <div
                  *ngFor="let status of statuses"
                  (click)="selectStatus(status)"
                  [class.bg-primary/10]="selectedStatus() === status"
                  [class.text-primary]="selectedStatus() === status"
                  class="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:text-primary cursor-pointer transition-all flex items-center justify-between"
                >
                  {{ status }}
                </div>
              </div>
            </div>
          </div>

          <button
            (click)="resetFilters()"
            class="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors pb-3"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div
        class="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm animate-fade-in"
      >
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr
                class="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.06]"
              >
                <th
                  (click)="toggleSort('id')"
                  class="px-6 py-5 cursor-pointer group"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 group-hover:text-primary transition-colors"
                      >Order ID</span
                    >
                    <svg
                      class="w-3 h-3 text-slate-300 group-hover:text-primary transition-all"
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
                  (click)="toggleSort('customer')"
                  class="px-6 py-5 cursor-pointer group"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 group-hover:text-primary transition-colors"
                      >Customer</span
                    >
                    <svg
                      class="w-3 h-3 text-slate-300 group-hover:text-primary transition-all"
                      [class.rotate-180]="
                        sortField() === 'customer' && sortOrder() === 'desc'
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
                  (click)="toggleSort('status')"
                  class="px-6 py-5 cursor-pointer group"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 group-hover:text-primary transition-colors"
                      >Status</span
                    >
                    <svg
                      class="w-3 h-3 text-slate-300 group-hover:text-primary transition-all"
                      [class.rotate-180]="
                        sortField() === 'status' && sortOrder() === 'desc'
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
                  (click)="toggleSort('amount')"
                  class="px-6 py-5 cursor-pointer group"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 group-hover:text-primary transition-colors"
                      >Amount</span
                    >
                    <svg
                      class="w-3 h-3 text-slate-300 group-hover:text-primary transition-all"
                      [class.rotate-180]="
                        sortField() === 'amount' && sortOrder() === 'desc'
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
                  class="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-500"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/[0.04]">
              <tr
                *ngFor="let order of filteredAndSortedOrders()"
                class="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all group"
              >
                <td class="px-6 py-4">
                  <span
                    class="text-sm font-mono font-bold text-primary group-hover:tracking-wider transition-all"
                    >#{{ order.id }}</span
                  >
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span
                      class="text-sm font-bold text-slate-900 dark:text-white"
                      >{{ order.customer }}</span
                    >
                    <span
                      *ngIf="order.priority"
                      class="text-[9px] text-amber-500 font-black uppercase tracking-[0.1em] flex items-center gap-1"
                    >
                      <span
                        class="w-1 h-1 bg-amber-500 rounded-full animate-pulse"
                      ></span>
                      Priority Client
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    [ngClass]="{
                      'bg-amber-500/10 text-amber-500 border-amber-500/20':
                        order.status === 'Pending',
                      'bg-primary/10 text-primary border-primary/20':
                        order.status === 'Processing',
                      'bg-green-500/10 text-green-500 border-green-500/20':
                        order.status === 'Completed',
                      'bg-rose-500/10 text-rose-500 border-rose-500/20':
                        order.status === 'Cancelled',
                    }"
                    class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border"
                  >
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="text-sm font-black text-slate-900 dark:text-white"
                    >{{ order.amount | currency }}</span
                  >
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    class="px-4 py-1.5 rounded-lg text-[10px] font-bold text-primary uppercase border border-primary/10 hover:bg-primary hover:text-white transition-all"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="filteredAndSortedOrders().length === 0"
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
            No matching orders
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your filters or search terms.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class OrdersComponent {
  searchQuery = signal("");
  selectedStatus = signal("All Statuses");
  statusMenuOpen = signal(false);
  sortField = signal<keyof Order>("id");
  sortOrder = signal<"asc" | "desc">("asc");

  statuses = [
    "All Statuses",
    "Pending",
    "Processing",
    "Completed",
    "Cancelled",
  ];

  orders = signal<Order[]>([
    {
      id: "ORD-2341",
      customer: "TechNexus Industries",
      status: "Processing",
      amount: 45200,
      date: "2024-03-28",
      priority: true,
    },
    {
      id: "ORD-2342",
      customer: "Global Logistics Co",
      status: "Pending",
      amount: 12450,
      date: "2024-03-27",
      priority: false,
    },
    {
      id: "ORD-2343",
      customer: "Quantum Systems",
      status: "Completed",
      amount: 89000,
      date: "2024-03-25",
      priority: true,
    },
    {
      id: "ORD-2344",
      customer: "Alpha Manufacturing",
      status: "Processing",
      amount: 5600,
      date: "2024-03-29",
      priority: false,
    },
    {
      id: "ORD-2345",
      customer: "Steel Forge Group",
      status: "Cancelled",
      amount: 15700,
      date: "2024-03-24",
      priority: false,
    },
    {
      id: "ORD-2346",
      customer: "Bio-Dynamics Ltd",
      status: "Pending",
      amount: 32100,
      date: "2024-03-30",
      priority: true,
    },
  ]);

  pendingCount = computed(
    () => this.orders().filter((o) => o.status === "Pending").length,
  );

  filteredAndSortedOrders = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const field = this.sortField();
    const order = this.sortOrder();

    // First, filter
    let result = this.orders().filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(query) ||
        o.customer.toLowerCase().includes(query);
      const matchesStatus = status === "All Statuses" || o.status === status;
      return matchesSearch && matchesStatus;
    });

    // Then, sort
    return result.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });
  });

  selectStatus(status: string) {
    this.selectedStatus.set(status);
    this.statusMenuOpen.set(false);
  }

  toggleSort(field: keyof Order) {
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === "asc" ? "desc" : "asc");
    } else {
      this.sortField.set(field);
      this.sortOrder.set("asc");
    }
  }

  resetFilters() {
    this.searchQuery.set("");
    this.selectedStatus.set("All Statuses");
    this.sortField.set("id");
    this.sortOrder.set("asc");
  }
}
