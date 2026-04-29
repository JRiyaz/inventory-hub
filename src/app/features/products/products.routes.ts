import { Routes } from "@angular/router";
import { ProductsComponent } from "./products.component";

export const PRODUCTS_ROUTES: Routes = [
  {
    path: "",
    component: ProductsComponent,
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
