"use client";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import AddToCartButton from "@/components/AddToCartButton";
import CartDrawer from "@/components/CartDrawer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingCart, MoreVertical } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  allergenInfo: string;
  originCountry: string;
  storageConditions: string;
  importingCompany: string;
  address: string;
  netWeight: string;
  energy: string;
  nutrition: string;
  stock: number;
  price: number;
  currency: 'TRY';
  sku: string;
  createdAt: Date;
  updatedAt: Date;
  imageUrls: string[];
  hidden?: boolean;
}
 
async function getProducts(isAdmin: boolean = false): Promise<Product[]> {
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  
  // If admin, show all products. If customer, filter out hidden products
  if (isAdmin) {
    return allProducts;
  } else {
    return allProducts.filter(product => !product.hidden);
  }
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const { user, role } = useAuth();
  const router = useRouter();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountBtnRef = useRef<HTMLButtonElement>(null);
  const cartItems = useCartStore(s => s.items);
  const [sortOrder, setSortOrder] = useState<string>("newest");

  // Fetch products on mount
  useEffect(() => {
    getProducts(role === 'admin').then(setProducts);
  }, [role]);

  // Toggle product visibility
  const toggleProductVisibility = async (productId: string, currentHidden: boolean) => {
    try {
      await updateDoc(doc(db, "products", productId), {
        hidden: !currentHidden
      });
      // Update local state
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, hidden: !currentHidden }
          : product
      ));
    } catch (error) {
      console.error("Error toggling product visibility:", error);
    }
  };

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === "price-asc") {
      return a.price - b.price;
    } else if (sortOrder === "price-desc") {
      return b.price - a.price;
    } else if (sortOrder === "name-asc") {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === "name-desc") {
      return b.name.localeCompare(a.name);
    } else {
      // Default: newest first (by createdAt desc)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* Hero Section */}
      <section className="w-full px-4 bg-black  py-16 mb-8 text-center text-white">
        <h1 className="text-4xl font-extrabold mb-2 font-logo">PRELUVIA</h1>
        <p className="text-lg mb-4">En iyi ürünleri en iyi fiyatlarla alın.</p>
      </section>

      {/* Product Catalog */}
      <div className="container mx-auto flex-1 px-4 pb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Ürünler</h2>
        {/* Sort Controls */}
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="sortOrder" className="text-sm font-medium text-gray-700">Sırala:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="newest">En Yeni</option>
            <option value="price-asc">Fiyat: Artan</option>
            <option value="price-desc">Fiyat: Azalan</option>
            <option value="name-asc">İsim: A-Z</option>
            <option value="name-desc">İsim: Z-A</option>
          </select>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sortedProducts.map(product => (
            <Card key={product.id} className={`group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border ${product.hidden ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
              {/* Admin Controls */}
              {role === 'admin' && (
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    size="sm"
                    variant={product.hidden ? "destructive" : "secondary"}
                    onClick={() => toggleProductVisibility(product.id, product.hidden || false)}
                    className="text-xs px-2 py-1 h-6"
                  >
                    {product.hidden ? 'Show' : 'Hide'}
                  </Button>
                </div>
              )}
              
              {/* Hidden Product Overlay */}
              {product.hidden && (
                <div className="absolute inset-0 bg-red-100 bg-opacity-50 flex items-center justify-center z-5">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    HIDDEN
                  </div>
                </div>
              )}
              
              {/* Image Section */}
              <div className="relative aspect-square   overflow-hidden">
                {product.imageUrls?.[0] ? (
                  <Link href={`/product/${product.id}`}>
                    <Image
                      src={product.imageUrls[0]}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Content Section */}
              <div className="px-4 space-y-3">
                {/* Product Name */}
                <Link href={`/product/${product.id}`} className="block group-hover:text-primary transition-colors">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
                    {product.name}
                  </h3>
                </Link>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 inline-block rounded-full">
                    Stok: {product.stock}
                  </div>
                {/* Description */}
                <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                  {product.description}
                </p>
                
                {/* Price and Stock Row */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    {product.price} TRY
                  </div>
                 
                </div>
                


                {/* Add to Cart Button */}
                <div className="pt-2">
                  <AddToCartButton product={product} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="text-gray-600 text-sm font-logo mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Preluvia. Tüm hakları saklıdır.
            </div>
            <div className="flex gap-6">
               <Link href="/login" className="text-gray-500 hover:text-black text-sm transition-colors">Giriş Yap</Link>
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
