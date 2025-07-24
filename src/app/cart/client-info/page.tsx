"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/app/AuthProvider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ClientInfo {
  id: string;
  companyName: string;
  mersisNo: string;
  taxNo: string;
  phone: string;
  email: string;
  name: string;
  address: string;
  invoiceAddress: string;
}

export default function CartClientInfoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [infos, setInfos] = useState<ClientInfo[]>([]);
  const [form, setForm] = useState<Omit<ClientInfo, "id">>({
    companyName: "",
    mersisNo: "",
    taxNo: "",
    phone: "",
    email: "",
    name: "",
    address: "",
    invoiceAddress: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetchInfos(uid: string) {
      const ref = collection(db, "users", uid, "infos");
      const snap = await getDocs(ref);
      setInfos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientInfo)));
    }
    fetchInfos(user.uid);
  }, [user]);

  async function handleAddOrUpdate() {
    if (!user) return;
    if (editingId) {
      await updateDoc(doc(db, "users", user.uid, "infos", editingId), form);
      setInfos(infos.map(info => info.id === editingId ? { id: editingId, ...form } : info));
      setEditingId(null);
    } else {
      const ref = collection(db, "users", user.uid, "infos");
      const docRef = await addDoc(ref, form);
      setInfos([...infos, { id: docRef.id, ...form }]);
    }
    setForm({ companyName: "", mersisNo: "", taxNo: "", phone: "", email: "", name: "", address: "", invoiceAddress: "" });
    router.push("/cart");
  }

  async function handleDelete(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "infos", id));
    setInfos(infos.filter(info => info.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function handleEdit(info: ClientInfo) {
    setForm({ ...info });
    setEditingId(info.id);
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Add or Edit Order Info</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">{editingId ? "Edit Info" : "Add New Info"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <input className="border rounded px-2 py-1" placeholder="Şirket Adı" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} />
          <input className="border rounded px-2 py-1" placeholder="Mersis No" value={form.mersisNo} onChange={e => setForm(f => ({ ...f, mersisNo: e.target.value }))} />
          <input className="border rounded px-2 py-1" placeholder="Vergi No" value={form.taxNo} onChange={e => setForm(f => ({ ...f, taxNo: e.target.value }))} />
          <input className="border rounded px-2 py-1" placeholder="Telefon No" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <input className="border rounded px-2 py-1" placeholder="E-posta" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input className="border rounded px-2 py-1" placeholder="Adı" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="border rounded px-2 py-1" placeholder="Adres" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <input className="border rounded px-2 py-1" placeholder="Fatura Adresi" value={form.invoiceAddress} onChange={e => setForm(f => ({ ...f, invoiceAddress: e.target.value }))} />
        </div>
        <Button className="mr-2" onClick={handleAddOrUpdate}>{editingId ? "Update Info" : "Add Info"}</Button>
        {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm({ companyName: "", mersisNo: "", taxNo: "", phone: "", email: "", name: "", address: "", invoiceAddress: "" }); }}>Cancel</Button>}
      </div>
    </div>
  );
} 