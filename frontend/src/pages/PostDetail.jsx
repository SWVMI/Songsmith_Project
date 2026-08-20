import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      API.get(`/posts/${postId}`),
      API.get('/applications?type=sent'),
    ])
      .then(([postRes, appsRes]) => {
        if (cancelled) return;
        setPost(postRes.data);
        setAnswers((postRes.data.applicationQuestions || []).map(q => ({ question: q, answer: '' })));
        setAlreadyApplied(appsRes.data.some(a => a.post?._id === postId || a.post === postId));
      })
      .catch(() => { if (!cancelled) setLoadError('Failed to load this post.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [postId]);

  if (loading) {
    return <div className="w-full flex items-center justify-center py-32 text-zinc-500 gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  if (loadError || !post) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 py-20 text-center text-rose-300 text-xs font-mono">
        {loadError || 'Post not found.'}
      </div>
    );
  }

  const isOwner = post.creator?._id === user?.id;
  const isOpen = post.status === 'Open';
  const canApply = !!user?.categories?.includes(post.requiredCategory);

  const handleAnswerChange = (i, value) => {
    const next = [...answers];
    next[i] = { ...next[i], answer: value };
    setAnswers(next);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      await API.post('/applications', { postId: post._id, answers });
      setSuccessMsg('Application submitted! You can track its status in Contracts.');
      setAlreadyApplied(true);
      toast.success('Application sent to the post creator.');
      setTimeout(() => navigate('/contracts'), 1400);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseApplications = async () => {
    setClosing(true);
    try {
      const res = await API.patch(`/posts/${post._id}/close`);
      setPost(res.data);
      setShowCloseConfirm(false);
      toast.success('Applications closed for this post.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close applications.');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-16 font-mono text-xs">
      <button onClick={() => navigate('/explore')} className="flex items-center gap-2 text-zinc-500 hover:text-amber-400 mb-8 uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </button>

      <div className="bg-zinc-900 border border-zinc-800 p-8 relative mb-8">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400" />
        <span className="bg-zinc-950 border border-zinc-800 text-amber-400 px-2.5 py-1 text-[10px] uppercase inline-block mb-4">
          Needed: {post.requiredCategory}
        </span>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{post.title}</h2>
        <p className="text-zinc-500 mb-6">Posted by {post.creator?.username || 'Unknown'}</p>
        <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap mb-4">{post.description}</p>
        {post.additionalRequirements && (
          <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap border-t border-zinc-800 pt-4 mt-4">
            <span className="text-amber-400 uppercase">Additional requirements:</span> {post.additionalRequirements}
          </p>
        )}
      </div>

      {isOwner ? (
        <div className="bg-zinc-900 border border-zinc-800 p-6 text-zinc-400 space-y-4">
          <p>
            This is your own post. Review incoming applications from your <Link to="/contracts" className="text-amber-400 underline">Contracts inbox</Link>.
          </p>
          {isOpen ? (
            <button
              onClick={() => setShowCloseConfirm(true)}
              className="bg-zinc-950 border border-rose-900/50 hover:border-rose-500/60 text-rose-300 px-4 py-2.5 uppercase font-bold tracking-wider transition"
            >
              Close Applications
            </button>
          ) : (
            <p className="text-zinc-500 uppercase text-[10px]">This post is closed and no longer accepting applications.</p>
          )}
        </div>
      ) : alreadyApplied ? (
        <div className="bg-emerald-950/30 border border-emerald-900/40 p-6 text-emerald-300">
          You've already applied to this post. Check <Link to="/contracts" className="text-emerald-200 underline">Contracts</Link> for the status.
        </div>
      ) : !isOpen ? (
        <div className="bg-zinc-900 border border-zinc-800 p-6 text-zinc-400">
          This collaboration opportunity is no longer accepting applications.
        </div>
      ) : !canApply ? (
        <div className="bg-rose-950/40 border border-rose-900/50 p-6 text-rose-300">
          You can't connect here because your profile doesn't include the required category ("{post.requiredCategory}").
          You can add it from your <Link to="/profile/edit" className="text-amber-300 underline">profile settings</Link> if it applies to you.
        </div>
      ) : !showApplyForm ? (
        <button onClick={() => setShowApplyForm(true)} className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 py-4 font-bold uppercase tracking-wider transition">
          Connect →
        </button>
      ) : (
        <div className="bg-zinc-900 border border-zinc-700 p-8 relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400" />
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Application Form</h3>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /><span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitApplication} className="space-y-4">
            {answers.length === 0 ? (
              <p className="text-zinc-500">This post creator didn't require any specific questions — just hit submit to connect.</p>
            ) : (
              answers.map((a, i) => (
                <div key={i}>
                  <label className="block text-zinc-400 uppercase mb-2">{a.question}</label>
                  <textarea rows="2" value={a.answer} onChange={e => handleAnswerChange(i, e.target.value)} required className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white resize-none" />
                </div>
              ))
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowApplyForm(false)} className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-4 py-2.5 uppercase font-bold">Cancel</button>
              <button type="submit" disabled={submitting} className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 px-6 py-2.5 uppercase font-bold">
                {submitting ? 'Sending...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50">
          <div className="bg-zinc-900 border border-zinc-700 p-8 max-w-md w-full relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4">Close this post?</h3>
            <p className="text-zinc-400 leading-relaxed mb-6">
              This will permanently stop new applications for this post. Pending applications that have not been accepted or rejected will no longer be active. Existing conversations will remain available. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                disabled={closing}
                className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-4 py-2.5 uppercase font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseApplications}
                disabled={closing}
                className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white px-4 py-2.5 uppercase font-bold transition"
              >
                {closing ? 'Closing...' : 'Close Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
