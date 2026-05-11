import { Routes } from "@angular/router";

export const INVENTORY_ROUTES: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./features/inventory/inventory.routes").then(
            (m) => m.INVENTORY_ROOT_ROUTES,
          ),
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
      {
        path: "suppliers",
        loadChildren: () =>
          import("./features/suppliers/suppliers.routes").then(
            (m) => m.SUPPLIERS_ROUTES,
          ),
      },
      {
        path: "warehouses",
        loadChildren: () =>
          import("./features/warehouses/warehouses.routes").then(
            (m) => m.WAREHOUSES_ROUTES,
          ),
      },
      {
        path: "payments",
        loadChildren: () =>
          import("./features/payments/payments.routes").then(
            (m) => m.PAYMENTS_ROUTES,
          ),
      },
      {
        path: "offers",
        loadComponent: () =>
          import("./features/offers/offers.component").then(
            (m) => m.OffersComponent,
          ),
      },
      {
        path: "analytics",
        loadChildren: () =>
          import("./features/analytics/analytics.routes").then(
            (m) => m.ANALYTICS_ROUTES,
          ),
      },
      {
        path: "support",
        loadComponent: () =>
          import("./features/support/support.component").then(
            (m) => m.SupportComponent,
          ),
      },
      {
        path: "procurement",
        loadChildren: () =>
          import("./features/procurement/procurement.routes").then(
            (m) => m.PROCUREMENT_ROUTES,
          ),
      },
    ],
  },
];
