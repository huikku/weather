import { useRef, useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Layers, Play, Pause, Radio, Satellite } from 'lucide-react';

const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';
const TILE_SIZE = 256;
const COLOR_SCHEME = 7; // Universal Blue
const SMOOTH = 1;
const SNOW = 1;

export function RadarMap({ lat, lon }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const overlayRef = useRef(null);
    const [mode, setMode] = useState('radar'); // 'radar' | 'satellite'
    const [frames, setFrames] = useState([]);
    const [frameIdx, setFrameIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [host, setHost] = useState('');
    const touchStartX = useRef(0);

    // Fetch RainViewer frame data
    useEffect(() => {
        fetch(RAINVIEWER_API)
            .then(r => r.json())
            .then(data => {
                setHost(data.host);
                updateFrames(data, mode);
            })
            .catch(console.error);
    }, []);

    const updateFrames = useCallback((data, currentMode) => {
        let newFrames;
        if (currentMode === 'satellite') {
            newFrames = data?.satellite?.infrared || [];
        } else {
            newFrames = [...(data?.radar?.past || []), ...(data?.radar?.nowcast || [])];
        }
        setFrames(newFrames);
        setFrameIdx(Math.max(0, newFrames.length - 1));
    }, []);

    // Init Leaflet map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: [lat, lon],
            zoom: 7,
            zoomControl: false,
            attributionControl: false,
        });

        // Dark base tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 18,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Re-center map when location changes
    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lon], 7, { animate: true });
        }
    }, [lat, lon]);

    // Update overlay when frame or mode changes
    useEffect(() => {
        if (!mapInstanceRef.current || !host || frames.length === 0) return;
        const frame = frames[frameIdx];
        if (!frame) return;

        if (overlayRef.current) {
            mapInstanceRef.current.removeLayer(overlayRef.current);
        }

        const tileUrl = mode === 'satellite'
            ? `${host}${frame.path}/${TILE_SIZE}/{z}/{x}/{y}/0/0_0.png`
            : `${host}${frame.path}/${TILE_SIZE}/{z}/{x}/{y}/${COLOR_SCHEME}/${SMOOTH}_${SNOW}.png`;

        overlayRef.current = L.tileLayer(tileUrl, {
            opacity: mode === 'satellite' ? 0.6 : 0.7,
            maxZoom: 12,
        }).addTo(mapInstanceRef.current);
    }, [frameIdx, frames, host, mode]);

    // Animation playback
    useEffect(() => {
        if (!playing || frames.length <= 1) return;
        const interval = setInterval(() => {
            setFrameIdx(prev => (prev + 1) % frames.length);
        }, 500);
        return () => clearInterval(interval);
    }, [playing, frames.length]);

    // Switch mode
    const switchMode = useCallback((newMode) => {
        setMode(newMode);
        setPlaying(false);
        // Refetch to get correct frames
        fetch(RAINVIEWER_API)
            .then(r => r.json())
            .then(data => {
                setHost(data.host);
                updateFrames(data, newMode);
            })
            .catch(console.error);
    }, [updateFrames]);

    // Touch swipe (mobile)
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 60) {
            switchMode(dx > 0 ? 'radar' : 'satellite');
        }
    };

    // Frame timestamp
    const frameTime = frames[frameIdx]
        ? new Date(frames[frameIdx].time * 1000).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit'
        })
        : '';

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5"
        >
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                    {mode === 'radar' ? 'Radar' : 'Satellite'}
                </h2>

                {/* Toggle */}
                <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-0.5">
                    <button
                        onClick={() => switchMode('radar')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'radar'
                            ? 'bg-primary/15 text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Radio className="w-3.5 h-3.5" />
                        Radar
                    </button>
                    <button
                        onClick={() => switchMode('satellite')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'satellite'
                            ? 'bg-primary/15 text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Satellite className="w-3.5 h-3.5" />
                        Satellite
                    </button>
                </div>
            </div>

            <div
                className="relative rounded-2xl overflow-hidden border border-border"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Map container */}
                <div
                    ref={mapRef}
                    className="w-full h-64 sm:h-80"
                    style={{ background: '#0a0e17' }}
                />

                {/* Bottom controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5 flex items-center gap-3 z-[1000]">
                    <button
                        onClick={() => setPlaying(!playing)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-white"
                    >
                        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>

                    {/* Timeline scrubber */}
                    <input
                        type="range"
                        min={0}
                        max={Math.max(frames.length - 1, 0)}
                        value={frameIdx}
                        onChange={e => { setFrameIdx(parseInt(e.target.value)); setPlaying(false); }}
                        className="flex-1 h-1 accent-primary cursor-pointer"
                    />

                    <span className="text-[0.7rem] text-white/70 font-mono whitespace-nowrap min-w-[64px] text-right">
                        {frameTime}
                    </span>
                </div>
            </div>
        </motion.section>
    );
}
