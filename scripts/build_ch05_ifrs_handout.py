# -*- coding: utf-8 -*-
# Intermediate Accounting IFRS 5e Chapter 5 Handout Builder: Cash and Receivables
import os
import shutil

html_content = r'''<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="中級會計學 IFRS 第五版 第五章：現金與應收款項（Cash and Receivables）繁體中文精緻學習講義。涵蓋受限制現金、銀行透支、應收帳款認列與變動對價、備抵損失壞帳提列、應收票據折價攤銷、應收帳款移轉與除列決策樹、零用金與銀行調節表、IFRS vs U.S. GAAP 深度對比。">
  <title>Chapter 5 現金與應收款項｜IFRS 中級會計學精緻學習講義 [金庫守護與信用魔導篇]</title>

  <!-- 數學公式渲染雙保險協議：MathJax 3 + 離線優雅降級 Fallback -->
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
                  .replace(/\$([^\$]+)\$/g, '<span style="font-family: Consolas, monospace; color: #0284c7; font-weight: 600;">$1</span>')
                  .replace(/\\times/g, ' × ')
                  .replace(/\\div/g, ' ÷ ')
                  .replace(/\\mathbf\{([^\}]+)\}/g, '<strong>$1</strong>')
                  .replace(/\\text\{([^\}]+)\}/g, '$1')
                  .replace(/\\approx/g, ' ≈ ')
                  .replace(/\\ge/g, ' ≥ ')
                  .replace(/\\le/g, ' ≤ ')
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
      --ink: #1e293b;
      --muted: #64748b;
      --paper: #f8fafc;
      --wash: #f1f5f9;
      --line: #cbd5e1;
      --accent: #0284c7; /* 天空湛藍 / 金庫流動之水 */
      --accent-light: #e0f2fe;
      --accent-dark: #0369a1;
      --gold: #d97706;
      --gold-light: #fffbeb;
      --gold-border: #fde68a;
      --alert: #dc2626;
      --alert-light: #fef2f2;
      --success: #16a34a;
      --success-light: #f0fdf4;
      --card-bg: #ffffff;
      --radius: 12px;
      --shadow: 0 4px 20px rgba(30, 41, 59, 0.06);
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
      background: linear-gradient(135deg, #0f172a 0%, #0369a1 60%, #0284c7 100%);
      color: #ffffff;
      padding: 4.5rem 5vw 3.5rem;
      border-bottom: 4px solid var(--gold);
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: "💰 🧾 🏦 ⚖️ 📜";
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
      color: #fef08a;
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
      max-width: 900px;
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
    .chapter-links {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1.2rem;
      font-size: 0.9rem;
    }
    .chapter-links a {
      color: #fef08a;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.12);
      padding: 0.3rem 0.8rem;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .chapter-links a:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    /* 佈局容器 */
    .container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 2.5rem 2rem 5rem;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 290px;
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
      color: var(--accent-dark);
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
    .toc-list li { margin-bottom: 0.55rem; }
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
      color: var(--accent-dark);
      font-weight: 600;
      transform: translateX(3px);
    }

    /* 主內文模組 */
    .main-content section {
      margin-bottom: 4rem;
      scroll-margin-top: 2rem;
    }
    h2 {
      font-size: 1.85rem;
      color: #0f172a;
      border-left: 6px solid var(--accent);
      padding-left: 1rem;
      margin: 2.5rem 0 1.5rem;
      line-height: 1.3;
    }
    h3 {
      font-size: 1.35rem;
      color: var(--accent-dark);
      margin: 2rem 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    p { margin: 0 0 1.2rem; }

    /* 英文術語高亮徽章 */
    .term {
      font-weight: 700;
      color: #0369a1;
      background: #e0f2fe;
      padding: 0.15rem 0.45rem;
      border-radius: 5px;
      display: inline-block;
      margin: 0 0.1rem;
    }
    .en-term {
      font-family: Consolas, Monaco, monospace;
      font-size: 0.9em;
      color: #0f766e;
      background: #ccfbf1;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      margin-left: 0.25rem;
      font-weight: 600;
    }

    /* 冒險故事與心法卡片 */
    .story-card {
      background: linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%);
      border: 1px solid #bae6fd;
      border-left: 6px solid var(--accent);
      padding: 1.5rem 1.8rem;
      border-radius: var(--radius);
      margin-bottom: 2rem;
      box-shadow: var(--shadow);
    }
    .story-header {
      font-weight: 700;
      color: var(--accent-dark);
      font-size: 1.15rem;
      margin-bottom: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    /* 陷阱卡片 */
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

    /* 準則與里程碑卡片 */
    .rule-card {
      background: linear-gradient(145deg, #ffffff 0%, var(--gold-light) 100%);
      border: 1px solid var(--gold-border);
      border-left: 6px solid var(--gold);
      padding: 1.5rem 1.8rem;
      border-radius: var(--radius);
      margin-bottom: 2rem;
      box-shadow: var(--shadow);
    }
    .rule-header {
      font-weight: 700;
      color: #92400e;
      font-size: 1.15rem;
      margin-bottom: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    /* 網格系統 */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      margin: 1.5rem 0 2rem;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.2rem;
      margin: 1.5rem 0 2rem;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
      box-shadow: 0 8px 25px rgba(30, 41, 59, 0.1);
    }
    .card-title {
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: 0.6rem;
      color: #0f172a;
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
      margin: 2.2rem 0;
      box-shadow: 0 6px 24px rgba(2, 132, 199, 0.1);
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
      color: var(--accent-dark);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .widget-badge {
      background: var(--accent);
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
      border-color: var(--accent);
      background: #ffffff;
    }
    .btn-calc {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
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
      background: linear-gradient(135deg, var(--accent-dark) 0%, #0c4a6e 100%);
      transform: translateY(-1px);
    }
    .calc-result-box {
      margin-top: 1.5rem;
      padding: 1.2rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    /* 表格樣式 */
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
      padding: 0.85rem 1.1rem;
      text-align: left;
      border-bottom: 1px solid var(--line);
    }
    .compare-table th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
    }
    .compare-table tr:hover {
      background: #f8fafc;
    }

    /* 分錄展示框 */
    .entry-box {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 1rem 1.2rem;
      margin: 0.8rem 0;
      font-family: Consolas, "Liberation Mono", Courier, monospace;
      font-size: 0.95rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    .entry-title {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 700;
      color: var(--accent-dark);
      margin-bottom: 0.4rem;
      font-size: 0.98rem;
    }

    /* 題解折疊 */
    .problem-box {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: var(--radius);
      padding: 1.5rem 1.8rem;
      margin-bottom: 1.6rem;
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
      color: var(--accent-dark);
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

    /* 決策樹節點按鈕樣式 */
    .tree-node {
      border: 2px solid #cbd5e1;
      border-radius: 8px;
      padding: 1.2rem;
      background: #f8fafc;
      margin-bottom: 1rem;
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
    <div class="eyebrow">👑 Intermediate Accounting · IFRS Edition (5th Ed.) · Chapter 5</div>
    <h1>Chapter 5：現金與應收款項</h1>
    <div class="subtitle">
      Cash and Receivables：守護商業帝國的金庫命脈與信用魔導！透視受限制現金、壞帳備抵矩陣、應收票據折價攤銷、資產除列決策樹與銀行調節表平衡術。
    </div>
    <div class="hero-meta">
      <span>📚 教材對應：Kieso, Weygandt, Warfield <i>Intermediate Accounting (IFRS 5e)</i> Ch 5</span>
      <span>🌲 知識架構：資產負債表流動性核心</span>
      <span>🎮 學習導師：冒險者公會首席大掌櫃</span>
      <span class="version-tag">雙保險 MathJax 3 &amp; 離線美化版</span>
    </div>
    <nav class="chapter-links" aria-label="相鄰章節">
      <a href="Ch01_IFRS_學習講義.html">← Ch01 觀念架構與會計循環</a>
      <a href="Ch02_IFRS_學習講義.html">← Ch02 損益表與權益變動表</a>
      <a href="Ch03_IFRS_學習講義.html">← Ch03 財務狀況表與現金流量表</a>
      <a href="Ch04_IFRS_學習講義.html">← Ch04 會計與貨幣時間價值</a>
      <span style="color:#fef08a; font-weight:700;">★ 當前章節：Ch05 現金與應收款項</span>
    </nav>
  </header>

  <div class="container">
    
    <!-- 主要內容區 -->
    <main class="main-content">

      <!-- 引言與冒險心法 -->
      <section id="prologue">
        <div class="story-card">
          <div class="story-header">
            <span>🛡️</span> 大掌櫃開篇密令：為什麼「現金」是血液，「應收款」是冒險公會的信用魔導？
          </div>
          <p>
            歡迎回到冒險者公會的掌櫃密室！如果說前面的章節是教你如何繪製「王國地圖（財務報表）」與施展「時間折現魔法」，那麼本章我們就要親手觸摸公會最核心的生命力——<strong>現金（Cash）</strong>與<strong>應收款項（Receivables）</strong>！
          </p>
          <p>
            很多年輕掌櫃以為「只要帳上記了收入，公會就發大財了」。大錯特錯！如果顧客賒帳買走屠龍寶劍，結果一年後變成爛帳（Bad Debt）跑路；或者你手上的金幣全被銀行抵押鎖死（Restricted Cash），公會明天就可能因為發不出薪水而瞬間倒閉！
          </p>
          <p>
            本章我們將學會：如何明辨哪些才是真正的現金與約當現金、如何估計變動對價與銷貨退回負債、如何用帳齡分析表精準提列壞帳備抵、如何對零利率應收票據進行折現攤銷，並掌握國際頂尖投行最核心的<strong>「應收款項移轉與除列決策樹」</strong>與<strong>「銀行存款調節表五大平衡招式」</strong>！
          </p>
        </div>
      </section>

      <!-- LO 1：現金與相關項目報表表達 -->
      <section id="lo-1">
        <h2>LO 1：現金 (Cash)、約當現金與相關項目的精準邊界</h2>
        <p>
          <strong>現金（Cash）</strong>是企業流動性最高的資產，也是所有其他交易衡量與計價的法定標準媒介。在財務狀況表上屬於<strong>流動資產（Current Asset）</strong>。
        </p>

        <div class="grid-2">
          <div class="card">
            <div class="card-title">
              <span>💎 現金的範疇</span>
              <span class="en-term">Cash Definition</span>
            </div>
            <p><strong>必須具備「立即可用性」且無任何支用限制：</strong></p>
            <ul>
              <li>硬幣、紙幣（Coin and Currency）</li>
              <li>活期存款、支票存款（Available funds on deposit at bank）</li>
              <li>郵政匯票、保付支票、銀行本票（Certified checks, Cashier’s checks）</li>
              <li>一般個人支票、銀行匯票（Bank drafts, Personal checks）</li>
              <li>儲蓄帳戶存款（Savings accounts）與零用金（Petty cash funds）</li>
            </ul>
          </div>

          <div class="card">
            <div class="card-title">
              <span>🚀 約當現金</span>
              <span class="en-term">Cash Equivalents</span>
            </div>
            <p><strong>短期、高度流動性之投資，同時符合以下兩大條件：</strong></p>
            <ol>
              <li>可隨時轉換為<strong>已知金額之現金</strong>（Readily convertible）。</li>
              <li>其價值變動之風險<strong>極其微小</strong>（Insignificant risk of changes in value）。</li>
            </ol>
            <p>💡 <strong>準則黃金年限：</strong>自取得日起算，<strong>到期日小於等於 3 個月</strong>（90 天內）的短期國庫券、商業本票（Commercial Paper）與貨幣市場基金（Money Market Funds）。</p>
          </div>
        </div>

        <!-- 專題：受限制現金、補償性餘額與銀行透支 -->
        <h3>🔒 特殊現金項目的分類與會計處理</h3>
        <div class="grid-3">
          <div class="card">
            <div class="card-title">
              <span>受限制現金</span>
              <span class="en-term">Restricted Cash</span>
            </div>
            <p><strong>專款專用，嚴禁與一般現金混列：</strong></p>
            <p>例如：擴建廠房基金、償還長期債券基金（Sinking fund）。</p>
            <p>
              • 預計於 1 年或一營業週期內支用：列為<strong>流動資產</strong>；<br>
              • 超過 1 年以上長期專案：列為<strong>非流動資產（投資或其他資產）</strong>。
            </p>
            <p style="font-size:0.88rem; color:var(--muted);">範例 (Illustration 5.1 Infosys)：將信託與保證金存款列為受限制現金單獨揭露。</p>
          </div>

          <div class="card">
            <div class="card-title">
              <span>補償性餘額</span>
              <span class="en-term">Compensating Balances</span>
            </div>
            <p><strong>銀行借款的「人質存款」：</strong></p>
            <p>借款公司承諾在銀行帳戶中常態維持的<strong>最低存款餘額</strong>，作為借款的附帶條件。</p>
            <p>
              此金額失去了完全的流動自由，必須依借款性質於流動或非流動資產中<strong>單獨列報</strong>，並於財報附註充分揭露借貸合約條件！
            </p>
          </div>

          <div class="card" style="border:2px solid var(--accent); background:#f0fdfa;">
            <div class="card-title">
              <span>銀行透支</span>
              <span class="en-term">Bank Overdrafts</span>
            </div>
            <p><strong>支票開出金額超過存款餘額：</strong></p>
            <p>
              • <strong>IFRS 規定：</strong>若該透支「可隨時應要求償還（Repayable on demand）」，且為公司日常現金管理不可分割的一部分（如同一銀行內互抵安排），可作為<strong>現金與約當現金的減項</strong>！<br>
              • <strong>U.S. GAAP 規定：</strong>一律列為<strong>流動負債（Current Liability）</strong>，嚴禁直接扣減現金！
            </p>
          </div>
        </div>

        <!-- 現金與非現金項目快速辨認地圖 (Illustration 5.2) -->
        <h3>🧭 現金相關項目分類速查指南 (Illustration 5.2)</h3>
        <table class="compare-table">
          <thead>
            <tr>
              <th>項目 (Item)</th>
              <th>財報正確分類 (Classification)</th>
              <th>掌櫃心法與附註說明 (Comment)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>現金、零用金 (Petty Cash &amp; Change Funds)</td>
              <td><span style="color:var(--success); font-weight:700;">現金 (Cash)</span></td>
              <td>無限制者列為現金；零用金直接歸入現金總額。</td>
            </tr>
            <tr>
              <td>短期商業票據 (Short-term paper &lt; 3 個月)</td>
              <td><span style="color:var(--success); font-weight:700;">約當現金 (Cash Equivalents)</span></td>
              <td>自取得日起到期日在 3 個月以內，與現金合併列報。</td>
            </tr>
            <tr>
              <td>短期商業票據 (到期日 3 ～ 12 個月)</td>
              <td><strong>短期投資 (Short-term Investments)</strong></td>
              <td>超過 3 個月，不屬於約當現金，列為透過損益按公允價值衡量之金融資產。</td>
            </tr>
            <tr>
              <td>遠期支票 (Postdated Checks) &amp; 借條 (I.O.U.s)</td>
              <td><strong>應收款項 (Receivables)</strong></td>
              <td>遠期支票尚未到期，借條為員工或他人的欠款，推定能收回前列為應收款。</td>
            </tr>
            <tr>
              <td>員工出差預支款 (Travel Advances)</td>
              <td><strong>應收款項 (Receivables) / 預付費用</strong></td>
              <td>推定未來可自員工薪資扣抵或報銷差旅費。</td>
            </tr>
            <tr>
              <td>庫存郵票、印花 (Postage on Hand)</td>
              <td><strong>預付費用 (Prepaid Expenses)</strong></td>
              <td>未消耗的郵資視為預付費用或文具用品盤存，不可列為現金！</td>
            </tr>
            <tr>
              <td>銀行透支 (Bank Overdrafts)</td>
              <td><strong>現金減項 (IFRS) / 流動負債 (GAAP)</strong></td>
              <td>無互抵協議時列為流動負債；IFRS 具備日常資金管理互抵性質時列為現金減項。</td>
            </tr>
            <tr>
              <td>補償性存款餘額 (Compensating Balances)</td>
              <td><strong>單獨分類存款 (Separately Classified)</strong></td>
              <td>依長短期借款性質分類，並於附註揭露借貸合約協議。</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- LO 2：應收帳款之認列與變動對價 -->
      <section id="lo-2">
        <h2>LO 2：應收帳款之認列 (Recognition) 與變動對價 (Variable Consideration)</h2>
        <p>
          <strong>應收款項（Receivables）</strong>是企業向顧客或第三方索取金錢、商品或服務的索償權利（Claims）。分為<strong>口頭約定承諾的應收帳款（Accounts Receivable）</strong>與<strong>正式書面承諾的應收票據（Notes Receivable）</strong>。
        </p>

        <!-- 收入認列核心與控制權移轉 -->
        <div class="rule-card">
          <div class="rule-header">
            <span>📜</span> IFRS 15 核心法則：控制權移轉即認列 (Change in Control)
          </div>
          <p>
            根據 IFRS 15 客戶合約之收入，當企業<strong>滿足履約義務（Transfer of good/service）</strong>且客戶取得該商品之<strong>控制權（Control）</strong>時，方能認列應收帳款與銷貨收入！
          </p>
          <p><strong>控制權移轉的五大關鍵指標（以 Lululemon 出售瑜珈服為例）：</strong></p>
          <ol>
            <li>企業已擁有收取對價之現時權利（Right to payment）。</li>
            <li>企業已將商品法定所有權移轉給客戶（Legal title passed）。</li>
            <li>企業已移轉實體占有（Physical possession transferred）。</li>
            <li>商品所有權之重大風險與報酬已移轉客戶（Risks and rewards of ownership）。</li>
            <li>客戶已正式接受該項資產（Customer has accepted the asset）。</li>
          </ol>
        </div>

        <!-- 變動對價三部曲：商業折扣、現金折扣 (總額法 vs 淨額法) 與銷貨退回負債 -->
        <h3>🏷️ 交易價格與變動對價的三大修煉</h3>
        
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-title">
            <span>1. 商業折扣 (Trade Discounts)</span>
            <span class="en-term">數量折扣 / 目錄折扣</span>
          </div>
          <p>
            用以避免頻繁印刷目錄、針對大量採購給予優惠，或向競爭對手隱瞞真實報價。
            <strong>商業折扣直接從定價中扣除，帳上「永遠不記錄商業折扣」！應收帳款一律以折價後的實際成交金額入帳。</strong>
          </p>
        </div>

        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-title">
            <span>2. 現金折扣 (Cash / Sales Discounts)：總額法 vs 淨額法</span>
            <span class="en-term">如條款 2/10, n/30</span>
          </div>
          <p>
            鼓勵買方儘早付款（10 天內付款享 2% 現金折扣，最晚 30 天付清）。中級會計學核心對決：<strong>總額法（Gross Method）</strong> vs <strong>淨額法（Net Method）</strong>！
          </p>

          <table class="compare-table" style="font-size:0.9rem;">
            <thead>
              <tr>
                <th>交易情境 (銷貨 €10,000, 2/10, n/30)</th>
                <th>總額法 (Gross Method)</th>
                <th>淨額法 (Net Method - 理論最佳)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>銷貨成立日</strong></td>
                <td>
                  借：應收帳款 10,000<br>
                  &emsp;貸：銷貨收入 10,000
                </td>
                <td>
                  借：應收帳款 9,800 (直接扣除2%)<br>
                  &emsp;貸：銷貨收入 9,800
                </td>
              </tr>
              <tr>
                <td><strong>折扣期內收現 €4,000 帳款</strong><br>(買方享 2% 折扣實付 €3,920)</td>
                <td>
                  借：現金 3,920<br>
                  借：銷貨折扣 80 (收入減項)<br>
                  &emsp;貸：應收帳款 4,000
                </td>
                <td>
                  借：現金 3,920<br>
                  &emsp;貸：應收帳款 3,920
                </td>
              </tr>
              <tr>
                <td><strong>超過折扣期收現剩餘 €6,000</strong><br>(買方逾期喪失折扣實付 €6,000)</td>
                <td>
                  借：現金 6,000<br>
                  &emsp;貸：應收帳款 6,000
                </td>
                <td>
                  借：現金 6,000<br>
                  &emsp;貸：應收帳款 5,880<br>
                  &emsp;貸：<strong>顧客未享折扣 (Sales Discounts Forfeited) 120</strong> (列為財務收益)
                </td>
              </tr>
            </tbody>
          </table>
          <p style="font-size:0.92rem; color:var(--muted);">
            💡 <strong>掌櫃點評：</strong>淨額法將應收帳款自始至終評價於「預期可實現淨額」，並將客戶逾期多繳的 $120 視為融資性質的「顧客未享折扣」（其他利益/利息收入），在理論上最能真實反映資產價值！
          </p>
        </div>

        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-title">
            <span>3. 銷貨退回與折讓之退款負債 (Sales Returns and Allowances)</span>
            <span class="en-term">Refund / Return Liability</span>
          </div>
          <p>
            根據 IFRS 15，銷貨時若附帶退貨權，企業必須在銷貨時<strong>「預估潛在退貨金額」</strong>，將預期退貨部分自銷貨收入中扣除，並認列<strong>退款負債（Return Liability）</strong>！
          </p>
          <div style="background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #cbd5e1; font-size:0.92rem;">
            <strong>課堂經典實例 (Max Glass 銷售抗風玻璃，總價 $5,000，預估退貨 $400)：</strong><br>
            • <strong>1/4 賒銷入帳：</strong><br>
            &emsp;借：應收帳款 5,000<br>
            &emsp;&emsp;貸：銷貨收入 4,600 (淨額預估)<br>
            &emsp;&emsp;貸：<strong>退款負債 (Return Liability) 400</strong><br>
            • <strong>1/16 顧客反映瑕疵，給予實際折讓 $300：</strong><br>
            &emsp;借：<strong>退款負債 300</strong><br>
            &emsp;&emsp;貸：應收帳款 300<br>
            👉 <strong>期末報表呈現：</strong>資產負債表列報應收帳款淨額 <strong>$4,700</strong> ($5,000 - $300)，流動負債列報剩餘退款負債 <strong>$100</strong> ($400 - $300)，損益表認列淨銷貨收入 <strong>$4,600</strong>！
          </div>
        </div>

        <!-- 應收帳款的時間價值例外 -->
        <div class="trap-card">
          <div class="trap-header">
            <span>⚠️</span> 避坑指南：正常營業週期應收帳款為何「不折現」？
          </div>
          <p>
            在理論上，銷貨後只要有延期付款，就隱含著利息收入。但會計實務上基於<strong>重大性原則（Materiality）</strong>，準則明文規定：<strong>「在正常商業條件下產生、到期期限在一年以內的正常營業應收帳款，無須進行現值折現！」</strong>
          </p>
        </div>
      </section>

      <!-- LO 3：應收帳款之評價與壞帳提列 -->
      <section id="lo-3">
        <h2>LO 3：應收帳款之評價 (Valuation) 與壞帳備抵衡量</h2>
        <p>
          進行信用賒銷必然伴隨著<strong>無法收回款項的倒帳風險（Credit Losses / Bad Debts）</strong>。會計上應收帳款的評價目標，是讓資產負債表上的應收帳款按<strong>現金可實現價值（Cash Realizable Value）</strong>列報！
        </p>

        <!-- 兩種壞帳處理方法對比 -->
        <div class="grid-2">
          <div class="card">
            <div class="card-title">
              <span>直接沖銷法 (Direct Write-Off)</span>
              <span class="en-term">理論重大缺陷 ❌</span>
            </div>
            <p><strong>做法：</strong>直到某筆帳款確定無法收回的那一天，才一次性借記「壞帳費用」，貸記「應收帳款」。</p>
            <p><strong>致命缺陷：</strong></p>
            <ul>
              <li>違反<strong>收入費用配合原則（Matching Principle）</strong>：今年的銷貨壞帳往往拖到明年才沖銷。</li>
              <li>資產負債表上的應收帳款被<strong>嚴重高估</strong>，無法反映真實現金可實現價值。</li>
              <li><strong>IFRS 嚴格禁止：</strong>除非壞帳金額微不足道（Immaterial），否則絕不允許使用！</li>
            </ul>
          </div>

          <div class="card" style="border:2px solid var(--accent); background:#f0fdfa;">
            <div class="card-title">
              <span>備抵法 (Allowance Method)</span>
              <span class="en-term">IFRS 強制標準規範 ✅</span>
            </div>
            <p><strong>做法：</strong>在每期期末，依據歷史經驗與前瞻性預測，<strong>預先估計</strong>未來的倒帳金額並提列備抵。</p>
            <p><strong>兩大精髓：</strong></p>
            <ul>
              <li>將壞帳損失與同期的賒銷收入精準配合在同一個會計期間。</li>
              <li>設置<strong>「備抵損失 / 備抵呆帳（Allowance for Doubtful Accounts）」</strong>作為應收帳款的抵銷科目（Contra Asset），真實揭露淨變現價值！</li>
            </ul>
          </div>
        </div>

        <!-- 備抵法三大核心分錄演示：提列、沖銷與收回 -->
        <h3>📝 備抵法三大生命週期分錄 (Brown Furniture 經典範例)</h3>
        
        <div class="entry-box">
          <div class="entry-title">① 期末提列預估壞帳 (Adjusting Entry)</div>
          Brown Furniture 賒銷 £1,800,000，期末應收帳款餘額 £150,000，經理評估將有 £10,000 無法收回：<br>
          <span style="color:var(--accent-dark); font-weight:700;">借：壞帳費用 (Bad Debt Expense) 10,000</span><br>
          &emsp;<span style="color:var(--accent-dark); font-weight:700;">貸：備抵損失 (Allowance for Doubtful Accounts) 10,000</span><br>
          <span style="font-size:0.88rem; color:var(--muted);">👉 報表列報：應收帳款總額 £150,000 - 備抵損失 £10,000 = 現金可實現價值 £140,000！</span>
        </div>

        <div class="entry-box">
          <div class="entry-title">② 確定倒帳時正式沖銷 (Write-Off of an Account)</div>
          次年 3/1 確定客戶 Randall 欠款 £1,000 徹底倒閉無法收回，董事會核准沖銷：<br>
          <span style="color:var(--alert); font-weight:700;">借：備抵損失 (Allowance for Doubtful Accounts) 1,000</span><br>
          &emsp;<span style="color:var(--alert); font-weight:700;">貸：應收帳款—Randall (Accounts Receivable) 1,000</span><br>
          <span style="font-size:0.88rem; color:var(--alert); font-weight:700;">💡 大掌櫃陷阱題：正式沖銷壞帳時，應收帳款的「現金可實現價值」有沒有改變？</span><br>
          <span style="font-size:0.88rem; color:var(--success);">答：完全沒有改變！因為應收帳款總額減少 1,000，備抵損失同時減少 1,000，相抵後淨值依然不變！</span>
        </div>

        <div class="entry-box">
          <div class="entry-title">③ 奇蹟生還！已沖銷帳款再度收回 (Recovery of a Write-Off)</div>
          同年 7/1 Randall 突然發財，自願償還先前已被沖銷的 £1,000 欠款（兩步驟入帳）：<br>
          <strong>步驟 1：先迴轉先前的沖銷分錄，恢復信用紀錄：</strong><br>
          借：應收帳款—Randall 1,000<br>
          &emsp;貸：備抵損失 1,000<br>
          <strong>步驟 2：記錄正常收取現金：</strong><br>
          借：現金 1,000<br>
          &emsp;貸：應收帳款—Randall 1,000
        </div>

        <!-- 帳齡分析表矩陣 (Illustration 5.6 Wilson & Co.) -->
        <h3>📊 應收帳款餘額百分比法之極致：帳齡分析表 (Aging Schedule)</h3>
        <p>
          現代企業最常用的方法為<strong>帳齡分析法（Aging Schedule）</strong>。帳款拖欠時間越久，違約機率呈指數級暴增！
        </p>

        <!-- 互動元件 1：帳齡分析表動態提列計算機 -->
        <div class="interactive-widget" id="widget-aging">
          <div class="widget-header">
            <div class="widget-title">
              <span>🧮 互動實驗室 1</span> Wilson &amp; Co. 帳齡分析表與壞帳調整分錄計算機
            </div>
            <span class="widget-badge">Interactive Aging Matrix</span>
          </div>
          <p style="font-size:0.95rem; color:var(--muted); margin-bottom:1.2rem;">
            下表直接還原課本 Illustration 5.6 經典矩陣。你可以自由調整「調整前備抵損失餘額」，即時計算出該提列的壞帳費用！
          </p>

          <table class="compare-table" style="font-size:0.9rem;">
            <thead>
              <tr>
                <th>帳齡分級 (Age Category)</th>
                <th>應收帳款金額 (€)</th>
                <th>預估違約率 (%)</th>
                <th>應有備抵損失餘額 (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>未逾期 (Under 30 days)</td>
                <td>€345,000</td>
                <td>0.8%</td>
                <td><strong>€2,760</strong></td>
              </tr>
              <tr>
                <td>逾期 30 ～ 60 天</td>
                <td>€115,000</td>
                <td>4.0%</td>
                <td><strong>€4,600</strong></td>
              </tr>
              <tr>
                <td>逾期 61 ～ 90 天</td>
                <td>€18,000</td>
                <td>15.0%</td>
                <td><strong>€2,700</strong></td>
              </tr>
              <tr>
                <td>逾期 91 ～ 120 天</td>
                <td>€14,000</td>
                <td>20.0%</td>
                <td><strong>€2,800</strong></td>
              </tr>
              <tr>
                <td>逾期 120 天以上 (Over 120 days)</td>
                <td>€55,000</td>
                <td>25.0%</td>
                <td><strong>€13,750</strong></td>
              </tr>
              <tr style="background:#e0f2fe; font-weight:700;">
                <td>合計總額 (Total)</td>
                <td>€547,000</td>
                <td>—</td>
                <td style="color:var(--accent-dark); font-size:1.05rem;">期末應有備抵餘額：€26,610</td>
              </tr>
            </tbody>
          </table>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; align-items:center; margin-top:1rem;">
            <div class="form-group" style="margin-bottom:0;">
              <label>調整前「備抵損失」貸方餘額 (€)：</label>
              <input type="number" id="aging-pre-allow" class="form-control" value="800" step="100">
            </div>
            <div>
              <button class="btn-calc" onclick="calcAgingAdjustment()">
                <span>⚡ 計算本期應提列之壞帳費用</span>
              </button>
            </div>
          </div>
          <div id="aging-result" class="calc-result-box" style="display:none;"></div>
        </div>
      </section>

      <!-- LO 4：應收票據之認列與評價 -->
      <section id="lo-4">
        <h2>LO 4：應收票據 (Notes Receivable) 之認列、折價與有效利息法</h2>
        <p>
          <strong>應收票據</strong>是包含確定付款金額、指定到期日、並由出票人簽名之<strong>正式書面承諾（Formal Promissory Note）</strong>，具備法律上的流通轉讓性（Negotiable Instrument）。
        </p>

        <!-- 票據分類與折價機制 -->
        <div class="grid-3">
          <div class="card">
            <div class="card-title">
              <span>平價發行票據</span>
              <span class="en-term">Stated Rate = Market Rate</span>
            </div>
            <p><strong>Bigelow SA 範例 (Ill. 5.7)：</strong></p>
            <p>€10,000 票據，票面年息 10%，市場利率亦為 10%。</p>
            <p>
              本金折現值 €7,513 $+$ 利息年金現值 €2,487 = <strong>現值 €10,000</strong>。<br>
              發行日直接按面額 €10,000 入帳，每年底認列實收利息 €1,000！
            </p>
          </div>

          <div class="card">
            <div class="card-title">
              <span>零利率票據 (不附息)</span>
              <span class="en-term">Zero-Interest-Bearing Note</span>
            </div>
            <p><strong>Jeremiah Company 範例 (Ill. 5.9)：</strong></p>
            <p>收到面額 $10,000 的 3 年期零利率票據，市場利率 9%。</p>
            <p>
              $$\text{PV} = \$10,000 \times \frac{1}{(1.09)^3} = \mathbf{\$7,721.80}$$
              發行日現值為 $7,721.80。差額 <strong>$2,278.20</strong> 即為實質利息（折價），於 3 年內按有效利息法逐步攤銷為利息收入！
            </p>
          </div>

          <div class="card" style="border:2px solid var(--accent); background:#f0fdfa;">
            <div class="card-title">
              <span>低利折價票據</span>
              <span class="en-term">Stated Rate &lt; Market Rate</span>
            </div>
            <p><strong>Morgan Group 範例 (Ill. 5.11)：</strong></p>
            <p>面額 €10,000，票面利率 10%，市場利率高達 12%，3 年期。</p>
            <p>
              • 本金現值：€10,000 × 0.71178 = €7,118<br>
              • 利息現值：€1,000 × 2.40183 = €2,402<br>
              • <strong>票據發行現值 = €9,520</strong>（折價 €480）
            </p>
          </div>
        </div>

        <!-- Morgan 票據折價攤銷表 (Illustration 5.13) -->
        <h3>📊 應收票據折價攤銷表 (Morgan Group 10% 票據按 12% 折現)</h3>
        <table class="compare-table">
          <thead>
            <tr>
              <th>年度</th>
              <th>實收現金利息 (10%)</th>
              <th>利息收入 (期初帳面 × 12%)</th>
              <th>折價攤銷額 (增加票據帳面)</th>
              <th>期末票據帳面金額 (Carrying Amount)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>發行日</td><td>—</td><td>—</td><td>—</td><td><strong>€9,520</strong></td>
            </tr>
            <tr>
              <td>第 1 年底</td><td>€1,000</td><td>€1,142 (€9,520 × 12%)</td><td>€142</td><td>€9,662 (€9,520 + €142)</td>
            </tr>
            <tr>
              <td>第 2 年底</td><td>€1,000</td><td>€1,159 (€9,662 × 12%)</td><td>€159</td><td>€9,821</td>
            </tr>
            <tr>
              <td>第 3 年底</td><td>€1,000</td><td>€1,179</td><td>€179</td><td><strong>€10,000</strong></td>
            </tr>
            <tr style="font-weight:700; background:#f0fdfa;">
              <td>合計</td><td>€3,000</td><td>€3,480</td><td>€480</td><td>—</td>
            </tr>
          </tbody>
        </table>

        <!-- 以票據交換房地產或勞務的特殊公允價值衡量 -->
        <div class="rule-card">
          <div class="rule-header">
            <span>🏰</span> 以票據交換資產或勞務的評價原則 (Oasis Development Co. 實例)
          </div>
          <p>
            當企業出售土地或房產，收到一張無票面利率或利率顯不合理的長期票據時，<strong>票據現值應優先以「所換出資產之公允市價」入帳！</strong>
          </p>
          <p>
            <strong>案例：</strong>Oasis 出售帳面成本 $14,000 的土地給 Rusty Pelican 餐廳，換得一張 5 年後到期面額 $35,247 的不附息票據。成交日土地公允價值為 <strong>$20,000</strong>：<br>
            借：應收票據 20,000（以土地公允市價入帳）<br>
            &emsp;貸：土地 14,000（沖銷成本）<br>
            &emsp;貸：處分土地利益 6,000 ($20,000 - $14,000)
          </p>
        </div>
      </section>

      <!-- LO 5：應收款項之移轉、擔保借款與除列決策樹 -->
      <section id="lo-5">
        <h2>LO 5：應收款項融資移轉 (Transfers) 與 IFRS 除列終極決策樹</h2>
        <p>
          當企業急需資金、不願承擔催收成本、或受限於銀行借貸額度時，會利用手上的應收帳款進行融資。這在會計上迎來全書難度最高、也最精彩的考核點：<strong>這是「真正的出售（Sale）」還是「拿應收款去抵押借款（Secured Borrowing）」？</strong>
        </p>

        <!-- 擔保借款實例：Meng Mills 與 Sino Bank (Illustration 5.14) -->
        <h3>1. 擔保借款 (Secured Borrowing / Assignment of Receivables)</h3>
        <p>
          <strong>特徵：</strong>企業將應收帳款質押給銀行，借入現金。應收帳款<strong>未轉移實質風險與報酬</strong>，客戶依然向企業還款，企業依然承擔壞帳與退貨損失！
        </p>
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-title">
            <span>Meng Mills 質押借款全流程 (Illustration 5.14)</span>
            <span class="en-term">NT$700,000 帳款質押，借 NT$500,000，手續費 1%，年息 12%</span>
          </div>
          <ol style="font-size:0.92rem;">
            <li><strong>3/1 質押借款成立：</strong>銀行扣除 1% 手續費 NT$7,000，發放現金 NT$493,000。<br>
              &emsp;借：現金 493,000 ｜ 借：財務費用 (手續費) 7,000 ｜ 貸：應付票據 500,000</li>
            <li><strong>3 月份收現與退貨：</strong>收現 434,000、銷貨折扣 6,000、退貨 14,000，沖銷應收帳款 NT$454,000。</li>
            <li><strong>4/1 將收到的現金還給銀行（加計一個月利息 1%）：</strong><br>
              &emsp;借：利息費用 5,000 (500,000 × 12% × 1/12) ｜ 借：應付票據 434,000 ｜ 貸：現金 439,000</li>
            <li><strong>4 月份收回剩餘帳款並認列壞帳 NT$2,000：</strong>收現 NT$244,000，沖銷應收帳款 NT$246,000。</li>
            <li><strong>5/1 清償剩餘借款本息 (本金剩 66,000，利息 660)：</strong>借：應付票據 66,000 ｜ 借：利息費用 660 ｜ 貸：現金 66,660。</li>
          </ol>
        </div>

        <!-- 應收款項移轉與 IFRS 除列決策樹 (Illustration 5.15) -->
        <h3>2. IFRS 應收款項除列 (Derecognition) 終極判斷法則</h3>
        <div class="rule-card">
          <div class="rule-header">
            <span>🌳</span> IFRS 9 應收帳款移轉與除列決策樹 (Illustration 5.15)
          </div>
          <p>面對任何應收款移轉合約，審計師與掌櫃必須依序通過以下<strong>三大關卡</strong>：</p>
          <ol>
            <li>
              <strong>第一關：是否移轉了「幾乎所有重大風險與報酬」？</strong><br>
              • <strong>YES：</strong>符合<strong>出售會計處理（Sale Accounting）</strong>！將應收帳款自資產負債表<strong>除列（Derecognize）</strong>，認列處分損益！<br>
              • <strong>NO：</strong>進入第二關。
            </li>
            <li>
              <strong>第二關：是否保留了「幾乎所有重大風險與報酬」？</strong><br>
              • <strong>YES (如附完全追索權/保證全額買回)：</strong>視為<strong>擔保借款（Secured Borrowing）</strong>！資產負債表上<strong>不得除列應收帳款</strong>，同時認列一筆借款金融負債！<br>
              • <strong>NO：</strong>進入第三關。
            </li>
            <li>
              <strong>第三關：控制權測試 (Control Test)——是否保留對應收款項的控制權？</strong><br>
              • <strong>未保留控制權 (買方可自由處分出售)：</strong>視為<strong>出售處理並除列</strong>。<br>
              • <strong>保留控制權：</strong>依企業之<strong>持續參與程度（Continuing Involvement）</strong>繼續認列相關資產與負債。
            </li>
          </ol>
        </div>

        <!-- 應收帳款承購 (Factoring)：無追索權 vs 有追索權完整分錄 (Illustration 5.17 & 5.18) -->
        <h3>3. 應收帳款承購 (Factoring) 實務分錄拆解</h3>
        <div class="grid-2">
          <div class="card">
            <div class="card-title">
              <span>無保證出售 (Sale without Guarantee)</span>
              <span class="en-term">無追索權承購 (Non-recourse)</span>
            </div>
            <p><strong>Crest Textiles 出售 €500,000 帳款 (Ill. 5.17)：</strong></p>
            <p>承購商收取 3% 手續費 (€15,000)，並暫扣 5% 保留款 (€25,000) 以備客戶退貨或折讓：</p>
            <div class="entry-box" style="font-size:0.9rem;">
              借：現金 (實拿 92%) 460,000<br>
              借：應收承購商保留款 (Due from Factor) 25,000<br>
              借：<strong>出售應收款損失 (Loss on Sale) 15,000</strong><br>
              &emsp;貸：應收帳款 500,000 (完全除列！)
            </div>
          </div>

          <div class="card" style="border:2px solid var(--alert); background:#fef2f2;">
            <div class="card-title">
              <span>附保證移轉 (Sale with Guarantee)</span>
              <span class="en-term">有追索權 / 實質為借款 (Failed Sale)</span>
            </div>
            <p><strong>Crest Textiles 承擔完全違約保證 (Ill. 5.18)：</strong></p>
            <p>因保留了幾乎所有信用風險，IFRS 規定視為<strong>失敗的出售（Failed Sale）/ 借款</strong>：</p>
            <div class="entry-box" style="font-size:0.9rem;">
              借：現金 460,000<br>
              借：應收承購商保留款 25,000<br>
              借：財務費用 (手續費) 15,000<br>
              &emsp;貸：<strong>追索負債 (Recourse Liability) 500,000</strong><br>
              <span style="color:var(--alert); font-weight:700;">（原應收帳款資產依然保留在帳上，不得除列！）</span>
            </div>
          </div>
        </div>

        <!-- 應收帳款週轉率與收現天數 -->
        <h3>📈 應收帳款財務分析指標 (Illustration 5.22 LVMH Group 實例)</h3>
        <div class="card">
          <div class="grid-2">
            <div>
              <p><strong>應收帳款週轉率 (Accounts Receivable Turnover)：</strong></p>
              $$\text{週轉率} = \frac{\text{淨銷貨收入 (Net Sales)}}{\text{平均應收帳款淨額 (Average Net Receivables)}}$$
            </div>
            <div>
              <p><strong>平均收現天數 (Days to Collect / Days Sales Outstanding)：</strong></p>
              $$\text{收現天數} = \frac{365 \text{ 天}}{\text{應收帳款週轉率}}$$
            </div>
          </div>
          <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-size:0.92rem; margin-top:0.8rem;">
            <strong>LVMH 酩悅·軒尼詩-路易·威登 實測：</strong><br>
            2018 年淨營收 €35,664 百萬，期初應收帳款 €2,274 百萬，期末 €2,521 百萬（平均 €2,397.5 百萬）：<br>
            • 應收帳款週轉率 = $$€35,664 \div €2,397.5 = \mathbf{14.9 \text{ 次}}$$！<br>
            • 平均收現天數 = $$365 \div 14.9 = \mathbf{24.5 \text{ 天}}$$！說明 LVMH 擁有極強的議價能力與資金回籠效率。
          </div>
        </div>
      </section>

      <!-- LO 6：現金內部控制——定額零用金制度與銀行存款調節表 -->
      <section id="lo-6">
        <h2>LO 6：現金內部控制——定額零用金 (Petty Cash) 與 銀行存款調節表 (Bank Reconciliation)</h2>

        <!-- 定額零用金四部曲 -->
        <h3>1. 定額零用金制度 (The Imprest Petty Cash System)</h3>
        <p>
          為了避免辦公室日常微小支出（如買郵票、便當、文具）每次都要大費周章開支票，企業設立<strong>定額零用金制度</strong>：
        </p>
        <div class="grid-2">
          <div class="entry-box">
            <div class="entry-title">Step 1 &amp; 2：撥充設立零用金 ($300)</div>
            借：零用金 (Petty Cash) 300<br>
            &emsp;貸：現金 (Cash) 300<br>
            <span style="font-size:0.88rem; color:var(--muted);">（平時保管員憑單據發放零錢，帳上完全不做任何分錄！）</span>
          </div>

          <div class="entry-box">
            <div class="entry-title">Step 3：耗盡報銷補足零用金 (有短溢 $2)</div>
            單據：文具 $42、郵資 $53、雜項 $76，零用金盒只剩 $127 (應有 $129)：<br>
            借：辦公用品費用 42<br>
            借：郵電費 53<br>
            借：雜項費用 76<br>
            借：<strong>現金短溢 (Cash Over and Short) 2</strong><br>
            &emsp;貸：現金 173
          </div>
        </div>

        <!-- 銀行存款調節表五大平衡招式 -->
        <h3>2. 銀行存款調節表 (Reconciliation of Bank Balances)</h3>
        <p>
          每期期末，<strong>銀行對帳單餘額（Balance per Bank）</strong>與<strong>公司帳面餘額（Balance per Books）</strong>幾乎永遠對不攏！原因在於<strong>時間差（Time Lags）</strong>與<strong>記帳錯誤（Errors）</strong>：
        </p>

        <!-- 調節表結構卡片 -->
        <div class="grid-2">
          <div class="card" style="border-left:5px solid #0284c7;">
            <div class="card-title">🏦 銀行對帳單端調整 (Balance per Bank)</div>
            <ul style="font-size:0.95rem;">
              <li><strong>加：在途存款 (Deposits in Transit)</strong>（公司已入帳送出，銀行尚未登帳）</li>
              <li><strong>加：未存入之庫存現金 (Cash on Hand)</strong></li>
              <li><strong>加：銀行錯誤使餘額少計者</strong></li>
              <li><strong>減：未兌現支票 (Outstanding Checks)</strong>（公司已開出入帳，持票人尚未赴銀行兌現）</li>
              <li><strong>減：銀行錯誤使餘額多計者</strong></li>
            </ul>
          </div>

          <div class="card" style="border-left:5px solid #16a34a;">
            <div class="card-title">📖 公司帳面端調整 (Balance per Books)</div>
            <ul style="font-size:0.95rem;">
              <li><strong>加：銀行代收票據與利息 (Bank Collections / Credits)</strong></li>
              <li><strong>加：公司記帳錯誤使帳面少計者</strong></li>
              <li><strong>減：銀行手續費 (Bank Service Charges)</strong></li>
              <li><strong>減：顧客跳票 / 存款不足退票 (NSF Checks)</strong></li>
              <li><strong>減：公司記帳錯誤使帳面多計者</strong></li>
            </ul>
          </div>
        </div>

        <!-- 互動元件 2：Nugget Mining 經典銀行調節表動態配平實驗室 -->
        <div class="interactive-widget" id="widget-bank-recon">
          <div class="widget-header">
            <div class="widget-title">
              <span>⚖️ 互動實驗室 2</span> Nugget Mining Company 銀行存款調節表動態配平術
            </div>
            <span class="widget-badge">Bank Reconciliation Live</span>
          </div>
          <p style="font-size:0.95rem; color:var(--muted); margin-bottom:1.2rem;">
            根據課本 Illustration 5A.1 &amp; 5A.2 完整還原 11 月 30 日調節表。點擊按鈕親手調平兩端餘額，並自動產出<strong>公司帳面必備的 4 大更正分錄</strong>！
          </p>

          <table class="compare-table" style="font-size:0.92rem;">
            <thead>
              <tr>
                <th style="width:50%;">銀行對帳單端 (Bank: $22,190)</th>
                <th style="width:50%;">公司帳面端 (Books: $20,502)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  • 加：11/30 在途存款：<strong>+$3,680</strong><br>
                  • 加：銀行誤扣他家 Nugent 油公司支票：<strong>+$175</strong><br>
                  • 減：未兌現支票三張 (#7327, #7348, #7349)：<strong>-$5,001</strong> ($150 + $4,820 + $31)
                </td>
                <td>
                  • 加：銀行代收紅杉公司債券利息：<strong>+$600</strong><br>
                  • 加：#7322 支票錯誤 ($311 誤記成 $131)：<strong>+$180</strong> ($311 - $131)<br>
                  • 減：銀行 11 月帳戶服務費：<strong>-$18</strong><br>
                  • 減：顧客跳票退票 (NSF Check)：<strong>-$220</strong>
                </td>
              </tr>
              <tr style="background:#e0f2fe; font-weight:800; font-size:1.05rem;">
                <td style="color:#0369a1;">調節後正確現金餘額：$21,044</td>
                <td style="color:#16a34a;">調節後正確現金餘額：$21,044</td>
              </tr>
            </tbody>
          </table>

          <div style="background:#f8fafc; padding:1.2rem; border-radius:8px; border:1px solid #cbd5e1; margin-top:1rem;">
            <strong style="color:var(--accent-dark); font-size:1rem;">📝 掌櫃心法：只有「公司帳面端（Books）」的調整項目需要作會計更正分錄！</strong>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:0.8rem; font-family:monospace; font-size:0.88rem;">
              <div style="background:#ffffff; padding:0.8rem; border-radius:6px; border:1px solid #cbd5e1;">
                <strong>1. 認列銀行代收利息：</strong><br>
                借：現金 600<br>
                &emsp;貸：利息收入 600
              </div>
              <div style="background:#ffffff; padding:0.8rem; border-radius:6px; border:1px solid #cbd5e1;">
                <strong>2. 更正 #7322 多計之應付帳款：</strong><br>
                借：現金 180<br>
                &emsp;貸：應付帳款 180
              </div>
              <div style="background:#ffffff; padding:0.8rem; border-radius:6px; border:1px solid #cbd5e1;">
                <strong>3. 認列銀行手續費支出：</strong><br>
                借：辦公費用 (手續費) 18<br>
                &emsp;貸：現金 18
              </div>
              <div style="background:#ffffff; padding:0.8rem; border-radius:6px; border:1px solid #cbd5e1;">
                <strong>4. 轉回跳票顧客之應收帳款：</strong><br>
                借：應收帳款 220<br>
                &emsp;貸：現金 220
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- LO 7：IFRS vs U.S. GAAP 國際大對決 -->
      <section id="lo-7">
        <h2>LO 7：IFRS vs U.S. GAAP 國際會計準則深度對照</h2>
        <p>
          在國際金融市場中，雖然兩大準則在現金與應收帳款的基礎定義上高度趨同，但在以下<strong>五大核心細節</strong>上有著截然不同的靈魂：
        </p>

        <table class="compare-table">
          <thead>
            <tr>
              <th>比較構面</th>
              <th>IFRS (國際財務報導準則)</th>
              <th>U.S. GAAP (美國會計準則)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>流動資產排列順序</strong></td>
              <td>常依「流動性遞增」排列，<strong>現金可能放在流動資產最後一項</strong>！</td>
              <td>嚴格依「流動性遞減」排列，<strong>現金永遠列在第一項</strong>。</td>
            </tr>
            <tr>
              <td><strong>銀行透支 (Bank Overdrafts)</strong></td>
              <td>若屬於日常現金整合管理的一部分，<strong>可作為現金與約當現金之減項</strong>。</td>
              <td><strong>一律列報為流動負債</strong>，嚴格禁止直接扣抵現金。</td>
            </tr>
            <tr>
              <td><strong>壞帳損失提列模型</strong></td>
              <td><strong>三階段減損模型 (Three-Stage Model)：</strong>信用未惡化計提 12 個月預期損失；信用惡化計提全存續期預期損失。</td>
              <td><strong>CECL 模型：</strong>自始至終皆按「全存續期間預期信用損失（Lifetime Expected Losses）」提列。</td>
            </tr>
            <tr>
              <td><strong>應收款項移轉標準</strong></td>
              <td><strong>雙重測試：</strong>結合「風險與報酬分析」與「控制權測試」，<strong>允許部分現金流移轉（如本金與利息分拆除列）</strong>。</td>
              <td><strong>控制權喪失為主：</strong>通常不允許部分除列，標準更為嚴苛。</td>
            </tr>
            <tr>
              <td><strong>公允價值選擇權 (Fair Value Option)</strong></td>
              <td>採用公允價值選擇權受到嚴格的特定資格條件限制。</td>
              <td>條件相對寬鬆，涵蓋更多元之金融資產工具。</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 課後精選自我檢測 -->
      <section id="review-quiz">
        <h2>課後精選自我檢測與魔導試煉 (Review Quizzes)</h2>
        
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">試煉題 1</span>
            <span>沖銷壞帳分錄對應收帳款的「現金可實現價值」有何影響？</span>
          </div>
          <p>當公司正式確定某筆 $1,000 帳款無法收回並作沖銷分錄時，資產負債表上的流動資產總額與營運資金會產生什麼變化？</p>
          <button class="solution-toggle" onclick="toggleSolution('sol-q1')">💡 展開掌櫃解析</button>
          <div id="sol-q1" class="solution-body">
            <p><strong>【核心解答】</strong></p>
            <p><strong>完全沒有任何影響！流動資產總額與營運資金保持完全不變！</strong></p>
            <p>
              沖銷分錄為：<br>
              借：備抵損失 1,000 ｜ 貸：應收帳款 1,000<br>
              應收帳款總額減少 1,000，但作為減項的「備抵損失」也等額減少 1,000，兩相抵銷後，應收帳款的<strong>現金可實現價值（Net Realizable Value）</strong>維持一模一樣！壞帳費用早在期末預估提列時就已經認列過了。
            </p>
          </div>
        </div>

        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">試煉題 2</span>
            <span>在編製銀行存款調節表時，哪些項目需要補作公司的正式會計分錄？</span>
          </div>
          <p>為什麼「未兌現支票（Outstanding Checks）」不需要作會計分錄？</p>
          <button class="solution-toggle" onclick="toggleSolution('sol-q2')">💡 展開掌櫃解析</button>
          <div id="sol-q2" class="solution-body">
            <p><strong>【核心解答】</strong></p>
            <p><strong>只有「公司帳面端（Balance per Books）」的調節項目需要補作會計分錄！</strong></p>
            <p>
              例如銀行代收款項、利息收入、銀行手續費、跳票退票（NSF）與公司自身的記帳筆誤。
            </p>
            <p>
              而「未兌現支票」屬於<strong>「銀行端（Bank）」的調節項目</strong>。公司在開立支票時就已經貸記「現金」完成了記帳，只是持票人尚未走到銀行櫃檯兌現而已，公司帳面完全正確無誤，因此<strong>絕對不需要重覆作分錄</strong>！
            </p>
          </div>
        </div>
      </section>

      <!-- 總結與記憶膠囊 -->
      <section id="summary">
        <div class="story-card" style="border-left-color: var(--gold); background: linear-gradient(145deg, #ffffff 0%, var(--gold-light) 100%);">
          <div class="story-header" style="color: #92400e;">
            <span>💎</span> 冒險者公會大掌櫃的「Chapter 5 核心記憶膠囊」
          </div>
          <ol>
            <li><strong>現金邊界法度：</strong>3 個月內高度流動為約當現金；受限制現金必須專款分離；透支在 IFRS 下可互抵減除，在 GAAP 下一律為流動負債。</li>
            <li><strong>變動對價三部曲：</strong>商業折扣不入帳；現金折扣淨額法優於總額法；退貨權必須預估退款負債。</li>
            <li><strong>壞帳提列神髓：</strong>IFRS 強制採用備抵法。帳齡分析表越老違約率越高；沖銷壞帳不影響應收帳款淨額！</li>
            <li><strong>票據折價之術：</strong>零利率或低利票據一律以市場利率折現，折價於存續期間按有效利息法逐期轉入利息收入。</li>
            <li><strong>應收款移轉除列決策：</strong>先檢驗重大風險報酬是否移轉；移轉者除列認列出售損益，未移轉者視為擔保借款！</li>
            <li><strong>銀行調節配平之道：</strong>在途存款與未兌現支票調銀行端；銀行代收與手續費調公司端；只有公司端項目需要補作入帳分錄！</li>
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
        <li><a href="#lo-1">LO 1：現金與特殊項目邊界</a></li>
        <li><a href="#lo-2">LO 2：應收帳款與變動對價</a></li>
        <li><a href="#lo-3">LO 3：應收帳款評價與壞帳</a></li>
        <li><a href="#widget-aging">└ 🧮 帳齡分析表實驗室</a></li>
        <li><a href="#lo-4">LO 4：應收票據折價與有效利率</a></li>
        <li><a href="#lo-5">LO 5：應收款移轉與除列決策樹</a></li>
        <li><a href="#lo-6">LO 6：零用金與銀行調節表</a></li>
        <li><a href="#widget-bank-recon">└ ⚖️ 銀行調節表動態配平</a></li>
        <li><a href="#lo-7">LO 7：IFRS vs GAAP 深度對照</a></li>
        <li><a href="#review-quiz">自我檢測與試煉題</a></li>
        <li><a href="#summary">本章記憶膠囊</a></li>
      </ul>
    </aside>

  </div>

  <!-- 頁尾 -->
  <footer>
    <div style="max-width: 800px; margin: 0 auto;">
      <p>🌲 <strong>WikiTree Living Knowledge Ecosystem</strong> · 中級會計學 IFRS 智慧分枝</p>
      <p>教學對象：15 歲有志成為商業冒險傳奇的少年掌櫃 ｜ 標準 MathJax 3 雙保險渲染架構</p>
      <p style="font-size: 0.8rem; color: #94a3b8;">
        © 2026 Intermediate Accounting (IFRS 5e) Handout Collection. All rights reserved.
      </p>
    </div>
  </footer>

  <!-- 交互腳本邏輯 -->
  <script>
    function toggleSolution(id) {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.style.display === "block") {
        el.style.display = "none";
      } else {
        el.style.display = "block";
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([el]);
        }
      }
    }

    // 互動 1：帳齡分析表計算
    function calcAgingAdjustment() {
      const targetAllowance = 26610; // 固定目標
      const preBalance = parseFloat(document.getElementById('aging-pre-allow').value) || 0;
      const badDebtExpense = targetAllowance - preBalance;

      const box = document.getElementById('aging-result');
      box.style.display = 'block';
      box.innerHTML = `
        <h4 style="margin:0 0 0.8rem; color:var(--accent-dark);">📊 壞帳調整分錄計算報告：</h4>
        <p>• 依據期末帳齡矩陣分析，期末「應有備抵損失貸方餘額」為：<strong>€${targetAllowance.toLocaleString()}</strong></p>
        <p>• 調整前帳上已存在備抵損失貸方餘額：<strong>€${preBalance.toLocaleString()}</strong></p>
        <div style="background:#ffffff; padding:0.8rem; border-radius:6px; border:1px solid #cbd5e1; margin-top:0.8rem;">
          <strong style="color:var(--accent-dark);">📝 12/31 應作之期末調整分錄：</strong><br>
          <span style="font-family:monospace; font-size:1.05rem; color:#0f766e; font-weight:700;">
            借：壞帳費用 (Bad Debt Expense) €${badDebtExpense.toLocaleString()}<br>
            &emsp;貸：備抵損失 (Allowance for Doubtful Accounts) €${badDebtExpense.toLocaleString()}
          </span>
        </div>
        <p style="margin:0.8rem 0 0; font-size:0.92rem; color:var(--muted);">
          💡 透過這筆分錄，備抵損失餘額由原先的 €${preBalance.toLocaleString()} 精準補足到 €${targetAllowance.toLocaleString()}！
        </p>
      `;
    }

    window.addEventListener('DOMContentLoaded', () => {
      calcAgingAdjustment();
    });
  </script>
</body>
</html>
'''

# 目標儲存路徑
target_paths = [
    r"收件苗圃\學習講義合輯\Ch05_IFRS_學習講義.html",
    r"C:\Users\閻星澄\Documents\WikiTree\收件苗圃\學習講義合集\Ch05_IFRS_學習講義.html",
    r"C:\Users\閻星澄\Desktop\學習講義合集\Ch05_IFRS_學習講義.html"
]

def main():
    print("=" * 60)
    print("開始編譯與發布 Chapter 5 IFRS 現金與應收款項 學習講義...")
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
    print("Chapter 5 IFRS 講義生成與多點發布完成！")
    print("=" * 60)

if __name__ == "__main__":
    main()
