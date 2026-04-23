import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [clients, setClients] = useState([]);
  const [creating, setCreating] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  
  const [newClient, setNewClient] = useState({ title: '', subtitle: '', password: '', date: '', accentColor: '#796e68', backgroundColor: '#f3f1f1', fontFamily: 'Playfair Display' });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4001/api/admin/clients', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    }).then(res => {
      if (!res.ok) navigate('/admin/login');
      else return res.json();
    }).then(setClients);
  }, [navigate]);

  const handleCreate = async () => {
    const res = await fetch('http://localhost:4001/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      body: JSON.stringify(newClient)
    });
    if (res.ok) {
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:4001/api/admin/clients/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    window.location.reload();
  };

  const handleChangePassword = async () => {
    if (!newAdminPassword) return alert('Enter a new password');
    const res = await fetch('http://localhost:4001/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      body: JSON.stringify({ newPassword: newAdminPassword })
    });
    if (res.ok) {
      alert('Admin password updated successfully');
      setChangingPass(false);
      setNewAdminPassword('');
    } else {
      alert('Failed to update password');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center border-b border-[#e3e1e1] pb-4">
        <h1 className="text-3xl font-serif text-[#796e68] font-bold tracking-widest uppercase">Moments Admin</h1>
        <div className="flex gap-4">
          <button onClick={() => setChangingPass(!changingPass)} className="brutalist-button-outline">
            {changingPass ? 'Cancel' : 'Change Admin Password'}
          </button>
          <button onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin/login'); }} className="brutalist-button-outline">Logout</button>
        </div>
      </div>

      {changingPass && (
        <div className="brutalist-card bg-[#faf9f8] mb-8">
          <h2 className="brutalist-label mb-4">Change Admin Password</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="brutalist-label">New Password</label>
              <input type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} className="brutalist-input" />
            </div>
            <button onClick={handleChangePassword} className="brutalist-button">Update Password</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl tracking-widest font-bold uppercase text-foreground-muted">Clients</h2>
        <button onClick={() => setCreating(!creating)} className="brutalist-button">{creating ? 'Cancel' : 'New Client'}</button>
      </div>

      {creating && (
        <div className="brutalist-card space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6"><label className="brutalist-label">Title (Couple Names)</label><input type="text" className="brutalist-input" value={newClient.title} onChange={e => setNewClient({ ...newClient, title: e.target.value })} /></div>
            <div className="col-span-6"><label className="brutalist-label">Subtitle</label><input type="text" className="brutalist-input" value={newClient.subtitle} onChange={e => setNewClient({ ...newClient, subtitle: e.target.value })} /></div>
            <div className="col-span-4"><label className="brutalist-label">Wedding Date</label><input type="date" className="brutalist-input" value={newClient.date} onChange={e => setNewClient({ ...newClient, date: e.target.value })} /></div>
            <div className="col-span-4"><label className="brutalist-label">Client Password</label><input type="text" className="brutalist-input" value={newClient.password} onChange={e => setNewClient({ ...newClient, password: e.target.value })} /></div>
            <div className="col-span-4"><label className="brutalist-label">Font Family</label><input type="text" className="brutalist-input" value={newClient.fontFamily} onChange={e => setNewClient({ ...newClient, fontFamily: e.target.value })} /></div>
            <div className="col-span-6"><label className="brutalist-label">Accent Color (Hex)</label><input type="color" className="brutalist-input p-0 h-[44px] cursor-pointer" value={newClient.accentColor} onChange={e => setNewClient({ ...newClient, accentColor: e.target.value })} /></div>
            <div className="col-span-6"><label className="brutalist-label">Background Color (Hex)</label><input type="color" className="brutalist-input p-0 h-[44px] cursor-pointer" value={newClient.backgroundColor} onChange={e => setNewClient({ ...newClient, backgroundColor: e.target.value })} /></div>
          </div>
          <button onClick={handleCreate} className="brutalist-button">Create Client</button>
        </div>
      )}

      <div className="brutalist-card overflow-hidden p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="p-4 tracking-widest text-[9px] uppercase font-bold text-foreground-muted">Client</th>
              <th className="p-4 tracking-widest text-[9px] uppercase font-bold text-foreground-muted">Date</th>
              <th className="p-4 tracking-widest text-[9px] uppercase font-bold text-foreground-muted">Photos</th>
              <th className="p-4 tracking-widest text-[9px] uppercase font-bold text-foreground-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c: any) => (
              <tr key={c.id} className="border-b border-border hover:bg-background-hover transition-colors">
                <td className="p-4 font-medium text-sm">{c.title} {c.subtitle && <span className="opacity-50 ml-2">{c.subtitle}</span>}</td>
                <td className="p-4 text-xs">{new Date(c.date).toLocaleDateString()}</td>
                <td className="p-4 text-xs">{c.photos?.length || 0}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => navigate(`/admin/client/${c.id}`)} className="brutalist-button-outline">Manage</button>
                  <button onClick={() => handleDelete(c.id)} className="bg-red-600 text-white uppercase tracking-widest text-[10px] font-bold h-[44px] px-4 rounded-none border border-red-700">Delete</button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-sm opacity-50">-</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
