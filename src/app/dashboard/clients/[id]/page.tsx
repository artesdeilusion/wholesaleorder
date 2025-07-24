"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

interface Order {
  id: string;
  userId: string;
  status: string;
  subtotal: number;
  createdAt: Date;
  companyName?: string;
  mersisNo?: string;
  taxNo?: string;
  email?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  invoiceAddress?: string;
}

interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  mersisNo?: string;
  taxNo?: string;
  address?: string;
  invoiceAddress?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
  firstOrderDate: Date;
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [orders, setOrders] = useState<Order[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrdersAndAggregateClient() {
      const q = query(collection(db, "orders"), where("userId", "==", id));
      const orderSnap = await getDocs(q);
      const ordersArr = orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersArr);
      if (ordersArr.length === 0) {
        setClient(null);
        setLoading(false);
        return;
      }
      // Aggregate client info from orders
      let name = "Unknown";
      let email = "";
      let phone = "";
      let companyName = "";
      let mersisNo = "";
      let taxNo = "";
      let address = "";
      let invoiceAddress = "";
      let totalOrders = ordersArr.length;
      let totalSpent = 0;
      let lastOrderDate = ordersArr[0].createdAt;
      let firstOrderDate = ordersArr[0].createdAt;
      ordersArr.forEach(order => {
        if (order.customerName && !name) name = order.customerName;
        if (order.email && !email) email = order.email;
        if (order.phone && !phone) phone = order.phone;
        if (order.companyName && !companyName) companyName = order.companyName;
        if (order.mersisNo && !mersisNo) mersisNo = order.mersisNo;
        if (order.taxNo && !taxNo) taxNo = order.taxNo;
        if (order.address && !address) address = order.address;
        if (order.invoiceAddress && !invoiceAddress) invoiceAddress = order.invoiceAddress;
        totalSpent += order.subtotal;
        // Find last and first order dates
        const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
        const lastDate = lastOrderDate instanceof Date ? lastOrderDate : new Date(lastOrderDate);
        const firstDate = firstOrderDate instanceof Date ? firstOrderDate : new Date(firstOrderDate);
        if (orderDate > lastDate) lastOrderDate = order.createdAt;
        if (orderDate < firstDate) firstOrderDate = order.createdAt;
      });
      setClient({
        id,
        userId: id,
        name,
        email,
        phone,
        companyName,
        mersisNo,
        taxNo,
        address,
        invoiceAddress,
        totalOrders,
        totalSpent,
        lastOrderDate,
        firstOrderDate,
      });
      setLoading(false);
    }
    fetchOrdersAndAggregateClient();
  }, [id]);

  function formatDate(date: any) {
    if (!date) return '-';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('tr-TR');
  }

  if (loading) return <div>Loading...</div>;
  if (!client) return <div>No orders for this client.</div>;

  return (
    <div className="max-w-screen-lg mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Müşteri Detayları</h1>
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="mb-2 font-medium text-gray-900 text-lg">{client.name}</div>
        <div className="mb-2 text-sm text-gray-500">ID: {client.userId}</div>
        <div className="mb-2 text-sm"><span className="font-semibold">E-posta:</span> {client.email || '-'}</div>
        <div className="mb-2 text-sm"><span className="font-semibold">Telefon:</span> {client.phone || '-'}</div>
        <div className="mb-2 text-sm"><span className="font-semibold">Şirket:</span> {client.companyName || '-'}</div>
        <div className="mb-2 text-sm text-gray-500">
          {client.mersisNo && `Mersis: ${client.mersisNo}`}
          {client.taxNo && ` • Vergi: ${client.taxNo}`}
        </div>
        <div className="mb-2 text-sm"><span className="font-semibold">Adres:</span> {client.address || '-'}</div>
        <div className="mb-2 text-sm"><span className="font-semibold">Fatura Adresi:</span> {client.invoiceAddress || '-'}</div>
        <div className="mb-2 text-sm"><span className="font-semibold">Toplam Sipariş:</span> {client.totalOrders}</div>
        <div className="mb-2 text-sm"><span className="font-semibold">Toplam Harcama:</span> ₺ {client.totalSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
        <div className="mb-2 text-sm"><span className="font-semibold">İlk Sipariş:</span> {formatDate(client.firstOrderDate)}</div>
        <div className="mb-2 text-sm"><span className="font-semibold">Son Sipariş:</span> {formatDate(client.lastOrderDate)}</div>
      </div>
      <h2 className="text-xl font-bold mb-2">Siparişler</h2>
      <div className="bg-white shadow rounded-lg p-4">
        <ul className="divide-y">
          {orders.map(order => (
            <li key={order.id} className="py-2 flex justify-between items-center">
              <div>
                <span className="font-semibold">Sipariş #{order.id}</span> - {order.status} - {order.subtotal} TRY
              </div>
              <Link href={`/dashboard/orders/${order.id}`} className="text-primary hover:underline">Detaylar</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 