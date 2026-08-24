import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      setSuccessMsg('Login successful. Entering the hub...');
      setTimeout(() => {
        navigate('/explore');
      }, 600);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid credentials provided.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-20 font-mono">
      <div className="bg-zinc-900 border border-zinc-800 p-8 lg:p-10 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400" />

        <div className="mb-8">
          <span className="text-xs text-amber-400 uppercase tracking-widest">[Authentication]</span>
          <h2 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight mt-1">Login</h2>
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

        <form onSubmit={handleLogin} className="space-y-6 text-xs lg:text-sm">
          <div>
            <label className="block text-zinc-400 uppercase mb-2">Email</label>
            <input type="email" placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-zinc-400 uppercase mb-2">Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-amber-400" />
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 py-4 font-bold uppercase tracking-wider transition text-sm">
            {submitting ? 'Authorizing...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500 border-t border-zinc-800 pt-4">
          <p>Need to create a profile? <Link to="/register" className="text-amber-400 underline">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}
