export interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  allergenInfo: string;
  originCountry: string;
  storageConditions: string;
  importingCompany: string;
  address: string;
  netWeight: string;
  energy: string;
  nutrition: string;
  stock: number;
  price: number;
  currency: 'TRY';
  sku: string;
  createdAt: Date;
  updatedAt: Date;
  imageUrls: string[];
  hidden?: boolean;
}

export interface OrderedProduct {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  description: string;
  ingredients: string;
  allergenInfo: string;
  originCountry: string;
  storageConditions: string;
  importingCompany: string;
  address: string;
  netWeight: string;
  energy: string;
  nutrition: string;
  stock: number;
  price: number;
  currency: 'TRY';
  sku: string;
  imageUrls: string[];
  qty: number;
  unitPrice: number;
  lineTotal: number;
  orderedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkSlug: string;
  isActive: boolean;
  createdAt: Date;
  mersisNo: string;
  companyName: string;
  address: string;
  invoiceAddress: string;
  taxNo: string;
  tradeRegistryNo?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  clientId: string;
  status: 'NEW' | 'CONFIRMED' | 'CANCELLED' | 'CLOSED';
  subtotal: number;
  currency: 'TRY';
  discountTotal: number;
  taxRate: number;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  orderedProducts?: string[]; // Array of orderedProduct IDs
  receiptUrl?: string;
  address?: string;
  phone?: string;
  note?: string;
  userId?: string; // For customer orders
  customerName?: string;
  companyName?: string;
  mersisNo?: string;
  taxNo?: string;
  email?: string;
  invoiceAddress?: string;
}

export interface Receipt {
  id: string;
  pdfPath: string;
  createdAt: Date;
  createdBy: string;
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    grandTotal: number;
  };
}

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'client';
  displayName?: string;
} 