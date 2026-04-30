'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, Plus, Save, Image as ImageIcon, Link2, Mail } from 'lucide-react';
import {
  uploadAssetAction,
  deleteAssetAction,
  addLinkAction,
  addContactAction,
  updatePressKitAction,
} from './actions';

export default function EditClient({ kit }: { kit: any }) {
  const router = useRouter();
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);

  const [info, setInfo] = useState({
    game_name: kit.game_name || '',
    tagline: kit.tagline || '',
    description: kit.description || '',
    release_date: kit.release_date || '',
    website_url: kit.website_url || '',
  });

  const [newLink, setNewLink] = useState({ title: '', url: '' });
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
    if (!newLink.title || !newLink.url) return;
    await addLinkAction(kit.id, newLink.title, newLink.url);
    setNewLink({ title: '', url: '' });
    router.refresh();
  };

  const handleAddContact = async () => {
    if (!newContact.email) return;
    await addContactAction(kit.id, newContact.name, newContact.email, newContact.role);
    setNewContact({ name: '', email: '', role: '' });
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

  const assets = kit.press_kit_assets || [];
  const headers = assets.filter((a: any) => a.type === 'header');
  const logos = assets.filter((a: any) => a.type === 'logo');
  const screenshots = assets.filter((a: any) => a.type === 'screenshot');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Press Kit</h1>
        <p className="text-gray-600">Add screenshots, logos, links, and contact info</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {/* Game Info */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Game Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={info.game_name}
            onChange={(e) => setInfo({ ...info, game_name: e.target.value })}
            placeholder="Game Name"
            className="border rounded-lg px-3 py-2"
          />
          <input
            value={info.tagline}
            onChange={(e) => setInfo({ ...info, tagline: e.target.value })}
            placeholder="Tagline"
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="date"
            value={info.release_date}
            onChange={(e) => setInfo({ ...info, release_date: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            value={info.website_url}
            onChange={(e) => setInfo({ ...info, website_url: e.target.value })}
            placeholder="Website URL"
            className="border rounded-lg px-3 py-2"
          />
          <textarea
            value={info.description}
            onChange={(e) => setInfo({ ...info, description: e.target.value })}
            placeholder="Description"
            rows={4}
            className="border rounded-lg px-3 py-2 md:col-span-2"
          />
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

      {/* Header Image */}
      <AssetSection
        title="Header Image"
        description="Large banner image (1920x1080 recommended)"
        type="header"
        assets={headers}
        uploading={uploading === 'header'}
        onUpload={(f) => handleUpload('header', f)}
        onDelete={handleDelete}
      />

      {/* Logos */}
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

      {/* Screenshots */}
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
                <span className="font-medium">{l.title}</span> —{' '}
                <a href={l.url} className="text-indigo-600 text-sm" target="_blank">
                  {l.url}
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            placeholder="Link title (e.g. Steam)"
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
            className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
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
            </div>
          ))}
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
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg cursor-pointer">
        <Upload className="w-4 h-4" />
        {uploading ? 'Uploading...' : `Upload ${title}`}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach((f) => onUpload(f));
            e.target.value = '';
          }}
        />
      </label>
    </section>
  );
}
