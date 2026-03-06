import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageCircle, Share2, Send, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const PostCard = ({ post, onUpdate }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const isLiked = post.likes?.includes(user?._id);

    const handleLike = async () => {
        try {
            await api.put(`/posts/like/${post._id}`);
            onUpdate();
        } catch (error) {
            toast.error('Failed to like post');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await api.post(`/posts/comment/${post._id}`, { text: commentText });
            setCommentText('');
            onUpdate();
            toast.success('Comment added');
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    return (
        <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <img
                            src={post.user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.username || 'user'}`}
                            alt={post.user?.username}
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                            <h4 style={{ fontSize: '0.9rem' }}>{post.user?.username}</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {post.user?.bio?.substring(0, 50) || 'Professional'}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {post.createdAt ? formatDistanceToNow(new Date(post.createdAt)) + ' ago' : 'Just now'}
                            </p>
                        </div>
                    </div>
                    <button style={{ color: 'var(--text-muted)' }}><MoreHorizontal size={20} /></button>
                </div>

                <p style={{ fontSize: '0.9rem', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>{post.text}</p>
            </div>

            {post.image && (
                <img src={post.image} alt="Post content" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} />
            )}

            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {post.likes?.length || 0} likes
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {post.comments?.length || 0} comments
                </span>
            </div>

            <div style={{ display: 'flex', padding: '4px 8px' }}>
                <ActionButton
                    icon={<ThumbsUp size={20} fill={isLiked ? 'var(--primary)' : 'none'} />}
                    label="Like"
                    active={isLiked}
                    onClick={handleLike}
                />
                <ActionButton
                    icon={<MessageCircle size={20} />}
                    label="Comment"
                    onClick={() => setShowComments(!showComments)}
                />
                <ActionButton icon={<Share2 size={20} />} label="Share" />
                <ActionButton icon={<Send size={20} />} label="Send" />
            </div>

            {showComments && (
                <div style={{ padding: '12px 16px', background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
                    <form onSubmit={handleComment} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <img src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'me'}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <input
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '20px',
                                border: '1px solid var(--border)',
                                fontSize: '0.85rem'
                            }}
                        />
                        <button type="submit" style={{ color: 'var(--primary)', fontWeight: 600 }}>Post</button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {post.comments?.map((comment, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px' }}>
                                <img src={comment.user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.username || 'user'}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                <div style={{ background: 'white', padding: '8px 12px', borderRadius: 'var(--radius-md)', flex: 1 }}>
                                    <h5 style={{ fontSize: '0.8rem' }}>{comment.user.username}</h5>
                                    <p style={{ fontSize: '0.85rem' }}>{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ActionButton = ({ icon, label, onClick, active }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            color: active ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: active ? 600 : 400,
            borderRadius: 'var(--radius-sm)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
    >
        {icon}
        <span style={{ fontSize: '0.9rem' }}>{label}</span>
    </button>
);

export default PostCard;
