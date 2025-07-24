"use client";
import Link from "next/link";
import { useAuth } from "@/app/AuthProvider";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { MoreVertical, Search, ShoppingCart } from "lucide-react";

export default function Navbar() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountBtnRef = useRef<HTMLButtonElement>(null);
  const cartItems = useCartStore ? useCartStore(s => s.items) : [];

  return (
    <header className="sticky top-0 z-50 bg-white w-full mx-auto flex justify-between items-center    shadow-sm    ">
     
     <div className="w-full max-w-screen-xl mx-auto flex justify-between items-center p-4         ">
       <div className="flex justify-between items-center w-full">
       <Link   href="/" className="text-xl font-bold text-primary font-logo">PRELUVIA</Link>
        <div className="flex gap-4 relative">
          {!user ? (
            <>
              <Link href="/login"><Button variant="outline">Giriş Yap</Button></Link>
              <Link href="/signup"><Button>Kayıt Ol</Button></Link>
            </>
          ) : (
            <>
              <Link href="/cart" className="relative">
                <Button variant="outline" size="icon">
                  <ShoppingCart className="h-4 w-4" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">{cartItems.length}</span>
                  )}
                </Button>
              </Link>
              <Link href="/search">
              <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                 
                </Button>
              </Link>
              {role === "customer" ? (
                <div className="relative">
                  <Button ref={accountBtnRef} variant="outline" size="icon" onClick={() => setAccountMenuOpen(v => !v)}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50">
                      <Link href="/orders" className="block px-4 py-2 hover:bg-gray-100">Siparişlerim</Link>
                      <Link href="/account" className="block px-4 py-2 hover:bg-gray-100">Hesap Bilgilerim</Link>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        onClick={async () => { await signOut(auth); router.replace("/"); }}
                      >Çıkış Yap</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/dashboard"><Button variant="outline" size="icon"><MoreVertical className="h-4 w-4" /></Button></Link>
              )}
            </>
          )}
        </div>
       </div>
       </div>
      </header>
  );
} 