import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function HongKongSkyline() {
  const [time, setTime] = useState(0);
  const [scanline, setScanline] = useState(0);
  const [camera, setCamera] = useState({
    rotationY: 0.08,
    rotationX: 0.18,
    zoom: 1,
    panX: 0,
    panY: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState('rotate');
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState(0.85);
  const [showInfo, setShowInfo] = useState(true);
  const [weather, setWeather] = useState('clear');
  const [lightning, setLightning] = useState(false);
  const [windSpeed, setWindSpeed] = useState(0.3);
  const [symphonyOfLights, setSymphonyOfLights] = useState(true);
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

  const [clouds] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      x: i * 110 - 100,
      y: 30 + Math.random() * 45,
      width: 90 + Math.random() * 70,
      height: 28 + Math.random() * 22,
      speed: 0.25 + Math.random() * 0.35
    }))
  );

  // Junk boats
  const [junkBoats] = useState(() => [
    { x: -180, z: -170, size: 1.2, phase: 0 },
    { x: 80, z: -185, size: 1, phase: 1.5 },
    { x: 280, z: -160, size: 0.9, phase: 3 },
  ]);

  // Lightning
  useEffect(() => {
    if (weather === 'storm') {
      const interval = setInterval(() => {
        if (Math.random() < 0.12) {
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
        setCamera(c => ({ ...c, rotationY: c.rotationY + 0.0015 }));
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

  // Hong Kong's vibrant neon colors
  const getColors = () => {
    const isNight = timeOfDay > 0.75;
    const isSunset = timeOfDay > 0.6 && timeOfDay <= 0.75;
    const isStormy = weather === 'storm' || weather === 'rain';
    
    let base;
    if (isNight) {
      base = {
        primary: '#00E5FF',      // Cyan/electric blue
        secondary: '#FF1493',    // Hot pink/magenta
        accent: '#FFD700',       // Gold
        highlight: '#00FF7F',    // Spring green
        purple: '#BA55D3',       // Medium orchid
        orange: '#FF6B00',       // Vivid orange
        red: '#FF2D55',          // Neon red
        blue: '#0066FF',         // Royal blue
        teal: '#00CED1',         // Dark turquoise
        yellow: '#FFFF00',       // Yellow
        pink: '#FF69B4',         // Hot pink
        lime: '#7FFF00',         // Chartreuse
        water: '#001133',
        grid: '#220044',
        mountain: '#1a2a3a',
        sky1: '#020408',
        sky2: '#040810',
        sky3: '#081020',
        sky4: '#0c1830'
      };
    } else if (isSunset) {
      base = {
        primary: '#00BBDD',
        secondary: '#FF3377',
        accent: '#FFAA00',
        highlight: '#00CC66',
        purple: '#9944CC',
        orange: '#FF5500',
        red: '#DD2244',
        blue: '#0055DD',
        teal: '#00AABB',
        yellow: '#DDCC00',
        pink: '#FF5588',
        lime: '#66DD00',
        water: '#002244',
        grid: '#330055',
        mountain: '#2a3a4a',
        sky1: '#0a0515',
        sky2: '#1a1030',
        sky3: '#4a2040',
        sky4: '#884020'
      };
    } else {
      base = {
        primary: '#0088BB',
        secondary: '#CC2266',
        accent: '#CC8800',
        highlight: '#009955',
        purple: '#7733AA',
        orange: '#CC4400',
        red: '#BB2233',
        blue: '#0044AA',
        teal: '#008899',
        yellow: '#BBAA00',
        pink: '#CC4477',
        lime: '#55BB00',
        water: '#004466',
        grid: '#220033',
        mountain: '#4a5a6a',
        sky1: '#304050',
        sky2: '#405060',
        sky3: '#506070',
        sky4: '#708090'
      };
    }

    if (isStormy) {
      base.sky1 = '#080810';
      base.sky2 = '#101018';
      base.sky3 = '#181828';
      base.sky4 = '#282838';
      base.water = '#000d1a';
      base.mountain = '#151a20';
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

  // Hong Kong Island buildings (Victoria Harbour view from Kowloon)
  const buildings = [
    // === FAR LEFT - Western District ===
    { x: -420, z: 70, w: 22, d: 22, h: 95, color: colors.purple },
    { x: -390, z: 55, w: 24, d: 24, h: 110, color: colors.teal },
    { x: -360, z: 65, w: 20, d: 20, h: 85, color: colors.pink },
    { x: -330, z: 60, w: 26, d: 26, h: 125, color: colors.blue },
    { x: -300, z: 75, w: 22, d: 22, h: 100, color: colors.lime },
    
    // === SHEUNG WAN ===
    { x: -270, z: 55, w: 24, d: 24, h: 135, color: colors.orange },
    { x: -240, z: 70, w: 20, d: 20, h: 115, color: colors.secondary },
    { x: -210, z: 60, w: 26, d: 26, h: 150, color: colors.primary },
    
    // === CENTRAL - Main cluster ===
    // HSBC Building - Distinctive structural exoskeleton
    { x: -170, z: 55, w: 38, d: 38, h: 170, color: colors.highlight, name: 'HSBC', hsbc: true, info: { height: '587 ft', year: 1985, floors: 47, note: 'Foster\'s exoskeleton' } },
    
    // Bank of China Tower - Iconic geometric triangular
    { x: -120, z: 60, w: 40, d: 40, h: 285, color: colors.primary, name: 'BANK OF CHINA', boc: true, info: { height: '1,205 ft', year: 1990, floors: 70, note: 'I.M. Pei geometric' } },
    
    // Cheung Kong Center
    { x: -75, z: 70, w: 34, d: 34, h: 240, color: colors.accent, name: 'CHEUNG KONG', info: { height: '928 ft', year: 1999, floors: 62 } },
    
    // Two IFC - Tallest on HK Island
    { x: -25, z: 50, w: 48, d: 48, h: 350, color: colors.blue, name: 'TWO IFC', ifc: true, info: { height: '1,362 ft', year: 2003, floors: 88, note: 'Tallest on HK Island' } },
    
    // One IFC
    { x: 30, z: 65, w: 36, d: 36, h: 200, color: colors.teal, name: 'ONE IFC', info: { height: '656 ft', year: 1999, floors: 38 } },
    
    // Exchange Square
    { x: 75, z: 75, w: 28, d: 28, h: 165, color: colors.purple },
    
    // Jardine House
    { x: 115, z: 55, w: 32, d: 32, h: 175, color: colors.accent, name: 'JARDINE HOUSE', jardine: true, info: { height: '587 ft', year: 1973, floors: 52, note: 'Circular windows' } },
    
    // === WAN CHAI ===
    { x: 155, z: 70, w: 24, d: 24, h: 145, color: colors.pink },
    { x: 185, z: 60, w: 26, d: 26, h: 160, color: colors.orange },
    
    // Central Plaza - Triangular with neon top
    { x: 225, z: 55, w: 42, d: 42, h: 310, color: colors.secondary, name: 'CENTRAL PLAZA', centralPlaza: true, info: { height: '1,227 ft', year: 1992, floors: 78, note: 'Neon pyramid top' } },
    
    // HKCEC (Convention Center) - Low curved
    { x: 275, z: 40, w: 60, d: 30, h: 55, color: colors.highlight, name: 'HKCEC', hkcec: true, info: { note: 'Convention Center' } },
    
    // === CAUSEWAY BAY ===
    { x: 325, z: 65, w: 24, d: 24, h: 155, color: colors.yellow },
    { x: 360, z: 75, w: 22, d: 22, h: 130, color: colors.purple },
    { x: 390, z: 60, w: 26, d: 26, h: 175, color: colors.primary },
    { x: 420, z: 70, w: 20, d: 20, h: 120, color: colors.lime },
    { x: 450, z: 55, w: 24, d: 24, h: 145, color: colors.red },
    
    // === BACKGROUND - Dense Hong Kong style ===
    { x: -400, z: 140, w: 18, d: 18, h: 70, color: colors.purple },
    { x: -350, z: 150, w: 16, d: 16, h: 60, color: colors.teal },
    { x: -300, z: 145, w: 20, d: 20, h: 80, color: colors.pink },
    { x: -250, z: 155, w: 18, d: 18, h: 75, color: colors.orange },
    { x: -200, z: 140, w: 16, d: 16, h: 65, color: colors.blue },
    { x: -150, z: 150, w: 20, d: 20, h: 85, color: colors.lime },
    { x: -100, z: 145, w: 18, d: 18, h: 70, color: colors.secondary },
    { x: -50, z: 155, w: 16, d: 16, h: 60, color: colors.primary },
    { x: 0, z: 140, w: 20, d: 20, h: 90, color: colors.accent },
    { x: 50, z: 150, w: 18, d: 18, h: 75, color: colors.purple },
    { x: 100, z: 145, w: 16, d: 16, h: 65, color: colors.teal },
    { x: 150, z: 155, w: 20, d: 20, h: 80, color: colors.pink },
    { x: 200, z: 140, w: 18, d: 18, h: 70, color: colors.orange },
    { x: 250, z: 150, w: 16, d: 16, h: 85, color: colors.blue },
    { x: 300, z: 145, w: 20, d: 20, h: 75, color: colors.lime },
    { x: 350, z: 155, w: 18, d: 18, h: 60, color: colors.secondary },
    { x: 400, z: 140, w: 16, d: 16, h: 70, color: colors.primary },
    
    // === THIRD ROW - Even more density ===
    { x: -380, z: 210, w: 14, d: 14, h: 50, color: colors.purple },
    { x: -320, z: 220, w: 12, d: 12, h: 45, color: colors.teal },
    { x: -260, z: 215, w: 14, d: 14, h: 55, color: colors.pink },
    { x: -200, z: 225, w: 12, d: 12, h: 40, color: colors.orange },
    { x: -140, z: 210, w: 14, d: 14, h: 50, color: colors.blue },
    { x: -80, z: 220, w: 12, d: 12, h: 60, color: colors.lime },
    { x: -20, z: 215, w: 14, d: 14, h: 45, color: colors.secondary },
    { x: 40, z: 225, w: 12, d: 12, h: 55, color: colors.primary },
    { x: 100, z: 210, w: 14, d: 14, h: 50, color: colors.accent },
    { x: 160, z: 220, w: 12, d: 12, h: 40, color: colors.purple },
    { x: 220, z: 215, w: 14, d: 14, h: 55, color: colors.teal },
    { x: 280, z: 225, w: 12, d: 12, h: 45, color: colors.pink },
    { x: 340, z: 210, w: 14, d: 14, h: 50, color: colors.orange },
    { x: 400, z: 220, w: 12, d: 12, h: 40, color: colors.blue },
  ];

  // Render building wireframe
  const renderBuilding = (b, idx) => {
    const lines = [];
    const hw = b.w / 2;
    const hd = b.d / 2;
    const windowSpacing = 12;
    const fogOpacity = weather === 'fog' ? 0.5 : 1;
    
    // Symphony of Lights pulsing effect
    const symphonyPulse = symphonyOfLights && isNight ? 
      0.7 + Math.sin(time * 3 + idx * 0.5) * 0.3 : 1;

    // Bank of China Tower - Geometric triangular facade
    if (b.boc) {
      // Main shaft with diagonal bracing (X pattern)
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      // Tapered profile
      const sections = 5;
      for (let s = 0; s < sections; s++) {
        const y1 = (s / sections) * b.h;
        const y2 = ((s + 1) / sections) * b.h;
        const scale1 = 1 - (s / sections) * 0.25;
        const scale2 = 1 - ((s + 1) / sections) * 0.25;
        
        corners.forEach(([cx, cz], i) => {
          const ox1 = b.x + (cx - b.x) * scale1;
          const oz1 = b.z + (cz - b.z) * scale1;
          const ox2 = b.x + (cx - b.x) * scale2;
          const oz2 = b.z + (cz - b.z) * scale2;
          
          const p1 = project(ox1, y1, oz1);
          const p2 = project(ox2, y2, oz2);
          lines.push({ ...p1, x2: p2.x, y2: p2.y });
        });
        
        // Horizontal at each level
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const ox1 = b.x + (c1[0] - b.x) * scale2;
          const oz1 = b.z + (c1[1] - b.z) * scale2;
          const ox2 = b.x + (c2[0] - b.x) * scale2;
          const oz2 = b.z + (c2[1] - b.z) * scale2;
          const p1 = project(ox1, y2, oz1);
          const p2 = project(ox2, y2, oz2);
          lines.push({ ...p1, x2: p2.x, y2: p2.y });
        }
        
        // Diagonal X bracing (signature look)
        if (s < sections - 1) {
          const midY = (y1 + y2) / 2;
          const midScale = (scale1 + scale2) / 2;
          
          // Front face X
          const fl = project(b.x - hw * scale1, y1, b.z - hd * scale1);
          const fr = project(b.x + hw * scale1, y1, b.z - hd * scale1);
          const tl = project(b.x - hw * scale2, y2, b.z - hd * scale2);
          const tr = project(b.x + hw * scale2, y2, b.z - hd * scale2);
          const mid = project(b.x, midY, b.z - hd * midScale);
          
          lines.push({ ...fl, x2: mid.x, y2: mid.y, diagonal: true });
          lines.push({ ...fr, x2: mid.x, y2: mid.y, diagonal: true });
          lines.push({ ...mid, x2: tl.x, y2: tl.y, diagonal: true });
          lines.push({ ...mid, x2: tr.x, y2: tr.y, diagonal: true });
        }
      }
      
      // Antenna masts (two)
      const ant1 = project(b.x - 5, b.h, b.z);
      const ant1t = project(b.x - 5, b.h + 30, b.z);
      const ant2 = project(b.x + 5, b.h, b.z);
      const ant2t = project(b.x + 5, b.h + 25, b.z);
      lines.push({ ...ant1, x2: ant1t.x, y2: ant1t.y, thin: true });
      lines.push({ ...ant2, x2: ant2t.x, y2: ant2t.y, thin: true });
    }
    // Two IFC - Sleek modern with crown
    else if (b.ifc) {
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      // Slight taper
      const baseScale = 1;
      const topScale = 0.85;
      
      corners.forEach(([cx, cz], i) => {
        const bx = b.x + (cx - b.x) * baseScale;
        const bz = b.z + (cz - b.z) * baseScale;
        const tx = b.x + (cx - b.x) * topScale;
        const tz = b.z + (cz - b.z) * topScale;
        
        const p1 = project(bx, 0, bz);
        const p2 = project(tx, b.h * 0.9, tz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      // Floor bands
      for (let f = 0; f < 20; f++) {
        const y = (f / 20) * b.h * 0.9;
        const scale = baseScale - (f / 20) * (baseScale - topScale);
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const ox1 = b.x + (c1[0] - b.x) * scale;
          const oz1 = b.z + (c1[1] - b.z) * scale;
          const ox2 = b.x + (c2[0] - b.x) * scale;
          const oz2 = b.z + (c2[1] - b.z) * scale;
          const p1 = project(ox1, y, oz1);
          const p2 = project(ox2, y, oz2);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
        }
      }
      
      // Crown (stepped top)
      const crownBase = b.h * 0.9;
      const crownScale = topScale * 0.6;
      const crownCorners = corners.map(([cx, cz]) => [
        b.x + (cx - b.x) * crownScale,
        b.z + (cz - b.z) * crownScale
      ]);
      
      crownCorners.forEach(([cx, cz], i) => {
        const ox = b.x + (corners[i][0] - b.x) * topScale;
        const oz = b.z + (corners[i][1] - b.z) * topScale;
        const p1 = project(ox, crownBase, oz);
        const p2 = project(cx, b.h, cz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      // Antenna
      const ant = project(b.x, b.h, b.z);
      const antT = project(b.x, b.h + 40, b.z);
      lines.push({ ...ant, x2: antT.x, y2: antT.y, thin: true });
    }
    // Central Plaza - Triangular with neon pyramid top
    else if (b.centralPlaza) {
      // Triangular floor plan
      const triCorners = [
        [b.x, b.z - hd],
        [b.x + hw, b.z + hd * 0.7],
        [b.x - hw, b.z + hd * 0.7]
      ];
      
      // Main shaft
      triCorners.forEach(([cx, cz]) => {
        const p1 = project(cx, 0, cz);
        const p2 = project(cx, b.h * 0.85, cz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      // Floor lines
      for (let f = 0; f < 18; f++) {
        const y = (f / 18) * b.h * 0.85;
        for (let i = 0; i < 3; i++) {
          const c1 = triCorners[i], c2 = triCorners[(i + 1) % 3];
          const p1 = project(c1[0], y, c1[1]);
          const p2 = project(c2[0], y, c2[1]);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
        }
      }
      
      // Neon pyramid crown (changes colors at night!)
      const crownBase = b.h * 0.85;
      const crownTop = project(b.x, b.h, b.z);
      triCorners.forEach(([cx, cz]) => {
        const p = project(cx, crownBase, cz);
        lines.push({ ...p, x2: crownTop.x, y2: crownTop.y, neonCrown: true });
      });
      
      // Antenna
      const antT = project(b.x, b.h + 25, b.z);
      lines.push({ ...crownTop, x2: antT.x, y2: antT.y, thin: true });
    }
    // HSBC Building - Structural exoskeleton
    else if (b.hsbc) {
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      // External structure (coat hanger trusses)
      const numLevels = 5;
      for (let l = 0; l <= numLevels; l++) {
        const y = (l / numLevels) * b.h;
        
        // Horizontal at each level
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const p1 = project(c1[0], y, c1[1]);
          const p2 = project(c2[0], y, c2[1]);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, structure: true });
        }
        
        // Vertical columns
        if (l < numLevels) {
          corners.forEach(([cx, cz]) => {
            const p1 = project(cx, y, cz);
            const p2 = project(cx, (l + 1) / numLevels * b.h, cz);
            lines.push({ ...p1, x2: p2.x, y2: p2.y, structure: true });
          });
        }
      }
      
      // Cross bracing (X pattern on each face)
      for (let l = 0; l < numLevels; l++) {
        const y1 = (l / numLevels) * b.h;
        const y2 = ((l + 1) / numLevels) * b.h;
        
        // Front face
        const bl = project(b.x - hw, y1, b.z - hd);
        const br = project(b.x + hw, y1, b.z - hd);
        const tl = project(b.x - hw, y2, b.z - hd);
        const tr = project(b.x + hw, y2, b.z - hd);
        
        lines.push({ ...bl, x2: tr.x, y2: tr.y, brace: true });
        lines.push({ ...br, x2: tl.x, y2: tl.y, brace: true });
      }
    }
    // Jardine House - Circular windows (porthole building)
    else if (b.jardine) {
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
      
      // Circular window pattern (dots)
      for (let f = 1; f < 12; f++) {
        const y = (f / 12) * b.h;
        for (let w = 0; w < 6; w++) {
          const wx = b.x - hw + (w + 0.5) * (b.w / 6);
          const p = project(wx, y, b.z - hd);
          lines.push({ x: p.x, y: p.y, x2: p.x, y2: p.y, porthole: true });
        }
      }
    }
    // HKCEC Convention Center - Curved roof
    else if (b.hkcec) {
      // Curved wing shape
      const numPoints = 12;
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const x = b.x - b.w / 2 + t * b.w;
        const curveH = b.h * (1 - Math.pow(t - 0.5, 2) * 3);
        
        const p1 = project(x, 0, b.z - hd);
        const p2 = project(x, curveH, b.z);
        const p3 = project(x, 0, b.z + hd);
        
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
        lines.push({ ...p2, x2: p3.x, y2: p3.y });
        
        if (i > 0) {
          const prevT = (i - 1) / (numPoints - 1);
          const prevX = b.x - b.w / 2 + prevT * b.w;
          const prevCurveH = b.h * (1 - Math.pow(prevT - 0.5, 2) * 3);
          const prevP = project(prevX, prevCurveH, b.z);
          lines.push({ ...prevP, x2: p2.x, y2: p2.y });
        }
      }
    }
    // Regular building with Hong Kong density style
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
      if (l.porthole) {
        return (
          <circle key={`b${idx}-${i}`} cx={l.x} cy={l.y} r={1.5}
            fill="none" stroke={b.color} strokeWidth="0.5" opacity={0.4 * fogOpacity} />
        );
      }
      
      const color = l.neonCrown ? 
        (isNight ? `hsl(${(time * 50 + idx * 30) % 360}, 100%, 60%)` : colors.secondary) : 
        b.color;
      
      return (
        <line
          key={`b${idx}-${i}`}
          x1={l.x} y1={l.y} x2={l.x2} y2={l.y2}
          stroke={color}
          strokeWidth={l.thin ? 0.5 : l.structure ? 1.4 : l.brace ? 0.8 : l.diagonal ? 0.9 : l.neonCrown ? 1.8 : l.floor ? 0.2 : 1}
          opacity={(l.floor ? 0.15 : l.brace ? 0.6 : l.neonCrown ? symphonyPulse : 0.85) * fogOpacity}
          style={{ 
            filter: isNight && !lightning ? 
              `drop-shadow(0 0 ${l.neonCrown ? 6 : l.structure ? 3 : 2}px ${color})` : 'none' 
          }}
        />
      );
    });
  };

  // Victoria Peak mountains behind
  const renderMountains = () => {
    const elements = [];
    
    // Main Victoria Peak silhouette
    const peakPoints = [
      [-500, 0], [-450, 35], [-380, 70], [-300, 95], [-200, 120],
      [-100, 130], [0, 125], [100, 115], [200, 100], [300, 85],
      [400, 65], [480, 40], [500, 0]
    ];
    
    // Mountain outline
    for (let i = 0; i < peakPoints.length - 1; i++) {
      const [x1, h1] = peakPoints[i];
      const [x2, h2] = peakPoints[i + 1];
      const p1 = project(x1, h1 + 100, 280);
      const p2 = project(x2, h2 + 100, 280);
      elements.push(
        <line key={`peak-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.mountain} strokeWidth="1.5" opacity="0.5" />
      );
    }
    
    // Mountain contour lines
    for (let level = 20; level < 120; level += 25) {
      const contourPoints = peakPoints
        .filter(([x, h]) => h > level - 20)
        .map(([x, h]) => [x, Math.min(h, level) + 100]);
      
      for (let i = 0; i < contourPoints.length - 1; i++) {
        const [x1, h1] = contourPoints[i];
        const [x2, h2] = contourPoints[i + 1];
        const p1 = project(x1, h1, 280);
        const p2 = project(x2, h2, 280);
        elements.push(
          <line key={`contour-${level}-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={colors.highlight} strokeWidth="0.4" opacity="0.15" />
        );
      }
    }
    
    return elements;
  };

  // Traditional junk boats
  const renderJunkBoats = () => {
    if (weather === 'storm') return null;
    
    return junkBoats.map((junk, i) => {
      const elements = [];
      const bx = junk.x + Math.sin(time * 0.3 + junk.phase) * 15;
      const bobY = Math.sin(time * 1.2 + junk.phase) * 1.5;
      const size = junk.size;
      
      // Hull
      const hull = [
        project(bx - 20 * size, bobY, junk.z),
        project(bx + 25 * size, bobY, junk.z),
        project(bx + 20 * size, bobY + 5 * size, junk.z),
        project(bx - 15 * size, bobY + 5 * size, junk.z)
      ];
      
      for (let h = 0; h < hull.length; h++) {
        const next = hull[(h + 1) % hull.length];
        elements.push(
          <line key={`junk${i}-hull-${h}`}
            x1={hull[h].x} y1={hull[h].y} x2={next.x} y2={next.y}
            stroke={colors.orange} strokeWidth="1" opacity="0.7"
            style={isNight ? { filter: `drop-shadow(0 0 2px ${colors.orange})` } : {}} />
        );
      }
      
      // Mast
      const mastBase = project(bx, bobY + 5 * size, junk.z);
      const mastTop = project(bx, bobY + 35 * size, junk.z);
      elements.push(
        <line key={`junk${i}-mast`}
          x1={mastBase.x} y1={mastBase.y} x2={mastTop.x} y2={mastTop.y}
          stroke={colors.accent} strokeWidth="0.8" opacity="0.6" />
      );
      
      // Battened sails (distinctive junk sail shape)
      const sailPoints = [
        project(bx - 5 * size, bobY + 8 * size, junk.z),
        project(bx + 18 * size, bobY + 12 * size, junk.z),
        project(bx + 15 * size, bobY + 30 * size, junk.z),
        project(bx - 2 * size, bobY + 32 * size, junk.z)
      ];
      
      // Sail outline
      for (let s = 0; s < sailPoints.length; s++) {
        const next = sailPoints[(s + 1) % sailPoints.length];
        elements.push(
          <line key={`junk${i}-sail-${s}`}
            x1={sailPoints[s].x} y1={sailPoints[s].y} x2={next.x} y2={next.y}
            stroke={colors.red} strokeWidth="0.8" opacity="0.7"
            style={isNight ? { filter: `drop-shadow(0 0 3px ${colors.red})` } : {}} />
        );
      }
      
      // Batten lines (horizontal ribs)
      for (let b = 0; b < 5; b++) {
        const t = (b + 1) / 6;
        const leftX = sailPoints[0].x + (sailPoints[3].x - sailPoints[0].x) * t;
        const leftY = sailPoints[0].y + (sailPoints[3].y - sailPoints[0].y) * t;
        const rightX = sailPoints[1].x + (sailPoints[2].x - sailPoints[1].x) * t;
        const rightY = sailPoints[1].y + (sailPoints[2].y - sailPoints[1].y) * t;
        elements.push(
          <line key={`junk${i}-batten-${b}`}
            x1={leftX} y1={leftY} x2={rightX} y2={rightY}
            stroke={colors.red} strokeWidth="0.4" opacity="0.5" />
        );
      }
      
      return elements;
    });
  };

  // Victoria Harbour with Symphony of Lights reflections
  const renderWater = () => {
    const elements = [];
    const storminess = weather === 'storm' ? 2 : weather === 'rain' ? 1.3 : 1;
    
    // Water grid
    for (let x = -480; x <= 480; x += 35) {
      const p1 = project(x, 0, -220);
      const p2 = project(x, 0, -50);
      elements.push(
        <line key={`wg-${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth="0.3" opacity="0.18" />
      );
    }
    for (let z = -220; z <= -50; z += 15) {
      const wave = Math.sin(time * 1.5 * storminess + z * 0.1) * 1.2 * storminess;
      const p1 = project(-480, wave, z);
      const p2 = project(480, wave, z);
      elements.push(
        <line key={`wz-${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth={0.4 * storminess} opacity={0.1 + (z + 220) / 600} />
      );
    }
    
    // Symphony of Lights reflections!
    if (isNight && weather === 'clear' && symphonyOfLights) {
      // Vibrant multicolor reflections
      const reflectionColors = [
        colors.primary, colors.secondary, colors.accent, colors.highlight,
        colors.purple, colors.orange, colors.red, colors.blue,
        colors.teal, colors.yellow, colors.pink, colors.lime
      ];
      
      for (let i = 0; i < 55; i++) {
        const x = -450 + i * 17;
        const colorIndex = i % reflectionColors.length;
        const color = reflectionColors[colorIndex];
        const pulse = symphonyOfLights ? 
          0.3 + Math.sin(time * 3 + i * 0.4) * 0.25 : 0.4;
        
        for (let j = 0; j < 7; j++) {
          const z = -200 + j * 22;
          const wave = Math.sin(time * 1.8 + i * 0.3 + j * 0.25) * 2;
          const p = project(x + Math.sin(time * 0.8 + i) * 3, wave - 2, z);
          
          elements.push(
            <ellipse key={`ref-${i}-${j}`} cx={p.x} cy={p.y} 
              rx={6 + j * 0.5} ry={1.2}
              fill={color} opacity={pulse * (1 - j * 0.1)}
              style={{ filter: `blur(0.5px)` }} />
          );
        }
      }
      
      // Laser beam effects (Symphony of Lights feature)
      if (Math.sin(time * 2) > 0.3) {
        for (let beam = 0; beam < 5; beam++) {
          const beamX = -200 + beam * 100;
          const beamAngle = Math.sin(time * 1.5 + beam) * 0.3;
          const startP = project(beamX, 150, 60);
          const endX = beamX + Math.sin(beamAngle) * 200;
          const endP = project(endX, 350, -50);
          
          elements.push(
            <line key={`laser-${beam}`}
              x1={startP.x} y1={startP.y} x2={endP.x} y2={endP.y}
              stroke={reflectionColors[beam % reflectionColors.length]}
              strokeWidth="0.8" opacity={0.3 + Math.sin(time * 4 + beam) * 0.2}
              style={{ filter: `drop-shadow(0 0 4px ${reflectionColors[beam % reflectionColors.length]})` }} />
          );
        }
      }
    }
    
    // Ferries
    if (weather !== 'storm') {
      const ferries = [
        { x: -300, z: -140 },
        { x: 0, z: -155 },
        { x: 250, z: -135 },
      ];
      
      ferries.forEach((ferry, i) => {
        const fx = ferry.x + Math.sin(time * 0.4 + i * 2) * 25;
        const bobY = Math.sin(time * 1.5 + i) * 0.5;
        
        const h1 = project(fx - 12, bobY, ferry.z);
        const h2 = project(fx + 12, bobY, ferry.z);
        
        elements.push(
          <line key={`ferry-${i}`} x1={h1.x} y1={h1.y} x2={h2.x} y2={h2.y}
            stroke={colors.highlight} strokeWidth="1" opacity="0.5" />
        );
        
        // Ferry light
        if (isNight) {
          const light = project(fx, bobY + 4, ferry.z);
          elements.push(
            <circle key={`ferry-light-${i}`} cx={light.x} cy={light.y} r={1.5}
              fill={colors.accent} opacity={0.8}
              style={{ filter: `drop-shadow(0 0 4px ${colors.accent})` }} />
          );
        }
      });
    }
    
    return elements;
  };

  // Ground grid
  const renderGrid = () => {
    const lines = [];
    const fogOpacity = weather === 'fog' ? 0.08 : 0.2;
    
    for (let x = -480; x <= 480; x += 50) {
      const p1 = project(x, 0, -40);
      const p2 = project(x, 0, 300);
      lines.push(<line key={`gx${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.4" opacity={fogOpacity} />);
    }
    for (let z = -40; z <= 300; z += 50) {
      const p1 = project(-480, 0, z);
      const p2 = project(480, 0, z);
      lines.push(<line key={`gz${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.4" opacity={fogOpacity} />);
    }
    return lines;
  };

  // Weather effects
  const renderRain = () => {
    if (weather !== 'rain' && weather !== 'storm') return null;
    const intensity = weather === 'storm' ? 1.6 : 1;
    
    return (
      <g>
        {rainDrops.map((drop, i) => {
          const x = ((drop.x + time * (drop.speed * 10) * windSpeed + windSpeed * 100) % 1000);
          const y = ((drop.y + time * drop.speed * 55) % 600);
          return (
            <line key={`rain-${i}`} x1={x} y1={y} x2={x + windSpeed * drop.length} y2={y + drop.length}
              stroke={colors.primary} strokeWidth={0.6 * intensity} opacity={0.28 * intensity} />
          );
        })}
      </g>
    );
  };

  const renderClouds = () => {
    if (weather === 'clear' && timeOfDay > 0.3 && timeOfDay < 0.7) return null;
    const cloudOpacity = weather === 'storm' ? 0.6 : weather === 'fog' ? 0.45 : 0.3;
    const cloudColor = weather === 'storm' ? '#1a1a25' : '#6677889';
    
    return (
      <g>
        {clouds.map((cloud, i) => {
          const x = ((cloud.x + time * cloud.speed * 15 * (1 + windSpeed)) % 1100) - 100;
          return (
            <g key={`cloud-${i}`} opacity={cloudOpacity}>
              <ellipse cx={x} cy={cloud.y} rx={cloud.width / 2} ry={cloud.height / 2} fill={cloudColor} />
              <ellipse cx={x - cloud.width * 0.28} cy={cloud.y + 3} rx={cloud.width / 3.2} ry={cloud.height / 2.6} fill={cloudColor} />
              <ellipse cx={x + cloud.width * 0.28} cy={cloud.y + 2} rx={cloud.width / 3.2} ry={cloud.height / 2.6} fill={cloudColor} />
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
    while (y < 350) {
      points.push(`${x},${y}`);
      y += 16 + Math.random() * 25;
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
          <rect key={`fog-${i}`} x={-50 + Math.sin(time * 0.25 + i) * 20} y={220 + i * 42}
            width="1000" height="48" fill={`url(#fogGrad)`} opacity={0.12 + i * 0.03} />
        ))}
      </g>
    );
  };

  const renderCelestial = () => {
    if (weather === 'storm' || weather === 'fog') return null;
    if (timeOfDay > 0.7) {
      return (
        <g>
          <circle cx="820" cy="50" r="15" fill="none" stroke={colors.accent} strokeWidth="0.7" opacity="0.4" />
          <circle cx="820" cy="50" r="12" fill={colors.accent} opacity="0.06" />
        </g>
      );
    } else if (timeOfDay < 0.3 || timeOfDay > 0.6) {
      const sunY = timeOfDay < 0.3 ? 75 - timeOfDay * 150 : 75 - (1 - timeOfDay) * 110;
      return (
        <g>
          <circle cx="830" cy={sunY} r="20" fill={colors.orange} opacity="0.22" />
          <circle cx="830" cy={sunY} r="13" fill={colors.accent} opacity="0.38" />
        </g>
      );
    }
    return null;
  };

  const renderWindIndicator = () => {
    const windAngle = Math.PI * 0.2;
    const arrowLen = 15 + windSpeed * 25;
    return (
      <g transform="translate(45, 70)">
        <circle cx="0" cy="0" r="20" fill="rgba(0,0,0,0.3)" stroke={colors.primary} strokeWidth="0.6" />
        <text x="0" y="-25" fill={colors.primary} fontSize="6" textAnchor="middle">WIND</text>
        <line x1={-Math.cos(windAngle) * 3} y1={-Math.sin(windAngle) * 3}
          x2={Math.cos(windAngle) * arrowLen} y2={Math.sin(windAngle) * arrowLen}
          stroke={colors.accent} strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="0" y="33" fill={colors.accent} fontSize="7" textAnchor="middle">{Math.round(windSpeed * 30)} kph</text>
      </g>
    );
  };

  const getBuildingDepth = (b) => project(b.x, b.h / 2, b.z).z;
  const weatherIcons = { clear: '☀️', rain: '🌧️', storm: '⛈️', fog: '🌫️' };

  return (
    <div style={{
      background: `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 25%, ${colors.sky3} 55%, ${colors.sky4} 100%)`,
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
            香港 HONG KONG
          </div>
          <div style={{ color: colors.highlight, fontSize: '8px', letterSpacing: '3px' }}>
            SGI IRIS 1400 • VICTORIA HARBOUR
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
            background: lightning ? '#2a3040' : `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 20%, ${colors.sky3} 45%, ${colors.sky4} 70%, ${colors.water}20 100%)`,
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
              <stop offset="0%" stopColor="#8899aa" stopOpacity="0"/>
              <stop offset="50%" stopColor="#8899aa" stopOpacity="0.28"/>
              <stop offset="100%" stopColor="#8899aa" stopOpacity="0"/>
            </linearGradient>
            <marker id="arrow" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
              <polygon points="0 0, 8 2.5, 0 5" fill={colors.accent} />
            </marker>
          </defs>

          {/* Stars */}
          {isNight && weather === 'clear' && [...Array(70)].map((_, i) => (
            <circle key={`star${i}`}
              cx={(Math.sin(i * 127.1) * 0.5 + 0.5) * 900}
              cy={(Math.cos(i * 311.7) * 0.5 + 0.5) * 110}
              r={0.35 + Math.random() * 0.35}
              fill="#fff"
              opacity={0.08 + Math.sin(time * 1.5 + i) * 0.06} />
          ))}

          {renderClouds()}
          {renderCelestial()}
          {renderMountains()}
          {renderWater()}
          {renderGrid()}
          {renderJunkBoats()}

          {/* Buildings */}
          {buildings
            .map((b, i) => ({ ...b, idx: i, depth: getBuildingDepth(b) }))
            .sort((a, b) => b.depth - a.depth)
            .map(b => renderBuilding(b, b.idx))}

          {/* Labels */}
          {showInfo && weather !== 'storm' && buildings.filter(b => b.name).map((b, i) => {
            const labelY = b.h + (b.ifc ? 50 : b.boc ? 40 : b.centralPlaza ? 35 : 15);
            const lp = project(b.x, labelY, b.z);
            if (lp.z < -250) return null;
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
          {renderLightning()}
          {renderWindIndicator()}

          <text x="450" y="495" fill={colors.water} fontSize="8" textAnchor="middle" opacity={weather === 'fog' ? 0.12 : 0.28}>
            ★ VICTORIA HARBOUR 維多利亞港 ★
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
            {weatherIcons[w]} {w.toUpperCase()}
          </button>
        ))}
        
        <button onClick={() => setSymphonyOfLights(s => !s)} style={{
          background: symphonyOfLights ? colors.secondary : 'transparent',
          border: `1px solid ${colors.secondary}`,
          color: symphonyOfLights ? '#000' : colors.secondary,
          padding: '3px 9px', borderRadius: '4px', cursor: 'pointer',
          fontFamily: 'monospace', fontSize: '8px',
          display: 'flex', alignItems: 'center', gap: '3px'
        }}>
          ✨ SYMPHONY
        </button>
      </div>

      {/* Sliders */}
      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: colors.highlight, fontSize: '7px' }}>🍃</span>
        <input type="range" min="0" max="1" step="0.05" value={windSpeed}
          onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
          style={{ width: '95px', accentColor: colors.highlight }} />
        <span style={{ color: '#666', fontSize: '7px' }}>{Math.round(windSpeed * 30)} kph</span>
      </div>

      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: colors.accent, fontSize: '7px' }}>🌅</span>
        <input type="range" min="0" max="1" step="0.01" value={timeOfDay}
          onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
          style={{ width: '120px', accentColor: colors.accent }} />
        <span style={{ color: colors.primary, fontSize: '7px' }}>🌙</span>
        <span style={{ color: '#666', fontSize: '7px', marginLeft: '2px' }}>
          {timeOfDay < 0.25 ? 'SUNRISE' : timeOfDay < 0.6 ? 'DAY' : timeOfDay < 0.75 ? 'SUNSET' : 'NIGHT'}
        </span>
      </div>

      {/* View Controls */}
      <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setAutoRotate(a => !a)} style={{
          background: autoRotate ? colors.highlight : 'transparent',
          border: `1px solid ${colors.highlight}`,
          color: autoRotate ? '#000' : colors.highlight,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>{autoRotate ? '⏸ PAUSE' : '▶ ROTATE'}</button>
        
        <button onClick={() => setShowInfo(s => !s)} style={{
          background: showInfo ? colors.accent : 'transparent',
          border: `1px solid ${colors.accent}`,
          color: showInfo ? '#000' : colors.accent,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🏷 LABELS</button>
        
        <button onClick={() => setCamera({ rotationY: 0.08, rotationX: 0.18, zoom: 1, panX: 0, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.secondary}`, color: colors.secondary,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>↺ RESET</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.7, zoom: 0.55 }))} style={{
          background: 'transparent', border: `1px solid ${colors.purple}`, color: colors.purple,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>⬆ PEAK VIEW</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.05, zoom: 1.4 }))} style={{
          background: 'transparent', border: `1px solid ${colors.orange}`, color: colors.orange,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>👁 HARBOUR</button>
        
        <button onClick={() => setCamera({ rotationY: 0.2, rotationX: 0.15, zoom: 1.3, panX: -80, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.blue}`, color: colors.blue,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🏛 IFC</button>
        
        <button onClick={() => setCamera({ rotationY: -0.1, rotationX: 0.16, zoom: 1.25, panX: 60, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.pink}`, color: colors.pink,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🏛 CENTRAL</button>
      </div>

      <div style={{ marginTop: '4px', color: colors.highlight, fontSize: '6px', textAlign: 'center', opacity: 0.45 }}>
        DRAG: Rotate | SHIFT+DRAG: Pan | SCROLL: Zoom
      </div>

      <div style={{ display: 'flex', marginTop: '4px', gap: '2px' }}>
        {[colors.primary, colors.secondary, colors.accent, colors.highlight, colors.purple, colors.orange, colors.red, colors.pink, colors.teal, colors.lime].map((c, i) => (
          <div key={i} style={{ width: '16px', height: '3px', background: c, boxShadow: isNight ? `0 0 4px ${c}` : 'none' }}/>
        ))}
      </div>
    </div>
  );
}
