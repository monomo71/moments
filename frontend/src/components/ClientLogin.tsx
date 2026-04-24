import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClientLogin() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/client/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      const { token } = await res.json();
      localStorage.setItem('clientToken', token);
      navigate('/client');
    } else alert('Login failed, watch out for typos.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="brutalist-card w-full max-w-sm">
        <h1 className="text-2xl font-serif mb-6 uppercase tracking-widest text-[#796e68] text-center font-bold">Moments</h1>
        <p className="text-center text-sm mb-6 font-medium text-foreground-muted uppercase tracking-widest">Enter your password to access your gallery</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="brutalist-input text-center text-lg tracking-[0.2em]" />
          </div>
          <button type="submit" className="brutalist-button w-full">Enter Gallery</button>
        </form>
      </div>
    </div>
  );
}
