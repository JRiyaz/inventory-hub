import { Component, signal, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import {
  InventoryDataService,
  SkeletonComponent,
  PageHeaderComponent,
  StatusBadgeComponent,
  NotificationService,
} from "ui-shared";

@Component({
  selector: "app-payments",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SkeletonComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="p-3 sm:p-6 max-w-7xl mx-auto min-h-screen animate-fade-in">
      <lib-page-header
        title="Financial Ledger"
        subtitle="Monitor all inbound and outbound transactions across the organization."
        [stats]="headerStats()"
        actionLabel="Process Refund"
        backLink="/dashboard"
        (action)="initiateRefund()"
      ></lib-page-header>

      <!-- Filters Bar (High Density) -->
      <div
        class="flex flex-col md:flex-row gap-4 mb-5 items-end bg-white dark:bg-white/5 p-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm"
      >
        <div class="flex-1 w-full relative group">
          <div class="floating-input-group">
            <input
              type="text"
              id="pay-search"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder=" "
              class="floating-input"
            />
            <label for="pay-search" class="floating-label">Filter Ledger</label>
            <div class="absolute right-1 top-6">
              <svg
                class="w-3.5 h-3.5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div
          class="flex bg-slate-100 dark:bg-white/[0.05] p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner"
        >
          @for (m of ["All", "Stripe", "PayPal", "Bank"]; track m) {
            <button
              (click)="filterMethod.set(m)"
              [class.bg-white]="filterMethod() === m"
              [class.dark:bg-white/10]="filterMethod() === m"
              [class.shadow-sm]="filterMethod() === m"
              [class.text-primary]="filterMethod() === m"
              class="px-4 py-1.5 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              {{ m }}
            </button>
          }
        </div>
      </div>

      @if (isLoading()) {
        <div class="card-premium overflow-hidden">
          <div class="p-6 space-y-4">
            @for (i of [1, 2, 3, 4, 5]; track i) {
              <lib-skeleton
                width="100%"
                height="60px"
                shape="rounded"
              ></lib-skeleton>
            }
          </div>
        </div>
      } @else {
        <div class="card-premium overflow-hidden animate-fade-in">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead
                class="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06]"
              >
                <tr>
                  <th
                    class="px-6 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400"
                  >
                    Transaction
                  </th>
                  <th
                    class="px-6 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400"
                  >
                    Method
                  </th>
                  <th
                    class="px-6 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right"
                  >
                    Amount
                  </th>
                  <th class="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 dark:divide-white/[0.04]">
                @for (payment of paginatedPayments(); track payment.id) {
                  <tr
                    class="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
                    [routerLink]="[payment.id]"
                  >
                    <td class="px-6 py-2.5">
                      <p
                        class="text-xs font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors"
                      >
                        {{ payment.id }}
                      </p>
                      <p
                        class="text-[9px] text-slate-400 font-bold uppercase tracking-widest"
                      >
                        {{ payment.date | date: "MMM d, yyyy" }}
                      </p>
                    </td>
                    <td class="px-6 py-2.5">
                      <div class="flex items-center gap-2">
                        <div
                          class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors border border-slate-100 dark:border-white/10"
                        >
                          @if (payment.method === "Stripe") {
                            <svg
                              class="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M13.962 10.935c0-1.103.623-1.756 1.826-1.756 1.577 0 2.431 1.253 2.431 1.253l1.869-1.428s-1.418-2.38-4.591-2.38c-3.41 0-5.405 2.022-5.405 4.931 0 5.316 7.439 4.457 7.439 6.756 0 1.383-1.231 1.977-2.71 1.977-1.787 0-3.396-1.45-3.396-1.45l-1.926 1.698s1.753 2.127 5.55 2.127c3.48 0 6.519-1.841 6.519-5.185.001-5.452-7.61-4.654-7.61-6.544zM3.697 10.37h3.919V6.659H3.697v3.711zm0 2.226h3.919V22.5H3.697V12.596zm15.774-2.226h3.919V6.659h-3.919v3.711zm0 2.226h3.919V22.5h-3.919V12.596zM11.529 10.37h3.919V6.659h-3.919v3.711zm0 2.226h3.919V22.5h-3.919V12.596z"
                              />
                            </svg>
                          } @else {
                            <svg
                              class="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                          }
                        </div>
                        <span
                          class="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest"
                          >{{ payment.method }}</span
                        >
                      </div>
                    </td>
                    <td class="px-6 py-2.5">
                      <lib-status-badge
                        [status]="payment.status"
                        class="scale-90 origin-left"
                      ></lib-status-badge>
                    </td>
                    <td class="px-6 py-2.5 text-right">
                      <p
                        class="text-sm font-black text-slate-900 dark:text-white"
                      >
                        {{ payment.amount | currency }}
                      </p>
                    </td>
                    <td class="px-6 py-2.5 text-right">
                      <svg
                        class="w-4 h-4 text-slate-200 group-hover:text-primary group-hover:translate-x-0.5 transition-all inline"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination (Compact) -->
          <div
            *ngIf="allFilteredPayments().length > 0"
            class="px-5 py-3 bg-slate-50/50 dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div class="flex items-center gap-4">
              <span
                class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
              >
                Records:
                <span class="text-slate-900 dark:text-white">{{
                  paginatedPayments().length
                }}</span>
                / {{ allFilteredPayments().length }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                [disabled]="currentPage() === 1"
                (click)="setPage(currentPage() - 1)"
                class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/5 transition-all disabled:opacity-20"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
              </button>

              <div class="flex items-center gap-1">
                @for (p of [].constructor(totalPages()); track $index) {
                  @if ($index < 5 || $index === totalPages() - 1) {
                    <button
                      (click)="setPage($index + 1)"
                      [class.bg-primary]="currentPage() === $index + 1"
                      [class.text-white]="currentPage() === $index + 1"
                      class="w-8 h-8 rounded-lg text-[10px] font-black transition-all hover:bg-primary/10"
                    >
                      {{ $index + 1 }}
                    </button>
                  }
                }
              </div>

              <button
                [disabled]="currentPage() === totalPages()"
                (click)="setPage(currentPage() + 1)"
                class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 hover:border-primary/50 hover:bg-white dark:hover:bg-white/5 transition-all disabled:opacity-20"
              >
                <svg
                  class="w-3.5 h-3.5"
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
              </button>
            </div>
          </div>
        </div>

        @if (allFilteredPayments().length === 0) {
          <div
            class="py-20 text-center bg-white/50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 mt-8"
          >
            <p class="text-slate-400 font-medium italic">
              No transactions match your current search criteria.
            </p>
          </div>
        }
      }
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
export class PaymentsComponent implements OnInit {
  private dataService = inject(InventoryDataService);
  private notificationService = inject(NotificationService);

  isLoading = signal(true);
  searchQuery = signal("");
  filterMethod = signal("All");
  currentPage = signal(1);
  pageSize = signal(12);

  payments = this.dataService.payments;

  headerStats = computed(() => [
    {
      label: "Total Revenue",
      value:
        "$" +
        (
          this.payments()
            .filter((p) => p.status === "Completed")
            .reduce((acc, p) => acc + p.amount, 0) / 1000
        ).toFixed(1) +
        "k",
    },
    {
      label: "Pending Clear",
      value: this.payments().filter((p) => p.status === "Pending").length,
    },
    { label: "Success Rate", value: "98.2%" },
  ]);

  allFilteredPayments = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const method = this.filterMethod();

    return this.payments().filter((p) => {
      const matchesSearch =
        p.id.toLowerCase().includes(query) ||
        p.method.toLowerCase().includes(query);
      const matchesMethod = method === "All" || p.method === method;
      return matchesSearch && matchesMethod;
    });
  });

  paginatedPayments = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.allFilteredPayments().slice(start, start + this.pageSize());
  });

  totalPages = computed(() =>
    Math.ceil(this.allFilteredPayments().length / this.pageSize()),
  );

  ngOnInit(): void {
    setTimeout(() => this.isLoading.set(false), 800);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  initiateRefund(): void {
    this.notificationService.success(
      "Refund Engine Ready",
      "Please select a completed transaction to initiate the refund process.",
    );
  }
}
