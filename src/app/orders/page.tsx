"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Package, Filter, ArrowUpDown, ArrowUp, ArrowDown, Calendar, DollarSign } from "lucide-react";
import type { Order } from "@/types";

type SortField = 'createdAt' | 'subtotal';
type SortOrder = 'desc' | 'asc';
type StatusFilter = 'ALL' | 'NEW' | 'CONFIRMED' | 'CANCELLED' | 'CLOSED';
 
export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Apply filtering and sorting
  useEffect(() => {
    let filtered = [...orders];
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortField === 'createdAt') {
        aValue = a.createdAt instanceof Date ? a.createdAt : (a.createdAt && typeof a.createdAt === 'object' && 'toDate' in a.createdAt ? (a.createdAt as any).toDate() : new Date(0));
        bValue = b.createdAt instanceof Date ? b.createdAt : (b.createdAt && typeof b.createdAt === 'object' && 'toDate' in b.createdAt ? (b.createdAt as any).toDate() : new Date(0));
      } else {
        aValue = a.subtotal || 0;
        bValue = b.subtotal || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredOrders(filtered);
  }, [orders, sortField, sortOrder, statusFilter]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.uid) return;
      setLoading(true);
      
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, [user?.uid]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'NEW':
        return { label: 'Yeni', color: 'bg-blue-100 text-blue-800' };
      case 'CONFIRMED':
        return { label: 'Onaylandı', color: 'bg-green-100 text-green-800' };
      case 'CANCELLED':
        return { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' };
      case 'CLOSED':
        return { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (date: any) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('tr-TR');
    }
    if (date && typeof date === 'object' && 'toDate' in date) {
      return (date as any).toDate().toLocaleDateString('tr-TR');
    }
    return 'Tarih bilgisi yok';
  };

  const handleCancelClick = (orderId: string) => {
    setCancellingOrderId(orderId);
    setShowCancelDialog(true);
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrderId) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "orders", cancellingOrderId), { status: "CANCELLED" });
      setOrders(prev => prev.map(order => 
        order.id === cancellingOrderId 
          ? { ...order, status: "CANCELLED" as const }
          : order
      ));
      setShowCancelDialog(false);
      setCancellingOrderId(null);
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-screen-xl mx-auto py-12 text-center">
        <div className="text-gray-600">Lütfen giriş yapın.</div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl   mb-2">Siparişlerim</h1>
        <p className="text-gray-600">Tüm siparişlerinizi takip edin ve yönetin</p>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <span className="font-medium text-gray-700">Filtrele:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="border rounded px-3 py-2 bg-white"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="NEW">Yeni</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="CANCELLED">İptal Edildi</option>
              <option value="CLOSED">Tamamlandı</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Sırala:</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortToggle('createdAt')}
              className="flex items-center gap-2"
            >
              <Calendar size={16} />
              Tarih
              {sortField === 'createdAt' && (
                sortOrder === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortToggle('subtotal')}
              className="flex items-center gap-2"
            >
              <DollarSign size={16} />
              Tutar
              {sortField === 'subtotal' && (
                sortOrder === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />
              )}
            </Button>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            {filteredOrders.length} sipariş bulundu
            {statusFilter !== 'ALL' && ` (${statusFilter} durumunda)`}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Yükleniyor...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <div className="text-gray-600 mb-4">
            {statusFilter === 'ALL' 
              ? 'Henüz siparişiniz bulunmuyor.'
              : `${getStatusInfo(statusFilter).label} durumunda sipariş bulunmuyor.`
            }
          </div>
          {statusFilter === 'ALL' && (
            <Link href="/">
              <Button className="bg-black text-white hover:bg-gray-800">
                Alışverişe Başla
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div key={order.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="font-semibold text-lg">#{order.id.slice(-8)}</div>
                      <div className={`text-sm px-3 py-1 rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Tarih:</span> {formatDate(order.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium">Tutar:</span> ₺ {order.subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 })}
                      </div>
                      <div>
                        <span className="font-medium">Ürün Sayısı:</span> {order.items?.length || 0}
                      </div>
                    </div>
                    
                    {/* Order Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm text-gray-500 mb-2">Ürünler:</div>
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {item.title || `Ürün ${index + 1}`} (x{item.qty})
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{order.items.length - 3} daha
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Link href={`/orders/${order.id}`}>
                      <Button className="w-full bg-black text-white hover:bg-gray-800">
                        Detayları Gör
                      </Button>
                    </Link>
                    {order.status === 'NEW' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleCancelClick(order.id)}
                        disabled={submitting}
                      >
                        İptal Et
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setCancellingOrderId(null);
        }}
        onConfirm={handleCancelOrder}
        title="Siparişi İptal Et"
        message="Bu siparişi iptal etmek istediğinize emin misiniz?"
        confirmText="İptal Et"
        cancelText="Vazgeç"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
} 