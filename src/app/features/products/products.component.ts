import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-products",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-8">
        <h2
          class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
        >
          Products Hub
        </h2>
        <button
          class="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 uppercase tracking-widest"
        >
          Add New Product
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let i of [1, 2, 3, 4, 5, 6]"
          class="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 hover:border-primary/50 transition-all group"
        >
          <div
            class="w-full h-48 bg-slate-100 dark:bg-white/5 rounded-xl mb-4 overflow-hidden relative"
          >
            <div
              class="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-white/10"
            >
              <svg
                class="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Product Sample #{{ i }}
          </h3>
          <p
            class="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2"
          >
            High-performance industrial grade component for high-load
            environments.
          </p>
          <div class="flex justify-between items-center">
            <span class="text-xl font-black text-primary">$299.00</span>
            <span
              class="text-[10px] font-bold px-2 py-1 bg-green-500/10 text-green-500 rounded uppercase tracking-wider"
              >In Stock</span
            >
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductsComponent {}
