'use client';

import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalClients: number;
  totalRevenue: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalClients: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!db) {
        // Fallback to mock data if Firebase not available
        setStats({
          totalProducts: 24,
          totalOrders: 156,
          totalClients: 12,
          totalRevenue: 45600,
        });
        setLoading(false);
        return;
      }

      try {
        // Fetch products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const totalProducts = productsSnapshot.size;

        // Fetch orders
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        let totalOrders = 0;
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === 'CONFIRMED') {
            totalOrders += 1;
            totalRevenue += data.subtotal || 0;
          }
        });

        // Fetch clients
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        const totalClients = clientsSnapshot.size;

        setStats({
          totalProducts,
          totalOrders,
          totalClients: 0, // Not used anymore
          totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to mock data
        setStats({
          totalProducts: 24,
          totalOrders: 156,
          totalClients: 12,
          totalRevenue: 45600,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-5 w-full">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      name: 'Toplam Ürün',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Onaylı Sipariş',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Toplam Gelir',
      value: `${stats.totalRevenue.toLocaleString()} TRY`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => (
        <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 