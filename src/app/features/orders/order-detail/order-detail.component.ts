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
      backLink="/inventory/orders"
      backLabel="Back to Tracking"
      actionLabel="Print Invoice"
      [tabs]="['Items', 'Customer Info', 'Payment Details', 'Shipping']"
      (tabChanged)="activeTab.set($event)"
    >
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
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Shipping Priority
          </p>
          <span
            [class]="
              order()?.priority ? 'text-amber-500 font-bold' : 'text-slate-500'
            "
            class="text-[10px] font-black uppercase tracking-widest"
          >
            {{ order()?.priority ? "High Priority" : "Standard" }}
          </span>
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
                      class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                      Product
                    </th>
                    <th
                      class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center"
                    >
                      Qty
                    </th>
                    <th
                      class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right"
                    >
                      Price
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
  activeTab = signal(0);

  orderId = computed(() => this.route.snapshot.paramMap.get("id"));
  order = computed(() =>
    this.dataService.orders().find((o) => o.id === this.orderId()),
  );

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
    }, 800);
  }
}
