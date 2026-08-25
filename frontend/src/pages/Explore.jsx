import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Search } from 'lucide-react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/categories';

const formatPostedAt = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function Explore() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadPosts = useCallback((q, category) => {
    setLoading(true);
    const params = {};
    if (q && q.trim()) params.q = q.trim();
    if (category) params.category = category;

    API.get('/posts', { params })
      .then(res => setPosts(res.data))
      .catch(() => setErrorMsg('Failed to load collaboration posts. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadPosts('', ''); }, [loadPosts]);

  useEffect(() => {
    const handle = setTimeout(() => loadPosts(search, categoryFilter), 350);
    return () => clearTimeout(handle);
  }, [search, categoryFilter]);

  const myCategories = user?.categories || [];

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-16 font-mono text-xs">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-zinc-800 pb-6 gap-4">
        <div>
          <span className="text-amber-400 uppercase tracking-widest">[Live Collaboration Board]</span>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight mt-1">Explore</h2>
          <p className="text-zinc-400 mt-2">Your categories: <span className="text-amber-400">{myCategories.join(', ') || 'None selected'}</span></p>
        </div>
        <Link to="/create-post" className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-5 py-3 font-bold uppercase tracking-wider transition flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Post Requirement
        </Link>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 px-3 py-3 text-white focus:outline-none focus:border-amber-400 sm:w-56"
        >
          <option value="">All skills needed</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">{errorMsg}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-zinc-500 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-16 text-center text-zinc-500 font-mono space-y-3">
          <p className="text-sm uppercase tracking-wider">
            {search || categoryFilter ? 'No posts match your search or filter.' : 'No collaboration opportunities available yet.'}
          </p>
          <p className="text-xs text-zinc-600">
            {search || categoryFilter ? 'Try a different keyword or clear the filter.' : 'Publish a requirement above to start receiving applications.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((p) => {
            const canApply = myCategories.includes(p.requiredCategory);
            const isOwner = p.creator?._id === user?.id;

            return (
              <Link
                key={p._id}
                to={`/explore/${p._id}`}
                className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between hover:border-amber-400/50 transition relative group"
              >
                <div className="absolute top-0 right-0 w-2 h-2 bg-zinc-800 group-hover:bg-amber-400 transition" />
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-zinc-950 border border-zinc-800 text-amber-400 px-2.5 py-1 text-[10px] uppercase">Needed: {p.requiredCategory}</span>
                    {p.status !== 'Open' && (
                      <span className="text-[10px] text-zinc-500 uppercase">{p.status}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">{p.title}</h3>
                  <p className="text-xs text-zinc-400 mb-4 line-clamp-3">{p.description}</p>
                  <p className="text-[11px] text-zinc-500 mb-1">Posted by {p.creator?.username || 'Unknown'}</p>
                  <p className="text-[10px] text-zinc-600 mb-4">{formatPostedAt(p.createdAt)}</p>

                  {isOwner ? (
                    <div className="bg-zinc-950 border border-zinc-800 p-2.5 text-[10px] text-zinc-400 text-center">
                      Your published post
                    </div>
                  ) : p.status !== 'Open' ? (
                    <div className="bg-zinc-950 border border-zinc-800 p-2.5 text-[10px] text-zinc-500 text-center">
                      No longer accepting applications
                    </div>
                  ) : !canApply ? (
                    <div className="bg-rose-950/40 border border-rose-900/50 p-2.5 text-[10px] text-rose-300">
                      Requires category "{p.requiredCategory}"
                    </div>
                  ) : (
                    <div className="bg-emerald-950/20 border border-emerald-900/30 p-2.5 text-[10px] text-emerald-300 text-center">
                      You are eligible to connect →
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}