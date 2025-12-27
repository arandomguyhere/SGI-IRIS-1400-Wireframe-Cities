import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function MoscowSkyline() {
  const [time, setTime] = useState(0);
  const [scanline, setScanline] = useState(0);
  const [camera, setCamera] = useState({
    rotationY: 0.1,
    rotationX: 0.2,
    zoom: 1,
    panX: 0,
    panY: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState('rotate');
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState(0.78);
  const [showInfo, setShowInfo] = useState(true);
  const [weather, setWeather] = useState('clear');
  const [lightning, setLightning] = useState(false);
  const [windSpeed, setWindSpeed] = useState(0.35);
  const svgRef = useRef(null);

  // Particles
  const [rainDrops] = useState(() => 
    Array.from({ length: 160 }, () => ({
      x: Math.random() * 1000 - 50,
      y: Math.random() * 600,
      speed: 8 + Math.random() * 6,
      length: 10 + Math.random() * 15
    }))
  );

  const [snowFlakes] = useState(() =>
    Array.from({ length: 250 }, () => ({
      x: Math.random() * 1000,
      y: Math.random() * 600,
      size: 1 + Math.random() * 3.5,
      speed: 0.8 + Math.random() * 1.8,
      wobble: Math.random() * Math.PI * 2
    }))
  );

  const [clouds] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      x: i * 160 - 50,
      y: 40 + Math.random() * 35,
      width: 60 + Math.random() * 40,
      height: 18 + Math.random() * 14,
      speed: 0.22 + Math.random() * 0.35
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
        setCamera(c => ({ ...c, rotationY: c.rotationY + 0.0016 }));
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

  // Moscow color palette - cold, dramatic, with golden accents
  const getColors = () => {
    const isNight = timeOfDay > 0.75;
    const isSunset = timeOfDay > 0.6 && timeOfDay <= 0.75;
    const isStormy = weather === 'storm' || weather === 'rain';
    
    let base;
    if (isNight) {
      base = {
        primary: '#00BFFF',      // Deep sky blue
        secondary: '#FF6B6B',    // Coral red
        accent: '#FFD700',       // Gold (for domes)
        highlight: '#00FF9F',    // Spring green
        purple: '#9B59B6',       // Amethyst
        orange: '#FF8C00',       // Dark orange
        red: '#DC143C',          // Crimson (Kremlin)
        blue: '#4169E1',         // Royal blue
        steel: '#B0C4DE',        // Light steel blue
        copper: '#CD853F',       // Peru/copper
        gold: '#FFD700',         // Gold
        cream: '#FFFACD',        // Lemon chiffon
        water: '#0a1a2a',
        grid: '#1a0a2a',
        sky1: '#020306',
        sky2: '#050810',
        sky3: '#0a1018',
        sky4: '#101828'
      };
    } else if (isSunset) {
      base = {
        primary: '#00A0CC',
        secondary: '#FF5555',
        accent: '#FFCC00',
        highlight: '#00CC88',
        purple: '#8844AA',
        orange: '#FF6600',
        red: '#CC1133',
        blue: '#3355CC',
        steel: '#99AABB',
        copper: '#BB7733',
        gold: '#DDAA00',
        cream: '#DDDDAA',
        water: '#0a2030',
        grid: '#220a30',
        sky1: '#0a0515',
        sky2: '#201025',
        sky3: '#502838',
        sky4: '#904530'
      };
    } else {
      base = {
        primary: '#0088AA',
        secondary: '#DD4444',
        accent: '#CCAA00',
        highlight: '#00AA66',
        purple: '#6633AA',
        orange: '#DD5500',
        red: '#AA1122',
        blue: '#2244AA',
        steel: '#8899AA',
        copper: '#996633',
        gold: '#BB9900',
        cream: '#BBBB99',
        water: '#1a3040',
        grid: '#1a1030',
        sky1: '#354555',
        sky2: '#455565',
        sky3: '#556575',
        sky4: '#708090'
      };
    }

    if (isStormy) {
      base.sky1 = '#080810';
      base.sky2 = '#101018';
      base.sky3 = '#181825';
      base.sky4 = '#252535';
      base.water = '#051015';
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

  // Moscow buildings
  const buildings = [
    // === STALINIST GOTHIC - Seven Sisters style - FAR LEFT ===
    // Hotel Ukraina (Radisson Royal)
    { x: -420, z: 55, w: 55, d: 55, h: 200, color: colors.cream, name: 'HOTEL UKRAINA', stalinist: true, info: { height: '650 ft', year: 1957, floors: 34, note: 'Seven Sisters' } },
    
    // === MOSCOW CITY (MIBC) - Center-left ===
    
    // Federation Tower East - Tallest in Europe!
    { x: -280, z: 60, w: 44, d: 44, h: 380, color: colors.steel, name: 'FEDERATION E', federation: true, info: { height: '1,227 ft', year: 2017, floors: 97, note: 'Tallest in Europe' } },
    
    // Federation Tower West
    { x: -230, z: 75, w: 40, d: 40, h: 300, color: colors.steel, name: 'FEDERATION W', info: { height: '794 ft', year: 2017, floors: 63 } },
    
    // OKO Tower South
    { x: -175, z: 55, w: 38, d: 38, h: 340, color: colors.blue, name: 'OKO SOUTH', oko: true, info: { height: '1,161 ft', year: 2015, floors: 85 } },
    
    // OKO Tower North  
    { x: -130, z: 70, w: 34, d: 34, h: 260, color: colors.blue, name: 'OKO NORTH', info: { height: '803 ft', year: 2015, floors: 49 } },
    
    // Mercury City Tower - Golden/copper
    { x: -75, z: 55, w: 42, d: 42, h: 320, color: colors.copper, name: 'MERCURY CITY', mercury: true, info: { height: '1,112 ft', year: 2013, floors: 75, note: 'Golden facade' } },
    
    // Evolution Tower - THE TWISTED ONE!
    { x: -15, z: 65, w: 40, d: 40, h: 300, color: colors.primary, name: 'EVOLUTION', evolution: true, info: { height: '807 ft', year: 2014, floors: 55, note: 'DNA helix twist' } },
    
    // City of Capitals (Moscow & St. Petersburg towers)
    { x: 45, z: 55, w: 36, d: 36, h: 280, color: colors.highlight, name: 'CITY OF CAPITALS', info: { height: '990 ft', year: 2010, floors: 76 } },
    { x: 90, z: 70, w: 32, d: 32, h: 235, color: colors.highlight },
    
    // Imperia Tower
    { x: 140, z: 60, w: 38, d: 38, h: 250, color: colors.purple, name: 'IMPERIA', info: { height: '787 ft', year: 2011, floors: 60 } },
    
    // Eurasia Tower
    { x: 195, z: 75, w: 34, d: 34, h: 280, color: colors.orange, name: 'EURASIA', info: { height: '1,013 ft', year: 2014, floors: 72 } },
    
    // Neva Towers
    { x: 250, z: 60, w: 30, d: 30, h: 240, color: colors.steel },
    { x: 295, z: 70, w: 28, d: 28, h: 210, color: colors.primary },
    
    // More modern towers near center
    { x: 340, z: 55, w: 26, d: 26, h: 180, color: colors.purple },
    { x: 380, z: 65, w: 24, d: 24, h: 160, color: colors.teal },
    
    // === BACKGROUND BUILDINGS ===
    { x: -380, z: 140, w: 20, d: 20, h: 80, color: colors.purple },
    { x: -320, z: 150, w: 18, d: 18, h: 70, color: colors.blue },
    { x: -260, z: 145, w: 22, d: 22, h: 90, color: colors.steel },
    { x: -200, z: 155, w: 18, d: 18, h: 75, color: colors.primary },
    { x: -140, z: 140, w: 20, d: 20, h: 85, color: colors.orange },
    { x: -80, z: 150, w: 18, d: 18, h: 70, color: colors.highlight },
    { x: -20, z: 145, w: 22, d: 22, h: 95, color: colors.purple },
    { x: 40, z: 155, w: 18, d: 18, h: 65, color: colors.blue },
    { x: 100, z: 140, w: 20, d: 20, h: 80, color: colors.steel },
    { x: 160, z: 150, w: 18, d: 18, h: 70, color: colors.primary },
    { x: 220, z: 145, w: 22, d: 22, h: 85, color: colors.orange },
    { x: 280, z: 155, w: 18, d: 18, h: 60, color: colors.teal },
  ];

  // Render building wireframe
  const renderBuilding = (b, idx) => {
    const lines = [];
    const hw = b.w / 2;
    const hd = b.d / 2;
    const windowSpacing = 12;
    const fogOpacity = weather === 'fog' ? 0.5 : 1;

    // Evolution Tower - THE TWISTED DNA HELIX!
    if (b.evolution) {
      const numFloors = 45;
      const totalTwist = Math.PI * 0.55; // More twist for visibility
      
      for (let f = 0; f < numFloors; f++) {
        const y1 = (f / numFloors) * b.h;
        const y2 = ((f + 1) / numFloors) * b.h;
        const twist1 = (f / numFloors) * totalTwist;
        const twist2 = ((f + 1) / numFloors) * totalTwist;
        
        // Four corners, rotated at each level
        for (let c = 0; c < 4; c++) {
          const baseAngle = (c / 4) * Math.PI * 2 + Math.PI / 4;
          const angle1 = baseAngle + twist1;
          const angle2 = baseAngle + twist2;
          
          const x1 = b.x + Math.cos(angle1) * hw;
          const z1 = b.z + Math.sin(angle1) * hd;
          const x2 = b.x + Math.cos(angle2) * hw;
          const z2 = b.z + Math.sin(angle2) * hd;
          
          const p1 = project(x1, y1, z1);
          const p2 = project(x2, y2, z2);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, twist: true });
          
          // Horizontal connections every few floors
          if (f % 3 === 0) {
            const nextAngle1 = ((c + 1) / 4) * Math.PI * 2 + Math.PI / 4 + twist1;
            const nx1 = b.x + Math.cos(nextAngle1) * hw;
            const nz1 = b.z + Math.sin(nextAngle1) * hd;
            const np1 = project(nx1, y1, nz1);
            lines.push({ ...p1, x2: np1.x, y2: np1.y, floor: true });
          }
        }
      }
      
      // Emphasize the spiral with additional edge lines
      for (let edge = 0; edge < 4; edge++) {
        const edgeAngle = (edge / 4) * Math.PI * 2 + Math.PI / 4;
        let prevP = null;
        for (let f = 0; f <= numFloors; f += 2) {
          const y = (f / numFloors) * b.h;
          const twist = (f / numFloors) * totalTwist;
          const angle = edgeAngle + twist;
          const x = b.x + Math.cos(angle) * hw;
          const z = b.z + Math.sin(angle) * hd;
          const p = project(x, y, z);
          if (prevP) {
            lines.push({ ...prevP, x2: p.x, y2: p.y, edgeLine: true });
          }
          prevP = p;
        }
      }
      
      // Spire
      const spireBase = project(b.x, b.h, b.z);
      const spireTop = project(b.x, b.h + 25, b.z);
      lines.push({ ...spireBase, x2: spireTop.x, y2: spireTop.y, thin: true });
    }
    // Federation Tower - Twin glass towers
    else if (b.federation) {
      // Triangular cross-section tapering
      const corners = [
        [b.x, b.z - hd],
        [b.x + hw, b.z + hd * 0.6],
        [b.x - hw, b.z + hd * 0.6]
      ];
      
      const numSections = 22;
      for (let s = 0; s < numSections; s++) {
        const y1 = (s / numSections) * b.h;
        const y2 = ((s + 1) / numSections) * b.h;
        const scale1 = 1 - (s / numSections) * 0.15;
        const scale2 = 1 - ((s + 1) / numSections) * 0.15;
        
        corners.forEach(([cx, cz], i) => {
          const ox1 = b.x + (cx - b.x) * scale1;
          const oz1 = b.z + (cz - b.z) * scale1;
          const ox2 = b.x + (cx - b.x) * scale2;
          const oz2 = b.z + (cz - b.z) * scale2;
          
          const p1 = project(ox1, y1, oz1);
          const p2 = project(ox2, y2, oz2);
          lines.push({ ...p1, x2: p2.x, y2: p2.y });
        });
        
        // Horizontal lines
        for (let i = 0; i < 3; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 3];
          const ox1 = b.x + (c1[0] - b.x) * scale2;
          const oz1 = b.z + (c1[1] - b.z) * scale2;
          const ox2 = b.x + (c2[0] - b.x) * scale2;
          const oz2 = b.z + (c2[1] - b.z) * scale2;
          const p1 = project(ox1, y2, oz1);
          const p2 = project(ox2, y2, oz2);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
        }
      }
      
      // Spire
      const spireBase = project(b.x, b.h, b.z);
      const spireTop = project(b.x, b.h + 45, b.z);
      lines.push({ ...spireBase, x2: spireTop.x, y2: spireTop.y, thin: true });
    }
    // Mercury City Tower - Golden stepped
    else if (b.mercury) {
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      // Setbacks
      const setbacks = [
        { h: 0, top: 0.7, scale: 1 },
        { h: 0.7, top: 0.85, scale: 0.85 },
        { h: 0.85, top: 1, scale: 0.7 }
      ];
      
      setbacks.forEach((sec) => {
        const y1 = sec.h * b.h;
        const y2 = sec.top * b.h;
        const scale = sec.scale;
        
        corners.forEach(([cx, cz]) => {
          const ox = b.x + (cx - b.x) * scale;
          const oz = b.z + (cz - b.z) * scale;
          const p1 = project(ox, y1, oz);
          const p2 = project(ox, y2, oz);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, golden: true });
        });
        
        // Horizontal at top of each section
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const ox1 = b.x + (c1[0] - b.x) * scale;
          const oz1 = b.z + (c1[1] - b.z) * scale;
          const ox2 = b.x + (c2[0] - b.x) * scale;
          const oz2 = b.z + (c2[1] - b.z) * scale;
          const pt1 = project(ox1, y2, oz1);
          const pt2 = project(ox2, y2, oz2);
          lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, golden: true });
        }
      });
      
      // Floor bands
      for (let f = 0; f < 18; f++) {
        const y = (f / 18) * b.h * 0.7;
        const p1 = project(b.x - hw, y, b.z - hd);
        const p2 = project(b.x + hw, y, b.z - hd);
        lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
      }
    }
    // OKO Towers - Sleek twin
    else if (b.oko) {
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      // Slight taper
      const topScale = 0.9;
      corners.forEach(([cx, cz]) => {
        const tx = b.x + (cx - b.x) * topScale;
        const tz = b.z + (cz - b.z) * topScale;
        const p1 = project(cx, 0, cz);
        const p2 = project(tx, b.h, tz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      // Base and top
      for (let i = 0; i < 4; i++) {
        const c1 = corners[i], c2 = corners[(i + 1) % 4];
        const pb1 = project(c1[0], 0, c1[1]);
        const pb2 = project(c2[0], 0, c2[1]);
        lines.push({ ...pb1, x2: pb2.x, y2: pb2.y });
        
        const tx1 = b.x + (c1[0] - b.x) * topScale;
        const tz1 = b.z + (c1[1] - b.z) * topScale;
        const tx2 = b.x + (c2[0] - b.x) * topScale;
        const tz2 = b.z + (c2[1] - b.z) * topScale;
        const pt1 = project(tx1, b.h, tz1);
        const pt2 = project(tx2, b.h, tz2);
        lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
      }
      
      // Floor bands
      for (let f = 0; f < 20; f++) {
        const y = (f / 20) * b.h;
        const scale = 1 - (f / 20) * (1 - topScale);
        const p1 = project(b.x - hw * scale, y, b.z - hd * scale);
        const p2 = project(b.x + hw * scale, y, b.z - hd * scale);
        lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
      }
      
      // Crown
      const crownP = project(b.x, b.h + 15, b.z);
      const topCenter = project(b.x, b.h, b.z);
      lines.push({ ...topCenter, x2: crownP.x, y2: crownP.y, thin: true });
    }
    // Stalinist Gothic (Seven Sisters style)
    else if (b.stalinist) {
      // Wedding cake tiers
      const tiers = [
        { h: 0, top: 0.4, scale: 1 },
        { h: 0.4, top: 0.6, scale: 0.75 },
        { h: 0.6, top: 0.75, scale: 0.55 },
        { h: 0.75, top: 0.88, scale: 0.35 },
        { h: 0.88, top: 0.95, scale: 0.2 }
      ];
      
      tiers.forEach((tier) => {
        const y1 = tier.h * b.h;
        const y2 = tier.top * b.h;
        const sw = hw * tier.scale;
        const sd = hd * tier.scale;
        
        const corners = [
          [b.x - sw, b.z - sd], [b.x + sw, b.z - sd],
          [b.x + sw, b.z + sd], [b.x - sw, b.z + sd]
        ];
        
        // Verticals
        corners.forEach(([cx, cz]) => {
          const p1 = project(cx, y1, cz);
          const p2 = project(cx, y2, cz);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, stalinist: true });
        });
        
        // Horizontals
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const pt1 = project(c1[0], y2, c1[1]);
          const pt2 = project(c2[0], y2, c2[1]);
          lines.push({ ...pt1, x2: pt2.x, y2: pt2.y, stalinist: true });
          
          if (tier.h === 0) {
            const pb1 = project(c1[0], y1, c1[1]);
            const pb2 = project(c2[0], y1, c2[1]);
            lines.push({ ...pb1, x2: pb2.x, y2: pb2.y, stalinist: true });
          }
        }
      });
      
      // Central spire with star
      const spireBase = project(b.x, b.h * 0.95, b.z);
      const spireTop = project(b.x, b.h + 30, b.z);
      lines.push({ ...spireBase, x2: spireTop.x, y2: spireTop.y, spire: true });
      
      // Star at top
      const starY = b.h + 30;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const nextAngle = ((i + 2) / 5) * Math.PI * 2 - Math.PI / 2;
        const r = 5;
        const p1 = project(b.x + Math.cos(angle) * r, starY, b.z + Math.sin(angle) * r * 0.3);
        const p2 = project(b.x + Math.cos(nextAngle) * r, starY, b.z + Math.sin(nextAngle) * r * 0.3);
        lines.push({ ...p1, x2: p2.x, y2: p2.y, star: true });
      }
    }
    // Regular modern building
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
        const pb1 = project(c1[0], 0, c1[1]);
        const pb2 = project(c2[0], 0, c2[1]);
        const pt1 = project(c1[0], b.h, c1[1]);
        const pt2 = project(c2[0], b.h, c2[1]);
        lines.push({ ...pb1, x2: pb2.x, y2: pb2.y });
        lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
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
      const lineColor = l.golden ? colors.copper : 
                       l.stalinist ? colors.cream : 
                       l.star ? colors.red :
                       l.twist || l.edgeLine ? colors.primary :
                       b.color;
      
      return (
        <line
          key={`b${idx}-${i}`}
          x1={l.x} y1={l.y} x2={l.x2} y2={l.y2}
          stroke={lineColor}
          strokeWidth={l.thin ? 0.5 : l.star ? 1.5 : l.spire ? 1.2 : l.stalinist ? 1.1 : l.edgeLine ? 1.3 : l.twist ? 0.8 : l.floor ? 0.2 : 1}
          opacity={(l.floor ? 0.15 : l.star ? 0.95 : l.golden ? 0.9 : l.edgeLine ? 0.9 : 0.85) * fogOpacity}
          style={{ 
            filter: isNight && !lightning ? 
              `drop-shadow(0 0 ${l.star ? 5 : l.golden ? 4 : l.edgeLine ? 3 : 2}px ${lineColor})` : 'none' 
          }}
        />
      );
    });
  };

  // The Kremlin - Much more prominent
  const renderKremlin = () => {
    const elements = [];
    const kx = 480, kz = 70; // Right side, more visible
    
    // Long Kremlin wall with crenellations
    for (let wx = -60; wx <= 120; wx += 8) {
      const wallBase = project(kx + wx, 0, kz - 15);
      const wallTop = project(kx + wx, 35, kz - 15);
      elements.push(
        <line key={`kwall-v-${wx}`} x1={wallBase.x} y1={wallBase.y} x2={wallTop.x} y2={wallTop.y}
          stroke={colors.red} strokeWidth="1.2" opacity="0.6" />
      );
    }
    
    // Wall top line
    const wallTopL = project(kx - 60, 35, kz - 15);
    const wallTopR = project(kx + 120, 35, kz - 15);
    elements.push(
      <line key="kwall-top" x1={wallTopL.x} y1={wallTopL.y} x2={wallTopR.x} y2={wallTopR.y}
        stroke={colors.red} strokeWidth="1.8" opacity="0.75"
        style={isNight ? { filter: `drop-shadow(0 0 3px ${colors.red})` } : {}} />
    );
    
    // Crenellations (merlons)
    for (let mx = -55; mx <= 115; mx += 12) {
      const mBase = project(kx + mx, 35, kz - 15);
      const mTop = project(kx + mx, 42, kz - 15);
      elements.push(
        <line key={`merlon-${mx}`} x1={mBase.x} y1={mBase.y} x2={mTop.x} y2={mTop.y}
          stroke={colors.red} strokeWidth="3" opacity="0.5" />
      );
    }
    
    // Kremlin towers (5 distinctive ones)
    const towers = [
      { x: kx - 50, h: 95, tw: 18, main: false },
      { x: kx - 10, h: 120, tw: 22, main: true }, // Spasskaya Tower
      { x: kx + 35, h: 105, tw: 20, main: false },
      { x: kx + 75, h: 90, tw: 16, main: false },
      { x: kx + 110, h: 85, tw: 15, main: false },
    ];
    
    towers.forEach((tower, ti) => {
      const tw = tower.tw;
      const baseH = 35;
      
      // Tower base (square section)
      const corners = [
        [tower.x - tw/2, kz - tw/2], [tower.x + tw/2, kz - tw/2],
        [tower.x + tw/2, kz + tw/2], [tower.x - tw/2, kz + tw/2]
      ];
      
      // Main tower body
      corners.forEach(([cx, cz], i) => {
        const p1 = project(cx, baseH, cz);
        const p2 = project(cx, tower.h * 0.55, cz);
        elements.push(
          <line key={`ktower${ti}-v-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={colors.red} strokeWidth="1.3" opacity="0.8"
            style={isNight ? { filter: `drop-shadow(0 0 2px ${colors.red})` } : {}} />
        );
      });
      
      // Horizontal bands
      for (let band = 0; band < 3; band++) {
        const bandY = baseH + (tower.h * 0.55 - baseH) * (band / 3);
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const p1 = project(c1[0], bandY, c1[1]);
          const p2 = project(c2[0], bandY, c2[1]);
          elements.push(
            <line key={`ktower${ti}-band-${band}-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={colors.red} strokeWidth="0.5" opacity="0.4" />
          );
        }
      }
      
      // Upper narrower section
      const upperScale = 0.7;
      const upperCorners = corners.map(([cx, cz]) => [
        tower.x + (cx - tower.x) * upperScale,
        kz + (cz - kz) * upperScale
      ]);
      
      upperCorners.forEach(([cx, cz], i) => {
        const p1 = project(cx, tower.h * 0.55, cz);
        const p2 = project(cx, tower.h * 0.7, cz);
        elements.push(
          <line key={`ktower${ti}-upper-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={colors.red} strokeWidth="1" opacity="0.7" />
        );
      });
      
      // Tent/pyramid roof (green in reality, using highlight color)
      const roofBase = tower.h * 0.7;
      const roofTop = project(tower.x, tower.h * 0.92, kz);
      upperCorners.forEach(([cx, cz]) => {
        const p = project(cx, roofBase, cz);
        elements.push(
          <line key={`ktower${ti}-roof-${cx}-${cz}`} x1={p.x} y1={p.y} x2={roofTop.x} y2={roofTop.y}
            stroke={colors.highlight} strokeWidth="1.2" opacity="0.75"
            style={isNight ? { filter: `drop-shadow(0 0 2px ${colors.highlight})` } : {}} />
        );
      });
      
      // Spire
      const spireBase = project(tower.x, tower.h * 0.92, kz);
      const spireTop = project(tower.x, tower.h, kz);
      elements.push(
        <line key={`ktower${ti}-spire`} x1={spireBase.x} y1={spireBase.y} x2={spireTop.x} y2={spireTop.y}
          stroke={colors.gold} strokeWidth="1.2" opacity="0.9" />
      );
      
      // Ruby star on top
      const starP = project(tower.x, tower.h + 8, kz);
      const starSize = tower.main ? 7 : 5;
      // 5-pointed star
      const starPoints = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? starSize : starSize * 0.4;
        starPoints.push(`${starP.x + Math.cos(angle) * r},${starP.y + Math.sin(angle) * r * 0.6}`);
      }
      elements.push(
        <polygon key={`ktower${ti}-star`}
          points={starPoints.join(' ')}
          fill={colors.red} stroke={colors.gold} strokeWidth="0.5" opacity="0.95"
          style={{ filter: isNight ? `drop-shadow(0 0 8px ${colors.red})` : 'none' }} />
      );
      
      // Clock face on main tower (Spasskaya)
      if (tower.main) {
        const clockP = project(tower.x, tower.h * 0.45, kz - tw/2 - 2);
        elements.push(
          <circle key={`ktower${ti}-clock`} cx={clockP.x} cy={clockP.y} r={10}
            fill="rgba(0,0,0,0.3)" stroke={colors.gold} strokeWidth="1.5" opacity="0.9" />
        );
        // Clock face details
        for (let h = 0; h < 12; h++) {
          const hAngle = (h / 12) * Math.PI * 2 - Math.PI / 2;
          elements.push(
            <circle key={`clock-dot-${h}`}
              cx={clockP.x + Math.cos(hAngle) * 7}
              cy={clockP.y + Math.sin(hAngle) * 7}
              r={1} fill={colors.gold} opacity="0.7" />
          );
        }
        // Clock hands
        const hourAngle = (time * 0.05) % (Math.PI * 2);
        const minAngle = (time * 0.3) % (Math.PI * 2);
        elements.push(
          <line key={`clock-hour`}
            x1={clockP.x} y1={clockP.y}
            x2={clockP.x + Math.sin(hourAngle) * 5} y2={clockP.y - Math.cos(hourAngle) * 5}
            stroke={colors.gold} strokeWidth="1.2" opacity="0.85" />,
          <line key={`clock-min`}
            x1={clockP.x} y1={clockP.y}
            x2={clockP.x + Math.sin(minAngle) * 7} y2={clockP.y - Math.cos(minAngle) * 7}
            stroke={colors.gold} strokeWidth="0.8" opacity="0.75" />
        );
      }
    });
    
    // Golden onion domes (Cathedral of the Assumption, etc.)
    const domes = [
      { x: kx + 20, z: kz + 35, r: 12, drumH: 50 },
      { x: kx + 45, z: kz + 40, r: 14, drumH: 60 }, // Main dome
      { x: kx + 70, z: kz + 35, r: 11, drumH: 48 },
      { x: kx + 55, z: kz + 50, r: 9, drumH: 42 },
      { x: kx + 35, z: kz + 48, r: 10, drumH: 45 },
    ];
    
    domes.forEach((dome, di) => {
      // Drum (cylinder base)
      const drumBase = project(dome.x, 35, dome.z);
      const drumTop = project(dome.x, dome.drumH, dome.z);
      elements.push(
        <line key={`drum${di}`} x1={drumBase.x} y1={drumBase.y} x2={drumTop.x} y2={drumTop.y}
          stroke={colors.cream} strokeWidth="2" opacity="0.5" />
      );
      
      // Onion dome shape (bulbous)
      const domeCenter = project(dome.x, dome.drumH + dome.r * 0.8, dome.z);
      elements.push(
        <ellipse key={`dome${di}`} 
          cx={domeCenter.x} cy={domeCenter.y}
          rx={dome.r * 0.9} ry={dome.r * 1.4}
          fill={colors.gold} fillOpacity={isNight ? 0.3 : 0.15}
          stroke={colors.gold} strokeWidth="1.5" opacity="0.9"
          style={isNight ? { filter: `drop-shadow(0 0 6px ${colors.gold})` } : {}} />
      );
      
      // Cross on top
      const crossBase = dome.drumH + dome.r * 2.2;
      const crossP = project(dome.x, crossBase, dome.z);
      elements.push(
        <line key={`dome${di}-cross-v`}
          x1={crossP.x} y1={crossP.y}
          x2={crossP.x} y2={crossP.y - 12}
          stroke={colors.gold} strokeWidth="1.2" opacity="0.85" />,
        <line key={`dome${di}-cross-h`}
          x1={crossP.x - 5} y1={crossP.y - 8}
          x2={crossP.x + 5} y2={crossP.y - 8}
          stroke={colors.gold} strokeWidth="1.2" opacity="0.85" />
      );
    });
    
    // Label
    const labelP = project(kx + 30, 140, kz);
    elements.push(
      <text key="kremlin-label" x={labelP.x} y={labelP.y} fill={colors.red} fontSize="8"
        textAnchor="middle" fontFamily="monospace" fontWeight="bold" opacity="0.9"
        style={isNight ? { filter: `drop-shadow(0 0 3px ${colors.red})` } : {}}>
        КРЕМЛЬ
      </text>
    );
    
    return elements;
  };

  // Moskva River
  const renderWater = () => {
    const elements = [];
    const storminess = weather === 'storm' ? 2 : weather === 'rain' ? 1.3 : 1;
    
    // River (curved)
    for (let x = -500; x <= 480; x += 30) {
      const riverZ = -120 + Math.sin(x * 0.01) * 20;
      const p1 = project(x, 0, riverZ - 40);
      const p2 = project(x, 0, riverZ + 40);
      elements.push(
        <line key={`river-${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth="0.4" opacity="0.2" />
      );
    }
    
    // Horizontal river lines
    for (let offset = -35; offset <= 35; offset += 12) {
      let lastP = null;
      for (let x = -500; x <= 480; x += 25) {
        const riverZ = -120 + Math.sin(x * 0.01) * 20 + offset;
        const wave = Math.sin(time * 1.4 * storminess + x * 0.03) * storminess;
        const p = project(x, wave, riverZ);
        if (lastP) {
          elements.push(
            <line key={`riverh-${offset}-${x}`} x1={lastP.x} y1={lastP.y} x2={p.x} y2={p.y}
              stroke={colors.water} strokeWidth={0.35 * storminess} opacity={0.15 + (offset + 35) / 200} />
          );
        }
        lastP = p;
      }
    }
    
    // Reflections at night
    if (isNight && weather === 'clear') {
      const reflectionColors = [
        colors.primary, colors.steel, colors.copper, colors.blue,
        colors.highlight, colors.purple, colors.orange, colors.gold
      ];
      
      for (let i = 0; i < 35; i++) {
        const x = -450 + i * 27;
        const riverZ = -120 + Math.sin(x * 0.01) * 20;
        const color = reflectionColors[i % reflectionColors.length];
        const flicker = 0.2 + Math.sin(time * 2.5 + i * 0.6) * 0.15;
        
        for (let j = 0; j < 4; j++) {
          const z = riverZ - 25 + j * 15;
          const wave = Math.sin(time * 1.5 + i * 0.4 + j * 0.3) * 2;
          const p = project(x + Math.sin(time * 0.6 + i) * 2, wave - 1, z);
          elements.push(
            <ellipse key={`ref-${i}-${j}`} cx={p.x} cy={p.y} rx={5 + j * 0.5} ry={1}
              fill={color} opacity={flicker * (1 - j * 0.15)}
              style={{ filter: 'blur(0.5px)' }} />
          );
        }
      }
    }
    
    // River boats
    if (weather !== 'storm') {
      [{ x: -200, z: -130 }, { x: 100, z: -110 }, { x: 350, z: -125 }].forEach((boat, i) => {
        const bx = boat.x + Math.sin(time * 0.3 + i * 2) * 12;
        const wave = Math.sin(time * 1.3 + i) * 0.6;
        const h1 = project(bx - 10, wave, boat.z);
        const h2 = project(bx + 10, wave, boat.z);
        elements.push(
          <line key={`boat-${i}`} x1={h1.x} y1={h1.y} x2={h2.x} y2={h2.y}
            stroke={colors.highlight} strokeWidth="0.9" opacity="0.5" />
        );
      });
    }
    
    return elements;
  };

  // Highway with traffic
  const renderHighway = () => {
    const elements = [];
    const hwZ = -50;
    
    // Road lanes
    for (let x = -480; x <= 480; x += 25) {
      const p1 = project(x, 2, hwZ - 25);
      const p2 = project(x, 2, hwZ + 25);
      elements.push(
        <line key={`hw-${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.grid} strokeWidth="0.3" opacity="0.15" />
      );
    }
    
    // Lane markings
    const laneL = project(-480, 3, hwZ - 8);
    const laneR = project(480, 3, hwZ - 8);
    elements.push(
      <line key="lane-mark" x1={laneL.x} y1={laneL.y} x2={laneR.x} y2={laneR.y}
        stroke={colors.accent} strokeWidth="0.5" opacity="0.25" strokeDasharray="10,10" />
    );
    
    // Moving cars
    if (isNight && weather === 'clear') {
      for (let i = 0; i < 10; i++) {
        const carX = ((i * 95 + time * 35) % 960) - 480;
        const carZ = hwZ + (i % 2 === 0 ? -12 : 12);
        const carP = project(carX, 4, carZ);
        const carColor = i % 2 === 0 ? colors.accent : colors.red;
        elements.push(
          <circle key={`car-${i}`} cx={carP.x} cy={carP.y} r={1.8}
            fill={carColor} opacity="0.85"
            style={{ filter: `drop-shadow(0 0 4px ${carColor})` }} />
        );
      }
    }
    
    return elements;
  };

  // Ground grid
  const renderGrid = () => {
    const lines = [];
    const fogOpacity = weather === 'fog' ? 0.08 : 0.18;
    
    for (let x = -500; x <= 480; x += 50) {
      const p1 = project(x, 0, -40);
      const p2 = project(x, 0, 180);
      lines.push(<line key={`gx${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.35" opacity={fogOpacity} />);
    }
    for (let z = -40; z <= 180; z += 50) {
      const p1 = project(-500, 0, z);
      const p2 = project(480, 0, z);
      lines.push(<line key={`gz${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.35" opacity={fogOpacity} />);
    }
    return lines;
  };

  // Weather
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
              stroke={colors.primary} strokeWidth={0.6 * intensity} opacity={0.28 * intensity} />
          );
        })}
      </g>
    );
  };

  const renderSnow = () => {
    if (weather !== 'snow') return null;
    return (
      <g>
        {snowFlakes.map((flake, i) => {
          const wobbleX = Math.sin(time * 2 + flake.wobble) * 20 * windSpeed;
          const x = ((flake.x + wobbleX + time * 20 * windSpeed) % 1000);
          const y = ((flake.y + time * flake.speed * 25) % 600);
          return (
            <g key={`snow-${i}`}>
              <circle cx={x} cy={y} r={flake.size} fill="#fff" opacity={0.65} />
              {flake.size > 2.5 && (
                <g opacity={0.3}>
                  <line x1={x - flake.size} y1={y} x2={x + flake.size} y2={y} stroke="#fff" strokeWidth="0.3" />
                  <line x1={x} y1={y - flake.size} x2={x} y2={y + flake.size} stroke="#fff" strokeWidth="0.3" />
                </g>
              )}
            </g>
          );
        })}
        <rect x="0" y="468" width="900" height="52" fill="#fff" opacity="0.08" />
      </g>
    );
  };

  const renderClouds = () => {
    if (weather === 'clear' && timeOfDay > 0.3 && timeOfDay < 0.7) return null;
    const cloudOpacity = weather === 'storm' ? 0.55 : weather === 'fog' ? 0.4 : 0.28;
    const cloudColor = weather === 'storm' ? '#1a1a22' : '#667788';
    
    return (
      <g>
        {clouds.map((cloud, i) => {
          const x = ((cloud.x + time * cloud.speed * 14 * (1 + windSpeed)) % 1100) - 100;
          return (
            <g key={`cloud-${i}`} opacity={cloudOpacity}>
              <ellipse cx={x} cy={cloud.y} rx={cloud.width / 2} ry={cloud.height / 2} fill={cloudColor} />
              <ellipse cx={x - cloud.width * 0.28} cy={cloud.y + 3} rx={cloud.width / 3.5} ry={cloud.height / 2.8} fill={cloudColor} />
              <ellipse cx={x + cloud.width * 0.28} cy={cloud.y + 2} rx={cloud.width / 3.5} ry={cloud.height / 2.8} fill={cloudColor} />
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
        {[...Array(6)].map((_, i) => (
          <rect key={`fog-${i}`} x={-50 + Math.sin(time * 0.25 + i) * 18} y={235 + i * 45}
            width="1000" height="50" fill={`url(#fogGrad)`} opacity={0.1 + i * 0.03} />
        ))}
      </g>
    );
  };

  const renderCelestial = () => {
    if (weather === 'storm' || weather === 'fog') return null;
    if (timeOfDay > 0.7) {
      return (
        <g>
          <circle cx="810" cy="52" r="14" fill="none" stroke={colors.accent} strokeWidth="0.6" opacity="0.35" />
          <circle cx="810" cy="52" r="11" fill={colors.accent} opacity="0.05" />
        </g>
      );
    } else if (timeOfDay < 0.3 || timeOfDay > 0.6) {
      const sunY = timeOfDay < 0.3 ? 75 - timeOfDay * 150 : 75 - (1 - timeOfDay) * 115;
      return (
        <g>
          <circle cx="825" cy={sunY} r="20" fill={colors.orange} opacity="0.22" />
          <circle cx="825" cy={sunY} r="13" fill={colors.accent} opacity="0.38" />
        </g>
      );
    }
    return null;
  };

  const renderWindIndicator = () => {
    const windAngle = Math.PI * 0.18;
    const arrowLen = 14 + windSpeed * 24;
    return (
      <g transform="translate(44, 68)">
        <circle cx="0" cy="0" r="19" fill="rgba(0,0,0,0.28)" stroke={colors.primary} strokeWidth="0.6" />
        <text x="0" y="-24" fill={colors.primary} fontSize="6" textAnchor="middle">ВЕТЕР</text>
        <line x1={-Math.cos(windAngle) * 3} y1={-Math.sin(windAngle) * 3}
          x2={Math.cos(windAngle) * arrowLen} y2={Math.sin(windAngle) * arrowLen}
          stroke={colors.accent} strokeWidth="1.4" markerEnd="url(#arrow)" />
        <text x="0" y="32" fill={colors.accent} fontSize="6" textAnchor="middle">{Math.round(windSpeed * 30)} км/ч</text>
      </g>
    );
  };

  const getBuildingDepth = (b) => project(b.x, b.h / 2, b.z).z;
  const weatherIcons = { clear: '☀️', rain: '🌧️', snow: '❄️', storm: '⛈️', fog: '🌫️' };

  return (
    <div style={{
      background: `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 26%, ${colors.sky3} 54%, ${colors.sky4} 100%)`,
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
            МОСКВА MOSCOW
          </div>
          <div style={{ color: colors.highlight, fontSize: '8px', letterSpacing: '3px' }}>
            SGI IRIS 1400 • МОСКВА-СИТИ
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
            background: lightning ? '#2a3038' : `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 22%, ${colors.sky3} 46%, ${colors.sky4} 70%, ${colors.water}20 100%)`,
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
              <stop offset="0%" stopColor="#889" stopOpacity="0"/>
              <stop offset="50%" stopColor="#889" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#889" stopOpacity="0"/>
            </linearGradient>
            <marker id="arrow" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill={colors.accent} />
            </marker>
          </defs>

          {/* Stars */}
          {isNight && weather === 'clear' && [...Array(75)].map((_, i) => (
            <circle key={`star${i}`}
              cx={(Math.sin(i * 127.1) * 0.5 + 0.5) * 900}
              cy={(Math.cos(i * 311.7) * 0.5 + 0.5) * 115}
              r={0.35 + Math.random() * 0.35}
              fill="#fff"
              opacity={0.08 + Math.sin(time * 1.4 + i) * 0.06} />
          ))}

          {renderClouds()}
          {renderCelestial()}
          {renderWater()}
          {renderGrid()}
          {renderHighway()}
          {renderKremlin()}

          {/* Buildings */}
          {buildings
            .map((b, i) => ({ ...b, idx: i, depth: getBuildingDepth(b) }))
            .sort((a, b) => b.depth - a.depth)
            .map(b => renderBuilding(b, b.idx))}

          {/* Labels */}
          {showInfo && weather !== 'storm' && buildings.filter(b => b.name).map((b, i) => {
            const labelY = b.h + (b.federation ? 55 : b.evolution ? 30 : b.stalinist ? 40 : 16);
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
          {renderSnow()}
          {renderLightning()}
          {renderWindIndicator()}

          <text x="450" y="495" fill={colors.water} fontSize="8" textAnchor="middle" opacity={weather === 'fog' ? 0.12 : 0.25}>
            ★ МОСКВА-РЕКА ★
          </text>

          <rect width="900" height="520" fill="url(#scan)" opacity="0.18"/>
          <rect x="0" y={scanline} width="900" height="1" fill="rgba(255,255,255,0.008)"/>
        </svg>
      </div>

      {/* Weather Controls */}
      <div style={{ marginTop: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['clear', 'rain', 'snow', 'storm', 'fog'].map(w => (
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
      </div>

      {/* Sliders */}
      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: colors.highlight, fontSize: '7px' }}>🍃</span>
        <input type="range" min="0" max="1" step="0.05" value={windSpeed}
          onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
          style={{ width: '95px', accentColor: colors.highlight }} />
        <span style={{ color: '#666', fontSize: '7px' }}>{Math.round(windSpeed * 30)} км/ч</span>
      </div>

      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: colors.accent, fontSize: '7px' }}>🌅</span>
        <input type="range" min="0" max="1" step="0.01" value={timeOfDay}
          onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
          style={{ width: '120px', accentColor: colors.accent }} />
        <span style={{ color: colors.primary, fontSize: '7px' }}>🌙</span>
        <span style={{ color: '#666', fontSize: '7px', marginLeft: '2px' }}>
          {timeOfDay < 0.25 ? 'ВОСХОД' : timeOfDay < 0.6 ? 'ДЕНЬ' : timeOfDay < 0.75 ? 'ЗАКАТ' : 'НОЧЬ'}
        </span>
      </div>

      {/* View Controls */}
      <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setAutoRotate(a => !a)} style={{
          background: autoRotate ? colors.highlight : 'transparent',
          border: `1px solid ${colors.highlight}`,
          color: autoRotate ? '#000' : colors.highlight,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>{autoRotate ? '⏸ СТОП' : '▶ ВРАЩАТЬ'}</button>
        
        <button onClick={() => setShowInfo(s => !s)} style={{
          background: showInfo ? colors.accent : 'transparent',
          border: `1px solid ${colors.accent}`,
          color: showInfo ? '#000' : colors.accent,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🏷 МЕТКИ</button>
        
        <button onClick={() => setCamera({ rotationY: 0.1, rotationX: 0.2, zoom: 1, panX: 0, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.secondary}`, color: colors.secondary,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>↺ СБРОС</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.7, zoom: 0.55 }))} style={{
          background: 'transparent', border: `1px solid ${colors.purple}`, color: colors.purple,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>⬆ СВЕРХУ</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.05, zoom: 1.45 }))} style={{
          background: 'transparent', border: `1px solid ${colors.orange}`, color: colors.orange,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>👁 УЛИЦА</button>
        
        <button onClick={() => setCamera({ rotationY: -0.4, rotationX: 0.18, zoom: 1.2, panX: -150, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.red}`, color: colors.red,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🏰 КРЕМЛЬ</button>
        
        <button onClick={() => setCamera({ rotationY: 0.25, rotationX: 0.16, zoom: 1.25, panX: -50, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.steel}`, color: colors.steel,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🏙 СИТИ</button>
        
        <button onClick={() => setCamera({ rotationY: 0.15, rotationX: 0.14, zoom: 1.5, panX: 120, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.cream}`, color: colors.cream,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🏨 СТАЛИНКИ</button>
      </div>

      <div style={{ marginTop: '4px', color: colors.highlight, fontSize: '6px', textAlign: 'center', opacity: 0.45 }}>
        DRAG: Rotate | SHIFT+DRAG: Pan | SCROLL: Zoom
      </div>

      <div style={{ display: 'flex', marginTop: '4px', gap: '2px' }}>
        {[colors.primary, colors.secondary, colors.accent, colors.highlight, colors.purple, colors.steel, colors.copper, colors.red, colors.cream].map((c, i) => (
          <div key={i} style={{ width: '18px', height: '3px', background: c, boxShadow: isNight ? `0 0 4px ${c}` : 'none' }}/>
        ))}
      </div>
    </div>
  );
}
