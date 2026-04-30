import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  viewChild,
  ElementRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import {
  InventoryDataService,
  Product,
  Order,
  OrderItem,
  Customer,
} from "ui-shared";

@Component({
  selector: "app-order-create",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div
      class="p-3 sm:p-5 max-w-6xl mx-auto animate-fade-in"
      (click)="closeAllPopovers()"
    >
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
        <span class="text-slate-900 dark:text-white">New Order</span>
      </nav>

      <div class="space-y-4">
        <!-- Top Dashboard Header (Summary + Customer + Priority) -->
        <div
          class="card-premium p-4 border-b-4 border-b-primary sticky top-0 z-[100] animate-fade-in"
        >
          <div
            class="flex flex-col xl:flex-row items-center justify-between gap-6"
          >
            <!-- Customer Selection (Most Prominent) -->
            <div
              class="w-full xl:w-1/3 relative"
              (click)="$event.stopPropagation()"
            >
              <p class="label-premium">Selected Customer</p>
              <div
                (click)="toggleCustomerSearch()"
                class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-primary transition-all group"
              >
                <div class="flex items-center gap-3 truncate">
                  <div
                    class="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary"
                  >
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span
                    class="text-sm font-black truncate"
                    [class.text-slate-400]="!selectedCustomerId()"
                    [class.text-slate-900]="selectedCustomerId()"
                    [class.dark:text-white]="selectedCustomerId()"
                  >
                    {{ selectedCustomerName() || "Choose Customer..." }}
                  </span>
                </div>
                <svg
                  class="w-4 h-4 text-slate-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <!-- Customer Search Popover -->
              <!-- Customer Search Popover -->
              @if (showCustomerSearch()) {
                <div
                  class="absolute top-full left-0 right-0 mt-2 card-premium z-[300] p-3 animate-fade-in shadow-xl"
                >
                  <div class="relative mb-3">
                    <input
                      #customerSearchInput
                      type="text"
                      [ngModel]="customerSearchQuery()"
                      (ngModelChange)="customerSearchQuery.set($event)"
                      placeholder="Search customer..."
                      class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all pr-8"
                    />
                    @if (customerSearchQuery()) {
                      <button
                        (click)="customerSearchQuery.set('')"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                      >
                        <svg
                          class="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M6 18L18 6M6 6l12 12"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    }
                  </div>
                  <div
                    class="max-h-48 overflow-y-auto custom-scrollbar space-y-1"
                  >
                    @for (c of filteredCustomerOptions(); track c.id) {
                      <button
                        (click)="onCustomerSelect(c)"
                        class="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 group transition-all"
                      >
                        <p
                          class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary"
                        >
                          {{ c.name }}
                        </p>
                        <p
                          class="text-[9px] font-black uppercase text-slate-400"
                        >
                          #{{ c.id }}
                        </p>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Stats & Priority -->
            <div
              class="flex-1 w-full flex flex-wrap items-center justify-center xl:justify-start gap-8"
            >
              <div class="flex flex-col">
                <p class="label-premium mb-0.5">Subtotal</p>
                <p class="text-lg font-black text-primary">
                  {{ subtotal() | currency }}
                </p>
              </div>
              <div
                class="h-6 w-[1px] bg-slate-200 dark:bg-white/10 hidden md:block"
              ></div>
              <div class="flex flex-col">
                <p class="label-premium mb-0.5">Items</p>
                <p class="text-sm font-black text-slate-700 dark:text-white">
                  {{ totalItemsCount() }} Units
                </p>
              </div>
              <div
                class="h-6 w-[1px] bg-slate-200 dark:bg-white/10 hidden md:block"
              ></div>

              <!-- Priority Toggle -->
              <button
                (click)="isPriority.set(!isPriority())"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 active:scale-95 text-[9px] font-black uppercase tracking-widest"
                [class.bg-amber-500/10]="isPriority()"
                [class.text-amber-500]="isPriority()"
                [class.border-amber-500/20]="isPriority()"
                [class.bg-slate-50]="!isPriority()"
                [class.dark:bg-white/5]="!isPriority()"
                [class.text-slate-400]="!isPriority()"
                [class.border-slate-200]="!isPriority()"
                [class.dark:border-white/10]="!isPriority()"
              >
                <div
                  class="w-2 h-2 rounded-full transition-colors duration-300"
                  [class.bg-amber-500]="isPriority()"
                  [class.bg-slate-300]="!isPriority()"
                ></div>
                High Priority
              </button>
            </div>

            <!-- Action Button -->
            <div class="w-full xl:w-auto">
              <button
                (click)="submitOrder()"
                [disabled]="!canSubmit() || isSubmitting()"
                [class.btn-loading]="isSubmitting()"
                class="w-full xl:w-56 btn-primary-premium"
              >
                Create Order
              </button>
              @if (!selectedCustomerId()) {
                <p
                  class="text-[8px] text-rose-500 font-black uppercase tracking-widest text-center mt-1 animate-pulse"
                >
                  * Select Customer
                </p>
              }
            </div>
          </div>
        </div>

        <!-- Dynamic Order Items List -->
        <div class="card-premium p-6 relative">
          <div class="flex items-center justify-between mb-1">
            <h3
              class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight"
            >
              Order Items
            </h3>
            <!-- Scanner Input -->
            <div class="relative group">
              <input
                type="text"
                [(ngModel)]="scanInput"
                (keyup.enter)="handleScan()"
                placeholder="Scan..."
                class="bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-primary rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all pr-8 w-64"
              />
              <svg
                class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 17h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
          </div>

          <!-- Scrollable Items Container -->
          <div
            class="max-h-[500px] overflow-y-auto custom-scrollbar -mx-2 px-2 pb-60 pt-1"
          >
            <div class="space-y-2">
              <!-- Table Headers -->
              @if (orderItems().length > 0) {
                <div
                  class="grid grid-cols-[40px_1fr_100px_100px_100px_40px] gap-2 p-3 border-b border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 sticky top-0 bg-white dark:bg-[#0f172a] z-20 border-b-2 border-b-primary dark:border-primary/40"
                >
                  <span>#</span>
                  <span>Name</span>
                  <span class="text-center">Qty</span>
                  <span class="text-right">Price</span>
                  <span class="text-right">Total</span>
                  <span></span>
                </div>
              }

              <!-- Item Rows -->
              @for (
                item of orderItems();
                track item.productId;
                let i = $index
              ) {
                <div
                  class="grid grid-cols-[40px_1fr_100px_100px_100px_40px] gap-2 px-4 py-2 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-xl items-center group animate-fade-in shadow-sm"
                >
                  <span class="text-[10px] font-black text-slate-400">{{
                    i + 1
                  }}</span>
                  <div class="flex items-center gap-2 truncate">
                    <div
                      class="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-primary flex-shrink-0"
                    >
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div class="truncate">
                      <p
                        class="text-xs font-bold text-slate-900 dark:text-white truncate"
                      >
                        {{ item.name }}
                      </p>
                      <p class="text-[8px] font-black uppercase text-slate-400">
                        #{{ item.productId }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      (click)="updateQty(item, -1)"
                      class="w-5 h-5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-primary active:scale-90 transition-all text-xs"
                    >
                      -
                    </button>
                    <span
                      class="w-6 text-center text-xs font-black text-slate-900 dark:text-white"
                      >{{ item.qty }}</span
                    >
                    <button
                      (click)="updateQty(item, 1)"
                      class="w-5 h-5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-primary active:scale-90 transition-all text-xs"
                    >
                      +
                    </button>
                  </div>
                  <span class="text-xs font-bold text-slate-500 text-right">{{
                    item.price | currency
                  }}</span>
                  <span class="text-xs font-black text-primary text-right">{{
                    item.price * item.qty | currency
                  }}</span>
                  <button
                    (click)="removeItem(i)"
                    class="p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
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
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              }

              <!-- Search "Draft" Row -->
              <div
                class="relative group mt-2"
                (click)="$event.stopPropagation()"
              >
                <div
                  (click)="toggleProductSearch()"
                  class="w-full bg-slate-50 dark:bg-white/[0.02] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <span
                      class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight"
                      >Add Product</span
                    >
                  </div>
                  <div
                    class="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-widest"
                  >
                    <span>Search</span>
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                @if (showProductResults()) {
                  <div
                    class="absolute top-full mt-2 left-0 right-0 card-premium z-[300] p-3 animate-fade-in shadow-xl"
                  >
                    <div class="relative mb-3">
                      <input
                        #productSearchInput
                        type="text"
                        [ngModel]="productSearchQuery()"
                        (ngModelChange)="productSearchQuery.set($event)"
                        placeholder="Search products..."
                        class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-primary pl-9"
                      />
                      <svg
                        class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                      </svg>
                    </div>
                    <div
                      class="max-h-48 overflow-y-auto custom-scrollbar space-y-1"
                    >
                      @for (p of filteredProductOptions(); track p.id) {
                        <button
                          (click)="addItemToOrder(p)"
                          class="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 hover:bg-primary/10 rounded-lg transition-all group"
                        >
                          <div class="text-left truncate mr-4">
                            <p
                              class="text-xs font-bold text-slate-900 dark:text-white truncate"
                            >
                              {{ p.name }}
                            </p>
                            <p
                              class="text-[9px] text-slate-400 font-bold uppercase"
                            >
                              Stock: {{ p.stock }}
                            </p>
                          </div>
                          <p class="text-xs font-black text-primary">
                            {{ p.price | currency }}
                          </p>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
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
      @keyframes pulse-slow {
        0%,
        100% {
          border-color: rgba(109, 116, 255, 0.1);
        }
        50% {
          border-color: rgba(109, 116, 255, 0.4);
        }
      }
      .animate-pulse-slow {
        animation: pulse-slow 2s infinite ease-in-out;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(109, 116, 255, 0.1);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(109, 116, 255, 0.2);
      }
    `,
  ],
})
export class OrderCreateComponent implements OnInit {
  private dataService = inject(InventoryDataService);
  private router = inject(Router);
  isSubmitting = signal(false);

  scanInput = "";
  productSearchQuery = signal("");
  customerSearchQuery = signal("");
  showProductResults = signal(false);
  showCustomerSearch = signal(false);

  customerSearchInput = viewChild<ElementRef<HTMLInputElement>>(
    "customerSearchInput",
  );
  productSearchInput =
    viewChild<ElementRef<HTMLInputElement>>("productSearchInput");

  selectedCustomerId = signal<string | null>(null);
  selectedCustomerName = signal<string | null>(null);
  isPriority = signal(false);
  orderItems = signal<OrderItem[]>([]);

  customerOptions = computed(() =>
    this.dataService.customers().map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
    })),
  );

  filteredCustomerOptions = computed(() => {
    const query = this.customerSearchQuery().toLowerCase().trim();
    if (!query) return this.customerOptions();
    return this.customerOptions().filter(
      (c) =>
        c.name.toLowerCase().includes(query) || c.id.toString().includes(query),
    );
  });

  filteredProductOptions = computed(() => {
    const query = this.productSearchQuery().toLowerCase().trim();
    if (!query) return this.dataService.products();
    return this.dataService
      .products()
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.id.toString() === query ||
          p.category.toLowerCase().includes(query),
      );
  });

  subtotal = computed(() =>
    this.orderItems().reduce((sum, item) => sum + item.price * item.qty, 0),
  );

  totalItemsCount = computed(() =>
    this.orderItems().reduce((sum, item) => sum + item.qty, 0),
  );

  canSubmit = computed(
    () => this.selectedCustomerId() !== null && this.orderItems().length > 0,
  );

  ngOnInit(): void {}

  closeAllPopovers() {
    this.showCustomerSearch.set(false);
    this.showProductResults.set(false);
  }

  onCustomerSelect(customer: any) {
    this.selectedCustomerId.set(customer.id);
    this.selectedCustomerName.set(customer.name);
    this.showCustomerSearch.set(false);
    this.customerSearchQuery.set("");
  }

  toggleCustomerSearch() {
    const currentState = this.showCustomerSearch();
    this.closeAllPopovers();
    this.showCustomerSearch.set(!currentState);
    if (this.showCustomerSearch()) {
      setTimeout(() => this.customerSearchInput()?.nativeElement.focus(), 0);
    }
  }

  toggleProductSearch() {
    const currentState = this.showProductResults();
    this.closeAllPopovers();
    this.showProductResults.set(!currentState);

    if (this.showProductResults()) {
      this.productSearchQuery.set("");
      setTimeout(() => {
        this.productSearchInput()?.nativeElement.focus();
        const container = document.querySelector(".max-h-\\[500px\\]");
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }

  handleScan() {
    const input = this.scanInput.trim();
    if (!input) return;

    const product = this.dataService
      .products()
      .find(
        (p) =>
          p.id.toString() === input ||
          p.name.toLowerCase().includes(input.toLowerCase()),
      );

    if (product) {
      this.addItemToOrder(product);
      this.scanInput = "";
    } else {
      this.scanInput = "";
    }
  }

  addItemToOrder(product: Product) {
    this.orderItems.update((items) => {
      const existing = items.find((i) => i.productId === product.id);
      if (existing) {
        return items.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      } else {
        return [
          ...items,
          {
            productId: product.id,
            name: product.name,
            qty: 1,
            price: product.price,
          },
        ];
      }
    });
    this.productSearchQuery.set("");
    this.showProductResults.set(false);
  }

  updateQty(item: OrderItem, delta: number) {
    this.orderItems.update((items) => {
      return items.map((i) => {
        if (i.productId === item.productId) {
          const newQty = Math.max(1, i.qty + delta);
          return { ...i, qty: newQty };
        }
        return i;
      });
    });
  }

  removeItem(index: number) {
    this.orderItems.update((items) => items.filter((_, i) => i !== index));
  }

  submitOrder() {
    if (!this.canSubmit()) return;

    const customerId = this.selectedCustomerId();
    const customer = this.dataService
      .customers()
      .find((c) => c.id === customerId);

    if (!customer) return;

    const newOrder: Order = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      customer: customer.name,
      status: "Pending",
      amount: this.subtotal(),
      date: new Date().toISOString().split("T")[0],
      priority: this.isPriority(),
      items: this.orderItems(),
    };

    this.isSubmitting.set(true);
    // Simulate backend call
    setTimeout(() => {
      this.dataService.addOrder(newOrder);
      this.isSubmitting.set(false);
      this.router.navigate(["/inventory/orders", newOrder.id]);
    }, 1500);
  }
}
