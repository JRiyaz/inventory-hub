import { Component, computed, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { InventoryDataService, PageHeaderComponent } from "ui-shared";

@Component({
  selector: "app-inventory-overview",
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  template: `
    <div class="p-3 sm:p-5 max-w-7xl mx-auto animate-fade-in">
      <lib-page-header
        title="Inventory Hub"
        subtitle="Global overview of your supply chain, orders, and fulfillment operations."
        [stats]="headerStats()"
        [breadcrumbs]="breadcrumbs"
        [loading]="isLoading()"
        actionLabel="Manage Settings"
        backLink="/dashboard"
      ></lib-page-header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (module of modules; track module.path) {
          <div
            [routerLink]="module.path"
            class="card-premium p-6 group cursor-pointer hover:border-primary/50 transition-all flex flex-col h-full"
          >
            <div class="flex items-center gap-4 mb-6">
              <div
                class="w-14 h-14 rounded-2xl flex items-center justify-center text-primary transition-all group-hover:scale-110 shadow-lg shadow-primary/5 group-hover:shadow-primary/20"
                [ngClass]="module.bgClass"
              >
                <div [innerHTML]="sanitize(module.icon)" class="w-7 h-7"></div>
              </div>
              <div>
                <h3
                  class="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors"
                >
                  {{ module.name }}
                </h3>
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  {{ module.subtitle }}
                </p>
              </div>
            </div>

            <p
              class="text-sm text-slate-600 dark:text-slate-400 mb-8 flex-1 font-medium italic"
            >
              {{ module.description }}
            </p>

            <div
              class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5"
            >
              <div class="flex flex-col">
                <span
                  class="text-[9px] font-black uppercase tracking-widest text-slate-400"
                  >Live Count</span
                >
                <div class="h-6 flex items-center">
                  @if (isLoading()) {
                    <div class="dots-wave scale-75 origin-left">
                      <span class="!bg-primary"></span>
                      <span class="!bg-primary"></span>
                      <span class="!bg-primary"></span>
                    </div>
                  } @else {
                    <span
                      class="text-xl font-black text-slate-900 dark:text-white animate-scale-in"
                    >
                      {{ module.count() }}
                    </span>
                  }
                </div>
              </div>
              <div
                class="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"
              >
                <svg
                  class="w-5 h-5 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Quick Activity / Recent Sync -->
      <div class="mt-12">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2
            class="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white"
          >
            Regional Node Performance
          </h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card-premium p-6">
            <h4
              class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4"
            >
              Stock Utilization
            </h4>
            <div class="space-y-4">
              @for (
                region of ["North America", "Europe", "Asia Pacific"];
                track region
              ) {
                <div class="space-y-2">
                  <div
                    class="flex justify-between text-[10px] font-black uppercase tracking-widest"
                  >
                    <span class="text-slate-600 dark:text-slate-300">{{
                      region
                    }}</span>
                    <span class="text-primary">{{ 75 + $index * 8 }}%</span>
                  </div>
                  <div
                    class="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-primary"
                      [style.width.%]="75 + $index * 8"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>
          <div
            class="card-premium p-6 flex flex-col justify-center text-center bg-primary/5 border-primary/20"
          >
            <p
              class="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2"
            >
              Automated Insights
            </p>
            <p
              class="text-slate-700 dark:text-slate-200 text-sm font-medium italic mb-4"
            >
              "Your warehouse in Asia Pacific is reaching 91% capacity. Consider
              rerouting upcoming shipments to Europe Node B."
            </p>
            <button class="btn-primary-premium mx-auto">
              Optimize Logistics
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class InventoryComponent implements OnInit {
  private dataService = inject(InventoryDataService);
  private sanitizer = inject(DomSanitizer);

  isLoading = signal(true);

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  breadcrumbs = [
    { label: "Dashboard", link: "/dashboard" },
    { label: "Inventory" },
  ];

  modules = [
    {
      name: "Products",
      subtitle: "Catalog & Stock",
      path: "products",
      description:
        "Manage your master item catalog, price lists, and global stock levels across all regions.",
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>',
      bgClass: "bg-blue-500/10",
      count: computed(() => this.dataService.products().length),
    },
    {
      name: "Orders",
      subtitle: "Fulfillment",
      path: "orders",
      description:
        "Track customer orders from placement to delivery. Monitor priority fulfillment and backorders.",
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>',
      bgClass: "bg-amber-500/10",
      count: computed(() => this.dataService.orders().length),
    },
    {
      name: "Customers",
      subtitle: "CRM & Insights",
      path: "customers",
      description:
        "Analyze customer buying patterns, manage account standings, and view lifetime purchase history.",
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m12-10a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>',
      bgClass: "bg-emerald-500/10",
      count: computed(() => this.dataService.customers().length),
    },
    {
      name: "Suppliers",
      subtitle: "Procurement",
      path: "suppliers",
      description:
        "Coordinate with vendors, manage reliability scores, and monitor upstream supply chain health.",
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>',
      bgClass: "bg-rose-500/10",
      count: computed(() => this.dataService.suppliers().length),
    },
    {
      name: "Warehouses",
      subtitle: "Logistics",
      path: "warehouses",
      description:
        "Optimize physical storage, manage zone allocation, and monitor warehouse utilization rates.",
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>',
      bgClass: "bg-purple-500/10",
      count: computed(() => this.dataService.warehouses().length),
    },
    {
      name: "Payments",
      subtitle: "Ledger",
      path: "payments",
      description:
        "Consolidate financial transactions, monitor revenue flow, and track outstanding settlements.",
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 8h6m-2 2a2 2 0 110 4h-2a2 2 0 110-4zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      bgClass: "bg-sky-500/10",
      count: computed(() => this.dataService.payments().length),
    },
  ];

  headerStats = computed(() => [
    {
      label: "Total Inventory Value",
      value: "$1.42M",
      color: "success" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
    },
    {
      label: "Global Node Count",
      value: "12 Sites",
      color: "info" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
    },
    {
      label: "Avg. Stock Turn",
      value: "4.2x",
      color: "primary" as const,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>',
    },
  ]);

  ngOnInit(): void {
    setTimeout(() => this.isLoading.set(false), 800);
  }
}
