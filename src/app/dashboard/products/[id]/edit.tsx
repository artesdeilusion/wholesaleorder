"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

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
    // If index is in existingImageUrls, remove from there
    if (index < existingImageUrls.length) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove from imageFiles and previews
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
    if (!formData.name) newErrors.name = 'Name is required.';
    if (!formData.sku) newErrors.sku = 'SKU is required.';
    if (!formData.description) newErrors.description = 'Description is required.';
    if (!formData.price) newErrors.price = 'Price is required.';
    if (!formData.stock) newErrors.stock = 'Stock is required.';
    if (!formData.ingredients) newErrors.ingredients = 'Ingredients are required.';
    if (!formData.allergenInfo) newErrors.allergenInfo = 'Allergen info is required.';
    if (!formData.originCountry) newErrors.originCountry = 'Origin country is required.';
    if (!formData.storageConditions) newErrors.storageConditions = 'Storage conditions are required.';
    if (!formData.importingCompany) newErrors.importingCompany = 'Importing company is required.';
    if (!formData.address) newErrors.address = 'Address is required.';
    if (!formData.netWeight) newErrors.netWeight = 'Net weight is required.';
    if (!formData.energy) newErrors.energy = 'Energy is required.';
    if (!formData.nutrition) newErrors.nutrition = 'Nutrition is required.';
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
        updatedAt: new Date().toISOString(),
        imageUrls,
      };
      await updateDoc(doc(db, 'products', id), productData);
      router.push('/dashboard/products');
    } catch (error) {
      alert('Error updating product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto py-8">Loading...</div>;

  return (
    <div className="max-w-screen-lg mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-gray-900">Ürünü Düzenle</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard/products')}>
          Geri Dön
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name..."
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
              placeholder="Unique product code (e.g. 123-ABC)"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.sku ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            <p className="text-xs text-gray-500 mt-1">SKU must be unique.</p>
            {errors.sku && <p className="text-xs text-red-600 mt-1">{errors.sku}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Describe the product..."
            className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.description ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
            required
          />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.price ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter price in Turkish Lira (TRY).</p>
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <input type="text" value="TRY" disabled className="mt-1 block w-full rounded-lg border px-3 py-2 bg-gray-100 border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={e => setFormData({ ...formData, stock: e.target.value })}
              placeholder="How many in stock?"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.stock ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ingredients</label>
            <textarea
              value={formData.ingredients}
              onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
              rows={3}
              placeholder="List main ingredients..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.ingredients ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.ingredients && <p className="text-xs text-red-600 mt-1">{errors.ingredients}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Allergen Info</label>
            <textarea
              value={formData.allergenInfo}
              onChange={e => setFormData({ ...formData, allergenInfo: e.target.value })}
              rows={3}
              placeholder="E.g. contains nuts, dairy..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.allergenInfo ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.allergenInfo && <p className="text-xs text-red-600 mt-1">{errors.allergenInfo}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Origin Country</label>
            <input
              type="text"
              value={formData.originCountry}
              onChange={e => setFormData({ ...formData, originCountry: e.target.value })}
              placeholder="Country of origin..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.originCountry ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.originCountry && <p className="text-xs text-red-600 mt-1">{errors.originCountry}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Storage Conditions</label>
            <textarea
              value={formData.storageConditions}
              onChange={e => setFormData({ ...formData, storageConditions: e.target.value })}
              rows={3}
              placeholder="E.g. keep refrigerated..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.storageConditions ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.storageConditions && <p className="text-xs text-red-600 mt-1">{errors.storageConditions}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Importing Company</label>
            <input
              type="text"
              value={formData.importingCompany}
              onChange={e => setFormData({ ...formData, importingCompany: e.target.value })}
              placeholder="Company name..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.importingCompany ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.importingCompany && <p className="text-xs text-red-600 mt-1">{errors.importingCompany}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              placeholder="Company address..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.address ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Net Weight</label>
            <input
              type="text"
              value={formData.netWeight}
              onChange={e => setFormData({ ...formData, netWeight: e.target.value })}
              placeholder="E.g. 500g, 1kg..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.netWeight ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.netWeight && <p className="text-xs text-red-600 mt-1">{errors.netWeight}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Energy</label>
            <input
              type="text"
              value={formData.energy}
              onChange={e => setFormData({ ...formData, energy: e.target.value })}
              placeholder="E.g. 200kcal/100g..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.energy ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.energy && <p className="text-xs text-red-600 mt-1">{errors.energy}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nutrition</label>
            <textarea
              value={formData.nutrition}
              onChange={e => setFormData({ ...formData, nutrition: e.target.value })}
              rows={3}
              placeholder="Nutrition facts..."
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.nutrition ? 'border-red-500 ring-red-200' : 'border-gray-300'} `}
              required
            />
            {errors.nutrition && <p className="text-xs text-red-600 mt-1">{errors.nutrition}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreviews.length === 0 && (
                <span className="text-xs text-gray-400">No images selected.</span>
              )}
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative h-20 w-20">
                  <img src={src} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-white bg-opacity-90 rounded-full p-1 shadow hover:bg-red-100 focus:bg-red-100 focus:outline-none"
                    aria-label="Remove image"
                    title="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-600 pointer-events-none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            {uploading && <div className="text-xs text-gray-500 mt-1">Uploading images...</div>}
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 