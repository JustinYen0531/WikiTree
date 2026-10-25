# -*- coding: utf-8 -*-
"""
Generate Chapter 5 Handout HTML: Interest Rates (利率與資本成本)
Berk & DeMarzo Corporate Finance Chapter 5.
Full Traditional Chinese Learning Handout for 15-year-old gamer / adventurer.
"""

import os
import shutil

HANDOUT_HTML = r'''<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ch05 利率與資本成本：金幣的時間魔法與冒險者的借貸契約 | Corporate Finance</title>
  
  <!-- MathJax 3 雙保險渲染引擎 -->
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
      }
    };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <script>
    // 離線優雅降級 Fallback 腳本 (若 2 秒內 CDN 未載入)
    setTimeout(() => {
      if (!window.MathJax || !window.MathJax.typeset) {
        console.warn("MathJax CDN 加載逾時，啟動離線公式美化降級協議...");
        document.querySelectorAll('.math-tex, .formula-box, p, li, td').forEach(el => {
          let html = el.innerHTML;
          html = html.replace(/\$([^\$]+)\$/g, '<span class="offline-math"><em>$1</em></span>');
          html = html.replace(/\\times/g, ' × ')
                     .replace(/\\approx/g, ' ≈ ')
                     .replace(/\\le/g, ' ≤ ')
                     .replace(/\\ge/g, ' ≥ ')
                     .replace(/\\ne/g, ' ≠ ')
                     .replace(/\\frac\{([^\}]+)\}\{([^\}]+)\}/g, '($1 / $2)')
                     .replace(/\\mathbf\{([^\}]+)\}/g, '<strong>$1</strong>')
                     .replace(/\\text\{([^\}]+)\}/g, '$1');
          el.innerHTML = html;
        });
      }
    }, 2000);
  </script>

  <style>
    :root {
      --primary: #10b981;
      --primary-dark: #047857;
      --primary-light: #ecfdf5;
      --secondary: #3b82f6;
      --accent: #f59e0b;
      --danger: #ef4444;
      --dark: #1e293b;
      --gray-light: #f8fafc;
      --gray-border: #e2e8f0;
      --text: #334155;
      --sidebar-width: 280px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang TC", "Microsoft JhengHei", sans-serif;
      line-height: 1.75;
      color: var(--text);
      background: #f1f5f9;
      display: flex;
    }

    /* 側邊導航欄 */
    #sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #f8fafc;
      padding: 1.5rem 1rem;
      overflow-y: auto;
      flex-shrink: 0;
      border-right: 1px solid #334155;
    }
    #sidebar h2 {
      font-size: 1.1rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    #sidebar p.sub {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid #334155;
      padding-bottom: 0.75rem;
    }
    #sidebar ul { list-style: none; }
    #sidebar li { margin-bottom: 0.5rem; }
    #sidebar a {
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.85rem;
      display: block;
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      transition: all 0.2s;
    }
    #sidebar a:hover, #sidebar a.active {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      font-weight: 600;
    }
    #sidebar .badge {
      background: var(--accent);
      color: #000;
      font-size: 0.7rem;
      padding: 0.1rem 0.4rem;
      border-radius: 10px;
      float: right;
      font-weight: bold;
    }

    /* 主內容區域 */
    #main-content {
      flex: 1;
      max-width: 980px;
      margin: 0 auto;
      padding: 2.5rem 2rem 5rem;
      background: #ffffff;
      min-height: 100vh;
      box-shadow: 0 0 25px rgba(0,0,0,0.05);
    }

    /* 頁首橫幅 */
    .hero-banner {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
      color: white;
      padding: 2.5rem 2rem;
      border-radius: 16px;
      margin-bottom: 2.5rem;
      box-shadow: 0 10px 20px rgba(6, 78, 59, 0.2);
      position: relative;
      overflow: hidden;
    }
    .hero-banner::after {
      content: "⚔️ TIME VALUE";
      position: absolute;
      right: -20px;
      bottom: -20px;
      font-size: 4.5rem;
      font-weight: 900;
      color: rgba(255,255,255,0.05);
      pointer-events: none;
    }
    .hero-banner .meta-tag {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(4px);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      margin-bottom: 0.75rem;
      letter-spacing: 0.5px;
      color: #a7f3d0;
      font-weight: 600;
    }
    .hero-banner h1 {
      font-size: 2.1rem;
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }
    .hero-banner p {
      font-size: 1rem;
      color: #d1fae5;
      max-width: 700px;
    }

    /* 章節標題 */
    h2.section-title {
      font-size: 1.6rem;
      color: var(--dark);
      border-left: 5px solid var(--primary);
      padding-left: 0.75rem;
      margin: 2.5rem 0 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    h3.sub-title {
      font-size: 1.25rem;
      color: #1e293b;
      margin: 1.5rem 0 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    /* 遊戲化角色卡片 */
    .role-capsule {
      background: #f0fdf4;
      border: 1px dashed var(--primary);
      border-radius: 12px;
      padding: 1.2rem;
      margin-bottom: 1.5rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }
    .role-avatar {
      font-size: 2.2rem;
      background: #dcfce7;
      width: 54px;
      height: 54px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .role-dialogue h4 {
      color: var(--primary-dark);
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }
    .role-dialogue p {
      font-size: 0.92rem;
      color: #166534;
      margin: 0;
    }

    /* 英文專有名詞標記 */
    .en-term {
      color: #2563eb;
      font-weight: 600;
      border-bottom: 1px dotted #93c5fd;
      padding: 0 2px;
    }
    .badge-term {
      background: #e0f2fe;
      color: #0369a1;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      margin: 0 2px;
    }

    /* 公式高亮框 */
    .formula-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid var(--secondary);
      border-radius: 8px;
      padding: 1.25rem;
      margin: 1.25rem 0;
      font-size: 1.05rem;
      overflow-x: auto;
    }
    .formula-title {
      font-weight: bold;
      color: #1e3a8a;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    /* 互動小工具卡片 */
    .tool-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 15px rgba(0,0,0,0.06);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1.75rem 0;
    }
    .tool-card h4 {
      color: #0f172a;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .tool-desc {
      font-size: 0.88rem;
      color: #64748b;
      margin-bottom: 1rem;
    }
    .tool-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .input-group label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #475569;
    }
    .input-group input, .input-group select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    .input-group input:focus, .input-group select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }
    .tool-result {
      background: #f1f5f9;
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.95rem;
      border-left: 4px solid var(--primary);
    }
    .tool-result strong {
      color: #0f172a;
      font-size: 1.15rem;
    }

    /* 核心對照表格 */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.25rem 0;
      font-size: 0.92rem;
    }
    .data-table th, .data-table td {
      border: 1px solid var(--gray-border);
      padding: 0.65rem 0.85rem;
      text-align: left;
    }
    .data-table th {
      background: #f8fafc;
      color: #1e293b;
      font-weight: 600;
    }
    .data-table tr:hover {
      background: #f1f5f9;
    }

    /* 測驗模擬區域 */
    #exam-section {
      background: #fafafa;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 2rem;
      margin-top: 3.5rem;
    }
    .exam-header {
      text-align: center;
      margin-bottom: 2rem;
      border-bottom: 2px dashed #cbd5e1;
      padding-bottom: 1.5rem;
    }
    .exam-header h2 {
      font-size: 1.8rem;
      color: #0f172a;
    }
    .exam-header p {
      color: #64748b;
      font-size: 0.95rem;
      margin-top: 0.4rem;
    }
    .q-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.03);
    }
    .q-card.correct {
      border-color: #10b981;
      background: #f0fdf4;
    }
    .q-card.incorrect {
      border-color: #ef4444;
      background: #fef2f2;
    }
    .q-num {
      font-weight: bold;
      color: var(--secondary);
      font-size: 0.95rem;
      margin-bottom: 0.4rem;
      display: flex;
      justify-content: space-between;
    }
    .q-text {
      font-size: 0.98rem;
      color: #1e293b;
      margin-bottom: 0.8rem;
      font-weight: 500;
    }
    .options-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .option-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.45rem 0.75rem;
      border-radius: 6px;
      border: 1px solid #f1f5f9;
      cursor: pointer;
      font-size: 0.92rem;
      transition: background 0.15s;
    }
    .option-item:hover {
      background: #f8fafc;
    }
    .fill-input {
      width: 100%;
      max-width: 320px;
      padding: 0.5rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
    }
    .explanation {
      display: none;
      margin-top: 1rem;
      padding: 0.9rem 1.1rem;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid var(--accent);
      font-size: 0.9rem;
      color: #334155;
      line-height: 1.6;
    }

    /* 批改與操作按鈕 */
    .exam-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
      flex-wrap: wrap;
    }
    .btn {
      padding: 0.75rem 1.75rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-primary {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
    }
    .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
    }
    .btn-skip {
      background: #e2e8f0;
      color: #475569;
    }
    .btn-skip:hover {
      background: #cbd5e1;
      color: #1e293b;
    }
    .btn-reset {
      background: #fee2e2;
      color: #b91c1c;
    }
    .btn-reset:hover {
      background: #fecaca;
    }

    /* 成績公報板 */
    #score-board {
      display: none;
      background: white;
      border: 2px solid var(--primary);
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 2rem;
      text-align: center;
      animation: popIn 0.3s ease-out;
    }
    @keyframes popIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .score-title {
      font-size: 1.4rem;
      color: #0f172a;
      font-weight: 700;
    }
    .score-grade {
      font-size: 3rem;
      font-weight: 900;
      color: var(--primary-dark);
      margin: 0.5rem 0;
    }
    .score-comment {
      font-size: 1rem;
      color: #475569;
    }

    /* 響應式佈局 */
    @media (max-width: 900px) {
      body { flex-direction: column; }
      #sidebar {
        width: 100%;
        height: auto;
        position: relative;
        border-right: none;
        border-bottom: 1px solid #334155;
      }
      #main-content { padding: 1.5rem 1rem; }
    }
  </style>
</head>
<body>

  <!-- 側邊導航目錄 -->
  <aside id="sidebar">
    <h2>🌲 WikiTree 導航</h2>
    <p class="sub">Corporate Finance / Ch05 利率</p>
    <ul>
      <li><a href="#ch05-hero">🏰 冒險序章：金幣的時間之輪</a></li>
      <li><a href="#sec-5-1">⚔️ 5.1 利率報價與換算 (Quotes)</a></li>
      <li><a href="#sec-5-2">💰 5.2 貸款實戰：攤銷與本金餘額</a></li>
      <li><a href="#sec-5-3">📈 5.3 利率決定因子與殖利率曲線</a></li>
      <li><a href="#sec-5-4">🛡️ 5.4 違約風險、信用評等與稅賦</a></li>
      <li><a href="#sec-5-5">🎯 5.5 機會資本成本 (Cost of Capital)</a></li>
      <li><a href="#interactive-suite">🔮 冒險公會：5大互動式模擬器</a></li>
      <li><a href="#exam-section"><span class="badge">20 題</span> ⚔️ 期中高壓模擬試煉</a></li>
    </ul>
  </aside>

  <!-- 主講義內容 -->
  <main id="main-content">
    
    <!-- Hero 橫幅 -->
    <section id="ch05-hero" class="hero-banner">
      <div class="meta-tag">BERK & DEMARZO CORPORATE FINANCE · CH05</div>
      <h1>Ch05 利率與資本成本<br><small style="font-size: 1.25rem; font-weight: normal; opacity: 0.9;">Interest Rates and the Opportunity Cost of Capital</small></h1>
      <p>「金幣如果躺在公會的保險庫裡，它只是一堆沈睡的金屬；但若放在時間的長河中，它會自己長出獠牙或翅膀。」—— 冒險者公會首席大掌櫃筆記</p>
    </section>

    <!-- 導讀角色卡 -->
    <div class="role-capsule">
      <div class="role-avatar">🧙‍♂️</div>
      <div class="role-dialogue">
        <h4>公會首席大掌櫃叮嚀</h4>
        <p>歡迎來到金融冒險的第 5 關！在前一章我們掌握了現金流量折現法（DCF）。但你有沒有想過，那個折現率 $r$ 到底從何而來？為什麼酒館老闆跟你說年利率 12%，年底你借 100 枚金幣卻要還 112.68 枚？為什麼景氣要衰退時，長期公債殖利率反而會比短期更低？這章我們將徹底解構「利率（Interest Rates）」的所有秘密！</p>
      </div>
    </div>

    <!-- 5.1 利率報價與換算 -->
    <section id="sec-5-1">
      <h2 class="section-title">⚔️ 5.1 利率報價與期別換算 (Interest Rate Quotes & Adjustments)</h2>
      
      <p>在市場上，各家銀行、錢莊、公會發布的利率報價五花八門。如果你搞不懂報價背後的「計息頻率（Compounding Frequency）」，你就會像一個以為買到便宜裝備、最後卻被高額手續費榨乾的冒險新手！</p>

      <h3 class="sub-title">1. 有效年利率 vs. 標明名目年利率</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 28%;">術語</th>
            <th style="width: 32%;">英文與定義</th>
            <th>特點與用法</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>有效年利率</strong></td>
            <td><span class="en-term">Effective Annual Rate (EAR)</span><br>或稱 <span class="en-term">Annual Percentage Yield (APY)</span></td>
            <td><strong>真實利率！</strong> 考慮了年內複利效應後，金幣在一年內實際增長的比率。折現現金流時，必須將折現率轉化為對應期間的有效利率。</td>
          </tr>
          <tr>
            <td><strong>標明名目年利率</strong></td>
            <td><span class="en-term">Annual Percentage Rate (APR)</span></td>
            <td><strong>報價用名目數字！</strong> 法律通常規定金融機構必須標明 APR。計算公式為：每期利率 $\times$ 一年計息期數 $k$。<strong>它完全忽略了複利！不能直接拿來折現！</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="formula-box">
        <div class="formula-title">📜 核心公式 1：APR 與每期利率、EAR 之換算</div>
        若名目年利率為 $\text{APR}$，一年計息 $k$ 次（例如每月計息則 $k=12$，每季 $k=4$）：
        <p style="margin-top: 0.5rem;">
          $$\text{每期實際利率 (Period Rate)} = \frac{\text{APR}}{k}$$
        </p>
        <p style="margin-top: 0.5rem;">
          $$\text{有效年利率 (EAR)} = \left(1 + \frac{\text{APR}}{k}\right)^k - 1$$
        </p>
      </div>

      <div class="formula-box">
        <div class="formula-title">📜 核心公式 2：任意期間等效貼現率之跨期轉換</div>
        如果我們已知某期間的有效利率為 $r$，想求出相當於該期間 $1/n$ 或 $m$ 期的等效貼現率 $r_{\text{equiv}}$：
        <p style="margin-top: 0.5rem;">
          $$(1 + r_{\text{equiv}})^n = 1 + r \implies r_{\text{equiv}} = (1 + r)^{1/n} - 1$$
        </p>
        <small style="color: #64748b;">⚠️ <strong>新手致命陷阱：</strong>千萬不要直接用除法！例如年有效利率 $EAR = 6\%$，半年有效利率<strong>絕不是</strong> $3\%$，而是 $(1 + 0.06)^{1/2} - 1 \approx 2.9563\%$！</small>
      </div>

      <h3 class="sub-title">2. 極限連續複利 (Continuous Compounding)</h3>
      <p>當計息次數 $k \to \infty$（每分每秒、每微秒都在生利息）時，數學極限會召喚出自然常數 $e \approx 2.71828$：</p>
      <div class="formula-box">
        $$\lim_{k \to \infty} \left(1 + \frac{\text{APR}}{k}\right)^k - 1 = e^{\text{APR}} - 1$$
      </div>
    </section>

    <!-- 5.2 貸款應用：分期償還與餘額計算 -->
    <section id="sec-5-2">
      <h2 class="section-title">💰 5.2 貸款實戰：分期攤還與貸款餘額 (Loan Amortization)</h2>
      <p>冒險公會想要添購一艘價值 1,000,000 枚金幣的飛空艇，向皇家金庫辦理 30 年期分期攤還貸款（<span class="en-term">Amortizing Loan</span>）。每個月固定還款金額是多少？還了 5 年後，公會想提早贖身，到底還欠國庫多少錢？</p>

      <h3 class="sub-title">1. 每月等額本息還款金額計算 (Monthly Payment)</h3>
      <p>貸款金額 $L$ 相當於未來所有每期固定還款 $C$ 折現後的現值（普通年金現值）：</p>
      <div class="formula-box">
        $$L = C \times \frac{1}{r} \left(1 - \frac{1}{(1 + r)^N}\right) \implies C = \frac{L}{\frac{1}{r} \left(1 - \frac{1}{(1 + r)^N}\right)}$$
        <small style="color: #64748b;">其中 $r$ 為月利率（即 $\text{APR}/12$），$N$ 為總期數（例如 30 年 $\times 12 = 360$ 期）。</small>
      </div>

      <h3 class="sub-title">2. 前瞻法計算貸款剩餘本金 (Forward-Looking Outstanding Balance)</h3>
      <p>如果公會已經繳了 $t$ 期，想知道當下的<span class="en-term">未償還貸款餘額 (Outstanding Balance)</span>，最快、最精準的神技是<strong>前瞻法 (Forward-Looking Method)</strong>：餘額就等於<strong>剩餘尚未支付的所有款項之現值</strong>！</p>
      <div class="formula-box">
        $$\text{餘額}_t = C \times \frac{1}{r} \left(1 - \frac{1}{(1 + r)^{N - t}}\right)$$
        <small style="color: #047857;">💡 <strong>解題外掛：</strong>完全不需要去推前面 $t$ 期的繁雜利息明細表，只要看還剩幾期（$N - t$），直接折現，10 秒內得出答案！</small>
      </div>
    </section>

    <!-- 5.3 利率決定因子與殖利率曲線 -->
    <section id="sec-5-3">
      <h2 class="section-title">📈 5.3 利率的決定因子與殖利率曲線 (Determinants & Yield Curve)</h2>
      
      <h3 class="sub-title">1. 通貨膨脹與費雪效應 (Inflation & Fisher Effect)</h3>
      <p>物價飛漲會吃掉金幣的購買力！因此我們必須區分<span class="en-term">名目利率 (Nominal Interest Rate, $r$)</span> 與<span class="en-term">實質利率 (Real Interest Rate, $r_r$)</span>：</p>
      <div class="formula-box">
        <div class="formula-title">📜 費雪方程式 (Fisher Equation) 精確版與近似版</div>
        <p>若預期通膨率為 $i$：</p>
        $$1 + r_r = \frac{1 + r}{1 + i} \implies r_r = \frac{r - i}{1 + i}$$
        <p style="margin-top: 0.5rem;">當通膨率與利率較低時，可使用著名的費雪近似式：</p>
        $$r_r \approx r - i \quad (\text{實質利率} \approx \text{名目利率} - \text{通膨率})$$
      </div>

      <h3 class="sub-title">2. 殖利率曲線與期限結構 (Yield Curve & Term Structure)</h3>
      <p>不同到期日的無風險公債（如美國國債），其利率並不相同。將期限（橫軸）與利率（縱軸）畫成圖，就稱為<span class="en-term">殖利率曲線 (Yield Curve)</span>。</p>

      <table class="data-table">
        <thead>
          <tr>
            <th>曲線形態</th>
            <th>圖形特徵</th>
            <th>經濟涵義與預期</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>正向斜率 (Normal)</strong></td>
            <td>長天期利率 &gt; 短天期利率</td>
            <td>市場健康常態。長期投資需承擔較多的利率波動與通膨風險（期限溢酬 <span class="en-term">Term Premium</span>）。</td>
          </tr>
          <tr>
            <td><strong>平坦 (Flat)</strong></td>
            <td>各天期利率幾乎一致</td>
            <td>景氣處於轉折點，市場對未來利率與經濟走向充滿分歧。</td>
          </tr>
          <tr>
            <td><strong>倒掛 / 負斜率 (Inverted)</strong></td>
            <td><strong>短天期利率 &gt; 長天期利率</strong></td>
            <td><strong>⚠️ 景氣衰退核彈級警報！</strong> 市場強烈預期央行未來將大幅降息救市，過去半世紀每次經濟大衰退前幾乎都出現倒掛。</td>
          </tr>
        </tbody>
      </table>

      <div class="formula-box">
        <div class="formula-title">📜 預期理論與遠期利率推導 (Pure Expectations Theory)</div>
        假設 1 年期利率為 $r_1$，2 年期利率為 $r_2$，無套利條件下，市場隱含的「第 2 年那一年」的遠期利率 $f_2$：
        $$(1 + r_2)^2 = (1 + r_1)(1 + f_2) \implies f_2 = \frac{(1 + r_2)^2}{1 + r_1} - 1$$
      </div>
    </section>

    <!-- 5.4 違約風險、信用評等與稅賦 -->
    <section id="sec-5-4">
      <h2 class="section-title">🛡️ 5.4 違約風險、信用評等與稅負 (Risk and Taxes)</h2>

      <h3 class="sub-title">1. 信用利差與違約溢酬 (Credit Spread & Default Premium)</h3>
      <p>政府公債理論上無違約風險（國庫可以印鈔），但企業債券有倒閉賴帳的可能。因此投資人會要求更高的報酬補償：</p>
      <div class="formula-box">
        $$\text{信用利差 (Credit Spread)} = \text{企業債券殖利率} - \text{同期限無風險國債殖利率}$$
      </div>
      <p>國際評等機構（如 S&P、Moody's）將債券分為兩大陣營：</p>
      <ul>
        <li><strong>投資級 (Investment Grade)</strong>：S&P 為 $\text{BBB}^-$ 以上，Moody's 為 $\text{Baa3}$ 以上。違約機率極低，大型退休基金與公會法規准許大量持有。</li>
        <li><strong>投機級 / 垃圾級 / 高收益 (Speculative / Junk / High Yield)</strong>：S&P 為 $\text{BB}^+$ 以下。違約風險高，信用利差非常巨大。</li>
      </ul>

      <h3 class="sub-title">2. 稅後實質利率 (After-Tax Interest Rate)</h3>
      <p>國稅局永遠是冒險者的「影子合夥人」！利息收入往往需要繳稅，而某些利息支出（例如房貸或企業負債）卻能抵稅。若投資人的邊際所得稅率為 $\tau$：</p>
      <div class="formula-box">
        $$r_{\text{after-tax}} = r \times (1 - \tau)$$
        <small style="color: #64748b;">例如：若名目存款利率為 8%，所得稅率為 30%，則冒險者口袋真正能拿到的稅後年回報僅為 $8\% \times (1 - 0.30) = 5.6\%$！</small>
      </div>
    </section>

    <!-- 5.5 機會資本成本 -->
    <section id="sec-5-5">
      <h2 class="section-title">🎯 5.5 機會資本成本 (Opportunity Cost of Capital)</h2>
      <p>投資決策中最神聖的羅盤指針：<strong>「一個專案的折現率，絕不取決於你是怎麼籌到錢的，而是取決於這筆資金『如果投入金融市場中具有同等風險與期限的替代方案』所能賺取的期望報酬率！」</strong></p>
      <div class="formula-box" style="border-left-color: #f59e0b; background: #fffbeb;">
        <p><strong>大掌櫃核心鐵律：</strong></p>
        <p>即使公會金庫裡滿滿都是無息金幣（保留盈餘，成本看似為 0），公會投資新工坊時，<strong>折現率依然不能設定為 0%！</strong> 因為如果把這筆金幣拿去投資市場上同風險的冒險公會股票或債券，能獲得 $10\%$ 的報酬，那麼這 $10\%$ 就是你的<span class="en-term">機會資本成本 (Opportunity Cost of Capital)</span>！</p>
      </div>
    </section>

    <!-- 互動式模擬器套件 -->
    <section id="interactive-suite">
      <h2 class="section-title">🔮 冒險公會：5大互動式金融模擬工具箱</h2>
      <p style="color: #64748b;">動手調動數值，在實戰中肉眼看見利率魔法的威力！</p>

      <!-- 工具 1: APR vs EAR -->
      <div class="tool-card">
        <h4>⚡ 模擬器 1：APR 名目利率 vs. EAR 有效年利率轉換器</h4>
        <div class="tool-desc">輸入錢莊開出的 APR 與年計息頻率，立即算出真實 EAR 與每日等效貼現率。</div>
        <div class="tool-grid">
          <div class="input-group">
            <label>名目年利率 APR (%)</label>
            <input type="number" id="t1-apr" value="12" step="0.1">
          </div>
          <div class="input-group">
            <label>每年計息次數 (k)</label>
            <select id="t1-freq">
              <option value="1">每年 1 次 (Annual)</option>
              <option value="2">每半年 2 次 (Semiannual)</option>
              <option value="4">每季 4 次 (Quarterly)</option>
              <option value="12" selected>每月 12 次 (Monthly)</option>
              <option value="365">每天 365 次 (Daily)</option>
              <option value="99999">連續複利 (Continuous)</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" onclick="calcT1()">⚡ 施展複利魔法</button>
        <div class="tool-result" id="t1-res" style="margin-top: 1rem;">
          每期實際利率：<strong>1.0000%</strong> | 有效年利率 (EAR)：<strong>12.6825%</strong>
        </div>
      </div>

      <!-- 工具 2: 房貸分期還款與前瞻餘額試算 -->
      <div class="tool-card">
        <h4>🏰 模擬器 2：等額本息房貸與前瞻餘額試算機</h4>
        <div class="tool-desc">購置冒險者總部城堡！算出每月月供，並用前瞻法精確估算經過特定期數後的剩餘本金。</div>
        <div class="tool-grid">
          <div class="input-group">
            <label>貸款總額 ($)</label>
            <input type="number" id="t2-loan" value="1000000" step="10000">
          </div>
          <div class="input-group">
            <label>年利率 APR (%)</label>
            <input type="number" id="t2-apr" value="6" step="0.1">
          </div>
          <div class="input-group">
            <label>貸款年限 (Years)</label>
            <input type="number" id="t2-years" value="30">
          </div>
          <div class="input-group">
            <label>已償還期數 (已過幾個月)</label>
            <input type="number" id="t2-passed" value="60">
          </div>
        </div>
        <button class="btn btn-primary" onclick="calcT2()">📊 計算月供與剩餘餘額</button>
        <div class="tool-result" id="t2-res" style="margin-top: 1rem;">
          每月還款額 (PMT)：<strong>$5,995.51</strong> | 繳款 60 期後剩餘本金：<strong>$930,543.08</strong>
        </div>
      </div>

      <!-- 工具 3: 費雪效應通膨試算 -->
      <div class="tool-card">
        <h4>🔥 模擬器 3：費雪效應 (Fisher Effect) 實質利率精確檢驗</h4>
        <div class="tool-desc">對比名目利率、通膨率與真實購買力增長率（比較精確版 vs 近似版）。</div>
        <div class="tool-grid">
          <div class="input-group">
            <label>名目利率 Nominal Rate (%)</label>
            <input type="number" id="t3-nom" value="8" step="0.1">
          </div>
          <div class="input-group">
            <label>預期通貨膨脹率 Inflation (%)</label>
            <input type="number" id="t3-inf" value="5" step="0.1">
          </div>
        </div>
        <button class="btn btn-primary" onclick="calcT3()">🔥 測量實質購買力</button>
        <div class="tool-result" id="t3-res" style="margin-top: 1rem;">
          精確實質利率：<strong>2.8571%</strong> | 費雪近似值 (r - i)：<strong>3.0000%</strong> (差距 0.1429%)
        </div>
      </div>

      <!-- 工具 4: 殖利率曲線與遠期利率 -->
      <div class="tool-card">
        <h4>📈 模擬器 4：兩期無套利遠期利率推導機</h4>
        <div class="tool-desc">根據 1 年期與 2 年期即期利率，自動算出隱含的第 2 年遠期利率 (Forward Rate)。</div>
        <div class="tool-grid">
          <div class="input-group">
            <label>1 年期零息國債殖利率 r1 (%)</label>
            <input type="number" id="t4-r1" value="4.0" step="0.05">
          </div>
          <div class="input-group">
            <label>2 年期零息國債殖利率 r2 (%)</label>
            <input type="number" id="t4-r2" value="4.5" step="0.05">
          </div>
        </div>
        <button class="btn btn-primary" onclick="calcT4()">🔮 推算隱含遠期利率</button>
        <div class="tool-result" id="t4-res" style="margin-top: 1rem;">
          隱含第 2 年遠期利率 f2：<strong>5.0024%</strong> (曲線為向上正斜率)
        </div>
      </div>

      <!-- 工具 5: 稅後實質利率試算 -->
      <div class="tool-card">
        <h4>⚖️ 模擬器 5：稅後實質資金成本對比機</h4>
        <div class="tool-desc">評估個人投資人在邊際稅率影響下，真正的稅後實質報酬率。</div>
        <div class="tool-grid">
          <div class="input-group">
            <label>名目利息收益率 (%)</label>
            <input type="number" id="t5-rate" value="7.0" step="0.1">
          </div>
          <div class="input-group">
            <label>邊際個人所得稅率 (%)</label>
            <input type="number" id="t5-tax" value="25" step="1">
          </div>
          <div class="input-group">
            <label>預期通膨率 (%)</label>
            <input type="number" id="t5-inf" value="3.0" step="0.1">
          </div>
        </div>
        <button class="btn btn-primary" onclick="calcT5()">🛡️ 揭露真實淨回報</button>
        <div class="tool-result" id="t5-res" style="margin-top: 1rem;">
          稅後名目利率：<strong>5.2500%</strong> | 稅後實質淨購買力增長：<strong>2.1845%</strong>
        </div>
      </div>
    </section>

    <!-- 20題期中高壓模擬試煉 -->
    <section id="exam-section">
      <div class="exam-header">
        <h2>⚔️ 財務管理：Chapter 5 期中高壓模擬試煉</h2>
        <p>【冒險者公會資格認證試卷】全卷共 20 題（10 題觀念與計算選擇題 + 10 題深度情境填充題）。<br>嚴禁作弊，答畢請點擊下方智慧批改或略過查看解析！</p>
      </div>

      <div id="quiz-container">
        <!-- 選擇題 1-10 -->
        <h3 style="margin-bottom: 1rem; color: #1e3a8a;">第一部分：單一選擇題（共 10 題，每題 5 分）</h3>
        
        <!-- Q1 -->
        <div class="q-card" id="qc-1">
          <div class="q-num"><span>第 1 題 (單選)</span> <span>5 分</span></div>
          <div class="q-text">某地下錢莊開出年利率 APR 為 18%，按「月」複利計息。請問冒險者實際承擔的有效年利率 (EAR) 最接近下列何者？</div>
          <div class="options-group">
            <label class="option-item"><input type="radio" name="q1" value="A"> (A) 18.00%</label>
            <label class="option-item"><input type="radio" name="q1" value="B"> (B) 19.56%</label>
            <label class="option-item"><input type="radio" name="q1" value="C"> (C) 19.25%</label>
            <label class="option-item"><input type="radio" name="q1" value="D"> (D) 20.34%</label>
          </div>
          <div class="explanation" id="exp-1">
            <strong>【解剖思路】標準答案：(B)</strong><br>
            月利率 $r_{\text{month}} = \frac{\text{APR}}{12} = \frac{18\%}{12} = 1.5\% = 0.015$。<br>
            有效年利率 $\text{EAR} = (1 + 0.015)^{12} - 1 = (1.015)^{12} - 1 \approx 1.195618 - 1 = 19.56\%$。
          </div>
        </div>

        <!-- Q2 -->
        <div class="q-card" id="qc-2">
          <div class="q-num"><span>第 2 題 (單選)</span> <span>5 分</span></div>
          <div class="q-text">精靈銀行的儲蓄帳戶提供每年 8% 的有效年利率 (EAR = 8%)。如果冒險者每半年領取一次利息，其等效的半年貼現率（6-month discount rate）應為多少？</div>
          <div class="options-group">
            <label class="option-item"><input type="radio" name="q2" value="A"> (A) 4.00%</label>
            <label class="option-item"><input type="radio" name="q2" value="B"> (B) 3.923%</label>
            <label class="option-item"><input type="radio" name="q2" value="C"> (C) 4.125%</label>
            <label class="option-item"><input type="radio" name="q2" value="D"> (D) 3.856%</label>
          </div>
          <div class="explanation" id="exp-2">
            <strong>【解剖思路】標準答案：(B)</strong><br>
            令半年等效利率為 $r_s$，則 $(1 + r_s)^2 = 1 + \text{EAR} = 1.08$。<br>
            $r_s = (1.08)^{1/2} - 1 \approx 1.039230 - 1 = 3.923\%$。<br>
            ⚠️ 絕對不能直接除以 2（4.00% 是大陷阱）！
          </div>
        </div>

        <!-- Q3 -->
        <div class="q-card" id="qc-3">
          <div class="q-num"><span>第 3 題 (單選)</span> <span>5 分</span></div>
          <div class="q-text">當殖利率曲線呈現「倒掛（Inverted Yield Curve）」，即短期利率顯著高於長期利率時，歷史與金融理論通常視其為下列何種經濟信號？</div>
          <div class="options-group">
            <label class="option-item"><input type="radio" name="q3" value="A"> (A) 未來景氣過熱，面臨惡性通貨膨脹</label>
            <label class="option-item"><input type="radio" name="q3" value="B"> (B) 央行即將無限制升息以抑制投機</label>
            <label class="option-item"><input type="radio" name="q3" value="C"> (C) 經濟即將陷入衰退（Recession），未來短期利率預期將大幅下調</label>
            <label class="option-item"><input type="radio" name="q3" value="D"> (D) 企業違約風險全面歸零</label>
          </div>
          <div class="explanation" id="exp-3">
            <strong>【解剖思路】標準答案：(C)</strong><br>
            根據純粹預期理論，長期利率是未來短期利率的幾何平均。當市場強烈預期經濟衰退、央行將被迫大幅降息刺激經濟時，長期殖利率就會被拉低，形成短高長低的倒掛形態。
          </div>
        </div>

        <!-- Q4 -->
        <div class="q-card" id="qc-4">
          <div class="q-num"><span>第 4 題 (單選)</span> <span>5 分</span></div>
          <div class="q-text">目前 1 年期無風險名目利率為 7%，預期未來的通貨膨脹率為 4%。根據費雪效應之「精確公式」，實質無風險利率（Real Interest Rate）為何？</div>
          <div class="options-group">
            <label class="option-item"><input type="radio" name="q4" value="A"> (A) 3.00%</label>
            <label class="option-item"><input type="radio" name="q4" value="B"> (B) 2.885%</label>
            <label class="option-item"><input type="radio" name="q4" value="C"> (C) 3.125%</label>
            <label class="option-item"><input type="radio" name="q4" value="D"> (D) 2.750%</label>
          </div>
          <div class="explanation" id="exp-4">
            <strong>【解剖思路】標準答案：(B)</strong><br>
            費雪精確公式：$r_r = \frac{r - i}{1 + i} = \frac{0.07 - 0.04}{1 + 0.04} = \frac{0.03}{1.04} \approx 0.028846 = 2.885\%$。<br>
            注意：$3.00\%$ 是粗略估計值 ($r - i$)。
          </div>
        </div>

        <!-- Q5 -->
        <div class="q-card" id="qc-5">
          <div class="q-num"><span>第 5 題 (單選)</span> <span>5 分</span></div>
          <div class="q-text">矮人國王向鐵行借款 100,000 枚金幣，名目年利率 APR 為 12%，採「連續複利（Continuous Compounding）」計息。請問 1 年後一次還清時，國王應償付的總本利和最接近多少？</div>
          <div class="options-group">
            <label class="option-item"><input type="radio" name="q5" value="A"> (A) 112,000</label>
            <label class="option-item"><input type="radio" name="q5" value="B"> (B) 112,683</label>
            <label class="option-item"><input type="radio" name="q5" value="C"> (C) 112,750</label>
            <label class="option-item"><input type="radio" name="q5" value="D"> (D) 113,148</label>
          </div>
          <div class="explanation" id="exp-5">
            <strong>【解剖思路】標準答案：(C)</strong><br>
            連續複利終值公式：$FV = PV \times e^{\text{APR} \times t} = 100,000 \times e^{0.12 \times 1}$。<br>
            $e^{0.12} \approx 1.12749685$。<br>
            總本利和 $\approx 100,000 \times 1.127497 = 112,749.7 \approx 112,750$ 枚金幣。
          </div>
        </div>

        <!-- Q6 -->
        <div class="q-card" id="qc-6">
          <div class="q-num"><span>第 6 題 (單選)</span> <span>5 分</span></div>
          <div class="q-text">根據標準信用評等分類，下列哪一個信用評級屬於「投資級（Investment Grade）」與「投機級/垃圾級（Speculative / Junk）」的分水嶺？</div>
          <div class="options-group">
            <label class="option-item"><input type="radio" name="q6" value="A"> (A) S&P 評級為 BBB-（含）以上為投資級，BB+（含）以下為投機級</label>
            <label class="option-item"><input type="radio" name="q6" value="B"> (B) S&P 評級為 A-（含）以上為投資級，BBB+（含）以下為投機級</label>
            <label class="option-item"><input type="radio" name="q6" value="C"> (C) Moody's 評級為 Ba1（含）以上為投資級，Baa3（含）以下為投機級</label>
            <label class="option-item"><input type="radio" name="q6" value="D"> (D) 只要債券有抵押品，一律自動列為投資級</label>
          </div>
          <div class="explanation" id="exp-6">
            <strong>【解剖思路】標準答案：(A)</strong><br>
            華爾街與公會嚴格分界線：Standard & Poor's 的最低投資級為 BBB-，下一級 BB+ 立即墜入垃圾債券（Junk / High-Yield）深淵；對應 Moody's 為 Baa3 與 Ba1。
          </div>
        </div>

        <!-- Q7 -->
        <div class="q-card" id="qc-7">
          <div class="q-num"><span>第 7 題 (單選)</span> <span>5 分</span></div>
          <div class="q-text">騎士團考慮一項新兵訓練營升級專案。騎士團目前庫存現金充沛，完全無需借貸或向貴族募資。關於該專案之折現率，下列敘述何者完全正確？</div>
          <div class="options-group">
            <label class="option-item"><input type="radio" name="q7" value="A"> (A) 因為使用的是自有現金，資金成本為 0%，故折現率應設為 0</label>
            <label class="option-item"><input type="radio" name="q7" value="B"> (B) 折現率應等於騎士團向銀行借款的牌告貸款利率</label>
            <label class="option-item"><input type="radio" name="q7" value="C"> (C) 折現率應等於資本市場中具有「同等風險與期限」之替代投資方案的期望報酬率</label>
            <label class="option-item"><input type="radio" name="q7" value="D"> (D) 折現率應等於過去三年全帝國的平均通貨膨脹率</label>
          </div>
          <div class="explanation" id="exp-7">
            <strong>【解剖思路】標準答案：(C)</strong><br>
            這正是 5.5 節的靈魂：<span class="en-term">Opportunity Cost of Capital</span> 取決於專案資產本身的「風險性與現金流期限」，而非資金來源是自有現金還是負債。
          </div>
        </div>

        <!-- Q8 -->
        <div class="q-card" id="qc-8">
          <div class="q-num"><span>第 8 題 (單選)</span> <span>5 分</span></div>
          <div class="q-text">若 1 年期即期零息國債殖利率 $r_1 = 3.0\%$，2 年期即期零息國債殖利率 $r_2 = 4.0\%$。依據純粹預期理論，市場隱含之第 2 年遠期利率 $f_2$ 為何？</div>
          <div class="options-group">
            <label class="option-item"><input type="radio" name="q8" value="A"> (A) 5.01%</label>
            <label class="option-item"><input type="radio" name="q8" value="B"> (B) 4.50%</label>
            <label class="option-item"><input type="radio" name="q8" value="C"> (C) 5.00%</label>
            <label class="option-item"><input type="radio" name="q8" value="D"> (D) 3.50%</label>
          </div>
          <div class="explanation" id="exp-8">
            <strong>【解剖思路】標準答案：(A)</strong><br>
            無套利公式：$(1 + r_2)^2 = (1 + r_1)(1 + f_2)$。<br>
            $(1.04)^2 = (1.03)(1 + f_2) \implies 1.0816 = 1.03(1 + f_2)$。<br>
            $1 + f_2 = \frac{1.0816}{1.03} \approx 1.050097 \implies f_2 \approx 5.01\%$。
          </div>
        </div>

        <!-- Q9 -->
        <div class="q-card" id="qc-9">
          <div class="q-num"><span>第 9 題 (單選)</span> <span>5 分</span></div>
          <div class="q-text">冒險公會投資於報酬率為 6.0% 的應稅公會債券，大掌櫃的邊際所得稅率為 30%。請問公會實質獲得的「稅後報酬率（After-Tax Return）」為多少？</div>
          <div class="options-group">
            <label class="option-item"><input type="radio" name="q9" value="A"> (A) 6.00%</label>
            <label class="option-item"><input type="radio" name="q9" value="B"> (B) 4.20%</label>
            <label class="option-item"><input type="radio" name="q9" value="C"> (C) 1.80%</label>
            <label class="option-item"><input type="radio" name="q9" value="D"> (D) 4.50%</label>
          </div>
          <div class="explanation" id="exp-9">
            <strong>【解剖思路】標準答案：(B)</strong><br>
            稅後利率公式：$r_{\text{after-tax}} = r \times (1 - \tau) = 6.0\% \times (1 - 0.30) = 6.0\% \times 0.70 = 4.20\%$。
          </div>
        </div>

        <!-- Q10 -->
        <div class="q-card" id="qc-10">
          <div class="q-num"><span>第 10 題 (單選)</span> <span>5 分</span></div>
          <div class="q-text">在分期償還貸款（Amortizing Loan）的各期定額還款中，隨著期數推進，每期還款金額中的「本金攤還部分」與「利息支付部分」會呈現何種變化？</div>
          <div class="options-group">
            <label class="option-item"><input type="radio" name="q10" value="A"> (A) 利息部分逐期增加，本金部分逐期減少</label>
            <label class="option-item"><input type="radio" name="q10" value="B"> (B) 本金與利息各期比例始終保持完全固定</label>
            <label class="option-item"><input type="radio" name="q10" value="C"> (C) 利息部分逐期減少，本金部分逐期增加</label>
            <label class="option-item"><input type="radio" name="q10" value="D"> (D) 初期全部償還本金，最後一期一次付清所有累積利息</label>
          </div>
          <div class="explanation" id="exp-10">
            <strong>【解剖思路】標準答案：(C)</strong><br>
            因為未償還本金餘額逐漸減少，所以按餘額計收的「利息金額」每期遞減；而由於每期總還款額 $C$ 固定，扣除變少的利息後，「償還本金部分」自然逐期遞增！
          </div>
        </div>

        <!-- 填充題 11-20 -->
        <h3 style="margin: 2rem 0 1rem; color: #1e3a8a;">第二部分：情境計算與核心填空題（共 10 題，每題 5 分）</h3>
        <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1rem;">提示：若計算結果為百分比，請填入數字含百分號（如 12.5% 或 12.55%）或純數值皆可，系統具備容錯比對；若為金額請填入整數或小數。</p>

        <!-- Q11 -->
        <div class="q-card" id="qc-11">
          <div class="q-num"><span>第 11 題 (填空)</span> <span>5 分</span></div>
          <div class="q-text">某信用卡聲稱其月利率為 1.5%。請計算其標明的名目年利率（APR）為多少 %？</div>
          <div><input type="text" class="fill-input" id="q11" placeholder="請輸入答案，如：18%"></div>
          <div class="explanation" id="exp-11">
            <strong>【解剖思路】標準答案：18%</strong><br>
            根據定義，$\text{APR} = \text{月利率} \times 12 = 1.5\% \times 12 = 18\%$。APR 不含任何複利效果。
          </div>
        </div>

        <!-- Q12 -->
        <div class="q-card" id="qc-12">
          <div class="q-num"><span>第 12 題 (填空)</span> <span>5 分</span></div>
          <div class="q-text">承上題，該信用卡若按月複利計息，其有效年利率（EAR）為多少 %？（四捨五入至小數點後第二位）</div>
          <div><input type="text" class="fill-input" id="q12" placeholder="請輸入答案，如：19.56%"></div>
          <div class="explanation" id="exp-12">
            <strong>【解剖思路】標準答案：19.56%</strong><br>
            $\text{EAR} = (1 + 0.015)^{12} - 1 \approx 19.56\%$。
          </div>
        </div>

        <!-- Q13 -->
        <div class="q-card" id="qc-13">
          <div class="q-num"><span>第 13 題 (填空)</span> <span>5 分</span></div>
          <div class="q-text">冒險公會申請了一筆 360,000 金幣的 30 年期房屋貸款（360 個月），年利率 APR 為 6%（按月計息，即月利率 0.5%）。請計算其「每月固定還款額」約為多少金幣？（四捨五入取整數或小數點後兩位，如 2158）</div>
          <div><input type="text" class="fill-input" id="q13" placeholder="請輸入金額，如：2158"></div>
          <div class="explanation" id="exp-13">
            <strong>【解剖思路】標準答案：2,158（或 2,158.38）</strong><br>
            $C = \frac{L}{\frac{1}{r}(1 - (1+r)^{-N})} = \frac{360,000}{\frac{1}{0.005}(1 - (1.005)^{-360})} = \frac{360,000}{166.7916} \approx 2,158.38$。
          </div>
        </div>

        <!-- Q14 -->
        <div class="q-card" id="qc-14">
          <div class="q-num"><span>第 14 題 (填空)</span> <span>5 分</span></div>
          <div class="q-text">承上題（每月還款 2,158.38 金幣），公會繳了第一個月後，該期所支付的 2,158.38 金幣中，有多少金幣是純粹支付「利息」？</div>
          <div><input type="text" class="fill-input" id="q14" placeholder="請輸入利息金額，如：1800"></div>
          <div class="explanation" id="exp-14">
            <strong>【解剖思路】標準答案：1,800</strong><br>
            第一期初始欠款本金為 360,000。第 1 個月的利息 = $360,000 \times 0.5\% = 1,800$ 金幣。（因此僅有 $2,158.38 - 1,800 = 358.38$ 是在還本金！）
          </div>
        </div>

        <!-- Q15 -->
        <div class="q-card" id="qc-15">
          <div class="q-num"><span>第 15 題 (填空)</span> <span>5 分</span></div>
          <div class="q-text">承第 13 題，若公會剛繳完第 359 期（還剩最後 1 期即還清），請問在剛繳完第 359 期當下，其「未償還貸款本金餘額」約為多少金幣？（取至整數或一位小數）</div>
          <div><input type="text" class="fill-input" id="q15" placeholder="請輸入餘額，如：2148"></div>
          <div class="explanation" id="exp-15">
            <strong>【解剖思路】標準答案：2,148（或 2,147.64）</strong><br>
            運用前瞻法！只剩最後 1 筆款項 $C = 2,158.38$。<br>
            $\text{餘額} = \frac{2,158.38}{1 + 0.005} \approx 2,147.64$ 金幣。
          </div>
        </div>

        <!-- Q16 -->
        <div class="q-card" id="qc-16">
          <div class="q-num"><span>第 16 題 (填空)</span> <span>5 分</span></div>
          <div class="q-text">10 年期美國公債殖利率為 4.2%，而同為 10 年期的某家大型冒險工會公司債殖利率為 6.7%。請問該公司債的「信用利差（Credit Spread）」為多少 %？</div>
          <div><input type="text" class="fill-input" id="q16" placeholder="請輸入利差，如：2.5%"></div>
          <div class="explanation" id="exp-16">
            <strong>【解剖思路】標準答案：2.5%</strong><br>
            $\text{Credit Spread} = 6.7\% - 4.2\% = 2.5\%$（亦即 250 個基點 bps）。
          </div>
        </div>

        <!-- Q17 -->
        <div class="q-card" id="qc-17">
          <div class="q-num"><span>第 17 題 (填空)</span> <span>5 分</span></div>
          <div class="q-text">帝國目前的 1 年期利率為 5%，市場預期明年的 1 年期利率為 7%。根據純粹預期理論，無套利的 2 年期零息公債殖利率 $r_2$ 約為多少 %？（四捨五入至小數點後第二位）</div>
          <div><input type="text" class="fill-input" id="q17" placeholder="請輸入答案，如：5.99%"></div>
          <div class="explanation" id="exp-17">
            <strong>【解剖思路】標準答案：5.99%（或 6.0%）</strong><br>
            $(1 + r_2)^2 = (1 + 0.05)(1 + 0.07) = 1.05 \times 1.07 = 1.1235$。<br>
            $1 + r_2 = \sqrt{1.1235} \approx 1.05995 \implies r_2 \approx 5.99\%$。
          </div>
        </div>

        <!-- Q18 -->
        <div class="q-card" id="qc-18">
          <div class="q-num"><span>第 18 題 (填空)</span> <span>5 分</span></div>
          <div class="q-text">若 1 年期有效利率 EAR 為 10.25%，相當於每半年計息一次的 APR（標明名目年利率）為多少 %？</div>
          <div><input type="text" class="fill-input" id="q18" placeholder="請輸入答案，如：10%"></div>
          <div class="explanation" id="exp-18">
            <strong>【解剖思路】標準答案：10%</strong><br>
            $(1 + r_{\text{semi}})^2 = 1.1025 \implies 1 + r_{\text{semi}} = 1.05 \implies r_{\text{semi}} = 5\%$。<br>
            因此每半年計息的 $\text{APR} = 5\% \times 2 = 10\%$。
          </div>
        </div>

        <!-- Q19 -->
        <div class="q-card" id="qc-19">
          <div class="q-num"><span>第 19 題 (填空)</span> <span>5 分</span></div>
          <div class="q-text">某高風險礦業專案的名目報酬率為 15.5%，該年度通貨膨脹率高達 10.0%。請使用「精確費雪公式」計算其實質報酬率為多少 %？</div>
          <div><input type="text" class="fill-input" id="q19" placeholder="請輸入答案，如：5%"></div>
          <div class="explanation" id="exp-19">
            <strong>【解剖思路】標準答案：5%</strong><br>
            $r_r = \frac{r - i}{1 + i} = \frac{0.155 - 0.10}{1 + 0.10} = \frac{0.055}{1.10} = 0.05 = 5.0\%$。
          </div>
        </div>

        <!-- Q20 -->
        <div class="q-card" id="qc-20">
          <div class="q-num"><span>第 20 題 (填空)</span> <span>5 分</span></div>
          <div class="q-text">國庫發行連續複利年利率為 5% 的特種債券，投入 10,000 金幣，在 3 年後的終值（本利和）約為多少金幣？（四捨五入取整數，如 11618）</div>
          <div><input type="text" class="fill-input" id="q20" placeholder="請輸入金額，如：11618"></div>
          <div class="explanation" id="exp-20">
            <strong>【解剖思路】標準答案：11,618</strong><br>
            $FV = PV \times e^{r \times t} = 10,000 \times e^{0.05 \times 3} = 10,000 \times e^{0.15}$。<br>
            $e^{0.15} \approx 1.161834$。<br>
            終值 $\approx 10,000 \times 1.161834 = 11,618$ 金幣。
          </div>
        </div>

      </div>

      <!-- 操作按鈕列 -->
      <div class="exam-actions">
        <button class="btn btn-primary" onclick="gradeExam()">🎯 一鍵智能批改試卷</button>
        <button class="btn btn-skip" onclick="skipAndShowAnswers()">⏩ 略過（直接填入標準答案並展開解剖思路）</button>
        <button class="btn btn-reset" onclick="resetExam()">🔄 重新作答挑戰</button>
      </div>

      <!-- 成績公報 -->
      <div id="score-board">
        <div class="score-title">🏆 冒險者試煉考核結果報告</div>
        <div class="score-grade" id="final-score">0 分</div>
        <div class="score-comment" id="final-comment">評語加載中...</div>
      </div>
    </section>

  </main>

  <script>
    /* 工具 1 運算 */
    function calcT1() {
      const apr = parseFloat(document.getElementById('t1-apr').value) / 100;
      const freq = parseFloat(document.getElementById('t1-freq').value);
      let periodRate, ear;
      if (freq >= 99999) {
        ear = Math.exp(apr) - 1;
        periodRate = apr;
        document.getElementById('t1-res').innerHTML = `連續複利等效每秒利率無限逼近 | 有效年利率 (EAR)：<strong>${(ear * 100).toFixed(4)}%</strong>`;
      } else {
        periodRate = apr / freq;
        ear = Math.pow(1 + periodRate, freq) - 1;
        document.getElementById('t1-res').innerHTML = `每期實際利率：<strong>${(periodRate * 100).toFixed(4)}%</strong> | 有效年利率 (EAR)：<strong>${(ear * 100).toFixed(4)}%</strong>`;
      }
    }

    /* 工具 2 運算 */
    function calcT2() {
      const loan = parseFloat(document.getElementById('t2-loan').value);
      const apr = parseFloat(document.getElementById('t2-apr').value) / 100;
      const years = parseFloat(document.getElementById('t2-years').value);
      const passed = parseFloat(document.getElementById('t2-passed').value);

      const r = apr / 12;
      const n = years * 12;
      const pmt = (loan * r) / (1 - Math.pow(1 + r, -n));
      const remainingN = Math.max(0, n - passed);
      const balance = (pmt / r) * (1 - Math.pow(1 + r, -remainingN));

      document.getElementById('t2-res').innerHTML = `每月固定月供 (PMT)：<strong>$${pmt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong> | 繳交 ${passed} 期後未償還本金：<strong>$${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>`;
    }

    /* 工具 3 運算 */
    function calcT3() {
      const nom = parseFloat(document.getElementById('t3-nom').value) / 100;
      const inf = parseFloat(document.getElementById('t3-inf').value) / 100;
      const exact = (nom - inf) / (1 + inf);
      const approx = nom - inf;
      const diff = Math.abs(approx - exact);
      document.getElementById('t3-res').innerHTML = `精確實質利率：<strong>${(exact * 100).toFixed(4)}%</strong> | 費雪近似值 (r - i)：<strong>${(approx * 100).toFixed(4)}%</strong> (誤差 ${(diff * 100).toFixed(4)}%)`;
    }

    /* 工具 4 運算 */
    function calcT4() {
      const r1 = parseFloat(document.getElementById('t4-r1').value) / 100;
      const r2 = parseFloat(document.getElementById('t4-r2').value) / 100;
      const f2 = (Math.pow(1 + r2, 2) / (1 + r1)) - 1;
      const slope = f2 > r1 ? "向上正斜率 (Normal)" : (f2 < r1 ? "向下倒掛 (Inverted)" : "平坦 (Flat)");
      document.getElementById('t4-res').innerHTML = `隱含第 2 年遠期利率 f2：<strong>${(f2 * 100).toFixed(4)}%</strong> (殖利率曲線形態：<strong>${slope}</strong>)`;
    }

    /* 工具 5 運算 */
    function calcT5() {
      const r = parseFloat(document.getElementById('t5-rate').value) / 100;
      const t = parseFloat(document.getElementById('t5-tax').value) / 100;
      const inf = parseFloat(document.getElementById('t5-inf').value) / 100;

      const afterTaxNominal = r * (1 - t);
      const afterTaxReal = (afterTaxNominal - inf) / (1 + inf);
      document.getElementById('t5-res').innerHTML = `稅後名目利率：<strong>${(afterTaxNominal * 100).toFixed(4)}%</strong> | 稅後實質淨購買力增長：<strong>${(afterTaxReal * 100).toFixed(4)}%</strong>`;
    }

    /* 測驗系統標準答案 */
    const standardAnswers = {
      q1: "B",
      q2: "B",
      q3: "C",
      q4: "B",
      q5: "C",
      q6: "A",
      q7: "C",
      q8: "A",
      q9: "B",
      q10: "C",
      q11: ["18", "18%"],
      q12: ["19.56", "19.56%"],
      q13: ["2158", "2158.38", "2,158", "2,158.38"],
      q14: ["1800", "1,800"],
      q15: ["2148", "2147.64", "2,148", "2,147.64"],
      q16: ["2.5", "2.5%"],
      q17: ["5.99", "5.99%", "6", "6%", "6.0%"],
      q18: ["10", "10%"],
      q19: ["5", "5%", "5.0%"],
      q20: ["11618", "11,618"]
    };

    /* 智慧批改試卷 */
    function gradeExam() {
      let score = 0;

      // 檢查選擇題 1-10
      for (let i = 1; i <= 10; i++) {
        const key = 'q' + i;
        const card = document.getElementById('qc-' + i);
        const exp = document.getElementById('exp-' + i);
        const selected = document.querySelector(`input[name="${key}"]:checked`);
        
        exp.style.display = 'block';
        if (selected && selected.value === standardAnswers[key]) {
          score += 5;
          card.classList.remove('incorrect');
          card.classList.add('correct');
        } else {
          card.classList.remove('correct');
          card.classList.add('incorrect');
        }
      }

      // 檢查填空題 11-20
      for (let i = 11; i <= 20; i++) {
        const key = 'q' + i;
        const card = document.getElementById('qc-' + i);
        const exp = document.getElementById('exp-' + i);
        const inputVal = document.getElementById(key).value.trim().replace(/,/g, '');
        const validList = standardAnswers[key].map(v => v.replace(/,/g, '').trim());

        exp.style.display = 'block';
        if (validList.includes(inputVal)) {
          score += 5;
          card.classList.remove('incorrect');
          card.classList.add('correct');
        } else {
          card.classList.remove('correct');
          card.classList.add('incorrect');
        }
      }

      // 展示公報
      const scoreBoard = document.getElementById('score-board');
      const scoreText = document.getElementById('final-score');
      const commentText = document.getElementById('final-comment');

      scoreBoard.style.display = 'block';
      scoreText.innerHTML = `${score} <span style="font-size: 1.5rem; color: #64748b;">/ 100 分</span>`;

      let rank = "";
      if (score === 100) {
        rank = "👑 【傳奇大掌櫃】你的金融直覺與精算能力已通神！本章所有利率機關都已被你徹底攻破！";
      } else if (score >= 80) {
        rank = "⚔️ 【高階精算騎士】具備極佳的利率洞察力，僅有細微盲點，已具備期中考試虐場實力！";
      } else if (score >= 60) {
        rank = "🛡️ 【合格冒險管家】基本觀念及格，但遇到前瞻法計算或複利轉換時需更加細心！";
      } else {
        rank = "🌱 【見習銅卡學徒】利息的深水區有些嗆人！別氣餒，快看下方展開的「解剖思路」加固防線！";
      }
      commentText.innerHTML = rank;
      scoreBoard.scrollIntoView({ behavior: 'smooth' });
    }

    /* 略過功能：直接填入標準答案並展開解讀 */
    function skipAndShowAnswers() {
      // 填入選擇題
      for (let i = 1; i <= 10; i++) {
        const key = 'q' + i;
        const correctVal = standardAnswers[key];
        const radio = document.querySelector(`input[name="${key}"][value="${correctVal}"]`);
        if (radio) radio.checked = true;
        const card = document.getElementById('qc-' + i);
        card.classList.remove('incorrect');
        card.classList.add('correct');
        document.getElementById('exp-' + i).style.display = 'block';
      }

      // 填入填空題
      for (let i = 11; i <= 20; i++) {
        const key = 'q' + i;
        const inputEl = document.getElementById(key);
        inputEl.value = standardAnswers[key][0];
        const card = document.getElementById('qc-' + i);
        card.classList.remove('incorrect');
        card.classList.add('correct');
        document.getElementById('exp-' + i).style.display = 'block';
      }

      const scoreBoard = document.getElementById('score-board');
      scoreBoard.style.display = 'block';
      document.getElementById('final-score').innerHTML = `100 <span style="font-size: 1.5rem; color: #64748b;">/ 100 分 (解答解剖模式)</span>`;
      document.getElementById('final-comment').innerHTML = `⏩ 已成功為您填入 20 題標準解答，並完整揭示「解剖思路」！請順暢閱讀解析，掌握 Berk & DeMarzo 經典利率模型精髓！`;
      scoreBoard.scrollIntoView({ behavior: 'smooth' });
    }

    /* 重置測驗 */
    function resetExam() {
      for (let i = 1; i <= 10; i++) {
        const radios = document.querySelectorAll(`input[name="q${i}"]`);
        radios.forEach(r => r.checked = false);
        const card = document.getElementById('qc-' + i);
        card.classList.remove('correct', 'incorrect');
        document.getElementById('exp-' + i).style.display = 'none';
      }
      for (let i = 11; i <= 20; i++) {
        document.getElementById('q' + i).value = "";
        const card = document.getElementById('qc-' + i);
        card.classList.remove('correct', 'incorrect');
        document.getElementById('exp-' + i).style.display = 'none';
      }
      document.getElementById('score-board').style.display = 'none';
      window.scrollTo({ top: document.getElementById('exam-section').offsetTop - 20, behavior: 'smooth' });
    }
  </script>
</body>
</html>
'''

def main():
    target_filename = "Ch05_利率與資本成本_學習講義.html"

    # 目標路徑
    paths = [
        os.path.join(r"收件苗圃", "學習講義合輯", target_filename),
        os.path.join(r"C:\Users\閻星澄\Documents\WikiTree\收件苗圃\學習講義合集", target_filename),
        os.path.join(r"C:\Users\閻星澄\Desktop\學習講義合集", target_filename)
    ]

    for p in paths:
        dir_name = os.path.dirname(p)
        if not os.path.exists(dir_name):
            os.makedirs(dir_name, exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(HANDOUT_HTML)
        print(f"✅ 成功生成講義至: {p} (大小: {os.path.getsize(p)} bytes)")

if __name__ == "__main__":
    main()
