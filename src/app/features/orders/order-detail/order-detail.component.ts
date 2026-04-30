import { Component, signal, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  InventoryDataService,
  Order,
  OrderItem,
  AuthStateService,
  CustomDatePickerComponent,
  CustomDropdownComponent,
  DropdownOption,
  SkeletonComponent,
} from "ui-shared";

@Component({
  selector: "app-order-detail",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CustomDatePickerComponent,
    CustomDropdownComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="p-3 sm:p-5 max-w-5xl mx-auto animate-fade-in">
      <!-- Breadcrumbs -->
      <nav
        class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5"
      >
        <a
          routerLink="/inventory/orders"
          class="hover:text-primary transition-colors"
          >Orders</a
        >
        <svg
          class="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 5l7 7-7 7"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="text-slate-900 dark:text-white">Order Detail</span>
      </nav>

      @defer (when !isLoading()) {
        @if (order(); as ord) {
          <div
            class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden"
          >
            <!-- Status Header -->
            <div
              class="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.08] p-4 flex flex-col sm:flex-row justify-between items-center gap-4"
            >
              <div class="flex items-center gap-4">
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h2
                    class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
                  >
                    Order #{{ ord.id }}
                  </h2>
                  <p
                    class="text-xs text-slate-400 uppercase font-bold tracking-widest"
                  >
                    {{ ord.date }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                @if (!isEditing()) {
                  <div
                    [ngClass]="{
                      'bg-amber-500/10 text-amber-500 border-amber-500/20':
                        ord.status === 'Pending',
                      'bg-primary/10 text-primary border-primary/20':
                        ord.status === 'Processing',
                      'bg-green-500/10 text-green-500 border-green-500/20':
                        ord.status === 'Completed',
                      'bg-rose-500/10 text-rose-500 border-rose-500/20':
                        ord.status === 'Cancelled',
                    }"
                    class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border"
                  >
                    {{ ord.status }}
                  </div>
                }

                @if (auth.isAdmin()) {
                  <button
                    (click)="toggleEdit()"
                    class="px-6 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all"
                  >
                    {{ isEditing() ? "Cancel" : "Edit Order" }}
                  </button>
                }
              </div>
            </div>

            <div class="p-5 sm:p-8">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left: Info -->
                <div class="lg:col-span-2 space-y-6">
                  <!-- Customer Section -->
                  <section>
                    <div class="flex justify-between items-center mb-4">
                      <label
                        class="text-[10px] font-black uppercase tracking-widest text-slate-400 block"
                        >Customer Information</label
                      >
                      @if (isEditing()) {
                        <div class="w-48 mb-0">
                          <lib-custom-datepicker
                            [value]="editBuffer.date"
                            (dateChange)="editBuffer.date = $event"
                          ></lib-custom-datepicker>
                        </div>
                      }
                    </div>
                    @if (!isEditing()) {
                      <div
                        class="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/[0.04]"
                      >
                        @if (
                          dataService.getCustomerIdByName(ord.customer || "");
                          as custId
                        ) {
                          <a
                            [routerLink]="['/inventory/customers', custId]"
                            class="text-lg font-bold text-slate-900 dark:text-white mb-1 hover:text-primary hover:underline cursor-pointer transition-colors block"
                          >
                            {{ ord.customer }}
                          </a>
                        } @else {
                          <h3
                            class="text-lg font-bold text-slate-900 dark:text-white mb-1"
                          >
                            {{ ord.customer }}
                          </h3>
                        }
                        @if (ord.priority) {
                          <span
                            class="text-[9px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-1"
                          >
                            <span
                              class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"
                            ></span>
                            Priority Account
                          </span>
                        }
                      </div>
                    } @else {
                      <div class="space-y-6">
                        <div class="relative group">
                          <input
                            type="text"
                            [(ngModel)]="editBuffer.customer"
                            (keyup.enter)="saveChanges()"
                            class="w-full bg-transparent border-b-2 border-primary/30 py-2 text-lg font-bold text-slate-900 dark:text-white focus:border-primary outline-none transition-colors"
                          />
                          <label
                            class="absolute left-0 -top-3.5 text-primary text-[10px] uppercase font-bold tracking-widest"
                            >Customer Name</label
                          >
                        </div>

                        <div
                          class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl"
                        >
                          <input
                            type="checkbox"
                            [(ngModel)]="editBuffer.priority"
                            id="edit-priority"
                            class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <label
                            for="edit-priority"
                            class="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer uppercase tracking-widest"
                            >Mark as Priority Account</label
                          >
                        </div>
                      </div>
                    }
                  </section>

                  <!-- Order Items -->
                  <section>
                    <label
                      class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block"
                      >Line Items</label
                    >
                    <div
                      class="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-2xl overflow-hidden"
                    >
                      <table class="w-full text-left">
                        <thead
                          class="bg-slate-50 dark:bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-slate-400"
                        >
                          <tr>
                            <th class="px-6 py-4">Product</th>
                            <th class="px-6 py-4 text-center">Qty</th>
                            <th class="px-6 py-4 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody
                          class="divide-y divide-slate-50 dark:divide-white/[0.04]"
                        >
                          @for (
                            item of isEditing() ? editBuffer.items : ord.items;
                            track i;
                            let i = $index
                          ) {
                            <tr class="text-sm">
                              <td
                                class="px-6 py-4 font-bold text-slate-900 dark:text-white"
                              >
                                @if (!isEditing()) {
                                  <a
                                    [routerLink]="[
                                      '/inventory/products',
                                      item.productId,
                                    ]"
                                    class="hover:text-primary hover:underline transition-colors"
                                  >
                                    {{ item.name }}
                                  </a>
                                } @else {
                                  <input
                                    type="text"
                                    [(ngModel)]="editBuffer.items[i].name"
                                    class="w-full bg-transparent border-b border-primary/20 focus:border-primary outline-none py-1"
                                  />
                                }
                              </td>
                              <td class="px-6 py-4 text-center text-slate-500">
                                @if (!isEditing()) {
                                  <span>{{ item.qty }}</span>
                                } @else {
                                  <input
                                    type="number"
                                    [(ngModel)]="editBuffer.items[i].qty"
                                    class="w-16 bg-transparent border-b border-primary/20 focus:border-primary outline-none py-1 text-center"
                                  />
                                }
                              </td>
                              <td
                                class="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white"
                              >
                                @if (!isEditing()) {
                                  <span>{{ item.price | currency }}</span>
                                } @else {
                                  <input
                                    type="number"
                                    [(ngModel)]="editBuffer.items[i].price"
                                    class="w-24 bg-transparent border-b border-primary/20 focus:border-primary outline-none py-1 text-right"
                                  />
                                }
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <!-- Right: Summary -->
                <div class="space-y-8">
                  <section
                    class="p-8 bg-primary/5 dark:bg-primary/[0.02] border border-primary/10 rounded-3xl"
                  >
                    <label
                      class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 block"
                      >Order Summary</label
                    >

                    <div class="space-y-3 mb-6">
                      <div class="flex justify-between text-sm">
                        <span class="text-slate-500">Subtotal</span>
                        <span class="font-bold text-slate-900 dark:text-white">
                          @if (!isEditing()) {
                            <span>{{ ord.amount | currency }}</span>
                          } @else {
                            <input
                              type="number"
                              [(ngModel)]="editBuffer.amount"
                              class="w-24 bg-transparent border-b border-primary/20 focus:border-primary outline-none py-0.5 text-right font-bold"
                            />
                          }
                        </span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-slate-500">Processing Fee</span>
                        <span class="font-bold text-slate-900 dark:text-white"
                          >$0.00</span
                        >
                      </div>
                      <div
                        class="h-px bg-slate-200 dark:bg-white/[0.08] my-4"
                      ></div>
                      <div class="flex justify-between items-end">
                        <span
                          class="text-[10px] font-black uppercase text-slate-400"
                          >Total Amount</span
                        >
                        <span class="text-2xl font-black text-primary">
                          @if (!isEditing()) {
                            <span>{{ ord.amount | currency }}</span>
                          } @else {
                            <span>{{ editBuffer.amount | currency }}</span>
                          }
                        </span>
                      </div>
                    </div>

                    @if (isEditing()) {
                      <div class="space-y-6">
                        <div class="relative group">
                          <label
                            class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block"
                            >Change Status</label
                          >

                          <lib-custom-dropdown
                            [options]="statusOptions"
                            [value]="editBuffer.status"
                            (valueChange)="editBuffer.status = $event"
                          ></lib-custom-dropdown>
                        </div>

                        <button
                          (click)="saveChanges()"
                          class="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          Update Order
                        </button>
                      </div>
                    }
                  </section>

                  <!-- Quick Info -->
                  <div class="px-8 space-y-4">
                    <div class="flex items-center gap-3 text-slate-400">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span
                        class="text-[10px] font-black uppercase tracking-widest"
                        >Est. Delivery: 3-5 Days</span
                      >
                    </div>
                    <div class="flex items-center gap-3 text-slate-400">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <span
                        class="text-[10px] font-black uppercase tracking-widest"
                        >Location: Zone B-12</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      } @placeholder {
        <!-- Skeleton Card -->
        <div
          class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 space-y-8"
        >
          <div
            class="flex justify-between items-center pb-8 border-b border-slate-100 dark:border-white/5"
          >
            <div class="flex gap-4">
              <lib-skeleton
                width="48px"
                height="48px"
                shape="rounded"
              ></lib-skeleton>
              <div class="space-y-2">
                <lib-skeleton width="120px" height="1.5rem"></lib-skeleton>
                <lib-skeleton width="80px" height="1rem"></lib-skeleton>
              </div>
            </div>
            <lib-skeleton
              width="100px"
              height="2.5rem"
              shape="rounded"
            ></lib-skeleton>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div class="lg:col-span-2 space-y-8">
              <lib-skeleton
                width="100%"
                height="200px"
                shape="rounded"
              ></lib-skeleton>
              <lib-skeleton
                width="100%"
                height="150px"
                shape="rounded"
              ></lib-skeleton>
            </div>
            <div class="space-y-8">
              <lib-skeleton
                width="100%"
                height="300px"
                shape="rounded"
              ></lib-skeleton>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  public dataService = inject(InventoryDataService);
  isLoading = signal(true);
  order = signal<Order | null>(null);
  isEditing = signal(false);
  editBuffer: any = {};
  statusOptions: DropdownOption[] = [
    { value: "Pending", label: "Pending", color: "#f59e0b" },
    { value: "Processing", label: "Processing", color: "#6d74ff" },
    { value: "Completed", label: "Completed", color: "#10b981" },
    { value: "Cancelled", label: "Cancelled", color: "#f43f5e" },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthStateService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    const found = this.dataService.orders().find((o) => o.id === id);
    if (found) {
      this.order.set(found);
    }
    setTimeout(() => {
      this.isLoading.set(false);
    }, 700);
  }

  toggleEdit() {
    if (!this.isEditing()) {
      this.editBuffer = { ...this.order() };
    }
    this.isEditing.set(!this.isEditing());
  }

  saveChanges() {
    this.order.set({ ...this.editBuffer });
    this.isEditing.set(false);
  }
}
