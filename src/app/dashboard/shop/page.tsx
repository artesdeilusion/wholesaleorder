"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Package } from "lucide-react";
import { Product } from "@/types";
import { useRouter, usePathname } from "next/navigation";

export default function ShopPreviewPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pathname.startsWith("/dashboard")) {
      router.replace("/dashboard");
      return;
    }
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const fetchedProducts: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedProducts.push({
            id: doc.id,
            sku: data.sku || '',
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
            currency: data.currency || 'USD',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
            imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
          });
        });
        setProducts(fetchedProducts);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [pathname, router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Shop Preview</h1>
      <p className="text-gray-700 mb-8">This is a preview of your store as clients will see it. Ordering is disabled in this view.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white shadow rounded-lg p-6">
            {product.imageUrls?.[0] && (
              <img src={product.imageUrls[0]} alt={product.name} className="h-40 w-full object-cover rounded mb-4" />
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                {product.currency} {product.price.toFixed(2)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                product.stock > 10 ? 'bg-green-100 text-green-800' : 
                product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {product.stock} in stock
              </span>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
          <p className="mt-1 text-sm text-gray-500">No products are available for preview.</p>
        </div>
      )}
    </div>
  );
} 