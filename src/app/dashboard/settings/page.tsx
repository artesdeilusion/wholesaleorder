'use client';

import { useAuth } from '@/app/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      if (!auth) {
        console.warn('Firebase auth not available');
        return;
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto py-4 ">
      <div className="mb-8">
        <h1 className="text-2xl text-gray-900 flex items-center">
           Ayarlar
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Hesabınızı yönetin
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Hesap Bilgileri</h2>
        </div>
        
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">Email Adresi</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <Link href="/" className="border-t border-gray-200 pt-4">
            <button
              onClick={handleSignOut}
              
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
Çıkış Yap
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 