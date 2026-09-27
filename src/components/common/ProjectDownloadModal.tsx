import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FolderArchive, 
  FileCode2, 
  CheckCircle2, 
  Copy, 
  Terminal, 
  Bot, 
  X, 
  Sparkles, 
  Layers, 
  Database, 
  ExternalLink,
  Loader2,
  HardDrive
} from 'lucide-react';

interface ProjectDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCeoMemoir?: () => void;
}

export const ProjectDownloadModal: React.FC<ProjectDownloadModalProps> = ({
  isOpen,
  onClose,
  onOpenCeoMemoir
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedHandover, setCopiedHandover] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'handover' | 'instructions'>('download');
  const [stats, setStats] = useState<{
    name: string;
    version: string;
    totalFiles: number;
    files: string[];
    exportFormat: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/project/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Error fetching project stats:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setDownloadSuccess(false);

      const response = await fetch('/api/project/download');
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'azam-market-online-project.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: direct window location
      window.location.href = '/api/project/download';
    } finally {
      setDownloading(false);
    }
  };

  const handoverText = `# 📋 Handover Specification Document: Azam Market Online

### 1. Project Context & Architecture
- **Application Name**: Azam Market Online (azammarketonline@gmail.com)
- **Domain**: B2B Wholesale Fabric Directory & Merchant Platform for Azam Cloth Market, Walled City, Lahore, Pakistan.
- **Physical Context**: Asia's largest wholesale textile bazaar (16,000+ shops across Kashmiri Bazaar, Chitta Bazaar, Riaz Market, etc.)
- **Stack**:
  - **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts
  - **Backend**: Express in \`server.ts\` (in-memory data store with REST APIs, Archiver zip engine)
  - **Bundler**: Vite 6 mounted as middleware in \`server.ts\` on Port 3000

### 2. Core Operational Modules
1. **Public Wholesale Directory**:
   - Hero banner search, dynamic filter bar (verified stalls, tiers, PDF lookbooks, sorting)
   - Fabric Categories (Lawn, Cotton, Silk, Khaddar, Boski, Bridal, Jacquard)
   - Individual Stall Storefronts with MOQ volume pricing, landmark directions, and WhatsApp ordering
2. **Master Shop Control Center (Admin)**:
   - Universal shop oversight with 8-aspect inspector (Identity, Contact, Guarantees, Products, Catalogues, Wholesale Policies, Landmarks, FAQs)
3. **Regulated Payment Rails**:
   - JazzCash (Mobile Account & OTC USSD), PayFast (1Link SBP Direct Debit), Keenu NetConnect, Stripe International
4. **Textile ERP Bridge**:
   - API Keys, sync logs, 2-way product pricing ingestion, and CRM buyer lead exports
5. **CEO Aargard Memoir, Updates & Platform Services**:
   - Founding story, core quote, vision pillars, changelog updates, and vendor assistance desk

### 3. Local Run Command
\`\`\`bash
unzip azam-market-online-project.zip
npm install
npm run dev
\`\`\``;

  const copyToClipboard = (text: string, type: 'handover' | 'command') => {
    navigator.clipboard.writeText(text);
    if (type === 'handover') {
      setCopiedHandover(true);
      setTimeout(() => setCopiedHandover(false), 3000);
    } else {
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F5C3A] via-[#14422b] to-[#1B2A4A] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-emerald-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#C9952A]">
              <FolderArchive className="w-6 h-6" />
            </span>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#C9952A] text-gray-900 px-2.5 py-0.5 rounded-full">
                Source Code Export
              </span>
              <h2 className="font-serif text-2xl font-bold text-white mt-1">
                Download Azam Market Online
              </h2>
            </div>
          </div>
          
          <p className="text-xs text-emerald-100/90 max-w-lg mt-1">
            Export the complete, production-ready codebase as a standalone ZIP archive. Ideal for local execution, self-hosting, and AI code analysis.
          </p>

          {/* Nav Tabs */}
          <div className="flex items-center gap-2 mt-5 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab('download')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'download'
                  ? 'bg-white text-[#0F5C3A] shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>

            <button
              onClick={() => setActiveTab('handover')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'handover'
                  ? 'bg-white text-[#0F5C3A] shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Handover Text</span>
            </button>

            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'instructions'
                  ? 'bg-white text-[#0F5C3A] shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Run Instructions</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'download' && (
            <div className="space-y-6">
              {/* Primary Download Action Card */}
              <div className="bg-gradient-to-br from-emerald-50 via-gray-50 to-amber-50/40 rounded-2xl p-6 border border-emerald-100 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F5C3A] text-white flex items-center justify-center shadow-lg shadow-emerald-900/20">
                  {downloading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : downloadSuccess ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                  ) : (
                    <Download className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">
                    Full Stack Project Package (.ZIP)
                  </h3>
                  <p className="text-xs text-gray-600 max-w-md mx-auto mt-1">
                    Includes React 19 frontend, Express API backend, sample data seeds, types, configs, and architecture documentation.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    <FileCode2 className="w-3.5 h-3.5 text-[#0F5C3A]" />
                    {stats?.totalFiles || '50+'} source files
                  </span>
                  <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    <Layers className="w-3.5 h-3.5 text-[#C9952A]" />
                    React 19 + TypeScript + Vite
                  </span>
                  <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                    Clean ZIP (No node_modules)
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-3 mx-auto transition-all cursor-pointer ${
                      downloadSuccess
                        ? 'bg-emerald-600 text-white'
                        : downloading
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[#0F5C3A] hover:bg-[#0c4b2f] text-white hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Compressing & Downloading Project...</span>
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Download Complete! (azam-market-online-project.zip)</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 text-[#C9952A]" />
                        <span>Download Project (.ZIP) Now</span>
                      </>
                    )}
                  </button>
                </div>

                {downloadSuccess && (
                  <p className="text-[11px] text-emerald-700 font-medium animate-fade-in">
                    ✓ Your project has been archived and sent to your browser downloads folder.
                  </p>
                )}
              </div>

              {/* What's Inside Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  What is included in this archive
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 block">Complete Frontend App</span>
                      <span className="text-gray-500 text-[11px]">Directory, stall cards, lookbook viewer, vendor & admin dashboards.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 block">Express API Backend</span>
                      <span className="text-gray-500 text-[11px]">Embedded in server.ts with full REST endpoints and ERP bridge.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 block">Payment Gateways & Ledger</span>
                      <span className="text-gray-500 text-[11px]">JazzCash, PayFast 1Link, Keenu NetConnect, and Stripe.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 block">AI Handover & README</span>
                      <span className="text-gray-500 text-[11px]">Pre-formatted specs in README.md and HANDOVER.md for other agents.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'handover' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-gray-900">
                    Handover Specification for External AI
                  </h3>
                  <p className="text-xs text-gray-500">
                    Copy and paste this structured prompt into ChatGPT, Claude, Cursor, or your local LLM.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(handoverText, 'handover')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F5C3A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#0c4b2f] transition-all cursor-pointer"
                >
                  {copiedHandover ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Handover Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-900 text-gray-200 p-4 rounded-2xl font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto border border-gray-800 relative selection:bg-emerald-500 selection:text-white">
                <pre className="whitespace-pre-wrap">{handoverText}</pre>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-base font-bold text-gray-900">
                  How to Run This Project Locally
                </h3>
                <p className="text-xs text-gray-500">
                  Follow these 3 simple steps after extracting the downloaded ZIP file.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0F5C3A] text-white flex items-center justify-center text-[10px]">1</span>
                      Extract and install dependencies
                    </span>
                    <button
                      onClick={() => copyToClipboard('npm install', 'command')}
                      className="text-[11px] text-[#0F5C3A] font-bold hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <div className="bg-gray-900 text-emerald-400 p-3 rounded-xl font-mono text-xs">
                    npm install
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0F5C3A] text-white flex items-center justify-center text-[10px]">2</span>
                      Start the development server
                    </span>
                    <button
                      onClick={() => copyToClipboard('npm run dev', 'command')}
                      className="text-[11px] text-[#0F5C3A] font-bold hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <div className="bg-gray-900 text-emerald-400 p-3 rounded-xl font-mono text-xs">
                    npm run dev
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
                  <span className="font-bold text-xs text-gray-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0F5C3A] text-white flex items-center justify-center text-[10px]">3</span>
                    Open in your browser
                  </span>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-700 flex items-center justify-between">
                    <span className="font-mono text-emerald-700 font-bold">http://localhost:3000</span>
                    <span className="text-[10px] text-gray-400">Port 3000</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Version 2.5.0 • Live Project Archive Engine</span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenCeoMemoir && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCeoMemoir();
                }}
                className="text-xs text-[#0F5C3A] hover:underline font-bold"
              >
                Read CEO Memoir
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
