# -*- coding: utf-8 -*-
"""
Generate Chapter 1 Handout HTML: The Corporation and Financial Markets
Berk & DeMarzo Corporate Finance Chapter 1.
Full, humanized, gamer-friendly Traditional Chinese learning handout.
Includes:
- Complete theoretical core (Dartmouth precedent, 4 Firm Types, Double Taxation, Corporate Governance, Agency Dilemma, Stock Markets, Order Book, Dodd-Frank, Fintech)
- Key English terminology highlighted with translations and pronunciations/concepts
- MathJax 3 + Offline fallback dual-engine math protocol
- 5 Interactive JavaScript Widgets:
  1. 企業組織型態快速比對與決策羅盤 (Matrix & Quiz)
  2. 雙重課稅 vs 穿透課稅 冒險財富試算機 (Double Taxation Calculator)
  3. 委託代理困境模擬器：CEO 的誘惑決策樹 (Agency Problem Simulator)
  4. 股市限價訂單簿與買賣價差互動模擬器 (Order Book & Bid-Ask Spread Visualizer)
  5. 金融科技 (Fintech) 創新演化全息地圖 (Fintech Showcase)
- Examples 1.1 & 1.2 Worked Solutions
- End-of-Chapter Problems 1 to 21 Complete Worked Solutions with Intuitive Explanations
- Synchronized to Workspace, Documents, and Desktop directories.
"""

import os
import shutil

