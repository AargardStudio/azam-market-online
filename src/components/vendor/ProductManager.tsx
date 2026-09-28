import React, { useState, useRef } from 'react';
import { Plus, Edit3, Trash2, ShoppingBag, CheckCircle2, Image as ImageIcon, AlertCircle, Upload, X, Camera, Link, Sparkles, RefreshCw } from 'lucide-react';
import { Product, Vendor } from '../../types';
import { FABRIC_TYPES } from '../../lib/fabricTypes';
import { useLanguage } from '../../lib/i18n';

interface ProductManagerProps {
  vendor: Vendor;
  onAddProduct: (productData: Partial<Product>) => void;
  onUpdateProduct: (productId: string, productData: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
}

const FABRIC_IMAGE_PRESETS = [
  { label: 'Pure Raw Silk', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Crinkle Chiffon', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80' },
  { label: 'Printed Summer Lawn', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80' },
  { label: 'Embroidered Net & Organza', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cotton & Khaddar Weave', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80' },
  { label: 'Banarasi Jamawar', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80' },
];

export const ProductManager: React.FC<ProductManagerProps> = ({
  vendor,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { lang } = useLanguage();
  const [name, setName] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [showCustomFabric, setShowCustomFabric] = useState(false);
  const [priceRange, setPriceRange] = useState('');
  const [moq, setMoq] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Image Upload State
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setImageUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const isKnownFabric = (val: string) =>
    FABRIC_TYPES.some((f) => f.name.toLowerCase() === val.toLowerCase());

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setFabricType('Lawn');
    setShowCustomFabric(false);
    setPriceRange('₨800–1,200/m');
    setMoq('50 metres');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80');
    setUploadedFileName('');
    setImageInputMode('upload');
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setFabricType(p.fabric_type);
    setShowCustomFabric(!isKnownFabric(p.fabric_type));
    setPriceRange(p.price_range);
    setMoq(p.moq);
    setDescription(p.description);
    setImageUrl(p.image_url);
    setUploadedFileName(p.image_url.startsWith('data:') ? 'Custom Fabric Upload' : '');
    setImageInputMode(p.image_url.startsWith('data:') ? 'upload' : 'url');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct(editingProduct.id, {
        name,
        fabric_type: fabricType,
        price_range: priceRange,
        moq,
        description,
        image_url: imageUrl,
      });
    } else {
      onAddProduct({
        name,
        fabric_type: fabricType,
        price_range: priceRange,
        moq,
        description,
        image_url: imageUrl,
      });
    }
    setShowModal(false);
  };

  const products = vendor.products || [];
  const maxProducts = vendor.tier?.max_products ?? 10;
  const isAtLimit = maxProducts !== -1 && products.length >= maxProducts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900">
            Wholesale Products Catalog ({products.length})
          </h2>
          <p className="text-xs text-gray-500">
            Manage your fabric rolls, unstitched suit sets, and swatch offerings.
          </p>
        </div>

        <button
          onClick={openAddModal}
          disabled={isAtLimit}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
            isAtLimit
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white shadow-md'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {isAtLimit && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>You have reached your <strong>{maxProducts} products limit</strong> under the <strong>{vendor.tier?.display_name} Tier</strong>. Upgrade to Premium for unlimited product listings.</span>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div className="h-44 bg-gray-100 relative">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {p.fabric_type}
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{p.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{p.description}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">PRICE RANGE</span>
                    <strong className="text-[#0F5C3A]">{p.price_range}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-semibold">MIN ORDER</span>
                    <strong className="text-gray-800">{p.moq}</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-gray-500 space-y-3">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-900">No Products Uploaded</h3>
          <p className="text-xs max-w-md mx-auto">
            Click "Add New Product" to list your wholesale fabric rolls and unstitched suits for buyers.
          </p>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add Wholesale Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pure Rawsilk 80-Gram Dyed"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Fabric / Clothing Type</label>
                  <select
                    required
                    value={showCustomFabric ? '__other__' : fabricType}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__other__') {
                        setShowCustomFabric(true);
                        setFabricType('');
                      } else {
                        setShowCustomFabric(false);
                        setFabricType(val);
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="" disabled>Select a type</option>
                    {FABRIC_TYPES.map((f) => (
                      <option key={f.slug} value={f.name}>
                        {lang === 'ur' ? f.name_ur : f.name}
                      </option>
                    ))}
                    <option value="__other__">Other (type your own)</option>
                  </select>
                  {showCustomFabric && (
                    <input
                      type="text"
                      required
                      value={fabricType}
                      onChange={(e) => setFabricType(e.target.value)}
                      placeholder="e.g. Pure Silk, 80x80 Lawn"
                      className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  )}
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price Range</label>
                  <input
                    type="text"
                    required
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="e.g. ₨1,200–1,500/m"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Minimum Order Quantity (MOQ)</label>
                <input
                  type="text"
                  required
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  placeholder="e.g. 50 metres, 20 suits, 10 rolls"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Dedicated Image Upload & Swatch Selector */}
              <div className="space-y-2 border-t border-b border-gray-100 py-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
                    <Camera className="w-3.5 h-3.5 text-[#0F5C3A]" />
                    <span>Product & Fabric Image</span>
                  </label>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        imageInputMode === 'upload'
                          ? 'bg-white text-gray-900 shadow-2xs font-bold'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Upload className="w-3 h-3 text-[#0F5C3A]" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('presets')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        imageInputMode === 'presets'
                          ? 'bg-white text-gray-900 shadow-2xs font-bold'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-[#C9952A]" />
                      <span>Fabric Presets</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        imageInputMode === 'url'
                          ? 'bg-white text-gray-900 shadow-2xs font-bold'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Link className="w-3 h-3 text-blue-600" />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {/* 1. File Upload Dropzone Mode */}
                {imageInputMode === 'upload' && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? 'border-[#0F5C3A] bg-emerald-50/70'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100/70 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#0F5C3A] flex items-center justify-center shadow-2xs">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-gray-800 text-xs">
                          Click to browse or drag & drop product photo
                        </div>
                        <p className="text-[11px] text-gray-500">
                          PNG, JPG, WEBP fabric swatch rolls (Max 10MB)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Fabric Presets Mode */}
                {imageInputMode === 'presets' && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-gray-500">
                      Choose from authentic high-resolution Pakistani textile samples:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {FABRIC_IMAGE_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setImageUrl(preset.url);
                            setUploadedFileName(preset.label);
                          }}
                          className={`group relative rounded-xl overflow-hidden border p-1.5 text-left transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            imageUrl === preset.url
                              ? 'border-[#0F5C3A] ring-2 ring-[#0F5C3A]/20 bg-emerald-50/50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-12 object-cover rounded-lg"
                          />
                          <span className="text-[10px] font-bold text-gray-700 truncate w-full text-center">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Direct Image URL Mode */}
                {imageInputMode === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setUploadedFileName('');
                      }}
                      placeholder="Paste fabric image URL (https://...)"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                )}

                {/* Current Image Preview & Verification Bar */}
                {imageUrl && (
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0 relative">
                      <img
                        src={imageUrl}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Image Attached</span>
                      </div>
                      <p className="text-[11px] text-gray-600 truncate mt-0.5">
                        {uploadedFileName || (imageUrl.startsWith('data:') ? 'Custom Uploaded Photo' : imageUrl)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setUploadedFileName('');
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe thread count, weave quality, dye process..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white font-bold px-5 py-2 rounded-xl"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
