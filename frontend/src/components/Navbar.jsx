import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, LogOut, Search, Bell, MessageSquare, Linkedin } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="glass" style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1000,
            padding: '0 1rem'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                    <Linkedin size={32} />
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Outfit' }}>Mini LinkedIn</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div className="search-bar" style={{
                        background: 'var(--background)',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '280px'
                    }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search"
                            style={{ border: 'none', background: 'none', width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)' }}>
                        <Link to="/" className="nav-icon" title="Home"><Home /></Link>
                        <Link to="/network" className="nav-icon" title="My Network"><Search /></Link>
                        <Link to="/messages" className="nav-icon" title="Messaging"><MessageSquare /></Link>
                        <Link to="/notifications" className="nav-icon" title="Notifications"><Bell /></Link>
                        <Link to={`/profile/${user._id}`} className="nav-icon" title="Profile">
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt="Profile"
                                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <User />
                            )}
                        </Link>
                        <button onClick={handleLogout} className="nav-icon" title="Logout" style={{ color: 'var(--error)' }}>
                            <LogOut />
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
        .nav-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: color var(--transition-fast);
        }
        .nav-icon:hover {
          color: var(--text-main);
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
