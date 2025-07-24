"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientsFromOrders() {
      try {
        // Fetch all orders
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        
        // Group orders by userId to create unique clients
        const clientMap = new Map<string, Client>();
        
        orders.forEach(order => {
          if (!order.userId) return;
          
          if (!clientMap.has(order.userId)) {
            // Create new client entry
            clientMap.set(order.userId, {
              id: order.userId,
              userId: order.userId,
              name: order.customerName || 'Unknown',
              email: order.email || '',
              phone: order.phone || '',
              companyName: order.companyName || '',
              mersisNo: order.mersisNo || '',
              taxNo: order.taxNo || '',
              address: order.address || '',
              invoiceAddress: order.invoiceAddress || '',
              totalOrders: 1,
              totalSpent: order.subtotal,
              lastOrderDate: order.createdAt,
              firstOrderDate: order.createdAt,
            });
          } else {
            // Update existing client
            const existingClient = clientMap.get(order.userId)!;
            existingClient.totalOrders += 1;
            existingClient.totalSpent += order.subtotal;
            
            // Update last order date if this order is newer
            if (order.createdAt && existingClient.lastOrderDate) {
              const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
              const lastDate = existingClient.lastOrderDate instanceof Date ? existingClient.lastOrderDate : new Date(existingClient.lastOrderDate);
              
              if (orderDate > lastDate) {
                existingClient.lastOrderDate = order.createdAt;
              }
            }
            
            // Update first order date if this order is older
            if (order.createdAt && existingClient.firstOrderDate) {
              const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
              const firstDate = existingClient.firstOrderDate instanceof Date ? existingClient.firstOrderDate : new Date(existingClient.firstOrderDate);
              
              if (orderDate < firstDate) {
                existingClient.firstOrderDate = order.createdAt;
              }
            }
            
            // Update client info if we have more complete data
            if (order.customerName && !existingClient.name) existingClient.name = order.customerName;
            if (order.email && !existingClient.email) existingClient.email = order.email;
            if (order.phone && !existingClient.phone) existingClient.phone = order.phone;
            if (order.companyName && !existingClient.companyName) existingClient.companyName = order.companyName;
            if (order.mersisNo && !existingClient.mersisNo) existingClient.mersisNo = order.mersisNo;
            if (order.taxNo && !existingClient.taxNo) existingClient.taxNo = order.taxNo;
            if (order.address && !existingClient.address) existingClient.address = order.address;
            if (order.invoiceAddress && !existingClient.invoiceAddress) existingClient.invoiceAddress = order.invoiceAddress;
          }
        });
        
        // Convert map to array and sort by last order date (most recent first)
        const clientsArray = Array.from(clientMap.values()).sort((a, b) => {
          const aDate = a.lastOrderDate instanceof Date ? a.lastOrderDate : new Date(a.lastOrderDate);
          const bDate = b.lastOrderDate instanceof Date ? b.lastOrderDate : new Date(b.lastOrderDate);
          return bDate.getTime() - aDate.getTime();
        });
        
        setClients(clientsArray);
      } catch (error) {
        console.error("Error fetching clients from orders:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchClientsFromOrders();
  }, []);

  function formatDate(date: any) {
    if (!date) return '-';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('tr-TR');
  }

  if (loading) return <div className="max-w-screen-xl mx-auto py-8 px-4">Loading...</div>;

  return (
    <div className="max-w-screen-lg mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl  ">Müşteriler</h1>
        <div className="text-sm text-gray-600">
          Toplam {clients.length} müşteri
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri Bilgileri</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Şirket Bilgileri</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş Özeti</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Sipariş</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">ID: {client.userId}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="text-gray-900">{client.email}</div>
                    <div className="text-gray-500">{client.phone || '-'}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="text-gray-900">{client.companyName || '-'}</div>
                    <div className="text-gray-500">
                      {client.mersisNo && `Mersis: ${client.mersisNo}`}
                      {client.taxNo && ` • Vergi: ${client.taxNo}`}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="text-gray-900">{client.totalOrders} sipariş</div>
                    <div className="text-gray-500 font-medium">
                      ₺ {client.totalSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {formatDate(client.lastOrderDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    href={`/dashboard/clients/${client.userId}`} 
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Detaylar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {clients.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500">Henüz müşteri bulunmuyor.</div>
        </div>
      )}
    </div>
  );
} 