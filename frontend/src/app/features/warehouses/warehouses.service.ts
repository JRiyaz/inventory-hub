import { Injectable, inject, signal, computed } from "@angular/core";
import { InventoryDataService, Warehouse } from "ui-shared";
import { delay, of, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class WarehousesService {
  private dataService = inject(InventoryDataService);

  // State
  isLoading = signal(false);
  isActionLoading = signal(false);
  searchQuery = signal("");
  statusFilter = signal("All Statuses");

  // Derived Data
  warehouses = this.dataService.warehouses;

  allFilteredWarehouses = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    return this.warehouses().filter((w) => {
      const matchesSearch =
        w.name.toLowerCase().includes(query) ||
        w.location.toLowerCase().includes(query);
      const matchesStatus = status === "All Statuses" || w.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  headerStats = computed(() => [
    {
      label: "Total Sites",
      value: this.warehouses().length,
      color: "primary" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>',
    },
    {
      label: "Utilization",
      value: "78%",
      color: "warning" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>',
    },
    {
      label: "Active Zones",
      value: this.warehouses().reduce(
        (acc, w) => acc + (w.zones?.length || 0),
        0,
      ),
      color: "success" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>',
    },
  ]);

  // Actions
  loadWarehouses() {
    this.isLoading.set(true);
    return of(this.warehouses())
      .pipe(
        delay(800),
        tap(() => this.isLoading.set(false)),
      )
      .subscribe();
  }

  getWarehouse(id: string) {
    return this.warehouses().find((w) => w.id === id);
  }

  getProductsByWarehouseId(warehouseId: string) {
    return this.dataService
      .products()
      .filter((p) => (p as any).warehouseId === warehouseId);
  }

  getAvailableProducts() {
    return this.dataService.products().filter((p) => !(p as any).warehouseId);
  }

  addProductToWarehouse(productId: number, warehouseId: string) {
    this.isActionLoading.set(true);
    const product = this.dataService.products().find((p) => p.id === productId);
    if (product) {
      const updatedProduct = { ...product, warehouseId };
      this.dataService.updateProduct(updatedProduct);
    }
    return of(true).pipe(
      delay(1000),
      tap(() => this.isActionLoading.set(false)),
    );
  }

  getMovementsByWarehouseId(warehouseId: string) {
    return this.dataService
      .movements()
      .filter(
        (m) =>
          m.fromLocation.startsWith(warehouseId) ||
          m.toLocation.startsWith(warehouseId),
      );
  }

  addWarehouse(warehouse: Warehouse) {
    this.isActionLoading.set(true);
    return of(warehouse).pipe(
      delay(1500),
      tap((w) => {
        this.dataService.addWarehouse(w);
        this.isActionLoading.set(false);
      }),
    );
  }

  updateWarehouse(warehouse: Warehouse) {
    this.isActionLoading.set(true);
    return of(warehouse).pipe(
      delay(1200),
      tap((w) => {
        this.dataService.updateWarehouse(w);
        this.isActionLoading.set(false);
      }),
    );
  }
}
