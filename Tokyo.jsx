import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function TokyoSkyline() {
  const [time, setTime] = useState(0);
  const [scanline, setScanline] = useState(0);
  const [camera, setCamera] = useState({
    rotationY: 0.12,
    rotationX: 0.15,
    zoom: 1,
    panX: 0,
    panY: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState('rotate');
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState(0.72);
  const [showInfo, setShowInfo] = useState(true);
  const [weather, setWeather] = useState('clear');
  const [lightning, setLightning] = useState(false);
  const [windSpeed, setWindSpeed] = useState(0.25);
  const [showFuji, setShowFuji] = useState(true);
  const svgRef = useRef(null);

  // Particles
  const [rainDrops] = useState(() => 
    Array.from({ length: 180 }, () => ({
      x: Math.random() * 1000 - 50,
      y: Math.random() * 600,
      speed: 8 + Math.random() * 6,
      length: 10 + Math.random() * 15
    }))
  );

  const [cherryBlossoms] = useState(() =>
    Array.from({ length: 60 }, () => ({
      x: Math.random() * 1000,
      y: Math.random() * 600,
      size: 2 + Math.random() * 3,
      speed: 0.5 + Math.random() * 1,
      wobble: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2
    }))
  );

  const [clouds] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      x: i * 160 - 100,
      y: 25 + Math.random() * 40,
      width: 80 + Math.random() * 60,
      height: 25 + Math.random() * 20,
      speed: 0.2 + Math.random() * 0.3
    }))
  );

  // Lightning
  useEffect(() => {
    if (weather === 'storm') {
      const interval = setInterval(() => {
        if (Math.random() < 0.1) {
          setLightning(true);
          setTimeout(() => setLightning(false), 100);
          setTimeout(() => {
            if (Math.random() < 0.5) {
              setLightning(true);
              setTimeout(() => setLightning(false), 50);
            }
          }, 150);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [weather]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.02);
      setScanline(s => (s + 1) % 550);
      if (autoRotate && !isDragging) {
        setCamera(c => ({ ...c, rotationY: c.rotationY + 0.0012 }));
      }
    }, 33);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  // Mouse handlers
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    setIsDragging(true);
    setLastMouse({ x, y });
    setDragMode(e.shiftKey ? 'pan' : 'rotate');
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const dx = x - lastMouse.x;
    const dy = y - lastMouse.y;

    if (dragMode === 'rotate') {
      setCamera(c => ({
        ...c,
        rotationY: c.rotationY + dx * 0.004,
        rotationX: Math.max(-0.3, Math.min(1.0, c.rotationX + dy * 0.003))
      }));
    } else {
      setCamera(c => ({ ...c, panX: c.panX + dx, panY: c.panY + dy }));
    }
    setLastMouse({ x, y });
  }, [isDragging, lastMouse, dragMode]);

  const handlePointerUp = useCallback(() => setIsDragging(false), []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setCamera(c => ({
      ...c,
      zoom: Math.max(0.4, Math.min(2.5, c.zoom * (e.deltaY > 0 ? 0.92 : 1.08)))
    }));
  }, []);

  // Tokyo color palette - neon, vibrant
  const getColors = () => {
    const isNight = timeOfDay > 0.75;
    const isSunset = timeOfDay > 0.6 && timeOfDay <= 0.75;
    const isStormy = weather === 'storm' || weather === 'rain';
    
    let base;
    if (isNight) {
      base = {
        primary: '#00E5FF',
        secondary: '#FF1493',
        accent: '#FFD700',
        highlight: '#00FF7F',
        purple: '#9D4EDD',
        orange: '#FF6B35',
        teal: '#00CED1',
        red: '#FF4444',
        tokyoTower: '#FF4500',
        skytree: '#00BFFF',
        fuji: '#E8E8FF',
        pagoda: '#FF6B6B',
        water: '#001428',
        grid: '#1a0825',
        sky1: '#020306',
        sky2: '#040810',
        sky3: '#081018',
        sky4: '#0c1525'
      };
    } else if (isSunset) {
      base = {
        primary: '#00CCEE',
        secondary: '#FF1177',
        accent: '#FFAA00',
        highlight: '#00DD66',
        purple: '#8833CC',
        orange: '#FF5500',
        teal: '#00BBAA',
        red: '#EE3333',
        tokyoTower: '#FF3300',
        skytree: '#0099DD',
        fuji: '#FFE8F0',
        pagoda: '#EE5555',
        water: '#0a2035',
        grid: '#250820',
        sky1: '#100515',
        sky2: '#301030',
        sky3: '#703050',
        sky4: '#DD6530'
      };
    } else {
      base = {
        primary: '#0099CC',
        secondary: '#DD1177',
        accent: '#CCAA00',
        highlight: '#00AA55',
        purple: '#7733AA',
        orange: '#CC5500',
        teal: '#009999',
        red: '#CC3333',
        tokyoTower: '#DD3300',
        skytree: '#0088BB',
        fuji: '#DDEEFF',
        pagoda: '#CC4444',
        water: '#1a4060',
        grid: '#1a0818',
        sky1: '#4080C0',
        sky2: '#5090D0',
        sky3: '#70B0E0',
        sky4: '#90D0FF'
      };
    }

    if (isStormy) {
      base.sky1 = '#0a0a12';
      base.sky2 = '#141420';
      base.sky3 = '#202030',
      base.sky4 = '#303045';
      base.water = '#080815';
      base.fuji = '#888899';
    }

    return base;
  };

  const colors = getColors();
  const isNight = timeOfDay > 0.75;

  // 3D projection
  const project = (x, y, z) => {
    const cosY = Math.cos(camera.rotationY);
    const sinY = Math.sin(camera.rotationY);
    const rx = x * cosY - z * sinY;
    const rz = x * sinY + z * cosY;

    const cosX = Math.cos(camera.rotationX);
    const sinX = Math.sin(camera.rotationX);
    const ry = y * cosX - rz * sinX;
    const rz2 = y * sinX + rz * cosX;

    const fov = 500 * camera.zoom;
    const viewerZ = 600;
    const scale = fov / (rz2 + viewerZ);

    return {
      x: 450 + rx * scale + camera.panX,
      y: 330 - ry * scale + camera.panY,
      z: rz2,
      scale
    };
  };

  // Tokyo buildings
  const buildings = [
    // === TOKYO TOWER - Iconic orange lattice tower ===
    { x: -180, z: 50, w: 30, d: 30, h: 280, color: colors.tokyoTower, name: 'TOKYO TOWER', tokyoTower: true, info: { height: '1,092 ft', year: 1958, note: 'Iconic landmark' } },
    
    // === TOKYO SKYTREE - Tallest structure in Japan ===
    { x: 350, z: 70, w: 20, d: 20, h: 450, color: colors.skytree, name: 'TOKYO SKYTREE', skytree: true, info: { height: '2,080 ft', year: 2012, note: 'Tallest in Japan' } },
    
    // === SHINJUKU TOWERS ===
    // Tokyo Metropolitan Government Building (Twin Towers)
    { x: -80, z: 80, w: 40, d: 25, h: 230, color: colors.primary, name: 'METRO GOV', metroGov: true, info: { height: '797 ft', year: 1990, floors: 48, note: 'Twin towers' } },
    
    // Mode Gakuen Cocoon Tower
    { x: 30, z: 70, w: 36, d: 36, h: 200, color: colors.secondary, name: 'COCOON TOWER', cocoon: true, info: { height: '669 ft', year: 2008, floors: 50, note: 'Cocoon design' } },
    
    // NTT Docomo Yoyogi Building
    { x: -280, z: 75, w: 38, d: 38, h: 220, color: colors.purple, name: 'DOCOMO', docomo: true, info: { height: '787 ft', year: 2000, note: 'Clock tower top' } },
    
    // Shinjuku Park Tower
    { x: 110, z: 65, w: 34, d: 34, h: 210, color: colors.teal, name: 'PARK TOWER', info: { height: '771 ft', year: 1994, floors: 52 } },
    
    // Sumitomo Fudosan Shinjuku Grand Tower
    { x: 180, z: 80, w: 32, d: 32, h: 195, color: colors.highlight, name: 'SUMITOMO', info: { height: '679 ft', year: 2017, floors: 40 } },
    
    // Shinjuku Mitsui Building
    { x: -30, z: 90, w: 36, d: 36, h: 185, color: colors.accent, name: 'MITSUI', info: { height: '722 ft', year: 1974, floors: 55 } },
    
    // === ROPPONGI / MINATO ===
    // Roppongi Hills Mori Tower
    { x: 250, z: 60, w: 40, d: 40, h: 205, color: colors.orange, name: 'MORI TOWER', info: { height: '780 ft', year: 2003, floors: 54 } },
    
    // Tokyo Midtown
    { x: -140, z: 65, w: 32, d: 32, h: 220, color: colors.steel, name: 'MIDTOWN', info: { height: '813 ft', year: 2007, floors: 54 } },
    
    // === MORE TOWERS ===
    { x: 60, z: 95, w: 28, d: 28, h: 170, color: colors.purple },
    { x: -220, z: 90, w: 30, d: 30, h: 160, color: colors.teal },
    { x: 300, z: 85, w: 28, d: 28, h: 155, color: colors.primary },
    { x: -350, z: 75, w: 26, d: 26, h: 145, color: colors.highlight },
    { x: 400, z: 90, w: 30, d: 30, h: 140, color: colors.secondary },
    { x: -400, z: 85, w: 28, d: 28, h: 130, color: colors.orange },
    
    // === DENSE BACKGROUND - Tokyo is PACKED ===
    { x: -380, z: 150, w: 18, d: 18, h: 85, color: colors.purple },
    { x: -340, z: 160, w: 16, d: 16, h: 75, color: colors.teal },
    { x: -300, z: 155, w: 20, d: 20, h: 95, color: colors.primary },
    { x: -260, z: 165, w: 16, d: 16, h: 70, color: colors.secondary },
    { x: -220, z: 150, w: 18, d: 18, h: 80, color: colors.orange },
    { x: -180, z: 160, w: 16, d: 16, h: 65, color: colors.highlight },
    { x: -140, z: 155, w: 20, d: 20, h: 90, color: colors.purple },
    { x: -100, z: 165, w: 16, d: 16, h: 75, color: colors.teal },
    { x: -60, z: 150, w: 18, d: 18, h: 85, color: colors.primary },
    { x: -20, z: 160, w: 16, d: 16, h: 70, color: colors.secondary },
    { x: 20, z: 155, w: 20, d: 20, h: 95, color: colors.orange },
    { x: 60, z: 165, w: 16, d: 16, h: 65, color: colors.highlight },
    { x: 100, z: 150, w: 18, d: 18, h: 80, color: colors.purple },
    { x: 140, z: 160, w: 16, d: 16, h: 75, color: colors.teal },
    { x: 180, z: 155, w: 20, d: 20, h: 90, color: colors.primary },
    { x: 220, z: 165, w: 16, d: 16, h: 70, color: colors.secondary },
    { x: 260, z: 150, w: 18, d: 18, h: 85, color: colors.orange },
    { x: 300, z: 160, w: 16, d: 16, h: 65, color: colors.highlight },
    { x: 340, z: 155, w: 20, d: 20, h: 75, color: colors.purple },
    { x: 380, z: 165, w: 16, d: 16, h: 60, color: colors.teal },
    
    // Even more distant buildings - second row
    { x: -350, z: 200, w: 14, d: 14, h: 55, color: colors.primary },
    { x: -280, z: 210, w: 12, d: 12, h: 50, color: colors.secondary },
    { x: -210, z: 205, w: 14, d: 14, h: 60, color: colors.purple },
    { x: -140, z: 215, w: 12, d: 12, h: 45, color: colors.teal },
    { x: -70, z: 200, w: 14, d: 14, h: 55, color: colors.orange },
    { x: 0, z: 210, w: 12, d: 12, h: 50, color: colors.highlight },
    { x: 70, z: 205, w: 14, d: 14, h: 60, color: colors.primary },
    { x: 140, z: 215, w: 12, d: 12, h: 45, color: colors.secondary },
    { x: 210, z: 200, w: 14, d: 14, h: 55, color: colors.purple },
    { x: 280, z: 210, w: 12, d: 12, h: 50, color: colors.teal },
    { x: 350, z: 205, w: 14, d: 14, h: 45, color: colors.orange },
    
    // Third row - even more distant
    { x: -320, z: 250, w: 12, d: 12, h: 40, color: colors.highlight },
    { x: -250, z: 255, w: 10, d: 10, h: 35, color: colors.primary },
    { x: -180, z: 248, w: 12, d: 12, h: 45, color: colors.secondary },
    { x: -110, z: 258, w: 10, d: 10, h: 38, color: colors.purple },
    { x: -40, z: 250, w: 12, d: 12, h: 42, color: colors.teal },
    { x: 30, z: 255, w: 10, d: 10, h: 35, color: colors.orange },
    { x: 100, z: 248, w: 12, d: 12, h: 40, color: colors.highlight },
    { x: 170, z: 258, w: 10, d: 10, h: 38, color: colors.primary },
    { x: 240, z: 250, w: 12, d: 12, h: 45, color: colors.secondary },
    { x: 310, z: 255, w: 10, d: 10, h: 35, color: colors.purple },
    
    // Fourth row - horizon buildings
    { x: -280, z: 295, w: 10, d: 10, h: 32, color: colors.teal },
    { x: -200, z: 300, w: 8, d: 8, h: 28, color: colors.orange },
    { x: -120, z: 292, w: 10, d: 10, h: 35, color: colors.highlight },
    { x: -40, z: 298, w: 8, d: 8, h: 30, color: colors.primary },
    { x: 40, z: 295, w: 10, d: 10, h: 32, color: colors.secondary },
    { x: 120, z: 300, w: 8, d: 8, h: 28, color: colors.purple },
    { x: 200, z: 292, w: 10, d: 10, h: 35, color: colors.teal },
    { x: 280, z: 298, w: 8, d: 8, h: 30, color: colors.orange },
    
    // Fill gaps in foreground
    { x: -320, z: 100, w: 22, d: 22, h: 110, color: colors.highlight },
    { x: -250, z: 110, w: 20, d: 20, h: 95, color: colors.primary },
    { x: 280, z: 100, w: 22, d: 22, h: 105, color: colors.secondary },
    { x: 340, z: 115, w: 20, d: 20, h: 90, color: colors.purple },
    { x: -160, z: 105, w: 18, d: 18, h: 88, color: colors.teal },
    { x: 160, z: 108, w: 18, d: 18, h: 92, color: colors.orange },
    { x: -50, z: 102, w: 20, d: 20, h: 85, color: colors.highlight },
    { x: 220, z: 112, w: 18, d: 18, h: 80, color: colors.primary },
  ];

  // Render building wireframe
  const renderBuilding = (b, idx) => {
    const lines = [];
    const hw = b.w / 2;
    const hd = b.d / 2;
    const windowSpacing = 12;
    const fogOpacity = weather === 'fog' ? 0.5 : 1;

    // Tokyo Tower - Orange lattice Eiffel-style - MORE DETAILED
    if (b.tokyoTower) {
      const baseW = 50;
      const numSections = 50; // More sections for denser lattice
      
      for (let s = 0; s <= numSections; s++) {
        const t = s / numSections;
        const y = t * b.h;
        
        // Tower tapers as it goes up
        let sectionW;
        if (t < 0.6) {
          sectionW = baseW * (1 - t * 0.7);
        } else if (t < 0.85) {
          sectionW = baseW * 0.15;
        } else {
          sectionW = baseW * 0.08;
        }
        
        // Four corners at this height
        const corners = [
          [b.x - sectionW, b.z - sectionW],
          [b.x + sectionW, b.z - sectionW],
          [b.x + sectionW, b.z + sectionW],
          [b.x - sectionW, b.z + sectionW]
        ];
        
        // Horizontal rings - every section
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const p1 = project(c1[0], y, c1[1]);
          const p2 = project(c2[0], y, c2[1]);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, ring: true });
        }
        
        // Vertical edges (main structure)
        if (s < numSections) {
          const nextT = (s + 1) / numSections;
          const nextY = nextT * b.h;
          let nextW;
          if (nextT < 0.6) {
            nextW = baseW * (1 - nextT * 0.7);
          } else if (nextT < 0.85) {
            nextW = baseW * 0.15;
          } else {
            nextW = baseW * 0.08;
          }
          
          for (let i = 0; i < 4; i++) {
            const cx = i < 2 ? (i === 0 ? -1 : 1) : (i === 2 ? 1 : -1);
            const cz = i < 2 ? -1 : 1;
            
            const p1 = project(b.x + cx * sectionW, y, b.z + cz * sectionW);
            const p2 = project(b.x + cx * nextW, nextY, b.z + cz * nextW);
            lines.push({ ...p1, x2: p2.x, y2: p2.y, main: true });
          }
          
          // Cross bracing (lattice pattern) - MUCH MORE DENSE
          if (t < 0.6) {
            // X-bracing on each face
            for (let face = 0; face < 4; face++) {
              const cx1 = face < 2 ? (face === 0 ? -1 : 1) : (face === 2 ? 1 : -1);
              const cz1 = face < 2 ? -1 : (face === 2 ? 1 : 1);
              const cx2 = face < 2 ? (face === 0 ? 1 : -1) : (face === 2 ? -1 : 1);
              const cz2 = cz1;
              
              if (face === 0 || face === 2) {
                // Front and back faces
                const p1 = project(b.x + cx1 * sectionW, y, b.z + (face === 0 ? -1 : 1) * sectionW);
                const p2 = project(b.x + cx2 * nextW, nextY, b.z + (face === 0 ? -1 : 1) * nextW);
                lines.push({ ...p1, x2: p2.x, y2: p2.y, brace: true });
                
                const p3 = project(b.x - cx1 * sectionW, y, b.z + (face === 0 ? -1 : 1) * sectionW);
                const p4 = project(b.x - cx2 * nextW, nextY, b.z + (face === 0 ? -1 : 1) * nextW);
                lines.push({ ...p3, x2: p4.x, y2: p4.y, brace: true });
              }
            }
            
            // Side face X-bracing
            const sideP1 = project(b.x - sectionW, y, b.z - sectionW);
            const sideP2 = project(b.x - nextW, nextY, b.z + nextW);
            lines.push({ ...sideP1, x2: sideP2.x, y2: sideP2.y, brace: true });
            
            const sideP3 = project(b.x - sectionW, y, b.z + sectionW);
            const sideP4 = project(b.x - nextW, nextY, b.z - nextW);
            lines.push({ ...sideP3, x2: sideP4.x, y2: sideP4.y, brace: true });
            
            const sideP5 = project(b.x + sectionW, y, b.z - sectionW);
            const sideP6 = project(b.x + nextW, nextY, b.z + nextW);
            lines.push({ ...sideP5, x2: sideP6.x, y2: sideP6.y, brace: true });
            
            const sideP7 = project(b.x + sectionW, y, b.z + sectionW);
            const sideP8 = project(b.x + nextW, nextY, b.z - nextW);
            lines.push({ ...sideP7, x2: sideP8.x, y2: sideP8.y, brace: true });
          }
        }
      }
      
      // Main observation deck (at 60%) - more detailed
      const deckY = b.h * 0.6;
      const deckW = baseW * 0.3;
      for (let ring = 0; ring < 3; ring++) {
        const ringY = deckY - 5 + ring * 5;
        const ringW = deckW * (1 + ring * 0.1);
        for (let i = 0; i < 12; i++) {
          const angle1 = (i / 12) * Math.PI * 2;
          const angle2 = ((i + 1) / 12) * Math.PI * 2;
          const p1 = project(b.x + Math.cos(angle1) * ringW, ringY, b.z + Math.sin(angle1) * ringW);
          const p2 = project(b.x + Math.cos(angle2) * ringW, ringY, b.z + Math.sin(angle2) * ringW);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, deck: true });
        }
      }
      
      // Vertical supports for main deck
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const p1 = project(b.x + Math.cos(angle) * deckW, deckY - 5, b.z + Math.sin(angle) * deckW);
        const p2 = project(b.x + Math.cos(angle) * deckW * 1.2, deckY + 5, b.z + Math.sin(angle) * deckW * 1.2);
        lines.push({ ...p1, x2: p2.x, y2: p2.y, deck: true });
      }
      
      // Special observation (at 85%) - more detailed
      const specialY = b.h * 0.85;
      const specialW = baseW * 0.15;
      for (let ring = 0; ring < 2; ring++) {
        const ringY = specialY + ring * 4;
        for (let i = 0; i < 10; i++) {
          const angle1 = (i / 10) * Math.PI * 2;
          const angle2 = ((i + 1) / 10) * Math.PI * 2;
          const p1 = project(b.x + Math.cos(angle1) * specialW, ringY, b.z + Math.sin(angle1) * specialW);
          const p2 = project(b.x + Math.cos(angle2) * specialW, ringY, b.z + Math.sin(angle2) * specialW);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, deck: true });
        }
      }
      
      // Antenna with more detail
      const antBase = project(b.x, b.h, b.z);
      const antMid = project(b.x, b.h + 20, b.z);
      const antTop = project(b.x, b.h + 40, b.z);
      lines.push({ ...antBase, x2: antMid.x, y2: antMid.y, antenna: true });
      lines.push({ ...antMid, x2: antTop.x, y2: antTop.y, antenna: true });
      
      // Antenna crossbars
      for (let ab = 0; ab < 3; ab++) {
        const abY = b.h + 5 + ab * 12;
        const abW = 3 - ab * 0.5;
        const abP1 = project(b.x - abW, abY, b.z);
        const abP2 = project(b.x + abW, abY, b.z);
        lines.push({ ...abP1, x2: abP2.x, y2: abP2.y, antenna: true });
      }
    }
    // Tokyo Skytree - Ultra-tall broadcasting tower
    else if (b.skytree) {
      const baseW = 35;
      const numSections = 50;
      
      for (let s = 0; s <= numSections; s++) {
        const t = s / numSections;
        const y = t * b.h;
        
        // Skytree is triangular at base, becomes circular
        // Width tapers in a specific way
        let sectionW;
        if (t < 0.65) {
          sectionW = baseW * (1 - t * 0.6);
        } else if (t < 0.72) {
          sectionW = baseW * 0.25; // First tembo deck
        } else if (t < 0.87) {
          sectionW = baseW * 0.15;
        } else {
          sectionW = baseW * 0.08; // Antenna section
        }
        
        // Triangular cross-section morphing to circular
        const numSides = t < 0.3 ? 3 : (t < 0.5 ? 6 : 12);
        
        if (s % 2 === 0) {
          for (let i = 0; i < numSides; i++) {
            const angle1 = (i / numSides) * Math.PI * 2 - Math.PI / 2;
            const angle2 = ((i + 1) / numSides) * Math.PI * 2 - Math.PI / 2;
            const p1 = project(b.x + Math.cos(angle1) * sectionW, y, b.z + Math.sin(angle1) * sectionW);
            const p2 = project(b.x + Math.cos(angle2) * sectionW, y, b.z + Math.sin(angle2) * sectionW);
            lines.push({ ...p1, x2: p2.x, y2: p2.y, ring: true });
          }
        }
        
        // Vertical structure
        if (s < numSections) {
          const nextT = (s + 1) / numSections;
          const nextY = nextT * b.h;
          let nextW;
          if (nextT < 0.65) {
            nextW = baseW * (1 - nextT * 0.6);
          } else if (nextT < 0.72) {
            nextW = baseW * 0.25;
          } else if (nextT < 0.87) {
            nextW = baseW * 0.15;
          } else {
            nextW = baseW * 0.08;
          }
          
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
            const p1 = project(b.x + Math.cos(angle) * sectionW, y, b.z + Math.sin(angle) * sectionW);
            const p2 = project(b.x + Math.cos(angle) * nextW, nextY, b.z + Math.sin(angle) * nextW);
            lines.push({ ...p1, x2: p2.x, y2: p2.y, main: true });
          }
        }
      }
      
      // Tembo Deck (observation deck at 65%)
      const temboY = b.h * 0.65;
      const temboW = baseW * 0.3;
      for (let ring = 0; ring < 3; ring++) {
        const ringY = temboY + ring * 8;
        for (let i = 0; i < 12; i++) {
          const angle1 = (i / 12) * Math.PI * 2;
          const angle2 = ((i + 1) / 12) * Math.PI * 2;
          const p1 = project(b.x + Math.cos(angle1) * temboW, ringY, b.z + Math.sin(angle1) * temboW);
          const p2 = project(b.x + Math.cos(angle2) * temboW, ringY, b.z + Math.sin(angle2) * temboW);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, tembo: true });
        }
      }
      
      // Tembo Galleria (higher observation at 72%)
      const galleriaY = b.h * 0.72;
      const galleriaW = baseW * 0.2;
      for (let i = 0; i < 12; i++) {
        const angle1 = (i / 12) * Math.PI * 2;
        const angle2 = ((i + 1) / 12) * Math.PI * 2;
        const p1 = project(b.x + Math.cos(angle1) * galleriaW, galleriaY, b.z + Math.sin(angle1) * galleriaW);
        const p2 = project(b.x + Math.cos(angle2) * galleriaW, galleriaY, b.z + Math.sin(angle2) * galleriaW);
        lines.push({ ...p1, x2: p2.x, y2: p2.y, tembo: true });
      }
      
      // Antenna at top
      const antBase = project(b.x, b.h, b.z);
      const antTop = project(b.x, b.h + 40, b.z);
      lines.push({ ...antBase, x2: antTop.x, y2: antTop.y, antenna: true });
    }
    // Tokyo Metropolitan Government Building - Twin towers
    else if (b.metroGov) {
      // Two connected towers
      const towers = [
        { ox: -15, h: b.h },
        { ox: 15, h: b.h * 0.95 }
      ];
      
      towers.forEach((tower, ti) => {
        const tw = 16;
        const corners = [
          [b.x + tower.ox - tw/2, b.z - hd], [b.x + tower.ox + tw/2, b.z - hd],
          [b.x + tower.ox + tw/2, b.z + hd], [b.x + tower.ox - tw/2, b.z + hd]
        ];
        
        corners.forEach(([cx, cz]) => {
          const p1 = project(cx, 0, cz);
          const p2 = project(cx, tower.h, cz);
          lines.push({ ...p1, x2: p2.x, y2: p2.y });
        });
        
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const pb = project(c1[0], 0, c1[1]);
          const pb2 = project(c2[0], 0, c2[1]);
          const pt = project(c1[0], tower.h, c1[1]);
          const pt2 = project(c2[0], tower.h, c2[1]);
          lines.push({ ...pb, x2: pb2.x, y2: pb2.y });
          lines.push({ ...pt, x2: pt2.x, y2: pt2.y });
        }
        
        // Notch at top (distinctive split)
        const notchY = tower.h * 0.85;
        for (let i = 0; i < 4; i++) {
          const c = corners[i];
          const p1 = project(c[0], notchY, c[1]);
          const p2 = project(c[0], tower.h, c[1]);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, notch: true });
        }
        
        // Floor lines
        for (let f = 0; f < 15; f++) {
          const y = (f / 15) * tower.h;
          const p1 = project(b.x + tower.ox - tw/2, y, b.z - hd);
          const p2 = project(b.x + tower.ox + tw/2, y, b.z - hd);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
        }
      });
      
      // Connection between towers at base
      const connY = b.h * 0.3;
      const conn1 = project(b.x - 15 + 8, connY, b.z);
      const conn2 = project(b.x + 15 - 8, connY, b.z);
      lines.push({ ...conn1, x2: conn2.x, y2: conn2.y });
    }
    // Mode Gakuen Cocoon Tower - Diagonal lattice
    else if (b.cocoon) {
      const numRings = 25;
      
      for (let r = 0; r <= numRings; r++) {
        const t = r / numRings;
        const y = t * b.h;
        
        // Cocoon shape - wider in middle
        const bulge = Math.sin(t * Math.PI) * 0.3;
        const radius = hw * (0.85 + bulge);
        
        // Elliptical cross-section
        for (let i = 0; i < 12; i++) {
          const angle1 = (i / 12) * Math.PI * 2;
          const angle2 = ((i + 1) / 12) * Math.PI * 2;
          const p1 = project(b.x + Math.cos(angle1) * radius, y, b.z + Math.sin(angle1) * radius * 0.8);
          const p2 = project(b.x + Math.cos(angle2) * radius, y, b.z + Math.sin(angle2) * radius * 0.8);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, ring: true });
        }
        
        // Diagonal lattice pattern
        if (r < numRings) {
          const nextT = (r + 1) / numRings;
          const nextY = nextT * b.h;
          const nextBulge = Math.sin(nextT * Math.PI) * 0.3;
          const nextRadius = hw * (0.85 + nextBulge);
          
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const nextAngle = ((i + 0.5) / 6) * Math.PI * 2;
            
            const p1 = project(b.x + Math.cos(angle) * radius, y, b.z + Math.sin(angle) * radius * 0.8);
            const p2 = project(b.x + Math.cos(nextAngle) * nextRadius, nextY, b.z + Math.sin(nextAngle) * nextRadius * 0.8);
            lines.push({ ...p1, x2: p2.x, y2: p2.y, lattice: true });
            
            const p3 = project(b.x + Math.cos(angle) * radius, y, b.z + Math.sin(angle) * radius * 0.8);
            const p4 = project(b.x + Math.cos(angle - 0.5 / 6 * Math.PI * 2) * nextRadius, nextY, b.z + Math.sin(angle - 0.5 / 6 * Math.PI * 2) * nextRadius * 0.8);
            lines.push({ ...p3, x2: p4.x, y2: p4.y, lattice: true });
          }
        }
      }
    }
    // NTT Docomo - Clock tower top
    else if (b.docomo) {
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      corners.forEach(([cx, cz]) => {
        const p1 = project(cx, 0, cz);
        const p2 = project(cx, b.h * 0.85, cz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      for (let i = 0; i < 4; i++) {
        const c1 = corners[i], c2 = corners[(i + 1) % 4];
        const pb = project(c1[0], 0, c1[1]);
        const pb2 = project(c2[0], 0, c2[1]);
        lines.push({ ...pb, x2: pb2.x, y2: pb2.y });
        
        const pt = project(c1[0], b.h * 0.85, c1[1]);
        const pt2 = project(c2[0], b.h * 0.85, c2[1]);
        lines.push({ ...pt, x2: pt2.x, y2: pt2.y });
      }
      
      // Clock tower section at top
      const clockBase = b.h * 0.85;
      const clockW = hw * 0.5;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const nextAngle = ((i + 1) / 4) * Math.PI * 2 + Math.PI / 4;
        
        const p1 = project(b.x + Math.cos(angle) * clockW, clockBase, b.z + Math.sin(angle) * clockW);
        const p2 = project(b.x + Math.cos(angle) * clockW * 0.7, b.h, b.z + Math.sin(angle) * clockW * 0.7);
        lines.push({ ...p1, x2: p2.x, y2: p2.y, clock: true });
        
        const p3 = project(b.x + Math.cos(angle) * clockW, clockBase, b.z + Math.sin(angle) * clockW);
        const p4 = project(b.x + Math.cos(nextAngle) * clockW, clockBase, b.z + Math.sin(nextAngle) * clockW);
        lines.push({ ...p3, x2: p4.x, y2: p4.y, clock: true });
      }
      
      // Pyramid top
      const pyramidBase = project(b.x, b.h, b.z);
      const pyramidTop = project(b.x, b.h + 20, b.z);
      lines.push({ ...pyramidBase, x2: pyramidTop.x, y2: pyramidTop.y, spire: true });
      
      // Floor lines
      for (let f = 0; f < 16; f++) {
        const y = (f / 16) * b.h * 0.85;
        const p1 = project(b.x - hw, y, b.z - hd);
        const p2 = project(b.x + hw, y, b.z - hd);
        lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
      }
    }
    // Regular building
    else {
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      corners.forEach(([cx, cz]) => {
        const p1 = project(cx, 0, cz);
        const p2 = project(cx, b.h, cz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      for (let i = 0; i < 4; i++) {
        const c1 = corners[i], c2 = corners[(i + 1) % 4];
        const pb = project(c1[0], 0, c1[1]);
        const pb2 = project(c2[0], 0, c2[1]);
        const pt = project(c1[0], b.h, c1[1]);
        const pt2 = project(c2[0], b.h, c2[1]);
        lines.push({ ...pb, x2: pb2.x, y2: pb2.y });
        lines.push({ ...pt, x2: pt2.x, y2: pt2.y });
      }
      
      const floorCount = Math.floor(b.h / windowSpacing);
      for (let f = 1; f < floorCount; f++) {
        const y = f * windowSpacing;
        const p1 = project(b.x - hw, y, b.z - hd);
        const p2 = project(b.x + hw, y, b.z - hd);
        lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
      }
    }

    return lines.map((l, i) => {
      const lineColor = b.tokyoTower ? colors.tokyoTower : 
                       b.skytree ? colors.skytree : 
                       b.color;
      
      return (
        <line
          key={`b${idx}-${i}`}
          x1={l.x} y1={l.y} x2={l.x2} y2={l.y2}
          stroke={lineColor}
          strokeWidth={l.antenna ? 1.5 : l.main ? 1.3 : l.deck || l.tembo ? 1 : l.lattice ? 0.7 : l.brace ? 0.5 : l.ring ? 0.6 : l.clock ? 0.9 : l.floor ? 0.2 : 1}
          opacity={(l.floor ? 0.15 : l.brace ? 0.5 : l.ring ? 0.7 : l.lattice ? 0.6 : 0.85) * fogOpacity}
          style={{ 
            filter: isNight && !lightning ? 
              `drop-shadow(0 0 ${l.deck || l.tembo || l.antenna ? 5 : 2}px ${lineColor})` : 'none' 
          }}
        />
      );
    });
  };

  // Mt. Fuji - THE BACKDROP - BIGGER & MORE PROMINENT
  const renderFuji = () => {
    if (!showFuji || weather === 'storm' || weather === 'fog') return null;
    const elements = [];
    
    const fx = 50, fz = 400; // Centered, far background
    const fujiHeight = 420; // Much taller
    const fujiWidth = 480; // Much wider
    const snowLine = fujiHeight * 0.5;
    const fogOpacity = weather === 'rain' ? 0.4 : 0.95;
    
    // Mountain silhouette - smooth volcanic cone
    const numPoints = 60;
    let prevP = null;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = fx - fujiWidth + t * fujiWidth * 2;
      
      // Classic Fuji shape - gentle curve up to peak
      const distFromCenter = Math.abs(t - 0.5) * 2;
      const h = fujiHeight * Math.pow(1 - distFromCenter, 1.7);
      
      const p = project(x, h, fz);
      
      if (prevP) {
        elements.push(
          <line key={`fuji-${i}`} x1={prevP.x} y1={prevP.y} x2={p.x} y2={p.y}
            stroke={colors.fuji} strokeWidth="2.5" opacity={fogOpacity * 0.95}
            style={isNight ? { filter: `drop-shadow(0 0 4px ${colors.fuji})` } : {}} />
        );
      }
      prevP = p;
    }
    
    // Additional contour lines for depth
    for (let contour = 1; contour <= 3; contour++) {
      const contourH = fujiHeight * (0.3 + contour * 0.15);
      const contourW = fujiWidth * (1 - contourH / fujiHeight) * 1.1;
      let prevContourP = null;
      
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const x = fx - contourW + t * contourW * 2;
        const distFromCenter = Math.abs(t - 0.5) * 2;
        const h = contourH * (1 - distFromCenter * 0.3);
        
        const p = project(x, h, fz + contour * 5);
        if (prevContourP) {
          elements.push(
            <line key={`fuji-contour-${contour}-${i}`} x1={prevContourP.x} y1={prevContourP.y} x2={p.x} y2={p.y}
              stroke={colors.fuji} strokeWidth="0.8" opacity={(0.4 - contour * 0.08) * fogOpacity} />
          );
        }
        prevContourP = p;
      }
    }
    
    // Snow cap lines - more detailed
    for (let ring = 0; ring < 12; ring++) {
      const ringH = snowLine + ring * 22;
      const ringW = fujiWidth * (1 - ringH / fujiHeight) * 0.95;
      
      if (ringH >= fujiHeight) continue;
      
      let prevSnowP = null;
      for (let i = 0; i <= 25; i++) {
        const t = i / 25;
        const x = fx - ringW + t * ringW * 2;
        
        // Add some jaggedness for snow
        const jag = Math.sin(i * 2.5 + ring * 1.3) * 4;
        const h = ringH + jag;
        
        if (h < fujiHeight) {
          const p = project(x, h, fz - ring * 2);
          if (prevSnowP) {
            elements.push(
              <line key={`snow-${ring}-${i}`} x1={prevSnowP.x} y1={prevSnowP.y} x2={p.x} y2={p.y}
                stroke="#FFFFFF" strokeWidth={ring === 0 ? 2 : ring < 3 ? 1.2 : 0.7} 
                opacity={(0.85 - ring * 0.06) * fogOpacity}
                style={{ filter: isNight ? 'drop-shadow(0 0 3px #fff)' : 'none' }} />
            );
          }
          prevSnowP = p;
        }
      }
    }
    
    // Peak with glow
    const peakP = project(fx, fujiHeight, fz);
    elements.push(
      <circle key="fuji-peak" cx={peakP.x} cy={peakP.y} r={4}
        fill="#FFFFFF" opacity={fogOpacity * 0.9}
        style={{ filter: isNight ? 'drop-shadow(0 0 5px #fff)' : 'none' }} />
    );
    
    // Label
    elements.push(
      <text key="fuji-label" x={peakP.x} y={peakP.y - 18} fill={colors.fuji} fontSize="10"
        textAnchor="middle" fontFamily="monospace" fontWeight="bold" opacity={fogOpacity * 0.9}
        style={isNight ? { filter: `drop-shadow(0 0 3px ${colors.fuji})` } : {}}>
        富士山 MT. FUJI
      </text>
    );
    
    return elements;
  };

  // Traditional Pagoda (Senso-ji style)
  const renderPagoda = () => {
    const elements = [];
    const px = -380, pz = -20;
    const fogOpacity = weather === 'fog' ? 0.5 : 1;
    
    // Five-story pagoda
    const floors = 5;
    const baseW = 30;
    const floorH = 25;
    
    for (let f = 0; f < floors; f++) {
      const y = f * floorH;
      const scale = 1 - f * 0.12;
      const fw = baseW * scale;
      
      // Floor platform
      const corners = [
        [px - fw, pz - fw * 0.6], [px + fw, pz - fw * 0.6],
        [px + fw, pz + fw * 0.6], [px - fw, pz + fw * 0.6]
      ];
      
      for (let i = 0; i < 4; i++) {
        const c1 = corners[i], c2 = corners[(i + 1) % 4];
        const p1 = project(c1[0], y + floorH * 0.7, c1[1]);
        const p2 = project(c2[0], y + floorH * 0.7, c2[1]);
        elements.push(
          <line key={`pagoda-floor${f}-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={colors.pagoda} strokeWidth="1.2" opacity={0.85 * fogOpacity}
            style={isNight ? { filter: `drop-shadow(0 0 2px ${colors.pagoda})` } : {}} />
        );
      }
      
      // Roof (curved eaves)
      const roofW = fw * 1.3;
      const roofY = y + floorH;
      
      // Curved roof edges
      for (let side = 0; side < 4; side++) {
        const numCurve = 8;
        let prevRoofP = null;
        
        for (let c = 0; c <= numCurve; c++) {
          const t = c / numCurve;
          const curveUp = Math.pow(Math.abs(t - 0.5) * 2, 2) * 8;
          
          let rx, rz;
          if (side === 0) {
            rx = px - roofW + t * roofW * 2;
            rz = pz - roofW * 0.6;
          } else if (side === 2) {
            rx = px + roofW - t * roofW * 2;
            rz = pz + roofW * 0.6;
          } else if (side === 1) {
            rx = px + roofW;
            rz = pz - roofW * 0.6 + t * roofW * 1.2;
          } else {
            rx = px - roofW;
            rz = pz + roofW * 0.6 - t * roofW * 1.2;
          }
          
          const p = project(rx, roofY - curveUp, rz);
          if (prevRoofP) {
            elements.push(
              <line key={`pagoda-roof${f}-${side}-${c}`} 
                x1={prevRoofP.x} y1={prevRoofP.y} x2={p.x} y2={p.y}
                stroke={colors.pagoda} strokeWidth="0.8" opacity={0.7 * fogOpacity} />
            );
          }
          prevRoofP = p;
        }
      }
      
      // Pillars
      const pillarPositions = [
        [px - fw * 0.7, pz - fw * 0.4],
        [px + fw * 0.7, pz - fw * 0.4],
        [px - fw * 0.7, pz + fw * 0.4],
        [px + fw * 0.7, pz + fw * 0.4]
      ];
      
      pillarPositions.forEach(([pillarX, pillarZ], pi) => {
        const p1 = project(pillarX * scale, y, pillarZ * scale);
        const p2 = project(pillarX * scale, y + floorH * 0.7, pillarZ * scale);
        elements.push(
          <line key={`pagoda-pillar${f}-${pi}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={colors.pagoda} strokeWidth="0.6" opacity={0.5 * fogOpacity} />
        );
      });
    }
    
    // Spire at top
    const spireBase = project(px, floors * floorH, pz);
    const spireTop = project(px, floors * floorH + 35, pz);
    elements.push(
      <line key="pagoda-spire" x1={spireBase.x} y1={spireBase.y} x2={spireTop.x} y2={spireTop.y}
        stroke={colors.accent} strokeWidth="1.5" opacity={0.9 * fogOpacity}
        style={isNight ? { filter: `drop-shadow(0 0 3px ${colors.accent})` } : {}} />
    );
    
    // Decorative rings on spire
    for (let r = 0; r < 5; r++) {
      const ringY = floors * floorH + 8 + r * 5;
      const ringP = project(px, ringY, pz);
      elements.push(
        <circle key={`spire-ring${r}`} cx={ringP.x} cy={ringP.y} r={3 - r * 0.4}
          fill="none" stroke={colors.accent} strokeWidth="0.5" opacity={0.7 * fogOpacity} />
      );
    }
    
    // Label
    const labelP = project(px, floors * floorH + 50, pz);
    elements.push(
      <text key="pagoda-label" x={labelP.x} y={labelP.y} fill={colors.pagoda} fontSize="6"
        textAnchor="middle" fontFamily="monospace" fontWeight="bold" opacity={0.8 * fogOpacity}>
        五重塔 PAGODA
      </text>
    );
    
    return elements;
  };

  // Ground grid
  const renderGrid = () => {
    const lines = [];
    const fogOpacity = weather === 'fog' ? 0.06 : 0.15;
    
    for (let x = -450; x <= 480; x += 45) {
      const p1 = project(x, 0, -50);
      const p2 = project(x, 0, 250);
      lines.push(<line key={`gx${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.3" opacity={fogOpacity} />);
    }
    for (let z = -50; z <= 250; z += 45) {
      const p1 = project(-450, 0, z);
      const p2 = project(480, 0, z);
      lines.push(<line key={`gz${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.3" opacity={fogOpacity} />);
    }
    return lines;
  };

  // Weather effects
  const renderRain = () => {
    if (weather !== 'rain' && weather !== 'storm') return null;
    const intensity = weather === 'storm' ? 1.5 : 1;
    return (
      <g>
        {rainDrops.map((drop, i) => {
          const x = ((drop.x + time * (drop.speed * 10) * windSpeed + windSpeed * 100) % 1000);
          const y = ((drop.y + time * drop.speed * 50) % 600);
          return (
            <line key={`rain-${i}`} x1={x} y1={y} x2={x + windSpeed * drop.length} y2={y + drop.length}
              stroke={colors.primary} strokeWidth={0.6 * intensity} opacity={0.3 * intensity} />
          );
        })}
      </g>
    );
  };

  // Cherry blossoms (sakura) - special for Tokyo!
  const renderSakura = () => {
    if (weather !== 'clear' || timeOfDay > 0.75) return null;
    return (
      <g>
        {cherryBlossoms.map((petal, i) => {
          const wobbleX = Math.sin(time * 2 + petal.wobble) * 30 * windSpeed;
          const wobbleY = Math.cos(time * 1.5 + petal.wobble) * 10;
          const x = ((petal.x + wobbleX + time * 25 * windSpeed) % 1000);
          const y = ((petal.y + wobbleY + time * petal.speed * 20) % 600);
          const rot = (time * 50 + petal.rotation * 180) % 360;
          
          return (
            <g key={`sakura-${i}`} transform={`translate(${x},${y}) rotate(${rot})`}>
              <ellipse rx={petal.size} ry={petal.size * 0.6}
                fill="#FFB7C5" opacity={0.6} />
              <ellipse rx={petal.size * 0.3} ry={petal.size * 0.3}
                fill="#FF69B4" opacity={0.4} />
            </g>
          );
        })}
      </g>
    );
  };

  const renderClouds = () => {
    if (weather === 'clear' && timeOfDay > 0.3 && timeOfDay < 0.7) return null;
    const cloudOpacity = weather === 'storm' ? 0.6 : weather === 'fog' ? 0.45 : 0.3;
    const cloudColor = weather === 'storm' ? '#151520' : '#7080a0';
    
    return (
      <g>
        {clouds.map((cloud, i) => {
          const x = ((cloud.x + time * cloud.speed * 14 * (1 + windSpeed)) % 1100) - 100;
          return (
            <g key={`cloud-${i}`} opacity={cloudOpacity}>
              <ellipse cx={x} cy={cloud.y} rx={cloud.width / 2} ry={cloud.height / 2} fill={cloudColor} />
              <ellipse cx={x - cloud.width * 0.3} cy={cloud.y + 3} rx={cloud.width / 3.5} ry={cloud.height / 2.8} fill={cloudColor} />
              <ellipse cx={x + cloud.width * 0.3} cy={cloud.y + 2} rx={cloud.width / 3.5} ry={cloud.height / 2.8} fill={cloudColor} />
            </g>
          );
        })}
      </g>
    );
  };

  const renderLightning = () => {
    if (!lightning) return null;
    const boltX = 150 + Math.random() * 600;
    const points = [];
    let y = 0, x = boltX;
    while (y < 340) {
      points.push(`${x},${y}`);
      y += 18 + Math.random() * 26;
      x += (Math.random() - 0.5) * 50;
    }
    return (
      <g>
        <rect x="0" y="0" width="900" height="520" fill="#fff" opacity="0.2" />
        <polyline points={points.join(' ')} fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.9"
          style={{ filter: 'drop-shadow(0 0 8px #fff)' }} />
      </g>
    );
  };

  const renderFog = () => {
    if (weather !== 'fog') return null;
    return (
      <g>
        {[...Array(7)].map((_, i) => (
          <rect key={`fog-${i}`} x={-50 + Math.sin(time * 0.25 + i) * 20} y={200 + i * 45}
            width="1000" height="50" fill={`url(#fogGrad)`} opacity={0.12 + i * 0.025} />
        ))}
      </g>
    );
  };

  const renderCelestial = () => {
    if (weather === 'storm' || weather === 'fog') return null;
    if (timeOfDay > 0.7) {
      return (
        <g>
          <circle cx="780" cy="50" r="15" fill="none" stroke={colors.accent} strokeWidth="0.6" opacity="0.4" />
          <circle cx="780" cy="50" r="12" fill={colors.accent} opacity="0.06" />
        </g>
      );
    } else if (timeOfDay < 0.3 || timeOfDay > 0.6) {
      const sunY = timeOfDay < 0.3 ? 70 - timeOfDay * 140 : 70 - (1 - timeOfDay) * 110;
      return (
        <g>
          <circle cx="800" cy={sunY} r="24" fill={colors.orange} opacity="0.25" />
          <circle cx="800" cy={sunY} r="15" fill={colors.accent} opacity="0.4" />
        </g>
      );
    }
    return null;
  };

  const getBuildingDepth = (b) => project(b.x, b.h / 2, b.z).z;
  const weatherIcons = { clear: '🌸', rain: '🌧️', storm: '⛈️', fog: '🌫️' };

  return (
    <div style={{
      background: `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 25%, ${colors.sky3} 50%, ${colors.sky4} 100%)`,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
      fontFamily: 'monospace',
      userSelect: 'none'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '5px' }}>
        <svg width="36" height="36" viewBox="0 0 100 100">
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke={colors.secondary} strokeWidth="3"/>
          <line x1="50" y1="10" x2="50" y2="50" stroke={colors.highlight} strokeWidth="3"/>
          <line x1="10" y1="30" x2="50" y2="50" stroke={colors.primary} strokeWidth="3"/>
          <line x1="90" y1="30" x2="50" y2="50" stroke={colors.accent} strokeWidth="3"/>
        </svg>
        <div>
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px' }}>
            東京 TOKYO
          </div>
          <div style={{ color: colors.highlight, fontSize: '8px', letterSpacing: '3px' }}>
            SGI IRIS 1400 • 新宿 SHINJUKU
          </div>
        </div>
        <div style={{ marginLeft: '15px', fontSize: '20px' }}>{weatherIcons[weather]}</div>
      </div>

      {/* Main display */}
      <div style={{ background: '#080808', borderRadius: '10px', padding: '5px', boxShadow: '0 8px 25px rgba(0,0,0,0.85)' }}>
        <svg
          ref={svgRef}
          width="900"
          height="520"
          style={{
            background: lightning ? '#252530' : `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 22%, ${colors.sky3} 46%, ${colors.sky4} 72%, ${colors.water}15 100%)`,
            borderRadius: '6px',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none'
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onWheel={handleWheel}
        >
          <defs>
            <pattern id="scan" patternUnits="userSpaceOnUse" width="4" height="4">
              <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(0,0,0,0.08)" strokeWidth="1"/>
            </pattern>
            <linearGradient id="fogGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8090a0" stopOpacity="0"/>
              <stop offset="50%" stopColor="#8090a0" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#8090a0" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Stars */}
          {isNight && weather === 'clear' && [...Array(90)].map((_, i) => (
            <circle key={`star${i}`}
              cx={(Math.sin(i * 127.1) * 0.5 + 0.5) * 900}
              cy={(Math.cos(i * 311.7) * 0.5 + 0.5) * 130}
              r={0.4 + Math.random() * 0.35}
              fill="#fff"
              opacity={0.08 + Math.sin(time * 1.6 + i) * 0.06} />
          ))}

          {renderClouds()}
          {renderCelestial()}
          {renderFuji()}
          {renderGrid()}
          {renderPagoda()}

          {/* Buildings */}
          {buildings
            .map((b, i) => ({ ...b, idx: i, depth: getBuildingDepth(b) }))
            .sort((a, b) => b.depth - a.depth)
            .map(b => renderBuilding(b, b.idx))}

          {/* Labels */}
          {showInfo && weather !== 'storm' && buildings.filter(b => b.name).map((b, i) => {
            const labelY = b.h + (b.tokyoTower || b.skytree ? 50 : 18);
            const lp = project(b.x, labelY, b.z);
            if (lp.z < -200) return null;
            return (
              <text key={`lbl${i}`} x={lp.x} y={lp.y} fill={b.color} fontSize="5.5"
                fontFamily="monospace" textAnchor="middle" fontWeight="bold"
                opacity={weather === 'fog' ? 0.35 : 0.85}
                style={isNight && !lightning ? { filter: `drop-shadow(0 0 2px ${b.color})` } : {}}>
                {b.name}
              </text>
            );
          })}

          {renderFog()}
          {renderRain()}
          {renderSakura()}
          {renderLightning()}

          <text x="450" y="498" fill={colors.grid} fontSize="8" textAnchor="middle" opacity={weather === 'fog' ? 0.12 : 0.22}>
            ★ 大都市 METROPOLIS ★
          </text>

          <rect width="900" height="520" fill="url(#scan)" opacity="0.18"/>
          <rect x="0" y={scanline} width="900" height="1" fill="rgba(255,255,255,0.008)"/>
        </svg>
      </div>

      {/* Weather Controls */}
      <div style={{ marginTop: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['clear', 'rain', 'storm', 'fog'].map(w => (
          <button key={w} onClick={() => setWeather(w)} style={{
            background: weather === w ? colors.primary : 'transparent',
            border: `1px solid ${colors.primary}`,
            color: weather === w ? '#000' : colors.primary,
            padding: '3px 9px', borderRadius: '4px', cursor: 'pointer',
            fontFamily: 'monospace', fontSize: '8px',
            display: 'flex', alignItems: 'center', gap: '3px'
          }}>
            {weatherIcons[w]} {w === 'clear' ? 'SAKURA' : w.toUpperCase()}
          </button>
        ))}
        <button onClick={() => setShowFuji(f => !f)} style={{
          background: showFuji ? colors.fuji : 'transparent',
          border: `1px solid ${colors.fuji}`,
          color: showFuji ? '#333' : colors.fuji,
          padding: '3px 9px', borderRadius: '4px', cursor: 'pointer',
          fontFamily: 'monospace', fontSize: '8px'
        }}>🗻 FUJI</button>
      </div>

      {/* Sliders */}
      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: colors.highlight, fontSize: '7px' }}>🍃</span>
        <input type="range" min="0" max="1" step="0.05" value={windSpeed}
          onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
          style={{ width: '95px', accentColor: colors.highlight }} />
        <span style={{ color: '#666', fontSize: '7px' }}>{Math.round(windSpeed * 30)} km/h</span>
      </div>

      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: colors.accent, fontSize: '7px' }}>🌅</span>
        <input type="range" min="0" max="1" step="0.01" value={timeOfDay}
          onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
          style={{ width: '120px', accentColor: colors.accent }} />
        <span style={{ color: colors.primary, fontSize: '7px' }}>🌙</span>
        <span style={{ color: '#666', fontSize: '7px', marginLeft: '2px' }}>
          {timeOfDay < 0.25 ? '日の出' : timeOfDay < 0.6 ? '昼' : timeOfDay < 0.75 ? '夕暮れ' : '夜'}
        </span>
      </div>

      {/* View Controls */}
      <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setAutoRotate(a => !a)} style={{
          background: autoRotate ? colors.highlight : 'transparent',
          border: `1px solid ${colors.highlight}`,
          color: autoRotate ? '#000' : colors.highlight,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>{autoRotate ? '⏸ 停止' : '▶ 回転'}</button>
        
        <button onClick={() => setShowInfo(s => !s)} style={{
          background: showInfo ? colors.accent : 'transparent',
          border: `1px solid ${colors.accent}`,
          color: showInfo ? '#000' : colors.accent,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🏷 ラベル</button>
        
        <button onClick={() => setCamera({ rotationY: 0.12, rotationX: 0.15, zoom: 1, panX: 0, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.secondary}`, color: colors.secondary,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>↺ リセット</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.6, zoom: 0.55 }))} style={{
          background: 'transparent', border: `1px solid ${colors.purple}`, color: colors.purple,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>⬆ 上空</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.05, zoom: 1.4 }))} style={{
          background: 'transparent', border: `1px solid ${colors.orange}`, color: colors.orange,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>👁 街路</button>
        
        <button onClick={() => setCamera({ rotationY: -0.35, rotationX: 0.12, zoom: 1.5, panX: -100, panY: 20 })} style={{
          background: 'transparent', border: `1px solid ${colors.tokyoTower}`, color: colors.tokyoTower,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🗼 タワー</button>
        
        <button onClick={() => setCamera({ rotationY: 0.5, rotationX: 0.15, zoom: 1.3, panX: 120, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.skytree}`, color: colors.skytree,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>📡 スカイツリー</button>
        
        <button onClick={() => setCamera({ rotationY: 0.1, rotationX: 0.2, zoom: 0.8, panX: 0, panY: -30 })} style={{
          background: 'transparent', border: `1px solid ${colors.fuji}`, color: colors.fuji,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🗻 富士山</button>
      </div>

      <div style={{ marginTop: '4px', color: colors.highlight, fontSize: '6px', textAlign: 'center', opacity: 0.45 }}>
        DRAG: Rotate | SHIFT+DRAG: Pan | SCROLL: Zoom
      </div>

      <div style={{ display: 'flex', marginTop: '4px', gap: '2px' }}>
        {[colors.primary, colors.secondary, colors.accent, colors.highlight, colors.purple, colors.orange, colors.tokyoTower, colors.skytree].map((c, i) => (
          <div key={i} style={{ width: '18px', height: '3px', background: c, boxShadow: isNight ? `0 0 4px ${c}` : 'none' }}/>
        ))}
      </div>
    </div>
  );
}
