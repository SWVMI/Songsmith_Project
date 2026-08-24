import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import Register from './pages/Register';
import Login from './pages/Login';
import Explore from './pages/Explore';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import AiCowriter from './pages/AiCowriter';
import Contracts from './pages/Contracts';
import ConversationDetail from './pages/ConversationDetail';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <main className="flex-grow flex flex-col">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Authenticated */}
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/explore/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
          <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />

          <Route path="/ai-cowriter" element={<ProtectedRoute><AiCowriter /></ProtectedRoute>} />
          <Route path="/ai-cowriter/:conversationId" element={<ProtectedRoute><AiCowriter /></ProtectedRoute>} />

          <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
          <Route path="/contracts/:id" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />

          {/* Fallback: send anything unknown back to the landing page */}
          <Route path="*" element={<Index />} />
        </Routes>
      </main>
    </div>
  );
}