html_content = r'''<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chapter 1 企業組織與財務金融環境｜冒險者公會的首席大掌櫃修煉秘笈 [商業帝國崛起篇]</title>
  
  <!-- 數學公式渲染雙保險：MathJax 3 + 離線優雅降級 Fallback -->
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
      }
    };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <script>
    // 離線降級防護：若 2 秒內 MathJax 未加載，自動啟動純本地輕量替換，確保絕不露出原始碼
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        if (!window.MathJax || !window.MathJax.typeset) {
          console.warn("MathJax CDN 連線超時或處於離線狀態，啟動本地輕量公式美化引擎...");
          const walk = (node) => {
            if (node.nodeType === 3) {
              let text = node.nodeValue;
              if (text.includes('$') || text.includes('\\times') || text.includes('\\frac')) {
                let replaced = text
                  .replace(/\\\$/g, '＄')
                  .replace(/\$([^\$]+)\$/g, '<span style="font-family: Consolas, monospace; color: #0d5f4e; font-weight: 600;">$1</span>')
                  .replace(/\\times/g, ' × ')
                  .replace(/\\div/g, ' ÷ ')
                  .replace(/\\mathbf\{([^\}]+)\}/g, '<strong>$1</strong>')
                  .replace(/\\text\{([^\}]+)\}/g, '$1')
                  .replace(/\\approx/g, ' ≈ ')
                  .replace(/\\ge/g, ' ≥ ')
                  .replace(/\\le/g, ' ≤ ')
                  .replace(/\\tau_([a-zA-Z0-9]+)/g, 't_$1')
                  .replace(/\\([a-zA-Z]+)/g, '')
                  .replace(/＄/g, '$');
                if (replaced !== text) {
                  const span = document.createElement('span');
                  span.innerHTML = replaced;
                  node.parentNode.replaceChild(span, node);
                }
              }
            } else if (node.nodeType === 1 && !['SCRIPT', 'STYLE', 'PRE', 'CODE'].includes(node.tagName)) {
              Array.from(node.childNodes).forEach(walk);
            }
          };
          walk(document.body);
        }
      }, 2000);
    });
  </script>

  <style>
    :root {
      --ink: #1f2d3d;
      --muted: #5a6e85;
      --paper: #fcfbf7;
      --wash: #f4f1ea;
      --line: #e2e8e5;
      --accent: #155e75; /* 深海藍/企業權限色 */
      --accent-light: #e0f2fe;
      --accent-dark: #0e3b4a;
      --gold: #c97a1e;
      --gold-light: #fef8ee;
      --gold-border: #f6d8a8;
      --alert: #b91c1c;
      --alert-light: #fef2f2;
      --success: #15803d;
      --success-light: #f0fdf4;
      --card-bg: #ffffff;
      --radius: 12px;
      --shadow: 0 4px 20px rgba(31, 45, 61, 0.06);
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", "Microsoft JhengHei", sans-serif;
      font-size: 17px;
      line-height: 1.85;
    }

    /* 頂部英雄導覽 Banner */
    .hero {
      background: linear-gradient(135deg, #0e3b4a 0%, #155e75 60%, #0284c7 100%);
      color: #ffffff;
      padding: 4.5rem 5vw 3.5rem;
      border-bottom: 4px solid var(--gold);
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: "🏛️ 📜 ⚔️ 📊 🚀";
      position: absolute;
      right: 3vw;
      bottom: -15px;
      font-size: 6rem;
      opacity: 0.12;
      pointer-events: none;
      letter-spacing: 0.5rem;
    }
    .eyebrow {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      color: #fce7b0;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.35rem 0.9rem;
      border-radius: 20px;
      margin-bottom: 1.2rem;
    }
    .version-tag {
      display: inline-block;
      background: var(--gold);
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      margin-left: 0.5rem;
      vertical-align: middle;
      letter-spacing: 0.05em;
    }
    .hero h1 {
      font-size: clamp(2.1rem, 4.5vw, 3.4rem);
      margin: 0 0 0.8rem;
      line-height: 1.25;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .hero .subtitle {
      font-size: 1.25rem;
      color: #bae6fd;
      max-width: 860px;
      margin: 0 0 1.5rem;
      font-weight: 400;
      line-height: 1.6;
    }
    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      font-size: 0.95rem;
      color: #e0f2fe;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      padding-top: 1.2rem;
    }
    .hero-meta span { display: flex; align-items: center; gap: 0.4rem; }

    /* 佈局容器：左側主內文，右側黏性導覽列 */
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2.5rem 2rem 5rem;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: 3.5rem;
      align-items: start;
    }

    /* 側邊導航目錄 */
    .toc-sidebar {
      position: sticky;
      top: 2rem;
      background: var(--card-bg);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow);
      max-height: calc(100vh - 4rem);
      overflow-y: auto;
    }
    .toc-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 2px solid var(--accent-light);
      padding-bottom: 0.5rem;
    }
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.88rem;
    }
    .toc-list li { margin-bottom: 0.6rem; }
    .toc-list a {
      color: var(--muted);
      text-decoration: none;
      display: block;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      line-height: 1.4;
    }
    .toc-list a:hover {
      background: var(--accent-light);
      color: var(--accent);
      font-weight: 600;
      transform: translateX(3px);
    }

    /* 內文主要排版模組 */
    .main-content section {
      margin-bottom: 4rem;
      scroll-margin-top: 2rem;
    }
    h2 {
      font-size: 1.85rem;
      color: var(--accent-dark);
      border-left: 6px solid var(--accent);
      padding-left: 1rem;
      margin: 2.5rem 0 1.5rem;
      line-height: 1.3;
    }
    h3 {
      font-size: 1.35rem;
      color: var(--accent);
      margin: 2rem 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    p { margin: 0 0 1.2rem; }

    /* 英文專有名詞高亮徽章 */
    .term {
      font-family: inherit;
      font-weight: 700;
      color: #0369a1;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 0.15rem 0.45rem;
      border-radius: 5px;
      display: inline-block;
      margin: 0 0.1rem;
    }
    .en-term {
      font-family: Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 0.9em;
      color: #0f766e;
      background: #ccfbf1;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      margin-left: 0.25rem;
      font-weight: 600;
    }

    /* 故事背景與冒險對話卡片 */
    .story-card {
      background: linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%);
      border: 1px solid #bbf7d0;
      border-left: 6px solid var(--success);
      padding: 1.5rem 1.8rem;
      border-radius: var(--radius);
      margin-bottom: 2rem;
      box-shadow: var(--shadow);
    }
    .story-header {
      font-weight: 700;
      color: #166534;
      font-size: 1.1rem;
      margin-bottom: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    /* 警示與避坑提示卡片 */
    .trap-card {
      background: linear-gradient(145deg, #ffffff 0%, var(--alert-light) 100%);
      border: 1px solid #fecaca;
      border-left: 6px solid var(--alert);
      padding: 1.5rem 1.8rem;
      border-radius: var(--radius);
      margin-bottom: 2rem;
      box-shadow: var(--shadow);
    }
    .trap-header {
      font-weight: 700;
      color: var(--alert);
      font-size: 1.1rem;
      margin-bottom: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    /* 核心法條與歷史里程碑卡片 */
    .milestone-card {
      background: linear-gradient(145deg, #ffffff 0%, var(--gold-light) 100%);
      border: 1px solid var(--gold-border);
      border-left: 6px solid var(--gold);
      padding: 1.5rem 1.8rem;
      border-radius: var(--radius);
      margin-bottom: 2rem;
      box-shadow: var(--shadow);
    }
    .milestone-header {
      font-weight: 700;
      color: #92400e;
      font-size: 1.15rem;
      margin-bottom: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    /* 概念對比網格 */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      margin: 1.5rem 0 2rem;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.2rem;
      margin: 1.5rem 0 2rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(31, 45, 61, 0.1);
    }
    .card-title {
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: 0.6rem;
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* 互動元件容器樣式 */
    .interactive-widget {
      background: #ffffff;
      border: 2px solid #bae6fd;
      border-radius: var(--radius);
      padding: 1.8rem;
      margin: 2rem 0;
      box-shadow: 0 6px 24px rgba(14, 165, 233, 0.12);
    }
    .widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px dashed #bae6fd;
      padding-bottom: 0.8rem;
      margin-bottom: 1.5rem;
    }
    .widget-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--accent);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .widget-badge {
      background: #0284c7;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      text-transform: uppercase;
    }
    .form-group {
      margin-bottom: 1.2rem;
    }
    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.4rem;
      color: var(--ink);
    }
    .form-control {
      width: 100%;
      padding: 0.6rem 0.8rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 1rem;
      background: #f8fafc;
      transition: border-color 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: #0284c7;
      background: #ffffff;
    }
    .btn-calc {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      border: none;
      padding: 0.75rem 1.6rem;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-calc:hover {
      background: linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%);
      transform: translateY(-1px);
    }
    .calc-result-box {
      margin-top: 1.5rem;
      padding: 1.2rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      display: none;
    }

    /* 習題卡片與折疊詳解 */
    .problem-box {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: var(--radius);
      padding: 1.5rem 1.8rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow);
    }
    .problem-head {
      font-weight: 700;
      font-size: 1.15rem;
      color: #0f172a;
      display: flex;
      align-items: baseline;
      gap: 0.6rem;
      margin-bottom: 0.8rem;
    }
    .problem-tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-weight: 700;
      background: #e2e8f0;
      color: #475569;
    }
    .solution-toggle {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: var(--accent);
      font-weight: 700;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.92rem;
      margin-top: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: background 0.2s ease;
    }
    .solution-toggle:hover {
      background: #e2e8f0;
    }
    .solution-body {
      display: none;
      margin-top: 1.2rem;
      padding: 1.2rem;
      background: #f8fafc;
      border-left: 4px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 0.96rem;
    }

    /* 比較表格排版 */
    .compare-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0 2rem;
      font-size: 0.95rem;
      background: #ffffff;
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow);
    }
    .compare-table th, .compare-table td {
      padding: 1rem 1.2rem;
      text-align: left;
      border-bottom: 1px solid var(--line);
    }
    .compare-table th {
      background: #0e3b4a;
      color: #ffffff;
      font-weight: 700;
    }
    .compare-table tr:hover {
      background: #f8fafc;
    }

    /* 頁尾 */
    footer {
      background: #0f172a;
      color: #94a3b8;
      text-align: center;
      padding: 3rem 1rem;
      font-size: 0.9rem;
      border-top: 4px solid var(--gold);
    }
    footer a { color: #38bdf8; text-decoration: none; }

    @media (max-width: 992px) {
      .container { grid-template-columns: 1fr; }
      .toc-sidebar { display: none; }
    }
  </style>
</head>
<body>

  <!-- 頂部英雄導覽 Banner -->
  <header class="hero">
    <div class="eyebrow">👑 Berk &amp; DeMarzo 企業財務學第 1 章 · 冒險者公會核心經典</div>
    <h1>Chapter 1：企業組織與財務金融環境</h1>
    <div class="subtitle">從擺攤小販到跨國帝國：透視現代公司的法律血統、雙重稅負、委託代理困境與華爾街訂單簿的微觀運作！</div>
    <div class="hero-meta">
      <span>📚 經典教材對應：Berk &amp; DeMarzo <i>Corporate Finance</i> Ch 1</span>
      <span>🌲 WikiTree 知識架構：商學/財務學分枝</span>
      <span>🎮 學習導師：冒險者公會首席大掌櫃</span>
      <span class="version-tag">雙保險 MathJax 3 &amp; 離線美化版</span>
    </div>
  </header>

  <div class="container">
    
    <!-- 主要內容區 -->
    <main class="main-content">

      <!-- 引言與冒險指南 -->
      <section id="prologue">
        <div class="story-card">
          <div class="story-header">
            <span>🛡️</span> 冒險者大掌櫃的開篇心法：為什麼全世界都需要「公司」？
          </div>
          <p>
            嘿，初入冒險者公會的小夥伴！想像一下，你在新手村靠著一手祖傳的「火焰烤肉串」賺了第一桶金。此時你是一個人單打獨鬥的小商販。但如果有一天，你想造一艘能橫跨風暴之海的「萬里星空巨艦」，需要集結十萬名冒險者的金幣、聘請千名工匠、承擔沉船的毀滅性風險，你還能只靠個人的錢包來扛嗎？
          </p>
          <p>
            如果船沉了，債主要抓你去抵債、沒收你家祖墳，誰還敢出海冒險？如果合夥人突然捲款跑路，或者生病去世，整艘艦隊就得原地解散，人類文明還怎麼進步？
          </p>
          <p>
            為了破解這個死局，人類歷史上最偉大的制度發明誕生了——<strong>「公司（Corporation）」</strong>！它就像召喚出了一個擁有獨立靈魂與法律保護的「契約魔導巨神」。本章我們將揭開企業組織的四大血統、探究股東與經理人的宮鬥心理學，並走進股票市場的大廳，親手拆解買賣價差與高頻交易的運作機制！
          </p>
        </div>
      </section>

      <!-- 第一節：四種企業組織型態 -->
      <section id="sec-1">
        <h2>1.1 商業世界的四大血統：企業組織的四種型態</h2>
        <p>
          在法律與財務的世界裡，所有的商業實體都可以歸入四大基本型態。每種型態在「擁有權」、「責任邊界」、「納稅模式」與「壽命延續」上都有著截然不同的遊戲規則：
        </p>

        <!-- 歷史里程碑：達特茅斯學院案 -->
        <div class="milestone-card">
          <div class="milestone-header">
            <span>📜</span> 改變人類商業命運的歷史判決：1818～1819 年「達特茅斯學院案 (Dartmouth College Case)」
          </div>
          <p>
            在 1819 年以前，美國各州政府隨時可以藉由政治力量沒收或接管任何民間機構。1816 年，新罕布夏州政府試圖強行接管私立達特茅斯學院，將其收歸州立大學。傳奇律師丹尼爾·韋伯斯特（Daniel Webster）與首席大法官約翰·馬歇爾（John Marshall）在最高法院做出了劃時代的 5:1 裁決：
          </p>
          <p>
            <strong>「公司是一種受美國憲法保護的契約（Contract）。州政府不得通過任何損害契約義務的法律！」</strong>
          </p>
          <p>
            這項判例確立了「公司資產屬於受憲法保護的私有財產，政府不可任意侵奪」。從此，全世界的資本家終於敢放心地將成千上萬的財富投入公司，現代工商業文明從此全面起飛！
          </p>
        </div>

        <div class="grid-4">
          <div class="card">
            <div class="card-title">
              <span>獨資企業</span>
              <span class="en-term">Sole Proprietorship</span>
            </div>
            <p><strong>冒險小隊長模式：</strong>一個人出資、一個人說了算。成立手續最簡單，是全世界數量最多的企業型態。</p>
            <p><strong>致命死穴：</strong></p>
            <ul>
              <li><strong>無限責任（Unlimited Liability）：</strong>公會欠債，掌櫃要賣房賣器官賠到底！</li>
              <li><strong>生命期受限：</strong>店長去世或退休，這家店法律上就結束了。</li>
              <li><strong>籌資極度困難：</strong>無法賣股票，融資全靠掌櫃人脈與抵押貸款。</li>
            </ul>
          </div>

          <div class="card">
            <div class="card-title">
              <span>合夥企業</span>
              <span class="en-term">Partnership</span>
            </div>
            <p><strong>結伴冒險模式：</strong>兩個或以上的人簽約共同經營。律師事務所、會計師事務所常見此型態。</p>
            <p><strong>分流設計：</strong></p>
            <ul>
              <li><strong>普通合夥人（General Partner, GP）：</strong>掌握日常經營權，但承擔<strong>無限個人連帶責任</strong>！</li>
              <li><strong>有限合夥人（Limited Partner, LP）：</strong>只出資不插手管理，承擔<strong>有限責任</strong>（最多賠光本金）。</li>
              <li>任何 GP 離開或破產，合夥可能面臨重組清算。</li>
            </ul>
          </div>

          <div class="card">
            <div class="card-title">
              <span>有限責任公司</span>
              <span class="en-term">LLC</span>
            </div>
            <p><strong>近代的混血黑科技：</strong>結合合夥企業與公司的雙重優點，1977 年由懷俄明州首創，現已風靡全球。</p>
            <p><strong>黃金優勢：</strong></p>
            <ul>
              <li><strong>所有人皆享有限責任：</strong>沒有任何人需要押上身家承擔無限責任。</li>
              <li><strong>單一課稅（Pass-through）：</strong>利潤直接穿透給成員按個人所得稅申報，免除企業層級稅！</li>
              <li>無須繁瑣的董事會制度，管理彈性極大。</li>
            </ul>
          </div>

          <div class="card" style="border: 2px solid var(--accent); background: #f0fdfa;">
            <div class="card-title" style="color: var(--accent-dark);">
              <span>股份有限公司</span>
              <span class="en-term">Corporation</span>
            </div>
            <p><strong>終極魔導人造人：</strong>法律上獨立於擁有者之外的「法人（Legal Person）」，擁有獨立戶頭、可簽約、會被告。</p>
            <p><strong>無敵特權：</strong></p>
            <ul>
              <li><strong>全體有限責任（Limited Liability）：</strong>股東最多只輸光買股票的錢。</li>
              <li><strong>永久生命（Perpetual Life）：</strong>股東生老病死，公司依然永生運作！</li>
              <li><strong>自由轉讓股票：</strong>造就了龐大的全球資本市場與流動性。</li>
            </ul>
          </div>
        </div>

        <!-- 四大組織型態綜合比較表格 -->
        <h3>📊 四大企業組織體質天梯榜</h3>
        <table class="compare-table">
          <thead>
            <tr>
              <th>組織型態</th>
              <th>出資者責任範圍</th>
              <th>所有權與控制權</th>
              <th>課稅模式 (Taxation)</th>
              <th>資金募集難度</th>
              <th>典型代表範例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>獨資 (Sole Proprietorship)</strong></td>
              <td><span style="color: var(--alert); font-weight:700;">無限責任</span> (連帶個人身家)</td>
              <td>完全重疊 (掌櫃即店面)</td>
              <td>穿透課稅 (個人所得稅)</td>
              <td>極度困難 (限個人借貸)</td>
              <td>街角咖啡廳、獨立水電行</td>
            </tr>
            <tr>
              <td><strong>合夥 (Partnership)</strong></td>
              <td>GP 無限責任 / LP 有限責任</td>
              <td>GP 掌權，LP 無權干涉</td>
              <td>穿透課稅 (分配給合夥人)</td>
              <td>中等 (受限合夥人資力)</td>
              <td>律師事務所、私募創投基金 (PE/VC)</td>
            </tr>
            <tr>
              <td><strong>有限責任公司 (LLC)</strong></td>
              <td><span style="color: var(--success); font-weight:700;">全員有限責任</span></td>
              <td>成員自由協議營運方式</td>
              <td>穿透課稅 (免繳企業所得稅)</td>
              <td>良好 (但非公開上市標的)</td>
              <td>科技新創初期、會計師團隊、診所</td>
            </tr>
            <tr>
              <td><strong>股份有限公司 (Corporation)</strong></td>
              <td><span style="color: var(--success); font-weight:700;">全員嚴格有限責任</span></td>
              <td><strong>徹底分離</strong> (股東選董事，聘執行長)</td>
              <td><strong>雙重課稅 (C-Corp)</strong> / 穿透 (S-Corp)</td>
              <td>極其優異 (可向全球大眾發行股票債券)</td>
              <td>蘋果 (Apple)、台積電、微軟</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 第二節：稅務機制與雙重課稅 -->
      <section id="sec-2">
        <h2>1.2 稅務魔咒：C型公司的雙重課稅 vs S型公司的穿透豁免</h2>
        <p>
          在商業世界裡，賺錢不是最難的，搞清楚「最後剩下幾塊錢放進自己的口袋」才是真功夫！在美國與多數現代稅制中，股份有限公司分為兩大陣營：
        </p>

        <div class="grid-2">
          <div class="card">
            <div class="card-title">
              <span>傳統 C 型公司</span>
              <span class="en-term">C Corporation</span>
            </div>
            <p><strong>絕大多數大型企業（包括所有上市公司）：</strong></p>
            <p>
              遵循經典的<strong>雙重課稅（Double Taxation）</strong>。公司作為獨立法人，賺到的營業利潤首先要繳納<strong>企業所得稅（Corporate Tax Rate, $\tau_c$）</strong>；稅後利潤若以股利（Dividend）形式發放給股東，股東個人還必須在其個人報稅單上再繳一次<strong>股利個人所得稅（Personal Dividend Tax, $\tau_d$）</strong>！
            </p>
            <p style="background: var(--accent-light); padding: 0.6rem 0.8rem; border-radius: 6px; font-weight: 600;">
              股東每一元稅前盈餘最終保留金額：<br>
              $$\text{Net Cash} = \$1 \times (1 - \tau_c) \times (1 - \tau_d)$$
              實質總有效稅率：
              $$\text{Effective Tax Rate} = 1 - (1 - \tau_c)(1 - \tau_d)$$
            </p>
          </div>

          <div class="card">
            <div class="card-title">
              <span>節稅特化 S 型公司</span>
              <span class="en-term">S Corporation</span>
            </div>
            <p><strong>享有美稅法 Subchapter S 穿透待遇的中小精英：</strong></p>
            <p>
              公司的利潤完全<strong>免繳企業所得稅</strong>，直接按股權比例「穿透（Pass-through）」分配到股東頭上，股東只繳一次<strong>個人所得稅（Personal Income Tax, $\tau_p$）</strong>。
            </p>
            <p><strong>嚴苛的晉升代價（資格限制）：</strong></p>
            <ul>
              <li>股東人數上限為 <strong>100 人</strong>。</li>
              <li>所有股東必須是<strong>美國公民或稅務居民自然人</strong>（不得有外國人或機構法人士持股）。</li>
              <li>只能發行<strong>單一種類股票（Single Class of Stock）</strong>，無法進行多層次股權設計。</li>
            </ul>
          </div>
        </div>

        <!-- 經典課本範例 1.1 與 1.2 拆解 -->
        <div class="milestone-card">
          <div class="milestone-header">
            <span>📖</span> 課本經典範例 1.1 &amp; 1.2 現場拆解對比
          </div>
          <p>
            <strong>情境：</strong>假設冒險公司每股賺得稅前盈餘 <strong>$8.00</strong>。試比較在 C-Corp 與 S-Corp 下，股東最終能拿到多少現金？（假設企業所得稅率為 $25\%$，個人股利所得稅率為 $20\%$，個人綜合所得稅率為 $37\%$）
          </p>
          <div style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid var(--gold-border);">
            <p><strong>🔹 情況 A：若為 C 型公司 (Example 1.1)</strong></p>
            <ol>
              <li>公司支付企業所得稅：$$\$8.00 \times 25\% = \$2.00$$</li>
              <li>公司稅後剩餘發放股利：$$\$8.00 - \$2.00 = \$6.00$$</li>
              <li>股東個人繳納股利所得稅：$$\$6.00 \times 20\% = \$1.20$$</li>
              <li>股東最終實拿現金：$$\$6.00 - \$1.20 = \mathbf{\$4.80}$$</li>
              <li>實質有效稅率：$$\frac{\$8.00 - \$4.80}{\$8.00} = \frac{\$3.20}{\$8.00} = \mathbf{40\%}$$</li>
            </ol>
            <hr style="border: none; border-top: 1px dashed #e2e8f0; margin: 1rem 0;">
            <p><strong>🔹 情況 B：若為 S 型公司 (Example 1.2)</strong></p>
            <ol>
              <li>公司層級免稅，稅前盈餘 \$8.00 全數穿透至股東個人。</li>
              <li>股東個人繳納所得稅（以最高個人稅率 37% 計算）：$$\$8.00 \times 37\% = \$2.96$$</li>
              <li>股東最終實拿現金：$$\$8.00 - \$2.96 = \mathbf{\$5.04}$$</li>
              <li>實質有效稅率：$$\mathbf{37\%}$$（比 C 型公司每股多賺 \$0.24！）</li>
            </ol>
          </div>
        </div>

        <!-- 互動元件 1：雙重課稅 vs 穿透課稅 冒險財富試算機 -->
        <div class="interactive-widget" id="widget-tax">
          <div class="widget-header">
            <div class="widget-title">
              <span>🧮 互動實驗室 1</span> 雙重課稅 vs 穿透課稅 實質收益即時試算機
            </div>
            <span class="widget-badge">Interactive Tool</span>
          </div>
          <p style="font-size: 0.95rem; color: var(--muted); margin-bottom: 1.2rem;">
            動手拖動或輸入不同的稅率，看看「雙重課稅」是如何像巨怪一樣吞噬投資人的利潤！
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div class="form-group">
              <label>每股稅前利潤 (Pre-tax Earning $)</label>
              <input type="number" id="tax-pretax" class="form-control" value="10" step="1" min="1">
            </div>
            <div class="form-group">
              <label>企業所得稅率 $\tau_c$ (%)</label>
              <input type="number" id="tax-corprate" class="form-control" value="21" step="1" min="0" max="100">
            </div>
            <div class="form-group">
              <label>個人股利稅率 $\tau_d$ (%)</label>
              <input type="number" id="tax-dividend" class="form-control" value="20" step="1" min="0" max="100">
            </div>
            <div class="form-group">
              <label>個人綜合稅率 $\tau_p$ (%) [S-Corp]</label>
              <input type="number" id="tax-personal" class="form-control" value="35" step="1" min="0" max="100">
            </div>
          </div>
          <button class="btn-calc" onclick="calculateTaxComparison()">
            <span>⚡ 立即模擬兩種組織型態的到手利潤</span>
          </button>
          
          <div id="tax-result" class="calc-result-box"></div>
        </div>
      </section>

      <!-- 第三節：所有權與控制權分離、代理人問題與公司治理 -->
      <section id="sec-3">
        <h2>1.3 王權與相權：所有權與控制權分離、代理人問題與治理風暴</h2>
        <p>
          當一家公司發行了數百萬股，擁有成千上萬名互不相識的股東時，不可能每次買台電腦、招募一名員工都要全體股東投票。因此，現代公司誕生了最關鍵的治理基石：<strong>所有權與控制權的分離（Separation of Ownership and Control）</strong>！
        </p>

        <!-- 治理三角矩陣 -->
        <div class="grid-2">
          <div class="card">
            <div class="card-title">
              <span>🏛️ 董事會</span>
              <span class="en-term">Board of Directors</span>
            </div>
            <p><strong>股東選出的「元老院」：</strong></p>
            <ul>
              <li>代表全體股東監督公司重大策略，擁有最高裁決權。</li>
              <li>核心職責：任命、監督、決定考核薪酬與撤換<strong>執行長（CEO）</strong>。</li>
            </ul>
          </div>

          <div class="card">
            <div class="card-title">
              <span>💼 經理人團隊與財務長職責</span>
              <span class="en-term">Management Team &amp; CFO</span>
            </div>
            <p><strong>受聘管理王國的「宰相與執政官」：</strong></p>
            <ul>
              <li><strong>執行長（CEO, Chief Executive Officer）：</strong>全權負責日常營運與執行大權。</li>
              <li><strong>財務長（CFO, Chief Financial Officer）三大核心任務：</strong>
                <ol>
                  <li><strong>投資決策（Investment Decisions / 資本預算）：</strong>決定哪些金礦、城堡、航線值得投入資本。</li>
                  <li><strong>融資決策（Financing Decisions / 資本結構）：</strong>決定發股票招募新股東，還是向矮人銀行借債。</li>
                  <li><strong>營運資金管理（Cash Management）：</strong>確保每天金庫有足夠的流動現金應付糧草與薪餉。</li>
                </ol>
              </li>
            </ul>
          </div>
        </div>

        <!-- 代理人問題與衝突案例 -->
        <div class="trap-card">
          <div class="trap-header">
            <span>⚔️</span> 商業倫理大考驗：代理人問題 (The Agency Problem)
          </div>
          <p>
            什麼是<strong>代理人問題（Agency Problem）</strong>？當受聘的「管家（Agent, 經理人）」手中握有權力，但他內心算計的是「自己的薪水、名聲、私人飛機或帝國版圖」，而不是「主人（Principal, 股東）」的長遠利益時，衝突就爆發了！
          </p>
          <p><strong>經典代理衝突實例：</strong></p>
          <ul>
            <li><strong>帝國擴張主義（Empire Building）：</strong>CEO 盲目花大錢併購其他公司，即使賠錢也要做大，只為了讓自己掌管的帝國更威風、爭取更高的年薪。</li>
            <li><strong>過度追求個人奢華享受：</strong>用公款裝修辦公室、租用豪華私人噴射機巡迴出差。</li>
            <li><strong>風險厭惡與偷懶：</strong>經理人為了保住烏紗帽，不敢推動高價值但有風險的創新研發。</li>
          </ul>
        </div>

        <!-- 約束與對齊工具：敵意收購、薪酬連動與陶德-弗蘭克法案 -->
        <div class="card" style="margin-bottom: 2rem;">
          <h3 style="margin-top:0;">🛡️ 馴服經理人的四大治理之劍</h3>
          <div class="grid-2">
            <div>
              <p><strong>1. 股權與績效激勵（Stock Options / Equity Pay）：</strong></p>
              <p>把經理人的薪資與股票表現綁定。「你想發大財？先把股價做上去，讓股東發財，你才能分紅！」但需防範經理人為了短期股價暴衝而冒險做假帳。</p>
              
              <p><strong>2. 敵意收購的威脅（Hostile Takeover）：</strong></p>
              <p>如果管理層無能、導致股價被嚴重低估，外來的「掠奪者（Corporate Raider）」就會在次級市場偷偷收購過半股權，發動突襲並<strong>當場開除全體擺爛高管</strong>！這是市場上最令惡劣管理層膽寒的終極天誅。</p>
            </div>
            <div>
              <p><strong>3. 破產與債權人清算約束（Corporate Bankruptcy）：</strong></p>
              <p>當公司無法履行債務時，控制權將<strong>合法轉移至債權人手中</strong>。經理人面臨撤換，甚至在美國破產法第 7 章（Chapter 7）下直接清算拍賣，或在第 11 章（Chapter 11）下重組重生。</p>

              <p><strong>4. 陶德-弗蘭克華爾街改革法案（Dodd-Frank Act, 2010）：</strong></p>
              <p>2008 金融海嘯後通過的劃時代法案，強制推行：
                <br>• <strong>薪酬話語權（Say-on-Pay）：</strong>至少每 3 年讓股東就高管薪酬進行諮詢性投票。
                <br>• <strong>追回條款（Clawback Provisions）：</strong>財報若涉造假，公司有權收回已發的高管獎金。
                <br>• <strong>揭露黃金降落傘（Golden Parachutes）：</strong>被收購撤職時的高額離職津貼必須透明化。
              </p>
            </div>
          </div>
        </div>

        <!-- 互動元件 2：代理人困境冒險模擬器 -->
        <div class="interactive-widget" id="widget-agency">
          <div class="widget-header">
            <div class="widget-title">
              <span>🎭 互動實驗室 2</span> 委託代理困境：CEO 的天人交戰決策樹
            </div>
            <span class="widget-badge">Simulation</span>
          </div>
          <p style="font-size: 0.95rem; color: var(--muted); margin-bottom: 1.2rem;">
            你現在被聘為冒險王國上市公會的首席執行長（CEO）。面對以下關鍵抉擇，你會站在自身利益還是股東利益？
          </p>
          <div style="background: #f8fafc; padding: 1.2rem; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p><strong>情境題：</strong>另一家平庸的公會願意以高溢價被你收購。一旦合併，你掌管的帝國資產將翻倍，薪資委員會將為你加薪 50%；但內部評估該合併毫無協同效應，每股盈餘將被稀釋，股東財富預估縮水 15%。你怎麼做？</p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;">
              <button class="solution-toggle" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5;" onclick="chooseAgency(1)">
                A. 批准併購！壯大帝國版圖與我的名望（代理人自利思維）
              </button>
              <button class="solution-toggle" style="background:#dcfce7; color:#15803d; border-color:#86efac;" onclick="chooseAgency(2)">
                B. 否決併購！專注研發高回報項目，維護股東財富（忠誠代理思維）
              </button>
            </div>
            <div id="agency-feedback" style="display:none; margin-top:1.2rem; padding:1rem; border-radius:6px;"></div>
          </div>
        </div>
      </section>

      <!-- 第四節：股票市場與現代交易架構 -->
      <section id="sec-4">
        <h2>1.4 資本的星光大道：初級市場、次級市場與股票交易所</h2>
        <p>
          擁有一家公司的股份如果「無法隨時變現賣給別人」，這張股票就跟廢紙沒兩樣。<strong>股票市場（The Stock Market）</strong>為全人類的投資者提供了夢寐以求的<strong>流動性（Liquidity）</strong>！
        </p>

        <div class="grid-2">
          <div class="card">
            <div class="card-title">
              <span>🌱 初級市場 / 發行市場</span>
              <span class="en-term">Primary Market</span>
            </div>
            <p><strong>公司親自向公眾籌措資金的「出生地」：</strong></p>
            <ul>
              <li><strong>首度公開募股（IPO, Initial Public Offering）：</strong>一家私人企業第一次向大眾發行股票並掛牌上市。</li>
              <li><strong>現金增資（SEO, Seasoned Equity Offering）：</strong>已經上市的公司再次發行新股籌資。</li>
              <li><strong>關鍵特徵：</strong>資金真正流進了「公司自己的口袋」，用於擴廠、研發或擴張。</li>
            </ul>
          </div>

          <div class="card">
            <div class="card-title">
              <span>🌊 次級市場 / 流通市場</span>
              <span class="en-term">Secondary Market</span>
            </div>
            <p><strong>投資者之間互相買賣轉手的「二手大集市」：</strong></p>
            <ul>
              <li>當你在手機 App 下單買進 100 股星巴克（SBUX）時，你買的是另一個投資人想賣出的股票，星巴克公司<strong>不會從你的交易中拿到一毛錢</strong>！</li>
              <li><strong>天量存在：</strong>次級市場佔全球金融市場交易量的 99% 以上，沒有強大的次級市場流動性，初級市場將無人敢認購新股。</li>
            </ul>
          </div>
        </div>

        <!-- 傳統交易所 vs 現代電子市場 -->
        <h3>🏛️ 兩大聖殿的演化：NYSE 與 NASDAQ</h3>
        <p>
          歷史上，紐約證券交易所（NYSE）依賴曼哈頓下城的實體交易大廳，由<strong>指定造市商（Specialists / Designated Market Makers, DMM）</strong>手持單據進行人工撮合；而那斯達克（NASDAQ）則是歷史上第一個完全依賴電腦連線的場外交易（OTC）經紀商網路。
        </p>
        <p>
          在今天，這兩者都已經高度電子化，全世界的買賣委託全天候以微秒級速度在光纖網路上相互競價！
        </p>

        <!-- 買賣報價單、價差與流動性 -->
        <div class="card" style="border-left: 6px solid var(--accent); margin-bottom: 2rem;">
          <h3 style="margin-top:0;">🏷️ 交易核心代碼：Bid、Ask 與 買賣價差 (Bid-Ask Spread)</h3>
          <ul>
            <li><strong>買進報價（Bid Price）：</strong>市場造市商或買方願意<strong>出價收購</strong>你的股票的最高價格。</li>
            <li><strong>賣出報價（Ask / Offer Price）：</strong>市場造市商或賣方願意<strong>出貨賣給</strong>你的最低價格。</li>
            <li>
              <strong>買賣價差（Bid-Ask Spread）：</strong>
              $$\text{Bid-Ask Spread} = \text{Ask Price} - \text{Bid Price} \ge 0$$
              造市商以較低的買價（Bid）買入，並以較高的賣價（Ask）賣出，這兩者之間的差額就是<strong>造市商承擔庫存風險與提供流動性的報酬</strong>；對投資人而言，這就是一筆不可避免的<strong>交易隱形成本（Transaction Cost）</strong>！
            </li>
          </ul>
        </div>

        <!-- 限價單 vs 市價單 -->
        <div class="grid-2">
          <div class="card">
            <div class="card-title">
              <span>掛單者 / 流動性提供者</span>
              <span class="en-term">Limit Orders &amp; Makers</span>
            </div>
            <p><strong>掛上釣鉤耐心等待：</strong></p>
            <p>輸入「特定價格」的委託單（例如：我想在 $50.00 買入 500 股）。你的委託會進入<strong>限價訂單簿（Limit Order Book）</strong>，為市場增添了流動性（Liquidity Provider），賺取價差或交易所的造市回饋。</p>
          </div>
          <div class="card">
            <div class="card-title">
              <span>吃單者 / 流動性消耗者</span>
              <span class="en-term">Market Orders &amp; Takers</span>
            </div>
            <p><strong>立即成交不計代價：</strong></p>
            <p>輸入「市價買進/賣出」，系統立即依照目前訂單簿上最好的現有價格瞬間撮合。你消耗了市場上的流動性（Liquidity Taker），必須承擔買賣價差與滑價成本。</p>
          </div>
        </div>

        <!-- 互動元件 3：限價訂單簿與市價吃單模擬器 -->
        <div class="interactive-widget" id="widget-orderbook">
          <div class="widget-header">
            <div class="widget-title">
              <span>⚡ 互動實驗室 3</span> 限價訂單簿 (Limit Order Book) 與買賣價差即時動態模擬
            </div>
            <span class="widget-badge">Live Market Widget</span>
          </div>
          <p style="font-size: 0.95rem; color: var(--muted); margin-bottom: 1.2rem;">
            下圖展示了典型股票（如思科 Cisco, CSCO）的即時深層訂單簿。試著下一筆<strong>市價單</strong>，親眼見證流動性如何被消耗、價差如何跳動！
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; background: #0f172a; color: #ffffff; padding: 1.5rem; border-radius: 8px;">
            <div>
              <h4 style="color: #4ade80; margin: 0 0 0.8rem; border-bottom: 1px solid #334155; padding-bottom: 0.4rem;">
                🟢 買盤深度 (Bid / 限價買單)
              </h4>
              <div id="bid-book-list" style="font-family: monospace; font-size: 0.95rem;">
                <!-- 買單列表動態生成 -->
              </div>
            </div>
            <div>
              <h4 style="color: #f87171; margin: 0 0 0.8rem; border-bottom: 1px solid #334155; padding-bottom: 0.4rem;">
                🔴 賣盤深度 (Ask / 限價賣單)
              </h4>
              <div id="ask-book-list" style="font-family: monospace; font-size: 0.95rem;">
                <!-- 賣單列表動態生成 -->
              </div>
            </div>
          </div>

          <div style="margin-top: 1.2rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
            <div>
              <span style="font-weight:700;">目前最優 Bid:</span> <span id="best-bid-val" style="color: #16a34a; font-weight:800; font-size:1.1rem;">$43.83</span> ｜
              <span style="font-weight:700;">目前最優 Ask:</span> <span id="best-ask-val" style="color: #dc2626; font-weight:800; font-size:1.1rem;">$43.85</span> ｜
              <span style="font-weight:700;">目前價差:</span> <span id="spread-val" style="color: var(--gold); font-weight:800;">$0.02</span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-calc" style="background:#dc2626;" onclick="executeMarketBuy(200)">
                🛒 市價買進 200 股
              </button>
              <button class="btn-calc" style="background:#475569;" onclick="resetOrderBook()">
                🔄 重置訂單簿
              </button>
            </div>
          </div>
          <div id="trade-log" style="margin-top: 1rem; font-size: 0.9rem; color: #475569; background: #f8fafc; padding: 0.8rem; border-radius: 6px; display: none;"></div>
        </div>

        <!-- 暗池、高頻交易與金融科技 -->
        <h3>🌑 暗池 (Dark Pools)、高頻交易 (HFT) 與金融科技崛起</h3>
        <div class="grid-2">
          <div class="card">
            <div class="card-title">
              <span>暗池交易系統</span>
              <span class="en-term">Dark Pools</span>
            </div>
            <p><strong>避開聚光燈的深海巨鯨：</strong></p>
            <p>
              當大型機構法人（如退休基金、主權基金）想一次買賣 50 萬股時，如果直接在公開交易所掛出大單，市場會立刻被嚇壞、引起股價劇烈不利波動。
            </p>
            <p>
              <strong>暗池（Dark Pools）</strong>不公開訂單簿深度。買賣雙方以報價中位數（Midpoint）撮合，既省下了買賣價差，又保護了大戶的交易意圖不被刺探；但缺點是<strong>不保證能完全成交</strong>。
            </p>
          </div>

          <div class="card">
            <div class="card-title">
              <span>高頻交易</span>
              <span class="en-term">High-Frequency Trading (HFT)</span>
            </div>
            <p><strong>以微秒為單位的演算法競賽：</strong></p>
            <p>
              現代市場中，超過一半以上的流動性來自電腦演算法與高頻交易商。他們不斷利用極速光纖與微波通訊，在千分之一秒內掛單、取消、跨市場套利。
            </p>
            <p>
              <strong>過期掛單風險（Stale Limit Orders）：</strong>當新重大消息公布時，反應慢的人類掛單會瞬間被高頻機器人吃光，逼得市場流動性提供者必須以奈秒等級的速度撤單與調價。
            </p>
          </div>
        </div>

        <!-- 互動元件 4：Fintech 新興金融創新版圖 -->
        <div class="interactive-widget" id="widget-fintech">
          <div class="widget-header">
            <div class="widget-title">
              <span>📱 互動實驗室 4</span> 金融科技 (Fintech) 四大破壞式創新全息圖
            </div>
            <span class="widget-badge">Ecosystem</span>
          </div>
          <p style="font-size: 0.95rem; color: var(--muted); margin-bottom: 1.2rem;">
            金融業為什麼總是擁抱尖端科技的第一線？點擊查看課本重點提及的四大新創如何顛覆傳統銀行！
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div class="card" style="cursor:pointer;" onclick="showFintech('wealthfront')">
              <div class="card-title">🤖 智能理財顧問</div>
              <p><strong>代表：Wealthfront</strong><br>低成本演算法被動投資與全自動節稅收割。</p>
            </div>
            <div class="card" style="cursor:pointer;" onclick="showFintech('lendingtree')">
              <div class="card-title">🤝 貸款撮合平台</div>
              <p><strong>代表：LendingTree</strong><br>打破銀行資訊不對稱，一次比價千家房貸與信貸。</p>
            </div>
            <div class="card" style="cursor:pointer;" onclick="showFintech('metromile')">
              <div class="card-title">🚗 里程動態保險</div>
              <p><strong>代表：Metromile</strong><br>車聯網感測器依實際行駛里程即時計算車險保費。</p>
            </div>
            <div class="card" style="cursor:pointer;" onclick="showFintech('acorns')">
              <div class="card-title">🪙 零錢微型投資</div>
              <p><strong>代表：Acorns</strong><br>刷卡消費自動四捨五入零錢，滴水穿石投入全球 ETF。</p>
            </div>
          </div>
          <div id="fintech-detail" style="margin-top: 1.2rem; padding: 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; display: none;"></div>
        </div>
      </section>

      <!-- 第五節：課後必修習題詳解 -->
      <section id="sec-problems">
        <h2>1.5 課堂與試煉之巔：課後精選練習全題解 (Problems 1 ～ 21)</h2>
        <p>
          課堂理論是招式，實戰解題是內力！以下為 Berk &amp; DeMarzo 官方課後經典習題的完整中文解析與白話透視。點擊按鈕即可查看詳盡推導：
        </p>

        <!-- 區塊一：企業型態與稅制 -->
        <h3 style="color: var(--accent-dark); border-bottom: 2px solid var(--line); padding-bottom: 0.4rem;">
          第一單元：四種企業組織型態與雙重稅負 (Problems 1 ～ 7)
        </h3>

        <!-- Problem 1 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 1</span>
            <span>股份有限公司與所有其他組織型態之間，最核心的本質差異是什麼？</span>
          </div>
          <p><em>What is the most important difference between a corporation and all other organizational forms?</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-1')">💡 展開掌櫃題解思路</button>
          <div id="sol-1" class="solution-body">
            <p><strong>【核心解答】</strong></p>
            <p>
              最核心的差異在於：<strong>公司在法律上是一個完全獨立於其擁有者之外的「獨立法人實體（A legally distinct entity from its owners）」</strong>。
            </p>
            <p><strong>【白話深度解析】</strong></p>
            <p>
              獨資與合夥就像「靈魂與肉體綁定」——店長或合夥人犯錯、借錢，個人財產必須全數奉陪。而公司就像人類創造出的「魔法機器人」，機器人可以去銀行借錢、簽訂合約、甚至被告，擁有自己的資產與負債。如果機器人破產了，債權人只能查封機器人名下的零件，絕對不能去找製造並持有股份的股東討家裡的房子！這直接衍生了<strong>有限責任</strong>與<strong>所有權自由轉讓</strong>兩大劃時代特權。
            </p>
          </div>
        </div>

        <!-- Problem 2 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 2</span>
            <span>在公司語境下，「有限責任 (Limited Liability)」究竟是什麼意思？</span>
          </div>
          <p><em>What does the phrase limited liability mean in a corporate context?</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-2')">💡 展開掌櫃題解思路</button>
          <div id="sol-2" class="solution-body">
            <p><strong>【核心解答】</strong></p>
            <p>
              「有限責任」意味著公司的股東（擁有者）<strong>對公司的債務或違約責任不負擔個人償還責任</strong>。股東最大的潛在財務損失，僅限於他們最初投入該公司購買股票的<strong>投資金額（本金）</strong>。
            </p>
            <p><strong>【生活比喻】</strong></p>
            <p>
              你去冒險者公會買了 100 枚金幣的「飛空艇商社股票」。哪怕這艘飛空艇在空中失事砸爛了整座城鎮、欠下十億金幣的巨債，法官也最多只能讓你的 100 枚金幣泡湯歸零，絕不可能抄你的家、叫你賣血還債！這就是有限責任的強大保護傘。
            </p>
          </div>
        </div>

        <!-- Problem 3 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 3</span>
            <span>在常見的組織型態中，哪些型態能為其擁有者提供有限責任保護？</span>
          </div>
          <p><em>Which organizational forms give their owners limited liability?</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-3')">💡 展開掌櫃題解思路</button>
          <div id="sol-3" class="solution-body">
            <p><strong>【核心解答】</strong></p>
            <ul>
              <li><strong>股份有限公司（Corporations）：</strong>全體股東（無論持股多寡）皆享有 100% 有限責任。</li>
              <li><strong>有限責任公司（Limited Liability Companies, LLCs）：</strong>所有成員（Members）皆享有有限責任。</li>
              <li><strong>有限合夥企業（Limited Partnerships, LPs）的有限合夥人（LPs）：</strong>有限合夥人享有有限責任（但普通合夥人 GP 仍須承擔無限責任）。</li>
              <li><strong>有限責任合夥（LLP）：</strong>專業合夥人對其他合夥人的過失享有責任屏蔽。</li>
            </ul>
          </div>
        </div>

        <!-- Problem 4 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 4</span>
            <span>將企業組織成股份有限公司（Corporation），主要優點與缺點各是什麼？</span>
          </div>
          <p><em>What are the main advantages and disadvantages of organizing a firm as a corporation?</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-4')">💡 展開掌櫃題解思路</button>
          <div id="sol-4" class="solution-body">
            <p><strong>【優點 Advantages】</strong></p>
            <ol>
              <li><strong>全員有限責任：</strong>吸引全球廣泛投資人放膽出資。</li>
              <li><strong>流動性與所有權自由轉讓：</strong>股票可上市自由掛牌買賣，不影響企業營運。</li>
              <li><strong>無限壽命（Perpetual Existence）：</strong>不受創辦人生老病死限制，可代代傳承。</li>
              <li><strong>巨額融資能力：</strong>具備向全球發行股權與公司債的強大資本動員力。</li>
            </ol>
            <p><strong>【缺點 Disadvantages】</strong></p>
            <ol>
              <li><strong>雙重課稅（Double Taxation）：</strong>傳統 C-Corp 利潤需先課企業稅，配發股利再課個人稅。</li>
              <li><strong>設立與合規成本高昂：</strong>法律程序複雜，需要龐大的審計、法遵與揭露成本。</li>
              <li><strong>委託代理問題（Agency Problems）：</strong>所有權與經營權分離，經理人可能損公肥私。</li>
            </ol>
          </div>
        </div>

        <!-- Problem 5 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 5</span>
            <span>解釋 S 型公司 (S Corporation) 與 C 型公司 (C Corporation) 之間的關鍵差別。</span>
          </div>
          <p><em>Explain the difference between an S corporation and a C corporation.</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-5')">💡 展開掌櫃題解思路</button>
          <div id="sol-5" class="solution-body">
            <p><strong>【核心解答】</strong></p>
            <p>關鍵差別在於<strong>課稅機制（Tax Status）</strong>以及<strong>擁有權資格限制（Ownership Restrictions）</strong>：</p>
            <ul>
              <li><strong>C 型公司：</strong>是標準的公司形式，受雙重課稅規範（企業層級繳納所得稅，發放股利時股東再繳納個人稅）。其股東資格無限制，可公開發行股票給全球投資人或法人。</li>
              <li><strong>S 型公司：</strong>選擇依據美國國內稅法 Subchapter S 課稅，享有<strong>單一穿透課稅待遇（Pass-through Tax Status）</strong>，企業層級完全免稅，盈餘直接穿透給股東申報個人稅。但代價是嚴格限制：股東上限 100 人、必須是美國自然人居民、僅能發行一種普通股。</li>
            </ul>
          </div>
        </div>

        <!-- Problem 6 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 6</span>
            <span>C 型公司雙重課稅計算：每股盈餘 $2、企業稅率 40%、個人所得稅率 30%，稅後實拿多少？</span>
          </div>
          <p><em>You are a shareholder in a C corporation. The corporation earns $2 per share before taxes... Corporate tax rate is 40% and personal tax rate is 30%. How much is left for you after all taxes are paid?</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-6')">💡 展開掌櫃題解思路</button>
          <div id="sol-6" class="solution-body">
            <p><strong>【兩階段課稅推導】</strong></p>
            <ol>
              <li>
                <strong>第一階段：公司繳納企業所得稅</strong>
                $$\text{Corporate Tax} = \$2.00 \times 40\% = \$0.80$$
                公司繳稅後的每股剩餘利潤（可作為股利發放）：
                $$\text{Dividend Distributed} = \$2.00 - \$0.80 = \mathbf{\$1.20}$$
              </li>
              <li>
                <strong>第二階段：股東繳納個人所得稅</strong>
                股東收到 \$1.20 的股利，繳納 30% 個人所得稅：
                $$\text{Personal Tax} = \$1.20 \times 30\% = \$0.36$$
                股東最終留在口袋的淨現金：
                $$\text{Net Cash to Shareholder} = \$1.20 - \$0.36 = \mathbf{\$0.84}$$
              </li>
            </ol>
            <p><strong>【掌櫃心算法門】</strong></p>
            <p>
              $$\text{Net Cash} = \$2.00 \times (1 - 0.40) \times (1 - 0.30) = \$2.00 \times 0.60 \times 0.70 = \mathbf{\$0.84}$$
              實質有效總稅率高達：
              $$1 - (0.60 \times 0.70) = 1 - 0.42 = \mathbf{58\%} \quad \text{（賺 2 塊錢，被各級政府拿走 1.16 元！）}$$
            </p>
          </div>
        </div>

        <!-- Problem 7 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 7</span>
            <span>續上題，若該公司改為 S 型公司，股東稅後能留下多少？</span>
          </div>
          <p><em>Repeat Problem 6 assuming the corporation is an S corporation.</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-7')">💡 展開掌櫃題解思路</button>
          <div id="sol-7" class="solution-body">
            <p><strong>【穿透課稅推導】</strong></p>
            <ol>
              <li>S 型公司免繳企業所得稅（Corporate Tax = $0）。</li>
              <li>全部每股稅前盈餘 \$2.00 直接穿透至股東個人，作為個人收入課稅。</li>
              <li>
                股東繳納個人所得稅：
                $$\text{Personal Tax} = \$2.00 \times 30\% = \$0.60$$
              </li>
              <li>
                股東最終留在口袋的淨現金：
                $$\text{Net Cash to Shareholder} = \$2.00 - \$0.60 = \mathbf{\$1.40}$$
              </li>
            </ol>
            <p><strong>【對比震撼結論】</strong></p>
            <p>
              在相同的獲利與個人稅率下，S 型公司讓股東拿到了 <strong>$1.40</strong>，相比 C 型公司的 <strong>$0.84</strong>，足足多了 <strong>$0.56</strong>（收益提升了 $66.7\%$）！這就是為什麼符合資格的中小型冒險公會拼了命也要申請 S-Corp 的原因。
            </p>
          </div>
        </div>

        <!-- 區塊二：所有權與控制權、財務決策與代理人問題 -->
        <h3 style="color: var(--accent-dark); border-bottom: 2px solid var(--line); padding-bottom: 0.4rem; margin-top: 3rem;">
          第二單元：所有權與控制權、財務長三大決策與代理人問題 (Problems 8 ～ 13)
        </h3>

        <!-- Problem 8 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 8</span>
            <span>創立 iPhone App 開發新創：請各舉出創辦人必須面對的三大類財務決策。</span>
          </div>
          <p><em>You have decided to form a new start-up company developing applications for the iPhone. Give examples of the three distinct types of financial decisions you will need to make.</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-8')">💡 展開掌櫃題解思路</button>
          <div id="sol-8" class="solution-body">
            <p>作為一名新創大掌櫃，你必須做出的三大財務決策：</p>
            <ol>
              <li>
                <strong>投資決策（The Investment Decision / Capital Budgeting）：</strong><br>
                決定投入哪種類型的 App 研發？是否該添購高階伺服器與 MacBook 開發機？是否該購買某個圖像渲染引擎的永久商業授權？（將有限的資金投向報酬率高於資金成本的實體資產）
              </li>
              <li>
                <strong>融資決策（The Financing Decision / Capital Structure）：</strong><br>
                該如何籌募啟動資金？是讓天使投資人入股換取 20% 股權？還是向銀行申請青年創業抵押貸款？或者是自己刷信用卡承擔債務？（決定股權與債務的最佳槓桿比例）
              </li>
              <li>
                <strong>營運資金管理（The Cash Management / Working Capital Decision）：</strong><br>
                帳戶上該常備多少應急現金，以確保在 App 審核上架與廣告收益回款的 60 天空窗期內，伺服器不斷線、工程師不會因發不出薪水而集體跳槽？
              </li>
            </ol>
          </div>
        </div>

        <!-- Problem 9 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 9</span>
            <span>藥廠研發新藥享有專利保護期：這項公共政策如何使公司的自利目標與社會大眾的福祉保持一致？</span>
          </div>
          <p><em>Explain how this public policy of providing patent protection might help align the corporation's interests with society's interests.</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-9')">💡 展開掌櫃題解思路</button>
          <div id="sol-9" class="solution-body">
            <p><strong>【核心邏輯剖析】</strong></p>
            <p>
              研發一款全新特效藥需要耗費數十億美元、經歷十餘年臨床試驗，且伴隨極高的失敗風險。如果研發成功後任何小藥廠都能立刻抄襲低價仿製，原創公司將無法收回天價的研發成本，長此以往將沒有任何公司願意投錢研發救命藥。
            </p>
            <p>
              <strong>「專利權（Patent Protection）」</strong>賦予了藥廠在特定年限內（如 20 年）獨家生產與定價的壟斷特權，創造了可觀的經濟租金（Economic Profit）。這使得公司的<strong>自利目標（股東追求利潤最大化）</strong>與<strong>社會大眾的福祉（獲得拯救生命的突破性新藥）</strong>產生了強大的利益一致性！專利到期後，技術成為公共資產，全民更能享用廉價學名藥。
            </p>
          </div>
        </div>

        <!-- Problem 10 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 10</span>
            <span>既然公司經理人有可能為自身利益而背棄股東，股東能利用哪些機制激勵經理人忠誠？</span>
          </div>
          <p><em>Consider the corporate management team... What mechanisms are available to shareholders to help ensure that managers are motivated to act in the interests of shareholders?</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-10')">💡 展開掌櫃題解思路</button>
          <div id="sol-10" class="solution-body">
            <p>股東可以用來約束並激勵管理團隊的五大神兵利器：</p>
            <ol>
              <li><strong>股權連動薪酬（Stock Options &amp; Restricted Stock）：</strong>讓經理人變成股東。股價上漲，經理人身家水漲船高；股價崩盤，其期權形同廢紙。</li>
              <li><strong>董事會的直接監管與開除權（Board Oversight）：</strong>董事會定期審查經營成果，績效差的 CEO 隨時會被無情炒魷魚。</li>
              <li><strong>激進投資人與委託書爭奪戰（Proxy Fight）：</strong>不滿現狀的股東可聯合其他投資者，在股東大會發起罷免現任董事並指派新管理層。</li>
              <li><strong>外部敵意收購的威脅（Threat of Hostile Takeover）：</strong>股價低迷將引來併購狂鯊，一旦收購成功，原管理團隊立刻被掃地出門。</li>
              <li><strong>聲譽機制與經理人勞動市場（Managerial Labor Market）：</strong>治理聲譽不良的經理人將在市場上貶值，再也找不到下一份高薪工作。</li>
            </ol>
          </div>
        </div>

        <!-- Problem 11 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 11</span>
            <span>房客與房東的委託代理賽局：身為物業租賃公司，如何在租約中設計激勵條款避免房客破壞房屋？</span>
          </div>
          <p><em>You, the renter, can be viewed as an agent, and the company that owns the apartment can be viewed as the principal... What features would you put into the lease agreement that would give the renter incentives to take care of the apartment?</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-11')">💡 展開掌櫃題解思路</button>
          <div id="sol-11" class="solution-body">
            <p><strong>【委託代理角色對應】</strong></p>
            <ul>
              <li><strong>委託人（Principal）：</strong>公寓擁有者（房東/租賃公司），希望房子完好無損、維持高資產價值。</li>
              <li><strong>代理人（Agent）：</strong>房客，擁有房屋的使用控制權，但因不是產權所有人，缺乏精心維護的內在動機（道德風險 Moral Hazard）。</li>
            </ul>
            <p><strong>【激勵條款設計方案】</strong></p>
            <ol>
              <li><strong>押金抵押制（Security Deposit）：</strong>要求入住前繳納 2 個月租金的押金。退租時經檢查無損全額退還，若有損壞或髒亂則直接從押金中扣除修復費用（最經典的財務激勵）。</li>
              <li><strong>房屋維護良好退現獎勵（Good Maintenance Rebate）：</strong>若連續租滿一年且未通報任何因人為疏忽導致的管線故障，租賃公司給予最後一個月租金 10% 折扣。</li>
              <li><strong>強制購買租客責任險（Renter's Insurance Requirement）：</strong>轉嫁重大災害風險。</li>
              <li><strong>定期 inspection 檢修協議：</strong>每半年技術人員進場例行保養冷氣設備並核查屋況。</li>
            </ol>
          </div>
        </div>

        <!-- Problem 12 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 12</span>
            <span>CEO 考慮併購同業並獲任新合併巨型公司 CEO：這其中潛藏著怎樣的代理人道德風險？</span>
          </div>
          <p><em>You are the CEO of a company and considering entering into an agreement to have another company acquire yours... You know when company gets bigger, CEO compensation typically increases. What ethical dilemma do you face?</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-12')">💡 展開掌櫃題解思路</button>
          <div id="sol-12" class="solution-body">
            <p><strong>【道德與利益衝突的核心】</strong></p>
            <p>
              身為 CEO，你面臨著嚴重的<strong>個人自利 vs 股東信託責任（Fiduciary Duty）</strong>的利益衝突：
            </p>
            <ul>
              <li><strong>個人利益：</strong>掌管合併後規模大一倍的巨型公司，你的社會聲望、權力以及未來的薪酬獎金將顯著暴增。</li>
              <li><strong>股東利益：</strong>這樁併購案對你目前的股東而言真的是划算的交易嗎？收購價格是否充分反映了公司的真實內在價值？若合併缺乏策略綜效，甚至會摧毀股東未來的權益。</li>
            </ul>
            <p><strong>【倫理抉擇】</strong></p>
            <p>
              若該併購的收購價格過低、損害股東利益，但只要答應你就能升官發財，你是否有勇氣斷然拒絕？在現代公司治理中，此時 CEO 必須向董事會完全揭露其潛在利益衝突，並成立由獨立董事組成的特別委員會（Special Committee），由外部獨立財務顧問公正評估收購條款是否符合股東最佳利益。
            </p>
          </div>
        </div>

        <!-- Problem 13 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 13</span>
            <span>敵意收購 (Hostile Takeover) 對公司或其投資人而言一定是壞事嗎？為什麼？</span>
          </div>
          <p><em>Are hostile takeovers necessarily bad for firms or their investors? Explain.</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-13')">💡 展開掌櫃題解思路</button>
          <div id="sol-13" class="solution-body">
            <p><strong>【核心解答：絕對不是壞事，往往反而是投資人的救星！】</strong></p>
            <p>
              很多人被「敵意（Hostile）」這個詞嚇到了。事實上，所謂的「敵意」，僅僅是指這場收購<strong>違背了「現任管理團隊」的意願</strong>，因為收購方通常打算在接管後立刻把這群屍位素餐的高層解雇！
            </p>
            <p><strong>【對投資人與經濟的好處】</strong></p>
            <ol>
              <li><strong>巨額溢價收益（Takeover Premium）：</strong>收購方通常必須以高於當前市價 20% ～ 50% 的溢價收購目標公司股票，被收購公司的原有股東能立即獲得豐厚利潤。</li>
              <li><strong>打破治理殭局、釋放沉睡價值：</strong>只有當一家公司的現任管理層表現極差、資源配置浪費導致股價被嚴重低估時，才會引來敵意收購者。收購後換上強勢管理團隊整頓營運，有助於企業資源回歸最高效運用。</li>
              <li><strong>對全市場經理人的外部威懾：</strong>就像巡弋在公海上的鯊魚，逼迫所有上市公司 CEO 不敢懈怠，否則隨時會被吞噬。</li>
            </ol>
          </div>
        </div>

        <!-- 區塊三：股票市場、微觀結構與金融科技 -->
        <h3 style="color: var(--accent-dark); border-bottom: 2px solid var(--line); padding-bottom: 0.4rem; margin-top: 3rem;">
          第三單元：股票市場結構、訂單簿微觀運作與金融科技 (Problems 14 ～ 21)
        </h3>

        <!-- Problem 14 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 14</span>
            <span>公開上市公司 (Public Corporation) 與 私人未上市公司 (Private Corporation) 的本質差異為何？</span>
          </div>
          <p><em>What is the difference between a public and a private corporation?</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-14')">💡 展開掌櫃題解思路</button>
          <div id="sol-14" class="solution-body">
            <p><strong>【核心解答】</strong></p>
            <ul>
              <li><strong>公開上市公司（Public Corporation）：</strong>其股票在公開的有組織證券交易所（如 NYSE、NASDAQ 或台灣證交所）掛牌上市交易。任何社會大眾都能自由買賣，股東數量通常成千上萬；代價是必須嚴格遵守政府監管法規，按季公開揭露經過審計的財務報表。</li>
              <li><strong>私人未上市公司（Private Corporation）：</strong>其股份未在公開交易所上市，通常由創辦人家族、特定員工或少數創投（VC）私募機構持有。股東數量受法律嚴格限制，股票流動性極低（無法隨時變現），且無須向社會大眾公開詳細財務機密。</li>
            </ul>
          </div>
        </div>

        <!-- Problem 15 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 15</span>
            <span>描述過去幾十年間全球股票市場發生的最重大結構性變革。</span>
          </div>
          <p><em>Describe the important changes that have occurred in stock markets over the last decade.</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-15')">💡 展開掌櫃題解思路</button>
          <div id="sol-15" class="solution-body">
            <p>過去幾十年股票市場經歷了天翻地覆的「三大科技革命」：</p>
            <ol>
              <li><strong>全面電子化與實體交易廳的沒落：</strong>從前穿著紅藍背心在曼哈頓交易大廳揮舞手勢的人工喊價制度，幾乎完全被電腦伺服器、高速撮合引擎與電子通訊網絡（ECN）取代。</li>
              <li><strong>市場高度碎片化（Market Fragmentation）：</strong>從前一檔股票幾乎只能在特定的單一交易所交易。如今在美國，一檔股票可以同時在十幾個公開交易所與 40 多個替代交易系統（如暗池 Dark Pools）同步競價。</li>
              <li><strong>演算法與高頻交易（Algorithmic &amp; High-Frequency Trading）的統治：</strong>流動性提供的主力由傳統肉身造市商（Specialists）轉移到依賴超高速光纖與複雜演算法的量化交易商手中，交易速度達到微秒（百萬分之一秒）甚至奈秒級別。</li>
            </ol>
          </div>
        </div>

        <!-- Problem 16 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 16</span>
            <span>為什麼買賣價差 (Bid-Ask Spread) 本質上是一種交易成本 (Transaction Cost)？</span>
          </div>
          <p><em>Explain why the bid-ask spread is a transaction cost.</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-16')">💡 展開掌櫃題解思路</button>
          <div id="sol-16" class="solution-body">
            <p><strong>【核心邏輯演示】</strong></p>
            <p>
              想像一檔股票當前的報價為：買價 $\text{Bid} = \$50.00$，賣價 $\text{Ask} = \$50.05$。
            </p>
            <p>
              如果你下一筆市價買單，你必須以較高的價格 <strong>\$50.05</strong> 買入；但如果買進後一秒鐘你立刻反悔、下市價單把股票賣掉，你只能以較低的價格 <strong>\$50.00</strong> 賣給市場。
            </p>
            <p>
              在這一進一出之間，儘管股票的基本面完全沒有變化，你卻瞬間淨虧損了：
              $$\$50.05 - \$50.00 = \mathbf{\$0.05}$$
              這 0.05 元正是買賣價差，它從你的口袋轉移到了提供即時撮合服務的造市商手中。因此，買賣價差是投資人為了獲取「即時變現流動性」而向市場支付的摩擦成本！
            </p>
          </div>
        </div>

        <!-- Problem 17 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 17</span>
            <span>在當今高度電子化的股票市場中，買賣價差是如何被決定的？</span>
          </div>
          <p><em>Explain how the bid-ask spread is determined in most markets today.</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-17')">💡 展開掌櫃題解思路</button>
          <div id="sol-17" class="solution-body">
            <p><strong>【核心解答】</strong></p>
            <p>
              在現代電子限價訂單簿（Limit Order Book）中，買賣價差是由<strong>所有掛在系統中的限價委託單共同競價決定的</strong>：
            </p>
            <ul>
              <li><strong>最優買價（Best Bid）：</strong>目前市場上所有未成交的買進限價單中的<strong>最高出價者</strong>。</li>
              <li><strong>最優賣價（Best Ask）：</strong>目前市場上所有未成交的賣出限價單中的<strong>最低要價者</strong>。</li>
            </ul>
            <p>
              這兩者之間的差額即為價差。交易極其活絡、交易量龐大的熱門大型股（如蘋果、微軟），買賣雙方競爭激烈，價差通常縮小至法定最小跳動單位 <strong>\$0.01（1 美分）</strong>；而冷門股或交易量清淡的股票，因為造市商承擔的存貨滯銷與過期風險較高，價差會顯著擴大。
            </p>
          </div>
        </div>

        <!-- Problem 18 & 19 (OCR 深度還原重構) -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 18 &amp; 19</span>
            <span>實戰訂單簿微觀撮合：思科 (Cisco Systems, CSCO) 深度行情分析題</span>
          </div>
          <p>
            <em>
              假設在某交易時刻，電子訂單簿上顯示思科（CSCO）的即時深層掛單數據如下：<br>
              <strong>買盤 (Bids)：</strong>43.83 (100股), 43.82 (300股), 43.80 (500股)<br>
              <strong>賣盤 (Asks)：</strong>43.85 (100股), 43.87 (200股), 43.89 (400股)
            </em>
          </p>
          <p><strong>問題：</strong></p>
          <ol type="a">
            <li>當前市場上的 Best Bid 與 Best Ask 分別是多少？買賣價差是多少？</li>
            <li>如果此時來了一筆<strong>市價買單 200 股（Market Order to Buy 200 shares）</strong>，這筆訂單將以什麼平均價格成交？</li>
            <li>在上述 200 股買單成交後，市場上最新的 Best Bid、Best Ask 以及買賣價差變成了多少？</li>
          </ol>
          <button class="solution-toggle" onclick="toggleSolution('sol-18')">💡 展開掌櫃題解思路</button>
          <div id="sol-18" class="solution-body">
            <p><strong>【第一步：判讀當前盤口】</strong></p>
            <ul>
              <li><strong>最優買價 Best Bid：</strong>\$43.83（排在買一的最高價）</li>
              <li><strong>最優賣價 Best Ask：</strong>\$43.85（排在賣一的最低價）</li>
              <li><strong>買賣價差 Spread：</strong>$$\text{Spread} = \$43.85 - \$43.83 = \mathbf{\$0.02}$$</li>
            </ul>

            <p><strong>【第二步：撮合 200 股吃單 (Walking the Book)】</strong></p>
            <p>
              市價買單需要吃掉市場上的賣盤（Asks）：
            </p>
            <ol>
              <li>先吃掉賣一的所有份額：以 <strong>\$43.85</strong> 買入 100 股，總花費 $\$43.85 \times 100 = \$4,385$。</li>
              <li>還剩 100 股的需求，往上吃賣二：以 <strong>\$43.87</strong> 買入剩下的 100 股，總花費 $\$43.87 \times 100 = \$4,387$。</li>
              <li>
                <strong>平均成交價格：</strong>
                $$\text{Average Price} = \frac{\$4,385 + \$4,387}{200} = \frac{\$8,772}{200} = \mathbf{\$43.86}$$
              </li>
            </ol>

            <p><strong>【第三步：成交後的訂單簿殘局】</strong></p>
            <ul>
              <li>買盤完全沒動，<strong>Best Bid 依然為：\$43.83</strong>。</li>
              <li>賣盤原本 \$43.85 的 100 股已被完全吃光；原本 \$43.87 的 200 股被吃掉 100 股，還剩下 100 股掛在 \$43.87。</li>
              <li>因此，<strong>新的 Best Ask 上移為：\$43.87</strong>。</li>
              <li><strong>最新買賣價差：</strong>$$\text{New Spread} = \$43.87 - \$43.83 = \mathbf{\$0.04}$$（因流動性被消耗，盤面價差擴大！）</li>
            </ul>
          </div>
        </div>

        <!-- Problem 20 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 20</span>
            <span>為什麼金融業在歷史上始終是擁抱與採納新科技的先行者？</span>
          </div>
          <p><em>Why has finance historically been an early adopter of new technology?</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-20')">💡 展開掌櫃題解思路</button>
          <div id="sol-20" class="solution-body">
            <p><strong>【核心解答】</strong></p>
            <p>金融業之所以能永遠走在科技應用的最尖端，源於金融產品的三大本質特徵：</p>
            <ol>
              <li>
                <strong>金融資產的本質純粹是「資訊（Pure Information）」：</strong><br>
                股票、債券、貨幣與衍生品沒有實體形體，本質上只是記帳代碼與法律契約。這意味著金融交易能夠以光速進行完全無實體摩擦的數位化傳輸。
              </li>
              <li>
                <strong>「時間就是金錢」的極致金錢利益：</strong><br>
                在金融市場中，提早一毫秒獲得新聞、或者快一微秒完成套利，就能瞬間掠奪數百萬美元的利潤。這種巨大的經濟誘因促使金融機構不惜代價投資最早期的電報、跨大西洋海底電纜、超級電腦甚至低延遲微波發射塔。
              </li>
              <li>
                <strong>規模經濟與邊際成本趨近於零：</strong><br>
                用軟體伺服器管理 1,000 萬美元與管理 100 億美元的系統架構基本相同，新科技能帶來驚人的運營槓桿效率。
              </li>
            </ol>
          </div>
        </div>

        <!-- Problem 21 -->
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">Problem 21</span>
            <span>金融科技新物種拆解：四大新創如何利用科技革新金融服務？</span>
          </div>
          <p><em>How are the following companies utilizing new technology in the provision of financial services?</em></p>
          <p><em>(a) Wealthfront &emsp; (b) LendingTree &emsp; (c) Metromile &emsp; (d) Acorns</em></p>
          <button class="solution-toggle" onclick="toggleSolution('sol-21')">💡 展開掌櫃題解思路</button>
          <div id="sol-21" class="solution-body">
            <p>課本精選的四大 Fintech 先鋒破壞式創新分析：</p>
            <ol type="a">
              <li>
                <strong>Wealthfront（機器人理財 / 智能投顧 Robo-Advisor）：</strong><br>
                利用現代投資組合理論（MPT）演算法替代傳統昂貴的私人理財專員，依據用戶的風險偏好自動建立、動態再平衡全球低成本 ETF 組合，並提供全自動的<strong>稅務虧損收割（Daily Tax-Loss Harvesting）</strong>，將財富管理平民化。
              </li>
              <li>
                <strong>LendingTree（線上金融比價與撮合市集）：</strong><br>
                透過網際網路平台匯聚數千家金融機構的房貸、車貸、個人信貸資訊。借款人填妥一次申請，即可在線瞬間獲得多家放款銀行的競價條件，消除了傳統借貸的資訊不對稱與繁複比價成本。
              </li>
              <li>
                <strong>Metromile（遠距感測與里程計費保險 Pay-Per-Mile Car Insurance）：</strong><br>
                在客戶車內安裝小型 OBD-II 智慧遠程感測裝置，即時追蹤實際行駛里程數。計費公式為「低月租底價 + 實際開車每英里幾美分」，打破傳統保險依年齡性別的粗糙定價，讓少開車的通勤族保費大幅下降 40% 以上。
              </li>
              <li>
                <strong>Acorns（微型自動儲蓄與碎股投資 Micro-Investing）：</strong><br>
                透過手機 App 連結消費者的信用卡或簽帳卡。每當用戶買一杯 $3.60 的咖啡時，系統自動四捨五入為 $4.00，將差額 $0.40 零錢自動存入並分批定投購買碎片化的多元化指數基金，利用「無痛自動化零錢積蓄」幫助年輕人跨越投資門檻。
              </li>
            </ol>
          </div>
        </div>

      </section>

      <!-- 總結與記憶膠囊 -->
      <section id="summary">
        <div class="story-card" style="border-left-color: var(--gold); background: linear-gradient(145deg, #ffffff 0%, var(--gold-light) 100%);">
          <div class="story-header" style="color: #92400e;">
            <span>💎</span> 冒險者公會大掌櫃的「Chapter 1 核心記憶膠囊」
          </div>
          <ol>
            <li><strong>企業四大血統：</strong>獨資（一人無限責任）、合夥（GP無限/LP有限）、LLC（全員有限+單一穿透課稅）、股份有限公司（法人獨立+全員有限責任+永續經營）。</li>
            <li><strong>課稅分水嶺：</strong>大型 C-Corp 面臨<strong>雙重課稅</strong>（企業利潤課一次，股東股利再課一次）；S-Corp 享有<strong>穿透單一課稅</strong>，但受限 100 名自然人股東與單一普通股。</li>
            <li><strong>治理與代理難題：</strong>股東（所有人）委任董事會選聘 CEO 與 CFO（經營者）。當經理人以私利為先時產生<strong>代理人問題</strong>；外部透過股權激勵、敵意收購威脅、陶德-弗蘭克法案（Say-on-Pay）進行抗衡約束。</li>
            <li><strong>資本微觀水脈：</strong>初級市場（IPO 發行籌資）創造新股，次級市場（交易所/暗池）提供巨額<strong>流動性</strong>；買賣價差（Bid-Ask Spread）是流動性提供者的補償與散戶的摩擦成本。</li>
          </ol>
        </div>
      </section>

    </main>

    <!-- 側邊目錄導航 -->
    <aside class="toc-sidebar">
      <div class="toc-title">
        <span>📖</span> 本章探險章節目錄
      </div>
      <ul class="toc-list">
        <li><a href="#prologue">0. 大掌櫃開篇引言</a></li>
        <li><a href="#sec-1">1.1 四大企業組織型態</a></li>
        <li><a href="#sec-2">1.2 雙重課稅 vs 穿透課稅</a></li>
        <li><a href="#widget-tax">└ 🧮 稅率實質試算機</a></li>
        <li><a href="#sec-3">1.3 所有權、控制權與代理困境</a></li>
        <li><a href="#widget-agency">└ 🎭 CEO 決策天人交戰</a></li>
        <li><a href="#sec-4">1.4 股票市場與訂單簿撮合</a></li>
        <li><a href="#widget-orderbook">└ ⚡ 即時訂單簿模擬器</a></li>
        <li><a href="#widget-fintech">└ 📱 金融科技新創版圖</a></li>
        <li><a href="#sec-problems">1.5 課後精選練習全題解</a></li>
        <li><a href="#summary">2.0 本章記憶膠囊</a></li>
      </ul>
    </aside>

  </div>

  <!-- 頁尾 -->
  <footer>
    <div style="max-width: 800px; margin: 0 auto;">
      <p>🌲 <strong>WikiTree Living Knowledge Ecosystem</strong> · 財務金融學智慧分枝</p>
      <p>教學對象：15 歲有志成為商業冒險傳奇的少年掌櫃 ｜ 標準 MathJax 3 雙保險渲染架構</p>
      <p style="font-size: 0.8rem; color: #64748b;">
        © 2026 Berk &amp; DeMarzo Corporate Finance Handout Collection. All rights reserved.
      </p>
    </div>
  </footer>

  <!-- 交互腳本邏輯 -->
  <script>
    // 展開 / 收合習題解答
    function toggleSolution(id) {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.style.display === "block") {
        el.style.display = "none";
      } else {
        el.style.display = "block";
        // 若 MathJax 存在，重新排版公式
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([el]);
        }
      }
    }

    // 互動 1：雙重課稅 vs 穿透課稅計算機
    function calculateTaxComparison() {
      const pretax = parseFloat(document.getElementById('tax-pretax').value) || 0;
      const tc = (parseFloat(document.getElementById('tax-corprate').value) || 0) / 100;
      const td = (parseFloat(document.getElementById('tax-dividend').value) || 0) / 100;
      const tp = (parseFloat(document.getElementById('tax-personal').value) || 0) / 100;

      // C-Corp 計算
      const corpTax = pretax * tc;
      const dividendDist = pretax - corpTax;
      const personalDivTax = dividendDist * td;
      const cCorpNet = dividendDist - personalDivTax;
      const cCorpEffTaxRate = ((pretax - cCorpNet) / pretax) * 100;

      // S-Corp 計算
      const sCorpPersonalTax = pretax * tp;
      const sCorpNet = pretax - sCorpPersonalTax;
      const sCorpEffTaxRate = tp * 100;

      const diff = sCorpNet - cCorpNet;

      const resBox = document.getElementById('tax-result');
      resBox.style.display = 'block';
      resBox.innerHTML = `
        <h4 style="margin: 0 0 0.8rem; color: var(--accent);">📊 模擬試算結果報告：</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div style="background:#ffffff; padding:0.8rem; border-radius:6px; border:1px solid #cbd5e1;">
            <strong style="color:#0369a1;">🏛️ C 型公司 (C-Corp 雙重課稅)：</strong><br>
            • 公司層級納稅：<strong>$${corpTax.toFixed(2)}</strong><br>
            • 股利分配額度：$${dividendDist.toFixed(2)}<br>
            • 股東個人繳納股利稅：<strong>$${personalDivTax.toFixed(2)}</strong><br>
            • <span style="font-size:1.1rem; color:var(--alert); font-weight:800;">股東實拿現金：$${cCorpNet.toFixed(2)}</span><br>
            • 實質有效總稅率：<strong>${cCorpEffTaxRate.toFixed(1)}%</strong>
          </div>
          <div style="background:#ffffff; padding:0.8rem; border-radius:6px; border:1px solid #cbd5e1;">
            <strong style="color:#15803d;">🛡️ S 型公司 (S-Corp 穿透免企業稅)：</strong><br>
            • 公司層級納稅：<strong>$0.00</strong><br>
            • 穿透課徵個人所得稅：<strong>$${sCorpPersonalTax.toFixed(2)}</strong><br>
            • <span style="font-size:1.1rem; color:var(--success); font-weight:800;">股東實拿現金：$${sCorpNet.toFixed(2)}</span><br>
            • 實質有效總稅率：<strong>${sCorpEffTaxRate.toFixed(1)}%</strong>
          </div>
        </div>
        <p style="margin: 1rem 0 0; font-weight:700; color:${diff >= 0 ? '#15803d' : '#b91c1c'};">
          ${diff >= 0 
            ? `💡 S-Corp 讓股東每股多賺了 $${diff.toFixed(2)} 元（收益增加 ${((diff/cCorpNet)*100).toFixed(1)}%）！` 
            : `💡 由於個人所得稅率設定過高，此情境下 C-Corp 反而保留較多利潤！`}
        </p>
      `;
    }

    // 互動 2：代理人選擇反饋
    function chooseAgency(opt) {
      const fb = document.getElementById('agency-feedback');
      fb.style.display = 'block';
      if (opt === 1) {
        fb.style.background = '#fee2e2';
        fb.style.border = '1px solid #fca5a5';
        fb.style.color = '#991b1b';
        fb.innerHTML = `<strong>⚠️ 警報！你觸發了典型代理人問題：</strong><br>
        雖然你的個人帝國擴張了、年薪加碼了，但股東因財富縮水 15% 而怒不可遏！激進對沖基金（Activist Hedge Fund）已在市場發動委託書爭奪戰，並聯絡了外國掠奪者準備發動「敵意收購」。你的 CEO 寶座岌岌可危！`;
      } else {
        fb.style.background = '#dcfce7';
        fb.style.border = '1px solid #86efac';
        fb.style.color = '#166534';
        fb.innerHTML = `<strong>🎉 精彩！展現了卓越的受託人素養：</strong><br>
        你拒絕了浮誇的帝國擴張，把資源投向高回報的研發。半年後公司公布亮眼財報，股價上漲 35%！你手中的股票期權大幅升值，股東在年會上起立為你鼓掌，並由薪酬委員會授予你更高額的長期股票獎勵！`;
      }
    }

    // 互動 3：限價訂單簿模擬
    let orderBook = {
      bids: [
        { price: 43.83, size: 100 },
        { price: 43.82, size: 300 },
        { price: 43.80, size: 500 }
      ],
      asks: [
        { price: 43.85, size: 100 },
        { price: 43.87, size: 200 },
        { price: 43.89, size: 400 }
      ]
    };

    function renderOrderBook() {
      const bidList = document.getElementById('bid-book-list');
      const askList = document.getElementById('ask-book-list');
      
      bidList.innerHTML = orderBook.bids.map((b, i) => 
        `<div style="display:flex; justify-content:space-between; padding:0.25rem 0; color:#86efac;">
          <span>[Bid ${i+1}] $${b.price.toFixed(2)}</span>
          <span>${b.size} 股</span>
        </div>`
      ).join('');

      askList.innerHTML = orderBook.asks.map((a, i) => 
        `<div style="display:flex; justify-content:space-between; padding:0.25rem 0; color:#fca5a5;">
          <span>[Ask ${i+1}] $${a.price.toFixed(2)}</span>
          <span>${a.size} 股</span>
        </div>`
      ).join('');

      const bestBid = orderBook.bids[0] ? orderBook.bids[0].price : 0;
      const bestAsk = orderBook.asks[0] ? orderBook.asks[0].price : 0;
      const spread = (bestAsk && bestBid) ? (bestAsk - bestBid) : 0;

      document.getElementById('best-bid-val').innerText = `$${bestBid.toFixed(2)}`;
      document.getElementById('best-ask-val').innerText = `$${bestAsk.toFixed(2)}`;
      document.getElementById('spread-val').innerText = `$${spread.toFixed(2)}`;
    }

    function executeMarketBuy(shares) {
      let needed = shares;
      let totalCost = 0;
      let fills = [];

      while (needed > 0 && orderBook.asks.length > 0) {
        let bestAsk = orderBook.asks[0];
        if (bestAsk.size <= needed) {
          fills.push({ price: bestAsk.price, size: bestAsk.size });
          totalCost += bestAsk.price * bestAsk.size;
          needed -= bestAsk.size;
          orderBook.asks.shift();
        } else {
          fills.push({ price: bestAsk.price, size: needed });
          totalCost += bestAsk.price * needed;
          bestAsk.size -= needed;
          needed = 0;
        }
      }

      renderOrderBook();

      const log = document.getElementById('trade-log');
      log.style.display = 'block';
      const avgPrice = (totalCost / shares).toFixed(2);
      log.innerHTML = `
        <strong>⚡ 市價買單撮合報告：</strong><br>
        成功買入 ${shares} 股！吃單明細：<br>
        ${fills.map(f => `• 以 $${f.price.toFixed(2)} 成交 ${f.size} 股`).join('<br>')}<br>
        <strong>總成交花費：$${totalCost.toFixed(2)} ｜ 平均每股成交價：$${avgPrice}</strong><br>
        <span style="color:var(--alert);">👀 觀察：賣盤最低檔被吃穿，新的 Best Ask 往上跳升，市場價差已擴大！</span>
      `;
    }

    function resetOrderBook() {
      orderBook = {
        bids: [
          { price: 43.83, size: 100 },
          { price: 43.82, size: 300 },
          { price: 43.80, size: 500 }
        ],
        asks: [
          { price: 43.85, size: 100 },
          { price: 43.87, size: 200 },
          { price: 43.89, size: 400 }
        ]
      };
      renderOrderBook();
      document.getElementById('trade-log').style.display = 'none';
    }

    // 互動 4：Fintech 展示
    function showFintech(type) {
      const box = document.getElementById('fintech-detail');
      box.style.display = 'block';
      const info = {
        wealthfront: `<strong>🤖 Wealthfront 深度拆解：</strong><br>
        傳統華爾街理財專員收取 1% ~ 2% 的高額管理費，且常推銷高佣金基金。Wealthfront 用程式碼取代人力，僅收 0.25% 費率，為散戶提供全天候演算法自動化配置與避稅收割，開啟普惠金融先河。`,
        lendingtree: `<strong>🤝 LendingTree 深度拆解：</strong><br>
        標語「When Banks Compete, You Win!（當銀行競爭，你就贏了）」。以往申請貸款要親跑五家銀行被拷問；現在線上輸入資訊，後台瞬間讓十幾家銀行為你的案件出價競爭，徹底改寫零售借貸生態。`,
        metromile: `<strong>🚗 Metromile 深度拆解：</strong><br>
        傳統車險假設所有人每天都開車。Metromile 透過物聯網數據實現「動態精準定價（Usage-Based Insurance, UBI）」，將科技巨量數據直接轉化為使用者的實質錢包折扣。`,
        acorns: `<strong>🪙 Acorns 深度拆解：</strong><br>
        針對年輕人「沒錢投資、不懂股票」的痛點，以「消費零錢四捨五入（Round-up）」機制化整為零，將金融摩擦力降為零，讓每個人在不知不覺中成為跨國企業的微型股東。`
      };
      box.innerHTML = info[type] || '';
    }

    // 初始化載入
    window.addEventListener('DOMContentLoaded', () => {
      calculateTaxComparison();
      renderOrderBook();
    });
  </script>
</body>
</html>
'''

