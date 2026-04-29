import { Component, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  AuthStateService,
  CustomDatePickerComponent,
  CustomDropdownComponent,
  DropdownOption,
} from "ui-shared";

interface Order {
  id: string;
  customer: string;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  amount: number;
  date: string;
  priority: boolean;
  items?: { name: string; qty: number; price: number }[];
}

@Component({
  selector: "app-order-detail",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CustomDatePickerComponent,
    CustomDropdownComponent,
  ],
  template: `
    <div class="p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in">
      <!-- Breadcrumbs -->
      <nav
        class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8"
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
        <span class="text-slate-900 dark:text-white"
          >Order #{{ order()?.id }}</span
        >
      </nav>

      <div
        *ngIf="order()"
        class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl dark:shadow-none"
      >
        <!-- Status Header -->
        <div
          class="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.08] p-8 flex flex-col sm:flex-row justify-between items-center gap-6"
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
                class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
              >
                Order #{{ order()?.id }}
              </h2>
              <p
                class="text-xs text-slate-400 uppercase font-bold tracking-widest"
              >
                {{ order()?.date }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div
              *ngIf="!isEditing()"
              [ngClass]="{
                'bg-amber-500/10 text-amber-500 border-amber-500/20':
                  order()?.status === 'Pending',
                'bg-primary/10 text-primary border-primary/20':
                  order()?.status === 'Processing',
                'bg-green-500/10 text-green-500 border-green-500/20':
                  order()?.status === 'Completed',
                'bg-rose-500/10 text-rose-500 border-rose-500/20':
                  order()?.status === 'Cancelled',
              }"
              class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border"
            >
              {{ order()?.status }}
            </div>

            <button
              *ngIf="auth.isAdmin()"
              (click)="toggleEdit()"
              class="px-6 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all"
            >
              {{ isEditing() ? "Cancel" : "Edit Order" }}
            </button>
          </div>
        </div>

        <div class="p-8 sm:p-12">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <!-- Left: Info -->
            <div class="lg:col-span-2 space-y-10">
              <!-- Customer Section -->
              <section>
                <div class="flex justify-between items-center mb-4">
                  <label
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 block"
                    >Customer Information</label
                  >
                  <div *ngIf="isEditing()" class="w-48 mb-0">
                    <lib-custom-datepicker
                      [value]="editBuffer.date"
                      (dateChange)="editBuffer.date = $event"
                    ></lib-custom-datepicker>
                  </div>
                </div>
                <div
                  *ngIf="!isEditing()"
                  class="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/[0.04]"
                >
                  <h3
                    class="text-lg font-bold text-slate-900 dark:text-white mb-1"
                  >
                    {{ order()?.customer }}
                  </h3>
                  <span
                    *ngIf="order()?.priority"
                    class="text-[9px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-1"
                  >
                    <span
                      class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"
                    ></span>
                    Priority Account
                  </span>
                </div>
                <div *ngIf="isEditing()" class="space-y-6">
                  <div class="floating-input-group">
                    <input
                      type="text"
                      [(ngModel)]="editBuffer.customer"
                      class="floating-input"
                      id="edit-customer"
                      placeholder=" "
                    />
                    <label class="floating-label" for="edit-customer"
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
                      <tr
                        *ngFor="
                          let item of isEditing()
                            ? editBuffer.items
                            : order()?.items;
                          let i = index
                        "
                        class="text-sm"
                      >
                        <td
                          class="px-6 py-4 font-bold text-slate-900 dark:text-white"
                        >
                          <span *ngIf="!isEditing()">{{ item.name }}</span>
                          <input
                            *ngIf="isEditing()"
                            type="text"
                            [(ngModel)]="editBuffer.items[i].name"
                            class="w-full bg-transparent border-b border-primary/20 focus:border-primary outline-none py-1"
                          />
                        </td>
                        <td class="px-6 py-4 text-center text-slate-500">
                          <span *ngIf="!isEditing()">{{ item.qty }}</span>
                          <input
                            *ngIf="isEditing()"
                            type="number"
                            [(ngModel)]="editBuffer.items[i].qty"
                            class="w-16 bg-transparent border-b border-primary/20 focus:border-primary outline-none py-1 text-center"
                          />
                        </td>
                        <td
                          class="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white"
                        >
                          <span *ngIf="!isEditing()">{{
                            item.price | currency
                          }}</span>
                          <input
                            *ngIf="isEditing()"
                            type="number"
                            [(ngModel)]="editBuffer.items[i].price"
                            class="w-24 bg-transparent border-b border-primary/20 focus:border-primary outline-none py-1 text-right"
                          />
                        </td>
                      </tr>
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

                <div class="space-y-4 mb-8">
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-500">Subtotal</span>
                    <span class="font-bold text-slate-900 dark:text-white">
                      <span *ngIf="!isEditing()">{{
                        order()?.amount | currency
                      }}</span>
                      <input
                        *ngIf="isEditing()"
                        type="number"
                        [(ngModel)]="editBuffer.amount"
                        class="w-24 bg-transparent border-b border-primary/20 focus:border-primary outline-none py-0.5 text-right font-bold"
                      />
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
                      <span *ngIf="!isEditing()">{{
                        order()?.amount | currency
                      }}</span>
                      <span *ngIf="isEditing()">{{
                        editBuffer.amount | currency
                      }}</span>
                    </span>
                  </div>
                </div>

                <div *ngIf="isEditing()" class="space-y-6">
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
                    class="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Update Order
                  </button>
                </div>
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
                  <span class="text-[10px] font-black uppercase tracking-widest"
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
                  <span class="text-[10px] font-black uppercase tracking-widest"
                    >Location: Zone B-12</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  isEditing = signal(false);
  editBuffer: any = {};
  statusOptions: DropdownOption[] = [
    { value: "Pending", label: "Pending", color: "#f59e0b" },
    { value: "Processing", label: "Processing", color: "#6d74ff" },
    { value: "Completed", label: "Completed", color: "#10b981" },
    { value: "Cancelled", label: "Cancelled", color: "#f43f5e" },
  ];

  // Mock database
  private orders: Order[] = [
    {
      id: "ORD-2341",
      customer: "TechNexus Industries",
      status: "Processing",
      amount: 45200,
      date: "2024-03-28",
      priority: true,
      items: [
        { name: "Logic Controller V3", qty: 2, price: 12400 },
        { name: "Sensor Array Pro", qty: 12, price: 1700 },
      ],
    },
    {
      id: "ORD-2342",
      customer: "Global Logistics Co",
      status: "Pending",
      amount: 12450,
      date: "2024-03-27",
      priority: false,
      items: [
        { name: "Pneumatic Valve", qty: 45, price: 120 },
        { name: "Control Harness", qty: 10, price: 705 },
      ],
    },
    {
      id: "ORD-2343",
      customer: "Quantum Systems",
      status: "Completed",
      amount: 89000,
      date: "2024-03-25",
      priority: true,
      items: [{ name: "Quantum Core Subsystem", qty: 1, price: 89000 }],
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthStateService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    const found = this.orders.find((o) => o.id === id);
    if (found) {
      this.order.set(found);
    } else {
      this.router.navigate(["/inventory/orders"]);
    }
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
