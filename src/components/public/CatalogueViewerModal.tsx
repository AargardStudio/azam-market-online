import React from 'react';
import { Download, FileText, X, CheckCircle, Eye, Share2 } from 'lucide-react';
import { Catalogue, Vendor } from '../../types';

interface CatalogueViewerModalProps {
  catalogue: Catalogue;
  vendor?: Vendor;
  onClose: () => void;
  onDownload: (catId: string) => void;
}

export const CatalogueViewerModal: React.FC<CatalogueViewerModalProps> = ({
  catalogue,
  vendor,
  onClose,
  onDownload,
}) => {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0F5C3A] text-white p-4 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FDF6E7] text-[#C9952A] flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="bg-[#C9952A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {catalogue.season || 'Wholesale Catalogue'}
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold mt-1 text-white">
                {catalogue.title}
              </h2>
              {vendor && (
                <div className="text-xs text-emerald-100">
                  By <strong>{vendor.shop_name}</strong> • {vendor.stall_number}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body / PDF Preview Representation */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>File Format: <strong>PDF Document</strong></span>
              <span>Size: <strong>{catalogue.file_size_mb} MB</strong></span>
              <span>Downloads: <strong>{catalogue.download_count}</strong></span>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              {catalogue.description || 'Verified wholesale catalog containing digital fabric swatches, yarn specifications, dye codes, and volume tier price lists.'}
            </p>
          </div>

          {/* Interactive Document Preview Box */}
          <div className="border border-gray-300 rounded-xl p-6 bg-amber-50/20 text-center space-y-3">
            <div className="w-16 h-20 mx-auto bg-white border-2 border-[#0F5C3A] rounded-lg shadow-md p-2 flex flex-col justify-between items-center">
              <div className="w-full h-2 bg-[#0F5C3A] rounded-xs"></div>
              <FileText className="w-8 h-8 text-[#0F5C3A]" />
              <div className="w-full h-1 bg-gray-300 rounded-xs"></div>
            </div>

            <div className="text-xs font-semibold text-gray-800">
              PDF Lookbook Document Verified
            </div>
            <p className="text-[11px] text-gray-500 max-w-md mx-auto">
              Clicking below will open and download the official wholesale PDF document for offline browsing or printing.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => onDownload(catalogue.id)}
            className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Lookbook ({catalogue.file_size_mb} MB)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
