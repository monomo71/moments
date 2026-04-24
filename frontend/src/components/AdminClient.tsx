import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowUpDown, GripVertical } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

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
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '', subtitle: '', password: '', date: '', accentColor: '', backgroundColor: '', fontFamily: '',
    headerColor: '', headerTextColor: '', headerFontFamily: '',
    overlayColor: '#000000', overlayOpacity: 0.5,
    titleColor: '', subtitleColor: '', dateColor: '', btnLeftBgColor: '', btnLeftTextColor: '', btnRightBgColor: '', btnRightTextColor: ''
  });
  const [uploadingBg, setUploadingBg] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/clients`, {
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
            headerFontFamily: c.headerFontFamily || 'Playfair Display',
            overlayColor: c.overlayColor || '#000000',
            overlayOpacity: c.overlayOpacity ?? 0.5,
            titleColor: c.titleColor || '',
            subtitleColor: c.subtitleColor || '',
            dateColor: c.dateColor || '',
            btnLeftBgColor: c.btnLeftBgColor || '',
            btnLeftTextColor: c.btnLeftTextColor || '',
            btnRightBgColor: c.btnRightBgColor || '',
            btnRightTextColor: c.btnRightTextColor || ''
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
    xhr.open('POST', `/api/admin/clients/${id}/photos`);
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

  const [uploadingMusic, setUploadingMusic] = useState(false);
  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMusic(true);
    const fd = new FormData();
    fd.append('music', file);
    const res = await fetch(`/api/admin/clients/${id}/music`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      body: fd
    });
    setUploadingMusic(false);
    if (res.ok) window.location.reload();
  };

  const handleMusicRemove = async () => {
    if (!confirm('Remove music?')) return;
    await fetch(`/api/admin/clients/${id}/music`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    window.location.reload();
  };

  const handleDelete = async (photoId: string) => {
    await fetch(`/api/admin/photos/${photoId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    window.location.reload();
  };

  const handleBgUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    const fd = new FormData();
    fd.append('bgimage', file);
    try {
      const r = await fetch(`/api/admin/clients/${id}/bgimage`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: fd
      });
      const data = await r.json();
      setClient({...client, bgImageUrl: data.bgImageUrl});
    } finally {
      setUploadingBg(false);
    }
  };

  const handleBgRemove = async () => {
    await fetch(`/api/admin/clients/${id}/bgimage`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    setClient({...client, bgImageUrl: null});
  };

  const handleSaveEdit = async () => {
    const res = await fetch(`/api/admin/clients/${id}`, {
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

                <div className="col-span-1 space-y-4 pt-2 border-l border-[#e3e1e1] pl-6 md:col-span-2 md:ml-0 md:border-l-0 md:border-t md:pt-6">
                    <h3 className="brutalist-label text-[#796e68]">Specific Element Colors (Optional override)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                          <label className="brutalist-label text-[10px]">Title Color</label>
                          <input type="color" value={editData.titleColor} onChange={e => setEditData({...editData, titleColor: e.target.value})} className="h-8 w-8 p-1 border border-[#e3e1e1] rounded-none cursor-pointer block mt-1" />
                      </div>
                      <div>
                          <label className="brutalist-label text-[10px]">Subtitle Color</label>
                          <input type="color" value={editData.subtitleColor} onChange={e => setEditData({...editData, subtitleColor: e.target.value})} className="h-8 w-8 p-1 border border-[#e3e1e1] rounded-none cursor-pointer block mt-1" />
                      </div>
                      <div>
                          <label className="brutalist-label text-[10px]">Date Color</label>
                          <input type="color" value={editData.dateColor} onChange={e => setEditData({...editData, dateColor: e.target.value})} className="h-8 w-8 p-1 border border-[#e3e1e1] rounded-none cursor-pointer block mt-1" />
                      </div>
                      <div>
                          <label className="brutalist-label text-[10px]">Btn L Bg</label>
                          <input type="color" value={editData.btnLeftBgColor} onChange={e => setEditData({...editData, btnLeftBgColor: e.target.value})} className="h-8 w-8 p-1 border border-[#e3e1e1] rounded-none cursor-pointer block mt-1" />
                      </div>
                      <div>
                          <label className="brutalist-label text-[10px]">Btn L Text</label>
                          <input type="color" value={editData.btnLeftTextColor} onChange={e => setEditData({...editData, btnLeftTextColor: e.target.value})} className="h-8 w-8 p-1 border border-[#e3e1e1] rounded-none cursor-pointer block mt-1" />
                      </div>
                      <div>
                          <label className="brutalist-label text-[10px]">Btn R Bg</label>
                          <input type="color" value={editData.btnRightBgColor} onChange={e => setEditData({...editData, btnRightBgColor: e.target.value})} className="h-8 w-8 p-1 border border-[#e3e1e1] rounded-none cursor-pointer block mt-1" />
                      </div>
                      <div>
                          <label className="brutalist-label text-[10px]">Btn R Text</label>
                          <input type="color" value={editData.btnRightTextColor} onChange={e => setEditData({...editData, btnRightTextColor: e.target.value})} className="h-8 w-8 p-1 border border-[#e3e1e1] rounded-none cursor-pointer block mt-1" />
                      </div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 border-t border-[#e3e1e1] pt-6 space-y-4">
                  <h3 className="brutalist-label text-[#796e68]">Background Image (Welcome Screen)</h3>
                  {client.bgImageUrl ? (
                    <div className="flex flex-col gap-4">
                      <div className="w-48 h-32 bg-gray-200 border border-[#e3e1e1] relative">
                         <img src={`/${client.bgImageUrl}`} className="w-full h-full object-cover" />
                      </div>
                      <button onClick={handleBgRemove} className="brutalist-button-outline w-fit text-red-600 border-red-200">Remove Image</button>
                    </div>
                  ) : (
                    <div>
                      <label className="brutalist-button w-fit inline-block cursor-pointer">
                        {uploadingBg ? 'Uploading...' : 'Upload Background Image'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
                      </label>
                    </div>
                  )}

                  <div className="flex items-center gap-6 mt-4">
                      <div>
                          <label className="brutalist-label text-[10px]">Overlay Color</label>
                          <input type="color" value={editData.overlayColor} onChange={e => setEditData({...editData, overlayColor: e.target.value})} className="h-8 w-8 p-1 border border-[#e3e1e1] rounded-none cursor-pointer block mt-1" />
                      </div>
                      <div className="flex-1 max-w-sm">
                          <label className="brutalist-label text-[10px]">Overlay Opacity: {Math.round(editData.overlayOpacity * 100)}%</label>
                          <input type="range" min="0" max="1" step="0.05" value={editData.overlayOpacity} onChange={e => setEditData({...editData, overlayOpacity: parseFloat(e.target.value)})} className="w-full accent-taupe mt-3" />
                      </div>
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

      <div className="brutalist-card">
        <h2 className="brutalist-label mb-4">Background Music</h2>
        {client.musicUrl ? (
          <div className="flex items-center gap-4">
            <audio src={`/${client.musicUrl}`} controls className="h-[44px]" />
            <button onClick={handleMusicRemove} className="brutalist-button-outline text-red-600 border-red-200">Remove Music</button>
          </div>
        ) : (
          <div>
            <label className="brutalist-button inline-block cursor-pointer text-center w-auto">
              {uploadingMusic ? 'Uploading...' : 'Upload MP3'}
              <input type="file" accept="audio/mpeg, audio/mp3" className="hidden" onChange={handleMusicUpload} />
            </label>
          </div>
        )}
      </div>

      <div className="brutalist-card mb-8">
        <div className="flex items-center justify-between mb-4">
            <h2 className="brutalist-label">Photo Order & Management</h2>
            <div className="flex gap-4">
                <button 
                    onClick={async () => {
                        const sorted = [...client.photos].sort((a: any, b: any) => {
                            const nameA = a.originalUrl.split('-orig-')[1] || '';
                            const nameB = b.originalUrl.split('-orig-')[1] || '';
                            // Try numeric sort first if they are numbers like 1.jpg, 2.jpg
                            const numA = parseInt(nameA);
                            const numB = parseInt(nameB);
                            if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
                            return nameA.localeCompare(nameB);
                        });
                        setClient({ ...client, photos: sorted });
                        await fetch(`/api/admin/clients/${id}/photos/reorder`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                            body: JSON.stringify({ orderedIds: sorted.map((p: any) => p.id) })
                        });
                    }}
                    className="brutalist-button-outline h-8 px-4 flex items-center gap-2"
                >
                    <ArrowUpDown size={14} /> Sort A-Z
                </button>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {client.photos?.map((p: any, idx: number) => (
            <div 
                key={p.id} 
                draggable 
                onDragStart={() => setDraggedIdx(idx)}
                onDragEnter={(e) => {
                    e.preventDefault();
                    if (draggedIdx === null || draggedIdx === idx) return;
                    const newPhotos = [...client.photos];
                    const draggedItem = newPhotos[draggedIdx];
                    newPhotos.splice(draggedIdx, 1);
                    newPhotos.splice(idx, 0, draggedItem);
                    setClient({ ...client, photos: newPhotos });
                    setDraggedIdx(idx);
                }}
                onDragEnd={async () => {
                    setDraggedIdx(null);
                    const orderedIds = client.photos.map((ph: any) => ph.id);
                    await fetch(`/api/admin/clients/${id}/photos/reorder`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                        body: JSON.stringify({ orderedIds })
                    });
                }}
                onDragOver={(e) => e.preventDefault()}
                className={twMerge(
                    "relative group border aspect-square bg-[#faf9f8] cursor-move transition-transform", 
                    draggedIdx === idx ? "opacity-50 scale-95 border-taupe" : "border-[#e3e1e1]"
                )}
            >
                <div className="absolute top-2 left-2 z-10 bg-white/80 p-1 text-[#796e68] shadow-sm"><GripVertical size={16} /></div>
                <img src={`${p.thumbnailUrl}`} className="w-full h-full object-cover pointer-events-none" />
                <button onClick={() => handleDelete(p.id)} className="absolute top-2 right-2 bg-white text-black p-1 text-xs tracking-widest uppercase font-bold opacity-0 group-hover:opacity-100 border border-[#e3e1e1] hover:bg-[#faf9f8] z-20">Delete</button>
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] truncate px-2 py-1 tracking-widest opacity-0 group-hover:opacity-100">
                    {p.originalUrl.split('-orig-')[1]}
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}
