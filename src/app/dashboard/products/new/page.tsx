"use client";
import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: '',
    allergenInfo: '',
    originCountry: '',
    storageConditions: '',
    importingCompany: '',
    address: '',
    netWeight: '',
    energy: '',
    nutrition: '',
    stock: '',
    price: '',
    currency: 'TRY',
    sku: '',
    imageUrls: '',
    hidden: false,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Append new files, avoiding duplicates by name
    setImageFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      const newFiles = files.filter(f => !existingNames.has(f.name));
      return [...prev, ...newFiles];
    });
    setImagePreviews(prev => [
      ...prev,
      ...files.map(file => URL.createObjectURL(file))
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!storage || imageFiles.length === 0) return formData.imageUrls.split(',').map(url => url.trim()).filter(Boolean);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of imageFiles) {
        const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }
      return urls;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = 'Ürün adı zorunludur.';
    if (!formData.sku) newErrors.sku = 'SKU zorunludur.';
    if (!formData.description) newErrors.description = 'Açıklama zorunludur.';
    if (!formData.price) newErrors.price = 'Fiyat zorunludur.';
    if (!formData.stock) newErrors.stock = 'Stok zorunludur.';
    if (!formData.ingredients) newErrors.ingredients = 'İçindekiler zorunludur.';
    if (!formData.allergenInfo) newErrors.allergenInfo = 'Alerjen bilgisi zorunludur.';
    if (!formData.originCountry) newErrors.originCountry = 'Menşei ülke zorunludur.';
    if (!formData.storageConditions) newErrors.storageConditions = 'Saklama koşulları zorunludur.';
    if (!formData.importingCompany) newErrors.importingCompany = 'İthalatçı firma zorunludur.';
    if (!formData.address) newErrors.address = 'Adres zorunludur.';
    if (!formData.netWeight) newErrors.netWeight = 'Net ağırlık zorunludur.';
    if (!formData.energy) newErrors.energy = 'Enerji zorunludur.';
    if (!formData.nutrition) newErrors.nutrition = 'Besin değerleri zorunludur.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    try {
      let imageUrls = formData.imageUrls.split(',').map((url) => url.trim()).filter(Boolean);
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages();
      }
      const productData = {
        name: formData.name,
        description: formData.description,
        ingredients: formData.ingredients,
        allergenInfo: formData.allergenInfo,
        originCountry: formData.originCountry,
        storageConditions: formData.storageConditions,
        importingCompany: formData.importingCompany,
        address: formData.address,
        netWeight: formData.netWeight,
        energy: formData.energy,
        nutrition: formData.nutrition,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        currency: 'TRY',
        sku: formData.sku,
        hidden: formData.hidden,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageUrls,
      };
      await addDoc(collection(db, 'products'), productData);
      router.push('/dashboard/products');
    } catch (error) {
      alert('Ürün kaydedilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto   ">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-gray-900">Ürünü Ekle</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard/products')}>
          Geri Dön
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
        {/* Visibility Toggle */}
        <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
          <Switch
            id="hidden"
            checked={formData.hidden}
            onCheckedChange={(checked) => setFormData({ ...formData, hidden: checked })}
          />
          <Label htmlFor="hidden" className="text-sm font-medium">
            Müşterilerden Gizle
          </Label>
          {formData.hidden && (
            <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
              Gizli
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ürün adını girin..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.name ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Benzersiz ürün kodu (örn. 123-ABC)"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.sku ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            <p className="text-xs text-gray-500 mt-1">SKU benzersiz olmalıdır.</p>
            {errors.sku && <p className="text-xs text-red-600 mt-1">{errors.sku}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Açıklama</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Ürünü açıklayın..."
            className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.description ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
            required
          />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fiyat</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.price ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Fiyatı Türk Lirası (TRY) olarak girin.</p>
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Para Birimi</label>
            <input type="text" value="TRY" disabled className="mt-1 block w-full rounded-lg border px-3 py-2 bg-gray-100 border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stok</label>
            <input
              type="number"
              value={formData.stock}
              onChange={e => setFormData({ ...formData, stock: e.target.value })}
              placeholder="Stok adedi"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.stock ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">İçindekiler</label>
            <textarea
              value={formData.ingredients}
              onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
              rows={3}
              placeholder="Ana içerikleri listeleyin..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.ingredients ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.ingredients && <p className="text-xs text-red-600 mt-1">{errors.ingredients}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Alerjen Bilgisi</label>
            <textarea
              value={formData.allergenInfo}
              onChange={e => setFormData({ ...formData, allergenInfo: e.target.value })}
              rows={3}
              placeholder="Örn. fındık, süt ürünü içerir..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.allergenInfo ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.allergenInfo && <p className="text-xs text-red-600 mt-1">{errors.allergenInfo}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Menşei Ülke</label>
            <input
              type="text"
              value={formData.originCountry}
              onChange={e => setFormData({ ...formData, originCountry: e.target.value })}
              placeholder="Üretim ülkesi..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.originCountry ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.originCountry && <p className="text-xs text-red-600 mt-1">{errors.originCountry}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Saklama Koşulları</label>
            <textarea
              value={formData.storageConditions}
              onChange={e => setFormData({ ...formData, storageConditions: e.target.value })}
              rows={3}
              placeholder="Örn. buzdolabında saklayınız..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.storageConditions ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.storageConditions && <p className="text-xs text-red-600 mt-1">{errors.storageConditions}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">İthalatçı Firma</label>
            <input
              type="text"
              value={formData.importingCompany}
              onChange={e => setFormData({ ...formData, importingCompany: e.target.value })}
              placeholder="Firma adı..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.importingCompany ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.importingCompany && <p className="text-xs text-red-600 mt-1">{errors.importingCompany}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adres</label>
            <textarea
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              placeholder="Firma adresi..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.address ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Net Ağırlık</label>
            <input
              type="text"
              value={formData.netWeight}
              onChange={e => setFormData({ ...formData, netWeight: e.target.value })}
              placeholder="Örn. 500g, 1kg..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.netWeight ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.netWeight && <p className="text-xs text-red-600 mt-1">{errors.netWeight}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Enerji</label>
            <input
              type="text"
              value={formData.energy}
              onChange={e => setFormData({ ...formData, energy: e.target.value })}
              placeholder="Örn. 200kcal/100g..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.energy ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.energy && <p className="text-xs text-red-600 mt-1">{errors.energy}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Besin Değerleri</label>
            <textarea
              value={formData.nutrition}
              onChange={e => setFormData({ ...formData, nutrition: e.target.value })}
              rows={3}
              placeholder="Besin değerleri..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.nutrition ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.nutrition && <p className="text-xs text-red-600 mt-1">{errors.nutrition}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ürün Görselleri</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreviews.length === 0 && (
                <span className="text-xs text-gray-400">Görsel seçilmedi.</span>
              )}
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group h-20 w-20">
                  <img src={src} alt="Önizleme" className="h-20 w-20 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100 transition-opacity opacity-0 group-hover:opacity-100"
                    aria-label="Görseli kaldır"
                    title="Görseli kaldır"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            {uploading && <div className="text-xs text-gray-500 mt-1">Görseller yükleniyor...</div>}
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            disabled={submitting}
          >
            {submitting ? 'Ekleniyor...' : 'Ürünü Ekle'}
          </button>
        </div>
      </form>
    </div>
  );
} 