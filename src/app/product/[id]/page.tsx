"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import type { Product } from "@/types";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useCartStore } from "@/lib/cart-store";
import { 
  Package, 
  Tag, 
  Database, 
  Info, 
  MapPin, 
  Scale, 
  Zap, 
  Apple, 
  Building, 
  Edit, 
  ShoppingCart,
  User,
  LogOut,
  FileText,
  Globe,
  Thermometer,
  Truck
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const cartItems = useCartStore(s => s.items);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      const docRef = doc(db, "products", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <div className="text-gray-600">Ürün yükleniyor...</div>
      </div>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <div className="text-gray-600 text-lg">Ürün bulunamadı.</div>
        <Link href="/" className="text-black hover:underline mt-2 inline-block">
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">

      <Navbar />
     

      {/* Enhanced Product Content */}
      <div className="container mx-auto flex-1 px-4 pb-8">
        <div className="max-w-screen-xl mx-auto mt-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-black transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>/</li>
              <li className="text-black font-medium">{product.name}</li>
            </ol>
          </nav>

          {/* Main Product Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Product Image */}
              <div className="bg-gray-50 p-8 flex items-center justify-center">
                {product.imageUrls?.[0] ? (
                  <div className="relative w-full max-w-md">
                    <Image 
                      src={product.imageUrls[0]} 
                      alt={product.name} 
                      width={400} 
                      height={400} 
                      className="rounded-lg object-contain w-full h-auto shadow-sm" 
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-md h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                  <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
                </div>

                {/* Price and Stock */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Tag className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-2xl font-bold text-gray-900">{product.price} ₺</span>
                    </div>
                    <div className="flex items-center">
                      <Database className="w-5 h-5 text-gray-600 mr-2" />
                      <span className={`font-medium ${product.stock > 0 ? 'text-gray-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? `${product.stock} adet stokta` : 'Stokta yok'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Add to Cart Button */}
                  {role === 'customer' && (
                    <div className="w-full">
                      <AddToCartButton product={product} />
                    </div>
                  )}
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">SKU</div>
                      <div className="font-medium">{product.sku}</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Scale className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Net Ağırlık</div>
                      <div className="font-medium">{product.netWeight}</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Globe className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Menşei Ülke</div>
                      <div className="font-medium">{product.originCountry}</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Building className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">İthalatçı Firma</div>
                      <div className="font-medium">{product.importingCompany}</div>
                    </div>
                  </div>
                </div>

                {/* Admin Controls */}
                {role === 'admin' && (
                  <div className="border-t pt-6">
                    <Link href={`/product/edit/${product.id}`}>
                      <Button className="w-full bg-black hover:bg-gray-800">
                        <Edit size={16} className="mr-2" />
                        Ürünü Düzenle
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Information */}
            <div className="border-t bg-gray-50">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Info className="w-6 h-6 mr-3 text-blue-600" />
                  Ürün Detayları
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Apple className="w-4 h-4 mr-2 text-green-600" />
                      İçindekiler
                    </h3>
                    <p className="text-gray-600 text-sm">{product.ingredients}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2 text-orange-600" />
                      Alerjen Bilgisi
                    </h3>
                    <p className="text-gray-600 text-sm">{product.allergenInfo}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Thermometer className="w-4 h-4 mr-2 text-blue-600" />
                      Saklama Koşulları
                    </h3>
                    <p className="text-gray-600 text-sm">{product.storageConditions}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                      Enerji
                    </h3>
                    <p className="text-gray-600 text-sm">{product.energy}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Apple className="w-4 h-4 mr-2 text-green-600" />
                      Besin Değerleri
                    </h3>
                    <p className="text-gray-600 text-sm">{product.nutrition}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-red-600" />
                      Adres
                    </h3>
                    <p className="text-gray-600 text-sm">{product.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="w-full bg-white border-t py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="text-gray-600 text-sm font-logo mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Preluvia. Tüm hakları saklıdır.
            </div>
            <div className="flex gap-6">
              <Link href="/login" className="text-gray-500 hover:text-black text-sm transition-colors">Giriş</Link>
              <Link href="/signup" className="text-gray-500 hover:text-black text-sm transition-colors">Kayıt Ol</Link>
            </div>
          </div>
          <div className="border-t pt-6">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-xs text-gray-500">
              <Link href="/kvkk" className="hover:text-black transition-colors">KVKK Aydınlatma Metni</Link>
              <Link href="/privacy" className="hover:text-black transition-colors">Gizlilik Politikası</Link>
              <Link href="/tos" className="hover:text-black transition-colors">Kullanım Şartları</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
} 