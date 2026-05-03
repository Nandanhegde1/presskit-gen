'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Trash2,
  Plus,
  Save,
  Image as ImageIcon,
  Link2,
  Mail,
  Sparkles,
  Palette,
} from 'lucide-react';
import {
  uploadAssetAction,
  deleteAssetAction,
  addLinkAction,
  deleteLinkAction,
  addContactAction,
  deleteContactAction,
  updatePressKitAction,
  importFromUrlAction,
} from './actions';

const THEMES: { id: string; name: string; description: string; accent: string }[] = [
  { id: 'modern', name: 'Modern', description: 'Clean white & indigo (default)', accent: '#4f46e5' },
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Dark with neon accents', accent: '#22d3ee' },
  { id: 'retro', name: 'Retro', description: 'CRT scanlines & pixel font', accent: '#fb7185' },
];

export default function EditClient({ kit }: { kit: any }) {
  const router = useRouter();
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, startImport] = useTransition();
  const [isSavingTheme, startSaveTheme] = useTransition();

  const [info, setInfo] = useState({
    game_name: kit.game_name || '',
    tagline: kit.tagline || '',
    description: kit.description || '',
    release_date: kit.release_date || '',
    website_url: kit.website_url || '',
  });

  // Re-sync form fields when kit prop changes (e.g. after Auto-fill / router.refresh)
  useEffect(() => {
    setInfo({
      game_name: kit.game_name || '',
      tagline: kit.tagline || '',
      description: kit.description || '',
      release_date: kit.release_date || '',
      website_url: kit.website_url || '',
    });
  }, [kit.game_name, kit.tagline, kit.description, kit.release_date, kit.website_url]);

  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [newContact, setNewContact] = useState({ name: '', email: '', role: '' });

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUpload = async (type: 'header' | 'logo' | 'screenshot', file: File) => {
    setError(null);
    setUploading(type);
    try {
      const data = await fileToBase64(file);
      const result = await uploadAssetAction(kit.id, type, {
        name: file.name,
        data,
        mime: file.type,
      });
      if (result.error) setError(result.error);
      else router.refresh();
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    }
    setUploading(null);
  };

  const handleDelete = async (assetId: string) => {
    await deleteAssetAction(assetId, kit.id);
    router.refresh();
  };

  const handleAddLink = async () => {
    if (!newLink.label || !newLink.url) return;
    const r = await addLinkAction(kit.id, newLink.label, newLink.url);
    if (r.error) setError(r.error);
    setNewLink({ label: '', url: '' });
    router.refresh();
  };

  const handleDeleteLink = async (id: string) => {
    await deleteLinkAction(id, kit.id);
    router.refresh();
  };

  const handleAddContact = async () => {
    if (!newContact.email && !newContact.name) return;
    const r = await addContactAction(kit.id, newContact.name, newContact.email, newContact.role);
    if (r.error) setError(r.error);
    setNewContact({ name: '', email: '', role: '' });
    router.refresh();
  };

  const handleDeleteContact = async (id: string) => {
    await deleteContactAction(id, kit.id);
    router.refresh();
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    setError(null);
    const result = await updatePressKitAction(kit.id, info);
    if (result.error) setError(result.error);
    else router.refresh();
    setSavingInfo(false);
  };

  const handleImport = () => {
    if (!importUrl.trim()) return;
    setError(null);
    setImportMessage(null);
    startImport(async () => {
      const result = await importFromUrlAction(kit.id, importUrl.trim());
      if ('error' in result && result.error) {
        setError(result.error);
        return;
      }
      const s: any = (result as any).stats;
      setImportMessage(
        `Imported from ${(result as any).source}: ${s.header} header, ${s.screenshots} screenshots, ${s.links} links.`
      );
      setImportUrl('');
      router.refresh();
    });
  };

  const handleThemeChange = (themeId: string) => {
    startSaveTheme(async () => {
      await updatePressKitAction(kit.id, { template_id: themeId });
      router.refresh();
    });
  };

  const assets = kit.press_kit_assets || [];
  const headers = assets.filter((a: any) => a.type === 'header');
  const logos = assets.filter((a: any) => a.type === 'logo');
  const screenshots = assets.filter((a: any) => a.type === 'screenshot');
  const currentTheme = kit.template_id || 'modern';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Press Kit</h1>
        <p className="text-gray-600">Auto-fill from Spotify, Bandcamp, Steam or itch.io, then customize the theme.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}
      {importMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {importMessage}
        </div>
      )}

      {/* IMPORT FROM URL */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-indigo-900">
          <Sparkles className="w-5 h-5" /> Auto-fill from Spotify, Bandcamp, Steam or itch.io
        </h2>
        <p className="text-sm text-indigo-700 mb-4">
          Paste your Spotify artist, Bandcamp page, Steam store, or itch.io URL. We&apos;ll pull the name, bio, art,
          screenshots, header image, and platforms in seconds. Existing fields are preserved.
        </p>
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://open.spotify.com/artist/... or https://yourband.bandcamp.com or Steam/itch.io URL"
            className="flex-1 border border-indigo-300 rounded-lg px-3 py-2 bg-white"
            disabled={isImporting}
          />
          <button
            onClick={handleImport}
            disabled={isImporting || !importUrl.trim()}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            {isImporting ? 'Importing…' : 'Auto-fill'}
          </button>
        </div>
      </section>

      {/* THEME PICKER */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" /> Theme {isSavingTheme && <span className="text-xs text-gray-500">(saving…)</span>}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`text-left p-4 rounded-lg border-2 transition ${
                currentTheme === t.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ background: t.accent }}
                />
                <span className="font-semibold">{t.name}</span>
                {currentTheme === t.id && (
                  <span className="ml-auto text-xs text-indigo-600 font-medium">Active</span>
                )}
              </div>
              <p className="text-sm text-gray-600">{t.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Game Info */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Game Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Game Name</label>
            <input
              value={info.game_name}
              onChange={(e) => setInfo({ ...info, game_name: e.target.value })}
              placeholder="Game Name"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input
              value={info.tagline}
              onChange={(e) => setInfo({ ...info, tagline: e.target.value })}
              placeholder="One-line elevator pitch"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
            <input
              type="date"
              value={info.release_date}
              onChange={(e) => setInfo({ ...info, release_date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              value={info.website_url}
              onChange={(e) => setInfo({ ...info, website_url: e.target.value })}
              placeholder="https://yourgame.com"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={info.description}
              onChange={(e) => setInfo({ ...info, description: e.target.value })}
              placeholder="Tell journalists about your game..."
              rows={6}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <button
          onClick={handleSaveInfo}
          disabled={savingInfo}
          className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {savingInfo ? 'Saving...' : 'Save'}
        </button>
      </section>

      <AssetSection
        title="Header Image"
        description="Large banner image (1920×1080 recommended)"
        type="header"
        assets={headers}
        uploading={uploading === 'header'}
        onUpload={(f) => handleUpload('header', f)}
        onDelete={handleDelete}
      />

      <AssetSection
        title="Logos"
        description="Game logo files (PNG with transparency preferred)"
        type="logo"
        assets={logos}
        uploading={uploading === 'logo'}
        onUpload={(f) => handleUpload('logo', f)}
        onDelete={handleDelete}
        multiple
      />

      <AssetSection
        title="Screenshots"
        description="In-game screenshots (upload multiple)"
        type="screenshot"
        assets={screenshots}
        uploading={uploading === 'screenshot'}
        onUpload={(f) => handleUpload('screenshot', f)}
        onDelete={handleDelete}
        multiple
      />

      {/* Links */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5" /> Links
        </h2>
        <div className="space-y-2 mb-4">
          {(kit.press_kit_links || []).map((l: any) => (
            <div key={l.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <span className="font-medium">{l.label}</span> —{' '}
                <a href={l.url} className="text-indigo-600 text-sm" target="_blank" rel="noopener noreferrer">
                  {l.url}
                </a>
              </div>
              <button
                onClick={() => handleDeleteLink(l.id)}
                className="text-gray-400 hover:text-red-600 p-1"
                aria-label="Delete link"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!kit.press_kit_links || kit.press_kit_links.length === 0) && (
            <p className="text-sm text-gray-500">No links yet. Add Spotify, Bandcamp, social media, store pages, etc.</p>
          )}
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            value={newLink.label}
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
            placeholder="Label (e.g. Steam)"
            className="border rounded-lg px-3 py-2 flex-1"
          />
          <input
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            placeholder="https://..."
            className="border rounded-lg px-3 py-2 flex-1"
          />
          <button
            onClick={handleAddLink}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add
          </button>
        </div>
      </section>

      {/* Contacts */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" /> Press Contacts
        </h2>
        <div className="space-y-2 mb-4">
          {(kit.press_kit_contacts || []).map((c: any) => (
            <div key={c.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <span className="font-medium">{c.name || c.email}</span>
                {c.role && <span className="text-sm text-gray-600 ml-2">({c.role})</span>}
                <div className="text-sm text-gray-500">{c.email}</div>
              </div>
              <button
                onClick={() => handleDeleteContact(c.id)}
                className="text-gray-400 hover:text-red-600 p-1"
                aria-label="Delete contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!kit.press_kit_contacts || kit.press_kit_contacts.length === 0) && (
            <p className="text-sm text-gray-500">No press contacts yet.</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
          <input
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            placeholder="Name"
            className="border rounded-lg px-3 py-2"
          />
          <input
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            placeholder="Email"
            className="border rounded-lg px-3 py-2"
          />
          <input
            value={newContact.role}
            onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
            placeholder="Role (optional)"
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <button
          onClick={handleAddContact}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </section>
    </div>
  );
}

function AssetSection({
  title,
  description,
  type,
  assets,
  uploading,
  onUpload,
  onDelete,
  multiple = false,
}: {
  title: string;
  description: string;
  type: string;
  assets: any[];
  uploading: boolean;
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
  multiple?: boolean;
}) {
  return (
    <section className="bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
        <ImageIcon className="w-5 h-5" /> {title}
      </h2>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {assets.map((a: any) => (
          <div key={a.id} className="relative group border rounded-lg overflow-hidden">
            <img src={a.url} alt={a.filename} className="w-full h-32 object-cover" />
            <button
              onClick={() => onDelete(a.id)}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
              aria-label="Delete asset"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">
        <Upload className="w-4 h-4" />
        <span className="text-sm font-medium">{uploading ? 'Uploading…' : 'Upload'}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          multiple={multiple}
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            for (const f of files) await onUpload(f);
            e.target.value = '';
          }}
        />
      </label>
    </section>
  );
}
