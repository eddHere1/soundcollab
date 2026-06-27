import { useState } from 'react';
import { api } from '../api/client';

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
      alert('Collab request sent!');
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 font-display text-lg font-semibold">Request Collaboration</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-dark-300">Your pitch</label>
            <textarea
              className="input min-h-[100px] resize-y"
              placeholder="Tell them about your style, what you'd bring to the collab..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dark-300">Attach idea (optional)</label>
            <input
              type="file"
              className="text-sm text-dark-300"
              onChange={(e) => setAttachment(e.target.files[0])}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
