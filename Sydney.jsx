import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function SydneySkyline() {
  const [time, setTime] = useState(0);
  const [scanline, setScanline] = useState(0);
  const [camera, setCamera] = useState({
    rotationY: 0.15,
    rotationX: 0.18,
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

  const [clouds] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      x: i * 130 - 100,
      y: 30 + Math.random() * 50,
      width: 90 + Math.random() * 70,
      height: 28 + Math.random() * 22,
      speed: 0.25 + Math.random() * 0.4
    }))
  );

  // Sailboats in the harbour
  const [sailboats] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: -350 + Math.random() * 700,
      z: -180 + Math.random() * 80,
      size: 0.6 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
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

  // Sydney color palette - bright, coastal, sunny
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
        orange: '#FF8C42',
        teal: '#00CED1',
        white: '#F0F8FF',
        steel: '#A8C0D0',
        bridge: '#708090',
        opera: '#E8E8E8',
        water: '#001830',
        grid: '#1a0a30',
        sky1: '#020408',
        sky2: '#040810',
        sky3: '#081018',
        sky4: '#0c1828'
      };
    } else if (isSunset) {
      base = {
        primary: '#00BBDD',
        secondary: '#FF5588',
        accent: '#FFAA00',
        highlight: '#00DD77',
        purple: '#AA66DD',
        orange: '#FF6622',
        teal: '#00BBAA',
        white: '#FFF8F0',
        steel: '#99AABB',
        bridge: '#556677',
        opera: '#FFE8D8',
        water: '#0a2540',
        grid: '#300a30',
        sky1: '#0a0515',
        sky2: '#201028',
        sky3: '#602840',
        sky4: '#DD6620'
      };
    } else {
      base = {
        primary: '#0099DD',
        secondary: '#DD4488',
        accent: '#DDAA00',
        highlight: '#00BB66',
        purple: '#8855BB',
        orange: '#DD5522',
        teal: '#009999',
        white: '#FFFFFF',
        steel: '#8899AA',
        bridge: '#445566',
        opera: '#EEEEEE',
        water: '#1a4a6a',
        grid: '#200a20',
        sky1: '#4080C0',
        sky2: '#60A0D0',
        sky3: '#80C0E0',
        sky4: '#A0E0FF'
      };
    }

    if (isStormy) {
      base.sky1 = '#101018';
      base.sky2 = '#181822';
      base.sky3 = '#252530';
      base.sky4 = '#353545';
      base.water = '#0a1520';
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

  // Sydney CBD buildings
  const buildings = [
    // === SYDNEY TOWER (Centrepoint) - Iconic needle ===
    { x: 80, z: 80, w: 12, d: 12, h: 280, color: colors.accent, name: 'SYDNEY TOWER', sydneyTower: true, info: { height: '1,014 ft', year: 1981, note: 'Observation deck' } },
    
    // === ONE SYDNEY HARBOUR - New tall residential ===
    { x: -180, z: 50, w: 32, d: 32, h: 250, color: colors.teal, name: 'ONE SYDNEY HARBOUR', info: { height: '876 ft', year: 2022, floors: 71 } },
    
    // === CHIFLEY TOWER - Curved top ===
    { x: 140, z: 70, w: 38, d: 38, h: 220, color: colors.primary, name: 'CHIFLEY TOWER', chifley: true, info: { height: '787 ft', year: 1992, floors: 53 } },
    
    // === DEUTSCHE BANK PLACE ===
    { x: 200, z: 60, w: 36, d: 36, h: 200, color: colors.steel, name: 'DEUTSCHE BANK', info: { height: '673 ft', year: 2005, floors: 39 } },
    
    // === CITIGROUP CENTRE ===
    { x: 30, z: 65, w: 34, d: 34, h: 195, color: colors.purple, name: 'CITIGROUP', info: { height: '640 ft', year: 2000, floors: 50 } },
    
    // === GOVERNOR PHILLIP TOWER ===
    { x: -40, z: 75, w: 32, d: 32, h: 210, color: colors.highlight, name: 'GOVERNOR PHILLIP', info: { height: '640 ft', year: 1994, floors: 54 } },
    
    // === AURORA PLACE ===
    { x: -100, z: 60, w: 30, d: 30, h: 190, color: colors.secondary, name: 'AURORA PLACE', aurora: true, info: { height: '623 ft', year: 2000, floors: 41, note: 'Renzo Piano' } },
    
    // === GROSVENOR PLACE ===
    { x: 260, z: 75, w: 36, d: 36, h: 175, color: colors.orange, name: 'GROSVENOR', info: { height: '574 ft', year: 1988, floors: 44 } },
    
    // === MLC CENTRE ===
    { x: 320, z: 65, w: 34, d: 34, h: 215, color: colors.steel, name: 'MLC CENTRE', info: { height: '666 ft', year: 1978, floors: 60 } },
    
    // === WESTPAC PLACE ===
    { x: -140, z: 85, w: 30, d: 30, h: 165, color: colors.teal },
    
    // More CBD buildings
    { x: -220, z: 70, w: 28, d: 28, h: 145, color: colors.purple },
    { x: -280, z: 80, w: 26, d: 26, h: 130, color: colors.primary },
    { x: 380, z: 70, w: 30, d: 30, h: 140, color: colors.highlight },
    { x: 430, z: 85, w: 28, d: 28, h: 125, color: colors.orange },
    
    // Background buildings
    { x: -300, z: 150, w: 22, d: 22, h: 90, color: colors.steel },
    { x: -240, z: 160, w: 20, d: 20, h: 80, color: colors.purple },
    { x: -180, z: 155, w: 24, d: 24, h: 100, color: colors.primary },
    { x: -120, z: 165, w: 20, d: 20, h: 85, color: colors.teal },
    { x: -60, z: 150, w: 22, d: 22, h: 95, color: colors.highlight },
    { x: 0, z: 160, w: 20, d: 20, h: 75, color: colors.secondary },
    { x: 60, z: 155, w: 24, d: 24, h: 105, color: colors.orange },
    { x: 120, z: 165, w: 20, d: 20, h: 80, color: colors.steel },
    { x: 180, z: 150, w: 22, d: 22, h: 90, color: colors.purple },
    { x: 240, z: 160, w: 20, d: 20, h: 85, color: colors.primary },
    { x: 300, z: 155, w: 24, d: 24, h: 70, color: colors.teal },
    { x: 360, z: 165, w: 20, d: 20, h: 75, color: colors.highlight },
  ];

  // Render building wireframe
  const renderBuilding = (b, idx) => {
    const lines = [];
    const hw = b.w / 2;
    const hd = b.d / 2;
    const windowSpacing = 12;
    const fogOpacity = weather === 'fog' ? 0.5 : 1;

    // Sydney Tower - Needle with observation deck
    if (b.sydneyTower) {
      // Main shaft (narrow)
      const shaftW = 4;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const x = b.x + Math.cos(angle) * shaftW;
        const z = b.z + Math.sin(angle) * shaftW;
        const p1 = project(x, 0, z);
        const p2 = project(x, b.h * 0.7, z);
        lines.push({ ...p1, x2: p2.x, y2: p2.y, shaft: true });
      }
      
      // Observation deck (turret/pod)
      const deckY = b.h * 0.65;
      const deckH = 35;
      const deckR = 18;
      
      // Deck rings
      for (let ring = 0; ring < 6; ring++) {
        const ringY = deckY + (ring / 5) * deckH;
        const ringR = deckR * (1 - Math.abs(ring - 2.5) / 5);
        for (let i = 0; i < 12; i++) {
          const angle1 = (i / 12) * Math.PI * 2;
          const angle2 = ((i + 1) / 12) * Math.PI * 2;
          const p1 = project(b.x + Math.cos(angle1) * ringR, ringY, b.z + Math.sin(angle1) * ringR);
          const p2 = project(b.x + Math.cos(angle2) * ringR, ringY, b.z + Math.sin(angle2) * ringR);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, deck: true });
        }
      }
      
      // Vertical ribs on deck
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = b.x + Math.cos(angle) * deckR * 0.9;
        const z = b.z + Math.sin(angle) * deckR * 0.9;
        const p1 = project(x, deckY, z);
        const p2 = project(x, deckY + deckH, z);
        lines.push({ ...p1, x2: p2.x, y2: p2.y, deck: true });
      }
      
      // Spire above deck
      const spireBase = project(b.x, deckY + deckH, b.z);
      const spireTop = project(b.x, b.h, b.z);
      lines.push({ ...spireBase, x2: spireTop.x, y2: spireTop.y, spire: true });
      
      // Antenna at very top
      const antTop = project(b.x, b.h + 20, b.z);
      lines.push({ ...spireTop, x2: antTop.x, y2: antTop.y, thin: true });
    }
    // Chifley Tower - Curved crown
    else if (b.chifley) {
      const corners = [
        [b.x - hw, b.z - hd], [b.x + hw, b.z - hd],
        [b.x + hw, b.z + hd], [b.x - hw, b.z + hd]
      ];
      
      // Main shaft
      corners.forEach(([cx, cz]) => {
        const p1 = project(cx, 0, cz);
        const p2 = project(cx, b.h * 0.85, cz);
        lines.push({ ...p1, x2: p2.x, y2: p2.y });
      });
      
      // Floor lines
      for (let f = 0; f < 18; f++) {
        const y = (f / 18) * b.h * 0.85;
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const p1 = project(c1[0], y, c1[1]);
          const p2 = project(c2[0], y, c2[1]);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, floor: true });
        }
      }
      
      // Curved crown top
      const crownBase = b.h * 0.85;
      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        const y = crownBase + (b.h - crownBase) * Math.sin(t * Math.PI / 2);
        const scale = 1 - t * 0.4;
        for (let j = 0; j < 4; j++) {
          const c1 = corners[j], c2 = corners[(j + 1) % 4];
          const ox1 = b.x + (c1[0] - b.x) * scale;
          const oz1 = b.z + (c1[1] - b.z) * scale;
          const ox2 = b.x + (c2[0] - b.x) * scale;
          const oz2 = b.z + (c2[1] - b.z) * scale;
          const p1 = project(ox1, y, oz1);
          const p2 = project(ox2, y, oz2);
          lines.push({ ...p1, x2: p2.x, y2: p2.y, crown: true });
        }
      }
    }
    // Aurora Place - Glass fins
    else if (b.aurora) {
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
      
      // Glass fin on top
      const finBase = project(b.x, b.h, b.z - hd);
      const finTop = project(b.x, b.h + 25, b.z - hd);
      const finBack = project(b.x, b.h + 15, b.z);
      lines.push({ ...finBase, x2: finTop.x, y2: finTop.y, fin: true });
      lines.push({ ...finTop, x2: finBack.x, y2: finBack.y, fin: true });
      lines.push({ ...finBack, x2: finBase.x, y2: finBase.y, fin: true });
      
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

    return lines.map((l, i) => (
      <line
        key={`b${idx}-${i}`}
        x1={l.x} y1={l.y} x2={l.x2} y2={l.y2}
        stroke={b.color}
        strokeWidth={l.thin ? 0.5 : l.spire ? 1.5 : l.shaft ? 1.2 : l.deck ? 0.8 : l.crown ? 0.9 : l.fin ? 1.2 : l.floor ? 0.2 : 1}
        opacity={(l.floor ? 0.15 : l.deck ? 0.85 : 0.85) * fogOpacity}
        style={{ 
          filter: isNight && !lightning ? 
            `drop-shadow(0 0 ${l.deck || l.spire ? 4 : 2}px ${b.color})` : 'none' 
        }}
      />
    ));
  };

  // Sydney Opera House - THE ICONIC SAILS!
  const renderOperaHouse = () => {
    const elements = [];
    const ox = -280, oz = -100; // Position more forward and prominent
    const fogOpacity = weather === 'fog' ? 0.5 : 1;
    const scale = 1.4; // Make it bigger
    
    // Base platform
    const baseCorners = [
      [ox - 60 * scale, oz - 30 * scale], [ox + 80 * scale, oz - 30 * scale],
      [ox + 80 * scale, oz + 30 * scale], [ox - 60 * scale, oz + 30 * scale]
    ];
    
    for (let i = 0; i < 4; i++) {
      const c1 = baseCorners[i], c2 = baseCorners[(i + 1) % 4];
      const p1 = project(c1[0], 10, c1[1]);
      const p2 = project(c2[0], 10, c2[1]);
      elements.push(
        <line key={`opera-base-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.opera} strokeWidth="1.5" opacity={0.75 * fogOpacity} />
      );
    }
    
    // THE SAILS - Multiple shell structures
    const sails = [
      // Large concert hall sails (left group) - BIGGER
      { x: ox - 30 * scale, z: oz - 8 * scale, h: 85 * scale, w: 45 * scale, angle: 0.12 },
      { x: ox - 15 * scale, z: oz, h: 70 * scale, w: 38 * scale, angle: 0.18 },
      { x: ox, z: oz + 8 * scale, h: 55 * scale, w: 30 * scale, angle: 0.24 },
      
      // Joan Sutherland Theatre sails (right group)
      { x: ox + 40 * scale, z: oz - 8 * scale, h: 70 * scale, w: 38 * scale, angle: -0.08 },
      { x: ox + 52 * scale, z: oz, h: 55 * scale, w: 30 * scale, angle: -0.03 },
      { x: ox + 62 * scale, z: oz + 8 * scale, h: 42 * scale, w: 24 * scale, angle: 0.02 },
    ];
    
    sails.forEach((sail, si) => {
      // Each sail is made of curved ribs
      const numRibs = 10;
      
      for (let r = 0; r <= numRibs; r++) {
        const t = r / numRibs;
        const ribAngle = sail.angle + t * 0.5;
        const ribH = sail.h * (1 - t * 0.25);
        
        // Rib curve (parabolic shell shape)
        const numPoints = 14;
        let prevP = null;
        
        for (let p = 0; p <= numPoints; p++) {
          const pt = p / numPoints;
          // Shell curve - rises then curves over
          const localH = Math.sin(pt * Math.PI) * ribH;
          const localX = sail.x + (pt - 0.5) * sail.w * Math.cos(ribAngle);
          const localZ = sail.z + t * 18 + (pt - 0.5) * sail.w * Math.sin(ribAngle) * 0.3;
          
          const proj = project(localX, 10 + localH, localZ);
          
          if (prevP) {
            elements.push(
              <line key={`sail${si}-rib${r}-${p}`}
                x1={prevP.x} y1={prevP.y} x2={proj.x} y2={proj.y}
                stroke={colors.opera} strokeWidth={r === 0 || r === numRibs ? 1.8 : 0.9}
                opacity={(r === 0 || r === numRibs ? 0.95 : 0.55) * fogOpacity}
                style={isNight ? { filter: `drop-shadow(0 0 4px ${colors.opera})` } : {}} />
            );
          }
          prevP = proj;
        }
      }
      
      // Horizontal rings connecting ribs
      for (let h = 1; h < 6; h++) {
        const ringH = sail.h * (h / 6) * 0.85;
        let prevP = null;
        
        for (let r = 0; r <= numRibs; r++) {
          const t = r / numRibs;
          const ribAngle = sail.angle + t * 0.5;
          
          const pt = 0.5;
          const localX = sail.x + (pt - 0.5) * sail.w * Math.cos(ribAngle) * (1 - h/7);
          const localZ = sail.z + t * 18;
          
          const proj = project(localX, 10 + ringH, localZ);
          
          if (prevP && r > 0) {
            elements.push(
              <line key={`sail${si}-ring${h}-${r}`}
                x1={prevP.x} y1={prevP.y} x2={proj.x} y2={proj.y}
                stroke={colors.opera} strokeWidth="0.5" opacity={0.35 * fogOpacity} />
            );
          }
          prevP = proj;
        }
      }
    });
    
    // Label
    const labelP = project(ox + 15, 105 * scale, oz);
    elements.push(
      <text key="opera-label" x={labelP.x} y={labelP.y} fill={colors.opera} fontSize="7"
        textAnchor="middle" fontFamily="monospace" fontWeight="bold" 
        opacity={weather === 'fog' ? 0.4 : 0.9}
        style={isNight ? { filter: `drop-shadow(0 0 3px ${colors.opera})` } : {}}>
        OPERA HOUSE
      </text>
    );
    
    return elements;
  };

  // Sydney Harbour Bridge - The Coathanger! BIGGER & MORE PROMINENT
  const renderHarbourBridge = () => {
    const elements = [];
    const bx = 50, bz = -130; // Move forward and center
    const bridgeLength = 650;
    const archHeight = 160;
    const fogOpacity = weather === 'fog' ? 0.5 : 1;
    
    // Main arch - parabolic curve
    const numArchPoints = 50;
    let prevArchTop = null;
    let prevArchBottom = null;
    
    for (let i = 0; i <= numArchPoints; i++) {
      const t = i / numArchPoints;
      const x = bx - bridgeLength/2 + t * bridgeLength;
      
      // Parabolic arch shape
      const archY = archHeight * (1 - Math.pow((t - 0.5) * 2, 2));
      
      // Top and bottom of arch (it's a truss)
      const archThickness = 18;
      const topP = project(x, archY + archThickness, bz);
      const bottomP = project(x, archY, bz);
      
      if (prevArchTop) {
        // Top chord
        elements.push(
          <line key={`arch-top-${i}`}
            x1={prevArchTop.x} y1={prevArchTop.y} x2={topP.x} y2={topP.y}
            stroke={colors.bridge} strokeWidth="2.5" opacity={0.9 * fogOpacity}
            style={isNight ? { filter: `drop-shadow(0 0 2px ${colors.bridge})` } : {}} />
        );
        // Bottom chord
        elements.push(
          <line key={`arch-bottom-${i}`}
            x1={prevArchBottom.x} y1={prevArchBottom.y} x2={bottomP.x} y2={bottomP.y}
            stroke={colors.bridge} strokeWidth="2.2" opacity={0.85 * fogOpacity} />
        );
        // Vertical members
        if (i % 2 === 0) {
          elements.push(
            <line key={`arch-vert-${i}`}
              x1={topP.x} y1={topP.y} x2={bottomP.x} y2={bottomP.y}
              stroke={colors.bridge} strokeWidth="1" opacity={0.65 * fogOpacity} />
          );
        }
        // Diagonal cross-bracing
        if (i % 3 === 0 && i > 0 && i < numArchPoints) {
          elements.push(
            <line key={`arch-diag-${i}`}
              x1={prevArchTop.x} y1={prevArchTop.y} x2={bottomP.x} y2={bottomP.y}
              stroke={colors.bridge} strokeWidth="0.6" opacity={0.45 * fogOpacity} />,
            <line key={`arch-diag2-${i}`}
              x1={prevArchBottom.x} y1={prevArchBottom.y} x2={topP.x} y2={topP.y}
              stroke={colors.bridge} strokeWidth="0.6" opacity={0.45 * fogOpacity} />
          );
        }
      }
      
      prevArchTop = topP;
      prevArchBottom = bottomP;
    }
    
    // Road deck
    const deckY = 55;
    const deckP1 = project(bx - bridgeLength/2, deckY, bz - 12);
    const deckP2 = project(bx + bridgeLength/2, deckY, bz - 12);
    const deckP3 = project(bx - bridgeLength/2, deckY, bz + 12);
    const deckP4 = project(bx + bridgeLength/2, deckY, bz + 12);
    
    elements.push(
      <line key="deck-front" x1={deckP1.x} y1={deckP1.y} x2={deckP2.x} y2={deckP2.y}
        stroke={colors.bridge} strokeWidth="2" opacity={0.75 * fogOpacity} />,
      <line key="deck-back" x1={deckP3.x} y1={deckP3.y} x2={deckP4.x} y2={deckP4.y}
        stroke={colors.bridge} strokeWidth="1.5" opacity={0.55 * fogOpacity} />
    );
    
    // Suspender cables from arch to deck
    for (let i = 3; i < numArchPoints - 2; i += 2) {
      const t = i / numArchPoints;
      const x = bx - bridgeLength/2 + t * bridgeLength;
      const archY2 = archHeight * (1 - Math.pow((t - 0.5) * 2, 2));
      
      if (archY2 > deckY + 15) {
        const topP = project(x, archY2, bz);
        const bottomP = project(x, deckY, bz);
        elements.push(
          <line key={`suspender-${i}`}
            x1={topP.x} y1={topP.y} x2={bottomP.x} y2={bottomP.y}
            stroke={colors.steel} strokeWidth="0.6" opacity={0.5 * fogOpacity} />
        );
      }
    }
    
    // Pylons at each end - BIGGER
    const pylonPositions = [
      { x: bx - bridgeLength/2 + 30, h: 105 },
      { x: bx + bridgeLength/2 - 30, h: 105 }
    ];
    
    pylonPositions.forEach((pylon, pi) => {
      const pw = 22;
      const pd = 18;
      const corners = [
        [pylon.x - pw/2, bz - pd/2], [pylon.x + pw/2, bz - pd/2],
        [pylon.x + pw/2, bz + pd/2], [pylon.x - pw/2, bz + pd/2]
      ];
      
      // Tapered pylons (narrower at top)
      const topScale = 0.7;
      corners.forEach(([cx, cz], ci) => {
        const tx = pylon.x + (cx - pylon.x) * topScale;
        const tz = bz + (cz - bz) * topScale;
        const p1 = project(cx, 0, cz);
        const p2 = project(tx, pylon.h, tz);
        elements.push(
          <line key={`pylon${pi}-v-${ci}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={colors.bridge} strokeWidth="2" opacity={0.85 * fogOpacity} />
        );
      });
      
      // Pylon horizontal bands
      for (let band = 0; band < 4; band++) {
        const bandY = (band / 3) * pylon.h;
        const bandScale = 1 - (band / 4) * (1 - topScale);
        for (let i = 0; i < 4; i++) {
          const c1 = corners[i], c2 = corners[(i + 1) % 4];
          const ox1 = pylon.x + (c1[0] - pylon.x) * bandScale;
          const oz1 = bz + (c1[1] - bz) * bandScale;
          const ox2 = pylon.x + (c2[0] - pylon.x) * bandScale;
          const oz2 = bz + (c2[1] - bz) * bandScale;
          const p1 = project(ox1, bandY, oz1);
          const p2 = project(ox2, bandY, oz2);
          elements.push(
            <line key={`pylon${pi}-band${band}-${i}`}
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={colors.bridge} strokeWidth="1.2" opacity={0.65 * fogOpacity} />
          );
        }
      }
    });
    
    // Label
    const labelP = project(bx, archHeight + 30, bz);
    elements.push(
      <text key="bridge-label" x={labelP.x} y={labelP.y} fill={colors.bridge} fontSize="8"
        textAnchor="middle" fontFamily="monospace" fontWeight="bold"
        opacity={weather === 'fog' ? 0.4 : 0.85}>
        HARBOUR BRIDGE
      </text>
    );
    
    return elements;
  };

  // Sydney Harbour
  const renderHarbour = () => {
    const elements = [];
    const storminess = weather === 'storm' ? 2 : weather === 'rain' ? 1.3 : 1;
    
    // Water grid - extended forward
    for (let x = -450; x <= 500; x += 40) {
      const p1 = project(x, 0, -250);
      const p2 = project(x, 0, -50);
      elements.push(
        <line key={`wg-${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth="0.3" opacity="0.18" />
      );
    }
    
    for (let z = -250; z <= -50; z += 18) {
      const wave = Math.sin(time * 1.3 * storminess + z * 0.08) * 1.5 * storminess;
      const p1 = project(-450, wave, z);
      const p2 = project(500, wave, z);
      elements.push(
        <line key={`wz-${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={colors.water} strokeWidth={0.4 * storminess} opacity={0.12 + (z + 250) / 600} />
      );
    }
    
    // Reflections at night
    if (isNight && weather === 'clear') {
      const reflectionColors = [
        colors.primary, colors.accent, colors.secondary, colors.teal,
        colors.highlight, colors.purple, colors.orange, colors.opera
      ];
      
      for (let i = 0; i < 50; i++) {
        const x = -420 + i * 19;
        const color = reflectionColors[i % reflectionColors.length];
        const flicker = 0.2 + Math.sin(time * 2.2 + i * 0.5) * 0.15;
        
        for (let j = 0; j < 5; j++) {
          const z = -230 + j * 28;
          const wave = Math.sin(time * 1.5 + i * 0.35 + j * 0.25) * 2;
          const p = project(x + Math.sin(time * 0.7 + i) * 2, wave - 1, z);
          elements.push(
            <ellipse key={`ref-${i}-${j}`} cx={p.x} cy={p.y} rx={4.5 + j * 0.5} ry={1}
              fill={color} opacity={flicker * (1 - j * 0.12)}
              style={{ filter: 'blur(0.5px)' }} />
          );
        }
      }
    }
    
    // Sailboats! - repositioned
    if (weather !== 'storm') {
      sailboats.forEach((boat, i) => {
        const bx = boat.x + Math.sin(time * boat.speed + boat.phase) * 15;
        const bz = -220 + (i % 4) * 40; // Spread across harbour
        const bobY = Math.sin(time * 1.2 + boat.phase) * 1;
        const size = boat.size;
        
        // Hull
        const h1 = project(bx - 8 * size, bobY, bz);
        const h2 = project(bx + 8 * size, bobY, bz);
        elements.push(
          <line key={`boat${i}-hull`} x1={h1.x} y1={h1.y} x2={h2.x} y2={h2.y}
            stroke={colors.white} strokeWidth="0.8" opacity="0.6" />
        );
        
        // Mast
        const mastBase = project(bx, bobY, bz);
        const mastTop = project(bx, bobY + 18 * size, bz);
        elements.push(
          <line key={`boat${i}-mast`} x1={mastBase.x} y1={mastBase.y} x2={mastTop.x} y2={mastTop.y}
            stroke={colors.steel} strokeWidth="0.5" opacity="0.5" />
        );
        
        // Sail (triangle)
        const tilt = Math.sin(time * 0.5 + boat.phase) * 3 * windSpeed;
        const sailTop = project(bx + tilt, bobY + 16 * size, bz);
        const sailBack = project(bx + 6 * size + tilt * 0.5, bobY + 2 * size, bz);
        elements.push(
          <line key={`boat${i}-sail1`} x1={mastBase.x} y1={mastBase.y} x2={sailTop.x} y2={sailTop.y}
            stroke={colors.white} strokeWidth="0.6" opacity="0.7" />,
          <line key={`boat${i}-sail2`} x1={sailTop.x} y1={sailTop.y} x2={sailBack.x} y2={sailBack.y}
            stroke={colors.white} strokeWidth="0.6" opacity="0.7" />,
          <line key={`boat${i}-sail3`} x1={sailBack.x} y1={sailBack.y} x2={mastBase.x} y2={mastBase.y}
            stroke={colors.white} strokeWidth="0.6" opacity="0.7" />
        );
      });
    }
    
    // Ferries - repositioned
    const ferries = [
      { x: -100, z: -200 },
      { x: 200, z: -180 },
      { x: 400, z: -210 },
    ];
    
    ferries.forEach((ferry, i) => {
      const fx = ferry.x + Math.sin(time * 0.35 + i * 2) * 20;
      const bobY = Math.sin(time * 1.4 + i) * 0.6;
      
      const f1 = project(fx - 15, bobY, ferry.z);
      const f2 = project(fx + 15, bobY, ferry.z);
      const f3 = project(fx, bobY + 8, ferry.z);
      
      elements.push(
        <line key={`ferry${i}-hull`} x1={f1.x} y1={f1.y} x2={f2.x} y2={f2.y}
          stroke={colors.highlight} strokeWidth="1.2" opacity="0.6" />,
        <line key={`ferry${i}-cabin`} x1={f1.x} y1={f1.y} x2={f3.x} y2={f3.y}
          stroke={colors.highlight} strokeWidth="0.8" opacity="0.5" />,
        <line key={`ferry${i}-cabin2`} x1={f2.x} y1={f2.y} x2={f3.x} y2={f3.y}
          stroke={colors.highlight} strokeWidth="0.8" opacity="0.5" />
      );
    });
    
    return elements;
  };

  // Ground grid
  const renderGrid = () => {
    const lines = [];
    const fogOpacity = weather === 'fog' ? 0.08 : 0.18;
    
    for (let x = -450; x <= 480; x += 50) {
      const p1 = project(x, 0, -30);
      const p2 = project(x, 0, 200);
      lines.push(<line key={`gx${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.35" opacity={fogOpacity} />);
    }
    for (let z = -30; z <= 200; z += 50) {
      const p1 = project(-450, 0, z);
      const p2 = project(480, 0, z);
      lines.push(<line key={`gz${z}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.grid} strokeWidth="0.35" opacity={fogOpacity} />);
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
              stroke={colors.primary} strokeWidth={0.6 * intensity} opacity={0.28 * intensity} />
          );
        })}
      </g>
    );
  };

  const renderClouds = () => {
    if (weather === 'clear' && timeOfDay > 0.3 && timeOfDay < 0.7) return null;
    const cloudOpacity = weather === 'storm' ? 0.55 : weather === 'fog' ? 0.4 : 0.3;
    const cloudColor = weather === 'storm' ? '#1a1a25' : '#7788aa';
    
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
          <rect key={`fog-${i}`} x={-50 + Math.sin(time * 0.25 + i) * 18} y={230 + i * 45}
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
          <circle cx="800" cy="55" r="14" fill="none" stroke={colors.accent} strokeWidth="0.6" opacity="0.35" />
          <circle cx="800" cy="55" r="11" fill={colors.accent} opacity="0.06" />
        </g>
      );
    } else if (timeOfDay < 0.3 || timeOfDay > 0.6) {
      const sunY = timeOfDay < 0.3 ? 75 - timeOfDay * 150 : 75 - (1 - timeOfDay) * 115;
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
    const windAngle = Math.PI * 0.25;
    const arrowLen = 15 + windSpeed * 25;
    return (
      <g transform="translate(45, 70)">
        <circle cx="0" cy="0" r="19" fill="rgba(0,0,0,0.28)" stroke={colors.primary} strokeWidth="0.6" />
        <text x="0" y="-24" fill={colors.primary} fontSize="6" textAnchor="middle">WIND</text>
        <line x1={-Math.cos(windAngle) * 3} y1={-Math.sin(windAngle) * 3}
          x2={Math.cos(windAngle) * arrowLen} y2={Math.sin(windAngle) * arrowLen}
          stroke={colors.accent} strokeWidth="1.4" markerEnd="url(#arrow)" />
        <text x="0" y="32" fill={colors.accent} fontSize="6" textAnchor="middle">{Math.round(windSpeed * 30)} km/h</text>
      </g>
    );
  };

  const getBuildingDepth = (b) => project(b.x, b.h / 2, b.z).z;
  const weatherIcons = { clear: '☀️', rain: '🌧️', storm: '⛈️', fog: '🌫️' };

  return (
    <div style={{
      background: `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 26%, ${colors.sky3} 52%, ${colors.sky4} 100%)`,
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
            SYDNEY
          </div>
          <div style={{ color: colors.highlight, fontSize: '8px', letterSpacing: '3px' }}>
            SGI IRIS 1400 • HARBOUR VIEW
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
            background: lightning ? '#2a3540' : `linear-gradient(180deg, ${colors.sky1} 0%, ${colors.sky2} 22%, ${colors.sky3} 48%, ${colors.sky4} 72%, ${colors.water}20 100%)`,
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
              <stop offset="50%" stopColor="#8899aa" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#8899aa" stopOpacity="0"/>
            </linearGradient>
            <marker id="arrow" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill={colors.accent} />
            </marker>
          </defs>

          {/* Stars */}
          {isNight && weather === 'clear' && [...Array(80)].map((_, i) => (
            <circle key={`star${i}`}
              cx={(Math.sin(i * 127.1) * 0.5 + 0.5) * 900}
              cy={(Math.cos(i * 311.7) * 0.5 + 0.5) * 120}
              r={0.35 + Math.random() * 0.35}
              fill="#fff"
              opacity={0.08 + Math.sin(time * 1.4 + i) * 0.06} />
          ))}

          {renderClouds()}
          {renderCelestial()}
          {renderHarbour()}
          {renderGrid()}
          {renderHarbourBridge()}
          {renderOperaHouse()}

          {/* Buildings */}
          {buildings
            .map((b, i) => ({ ...b, idx: i, depth: getBuildingDepth(b) }))
            .sort((a, b) => b.depth - a.depth)
            .map(b => renderBuilding(b, b.idx))}

          {/* Labels */}
          {showInfo && weather !== 'storm' && buildings.filter(b => b.name).map((b, i) => {
            const labelY = b.h + (b.sydneyTower ? 30 : 15);
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
            ★ SYDNEY HARBOUR ★
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
        
        <button onClick={() => setCamera({ rotationY: 0.15, rotationX: 0.18, zoom: 1, panX: 0, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.secondary}`, color: colors.secondary,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>↺ RESET</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.65, zoom: 0.55 }))} style={{
          background: 'transparent', border: `1px solid ${colors.purple}`, color: colors.purple,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>⬆ AERIAL</button>
        
        <button onClick={() => setCamera(c => ({ ...c, rotationX: 0.05, zoom: 1.4 }))} style={{
          background: 'transparent', border: `1px solid ${colors.orange}`, color: colors.orange,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>👁 HARBOUR</button>
        
        <button onClick={() => setCamera({ rotationY: -0.3, rotationX: 0.15, zoom: 1.4, panX: -120, panY: 20 })} style={{
          background: 'transparent', border: `1px solid ${colors.opera}`, color: colors.opera,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🎭 OPERA</button>
        
        <button onClick={() => setCamera({ rotationY: 0.4, rotationX: 0.12, zoom: 1.2, panX: 0, panY: 30 })} style={{
          background: 'transparent', border: `1px solid ${colors.bridge}`, color: colors.bridge,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🌉 BRIDGE</button>
        
        <button onClick={() => setCamera({ rotationY: 0.1, rotationX: 0.2, zoom: 1.3, panX: 50, panY: 0 })} style={{
          background: 'transparent', border: `1px solid ${colors.accent}`, color: colors.accent,
          padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '7px'
        }}>🗼 TOWER</button>
      </div>

      <div style={{ marginTop: '4px', color: colors.highlight, fontSize: '6px', textAlign: 'center', opacity: 0.45 }}>
        DRAG: Rotate | SHIFT+DRAG: Pan | SCROLL: Zoom
      </div>

      <div style={{ display: 'flex', marginTop: '4px', gap: '2px' }}>
        {[colors.primary, colors.secondary, colors.accent, colors.highlight, colors.purple, colors.orange, colors.teal, colors.opera].map((c, i) => (
          <div key={i} style={{ width: '18px', height: '3px', background: c, boxShadow: isNight ? `0 0 4px ${c}` : 'none' }}/>
        ))}
      </div>
    </div>
  );
}
