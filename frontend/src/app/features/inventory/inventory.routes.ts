import type { Routes } from '@angular/router';
import { InventoryComponent } from './inventory.component';

export const INVENTORY_ROOT_ROUTES: Routes = [
  {
    path: '',
    component: InventoryComponent,
  },
];
