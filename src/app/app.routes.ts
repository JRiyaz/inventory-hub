import { Routes } from "@angular/router";

export const INVENTORY_ROUTES: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        redirectTo: "products",
        pathMatch: "full",
      },
      {
        path: "products",
        loadChildren: () =>
          import("./features/products/products.routes").then(
            (m) => m.PRODUCTS_ROUTES,
          ),
      },
      {
        path: "orders",
        loadChildren: () =>
          import("./features/orders/orders.routes").then(
            (m) => m.ORDERS_ROUTES,
          ),
      },
      {
        path: "customers",
        loadChildren: () =>
          import("./features/customers/customers.routes").then(
            (m) => m.CUSTOMERS_ROUTES,
          ),
      },
    ],
  },
];
