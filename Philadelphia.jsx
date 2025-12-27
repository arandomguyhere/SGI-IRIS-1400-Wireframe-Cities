import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function PhillyAccurate() {
  const [time, setTime] = useState(0);
  const [scanline, setScanline] = useState(0);
  const [camera, setCamera] = useState({
    rotationY: 0.12,
    rotationX: 0.2,
    zoom: 1,
    panX: 0,
    panY: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState('rotate');
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState(0.82);
  const [showInfo, setShowInfo] = useState(true);
  const [weather, setWeather] = useState('clear');
  const [lightning, setLightning] = useState(false);
  const [windSpeed, setWindSpeed] = useState(0.35);
  const svgRef = useRef(null);

  // Particles
  const [rainDrops] = useState(() => 
    Array.from({ length: 150 }, () => ({
      x: Math.random() * 1000 - 50,
      y: Math.random() * 600,
      speed: 8 + Math.random() * 6,
      length: 10 + Math.random() * 15
    }))
  );

  const [snowFlakes] = useState(() =>
    Array.from({ length: 200 }, () => ({
      x: Math.random() * 1000,
      y: Math.random() * 600,
      size: 1 + Math.random() * 3,
      speed: 1 + Math.random() * 2,
      wobble: Math.random() * Math.PI * 2
    }))
  );

  const [clouds] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      x: i * 130 - 100,
      y: 35 + Math.random() * 50,
      width: 80 + Math.random() * 60,
      height: 25 + Math.random() * 20,
      speed: 0.3 + Math.random() * 0.4
    }))
  );

  // Trees along riverbank
  const [trees] = useState(() =>
    Array.from({ length: 35 }, (_, i) => ({
      x: -420 + i * 25 + (Math.random() - 0.5) * 10,
      z: -70 + (Math.random() - 0.5) * 15,
      size: 12 + Math.random() * 8,
      phase: Math.random() * Math.PI * 2
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
        setCamera(c => ({ ...c, rotationY: c.rotationY + 0.0018 }));
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

  // Colors - Liberty Place blue is key!
  const getColors = () => {
    const isNight = timeOfDay > 0.75;
    const isSunset = timeOfDay > 0.6 && timeOfDay <= 0.75;
    const isStormy = weather === 'storm' || weather === 'rain';
    
    let base;
    if (isNight) {
      base = {
        primary: '#00D4FF',
        secondary: '#FF6B9D',
        accent: '#FFD700',
        highlight: '#00FF88',
        purple: '#B388FF',
        orange: '#FF8C00',
        libertyBlue: '#00AADD', // Liberty Place signature blue
        teal: '#00DDAA',
        silver: '#AABBCC',
        red: '#FF4455',
        water: '#0044AA',
        grid: '#4400AA',
        tree: '#00AA44',
        sky1: '#030306',
        sky2: '#060812',
        sky3: '#0a0c1a',
        sky4: '#101428'
      };
    } else if (isSunset) {
      base = {
        primary: '#00BBDD',
        secondary: '#FF5588',
        accent: '#FFBB00',
        highlight: '#00DD77',
        purple: '#CC66FF',
        orange: '#FF5500',
        libertyBlue: '#0088BB',
        teal: '#00BB88',
        silver: '#99AABB',
        red: '#DD3344',
        water: '#004466',
        grid: '#5511AA',
        tree: '#228833',
        sky1: '#0d0818',
        sky2: '#2a1535',
        sky3: '#6a2845',
        sky4: '#cc6030'
      };
    } else {
      base = {
        primary: '#0099CC',
        secondary: '#DD4477',
        accent: '#DDAA00',
        highlight: '#00AA55',
        purple: '#9955CC',
        orange: '#DD5500',
        libertyBlue: '#0077AA',
        teal: '#009977',
        silver: '#8899AA',
        red: '#CC3344',
        water: '#006699',
        grid: '#3311AA',
        tree: '#227744',
        sky1: '#2a4060',
        sky2: '#4a6080',
        sky3: '#6a80a0',
        sky4: '#8aa0c0'
      };
    }

    if (isStormy) {
      base.sky1 = '#101015';
      base.sky2 = '#181822';
      base.sky3 = '#252530';
      base.sky4 = '#353545';
      base.water = '#001833';
      base.tree = '#115533';
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

  // Philadelphia Buildings - Schuylkill River view (looking east)
  // Based on reference photos - left to right arrangement
  const buildings = [
    // === FAR LEFT ===
    { x: -380, z: 70, w: 24, d: 24, h: 75, color: colors.purple },
    { x: -345, z: 55, w: 26, d: 26, h: 90, color: colors.secondary },
    
    // === CIRA CENTRE / FMC TOWER area ===
    { x: -305, z: 60, w: 32, d: 32, h: 145, color: colors.teal, name: 'CIRA CENTRE', info: { height: '436 ft', year: 2005, floors: 29 } },
    { x: -265, z: 75, w: 30, d: 30, h: 160, color: colors.highlight, name: 'FMC TOWER', info: { height: '736 ft', year: 2016, floors: 49 } },
    
    { x: -225, z: 60, w: 26, d: 26, h: 100, color: colors.purple },
    { x: -190, z: 70, w: 28, d: 28, h: 115, color: colors.orange },
    
    // === COMCAST TECHNOLOGY CENTER - Tallest, silver/glass ===
    { x: -145, z: 55, w: 44, d: 44, h: 300, color: colors.silver, name: 'COMCAST TECH', comcastTech: true, info: { height: '1,121 ft', year: 2018, floors: 60, note: 'Tallest in Philadelphia' } },
    
    // === COMCAST CENTER - Curved glass ===
    { x: -90, z: 65, w: 42, d: 42, h: 235, color: colors.primary, name: 'COMCAST CENTER', comcast: true, info: { height: '974 ft', year: 2008, floors: 58 } },
    
    { x: -45, z: 75, w: 26, d: 26, h: 130, color: colors.purple },
    { x: -15, z: 60, w: 28, d: 28, h: 145, color: colors.secondary },
    
    // === ONE LIBERTY PLACE - Blue pyramidal crown (most prominent!) ===
    { x: 35, z: 55, w: 46, d: 46, h: 265, color: colors.libertyBlue, name: 'ONE LIBERTY', libertyOne: true, info: { height: '945 ft', year: 1987, floors: 61, note: 'First to exceed City Hall' } },
    
    // === TWO LIBERTY PLACE - Matching blue crown ===
    { x: 95, z: 60, w: 42, d: 42, h: 235, color: colors.libertyBlue, name: 'TWO LIBERTY', libertyTwo: true, info: { height: '848 ft', year: 1990, floors: 58 } },
    
    // Mellon Bank Center
    { x: 145, z: 70, w: 36, d: 36, h: 190, color: colors.accent, name: 'MELLON CENTER', info: { height: '792 ft', year: 1990, floors: 54 } },
    
    { x: 185, z: 55, w: 28, d: 28, h: 140, color: colors.purple },
    
    // === CITY HALL - In background, with William Penn ===
    { x: 230, z: 90, w: 50, d: 50, h: 140, color: colors.accent, name: 'CITY HALL', cityHall: true, info: { height: '548 ft', year: 1901, floors: 9, note: 'William Penn statue' } },
    
    // === THREE LOGAN SQUARE ===
    { x: 280, z: 65, w: 34, d: 34, h: 175, color: colors.teal, name: 'THREE LOGAN', info: { height: '739 ft', year: 2019, floors: 60 } },
    
    // === BNY MELLON ===
    { x: 330, z: 55, w: 36, d: 36, h: 195, color: colors.primary, name: 'BNY MELLON', info: { height: '792 ft', year: 1990, floors: 54 } },
    
    { x: 375, z: 70, w: 26, d: 26, h: 110, color: colors.secondary },
    { x: 410, z: 60, w: 24, d: 24, h: 85, color: colors.purple },
    
    // === BACKGROUND BUILDINGS ===
    { x: -360, z: 150, w: 20, d: 20, h: 50, color: colors.purple },
    { x: -280, z: 155, w: 22, d: 22, h: 60, color: colors.secondary },
    { x: -200, z: 145, w: 18, d: 18, h: 45, color: colors.primary },
    { x: -120, z: 160, w: 20, d: 20, h: 55, color: colors.highlight },
    { x: -40, z: 150, w: 22, d: 22, h: 65, color: colors.accent },
    { x: 40, z: 155, w: 18, d: 18, h: 50, color: colors.purple },
    { x: 120, z: 145, w: 20, d: 20, h: 60, color: colors.secondary },
    { x: 200, z: 160, w: 22, d: 22, h: 45, color: colors.primary },
    { x: 280, z: 150, w: 18, d: 18, h: 55, color: colors.highlight },
    { x: 360, z: 155, w: 20, d: 20, h: 50, color: colors.accent },
  ];

  // Render building wireframe
  const renderBuilding = (b, idx) => {
    const lines = [];
    const hw = b.w / 2;
    const hd = b.d / 2;
    const windowSpacing = 14;
    const fogOpacity = weather === 'fog' ? 0.5 : 1;

    // One Liberty Place - Prominent blue pyramidal crown
    if (b.libertyOne) {
      // Main shaft with setbacks
      const setbacks = [
        { h: 0, top: 200, scale: 1 },
        { h: 200, top: 230, scale: 0.85 },
        { h: 230, top: 250, scale: 0.65 }
      ];
      
      setbacks.forEach((sec, si) => {
        const sw = hw * sec.scale;
        const sd = hd * sec.scale;
        const corners = [
          [b.x - sw, b.z - sd], [b.x + sw, b.z - sd],
          [b.x + sw, b.z + sd], [b.x - sw, b.z + sd]
        ];
        
        corners.forEach(([cx, cz]) => {
          const p1 = project(cx, sec.h, cz);
          const p2 = project(cx, sec.top, cz);
          lines.push({ ...p1, x2: p2.x, y2: p2.y });
        });
        
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const pt1 = project(c1[0], sec.top, c1[1]);
          const pt2 = project(c2[0], sec.top, c2[1]);
          lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
          
          if (si > 0) {
            const pb1 = project(c1[0], sec.h, c1[1]);
            const pb2 = project(c2[0], sec.h, c2[1]);
            lines.push({ ...pb1, x2: pb2.x, y2: pb2.y });
          }
        }
        
        // Floor lines
        if (si === 0) {
          const floorCount = Math.floor((sec.top - sec.h) / windowSpacing);
          for (let f = 1; f < floorCount; f++) {
            const y = sec.h + f * windowSpacing;
            const p1 = project(b.x - sw, y, b.z - sd);
            const p2 = project(b.x + sw, y, b.z - sd);
            lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
          }
        }
      });
      
      // BLUE PYRAMIDAL CROWN - The signature look!
      const crownBase = 250;
      const crownScale = 0.55;
      const crownCorners = [
        [b.x - hw * crownScale, b.z - hd * crownScale],
        [b.x + hw * crownScale, b.z - hd * crownScale],
        [b.x + hw * crownScale, b.z + hd * crownScale],
        [b.x - hw * crownScale, b.z + hd * crownScale]
      ];
      
      // Pyramid faces
      const spireTop = project(b.x, b.h + 45, b.z);
      crownCorners.forEach(([cx, cz], i) => {
        const p = project(cx, crownBase, cz);
        lines.push({ ...p, x2: spireTop.x, y2: spireTop.y, crown: true });
        
        // Edge lines of pyramid
        const next = crownCorners[(i + 1) % 4];
        const pNext = project(next[0], crownBase, next[1]);
        lines.push({ ...p, x2: pNext.x, y2: pNext.y, crown: true });
      });
      
      // Horizontal rings on pyramid
      for (let ring = 1; ring < 4; ring++) {
        const ringY = crownBase + ring * 12;
        const ringScale = crownScale * (1 - ring * 0.2);
        for (let i = 0; i < 4; i++) {
          const angle1 = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const angle2 = ((i + 1) / 4) * Math.PI * 2 + Math.PI / 4;
          const r = hw * ringScale;
          const p1 = project(b.x + Math.cos(angle1) * r, ringY, b.z + Math.sin(angle1) * r);
          const p2 = project(b.x + Math.cos(angle2) * r, ringY, b.z + Math.sin(angle2) * r);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, crownRing: true });
        }
      }
    }
    // Two Liberty Place - Similar but slightly different proportions
    else if (b.libertyTwo) {
      const setbacks = [
        { h: 0, top: 175, scale: 1 },
        { h: 175, top: 200, scale: 0.85 },
        { h: 200, top: 220, scale: 0.65 }
      ];
      
      setbacks.forEach((sec, si) => {
        const sw = hw * sec.scale;
        const sd = hd * sec.scale;
        const corners = [
          [b.x - sw, b.z - sd], [b.x + sw, b.z - sd],
          [b.x + sw, b.z + sd], [b.x - sw, b.z + sd]
        ];
        
        corners.forEach(([cx, cz]) => {
          const p1 = project(cx, sec.h, cz);
          const p2 = project(cx, sec.top, cz);
          lines.push({ ...p1, x2: p2.x, y2: p2.y });
        });
        
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const pt1 = project(c1[0], sec.top, c1[1]);
          const pt2 = project(c2[0], sec.top, c2[1]);
          lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
          
          if (si > 0) {
            const pb1 = project(c1[0], sec.h, c1[1]);
            const pb2 = project(c2[0], sec.h, c2[1]);
            lines.push({ ...pb1, x2: pb2.x, y2: pb2.y });
          }
        }
        
        if (si === 0) {
          const floorCount = Math.floor((sec.top - sec.h) / windowSpacing);
          for (let f = 1; f < floorCount; f++) {
            const y = sec.h + f * windowSpacing;
            const p1 = project(b.x - sw, y, b.z - sd);
            const p2 = project(b.x + sw, y, b.z - sd);
            lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
          }
        }
      });
      
      // Blue pyramidal crown
      const crownBase = 220;
      const crownScale = 0.5;
      const crownCorners = [
        [b.x - hw * crownScale, b.z - hd * crownScale],
        [b.x + hw * crownScale, b.z - hd * crownScale],
        [b.x + hw * crownScale, b.z + hd * crownScale],
        [b.x - hw * crownScale, b.z + hd * crownScale]
      ];
      
      const spireTop = project(b.x, b.h + 40, b.z);
      crownCorners.forEach(([cx, cz], i) => {
        const p = project(cx, crownBase, cz);
        lines.push({ ...p, x2: spireTop.x, y2: spireTop.y, crown: true });
        
        const next = crownCorners[(i + 1) % 4];
        const pNext = project(next[0], crownBase, next[1]);
        lines.push({ ...p, x2: pNext.x, y2: pNext.y, crown: true });
      });
      
      // Horizontal rings
      for (let ring = 1; ring < 3; ring++) {
        const ringY = crownBase + ring * 10;
        const ringScale = crownScale * (1 - ring * 0.22);
        for (let i = 0; i < 4; i++) {
          const angle1 = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const angle2 = ((i + 1) / 4) * Math.PI * 2 + Math.PI / 4;
          const r = hw * ringScale;
          const p1 = project(b.x + Math.cos(angle1) * r, ringY, b.z + Math.sin(angle1) * r);
          const p2 = project(b.x + Math.cos(angle2) * r, ringY, b.z + Math.sin(angle2) * r);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, crownRing: true });
        }
      }
    }
    // Comcast Technology Center
    else if (b.comcastTech) {
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
      
      // Horizontal bands
      const numBands = 22;
      for (let f = 1; f < numBands; f++) {
        const y = (f / numBands) * b.h;
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const p1 = project(c1[0], y, c1[1]);
          const p2 = project(c2[0], y, c2[1]);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
        }
      }
      
      // Antenna
      const spireBase = project(b.x, b.h, b.z);
      const spireTop = project(b.x, b.h + 20, b.z);
      lines.push({ ...spireBase, x2: spireTop.x, y2: spireTop.y, thin: true });
    }
    // Comcast Center - Curved
    else if (b.comcast) {
      const numSegments = 18;
      for (let s = 0; s < numSegments; s++) {
        const y1 = (s / numSegments) * b.h;
        const y2 = ((s + 1) / numSegments) * b.h;
        const curve1 = Math.sin((s / numSegments) * Math.PI) * 4;
        const curve2 = Math.sin(((s + 1) / numSegments) * Math.PI) * 4;
        
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const nextAngle = ((i + 1) / 4) * Math.PI * 2 + Math.PI / 4;
          const r1 = hw + curve1;
          const r2 = hw + curve2;
          
          const x1 = b.x + Math.cos(angle) * r1;
          const z1 = b.z + Math.sin(angle) * r1;
          const x2 = b.x + Math.cos(angle) * r2;
          const z2 = b.z + Math.sin(angle) * r2;
          const x3 = b.x + Math.cos(nextAngle) * r1;
          const z3 = b.z + Math.sin(nextAngle) * r1;
          
          const p1 = project(x1, y1, z1);
          const p2 = project(x2, y2, z2);
          const p3 = project(x3, y1, z3);
          
          lines.push({ ...p1, x2: p2.x, y2: p2.y });
          if (s % 3 === 0) {
            lines.push({ ...p1, x2: p3.x, y2: p3.y, floor: true });
          }
        }
      }
    }
    // City Hall with William Penn
    else if (b.cityHall) {
      const baseH = b.h * 0.45;
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      // Base
      corners.forEach(([cx, cz]) => {
        const p1 = project(cx, 0, cz);
        const p2 = project(cx, baseH, cz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      for (let i = 0; i < 4; i++) {
        const c1 = corners[i], c2 = corners[(i + 1) % 4];
        const pb1 = project(c1[0], 0, c1[1]);
        const pb2 = project(c2[0], 0, c2[1]);
        const pt1 = project(c1[0], baseH, c1[1]);
        const pt2 = project(c2[0], baseH, c2[1]);
        lines.push({ ...pb1, x2: pb2.x, y2: pb2.y });
        lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
      }
      
      // Tower
      const towerScale = 0.3;
      const towerCorners = [
        [b.x - hw * towerScale, b.z - hd * towerScale],
        [b.x + hw * towerScale, b.z - hd * towerScale],
        [b.x + hw * towerScale, b.z + hd * towerScale],
        [b.x - hw * towerScale, b.z + hd * towerScale]
      ];
      
      towerCorners.forEach(([cx, cz]) => {
        const p1 = project(cx, baseH, cz);
        const p2 = project(cx, b.h * 0.85, cz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      for (let i = 0; i < 4; i++) {
        const c1 = towerCorners[i], c2 = towerCorners[(i + 1) % 4];
        const pt1 = project(c1[0], b.h * 0.85, c1[1]);
        const pt2 = project(c2[0], b.h * 0.85, c2[1]);
        lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
      }
      
      // Dome
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = hw * towerScale * 0.7;
        const p1 = project(b.x + Math.cos(angle) * r, b.h * 0.85, b.z + Math.sin(angle) * r);
        const p2 = project(b.x + Math.cos(angle) * r * 0.2, b.h * 0.95, b.z + Math.sin(angle) * r * 0.2);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      }
      
      // William Penn
      const statueBase = project(b.x, b.h * 0.95, b.z);
      const statueTop = project(b.x, b.h + 18, b.z);
      lines.push({ ...statueBase, x2: statueTop.x, y2: statueTop.y, statue: true });
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

    return lines.map((l, i) => (
      <line
        key={`b${idx}-${i}`}
        x1={l.x} y1={l.y} x2={l.x2} y2={l.y2}
        stroke={l.crown || l.crownRing ? colors.libertyBlue : b.color}
        strokeWidth={l.thin ? 0.6 : l.crown ? 1.4 : l.crownRing ? 0.6 : l.statue ? 1.8 : l.floor ? 0.25 : 1.2}
        opacity={(l.floor ? 0.18 : l.crown ? 0.95 : l.crownRing ? 0.6 : l.statue ? 0.95 : 0.9) * fogOpacity}
        style={{ filter: isNight && !lightning ? `drop-shadow(0 0 ${l.crown ? 4 : l.statue ? 3 : 2}px ${l.crown || l.crownRing ? colors.libertyBlue : b.color})` : 'none' }}
      />
    ));
  };

  // Trees along Schuylkill River bank
  const renderTrees = () => {
    if (weather === 'snow') return null; // No leaves in winter
    
    return trees.map((tree, i) => {
      const sway = Math.sin(time * 1.5 + tree.phase) * windSpeed * 3;
      const elements = [];
      
      // Trunk
      const trunkBase = project(tree.x, 0, tree.z);
      const trunkTop = project(tree.x + sway * 0.3, tree.size * 0.4, tree.z);
      elements.push(
        <line key={`trunk-${i}`} x1={trunkBase.x} y1={trunkBase.y} x2={trunkTop.x} y2={trunkTop.y}
          stroke={colors.tree} strokeWidth="1" opacity="0.5" />
      );
      
      // Foliage (simplified as circles/ellipses)
      const foliageCenter = project(tree.x + sway, tree.size * 0.6, tree.z);
      elements.push(
        <ellipse key={`foliage-${i}`} cx={foliageCenter.x} cy={foliageCenter.y}
          rx={tree.size * 0.4} ry={tree.size * 0.35}
          fill={colors.tree} opacity={0.4}
          style={isNight ? { filter: `drop-shadow(0 0 2px ${colors.tree})` } : {}} />
      );
      
      // Wireframe outline
      elements.push(
        <ellipse key={`foliage-wire-${i}`} cx={foliageCenter.x} cy={foliageCenter.y}
          rx={tree.size * 0.4} ry={tree.size * 0.35}
          fill="none" stroke={colors.highlight} strokeWidth="0.4" opacity="0.3" />
      );
      
      return elements;
    });
  };

  // I-76 Highway (visible in night photo)
  const renderHighway = () => {
    const elements = [];
    const hwY = 5;
    const hwZ = -55;
    
    // Road surface
    for (let x = -450; x <= 450; x += 30) {
      const p1 = project(x, hwY, hwZ - 12);
      const p2 = project(x, hwY, hwZ + 12);
      elements.push(
        <line key={`hw-cross-${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.grid} strokeWidth="0.4" opacity="0.2" />
      );
    }
    
    // Lane markings
    const laneP1 = project(-450, hwY + 0.5, hwZ);
    const laneP2 = project(450, hwY + 0.5, hwZ);
    elements.push(
      <line key="hw-center" x1={laneP1.x} y1={laneP1.y} x2={laneP2.x} y2={laneP2.y}
        stroke={colors.accent} strokeWidth="0.6" opacity="0.3" strokeDasharray="8,8" />
    );
    
    // Moving car lights at night
    if (isNight && weather === 'clear') {
      for (let i = 0; i < 8; i++) {
        const carX = ((i * 120 + time * 40) % 900) - 450;
        const carZ = hwZ + (i % 2 === 0 ? -5 : 5);
        const carP = project(carX, hwY + 2, carZ);
        
        elements.push(
          <circle key={`car-${i}`} cx={carP.x} cy={carP.y} r={2}
            fill={i % 2 === 0 ? colors.accent : colors.red} opacity={0.8}
            style={{ filter: `drop-shadow(0 0 4px ${i % 2 === 0 ? colors.accent : colors.red})` }} />
        );
      }
    }
    
    return elements;
  };

  // Schuylkill River
  const renderWater = () => {
    const elements = [];
    const storminess = weather === 'storm' ? 2 : weather === 'rain' ? 1.3 : 1;
    
    // Water grid
    for (let x = -450; x <= 450; x += 35) {
      const p1 = project(x, 0, -200);
      const p2 = project(x, 0, -75);
      elements.push(
        <line key={`wg-${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth="0.35" opacity="0.2" />
      );
    }
    for (let z = -200; z <= -75; z += 18) {
      const wave = Math.sin(time * 1.5 * storminess + z * 0.08) * 1.2 * storminess;
      const p1 = project(-450, wave, z);
      const p2 = project(450, wave, z);
      elements.push(
        <line key={`wz-${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth={0.5 * storminess} opacity={0.12 + (z + 200) / 500} />
      );
    }
    
    // Beautiful reflections (as seen in reference photos)
    if (isNight && weather === 'clear') {
      const reflectionColors = [
        colors.libertyBlue, colors.libertyBlue, // Liberty Place blue reflections
        colors.accent, colors.silver, colors.primary,
        colors.secondary, colors.teal, colors.highlight
      ];
      
      for (let i = 0; i < 40; i++) {
        const x = -420 + i * 22;
        const flicker = 0.22 + Math.sin(time * 2.2 + i * 0.5) * 0.15;
        const color = reflectionColors[i % reflectionColors.length];
        
        for (let j = 0; j < 6; j++) {
          const z = -180 + j * 18;
          const wave = Math.sin(time * 1.6 + i * 0.35 + j * 0.2) * 2;
          const p = project(x + Math.sin(time * 0.7 + i) * 2.5, wave - 1.5, z);
          elements.push(
            <ellipse key={`ref-${i}-${j}`} cx={p.x} cy={p.y} rx={4 + j * 0.6} ry={0.9}
              fill={color} opacity={flicker * (1 - j * 0.1)}
              style={{ filter: 'blur(0.6px)' }} />
          );
        }
      }
    }
    
    // Boats
    if (weather !== 'storm') {
      [{ x: -250, z: -150 }, { x: 50, z: -165 }, { x: 300, z: -145 }].forEach((boat, i) => {
        const bx = boat.x + Math.sin(time * 0.25 + i) * 8;
        const bobY = Math.sin(time * 1.4 + i * 2) * 0.6;
        
        const h1 = project(bx - 6, bobY, boat.z);
        const h2 = project(bx + 6, bobY, boat.z);
        
        elements.push(
          <line key={`boat-${i}`} x1={h1.x} y1={h1.y} x2={h2.x} y2={h2.y}
            stroke={colors.highlight} strokeWidth="0.8" opacity="0.5" />
        );
      });
    }
    
    return elements;
  };

  // Ground grid
  const renderGrid = () => {
    const lines = [];
    const fogOpacity = weather === 'fog' ? 0.1 : 0.25;
    
    for (let x = -450; x <= 450; x += 50) {
      const p1 = project(x, 0, -50);
      const p2 = project(x, 0, 180);
      lines.push(<line key={`gx${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.4" opacity={fogOpacity} />);
    }
    for (let z = -50; z <= 180; z += 50) {
      const p1 = project(-450, 0, z);
      const p2 = project(450, 0, z);
      lines.push(<line key={`gz${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.4" opacity={fogOpacity} />);
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
              stroke={colors.primary} strokeWidth={0.7 * intensity} opacity={0.3 * intensity} />
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
          const wobbleX = Math.sin(time * 2 + flake.wobble) * 16 * windSpeed;
          const x = ((flake.x + wobbleX + time * 16 * windSpeed) % 1000);
          const y = ((flake.y + time * flake.speed * 26) % 600);
          return (
            <g key={`snow-${i}`}>
              <circle cx={x} cy={y} r={flake.size} fill="#fff" opacity={0.6} />
            </g>
          );
        })}
        <rect x="0" y="470" width="900" height="50" fill="#fff" opacity="0.06" />
      </g>
    );
  };

  const renderClouds = () => {
    if (weather === 'clear' && timeOfDay > 0.3 && timeOfDay < 0.7) return null;
    const cloudOpacity = weather === 'storm' ? 0.55 : weather === 'fog' ? 0.4 : 0.3;
    const cloudColor = weather === 'storm' ? '#222230' : '#7788aa';
    
    return (
      <g>
        {clouds.map((cloud, i) => {
          const x = ((cloud.x + time * cloud.speed * 16 * (1 + windSpeed)) % 1100) - 100;
          return (
            <g key={`cloud-${i}`} opacity={cloudOpacity}>
              <ellipse cx={x} cy={cloud.y} rx={cloud.width / 2} ry={cloud.height / 2} fill={cloudColor} />
              <ellipse cx={x - cloud.width * 0.3} cy={cloud.y + 4} rx={cloud.width / 3} ry={cloud.height / 2.5} fill={cloudColor} />
              <ellipse cx={x + cloud.width * 0.3} cy={cloud.y + 3} rx={cloud.width / 3} ry={cloud.height / 2.5} fill={cloudColor} />
            </g>
          );
        })}
      </g>
    );
  };

  const renderLightning = () => {
    if (!lightning) return null;
    const boltX = 180 + Math.random() * 540;
    const points = [];
    let y = 0, x = boltX;
    while (y < 340) {
      points.push(`${x},${y}`);
      y += 18 + Math.random() * 28;
      x += (Math.random() - 0.5) * 55;
    }
    return (
      <g>
        <rect x="0" y="0" width="900" height="520" fill="#fff" opacity="0.22" />
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
          <rect key={`fog-${i}`} x={-50 + Math.sin(time * 0.3 + i) * 16} y={240 + i * 45}
            width="1000" height="50" fill={`url(#fogGrad)`} opacity={0.1 + i * 0.035} />
        ))}
      </g>
    );
  };

  const renderCelestial = () => {
    if (weather === 'storm' || weather === 'fog') return null;
    if (timeOfDay > 0.7) {
      return (
        <g>
          <circle cx="800" cy="55" r="16" fill="none" stroke={colors.accent} strokeWidth="0.7" opacity="0.4" />
          <circle cx="800" cy="55" r="13" fill={colors.accent} opacity="0.07" />
        </g>
      );
    } else if (timeOfDay < 0.3 || timeOfDay > 0.6) {
      const sunY = timeOfDay < 0.3 ? 80 - timeOfDay * 160 : 80 - (1 - timeOfDay) * 120;
      return (
        <g>
          <circle cx="820" cy={sunY} r="22" fill={colors.orange} opacity="0.25" />
          <circle cx="820" cy={sunY} r="14" fill={colors.accent} opacity="0.4" />
        </g>
      );
    }
    return null;
  };

  const renderWindIndicator = () => {
    const windAngle = Math.PI * 0.22;
    const arrowLen = 16 + windSpeed * 26;
    return (
      <g transform="translate(46, 72)">
        <circle cx="0" cy="0" r="21" fill="rgba(0,0,0,0.3)" stroke={colors.primary} strokeWidth="0.7" />
        <text x="0" y="-26" fill={colors.primary} fontSize="6" textAnchor="middle">WIND</text>
        <line x1={-Math.cos(windAngle) * 4} y1={-Math.sin(windAngle) * 4}
          x2={Math.cos(windAngle) * arrowLen} y2={Math.sin(windAngle) * arrowLen}
          stroke={colors.accent} strokeWidth="1.6" markerEnd="url(#arrow)" />
        <text x="0" y="35" fill={colors.accent} fontSize="7" textAnchor="middle">{Math.round(windSpeed * 30)} mph</text>
      </g>
    );
  };

  const getBuildingDepth = (b) => project(b.x, b.h / 2, b.z).z;
  const weatherIcons = { clear: '☀️', rain: '🌧️', snow: '❄️', storm: '⛈️', fog: '🌫️' };

  return (
    <div style={{
      background: `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 28%, ${colors.sky3} 58%, ${colors.sky4} 100%)`,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
      fontFamily: 'monospace',
      userSelect: 'none'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <svg width="36" height="36" viewBox="0 0 100 100">
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke={colors.secondary} strokeWidth="3"/>
          <line x1="50" y1="10" x2="50" y2="50" stroke={colors.highlight} strokeWidth="3"/>
          <line x1="10" y1="30" x2="50" y2="50" stroke={colors.primary} strokeWidth="3"/>
          <line x1="90" y1="30" x2="50" y2="50" stroke={colors.accent} strokeWidth="3"/>
        </svg>
        <div>
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px' }}>
            PHILADELPHIA
          </div>
          <div style={{ color: colors.highlight, fontSize: '8px', letterSpacing: '3px' }}>
            SGI IRIS 1400 • SCHUYLKILL RIVER VIEW
          </div>
        </div>
        <div style={{ marginLeft: '16px', fontSize: '20px' }}>{weatherIcons[weather]}</div>
      </div>

      {/* Main display */}
      <div style={{ background: '#080808', borderRadius: '10px', padding: '5px', boxShadow: '0 8px 26px rgba(0,0,0,0.85)' }}>
        <svg
          ref={svgRef}
          width="900"
          height="520"
          style={{
            background: lightning ? '#3a4455' : `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 22%, ${colors.sky3} 48%, ${colors.sky4} 72%, ${colors.water}25 100%)`,
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
              <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
            </pattern>
            <linearGradient id="fogGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8899aa" stopOpacity="0"/>
              <stop offset="50%" stopColor="#8899aa" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#8899aa" stopOpacity="0"/>
            </linearGradient>
            <marker id="arrow" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
              <polygon points="0 0, 8 2.5, 0 5" fill={colors.accent} />
            </marker>
          </defs>

          {/* Stars */}
          {isNight && weather === 'clear' && [...Array(85)].map((_, i) => (
            <circle key={`star${i}`}
              cx={(Math.sin(i * 127.1) * 0.5 + 0.5) * 900}
              cy={(Math.cos(i * 311.7) * 0.5 + 0.5) * 130}
              r={0.4 + Math.random() * 0.4}
              fill="#fff"
              opacity={0.1 + Math.sin(time * 1.4 + i) * 0.08} />
          ))}

          {renderClouds()}
          {renderCelestial()}
          {renderWater()}
          {renderGrid()}
          {renderHighway()}
          {renderTrees()}

          {/* Buildings */}
          {buildings
            .map((b, i) => ({ ...b, idx: i, depth: getBuildingDepth(b) }))
            .sort((a, b) => b.depth - a.depth)
            .map(b => renderBuilding(b, b.idx))}

          {/* Labels */}
          {showInfo && weather !== 'storm' && buildings.filter(b => b.name).map((b, i) => {
            const labelY = b.h + (b.comcastTech ? 30 : b.libertyOne || b.libertyTwo ? 55 : b.cityHall ? 25 : 16);
            const lp = project(b.x, labelY, b.z);
            if (lp.z < -280) return null;
            return (
              <text key={`lbl${i}`} x={lp.x} y={lp.y} 
                fill={b.libertyOne || b.libertyTwo ? colors.libertyBlue : b.color} 
                fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold"
                opacity={weather === 'fog' ? 0.4 : 0.9}
                style={isNight && !lightning ? { filter: `drop-shadow(0 0 2px ${b.libertyOne || b.libertyTwo ? colors.libertyBlue : b.color})` } : {}}>
                {b.name}
              </text>
            );
          })}

          {renderFog()}
          {renderRain()}
          {renderSnow()}
          {renderLightning()}
          {renderWindIndicator()}

          <text x="450" y="496" fill={colors.water} fontSize="9" textAnchor="middle" opacity={weather === 'fog' ? 0.15 : 0.32}>
            ★ SCHUYLKILL RIVER ★
          </text>

          <rect width="900" height="520" fill="url(#scan)" opacity="0.2"/>
          <rect x="0" y={scanline} width="900" height="1" fill="rgba(255,255,255,0.01)"/>
        </svg>
      </div>

      {/* Weather Controls */}
      <div style={{ marginTop: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['clear', 'rain', 'snow', 'storm', 'fog'].map(w => (
          <button key={w} onClick={() => setWeather(w)} style={{
            background: weather === w ? colors.primary : 'transparent',
            border: `1px solid ${colors.primary}`,
            color: weather === w ? '#000' : colors.primary,
            padding: '4px 9px', borderRadius: '4px', cursor: 'pointer',
            fontFamily: 'monospace', fontSize: '9px',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            {weatherIcons[w]} {w.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: colors.highlight, fontSize: '8px' }}>🍃</span>
        <input type="range" min="0" max="1" step="0.05" value={windSpeed}
          onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
          style={{ width: '100px', accentColor: colors.highlight }} />
        <span style={{ color: '#777', fontSize: '8px' }}>{Math.round(windSpeed * 30)} mph</span>
      </div>

      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: colors.accent, fontSize: '8px' }}>🌅</span>
        <input type="range" min="0" max="1" step="0.01" value={timeOfDay}
          onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
          style={{ width: '130px', accentColor: colors.accent }} />
        <span style={{ color: colors.primary, fontSize: '8px' }}>🌙</span>
        <span style={{ color: '#777', fontSize: '8px', marginLeft: '3px' }}>
          {timeOfDay < 0.25 ? 'SUNRISE' : timeOfDay < 0.6 ? 'DAY' : timeOfDay < 0.75 ? 'SUNSET' : 'NIGHT'}
        </span>
      </div>

      {/* View Controls */}
      <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setAutoRotate(a => !a)} style={{
          background: autoRotate ? colors.highlight : 'transparent',
          border: `1px solid ${colors.highlight}`,
          color: autoRotate ? '#000' : colors.highlight,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>{autoRotate ? '⏸ PAUSE' : '▶ ROTATE'}</button>
        
        <button onClick={() => setShowInfo(s => !s)} style={{
          background: showInfo ? colors.accent : 'transparent',
          border: `1px solid ${colors.accent}`,
          color: showInfo ? '#000' : colors.accent,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>🏷 LABELS</button>
        
        <button onClick={() => setCamera({ rotationY: 0.12, rotationX: 0.2, zoom: 1, panX: 0, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.secondary}`, color: colors.secondary,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>↺ RESET</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.75, zoom: 0.55 }))} style={{
          background: 'transparent', border: `1px solid ${colors.purple}`, color: colors.purple,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>⬆ AERIAL</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.05, zoom: 1.5 }))} style={{
          background: 'transparent', border: `1px solid ${colors.orange}`, color: colors.orange,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>👁 STREET</button>
        
        <button onClick={() => setCamera({ rotationY: 0.35, rotationX: 0.18, zoom: 1.3, panX: 30, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.libertyBlue}`, color: colors.libertyBlue,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>🏛 LIBERTY</button>
        
        <button onClick={() => setCamera({ rotationY: -0.2, rotationX: 0.22, zoom: 1.15, panX: -60, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.silver}`, color: colors.silver,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>🏢 COMCAST</button>
      </div>

      <div style={{ marginTop: '4px', color: colors.highlight, fontSize: '7px', textAlign: 'center', opacity: 0.5 }}>
        DRAG: Rotate | SHIFT+DRAG: Pan | SCROLL: Zoom
      </div>

      <div style={{ display: 'flex', marginTop: '4px', gap: '2px' }}>
        {[colors.primary, colors.secondary, colors.libertyBlue, colors.highlight, colors.accent, colors.silver, colors.teal].map((c, i) => (
          <div key={i} style={{ width: '20px', height: '3px', background: c, boxShadow: isNight ? `0 0 4px ${c}` : 'none' }}/>
        ))}
      </div>
    </div>
  );
}
