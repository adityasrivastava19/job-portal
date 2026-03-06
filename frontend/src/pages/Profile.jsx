import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { Edit2, Camera, MapPin, Link as LinkIcon, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser, setUser: setCurrentUser } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [profileFile, setProfileFile] = useState(null);

    const isOwnProfile = !id || id === currentUser?._id;
    const profileId = id || currentUser?._id;

    const fetchProfile = async () => {
        try {
            const [userRes, postsRes] = await Promise.all([
                api.get(`/users/profile/${profileId}`),
                api.get(`/posts/user/${profileId}`)
            ]);
            setProfileUser(userRes.data);
            setPosts(userRes.data.posts || postsRes.data);
            setEditData(userRes.data);
        } catch (error) {
            toast.error('Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id, profileId]);

    const handleFollow = async () => {
        try {
            await api.put(`/users/follow/${profileId}`);
            fetchProfile();
            toast.success(profileUser.followers.includes(currentUser._id) ? 'Unfollowed' : 'Following');
        } catch (error) {
            toast.error('Failed to update follow status');
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setProfileFile(e.target.files[0]);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', editData.username);
        formData.append('bio', editData.bio);
        if (profileFile) {
            formData.append('profilePicture', profileFile);
        }

        try {
            const response = await api.put('/users/profile', formData);
            setProfileUser(response.data);
            if (isOwnProfile) setCurrentUser(response.data);
            setIsEditing(false);
            setProfileFile(null);
            toast.success('Profile updated');
        } catch (error) {
            toast.error('Update failed');
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading profile...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ height: '200px', background: 'linear-gradient(90deg, #0a66c2 0%, #004182 100%)' }}></div>
                <div style={{ padding: '0 24px 24px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-80px', left: '24px' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={profileUser.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username || 'user'}`}
                                style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid white', background: 'white', objectFit: 'cover' }}
                            />
                            {isOwnProfile && isEditing && (
                                <label htmlFor="profile-upload" style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '8px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: 'var(--shadow-md)'
                                }}>
                                    <Camera size={20} />
                                    <input
                                        type="file"
                                        id="profile-upload"
                                        hidden
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                        {isOwnProfile ? (
                            <button
                                onClick={() => {
                                    setIsEditing(!isEditing);
                                    setProfileFile(null);
                                }}
                                style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600 }}
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        ) : (
                            <button
                                onClick={handleFollow}
                                style={{
                                    padding: '8px 24px',
                                    borderRadius: '20px',
                                    background: profileUser.followers?.some(f => (f._id || f) === currentUser?._id) ? 'transparent' : 'var(--primary)',
                                    color: profileUser.followers?.some(f => (f._id || f) === currentUser?._id) ? 'var(--text-muted)' : 'white',
                                    border: profileUser.followers?.some(f => (f._id || f) === currentUser?._id) ? '1px solid var(--text-muted)' : 'none',
                                    fontWeight: 600
                                }}
                            >
                                {profileUser.followers?.some(f => (f._id || f) === currentUser?._id) ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        <h1 style={{ fontSize: '1.5rem' }}>{profileUser.username}</h1>
                        <p style={{ fontSize: '1rem', marginTop: '4px' }}>{profileUser.bio || 'Professional'}</p>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> Bengaluru, India</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={16} /> {profileUser.followers?.length || 0} followers</span>
                        </div>
                    </div>
                </div>
            </div>

            {isEditing && (
                <form onSubmit={handleUpdate} className="card" style={{ padding: '24px', marginBottom: '1.5rem' }}>
                    <h3>Edit Profile</h3>
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                        <input
                            placeholder="Username"
                            value={editData.username}
                            onChange={e => setEditData({ ...editData, username: e.target.value })}
                            style={inputStyle}
                        />
                        <textarea
                            placeholder="Bio"
                            value={editData.bio}
                            onChange={e => setEditData({ ...editData, bio: e.target.value })}
                            style={{ ...inputStyle, minHeight: '80px', resize: 'none' }}
                        />
                        {profileFile && <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>New picture selected: {profileFile.name}</p>}
                        <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '20px', fontWeight: 600 }}>
                            Save Changes
                        </button>
                    </div>
                </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3>Activity</h3>
                {posts.length === 0 ? (
                    <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No posts yet.
                    </div>
                ) : (
                    posts.map(post => <PostCard key={post._id} post={post} onUpdate={fetchProfile} />)
                )}
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)'
};

export default Profile;
