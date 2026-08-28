import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rankedCategories, setRankedCategories] = useState([]);
  const [otherCategory, setOtherCategory] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleCategory = (cat) => {
    if (rankedCategories.includes(cat)) {
      setRankedCategories(rankedCategories.filter(c => c !== cat));
    } else {
      setRankedCategories([...rankedCategories, cat]);
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const next = [...rankedCategories];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setRankedCategories(next);
  };

  const moveDown = (index) => {
    if (index === rankedCategories.length - 1) return;
    const next = [...rankedCategories];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setRankedCategories(next);
  };

  const removeCategory = (cat) => setRankedCategories(rankedCategories.filter(c => c !== cat));

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Username, email, and password are all required.');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    let finalCategories = [...rankedCategories];
    if (otherCategory.trim()) {
      finalCategories.push(otherCategory.trim());
    }

    if (finalCategories.length === 0) {
      setErrorMsg('Please select at least one music category, or specify a custom one.');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/auth/register', {
        username: username.trim(),
        email: email.trim(),
        password,
        categories: finalCategories,
      });

      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-20 font-mono">
      <div className="bg-zinc-900 border border-zinc-800 p-8 lg:p-10 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400" />

        <div className="mb-8">
          <span className="text-xs text-amber-400 uppercase tracking-widest">[Create Profile]</span>
          <h2 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight mt-1">Register</h2>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6 text-xs lg:text-sm">
          <div>
            <label className="block text-zinc-400 uppercase mb-2">Username</label>
            <input type="text" placeholder="e.g., Alex" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-zinc-400 uppercase mb-2">Email</label>
            <input type="email" placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-zinc-400 uppercase mb-2">Password (min 6 characters)</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-amber-400" />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-2">Categories / Skills</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-2 bg-zinc-950 border border-zinc-800 p-3">
              {CATEGORIES.map((cat) => {
                const isSelected = rankedCategories.includes(cat);
                const rank = rankedCategories.indexOf(cat) + 1;
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
            <input type="text" placeholder="e.g., Sitar Player, Synth Designer" value={otherCategory} onChange={e => setOtherCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:outline-none focus:border-amber-400 text-xs" />
          </div>

          {rankedCategories.length > 0 && (
            <div>
              <label className="block text-zinc-400 uppercase mb-2">Proficiency order (top = strongest)</label>
              <div className="space-y-2">
                {rankedCategories.map((cat, i) => (
                  <div key={cat} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 px-3 py-2">
                    <span className="text-amber-300 font-bold">#{i + 1} {cat}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveUp(i)} className="px-2 py-1 text-zinc-400 hover:text-amber-400 disabled:opacity-30" disabled={i === 0}>▲</button>
                      <button type="button" onClick={() => moveDown(i)} className="px-2 py-1 text-zinc-400 hover:text-amber-400 disabled:opacity-30" disabled={i === rankedCategories.length - 1}>▼</button>
                      <button type="button" onClick={() => removeCategory(cat)} className="px-2 py-1 text-zinc-500 hover:text-rose-400"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting} className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 py-4 font-bold uppercase tracking-wider transition text-sm">
            {submitting ? 'Saving...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500 border-t border-zinc-800 pt-4">
          <p>Already have an account? <Link to="/login" className="text-amber-400 underline">Login here</Link></p>
        </div>
      </div>
    </div>
  );
}
