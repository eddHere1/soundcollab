import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-600/20 text-brand-300' : 'text-dark-300 hover:text-white hover:bg-dark-800'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-dark-700 bg-dark-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-xl font-bold tracking-tight">
          <span className="text-brand-400">Sound</span>Collab
        </Link>

        {user ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" className={navLinkClass} end>Feed</NavLink>
            <NavLink to="/create" className={navLinkClass}>Upload</NavLink>
            <NavLink to="/marketplace" className={navLinkClass}>Beats</NavLink>
            <NavLink to="/collabs" className={navLinkClass}>Collabs</NavLink>
            <NavLink to="/messages" className={navLinkClass}>Messages</NavLink>
            <NavLink to={`/profile/${user.id}`} className={navLinkClass}>Profile</NavLink>
            <button onClick={handleLogout} className="btn-ghost ml-2 text-xs">Logout</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn-ghost">Login</Link>
            <Link to="/register" className="btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
