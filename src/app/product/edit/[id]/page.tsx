"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
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
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // Track images from DB
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchProduct() {
      const refDoc = doc(db, 'products', id);
      const snap = await getDoc(refDoc);
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      const data = snap.data();
      const urls = Array.isArray(data.imageUrls) ? data.imageUrls : [];
      setFormData({
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
        stock: data.stock?.toString() || '',
        price: data.price?.toString() || '',
        currency: 'TRY',
        sku: data.sku || '',
        imageUrls: urls.join(','),
        hidden: data.hidden || false,
      });
      setExistingImageUrls(urls);
      setImagePreviews(urls); // Only existing images at first
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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

  // Remove image by index, handling both existing and new
  const handleRemoveImage = (index: number) => {
    if (index < existingImageUrls.length) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImageUrls.length;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!storage || imageFiles.length === 0) return [];
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
    if (!formData.name) newErrors.name = 'İsim gerekli.';
    if (!formData.sku) newErrors.sku = 'Stok kodu gerekli.';
    if (!formData.description) newErrors.description = 'Açıklama gerekli.';
    if (!formData.price) newErrors.price = 'Fiyat gerekli.';
    if (!formData.stock) newErrors.stock = 'Stok gerekli.';
    if (!formData.ingredients) newErrors.ingredients = 'İçindekiler gerekli.';
    if (!formData.allergenInfo) newErrors.allergenInfo = 'Alerjen bilgisi gerekli.';
    if (!formData.originCountry) newErrors.originCountry = 'Menşei ülke gerekli.';
    if (!formData.storageConditions) newErrors.storageConditions = 'Saklama koşulları gerekli.';
    if (!formData.importingCompany) newErrors.importingCompany = 'İthalatçı firma gerekli.';
    if (!formData.address) newErrors.address = 'Adres gerekli.';
    if (!formData.netWeight) newErrors.netWeight = 'Net ağırlık gerekli.';
    if (!formData.energy) newErrors.energy = 'Enerji gerekli.';
    if (!formData.nutrition) newErrors.nutrition = 'Besin değerleri gerekli.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    try {
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await uploadImages();
      }
      // Combine remaining existingImageUrls and new uploadedImageUrls
      const imageUrls = [...existingImageUrls, ...uploadedImageUrls];
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
        updatedAt: new Date().toISOString(),
        imageUrls,
      };
      await updateDoc(doc(db, 'products', id), productData);
      router.push('/dashboard/products');
    } catch (error) {
      alert('Ürün güncellenirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto py-8">Yükleniyor...</div>;

  return (
    <div className="max-w-screen-lg mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-gray-900">Ürünü Düzenle</h1>
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
            Ürünü Müşterilerden Gizle
          </Label>
          {formData.hidden && (
            <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
              Gizli
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">İsim</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: Organik Elma"
              aria-label="Ürün İsmi"
              aria-describedby="name-helper"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            <p id="name-helper" className="mt-1 text-xs text-gray-500">Ürünün ismini giriniz.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stok Kodu (SKU)</label>
            <input
              type="text"
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: ELMA-001"
              aria-label="Ürün Stok Kodu"
              aria-describedby="sku-helper"
            />
            {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
            <p id="sku-helper" className="mt-1 text-xs text-gray-500">Ürün için benzersiz bir stok kodu giriniz.</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Açıklama</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Örn: Taze, organik, yerel elmalar."
            aria-label="Ürün Açıklaması"
            aria-describedby="description-helper"
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          <p id="description-helper" className="mt-1 text-xs text-gray-500">Ürün hakkında detaylı bir açıklama giriniz.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fiyat</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: 15.99"
              aria-label="Ürün Fiyatı"
              aria-describedby="price-helper"
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            <p id="price-helper" className="mt-1 text-xs text-gray-500">Ürünün fiyatını giriniz.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Para Birimi</label>
            <input type="text" value="TRY" disabled className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stok</label>
            <input
              type="number"
              value={formData.stock}
              onChange={e => setFormData({ ...formData, stock: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: 100"
              aria-label="Ürün Stok"
              aria-describedby="stock-helper"
            />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
            <p id="stock-helper" className="mt-1 text-xs text-gray-500">Ürünün mevcut stok miktarını giriniz.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">İçindekiler</label>
            <textarea
              value={formData.ingredients}
              onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: Elma, organik, 100g"
              aria-label="Ürün İçindekiler"
              aria-describedby="ingredients-helper"
            />
            {errors.ingredients && <p className="mt-1 text-xs text-red-600">{errors.ingredients}</p>}
            <p id="ingredients-helper" className="mt-1 text-xs text-gray-500">Ürünün ana içindekilerini listeleyiniz.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Alerjen Bilgisi</label>
            <textarea
              value={formData.allergenInfo}
              onChange={e => setFormData({ ...formData, allergenInfo: e.target.value })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: Fındık içerir, glutensiz"
              aria-label="Ürün Alerjen Bilgisi"
              aria-describedby="allergen-helper"
            />
            {errors.allergenInfo && <p className="mt-1 text-xs text-red-600">{errors.allergenInfo}</p>}
            <p id="allergen-helper" className="mt-1 text-xs text-gray-500">Alerjen veya diyet kısıtlamalarını belirtiniz.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Menşei Ülke</label>
            <input
              type="text"
              value={formData.originCountry}
              onChange={e => setFormData({ ...formData, originCountry: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: Türkiye"
              aria-label="Ürün Menşei Ülke"
              aria-describedby="origin-helper"
            />
            {errors.originCountry && <p className="mt-1 text-xs text-red-600">{errors.originCountry}</p>}
            <p id="origin-helper" className="mt-1 text-xs text-gray-500">Ürünün menşei ülkesini belirtiniz.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Saklama Koşulları</label>
            <textarea
              value={formData.storageConditions}
              onChange={e => setFormData({ ...formData, storageConditions: e.target.value })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: Serin ve kuru yerde, güneş ışığından uzakta saklayınız"
              aria-label="Ürün Saklama Koşulları"
              aria-describedby="storage-helper"
            />
            {errors.storageConditions && <p className="mt-1 text-xs text-red-600">{errors.storageConditions}</p>}
            <p id="storage-helper" className="mt-1 text-xs text-gray-500">Uygun saklama talimatlarını giriniz.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">İthalatçı Firma</label>
            <input
              type="text"
              value={formData.importingCompany}
              onChange={e => setFormData({ ...formData, importingCompany: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: ABC İthalat Ltd."
              aria-label="Ürün İthalatçı Firma"
              aria-describedby="importing-helper"
            />
            {errors.importingCompany && <p className="mt-1 text-xs text-red-600">{errors.importingCompany}</p>}
            <p id="importing-helper" className="mt-1 text-xs text-gray-500">Ürünü ithal eden firmayı giriniz.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adres</label>
            <textarea
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: 123 Ana Cadde, İstanbul, Türkiye"
              aria-label="Ürün Adres"
              aria-describedby="address-helper"
            />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
            <p id="address-helper" className="mt-1 text-xs text-gray-500">Ürünün saklandığı adresi giriniz.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Net Ağırlık</label>
            <input
              type="text"
              value={formData.netWeight}
              onChange={e => setFormData({ ...formData, netWeight: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: 1kg"
              aria-label="Ürün Net Ağırlık"
              aria-describedby="net-weight-helper"
            />
            {errors.netWeight && <p className="mt-1 text-xs text-red-600">{errors.netWeight}</p>}
            <p id="net-weight-helper" className="mt-1 text-xs text-gray-500">Ürünün net ağırlığını giriniz.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Enerji</label>
            <input
              type="text"
              value={formData.energy}
              onChange={e => setFormData({ ...formData, energy: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: 100 kcal"
              aria-label="Ürün Enerji"
              aria-describedby="energy-helper"
            />
            {errors.energy && <p className="mt-1 text-xs text-red-600">{errors.energy}</p>}
            <p id="energy-helper" className="mt-1 text-xs text-gray-500">Ürünün enerji değerini giriniz.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Besin Değerleri</label>
            <textarea
              value={formData.nutrition}
              onChange={e => setFormData({ ...formData, nutrition: e.target.value })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: 10g protein, 5g yağ, 20g karbonhidrat içerir"
              aria-label="Ürün Besin Değerleri"
              aria-describedby="nutrition-helper"
            />
            {errors.nutrition && <p className="mt-1 text-xs text-red-600">{errors.nutrition}</p>}
            <p id="nutrition-helper" className="mt-1 text-xs text-gray-500">Ürünün besin değerlerini giriniz.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ürün Görselleri</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreviews.length === 0 && (
                <span className="text-xs text-gray-400">Görsel seçilmedi.</span>
              )}
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative h-20 w-20">
                  <img src={src} alt="Önizleme" className="h-20 w-20 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-white bg-opacity-90 rounded-full p-1 shadow hover:bg-red-100 focus:bg-red-100 focus:outline-none"
                    aria-label="Görseli kaldır"
                    title="Görseli kaldır"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-600 pointer-events-none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            {uploading && <div className="text-xs text-gray-500 mt-1">Görseller yükleniyor...</div>}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/products')}
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
      </form>
    </div>
  );
} 