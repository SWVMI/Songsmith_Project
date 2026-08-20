import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-16 font-mono text-xs">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <span className="text-amber-400 uppercase tracking-widest">[Your Profile]</span>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-1">Profile</h2>
      </div>

      <div className="bg-zinc-900 border border-amber-400/40 p-8 relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400" />

        <div className="space-y-6">
          <div>
            <p className="text-zinc-500 uppercase mb-1">Username</p>
            <p className="text-white text-xl font-bold">{user.username}</p>
          </div>
          <div>
            <p className="text-zinc-500 uppercase mb-1">Email</p>
            <p className="text-zinc-300">{user.email}</p>
          </div>
          <div>
            <p className="text-zinc-500 uppercase mb-2">Skills, in order of proficiency</p>
            {user.categories.length === 0 ? (
              <p className="text-zinc-600">No categories selected yet.</p>
            ) : (
              <ol className="space-y-2">
                {user.categories.map((cat, i) => (
                  <li key={cat} className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-3 py-2">
                    <span className="bg-amber-400 text-zinc-950 px-2 py-0.5 text-[10px] font-black">#{i + 1}</span>
                    <span className="text-amber-300 font-bold">{cat}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <Link to="/profile/edit" className="mt-8 inline-block bg-amber-400 hover:bg-amber-300 text-zinc-950 px-6 py-3 font-bold uppercase tracking-wider transition">
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
