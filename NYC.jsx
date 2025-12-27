import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function NYCSkyline() {
  const [time, setTime] = useState(0);
  const [scanline, setScanline] = useState(0);
  const [camera, setCamera] = useState({
    rotationY: 0.2,
    rotationX: 0.22,
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
  const [windSpeed, setWindSpeed] = useState(0.4);
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

  // Dynamic colors
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
        water: '#0044AA',
        grid: '#4400AA',
        sky1: '#050508',
        sky2: '#080815',
        sky3: '#0c0a20',
        sky4: '#150d30'
      };
    } else if (isSunset) {
      base = {
        primary: '#00BBDD',
        secondary: '#FF5588',
        accent: '#FFAA00',
        highlight: '#00DD77',
        purple: '#CC66FF',
        orange: '#FF6600',
        copper: '#DD5533',
        water: '#005588',
        grid: '#6622AA',
        sky1: '#1a1025',
        sky2: '#3a1840',
        sky3: '#7a3050',
        sky4: '#cc5530'
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
        water: '#006699',
        grid: '#3311AA',
        sky1: '#2a4060',
        sky2: '#4a6080',
        sky3: '#6a80a0',
        sky4: '#8aa0c0'
      };
    }

    if (isStormy) {
      base.sky1 = '#151520';
      base.sky2 = '#202030';
      base.sky3 = '#303040';
      base.sky4 = '#404055';
      base.water = '#002244';
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

  // NYC Buildings - Manhattan skyline from Hudson River
  const buildings = [
    // Far left - Downtown/Financial District
    { x: -380, z: 70, w: 28, d: 28, h: 85, color: colors.purple },
    { x: -350, z: 50, w: 32, d: 32, h: 100, color: colors.secondary },
    
    // One World Trade Center (Freedom Tower)
    { x: -300, z: 60, w: 48, d: 48, h: 320, color: colors.primary, name: 'ONE WTC', spire: true, tapered: true, info: { height: '1,776 ft', year: 2014, floors: 104, note: 'Tallest in Western Hemisphere' } },
    
    // WTC Complex
    { x: -260, z: 80, w: 35, d: 35, h: 190, color: colors.highlight, name: '3 WTC', info: { height: '1,079 ft', year: 2018, floors: 80 } },
    { x: -230, z: 55, w: 32, d: 32, h: 170, color: colors.purple, name: '4 WTC', info: { height: '978 ft', year: 2013, floors: 72 } },
    { x: -200, z: 75, w: 30, d: 30, h: 130, color: colors.secondary },
    
    // Woolworth Building
    { x: -160, z: 50, w: 30, d: 30, h: 160, color: colors.accent, name: 'WOOLWORTH', gothic: true, info: { height: '792 ft', year: 1913, floors: 57, note: 'Gothic cathedral of commerce' } },
    
    // City Hall area
    { x: -120, z: 70, w: 25, d: 25, h: 90, color: colors.purple },
    { x: -90, z: 55, w: 28, d: 28, h: 110, color: colors.highlight },
    
    // Midtown starts
    { x: -50, z: 60, w: 30, d: 30, h: 140, color: colors.secondary },
    { x: -20, z: 80, w: 26, d: 26, h: 120, color: colors.orange },
    
    // Flatiron area
    { x: 10, z: 45, w: 20, d: 35, h: 95, color: colors.accent, name: 'FLATIRON', flatiron: true, info: { height: '307 ft', year: 1902, floors: 22, note: 'Iconic triangular shape' } },
    
    // Empire State Building
    { x: 60, z: 60, w: 45, d: 45, h: 280, color: colors.accent, name: 'EMPIRE STATE', artdeco: true, antennas: true, info: { height: '1,454 ft', year: 1931, floors: 102, note: 'Art Deco masterpiece' } },
    
    // Midtown cluster
    { x: 110, z: 75, w: 30, d: 30, h: 150, color: colors.purple },
    { x: 140, z: 50, w: 32, d: 32, h: 170, color: colors.secondary },
    
    // Chrysler Building
    { x: 180, z: 65, w: 38, d: 38, h: 240, color: colors.copper, name: 'CHRYSLER', chrysler: true, info: { height: '1,046 ft', year: 1930, floors: 77, note: 'Art Deco crown jewel' } },
    
    // Grand Central area
    { x: 220, z: 80, w: 28, d: 28, h: 130, color: colors.highlight },
    { x: 250, z: 55, w: 34, d: 34, h: 160, color: colors.purple },
    
    // 432 Park Avenue
    { x: 285, z: 70, w: 28, d: 28, h: 260, color: colors.primary, name: '432 PARK', slender: true, info: { height: '1,396 ft', year: 2015, floors: 85, note: 'Pencil tower' } },
    
    // Steinway Tower
    { x: 315, z: 50, w: 20, d: 20, h: 250, color: colors.secondary, name: 'STEINWAY', slender: true, info: { height: '1,428 ft', year: 2021, floors: 84, note: 'Most slender skyscraper' } },
    
    // Central Park South
    { x: 350, z: 75, w: 32, d: 32, h: 180, color: colors.accent },
    { x: 385, z: 60, w: 28, d: 28, h: 140, color: colors.highlight },
    
    // Background buildings - deeper in Manhattan
    { x: -340, z: 150, w: 24, d: 24, h: 70, color: colors.purple },
    { x: -280, z: 160, w: 26, d: 26, h: 85, color: colors.secondary },
    { x: -200, z: 150, w: 22, d: 22, h: 65, color: colors.primary },
    { x: -120, z: 160, w: 25, d: 25, h: 75, color: colors.highlight },
    { x: -40, z: 150, w: 24, d: 24, h: 80, color: colors.accent },
    { x: 40, z: 160, w: 22, d: 22, h: 60, color: colors.purple },
    { x: 120, z: 150, w: 26, d: 26, h: 90, color: colors.secondary },
    { x: 200, z: 160, w: 24, d: 24, h: 70, color: colors.primary },
    { x: 280, z: 150, w: 22, d: 22, h: 65, color: colors.highlight },
    { x: 360, z: 160, w: 25, d: 25, h: 75, color: colors.accent },
  ];

  // Render building wireframe
  const renderBuilding = (b, idx) => {
    const lines = [];
    const hw = b.w / 2;
    const hd = b.d / 2;
    const windowSpacing = 16;
    const fogOpacity = weather === 'fog' ? 0.5 : 1;

    // Chrysler Building with Art Deco crown
    if (b.chrysler) {
      // Main shaft
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      // Setbacks
      const setbacks = [
        { h: 0, top: 160, scale: 1 },
        { h: 160, top: 190, scale: 0.85 },
        { h: 190, top: 210, scale: 0.7 },
        { h: 210, top: 225, scale: 0.55 }
      ];
      
      setbacks.forEach((sec, si) => {
        const sw = hw * sec.scale;
        const sd = hd * sec.scale;
        const sCorners = [
          [b.x - sw, b.z - sd], [b.x + sw, b.z - sd],
          [b.x + sw, b.z + sd], [b.x - sw, b.z + sd]
        ];
        
        sCorners.forEach(([cx, cz]) => {
          const p1 = project(cx, sec.h, cz);
          const p2 = project(cx, sec.top, cz);
          lines.push({ ...p1, x2: p2.x, y2: p2.y });
        });
        
        for (let i = 0; i < 4; i++) {
          const c1 = sCorners[i], c2 = sCorners[(i + 1) % 4];
          const pt1 = project(c1[0], sec.top, c1[1]);
          const pt2 = project(c2[0], sec.top, c2[1]);
          lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
        }
      });
      
      // Chrysler crown - triangular arches
      const crownBase = 225;
      const crownTop = 240;
      const crownScale = 0.4;
      
      for (let tier = 0; tier < 6; tier++) {
        const tierY = crownBase + tier * 3;
        const tierScale = crownScale * (1 - tier * 0.12);
        const tierR = hw * tierScale;
        
        for (let i = 0; i < 8; i++) {
          const angle1 = (i / 8) * Math.PI * 2;
          const angle2 = ((i + 1) / 8) * Math.PI * 2;
          const x1 = b.x + Math.cos(angle1) * tierR;
          const z1 = b.z + Math.sin(angle1) * tierR;
          const x2 = b.x + Math.cos(angle2) * tierR;
          const z2 = b.z + Math.sin(angle2) * tierR;
          
          const p1 = project(x1, tierY, z1);
          const p2 = project(x2, tierY, z2);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, crown: true });
          
          // Triangular sunburst
          if (tier < 5) {
            const peakY = tierY + 8;
            const midAngle = angle1 + Math.PI / 8;
            const peakX = b.x + Math.cos(midAngle) * tierR * 1.3;
            const peakZ = b.z + Math.sin(midAngle) * tierR * 1.3;
            const peak = project(peakX, peakY, peakZ);
            lines.push({ ...p1, x2: peak.x, y2: peak.y, crown: true });
            lines.push({ ...p2, x2: peak.x, y2: peak.y, crown: true });
          }
        }
      }
      
      // Spire
      const spireBase = project(b.x, crownTop, b.z);
      const spireTop = project(b.x, crownTop + 35, b.z);
      lines.push({ ...spireBase, x2: spireTop.x, y2: spireTop.y, thin: true });
    }
    // Empire State Building Art Deco
    else if (b.artdeco) {
      const setbacks = [
        { h: 0, top: 180, scale: 1 },
        { h: 180, top: 220, scale: 0.8 },
        { h: 220, top: 250, scale: 0.6 },
        { h: 250, top: 270, scale: 0.4 },
        { h: 270, top: 280, scale: 0.25 }
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
      
      // Antenna
      if (b.antennas) {
        const ant = project(b.x, 280, b.z);
        const antt = project(b.x, 330, b.z);
        lines.push({ ...ant, x2: antt.x, y2: antt.y, thin: true });
        
        // Antenna rings
        for (let r = 0; r < 3; r++) {
          const ringY = 290 + r * 12;
          const ringR = 4 - r;
          for (let i = 0; i < 8; i++) {
            const a1 = (i / 8) * Math.PI * 2;
            const a2 = ((i + 1) / 8) * Math.PI * 2;
            const p1 = project(b.x + Math.cos(a1) * ringR, ringY, b.z + Math.sin(a1) * ringR);
            const p2 = project(b.x + Math.cos(a2) * ringR, ringY, b.z + Math.sin(a2) * ringR);
            lines.push({ ...p1, x2: p2.x, y2: p2.y, thin: true });
          }
        }
      }
    }
    // One WTC tapered
    else if (b.tapered && b.name === 'ONE WTC') {
      const baseScale = 1;
      const topScale = 0.7;
      const numSegments = 20;
      
      for (let s = 0; s < numSegments; s++) {
        const y1 = (s / numSegments) * (b.h - 40);
        const y2 = ((s + 1) / numSegments) * (b.h - 40);
        const s1 = baseScale - (s / numSegments) * (baseScale - topScale);
        const s2 = baseScale - ((s + 1) / numSegments) * (baseScale - topScale);
        
        // Chamfered corners - octagonal cross section
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
          if (s % 4 === 0) {
            lines.push({ ...p1, x2: p3.x, y2: p3.y, floor: true });
          }
        }
      }
      
      // Spire
      if (b.spire) {
        const spireBase = project(b.x, b.h - 40, b.z);
        const spireTop = project(b.x, b.h + 30, b.z);
        lines.push({ ...spireBase, x2: spireTop.x, y2: spireTop.y, thin: true });
      }
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
      
      // Grid pattern windows (432 Park signature)
      const gridSpacing = 12;
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
    // Flatiron Building - triangular
    else if (b.flatiron) {
      // Triangular footprint
      const tip = [b.x, b.z - hd];
      const backLeft = [b.x - hw, b.z + hd];
      const backRight = [b.x + hw, b.z + hd];
      
      // Verticals
      [tip, backLeft, backRight].forEach(([cx, cz]) => {
        const p1 = project(cx, 0, cz);
        const p2 = project(cx, b.h, cz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      // Top and bottom triangles
      [[tip, backLeft], [backLeft, backRight], [backRight, tip]].forEach(([c1, c2]) => {
        const pb1 = project(c1[0], 0, c1[1]);
        const pb2 = project(c2[0], 0, c2[1]);
        const pt1 = project(c1[0], b.h, c1[1]);
        const pt2 = project(c2[0], b.h, c2[1]);
        lines.push({ ...pb1, x2: pb2.x, y2: pb2.y });
        lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
      });
      
      // Floor lines
      const floorCount = Math.floor(b.h / 12);
      for (let f = 1; f < floorCount; f++) {
        const y = f * 12;
        const p1 = project(tip[0], y, tip[1]);
        const p2 = project(backLeft[0], y, backLeft[1]);
        const p3 = project(backRight[0], y, backRight[1]);
        lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
        lines.push({ ...p2, x2: p3.x, y2: p3.y, floor: true });
        lines.push({ ...p3, x2: p1.x, y2: p1.y, floor: true });
      }
    }
    // Woolworth Gothic
    else if (b.gothic) {
      // Main tower
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
        const pb1 = project(c1[0], 0, c1[1]);
        const pb2 = project(c2[0], 0, c2[1]);
        lines.push({ ...pb1, x2: pb2.x, y2: pb2.y });
      }
      
      // Gothic crown with pinnacles
      const crownBase = b.h * 0.85;
      const crownTop = b.h;
      
      // Tapered top
      const topScale = 0.5;
      const topCorners = corners.map(([cx, cz]) => [
        b.x + (cx - b.x) * topScale,
        b.z + (cz - b.z) * topScale
      ]);
      
      corners.forEach(([cx, cz], i) => {
        const p1 = project(cx, crownBase, cz);
        const p2 = project(topCorners[i][0], crownTop, topCorners[i][1]);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      for (let i = 0; i < 4; i++) {
        const c1 = topCorners[i], c2 = topCorners[(i + 1) % 4];
        const pt1 = project(c1[0], crownTop, c1[1]);
        const pt2 = project(c2[0], crownTop, c2[1]);
        lines.push({ ...pt1, x2: pt2.x, y2: pt2.y });
      }
      
      // Pinnacle
      const pinnacle = project(b.x, crownTop + 15, b.z);
      topCorners.forEach(([cx, cz]) => {
        const p = project(cx, crownTop, cz);
        lines.push({ ...p, x2: pinnacle.x, y2: pinnacle.y, thin: true });
      });
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
      
      if (b.spire && !b.tapered) {
        const top = project(b.x, b.h + 35, b.z);
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
        strokeWidth={l.thin ? 0.7 : l.crown ? 0.6 : l.floor ? 0.3 : 1.3}
        opacity={(l.floor ? 0.2 : l.crown ? 0.8 : 0.9) * fogOpacity}
        style={{ filter: isNight && !lightning ? `drop-shadow(0 0 ${l.thin ? 1 : 2}px ${b.color})` : 'none' }}
      />
    ));
  };

  // Statue of Liberty
  const renderStatueOfLiberty = () => {
    const statueX = -450;
    const statueZ = -150;
    const elements = [];
    
    // Pedestal
    const pedCorners = [[-12, -12], [12, -12], [12, 12], [-12, 12]];
    pedCorners.forEach(([ox, oz], i) => {
      const next = pedCorners[(i + 1) % 4];
      const p1 = project(statueX + ox, 0, statueZ + oz);
      const p2 = project(statueX + ox, 30, statueZ + oz);
      const p3 = project(statueX + next[0], 0, statueZ + next[1]);
      elements.push(
        <line key={`ped-v-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.highlight} strokeWidth="1" opacity="0.7" />,
        <line key={`ped-b-${i}`} x1={p1.x} y1={p1.y} x2={p3.x} y2={p3.y} stroke={colors.highlight} strokeWidth="1" opacity="0.7" />
      );
    });
    
    // Body outline (simplified wireframe figure)
    const bodyPoints = [
      [0, 30], // base
      [-5, 45], // robe left
      [-4, 60], // waist left
      [-8, 80], // arm down
      [-3, 65], // shoulder
      [-2, 85], // neck
      [0, 95], // head base
      [-1, 100], // crown
      [4, 105], // torch arm up
      [8, 115], // torch
      [6, 105], // arm
      [2, 85], // shoulder right
      [3, 65], // back to body
      [5, 45], // robe right
      [0, 30] // base
    ];
    
    for (let i = 0; i < bodyPoints.length - 1; i++) {
      const [x1, y1] = bodyPoints[i];
      const [x2, y2] = bodyPoints[i + 1];
      const p1 = project(statueX + x1, y1, statueZ);
      const p2 = project(statueX + x2, y2, statueZ);
      elements.push(
        <line key={`statue-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} 
          stroke={colors.highlight} strokeWidth="1.2" opacity="0.8"
          style={isNight ? { filter: `drop-shadow(0 0 3px ${colors.highlight})` } : {}} />
      );
    }
    
    // Torch flame
    const torch = project(statueX + 8, 115, statueZ);
    const flameSize = 3 + Math.sin(time * 5) * 1;
    elements.push(
      <circle key="flame" cx={torch.x} cy={torch.y - 5} r={flameSize}
        fill={colors.accent} opacity={0.8}
        style={{ filter: `drop-shadow(0 0 8px ${colors.accent})` }} />
    );
    
    // Crown spikes
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI - Math.PI / 2;
      const spikeX = statueX - 1 + Math.cos(angle) * 6;
      const spikeY = 100 + Math.sin(angle) * 3 + 5;
      const spikeTop = project(spikeX, spikeY + 8, statueZ);
      const spikeBase = project(statueX - 1, 100, statueZ);
      elements.push(
        <line key={`spike-${i}`} x1={spikeBase.x} y1={spikeBase.y} x2={spikeTop.x} y2={spikeTop.y}
          stroke={colors.accent} strokeWidth="0.8" opacity="0.7" />
      );
    }
    
    // Label
    elements.push(
      <text key="statue-label" x={project(statueX, 130, statueZ).x} y={project(statueX, 130, statueZ).y}
        fill={colors.highlight} fontSize="8" textAnchor="middle" opacity="0.6">
        LIBERTY
      </text>
    );
    
    return elements;
  };

  // Brooklyn Bridge
  const renderBrooklynBridge = () => {
    const bridgeStartX = -420;
    const bridgeEndX = -280;
    const bridgeZ = -100;
    const elements = [];
    
    // Main cables (catenary curve)
    const towerX1 = bridgeStartX + 30;
    const towerX2 = bridgeEndX - 30;
    const towerHeight = 80;
    const deckHeight = 20;
    
    // Deck
    for (let x = bridgeStartX; x <= bridgeEndX; x += 10) {
      const p1 = project(x, deckHeight, bridgeZ - 8);
      const p2 = project(x, deckHeight, bridgeZ + 8);
      elements.push(
        <line key={`deck-${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.copper} strokeWidth="0.6" opacity="0.5" />
      );
    }
    
    // Side rails
    const railLeft1 = project(bridgeStartX, deckHeight, bridgeZ - 8);
    const railLeft2 = project(bridgeEndX, deckHeight, bridgeZ - 8);
    const railRight1 = project(bridgeStartX, deckHeight, bridgeZ + 8);
    const railRight2 = project(bridgeEndX, deckHeight, bridgeZ + 8);
    elements.push(
      <line key="rail-l" x1={railLeft1.x} y1={railLeft1.y} x2={railLeft2.x} y2={railLeft2.y}
        stroke={colors.copper} strokeWidth="1" opacity="0.7" />,
      <line key="rail-r" x1={railRight1.x} y1={railRight1.y} x2={railRight2.x} y2={railRight2.y}
        stroke={colors.copper} strokeWidth="1" opacity="0.7" />
    );
    
    // Gothic towers
    [towerX1, towerX2].forEach((tx, ti) => {
      // Tower base
      const tw = 8;
      const towerCorners = [[tx - tw, bridgeZ - tw], [tx + tw, bridgeZ - tw], [tx + tw, bridgeZ + tw], [tx - tw, bridgeZ + tw]];
      
      towerCorners.forEach(([cx, cz], i) => {
        const next = towerCorners[(i + 1) % 4];
        const p1 = project(cx, 0, cz);
        const p2 = project(cx, towerHeight, cz);
        const p3 = project(next[0], 0, next[1]);
        elements.push(
          <line key={`tower${ti}-v-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={colors.copper} strokeWidth="1.2" opacity="0.8" />,
          <line key={`tower${ti}-b-${i}`} x1={p1.x} y1={p1.y} x2={p3.x} y2={p3.y}
            stroke={colors.copper} strokeWidth="1" opacity="0.7" />
        );
      });
      
      // Gothic arch
      const archBottom = project(tx, towerHeight * 0.4, bridgeZ);
      const archTop = project(tx, towerHeight * 0.7, bridgeZ);
      const archLeft = project(tx - 5, towerHeight * 0.4, bridgeZ);
      const archRight = project(tx + 5, towerHeight * 0.4, bridgeZ);
      elements.push(
        <line key={`arch${ti}-l`} x1={archLeft.x} y1={archLeft.y} x2={archTop.x} y2={archTop.y}
          stroke={colors.accent} strokeWidth="0.8" opacity="0.6" />,
        <line key={`arch${ti}-r`} x1={archRight.x} y1={archRight.y} x2={archTop.x} y2={archTop.y}
          stroke={colors.accent} strokeWidth="0.8" opacity="0.6" />
      );
      
      // Tower pinnacles
      const pinnacle = project(tx, towerHeight + 10, bridgeZ);
      elements.push(
        <line key={`pin${ti}`} x1={project(tx, towerHeight, bridgeZ).x} y1={project(tx, towerHeight, bridgeZ).y}
          x2={pinnacle.x} y2={pinnacle.y} stroke={colors.copper} strokeWidth="0.8" opacity="0.7" />
      );
    });
    
    // Main suspension cables
    const cablePoints = 20;
    for (let side = -1; side <= 1; side += 2) {
      const cableZ = bridgeZ + side * 6;
      let lastP = null;
      
      for (let i = 0; i <= cablePoints; i++) {
        const t = i / cablePoints;
        const x = bridgeStartX + t * (bridgeEndX - bridgeStartX);
        
        // Catenary approximation
        let y;
        if (x < towerX1) {
          y = deckHeight + (towerX1 - x) / (towerX1 - bridgeStartX) * (towerHeight - deckHeight) * 0.5;
        } else if (x > towerX2) {
          y = deckHeight + (x - towerX2) / (bridgeEndX - towerX2) * (towerHeight - deckHeight) * 0.5;
        } else {
          const mid = (towerX1 + towerX2) / 2;
          const span = towerX2 - towerX1;
          const sag = 25;
          y = towerHeight - sag * (1 - Math.pow((x - mid) / (span / 2), 2));
        }
        
        const p = project(x, y, cableZ);
        if (lastP) {
          elements.push(
            <line key={`cable-${side}-${i}`} x1={lastP.x} y1={lastP.y} x2={p.x} y2={p.y}
              stroke={colors.accent} strokeWidth="0.8" opacity="0.6" />
          );
        }
        lastP = p;
        
        // Vertical suspenders
        if (i > 0 && i < cablePoints && i % 2 === 0 && x > towerX1 && x < towerX2) {
          const deckP = project(x, deckHeight, cableZ);
          elements.push(
            <line key={`susp-${side}-${i}`} x1={p.x} y1={p.y} x2={deckP.x} y2={deckP.y}
              stroke={colors.copper} strokeWidth="0.4" opacity="0.4" />
          );
        }
      }
    }
    
    return elements;
  };

  // Weather effects (same as Chicago)
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
            <line key={`rain-${i}`} x1={x} y1={y} x2={x2} y2={y2}
              stroke={colors.primary} strokeWidth={0.8 * intensity} opacity={0.4 * intensity} />
          );
        })}
        
        {weather === 'storm' && [...Array(20)].map((_, i) => {
          const rippleX = 100 + (i * 40 + time * 30) % 700;
          const rippleY = 450 + Math.sin(i * 2) * 30;
          const rippleSize = (Math.sin(time * 5 + i) + 1) * 4;
          
          return (
            <circle key={`ripple-${i}`} cx={rippleX} cy={rippleY} r={rippleSize}
              fill="none" stroke={colors.water} strokeWidth="0.5" opacity={0.3 - rippleSize * 0.03} />
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
              <circle cx={x} cy={y} r={flake.size} fill="#fff" opacity={0.7} />
              {flake.size > 2 && (
                <g opacity={0.4}>
                  <line x1={x - flake.size} y1={y} x2={x + flake.size} y2={y} stroke="#fff" strokeWidth="0.5" />
                  <line x1={x} y1={y - flake.size} x2={x} y2={y + flake.size} stroke="#fff" strokeWidth="0.5" />
                </g>
              )}
            </g>
          );
        })}
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
        <rect x="0" y="0" width="900" height="520" fill="#fff" opacity="0.3" />
        <polyline points={points.join(' ')} fill="none" stroke="#fff" strokeWidth="3" opacity="0.9"
          style={{ filter: 'drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #88f)' }} />
      </g>
    );
  };

  const renderFog = () => {
    if (weather !== 'fog') return null;
    
    return (
      <g>
        {[...Array(6)].map((_, i) => {
          const y = 250 + i * 50;
          const opacity = 0.15 + i * 0.05;
          const offset = Math.sin(time * 0.3 + i) * 20;
          
          return (
            <rect key={`fog-${i}`} x={-50 + offset} y={y} width="1000" height="60"
              fill={`url(#fogGradient${i % 2})`} opacity={opacity} />
          );
        })}
      </g>
    );
  };

  // Hudson River
  const renderWater = () => {
    const elements = [];
    const storminess = weather === 'storm' ? 2 : weather === 'rain' ? 1.3 : 1;
    
    // Water grid
    for (let x = -480; x <= 420; x += 35) {
      const p1 = project(x, 0, -250);
      const p2 = project(x, 0, -60);
      elements.push(
        <line key={`wg-${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth="0.4" opacity="0.25" />
      );
    }
    for (let z = -250; z <= -60; z += 25) {
      const wave = Math.sin(time * 1.5 * storminess + z * 0.08) * 2 * storminess;
      const p1 = project(-480, wave, z);
      const p2 = project(420, wave, z);
      elements.push(
        <line key={`wz-${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth={0.6 * storminess} opacity={0.15 + (z + 250) / 600} />
      );
    }
    
    // City reflections at night
    if (isNight && weather === 'clear') {
      const reflectionColors = [colors.secondary, colors.accent, colors.highlight, colors.primary, colors.purple, colors.orange];
      for (let i = 0; i < 35; i++) {
        const x = -450 + i * 25;
        const flicker = 0.25 + Math.sin(time * 2.5 + i * 0.6) * 0.2;
        const color = reflectionColors[i % reflectionColors.length];
        
        for (let j = 0; j < 5; j++) {
          const z = -220 + j * 30;
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
    
    // Ferries
    if (weather !== 'storm') {
      const ferries = [
        { x: -350, z: -180 },
        { x: -100, z: -200 },
        { x: 150, z: -170 },
      ];
      
      ferries.forEach((ferry, i) => {
        const fx = ferry.x + Math.sin(time * 0.2 + i) * 15;
        const bobY = Math.sin(time * 1.5 + i * 2) * 1;
        
        // Hull
        const hull = [
          [fx - 12, bobY], [fx + 12, bobY], [fx + 10, bobY + 4], [fx - 10, bobY + 4]
        ];
        
        for (let h = 0; h < hull.length; h++) {
          const next = hull[(h + 1) % hull.length];
          const p1 = project(hull[h][0], hull[h][1], ferry.z);
          const p2 = project(next[0], next[1], ferry.z);
          elements.push(
            <line key={`ferry-${i}-${h}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={colors.highlight} strokeWidth="1" opacity="0.7" />
          );
        }
        
        // Cabin
        const cabin1 = project(fx - 6, bobY + 8, ferry.z);
        const cabin2 = project(fx + 6, bobY + 8, ferry.z);
        const deck = project(fx, bobY, ferry.z);
        elements.push(
          <line key={`ferry-cabin-${i}-1`} x1={deck.x - 8} y1={deck.y} x2={cabin1.x} y2={cabin1.y}
            stroke={colors.accent} strokeWidth="0.8" opacity="0.6" />,
          <line key={`ferry-cabin-${i}-2`} x1={deck.x + 8} y1={deck.y} x2={cabin2.x} y2={cabin2.y}
            stroke={colors.accent} strokeWidth="0.8" opacity="0.6" />,
          <line key={`ferry-cabin-${i}-3`} x1={cabin1.x} y1={cabin1.y} x2={cabin2.x} y2={cabin2.y}
            stroke={colors.accent} strokeWidth="0.8" opacity="0.6" />
        );
      });
    }
    
    return elements;
  };

  const renderGrid = () => {
    const lines = [];
    const fogOpacity = weather === 'fog' ? 0.15 : 0.35;
    
    for (let x = -480; x <= 420; x += 50) {
      const p1 = project(x, 0, -60);
      const p2 = project(x, 0, 200);
      lines.push(<line key={`gx${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.5" opacity={fogOpacity} />);
    }
    for (let z = -60; z <= 200; z += 50) {
      const p1 = project(-480, 0, z);
      const p2 = project(420, 0, z);
      lines.push(<line key={`gz${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.5" opacity={fogOpacity} />);
    }
    return lines;
  };

  const renderCelestial = () => {
    if (weather === 'storm' || weather === 'fog') return null;
    
    if (timeOfDay > 0.7) {
      return (
        <g>
          <circle cx="800" cy="60" r="20" fill="none" stroke={colors.accent} strokeWidth="1" opacity="0.5" />
          <circle cx="800" cy="60" r="18" fill="none" stroke={colors.accent} strokeWidth="0.5" opacity="0.3" />
          <circle cx="800" cy="60" r="16" fill={colors.accent} opacity="0.1" />
        </g>
      );
    } else if (timeOfDay < 0.3 || timeOfDay > 0.6) {
      const sunY = timeOfDay < 0.3 ? 90 - timeOfDay * 180 : 90 - (1 - timeOfDay) * 140;
      return (
        <g>
          <circle cx="820" cy={sunY} r="28" fill={colors.orange} opacity="0.3" />
          <circle cx="820" cy={sunY} r="18" fill={colors.accent} opacity="0.5" />
        </g>
      );
    }
    return null;
  };

  const renderWindIndicator = () => {
    const windAngle = Math.PI * 0.3;
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
            NEW YORK CITY
          </div>
          <div style={{ color: colors.highlight, fontSize: '9px', letterSpacing: '3px' }}>
            SGI IRIS 1400 • MANHATTAN SKYLINE
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

          {/* Stars */}
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

          {/* Celestial */}
          {renderCelestial()}

          {/* Water */}
          {renderWater()}

          {/* Grid */}
          {renderGrid()}

          {/* Brooklyn Bridge */}
          {renderBrooklynBridge()}

          {/* Statue of Liberty */}
          {renderStatueOfLiberty()}

          {/* Buildings */}
          {buildings
            .map((b, i) => ({ ...b, idx: i, depth: getBuildingDepth(b) }))
            .sort((a, b) => b.depth - a.depth)
            .map(b => renderBuilding(b, b.idx))}

          {/* Labels */}
          {showInfo && weather !== 'storm' && buildings.filter(b => b.name).map((b, i) => {
            const labelY = b.h + (b.antennas ? 60 : b.spire ? 50 : b.chrysler ? 50 : 20);
            const lp = project(b.x, labelY, b.z);
            if (lp.z < -350) return null;
            return (
              <text key={`lbl${i}`} x={lp.x} y={lp.y} fill={b.color} fontSize="7"
                fontFamily="monospace" textAnchor="middle" fontWeight="bold"
                opacity={weather === 'fog' ? 0.5 : 1}
                style={isNight && !lightning ? { filter: `drop-shadow(0 0 3px ${b.color})` } : {}}>
                {b.name}
              </text>
            );
          })}

          {/* Fog */}
          {renderFog()}

          {/* Rain */}
          {renderRain()}

          {/* Snow */}
          {renderSnow()}

          {/* Lightning */}
          {renderLightning()}

          {/* Wind indicator */}
          {renderWindIndicator()}

          {/* River label */}
          <text x="450" y="500" fill={colors.water} fontSize="10" textAnchor="middle" 
            opacity={weather === 'fog' ? 0.2 : 0.4}>
            ★ HUDSON RIVER ★
          </text>

          {/* Scanlines */}
          <rect width="900" height="520" fill="url(#scan)" opacity="0.25"/>
          <rect x="0" y={scanline} width="900" height="1" fill="rgba(255,255,255,0.015)"/>
        </svg>
      </div>

      {/* Building Info Panel */}
      {selectedBuilding && selectedBuilding.info && (
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${selectedBuilding.color}`,
          borderRadius: '8px',
          padding: '12px',
          maxWidth: '200px',
          zIndex: 100
        }}>
          <div style={{ color: selectedBuilding.color, fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            {selectedBuilding.name}
          </div>
          <div style={{ color: '#aaa', fontSize: '10px', lineHeight: '1.6' }}>
            <div>Height: {selectedBuilding.info.height}</div>
            <div>Floors: {selectedBuilding.info.floors}</div>
            <div>Built: {selectedBuilding.info.year}</div>
            {selectedBuilding.info.note && <div style={{ color: colors.accent, marginTop: '4px' }}>{selectedBuilding.info.note}</div>}
          </div>
          <button onClick={() => setSelectedBuilding(null)} style={{
            marginTop: '8px',
            background: 'transparent',
            border: `1px solid ${colors.secondary}`,
            color: colors.secondary,
            padding: '3px 8px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '9px'
          }}>CLOSE</button>
        </div>
      )}

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

      {/* Sliders */}
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: colors.highlight, fontSize: '9px' }}>🍃 WIND</span>
        <input
          type="range" min="0" max="1" step="0.05" value={windSpeed}
          onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
          style={{ width: '120px', accentColor: colors.highlight }}
        />
        <span style={{ color: '#888', fontSize: '9px' }}>{Math.round(windSpeed * 30)} mph</span>
      </div>

      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: colors.accent, fontSize: '9px' }}>🌅</span>
        <input
          type="range" min="0" max="1" step="0.01" value={timeOfDay}
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
        <button onClick={() => setCamera({ rotationY: 0.2, rotationX: 0.22, zoom: 1, panX: 0, panY: 0 })} style={{
          background: 'transparent',
          border: `1px solid ${colors.secondary}`,
          color: colors.secondary,
          padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
          fontFamily: 'monospace', fontSize: '9px'
        }}>
          ↺ RESET
        </button>
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.85, zoom: 0.55 }))} style={{
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
        <button onClick={() => setCamera({ rotationY: -0.8, rotationX: 0.2, zoom: 1.3, panX: -100, panY: 0 })} style={{
          background: 'transparent',
          border: `1px solid ${colors.copper}`,
          color: colors.copper,
          padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
          fontFamily: 'monospace', fontSize: '9px'
        }}>
          🗽 LIBERTY
        </button>
      </div>

      {/* Info */}
      <div style={{ marginTop: '6px', color: colors.highlight, fontSize: '8px', textAlign: 'center', opacity: 0.6 }}>
        DRAG: Rotate | SHIFT+DRAG: Pan | SCROLL: Zoom
      </div>

      {/* Color bar */}
      <div style={{ display: 'flex', marginTop: '6px', gap: '2px' }}>
        {[colors.primary, colors.secondary, colors.accent, colors.highlight, colors.purple, colors.copper].map((c, i) => (
          <div key={i} style={{ width: '25px', height: '4px', background: c, boxShadow: isNight ? `0 0 5px ${c}` : 'none' }}/>
        ))}
      </div>
    </div>
  );
}
