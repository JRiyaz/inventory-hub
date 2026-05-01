import { Routes } from "@angular/router";

export const PRODUCTS_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./products.component").then((m) => m.ProductsComponent),
    data: { title: "Products Management" },
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./product-detail/product-detail.component").then(
        (m) => m.ProductDetailComponent,
      ),
    data: { title: "Product Details" },
  },
];
