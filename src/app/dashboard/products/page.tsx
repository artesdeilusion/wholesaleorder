'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
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
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [addingExamples, setAddingExamples] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!db) {
      setProducts([
        {
          id: '1',
          name: 'Organic Almond Butter',
          description: 'Smooth almond butter made from 100% organic almonds.',
          ingredients: 'Organic almonds',
          allergenInfo: 'Contains tree nuts (almonds)',
          originCountry: 'USA',
          storageConditions: 'Store in a cool, dry place',
          importingCompany: 'Healthy Imports LLC',
          address: '123 Wellness Ave, San Francisco, CA',
          netWeight: '250g',
          energy: '250 kcal per 100g',
          nutrition: 'Protein 21g, Fat 55g, Carbs 19g per 100g',
          stock: 120,
          price: 8.99,
          currency: 'TRY',
          sku: 'ALM-001',
          createdAt: new Date('2024-06-01'),
          updatedAt: new Date('2024-06-01'),
          imageUrls: ['https://example.com/almond-butter.jpg'],
          hidden: true,
        },
        {
          id: '2',
          name: 'Italian Extra Virgin Olive Oil',
          description: 'Cold-pressed extra virgin olive oil from Italy.',
          ingredients: 'Extra virgin olive oil',
          allergenInfo: 'None',
          originCountry: 'Italy',
          storageConditions: 'Keep away from sunlight',
          importingCompany: 'Mediterranean Foods Ltd.',
          address: '456 Olive Rd, Rome, Italy',
          netWeight: '500ml',
          energy: '884 kcal per 100ml',
          nutrition: 'Fat 100g per 100ml',
          stock: 80,
          price: 15.5,
          currency: 'TRY',
          sku: 'OLV-002',
          createdAt: new Date('2024-06-02'),
          updatedAt: new Date('2024-06-02'),
          imageUrls: ['https://example.com/olive-oil.jpg'],
          hidden: false,
        },
        {
          id: '3',
          name: 'Belgian Dark Chocolate',
          description: 'Rich dark chocolate with 70% cocoa content.',
          ingredients: 'Cocoa mass, sugar, cocoa butter, soy lecithin',
          allergenInfo: 'Contains soy. May contain traces of milk and nuts.',
          originCountry: 'Belgium',
          storageConditions: 'Store in a cool, dry place',
          importingCompany: 'ChocoDelight NV',
          address: '789 Choco St, Brussels, Belgium',
          netWeight: '100g',
          energy: '540 kcal per 100g',
          nutrition: 'Protein 7g, Fat 42g, Carbs 46g per 100g',
          stock: 200,
          price: 4.25,
          currency: 'TRY',
          sku: 'CHC-003',
          createdAt: new Date('2024-06-03'),
          updatedAt: new Date('2024-06-03'),
          imageUrls: ['https://example.com/dark-chocolate.jpg'],
          hidden: true,
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const fetchedProducts: Product[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        fetchedProducts.push({
          id: doc.id,
          sku: data.sku || '',
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
          stock: typeof data.stock === 'number' ? data.stock : 0,
          price: typeof data.price === 'number' ? data.price : 0,
          currency: data.currency || 'TRY',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
          hidden: data.hidden || false,
        });
      });
      
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  // Upload images to Firebase Storage and return URLs
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
    if (!db) {
      alert('Firebase not available');
      return;
    }
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageUrls,
      };

      await addDoc(collection(db, 'products'), productData);
      setFormData({
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
      setImageFiles([]);
      setImagePreviews([]);
      setShowAddForm(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!db) return;
    
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const handleEdit = (product: Product) => {
    router.push(`/product/edit/${product.id}`);
  };

  const exampleProducts = [
    {
      name: 'Organic Almond Butter',
      description: 'Smooth almond butter made from 100% organic almonds.',
      ingredients: 'Organic almonds',
      allergenInfo: 'Contains tree nuts (almonds)',
      originCountry: 'USA',
      storageConditions: 'Store in a cool, dry place',
      importingCompany: 'Healthy Imports LLC',
      address: '123 Wellness Ave, San Francisco, CA',
      netWeight: '250g',
      energy: '250 kcal per 100g',
      nutrition: 'Protein 21g, Fat 55g, Carbs 19g per 100g',
      stock: 120,
      price: 8.99,
      currency: 'USD',
      sku: 'ALM-001',
      createdAt: new Date('2024-06-01').toISOString(),
      updatedAt: new Date('2024-06-01').toISOString(),
      imageUrls: ['https://example.com/almond-butter.jpg'],
    },
    {
      name: 'Italian Extra Virgin Olive Oil',
      description: 'Cold-pressed extra virgin olive oil from Italy.',
      ingredients: 'Extra virgin olive oil',
      allergenInfo: 'None',
      originCountry: 'Italy',
      storageConditions: 'Keep away from sunlight',
      importingCompany: 'Mediterranean Foods Ltd.',
      address: '456 Olive Rd, Rome, Italy',
      netWeight: '500ml',
      energy: '884 kcal per 100ml',
      nutrition: 'Fat 100g per 100ml',
      stock: 80,
      price: 15.5,
      currency: 'USD',
      sku: 'OLV-002',
      createdAt: new Date('2024-06-02').toISOString(),
      updatedAt: new Date('2024-06-02').toISOString(),
      imageUrls: ['https://example.com/olive-oil.jpg'],
    },
    {
      name: 'Belgian Dark Chocolate',
      description: 'Rich dark chocolate with 70% cocoa content.',
      ingredients: 'Cocoa mass, sugar, cocoa butter, soy lecithin',
      allergenInfo: 'Contains soy. May contain traces of milk and nuts.',
      originCountry: 'Belgium',
      storageConditions: 'Store in a cool, dry place',
      importingCompany: 'ChocoDelight NV',
      address: '789 Choco St, Brussels, Belgium',
      netWeight: '100g',
      energy: '540 kcal per 100g',
      nutrition: 'Protein 7g, Fat 42g, Carbs 46g per 100g',
      stock: 200,
      price: 4.25,
      currency: 'USD',
      sku: 'CHC-003',
      createdAt: new Date('2024-06-03').toISOString(),
      updatedAt: new Date('2024-06-03').toISOString(),
      imageUrls: ['https://example.com/dark-chocolate.jpg'],
    },
  ];

 
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Ürünler</h1>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl   text-gray-900">Ürünler</h1>
        <div className="flex gap-2">
          <a 
                href="/dashboard/products/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ürün Ekle
          </a>
          
        </div>
      </div>

      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className={`bg-white shadow rounded-lg p-6 ${product.hidden ? 'border-2 border-red-200 bg-red-50' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">{product.sku}</span>
                {product.hidden && (
                  <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full font-medium">
                    HIDDEN
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{product.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">
                {product.currency} {product.price.toFixed(2)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                product.stock > 10 ? 'bg-green-100 text-green-800' : 
                product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {product.stock} in stock
              </span>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first product.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 