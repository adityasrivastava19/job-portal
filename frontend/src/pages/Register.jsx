import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Linkedin } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(formData);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Linkedin size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h2>Join Mini LinkedIn</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Make the most of your professional life</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <input
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password (6+ characters)"
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            ...buttonStyle,
                            backgroundColor: isLoading ? 'var(--secondary)' : 'var(--primary)'
                        }}
                    >
                        {isLoading ? 'Creating account...' : 'Agree & Join'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Already on Mini LinkedIn? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    fontSize: '1rem'
};

const buttonStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: 'var(--radius-lg)',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 600,
    marginTop: '0.5rem'
};

export default Register;
