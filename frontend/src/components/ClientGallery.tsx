import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Pause, Play, Download, CheckSquare, Square, Grid, Volume2, VolumeX } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const i18n = {
  nl: { welcome: 'Welkom', enterG: 'Naar Galerij', playS: 'Start Slideshow', dlAll: 'Alles Downloaden', dlSel: 'Selectie Downloaden', lang: 'Taal' },
  en: { welcome: 'Welcome', enterG: 'To Gallery', playS: 'Start Slideshow', dlAll: 'Download All', dlSel: 'Download Selection', lang: 'Lang' },
  de: { welcome: 'Willkommen', enterG: 'Zur Galerie', playS: 'Diashow Starten', dlAll: 'Alles Herunterladen', dlSel: 'Auswahl Herunterladen', lang: 'Spr.' }
};

export default function ClientGallery() {
  const [client, setClient] = useState<any>(null);
  const [mode, setMode] = useState<'welcome' | 'gallery' | 'slideshow' | 'lightbox'>('welcome');
  const [lang, setLang] = useState<'nl'|'en'|'de'>('nl');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [thumbSize, setThumbSize] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const navigate = useNavigate();
  const t = i18n[lang];

  useEffect(() => {
    fetch('http://localhost:4001/api/client/me', { headers: { Authorization: `Bearer ${localStorage.getItem('clientToken')}` } })
      .then(r => r.ok ? r.json() : navigate('/client/login'))
      .then(setClient);
  }, [navigate]);

  useEffect(() => {
    if (client) {
      document.body.style.setProperty('--background', client.backgroundColor);
      document.body.style.setProperty('--color-taupe', client.accentColor);
      if (client.fontFamily) {
        document.body.style.setProperty('--font-serif', client.fontFamily);
      }
    }
  }, [client]);

  let hoverTimeout: any;
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => setShowControls(false), 2000);
  };

  const nextPhoto = useCallback(() => setCurrentIdx(i => (i + 1) % (client?.photos?.length || 1)), [client]);
  const prevPhoto = useCallback(() => setCurrentIdx(i => (i - 1 + (client?.photos?.length || 1)) % (client?.photos?.length || 1)), [client]);

  useEffect(() => {
    if (mode === 'slideshow' && isPlaying) {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      const t = setInterval(nextPhoto, 4000);
      return () => {
        clearInterval(t);
      };
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [mode, isPlaying, nextPhoto]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (mode === 'lightbox' || mode === 'slideshow') {
        if (e.key === 'Escape') setMode('gallery');
        if (e.key === 'ArrowRight') nextPhoto();
        if (e.key === 'ArrowLeft') prevPhoto();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, nextPhoto, prevPhoto]);

  const downloadZip = (ids?: string[]) => {
    const token = localStorage.getItem('clientToken');
    let url = 'http://localhost:4001/api/client/download';
    if (ids && ids.length) url += '?ids=' + ids.join(',');
    
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `moments_${client.title.replace(/[^a-z0-9]/gi,'')}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  };

  const downloadOriginal = (photo: any) => {
    const a = document.createElement('a');
    a.href = `http://localhost:4001${photo.originalUrl}`;
    a.download = photo.originalUrl.split('/').pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (!client) return null;

  return (
    <>
      <audio 
        src={client?.musicUrl ? `http://localhost:4001/${client.musicUrl}` : undefined} 
        loop 
        ref={audioRef}
        preload="auto"
      />
      
      {mode === 'welcome' && (
        <div className="min-h-screen flex items-center justify-center p-8 transition-colors duration-1000 relative" style={{ backgroundColor: client.backgroundColor }}>
          {client.bgImageUrl && (
             <div 
               className="absolute inset-0 z-0 bg-cover bg-center" 
               style={{ backgroundImage: `url(http://localhost:4001/${client.bgImageUrl})` }} 
             />
          )}
          {client.bgImageUrl && client.overlayColor && (
             <div 
               className="absolute inset-0 z-0" 
               style={{ backgroundColor: client.overlayColor, opacity: client.overlayOpacity }} 
             />
          )}
          
          <div className="text-center max-w-2xl relative z-10">
            <h1 className="text-4xl md:text-6xl font-serif mb-4" style={{ color: client.titleColor || client.accentColor, fontFamily: client.fontFamily }}>{client.title}</h1>
            {client.subtitle && <h2 className="text-xl md:text-2xl font-serif mb-8 tracking-widest uppercase" style={{ color: client.subtitleColor || 'currentColor' }}>{client.subtitle}</h2>}
            {client.date && <p className="text-sm font-bold tracking-widest uppercase mb-12" style={{ color: client.dateColor || '#796e68' }}>{new Date(client.date).toLocaleDateString()}</p>}
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setMode('gallery')} 
                className="brutalist-button" 
                style={{ 
                    backgroundColor: client.btnLeftBgColor || client.accentColor, 
                    color: client.btnLeftTextColor || '#ffffff' 
                }}
              >
                {t.enterG}
              </button>
              <button 
                onClick={() => { 
                  setMode('slideshow'); 
                  setIsPlaying(true); 
                  if (audioRef.current) audioRef.current.play().catch(e => console.error("Audio block:", e)); 
                }} 
                className="brutalist-button-outline"
                style={{ 
                    borderColor: client.btnRightBgColor || '#e3e1e1',
                    color: client.btnRightTextColor || 'currentColor',
                    backgroundColor: client.btnRightBgColor ? 'transparent' : undefined
                }}
              >
                {t.playS}
              </button>
            </div>
          </div>
        </div>
      )}

      {mode !== 'welcome' && (
        <div className="min-h-screen" style={{ backgroundColor: client.backgroundColor }}>
          {(mode === 'slideshow' || mode === 'lightbox') && (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onMouseMove={handleMouseMove}>
              <div className={twMerge("absolute inset-0 transition-opacity duration-500", showControls ? "opacity-100" : "opacity-0")}>
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between bg-gradient-to-b from-black/50 to-transparent">
                  <button onClick={() => { setMode('gallery'); setIsPlaying(false); audioRef.current?.pause(); }} className="text-white hover:text-gray-300 w-12 h-12 flex items-center justify-center"><X size={32}/></button>
                  
                  {mode === 'slideshow' && (
                    <div className="flex items-center gap-6">
                      {client.musicUrl && (
                        <div className="flex items-center gap-3 text-white">
                          <button onClick={() => setAudioVolume(audioVolume > 0 ? 0 : 0.5)}>
                            {audioVolume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                          </button>
                          <input type="range" min="0" max="1" step="0.05" value={audioVolume} onChange={e => setAudioVolume(parseFloat(e.target.value))} className="w-24 accent-[#796e68]" />
                        </div>
                      )}
                      <button onClick={() => {
                        const nextIsPlaying = !isPlaying;
                        setIsPlaying(nextIsPlaying);
                        if (nextIsPlaying) {
                           audioRef.current?.play().catch(e => console.error(e));
                        } else {
                           audioRef.current?.pause();
                        }
                      }} className="text-white hover:text-gray-300 w-12 h-12 flex items-center justify-center">
                        {isPlaying ? <Pause size={32}/> : <Play size={32}/>}
                      </button>
                    </div>
                  )}
                </div>
                
                <button onClick={prevPhoto} className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 w-16 h-16 flex items-center justify-center"><ChevronLeft size={48}/></button>
                <button onClick={nextPhoto} className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 w-16 h-16 flex items-center justify-center"><ChevronRight size={48}/></button>
              </div>
              
              <img src={`http://localhost:4001${client.photos[currentIdx]?.originalUrl}`} className="max-h-screen max-w-full object-contain" />
            </div>
          )}
          
          {mode === 'gallery' && (
            <>
              <nav className="sticky top-0 z-40 border-b border-border px-8 pt-4 pb-0 h-auto sm:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 box-border" style={{ backgroundColor: client.headerColor || '#ffffff', color: client.headerTextColor || '#000000', fontFamily: client.headerFontFamily || 'Playfair Display' }}>
                <h1 className="text-xl cursor-pointer" style={{ fontFamily: client.headerFontFamily || 'Playfair Display' }} onClick={() => setMode('welcome')}>{client.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium mb-4 sm:mb-0" style={{ fontFamily: client.fontFamily || 'Inter' }}>
                  <div className="flex items-center gap-2 border-r border-[#e3e1e1] pr-4">
                    <Grid size={14}/>
                    <input type="range" min="150" max="600" value={thumbSize} onChange={e => setThumbSize(Number(e.target.value))} className="w-24 accent-taupe" />
                  </div>
                  
                  <button 
                    onClick={() => downloadZip(selected.size > 0 ? Array.from(selected) : undefined)} 
                    className="flex items-center gap-2 text-foreground-muted hover:opacity-75 transition-opacity"
                  >
                    <Download size={14}/> {selected.size > 0 ? t.dlSel : t.dlAll}
                  </button>
                  
                  <select value={lang} onChange={e => setLang(e.target.value as any)} className="bg-transparent border border-border px-2 rounded-none outline-none focus:ring-1 focus:border-taupe h-8 uppercase font-bold text-xs tracking-widest ml-4">
                    <option value="nl">NL</option>
                    <option value="en">EN</option>
                    <option value="de">DE</option>
                  </select>
                </div>
              </nav>

              <main className="p-8">
                <div className="masonry-grid" style={{ columnWidth: `${Math.max(150, thumbSize)}px`, columnGap: '1rem' }}>
                  {client.photos?.map((p: any, idx: number) => {
                    const isSelected = selected.has(p.id);
                    return (
                      <div key={p.id} className={twMerge("relative group mb-4 inline-block w-full cursor-zoom-in transition-all", isSelected ? "ring-4 ring-taupe" : "")}>
                        <img src={`http://localhost:4001${p.thumbnailUrl}`} loading="lazy" className="w-full h-auto block" onClick={() => { setCurrentIdx(idx); setMode('lightbox'); }} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                          <button onClick={(e) => {
                            e.stopPropagation();
                            const next = new Set(selected);
                            if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
                            setSelected(next);
                          }} className="bg-white/90 text-black p-2 hover:bg-white box-border rounded-none shadow-none focus:outline-none">
                            {isSelected ? <CheckSquare size={16}/> : <Square size={16} />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); downloadOriginal(p); }} className="bg-white/90 text-black p-2 hover:bg-white box-border rounded-none shadow-none focus:outline-none" title="Download High-Res">
                            <Download size={16}/>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {client.photos?.length === 0 && <div className="text-center font-bold tracking-widest text-[10px] uppercase text-foreground-muted py-24 border border-dashed border-border">No photos available yet.</div>}
              </main>
            </>
          )}
        </div>
      )}
    </>
  );
}
