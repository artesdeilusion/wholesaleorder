"use client";
import React from "react";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, getDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { Order } from "../../../types";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import type { Client } from "@/types";
import { toast } from "sonner";

const ORDER_STATUSES: Order["status"][] = ["NEW", "CONFIRMED", "CANCELLED", "CLOSED"];

const STATUS_LABELS: Record<Order["status"], string> = {
  NEW: "YENİ",
  CONFIRMED: "ONAYLANDI",
  CANCELLED: "İPTAL EDİLDİ",
  CLOSED: "REDDEDİLDİ",
};

function getStatusBadgeClass(status: Order["status"]): string {
  switch (status) {
    case "NEW":
      return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800";
    case "CLOSED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Add a simple form for creating a new order with client selection (for demonstration)
function NewOrderForm({ clients, onOrderCreated }: { clients: Client[], onOrderCreated: () => void }) {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [showInfo, setShowInfo] = useState(false);
  const client = clients.find(c => c.id === selectedClientId);

  return (
    <div className="mb-8 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Yeni Sipariş Oluştur</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Müşteri Seç <span className="text-red-500">*</span></label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={selectedClientId}
          onChange={e => { setSelectedClientId(e.target.value); setShowInfo(true); }}
          required
        >
          <option value="">Bir müşteri seçin...</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.companyName || client.name}</option>
          ))}
        </select>
        {!selectedClientId && <div className="text-red-500 text-sm mt-1">Devam etmek için lütfen bir müşteri seçin.</div>}
      </div>
      {showInfo && client && (
        <div className="mb-4 p-4 bg-gray-50 rounded border">
          <div className="mb-2 font-semibold">Müşteri Bilgileri</div>
          <div><span className="font-semibold">Şirket Adı:</span> {client.companyName}</div>
          <div><span className="font-semibold">Ticaret Sicil No:</span> {client.tradeRegistryNo}</div>
          <div><span className="font-semibold">Mersis No:</span> {client.mersisNo}</div>
          <div><span className="font-semibold">Vergi No:</span> {client.taxNo}</div>
          <div><span className="font-semibold">Telefon No:</span> {client.phone}</div>
          <div><span className="font-semibold">E-posta:</span> {client.email}</div>
          <div><span className="font-semibold">Adı:</span> {client.name}</div>
          <div><span className="font-semibold">Adres:</span> {client.address}</div>
          <div><span className="font-semibold">Fatura Adresi:</span> {client.invoiceAddress}</div>
          {/* Sipariş bilgisi alanları buraya gelecek, sadece müşteri seçildikten sonra görünür */}
          <div className="mt-4">Sipariş bilgisi alanları...</div>
        </div>
      )}
      {/* Daha fazla sipariş alanı ve bir gönder butonu ekleyin */}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [productDetails, setProductDetails] = useState<Record<string, any>>({});
  const [sortField, setSortField] = useState<'createdAt' | 'subtotal'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [clients, setClients] = useState<Client[]>([]);
  const [clientMap, setClientMap] = useState<Record<string, Client>>({});
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null); // NEW: Track which order's action menu is open

  // Fetch all clients on mount
  useEffect(() => {
    async function fetchClients() {
      const snapshot = await getDocs(collection(db, "clients"));
      const clientList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientList);
      const map: Record<string, Client> = {};
      clientList.forEach(c => { map[c.id] = c; });
      setClientMap(map);
    }
    fetchClients();
  }, []);

  const handleSortToggle = (field: 'createdAt' | 'subtotal') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  useEffect(() => {
    let unsub: (() => void) | undefined;
    setLoading(true);
    let prevOrderIds: Set<string> = new Set();
    const q = query(
      collection(db, "orders"),
      orderBy(sortField, sortOrder)
    );
    unsub = onSnapshot(q, async (snapshot) => {
      const fetched: Order[] = [];
      let allProductIds: string[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          clientId: data.clientId,
          status: data.status as Order["status"],
          subtotal: data.subtotal,
          currency: data.currency,
          discountTotal: data.discountTotal,
          taxRate: data.taxRate,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          items: data.items || [],
          receiptUrl: data.receiptUrl,
        });
        if (Array.isArray(data.items)) {
          allProductIds.push(...data.items.map((item: any) => item.productId));
        }
      });
      // Detect new orders
      const currentOrderIds = new Set(fetched.map(o => o.id));
      const newIds = Array.from(currentOrderIds).filter(id => !prevOrderIds.has(id));
      if (prevOrderIds.size > 0 && newIds.length > 0) {
        setNewOrderIds(ids => Array.from(new Set([...ids, ...newIds])));
        for (const id of newIds) {
          toast.success("Yeni sipariş alındı!", { description: `Sipariş ID: ${id}` });
        }
      }
      prevOrderIds = currentOrderIds;
      setOrders(fetched);
      // Fetch product details for all productIds
      const uniqueIds = Array.from(new Set(allProductIds));
      const details: Record<string, any> = {};
      await Promise.all(uniqueIds.map(async (pid) => {
        const ref = doc(db, "products", pid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          details[pid] = { id: snap.id, ...snap.data() };
        }
      }));
      setProductDetails(details);
      setLoading(false);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [sortOrder, sortField]);

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    setUpdatingId(orderId);
    try {
      if (db) {
        // If confirming, update product stocks
        if (newStatus === "CONFIRMED") {
          const order = orders.find((o) => o.id === orderId);
          if (order) {
            await Promise.all(order.items.map(async (item) => {
              const productRef = doc(db, "products", item.productId);
              const productSnap = await getDoc(productRef);
              if (productSnap.exists()) {
                const product = productSnap.data();
                const newStock = (typeof product.stock === 'number' ? product.stock : 0) - item.qty;
                await updateDoc(productRef, { stock: newStock });
              }
            }));
          }
        }
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order
        )
      );
    } catch (err) {
      alert("Durum güncellenemedi");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = statusFilter === "ALL"
    ? orders
    : orders.filter((order) => order.status === statusFilter);

  return (
    <div className="space-y-6 max-w-screen-lg mx-auto py-4 ">
      <h1 className="text-2xl  text-gray-900 mb-4">Tüm Siparişler</h1>
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">Duruma göre filtrele:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="ALL">Tümü</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>{STATUS_LABELS[status]}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSortToggle('subtotal')}>
                  <div className="flex items-center gap-1">
                    Toplam
                    {sortField === 'subtotal' && (sortOrder === 'desc' ? <span>▼</span> : <span>▲</span>)}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSortToggle('createdAt')}>
                  <div className="flex items-center gap-1">
                    Tarih
                    {sortField === 'createdAt' && (sortOrder === 'desc' ? <span>▼</span> : <span>▲</span>)}
                  </div>
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className={newOrderIds.includes(order.id) ? "ring-2 ring-green-400 animate-pulse" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono">
                    <a
                      href={`/dashboard/orders/${order.id}`}
                      className=" hover:underline"
                      onClick={() => setNewOrderIds(ids => ids.filter(i => i !== order.id))}
                    >
                      {order.id}
                    </a>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {clientMap[order.clientId]?.companyName || clientMap[order.clientId]?.name || order.clientId}
                    <div className="text-xs text-gray-500">{clientMap[order.clientId]?.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.status === 'NEW' ? (
                      <div className="relative inline-block">
                        <button
                          className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold border border-yellow-300 hover:bg-yellow-200 transition"
                          onClick={() => setActionMenuOpenId(actionMenuOpenId === order.id ? null : order.id)}
                          disabled={updatingId === order.id}
                        >
                          İşlem
                        </button>
                        {actionMenuOpenId === order.id && (
                          <div className="absolute z-10 left-0 mt-2 w-32 bg-white border rounded shadow-lg">
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-blue-100 text-blue-700"
                              onClick={async () => {
                                await handleStatusChange(order.id, "CONFIRMED");
                                setActionMenuOpenId(null);
                              }}
                              disabled={updatingId === order.id}
                            >
                              Onayla
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-700"
                              onClick={async () => {
                                await handleStatusChange(order.id, "CLOSED");
                                setActionMenuOpenId(null);
                              }}
                              disabled={updatingId === order.id}
                            >
                              Reddet
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={clsx("inline-block px-2 py-1 rounded text-xs font-semibold", getStatusBadgeClass(order.status))}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                    {order.subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      // Firestore Timestamp, Date veya string için işleme
                      const createdAt = order.createdAt;
                      if (createdAt instanceof Date) {
                        return createdAt.toLocaleString("tr-TR");
                      }
                      if (createdAt && typeof createdAt === 'object' && typeof (createdAt as any).toDate === 'function') {
                        try {
                          return (createdAt as any).toDate().toLocaleString("tr-TR");
                        } catch {
                          return String(createdAt);
                        }
                      }
                      return String(createdAt ?? '');
                    })()}
                  </td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 