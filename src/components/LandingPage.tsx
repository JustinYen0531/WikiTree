import React, { useEffect, useRef, useState } from 'react';

interface LandingPageProps {
  onLoginClick: () => void;
  onGuestClick: () => void;
}

// 3D 點定義
interface Point3D {
  id: number;
  x: number;
  y: number;
  z: number;
  tx: number; // 旋轉後 x
  ty: number; // 旋轉後 y
  tz: number; // 旋轉後 z
  type: 'land' | 'tree_trunk' | 'tree_branch' | 'tree_leaf' | 'star';
  continentId: number; // 屬於哪個大陸板塊 (0-4), star 為 -1
}

// 連線定義
interface Connection {
  p1: number; // 點 1 的 ID
  p2: number; // 點 2 的 ID
  type: 'land-grid' | 'tree';
  continentId: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onGuestClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 狀態追蹤：初始 zoom 為 2.5X，呈現巨大的地平線視角
  const [zoom, setZoom] = useState<number>(2.5);
  const [activeContinents, setActiveContinents] = useState<boolean[]>([true, false, true, false, false]);
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // 用於 Canvas 繪圖循環的 mutable references
  const stateRef = useRef({
    zoom: 2.5,
    rx: 0.32, // 繞 X 軸旋轉
    ry: 0.8,  // 繞 Y 軸旋轉
    isDragging: false,
    startX: 0,
    startY: 0,
    activeContinents: [true, false, true, false, false],
    lastTime: Date.now(),
    pulseProgress: 0,
  });

  // 更新 ref 狀態，確保 Canvas 渲染循環能即時拿到 React 狀態
  useEffect(() => {
    stateRef.current.zoom = zoom;
  }, [zoom]);

  useEffect(() => {
    stateRef.current.activeContinents = activeContinents;
  }, [activeContinents]);

