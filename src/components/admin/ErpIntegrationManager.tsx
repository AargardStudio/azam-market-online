import React, { useState, useEffect } from 'react';
import {
  Server,
  Key,
  Webhook as WebhookIcon,
  Activity,
  Settings,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Send,
  Code,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sliders,
  Terminal,
  Zap,
  Radio,
  FileCode,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ErpConfig, ErpApiKey, ErpWebhook, ErpSyncLog, ErpPermission } from '../../types';

interface ErpIntegrationManagerProps {
  onNotify?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const ErpIntegrationManager: React.FC<ErpIntegrationManagerProps> = () => {
  const [config, setConfig] = useState<ErpConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'api_keys' | 'webhooks' | 'endpoints' | 'logs' | 'sandbox'>('api_keys');

  // Key creation state
  const [showNewKeyModal, setShowNewKeyModal] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<ErpPermission[]>([
    'read:vendors',
    'read:products',
    'write:products',
    'write:inventory',
    'read:leads',
  ]);
  const [createdKeyResult, setCreatedKeyResult] = useState<ErpApiKey | null>(null);

  // Webhook creation state
  const [showNewWebhookModal, setShowNewWebhookModal] = useState<boolean>(false);
  const [newWhName, setNewWhName] = useState<string>('');
  const [newWhUrl, setNewWhUrl] = useState<string>('');
  const [newWhSecret, setNewWhSecret] = useState<string>('');
  const [newWhEvents, setNewWhEvents] = useState<('inquiry.created' | 'vendor.updated' | 'product.updated' | 'catalogue.downloaded')[]>([
    'inquiry.created',
    'catalogue.downloaded'
  ]);

  // Endpoint settings state
  const [settingsForm, setSettingsForm] = useState({
    system_name: '',
    system_version: '',
    sync_mode: 'realtime' as 'realtime' | 'batch_hourly' | 'batch_nightly' | 'manual',
    base_api_url: '/api/v1/erp',
    auto_sync_inventory: true,
    auto_sync_pricing: true,
    forward_whatsapp_leads: true,
    rate_limit_per_minute: 120,
    ip_whitelist: '',
  });

  // UI helpers
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedKeyIds, setRevealedKeyIds] = useState<Record<string, boolean>>({});
  const [syncingNow, setSyncingNow] = useState<boolean>(false);
  const [testingWhId, setTestingWhId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sandbox state
  const [sandboxPayload, setSandboxPayload] = useState<string>(
    JSON.stringify(
      {
        items: [
          {
            stall_number: 'G-14',
            product_id: 'p-1',
            name: 'Super Fine Lawn 90/70 Summer 2026',
            price_range: '₨950–1,250/m',
            moq: '60 metres (1 Thaan)'
          },
          {
            stall_number: 'M-08',
            product_id: 'p-3',
            name: 'Embroidered Chiffon 3-Piece Wholesale',
            price_range: '₨2,400–2,800/suit',
            moq: '25 suits'
          }
        ]
      },
      null,
      2
    )
  );
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [codeSnippetLang, setCodeSnippetLang] = useState<'curl' | 'python' | 'node'>('curl');

  // Load config on mount
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/erp-config');
      if (res.ok) {
        const data: ErpConfig = await res.json();
        setConfig(data);
        setSettingsForm({
          system_name: data.system_name || '',
          system_version: data.system_version || '',
          sync_mode: data.sync_mode || 'realtime',
          base_api_url: data.base_api_url || '/api/v1/erp',
          auto_sync_inventory: data.auto_sync_inventory ?? true,
          auto_sync_pricing: data.auto_sync_pricing ?? true,
          forward_whatsapp_leads: data.forward_whatsapp_leads ?? true,
          rate_limit_per_minute: data.rate_limit_per_minute || 120,
          ip_whitelist: data.ip_whitelist || '',
        });
      }
    } catch (err) {
      console.error('Failed to load ERP config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
    showToast('Copied to clipboard', 'info');
  };

  const handleToggleMasterStatus = async () => {
    if (!config) return;
    const newStatus = !config.is_enabled;
    try {
      const res = await fetch('/api/admin/erp-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setConfig(updated);
        showToast(`ERP Bridge ${newStatus ? 'Activated' : 'Paused in Standby mode'}`);
      }
    } catch (e) {
      showToast('Error updating ERP bridge status', 'error');
    }
  };

  const handleTriggerManualSync = async () => {
    try {
      setSyncingNow(true);
      const res = await fetch('/api/admin/erp/trigger-sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Sync complete! ${data.recordsSynced} fabric items across ${data.vendorsSynced} stalls reconciled`);
        fetchConfig();
      }
    } catch (err) {
      showToast('Sync trigger failed', 'error');
    } finally {
      setSyncingNow(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch('/api/admin/erp/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          permissions: newKeyPermissions,
        }),
      });

      if (res.ok) {
        const newKey: ErpApiKey = await res.json();
        setCreatedKeyResult(newKey);
        setNewKeyName('');
        showToast(`API Key "${newKey.name}" generated successfully`);
        fetchConfig();
      }
    } catch (err) {
      showToast('Failed to generate key', 'error');
    }
  };

  const handleDeleteKey = async (id: string, name: string) => {
    if (!window.confirm(`Revoke API Key "${name}"? External systems using this key will immediately be denied access.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/erp/keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`API Key "${name}" revoked`);
        fetchConfig();
      }
    } catch (err) {
      showToast('Failed to delete key', 'error');
    }
  };

  const handleToggleKey = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/erp/keys/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        fetchConfig();
      }
    } catch (err) {
      showToast('Error toggling key status', 'error');
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName.trim() || !newWhUrl.trim()) return;

    try {
      const res = await fetch('/api/admin/erp/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWhName,
          url: newWhUrl,
          secret: newWhSecret,
          events: newWhEvents,
        }),
      });

      if (res.ok) {
        setShowNewWebhookModal(false);
        setNewWhName('');
        setNewWhUrl('');
        setNewWhSecret('');
        showToast('Webhook endpoint registered');
        fetchConfig();
      }
    } catch (err) {
      showToast('Failed to register webhook', 'error');
    }
  };

  const handleDeleteWebhook = async (id: string, name: string) => {
    if (!window.confirm(`Remove webhook "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/erp/webhooks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Webhook "${name}" deleted`);
        fetchConfig();
      }
    } catch (err) {
      showToast('Failed to delete webhook', 'error');
    }
  };

  const handleToggleWebhook = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/erp/webhooks/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        fetchConfig();
      }
    } catch (err) {
      showToast('Error toggling webhook status', 'error');
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      setTestingWhId(id);
      const res = await fetch(`/api/admin/erp/webhooks/${id}/test`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Ping delivered! HTTP ${data.statusCode} in ${data.responseTimeMs}ms`);
        fetchConfig();
      }
    } catch (err) {
      showToast('Webhook test delivery failed', 'error');
    } finally {
      setTestingWhId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/erp-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setConfig(updated);
        showToast('ERP endpoint settings saved');
      }
    } catch (err) {
      showToast('Failed to save settings', 'error');
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Clear all audit sync logs?')) return;
    try {
      const res = await fetch('/api/admin/erp/logs/clear', { method: 'POST' });
      if (res.ok) {
        showToast('Sync activity logs cleared');
        fetchConfig();
      }
    } catch (err) {
      showToast('Failed to clear logs', 'error');
    }
  };

  const handleRunSandbox = async () => {
    try {
      setSandboxLoading(true);
      setSandboxResponse(null);
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(sandboxPayload);
      } catch (err) {
        setSandboxResponse(JSON.stringify({ error: 'Invalid JSON syntax in payload' }, null, 2));
        setSandboxLoading(false);
        return;
      }

      // Find an active API key to test with
      const activeKey = config?.api_keys.find((k) => k.is_active);
      const token = activeKey?.token || 'azm_live_sandbox_demo';

      const res = await fetch('/api/v1/erp/products/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsedPayload),
      });

      const data = await res.json();
      setSandboxResponse(JSON.stringify(data, null, 2));
      showToast(`Sandbox test executed with HTTP ${res.status}`);
      fetchConfig();
    } catch (err: any) {
      setSandboxResponse(JSON.stringify({ error: err.message || 'Network request failed' }, null, 2));
    } finally {
      setSandboxLoading(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0F5C3A]" />
          <span>Loading ERP Bridge configurations...</span>
        </div>
      </div>
    );
  }

  const activeKeysCount = config?.api_keys.filter((k) => k.is_active).length || 0;
  const activeWebhooksCount = config?.webhooks.filter((w) => w.is_active).length || 0;
  const primaryKey = config?.api_keys.find((k) => k.is_active)?.token || 'YOUR_AZAM_ERP_API_KEY';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border border-emerald-700'
              : statusMessage.type === 'error'
              ? 'bg-red-900 text-red-100 border border-red-700'
              : 'bg-gray-900 text-gray-100 border border-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : statusMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : (
              <Zap className="w-4 h-4 text-amber-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Control Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gray-900 text-[#C9952A] flex items-center justify-center shadow-xs">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl font-bold text-gray-900 tracking-tight">
                    ERP Integration & API Hub
                  </h1>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      config?.is_enabled
                        ? 'bg-emerald-100 text-[#0F5C3A] border border-emerald-300'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {config?.is_enabled ? 'Bridge Active' : 'Standby'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Manage API keys, inbound endpoints, outbound webhooks, and automated stock synchronization for external textile ERP systems.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleToggleMasterStatus}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                config?.is_enabled
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-[#0F5C3A] border-emerald-300'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${config?.is_enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span>{config?.is_enabled ? 'Pause Bridge' : 'Enable Bridge'}</span>
            </button>

            <button
              onClick={handleTriggerManualSync}
              disabled={syncingNow || !config?.is_enabled}
              className="bg-[#0F5C3A] hover:bg-[#1A7A4F] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingNow ? 'animate-spin text-amber-300' : ''}`} />
              <span>{syncingNow ? 'Reconciling...' : 'Run Immediate Sync'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400 text-[10px] font-bold uppercase block">Target ERP Suite</span>
            <strong className="text-gray-900 font-semibold truncate block mt-0.5">
              {config?.system_name || 'Generic Textile ERP'}
            </strong>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400 text-[10px] font-bold uppercase block">Active API Keys</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <strong className="text-gray-900 font-semibold">{activeKeysCount} Active Keys</strong>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400 text-[10px] font-bold uppercase block">Webhooks Subscribed</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <WebhookIcon className="w-3.5 h-3.5 text-blue-500" />
              <strong className="text-gray-900 font-semibold">{activeWebhooksCount} Endpoints</strong>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400 text-[10px] font-bold uppercase block">Last Sync Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <strong className="text-emerald-700 font-semibold">
                {config?.last_successful_sync
                  ? new Date(config.last_successful_sync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Never'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Bar */}
      <div className="flex items-center gap-1 p-1.5 bg-gray-200/80 rounded-2xl border border-gray-300/60 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('api_keys')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'api_keys'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-amber-600" />
          <span>API Keys & Permissions</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600">
            {config?.api_keys.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('webhooks')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'webhooks'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <WebhookIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>Outbound Webhooks</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600">
            {config?.webhooks.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('endpoints')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'endpoints'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-600" />
          <span>Endpoints & Settings</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-indigo-600" />
          <span>Sync Activity Logs</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600">
            {config?.sync_logs.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('sandbox')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'sandbox'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-purple-600" />
          <span>API Testing Sandbox</span>
        </button>
      </div>

      {/* SUB-TAB 1: API KEYS */}
      {activeSubTab === 'api_keys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">ERP Authentication API Keys</h2>
              <p className="text-xs text-gray-500">
                Generate and authorize secret tokens for your ERP server to authenticate when pushing stock updates or fetching buyer leads.
              </p>
            </div>

            <button
              onClick={() => {
                setCreatedKeyResult(null);
                setShowNewKeyModal(true);
              }}
              className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate New API Key</span>
            </button>
          </div>

          {/* New Key Generated Banner */}
          {createdKeyResult && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>New API Key Generated: &quot;{createdKeyResult.name}&quot;</span>
              </div>
              <p className="text-amber-800 text-[11px]">
                Please copy this secret key now. For security purposes, it will not be displayed in full again in plain text.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdKeyResult.token}
                  className="flex-1 font-mono text-xs bg-white border border-amber-300 px-3 py-2 rounded-lg text-gray-800 select-all"
                />
                <button
                  onClick={() => copyToClipboard(createdKeyResult.token || '', 'new-created-key')}
                  className="bg-[#0F5C3A] text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 hover:bg-[#1A7A4F] cursor-pointer"
                >
                  {copiedId === 'new-created-key' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'new-created-key' ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
            </div>
          )}

          {/* List of Keys */}
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-2xs overflow-hidden">
            {config?.api_keys.map((k) => {
              const isRevealed = revealedKeyIds[k.id];
              const displayVal = isRevealed && k.token ? k.token : k.key_preview;

              return (
                <div key={k.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-xs text-gray-900">{k.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          k.is_active ? 'bg-emerald-100 text-[#0F5C3A]' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {k.is_active ? 'Active' : 'Deactivated'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Created {new Date(k.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Token & Actions */}
                    <div className="flex items-center gap-2 max-w-xl">
                      <div className="font-mono text-xs bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 flex-1 truncate">
                        {displayVal}
                      </div>

                      {k.token && (
                        <button
                          onClick={() => setRevealedKeyIds((prev) => ({ ...prev, [k.id]: !isRevealed }))}
                          className="p-1.5 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-100 cursor-pointer"
                          title={isRevealed ? 'Mask Token' : 'Reveal Token'}
                        >
                          {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}

                      <button
                        onClick={() => copyToClipboard(k.token || k.key_preview, k.id)}
                        className="p-1.5 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-100 cursor-pointer"
                        title="Copy Key"
                      >
                        {copiedId === k.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Permissions list */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-gray-400 font-semibold">Permissions:</span>
                      {k.permissions.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200 font-mono"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleKey(k.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        k.is_active
                          ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          : 'border-emerald-200 bg-emerald-50 text-[#0F5C3A] hover:bg-emerald-100'
                      }`}
                    >
                      {k.is_active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleDeleteKey(k.id, k.name)}
                      className="text-xs font-semibold text-red-600 hover:bg-red-50 p-2 rounded-lg border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {config?.api_keys.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-xs">
                No ERP API keys provisioned yet. Click &quot;Generate New API Key&quot; above to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WEBHOOKS */}
      {activeSubTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Outbound ERP Webhooks</h2>
              <p className="text-xs text-gray-500">
                Configure HTTP POST destinations where Azam Market Online will send real-time events (buyer inquiries, catalog downloads, stock updates) to your ERP system.
              </p>
            </div>

            <button
              onClick={() => setShowNewWebhookModal(true)}
              className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Webhook</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-2xs overflow-hidden">
            {config?.webhooks.map((wh) => (
              <div key={wh.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs text-gray-900">{wh.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          wh.is_active ? 'bg-emerald-100 text-[#0F5C3A]' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {wh.is_active ? 'Listening' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md max-w-xl truncate block">
                        {wh.url}
                      </span>
                      <button
                        onClick={() => copyToClipboard(wh.url, wh.id)}
                        className="text-gray-400 hover:text-gray-700 p-1"
                        title="Copy URL"
                      >
                        {copiedId === wh.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestWebhook(wh.id)}
                      disabled={testingWhId === wh.id || !wh.is_active}
                      className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send className={`w-3 h-3 ${testingWhId === wh.id ? 'animate-bounce' : ''}`} />
                      <span>{testingWhId === wh.id ? 'Pinging...' : 'Send Test Ping'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleWebhook(wh.id)}
                      className="text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200 font-semibold cursor-pointer"
                    >
                      {wh.is_active ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      onClick={() => handleDeleteWebhook(wh.id, wh.name)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg border border-transparent hover:border-red-200 cursor-pointer"
                      title="Delete Webhook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-50 text-gray-500">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Events:</span>
                    {wh.events.map((ev) => (
                      <span key={ev} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-mono">
                        {ev}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-gray-400">
                    {wh.last_delivered_at ? (
                      <span>Last delivered: {new Date(wh.last_delivered_at).toLocaleTimeString()}</span>
                    ) : (
                      <span>No events sent yet</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {config?.webhooks.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-xs">
                No webhooks configured. Register your ERP system endpoint to receive instant lead & inventory event feeds.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ENDPOINTS & SETTINGS */}
      {activeSubTab === 'endpoints' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">ERP Connection Settings</h2>
              <p className="text-xs text-gray-500">
                Configure sync frequencies, automation rules, and IP whitelisting for your ERP server.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Target ERP System Name</label>
                  <input
                    type="text"
                    value={settingsForm.system_name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, system_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0F5C3A]"
                    placeholder="e.g. Azam Central Fabric ERP"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">ERP Version / Build</label>
                  <input
                    type="text"
                    value={settingsForm.system_version}
                    onChange={(e) => setSettingsForm({ ...settingsForm, system_version: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0F5C3A]"
                    placeholder="e.g. v2.6.4 (Enterprise)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Synchronization Mode</label>
                  <select
                    value={settingsForm.sync_mode}
                    onChange={(e: any) => setSettingsForm({ ...settingsForm, sync_mode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0F5C3A]"
                  >
                    <option value="realtime">Real-time Webhook & Instant API</option>
                    <option value="batch_hourly">Scheduled Hourly Batch Sync</option>
                    <option value="batch_nightly">Scheduled Nightly Sync (02:00 PKT)</option>
                    <option value="manual">Manual Reconciliation Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Rate Limit (Requests / min)</label>
                  <input
                    type="number"
                    value={settingsForm.rate_limit_per_minute}
                    onChange={(e) => setSettingsForm({ ...settingsForm, rate_limit_per_minute: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0F5C3A]"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100/70">
                  <input
                    type="checkbox"
                    checked={settingsForm.auto_sync_inventory}
                    onChange={(e) => setSettingsForm({ ...settingsForm, auto_sync_inventory: e.target.checked })}
                    className="rounded text-[#0F5C3A] focus:ring-[#0F5C3A] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 block">Auto-Sync Fabric Roll Inventory & MOQs</span>
                    <span className="text-[11px] text-gray-500">
                      When ERP stock level changes, reflect immediately in Azam Market product cards.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100/70">
                  <input
                    type="checkbox"
                    checked={settingsForm.auto_sync_pricing}
                    onChange={(e) => setSettingsForm({ ...settingsForm, auto_sync_pricing: e.target.checked })}
                    className="rounded text-[#0F5C3A] focus:ring-[#0F5C3A] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 block">Auto-Sync Wholesale Tier Prices</span>
                    <span className="text-[11px] text-gray-500">
                      Update per-metre or per-suit wholesale rates based on mill adjustments.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100/70">
                  <input
                    type="checkbox"
                    checked={settingsForm.forward_whatsapp_leads}
                    onChange={(e) => setSettingsForm({ ...settingsForm, forward_whatsapp_leads: e.target.checked })}
                    className="rounded text-[#0F5C3A] focus:ring-[#0F5C3A] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 block">Forward Buyer WhatsApp Inquiries to ERP CRM</span>
                    <span className="text-[11px] text-gray-500">
                      Automatically dispatch buyer leads into your external sales pipeline.
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Allowed ERP Server IPs / CIDRs (Optional Whitelist)
                </label>
                <input
                  type="text"
                  value={settingsForm.ip_whitelist}
                  onChange={(e) => setSettingsForm({ ...settingsForm, ip_whitelist: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-gray-900 focus:outline-none focus:border-[#0F5C3A]"
                  placeholder="e.g. 192.168.1.0/24, 110.38.10.15"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Leave blank to allow any authorized server presenting a valid API key.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Save ERP Configuration
                </button>
              </div>
            </form>
          </div>

          {/* Reference & Endpoints Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gray-900 text-white rounded-2xl p-5 shadow-2xs space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#C9952A]" />
                  <span className="font-bold text-sm">Inbound API Endpoints</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">REST v1</span>
              </div>

              <div className="space-y-3 font-mono text-[11px]">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-sans font-bold">
                    1. Product & Inventory Sync
                  </span>
                  <div className="flex items-center justify-between bg-gray-800/80 p-2 rounded-lg mt-1 text-emerald-300">
                    <span>POST /api/v1/erp/products/sync</span>
                    <button
                      onClick={() => copyToClipboard('/api/v1/erp/products/sync', 'ep-1')}
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedId === 'ep-1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-sans font-bold">
                    2. Pull Wholesale Leads
                  </span>
                  <div className="flex items-center justify-between bg-gray-800/80 p-2 rounded-lg mt-1 text-blue-300">
                    <span>GET /api/v1/erp/leads</span>
                    <button
                      onClick={() => copyToClipboard('/api/v1/erp/leads', 'ep-2')}
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedId === 'ep-2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-sans font-bold">
                    3. ERP Bridge Health
                  </span>
                  <div className="flex items-center justify-between bg-gray-800/80 p-2 rounded-lg mt-1 text-amber-300">
                    <span>GET /api/v1/erp/status</span>
                    <button
                      onClick={() => copyToClipboard('/api/v1/erp/status', 'ep-3')}
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedId === 'ep-3' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-gray-400 font-sans uppercase font-bold">Sample Integration Code</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      onClick={() => setCodeSnippetLang('curl')}
                      className={`px-2 py-0.5 rounded ${codeSnippetLang === 'curl' ? 'bg-[#C9952A] text-gray-900 font-bold' : 'text-gray-400'}`}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setCodeSnippetLang('python')}
                      className={`px-2 py-0.5 rounded ${codeSnippetLang === 'python' ? 'bg-[#C9952A] text-gray-900 font-bold' : 'text-gray-400'}`}
                    >
                      Python
                    </button>
                    <button
                      onClick={() => setCodeSnippetLang('node')}
                      className={`px-2 py-0.5 rounded ${codeSnippetLang === 'node' ? 'bg-[#C9952A] text-gray-900 font-bold' : 'text-gray-400'}`}
                    >
                      Node
                    </button>
                  </div>
                </div>

                <pre className="p-3 bg-black/60 rounded-xl overflow-x-auto text-[10px] text-gray-300 font-mono leading-relaxed border border-gray-800">
                  {codeSnippetLang === 'curl' &&
`curl -X POST "${window.location.origin}/api/v1/erp/products/sync" \\
  -H "Authorization: Bearer ${primaryKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"items":[{"stall_number":"G-14","price_range":"₨950–1,250/m"}]}'`}

                  {codeSnippetLang === 'python' &&
`import requests

url = "${window.location.origin}/api/v1/erp/products/sync"
headers = {
    "Authorization": "Bearer ${primaryKey}",
    "Content-Type": "application/json"
}
payload = {
    "items": [{"stall_number": "G-14", "price_range": "₨950–1,250/m"}]
}
response = requests.post(url, json=payload, headers=headers)
print(response.json())`}

                  {codeSnippetLang === 'node' &&
`const res = await fetch("${window.location.origin}/api/v1/erp/products/sync", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${primaryKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    items: [{ stall_number: "G-14", price_range: "₨950–1,250/m" }]
  })
});
const data = await res.json();`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SYNC ACTIVITY LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Live Sync & Transmission Logs</h2>
              <p className="text-xs text-gray-500">
                Audit trail of inbound API requests, webhook deliveries, and inventory reconciliations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchConfig}
                className="text-xs text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                <span>Refresh Logs</span>
              </button>

              <button
                onClick={handleClearLogs}
                className="text-xs text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 font-semibold cursor-pointer"
              >
                Clear Logs
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Direction</th>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Records</th>
                  <th className="py-2.5 px-3">Message & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {config?.sync_logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-gray-500 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          log.direction === 'inbound'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {log.direction}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-800 text-[11px]">
                      {log.event}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-700">
                      {log.records_count}
                    </td>
                    <td className="py-3 px-3 text-gray-700">
                      <span className="font-semibold block">{log.message}</span>
                      {log.payload_summary && (
                        <span className="text-[11px] text-gray-400 block font-mono">
                          {log.payload_summary}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {config?.sync_logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: API TESTING SANDBOX */}
      {activeSubTab === 'sandbox' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Interactive ERP API Sandbox</h2>
            <p className="text-xs text-gray-500">
              Test sending sample fabric updates or wholesale prices directly to the live ERP endpoint without needing external software.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Request Body (JSON Payload)</span>
                <span className="text-gray-400 font-mono text-[11px]">POST /api/v1/erp/products/sync</span>
              </div>
              <textarea
                rows={14}
                value={sandboxPayload}
                onChange={(e) => setSandboxPayload(e.target.value)}
                className="w-full font-mono text-xs p-3.5 bg-gray-950 text-emerald-300 rounded-xl border border-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F5C3A]"
              />

              <button
                onClick={handleRunSandbox}
                disabled={sandboxLoading}
                className="w-full bg-[#0F5C3A] hover:bg-[#1A7A4F] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${sandboxLoading ? 'animate-bounce' : ''}`} />
                <span>{sandboxLoading ? 'Transmitting to Server...' : 'Dispatch Request to Live ERP Endpoint'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Server Response</span>
                <span className="text-[11px] text-gray-400">Live Output</span>
              </div>
              <pre className="w-full h-[335px] font-mono text-xs p-3.5 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 overflow-y-auto leading-relaxed">
                {sandboxResponse || 'Click "Dispatch Request" to see the live server response...'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE API KEY */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-gray-900">Generate New ERP API Key</h3>
              </div>
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Key Description / Client Name</label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Lahore Warehouse Barcode Scanner API"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#0F5C3A]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Authorized Scopes / Permissions</label>
                <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {[
                    { id: 'read:vendors', label: 'Read Stall & Vendor Profiles' },
                    { id: 'read:products', label: 'Read Fabric Catalog Listings' },
                    { id: 'write:products', label: 'Create & Update Fabric Listings' },
                    { id: 'write:inventory', label: 'Update Stock Levels & Wholesale Rates' },
                    { id: 'read:leads', label: 'Fetch Buyer Wholesale Leads' },
                    { id: 'admin:all', label: 'Full Administrative Access' },
                  ].map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.includes(perm.id as ErpPermission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyPermissions([...newKeyPermissions, perm.id as ErpPermission]);
                          } else {
                            setNewKeyPermissions(newKeyPermissions.filter((p) => p !== perm.id));
                          }
                        }}
                        className="rounded text-[#0F5C3A] focus:ring-[#0F5C3A]"
                      />
                      <span className="font-medium text-gray-800">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewKeyModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0F5C3A] text-white font-bold hover:bg-[#1A7A4F] cursor-pointer"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER WEBHOOK */}
      {showNewWebhookModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <WebhookIcon className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm text-gray-900">Register Outbound Webhook</h3>
              </div>
              <button
                onClick={() => setShowNewWebhookModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Webhook Name</label>
                <input
                  type="text"
                  required
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  placeholder="e.g. ERP Inquiries CRM Dispatcher"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#0F5C3A]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Target Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={newWhUrl}
                  onChange={(e) => setNewWhUrl(e.target.value)}
                  placeholder="https://erp.yourdomain.pk/api/webhooks/leads"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono focus:outline-none focus:border-[#0F5C3A]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Signing Secret (Optional)</label>
                <input
                  type="text"
                  value={newWhSecret}
                  onChange={(e) => setNewWhSecret(e.target.value)}
                  placeholder="Auto-generated if left blank"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono focus:outline-none focus:border-[#0F5C3A]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Subscribe to Events</label>
                <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {[
                    { id: 'inquiry.created', label: 'Buyer WhatsApp / Message Inquiry Created' },
                    { id: 'catalogue.downloaded', label: 'Lookbook / PDF Swatchbook Downloaded' },
                    { id: 'product.updated', label: 'Fabric Listing or MOQ Modified' },
                    { id: 'vendor.updated', label: 'Stall Profile or Contact Modified' },
                  ].map((ev) => (
                    <label key={ev.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newWhEvents.includes(ev.id as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWhEvents([...newWhEvents, ev.id as any]);
                          } else {
                            setNewWhEvents(newWhEvents.filter((item) => item !== ev.id));
                          }
                        }}
                        className="rounded text-[#0F5C3A] focus:ring-[#0F5C3A]"
                      />
                      <span className="font-medium text-gray-800">{ev.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewWebhookModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0F5C3A] text-white font-bold hover:bg-[#1A7A4F] cursor-pointer"
                >
                  Save Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
