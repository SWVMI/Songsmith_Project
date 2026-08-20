import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../utils/api';

export default function Contracts() {
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      API.get('/applications?type=incoming'),
      API.get('/applications?type=sent'),
      API.get('/conversations'),
    ])
      .then(([incRes, sentRes, convRes]) => {
        setIncoming(incRes.data);
        setSent(sentRes.data);
        setConversations(convRes.data);
      })
      .catch(() => setErrorMsg('Failed to load your contracts and applications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);


  const activeIncoming = incoming.filter(app => !(app.status === 'Rejected' && app.post?.status === 'Closed'));

  const handleReview = async (id, status) => {
    try {
      const res = await API.patch(`/applications/${id}`, { status });
      setIncoming(prev => prev.map(a => a._id === id ? res.data.application : a));
      if (status === 'Accepted') {
        toast.success('Application accepted — a conversation has been opened.');
      } else {
        toast('Application rejected.');
      }
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update this application.');
    }
  };

  const statusBadge = (status) => (
    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold flex items-center gap-1 ${status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400' : status === 'Rejected' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
      {status === 'Accepted' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'Rejected' && <XCircle className="w-3 h-3" />}
      {status === 'Pending' && <Clock className="w-3 h-3" />}
      {status}
    </span>
  );

  if (loading) {
    return <div className="w-full flex items-center justify-center py-32 text-zinc-500 gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-16 font-mono text-xs">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <span className="text-amber-400 uppercase tracking-widest">[Inbox, Status & DMs]</span>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-1">Contracts</h2>
      </div>

      {errorMsg && <div className="mb-8 p-4 bg-rose-950/60 border border-rose-500/40 text-rose-300">{errorMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-8">

          <div className="bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-sm font-bold text-white uppercase mb-4 tracking-wider text-amber-400">Incoming Applications (Your Posts)</h3>
            {activeIncoming.length === 0 ? (
              <p className="text-zinc-500 py-4">No incoming applications for your posts yet.</p>
            ) : (
              <div className="space-y-4">
                {activeIncoming.map(app => (
                  <div key={app._id} className="bg-zinc-950 border border-zinc-800 p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-300 font-bold">{app.applicant?.username}</span>
                      {statusBadge(app.status)}
                    </div>
                    <p className="text-zinc-300">Post: {app.post?.title}</p>
                    <p className="text-zinc-500">Applicant categories: {app.applicant?.categories?.join(', ')}</p>
                    {app.answers?.length > 0 && (
                      <div className="space-y-1 bg-zinc-900 p-2.5">
                        {app.answers.map((a, i) => (
                          <p key={i} className="text-zinc-400"><span className="text-zinc-600">{a.question}:</span> {a.answer}</p>
                        ))}
                      </div>
                    )}
                    {app.status === 'Pending' && (
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => handleReview(app._id, 'Accepted')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 font-bold uppercase transition">Accept & Open DM</button>
                        <button onClick={() => handleReview(app._id, 'Rejected')} className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 font-bold uppercase transition">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-sm font-bold text-white uppercase mb-4 tracking-wider text-amber-400">My Sent Applications</h3>
            {sent.length === 0 ? (
              <p className="text-zinc-500 py-4">You haven't applied to any posts yet.</p>
            ) : (
              <div className="space-y-3">
                {sent.map(app => (
                  <div key={app._id} className="bg-zinc-950 border border-zinc-800 p-4 flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">{app.post?.title}</p>
                      <p className="text-zinc-500 text-[10px]">Owner: {app.postCreator?.username}</p>
                    </div>
                    {statusBadge(app.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 p-6">
          <h3 className="text-sm font-bold text-white uppercase mb-4 tracking-wider text-amber-400">Active Conversations</h3>
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 text-zinc-600 space-y-2">
              <MessageSquare className="w-8 h-8 opacity-40" />
              <p className="uppercase tracking-widest text-[11px]">No active DMs.</p>
              <p className="text-[10px] text-zinc-500 max-w-xs">A DM opens automatically once an application is accepted.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map(c => (
                <Link key={c._id} to={`/contracts/${c._id}`} className="block bg-zinc-950 border border-zinc-800 hover:border-amber-400/40 p-4 transition">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-300 font-bold">{c.post?.title}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">{c.status}</span>
                  </div>
                  <p className="text-zinc-500 text-[10px]">Owner: {c.creator?.username} · Applicant: {c.applicant?.username}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
