import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function ChicagoWeather() {
  const [time, setTime] = useState(0);
  const [scanline, setScanline] = useState(0);
  const [camera, setCamera] = useState({
    rotationY: 0.15,
    rotationX: 0.25,
    zoom: 1,
    panX: 0,
    panY: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState('rotate');
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState(0.85);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const [weather, setWeather] = useState('clear'); // clear, rain, snow, storm, fog
  const [lightning, setLightning] = useState(false);
  const [windSpeed, setWindSpeed] = useState(0.5); // 0-1
  const svgRef = useRef(null);

  // Rain drops state
  const [rainDrops] = useState(() => 
    Array.from({ length: 150 }, () => ({
      x: Math.random() * 1000 - 50,
      y: Math.random() * 600,
      speed: 8 + Math.random() * 6,
      length: 10 + Math.random() * 15
    }))
  );

  // Snow flakes state
  const [snowFlakes] = useState(() =>
    Array.from({ length: 200 }, () => ({
      x: Math.random() * 1000,
      y: Math.random() * 600,
      size: 1 + Math.random() * 3,
      speed: 1 + Math.random() * 2,
      wobble: Math.random() * Math.PI * 2
    }))
  );

  // Cloud state
  const [clouds] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      x: i * 130 - 100,
      y: 40 + Math.random() * 60,
      width: 80 + Math.random() * 60,
      height: 25 + Math.random() * 20,
      speed: 0.3 + Math.random() * 0.4
    }))
  );

  // Lightning effect
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
        setCamera(c => ({ ...c, rotationY: c.rotationY + 0.002 }));
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

  // Dynamic colors based on time and weather
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
        water: '#0055DD',
        grid: '#4400AA',
        sky1: '#050508',
        sky2: '#0a0a18',
        sky3: '#0f0a25',
        sky4: '#1a1040'
      };
    } else if (isSunset) {
      base = {
        primary: '#00BBDD',
        secondary: '#FF5588',
        accent: '#FFAA00',
        highlight: '#00DD77',
        purple: '#CC66FF',
        orange: '#FF6600',
        water: '#0077AA',
        grid: '#6622AA',
        sky1: '#1a1030',
        sky2: '#4a2050',
        sky3: '#8a4060',
        sky4: '#dd7040'
      };
    } else {
      base = {
        primary: '#0099CC',
        secondary: '#DD4477',
        accent: '#DDAA00',
        highlight: '#00AA55',
        purple: '#9955CC',
        orange: '#DD5500',
        water: '#0088BB',
        grid: '#3311AA',
        sky1: '#2a4060',
        sky2: '#4a6080',
        sky3: '#6a80a0',
        sky4: '#8aa0c0'
      };
    }

    // Modify for weather
    if (isStormy) {
      base.sky1 = '#1a1a25';
      base.sky2 = '#252530';
      base.sky3 = '#353545';
      base.sky4 = '#454560';
      base.water = '#003355';
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
      y: 320 - ry * scale + camera.panY,
      z: rz2,
      scale
    };
  };

  // Building data
  const buildings = [
    { x: -380, z: 80, w: 25, d: 25, h: 70, color: colors.purple },
    { x: -350, z: 60, w: 30, d: 30, h: 90, color: colors.secondary },
    { x: -300, z: 50, w: 35, d: 35, h: 130, color: colors.accent, name: '311 S WACKER', info: { height: '961 ft', year: 1990, floors: 65 } },
    { x: -220, z: 60, w: 55, d: 55, h: 290, color: colors.primary, name: 'WILLIS TOWER', stepped: true, antennas: true, info: { height: '1,451 ft', year: 1973, floors: 110, note: 'Formerly Sears Tower' } },
    { x: -150, z: 40, w: 30, d: 30, h: 110, color: colors.purple },
    { x: -120, z: 70, w: 28, d: 28, h: 95, color: colors.secondary },
    { x: -85, z: 45, w: 32, d: 32, h: 160, color: colors.highlight, name: 'AQUA TOWER', wavy: true, info: { height: '859 ft', year: 2009, floors: 82, note: 'Iconic wavy balconies' } },
    { x: -40, z: 40, w: 40, d: 40, h: 200, color: colors.primary, name: 'AON CENTER', info: { height: '1,136 ft', year: 1973, floors: 83 } },
    { x: 5, z: 60, w: 32, d: 32, h: 180, color: colors.accent, name: 'PRUDENTIAL', spire: true, info: { height: '995 ft', year: 1990, floors: 64 } },
    { x: 40, z: 35, w: 30, d: 30, h: 190, color: colors.purple, name: 'ST. REGIS', twisted: true, info: { height: '1,198 ft', year: 2020, floors: 101, note: '3rd tallest in Chicago' } },
    { x: 80, z: 30, w: 35, d: 35, h: 220, color: colors.secondary, name: 'TRUMP TOWER', spire: true, info: { height: '1,388 ft', year: 2009, floors: 98 } },
    { x: 115, z: 55, w: 28, d: 28, h: 140, color: colors.orange, name: 'MARINA CITY', corncob: true, info: { height: '587 ft', year: 1964, floors: 65, note: 'Iconic twin towers' } },
    { x: 145, z: 55, w: 28, d: 28, h: 140, color: colors.orange, corncob: true },
    { x: 175, z: 70, w: 26, d: 26, h: 105, color: colors.highlight },
    { x: 220, z: 40, w: 45, d: 45, h: 260, color: colors.accent, name: 'HANCOCK', tapered: true, braced: true, antennas: true, info: { height: '1,127 ft', year: 1969, floors: 100, note: 'Iconic X-bracing' } },
    { x: 275, z: 60, w: 30, d: 30, h: 140, color: colors.secondary },
    { x: 310, z: 80, w: 28, d: 28, h: 115, color: colors.purple },
    { x: 345, z: 50, w: 32, d: 32, h: 125, color: colors.primary },
    { x: 380, z: 70, w: 26, d: 26, h: 95, color: colors.highlight },
    { x: -320, z: 150, w: 22, d: 22, h: 60, color: colors.purple },
    { x: -240, z: 140, w: 25, d: 25, h: 70, color: colors.secondary },
    { x: -160, z: 160, w: 20, d: 20, h: 55, color: colors.primary },
    { x: -80, z: 150, w: 24, d: 24, h: 65, color: colors.highlight },
    { x: 0, z: 140, w: 22, d: 22, h: 75, color: colors.accent },
    { x: 80, z: 160, w: 20, d: 20, h: 50, color: colors.purple },
    { x: 160, z: 150, w: 26, d: 26, h: 80, color: colors.secondary },
    { x: 260, z: 140, w: 22, d: 22, h: 60, color: colors.primary },
    { x: 340, z: 150, w: 20, d: 20, h: 55, color: colors.accent },
  ];

  // Render building (same as before, abbreviated for space)
  const renderBuilding = (b, idx) => {
    const lines = [];
    const hw = b.w / 2;
    const hd = b.d / 2;
    const windowSpacing = 18;
    const fogOpacity = weather === 'fog' ? 0.5 : 1;

    if (b.corncob) {
      const numFloors = 20;
      const baseHeight = 40;
      
      for (let i = 0; i < 12; i++) {
        const angle1 = (i / 12) * Math.PI * 2;
        const angle2 = ((i + 1) / 12) * Math.PI * 2;
        const x1 = b.x + Math.cos(angle1) * hw;
        const z1 = b.z + Math.sin(angle1) * hd;
        const x2 = b.x + Math.cos(angle2) * hw;
        const z2 = b.z + Math.sin(angle2) * hd;
        
        const pb1 = project(x1, 0, z1);
        const pb2 = project(x2, 0, z2);
        const pt1 = project(x1, baseHeight, z1);
        const pt2 = project(x2, baseHeight, z2);
        
        lines.push({ ...pb1, x2: pt1.x, y2: pt1.y });
        lines.push({ ...pb1, x2: pb2.x, y2: pb2.y });
        lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
      }
      
      for (let floor = 0; floor < numFloors; floor++) {
        const y = baseHeight + (floor / numFloors) * (b.h - baseHeight);
        const petalDepth = 8 + Math.sin(floor * 0.5) * 2;
        
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2;
          const nextAngle = ((i + 1) / 16) * Math.PI * 2;
          const innerR = hw * 0.85;
          const outerR = hw + petalDepth;
          
          const xi = b.x + Math.cos(angle) * innerR;
          const zi = b.z + Math.sin(angle) * innerR;
          const xo = b.x + Math.cos(angle) * outerR;
          const zo = b.z + Math.sin(angle) * outerR;
          const xo2 = b.x + Math.cos(nextAngle) * outerR;
          const zo2 = b.z + Math.sin(nextAngle) * outerR;
          
          const pi = project(xi, y, zi);
          const po = project(xo, y, zo);
          const po2 = project(xo2, y, zo2);
          
          lines.push({ ...pi, x2: po.x, y2: po.y, balcony: true });
          lines.push({ ...po, x2: po2.x, y2: po2.y, balcony: true });
        }
      }
      
      for (let i = 0; i < 12; i++) {
        const angle1 = (i / 12) * Math.PI * 2;
        const angle2 = ((i + 1) / 12) * Math.PI * 2;
        const x1 = b.x + Math.cos(angle1) * hw;
        const z1 = b.z + Math.sin(angle1) * hd;
        const x2 = b.x + Math.cos(angle2) * hw;
        const z2 = b.z + Math.sin(angle2) * hd;
        const pt1 = project(x1, b.h, z1);
        const pt2 = project(x2, b.h, z2);
        lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
      }
    }
    else if (b.wavy) {
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      corners.forEach(([cx, cz]) => {
        const p1 = project(cx, 0, cz);
        const p2 = project(cx, b.h, cz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      const numFloors = Math.floor(b.h / 12);
      for (let f = 0; f < numFloors; f++) {
        const y = f * 12;
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i];
          const c2 = corners[(i + 1) % 4];
          const wave1 = Math.sin(f * 0.4 + i) * 6;
          const wave2 = Math.sin(f * 0.4 + i + 1) * 6;
          
          const p1 = project(c1[0] + (i % 2 === 0 ? wave1 : 0), y, c1[1] + (i % 2 === 1 ? wave1 : 0));
          const p2 = project(c2[0] + ((i + 1) % 2 === 0 ? wave2 : 0), y, c2[1] + ((i + 1) % 2 === 1 ? wave2 : 0));
          lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
        }
      }
    }
    else if (b.twisted) {
      const numSegments = 15;
      const twistAmount = Math.PI * 0.15;
      
      for (let s = 0; s < numSegments; s++) {
        const y1 = (s / numSegments) * b.h;
        const y2 = ((s + 1) / numSegments) * b.h;
        const twist1 = (s / numSegments) * twistAmount;
        const twist2 = ((s + 1) / numSegments) * twistAmount;
        
        for (let i = 0; i < 4; i++) {
          const baseAngle = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const angle1 = baseAngle + twist1;
          const angle2 = baseAngle + twist2;
          const nextAngle1 = ((i + 1) / 4) * Math.PI * 2 + Math.PI / 4 + twist1;
          
          const x1 = b.x + Math.cos(angle1) * hw;
          const z1 = b.z + Math.sin(angle1) * hd;
          const x2 = b.x + Math.cos(angle2) * hw;
          const z2 = b.z + Math.sin(angle2) * hd;
          const nx1 = b.x + Math.cos(nextAngle1) * hw;
          const nz1 = b.z + Math.sin(nextAngle1) * hd;
          
          const p1 = project(x1, y1, z1);
          const p2 = project(x2, y2, z2);
          const pn1 = project(nx1, y1, nz1);
          
          lines.push({ ...p1, x2: p2.x, y2: p2.y });
          lines.push({ ...p1, x2: pn1.x, y2: pn1.y, floor: true });
        }
      }
    }
    else if (b.stepped) {
      const sections = [
        { h: 0, top: 180, scale: 1 },
        { h: 180, top: 220, scale: 0.82 },
        { h: 220, top: 260, scale: 0.65 },
        { h: 260, top: 290, scale: 0.5 }
      ];
      
      sections.forEach((sec, si) => {
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
          const p1 = project(c1[0], sec.top, c1[1]);
          const p2 = project(c2[0], sec.top, c2[1]);
          lines.push({ ...p1, x2: p2.x, y2: p2.y });
          
          if (si > 0) {
            const p3 = project(c1[0], sec.h, c1[1]);
            const p4 = project(c2[0], sec.h, c2[1]);
            lines.push({ ...p3, x2: p4.x, y2: p4.y });
          }
        }
        
        const floorCount = Math.floor((sec.top - sec.h) / windowSpacing);
        for (let f = 1; f < floorCount; f++) {
          const y = sec.h + f * windowSpacing;
          const p1 = project(b.x - sw, y, b.z - sd);
          const p2 = project(b.x + sw, y, b.z - sd);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
        }
      });
      
      if (b.antennas) {
        const ant1 = project(b.x - 10, 290, b.z);
        const ant1t = project(b.x - 10, 340, b.z);
        const ant2 = project(b.x + 10, 290, b.z);
        const ant2t = project(b.x + 10, 340, b.z);
        lines.push({ ...ant1, x2: ant1t.x, y2: ant1t.y, thin: true });
        lines.push({ ...ant2, x2: ant2t.x, y2: ant2t.y, thin: true });
      }
    }
    else if (b.tapered) {
      const topScale = 0.55;
      const corners = [
        { bx: b.x - hw, bz: b.z - hd, tx: b.x - hw * topScale, tz: b.z - hd * topScale },
        { bx: b.x + hw, bz: b.z - hd, tx: b.x + hw * topScale, tz: b.z - hd * topScale },
        { bx: b.x + hw, bz: b.z + hd, tx: b.x + hw * topScale, tz: b.z + hd * topScale },
        { bx: b.x - hw, bz: b.z + hd, tx: b.x - hw * topScale, tz: b.z + hd * topScale }
      ];
      
      corners.forEach(c => {
        const p1 = project(c.bx, 0, c.bz);
        const p2 = project(c.tx, b.h, c.tz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      for (let i = 0; i < 4; i++) {
        const c1 = corners[i], c2 = corners[(i + 1) % 4];
        const pb1 = project(c1.bx, 0, c1.bz);
        const pb2 = project(c2.bx, 0, c2.bz);
        const pt1 = project(c1.tx, b.h, c1.tz);
        const pt2 = project(c2.tx, b.h, c2.tz);
        lines.push({ ...pb1, x2: pb2.x, y2: pb2.y });
        lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
      }
      
      if (b.braced) {
        const numX = 5;
        for (let i = 0; i < numX; i++) {
          const y1 = (i / numX) * b.h;
          const y2 = ((i + 1) / numX) * b.h;
          const s1 = 1 - (i / numX) * (1 - topScale);
          const s2 = 1 - ((i + 1) / numX) * (1 - topScale);
          
          [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]].forEach(([x1m, z1m, x2m, z2m]) => {
            const p1 = project(b.x + x1m * hw * s1, y1, b.z + z1m * hd * s1);
            const p2 = project(b.x + x2m * hw * s2, y2, b.z + z2m * hd * s2);
            const p3 = project(b.x + x2m * hw * s1, y1, b.z + z2m * hd * s1);
            const p4 = project(b.x + x1m * hw * s2, y2, b.z + z1m * hd * s2);
            lines.push({ ...p1, x2: p2.x, y2: p2.y, brace: true });
            lines.push({ ...p3, x2: p4.x, y2: p4.y, brace: true });
          });
        }
      }
      
      if (b.antennas) {
        const ant = project(b.x, b.h, b.z);
        const antt = project(b.x, b.h + 50, b.z);
        lines.push({ ...ant, x2: antt.x, y2: antt.y, thin: true });
      }
    }
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
      
      if (b.spire) {
        const top = project(b.x, b.h + 40, b.z);
        corners.forEach(([cx, cz]) => {
          const p = project(cx, b.h, cz);
          lines.push({ ...p, x2: top.x, y2: top.y, thin: true });
        });
      }
    }

    return lines.map((l, i) => (
      <line
        key={`b${idx}-${i}`}
        x1={l.x} y1={l.y} x2={l.x2} y2={l.y2}
        stroke={b.color}
        strokeWidth={l.thin ? 0.7 : l.brace ? 0.5 : l.floor ? 0.3 : l.balcony ? 0.4 : 1.3}
        opacity={(l.brace ? 0.5 : l.floor ? 0.25 : l.balcony ? 0.6 : 0.9) * fogOpacity}
        style={{ filter: isNight && !lightning ? `drop-shadow(0 0 ${l.thin ? 1 : 2}px ${b.color})` : 'none' }}
      />
    ));
  };

  // Weather Effects
  const renderRain = () => {
    if (weather !== 'rain' && weather !== 'storm') return null;
    
    const intensity = weather === 'storm' ? 1.5 : 1;
    const windOffset = windSpeed * 100;
    
    return (
      <g>
        {rainDrops.map((drop, i) => {
          const x = ((drop.x + time * (drop.speed * 10) * windSpeed + windOffset) % 1000);
          const y = ((drop.y + time * drop.speed * 50) % 600);
          const x2 = x + windSpeed * drop.length;
          const y2 = y + drop.length;
          
          return (
            <line
              key={`rain-${i}`}
              x1={x}
              y1={y}
              x2={x2}
              y2={y2}
              stroke={colors.primary}
              strokeWidth={0.8 * intensity}
              opacity={0.4 * intensity}
            />
          );
        })}
        
        {/* Rain ripples on water */}
        {weather === 'storm' && [...Array(20)].map((_, i) => {
          const rippleX = 100 + (i * 40 + time * 30) % 700;
          const rippleY = 450 + Math.sin(i * 2) * 30;
          const rippleSize = (Math.sin(time * 5 + i) + 1) * 4;
          
          return (
            <circle
              key={`ripple-${i}`}
              cx={rippleX}
              cy={rippleY}
              r={rippleSize}
              fill="none"
              stroke={colors.water}
              strokeWidth="0.5"
              opacity={0.3 - rippleSize * 0.03}
            />
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
          const y = ((flake.y + time * flake.speed * 30) % 600);
          
          return (
            <g key={`snow-${i}`}>
              <circle
                cx={x}
                cy={y}
                r={flake.size}
                fill="#fff"
                opacity={0.7}
              />
              {flake.size > 2 && (
                <g opacity={0.4}>
                  <line x1={x - flake.size} y1={y} x2={x + flake.size} y2={y} stroke="#fff" strokeWidth="0.5" />
                  <line x1={x} y1={y - flake.size} x2={x} y2={y + flake.size} stroke="#fff" strokeWidth="0.5" />
                </g>
              )}
            </g>
          );
        })}
        
        {/* Snow accumulation on ground */}
        <rect x="0" y="480" width="900" height="40" fill="#fff" opacity="0.1" />
      </g>
    );
  };

  const renderClouds = () => {
    if (weather === 'clear' && timeOfDay > 0.3 && timeOfDay < 0.7) return null;
    
    const cloudOpacity = weather === 'storm' ? 0.7 : weather === 'fog' ? 0.5 : 0.4;
    const cloudColor = weather === 'storm' ? '#2a2a3a' : '#8899aa';
    
    return (
      <g>
        {clouds.map((cloud, i) => {
          const x = ((cloud.x + time * cloud.speed * 20 * (1 + windSpeed)) % 1100) - 100;
          
          return (
            <g key={`cloud-${i}`} opacity={cloudOpacity}>
              <ellipse cx={x} cy={cloud.y} rx={cloud.width / 2} ry={cloud.height / 2} fill={cloudColor} />
              <ellipse cx={x - cloud.width * 0.3} cy={cloud.y + 5} rx={cloud.width / 3} ry={cloud.height / 2.5} fill={cloudColor} />
              <ellipse cx={x + cloud.width * 0.3} cy={cloud.y + 3} rx={cloud.width / 3} ry={cloud.height / 2.5} fill={cloudColor} />
              
              {/* Cloud wireframe outline */}
              <ellipse cx={x} cy={cloud.y} rx={cloud.width / 2} ry={cloud.height / 2} 
                fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.3" />
            </g>
          );
        })}
      </g>
    );
  };

  const renderLightning = () => {
    if (!lightning) return null;
    
    const boltX = 200 + Math.random() * 500;
    const points = [];
    let y = 0;
    let x = boltX;
    
    while (y < 350) {
      points.push(`${x},${y}`);
      y += 20 + Math.random() * 30;
      x += (Math.random() - 0.5) * 60;
    }
    
    return (
      <g>
        {/* Screen flash */}
        <rect x="0" y="0" width="900" height="520" fill="#fff" opacity="0.3" />
        
        {/* Main bolt */}
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          opacity="0.9"
          style={{ filter: 'drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #88f)' }}
        />
        
        {/* Secondary bolt */}
        <polyline
          points={points.map((p, i) => {
            if (i > points.length / 2 && Math.random() > 0.5) {
              const [px, py] = p.split(',');
              return `${parseFloat(px) + (Math.random() - 0.5) * 40},${py}`;
            }
            return p;
          }).slice(Math.floor(points.length / 2)).join(' ')}
          fill="none"
          stroke="#aaf"
          strokeWidth="2"
          opacity="0.7"
        />
      </g>
    );
  };

  const renderFog = () => {
    if (weather !== 'fog') return null;
    
    return (
      <g>
        {/* Fog layers */}
        {[...Array(6)].map((_, i) => {
          const y = 250 + i * 50;
          const opacity = 0.15 + i * 0.05;
          const offset = Math.sin(time * 0.3 + i) * 20;
          
          return (
            <rect
              key={`fog-${i}`}
              x={-50 + offset}
              y={y}
              width="1000"
              height="60"
              fill={`url(#fogGradient${i % 2})`}
              opacity={opacity}
            />
          );
        })}
      </g>
    );
  };

  const renderWater = () => {
    const elements = [];
    const storminess = weather === 'storm' ? 2 : weather === 'rain' ? 1.3 : 1;
    
    for (let x = -400; x <= 450; x += 35) {
      const p1 = project(x, 0, -250);
      const p2 = project(x, 0, -80);
      elements.push(
        <line key={`wg-${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth="0.4" opacity="0.25" />
      );
    }
    for (let z = -250; z <= -80; z += 25) {
      const wave = Math.sin(time * 1.5 * storminess + z * 0.08) * 2 * storminess;
      const p1 = project(-400, wave, z);
      const p2 = project(450, wave, z);
      elements.push(
        <line key={`wz-${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth={0.6 * storminess} opacity={0.15 + (z + 250) / 600} />
      );
    }
    
    if (isNight && weather === 'clear') {
      const reflectionColors = [colors.secondary, colors.accent, colors.highlight, colors.primary, colors.purple, colors.orange];
      for (let i = 0; i < 30; i++) {
        const x = -380 + i * 27;
        const flicker = 0.25 + Math.sin(time * 2.5 + i * 0.6) * 0.2;
        const color = reflectionColors[i % reflectionColors.length];
        
        for (let j = 0; j < 5; j++) {
          const z = -230 + j * 30;
          const wave = Math.sin(time * 1.8 + i * 0.4 + j * 0.25) * 3;
          const p = project(x + Math.sin(time * 0.8 + i) * 4, wave - 3, z);
          elements.push(
            <ellipse key={`ref-${i}-${j}`} cx={p.x} cy={p.y} rx={6 + j} ry={1.5}
              fill={color} opacity={flicker * (1 - j * 0.15)}
              style={{ filter: 'blur(1px)' }} />
          );
        }
      }
    }
    
    // Boats with wind effect
    const boats = [
      { x: -200, z: -180, angle: 0.3 },
      { x: 50, z: -200, angle: -0.2 },
      { x: 250, z: -170, angle: 0.5 },
    ];
    
    if (weather !== 'storm') {
      boats.forEach((boat, i) => {
        const bx = boat.x + Math.sin(time * 0.3 + i) * 10 + windSpeed * 30;
        const bz = boat.z;
        const bobY = Math.sin(time * 2 * storminess + i * 2) * 1 * storminess;
        const tilt = windSpeed * 0.3;
        
        const hull1 = project(bx - 8, bobY, bz);
        const hull2 = project(bx + 8, bobY, bz);
        const hull3 = project(bx, bobY, bz - 4);
        const hull4 = project(bx, bobY, bz + 4);
        
        elements.push(
          <line key={`boat-h1-${i}`} x1={hull1.x} y1={hull1.y} x2={hull3.x} y2={hull3.y}
            stroke={colors.highlight} strokeWidth="1" opacity="0.7" />
        );
        elements.push(
          <line key={`boat-h2-${i}`} x1={hull2.x} y1={hull2.y} x2={hull3.x} y2={hull3.y}
            stroke={colors.highlight} strokeWidth="1" opacity="0.7" />
        );
        elements.push(
          <line key={`boat-h3-${i}`} x1={hull1.x} y1={hull1.y} x2={hull4.x} y2={hull4.y}
            stroke={colors.highlight} strokeWidth="1" opacity="0.7" />
        );
        elements.push(
          <line key={`boat-h4-${i}`} x1={hull2.x} y1={hull2.y} x2={hull4.x} y2={hull4.y}
            stroke={colors.highlight} strokeWidth="1" opacity="0.7" />
        );
        
        // Sail with wind tilt
        const mastBase = project(bx, bobY, bz);
        const mastTop = project(bx + tilt * 15, bobY + 15, bz);
        const sailTip = project(bx + 6 + tilt * 20, bobY + 12, bz);
        
        elements.push(
          <line key={`boat-mast-${i}`} x1={mastBase.x} y1={mastBase.y} x2={mastTop.x} y2={mastTop.y}
            stroke={colors.highlight} strokeWidth="0.8" opacity="0.7" />
        );
        elements.push(
          <line key={`boat-sail1-${i}`} x1={mastTop.x} y1={mastTop.y} x2={sailTip.x} y2={sailTip.y}
            stroke={colors.accent} strokeWidth="0.8" opacity="0.6" />
        );
        elements.push(
          <line key={`boat-sail2-${i}`} x1={mastBase.x} y1={mastBase.y} x2={sailTip.x} y2={sailTip.y}
            stroke={colors.accent} strokeWidth="0.8" opacity="0.6" />
        );
      });
    }
    
    return elements;
  };

  const renderGrid = () => {
    const lines = [];
    const fogOpacity = weather === 'fog' ? 0.15 : 0.35;
    
    for (let x = -400; x <= 450; x += 50) {
      const p1 = project(x, 0, -80);
      const p2 = project(x, 0, 200);
      lines.push(<line key={`gx${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.5" opacity={fogOpacity} />);
    }
    for (let z = -80; z <= 200; z += 50) {
      const p1 = project(-400, 0, z);
      const p2 = project(450, 0, z);
      lines.push(<line key={`gz${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.5" opacity={fogOpacity} />);
    }
    return lines;
  };

  const renderCelestial = () => {
    if (weather === 'storm' || weather === 'fog') return null;
    
    if (timeOfDay > 0.7) {
      return (
        <g>
          <circle cx="780" cy="70" r="22" fill="none" stroke={colors.accent} strokeWidth="1" opacity="0.5" />
          <circle cx="780" cy="70" r="20" fill="none" stroke={colors.accent} strokeWidth="0.5" opacity="0.3" />
          <circle cx="780" cy="70" r="18" fill={colors.accent} opacity="0.1" />
        </g>
      );
    } else if (timeOfDay < 0.3 || timeOfDay > 0.6) {
      const sunY = timeOfDay < 0.3 ? 100 - timeOfDay * 200 : 100 - (1 - timeOfDay) * 150;
      return (
        <g>
          <circle cx="800" cy={sunY} r="30" fill={colors.orange} opacity="0.3" />
          <circle cx="800" cy={sunY} r="20" fill={colors.accent} opacity="0.5" />
        </g>
      );
    }
    return null;
  };

  // Wind indicator
  const renderWindIndicator = () => {
    const windAngle = Math.PI * 0.25; // Wind from southwest
    const arrowLength = 20 + windSpeed * 30;
    
    return (
      <g transform="translate(50, 80)">
        <circle cx="0" cy="0" r="25" fill="rgba(0,0,0,0.4)" stroke={colors.primary} strokeWidth="1" />
        <text x="0" y="-30" fill={colors.primary} fontSize="8" textAnchor="middle">WIND</text>
        <line
          x1={-Math.cos(windAngle) * 5}
          y1={-Math.sin(windAngle) * 5}
          x2={Math.cos(windAngle) * arrowLength}
          y2={Math.sin(windAngle) * arrowLength}
          stroke={colors.accent}
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        <text x="0" y="40" fill={colors.accent} fontSize="9" textAnchor="middle">
          {Math.round(windSpeed * 30)} mph
        </text>
      </g>
    );
  };

  const getBuildingDepth = (b) => project(b.x, b.h / 2, b.z).z;

  const weatherIcons = {
    clear: '☀️',
    rain: '🌧️',
    snow: '❄️',
    storm: '⛈️',
    fog: '🌫️'
  };

  return (
    <div style={{
      background: `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 30%, ${colors.sky3} 60%, ${colors.sky4} 100%)`,
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
        <svg width="40" height="40" viewBox="0 0 100 100">
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke={colors.secondary} strokeWidth="3"/>
          <line x1="50" y1="10" x2="50" y2="50" stroke={colors.highlight} strokeWidth="3"/>
          <line x1="10" y1="30" x2="50" y2="50" stroke={colors.primary} strokeWidth="3"/>
          <line x1="90" y1="30" x2="50" y2="50" stroke={colors.accent} strokeWidth="3"/>
        </svg>
        <div>
          <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px' }}>
            CHICAGO SKYLINE
          </div>
          <div style={{ color: colors.highlight, fontSize: '9px', letterSpacing: '3px' }}>
            SGI IRIS 1400 • WEATHER SYSTEM
          </div>
        </div>
        <div style={{ marginLeft: '20px', fontSize: '24px' }}>
          {weatherIcons[weather]}
        </div>
      </div>

      {/* Main display */}
      <div style={{
        background: '#0a0a0a',
        borderRadius: '10px',
        padding: '6px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.8)'
      }}>
        <svg
          ref={svgRef}
          width="900"
          height="520"
          style={{
            background: lightning 
              ? '#445566'
              : `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 25%, ${colors.sky3} 50%, ${colors.sky4} 75%, ${colors.water}33 100%)`,
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
              <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
            </pattern>
            <linearGradient id="fogGradient0" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8899aa" stopOpacity="0"/>
              <stop offset="50%" stopColor="#8899aa" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#8899aa" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="fogGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#99aabb" stopOpacity="0"/>
              <stop offset="50%" stopColor="#99aabb" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#99aabb" stopOpacity="0"/>
            </linearGradient>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={colors.accent} />
            </marker>
          </defs>

          {/* Stars (night, clear) */}
          {isNight && weather === 'clear' && [...Array(100)].map((_, i) => (
            <circle
              key={`star${i}`}
              cx={(Math.sin(i * 127.1) * 0.5 + 0.5) * 900}
              cy={(Math.cos(i * 311.7) * 0.5 + 0.5) * 150}
              r={0.5 + Math.random() * 0.5}
              fill="#fff"
              opacity={0.15 + Math.sin(time * 1.5 + i) * 0.12}
            />
          ))}

          {/* Clouds */}
          {renderClouds()}

          {/* Celestial body */}
          {renderCelestial()}

          {/* Water */}
          {renderWater()}

          {/* Ground grid */}
          {renderGrid()}

          {/* Buildings */}
          {buildings
            .map((b, i) => ({ ...b, idx: i, depth: getBuildingDepth(b) }))
            .sort((a, b) => b.depth - a.depth)
            .map(b => renderBuilding(b, b.idx))}

          {/* Building labels */}
          {showInfo && weather !== 'storm' && buildings.filter(b => b.name).map((b, i) => {
            const labelY = b.h + (b.antennas ? 55 : b.spire ? 50 : 20);
            const lp = project(b.x, labelY, b.z);
            if (lp.z < -350) return null;
            return (
              <text key={`lbl${i}`} x={lp.x} y={lp.y} fill={b.color} fontSize="8"
                fontFamily="monospace" textAnchor="middle" fontWeight="bold"
                opacity={weather === 'fog' ? 0.5 : 1}
                style={isNight && !lightning ? { filter: `drop-shadow(0 0 3px ${b.color})` } : {}}>
                {b.name}
              </text>
            );
          })}

          {/* Fog effect */}
          {renderFog()}

          {/* Rain */}
          {renderRain()}

          {/* Snow */}
          {renderSnow()}

          {/* Lightning */}
          {renderLightning()}

          {/* Wind indicator */}
          {renderWindIndicator()}

          {/* Lake label */}
          <text x="450" y="500" fill={colors.water} fontSize="10" textAnchor="middle" 
            opacity={weather === 'fog' ? 0.2 : 0.4}>
            ★ LAKE MICHIGAN ★
          </text>

          {/* Scanlines */}
          <rect width="900" height="520" fill="url(#scan)" opacity="0.25"/>
          <rect x="0" y={scanline} width="900" height="1" fill="rgba(255,255,255,0.015)"/>
        </svg>
      </div>

      {/* Weather Controls */}
      <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['clear', 'rain', 'snow', 'storm', 'fog'].map(w => (
          <button
            key={w}
            onClick={() => setWeather(w)}
            style={{
              background: weather === w ? colors.primary : 'transparent',
              border: `1px solid ${colors.primary}`,
              color: weather === w ? '#000' : colors.primary,
              padding: '5px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {weatherIcons[w]} {w.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Wind Slider */}
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: colors.highlight, fontSize: '9px' }}>🍃 WIND</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={windSpeed}
          onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
          style={{ width: '120px', accentColor: colors.highlight }}
        />
        <span style={{ color: '#888', fontSize: '9px' }}>{Math.round(windSpeed * 30)} mph</span>
      </div>

      {/* Time Slider */}
      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: colors.accent, fontSize: '9px' }}>🌅</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
          style={{ width: '150px', accentColor: colors.accent }}
        />
        <span style={{ color: colors.primary, fontSize: '9px' }}>🌙</span>
        <span style={{ color: '#888', fontSize: '9px', marginLeft: '5px' }}>
          {timeOfDay < 0.25 ? 'SUNRISE' : timeOfDay < 0.6 ? 'DAY' : timeOfDay < 0.75 ? 'SUNSET' : 'NIGHT'}
        </span>
      </div>

      {/* View Controls */}
      <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setAutoRotate(a => !a)} style={{
          background: autoRotate ? colors.highlight : 'transparent',
          border: `1px solid ${colors.highlight}`,
          color: autoRotate ? '#000' : colors.highlight,
          padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
          fontFamily: 'monospace', fontSize: '9px'
        }}>
          {autoRotate ? '⏸ PAUSE' : '▶ ROTATE'}
        </button>
        <button onClick={() => setShowInfo(s => !s)} style={{
          background: showInfo ? colors.accent : 'transparent',
          border: `1px solid ${colors.accent}`,
          color: showInfo ? '#000' : colors.accent,
          padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
          fontFamily: 'monospace', fontSize: '9px'
        }}>
          🏷 LABELS
        </button>
        <button onClick={() => setCamera({ rotationY: 0.15, rotationX: 0.25, zoom: 1, panX: 0, panY: 0 })} style={{
          background: 'transparent',
          border: `1px solid ${colors.secondary}`,
          color: colors.secondary,
          padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
          fontFamily: 'monospace', fontSize: '9px'
        }}>
          ↺ RESET
        </button>
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.85, zoom: 0.6 }))} style={{
          background: 'transparent',
          border: `1px solid ${colors.purple}`,
          color: colors.purple,
          padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
          fontFamily: 'monospace', fontSize: '9px'
        }}>
          ⬆ AERIAL
        </button>
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.08, zoom: 1.6 }))} style={{
          background: 'transparent',
          border: `1px solid ${colors.orange}`,
          color: colors.orange,
          padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
          fontFamily: 'monospace', fontSize: '9px'
        }}>
          👁 STREET
        </button>
      </div>

      {/* Info */}
      <div style={{ marginTop: '6px', color: colors.highlight, fontSize: '8px', textAlign: 'center', opacity: 0.6 }}>
        DRAG: Rotate | SHIFT+DRAG: Pan | SCROLL: Zoom
      </div>

      {/* Color bar */}
      <div style={{ display: 'flex', marginTop: '6px', gap: '2px' }}>
        {[colors.primary, colors.secondary, colors.accent, colors.highlight, colors.purple, colors.orange].map((c, i) => (
          <div key={i} style={{ width: '25px', height: '4px', background: c, boxShadow: isNight ? `0 0 5px ${c}` : 'none' }}/>
        ))}
      </div>
    </div>
  );
}
