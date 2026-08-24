import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disc, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-4 sm:px-8 py-4 sm:py-6 sticky top-0 z-50 font-mono">
      <div className="flex justify-between items-center">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3 sm:gap-4 group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition shadow-md shrink-0">
            <Disc className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black tracking-widest text-white uppercase block">SONGSMITH</span>
            <span className="text-[10px] sm:text-[11px] text-zinc-500 uppercase tracking-wider hidden sm:block">Collaboration Hub</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-base text-zinc-300 uppercase tracking-wider font-semibold">
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

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden text-zinc-300 hover:text-amber-400 transition p-1"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-2 flex flex-col gap-1 text-sm text-zinc-300 uppercase tracking-wider font-semibold border-t border-zinc-800 pt-4">
          {isLoggedIn ? (
            <>
              <Link to="/explore" onClick={closeMenu} className="py-3 hover:text-amber-400 transition">Explore</Link>
              <Link to="/ai-cowriter" onClick={closeMenu} className="py-3 hover:text-amber-400 transition">AI Co-Writer</Link>
              <Link to="/contracts" onClick={closeMenu} className="py-3 hover:text-amber-400 transition">DMs / Contracts</Link>
              <Link to="/profile" onClick={closeMenu} className="py-3 hover:text-amber-400 transition">Profile</Link>
              <button onClick={handleLogout} className="py-3 text-left text-rose-400 hover:text-rose-300 transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="py-3 hover:text-amber-400 transition">Login</Link>
              <Link to="/register" onClick={closeMenu} className="py-3 text-amber-400 font-bold">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
