import { Component, signal, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { InventoryDataService, Customer, SearchService } from "ui-shared";

@Component({
  selector: "app-customers",
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
            Customer Directory
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your business relationships and client history.
          </p>
        </div>
        <div
          class="flex items-center gap-3 bg-white dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm"
        >
          <div class="px-4 py-2 text-center">
            <p
              class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
            >
              Total Clients
            </p>
            <p class="text-lg font-black text-primary">
              {{ customers().length }}
            </p>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="mb-12">
        <div class="flex flex-col sm:flex-row items-end gap-8">
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

      <!-- Customer Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in"
      >
        <div
          *ngFor="let customer of filteredCustomers()"
          [routerLink]="['/inventory/customers', customer.id]"
          class="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 hover:border-primary/50 transition-all group shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
        >
          <div class="flex items-center gap-4 mb-6">
            <div
              class="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors text-xl font-black"
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

          <div class="space-y-3 mb-6">
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
      </div>
    </div>
  `,
  styles: [],
})
export class CustomersComponent implements OnInit {
  private dataService = inject(InventoryDataService);
  private searchService = inject(SearchService);

  customers = this.dataService.customers;
  searchQuery = signal("");
  filterStatus = signal("All");

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
