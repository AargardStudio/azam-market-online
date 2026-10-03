import React, { useState, useRef } from 'react';
import { Plus, Edit3, Trash2, ShoppingBag, CheckCircle2, AlertCircle, Upload, X, Camera, Link, Sparkles } from 'lucide-react';
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

const DEFAULT_IMAGE = FABRIC_IMAGE_PRESETS[0].url;

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

  // Gallery state: images[0] is always the cover photo.
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const maxImages = vendor.tier?.max_images_per_product ?? 5;
  const maxImageSizeMb = vendor.tier?.max_image_size_mb ?? 5;

  // Image Upload State
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addImage = (url: string) => {
    if (!url) return;
    if (images.length >= maxImages) {
      setImageError(`You can add up to ${maxImages} images per product on the ${vendor.tier?.display_name || 'current'} Tier.`);
      return;
    }
    setImageError('');
    setImages((prev) => [...prev, url]);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImageError('');
  };

  const handleFilesUpload = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const room = Math.max(0, maxImages - images.length);
    let err = '';

    if (room === 0) {
      setImageError(`You can add up to ${maxImages} images per product on the ${vendor.tier?.display_name || 'current'} Tier.`);
      return;
    }

    let queued = 0;
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        err = 'Please select image files (PNG, JPG, WEBP).';
        return;
      }
      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb > maxImageSizeMb) {
        err = `"${file.name}" is ${sizeMb.toFixed(1)}MB — max allowed is ${maxImageSizeMb}MB per image.`;
        return;
      }
      if (queued >= room) {
        err = `Only ${room} more image(s) can be added (limit ${maxImages} per product).`;
        return;
      }
      queued++;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          const result = e.target.result;
          setImages((prev) => (prev.length >= maxImages ? prev : [...prev, result]));
        }
      };
      reader.readAsDataURL(file);
    });

    setImageError(err);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
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
    setImages([DEFAULT_IMAGE]);
    setImageError('');
    setUrlInput('');
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
    setImages(p.image_urls && p.image_urls.length > 0 ? p.image_urls : [p.image_url]);
    setImageError('');
    setUrlInput('');
    setImageInputMode('upload');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setImageError('Add at least one product image.');
      return;
    }
    const payload = {
      name,
      fabric_type: fabricType,
      price_range: priceRange,
      moq,
      description,
      image_url: images[0],
      image_urls: images,
    };
    if (editingProduct) {
      onUpdateProduct(editingProduct.id, payload);
    } else {
      onAddProduct(payload);
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
            Wholesale Products Catalog ({products.length}{maxProducts !== -1 ? ` / ${maxProducts}` : ''})
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
                {p.image_urls && p.image_urls.length > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    {p.image_urls.length}
                  </span>
                )}
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
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
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
                    <Camera className="w-3.5 h-3.5 text-[#0F5C3A]" />
                    <span>Product & Fabric Images</span>
                    <span className="font-normal text-gray-400">
                      ({images.length}/{maxImages}, max {maxImageSizeMb}MB each)
                    </span>
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
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFilesUpload(e.target.files);
                          e.target.value = '';
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
                          Click to browse or drag & drop up to {maxImages} photos
                        </div>
                        <p className="text-[11px] text-gray-500">
                          PNG, JPG, WEBP fabric swatch rolls (Max {maxImageSizeMb}MB each)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Fabric Presets Mode */}
                {imageInputMode === 'presets' && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-gray-500">
                      Choose from authentic high-resolution Pakistani textile samples (tap to add to gallery):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {FABRIC_IMAGE_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => addImage(preset.url)}
                          className={`group relative rounded-xl overflow-hidden border p-1.5 text-left transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            images.includes(preset.url)
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
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Paste fabric image URL (https://...)"
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (urlInput.trim()) {
                          addImage(urlInput.trim());
                          setUrlInput('');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-[#0F5C3A] text-white font-bold text-xs cursor-pointer hover:bg-[#1A7A4F]"
                    >
                      Add
                    </button>
                  </div>
                )}

                {imageError && (
                  <p className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{imageError}</span>
                  </p>
                )}

                {/* Gallery Preview Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                    {images.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group"
                      >
                        <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-[#0F5C3A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
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
