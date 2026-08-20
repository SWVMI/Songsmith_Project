import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['Accepted', 'In Discussion', 'Booked', 'Completed', 'Closed', 'Cancelled'];
const CLOSED_STATUSES = ['Completed', 'Closed', 'Cancelled'];

export default function ConversationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = () => {
    API.get(`/conversations/${id}`)
      .then(res => {
        setConversation(res.data.conversation);
        setMessages(res.data.messages);
      })
      .catch(() => setLoadError('Failed to load this conversation.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const isClosed = conversation && CLOSED_STATUSES.includes(conversation.status);
  const otherUser = conversation && (conversation.creator?._id === user?.id ? conversation.applicant : conversation.creator);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || isClosed) return;
    setSending(true);
    try {
      const res = await API.post(`/conversations/${id}/messages`, { content: draft.trim() });
      setMessages(prev => [...prev, res.data]);
      setDraft('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await API.patch(`/conversations/${id}/status`, { status });
      setConversation(res.data);
      toast.success(`Contract status updated to ${status}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return <div className="w-full flex items-center justify-center py-32 text-zinc-500 gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  if (loadError || !conversation) {
    return <div className="w-full max-w-2xl mx-auto px-6 py-20 text-center text-rose-300 text-xs font-mono">{loadError || 'Conversation not found.'}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-16 font-mono text-xs flex flex-col">
      <Link to="/contracts" className="flex items-center gap-2 text-zinc-500 hover:text-amber-400 mb-6 uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" /> Back to Contracts
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 p-6 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-amber-400 uppercase tracking-widest text-[10px] mb-1">{conversation.post?.title}</p>
          <p className="text-white font-bold">Conversation with {otherUser?.username}</p>
        </div>
        {conversation.creator?._id === user?.id ? (
  <select
    value={conversation.status}
    onChange={e => handleStatusChange(e.target.value)}
    className="bg-zinc-950 border border-zinc-800 p-2 text-white"
  >
    {STATUS_OPTIONS.map(s => (
      <option key={s} value={s}>
        {s}
      </option>
    ))}
  </select>
) : (
  <span className="bg-zinc-950 border border-zinc-800 p-2 text-zinc-400 uppercase">
    {conversation.status}
  </span>
)}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col h-[500px]">
        <div className="flex-grow overflow-y-auto space-y-3 mb-4 pr-2">
          {messages.length === 0 ? (
            <p className="text-zinc-600 text-center py-8">No messages yet — say hello and discuss the collaboration terms.</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender?._id === user?.id;
              return (
                <div key={m._id} className={`p-3 max-w-md border ${mine ? 'bg-zinc-950 border-amber-400/40 text-amber-200 ml-auto' : 'bg-zinc-950 border-zinc-800 text-zinc-300'}`}>
                  <div className="text-[9px] text-zinc-500 uppercase mb-1">{mine ? 'You' : m.sender?.username}</div>
                  {m.content}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {isClosed ? (
          <div className="text-center py-3 text-zinc-600 border border-zinc-800 bg-zinc-950 uppercase tracking-widest text-[10px]">
            This contract is {conversation.status.toLowerCase()}. Messaging is locked.
          </div>
        ) : (
          <form onSubmit={handleSend} className="relative">
            <input type="text" placeholder="Discuss collaboration terms..." value={draft} onChange={e => setDraft(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:outline-none focus:border-amber-400 pr-12" />
            <button type="submit" disabled={sending} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 disabled:opacity-40"><Send className="w-4 h-4" /></button>
          </form>
        )}
      </div>
    </div>
  );
}
