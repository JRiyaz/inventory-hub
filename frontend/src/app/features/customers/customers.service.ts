import { Injectable, inject, signal, computed } from "@angular/core";
import { InventoryDataService, Customer } from "ui-shared";
import { delay, of, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CustomersService {
  private dataService = inject(InventoryDataService);

  // State
  isLoading = signal(false);
  isActionLoading = signal(false);
  searchQuery = signal("");
  currentPage = signal(1);
  pageSize = signal(10);

  // Derived Data
  customers = this.dataService.customers;

  allFilteredCustomers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.customers().filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query),
    );
  });

  paginatedCustomers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.allFilteredCustomers().slice(start, start + this.pageSize());
  });

  totalPages = computed(() =>
    Math.ceil(this.allFilteredCustomers().length / this.pageSize()),
  );

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  headerStats = computed(() => [
    {
      label: "Total Customers",
      value: this.customers().length.toLocaleString(),
      color: "primary" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>',
    },
    {
      label: "Active Accounts",
      value: this.customers()
        .filter((c) => c.status === "Active")
        .length.toLocaleString(),
      color: "success" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
    },
    {
      label: "High Value",
      value: this.customers()
        .filter((c) => c.segment === "VIP")
        .length.toLocaleString(),
      color: "warning" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>',
    },
  ]);

  // Actions
  loadCustomers() {
    this.isLoading.set(true);
    return of(this.customers())
      .pipe(
        delay(800),
        tap(() => this.isLoading.set(false)),
      )
      .subscribe();
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getCustomer(id: string) {
    return this.customers().find((c) => c.id === id);
  }

  getOrdersForCustomer(customerName: string) {
    return this.dataService.getOrdersForCustomer(customerName);
  }

  addCustomer(customer: Customer) {
    this.isActionLoading.set(true);
    return of(customer).pipe(
      delay(1500),
      tap((c) => {
        this.dataService.addCustomer(c);
        this.isActionLoading.set(false);
      }),
    );
  }

  updateCustomer(customer: Customer) {
    this.isActionLoading.set(true);
    return of(customer).pipe(
      delay(1200),
      tap((c) => {
        this.dataService.updateCustomer(c);
        this.isActionLoading.set(false);
      }),
    );
  }
}
