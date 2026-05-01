import { Component, signal, OnInit, inject, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterModule } from "@angular/router";
import {
  InventoryDataService,
  DetailLayoutComponent,
  StatusBadgeComponent,
} from "ui-shared";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DetailLayoutComponent,
    StatusBadgeComponent,
  ],
  template: `
    <lib-detail-layout
      [title]="product()?.name || 'Loading...'"
      [subtitle]="product()?.description || 'No description available'"
      [status]="stockStatus()"
      backLink="/inventory/products"
      backLabel="Products Hub"
      actionLabel="Order More Stock"
      [tabs]="['Overview', 'Supplier & Logistics', 'Relational Activity']"
      (tabChanged)="activeTab.set($event)"
    >
      <div header-icon>
        <div
          class="w-full h-full bg-primary/10 rounded-2xl flex items-center justify-center text-primary"
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            ></path>
          </svg>
        </div>
      </div>

      <div sidebar-info class="space-y-6">
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Price Point
          </p>
          <p class="text-xl font-black text-primary">
            {{ product()?.price | currency }}
          </p>
        </div>
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Current Stock
          </p>
          <div class="flex items-center gap-2">
            <p class="text-xl font-black text-slate-900 dark:text-white">
              {{ product()?.stock }} Units
            </p>
          </div>
        </div>
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Category
          </p>
          <p
            class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight"
          >
            {{ product()?.category }}
          </p>
        </div>
      </div>

      <div sidebar-extra>
        <h4
          class="text-white text-xs font-black uppercase tracking-widest mb-4"
        >
          Inventory Health
        </h4>
        <div class="space-y-4">
          <div class="space-y-2">
            <div
              class="flex justify-between items-center text-[10px] text-white/70 font-bold uppercase tracking-wider"
            >
              <span>Demand Velocity</span>
              <span class="text-emerald-400">Stable</span>
            </div>
            <div
              class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner"
            >
              <div
                class="h-full bg-emerald-400 w-3/4 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
              ></div>
            </div>
          </div>
          <div class="pt-2">
            <p class="text-[10px] text-white/50 leading-relaxed italic">
              Last audit completed 4 days ago. All batches verified.
            </p>
          </div>
        </div>
      </div>

      <div tab-content class="animate-fade-in">
        @if (activeTab() === 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="card-premium p-6">
              <h4
                class="text-xs font-black uppercase tracking-widest text-slate-400 mb-6"
              >
                Market Strategy
              </h4>
              <div class="space-y-4">
                <div
                  class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex justify-between items-center"
                >
                  <span
                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                    >Target Margin</span
                  >
                  <span class="text-lg font-black text-emerald-500">28.4%</span>
                </div>
                <div
                  class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex justify-between items-center"
                >
                  <span
                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                    >Market Index</span
                  >
                  <span
                    class="text-lg font-black text-slate-900 dark:text-white"
                    >+12.5%</span
                  >
                </div>
              </div>
            </div>

            <div class="card-premium p-6">
              <h4
                class="text-xs font-black uppercase tracking-widest text-slate-400 mb-6"
              >
                Fulfillment Details
              </h4>
              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <div
                    class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                    >
                      Standard Lead Time
                    </p>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">
                      14 Business Days
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div
                    class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                    >
                      Minimum Stock Threshold
                    </p>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">
                      25 Units (Critical)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } @else if (activeTab() === 1) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Supplier Link Card -->
            <div
              *ngIf="supplier()"
              [routerLink]="['/inventory/suppliers', supplier()?.id]"
              class="card-premium p-6 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div
                class="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700"
              ></div>
              <h4
                class="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center justify-between"
              >
                Primary Source
                <svg
                  class="w-4 h-4 text-slate-300 group-hover:text-primary transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7-7 7"
                  />
                </svg>
              </h4>
              <div class="flex items-center gap-5">
                <div
                  class="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary font-black text-2xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-slate-100 dark:border-white/10"
                >
                  {{ supplier()?.name?.[0] }}
                </div>
                <div>
                  <p
                    class="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight"
                  >
                    {{ supplier()?.name }}
                  </p>
                  <p
                    class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1"
                  >
                    {{ supplier()?.location }}
                  </p>
                  <lib-status-badge
                    [status]="supplier()?.status || ''"
                    class="mt-3 scale-75 origin-left"
                  ></lib-status-badge>
                </div>
              </div>
            </div>

            <!-- Warehouse Link Card -->
            <div
              *ngIf="warehouse()"
              [routerLink]="['/inventory/warehouses', warehouse()?.id]"
              class="card-premium p-6 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div
                class="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"
              ></div>
              <h4
                class="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center justify-between"
              >
                Logistics Node
                <svg
                  class="w-4 h-4 text-slate-300 group-hover:text-primary transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7-7 7"
                  />
                </svg>
              </h4>
              <div class="flex items-center gap-5">
                <div
                  class="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-amber-500 font-black group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm border border-slate-100 dark:border-white/10"
                >
                  <svg
                    class="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p
                    class="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight"
                  >
                    {{ warehouse()?.name }}
                  </p>
                  <p
                    class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1"
                  >
                    {{ warehouse()?.location }}
                  </p>
                  <div class="mt-3 flex items-center gap-2">
                    <span
                      class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                      >Load:</span
                    >
                    <span class="text-xs font-black text-primary"
                      >{{ warehouse()?.utilization }}% Capacity</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        } @else if (activeTab() === 2) {
          <div class="space-y-4">
            @for (order of relatedOrders(); track order.id) {
              <div
                [routerLink]="['/inventory/orders', order.id]"
                class="card-premium p-5 flex items-center justify-between group hover:border-primary transition-all cursor-pointer"
              >
                <div class="flex items-center gap-5">
                  <div
                    class="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-all shadow-inner border border-slate-100 dark:border-white/10"
                  >
                    <svg
                      class="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center gap-3 mb-1">
                      <p
                        class="text-sm font-black text-slate-900 dark:text-white"
                      >
                        Order #{{ order.id }}
                      </p>
                      <lib-status-badge
                        [status]="order.status"
                        class="scale-75 origin-left"
                      ></lib-status-badge>
                    </div>
                    <p
                      class="text-[10px] text-slate-400 font-bold uppercase tracking-widest"
                    >
                      {{ order.customerName }} •
                      {{ order.date | date: "mediumDate" }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-lg font-black text-primary">
                    {{ getQuantityInOrder(order.id) }} Units
                  </p>
                  <p
                    class="text-[9px] text-slate-400 font-black uppercase tracking-widest"
                  >
                    Allocation
                  </p>
                </div>
              </div>
            } @empty {
              <div
                class="text-center py-24 bg-white/50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10"
              >
                <p class="text-slate-400 font-medium italic">
                  No transactional records found for this SKU.
                </p>
              </div>
            }
          </div>
        }
      </div>
    </lib-detail-layout>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(InventoryDataService);

  isLoading = signal(true);
  activeTab = signal(0);

  productId = computed(() => Number(this.route.snapshot.paramMap.get("id")));
  product = computed(() =>
    this.dataService.products().find((p) => p.id === this.productId()),
  );

  supplier = computed(() => {
    const p = this.product();
    return p?.supplierId
      ? this.dataService.suppliers().find((s) => s.id === p.supplierId)
      : null;
  });

  warehouse = computed(() => {
    const p = this.product();
    return p?.warehouseId
      ? this.dataService.warehouses().find((w) => w.id === p.warehouseId)
      : null;
  });

  relatedOrders = computed(() => {
    const p = this.product();
    return p
      ? this.dataService
          .orders()
          .filter((o) => o.items.some((i) => i.productId === p.id))
      : [];
  });

  stockStatus = computed(() => {
    const p = this.product();
    if (!p) return "Unknown";
    if (p.stock === 0) return "Out of Stock";
    if (p.stock < 20) return "Low Stock";
    return "Optimal Stock";
  });

  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 800);
  }

  getQuantityInOrder(orderId: string): number {
    const p = this.product();
    if (!p) return 0;
    const order = this.dataService.orders().find((o) => o.id === orderId);
    return order?.items.find((i) => i.productId === p.id)?.qty || 0;
  }
}
