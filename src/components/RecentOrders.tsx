'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/types';
import { format } from 'date-fns';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!db) {
        // Fallback to mock data if Firebase not available
        setTimeout(() => {
          setOrders([
            {
              id: '1',
              clientId: 'client1',
              status: 'NEW',
              subtotal: 1250.00,
              currency: 'TRY',
              discountTotal: 0,
              taxRate: 0.08,
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
              items: [
                { productId: '1', title: 'Premium Widget', qty: 10, unitPrice: 125.00, lineTotal: 1250.00 }
              ]
            },
            {
              id: '2',
              clientId: 'client2',
              status: 'CONFIRMED',
              subtotal: 850.00,
              currency: 'TRY',
              discountTotal: 50.00,
              taxRate: 0.08,
              createdAt: new Date('2024-01-14'),
              updatedAt: new Date('2024-01-14'),
              items: [
                { productId: '2', title: 'Standard Widget', qty: 5, unitPrice: 170.00, lineTotal: 850.00 }
              ]
            },
            {
              id: '3',
              clientId: 'client3',
              status: 'CANCELLED',
              subtotal: 2100.00,
              currency: 'TRY',
              discountTotal: 0,
              taxRate: 0.08,
              createdAt: new Date('2024-01-13'),
              updatedAt: new Date('2024-01-13'),
              items: [
                { productId: '3', title: 'Deluxe Widget', qty: 7, unitPrice: 300.00, lineTotal: 2100.00 }
              ]
            }
          ]);
          setLoading(false);
        }, 1000);
        return;
      }

      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const snapshot = await getDocs(ordersQuery);
        const fetchedOrders: Order[] = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          fetchedOrders.push({
            id: doc.id,
            clientId: data.clientId,
            status: data.status,
            subtotal: data.subtotal,
            currency: data.currency,
            discountTotal: data.discountTotal,
            taxRate: data.taxRate,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            items: data.items || [],
          });
        });
        
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        // Fallback to mock data
        setOrders([
          {
            id: '1',
            clientId: 'client1',
            status: 'NEW',
            subtotal: 1250.00,
            currency: 'TRY',
            discountTotal: 0,
            taxRate: 0.08,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
            items: [
              { productId: '1', title: 'Premium Widget', qty: 10, unitPrice: 125.00, lineTotal: 1250.00 }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'NEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'NEW':
        return { label: 'Yeni', color: 'bg-yellow-100 text-yellow-800' };
      case 'CONFIRMED':
        return { label: 'Onaylandı', color: 'bg-blue-100 text-blue-800' };
      case 'CANCELLED':
        return { label: 'İptal Edildi', color: 'bg-gray-100 text-gray-800' };
      case 'CLOSED':
        return { label: 'Reddedildi', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Son Siparişler
          </h3>
          <div className="mt-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Son Siparişler
        </h3>
        <div className="mt-4 flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Sipariş #{order.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(order.createdAt, 'dd.MM.yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(order.status).color}`}>
                      {getStatusInfo(order.status).label}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
            <Link
            href="/dashboard/orders"
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Tüm siparişleri gör
          </Link>
        </div>
      </div>
    </div>
  );
} 