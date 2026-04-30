import { Component, signal, OnInit, inject, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  InventoryDataService,
  Product,
  Order,
  AuthStateService,
  CustomDropdownComponent,
  DropdownOption,
  SkeletonComponent,
} from "ui-shared";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
          routerLink="/inventory/products"
          class="hover:text-primary transition-colors"
          >Products</a
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
        <span class="text-slate-900 dark:text-white">Product Detail</span>
      </nav>

      @defer (when !isLoading()) {
        @if (product(); as prod) {
          <div
            class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden"
          >
            <div class="flex flex-col lg:flex-row">
              <!-- Left: Image/Visual -->
              <div
                class="w-full lg:w-2/5 bg-slate-50 dark:bg-white/[0.02] p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/[0.08]"
              >
                <div class="relative group">
                  <div
                    class="w-64 h-64 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-200 dark:text-white/5 overflow-hidden"
                  >
                    <svg
                      class="w-32 h-32"
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
                  <div
                    class="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/10 rounded-2xl blur-2xl group-hover:blur-xl transition-all"
                  ></div>
                </div>
              </div>

              <!-- Right: Details -->
              <div class="flex-1 p-6 sm:p-8">
                <div class="flex justify-between items-start mb-5">
                  <div>
                    @if (!isEditing()) {
                      <span
                        class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20 mb-3 block w-fit"
                      >
                        {{ prod.category }}
                      </span>
                    } @else {
                      <div class="w-full sm:w-64 mb-6">
                        <label
                          class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block"
                          >Category</label
                        >
                        <lib-custom-dropdown
                          [options]="categoryOptions"
                          [value]="editBuffer.category"
                          (valueChange)="editBuffer.category = $event"
                        >
                        </lib-custom-dropdown>
                      </div>
                    }

                    @if (!isEditing()) {
                      <h1
                        class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none"
                      >
                        {{ prod.name }}
                      </h1>
                    } @else {
                      <div class="floating-input-group w-full sm:w-96">
                        <input
                          type="text"
                          [(ngModel)]="editBuffer.name"
                          class="floating-input"
                          id="edit-name"
                          placeholder=" "
                        />
                        <label class="floating-label" for="edit-name"
                          >Product Name</label
                        >
                      </div>
                    }
                  </div>
                  @if (auth.isAdmin()) {
                    <button
                      (click)="toggleEdit()"
                      class="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors"
                    >
                      @if (!isEditing()) {
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                      }
                      <span
                        class="text-[10px] font-black uppercase tracking-widest"
                        >{{ isEditing() ? "Cancel" : "Edit" }}</span
                      >
                    </button>
                  }
                </div>

                <div class="space-y-6">
                  <!-- Description -->
                  <div>
                    <label
                      class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block"
                      >Description</label
                    >
                    @if (!isEditing()) {
                      <p
                        class="text-slate-600 dark:text-slate-400 leading-relaxed"
                      >
                        {{ prod.description }}
                      </p>
                    } @else {
                      <div class="floating-input-group">
                        <textarea
                          [(ngModel)]="editBuffer.description"
                          class="floating-input min-h-[100px] py-4"
                          id="edit-desc"
                          placeholder=" "
                        ></textarea>
                        <label class="floating-label" for="edit-desc"
                          >Description</label
                        >
                      </div>
                    }
                  </div>

                  <!-- Metrics -->
                  <div class="grid grid-cols-2 gap-5">
                    <div>
                      <label
                        class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block"
                        >Price</label
                      >
                      @if (!isEditing()) {
                        <div class="text-xl font-black text-primary">
                          {{ prod.price | currency }}
                        </div>
                      } @else {
                        <div class="floating-input-group">
                          <input
                            type="number"
                            [(ngModel)]="editBuffer.price"
                            class="floating-input"
                            id="edit-price"
                            placeholder=" "
                          />
                          <label class="floating-label" for="edit-price"
                            >Price</label
                          >
                        </div>
                      }
                    </div>
                    <div>
                      <label
                        class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block"
                        >In Stock</label
                      >
                      @if (!isEditing()) {
                        <div class="flex items-center gap-2">
                          <span
                            class="text-xl font-black text-slate-900 dark:text-white"
                            >{{ prod.stock }}</span
                          >
                          <span
                            class="text-[10px] font-bold text-green-500 uppercase"
                            >Available</span
                          >
                        </div>
                      } @else {
                        <div class="floating-input-group">
                          <input
                            type="number"
                            [(ngModel)]="editBuffer.stock"
                            (keyup.enter)="saveChanges()"
                            class="floating-input"
                            id="edit-stock"
                            placeholder=" "
                          />
                          <label class="floating-label" for="edit-stock"
                            >Stock Level</label
                          >
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Image URL Editing -->
                  @if (isEditing()) {
                    <div class="pt-2">
                      <div class="floating-input-group">
                        <input
                          type="text"
                          [(ngModel)]="editBuffer.image"
                          (keyup.enter)="saveChanges()"
                          class="floating-input"
                          id="edit-image"
                          placeholder=" "
                        />
                        <label class="floating-label" for="edit-image"
                          >Product Image URL</label
                        >
                      </div>
                    </div>
                  }

                  <!-- Save Button -->
                  @if (isEditing()) {
                    <div
                      class="pt-8 border-t border-slate-100 dark:border-white/[0.05]"
                    >
                      <button
                        (click)="saveChanges()"
                        class="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Related Orders Section (Lazy/Dynamic) -->
        <div class="mt-8 animate-fade-in">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2
                class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
              >
                Order History
              </h2>
              <p
                class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1"
              >
                Orders containing this product
              </p>
            </div>
            <button
              (click)="showOrders.set(!showOrders())"
              class="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all border border-slate-200 dark:border-white/10"
            >
              {{ showOrders() ? "Hide Orders" : "Show Orders" }} ({{
                relatedOrders().length
              }})
            </button>
          </div>

          @if (showOrders()) {
            <div class="space-y-4 animate-dropdown-in">
              @if (relatedOrders().length === 0) {
                <div
                  class="p-12 text-center bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-slate-200 dark:border-white/10"
                >
                  <p class="text-sm text-slate-400 font-medium">
                    No orders found for this product.
                  </p>
                </div>
              }

              @for (order of relatedOrders(); track order.id) {
                <div
                  [routerLink]="['/inventory/orders', order.id]"
                  class="group bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl px-4 py-2 hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between hover:shadow-sm"
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
                          >#{{ order.id }}</span
                        >
                        <span
                          [ngClass]="{
                            'bg-amber-500/10 text-amber-500':
                              order.status === 'Pending',
                            'bg-primary/10 text-primary':
                              order.status === 'Processing',
                            'bg-green-500/10 text-green-500':
                              order.status === 'Completed',
                          }"
                          class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-current/20"
                        >
                          {{ order.status }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 font-medium">
                        {{ order.customer }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-black text-primary mb-1">
                      {{ getQuantityInOrder(order.id) }} Units
                    </div>
                    <p
                      class="text-[10px] text-slate-400 font-bold uppercase tracking-widest"
                    >
                      {{ order.date }}
                    </p>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      } @placeholder {
        <!-- Skeleton Card -->
        <div
          class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden"
        >
          <div class="flex flex-col lg:flex-row">
            <!-- Skeleton Image Area -->
            <div
              class="w-full lg:w-2/5 bg-slate-50 dark:bg-white/[0.02] p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/[0.08]"
            >
              <lib-skeleton
                width="256px"
                height="256px"
                shape="rounded"
              ></lib-skeleton>
            </div>
            <!-- Skeleton Info Area -->
            <div class="flex-1 p-6 sm:p-8 space-y-8">
              <div class="space-y-4">
                <lib-skeleton
                  width="120px"
                  height="1.5rem"
                  shape="rounded"
                ></lib-skeleton>
                <lib-skeleton width="300px" height="3rem"></lib-skeleton>
                <lib-skeleton width="150px" height="1.5rem"></lib-skeleton>
              </div>
              <div class="space-y-4">
                <lib-skeleton width="100%" height="1rem"></lib-skeleton>
                <lib-skeleton width="100%" height="1rem"></lib-skeleton>
                <lib-skeleton width="80%" height="1rem"></lib-skeleton>
              </div>
              <div
                class="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-white/5"
              >
                <lib-skeleton width="150px" height="2.5rem"></lib-skeleton>
                <lib-skeleton
                  width="120px"
                  height="3rem"
                  shape="rounded"
                ></lib-skeleton>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  public dataService = inject(InventoryDataService);
  isLoading = signal(true);
  product = signal<Product | null>(null);
  isEditing = signal(false);
  showOrders = signal(false);
  editBuffer: any = {};

  relatedOrders = computed(() => {
    const p = this.product();
    return p ? this.dataService.getOrdersForProduct(p.id) : [];
  });

  categoryOptions: DropdownOption[] = [
    { value: "Industrial", label: "Industrial" },
    { value: "Electronics", label: "Electronics" },
    { value: "Raw Materials", label: "Raw Materials" },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthStateService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    const found = this.dataService.products().find((p) => p.id === id);
    if (found) {
      this.product.set(found);
    }
    setTimeout(() => {
      this.isLoading.set(false);
    }, 800);
  }

  getQuantityInOrder(orderId: string): number {
    const p = this.product();
    return p ? this.dataService.getProductQuantityInOrder(p.id, orderId) : 0;
  }

  toggleEdit() {
    if (!this.isEditing()) {
      this.editBuffer = { ...this.product() };
    }
    this.isEditing.set(!this.isEditing());
  }

  saveChanges() {
    // In a real app, this would be an API call
    this.product.set({ ...this.editBuffer });
    this.isEditing.set(false);

    // Show a success state or notification would go here
    console.log("Product updated:", this.product());
  }
}
