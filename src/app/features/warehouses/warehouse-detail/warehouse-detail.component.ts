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
  selector: "app-warehouse-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DetailLayoutComponent],
  template: `
    <lib-detail-layout
      [title]="warehouse()?.name || 'Loading...'"
      [subtitle]="warehouse()?.location || 'Unknown'"
      [status]="capacityStatus()"
      backLink="/inventory/warehouses"
      backLabel="Warehouse Logistics"
      actionLabel="Relocate Stock"
      [tabs]="['Overview', 'Zones & Capacity', 'Stored Products', 'Movements']"
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          ></path>
        </svg>
      </div>

      <div sidebar-info class="space-y-6">
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Total Capacity
          </p>
          <p class="text-xl font-black text-primary">
            {{ warehouse()?.totalCapacity?.toLocaleString() }} Units
          </p>
        </div>
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Utilization
          </p>
          <div class="flex items-center gap-2">
            <p class="text-xl font-black text-slate-900 dark:text-white">
              {{ warehouse()?.utilization }}%
            </p>
            <div
              class="w-16 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"
            >
              <div
                [style.width.%]="warehouse()?.utilization"
                [class]="getBarClass(warehouse()?.utilization || 0)"
                class="h-full"
              ></div>
            </div>
          </div>
        </div>
        <div class="space-y-1">
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Active Zones
          </p>
          <p
            class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight"
          >
            {{ warehouse()?.zones?.length }} Operational
          </p>
        </div>
      </div>

      <div sidebar-extra>
        <h4
          class="text-white text-xs font-black uppercase tracking-widest mb-4"
        >
          Operational Status
        </h4>
        <div class="space-y-4">
          <div
            class="flex items-center justify-between text-[10px] text-white/70 font-bold"
          >
            <span>Security Systems</span>
            <span class="text-emerald-400">Online</span>
          </div>
          <div
            class="flex items-center justify-between text-[10px] text-white/70 font-bold"
          >
            <span>HVAC Control</span>
            <span class="text-emerald-400">Stable</span>
          </div>
          <div
            class="flex items-center justify-between text-[10px] text-white/70 font-bold"
          >
            <span>Dock Status</span>
            <span class="text-amber-400">Busy (3 trucks)</span>
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
                Storage Distribution
              </h4>
              <div class="space-y-6">
                @for (zone of warehouse()?.zones; track zone.id) {
                  <div class="space-y-2">
                    <div
                      class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest"
                    >
                      <span class="text-slate-900 dark:text-white">{{
                        zone.name
                      }}</span>
                      <span class="text-slate-400">{{ zone.description }}</span>
                    </div>
                    <div
                      class="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"
                    >
                      <div
                        class="h-full bg-primary"
                        [style.width.%]="60 + $index * 10"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="card-premium p-6">
              <h4
                class="text-xs font-black uppercase tracking-widest text-slate-400 mb-6"
              >
                Key Statistics
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div
                  class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5"
                >
                  <p class="text-[9px] font-black uppercase text-slate-400">
                    Avg throughput
                  </p>
                  <p class="text-lg font-black text-slate-900 dark:text-white">
                    840 units/day
                  </p>
                </div>
                <div
                  class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5"
                >
                  <p class="text-[9px] font-black uppercase text-slate-400">
                    Error Rate
                  </p>
                  <p class="text-lg font-black text-emerald-500">0.02%</p>
                </div>
              </div>
              <p
                class="mt-6 text-[10px] text-slate-500 font-medium leading-relaxed italic"
              >
                Last audited 14 days ago by Compliance Team A. All safety
                protocols confirmed.
              </p>
            </div>
          </div>
        } @else if (activeTab() === 1) {
          <div class="space-y-4">
            @for (zone of warehouse()?.zones; track zone.id) {
              <div
                class="card-premium p-6 flex items-center justify-between group hover:border-primary transition-all"
              >
                <div class="flex items-center gap-5">
                  <div
                    class="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                  >
                    {{ zone.name[zone.name.length - 1] }}
                  </div>
                  <div>
                    <p
                      class="text-base font-black text-slate-900 dark:text-white"
                    >
                      {{ zone.name }}
                    </p>
                    <p class="text-xs text-slate-500 font-medium">
                      {{ zone.description }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p
                    class="text-xs font-black text-primary uppercase tracking-widest"
                  >
                    Active
                  </p>
                </div>
              </div>
            }
          </div>
        } @else if (activeTab() === 2) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (prod of storedProducts(); track prod.id) {
              <div
                [routerLink]="['/inventory/products', prod.id]"
                class="card-premium p-5 flex items-center gap-4 hover:border-primary transition-all cursor-pointer group"
              >
                <div
                  class="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors"
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
                      stroke-width="1"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    ></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p
                    class="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors"
                  >
                    {{ prod.name }}
                  </p>
                  <p
                    class="text-[10px] text-slate-400 font-black uppercase tracking-widest"
                  >
                    {{ prod.category }}
                  </p>
                  <div class="mt-2 flex items-center gap-2">
                    <span class="text-[9px] font-black uppercase text-slate-400"
                      >Current Qty:</span
                    >
                    <span class="text-xs font-black text-primary">{{
                      prod.stock
                    }}</span>
                  </div>
                </div>
                <svg
                  class="w-5 h-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all"
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
                class="col-span-full py-20 text-center bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10"
              >
                <p class="text-slate-400 italic">
                  No products currently registered in this warehouse.
                </p>
              </div>
            }
          </div>
        } @else if (activeTab() === 3) {
          <div class="card-premium overflow-hidden">
            <table class="w-full text-left">
              <thead
                class="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06]"
              >
                <tr>
                  <th
                    class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    Date
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    Type
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center"
                  >
                    Qty
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    User
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 dark:divide-white/[0.04]">
                @for (mov of movements(); track mov.id) {
                  <tr class="text-sm">
                    <td class="px-6 py-4 font-bold text-slate-500">
                      {{ mov.date }}
                    </td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'text-emerald-500': mov.type === 'Inbound',
                          'text-rose-500': mov.type === 'Outbound',
                          'text-primary': mov.type === 'Transfer',
                        }"
                        class="font-black uppercase text-[10px] tracking-widest"
                      >
                        {{ mov.type }}
                      </span>
                    </td>
                    <td
                      class="px-6 py-4 text-center font-black text-slate-900 dark:text-white"
                    >
                      {{ mov.qty }}
                    </td>
                    <td class="px-6 py-4 text-xs font-bold text-slate-400">
                      {{ mov.user }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td
                      colspan="4"
                      class="px-6 py-12 text-center text-slate-400 italic"
                    >
                      No recent movements recorded.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
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
export class WarehouseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(InventoryDataService);

  isLoading = signal(true);
  activeTab = signal(0);

  warehouseId = computed(() => this.route.snapshot.paramMap.get("id"));
  warehouse = computed(() =>
    this.dataService.warehouses().find((w) => w.id === this.warehouseId()),
  );

  storedProducts = computed(() => {
    const id = this.warehouseId();
    // Assuming products have a warehouseId property based on your requirements
    return this.dataService
      .products()
      .filter((p) => (p as any).warehouseId === id);
  });

  movements = computed(() => {
    const id = this.warehouseId();
    return this.dataService
      .movements()
      .filter(
        (m) =>
          m.fromLocation.startsWith(id || "") ||
          m.toLocation.startsWith(id || ""),
      );
  });

  capacityStatus = computed(() => {
    const u = this.warehouse()?.utilization || 0;
    if (u > 90) return "Near Capacity";
    if (u > 70) return "Heavy Load";
    return "Optimal";
  });

  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 800);
  }

  getBarClass(u: number) {
    if (u > 90) return "bg-rose-500";
    if (u > 70) return "bg-amber-500";
    return "bg-primary";
  }
}
