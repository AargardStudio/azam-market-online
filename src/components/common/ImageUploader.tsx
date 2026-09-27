import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, Sparkles, AlertCircle } from 'lucide-react';

export type ImageUploaderAspect = 'cover' | 'logo' | 'certificate' | 'product';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  aspect?: ImageUploaderAspect;
  label?: string;
  description?: string;
  placeholderText?: string;
  required?: boolean;
}

// Authentic textile presets for Azam Cloth Market
const PRESET_FABRIC_BANNERS = [
  {
    name: 'Wholesale Fabric Rolls',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
    tag: 'Cotton & Linen',
  },
  {
    name: 'Royal Brocade & Silk',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    tag: 'Bridal Velvet',
  },
  {
    name: 'Vibrant Textile Bazaar',
    url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80',
    tag: 'Azam Market Atmosphere',
  },
  {
    name: 'Printed Lawn & Voile',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    tag: 'Summer Lawn',
  },
  {
    name: 'Traditional Loom Weave',
    url: 'https://images.unsplash.com/photo-1606744888344-493238955221?auto=format&fit=crop&w=1200&q=80',
    tag: 'Karandi & Khaddar',
  },
  {
    name: 'Mughal Architectural Tile',
    url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1200&q=80',
    tag: 'Heritage Lahore',
  },
];

const PRESET_LOGOS = [
  {
    name: 'Gold Textile Crest',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=300&q=80',
    tag: 'Gold Crest',
  },
  {
    name: 'Emerald Thread Spool',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80',
    tag: 'Raw Cotton',
  },
  {
    name: 'Indigo Geometric Seal',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=300&q=80',
    tag: 'Indigo Stamp',
  },
  {
    name: 'Crimson Velvet Monogram',
    url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=300&q=80',
    tag: 'Silk Monogram',
  },
];

const PRESET_CERTIFICATES = [
  {
    name: 'Anjuman-e-Tajran Azam Market Registered Stamp',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    tag: 'Trade License',
  },
  {
    name: 'ISO Textile Mill Direct Certificate',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    tag: 'ISO Standard',
  },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  aspect = 'cover',
  label,
  description,
  placeholderText,
  required = false,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setErrorMsg('');
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
        setUrlInput('');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to process image file. Please try another image or use an image URL.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Please enter a valid image URL');
      return;
    }
    setErrorMsg('');
    onChange(urlInput.trim());
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const presets = aspect === 'logo' ? PRESET_LOGOS : aspect === 'certificate' ? PRESET_CERTIFICATES : PRESET_FABRIC_BANNERS;

  return (
    <div className="space-y-3">
      {/* Label & Description */}
      {(label || description) && (
        <div className="flex items-center justify-between">
          <div>
            {label && (
              <label className="block text-xs font-bold text-gray-900">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
            )}
            {description && <p className="text-[11px] text-gray-500">{description}</p>}
          </div>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" /> Remove Image
            </button>
          )}
        </div>
      )}

      {/* CURRENT IMAGE PREVIEW (IF AVAILABLE) */}
      {value ? (
        <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group">
          <div
            className={`w-full overflow-hidden flex items-center justify-center bg-gray-100 ${
              aspect === 'cover' ? 'h-36 sm:h-44' : aspect === 'logo' ? 'h-28 w-28 mx-auto my-3 rounded-full' : 'h-36'
            }`}
          >
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-lg p-1 text-white">
            <span className="text-[10px] font-bold px-1.5 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> Image Set
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="hover:bg-white/20 p-1 rounded transition-colors cursor-pointer text-white"
              title="Remove this image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      {/* INPUT / UPLOAD CONTROLS */}
      <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-3 space-y-3">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-gray-200/80 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'upload' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'url' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Paste URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'presets' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Market Presets</span>
          </button>
        </div>

        {/* TAB 1: FILE DRAG & DROP / FILE INPUT */}
        {activeTab === 'upload' && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#0F5C3A] bg-emerald-50/50 scale-[0.99]'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#0F5C3A] flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-bold text-[#0F5C3A] hover:underline">Click to browse file</span> or drag & drop here
              </div>
              <p className="text-[10px] text-gray-400">
                {aspect === 'cover'
                  ? 'Recommended: 1200×400px (16:9 or panoramic banner, max 10MB)'
                  : aspect === 'logo'
                  ? 'Recommended: 400×400px (Square or circle icon, PNG/WEBP/SVG)'
                  : 'High resolution image file (PNG, JPG, WEBP, max 10MB)'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: WEB URL */}
        {activeTab === 'url' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={placeholderText || 'https://images.unsplash.com/... or CDN link'}
                className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0F5C3A] focus:border-[#0F5C3A] bg-white outline-none"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Apply
              </button>
            </div>
            <p className="text-[10px] text-gray-400">
              Paste direct image link from Unsplash, Imgur, Cloudinary, or your hosting server.
            </p>
          </div>
        )}

        {/* TAB 3: PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {presets.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onChange(preset.url);
                    setUrlInput('');
                  }}
                  className={`rounded-lg border p-1.5 cursor-pointer transition-all hover:border-[#0F5C3A] group text-left ${
                    value === preset.url ? 'border-[#0F5C3A] bg-emerald-50/60 ring-1 ring-[#0F5C3A]' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="h-16 rounded bg-gray-100 overflow-hidden mb-1">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="text-[11px] font-bold text-gray-900 truncate">{preset.name}</div>
                  <div className="text-[9px] text-[#0F5C3A] font-semibold truncate">{preset.tag}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
