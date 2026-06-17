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

// 摺紙網格三角形定義
interface Triangle3D {
  p1: number;
  p2: number;
  p3: number;
  continentId: number;
}

// 洋流路徑與粒子定義
interface CurrentPath {
  points: { x: number; y: number; z: number; tx: number; ty: number; tz: number }[];
  particles: { progress: number; speed: number }[];
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
    rx: 0.32, // 繞 X 軸旋轉 (起始俯仰角)
    ry: 0.8,  // 繞 Y 軸旋轉
    isDragging: false,
    startX: 0,
    startY: 0,
    activeContinents: [true, false, true, false, false],
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

    // 【極致性能優化 1】：將高解析度螢幕的 dpr 限制在 1.5 以下，避免高分屏像素量過大卡頓
    const resizeCanvas = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
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
    const triangles: Triangle3D[] = [];
    let pointIdCounter = 0;

    // 用於點的離散化分箱批處理（減少 Draw Calls，提升 FPS）
    const batches: { x: number, y: number }[][][] = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => []));

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
      // 【效能優化 2】：將表面陸地點降低至 50 個，減少運算量，同時維持視覺細緻度
      const numPoints = 50 + Math.floor(Math.random() * 5);
      const landPoints: Point3D[] = [];

      for (let i = 0; i < numPoints; i++) {
        const dLat = (Math.random() + Math.random() + Math.random() - 1.5) * 0.35;
        const dLon = (Math.random() + Math.random() + Math.random() - 1.5) * 0.45;
        
        const theta = continent.lat + dLat;
        const phi = continent.lon + dLon;

        // 摺紙起伏半徑
        const r_i = R + (Math.random() - 0.5) * 12;

        const x = r_i * Math.cos(theta) * Math.sin(phi);
        const y = r_i * Math.sin(theta);
        const z = r_i * Math.cos(theta) * Math.cos(phi);

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

      // 大陸內部的點進行距離檢測連線 (臨界值 30)
      for (let i = 0; i < landPoints.length; i++) {
        for (let j = i + 1; j < landPoints.length; j++) {
          const p1 = landPoints[i];
          const p2 = landPoints[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
          if (dist < 30) {
            connections.push({
              p1: p1.id,
              p2: p2.id,
              type: 'land-grid',
              continentId: continent.id
            });
          }
        }
      }

      // 【效能優化 3】：每個板塊限制最多 12 個三角形面，消除卡頓
      let continentTriCount = 0;
      const maxContinentTriangles = 12;
      for (let i = 0; i < landPoints.length && continentTriCount < maxContinentTriangles; i++) {
        for (let j = i + 1; j < landPoints.length && continentTriCount < maxContinentTriangles; j++) {
          const pi = landPoints[i];
          const pj = landPoints[j];
          const d1 = Math.hypot(pi.x - pj.x, pi.y - pj.y, pi.z - pj.z);
          if (d1 > 30) continue;

          for (let k = j + 1; k < landPoints.length && continentTriCount < maxContinentTriangles; k++) {
            const pk = landPoints[k];
            const d2 = Math.hypot(pj.x - pk.x, pj.y - pk.y, pj.z - pk.z);
            const d3 = Math.hypot(pk.x - pi.x, pk.y - pi.y, pk.z - pi.z);
            
            if (d2 < 30 && d3 < 30) {
              triangles.push({
                p1: pi.id,
                p2: pj.id,
                p3: pk.id,
                continentId: continent.id
              });
              continentTriCount++;
            }
          }
        }
      }

      // 【效能優化 4 - 精簡樹木骨架】：每個板塊種植 9 棵樹，且將樹木節點減少為 5 個 (1幹、2枝、2葉)
      const numTrees = 9;
      for (let t = 0; t < numTrees; t++) {
        const rootPt = landPoints[Math.floor(Math.random() * landPoints.length)];
        
        const rootR = Math.hypot(rootPt.x, rootPt.y, rootPt.z);
        const nx = rootPt.x / rootR;
        const ny = rootPt.y / rootR;
        const nz = rootPt.z / rootR;

        const treeHeight = 22 + Math.random() * 10;

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

        // 簡化：生成 2 根主樹枝 (原本 3 根)
        const numBranches = 2;
        for (let b = 0; b < numBranches; b++) {
          const angle = (b * Math.PI) + (Math.random() - 0.5) * 0.4; // 180 度對稱偏轉
          const branchSpread = 0.4;
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

          // 簡化：每根主樹枝僅發射 1 個葉子節點
          const lx_dir = bx_dir + (ux * Math.cos(angle) + vx * Math.sin(angle)) * 0.55;
          const ly_dir = by_dir + (uy * Math.cos(angle) + vy * Math.sin(angle)) * 0.55;
          const lz_dir = bz_dir + (uz * Math.cos(angle) + vz * Math.sin(angle)) * 0.55;
          const lDirLen = Math.hypot(lx_dir, ly_dir, lz_dir);

          const lx = bx + (lx_dir / lDirLen) * (treeHeight * 0.45);
          const ly = by + (ly_dir / lDirLen) * (treeHeight * 0.45);
          const lz = bz + (lz_dir / lDirLen) * (treeHeight * 0.45);

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
    });

    // 【避開大陸洋流路徑與粒子流線設計】：
    // 定義 6 條環繞地球的 3D 洋流路徑線路，並在初始化時使用引力排斥力，使其繞行避開學院大陸板塊！
    const currentPaths: CurrentPath[] = [];
    const numPaths = 6;
    const pathParams = [
      { baseLat: 0.05, freq: 3, amp: 0.22, phase: 0 },
      { baseLat: 0.38, freq: 4, amp: 0.15, phase: 1.5 },
      { baseLat: -0.38, freq: 3, amp: 0.18, phase: 3.0 },
      { baseLat: 0.58, freq: 2, amp: 0.12, phase: 0.5 },
      { baseLat: -0.62, freq: 3, amp: 0.08, phase: 2.0 },
      { baseLat: -0.15, freq: 2, amp: 0.25, phase: 4.5 }
    ];

    pathParams.forEach((param) => {
      const pathPts: CurrentPath['points'] = [];
      const numPts = 80; // 增加洋流路徑點數，使避開與繞行的弧線極為圓滑
      
      for (let i = 0; i <= numPts; i++) {
        const lon = (i / numPts) * Math.PI * 2;
        const lat = param.baseLat + Math.sin(lon * param.freq + param.phase) * param.amp;
        
        let px = R * Math.cos(lat) * Math.sin(lon);
        let py = R * Math.sin(lat);
        let pz = R * Math.cos(lat) * Math.cos(lon);

        // 執行 10 次排斥力迭代，使洋流在 3D 空間中以圓滑曲線沿著大陸板塊邊緣繞道，不產生硬拐角
        for (let iter = 0; iter < 10; iter++) {
          let pushX = 0, pushY = 0, pushZ = 0;
          
          continentsData.forEach((c) => {
            const cx_c = R * Math.cos(c.lat) * Math.sin(c.lon);
            const cy_c = R * Math.sin(c.lat);
            const cz_c = R * Math.cos(c.lat) * Math.cos(c.lon);
            
            const dx = px - cx_c;
            const dy = py - cy_c;
            const dz = pz - cz_c;
            const dist = Math.hypot(dx, dy, dz);
            
            const avoidRadius = 145; // 稍微增加排斥半徑，保證完全避開板塊陸地與樹木
            if (dist < avoidRadius) {
              // 排斥力計算
              const force = Math.pow((avoidRadius - dist) / avoidRadius, 1.2) * 25;
              pushX += (dx / dist) * force;
              pushY += (dy / dist) * force;
              pushZ += (dz / dist) * force;
            }
          });
          
          px += pushX;
          py += pushY;
          pz += pushZ;

          // 重新投影在球體表面
          const len = Math.hypot(px, py, pz);
          px = (px / len) * R;
          py = (py / len) * R;
          pz = (pz / len) * R;
        }

        // 最終投影在球體表面上方 2.0px
        const r_p = R + 2.0;
        const finalX = px * (r_p / R);
        const finalY = py * (r_p / R);
        const finalZ = pz * (r_p / R);

        pathPts.push({ x: finalX, y: finalY, z: finalZ, tx: finalX, ty: finalY, tz: finalZ });
      }

      // 每條洋流上有 3 個流動粒子，調慢速度以減少焦躁感（約原本 35%-40% 的速度）
      const particles = [
        { progress: 0.0, speed: 0.0005 + Math.random() * 0.0002 },
        { progress: 0.33, speed: 0.0005 + Math.random() * 0.0002 },
        { progress: 0.66, speed: 0.0005 + Math.random() * 0.0002 }
      ];

      currentPaths.push({ points: pathPts, particles });
    });

    // 生成背景星塵
    const stars: Point3D[] = [];
    for (let i = 0; i < 150; i++) {
      const theta = (Math.random() - 0.5) * Math.PI;
      const phi = Math.random() * Math.PI * 2;
      const starR = 500 + Math.random() * 300;
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

      // 清空點的分箱批處理陣列，重用緩衝區防 GC
      for (let t = 0; t < 5; t++) {
        for (let o = 0; o < 5; o++) {
          batches[t][o].length = 0;
        }
      }
      
      // 自動自轉
      if (!state.isDragging) {
        state.ry += 0.0006;
      }

      state.pulseProgress = (state.pulseProgress + 0.03) % (Math.PI * 2);

      // 全域慢速呼吸光暈係數
      const globalBreathe = 0.85 + Math.sin(Date.now() * 0.0018) * 0.15;

      // 清除 Canvas 為純黑背景
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const D = 600; // 視距

      // 動態計算地球中心 centerY
      let centerY = height / 2;
      if (state.zoom > 1.0) {
        const t = Math.min(1.0, (state.zoom - 1.0) / 3.0);
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
          const brightness = (0.12 + (Math.sin(Date.now() * 0.0012 + star.x) * 0.08)) * globalBreathe;
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness.toFixed(3)})`;
          ctx.fillRect(sx, sy, 1.2, 1.2);
        }
      });

      // B. 旋轉並投影地球上所有的 3D 點
      points.forEach((p) => {
        const cosY = Math.cos(state.ry);
        const sinY = Math.sin(state.ry);
        const cosX = Math.cos(state.rx);
        const sinX = Math.sin(state.rx);
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;

        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        p.tx = x1;
        p.ty = y2;
        p.tz = z2;
      });

      // 旋轉並投影洋流軌跡線上的所有點 (與自轉、拖曳 100% 同步)
      currentPaths.forEach((path) => {
        path.points.forEach((p) => {
          const cosY = Math.cos(state.ry);
          const sinY = Math.sin(state.ry);
          const cosX = Math.cos(state.rx);
          const sinX = Math.sin(state.rx);

          let x1 = p.x * cosY - p.z * sinY;
          let z1 = p.x * sinY + p.z * cosY;
          let y2 = p.y * cosX - z1 * sinX;
          let z2 = p.y * sinX + z1 * cosX;

          p.tx = x1;
          p.ty = y2;
          p.tz = z2;
        });
      });

      // 篩選出前半球與後半球
      const getOpacity = (tz: number) => {
        const fadeStart = -100;
        const fadeEnd = 140;
        if (tz < fadeStart) return 1.0;
        if (tz > fadeEnd) return 0.0;
        return 1.0 - (tz - fadeStart) / (fadeEnd - fadeStart);
      };

      const zoomWidthScale = Math.max(1.0, Math.sqrt(state.zoom));

      // 【洋流繪製】：
      // 1. 繪製極淡的「洋流軌跡底線」
      const currentBgPath = new Path2D();
      let hasCurrentBg = false;

      currentPaths.forEach((path) => {
        for (let i = 0; i < path.points.length - 1; i++) {
          const p1 = path.points[i];
          const p2 = path.points[i + 1];
          const avgTz = (p1.tz + p2.tz) / 2;
          if (avgTz > 45) continue; // 後半球消隱

          const opacity = getOpacity(avgTz);
          if (opacity < 0.15) continue;

          const scale1 = D / (D + p1.tz);
          const scale2 = D / (D + p2.tz);
          const x1 = centerX + p1.tx * scale1 * state.zoom;
          const y1 = centerY + p1.ty * scale1 * state.zoom;
          const x2 = centerX + p2.tx * scale2 * state.zoom;
          const y2 = centerY + p2.ty * scale2 * state.zoom;

          currentBgPath.moveTo(x1, y1);
          currentBgPath.lineTo(x2, y2);
          hasCurrentBg = true;
        }
      });

      if (hasCurrentBg) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.05 * globalBreathe).toFixed(3)})`;
        ctx.lineWidth = 0.75 * zoomWidthScale;
        ctx.stroke(currentBgPath);
      }

      // 2. 繪製洋流「粒子流段」
      currentPaths.forEach((path) => {
        path.particles.forEach((part) => {
          part.progress = (part.progress + part.speed) % 1.0;

          ctx.beginPath();
          let first = true;
          
          // 對應 80 點路徑（81 個點），並將尾巴長度延長為 6 以增加軌跡感
          const startIndex = Math.floor(part.progress * 80);
          const tailLen = 6; 
          
          for (let j = 0; j <= tailLen; j++) {
            const idx = (startIndex - j + 81) % 81;
            const p = path.points[idx];
            
            if (p.tz > 45) continue;
            
            const opacity = getOpacity(p.tz);
            if (opacity < 0.15) continue;

            const scale = D / (D + p.tz);
            const px = centerX + p.tx * scale * state.zoom;
            const py = centerY + p.ty * scale * state.zoom;
            
            if (first) {
              ctx.moveTo(px, py);
              first = false;
            } else {
              ctx.lineTo(px, py);
            }
          }
          
          const alpha = 0.28 * globalBreathe;
          ctx.strokeStyle = `rgba(240, 240, 240, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.25 * zoomWidthScale;
          ctx.stroke();
        });
      });

      // 【繪製陸地摺紙皺褶面 (Origami Low-Poly Faces)】：
      const activeFacePath = new Path2D();
      const inactiveFacePath = new Path2D();
      let hasActiveFaces = false;
      let hasInactiveFaces = false;

      triangles.forEach((tri) => {
        const p1 = points[tri.p1];
        const p2 = points[tri.p2];
        const p3 = points[tri.p3];

        const avgTz = (p1.tz + p2.tz + p3.tz) / 3;
        if (avgTz > 50) return;

        const opacity = getOpacity(avgTz);
        if (opacity < 0.15) return;

        const scale1 = D / (D + p1.tz);
        const scale2 = D / (D + p2.tz);
        const scale3 = D / (D + p3.tz);

        const x1_scr = centerX + p1.tx * scale1 * state.zoom;
        const y1_scr = centerY + p1.ty * scale1 * state.zoom;
        const x2_scr = centerX + p2.tx * scale2 * state.zoom;
        const y2_scr = centerY + p2.ty * scale2 * state.zoom;
        const x3_scr = centerX + p3.tx * scale3 * state.zoom;
        const y3_scr = centerY + p3.ty * scale3 * state.zoom;

        const isContinentActive = state.activeContinents[tri.continentId];

        const path = isContinentActive ? activeFacePath : inactiveFacePath;
        if (isContinentActive) hasActiveFaces = true;
        else hasInactiveFaces = true;

        path.moveTo(x1_scr, y1_scr);
        path.lineTo(x2_scr, y2_scr);
        path.lineTo(x3_scr, y3_scr);
        path.closePath();
      });

      // 1. 填充 Inactive 板塊的面 (極為微弱透明的白色，凸顯皺褶)
      if (hasInactiveFaces) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(0.02 * globalBreathe).toFixed(3)})`;
        ctx.fill(inactiveFacePath);
      }

      // 2. 填充 Active 板塊的面 (稍微明亮，形成光暈摺紙面)
      if (hasActiveFaces) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(0.08 * globalBreathe).toFixed(3)})`;
        ctx.fill(activeFacePath);
      }

      // C. 繪製連接線
      const activeTreePath = new Path2D();
      const inactiveTreePath = new Path2D();
      const activeLandPath = new Path2D();
      const inactiveLandPath = new Path2D();

      let hasActiveTree = false;
      let hasInactiveTree = false;
      let hasActiveLand = false;
      let hasInactiveLand = false;

      connections.forEach((conn) => {
        const p1 = points[conn.p1];
        const p2 = points[conn.p2];

        const avgTz = (p1.tz + p2.tz) / 2;
        if (avgTz > 50) return;

        const opacity = getOpacity(avgTz);
        if (opacity < 0.1) return;

        const scale1 = D / (D + p1.tz);
        const scale2 = D / (D + p2.tz);

        const x1_scr = centerX + p1.tx * scale1 * state.zoom;
        const y1_scr = centerY + p1.ty * scale1 * state.zoom;
        const x2_scr = centerX + p2.tx * scale2 * scale1 * state.zoom; 
        const x2_correct = centerX + p2.tx * scale2 * state.zoom; // 修正先前小打字 bug: scale2 * scale1
        const y2_scr = centerY + p2.ty * scale2 * state.zoom;

        const isContinentActive = state.activeContinents[conn.continentId];

        if (conn.type === 'tree') {
          if (isContinentActive) {
            activeTreePath.moveTo(x1_scr, y1_scr);
            activeTreePath.lineTo(x2_correct, y2_scr);
            hasActiveTree = true;
          } else {
            inactiveTreePath.moveTo(x1_scr, y1_scr);
            inactiveTreePath.lineTo(x2_correct, y2_scr);
            hasInactiveTree = true;
          }
        } else {
          if (isContinentActive) {
            activeLandPath.moveTo(x1_scr, y1_scr);
            activeLandPath.lineTo(x2_correct, y2_scr);
            hasActiveLand = true;
          } else {
            inactiveLandPath.moveTo(x1_scr, y1_scr);
            inactiveLandPath.lineTo(x2_correct, y2_scr);
            hasInactiveLand = true;
          }
        }
      });

      // 1. 繪製未啟動的陸地格線
      if (hasInactiveLand) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.07 * globalBreathe).toFixed(3)})`;
        ctx.lineWidth = 0.4 * zoomWidthScale;
        ctx.stroke(inactiveLandPath);
      }

      // 2. 繪製已啟動的陸地格線
      if (hasActiveLand) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.32 * globalBreathe).toFixed(3)})`;
        ctx.lineWidth = 0.55 * zoomWidthScale;
        ctx.stroke(activeLandPath);
      }

      // 3. 繪製未啟動的樹木線條
      if (hasInactiveTree) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.62 * globalBreathe).toFixed(3)})`;
        ctx.lineWidth = 1.15 * zoomWidthScale;
        ctx.stroke(inactiveTreePath);
      }

      // 4. 繪製已啟動的樹木線條
      if (hasActiveTree) {
        ctx.beginPath();
        const pulse = 0.85 + Math.sin(Date.now() * 0.005) * 0.15;
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.92 * pulse * globalBreathe).toFixed(3)})`;
        ctx.lineWidth = 1.8 * zoomWidthScale;
        ctx.stroke(activeTreePath);
      }

      // D. 繪製節點 (Nodes) - 【效能優化 5：採用離散化分箱批處理（Binning Batching），大幅減少 Draw Calls 提升 FPS】
      points.forEach((p) => {
        const opacity = getOpacity(p.tz);
        if (opacity <= 0.01) return;

        const scale = D / (D + p.tz);
        const px = centerX + p.tx * scale * state.zoom;
        const py = centerY + p.ty * scale * state.zoom;

        const isContinentActive = state.activeContinents[p.continentId];

        // 已啟動的大陸葉子點：保留單獨繪製，以維持獨立閃爍與精緻雙層發光圓環效果
        if (p.type === 'tree_leaf' && isContinentActive) {
          const radius = 2.8 + Math.sin(Date.now() * 0.005 + p.id) * 0.8;
          
          // 繪製外層發光圓環 (大而半透明)
          ctx.beginPath();
          ctx.arc(px, py, radius * state.zoom * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${(opacity * 0.16).toFixed(3)})`;
          ctx.fill();

          // 繪製內層實心圓 (小而亮)
          ctx.beginPath();
          ctx.arc(px, py, radius * state.zoom * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity.toFixed(3)})`;
          ctx.fill();
        } else {
          // 其餘所有不閃爍點進行離散分箱批處理
          // 決定類型索引 tIdx：
          // 0: inactive_land, 1: active_land, 2: inactive_trunk/branch, 3: active_trunk/branch, 4: inactive_leaf
          let tIdx = 0;
          if (p.type === 'land') {
            tIdx = isContinentActive ? 1 : 0;
          } else if (p.type === 'tree_trunk' || p.type === 'tree_branch') {
            tIdx = isContinentActive ? 3 : 2;
          } else if (p.type === 'tree_leaf') {
            tIdx = 4; // 這裡皆為未啟動狀態
          }

          // 不透明度分 5 個 bin 區間 (0 ~ 4)
          let oIdx = Math.floor(opacity * 5);
          if (oIdx > 4) oIdx = 4;
          if (oIdx < 0) oIdx = 0;

          batches[tIdx][oIdx].push({ x: px, y: py });
        }
      });

      // 統一繪製批處理中的點 (25 種組合)
      // 對應點半徑配置 (原值 * zoom)
      const baseRadii = [0.35, 0.56, 0.65, 0.91, 0.99]; 
      // 對應點透明度係數
      const baseAlphas = [0.12, 0.4, 0.55, 0.75, 0.7]; 

      for (let t = 0; t < 5; t++) {
        const radius = baseRadii[t] * state.zoom;
        const baseAlpha = baseAlphas[t];

        for (let o = 0; o < 5; o++) {
          const pts = batches[t][o];
          if (pts.length === 0) continue;

          // 使用 bin 代表不透明度
          const binOpacity = (o + 0.5) / 5;
          const finalAlpha = binOpacity * baseAlpha * globalBreathe;

          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha.toFixed(3)})`;
          
          for (let i = 0; i < pts.length; i++) {
            const pt = pts[i];
            // 繪製多個 arc 圓圈並用 moveTo 斷開，只用一次 fill 填充
            ctx.moveTo(pt.x + radius, pt.y);
            ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      }

      // E. 行星大氣層發光圓環
      ctx.beginPath();
      const radius = R * state.zoom;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.93,
        centerX, centerY, radius * 1.05
      );
      const ringOpacity = 0.08 * globalBreathe;
      gradient.addColorStop(0, `rgba(255, 255, 255, ${ringOpacity.toFixed(3)})`);
      gradient.addColorStop(0.2, `rgba(255, 255, 255, ${(ringOpacity * 0.5).toFixed(3)})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fill();

      // F. 繪製 3D 學院資訊標籤
      continentsData.forEach((continent) => {
        const cosY = Math.cos(state.ry);
        const sinY = Math.sin(state.ry);
        const cosX = Math.cos(state.rx);
        const sinX = Math.sin(state.rx);

        const cx_orig = R * Math.cos(continent.lat) * Math.sin(continent.lon);
        const cy_orig = R * Math.sin(continent.lat);
        const cz_orig = R * Math.cos(continent.lat) * Math.cos(continent.lon);

        const cx_1 = cx_orig * cosY - cz_orig * sinY;
        const cz_1 = cx_orig * sinY + cz_orig * cosY;
        const cy_2 = cy_orig * cosX - cz_1 * sinX;
        const cz_2 = cy_orig * sinX + cz_1 * cosX;

        const opacity = getOpacity(cz_2);
        if (opacity <= 0.1) return;

        const scale = D / (D + cz_2);
        const scrX = centerX + cx_1 * scale * state.zoom;
        const scrY = centerY + cy_2 * scale * state.zoom;

        const isContinentActive = state.activeContinents[continent.id];
        const labelOpacity = (isContinentActive ? opacity * 0.9 : opacity * 0.35) * globalBreathe;

        const dirX = cx_1 > 0 ? -1 : 1; 

        ctx.beginPath();
        ctx.moveTo(scrX, scrY);
        ctx.lineTo(scrX + 15 * dirX, scrY - 15);
        ctx.lineTo(scrX + 70 * dirX, scrY - 15);
        ctx.strokeStyle = isContinentActive 
          ? `rgba(255, 255, 255, ${labelOpacity.toFixed(3)})`
          : `rgba(255, 255, 255, ${(opacity * 0.2 * globalBreathe).toFixed(3)})`;
        ctx.lineWidth = isContinentActive ? 1.0 : 0.6;
        ctx.stroke();

        ctx.textAlign = dirX > 0 ? 'left' : 'right';
        const textOffset = dirX > 0 ? 20 : -20;

        // 第一行：學院中文名稱
        const textZh = continent.nameZh;
        const yZh = scrY - 20;
        ctx.font = `500 11px "Roboto Mono", "PingFang TC", "Microsoft JhengHei", sans-serif`;
        
        // 加上細黑色外框，防止與地表/樹木白線重疊時看不清
        ctx.strokeStyle = `rgba(0, 0, 0, ${(isContinentActive ? opacity * 0.95 : opacity * 0.45 * globalBreathe).toFixed(3)})`;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.strokeText(textZh, scrX + textOffset, yZh);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${(isContinentActive ? opacity * 0.95 : opacity * 0.45 * globalBreathe).toFixed(3)})`;
        ctx.fillText(textZh, scrX + textOffset, yZh);

        // 第二行：英文學院簡寫
        const textEn = continent.nameEn;
        const yEn = scrY - 7;
        ctx.font = `400 8px "Roboto Mono", monospace`;
        
        // 加上細黑色外框
        ctx.strokeStyle = `rgba(0, 0, 0, ${(isContinentActive ? opacity * 0.6 : opacity * 0.25 * globalBreathe).toFixed(3)})`;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.strokeText(textEn, scrX + textOffset, yEn);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${(isContinentActive ? opacity * 0.6 : opacity * 0.25 * globalBreathe).toFixed(3)})`;
        ctx.fillText(textEn, scrX + textOffset, yEn);
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

      const dragSensitivity = state.zoom > 2.0 ? 0.0025 : 0.0045;
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
      {/* 載入 Google 字體與科技 HUD 的局部 CSS 樣式，加入極具質感的呼吸感動畫 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@200;300;400;500;700&display=swap');
        
        @keyframes textSoftBreathe {
          0% { opacity: 0.35; }
          50% { opacity: 0.65; }
          100% { opacity: 0.35; }
        }

        @keyframes titleGlowBreathe {
          0% { 
            text-shadow: 0 0 12px rgba(255, 255, 255, 0.08); 
            opacity: 0.88;
          }
          50% { 
            text-shadow: 0 0 25px rgba(255, 255, 255, 0.28); 
            opacity: 1.0;
          }
          100% { 
            text-shadow: 0 0 12px rgba(255, 255, 255, 0.08); 
            opacity: 0.88;
          }
        }

        .hud-text {
          font-family: 'Roboto Mono', monospace;
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .hud-breathe {
          animation: textSoftBreathe 5s infinite ease-in-out;
        }

        .title-breathe {
          animation: titleGlowBreathe 6s infinite ease-in-out;
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

      {/* 定義用於裁剪樹形遮罩的 clipPath */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <clipPath id="tree-clip">
            <path d="M 160 530 Q 200 420, 205 340 C 160 340, 110 320, 110 270 C 110 210, 60 210, 60 160 C 60 110, 120 70, 170 90 C 170 50, 230 50, 250 80 C 280 50, 330 70, 340 120 C 380 120, 390 170, 390 210 C 390 270, 340 310, 300 320 C 260 330, 250 340, 245 340 Q 250 420, 290 530 Z" />
          </clipPath>
        </defs>
      </svg>

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
            <div className="hud-text title-breathe" style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.12em' }}>
              NCCU
            </div>
            <div className="hud-text hud-breathe" style={{ fontSize: '9px', lineHeight: '1.4', color: 'rgba(255,255,255,0.35)' }}>
              NATIONAL CHENGCHI<br />UNIVERSITY
            </div>
            <div style={{ width: '15px', height: '1px', backgroundColor: '#ffffff', marginTop: '6px', opacity: 0.7 }} />
          </div>

          {/* 右上角 英文詩句與捷徑登入 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', textAlign: 'right' }}>
            <div className="hud-text hud-breathe" style={{ fontSize: '10px', lineHeight: '1.5', color: 'rgba(255,255,255,0.4)' }}>
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

        {/* 中間主標題與控制面板 (整合真實素描風樹形背景面板與強灰色樹形遮罩) */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '85px 45px 85px 45px', // 提供充足內邊距，防文字貼線
          pointerEvents: 'auto',
          textAlign: 'center',
          marginTop: '-40px',
          width: '450px', // 放寬至 450px，完全解決 W 和 E 貼著線的擠壓感，呈現修長優雅比例
          alignSelf: 'center', // 確保在父容器中水平居中，防拉伸
          boxSizing: 'border-box'
        }}>
          {/* 精確樹形裁剪的毛玻璃與強烈灰色遮罩底層 (遮罩範圍只在樹的形狀內，不再是長方形) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(10, 10, 10, 0.94)', // 樹內部的深灰色填充
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            clipPath: 'url(#tree-clip)', // 使用 clip-path 精確將毛玻璃與遮罩裁切成樹的形狀！
            zIndex: -2,
            pointerEvents: 'none'
          }} />

          {/* 精緻素描樹背景外框與內部素描樹枝木紋 SVG (真實素描樹風格) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            pointerEvents: 'none'
          }}>
            <svg 
              width="450" 
              height="560" 
              viewBox="0 0 450 560" 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)', // 居中對齊，比例永不變形
                filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.9))'
              }}
            >
              {/* 1. 樹的主輪廓外框（不封底，粗手繪線） */}
              <path
                d="M 160 530 
                   Q 200 420, 205 340 
                   C 160 340, 110 320, 110 270 
                   C 110 210, 60 210, 60 160 
                   C 60 110, 120 70, 170 90 
                   C 170 50, 230 50, 250 80 
                   C 280 50, 330 70, 340 120 
                   C 380 120, 390 170, 390 210 
                   C 390 270, 340 310, 300 320 
                   C 260 330, 250 340, 245 340 
                   Q 250 420, 290 530"
                fill="none" 
                stroke="rgba(255, 255, 255, 0.85)" 
                strokeWidth="3.2" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* 2. 樹幹內部的 Y 字形主分岔樹枝 (粗細過渡 1.8px) */}
              <path
                d="M 215 355 Q 210 290, 170 230
                   M 225 355 L 225 250
                   M 235 355 Q 240 290, 280 230"
                fill="none"
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. 樹幹內部的縱向素描木紋排線 (細線 1.0px) */}
              <path
                d="M 190 495 Q 208 430, 212 375
                   M 260 495 Q 242 430, 238 375
                   M 225 515 L 225 415"
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.0"
                strokeLinecap="round"
              />

              {/* 4. 樹冠內部的層次葉片素描線 (細線 1.2px) */}
              <path
                d="M 145 185 C 155 165, 195 165, 205 185
                   M 245 195 C 255 175, 295 175, 305 195
                   M 180 235 C 190 215, 230 215, 240 235"
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* WikiTree 大標題 (適度調回 54px，在 450px 面板內有寬鬆的左右邊距，絕不貼線) */}
          <h1 className="title-breathe" style={{
            fontFamily: '"Roboto Mono", monospace',
            fontSize: '54px',
            fontWeight: 400,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '0.04em',
            textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 0 8px rgba(0,0,0,0.8)'
          }}>
            WikiTree
          </h1>

          {/* 副標題 一人種樹，億人乘涼 */}
          <p className="hud-breathe" style={{
            fontFamily: '"Roboto Mono", monospace',
            fontSize: '14px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.7)',
            margin: '0 0 24px 0',
            letterSpacing: '0.35em',
            paddingLeft: '0.35em',
            textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 6px rgba(0,0,0,0.9)'
          }}>
            一人種樹，億人乘涼
          </p>

          {/* 主登入與導覽按鈕 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={onLoginClick}
              className="btn-sci-fi"
              style={{
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}
            >
              [ LOGIN ]
            </button>
            
            <button 
              onClick={onLoginClick}
              className="btn-link-sci-fi"
              style={{
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}
            >
              SIGN UP
            </button>

            <button 
              onClick={onGuestClick}
              className="btn-link-sci-fi"
              style={{
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}
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
