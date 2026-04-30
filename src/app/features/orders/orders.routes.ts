import { Routes } from "@angular/router";
import { OrdersComponent } from "./orders.component";

export const ORDERS_ROUTES: Routes = [
  {
    path: "",
    component: OrdersComponent,
    data: { title: "Order Tracking" },
  },
  {
    path: "create",
    loadComponent: () =>
      import("./order-create/order-create.component").then(
        (m) => m.OrderCreateComponent,
      ),
    data: { title: "Create New Order" },
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./order-detail/order-detail.component").then(
        (m) => m.OrderDetailComponent,
      ),
    data: { title: "Order Details" },
  },
];
