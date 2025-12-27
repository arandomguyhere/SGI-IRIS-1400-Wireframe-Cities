import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function NYCAccurate() {
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
  const [timeOfDay, setTimeOfDay] = useState(0.82);
  const [showInfo, setShowInfo] = useState(true);
  const [weather, setWeather] = useState('clear');
  const [lightning, setLightning] = useState(false);
  const [windSpeed, setWindSpeed] = useState(0.35);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
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

  // Colors
  const getColors = () => {
    const isNight = timeOfDay > 0.75;
    const isSunset = timeOfDay > 0.6 && timeOfDay <= 0.75;
    const isStormy = weather === 'storm' || weather === 'rain';
    const isFoggy = weather === 'fog';
    
    let base;
    if (isNight) {
      base = {
        primary: '#00D4FF',
        secondary: '#FF6B9D',
        accent: '#FFD700',
        highlight: '#00FF88',
        purple: '#B388FF',
        orange: '#FF8C00',
        copper: '#FF7744',
        pink: '#FF66AA',
        water: '#0044AA',
        grid: '#4400AA',
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
        copper: '#DD4422',
        pink: '#FF5599',
        water: '#004466',
        grid: '#5511AA',
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
        copper: '#BB4422',
        pink: '#DD5588',
        water: '#006699',
        grid: '#3311AA',
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
    }
    if (isFoggy) {
      base.sky1 = '#3a4050';
      base.sky2 = '#4a5060';
      base.sky3 = '#5a6070';
      base.sky4 = '#6a7080';
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

  // NYC Buildings - Accurate positions based on reference photos
  // View from Hudson River (west) looking east at Manhattan
  const buildings = [
    // === LOWER MANHATTAN (Financial District) - Left side ===
    { x: -420, z: 60, w: 25, d: 25, h: 70, color: colors.purple },
    { x: -390, z: 45, w: 28, d: 28, h: 85, color: colors.secondary },
    
    // One World Trade Center (Freedom Tower) - Tallest, left cluster
    { x: -350, z: 55, w: 50, d: 50, h: 330, color: colors.primary, name: 'ONE WTC', owtc: true, info: { height: '1,776 ft', year: 2014, floors: 104, note: 'Tallest in Western Hemisphere' } },
    
    // WTC Complex
    { x: -310, z: 75, w: 38, d: 38, h: 200, color: colors.highlight, name: '3 WTC', info: { height: '1,079 ft', year: 2018, floors: 80 } },
    { x: -275, z: 50, w: 34, d: 34, h: 175, color: colors.purple, name: '4 WTC' },
    { x: -240, z: 70, w: 30, d: 30, h: 140, color: colors.secondary },
    
    // Woolworth Building - Gothic
    { x: -200, z: 45, w: 28, d: 28, h: 150, color: colors.accent, name: 'WOOLWORTH', gothic: true, info: { height: '792 ft', year: 1913, floors: 57, note: 'Gothic cathedral of commerce' } },
    
    // City Hall / Tribeca area
    { x: -160, z: 65, w: 24, d: 24, h: 95, color: colors.purple },
    { x: -130, z: 50, w: 26, d: 26, h: 110, color: colors.highlight },
    { x: -100, z: 70, w: 22, d: 22, h: 85, color: colors.secondary },
    
    // === MIDTOWN WEST / HUDSON YARDS - Center-left ===
    { x: -60, z: 55, w: 28, d: 28, h: 130, color: colors.orange },
    
    // Hudson Yards - The Vessel area (visible in night photos)
    { x: -25, z: 50, w: 35, d: 35, h: 190, color: colors.pink, name: '30 HUDSON', info: { height: '1,268 ft', year: 2019, floors: 73, note: 'Hudson Yards observation deck' } },
    { x: 10, z: 70, w: 32, d: 32, h: 170, color: colors.secondary },
    { x: 40, z: 55, w: 30, d: 30, h: 145, color: colors.purple },
    
    // === TIMES SQUARE / MIDTOWN CENTER ===
    // The bright cluster visible in night shots
    { x: 75, z: 60, w: 28, d: 28, h: 160, color: colors.pink },
    { x: 105, z: 45, w: 32, d: 32, h: 180, color: colors.accent },
    
    // One Vanderbilt - Tall spired tower near Grand Central (visible in images 1 & 4)
    { x: 140, z: 55, w: 38, d: 38, h: 260, color: colors.highlight, name: 'ONE VANDERBILT', spire: true, info: { height: '1,401 ft', year: 2020, floors: 93, note: 'Newest supertall' } },
    
    // Chrysler Building - Art Deco crown (visible in images 1 & 4)
    { x: 180, z: 65, w: 36, d: 36, h: 230, color: colors.copper, name: 'CHRYSLER', chrysler: true, info: { height: '1,046 ft', year: 1930, floors: 77, note: 'Art Deco masterpiece' } },
    
    // Empire State Building - THE iconic tower (dominant in images 1 & 4)
    { x: 230, z: 50, w: 48, d: 48, h: 290, color: colors.accent, name: 'EMPIRE STATE', empireState: true, info: { height: '1,454 ft', year: 1931, floors: 102, note: 'NYC icon since 1931' } },
    
    // Midtown East cluster
    { x: 275, z: 70, w: 26, d: 26, h: 140, color: colors.purple },
    { x: 305, z: 55, w: 30, d: 30, h: 155, color: colors.secondary },
    
    // === BILLIONAIRES ROW / CENTRAL PARK SOUTH ===
    // 432 Park Avenue - Tall skinny grid tower (visible in image 4)
    { x: 340, z: 60, w: 24, d: 24, h: 270, color: colors.primary, name: '432 PARK', slender: true, info: { height: '1,396 ft', year: 2015, floors: 85, note: 'Pencil tower' } },
    
    // Steinway Tower - Super skinny (image 4)
    { x: 375, z: 50, w: 18, d: 18, h: 260, color: colors.highlight, name: 'STEINWAY', slender: true, info: { height: '1,428 ft', year: 2021, floors: 84, note: 'Most slender skyscraper' } },
    
    // Central Park Tower
    { x: 405, z: 65, w: 30, d: 30, h: 280, color: colors.secondary, name: 'CENTRAL PARK TWR', info: { height: '1,550 ft', year: 2021, floors: 98, note: 'Tallest residential' } },
    
    // Right edge buildings
    { x: 440, z: 55, w: 26, d: 26, h: 150, color: colors.purple },
    { x: 470, z: 70, w: 24, d: 24, h: 120, color: colors.orange },
    
    // === BACKGROUND BUILDINGS (Second row, deeper) ===
    { x: -380, z: 140, w: 22, d: 22, h: 55, color: colors.purple },
    { x: -320, z: 150, w: 24, d: 24, h: 65, color: colors.secondary },
    { x: -250, z: 145, w: 20, d: 20, h: 50, color: colors.primary },
    { x: -180, z: 155, w: 22, d: 22, h: 60, color: colors.highlight },
    { x: -100, z: 145, w: 24, d: 24, h: 70, color: colors.accent },
    { x: -30, z: 150, w: 20, d: 20, h: 55, color: colors.purple },
    { x: 50, z: 155, w: 22, d: 22, h: 65, color: colors.secondary },
    { x: 130, z: 145, w: 24, d: 24, h: 75, color: colors.primary },
    { x: 210, z: 150, w: 20, d: 20, h: 50, color: colors.highlight },
    { x: 290, z: 155, w: 22, d: 22, h: 60, color: colors.accent },
    { x: 370, z: 145, w: 24, d: 24, h: 70, color: colors.purple },
    { x: 440, z: 150, w: 20, d: 20, h: 55, color: colors.secondary },
  ];

  // Render building wireframe
  const renderBuilding = (b, idx) => {
    const lines = [];
    const hw = b.w / 2;
    const hd = b.d / 2;
    const windowSpacing = 14;
    const fogOpacity = weather === 'fog' ? 0.5 : 1;

    // One World Trade Center - Tapered octagonal
    if (b.owtc) {
      const baseScale = 1;
      const topScale = 0.65;
      const numSegments = 25;
      
      for (let s = 0; s < numSegments; s++) {
        const y1 = (s / numSegments) * (b.h - 50);
        const y2 = ((s + 1) / numSegments) * (b.h - 50);
        const s1 = baseScale - (s / numSegments) * (baseScale - topScale);
        const s2 = baseScale - ((s + 1) / numSegments) * (baseScale - topScale);
        
        for (let i = 0; i < 8; i++) {
          const angle1 = (i / 8) * Math.PI * 2 + Math.PI / 8;
          const angle2 = ((i + 1) / 8) * Math.PI * 2 + Math.PI / 8;
          
          const x1 = b.x + Math.cos(angle1) * hw * s1;
          const z1 = b.z + Math.sin(angle1) * hd * s1;
          const x2 = b.x + Math.cos(angle1) * hw * s2;
          const z2 = b.z + Math.sin(angle1) * hd * s2;
          const x3 = b.x + Math.cos(angle2) * hw * s1;
          const z3 = b.z + Math.sin(angle2) * hd * s1;
          
          const p1 = project(x1, y1, z1);
          const p2 = project(x2, y2, z2);
          const p3 = project(x3, y1, z3);
          
          lines.push({ ...p1, x2: p2.x, y2: p2.y });
          if (s % 5 === 0) {
            lines.push({ ...p1, x2: p3.x, y2: p3.y, floor: true });
          }
        }
      }
      
      // Spire
      const spireBase = project(b.x, b.h - 50, b.z);
      const spireTop = project(b.x, b.h + 40, b.z);
      lines.push({ ...spireBase, x2: spireTop.x, y2: spireTop.y, thin: true });
    }
    // Empire State Building - Accurate Art Deco setbacks
    else if (b.empireState) {
      const setbacks = [
        { h: 0, top: 180, scale: 1 },
        { h: 180, top: 210, scale: 0.85 },
        { h: 210, top: 240, scale: 0.65 },
        { h: 240, top: 260, scale: 0.45 },
        { h: 260, top: 275, scale: 0.3 },
        { h: 275, top: 290, scale: 0.18 }
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
        
        // Window lines
        const floorCount = Math.floor((sec.top - sec.h) / windowSpacing);
        for (let f = 1; f < floorCount; f++) {
          const y = sec.h + f * windowSpacing;
          const p1 = project(b.x - sw, y, b.z - sd);
          const p2 = project(b.x + sw, y, b.z - sd);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
        }
      });
      
      // Antenna mast
      const ant = project(b.x, 290, b.z);
      const antt = project(b.x, 350, b.z);
      lines.push({ ...ant, x2: antt.x, y2: antt.y, thin: true });
      
      // Antenna rings
      for (let r = 0; r < 4; r++) {
        const ringY = 300 + r * 12;
        const ringR = 5 - r;
        for (let i = 0; i < 8; i++) {
          const a1 = (i / 8) * Math.PI * 2;
          const a2 = ((i + 1) / 8) * Math.PI * 2;
          const p1 = project(b.x + Math.cos(a1) * ringR, ringY, b.z + Math.sin(a1) * ringR);
          const p2 = project(b.x + Math.cos(a2) * ringR, ringY, b.z + Math.sin(a2) * ringR);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, thin: true });
        }
      }
    }
    // Chrysler Building with sunburst crown
    else if (b.chrysler) {
      // Main shaft with setbacks
      const setbacks = [
        { h: 0, top: 150, scale: 1 },
        { h: 150, top: 175, scale: 0.85 },
        { h: 175, top: 195, scale: 0.7 },
        { h: 195, top: 210, scale: 0.55 }
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
        }
      });
      
      // Chrysler crown - Triangular sunburst arches
      const crownBase = 210;
      for (let tier = 0; tier < 7; tier++) {
        const tierY = crownBase + tier * 3;
        const tierScale = 0.45 * (1 - tier * 0.1);
        const tierR = hw * tierScale;
        
        for (let i = 0; i < 8; i++) {
          const angle1 = (i / 8) * Math.PI * 2;
          const angle2 = ((i + 1) / 8) * Math.PI * 2;
          const midAngle = angle1 + Math.PI / 8;
          
          const x1 = b.x + Math.cos(angle1) * tierR;
          const z1 = b.z + Math.sin(angle1) * tierR;
          const x2 = b.x + Math.cos(angle2) * tierR;
          const z2 = b.z + Math.sin(angle2) * tierR;
          
          const p1 = project(x1, tierY, z1);
          const p2 = project(x2, tierY, z2);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, crown: true });
          
          // Triangular sunburst peaks
          if (tier < 6) {
            const peakR = tierR * 1.4;
            const peakX = b.x + Math.cos(midAngle) * peakR;
            const peakZ = b.z + Math.sin(midAngle) * peakR;
            const peakY = tierY + 6;
            const peak = project(peakX, peakY, peakZ);
            lines.push({ ...p1, x2: peak.x, y2: peak.y, crown: true });
            lines.push({ ...p2, x2: peak.x, y2: peak.y, crown: true });
          }
        }
      }
      
      // Spire
      const spireBase = project(b.x, crownBase + 21, b.z);
      const spireTop = project(b.x, crownBase + 55, b.z);
      lines.push({ ...spireBase, x2: spireTop.x, y2: spireTop.y, thin: true });
    }
    // Slender pencil towers (432 Park, Steinway)
    else if (b.slender) {
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
      
      // Grid pattern (432 Park signature square windows)
      const gridSpacing = 10;
      const numFloors = Math.floor(b.h / gridSpacing);
      for (let f = 1; f < numFloors; f++) {
        const y = f * gridSpacing;
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const p1 = project(c1[0], y, c1[1]);
          const p2 = project(c2[0], y, c2[1]);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
        }
      }
    }
    // Gothic (Woolworth)
    else if (b.gothic) {
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      // Main shaft
      corners.forEach(([cx, cz]) => {
        const p1 = project(cx, 0, cz);
        const p2 = project(cx, b.h * 0.8, cz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      for (let i = 0; i < 4; i++) {
        const c1 = corners[i], c2 = corners[(i + 1) % 4];
        const pb1 = project(c1[0], 0, c1[1]);
        const pb2 = project(c2[0], 0, c2[1]);
        lines.push({ ...pb1, x2: pb2.x, y2: pb2.y });
      }
      
      // Gothic crown tapering to point
      const crownBase = b.h * 0.8;
      const topScale = 0.4;
      const topCorners = corners.map(([cx, cz]) => [
        b.x + (cx - b.x) * topScale,
        b.z + (cz - b.z) * topScale
      ]);
      
      corners.forEach(([cx, cz], i) => {
        const p1 = project(cx, crownBase, cz);
        const p2 = project(topCorners[i][0], b.h, topCorners[i][1]);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      for (let i = 0; i < 4; i++) {
        const c1 = corners[i], c2 = corners[(i + 1) % 4];
        const pc1 = project(c1[0], crownBase, c1[1]);
        const pc2 = project(c2[0], crownBase, c2[1]);
        lines.push({ ...pc1, x2: pc2.x, y2: pc2.y });
        
        const pt1 = project(topCorners[i][0], b.h, topCorners[i][1]);
        const pt2 = project(topCorners[(i+1)%4][0], b.h, topCorners[(i+1)%4][1]);
        lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
      }
      
      // Pinnacle
      const pinnacle = project(b.x, b.h + 18, b.z);
      topCorners.forEach(([cx, cz]) => {
        const p = project(cx, b.h, cz);
        lines.push({ ...p, x2: pinnacle.x, y2: pinnacle.y, thin: true });
      });
    }
    // Standard building with spire
    else if (b.spire) {
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
      
      // Spire
      const spireTop = project(b.x, b.h + 45, b.z);
      corners.forEach(([cx, cz]) => {
        const p = project(cx, b.h, cz);
        lines.push({ ...p, x2: spireTop.x, y2: spireTop.y, thin: true });
      });
      
      // Floor lines
      const floorCount = Math.floor(b.h / windowSpacing);
      for (let f = 1; f < floorCount; f++) {
        const y = f * windowSpacing;
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
        const pb1 = project(c1[0], 0, c1[1]);
        const pb2 = project(c2[0], 0, c2[1]);
        const pt1 = project(c1[0], b.h, c1[1]);
        const pt2 = project(c2[0], b.h, c2[1]);
        lines.push({ ...pb1, x2: pb2.x, y2: pb2.y });
        lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
      }
      
      // Floor lines
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
        stroke={b.color}
        strokeWidth={l.thin ? 0.6 : l.crown ? 0.5 : l.floor ? 0.25 : 1.2}
        opacity={(l.floor ? 0.18 : l.crown ? 0.75 : 0.9) * fogOpacity}
        style={{ filter: isNight && !lightning ? `drop-shadow(0 0 ${l.thin ? 1 : 2}px ${b.color})` : 'none' }}
      />
    ));
  };

  // Statue of Liberty (far left, in harbor)
  const renderStatueOfLiberty = () => {
    const sx = -520, sz = -160;
    const elements = [];
    
    // Pedestal
    for (let i = 0; i < 4; i++) {
      const angle1 = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const angle2 = ((i + 1) / 4) * Math.PI * 2 + Math.PI / 4;
      const r = 10;
      
      const p1 = project(sx + Math.cos(angle1) * r, 0, sz + Math.sin(angle1) * r);
      const p2 = project(sx + Math.cos(angle1) * r, 25, sz + Math.sin(angle1) * r);
      const p3 = project(sx + Math.cos(angle2) * r, 0, sz + Math.sin(angle2) * r);
      
      elements.push(
        <line key={`ped-v-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.highlight} strokeWidth="0.8" opacity="0.6" />,
        <line key={`ped-b-${i}`} x1={p1.x} y1={p1.y} x2={p3.x} y2={p3.y} stroke={colors.highlight} strokeWidth="0.8" opacity="0.6" />
      );
    }
    
    // Simplified figure
    const figurePoints = [
      [0, 25], [-3, 38], [-2, 55], [-6, 70], [-2, 60],
      [0, 75], [3, 82], [6, 92], [4, 82], [2, 60],
      [3, 38], [0, 25]
    ];
    
    for (let i = 0; i < figurePoints.length - 1; i++) {
      const [x1, y1] = figurePoints[i];
      const [x2, y2] = figurePoints[i + 1];
      const p1 = project(sx + x1, y1, sz);
      const p2 = project(sx + x2, y2, sz);
      elements.push(
        <line key={`fig-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.highlight} strokeWidth="1" opacity="0.7"
          style={isNight ? { filter: `drop-shadow(0 0 2px ${colors.highlight})` } : {}} />
      );
    }
    
    // Torch flame
    const torch = project(sx + 6, 92, sz);
    elements.push(
      <circle key="flame" cx={torch.x} cy={torch.y - 4} r={2 + Math.sin(time * 5) * 0.5}
        fill={colors.accent} opacity={0.85}
        style={{ filter: `drop-shadow(0 0 6px ${colors.accent})` }} />
    );
    
    return elements;
  };

  // Brooklyn Bridge (connecting to Lower Manhattan)
  const renderBrooklynBridge = () => {
    const startX = -470, endX = -350, bridgeZ = -95;
    const towerX1 = startX + 25, towerX2 = endX - 25;
    const towerH = 70, deckH = 18;
    const elements = [];
    
    // Deck
    const deckL1 = project(startX, deckH, bridgeZ - 6);
    const deckL2 = project(endX, deckH, bridgeZ - 6);
    const deckR1 = project(startX, deckH, bridgeZ + 6);
    const deckR2 = project(endX, deckH, bridgeZ + 6);
    elements.push(
      <line key="deck-l" x1={deckL1.x} y1={deckL1.y} x2={deckL2.x} y2={deckL2.y} stroke={colors.copper} strokeWidth="1" opacity="0.7" />,
      <line key="deck-r" x1={deckR1.x} y1={deckR1.y} x2={deckR2.x} y2={deckR2.y} stroke={colors.copper} strokeWidth="1" opacity="0.7" />
    );
    
    // Cross beams
    for (let x = startX; x <= endX; x += 12) {
      const p1 = project(x, deckH, bridgeZ - 6);
      const p2 = project(x, deckH, bridgeZ + 6);
      elements.push(
        <line key={`beam-${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.copper} strokeWidth="0.4" opacity="0.4" />
      );
    }
    
    // Gothic towers
    [towerX1, towerX2].forEach((tx, ti) => {
      const tw = 6;
      // Tower verticals
      [[-tw, -tw], [tw, -tw], [tw, tw], [-tw, tw]].forEach(([ox, oz], i) => {
        const p1 = project(tx + ox, 0, bridgeZ + oz);
        const p2 = project(tx + ox, towerH, bridgeZ + oz);
        elements.push(
          <line key={`twr${ti}-v-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={colors.copper} strokeWidth="1.2" opacity="0.8" />
        );
      });
      
      // Tower top
      const tTop = project(tx, towerH, bridgeZ);
      const tTopL = project(tx - tw, towerH, bridgeZ);
      const tTopR = project(tx + tw, towerH, bridgeZ);
      elements.push(
        <line key={`twr${ti}-top`} x1={tTopL.x} y1={tTopL.y} x2={tTopR.x} y2={tTopR.y}
          stroke={colors.copper} strokeWidth="1" opacity="0.7" />
      );
      
      // Gothic arch
      const archBase = towerH * 0.45;
      const archTop = towerH * 0.65;
      const archL = project(tx - 4, archBase, bridgeZ);
      const archR = project(tx + 4, archBase, bridgeZ);
      const archPeak = project(tx, archTop, bridgeZ);
      elements.push(
        <line key={`arch${ti}-l`} x1={archL.x} y1={archL.y} x2={archPeak.x} y2={archPeak.y} stroke={colors.accent} strokeWidth="0.6" opacity="0.5" />,
        <line key={`arch${ti}-r`} x1={archR.x} y1={archR.y} x2={archPeak.x} y2={archPeak.y} stroke={colors.accent} strokeWidth="0.6" opacity="0.5" />
      );
    });
    
    // Main cables (catenary)
    [-5, 5].forEach((zOffset, zi) => {
      let lastP = null;
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const x = startX + t * (endX - startX);
        let y;
        
        if (x < towerX1) {
          y = deckH + (towerX1 - x) / (towerX1 - startX) * (towerH - deckH) * 0.4;
        } else if (x > towerX2) {
          y = deckH + (x - towerX2) / (endX - towerX2) * (towerH - deckH) * 0.4;
        } else {
          const mid = (towerX1 + towerX2) / 2;
          const span = towerX2 - towerX1;
          y = towerH - 20 * (1 - Math.pow((x - mid) / (span / 2), 2));
        }
        
        const p = project(x, y, bridgeZ + zOffset);
        if (lastP) {
          elements.push(
            <line key={`cable-${zi}-${i}`} x1={lastP.x} y1={lastP.y} x2={p.x} y2={p.y}
              stroke={colors.accent} strokeWidth="0.6" opacity="0.5" />
          );
        }
        lastP = p;
        
        // Suspenders
        if (i > 0 && i < 20 && i % 2 === 0 && x > towerX1 && x < towerX2) {
          const deckP = project(x, deckH, bridgeZ + zOffset);
          elements.push(
            <line key={`susp-${zi}-${i}`} x1={p.x} y1={p.y} x2={deckP.x} y2={deckP.y}
              stroke={colors.copper} strokeWidth="0.3" opacity="0.3" />
          );
        }
      }
    });
    
    return elements;
  };

  // Water (Hudson River) with colorful night reflections
  const renderWater = () => {
    const elements = [];
    const storminess = weather === 'storm' ? 2 : weather === 'rain' ? 1.3 : 1;
    
    // Water grid
    for (let x = -550; x <= 500; x += 40) {
      const p1 = project(x, 0, -220);
      const p2 = project(x, 0, -50);
      elements.push(
        <line key={`wg-${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth="0.35" opacity="0.22" />
      );
    }
    for (let z = -220; z <= -50; z += 20) {
      const wave = Math.sin(time * 1.5 * storminess + z * 0.08) * 1.5 * storminess;
      const p1 = project(-550, wave, z);
      const p2 = project(500, wave, z);
      elements.push(
        <line key={`wz-${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth={0.5 * storminess} opacity={0.12 + (z + 220) / 600} />
      );
    }
    
    // Colorful reflections at night (matching reference photos)
    if (isNight && weather === 'clear') {
      const reflectionColors = [
        colors.pink, colors.accent, colors.secondary, colors.primary, 
        colors.highlight, colors.orange, colors.purple, colors.copper
      ];
      
      for (let i = 0; i < 45; i++) {
        const x = -520 + i * 23;
        const flicker = 0.2 + Math.sin(time * 2.2 + i * 0.5) * 0.15;
        const color = reflectionColors[i % reflectionColors.length];
        
        for (let j = 0; j < 6; j++) {
          const z = -200 + j * 25;
          const wave = Math.sin(time * 1.6 + i * 0.35 + j * 0.2) * 2.5;
          const p = project(x + Math.sin(time * 0.7 + i) * 3, wave - 2, z);
          elements.push(
            <ellipse key={`ref-${i}-${j}`} cx={p.x} cy={p.y} rx={5 + j * 0.8} ry={1.2}
              fill={color} opacity={flicker * (1 - j * 0.12)}
              style={{ filter: 'blur(0.8px)' }} />
          );
        }
      }
    }
    
    // Ferries / boats
    if (weather !== 'storm') {
      const boats = [
        { x: -400, z: -170 },
        { x: -150, z: -190 },
        { x: 100, z: -160 },
        { x: 300, z: -180 },
      ];
      
      boats.forEach((boat, i) => {
        const bx = boat.x + Math.sin(time * 0.25 + i) * 12;
        const bobY = Math.sin(time * 1.4 + i * 2) * 0.8;
        
        // Hull
        const h1 = project(bx - 10, bobY, boat.z);
        const h2 = project(bx + 10, bobY, boat.z);
        const h3 = project(bx + 8, bobY + 3, boat.z);
        const h4 = project(bx - 8, bobY + 3, boat.z);
        
        elements.push(
          <line key={`boat-${i}-1`} x1={h1.x} y1={h1.y} x2={h2.x} y2={h2.y} stroke={colors.highlight} strokeWidth="0.8" opacity="0.6" />,
          <line key={`boat-${i}-2`} x1={h1.x} y1={h1.y} x2={h4.x} y2={h4.y} stroke={colors.highlight} strokeWidth="0.8" opacity="0.6" />,
          <line key={`boat-${i}-3`} x1={h2.x} y1={h2.y} x2={h3.x} y2={h3.y} stroke={colors.highlight} strokeWidth="0.8" opacity="0.6" />,
          <line key={`boat-${i}-4`} x1={h3.x} y1={h3.y} x2={h4.x} y2={h4.y} stroke={colors.highlight} strokeWidth="0.8" opacity="0.6" />
        );
        
        // Cabin
        const cab = project(bx, bobY + 7, boat.z);
        elements.push(
          <line key={`boat-cab-${i}`} x1={(h1.x + h2.x) / 2} y1={(h1.y + h2.y) / 2} x2={cab.x} y2={cab.y}
            stroke={colors.accent} strokeWidth="0.6" opacity="0.5" />
        );
      });
    }
    
    return elements;
  };

  // Ground grid
  const renderGrid = () => {
    const lines = [];
    const fogOpacity = weather === 'fog' ? 0.12 : 0.3;
    
    for (let x = -550; x <= 500; x += 50) {
      const p1 = project(x, 0, -50);
      const p2 = project(x, 0, 180);
      lines.push(<line key={`gx${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.45" opacity={fogOpacity} />);
    }
    for (let z = -50; z <= 180; z += 50) {
      const p1 = project(-550, 0, z);
      const p2 = project(500, 0, z);
      lines.push(<line key={`gz${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.45" opacity={fogOpacity} />);
    }
    return lines;
  };

  // Weather effects
  const renderRain = () => {
    if (weather !== 'rain' && weather !== 'storm') return null;
    const intensity = weather === 'storm' ? 1.5 : 1;
    const windOffset = windSpeed * 100;
    
    return (
      <g>
        {rainDrops.map((drop, i) => {
          const x = ((drop.x + time * (drop.speed * 10) * windSpeed + windOffset) % 1000);
          const y = ((drop.y + time * drop.speed * 50) % 600);
          return (
            <line key={`rain-${i}`} x1={x} y1={y} x2={x + windSpeed * drop.length} y2={y + drop.length}
              stroke={colors.primary} strokeWidth={0.7 * intensity} opacity={0.35 * intensity} />
          );
        })}
        {weather === 'storm' && [...Array(20)].map((_, i) => {
          const rx = 100 + (i * 40 + time * 30) % 700;
          const ry = 440 + Math.sin(i * 2) * 25;
          const rs = (Math.sin(time * 5 + i) + 1) * 3.5;
          return (
            <circle key={`ripple-${i}`} cx={rx} cy={ry} r={rs}
              fill="none" stroke={colors.water} strokeWidth="0.4" opacity={0.25 - rs * 0.02} />
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
          const wobbleX = Math.sin(time * 2 + flake.wobble) * 18 * windSpeed;
          const x = ((flake.x + wobbleX + time * 18 * windSpeed) % 1000);
          const y = ((flake.y + time * flake.speed * 28) % 600);
          return (
            <g key={`snow-${i}`}>
              <circle cx={x} cy={y} r={flake.size} fill="#fff" opacity={0.65} />
              {flake.size > 2 && (
                <g opacity={0.35}>
                  <line x1={x - flake.size} y1={y} x2={x + flake.size} y2={y} stroke="#fff" strokeWidth="0.4" />
                  <line x1={x} y1={y - flake.size} x2={x} y2={y + flake.size} stroke="#fff" strokeWidth="0.4" />
                </g>
              )}
            </g>
          );
        })}
        <rect x="0" y="475" width="900" height="45" fill="#fff" opacity="0.08" />
      </g>
    );
  };

  const renderClouds = () => {
    if (weather === 'clear' && timeOfDay > 0.3 && timeOfDay < 0.7) return null;
    const cloudOpacity = weather === 'storm' ? 0.65 : weather === 'fog' ? 0.45 : 0.35;
    const cloudColor = weather === 'storm' ? '#222230' : '#7788aa';
    
    return (
      <g>
        {clouds.map((cloud, i) => {
          const x = ((cloud.x + time * cloud.speed * 18 * (1 + windSpeed)) % 1100) - 100;
          return (
            <g key={`cloud-${i}`} opacity={cloudOpacity}>
              <ellipse cx={x} cy={cloud.y} rx={cloud.width / 2} ry={cloud.height / 2} fill={cloudColor} />
              <ellipse cx={x - cloud.width * 0.3} cy={cloud.y + 4} rx={cloud.width / 3} ry={cloud.height / 2.5} fill={cloudColor} />
              <ellipse cx={x + cloud.width * 0.3} cy={cloud.y + 3} rx={cloud.width / 3} ry={cloud.height / 2.5} fill={cloudColor} />
              <ellipse cx={x} cy={cloud.y} rx={cloud.width / 2} ry={cloud.height / 2}
                fill="none" stroke={colors.primary} strokeWidth="0.4" opacity="0.25" />
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
        <rect x="0" y="0" width="900" height="520" fill="#fff" opacity="0.25" />
        <polyline points={points.join(' ')} fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.9"
          style={{ filter: 'drop-shadow(0 0 8px #fff) drop-shadow(0 0 16px #88f)' }} />
      </g>
    );
  };

  const renderFog = () => {
    if (weather !== 'fog') return null;
    return (
      <g>
        {[...Array(6)].map((_, i) => (
          <rect key={`fog-${i}`} x={-50 + Math.sin(time * 0.3 + i) * 18} y={240 + i * 48}
            width="1000" height="55" fill={`url(#fogGrad)`} opacity={0.12 + i * 0.04} />
        ))}
      </g>
    );
  };

  const renderCelestial = () => {
    if (weather === 'storm' || weather === 'fog') return null;
    if (timeOfDay > 0.7) {
      return (
        <g>
          <circle cx="820" cy="55" r="18" fill="none" stroke={colors.accent} strokeWidth="0.8" opacity="0.45" />
          <circle cx="820" cy="55" r="15" fill={colors.accent} opacity="0.08" />
        </g>
      );
    } else if (timeOfDay < 0.3 || timeOfDay > 0.6) {
      const sunY = timeOfDay < 0.3 ? 85 - timeOfDay * 170 : 85 - (1 - timeOfDay) * 130;
      return (
        <g>
          <circle cx="840" cy={sunY} r="25" fill={colors.orange} opacity="0.28" />
          <circle cx="840" cy={sunY} r="16" fill={colors.accent} opacity="0.45" />
        </g>
      );
    }
    return null;
  };

  const renderWindIndicator = () => {
    const windAngle = Math.PI * 0.28;
    const arrowLen = 18 + windSpeed * 28;
    return (
      <g transform="translate(48, 75)">
        <circle cx="0" cy="0" r="23" fill="rgba(0,0,0,0.35)" stroke={colors.primary} strokeWidth="0.8" />
        <text x="0" y="-28" fill={colors.primary} fontSize="7" textAnchor="middle">WIND</text>
        <line x1={-Math.cos(windAngle) * 4} y1={-Math.sin(windAngle) * 4}
          x2={Math.cos(windAngle) * arrowLen} y2={Math.sin(windAngle) * arrowLen}
          stroke={colors.accent} strokeWidth="1.8" markerEnd="url(#arrow)" />
        <text x="0" y="38" fill={colors.accent} fontSize="8" textAnchor="middle">{Math.round(windSpeed * 30)} mph</text>
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
        <svg width="38" height="38" viewBox="0 0 100 100">
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke={colors.secondary} strokeWidth="3"/>
          <line x1="50" y1="10" x2="50" y2="50" stroke={colors.highlight} strokeWidth="3"/>
          <line x1="10" y1="30" x2="50" y2="50" stroke={colors.primary} strokeWidth="3"/>
          <line x1="90" y1="30" x2="50" y2="50" stroke={colors.accent} strokeWidth="3"/>
        </svg>
        <div>
          <div style={{ color: '#fff', fontSize: '19px', fontWeight: 'bold', letterSpacing: '2px' }}>
            NEW YORK CITY
          </div>
          <div style={{ color: colors.highlight, fontSize: '8px', letterSpacing: '3px' }}>
            SGI IRIS 1400 • MANHATTAN SKYLINE
          </div>
        </div>
        <div style={{ marginLeft: '18px', fontSize: '22px' }}>{weatherIcons[weather]}</div>
      </div>

      {/* Main display */}
      <div style={{ background: '#080808', borderRadius: '10px', padding: '5px', boxShadow: '0 8px 28px rgba(0,0,0,0.85)' }}>
        <svg
          ref={svgRef}
          width="900"
          height="520"
          style={{
            background: lightning ? '#3a4455' : `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 22%, ${colors.sky3} 48%, ${colors.sky4} 72%, ${colors.water}30 100%)`,
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
              <stop offset="50%" stopColor="#8899aa" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#8899aa" stopOpacity="0"/>
            </linearGradient>
            <marker id="arrow" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 9 3, 0 6" fill={colors.accent} />
            </marker>
          </defs>

          {/* Stars */}
          {isNight && weather === 'clear' && [...Array(90)].map((_, i) => (
            <circle key={`star${i}`}
              cx={(Math.sin(i * 127.1) * 0.5 + 0.5) * 900}
              cy={(Math.cos(i * 311.7) * 0.5 + 0.5) * 140}
              r={0.4 + Math.random() * 0.45}
              fill="#fff"
              opacity={0.12 + Math.sin(time * 1.4 + i) * 0.1} />
          ))}

          {renderClouds()}
          {renderCelestial()}
          {renderWater()}
          {renderGrid()}
          {renderBrooklynBridge()}
          {renderStatueOfLiberty()}

          {/* Buildings */}
          {buildings
            .map((b, i) => ({ ...b, idx: i, depth: getBuildingDepth(b) }))
            .sort((a, b) => b.depth - a.depth)
            .map(b => renderBuilding(b, b.idx))}

          {/* Labels */}
          {showInfo && weather !== 'storm' && buildings.filter(b => b.name).map((b, i) => {
            const labelY = b.h + (b.owtc || b.empireState ? 65 : b.chrysler ? 60 : b.spire ? 55 : 18);
            const lp = project(b.x, labelY, b.z);
            if (lp.z < -320) return null;
            return (
              <text key={`lbl${i}`} x={lp.x} y={lp.y} fill={b.color} fontSize="6.5"
                fontFamily="monospace" textAnchor="middle" fontWeight="bold"
                opacity={weather === 'fog' ? 0.45 : 0.95}
                style={isNight && !lightning ? { filter: `drop-shadow(0 0 2.5px ${b.color})` } : {}}>
                {b.name}
              </text>
            );
          })}

          {renderFog()}
          {renderRain()}
          {renderSnow()}
          {renderLightning()}
          {renderWindIndicator()}

          <text x="450" y="498" fill={colors.water} fontSize="9" textAnchor="middle" opacity={weather === 'fog' ? 0.18 : 0.35}>
            ★ HUDSON RIVER ★
          </text>

          <rect width="900" height="520" fill="url(#scan)" opacity="0.22"/>
          <rect x="0" y={scanline} width="900" height="1" fill="rgba(255,255,255,0.012)"/>
        </svg>
      </div>

      {/* Weather Controls */}
      <div style={{ marginTop: '9px', display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['clear', 'rain', 'snow', 'storm', 'fog'].map(w => (
          <button key={w} onClick={() => setWeather(w)} style={{
            background: weather === w ? colors.primary : 'transparent',
            border: `1px solid ${colors.primary}`,
            color: weather === w ? '#000' : colors.primary,
            padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
            fontFamily: 'monospace', fontSize: '9px',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            {weatherIcons[w]} {w.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div style={{ marginTop: '7px', display: 'flex', alignItems: 'center', gap: '9px' }}>
        <span style={{ color: colors.highlight, fontSize: '8px' }}>🍃</span>
        <input type="range" min="0" max="1" step="0.05" value={windSpeed}
          onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
          style={{ width: '110px', accentColor: colors.highlight }} />
        <span style={{ color: '#777', fontSize: '8px' }}>{Math.round(windSpeed * 30)} mph</span>
      </div>

      <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '9px' }}>
        <span style={{ color: colors.accent, fontSize: '8px' }}>🌅</span>
        <input type="range" min="0" max="1" step="0.01" value={timeOfDay}
          onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
          style={{ width: '140px', accentColor: colors.accent }} />
        <span style={{ color: colors.primary, fontSize: '8px' }}>🌙</span>
        <span style={{ color: '#777', fontSize: '8px', marginLeft: '4px' }}>
          {timeOfDay < 0.25 ? 'SUNRISE' : timeOfDay < 0.6 ? 'DAY' : timeOfDay < 0.75 ? 'SUNSET' : 'NIGHT'}
        </span>
      </div>

      {/* View Controls */}
      <div style={{ marginTop: '7px', display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setAutoRotate(a => !a)} style={{
          background: autoRotate ? colors.highlight : 'transparent',
          border: `1px solid ${colors.highlight}`,
          color: autoRotate ? '#000' : colors.highlight,
          padding: '3px 9px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>{autoRotate ? '⏸ PAUSE' : '▶ ROTATE'}</button>
        
        <button onClick={() => setShowInfo(s => !s)} style={{
          background: showInfo ? colors.accent : 'transparent',
          border: `1px solid ${colors.accent}`,
          color: showInfo ? '#000' : colors.accent,
          padding: '3px 9px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>🏷 LABELS</button>
        
        <button onClick={() => setCamera({ rotationY: 0.1, rotationX: 0.2, zoom: 1, panX: 0, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.secondary}`, color: colors.secondary,
          padding: '3px 9px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>↺ RESET</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.8, zoom: 0.55 }))} style={{
          background: 'transparent', border: `1px solid ${colors.purple}`, color: colors.purple,
          padding: '3px 9px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>⬆ AERIAL</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.06, zoom: 1.5 }))} style={{
          background: 'transparent', border: `1px solid ${colors.orange}`, color: colors.orange,
          padding: '3px 9px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>👁 STREET</button>
        
        <button onClick={() => setCamera({ rotationY: -0.6, rotationX: 0.18, zoom: 1.2, panX: -120, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.copper}`, color: colors.copper,
          padding: '3px 9px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>🗽 LIBERTY</button>
        
        <button onClick={() => setCamera({ rotationY: 0.5, rotationX: 0.22, zoom: 1.1, panX: 80, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.pink}`, color: colors.pink,
          padding: '3px 9px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px'
        }}>🏙 MIDTOWN</button>
      </div>

      <div style={{ marginTop: '5px', color: colors.highlight, fontSize: '7px', textAlign: 'center', opacity: 0.55 }}>
        DRAG: Rotate | SHIFT+DRAG: Pan | SCROLL: Zoom
      </div>

      <div style={{ display: 'flex', marginTop: '5px', gap: '2px' }}>
        {[colors.primary, colors.secondary, colors.accent, colors.highlight, colors.purple, colors.copper, colors.pink].map((c, i) => (
          <div key={i} style={{ width: '22px', height: '3.5px', background: c, boxShadow: isNight ? `0 0 4px ${c}` : 'none' }}/>
        ))}
      </div>
    </div>
  );
}
