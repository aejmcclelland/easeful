import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

type Props = {
  /** Existing avatar URL to show initially */
  currentUrl?: string;
  /** Max file size in bytes (default 1MB) */
  maxBytes?: number;
};

export default function AvatarUploader({ currentUrl, maxBytes = 1_048_576 }: Props) {
  const { setUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => {
    if (!file) return '';
    return URL.createObjectURL(file);
  }, [file]);

  function openPicker() {
    inputRef.current?.click();
  }

  async function handlePickedFile(f: File | null) {
    setError('');
    setSuccess(false);
    setFile(null);
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    if (f.size > maxBytes) {
      const mb = (maxBytes / (1024 * 1024)).toFixed(1);
      setError(`Image too large. Max ${mb} MB`);
      return;
    }
    setFile(f);
    // auto-upload on select
    await upload(f);
  }

  async function upload(f: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', f);
      const res = await fetch('/api/auth/updateavatar', {
        method: 'PUT',
        credentials: 'include',
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Upload failed');
      }
      // Update global user with the new avatar data
      setUser((prev) => {
        if (!prev) return prev;
        return { ...prev, avatar: json.data?.avatar ?? prev.avatar };
      });
      setSuccess(true);
      setFile(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative inline-block">
        <div className="avatar">
          <div className="w-28 h-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
            <img
              src={preview || currentUrl || 'https://placehold.co/192x192?text=Avatar'}
              alt="avatar"
              className={uploading ? 'opacity-70' : ''}
            />
          </div>
        </div>

        {/* Pencil Edit Button overlay */}
        <button
          type="button"
          className="btn btn-circle btn-sm absolute -right-1 -bottom-1"
          onClick={openPicker}
          aria-label="Edit avatar"
          disabled={uploading}
          title="Edit avatar"
        >
          {/* inline pencil icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
          </svg>
        </button>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePickedFile(e.target.files?.[0] || null)}
        />

        {/* spinner overlay while uploading */}
        {uploading && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        )}
      </div>

      {error && <p className="text-error text-xs">{error}</p>}
      {success && <p className="text-success text-xs">Avatar updated</p>}
    </div>
  );
}
