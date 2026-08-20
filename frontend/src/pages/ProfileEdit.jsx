import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/categories';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [selectedCategories, setSelectedCategories] = useState(
    (user?.categories || []).filter(c => CATEGORIES.includes(c))
  );
  const [otherCategory, setOtherCategory] = useState(
    (user?.categories || []).find(c => !CATEGORIES.includes(c)) || ''
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const next = [...selectedCategories];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSelectedCategories(next);
  };

  const moveDown = (index) => {
    if (index === selectedCategories.length - 1) return;
    const next = [...selectedCategories];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setSelectedCategories(next);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Username cannot be empty.');
      return;
    }

    let finalCategories = [...selectedCategories];
    if (otherCategory.trim()) {
      finalCategories.push(otherCategory.trim());
    }

    if (finalCategories.length === 0) {
      setErrorMsg('Please select at least one music category, or specify a custom one.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await API.put('/auth/profile', {
        username: username.trim(),
        categories: finalCategories,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      await refreshUser();
      setSuccessMsg('Profile and account settings updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-16 font-mono text-xs">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <span className="text-amber-400 uppercase tracking-widest">[Account Settings]</span>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-1">Edit Profile</h2>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-zinc-900 border border-amber-400/40 p-8 relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400" />

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-zinc-400 uppercase mb-2">Email <span className="text-[10px] text-zinc-600">(cannot be changed)</span></label>
            <input type="text" value={user?.email || ''} disabled className="w-full bg-zinc-950 border border-zinc-800 p-4 text-zinc-600 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-2">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-amber-400" />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-2">Categories</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-2 bg-zinc-950 border border-zinc-800 p-4">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                const rank = selectedCategories.indexOf(cat) + 1;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`p-2.5 border text-left flex justify-between items-center transition ${isSelected ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                  >
                    <span className="text-[11px]">{cat}</span>
                    {isSelected && <span className="bg-amber-400 text-zinc-950 px-1.5 py-0.5 text-[9px] font-black">#{rank}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-2">Other (custom category)</label>
            <input type="text" placeholder="e.g., Sitar Player, Synth Designer" value={otherCategory} onChange={e => setOtherCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:outline-none focus:border-amber-400" />
          </div>

          {selectedCategories.length > 0 && (
            <div>
              <label className="block text-zinc-400 uppercase mb-2">Proficiency order</label>
              <div className="space-y-2">
                {selectedCategories.map((cat, i) => (
                  <div key={cat} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 px-3 py-2">
                    <span className="text-amber-300 font-bold">#{i + 1} {cat}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveUp(i)} className="px-2 py-1 text-zinc-400 hover:text-amber-400 disabled:opacity-30" disabled={i === 0}>▲</button>
                      <button type="button" onClick={() => moveDown(i)} className="px-2 py-1 text-zinc-400 hover:text-amber-400 disabled:opacity-30" disabled={i === selectedCategories.length - 1}>▼</button>
                      <button type="button" onClick={() => toggleCategory(cat)} className="px-2 py-1 text-zinc-500 hover:text-rose-400"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-zinc-800 pt-6 mt-6">
            <h4 className="text-amber-400 font-bold uppercase mb-4 tracking-wider">Security &amp; Password</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-zinc-400 uppercase mb-2">Current Password <span className="text-[10px] text-zinc-600">(required to change password)</span></label>
                <input type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-amber-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase mb-2">New Password</label>
                  <input type="password" placeholder="Leave blank to keep same" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase mb-2">Confirm New Password</label>
                  <input type="password" placeholder="Leave blank to keep same" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-amber-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/profile')} className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-4 py-3 uppercase font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-grow bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 py-4 font-bold uppercase tracking-wider transition text-sm">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
