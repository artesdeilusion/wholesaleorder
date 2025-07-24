
"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/AuthProvider";
import { useState, useEffect } from "react";
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
  if (isAdmin) {
    return allProducts;
  } else {
    return allProducts.filter(product => !product.hidden);
  }
}

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { role } = useAuth();

  useEffect(() => {
    getProducts(role === 'admin').then(setProducts);
  }, [role]);

  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  });

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(search);
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <title>Ürün Arama - Preluvia</title>
      <Navbar />
      <section className="w-full bg-black py-16 mb-8 text-center text-white flex flex-col items-center justify-center">
        <div className="container mx-auto flex flex-col items-center justify-center px-4 mb-6">
          <form className="flex w-full max-w-xl gap-3 items-center justify-center" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Ürünlerde ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white bg-white text-black transition mb-0 text-base shadow-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-black rounded-full font-semibold shadow hover:bg-gray-200 transition border border-white"
            >
              Ara
            </button>
          </form>
        </div>
  </section>
      
      <div className="container mx-auto flex-1 px-4 pb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Sonuçlar</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map(product => (
            <Card key={product.id} className={`group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border ${product.hidden ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
              {/* Image Section */}
              <div className="relative aspect-square overflow-hidden">
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
                <Link href={`/product/${product.id}`} className="block group-hover:text-primary transition-colors">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
                    {product.name}
                  </h3>
                </Link>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 inline-block rounded-full">
                  Stok: {product.stock}
                </div>
                <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    {product.price} TRY
                  </div>
                </div>
                <div className="pt-2">
                  <AddToCartButton product={product} />
                </div>
              </div>
            </Card>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-16 w-full">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-center text-gray-500 text-lg font-medium bg-white rounded-xl px-8 py-6 shadow inline-block">
              Aramanıza uygun ürün bulunamadı.
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 