  // 動態時間更新
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const date = pad(now.getDate());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());
      setCurrentTime(`${year}/${month}/${date} ${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3D 場景數據初始化與渲染
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // 處理高 DPI 螢幕
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 1. 初始化 3D 點與連線
    const R = 180; // 球體基本半徑
    const points: Point3D[] = [];
    const connections: Connection[] = [];
    let pointIdCounter = 0;

    // 定義 5 個板塊中心 (經度 phi, 緯度 theta)，分別對應政大學院
    const continentsData = [
      { id: 0, lat: 0.45, lon: 1.2, nameZh: '商學院', nameEn: 'COMMERCE' },
      { id: 1, lat: 0.1, lon: -0.2, nameZh: '社科院', nameEn: 'SOCIAL SCI' },
      { id: 2, lat: -0.15, lon: -1.75, nameZh: '文學院', nameEn: 'LIBERAL ARTS' },
      { id: 3, lat: -0.4, lon: 2.15, nameZh: '傳播學院', nameEn: 'COMMUNICATION' },
      { id: 4, lat: -1.1, lon: 0.1, nameZh: '理與資訊', nameEn: 'SCIENCE & IT' }
    ];

    // 生成陸地表面點與密集樹木
    continentsData.forEach((continent) => {
      // 大幅增加陸地表面點數量以支撐更密集的森林 (130-160 個點)
      const numPoints = 130 + Math.floor(Math.random() * 30);
      const landPoints: Point3D[] = [];

      for (let i = 0; i < numPoints; i++) {
        const dLat = (Math.random() + Math.random() + Math.random() - 1.5) * 0.38;
        const dLon = (Math.random() + Math.random() + Math.random() - 1.5) * 0.48;
        
        const theta = continent.lat + dLat;
        const phi = continent.lon + dLon;

        const x = R * Math.cos(theta) * Math.sin(phi);
        const y = R * Math.sin(theta);
        const z = R * Math.cos(theta) * Math.cos(phi);

        const pt: Point3D = {
          id: pointIdCounter++,
          x, y, z,
          tx: x, ty: y, tz: z,
          type: 'land',
          continentId: continent.id
        };
        points.push(pt);
        landPoints.push(pt);
      }

      // 大陸內部的點進行距離檢測連線，臨界值設為 26 以防點增多時連線過於雜亂，保持精緻幾何感
      for (let i = 0; i < landPoints.length; i++) {
        for (let j = i + 1; j < landPoints.length; j++) {
          const p1 = landPoints[i];
          const p2 = landPoints[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
          if (dist < 26) {
            connections.push({
              p1: p1.id,
              p2: p2.id,
              type: 'land-grid',
              continentId: continent.id
            });
          }
        }
      }

      // 顯著增加樹木數量：每個板塊種植 16 - 22 棵節點樹，地平線會排滿茂密的樹木森林！
      const numTrees = 16 + Math.floor(Math.random() * 7);
      for (let t = 0; t < numTrees; t++) {
        const rootPt = landPoints[Math.floor(Math.random() * landPoints.length)];
        
        const nx = rootPt.x / R;
        const ny = rootPt.y / R;
        const nz = rootPt.z / R;

        const treeHeight = 20 + Math.random() * 12;

        // 樹幹頂點
        const tx = rootPt.x + nx * treeHeight;
        const ty = rootPt.y + ny * treeHeight;
        const tz = rootPt.z + nz * treeHeight;

        const trunkPt: Point3D = {
          id: pointIdCounter++,
          x: tx, y: ty, z: tz,
          tx, ty, tz,
          type: 'tree_trunk',
          continentId: continent.id
        };
        points.push(trunkPt);
        connections.push({
          p1: rootPt.id,
          p2: trunkPt.id,
          type: 'tree',
          continentId: continent.id
        });

        // 局部垂直坐標軸，用於樹枝偏轉
        let ux = -ny;
        let uy = nx;
        let uz = 0;
        const uLen = Math.hypot(ux, uy, uz);
        if (uLen < 0.001) {
          ux = 1; uy = 0; uz = 0;
        } else {
          ux /= uLen; uy /= uLen;
        }
        const vx = ny * uz - nz * uy;
        const vy = nz * ux - nx * uz;
        const vz = nx * uy - ny * ux;

        // 生成 3 根主樹枝
        const numBranches = 3;
        for (let b = 0; b < numBranches; b++) {
          const angle = (b * Math.PI * 2) / numBranches + (Math.random() - 0.5) * 0.4;
          const branchSpread = 0.45;
          const branchLength = treeHeight * 0.65;

          const bx_dir = nx + (ux * Math.cos(angle) + vx * Math.sin(angle)) * branchSpread;
          const by_dir = ny + (uy * Math.cos(angle) + vy * Math.sin(angle)) * branchSpread;
          const bz_dir = nz + (uz * Math.cos(angle) + vz * Math.sin(angle)) * branchSpread;
          const bDirLen = Math.hypot(bx_dir, by_dir, bz_dir);
          
          const bx = trunkPt.x + (bx_dir / bDirLen) * branchLength;
          const by = trunkPt.y + (by_dir / bDirLen) * branchLength;
          const bz = trunkPt.z + (bz_dir / bDirLen) * branchLength;

          const branchPt: Point3D = {
            id: pointIdCounter++,
            x: bx, y: by, z: bz,
            tx: bx, ty: by, tz: bz,
            type: 'tree_branch',
            continentId: continent.id
          };
          points.push(branchPt);
          connections.push({
            p1: trunkPt.id,
            p2: branchPt.id,
            type: 'tree',
            continentId: continent.id
          });

          // 每根主樹枝發射 2 個葉子節點
          const numLeaves = 2;
          for (let l = 0; l < numLeaves; l++) {
            const leafAngle = angle + (l === 0 ? -0.4 : 0.4) + (Math.random() - 0.5) * 0.2;
            const leafSpread = 0.6;
            const leafLength = treeHeight * 0.45;

            const lx_dir = bx_dir + (ux * Math.cos(leafAngle) + vx * Math.sin(leafAngle)) * leafSpread;
            const ly_dir = by_dir + (uy * Math.cos(leafAngle) + vy * Math.sin(leafAngle)) * leafSpread;
            const lz_dir = bz_dir + (uz * Math.cos(leafAngle) + vz * Math.sin(leafAngle)) * leafSpread;
            const lDirLen = Math.hypot(lx_dir, ly_dir, lz_dir);

            const lx = bx + (lx_dir / lDirLen) * leafLength;
            const ly = by + (ly_dir / lDirLen) * leafLength;
            const lz = bz + (lz_dir / lDirLen) * leafLength;

            const leafPt: Point3D = {
              id: pointIdCounter++,
              x: lx, y: ly, z: lz,
              tx: lx, ty: ly, tz: lz,
              type: 'tree_leaf',
              continentId: continent.id
            };
            points.push(leafPt);
            connections.push({
              p1: branchPt.id,
              p2: leafPt.id,
              type: 'tree',
              continentId: continent.id
            });
          }
        }
      }
    });

    // 生成背景星塵
    const stars: Point3D[] = [];
    for (let i = 0; i < 200; i++) {
      const theta = (Math.random() - 0.5) * Math.PI;
      const phi = Math.random() * Math.PI * 2;
      const starR = 500 + Math.random() * 400;
      const x = starR * Math.cos(theta) * Math.sin(phi);
      const y = starR * Math.sin(theta);
      const z = starR * Math.cos(theta) * Math.cos(phi);
      stars.push({
        id: -1 - i,
        x, y, z,
        tx: x, ty: y, tz: z,
        type: 'star',
        continentId: -1
      });
    }

    // 2. 渲染繪圖循環
    const render = () => {
      const state = stateRef.current;
      
      // 自動緩慢旋轉 (當沒有拖曳時)
      if (!state.isDragging) {
        state.ry += 0.0006;
        state.rx = 0.28 + Math.sin(Date.now() * 0.00008) * 0.04;
      }

      state.pulseProgress = (state.pulseProgress + 0.03) % (Math.PI * 2);

      // 清除 Canvas 為純黑背景
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const D = 600; // 視距

      // 動態計算地球中心 centerY：當 zoom 變大時，地球向下移動，在畫面下方形成地平線邊緣
      let centerY = height / 2;
      if (state.zoom > 1.0) {
        const t = Math.min(1.0, (state.zoom - 1.0) / 3.0); // zoom 介於 1.0X 到 4.0X 間過渡
        centerY = (height / 2) * (1.0 - t) + (height * 0.96) * t;
      }

      // A. 投影計算背景星塵
      stars.forEach((star) => {
        const slowRy = state.ry * 0.03;
        const x1 = star.x * Math.cos(slowRy) - star.z * Math.sin(slowRy);
        const z1 = star.x * Math.sin(slowRy) + star.z * Math.cos(slowRy);
        
        const scale = D / (D + z1);
        const sx = centerX + x1 * scale;
        const sy = (height / 2) + star.y * scale;

        if (sx >= 0 && sx <= width && sy >= 0 && sy <= height && z1 < 300) {
          const brightness = 0.12 + (Math.sin(Date.now() * 0.0015 + star.x) * 0.08);
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
          ctx.fillRect(sx, sy, 1.2, 1.2);
        }
      });

      // B. 旋轉並投影地球上所有的 3D 點
      points.forEach((p) => {
        const cosY = Math.cos(state.ry);
        const sinY = Math.sin(state.ry);
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;

        const cosX = Math.cos(state.rx);
        const sinX = Math.sin(state.rx);
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        p.tx = x1;
        p.ty = y2;
        p.tz = z2;
      });

      // 篩選出前半球 (向光面) 與後半球
      const getOpacity = (tz: number) => {
        const fadeStart = -100;
        const fadeEnd = 140;
        if (tz < fadeStart) return 1.0;
        if (tz > fadeEnd) return 0.0;
        return 1.0 - (tz - fadeStart) / (fadeEnd - fadeStart);
      };

      // C. 繪製連接線 (Connections)
      connections.forEach((conn) => {
        const p1 = points[conn.p1];
        const p2 = points[conn.p2];

        const avgTz = (p1.tz + p2.tz) / 2;
        const opacity = getOpacity(avgTz);

        if (opacity <= 0.01) return;

        const scale1 = D / (D + p1.tz);
        const scale2 = D / (D + p2.tz);

        const x1_scr = centerX + p1.tx * scale1 * state.zoom;
        const y1_scr = centerY + p1.ty * scale1 * state.zoom;
        const x2_scr = centerX + p2.tx * scale2 * state.zoom;
        const y2_scr = centerY + p2.ty * scale2 * state.zoom;

        const isContinentActive = state.activeContinents[conn.continentId];
        const zoomWidthScale = Math.max(1.0, Math.sqrt(state.zoom));

        if (conn.type === 'tree') {
          if (isContinentActive) {
            const pulse = 0.75 + Math.sin(Date.now() * 0.006 + conn.p1) * 0.25;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.85 * pulse})`;
            ctx.lineWidth = 1.0 * zoomWidthScale;
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.18})`;
            ctx.lineWidth = 0.6 * zoomWidthScale;
          }
        } else {
          if (isContinentActive) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.38})`;
            ctx.lineWidth = 0.55 * zoomWidthScale;
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.09})`;
            ctx.lineWidth = 0.4 * zoomWidthScale;
          }
        }
        ctx.stroke();
      });

      // D. 繪製節點 (Nodes)
      points.forEach((p) => {
        const opacity = getOpacity(p.tz);
        if (opacity <= 0.01) return;

        const scale = D / (D + p.tz);
        const px = centerX + p.tx * scale * state.zoom;
        const py = centerY + p.ty * scale * state.zoom;

        const isContinentActive = state.activeContinents[p.continentId];
        const zoomDotScale = Math.max(1.0, Math.sqrt(state.zoom) * 0.85);

        if (p.type === 'tree_leaf') {
          const radius = isContinentActive ? (2.2 + Math.sin(Date.now() * 0.005 + p.id) * 0.8) : 1.2;
          ctx.beginPath();
          ctx.arc(px, py, radius * state.zoom * 0.6, 0, Math.PI * 2);
          
          if (isContinentActive) {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 6 * zoomDotScale;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.35})`;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (p.type === 'tree_trunk' || p.type === 'tree_branch') {
          ctx.beginPath();
          ctx.arc(px, py, (isContinentActive ? 1.0 : 0.6) * state.zoom * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * (isContinentActive ? 0.6 : 0.2)})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, (isContinentActive ? 0.8 : 0.5) * state.zoom * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * (isContinentActive ? 0.4 : 0.12)})`;
          ctx.fill();
        }
      });

      // E. 行星大氣層發光圓環
      ctx.beginPath();
      const radius = R * state.zoom;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.93,
        centerX, centerY, radius * 1.05
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.04)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fill();

      // F. 繪製 3D 學院資訊標籤 (Leader Lines & 3D Labels)
      continentsData.forEach((continent) => {
        // 計算學院板塊中心在當前旋轉下的 3D 坐標
        const cosY = Math.cos(state.ry);
        const sinY = Math.sin(state.ry);
        const cosX = Math.cos(state.rx);
        const sinX = Math.sin(state.rx);

        // 學院中心原本 3D 位置
        const cx_orig = R * Math.cos(continent.lat) * Math.sin(continent.lon);
        const cy_orig = R * Math.sin(continent.lat);
        const cz_orig = R * Math.cos(continent.lat) * Math.cos(continent.lon);

        // 旋轉計算
        const cx_1 = cx_orig * cosY - cz_orig * sinY;
        const cz_1 = cx_orig * sinY + cz_orig * cosY;
        const cy_2 = cy_orig * cosX - cz_1 * sinX;
        const cz_2 = cy_orig * sinX + cz_1 * cosX;

        // 只在前半球 (相機可視範圍) 繪製，避免背面標籤穿透
        const opacity = getOpacity(cz_2);
        if (opacity <= 0.1) return;

        const scale = D / (D + cz_2);
        const scrX = centerX + cx_1 * scale * state.zoom;
        const scrY = centerY + cy_2 * scale * state.zoom;

        const isContinentActive = state.activeContinents[continent.id];
        const labelOpacity = isContinentActive ? opacity * 0.9 : opacity * 0.35;

        // 引導線繪製：決定引導線折線朝左或朝右延伸 (依投影後在畫面左右半邊而定，平衡排版)
        const dirX = cx_1 > 0 ? -1 : 1; 

        ctx.beginPath();
        ctx.moveTo(scrX, scrY);
        // 拉出一條向上的精美科技斜引線
        ctx.lineTo(scrX + 15 * dirX, scrY - 15);
        ctx.lineTo(scrX + 70 * dirX, scrY - 15);
        ctx.strokeStyle = isContinentActive 
          ? `rgba(255, 255, 255, ${labelOpacity})`
          : `rgba(255, 255, 255, ${opacity * 0.15})`;
        ctx.lineWidth = isContinentActive ? 1.0 : 0.6;
        ctx.stroke();

        // 標籤文字繪製 (使用與 CSS 同步的 Roboto Mono + Monospace 中英混合排版)
        ctx.textAlign = dirX > 0 ? 'left' : 'right';
        const textOffset = dirX > 0 ? 20 : -20;

        // 第一行：學院中文名稱
        ctx.fillStyle = `rgba(255, 255, 255, ${isContinentActive ? opacity * 0.95 : opacity * 0.4})`;
        ctx.font = `500 11px "Roboto Mono", "PingFang TC", "Microsoft JhengHei", sans-serif`;
        ctx.fillText(continent.nameZh, scrX + textOffset, scrY - 20);

        // 第二行：英文學院簡寫
        ctx.fillStyle = `rgba(255, 255, 255, ${isContinentActive ? opacity * 0.6 : opacity * 0.22})`;
        ctx.font = `400 8px "Roboto Mono", monospace`;
        ctx.fillText(continent.nameEn, scrX + textOffset, scrY - 7);
      });

      // 呼叫下一幀
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // 3. 滑鼠與手勢互動處理
    const handleMouseDown = (e: MouseEvent) => {
      const state = stateRef.current;
      state.isDragging = true;
      state.startX = e.clientX;
      state.startY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = stateRef.current;
      if (!state.isDragging) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      const dragSensitivity = state.zoom > 2.0 ? 0.002 : 0.004;
      state.ry += dx * dragSensitivity;
      state.rx += dy * dragSensitivity;

      state.rx = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, state.rx));

      state.startX = e.clientX;
      state.startY = e.clientY;
    };

    const handleMouseUp = () => {
      stateRef.current.isDragging = false;
    };

    // 處理滾輪無級縮放
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((prev) => {
        const next = prev - e.deltaY * 0.0016;
        return Math.max(0.6, Math.min(8.0, next));
      });
    };

    // 處理點擊 Toggle 板塊
    const handleClick = (e: MouseEvent) => {
      const state = stateRef.current;
      
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const centerX = width / 2;
      const D = 600;

      let centerY = height / 2;
      if (state.zoom > 1.0) {
        const t = Math.min(1.0, (state.zoom - 1.0) / 3.0);
        centerY = (height / 2) * (1.0 - t) + (height * 0.96) * t;
      }

      let closestPt: Point3D | null = null;
      let minDist = Infinity;

      points.forEach((p) => {
        if (p.type !== 'land' || p.tz > 0) return;
        
        const scale = D / (D + p.tz);
        const px = centerX + p.tx * scale * state.zoom;
        const py = centerY + p.ty * scale * state.zoom;

        const dist = Math.hypot(mx - px, my - py);
        if (dist < minDist) {
          minDist = dist;
          closestPt = p;
        }
      });

      const clickTolerance = 18 * state.zoom;
      if (closestPt && minDist < Math.max(18, Math.min(45, clickTolerance))) {
        const cId = (closestPt as Point3D).continentId;
        setActiveContinents((prev) => {
          const next = [...prev];
          next[cId] = !next[cId];
          return next;
        });
      }
    };

    // 綁定事件
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('click', handleClick);

    // 清理資源
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="landing-page-root" style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      overflow: 'hidden',
      userSelect: 'none',
      fontFamily: '"Roboto Mono", "Courier New", monospace'
    }}>
      {/* 載入 Google 字體與科技 HUD 的局部 CSS 樣式 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@200;300;400;500;700&display=swap');
        
        .hud-text {
          font-family: 'Roboto Mono', monospace;
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .hud-interactive {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .hud-interactive:hover {
          color: #ffffff !important;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
        }

        .btn-sci-fi {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.6);
          padding: 12px 40px;
          font-family: 'Roboto Mono', monospace;
          font-size: 14px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          position: relative;
          cursor: pointer;
        }

        .btn-sci-fi::before, .btn-sci-fi::after {
          content: '';
          position: absolute;
          width: 4px;
          height: 4px;
          border: 1px solid #ffffff;
          transition: all 0.3s ease;
          opacity: 0;
        }

        .btn-sci-fi::before {
          top: -2px; left: -2px;
          border-right: none; border-bottom: none;
        }

        .btn-sci-fi::after {
          bottom: -2px; right: -2px;
          border-left: none; border-top: none;
        }

        .btn-sci-fi:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
        }

        .btn-sci-fi:hover::before, .btn-sci-fi:hover::after {
          opacity: 1;
        }

        .btn-link-sci-fi {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-family: 'Roboto Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-link-sci-fi:hover {
          color: #ffffff;
          letter-spacing: 0.18em;
          text-shadow: 0 0 6px rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* 3D 渲染的背景 Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          display: 'block'
        }}
      />

      {/* HUD 覆蓋層 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px',
        boxSizing: 'border-box'
      }}>
        
        {/* 上方 HUD */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'auto'
        }}>
          {/* 左上角 NCCU 標誌 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="hud-text" style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.12em' }}>
              NCCU
            </div>
            <div className="hud-text" style={{ fontSize: '9px', lineHeight: '1.4', color: 'rgba(255,255,255,0.35)' }}>
              NATIONAL CHENGCHI<br />UNIVERSITY
            </div>
            <div style={{ width: '15px', height: '1px', backgroundColor: '#ffffff', marginTop: '6px', opacity: 0.7 }} />
          </div>

          {/* 右上角 英文詩句與捷徑登入 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', textAlign: 'right' }}>
            <div className="hud-text" style={{ fontSize: '10px', lineHeight: '1.5', color: 'rgba(255,255,255,0.4)' }}>
              One plants the tree,<br />Millions grow beneath its shade.
            </div>
            <div 
              onClick={onLoginClick}
              className="hud-text hud-interactive" 
              style={{ fontSize: '11px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}
            >
              [ LOGIN ]
            </div>
          </div>
        </div>

        {/* 中間主標題與控制面板 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          pointerEvents: 'auto',
          textAlign: 'center',
          marginTop: '-60px'
        }}>
          {/* WikiTree 大標題 */}
          <h1 style={{
            fontFamily: '"Roboto Mono", monospace',
            fontSize: '64px',
            fontWeight: 400,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '0.04em',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.15)'
          }}>
            WikiTree
          </h1>

          {/* 副標題 一人種樹，億人乘涼 */}
          <p style={{
            fontFamily: '"Roboto Mono", monospace',
            fontSize: '15px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.5)',
            margin: '0 0 24px 0',
            letterSpacing: '0.45em',
            paddingLeft: '0.45em'
          }}>
            一人種樹，億人乘涼
          </p>

          {/* 主登入與導覽按鈕 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={onLoginClick}
              className="btn-sci-fi"
            >
              [ LOGIN ]
            </button>
            
            <button 
              onClick={onLoginClick}
              className="btn-link-sci-fi"
            >
              SIGN UP
            </button>

            <button 
              onClick={onGuestClick}
              className="btn-link-sci-fi"
            >
              EXPLORE AS GUEST
            </button>
          </div>
        </div>

        {/* 下方 HUD 資訊 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          pointerEvents: 'auto'
        }}>
          {/* 左下角 滑鼠控制面板提示 */}
          <div style={{ display: 'flex', gap: '30px' }}>
            {/* DRAG ROTATE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span className="hud-text" style={{ fontSize: '9px' }}>DRAG<br />ROTATE</span>
            </div>
            
            {/* SCROLL ZOOM */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <rect x="5" y="2" width="14" height="20" rx="7" />
                <path d="M12 6v4" />
              </svg>
              <span className="hud-text" style={{ fontSize: '9px' }}>SCROLL<br />ZOOM</span>
            </div>

            {/* CLICK TOGGLE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="8" />
              </svg>
              <span className="hud-text" style={{ fontSize: '9px' }}>CLICK<br />TOGGLE</span>
            </div>
          </div>

          {/* 右下角 即時狀態面板 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            textAlign: 'right',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            paddingLeft: '15px'
          }}>
            <div className="hud-text" style={{ fontSize: '9px' }}>
              VIEW: <span style={{ color: '#ffffff' }}>EARTH_01</span>
            </div>
            <div className="hud-text" style={{ fontSize: '9px' }}>
              ZOOM: <span style={{ color: '#ffffff' }}>{zoom.toFixed(2)}X</span>
            </div>
            <div className="hud-text" style={{ fontSize: '9px' }}>
              TIME: <span style={{ color: '#ffffff' }}>{currentTime || 'LOADING...'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
