import { HttpClient } from '@angular/common/http';
import { computed, Injectable, inject, signal } from '@angular/core';
import { finalize, firstValueFrom, from } from 'rxjs';
import { InventoryDataService, type Product } from 'ui-shared';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private dataService = inject(InventoryDataService);
  private http = inject(HttpClient);

  // State
  isLoading = signal(false);
  isActionLoading = signal(false);
  searchQuery = signal('');
  selectedCategory = signal('All');
  currentPage = signal(1);
  pageSize = signal(8);
  viewType = signal<'grid' | 'list'>('grid');

  // Derived Data
  products = this.dataService.products;

  allFilteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();

    return this.products().filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
      const matchesCat = cat === 'All' || p.category === cat;
      return matchesSearch && matchesCat;
    });
  });

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.allFilteredProducts().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.allFilteredProducts().length / this.pageSize()));

  headerStats = computed(() => [
    {
      label: 'Live Inventory',
      value: this.products().length,
      color: 'primary' as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>',
    },
    {
      label: 'Shortage Alerts',
      value: this.products().filter((p) => p.stock < 20).length,
      color: 'danger' as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
    },
    {
      label: 'Global Valuation',
      value: `$${(this.products().reduce((acc, p) => acc + p.price * p.stock, 0) / 1000000).toFixed(2)}M`,
      color: 'success' as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
    },
  ]);

  getProductsData() {
    return this.http.get<Product[]>(`${this.dataService.baseUrl}/products`);
  }

  setProducts(products: Product[]) {
    this.dataService.setProducts(products);
  }

  updateProductInState(product: Product) {
    this.dataService.updateProductInState(product);
  }

  // Actions
  async loadProducts() {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.http.get<Product[]>(`${this.dataService.baseUrl}/products`));
      this.dataService.setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getProductData(id: number) {
    return this.http.get<Product>(`${this.dataService.baseUrl}/products/${id}`);
  }

  async loadProduct(id: number) {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.http.get<Product>(`${this.dataService.baseUrl}/products/${id}`));
      this.dataService.updateProductInState(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getProduct(id: number) {
    return this.products().find((p) => p.id === id);
  }

  getSupplierById(id: string) {
    return this.dataService.suppliers().find((s) => s.id === id);
  }

  getWarehouseById(id: string) {
    return this.dataService.warehouses().find((w) => w.id === id);
  }

  getOrdersByProductId(productId: number) {
    return this.dataService.orders().filter((o) => o.items.some((i) => i.productId === productId));
  }

  supplierOptions = computed(() => this.dataService.suppliers().map((s) => ({ value: s.id, label: s.name })));

  addProduct(product: Product) {
    this.isActionLoading.set(true);
    const promise = firstValueFrom(this.http.post<Product>(`${this.dataService.baseUrl}/products`, product)).then(
      (data) => {
        this.dataService.addProductToState(data);
      },
    );
    return from(promise).pipe(finalize(() => this.isActionLoading.set(false)));
  }

  updateProduct(product: Product) {
    this.isActionLoading.set(true);
    const promise = firstValueFrom(
      this.http.put<Product>(`${this.dataService.baseUrl}/products/${product.id}`, product),
    ).then((data) => {
      this.dataService.updateProductInState(data);
    });
    return from(promise).pipe(finalize(() => this.isActionLoading.set(false)));
  }
}
