import { useState } from 'react';
import { api } from '../../api/client';

export default function CollabRequestModal({ postId, onClose }) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('message', message);
      if (attachment) formData.append('attachment', attachment);
      await api.collab.request(postId, formData);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-spotify-elevated p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-xl font-bold">Request Collab</h3>
        <p className="mb-5 text-sm text-spotify-muted">Tell the artist what you bring to the table</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="input min-h-[120px] resize-none"
            placeholder="Your pitch..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <input type="file" className="text-sm text-spotify-muted" onChange={(e) => setAttachment(e.target.files[0])} />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
