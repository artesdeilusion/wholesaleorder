"use client";
import { useCartStore } from "@/lib/cart-store";
import { useAuth } from "@/app/AuthProvider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import Image from "next/image";
import type { Product } from "@/types";
import { Trash2, Plus, Minus, ShoppingCart, X, Package, MapPin, Scale, Zap, Info } from "lucide-react";

function getSavedInfos() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("clientInfos") || "[]");
  } catch {
    return [];
  }
}

export default function CartPage() {
  const { user, role } = useAuth();
  const { items, updateQty, removeItem, clear } = useCartStore();
  const router = useRouter();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [infos, setInfos] = useState<any[]>([]);
  const [selectedInfoId, setSelectedInfoId] = useState<string>("");
  const [giftPackage, setGiftPackage] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    if (!user || role !== "customer") {
      router.replace("/login?returnTo=/cart");
    }
  }, [user, role, router]);

  useEffect(() => {
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
    fetchProducts();
  }, []);

  // Combine showOrderForm and user into a single useEffect dependency array
  useEffect(() => {
    if (!user || !showOrderForm) return;
    async function fetchInfos(uid: string) {
      const ref = collection(db, "users", uid, "infos");
      const snap = await getDocs(ref);
      setInfos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchInfos(user.uid);
  }, [user, showOrderForm]);

  if (!user || role !== "customer") {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-screen-xl  justify-center mx-auto py-16 px-4">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Henüz sepetinizde ürün bulunmuyor. Lezzetli ürünlerimizi keşfetmek için alışverişe başlayın.
          </p>
          <Button 
          onClick={() => router.push('/')}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Alışverişe Başla
          </Button>
        </div>
      </div>
    );
  }

  function getProduct(productId: string) {
    return products.find((p) => p.id === productId);
  }

  async function handleOrderSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
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
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items,
        address,
        phone,
        note,
        status,
        createdAt,
        updatedAt,
        subtotal,
        currency,
        discountTotal,
        taxRate,
        giftPackage,
      });
      clear();
      setShowOrderForm(false);
      setAddress("");
      setPhone("");
      setNote("");
      setGiftPackage(false);
      toast.success("Order placed!", { description: "Your order has been sent to the admin." });
      router.replace("/orders");
    } catch (err) {
      toast.error("Order failed", { description: "Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const total = items.reduce((sum, item) => sum + item.qty * item.snapshotPrice, 0);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - SEPETIM */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Sepetim</h1>
          </div>
          
          <div className="p-6">
            {items.map(item => {
              const product = getProduct(item.productId);
              return (
                <div key={item.productId} className="flex gap-4 items-start py-4 border-b border-gray-100 last:border-b-0">
                  {product?.imageUrls?.[0] && (
                    <Image 
                      src={product.imageUrls[0]} 
                      alt={product.name} 
                      width={80} 
                      height={80} 
                      className="rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => product && handleProductClick(product)}
                    />
                  )}
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 
                        className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => product && handleProductClick(product)}
                      >
                        {product?.name || item.productId}
                      </h3>
                      <p className="text-sm text-gray-600">{product?.description}</p>
                    </div>
                    
                    {/* Quantity Control */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1))}
                          className="p-2 hover:bg-gray-50"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={product?.stock || 999}
                          value={item.qty}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            const maxQty = product?.stock || 999;
                            updateQty(item.productId, Math.min(Math.max(1, newQty), maxQty));
                          }}
                          onBlur={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            if (newQty < 1) {
                              updateQty(item.productId, 1);
                            }
                          }}
                          className="w-16 text-center border-0 focus:ring-0 focus:outline-none font-medium"
                        />
                        <button
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          className="p-2 hover:bg-gray-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
          
            
          
          </div>
        </div>

        {/* Right Column - SİPARİŞ ÖZETİ */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Sipariş Özeti</h2>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Order Total */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Sipariş Tutarı</span>
              <span className="font-semibold text-lg">₺ {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            
            
            <hr className="border-gray-200" />
            
            {/* Final Total */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Ödenecek Tutar</span>
              <span className="text-xl font-bold text-gray-900">₺ {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            
            {/* Checkout Button */}
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
              onClick={() => router.push('/cart/checkout')}
            >
              Sepeti Onayla
            </Button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeProductModal}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-900">Ürün Detayları</h2>
                <button onClick={closeProductModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div>
                  {selectedProduct.imageUrls?.[0] && (
                    <Image 
                      src={selectedProduct.imageUrls[0]} 
                      alt={selectedProduct.name} 
                      width={300} 
                      height={300} 
                      className="w-full h-64 object-cover rounded-lg border" 
                    />
                  )}
                </div>
                
                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="text-2xl font-bold text-primary">
                    ₺{selectedProduct.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </div>
                  
                  <div className="space-y-3">
                    {selectedProduct.ingredients && (
                      <div className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-900">İçindekiler:</span>
                          <p className="text-sm text-gray-600">{selectedProduct.ingredients}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedProduct.allergenInfo && (
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-900">Alerjen Bilgisi:</span>
                          <p className="text-sm text-gray-600">{selectedProduct.allergenInfo}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedProduct.originCountry && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-900">Menşei:</span>
                          <span className="text-sm text-gray-600 ml-1">{selectedProduct.originCountry}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedProduct.netWeight && (
                      <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-900">Net Ağırlık:</span>
                          <span className="text-sm text-gray-600 ml-1">{selectedProduct.netWeight}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedProduct.energy && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-900">Enerji:</span>
                          <span className="text-sm text-gray-600 ml-1">{selectedProduct.energy}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedProduct.storageConditions && (
                      <div className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-900">Saklama Koşulları:</span>
                          <p className="text-sm text-gray-600">{selectedProduct.storageConditions}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedProduct.importingCompany && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-900">İthalatçı:</span>
                          <span className="text-sm text-gray-600 ml-1">{selectedProduct.importingCompany}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedProduct.sku && (
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-900">SKU:</span>
                          <span className="text-sm text-gray-600 ml-1">{selectedProduct.sku}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-medium text-gray-900">Stok:</span>
                        <span className={`text-sm ml-1 ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedProduct.stock > 0 ? `${selectedProduct.stock} adet` : 'Stokta yok'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedProduct.nutrition && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Besin Değerleri</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{selectedProduct.nutrition}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 