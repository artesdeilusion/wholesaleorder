"use client";
import { useCartStore } from "@/lib/cart-store";
import { useAuth } from "@/app/AuthProvider";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2, X, Package, MapPin, Scale, Zap, Info } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Product } from "@/types";
import Image from "next/image";

export default function CartDrawer() {
  const { user, role } = useAuth();
  const { items, updateQty, removeItem, clear } = useCartStore();
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
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
    }
    fetchProducts();
  }, []);

  function getProduct(productId: string) {
    return products.find((p) => p.id === productId);
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  if (!user || role !== "customer") return null;

  return (
    <>
      <button
        className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg md:hidden"
        onClick={() => setOpen(true)}
      >
        Sepetim ({items.length})
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:hidden" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-zinc-900 w-full rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Sepetim</h2>
              <button onClick={() => setOpen(false)} className="text-2xl">×</button>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sepetiniz Boş</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Henüz sepetinizde ürün bulunmuyor.
                </p>
                <Button 
                  onClick={() => setOpen(false)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Alışverişe Başla
                </Button>
              </div>
            ) : (
              <>
                <ul className="divide-y mb-4">
                  {items.map(item => {
                    const product = getProduct(item.productId);
                    return (
                      <li key={item.productId} className="py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div 
                              className="font-semibold text-sm cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => product && handleProductClick(product)}
                            >
                              {product?.name || item.productId}
                            </div>
                            <div className="text-xs text-muted-foreground">₺{item.snapshotPrice} TL</div>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1))}
                              className="p-1 hover:bg-gray-50"
                            >
                              <Minus size={14} />
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
                              className="w-12 text-center border-0 focus:ring-0 focus:outline-none text-sm font-medium"
                            />
                            <button
                              onClick={() => updateQty(item.productId, item.qty + 1)}
                              className="p-1 hover:bg-gray-50"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-sm font-medium">
                            ₺{(item.qty * item.snapshotPrice).toFixed(2)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={clear} size="sm">Temizle</Button>
                  <Button onClick={() => setOpen(false)} size="sm">Siparişi Tamamla</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={closeProductModal}>
          <div className="bg-white rounded-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold text-gray-900">Ürün Detayları</h2>
                <button onClick={closeProductModal} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {/* Product Image */}
              {selectedProduct.imageUrls?.[0] && (
                <div className="mb-4">
                  <Image 
                    src={selectedProduct.imageUrls[0]} 
                    alt={selectedProduct.name} 
                    width={300} 
                    height={300} 
                    className="w-full h-48 object-cover rounded-lg border" 
                  />
                </div>
              )}
              
              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                  <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
                </div>
                
                <div className="text-xl font-bold text-primary">
                  ₺{selectedProduct.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
                
                <div className="space-y-3">
                  {selectedProduct.ingredients && (
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 text-sm">İçindekiler:</span>
                        <p className="text-xs text-gray-600">{selectedProduct.ingredients}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedProduct.allergenInfo && (
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 text-sm">Alerjen Bilgisi:</span>
                        <p className="text-xs text-gray-600">{selectedProduct.allergenInfo}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedProduct.originCountry && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 text-sm">Menşei:</span>
                        <span className="text-xs text-gray-600 ml-1">{selectedProduct.originCountry}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedProduct.netWeight && (
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 text-sm">Net Ağırlık:</span>
                        <span className="text-xs text-gray-600 ml-1">{selectedProduct.netWeight}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedProduct.energy && (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 text-sm">Enerji:</span>
                        <span className="text-xs text-gray-600 ml-1">{selectedProduct.energy}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedProduct.storageConditions && (
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 text-sm">Saklama Koşulları:</span>
                        <p className="text-xs text-gray-600">{selectedProduct.storageConditions}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedProduct.importingCompany && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 text-sm">İthalatçı:</span>
                        <span className="text-xs text-gray-600 ml-1">{selectedProduct.importingCompany}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedProduct.sku && (
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 text-sm">SKU:</span>
                        <span className="text-xs text-gray-600 ml-1">{selectedProduct.sku}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-900 text-sm">Stok:</span>
                      <span className={`text-xs ml-1 ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} adet` : 'Stokta yok'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedProduct.nutrition && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Besin Değerleri</h4>
                  <p className="text-xs text-gray-600 whitespace-pre-line">{selectedProduct.nutrition}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 