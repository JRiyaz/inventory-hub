import { Injectable, signal } from "@angular/core";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  amount: number;
  date: string;
  priority: boolean;
  items: OrderItem[];
}

@Injectable({
  providedIn: "root",
})
export class InventoryDataService {
  products = signal<Product[]>([
    {
      id: 1,
      name: "Precision Logic Controller",
      category: "Industrial",
      price: 1240,
      stock: 45,
      description:
        "High-speed automated processing unit with dual redundancy support.",
      image: "",
    },
    {
      id: 2,
      name: "Thermal Flux Sensor",
      category: "Electronics",
      price: 450,
      stock: 120,
      description:
        "Advanced temperature monitoring with ±0.1°C precision accuracy.",
      image: "",
    },
    {
      id: 3,
      name: "Reinforced Steel Alloy",
      category: "Raw Materials",
      price: 89,
      stock: 2500,
      description:
        "High-tensile strength industrial grade steel for structural components.",
      image: "",
    },
    {
      id: 4,
      name: "Quantum Circuit Breaker",
      category: "Electronics",
      price: 2100,
      stock: 12,
      description:
        "Next-gen energy protection system with instant isolation capabilities.",
      image: "",
    },
    {
      id: 5,
      name: "Pneumatic Actuator X5",
      category: "Industrial",
      price: 670,
      stock: 88,
      description: "Heavy-duty air pressure driven mechanical movement system.",
      image: "",
    },
    {
      id: 6,
      name: "Industrial Grade Coolant",
      category: "Raw Materials",
      price: 150,
      stock: 430,
      description:
        "Non-corrosive heat dissipation fluid for high-temperature machinery.",
      image: "",
    },
    {
      id: 7,
      name: "Logic Gate Array V2",
      category: "Electronics",
      price: 320,
      stock: 15,
      description:
        "Programmable logic controller for complex sequence automation.",
      image: "",
    },
    {
      id: 8,
      name: "Heavy Duty Gear Box",
      category: "Industrial",
      price: 4500,
      stock: 5,
      description:
        "Ultra-durable transmission system for mining and heavy lifting.",
      image: "",
    },
  ]);

  orders = signal<Order[]>([
    {
      id: "ORD-2341",
      customer: "TechNexus Industries",
      status: "Processing",
      amount: 45200,
      date: "2024-03-28",
      priority: true,
      items: [
        {
          productId: 1,
          name: "Precision Logic Controller",
          qty: 2,
          price: 1240,
        },
        { productId: 2, name: "Thermal Flux Sensor", qty: 12, price: 450 },
      ],
    },
    {
      id: "ORD-2342",
      customer: "Global Logistics Co",
      status: "Pending",
      amount: 12450,
      date: "2024-03-27",
      priority: false,
      items: [
        { productId: 5, name: "Pneumatic Actuator X5", qty: 5, price: 670 },
        { productId: 6, name: "Industrial Grade Coolant", qty: 10, price: 150 },
      ],
    },
    {
      id: "ORD-2343",
      customer: "Quantum Systems",
      status: "Completed",
      amount: 89000,
      date: "2024-03-25",
      priority: true,
      items: [
        { productId: 4, name: "Quantum Circuit Breaker", qty: 1, price: 2100 },
        { productId: 7, name: "Logic Gate Array V2", qty: 3, price: 320 },
      ],
    },
    {
      id: "ORD-2344",
      customer: "Alpha Manufacturing",
      status: "Processing",
      amount: 5600,
      date: "2024-03-29",
      priority: false,
      items: [
        {
          productId: 1,
          name: "Precision Logic Controller",
          qty: 1,
          price: 1240,
        },
        { productId: 3, name: "Reinforced Steel Alloy", qty: 100, price: 89 },
      ],
    },
  ]);

  getOrdersForProduct(productId: number): Order[] {
    return this.orders().filter((order) =>
      order.items.some((item) => item.productId === productId),
    );
  }

  getProductQuantityInOrder(productId: number, orderId: string): number {
    const order = this.orders().find((o) => o.id === orderId);
    if (!order) return 0;
    const item = order.items.find((i) => i.productId === productId);
    return item ? item.qty : 0;
  }
}
