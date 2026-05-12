import type { Routes } from '@angular/router';


export const INVENTORY_ROOT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inventory.component').then((m) => m.InventoryComponent),
  },
];
