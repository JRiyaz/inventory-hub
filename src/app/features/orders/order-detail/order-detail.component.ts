import { Component, signal, OnInit, inject, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterModule } from "@angular/router";
import {
  InventoryDataService,
  DetailLayoutComponent,
  StatusBadgeComponent,
  Breadcrumb,
} from "ui-shared";

@Component({
  selector: "app-order-detail",
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
      [title]="'Order #' + (order()?.id || '...')"
      [subtitle]="
        'Customer: ' + (order()?.customerName || order()?.customer || 'Unknown')
      "
      [status]="order()?.status || 'Unknown'"
      [breadcrumbs]="breadcrumbs()"
      backLink="/inventory/orders"
      backLabel="Back to Tracking"
      actionLabel="Print Invoice"
      [tabs]="['Items', 'Customer Info', 'Payment Details', 'Shipping']"
      [loading]="isActionLoading()"
      (tabChanged)="activeTab.set($event)"
      (action)="handleAction()"
    >
      <div top-content>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Fulfillment Card -->
          <div
            class="card-premium p-4 flex items-center justify-between gap-6 overflow-hidden"
          >
            <div class="flex items-center gap-4 flex-1">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4
                  class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Fulfillment Status
                </h4>
                <p class="text-[9px] text-slate-500 font-medium italic mt-0.5">
                  Order processing in progress.
                </p>
              </div>
            </div>

            <div class="flex-1 max-w-[200px]">
              <div
                class="flex justify-between items-center text-[9px] font-black uppercase tracking-widest mb-1.5"
              >
                <span class="text-slate-400">Progress</span>
                <span class="text-primary">65%</span>
              </div>
              <div
                class="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner"
              >
                <div
                  class="h-full bg-primary w-[65%] shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                ></div>
              </div>
            </div>
          </div>

          <!-- Priority Card -->
          <div
            class="card-premium p-4 flex items-center justify-between gap-6 overflow-hidden"
          >
            <div class="flex items-center gap-4 flex-1">
              <div
                class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"
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
                <h4
                  class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Shipping Priority
                </h4>
                <p class="text-[9px] text-slate-500 font-medium italic mt-0.5">
                  Determined by SLA requirements.
                </p>
              </div>
            </div>

            <div class="text-right px-4">
              <p
                class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5"
              >
                Delivery Tier
              </p>
              <p class="text-xl font-black text-amber-500 uppercase">
                {{ order()?.priority ? "Express" : "Standard" }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div header-icon>
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          ></path>
        </svg>
      </div>

      <div sidebar-info class="space-y-6">
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Total Amount
          </p>
          <p class="text-xl font-black text-primary">
            {{ order()?.totalAmount || order()?.amount || 0 | currency }}
          </p>
        </div>
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Order Date
          </p>
          <p class="text-sm font-bold text-slate-900 dark:text-white">
            {{ order()?.date }}
          </p>
        </div>
        <div class="pt-4 border-t border-slate-100 dark:border-white/5">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
          >
            SLA Compliance
          </p>
          <p class="text-xs font-black text-emerald-500 uppercase">
            Within Bounds
          </p>
        </div>
      </div>

      <div sidebar-extra>
        <h4
          class="text-white text-xs font-black uppercase tracking-widest mb-4"
        >
          Internal Notes
        </h4>
        <p class="text-[10px] text-white/60 leading-relaxed font-medium italic">
          Customer requested eco-friendly packaging for this shipment. Verify
          all components for thermal compliance before shipping.
        </p>
      </div>

      <div tab-content class="animate-fade-in">
        @if (activeTab() === 0) {
          <div class="space-y-4">
            <div class="card-premium overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead
                  class="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.06]"
                >
                  <tr>
                    <th
                      (click)="toggleSort('name')"
                      class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer group"
                    >
                      <div class="flex items-center gap-2">
                        <span class="group-hover:text-primary transition-colors"
                          >Product</span
                        >
                        <svg
                          class="w-2.5 h-2.5 transition-all duration-300"
                          [class.text-primary]="sortField() === 'name'"
                          [class.text-slate-200]="sortField() !== 'name'"
                          [class.rotate-180]="
                            sortField() === 'name' && sortOrder() === 'desc'
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
                      (click)="toggleSort('qty')"
                      class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center cursor-pointer group"
                    >
                      <div class="flex items-center justify-center gap-2">
                        <span class="group-hover:text-primary transition-colors"
                          >Qty</span
                        >
                        <svg
                          class="w-2.5 h-2.5 transition-all duration-300"
                          [class.text-primary]="sortField() === 'qty'"
                          [class.text-slate-200]="sortField() !== 'qty'"
                          [class.rotate-180]="
                            sortField() === 'qty' && sortOrder() === 'desc'
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
                      (click)="toggleSort('price')"
                      class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right cursor-pointer group"
                    >
                      <div class="flex items-center justify-end gap-2">
                        <span class="group-hover:text-primary transition-colors"
                          >Price</span
                        >
                        <svg
                          class="w-2.5 h-2.5 transition-all duration-300"
                          [class.text-primary]="sortField() === 'price'"
                          [class.text-slate-200]="sortField() !== 'price'"
                          [class.rotate-180]="
                            sortField() === 'price' && sortOrder() === 'desc'
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
                      class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right"
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="divide-y divide-slate-100 dark:divide-white/[0.04]"
                >
                  @for (item of order()?.items; track item.productId) {
                    <tr
                      class="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all group"
                    >
                      <td class="px-6 py-4">
                        <a
                          [routerLink]="['/inventory/products', item.productId]"
                          class="text-sm font-black text-slate-900 dark:text-white hover:text-primary transition-colors"
                        >
                          {{ item.name }}
                        </a>
                        <p
                          class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5"
                        >
                          SKU: PROD-{{ item.productId }}
                        </p>
                      </td>
                      <td
                        class="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400"
                      >
                        {{ item.qty }}
                      </td>
                      <td
                        class="px-6 py-4 text-right font-mono text-xs text-slate-500"
                      >
                        {{ item.price | currency }}
                      </td>
                      <td class="px-6 py-4 text-right font-black text-primary">
                        {{ item.qty * item.price | currency }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else if (activeTab() === 1) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              *ngIf="customer()"
              [routerLink]="['/inventory/customers', customer()?.id]"
              class="card-premium p-6 hover:border-primary transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-4 mb-6">
                <div
                  class="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl group-hover:bg-primary group-hover:text-white transition-all"
                >
                  {{ customer()?.name?.[0] }}
                </div>
                <div>
                  <p class="text-lg font-black text-slate-900 dark:text-white">
                    {{ customer()?.name }}
                  </p>
                  <p class="text-xs text-slate-500 font-medium">
                    {{ customer()?.email }}
                  </p>
                </div>
              </div>
              <div
                class="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/5 pt-4"
              >
                <div>
                  <p
                    class="text-[9px] font-black uppercase text-slate-400 tracking-widest"
                  >
                    Phone
                  </p>
                  <p
                    class="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    {{ customer()?.phone }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-[9px] font-black uppercase text-slate-400 tracking-widest"
                  >
                    Client Since
                  </p>
                  <p
                    class="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    {{ customer()?.joinDate }}
                  </p>
                </div>
              </div>
            </div>

            <div class="card-premium p-6">
              <h4
                class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4"
              >
                Billing Address
              </h4>
              <p
                class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
              >
                Industrial Park East, Suite 400<br />
                77 Quantum Valley Road<br />
                Silicon Prairie, TX 75001<br />
                United States
              </p>
            </div>
          </div>
        } @else if (activeTab() === 2) {
          <div class="space-y-4">
            @for (pay of payments(); track pay.id) {
              <div class="card-premium p-5 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div
                    class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"
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
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center gap-2 mb-0.5">
                      <p
                        class="text-sm font-black text-slate-900 dark:text-white"
                      >
                        {{ pay.method }} Payment
                      </p>
                      <lib-status-badge
                        [status]="pay.status"
                        class="scale-75 origin-left"
                      ></lib-status-badge>
                    </div>
                    <p
                      class="text-[9px] text-slate-400 font-bold uppercase tracking-widest"
                    >
                      TXN: {{ pay.transactionId }} • {{ pay.date }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-lg font-black text-primary">
                    {{ pay.amount | currency }}
                  </p>
                </div>
              </div>
            } @empty {
              <div
                class="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10"
              >
                <p class="text-slate-400 italic">
                  No payment transactions found.
                </p>
              </div>
            }
          </div>
        } @else if (activeTab() === 3) {
          <div class="card-premium p-8 max-w-2xl">
            <div class="flex items-start gap-6 mb-8">
              <div
                class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <h4
                  class="text-base font-black text-slate-900 dark:text-white mb-2"
                >
                  Shipping Information
                </h4>
                <p class="text-sm text-slate-500 leading-relaxed">
                  This order is currently being processed at our
                  <strong>Main Distribution Center</strong>. Expected carrier
                  pickup is scheduled for next business day.
                </p>
              </div>
            </div>

            <div class="space-y-6 ml-18">
              <div class="flex items-center gap-4 relative">
                <div
                  class="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10 z-10"
                ></div>
                <div
                  class="absolute left-[3px] top-2 bottom-0 w-[2px] bg-slate-100 dark:bg-white/5 h-12"
                ></div>
                <p
                  class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest"
                >
                  Order Confirmed
                </p>
                <span class="text-[10px] text-slate-400 font-medium">{{
                  order()?.date
                }}</span>
              </div>
              <div class="flex items-center gap-4">
                <div
                  class="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20"
                ></div>
                <p
                  class="text-xs font-bold text-slate-400 uppercase tracking-widest"
                >
                  In Processing
                </p>
              </div>
              <div class="flex items-center gap-4">
                <div
                  class="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20"
                ></div>
                <p
                  class="text-xs font-bold text-slate-400 uppercase tracking-widest"
                >
                  Shipped
                </p>
              </div>
            </div>
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
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(InventoryDataService);

  isLoading = signal(true);
  isActionLoading = signal(false);
  activeTab = signal(0);
  sortField = signal<string>("name");
  sortOrder = signal<"asc" | "desc">("asc");

  orderId = computed(() => this.route.snapshot.paramMap.get("id"));
  order = computed(() => {
    const o = this.dataService.orders().find((o) => o.id === this.orderId());
    if (!o) return null;

    const field = this.sortField();
    const order = this.sortOrder();

    const sortedItems = [...(o.items || [])].sort((a: any, b: any) => {
      const valA = a[field];
      const valB = b[field];
      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });

    return { ...o, items: sortedItems };
  });

  breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: "Dashboard", link: "/dashboard" },
    { label: "Inventory", link: "/inventory" },
    { label: "Orders", link: "/inventory/orders" },
    { label: "#" + (this.order()?.id || "Detail") },
  ]);

  customer = computed(() => {
    const o = this.order();
    const name = o?.customerName || o?.customer;
    return name
      ? this.dataService.customers().find((c) => c.name === name)
      : null;
  });

  payments = computed(() => {
    const id = this.orderId();
    return id ? this.dataService.getPaymentsByOrderId(id) : [];
  });

  ngOnInit() {
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1500);
  }

  handleAction() {
    this.isActionLoading.set(true);
    setTimeout(() => {
      this.isActionLoading.set(false);
    }, 2000);
  }

  toggleSort(field: string) {
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === "asc" ? "desc" : "asc");
    } else {
      this.sortField.set(field);
      this.sortOrder.set("asc");
    }
  }
}
