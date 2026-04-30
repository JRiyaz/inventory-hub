import { Routes } from "@angular/router";

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./customers.component").then((m) => m.CustomersComponent),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./customer-detail/customer-detail.component").then(
        (m) => m.CustomerDetailComponent,
      ),
  },
];
