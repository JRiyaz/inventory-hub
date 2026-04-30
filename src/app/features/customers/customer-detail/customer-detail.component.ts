import { Component, signal, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  InventoryDataService,
  Customer,
  Order,
  AuthStateService,
  CustomDropdownComponent,
  DropdownOption,
  SkeletonComponent,
} from "ui-shared";

@Component({
  selector: "app-customer-detail",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CustomDropdownComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in">
      <!-- Breadcrumbs -->
      <nav
        class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8"
      >
        <a
          routerLink="/inventory/customers"
          class="hover:text-primary transition-colors"
          >Customers</a
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
        <span class="text-slate-900 dark:text-white">Customer Detail</span>
      </nav>

      <div *ngIf="isLoading()">
        <!-- Skeleton Card -->
        <div
          class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl dark:shadow-none mb-12"
        >
          <div class="flex flex-col lg:flex-row">
            <div
              class="w-full lg:w-1/3 bg-slate-50 dark:bg-white/[0.02] p-8 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/[0.08]"
            >
              <lib-skeleton
                width="128px"
                height="128px"
                shape="rounded"
                customClass="mb-6"
              ></lib-skeleton>
              <lib-skeleton
                width="128px"
                height="1.5rem"
                customClass="mb-2"
              ></lib-skeleton>
              <lib-skeleton width="80px" height="1rem"></lib-skeleton>
              <div class="mt-8 w-full space-y-4">
                <lib-skeleton
                  width="100%"
                  height="64px"
                  shape="rounded"
                ></lib-skeleton>
                <lib-skeleton
                  width="100%"
                  height="64px"
                  shape="rounded"
                ></lib-skeleton>
              </div>
            </div>
            <div class="flex-1 p-8 sm:p-12 space-y-10">
              <div class="flex justify-between items-start">
                <lib-skeleton width="200px" height="2rem"></lib-skeleton>
                <lib-skeleton
                  width="80px"
                  height="1.5rem"
                  shape="rounded"
                ></lib-skeleton>
              </div>
              <div class="grid grid-cols-2 gap-8">
                <div *ngFor="let i of [1, 2, 3, 4, 5, 6]" class="space-y-2">
                  <lib-skeleton width="64px" height="0.75rem"></lib-skeleton>
                  <lib-skeleton
                    width="100%"
                    height="1.5rem"
                    shape="rounded"
                  ></lib-skeleton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading()">
        <div
          *ngIf="customer()"
          class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl dark:shadow-none mb-12"
        >
          <div class="flex flex-col lg:flex-row">
            <!-- Left: Profile Info -->
            <div
              class="w-full lg:w-1/3 bg-slate-50 dark:bg-white/[0.02] p-8 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/[0.08]"
            >
              <div
                class="w-32 h-32 bg-primary/10 rounded-3xl flex items-center justify-center text-primary text-4xl font-black mb-6"
              >
                {{ customer()?.name?.charAt(0) }}
              </div>
              <h1
                class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight text-center mb-1"
              >
                {{ customer()?.name }}
              </h1>
              <p
                class="text-xs text-slate-400 font-bold uppercase tracking-widest text-center"
              >
                {{ customer()?.company }}
              </p>

              <div class="mt-8 w-full space-y-4">
                <div
                  class="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm"
                >
                  <span
                    class="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1"
                    >Status</span
                  >
                  <span
                    [ngClass]="{
                      'text-green-500': customer()?.status === 'Active',
                      'text-slate-500': customer()?.status === 'Inactive',
                    }"
                    class="text-xs font-bold uppercase tracking-widest"
                    >{{ customer()?.status }}</span
                  >
                </div>
                <div
                  class="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm"
                >
                  <span
                    class="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1"
                    >Total Lifetime Orders</span
                  >
                  <span class="text-xs font-bold text-primary">{{
                    relatedOrders().length
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Detailed Info / Edit -->
            <div class="flex-1 p-8 sm:p-12">
              <div class="flex justify-between items-start mb-10">
                <div>
                  <h2
                    class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight"
                  >
                    Customer Information
                  </h2>
                  <p
                    class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1"
                  >
                    Manage contact details and business status
                  </p>
                </div>
                <button
                  *ngIf="auth.isAdmin()"
                  (click)="toggleEdit()"
                  class="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors"
                >
                  <svg
                    *ngIf="!isEditing()"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span
                    class="text-[10px] font-black uppercase tracking-widest"
                    >{{ isEditing() ? "Cancel" : "Edit" }}</span
                  >
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Contact Name -->
                <div class="space-y-2">
                  <label
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 block"
                    >Full Name</label
                  >
                  <p
                    *ngIf="!isEditing()"
                    class="text-sm font-bold text-slate-700 dark:text-slate-300"
                  >
                    {{ customer()?.name }}
                  </p>
                  <div *ngIf="isEditing()" class="floating-input-group pt-0">
                    <input
                      type="text"
                      [(ngModel)]="editBuffer.name"
                      class="floating-input"
                      placeholder=" "
                      id="edit-name"
                    />
                  </div>
                </div>

                <!-- Email -->
                <div class="space-y-2">
                  <label
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 block"
                    >Email Address</label
                  >
                  <p
                    *ngIf="!isEditing()"
                    class="text-sm font-bold text-slate-700 dark:text-slate-300"
                  >
                    {{ customer()?.email }}
                  </p>
                  <div *ngIf="isEditing()" class="floating-input-group pt-0">
                    <input
                      type="email"
                      [(ngModel)]="editBuffer.email"
                      class="floating-input"
                      placeholder=" "
                      id="edit-email"
                    />
                  </div>
                </div>

                <!-- Phone -->
                <div class="space-y-2">
                  <label
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 block"
                    >Phone Number</label
                  >
                  <p
                    *ngIf="!isEditing()"
                    class="text-sm font-bold text-slate-700 dark:text-slate-300"
                  >
                    {{ customer()?.phone }}
                  </p>
                  <div *ngIf="isEditing()" class="floating-input-group pt-0">
                    <input
                      type="text"
                      [(ngModel)]="editBuffer.phone"
                      class="floating-input"
                      placeholder=" "
                      id="edit-phone"
                    />
                  </div>
                </div>

                <!-- Company -->
                <div class="space-y-2">
                  <label
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 block"
                    >Company Name</label
                  >
                  <p
                    *ngIf="!isEditing()"
                    class="text-sm font-bold text-slate-700 dark:text-slate-300"
                  >
                    {{ customer()?.company }}
                  </p>
                  <div *ngIf="isEditing()" class="floating-input-group pt-0">
                    <input
                      type="text"
                      [(ngModel)]="editBuffer.company"
                      class="floating-input"
                      placeholder=" "
                      id="edit-company"
                    />
                  </div>
                </div>

                <!-- Status (Select) -->
                <div *ngIf="isEditing()" class="space-y-2 md:col-span-2">
                  <label
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2"
                    >Account Status</label
                  >
                  <lib-custom-dropdown
                    [options]="statusOptions"
                    [value]="editBuffer.status"
                    (valueChange)="editBuffer.status = $event"
                  ></lib-custom-dropdown>
                </div>
              </div>

              <!-- Save Changes -->
              <div
                *ngIf="isEditing()"
                class="mt-10 pt-8 border-t border-slate-100 dark:border-white/[0.05]"
              >
                <button
                  (click)="saveChanges()"
                  class="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Save Customer Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Purchase History Section (Lazy Load Style) -->
        <div class="animate-fade-in pb-20">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2
                class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
              >
                Recent Activity
              </h2>
              <p
                class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1"
              >
                Transaction and order history for this client
              </p>
            </div>
            <button
              (click)="showOrders.set(!showOrders())"
              class="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all border border-slate-200 dark:border-white/10"
            >
              {{ showOrders() ? "Hide History" : "View History" }} ({{
                relatedOrders().length
              }})
            </button>
          </div>

          <div *ngIf="showOrders()" class="space-y-4 animate-dropdown-in">
            <div
              *ngIf="relatedOrders().length === 0"
              class="p-12 text-center bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-slate-200 dark:border-white/10"
            >
              <p class="text-sm text-slate-400 font-medium">
                This customer has not placed any orders yet.
              </p>
            </div>

            <div
              *ngFor="let order of relatedOrders()"
              [routerLink]="['/inventory/orders', order.id]"
              class="group bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-primary/5"
            >
              <div class="flex items-center gap-6">
                <div
                  class="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors"
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
                    <span
                      class="text-sm font-black text-slate-900 dark:text-white"
                      >Order #{{ order.id }}</span
                    >
                    <span
                      [ngClass]="{
                        'bg-amber-500/10 text-amber-500 border-amber-500/20':
                          order.status === 'Pending',
                        'bg-primary/10 text-primary border-primary/20':
                          order.status === 'Processing',
                        'bg-green-500/10 text-green-500 border-green-500/20':
                          order.status === 'Completed',
                        'bg-rose-500/10 text-rose-500 border-rose-500/20':
                          order.status === 'Cancelled',
                      }"
                      class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border"
                    >
                      {{ order.status }}
                    </span>
                  </div>
                  <p
                    class="text-[10px] text-slate-400 font-bold uppercase tracking-widest"
                  >
                    {{ order.date | date: "mediumDate" }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-black text-primary mb-1">
                  {{ order.amount | currency }}
                </div>
                <p
                  class="text-[8px] text-slate-400 font-bold uppercase tracking-widest"
                >
                  {{ order.items.length }} Items
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class CustomerDetailComponent implements OnInit {
  private dataService = inject(InventoryDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public auth = inject(AuthStateService);
  isLoading = signal(true);
  customer = signal<Customer | null>(null);
  isEditing = signal(false);
  showOrders = signal(false);
  editBuffer: any = {};

  statusOptions: DropdownOption[] = [
    { value: "Active", label: "Active", color: "#10b981" },
    { value: "Inactive", label: "Inactive", color: "#94a3b8" },
  ];

  relatedOrders = computed(() => {
    const c = this.customer();
    return c ? this.dataService.getOrdersForCustomer(c.name) : [];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    const found = this.dataService.customers().find((c) => c.id === id);
    if (found) {
      this.customer.set(found);
    }
    setTimeout(() => {
      this.isLoading.set(false);
    }, 600);
  }

  toggleEdit() {
    if (!this.isEditing()) {
      this.editBuffer = { ...this.customer() };
    }
    this.isEditing.set(!this.isEditing());
  }

  saveChanges() {
    this.customer.set({ ...this.editBuffer });
    this.isEditing.set(false);
    console.log("Customer updated:", this.customer());
  }
}
