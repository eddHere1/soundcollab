import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Friends from './pages/Friends';
import Collabs from './pages/Collabs';
import Opportunities from './pages/Opportunities';
import Charts from './pages/Charts';
import CreatorDashboard from './pages/CreatorDashboard';
import Marketplace from './pages/Marketplace';
import PlaylistDetail from './pages/PlaylistDetail';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/library" element={<Library />} />
      <Route path="/library/playlist/:id" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
      <Route path="/collabs" element={<ProtectedRoute><Collabs /></ProtectedRoute>} />
      <Route path="/opportunities" element={<Opportunities />} />
      <Route path="/charts" element={<Charts />} />
      <Route path="/dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
      <Route path="/marketplace" element={<Marketplace />} />
    </Routes>
  );
}
