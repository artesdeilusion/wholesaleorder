"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type { Order, OrderedProduct } from "@/types";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import Image from "next/image";
import { Package, Calendar, Clock, Truck, CheckCircle, XCircle, AlertCircle, MapPin, Phone, Mail, Building, FileText, User, Hash } from "lucide-react";

interface EnhancedOrder extends Order {
  companyName?: string;
  mersisNo?: string;
  taxNo?: string;
  email?: string;
  customerName?: string;
  invoiceAddress?: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<EnhancedOrder | null>(null);
  const [orderedProducts, setOrderedProducts] = useState<OrderedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    async function fetchOrderAndOrderedProducts() {
      // Fetch order
      const ref = doc(db, "orders", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setOrder(null);
        setLoading(false);
        return;
      }
      const data = snap.data() as EnhancedOrder;
      setOrder({ ...data, id: snap.id });

      // Fetch ordered products
      if (data.orderedProducts && data.orderedProducts.length > 0) {
        const orderedProductsData: OrderedProduct[] = [];
        for (const orderedProductId of data.orderedProducts) {
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
    fetchOrderAndOrderedProducts();
  }, [id]);

  function getOrderedProduct(productId: string) {
    return orderedProducts.find(p => p.productId === productId);
  }



  function handleCancelClick() {
    setShowCancelDialog(true);
  }

  async function handleCancelOrder() {
    if (!order) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "orders", order.id), { status: "CANCELLED" });
      setOrder({ ...order, status: "CANCELLED" });
      setShowCancelDialog(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto py-12">Loading...</div>;
  if (!order) return <div className="max-w-4xl mx-auto py-12">Order not found.</div>;

  const total = order.subtotal + (order.discountTotal || 0);

  return (
    <div className="max-w-screen-xl justify-center mx-auto py-12 px-4">
      <div className="flex flex-col  gap-4  items-start justify-between mb-6">
      <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/orders")}>Siparişlere Dön</Button>
        </div>
        <h1 className="text-3xl">Sipariş #{order.id}</h1>
      
      </div>

      {/* Order Status and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Sipariş Durumu
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Durum:</span>
              <div className="flex items-center gap-2">
                {order.status === 'NEW' && <AlertCircle className="w-4 h-4 text-blue-600" />}
                {order.status === 'CONFIRMED' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {order.status === 'CANCELLED' && <XCircle className="w-4 h-4 text-red-600" />}
                {order.status === 'CLOSED' && <Truck className="w-4 h-4 text-gray-600" />}
                <span className={`font-semibold ${
                  order.status === 'NEW' ? 'text-blue-600' : 
                  order.status === 'CONFIRMED' ? 'text-green-600' : 
                  order.status === 'CANCELLED' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {order.status === 'NEW' ? 'YENİ' : 
                   order.status === 'CONFIRMED' ? 'ONAYLANDI' : 
                   order.status === 'CANCELLED' ? 'İPTAL EDİLDİ' : 'TAMAMLANDI'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
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
            <div className="flex items-center justify-between">
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

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Fiyat Özeti
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Ara Toplam:</span>
              <span className="font-semibold text-lg">₺ {order.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            
             <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-lg font-bold text-blue-900">Toplam:</span>
              <span className="text-xl font-bold text-blue-900">₺ {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            
          </div>
        </div>

       
      </div>

      {/* Client Information */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Müşteri Bilgileri
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Building className="w-4 h-4 text-gray-500 mt-1" />
            <div className="flex-1">
              <span className="font-semibold text-gray-700 text-sm">Şirket Adı:</span>
              <div className="text-gray-900 font-medium">{order.companyName || '-'}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Hash className="w-4 h-4 text-gray-500 mt-1" />
            <div className="flex-1">
              <span className="font-semibold text-gray-700 text-sm">Mersis No:</span>
              <div className="text-gray-900 font-medium">{order.mersisNo || '-'}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Hash className="w-4 h-4 text-gray-500 mt-1" />
            <div className="flex-1">
              <span className="font-semibold text-gray-700 text-sm">Vergi No:</span>
              <div className="text-gray-900 font-medium">{order.taxNo || '-'}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-4 h-4 text-gray-500 mt-1" />
            <div className="flex-1">
              <span className="font-semibold text-gray-700 text-sm">E-posta:</span>
              <div className="text-gray-900 font-medium">{order.email || '-'}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-4 h-4 text-gray-500 mt-1" />
            <div className="flex-1">
              <span className="font-semibold text-gray-700 text-sm">Ad Soyad:</span>
              <div className="text-gray-900 font-medium">{order.customerName || '-'}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-4 h-4 text-gray-500 mt-1" />
            <div className="flex-1">
              <span className="font-semibold text-gray-700 text-sm">Telefon:</span>
              <div className="text-gray-900 font-medium">{order.phone || '-'}</div>
            </div>
          </div>
          <div className="md:col-span-2 flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-4 h-4 text-gray-500 mt-1" />
            <div className="flex-1">
              <span className="font-semibold text-gray-700 text-sm">Teslimat Adresi:</span>
              <div className="text-gray-900 font-medium">{order.address || '-'}</div>
            </div>
          </div>
          {order.note && (
            <div className="md:col-span-2 flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <span className="font-semibold text-gray-700 text-sm">Not:</span>
                <div className="text-gray-900 font-medium bg-white p-3 rounded mt-1 border">{order.note}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
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
              <div key={product.id} className="border rounded-lg p-4">
                <div className="flex gap-4">
                  {product.imageUrls?.[0] && (
                    <Image 
                      src={product.imageUrls[0]} 
                      alt={product.name} 
                      width={80} 
                      height={80} 
                      className="rounded-lg object-cover border" 
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        {product.description && (
                          <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                        )}
                        {product.sku && (
                          <p className="text-gray-500 text-xs mt-1">SKU: {product.sku}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₺ {product.unitPrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                        <div className="text-sm text-gray-600">Adet: {product.qty}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <div className="text-sm text-gray-600">
                        {product.netWeight && `Ağırlık: ${product.netWeight}`}
                        {product.originCountry && ` • Menşei: ${product.originCountry}`}
                      </div>
                      <div className="font-bold text-lg">
                        ₺ {product.lineTotal?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Button for NEW orders */}
      {order.status === "NEW" && (
        <div className="flex gap-2 mb-4">
          <Button variant="destructive" onClick={handleCancelClick} disabled={submitting}>Siparişi İptal Et</Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
        title="Siparişi İptal Et"
        message="Bu siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="İptal Et"
        cancelText="Vazgeç"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
} 