# 目標儲存路徑清單
target_paths = [
    r"收件苗圃\學習講義合輯\Ch01_企業組織與財務金融環境_學習講義.html",
    r"C:\Users\閻星澄\Documents\WikiTree\收件苗圃\學習講義合集\Ch01_企業組織與財務金融環境_學習講義.html",
    r"C:\Users\閻星澄\Desktop\學習講義合集\Ch01_企業組織與財務金融環境_學習講義.html"
]

def main():
    print("=" * 60)
    print("開始編譯與發布 Chapter 1 企業組織與財務金融環境 學習講義...")
    print("=" * 60)

    for path in target_paths:
        dir_name = os.path.dirname(path)
        if dir_name and not os.path.exists(dir_name):
            try:
                os.makedirs(dir_name, exist_ok=True)
                print(f"建立目錄: {dir_name}")
            except Exception as e:
                print(f"無法建立目錄 {dir_name}: {e}")

        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(html_content)
            print(f"✅ 成功產出講義至: {path} (檔案大小: {len(html_content):,} 位元組)")
        except Exception as e:
            print(f"❌ 寫入失敗 {path}: {e}")

    print("=" * 60)
    print("Chapter 1 講義生成與多點同步完成！")
    print("=" * 60)

if __name__ == "__main__":
    main()
