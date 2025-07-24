

"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useAuth } from "@/app/AuthProvider";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save, X, User } from "lucide-react";

interface ClientInfo {
  id: string;
  companyName: string;
  mersisNo: string;
  taxNo: string;
  phone: string;
  email: string;
  name: string; // Ad Soyad
  address: string;
  tradeRegistryNo?: string;
  // invoiceAddress removed
}

type TabType = 'account' | 'orders';

export default function AccountInfoPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [infos, setInfos] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [editingInfo, setEditingInfo] = useState<ClientInfo | null>(null);
  const [newInfo, setNewInfo] = useState<Omit<ClientInfo, "id">>({
    companyName: "",
    mersisNo: "",
    taxNo: "",
    phone: "",
    email: "",
    name: "",
    address: "",
    tradeRegistryNo: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch infos from Firestore on mount
  useEffect(() => {
    if (!user?.uid) return;
    
    async function fetchInfos() {
      setLoading(true);
      
      try {
        if (!user?.uid) return;
        const uid = user.uid;
        const infosRef = collection(db, "users", uid, "infos");
        const infosSnap = await getDocs(infosRef);
        setInfos(infosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientInfo)));
      } catch (error) {
        console.error("Error fetching infos:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInfos();
  }, [user?.uid]);

  async function handleAddInfo() {
    if (!user?.uid) return;
    
    const errors: Record<string, string> = {};
    if (!newInfo.companyName) errors.companyName = "Şirket adı zorunludur.";
    if (!newInfo.mersisNo) errors.mersisNo = "Mersis No zorunludur.";
    if (!newInfo.taxNo) errors.taxNo = "Vergi No zorunludur.";
    if (!newInfo.phone) errors.phone = "Telefon zorunludur.";
    if (!/^\d{10}$/.test(newInfo.phone.replace(/\D/g, ""))) errors.phone = "Telefon 10 haneli olmalıdır.";
    if (!newInfo.email) errors.email = "E-posta zorunludur.";
    if (!newInfo.name) errors.name = "Ad Soyad zorunludur.";
    if (!newInfo.address) errors.address = "Adres zorunludur.";
    if (!newInfo.tradeRegistryNo) errors.tradeRegistryNo = "Ticaret Sicil No zorunludur.";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const ref = collection(db, "users", user.uid, "infos");
      const docRef = await addDoc(ref, newInfo);
      const addedInfo = { id: docRef.id, ...newInfo };
      setInfos([...infos, addedInfo]);
      setNewInfo({
        companyName: "",
        mersisNo: "",
        taxNo: "",
        phone: "",
        email: "",
        name: "",
        address: "",
        tradeRegistryNo: "",
      });
      setShowAddForm(false);
    } catch (error) {
      alert("Adres eklenirken hata oluştu");
    }
  }

  async function handleUpdateInfo() {
    if (!user?.uid || !editingInfo) return;
    const errors: Record<string, string> = {};
    if (!editingInfo.companyName) errors.companyName = "Şirket adı zorunludur.";
    if (!editingInfo.mersisNo) errors.mersisNo = "Mersis No zorunludur.";
    if (!editingInfo.taxNo) errors.taxNo = "Vergi No zorunludur.";
    if (!editingInfo.phone) errors.phone = "Telefon zorunludur.";
    if (!/^\d{10}$/.test(editingInfo.phone.replace(/\D/g, ""))) errors.phone = "Telefon 10 haneli olmalıdır.";
    if (!editingInfo.email) errors.email = "E-posta zorunludur.";
    if (!editingInfo.name) errors.name = "Ad Soyad zorunludur.";
    if (!editingInfo.address) errors.address = "Adres zorunludur.";
    if (!editingInfo.tradeRegistryNo) errors.tradeRegistryNo = "Ticaret Sicil No zorunludur.";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      await updateDoc(doc(db, "users", user.uid, "infos", editingInfo.id), {
        companyName: editingInfo.companyName,
        mersisNo: editingInfo.mersisNo,
        taxNo: editingInfo.taxNo,
        phone: editingInfo.phone,
        email: editingInfo.email,
        name: editingInfo.name,
        address: editingInfo.address,
        tradeRegistryNo: editingInfo.tradeRegistryNo,
      });
      
      setInfos(infos.map(info => info.id === editingInfo.id ? editingInfo : info));
      setEditingInfo(null);
    } catch (error) {
      alert("Adres güncellenirken hata oluştu");
    }
  }

  async function handleDeleteInfo(infoId: string) {
    if (!user?.uid) return;
    
    if (!confirm("Bu adresi silmek istediğinizden emin misiniz?")) return;
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "infos", infoId));
      setInfos(infos.filter(info => info.id !== infoId));
    } catch (error) {
      alert("Adres silinirken hata oluştu");
    }
  }

  function startEditInfo(info: ClientInfo) {
    setEditingInfo(info);
  }

  function cancelEdit() {
    setEditingInfo(null);
  }

  async function handlePasswordChange() {
    if (!user?.uid || !user.email) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Yeni şifreler eşleşmiyor");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert("Şifre en az 6 karakter olmalıdır");
      return;
    }
    
    try {
      // First re-authenticate the user with their current password
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Then update the password
      await updatePassword(user, passwordData.newPassword);
      
      alert("Şifreniz başarıyla değiştirildi!");
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Password change error:", error);
      if (error.code === 'auth/wrong-password') {
        alert("Mevcut şifre yanlış");
      } else if (error.code === 'auth/weak-password') {
        alert("Şifre çok zayıf");
      } else {
        alert("Şifre değiştirilirken hata oluştu: " + error.message);
      }
    }
  }

  async function handleDeleteAccount() {
    if (!user?.uid) return;
    
    if (!confirm("Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) return;
    
    // Note: This would require additional Firebase Auth setup for account deletion
    alert("Hesap silme özelliği henüz aktif değil. Lütfen admin ile iletişime geçin.");
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="text-gray-600">Lütfen giriş yapın.</div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-semibold mb-8 text-left">Hesabım</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-8">
        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
            activeTab === 'account'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          <User size={20} />
          Hesap Bilgileri
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
            activeTab === 'orders'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          <Plus size={20} />
          Sipariş Bilgileri
        </button>

      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Yükleniyor...</div>
        </div>
      ) : (
        <>
          

          {/* Account Information Tab */}
          {activeTab === 'account' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Hesap Bilgileri</h2>
              </div>
              
              {/* Account Information Form */}
              <div className="max-w-screen-xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Hesap Bilgileri</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">E-posta Adresi</label>
                      <input 
                        type="email" 
                        className="w-full border rounded px-3 py-2 bg-gray-50" 
                        value={user?.email || ''} 
                        disabled 
                      />
                      <p className="text-sm text-gray-500 mt-1">E-posta adresiniz değiştirilemez</p>
                    </div>
                    <div className="pt-4">
                      <Button 
                        onClick={() => setShowPasswordDialog(true)}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Şifre Değiştir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Information Tab */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Sipariş Bilgileri</h2>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Plus size={16} className="mr-2" />
                  Yeni Adres Ekle
                </Button>
              </div>

              {/* Add New Address Form */}
              {showAddForm && (
                <div className="mb-6 p-6 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Yeni Adres Ekle</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Şirket Adı *"
                      value={newInfo.companyName}
                      onChange={e => setNewInfo(f => ({ ...f, companyName: e.target.value }))}
                      required
                    />
                    {formErrors.companyName && <div className="text-red-500 text-xs mt-1">{formErrors.companyName}</div>}
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Ticaret Sicil No *"
                      value={newInfo.tradeRegistryNo}
                      onChange={e => setNewInfo(f => ({ ...f, tradeRegistryNo: e.target.value }))}
                      required
                    />
                    {formErrors.tradeRegistryNo && <div className="text-red-500 text-xs mt-1">{formErrors.tradeRegistryNo}</div>}
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Mersis No *"
                      value={newInfo.mersisNo}
                      onChange={e => setNewInfo(f => ({ ...f, mersisNo: e.target.value }))}
                      required
                    />
                    {formErrors.mersisNo && <div className="text-red-500 text-xs mt-1">{formErrors.mersisNo}</div>}
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Vergi No *"
                      value={newInfo.taxNo}
                      onChange={e => setNewInfo(f => ({ ...f, taxNo: e.target.value }))}
                      required
                    />
                    {formErrors.taxNo && <div className="text-red-500 text-xs mt-1">{formErrors.taxNo}</div>}
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="E-posta *"
                      value={newInfo.email}
                      onChange={e => setNewInfo(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                    {formErrors.email && <div className="text-red-500 text-xs mt-1">{formErrors.email}</div>}
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Ad Soyad *"
                      value={newInfo.name}
                      onChange={e => setNewInfo(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                    {formErrors.name && <div className="text-red-500 text-xs mt-1">{formErrors.name}</div>}
                    <div className="flex items-center border rounded px-3 py-2 bg-white">
                      <span className="mr-2">🇹🇷 +90</span>
                      <input
                        className="flex-1 outline-none"
                        type="tel"
                        placeholder="5XXXXXXXXX *"
                        value={newInfo.phone}
                        maxLength={10}
                        pattern="[0-9]{10}"
                        onChange={e => {
                          // Only allow digits, max 10
                          let val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setNewInfo(f => ({ ...f, phone: val }));
                        }}
                        required
                      />
                    </div>
                    {formErrors.phone && <div className="text-red-500 text-xs mt-1">{formErrors.phone}</div>}
                    <input
                      className="border rounded px-3 py-2 md:col-span-2"
                      placeholder="Adres *"
                      value={newInfo.address}
                      onChange={e => setNewInfo(f => ({ ...f, address: e.target.value }))}
                      required
                    />
                    {formErrors.address && <div className="text-red-500 text-xs mt-1 md:col-span-2">{formErrors.address}</div>}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={handleAddInfo} className="bg-black text-white hover:bg-gray-800">
                      <Save size={16} className="mr-2" />
                      Kaydet
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      İptal
                    </Button>
                  </div>
                </div>
              )}

              {/* Edit Address Form */}
              {editingInfo && (
                <div className="mb-6 p-6 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Adres Düzenle</h3>
                    <Button variant="outline" size="sm" onClick={cancelEdit}>
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Şirket Adı *"
                      value={editingInfo.companyName}
                      onChange={e => setEditingInfo(f => f ? { ...f, companyName: e.target.value } : null)}
                      required
                    />
                    {formErrors.companyName && <div className="text-red-500 text-xs mt-1">{formErrors.companyName}</div>}
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Ticaret Sicil No *"
                      value={editingInfo.tradeRegistryNo}
                      onChange={e => setEditingInfo(f => f ? { ...f, tradeRegistryNo: e.target.value } : null)}
                      required
                    />
                    {formErrors.tradeRegistryNo && <div className="text-red-500 text-xs mt-1">{formErrors.tradeRegistryNo}</div>}
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Mersis No *"
                      value={editingInfo.mersisNo}
                      onChange={e => setEditingInfo(f => f ? { ...f, mersisNo: e.target.value } : null)}
                      required
                    />
                    {formErrors.mersisNo && <div className="text-red-500 text-xs mt-1">{formErrors.mersisNo}</div>}
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Vergi No *"
                      value={editingInfo.taxNo}
                      onChange={e => setEditingInfo(f => f ? { ...f, taxNo: e.target.value } : null)}
                      required
                    />
                    {formErrors.taxNo && <div className="text-red-500 text-xs mt-1">{formErrors.taxNo}</div>}
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="E-posta *"
                      value={editingInfo.email}
                      onChange={e => setEditingInfo(f => f ? { ...f, email: e.target.value } : null)}
                      required
                    />
                    {formErrors.email && <div className="text-red-500 text-xs mt-1">{formErrors.email}</div>}
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Ad Soyad *"
                      value={editingInfo.name}
                      onChange={e => setEditingInfo(f => f ? { ...f, name: e.target.value } : null)}
                      required
                    />
                    {formErrors.name && <div className="text-red-500 text-xs mt-1">{formErrors.name}</div>}
                    <div className="flex items-center border rounded px-3 py-2 bg-white">
                      <span className="mr-2">🇹🇷 +90</span>
                      <input
                        className="flex-1 outline-none"
                        type="tel"
                        placeholder="5XXXXXXXXX *"
                        value={editingInfo.phone}
                        maxLength={10}
                        pattern="[0-9]{10}"
                        onChange={e => {
                          let val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setEditingInfo(f => f ? { ...f, phone: val } : null);
                        }}
                        required
                      />
                    </div>
                    {formErrors.phone && <div className="text-red-500 text-xs mt-1">{formErrors.phone}</div>}
                    <input
                      className="border rounded px-3 py-2 md:col-span-2"
                      placeholder="Adres *"
                      value={editingInfo.address}
                      onChange={e => setEditingInfo(f => f ? { ...f, address: e.target.value } : null)}
                      required
                    />
                    {formErrors.address && <div className="text-red-500 text-xs mt-1 md:col-span-2">{formErrors.address}</div>}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={handleUpdateInfo} className="bg-black text-white hover:bg-gray-800">
                      <Save size={16} className="mr-2" />
                      Güncelle
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      İptal
                    </Button>
                  </div>
                </div>
              )}

              {/* Address List */}
              {infos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <User size={48} className="mx-auto text-gray-400 mb-4" />
                  <div className="text-gray-600 mb-4">Henüz adres bilginiz bulunmuyor.</div>
                  <Button onClick={() => setShowAddForm(true)} className="bg-black text-white hover:bg-gray-800">
                    <Plus size={16} className="mr-2" />
                    İlk Adresinizi Ekleyin
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {infos.map((info) => (
                    <div key={info.id} className="border rounded-lg p-6 bg-white shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-2">{info.companyName}</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div><span className="font-medium">Ad Soyad:</span> {info.name}</div>
                            <div><span className="font-medium">Telefon:</span> {info.phone}</div>
                            <div><span className="font-medium">E-posta:</span> {info.email}</div>
                            <div><span className="font-medium">Ticaret Sicil No:</span> {info.tradeRegistryNo}</div>
                            <div><span className="font-medium">Mersis No:</span> {info.mersisNo}</div>
                            <div><span className="font-medium">Vergi No:</span> {info.taxNo}</div>
                            <div className="md:col-span-2"><span className="font-medium">Adres:</span> {info.address}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditInfo(info)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInfo(info.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

      
        </>
      )}

      {/* Password Change Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowPasswordDialog(false)}
          />
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Şifre Değiştir</h3>
              <button
                onClick={() => setShowPasswordDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mevcut Şifre</label>
                  <input 
                    type="password" 
                    className="w-full border rounded px-3 py-2" 
                    placeholder="Mevcut şifrenizi girin"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Yeni Şifre</label>
                  <input 
                    type="password" 
                    className="w-full border rounded px-3 py-2" 
                    placeholder="Yeni şifrenizi girin"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Yeni Şifre (Tekrar)</label>
                  <input 
                    type="password" 
                    className="w-full border rounded px-3 py-2" 
                    placeholder="Yeni şifrenizi tekrar girin"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                className="min-w-[80px]"
              >
                İptal
              </Button>
              <Button
                onClick={handlePasswordChange}
                className="min-w-[80px] bg-black text-white hover:bg-gray-800"
              >
                Değiştir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 