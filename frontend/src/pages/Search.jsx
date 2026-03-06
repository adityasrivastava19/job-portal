import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, UserCheck, Search as SearchIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Search = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const response = await api.get(`/users/search?query=${query}`);
                setUsers(response.data);
            } catch (error) {
                toast.error('Search failed');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const handleFollow = async (userId) => {
        try {
            await api.put(`/users/follow/${userId}`);
            // Refresh results to show new follow status
            const response = await api.get(`/users/search?query=${query}`);
            setUsers(response.data);
            toast.success('Action successful');
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    if (!query) return <div className="flex-center" style={{ height: '50vh' }}>Please enter a search term</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <SearchIcon size={24} />
                    Search results for "{query}"
                </h2>

                {loading ? (
                    <div className="flex-center" style={{ padding: '3rem' }}>Searching...</div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No users found matching your search.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {users.map(user => (
                            <div key={user._id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Link to={`/profile/${user._id}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                                    <img
                                        src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h4 style={{ fontSize: '1.05rem' }}>{user.username}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.bio || 'Professional'}</p>
                                    </div>
                                </Link>

                                {user._id !== currentUser?._id && (
                                    <button
                                        onClick={() => handleFollow(user._id)}
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            border: '1px solid var(--primary)',
                                            color: 'var(--primary)',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <UserPlus size={18} />
                                        Connect
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
