import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function Index() {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-28 flex flex-col items-start justify-center font-mono">
      <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs uppercase tracking-widest mb-8">
        <span className="w-2 h-2 bg-amber-400 animate-pulse" />
        <span>Independent Music Network & Hub</span>
      </div>

      <h1 className="text-6xl lg:text-9xl font-black tracking-tighter text-white uppercase max-w-5xl mb-8 leading-[0.95]">
        Raw sound. <br />
        <span className="text-amber-400">Zero corporate noise.</span>
      </h1>

      <p className="text-zinc-400 text-lg lg:text-xl max-w-2xl font-mono leading-relaxed mb-12 border-l-2 border-zinc-800 pl-6">
        The direct underground bridge for independent singers, songwriters, and session instrumentalists. Register your profile, apply to matching posts, unlock gated contracts, and query the standalone AI Co-Writer at any time.
      </p>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
        <Link to="/register" className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-8 py-5 text-sm font-bold uppercase tracking-wider text-center transition flex items-center justify-center gap-3 shadow-lg shadow-amber-400/10">
          <span>Register Profile</span> <ArrowUpRight className="w-5 h-5" />
        </Link>
        <Link to="/login" className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-8 py-5 text-sm font-bold uppercase tracking-wider text-center transition">
          Login to Station
        </Link>
      </div>
    </div>
  );
}