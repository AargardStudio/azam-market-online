import React, { useState } from 'react';
import { Upload, FileText, Download, Trash2, Plus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Catalogue, Vendor } from '../../types';
import { ErrorBanner } from './SaveFeedback';
import { describeError } from '../../lib/errors';

interface CatalogueManagerProps {
  vendor: Vendor;
  onAddCatalogue: (catData: Partial<Catalogue>) => void | Promise<void>;
  onDeleteCatalogue: (catId: string) => void | Promise<void>;
}

export const CatalogueManager: React.FC<CatalogueManagerProps> = ({
  vendor,
  onAddCatalogue,
  onDeleteCatalogue,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [season, setSeason] = useState('Summer 2026');
  const [description, setDescription] = useState('');
  const [fileSizeMb, setFileSizeMb] = useState<number>(4.5);
  const [sizeError, setSizeError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [listError, setListError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const catalogues = vendor.catalogues || [];
  const maxCatalogues = vendor.tier?.max_catalogues ?? 1;
  const maxCatalogueSizeMb = vendor.tier?.max_catalogue_size_mb ?? 50;
  const isAtLimit = maxCatalogues !== -1 && catalogues.length >= maxCatalogues;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    const size = Number(fileSizeMb);
    if (size > maxCatalogueSizeMb) {
      setSizeError(`PDF is ${size}MB — max allowed is ${maxCatalogueSizeMb}MB on the ${vendor.tier?.display_name || 'current'} Tier.`);
      return;
    }
    setSizeError('');
    setSaveError('');
    setIsSaving(true);
    try {
      await onAddCatalogue({
        title,
        season,
        description: description || 'Official wholesale fabric lookbook & dye swatch reference.',
        file_size_mb: size,
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      setSaveError(describeError(err, 'Could not save this lookbook.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: Catalogue) => {
    if (!window.confirm(`Delete "${cat.title}"? This cannot be undone.`)) return;
    setListError('');
    setDeletingId(cat.id);
    try {
      await onDeleteCatalogue(cat.id);
    } catch (err) {
      setListError(describeError(err, `Could not delete "${cat.title}".`));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900">
            PDF Lookbooks & Catalogue Management ({catalogues.length})
          </h2>
          <p className="text-xs text-gray-500">
            Upload digital PDF catalogues for buyers to download and inspect offline.
          </p>
        </div>

        <button
          onClick={() => { setSaveError(''); setShowModal(true); }}
          disabled={isAtLimit}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
            isAtLimit
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#C9952A] hover:bg-[#b58322] text-white shadow-md'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDF Lookbook</span>
        </button>
      </div>

      {listError && <ErrorBanner title="Action failed" message={listError} onDismiss={() => setListError('')} />}

      {isAtLimit && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>You have reached your limit of <strong>{maxCatalogues} PDF catalogue(s)</strong> under the <strong>{vendor.tier?.display_name} Tier</strong>. Upgrade to Standard or Premium to upload additional lookbooks.</span>
          </div>
        </div>
      )}

      {/* List of Catalogues */}
      {catalogues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {catalogues.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 text-[#C9952A] flex items-center justify-center shrink-0 font-bold">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <span className="bg-emerald-100 text-[#0F5C3A] text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {cat.season || 'Collection'}
                  </span>
                  <h3 className="font-serif font-bold text-base text-gray-900 mt-1">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] font-semibold">DOWNLOAD STATS</span>
                  <strong className="text-[#0F5C3A] font-bold">{cat.download_count} Downloads</strong> • {cat.file_size_mb} MB
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/download/${cat.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </a>

                  <button
                    onClick={() => handleDelete(cat)}
                    disabled={deletingId === cat.id}
                    className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-gray-500 space-y-3">
          <FileText className="w-12 h-12 text-amber-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-900">No Catalogues Uploaded</h3>
          <p className="text-xs max-w-md mx-auto">
            Upload PDF lookbooks to allow wholesale buyers across Pakistan to download swatches and full volume pricing.
          </p>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Upload PDF Lookbook
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Catalogue Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Silk & Chiffon Wholesale Lookbook Vol 1"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Season / Collection</label>
                <input
                  type="text"
                  required
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="e.g. Summer 2026, Festive Edition"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Estimated File Size (MB) <span className="font-normal text-gray-400">(max {maxCatalogueSizeMb}MB)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  max={maxCatalogueSizeMb}
                  value={fileSizeMb}
                  onChange={(e) => {
                    setFileSizeMb(parseFloat(e.target.value) || 4.5);
                    setSizeError('');
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
                {sizeError && <p className="text-red-600 text-[11px] mt-1">{sizeError}</p>}
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of volume discounts, shade numbers, and fabric specs..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                ></textarea>
              </div>

              {/* PDF file upload is not wired up yet — say so instead of faking a verified file */}
              <div className="border border-amber-300 bg-amber-50 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">PDF file upload isn't available yet</div>
                  <p className="mt-0.5">
                    Only the lookbook details above are saved for now. The file size you enter is a declared value
                    (max {maxCatalogueSizeMb}MB) — no PDF is stored, so buyers cannot download one until file storage is enabled.
                  </p>
                </div>
              </div>

              {saveError && <ErrorBanner message={saveError} onDismiss={() => setSaveError('')} />}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2 font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-xl inline-flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving…' : 'Publish Catalogue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
