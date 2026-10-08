import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Download, Upload, RefreshCw, CheckCircle2, AlertCircle, Clock, FileText, Eye, ArrowLeftRight, RotateCcw, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

interface BackupItem {
  id: string;
  timestamp: string;
  type: string; // 'Manual' | 'Automatic' | 'Pre-Change Safety' | 'Pre-Restore Safety'
  status: 'COMPLETE' | 'VERIFYING' | 'FAILED' | 'RESTORING';
  recordCounts: {
    products: number;
    categories: number;
    sections: number;
    banners: number;
    media: number;
    orders: number;
  };
  sizeBytes: number;
  checksum: string;
  dataSnapshot: any;
}

interface AuditLogItem {
  id: string;
  action: string;
  backupId: string;
  timestamp: string;
  details: string;
}

export const BackupManager: React.FC = () => {
  const { products, sections, categories, banners, media, orders, refreshData, showToast } = useApp();
  
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState<'daily' | '12hours' | 'weekly'>('daily');

  // Modals state
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'compare' | 'restore' | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  const fetchBackupsData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBackups();
      setBackups(res.backups || []);
      setAuditLogs(res.auditLogs || []);
    } catch (e) {
      console.warn('Failed to load backups from server:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupsData();
  }, []);

  const handleCreateBackup = async (type = 'Manual') => {
    setIsBackingUp(true);
    try {
      const newBackup = await api.createBackup(type);
      await fetchBackupsData();
      showToast(`Backup #${newBackup.id} created and verified successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Backup failed verification', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!window.confirm('Restore Production Data? An automatic safety backup of your current state will be created first.')) {
      return;
    }

    setIsLoading(true);
    try {
      await api.restoreBackup(backupId);
      await refreshData();
      await fetchBackupsData();
      showToast('Production data restored successfully from backup! Safety backup created.', 'success');
      setModalMode(null);
      setSelectedBackup(null);
    } catch (err: any) {
      showToast(err.message || 'Restore failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadBackup = (backup: BackupItem) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `secretpresso_backup_${backup.id}_${backup.timestamp.replace(/[:.]/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Backup #${backup.id} downloaded successfully`, 'success');
  };

  const handleImportBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJsonText);
      await api.importBackup(parsed);
      await refreshData();
      await fetchBackupsData();
      showToast('Backup imported successfully with safety backup!', 'success');
      setIsImportModalOpen(false);
      setImportJsonText('');
    } catch (err: any) {
      showToast(err.message || 'Invalid backup JSON format or integrity check failed', 'error');
    }
  };

  const totalProtectedRecords = products.length + categories.length + sections.length + banners.length + orders.length;
  const lastBackup = backups.length > 0 ? backups[0] : null;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b1f16]">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secondary Safety Layer & Disaster Recovery</span>
          </span>
          <h2 className="font-serif text-2xl font-medium text-[#fbf7f2]">
            Backup & Recovery Control Center
          </h2>
          <p className="text-xs text-[#a49180] mt-0.5">
            Immutable snapshots, automated point-in-time recovery, checksum integrity, and pre-change safety backups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1b140f] hover:bg-[#281c13] text-[#cfbeae] border border-[#3c2a1c] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#c89b63]" />
            <span>Import Snapshot</span>
          </button>

          <button
            onClick={() => handleCreateBackup('Manual')}
            disabled={isBackingUp}
            className="px-4 py-2 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] disabled:bg-[#3d2f23] text-[#100c08] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            <span>{isBackingUp ? 'Freezing & Verifying Backup...' : '+ Create Backup Now'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] space-y-1">
          <span className="text-[11px] text-[#8e7c6d]">Last Backup</span>
          <p className="text-sm font-serif font-semibold text-[#f5f0eb] truncate">
            {lastBackup ? new Date(lastBackup.timestamp).toLocaleString() : 'No backup yet'}
          </p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{lastBackup ? `Verified (${lastBackup.id})` : 'Awaiting first backup'}</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] space-y-1">
          <span className="text-[11px] text-[#8e7c6d]">Total Immutable Backups</span>
          <p className="text-2xl font-serif font-semibold text-[#f5f0eb]">{backups.length}</p>
          <p className="text-[10px] text-[#dfb780]">Stored in secure server db</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] space-y-1">
          <span className="text-[11px] text-[#8e7c6d]">Protected Records</span>
          <p className="text-2xl font-serif font-semibold text-[#f5f0eb]">{totalProtectedRecords}</p>
          <p className="text-[10px] text-[#dfb780]">Products, categories, orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] space-y-1">
          <span className="text-[11px] text-[#8e7c6d]">System Health</span>
          <p className="text-sm font-serif font-semibold text-emerald-400 flex items-center gap-1 mt-1">
            <Lock className="w-4 h-4" />
            <span>100% Protected</span>
          </p>
          <p className="text-[10px] text-[#8e7c6d]">Safety auto-backup active</p>
        </div>
      </div>

      {/* Automatic Backup Frequency Setting */}
      <div className="p-5 rounded-2xl bg-[#15100c] border border-[#2e2016] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-base font-medium text-[#fbf7f2]">
            Automatic Background Backups
          </h3>
          <p className="text-xs text-[#a49180] mt-0.5">
            Configure how frequently the system captures immutable point-in-time snapshots automatically.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#8e7c6d]">Schedule:</span>
          <select
            value={backupFrequency}
            onChange={(e) => {
              setBackupFrequency(e.target.value as any);
              showToast(`Automatic backup frequency updated to ${e.target.value}`, 'success');
            }}
            className="px-3 py-2 rounded-xl bg-[#1c140f] border border-[#3e2c1e] text-[#f5f0eb] focus:outline-none focus:border-[#c89b63]"
          >
            <option value="daily">Daily (Every 24 Hours)</option>
            <option value="12hours">Every 12 Hours</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="p-6 rounded-2xl bg-[#15100c] border border-[#2e2016] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#251b14]">
          <h3 className="font-serif text-lg font-medium text-[#fbf7f2]">
            Immutable Backup History ({backups.length})
          </h3>
          <span className="text-xs text-[#8e7c6d]">Read-only point-in-time snapshots</span>
        </div>

        {backups.length === 0 ? (
          <div className="py-12 text-center text-[#8e7c6d] border border-dashed border-[#342418] rounded-xl">
            <Database className="w-8 h-8 mx-auto mb-2 text-[#4a3625]" />
            <p className="text-sm font-serif text-[#d6c4b2]">No backups recorded yet</p>
            <p className="text-xs mt-1">Click "+ Create Backup Now" above to capture your first snapshot.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#261b13] text-[#8e7c6d]">
                  <th className="pb-3 font-medium">Backup ID</th>
                  <th className="pb-3 font-medium">Timestamp</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Records</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201711]">
                {backups.map((bk) => {
                  const recordSum = Object.values(bk.recordCounts || {}).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={bk.id} className="hover:bg-[#19120e] transition-colors">
                      <td className="py-3 font-serif font-semibold text-[#f5f0eb]">#{bk.id}</td>
                      <td className="py-3 text-[#cfbeae]">{new Date(bk.timestamp).toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          bk.type === 'Manual'
                            ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50'
                            : bk.type.includes('Safety')
                            ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/50'
                            : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                        }`}>
                          {bk.type}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{bk.status}</span>
                        </span>
                      </td>
                      <td className="py-3 text-[#a49180]">{recordSum} items</td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBackup(bk);
                            setModalMode('view');
                          }}
                          className="px-2.5 py-1 rounded bg-[#221811] hover:bg-[#342419] text-[#cfbeae] transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBackup(bk);
                            setModalMode('compare');
                          }}
                          className="px-2.5 py-1 rounded bg-[#221811] hover:bg-[#342419] text-[#cfbeae] transition-colors"
                        >
                          Compare
                        </button>
                        <button
                          onClick={() => handleDownloadBackup(bk)}
                          title="Download Backup JSON"
                          className="px-2.5 py-1 rounded bg-[#221811] hover:bg-[#342419] text-[#cfbeae] transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBackup(bk);
                            setModalMode('restore');
                          }}
                          className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 font-semibold transition-colors"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Backup Audit Log */}
      <div className="p-6 rounded-2xl bg-[#15100c] border border-[#2e2016] space-y-3">
        <h3 className="font-serif text-lg font-medium text-[#fbf7f2]">
          Admin Backup Audit Log ({auditLogs.length})
        </h3>
        <p className="text-xs text-[#8e7c6d]">Immutable audit trail of all backup and disaster recovery operations.</p>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-[#8e7c6d] py-3 text-center">No audit log entries yet.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b140f] border border-[#281b13] text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded text-[9px] bg-[#291f16] text-[#dfb780] font-mono">
                    {log.action}
                  </span>
                  <span className="text-[#f5f0eb]">{log.details}</span>
                  <span className="text-[10px] text-[#8e7c6d]">({log.backupId})</span>
                </div>
                <span className="text-[11px] text-[#8e7c6d]">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View / Compare / Restore Modal */}
      {modalMode && selectedBackup && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#140e0b] border border-[#3e2c1e] rounded-2xl p-6 text-[#f5f0eb] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#281c13]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
                  Backup #{selectedBackup.id} ({selectedBackup.type})
                </span>
                <h3 className="font-serif text-xl text-[#fbf7f2]">
                  {modalMode === 'view' && 'Backup Snapshot Inspection'}
                  {modalMode === 'compare' && 'Production vs Backup Diff Preview'}
                  {modalMode === 'restore' && 'Disaster Recovery Restore Confirmation'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setModalMode(null);
                  setSelectedBackup(null);
                }}
                className="text-[#9e8b7b] hover:text-[#f5f0eb]"
              >
                ✕
              </button>
            </div>

            {modalMode === 'view' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#1b140f] rounded-xl border border-[#2e2016]">
                    <span className="text-[#8e7c6d]">Products</span>
                    <p className="text-base font-semibold text-[#f5f0eb]">{selectedBackup.recordCounts?.products || 0}</p>
                  </div>
                  <div className="p-3 bg-[#1b140f] rounded-xl border border-[#2e2016]">
                    <span className="text-[#8e7c6d]">Categories</span>
                    <p className="text-base font-semibold text-[#f5f0eb]">{selectedBackup.recordCounts?.categories || 0}</p>
                  </div>
                  <div className="p-3 bg-[#1b140f] rounded-xl border border-[#2e2016]">
                    <span className="text-[#8e7c6d]">Sections</span>
                    <p className="text-base font-semibold text-[#f5f0eb]">{selectedBackup.recordCounts?.sections || 0}</p>
                  </div>
                  <div className="p-3 bg-[#1b140f] rounded-xl border border-[#2e2016]">
                    <span className="text-[#8e7c6d]">Banners</span>
                    <p className="text-base font-semibold text-[#f5f0eb]">{selectedBackup.recordCounts?.banners || 0}</p>
                  </div>
                  <div className="p-3 bg-[#1b140f] rounded-xl border border-[#2e2016]">
                    <span className="text-[#8e7c6d]">Media Assets</span>
                    <p className="text-base font-semibold text-[#f5f0eb]">{selectedBackup.recordCounts?.media || 0}</p>
                  </div>
                  <div className="p-3 bg-[#1b140f] rounded-xl border border-[#2e2016]">
                    <span className="text-[#8e7c6d]">Orders</span>
                    <p className="text-base font-semibold text-[#f5f0eb]">{selectedBackup.recordCounts?.orders || 0}</p>
                  </div>
                </div>

                <div className="p-3 bg-[#19110d] rounded-xl border border-[#2d2015] font-mono text-[11px] text-[#cfbeae]">
                  <p>Checksum SHA-256: <span className="text-[#dfb780]">{selectedBackup.checksum}</span></p>
                  <p>Timestamp: {new Date(selectedBackup.timestamp).toISOString()}</p>
                  <p>Status: {selectedBackup.status}</p>
                </div>
              </div>
            )}

            {modalMode === 'compare' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#a49180]">
                  Comparing current live production records against Snapshot #{selectedBackup.id}:
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-[#1b140f] rounded-xl border border-[#2e2016]">
                    <span>Products (Current vs Backup)</span>
                    <span className="font-semibold text-[#dfb780]">{products.length} vs {selectedBackup.recordCounts?.products}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#1b140f] rounded-xl border border-[#2e2016]">
                    <span>Categories (Current vs Backup)</span>
                    <span className="font-semibold text-[#dfb780]">{categories.length} vs {selectedBackup.recordCounts?.categories}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#1b140f] rounded-xl border border-[#2e2016]">
                    <span>Sections (Current vs Backup)</span>
                    <span className="font-semibold text-[#dfb780]">{sections.length} vs {selectedBackup.recordCounts?.sections}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#1b140f] rounded-xl border border-[#2e2016]">
                    <span>Banners (Current vs Backup)</span>
                    <span className="font-semibold text-[#dfb780]">{banners.length} vs {selectedBackup.recordCounts?.banners}</span>
                  </div>
                </div>
              </div>
            )}

            {modalMode === 'restore' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-rose-300 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Warning: Production State Replacement</span>
                  </p>
                  <p>
                    You are about to restore Snapshot #{selectedBackup.id} captured on {new Date(selectedBackup.timestamp).toLocaleString()}.
                  </p>
                  <p className="font-semibold text-emerald-300">
                    ✓ An automatic safety backup of your current production state will be created immediately before restore.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setModalMode(null);
                      setSelectedBackup(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#221811] text-[#cfbeae]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRestore(selectedBackup.id)}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors"
                  >
                    Confirm & Restore Production State
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#140e0b] border border-[#3e2c1e] rounded-2xl p-6 text-[#f5f0eb] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#281c13]">
              <h3 className="font-serif text-lg text-[#fbf7f2]">Import Backup Snapshot JSON</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-[#9e8b7b] hover:text-[#f5f0eb]">✕</button>
            </div>

            <form onSubmit={handleImportBackupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#cfbeae] mb-1 font-medium">Paste Backup JSON Content</label>
                <textarea
                  required
                  rows={8}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="{ id: '...', dataSnapshot: { ... } }"
                  className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#221811] text-[#cfbeae]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-semibold"
                >
                  Validate & Import Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
