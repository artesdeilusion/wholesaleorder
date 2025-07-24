"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import type { Product, OrderedProduct } from "@/types";
import { Package, Calendar, Clock, Truck, CheckCircle, XCircle, AlertCircle, MapPin, Phone, Mail, Building, FileText, User, Hash } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import { useRef } from "react";

interface Order {
  id: string;
  userId: string;
  status: string;
  subtotal: number;
  currency: string;
  discountTotal: number;
  taxRate: number;
  createdAt: Date;
  updatedAt: Date;
  items: unknown[];
  orderedProducts?: string[];
  receiptUrl?: string;
  address?: string;
  phone?: string;
  note?: string;
  companyName?: string;
  mersisNo?: string;
  taxNo?: string;
  email?: string;
  customerName?: string;
  invoiceAddress?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  mersisNo?: string;
  address?: string;
  invoiceAddress?: string;
  taxNo?: string;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [orderedProducts, setOrderedProducts] = useState<OrderedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchOrderAndClient() {
      const { id } = await params;
      
      // Fetch order
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        setOrder(null);
        setLoading(false);
        return;
      }
      const orderData = orderSnap.data() as Order;
      setOrder({ ...orderData, id: orderSnap.id });

      // Fetch client info
      if (orderData.userId) {
        const clientRef = doc(db, "users", orderData.userId);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) {
          const clientData = clientSnap.data() as Client;
          setClient({ ...clientData, id: clientSnap.id });
        }
      }

      // Fetch ordered products
      if (orderData.orderedProducts && orderData.orderedProducts.length > 0) {
        const orderedProductsData: OrderedProduct[] = [];
        for (const orderedProductId of orderData.orderedProducts) {
          const orderedProductRef = doc(db, "orderedProducts", orderedProductId);
          const orderedProductSnap = await getDoc(orderedProductRef);
          if (orderedProductSnap.exists()) {
            const orderedProductData = orderedProductSnap.data();
            orderedProductsData.push({
              id: orderedProductSnap.id,
              orderId: orderedProductData.orderId,
              productId: orderedProductData.productId,
              name: orderedProductData.name,
              description: orderedProductData.description,
              ingredients: orderedProductData.ingredients,
              allergenInfo: orderedProductData.allergenInfo,
              originCountry: orderedProductData.originCountry,
              storageConditions: orderedProductData.storageConditions,
              importingCompany: orderedProductData.importingCompany,
              address: orderedProductData.address,
              netWeight: orderedProductData.netWeight,
              energy: orderedProductData.energy,
              nutrition: orderedProductData.nutrition,
              stock: orderedProductData.stock,
              price: orderedProductData.price,
              currency: orderedProductData.currency,
              sku: orderedProductData.sku,
              imageUrls: orderedProductData.imageUrls,
              qty: orderedProductData.qty,
              unitPrice: orderedProductData.unitPrice,
              lineTotal: orderedProductData.lineTotal,
              orderedAt: orderedProductData.orderedAt.toDate(),
            });
          }
        }
        setOrderedProducts(orderedProductsData);
      }
      
      setLoading(false);
    }
    fetchOrderAndClient();
  }, [params]);

  function getOrderedProduct(productId: string) {
    return orderedProducts.find(p => p.productId === productId);
  }

  // Add handler for status change
  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setStatusUpdating(true);
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });
      setOrder({ ...order, status: newStatus, updatedAt: new Date() });
    } catch (err) {
      // Optionally show error
      console.error("Failed to update status", err);
    } finally {
      setStatusUpdating(false);
      setActionMenuOpen(false);
    }
  };

  // Optional: Close menu when clicking outside
  useEffect(() => {
    if (!actionMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [actionMenuOpen]);

  if (loading) {
    return (
      <div className="max-w-screen-lg mx-auto py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-screen-lg mx-auto py-12">
        <div className="text-center">Order not found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto py-6 px-2 sm:px-4">
      <div className="mb-4">
        <a
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg border border-gray-300 font-medium shadow-sm transition"
        >
          ← Tüm Siparişlere Dön
        </a>
      </div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl ">Sipariş #{order.id}</h1>
        {/* Admin status change dropdown */}
        {role === 'admin' && order.status === 'NEW' && (
          <div className="relative inline-block" ref={actionMenuRef}>
            <button
              className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-base font-bold border-2 border-yellow-300 hover:bg-yellow-200 transition shadow-md"
              onClick={() => setActionMenuOpen((open) => !open)}
              disabled={statusUpdating}
            >
              İşlem
            </button>
            {actionMenuOpen && (
              <div className="absolute z-10 left-0 mt-2 w-32 bg-white border rounded shadow-lg">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-blue-100 text-blue-700"
                  onClick={() => handleStatusChange("CONFIRMED")}
                  disabled={statusUpdating}
                >
                  Onayla
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-700"
                  onClick={() => handleStatusChange("CLOSED")}
                  disabled={statusUpdating}
                >
                  Reddet
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        {/* Order Status and Summary */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Sipariş Durumu
            </h2>
            <div className="space-y-4">
              
              {/* Existing status display */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                <span className="text-gray-600 font-medium">Durum:</span>
                <div className="flex items-center gap-2">
                  {order.status === 'NEW' && <AlertCircle className="w-4 h-4 text-blue-600" />}
                  {order.status === 'CONFIRMED' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {order.status === 'CANCELLED' && <XCircle className="w-4 h-4 text-red-600" />}
                  {order.status === 'CLOSED' && <XCircle className="w-4 h-4 text-red-600" />}
                  <span className={`font-semibold ${
                    order.status === 'NEW' ? 'text-blue-600' : 
                    order.status === 'CONFIRMED' ? 'text-green-600' : 
                    order.status === 'CANCELLED' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {order.status === 'NEW' ? 'YENİ' : 
                     order.status === 'CONFIRMED' ? 'ONAYLANDI' : 
                     order.status === 'CANCELLED' ? 'İPTAL EDİLDİ' : 'REDDEDİLDİ'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Oluşturulma:
                </span>
                <span className="font-medium">
                  {order.createdAt instanceof Date ? order.createdAt.toLocaleString('tr-TR') : 
                   (order.createdAt && typeof order.createdAt === 'object' && 'toDate' in order.createdAt ? 
                    (order.createdAt as any).toDate().toLocaleString('tr-TR') : String(order.createdAt))}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Güncellenme:
                </span>
                <span className="font-medium">
                  {order.updatedAt instanceof Date ? order.updatedAt.toLocaleString('tr-TR') : 
                   (order.updatedAt && typeof order.updatedAt === 'object' && 'toDate' in order.updatedAt ? 
                    (order.updatedAt as any).toDate().toLocaleString('tr-TR') : String(order.updatedAt))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Fiyat Özeti
            </h2>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                <span className="text-gray-600 font-medium">Ara Toplam:</span>
                <span className="font-semibold text-lg">₺ {order.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <hr className="my-3 border-gray-200" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-blue-50 rounded-lg border border-blue-200 gap-2">
                <span className="text-lg font-bold text-blue-900">Toplam:</span>
                <span className="text-xl font-bold text-blue-900">₺ {(order.subtotal + (order.discountTotal || 0)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Müşteri Bilgileri
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Building className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <span className="font-semibold text-gray-700 text-sm">Şirket Adı:</span>
                <div className="text-gray-900 font-medium break-words">{order.companyName || client?.companyName || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Hash className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <span className="font-semibold text-gray-700 text-sm">Mersis No:</span>
                <div className="text-gray-900 font-medium break-words">{order.mersisNo || client?.mersisNo || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Hash className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <span className="font-semibold text-gray-700 text-sm">Vergi No:</span>
                <div className="text-gray-900 font-medium break-words">{order.taxNo || client?.taxNo || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <span className="font-semibold text-gray-700 text-sm">E-posta:</span>
                <div className="text-gray-900 font-medium break-words">{order.email || client?.email || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <span className="font-semibold text-gray-700 text-sm">Müşteri Adı:</span>
                <div className="text-gray-900 font-medium break-words">{order.customerName || client?.name || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <span className="font-semibold text-gray-700 text-sm">Telefon:</span>
                <div className="text-gray-900 font-medium break-words">{order.phone || client?.phone || '-'}</div>
              </div>
            </div>
            <div className="md:col-span-2 flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <span className="font-semibold text-gray-700 text-sm">Teslimat Adresi:</span>
                <div className="text-gray-900 font-medium break-words">{order.address || client?.address || '-'}</div>
              </div>
            </div>
            <div className="md:col-span-2 flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <span className="font-semibold text-gray-700 text-sm">Fatura Adresi:</span>
                <div className="text-gray-900 font-medium break-words">{order.invoiceAddress || client?.invoiceAddress || '-'}</div>
              </div>
            </div>
            {order.note && (
              <div className="md:col-span-2 flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <span className="font-semibold text-gray-700 text-sm">Not:</span>
                  <div className="text-gray-900 font-medium bg-white p-3 rounded mt-1 border break-words">{order.note}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Sipariş Ürünleri
          </h2>
          {orderedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün Bulunamadı</h3>
              <p className="text-gray-600 text-sm">
                Bu siparişte ürün bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderedProducts.map((product, idx) => (
                <div key={product.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {product.imageUrls?.[0] && (
                      <div className="flex-shrink-0 flex justify-center items-center">
                        <Image 
                          src={product.imageUrls[0]} 
                          alt={product.name} 
                          width={80} 
                          height={80} 
                          className="rounded-lg object-cover border w-20 h-20" 
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">{product.name}</h3>
                          {product.description && (
                            <p className="text-gray-600 text-xs sm:text-sm mt-1">{product.description}</p>
                          )}
                          {product.sku && (
                            <p className="text-gray-500 text-xs mt-1">SKU: {product.sku}</p>
                          )}
                        </div>
                        <div className="text-right mt-2 sm:mt-0">
                          <div className="font-semibold text-sm sm:text-base">₺ {product.unitPrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Adet: {product.qty}</div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 pt-3 border-t gap-2">
                        <div className="text-xs sm:text-sm text-gray-600">
                          {product.netWeight && `Ağırlık: ${product.netWeight}`}
                          {product.originCountry && ` • Menşei: ${product.originCountry}`}
                          {product.importingCompany && ` • İthalatçı: ${product.importingCompany}`}
                        </div>
                        <div className="font-bold text-base sm:text-lg">
                          ₺ {product.lineTotal?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Receipt Link */}
        {order.receiptUrl && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Fatura</h2>
            <a 
              href={order.receiptUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline font-medium break-all"
            >
              Fatura PDF'ini Görüntüle
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 