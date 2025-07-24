"use client";
import { useAuth } from "@/app/AuthProvider";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AddToCartButton({ product }: { product: any }) {
  const { user, role } = useAuth();
  const addItem = useCartStore(s => s.addItem);
  const items = useCartStore(s => s.items);
  const [loading, setLoading] = useState(false);

  async function handleAddToCart() {
    setLoading(true);
    addItem({
      productId: product.id,
      qty: 1,
      snapshotPrice: product.price,
      currency: 'TRY',
    });
    toast.success("Sepete Eklendi", { description: product.name });
    // Sync cart to Firestore for logged-in users
    if (user && role === "customer") {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          await setDoc(userDocRef, { cart: items }, { merge: true });
        }
      } catch (e) {
        toast.error("Sepet eşitleme hatası");
      }
    }
    setLoading(false);
  }

  if (!user || role !== "customer") {
    return (
      <Button
        className="w-full"
        variant="outline"
        onClick={() => toast.error("Sepete eklemek için giriş yapınız")}
      >
        Sepete Ekle
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      disabled={loading || product.stock < 1}
      onClick={handleAddToCart}
    >
        {loading ? "Ekleniyor..." : "Sepete Ekle"}
    </Button>
  );
} 