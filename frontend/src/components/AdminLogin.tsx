import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const { token } = await res.json();
      localStorage.setItem('adminToken', token);
      navigate('/admin');
    } else alert('Login failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="brutalist-card w-full max-w-sm">
        <h1 className="text-2xl font-serif mb-6 uppercase tracking-widest text-[#796e68] font-bold">Moments Admin</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="brutalist-label">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="brutalist-input" />
          </div>
          <div>
            <label className="brutalist-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="brutalist-input" />
          </div>
          <button type="submit" className="brutalist-button w-full">Login</button>
        </form>
      </div>
    </div>
  );
}
