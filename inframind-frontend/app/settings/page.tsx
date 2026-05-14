"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { api } from "../lib/api";

export default function SettingsPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState("critical_alert");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWebhooks = async () => {
    try {
      setIsLoading(true);
      const data = await api.getWebhooks();
      setWebhooks(data);
    } catch (err) {
      console.error("Failed to fetch webhooks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl || !newEvents) return;
    
    try {
      setIsSubmitting(true);
      await api.createWebhook({ name: newName, url: newUrl, events: newEvents });
      await fetchWebhooks();
      setIsAdding(false);
      setNewName("");
      setNewUrl("");
      setNewEvents("critical_alert");
    } catch (err) {
      console.error("Failed to add webhook:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteWebhook(id);
      setWebhooks(webhooks.filter(w => w.id !== id));
    } catch (err) {
      console.error("Failed to delete webhook:", err);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.toggleWebhook(id);
      setWebhooks(webhooks.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w));
    } catch (err) {
      console.error("Failed to toggle webhook:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Settings & Integrations</h1>
        <p className="text-slate-400">Manage external integrations and webhook destinations.</p>
      </div>

      <div className="glass-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <span className="text-electric-blue">🔗</span> Webhooks
          </h2>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue border border-electric-blue/50 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              + Add Webhook
            </button>
          )}
        </div>

        {isAdding && (
          <form onSubmit={handleAdd} className="mb-8 p-5 bg-navy-900/50 rounded-xl border border-white/5 space-y-4">
            <h3 className="font-medium text-slate-200 mb-2">Configure New Webhook</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Name / Identifier</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Slack Critical Alerts"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-electric-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Destination URL</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://hooks.slack.com/services/..."
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-electric-blue"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Subscribed Events</label>
                <select 
                  value={newEvents}
                  onChange={e => setNewEvents(e.target.value)}
                  className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-electric-blue"
                >
                  <option value="critical_alert">Critical Alerts Only</option>
                  <option value="all">All Anomalies & Alerts</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-electric-blue hover:bg-blue-500 text-white px-5 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              >
                {isSubmitting ? "Saving..." : "Save Webhook"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading webhooks...</div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
              <p>No webhooks configured yet.</p>
              <p className="text-sm mt-1">Add a webhook to forward AI alerts to Slack, Discord, or custom endpoints.</p>
            </div>
          ) : (
            webhooks.map(webhook => (
              <div key={webhook.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`w-2 h-2 rounded-full ${webhook.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`}></span>
                    <h4 className="font-semibold text-slate-200">{webhook.name}</h4>
                    <span className="text-xs font-mono bg-black/30 text-electric-cyan px-2 py-0.5 rounded">
                      {webhook.events}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 font-mono truncate max-w-[300px] md:max-w-md ml-5">
                    {webhook.url}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 ml-5 md:ml-0">
                  <button 
                    onClick={() => handleToggle(webhook.id)}
                    className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${webhook.isActive ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}
                  >
                    {webhook.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    onClick={() => handleDelete(webhook.id)}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
