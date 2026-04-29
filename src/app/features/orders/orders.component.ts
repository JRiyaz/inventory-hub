import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-orders",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="mb-8">
        <h2
          class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
        >
          Order Tracking
        </h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Monitor and manage all incoming industrial orders.
        </p>
      </div>

      <div
        class="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm dark:shadow-none"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.06]"
            >
              <th
                class="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500"
              >
                Order ID
              </th>
              <th
                class="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500"
              >
                Customer
              </th>
              <th
                class="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500"
              >
                Status
              </th>
              <th
                class="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500"
              >
                Amount
              </th>
              <th
                class="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-right"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/[0.04]">
            <tr
              *ngFor="let i of [1, 2, 3, 4, 5]"
              class="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors"
            >
              <td class="px-6 py-4">
                <span class="text-sm font-mono font-bold text-primary"
                  >#ORD-{{ 2340 + i }}</span
                >
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-slate-900 dark:text-white"
                    >Industrial Corp Ltd</span
                  >
                  <span
                    class="text-[10px] text-slate-400 uppercase tracking-widest"
                    >Priority Client</span
                  >
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  [class.bg-green-500/10]="i % 2 === 0"
                  [class.text-green-500]="i % 2 === 0"
                  [class.border-green-500/20]="i % 2 === 0"
                >
                  {{ i % 2 === 0 ? "Processing" : "Pending" }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm font-black text-slate-900 dark:text-white"
              >
                $12,450.00
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="text-[10px] font-bold text-primary uppercase hover:underline"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class OrdersComponent {}
