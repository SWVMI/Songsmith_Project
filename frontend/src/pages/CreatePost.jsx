import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, X } from 'lucide-react';
import API from '../utils/api';
import { CATEGORIES } from '../constants/categories';

export default function CreatePost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [questions, setQuestions] = useState(['']);

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateQuestion = (i, value) => {
    const next = [...questions];
    next[i] = value;
    setQuestions(next);
  };

  const addQuestion = () => setQuestions([...questions, '']);
  const removeQuestion = (i) => setQuestions(questions.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Title and description are required.');
      return;
    }

    const finalCategory = category === 'Other' ? customCategory.trim() : category;
    if (!finalCategory) {
      setErrorMsg('Please select or specify a required category.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/posts', {
        title: title.trim(),
        description: description.trim(),
        requiredCategory: finalCategory,
        additionalRequirements: additionalRequirements.trim(),
        applicationQuestions: questions.map(q => q.trim()).filter(Boolean),
      });
      navigate(`/explore/${res.data._id}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish post.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-16 font-mono text-xs">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <span className="text-amber-400 uppercase tracking-widest">[New Collaboration Post]</span>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-1">Post a Requirement</h2>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 space-y-6">
        <div>
          <label className="block text-zinc-400 uppercase mb-2">Title</label>
          <input type="text" placeholder="e.g., Looking for a Guitarist for Indie Project" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white" />
        </div>

        <div>
          <label className="block text-zinc-400 uppercase mb-2">Description</label>
          <textarea rows="4" placeholder="Describe what you're looking for..." value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white resize-none" />
        </div>

        <div>
          <label className="block text-zinc-400 uppercase mb-2">Required Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white">
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            <option value="Other">Other (custom)</option>
          </select>
        </div>

        {category === 'Other' && (
          <div>
            <label className="block text-zinc-400 uppercase mb-2">Specify custom category</label>
            <input type="text" placeholder="e.g., Sitar Player" value={customCategory} onChange={e => setCustomCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white" />
          </div>
        )}

        <div>
          <label className="block text-zinc-400 uppercase mb-2">Additional requirements (optional)</label>
          <input type="text" placeholder="e.g., Remote OK, must be available weekends" value={additionalRequirements} onChange={e => setAdditionalRequirements(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white" />
        </div>

        <div>
          <label className="block text-zinc-400 uppercase mb-2">Application questions (optional)</label>
          <p className="text-zinc-600 mb-3">Applicants will be asked to answer these when they connect.</p>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" placeholder="e.g., What is your availability?" value={q} onChange={e => updateQuestion(i, e.target.value)} className="flex-grow bg-zinc-950 border border-zinc-800 p-3 text-white" />
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(i)} className="text-zinc-500 hover:text-rose-400 p-2"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addQuestion} className="mt-3 flex items-center gap-2 text-amber-400 hover:text-amber-300 uppercase font-bold">
            <Plus className="w-4 h-4" /> Add question
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <button type="button" onClick={() => navigate('/explore')} className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-4 py-2.5 uppercase font-bold">Cancel</button>
          <button type="submit" disabled={submitting} className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 px-6 py-2.5 uppercase font-bold">
            {submitting ? 'Publishing...' : 'Publish to Explore'}
          </button>
        </div>
      </form>
    </div>
  );
}
