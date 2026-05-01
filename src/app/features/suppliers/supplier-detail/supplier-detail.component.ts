import { Component, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import {
  InventoryDataService,
  DetailLayoutComponent,
  StatusBadgeComponent,
} from "ui-shared";

@Component({
  selector: "app-supplier-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, DetailLayoutComponent],
  template: `
    <lib-detail-layout
      [title]="supplier()?.name || 'Loading...'"
      [subtitle]="
        (supplier()?.category || '') + ' • ' + (supplier()?.location || '')
      "
      [status]="supplier()?.status || 'Active'"
      backLink="/inventory/suppliers"
      backLabel="Suppliers"
      actionLabel="Create Purchase Order"
      [tabs]="['Overview', 'Products', 'Purchase Orders', 'Compliance']"
      (tabChanged)="activeTab.set($event)"
    >
      <div header-icon>{{ supplier()?.name?.[0] }}</div>

      <div sidebar-info class="space-y-6">
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Email Address
          </p>
          <p class="text-sm font-bold text-slate-900 dark:text-white">
            {{ supplier()?.email }}
          </p>
        </div>
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Phone Number
          </p>
          <p class="text-sm font-bold text-slate-900 dark:text-white">
            {{ supplier()?.phone }}
          </p>
        </div>
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Location
          </p>
          <p class="text-sm font-bold text-slate-900 dark:text-white">
            {{ supplier()?.location }}
          </p>
        </div>
        <div class="pt-4 border-t border-slate-100 dark:border-white/5">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"
          >
            Reliability Score
          </p>
          <div class="flex items-center gap-3">
            <div
              class="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"
            >
              <div
                class="h-full bg-primary transition-all duration-1000"
                [style.width.%]="supplier()?.reliability"
              ></div>
            </div>
            <span class="text-sm font-black text-primary"
              >{{ supplier()?.reliability }}%</span
            >
          </div>
        </div>
      </div>

      <div sidebar-extra>
        <h4
          class="text-white text-xs font-black uppercase tracking-widest mb-2"
        >
          Quick Note
        </h4>
        <p class="text-white/60 text-[11px] leading-relaxed">
          This supplier has been a partner since 2022. They specialize in
          high-precision electronics and have a consistent delivery record.
        </p>
      </div>

      <div tab-content class="animate-fade-in">
        @if (activeTab() === 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="card-premium p-6">
              <h4
                class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4"
              >
                Supply Statistics
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <p class="text-[10px] font-black text-slate-400 uppercase">
                    Active Products
                  </p>
                  <p class="text-2xl font-black text-slate-900 dark:text-white">
                    {{ products().length }}
                  </p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <p class="text-[10px] font-black text-slate-400 uppercase">
                    Total Orders
                  </p>
                  <p class="text-2xl font-black text-slate-900 dark:text-white">
                    124
                  </p>
                </div>
              </div>
            </div>
            <div class="card-premium p-6">
              <h4
                class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4"
              >
                Financial Overview
              </h4>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-500 font-medium"
                    >Total Spend</span
                  >
                  <span
                    class="text-sm font-black text-slate-900 dark:text-white"
                    >$452,000</span
                  >
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-500 font-medium"
                    >Pending Payments</span
                  >
                  <span class="text-sm font-black text-amber-500">$12,400</span>
                </div>
              </div>
            </div>
          </div>
        } @else if (activeTab() === 1) {
          <div class="space-y-4">
            @for (product of products(); track product.id) {
              <div
                [routerLink]="['/inventory/products', product.id]"
                class="card-premium p-4 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div
                  class="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors"
                >
                  <svg
                    class="w-6 h-6 text-slate-400 group-hover:text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    ></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                    {{ product.name }}
                  </h4>
                  <p
                    class="text-[10px] text-slate-500 uppercase tracking-widest"
                  >
                    {{ product.category }}
                  </p>
                </div>
                <div class="text-right px-4">
                  <p class="text-xs font-black text-slate-900 dark:text-white">
                    {{ product.price | currency }}
                  </p>
                  <p
                    class="text-[10px] text-slate-500 uppercase tracking-widest"
                  >
                    Stock: {{ product.stock }}
                  </p>
                </div>
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
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </div>
            } @empty {
              <div
                class="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10"
              >
                <p class="text-slate-500 font-medium">
                  No products linked to this supplier.
                </p>
              </div>
            }
          </div>
        } @else if (activeTab() === 2) {
          <div class="text-center py-20">
            <p class="text-slate-500 font-medium italic">
              Purchase order history loading...
            </p>
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
export class SupplierDetailComponent {
  private route = inject(ActivatedRoute);
  private dataService = inject(InventoryDataService);

  activeTab = signal(0);

  supplierId = computed(() => this.route.snapshot.paramMap.get("id") || "");
  supplier = computed(() =>
    this.dataService.suppliers().find((s) => s.id === this.supplierId()),
  );
  products = computed(() =>
    this.dataService
      .products()
      .filter((p) => p.supplierId === this.supplierId()),
  );
}
