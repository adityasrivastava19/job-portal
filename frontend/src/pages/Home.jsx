import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { Image, Calendar, Layout, FileText, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Home = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const textareaRef = React.useRef(null);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts/feed');
            setPosts(response.data);
        } catch (error) {
            toast.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image) return;

        setIsPosting(true);
        const formData = new FormData();
        formData.append('text', content);
        if (image) formData.append('image', image);

        try {
            await api.post('/posts', formData);
            setContent('');
            setImage(null);
            fetchPosts();
            toast.success('Post created successfully!');
        } catch (error) {
            toast.error('Failed to create post');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '225px 1fr 300px', gap: '24px' }}>
            {/* Sidebar Left */}
            <aside>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ height: '54px', background: 'var(--primary)', opacity: 0.8 }}></div>
                    <div style={{ marginTop: '-35px', padding: '0 12px 12px' }}>
                        <img
                            src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`}
                            alt="Profile"
                            style={{ width: '72px', height: '72px', borderRadius: '50%', border: '2px solid white', background: 'white' }}
                        />
                        <h3 style={{ marginTop: '12px' }}>{user?.username}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.bio || 'Professional'}</p>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', padding: '12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>Followers</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{user?.followers?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main>
                {/* Create Post */}
                <div className="card" style={{ padding: '12px 16px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <img src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                        <button
                            onClick={() => textareaRef.current?.focus()}
                            style={{
                                flex: 1,
                                textAlign: 'left',
                                padding: '0 16px',
                                borderRadius: '35px',
                                border: '1px solid var(--border)',
                                color: 'var(--text-muted)',
                                fontWeight: 500,
                                background: 'var(--background)'
                            }}
                        >
                            Start a post
                        </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <PostOption icon={<Image color="#378fe9" />} label="Photo" />
                        <PostOption icon={<Calendar color="#c37d16" />} label="Event" />
                        <PostOption icon={<Layout color="#e06847" />} label="Article" />
                    </div>

                    <form onSubmit={handlePostSubmit} style={{ marginTop: '1rem' }}>
                        <textarea
                            placeholder="What do you want to talk about?"
                            value={content}
                            ref={textareaRef}
                            onChange={(e) => setContent(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                border: 'none',
                                resize: 'none',
                                fontSize: '1rem',
                                padding: '8px 0'
                            }}
                        />
                        {image && <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Image selected: {image.name}</p>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                            <input
                                type="file"
                                id="post-image"
                                hidden
                                onChange={(e) => setImage(e.target.files[0])}
                            />
                            <label htmlFor="post-image" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <Image size={24} />
                            </label>
                            <button
                                type="submit"
                                disabled={isPosting || (!content.trim() && !image)}
                                style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontWeight: 600,
                                    opacity: (isPosting || !content.trim()) ? 0.5 : 1
                                }}
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </div>

                {/* Feed */}
                {loading ? (
                    <div className="flex-center" style={{ padding: '2rem' }}>Loading feed...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {posts.map(post => (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <PostCard post={post} onUpdate={fetchPosts} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Sidebar Right */}
            <aside>
                <div className="card" style={{ padding: '12px' }}>
                    <h4 style={{ marginBottom: '12px' }}>Mini LinkedIn News</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <NewsItem title="React is awesome" time="4h ago" readers="1,234 readers" />
                        <NewsItem title="Node.js 22 released" time="2h ago" readers="4,567 readers" />
                        <NewsItem title="AI is changing everything" time="1d ago" readers="10,000 readers" />
                    </ul>
                </div>
            </aside>
        </div>
    );
};

const PostOption = ({ icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }} className="hover-effect">
        {icon}
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
        <style>{`
      .hover-effect:hover { background: rgba(0,0,0,0.05); }
    `}</style>
    </div>
);

const NewsItem = ({ title, time, readers }) => (
    <li>
        <h5 style={{ fontSize: '0.85rem' }}>• {title}</h5>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '12px' }}>{time} • {readers}</p>
    </li>
);

export default Home;
