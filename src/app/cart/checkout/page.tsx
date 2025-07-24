"use client";
import { useCartStore } from "@/lib/cart-store";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, Timestamp, updateDoc, deleteDoc, doc } from "firebase/firestore";
import type { Product, OrderedProduct } from "@/types";
import { useAuth } from "@/app/AuthProvider";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X, ShoppingCart } from "lucide-react";

 


interface ClientInfo {
  id: string;
  companyName: string;
  mersisNo: string;
  taxNo: string;
  phone: string;
  email: string;
  name: string; // Ad Soyad
  address: string;
  // invoiceAddress removed
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, clear } = useCartStore();
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    mersisNo: "",
    taxNo: "",
    phone: "",
    email: "",
    fullName: "", // Ad Soyad
    address: "",
    street: "",
    apartment: "",
    postalCode: "",
    city: "",
    district: "",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [infos, setInfos] = useState<ClientInfo[]>([]);
  const [selectedInfoId, setSelectedInfoId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInfo, setEditingInfo] = useState<ClientInfo | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  const [newInfo, setNewInfo] = useState<Omit<ClientInfo, "id">>({
    companyName: "",
    mersisNo: "",
    taxNo: "",
    phone: "",
    email: "",
    name: "",
    address: "",
  });

  useEffect(() => {
    if (!user) {
      router.replace("/login?returnTo=/cart/checkout");
      return;
    }

    async function fetchProducts() {
      setLoadingProducts(true);
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          ingredients: data.ingredients || '',
          allergenInfo: data.allergenInfo || '',
          originCountry: data.originCountry || '',
          storageConditions: data.storageConditions || '',
          importingCompany: data.importingCompany || '',
          address: data.address || '',
          netWeight: data.netWeight || '',
          energy: data.energy || '',
          nutrition: data.nutrition || '',
          stock: typeof data.stock === 'number' ? data.stock : 0,
          price: typeof data.price === 'number' ? data.price : 0,
          currency: 'TRY',
          sku: data.sku || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
        };
      }));
      setLoadingProducts(false);
    }

    async function fetchInfos(uid: string) {
      const ref = collection(db, "users", uid, "infos");
      const snap = await getDocs(ref);
      setInfos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientInfo)));
    }

    fetchProducts();
    fetchInfos(user.uid);
  }, [user, router]);

  function getProduct(productId: string) {
    return products.find((p) => p.id === productId);
  }

  function handleAddressSelect(infoId: string) {
    setSelectedInfoId(infoId);
    const info = infos.find(i => i.id === infoId);
    if (info) {
      setForm(f => ({
        ...f,
        companyName: info.companyName || "",
        mersisNo: info.mersisNo || "",
        taxNo: info.taxNo || "",
        phone: info.phone || "",
        email: info.email || "",
        fullName: info.name || "",
        address: info.address || "",
      }));
    }
  }

  const total = items.reduce((sum, item) => sum + item.qty * item.snapshotPrice, 0);

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Ödeme sayfasına devam etmek için sepetinizde ürün bulunması gerekiyor.
          </p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ürün Ekle
          </Button>
        </div>
      </div>
    );
  }

  async function handleOrderSubmit() {
    if (!user) return;
    
    // Reset validation errors
    setValidationErrors({});
    
    // Validate required fields
    const errors: {[key: string]: boolean} = {};
    if (!form.fullName) errors.fullName = true;
    if (!form.phone) errors.phone = true;
    if (!form.companyName) errors.companyName = true;
    if (!form.address) errors.address = true;
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Lütfen gerekli alanları doldurun", {
        description: "Kırmızı ile işaretli alanlar zorunludur."
      });
      return;
    }

    setSubmitting(true);
    try {
      // Stock check before order submission
      const insufficientStockItems = items.filter(item => {
        const product = getProduct(item.productId);
        return !product || product.stock < item.qty;
      });
      
      if (insufficientStockItems.length > 0) {
        toast.error("Yetersiz stok!", {
          description: `Aşağıdaki ürün(ler) için yeterli stok yok: ${insufficientStockItems.map(i => getProduct(i.productId)?.name || i.productId).join(", ")}`
        });
        setSubmitting(false);
        return;
      }

      // Calculate subtotal
      const subtotal = items.reduce((sum, item) => sum + item.qty * item.snapshotPrice, 0);
      const currency = 'TRY';
      const discountTotal = 0;
      const taxRate = 0;
      const createdAt = Timestamp.now();
      const updatedAt = Timestamp.now();
      const status = "NEW";

      // Prepare client info fields
      let clientInfo: Partial<ClientInfo> = {};
      if (selectedInfoId) {
        const info = infos.find(i => i.id === selectedInfoId);
        if (info) {
          clientInfo = info;
        }
      } else {
        clientInfo = {
          companyName: form.companyName,
          mersisNo: form.mersisNo,
          taxNo: form.taxNo,
          phone: form.phone,
          email: form.email,
          name: form.fullName.trim(),
          address: form.address,
        };
      }

      // Create order first
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items,
        address: clientInfo.address,
        phone: clientInfo.phone,
        customerName: clientInfo.name,
        companyName: clientInfo.companyName,
        mersisNo: clientInfo.mersisNo,
        taxNo: clientInfo.taxNo,
        email: clientInfo.email,
        status,
        createdAt,
        updatedAt,
        subtotal,
        currency,
        discountTotal,
        taxRate,
        orderedProducts: [], // Will be populated after creating orderedProducts
      });

      // Save ordered products with complete product information
      const orderedProductIds: string[] = [];
      for (const item of items) {
        const product = getProduct(item.productId);
        if (product) {
          const orderedProductData: Omit<OrderedProduct, 'id'> = {
            orderId: orderRef.id,
            productId: product.id,
            name: product.name,
            description: product.description,
            ingredients: product.ingredients,
            allergenInfo: product.allergenInfo,
            originCountry: product.originCountry,
            storageConditions: product.storageConditions,
            importingCompany: product.importingCompany,
            address: product.address,
            netWeight: product.netWeight,
            energy: product.energy,
            nutrition: product.nutrition,
            stock: product.stock,
            price: product.price,
            currency: product.currency,
            sku: product.sku,
            imageUrls: product.imageUrls,
            qty: item.qty,
            unitPrice: item.snapshotPrice,
            lineTotal: item.qty * item.snapshotPrice,
            orderedAt: createdAt.toDate(),
          };

          const orderedProductRef = await addDoc(collection(db, "orderedProducts"), orderedProductData);
          orderedProductIds.push(orderedProductRef.id);
        }
      }

      // Update order with orderedProducts IDs
      await updateDoc(orderRef, {
        orderedProducts: orderedProductIds,
      });

      clear();
      toast.success("Sipariş başarıyla verildi!", { 
        description: "Siparişiniz admin tarafından onaylanacak." 
      });
      router.replace("/orders");
    } catch (err) {
      console.error("Order submission error:", err);
      toast.error("Sipariş verilemedi", { 
        description: "Lütfen tekrar deneyin." 
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddInfo() {
    if (!user) return;
    
    if (!newInfo.companyName || !newInfo.name || !newInfo.address) {
      toast.error("Lütfen gerekli alanları doldurun");
      return;
    }

    try {
      const ref = collection(db, "users", user.uid, "infos");
      const docRef = await addDoc(ref, newInfo);
      const addedInfo = { id: docRef.id, ...newInfo };
      setInfos([...infos, addedInfo]);
      setNewInfo({
        companyName: "",
        mersisNo: "",
        taxNo: "",
        phone: "",
        email: "",
        name: "",
        address: "",
      });
      setShowAddForm(false);
      toast.success("Adres başarıyla eklendi");
    } catch (error) {
      toast.error("Adres eklenirken hata oluştu");
    }
  }

  async function handleUpdateInfo() {
    if (!user || !editingInfo) return;
    
    try {
      await updateDoc(doc(db, "users", user.uid, "infos", editingInfo.id), {
        companyName: editingInfo.companyName,
        mersisNo: editingInfo.mersisNo,
        taxNo: editingInfo.taxNo,
        phone: editingInfo.phone,
        email: editingInfo.email,
        name: editingInfo.name,
        address: editingInfo.address,
      });
      
      setInfos(infos.map(info => info.id === editingInfo.id ? editingInfo : info));
      setEditingInfo(null);
      toast.success("Adres başarıyla güncellendi");
    } catch (error) {
      toast.error("Adres güncellenirken hata oluştu");
    }
  }

  async function handleDeleteInfo(infoId: string) {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "infos", infoId));
      setInfos(infos.filter(info => info.id !== infoId));
      if (selectedInfoId === infoId) {
        setSelectedInfoId("");
        setForm({
          companyName: "",
          mersisNo: "",
          taxNo: "",
          phone: "",
          email: "",
          fullName: "",
          address: "",
          street: "",
          apartment: "",
          postalCode: "",
          city: "",
          district: "",
        });
      }
      toast.success("Adres başarıyla silindi");
    } catch (error) {
      toast.error("Adres silinirken hata oluştu");
    }
  }

  function startEditInfo(info: ClientInfo) {
    setEditingInfo(info);
  }

  function cancelEdit() {
    setEditingInfo(null);
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
   {/* Right: Order Summary */}
   <div className="bg-gray-50 rounded-lg p-8">
        <div className="space-y-6">
          {items.map(item => {
            const product = getProduct(item.productId);
            return (
              <div key={item.productId} className="flex items-center gap-4">
                <span className="font-semibold text-lg">{item.qty}</span>
                {product?.imageUrls?.[0] && (
                  <Image src={product.imageUrls[0]} alt={product.name} width={48} height={48} className="rounded border" />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{product?.name || item.productId}</div>
                  {product?.description && <div className="text-sm text-gray-500">{product.description}</div>}
                </div>
                <div className="font-semibold">₺ {item.snapshotPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
              </div>
            );
          })}
          <hr />
          <div className="flex justify-between text-gray-600">
            <span>Ara Toplam</span>
            <span>₺ {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
           <hr />
          <div className="flex justify-between items-center mt-2">
            <span className="font-bold text-lg">Toplam</span>
            <span className="font-bold text-2xl">₺ {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
{/* Left: Address Form */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Sipariş Bilgileri</h2>
        
        {/* Saved Addresses Management */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Kayıtlı Bilgiler</label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} className="mr-1" />
              Yeni Bilgi 
            </Button>
          </div>
          
          {infos.length > 0 && (
            <select
              className="w-full border rounded px-3 py-2 mb-2"
              value={selectedInfoId}
              onChange={(e) => handleAddressSelect(e.target.value)}
            >
              <option value="">Kayıtlı adres seç...</option>
              {infos.map((info) => (
                <option key={info.id} value={info.id}>
                  {info.companyName} - {info.name}
                </option>
              ))}
            </select>
          )}

          {/* Address List with Edit/Delete */}
          {infos.length > 0 && (
            <div className="space-y-2">
              {infos.map((info) => (
                <div key={info.id} className="border rounded p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{info.companyName}</div>
                      <div className="text-sm text-gray-600">{info.name}</div>
                      <div className="text-sm text-gray-600">{info.address}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditInfo(info)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInfo(info.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Address Form */}
        {showAddForm && (
          <div className="mb-6 p-4 border rounded bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Yeni Adres Ekle</h3>
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                <X size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Şirket Adı"
                value={newInfo.companyName}
                onChange={e => setNewInfo(f => ({ ...f, companyName: e.target.value }))}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Mersis No"
                value={newInfo.mersisNo}
                onChange={e => setNewInfo(f => ({ ...f, mersisNo: e.target.value }))}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Vergi No"
                value={newInfo.taxNo}
                onChange={e => setNewInfo(f => ({ ...f, taxNo: e.target.value }))}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="E-posta"
                value={newInfo.email}
                onChange={e => setNewInfo(f => ({ ...f, email: e.target.value }))}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Ad Soyad"
                value={newInfo.name}
                onChange={e => setNewInfo(f => ({ ...f, name: e.target.value }))}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Telefon"
                value={newInfo.phone}
                onChange={e => setNewInfo(f => ({ ...f, phone: e.target.value }))}
              />
              <input
                className="border rounded px-3 py-2 md:col-span-2"
                placeholder="Adres"
                value={newInfo.address}
                onChange={e => setNewInfo(f => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleAddInfo}>
                <Save size={16} className="mr-1" />
                Kaydet
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                İptal
              </Button>
            </div>
          </div>
        )}

        {/* Edit Address Form */}
        {editingInfo && (
          <div className="mb-6 p-4 border rounded bg-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Adres Düzenle</h3>
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                <X size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Şirket Adı"
                value={editingInfo.companyName}
                onChange={e => setEditingInfo(f => f ? { ...f, companyName: e.target.value } : null)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Mersis No"
                value={editingInfo.mersisNo}
                onChange={e => setEditingInfo(f => f ? { ...f, mersisNo: e.target.value } : null)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Vergi No"
                value={editingInfo.taxNo}
                onChange={e => setEditingInfo(f => f ? { ...f, taxNo: e.target.value } : null)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="E-posta"
                value={editingInfo.email}
                onChange={e => setEditingInfo(f => f ? { ...f, email: e.target.value } : null)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Ad Soyad"
                value={editingInfo.name}
                onChange={e => setEditingInfo(f => f ? { ...f, name: e.target.value } : null)}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Telefon"
                value={editingInfo.phone}
                onChange={e => setEditingInfo(f => f ? { ...f, phone: e.target.value } : null)}
              />
              <input
                className="border rounded px-3 py-2 md:col-span-2"
                placeholder="Adres"
                value={editingInfo.address}
                onChange={e => setEditingInfo(f => f ? { ...f, address: e.target.value } : null)}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleUpdateInfo}>
                <Save size={16} className="mr-1" />
                Güncelle
              </Button>
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                İptal
              </Button>
            </div>
          </div>
        )}

        {/* Main Order Form */}
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className={`border rounded px-3 py-2 ${validationErrors.companyName ? 'border-red-500 bg-red-50' : ''}`}
              placeholder="Şirket Adı"
              value={form.companyName}
              onChange={e => {
                setForm(f => ({ ...f, companyName: e.target.value }));
                if (validationErrors.companyName) {
                  setValidationErrors(prev => ({ ...prev, companyName: false }));
                }
              }}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Mersis No"
              value={form.mersisNo}
              onChange={e => setForm(f => ({ ...f, mersisNo: e.target.value }))}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Vergi No"
              value={form.taxNo}
              onChange={e => setForm(f => ({ ...f, taxNo: e.target.value }))}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="E-posta"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <input
              className={`border rounded px-3 py-2 ${validationErrors.fullName ? 'border-red-500 bg-red-50' : ''}`}
              placeholder="Ad Soyad"
              value={form.fullName}
              onChange={e => {
                setForm(f => ({ ...f, fullName: e.target.value }));
                if (validationErrors.fullName) {
                  setValidationErrors(prev => ({ ...prev, fullName: false }));
                }
              }}
            />
            <input
              className={`border rounded px-3 py-2 md:col-span-2 ${validationErrors.address ? 'border-red-500 bg-red-50' : ''}`}
              placeholder="Adres"
              value={form.address}
              onChange={e => {
                setForm(f => ({ ...f, address: e.target.value }));
                if (validationErrors.address) {
                  setValidationErrors(prev => ({ ...prev, address: false }));
                }
              }}
            />
          </div>
          <div>
            <div className={`flex items-center border rounded px-3 py-2 ${validationErrors.phone ? 'border-red-500 bg-red-50' : ''}`}> 
              <span className="mr-2">🇹🇷 +90</span>
              <input
                className="flex-1 outline-none border-0 bg-transparent"
                placeholder="Telefon"
                value={form.phone.replace(/^\+?90/, "")}
                onChange={e => {
                  // Only allow digits, max 10
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm(f => ({ ...f, phone: val ? `+90${val}` : "" }));
                  if (validationErrors.phone) {
                    setValidationErrors(prev => ({ ...prev, phone: false }));
                  }
                }}
                type="tel"
                maxLength={10}
              />
            </div>
          </div>
          <Button 
            className="w-full bg-black text-white text-lg py-3 mt-4" 
            type="button"
            onClick={handleOrderSubmit}
            disabled={submitting}
          >
            {submitting ? "Sipariş Veriliyor..." : "Sipariş Ver"}
          </Button>
        </form>
      </div>

    
    </div>
  );
} 