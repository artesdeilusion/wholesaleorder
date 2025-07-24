import { Suspense } from "react";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentOrders } from "@/components/RecentOrders";
import Link from "next/link";
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Yönetim Paneli</h1>
        <p className="mt-1 text-sm text-gray-500">
          Hoşgeldiniz
        </p>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div>Loading recent orders...</div>}>
          <RecentOrders />
        </Suspense>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Hızlı Erişimler
            </h3>
            <div className="mt-4 space-y-3">
                <Link
                href="/dashboard/products/new"
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Ürün Ekle
              </Link>
              <Link
                href="/dashboard/orders"
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Tüm Siparişler
              </Link>
              <Link
                href="/dashboard/shop"
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Show my shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 