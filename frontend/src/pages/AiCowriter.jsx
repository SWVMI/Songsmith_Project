import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Send, Plus, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../utils/api';

export default function AiCowriter() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadList = () => {
    setLoadingList(true);
    API.get('/ai/conversations')
      .then(res => setConversations(res.data))
      .catch(() => toast.error('Failed to load your AI conversations.'))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => { loadList(); }, []);

  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null);
      return;
    }
    setLoadingConversation(true);
    API.get(`/ai/conversations/${conversationId}`)
      .then(res => setActiveConversation(res.data))
      .catch(() => toast.error('Failed to load that conversation.'))
      .finally(() => setLoadingConversation(false));
  }, [conversationId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeConversation]);

  const handleNewConversation = async () => {
    try {
      const res = await API.post('/ai/conversations');
      setConversations(prev => [{ _id: res.data._id, title: res.data.title, updatedAt: res.data.updatedAt }, ...prev]);
      navigate(`/ai-cowriter/${res.data._id}`);
    } catch (err) {
      toast.error('Failed to start a new conversation.');
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await API.delete(`/ai/conversations/${id}`);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (conversationId === id) navigate('/ai-cowriter');
    } catch (err) {
      toast.error('Failed to delete conversation.');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;
    const text = input;
    setInput('');
    setSending(true);
    try {
      const res = await API.post(`/ai/conversations/${conversationId}/messages`, { content: text });
      setActiveConversation(res.data);
      setConversations(prev => prev.map(c => c._id === res.data._id ? { ...c, title: res.data.title, updatedAt: res.data.updatedAt } : c));
    } catch (err) {
      toast.error(err.response?.data?.message || 'The AI Co-Writer ran into an error.');
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-16 font-mono text-xs flex-grow flex flex-col">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <span className="text-amber-400 uppercase tracking-widest">[Standalone Utility]</span>
        <h2 className="text-4xl font-black text-white uppercase tracking-tight mt-1">AI Co-Writer</h2>
        <p className="text-zinc-400 mt-1">Songwriting-focused chat, completely separate from your collaboration DMs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-grow">
        <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 p-4 flex flex-col">
          <button onClick={handleNewConversation} className="w-full mb-4 bg-amber-400 hover:bg-amber-300 text-zinc-950 py-2.5 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> New Chat
          </button>
          {loadingList ? (
            <div className="flex items-center justify-center py-8 text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" /></div>
          ) : conversations.length === 0 ? (
            <p className="text-zinc-600 text-center py-6">No conversations yet.</p>
          ) : (
            <div className="space-y-2 overflow-y-auto">
              {conversations.map(c => (
                <button
                  key={c._id}
                  onClick={() => navigate(`/ai-cowriter/${c._id}`)}
                  className={`w-full text-left px-3 py-2.5 border flex items-center justify-between gap-2 transition ${conversationId === c._id ? 'bg-amber-400/10 border-amber-400 text-amber-300' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                >
                  <span className="truncate">{c.title}</span>
                  <Trash2 className="w-3.5 h-3.5 shrink-0 text-zinc-600 hover:text-rose-400" onClick={(e) => handleDelete(c._id, e)} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-3 bg-zinc-900 border border-zinc-800 p-6 flex flex-col h-[550px]">
          {!conversationId ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-zinc-600 gap-3">
              <Sparkles className="w-8 h-8 opacity-40" />
              <p className="uppercase tracking-widest text-[11px]">Select or start a conversation to begin.</p>
            </div>
          ) : loadingConversation || !activeConversation ? (
            <div className="flex-grow flex items-center justify-center text-zinc-500 gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
          ) : (
            <>
              <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2">
                {activeConversation.messages.length === 0 ? (
                  <p className="text-zinc-600 text-center py-8">Ask for rhymes, chord progressions, song structure ideas, or help pushing past writer's block.</p>
                ) : (
                  activeConversation.messages.map((m, i) => (
                    <div key={i} className={`p-4 max-w-xl border ${m.role === 'user' ? 'bg-zinc-950 border-amber-400/40 text-amber-200 ml-auto' : 'bg-zinc-950 border-zinc-800 text-zinc-300'}`}>
                      <div className="text-[10px] text-zinc-500 uppercase mb-1">{m.role === 'user' ? 'You' : 'AI Co-Writer'}</div>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  placeholder="Ask for song hooks, chord charts, or lyrical variations..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={sending}
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:outline-none focus:border-amber-400 pr-12 text-xs"
                />
                <button type="submit" disabled={sending} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 disabled:opacity-40">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
