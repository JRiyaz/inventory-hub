import { Component, signal, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  InventoryDataService,
  Customer,
  NotificationService,
  CustomDropdownComponent,
  DropdownOption,
  LoaderComponent,
} from "ui-shared";

@Component({
  selector: "app-customer-create",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CustomDropdownComponent,
    LoaderComponent,
  ],
  template: `
    <div class="p-3 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <nav
        class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6"
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
        @if (isEditMode()) {
          <a
            [routerLink]="['/inventory/customers', customerId]"
            class="hover:text-primary transition-colors"
            >{{ formData.name || "Customer" }}</a
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
            >Update Relationship</span
          >
        } @else {
          <span class="text-slate-900 dark:text-white">New Relationship</span>
        }
      </nav>

      <div class="card-premium p-8">
        <div
          class="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100 dark:border-white/5"
        >
          <div
            class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              @if (isEditMode()) {
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              } @else {
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              }
            </svg>
          </div>
          <div>
            <h2
              class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
            >
              {{
                isEditMode() ? "Modify Client Records" : "Onboard New Client"
              }}
            </h2>
            <p
              class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1"
            >
              {{
                isEditMode()
                  ? "Updating Profile: " + customerId
                  : "Industrial & Commercial Sector Registration"
              }}
            </p>
          </div>
        </div>

        <form (ngSubmit)="submitForm()" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <!-- Full Name -->
            <div class="floating-input-group">
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="formData.name"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="name" class="floating-label">Full Legal Name</label>
            </div>

            <!-- Company -->
            <div class="floating-input-group">
              <input
                type="text"
                id="company"
                name="company"
                [(ngModel)]="formData.company"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="company" class="floating-label"
                >Enterprise Entity</label
              >
            </div>

            <!-- Email -->
            <div class="floating-input-group">
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="formData.email"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="email" class="floating-label">Business Email</label>
            </div>

            <!-- Phone -->
            <div class="floating-input-group">
              <input
                type="tel"
                id="phone"
                name="phone"
                [(ngModel)]="formData.phone"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="phone" class="floating-label">Contact Number</label>
            </div>

            <!-- Location -->
            <div class="floating-input-group md:col-span-2">
              <input
                type="text"
                id="location"
                name="location"
                [(ngModel)]="formData.location"
                placeholder=" "
                class="floating-input"
                required
              />
              <label for="location" class="floating-label"
                >Primary HQ Address</label
              >
            </div>

            <!-- Status (Edit Mode only) -->
            @if (isEditMode()) {
              <div class="w-full md:col-span-2">
                <label
                  class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block"
                  >Account Status</label
                >
                <lib-custom-dropdown
                  [options]="statusOptions"
                  [value]="formData.status"
                  (valueChange)="formData.status = $event"
                ></lib-custom-dropdown>
              </div>
            }
          </div>

          <div
            class="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-white/5 mt-10"
          >
            <button
              type="button"
              [routerLink]="
                isEditMode()
                  ? ['/inventory/customers', customerId]
                  : ['/inventory/customers']
              "
              class="btn-secondary-premium"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting() || !isValid()"
              class="btn-primary-premium min-w-[160px]"
            >
              <lib-loader
                [loading]="isSubmitting()"
                [label]="
                  isEditMode() ? 'Save Changes' : 'Finalize Registration'
                "
              ></lib-loader>
            </button>
          </div>
        </form>
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
export class CustomerCreateComponent implements OnInit {
  private dataService = inject(InventoryDataService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  customerId: string = "";
  isSubmitting = signal(false);

  formData = {
    name: "",
    company: "",
    email: "",
    phone: "",
    location: "",
    status: "Active" as "Active" | "Inactive",
  };

  statusOptions: DropdownOption[] = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.isEditMode.set(true);
        this.customerId = params["id"];
        this.loadCustomer();
      }
    });
  }

  loadCustomer() {
    const customer = this.dataService
      .customers()
      .find((c) => c.id === this.customerId);
    if (customer) {
      this.formData = {
        name: customer.name,
        company: customer.company || "",
        email: customer.email,
        phone: customer.phone,
        location: customer.location || "",
        status: customer.status,
      };
    } else {
      this.notificationService.error(
        "Customer Not Found",
        "The client record could not be found.",
      );
      this.router.navigate(["/inventory/customers"]);
    }
  }

  isValid(): boolean {
    return !!(
      this.formData.name &&
      this.formData.company &&
      this.formData.email &&
      this.formData.phone
    );
  }

  submitForm() {
    if (!this.isValid()) return;

    this.isSubmitting.set(true);

    if (this.isEditMode()) {
      const existingCustomer = this.dataService
        .customers()
        .find((c) => c.id === this.customerId);
      const updatedCustomer: Customer = {
        ...existingCustomer!,
        ...this.formData,
      };

      setTimeout(() => {
        this.dataService.updateCustomer(updatedCustomer);
        this.notificationService.success(
          "Update Successful",
          `${updatedCustomer.name}'s profile has been updated.`,
        );
        this.isSubmitting.set(false);
        this.router.navigate(["/inventory/customers", this.customerId]);
      }, 1200);
    } else {
      const newCustomer: Customer = {
        id: "CUST-" + Math.floor(1000 + Math.random() * 9000),
        ...this.formData,
        status: "Active",
        joinDate: new Date().toISOString().split("T")[0],
      };

      setTimeout(() => {
        this.dataService.addCustomer(newCustomer);
        this.notificationService.success(
          "Registration Successful",
          `${newCustomer.name} has been added to the directory.`,
        );
        this.isSubmitting.set(false);
        this.router.navigate(["/inventory/customers", newCustomer.id]);
      }, 1500);
    }
  }
}
