import { Link, useNavigate } from 'react-router-dom';
import { Disc } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-8 py-6 flex justify-between items-center sticky top-0 z-50 font-mono">
      <Link to="/" className="flex items-center gap-4 group">
        <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition shadow-md">
          <Disc className="w-7 h-7" />
        </div>
        <div>
          <span className="text-lg font-black tracking-widest text-white uppercase block">SONGSMITH</span>
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Collaboration Hub</span>
        </div>
      </Link>
      <div className="flex items-center gap-8 text-base text-zinc-300 uppercase tracking-wider font-semibold">
        {isLoggedIn ? (
          <>
            <Link to="/explore" className="hover:text-amber-400 transition">Explore</Link>
            <Link to="/ai-cowriter" className="hover:text-amber-400 transition">AI Co-Writer</Link>
            <Link to="/contracts" className="hover:text-amber-400 transition">DMs / Contracts</Link>
            <Link to="/profile" className="hover:text-amber-400 transition">Profile</Link>
            <div className="h-6 w-[1px] bg-zinc-800" />
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 transition">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-amber-400 transition">Login</Link>
            <Link to="/register" className="bg-amber-400 text-zinc-950 px-5 py-2.5 font-bold hover:bg-amber-300 transition">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
