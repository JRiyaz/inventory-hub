import { HttpClient } from '@angular/common/http';
import { computed, Injectable, inject, signal } from '@angular/core';
import { finalize, firstValueFrom, from, Observable } from 'rxjs';
import { InventoryDataService, type Order } from 'ui-shared';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private dataService = inject(InventoryDataService);
  private http = inject(HttpClient);

  // State
  isLoading = signal(false);
  isActionLoading = signal(false);
  searchQuery = signal('');
  statusFilter = signal('All Statuses');
  sortField = signal<string>('id');
  sortOrder = signal<'asc' | 'desc'>('desc');
  currentPage = signal(1);
  pageSize = signal(10);

  // Derived Data
  orders = this.dataService.orders;

  customerOptions = computed(() =>
    this.dataService.customers().map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
    })),
  );

  productOptions = this.dataService.products;

  allFilteredOrders = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const field = this.sortField();
    const order = this.sortOrder();

    const result = this.orders().filter((o) => {
      const matchesSearch = o.id.toLowerCase().includes(query) || (o.customerName || '').toLowerCase().includes(query);
      const matchesStatus = status === 'All Statuses' || o.status === status;
      return matchesSearch && matchesStatus;
    });

    return result.sort((a: any, b: any) => {
      const valA = a[field];
      const valB = b[field];
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  });

  paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.allFilteredOrders().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.allFilteredOrders().length / this.pageSize()));

  headerStats = computed(() => [
    {
      label: 'Total Orders',
      value: this.orders().length,
      color: 'primary' as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>',
    },
    {
      label: 'Pending Processing',
      value: this.orders().filter((o) => o.status === 'Pending').length,
      color: 'warning' as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
    },
    {
      label: 'Total Volume',
      value:
        '$' +
        this.orders()
          .reduce((acc, o) => acc + (o.totalAmount || 0), 0)
          .toLocaleString(),
      color: 'success' as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
    },
  ]);

  // Actions
  getOrdersData(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.dataService.baseUrl}/orders`);
  }

  getOrderData(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.dataService.baseUrl}/orders/${id}`);
  }

  setOrders(data: Order[]): void {
    this.dataService.setOrders(data);
  }

  setOrder(data: Order): void {
    this.dataService.updateOrderInState(data);
  }

  toggleSort(field: string) {
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getOrder(id: string) {
    return this.orders().find((o) => o.id === id);
  }

  getCustomerByName(name: string) {
    return this.dataService.customers().find((c) => c.name === name);
  }

  getPaymentsByOrderId(orderId: string) {
    return this.dataService.getPaymentsByOrderId(orderId);
  }

  addOrder(order: Order) {
    this.isActionLoading.set(true);
    const promise = firstValueFrom(this.http.post<Order>(`${this.dataService.baseUrl}/orders`, order)).then((data) => {
      this.dataService.addOrderToState(data);
    });
    return from(promise).pipe(finalize(() => this.isActionLoading.set(false)));
  }

  updateOrder(order: Order) {
    this.isActionLoading.set(true);
    const promise = firstValueFrom(this.http.put<Order>(`${this.dataService.baseUrl}/orders/${order.id}`, order)).then(
      (data) => {
        this.dataService.updateOrderInState(data);
      },
    );
    return from(promise).pipe(finalize(() => this.isActionLoading.set(false)));
  }
}
