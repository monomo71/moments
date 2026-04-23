import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GOOGLE_FONTS = [
  "Playfair Display", "Inter", "Roboto", "Open Sans", "Lato", "Montserrat",
  "Oswald", "Raleway", "Merriweather", "Nunito", "Poppins", "Ubuntu",
  "Rubik", "PT Sans", "Work Sans", "Lora", "Fira Sans", "Quicksand",
  "Barlow", "Inconsolata", "Mulish", "Josefin Sans", "Cabin",
  "DM Sans", "Libre Baskerville", "Bebas Neue", "Pacifico",
  "Cormorant Garamond", "Fraunces", "Cinzel"
];

export default function AdminClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '', subtitle: '', password: '', date: '', accentColor: '', backgroundColor: '', fontFamily: '',
    headerColor: '', headerTextColor: '', headerFontFamily: ''
  });

  useEffect(() => {
    fetch(`http://localhost:4001/api/admin/clients`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    }).then(res => res.json()).then(data => {
      const c = data.find((x: any) => x.id === id);
      if (c) {
          setClient(c);
          setEditData({
            title: c.title || '',
            subtitle: c.subtitle || '',
            password: '',
            date: c.date ? new Date(c.date).toISOString().split('T')[0] : '',
            accentColor: c.accentColor || '#796e68',
            backgroundColor: c.backgroundColor || '#faf9f8',
            fontFamily: c.fontFamily || 'Inter',
            headerColor: c.headerColor || '#e3e1e1',
            headerTextColor: c.headerTextColor || '#000000',
            headerFontFamily: c.headerFontFamily || 'Playfair Display'
          });
      }
    });
  }, [id]);

  const handleUpload = async () => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://localhost:4001/api/admin/clients/${id}/photos`);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('adminToken')}`);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      setUploading(false);
      setProgress(0);
      setFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (xhr.status === 200) window.location.reload();
      else alert('Upload failed: ' + xhr.responseText);
    };
    xhr.onerror = () => {
        setUploading(false);
        setProgress(0);
        alert('Upload completely failed.');
    };
    xhr.send(formData);
  };

  const handleDelete = async (photoId: string) => {
    await fetch(`http://localhost:4001/api/admin/photos/${photoId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    window.location.reload();
  };

  const handleSaveEdit = async () => {
    const res = await fetch(`http://localhost:4001/api/admin/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      body: JSON.stringify(editData)
    });
    if (res.ok) {
        setIsEditing(false);
        window.location.reload();
    } else {
        alert('Failed to update client.');
    }
  };

  if (!client) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-serif text-taupe">{client.title}</h1>
            {client.subtitle && <p className="text-muted-foreground mt-1">{client.subtitle}</p>}
        </div>
        <div className="flex gap-4">
            <button onClick={() => setIsEditing(!isEditing)} className="brutalist-button-outline">
                {isEditing ? 'Cancel Edit' : 'Edit Settings'}
            </button>
            <button onClick={() => navigate('/admin')} className="brutalist-button-outline">Back to Dashboard</button>
        </div>
      </div>

      {isEditing && (
        <div className="brutalist-card bg-[#faf9f8]">
            <h2 className="brutalist-label mb-4">Edit Client Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Core Infos */}
                <div className="col-span-1 border-b border-[#e3e1e1] pb-4">
                    <label className="brutalist-label">Title</label>
                    <input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="brutalist-input mt-1" />
                </div>
                <div className="col-span-1 border-b border-[#e3e1e1] pb-4">
                    <label className="brutalist-label">Subtitle</label>
                    <input type="text" value={editData.subtitle} onChange={e => setEditData({...editData, subtitle: e.target.value})} className="brutalist-input mt-1" />
                </div>
                <div className="col-span-1 border-b border-[#e3e1e1] pb-4">
                    <label className="brutalist-label">New Password (leave blank to keep current)</label>
                    <input type="password" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} className="brutalist-input mt-1" />
                </div>
                <div className="col-span-1 border-b border-[#e3e1e1] pb-4">
                    <label className="brutalist-label">Event Date</label>
                    <input type="date" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} className="brutalist-input mt-1" />
                </div>

                {/* Color Pickers */}
                <div className="col-span-1 space-y-4 pt-2">
                    <h3 className="brutalist-label text-[#796e68]">Palette Settings</h3>
                    <div>
                        <label className="brutalist-label">Page Background Color</label>
                        <div className="flex gap-2 items-center mt-1">
                            <input type="color" value={editData.backgroundColor} onChange={e => setEditData({...editData, backgroundColor: e.target.value})} className="h-11 w-11 p-1 border border-[#e3e1e1] rounded-none cursor-pointer" />
                            <input type="text" value={editData.backgroundColor} onChange={e => setEditData({...editData, backgroundColor: e.target.value})} className="brutalist-input flex-1" />
                        </div>
                    </div>
                    <div>
                        <label className="brutalist-label">Theme Accent Color</label>
                        <div className="flex gap-2 items-center mt-1">
                            <input type="color" value={editData.accentColor} onChange={e => setEditData({...editData, accentColor: e.target.value})} className="h-11 w-11 p-1 border border-[#e3e1e1] rounded-none cursor-pointer" />
                            <input type="text" value={editData.accentColor} onChange={e => setEditData({...editData, accentColor: e.target.value})} className="brutalist-input flex-1" />
                        </div>
                    </div>
                    <div>
                        <label className="brutalist-label">Header Background Color</label>
                        <div className="flex gap-2 items-center mt-1">
                            <input type="color" value={editData.headerColor} onChange={e => setEditData({...editData, headerColor: e.target.value})} className="h-11 w-11 p-1 border border-[#e3e1e1] rounded-none cursor-pointer" />
                            <input type="text" value={editData.headerColor} onChange={e => setEditData({...editData, headerColor: e.target.value})} className="brutalist-input flex-1" />
                        </div>
                    </div>
                    <div>
                        <label className="brutalist-label">Header Text Color</label>
                        <div className="flex gap-2 items-center mt-1">
                            <input type="color" value={editData.headerTextColor} onChange={e => setEditData({...editData, headerTextColor: e.target.value})} className="h-11 w-11 p-1 border border-[#e3e1e1] rounded-none cursor-pointer" />
                            <input type="text" value={editData.headerTextColor} onChange={e => setEditData({...editData, headerTextColor: e.target.value})} className="brutalist-input flex-1" />
                        </div>
                    </div>
                </div>

                {/* Font Typographys */}
                <div className="col-span-1 space-y-4 pt-2 border-l border-[#e3e1e1] pl-6">
                   <h3 className="brutalist-label text-[#796e68]">Typography</h3>
                   <div>
                        <label className="brutalist-label">Header Font Family</label>
                        <select 
                            value={editData.headerFontFamily} 
                            onChange={e => setEditData({...editData, headerFontFamily: e.target.value})} 
                            className="brutalist-input mt-1 cursor-pointer"
                        >
                            {GOOGLE_FONTS.map(font => (
                                <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                            ))}
                        </select>
                   </div>
                   <div>
                        <label className="brutalist-label">Body / Text Font Family</label>
                        <select 
                            value={editData.fontFamily} 
                            onChange={e => setEditData({...editData, fontFamily: e.target.value})} 
                            className="brutalist-input mt-1 cursor-pointer"
                        >
                            {GOOGLE_FONTS.map(font => (
                                <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                            ))}
                        </select>
                   </div>
                </div>

            </div>
            <div className="mt-8 border-t border-[#e3e1e1] pt-6">
              <button onClick={handleSaveEdit} className="brutalist-button w-full md:w-auto">Save Design Changes</button>
            </div>
        </div>
      )}

      <div className="brutalist-card">
        <h2 className="brutalist-label">Upload Photos</h2>
        <div 
            className="mt-4 p-8 border-2 border-dashed border-[#e3e1e1] bg-background flex flex-col items-center justify-center cursor-pointer hover:bg-[#faf9f8] transition-colors"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setFiles(e.dataTransfer.files);
                }
            }}
            onClick={() => fileInputRef.current?.click()}
        >
          <input 
              ref={fileInputRef} 
              type="file" 
              multiple 
              onChange={e => setFiles(e.target.files)} 
              className="hidden" 
              accept="image/*" 
          />
          
          {(!files || files.length === 0) ? (
              <p className="text-sm font-medium text-[#796e68] pointer-events-none">Click to browse or drag & drop files here</p>
          ) : (
             <p className="text-sm font-medium text-[#796e68] mb-4 pointer-events-none">{files.length} file(s) selected</p>
          )}

          <button 
              onClick={(e) => { e.stopPropagation(); handleUpload(); }} 
              disabled={uploading || !files || files.length === 0} 
              className="brutalist-button w-full sm:w-auto z-10 relative mt-4 disabled:opacity-50"
          >
            {uploading ? `Uploading ${progress}%` : 'Upload High-Res Photos'}
          </button>

          {uploading && <div className="w-full bg-[#e3e1e1] h-2 mt-4"><div className="bg-[#796e68] h-full transition-all duration-300" style={{ width: `${progress}%` }}/></div>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {client.photos?.map((p: any) => (
          <div key={p.id} className="relative group border border-[#e3e1e1] aspect-square">
            <img src={`http://localhost:4001${p.thumbnailUrl}`} className="w-full h-full object-cover" />
            <button onClick={() => handleDelete(p.id)} className="absolute top-2 right-2 bg-white text-black p-1 text-xs tracking-widest uppercase font-bold opacity-0 group-hover:opacity-100 border border-[#e3e1e1] hover:bg-[#faf9f8]">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
