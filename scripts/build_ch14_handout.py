# -*- coding: utf-8 -*-
"""
Generate Chapter 14 Non-Current Liabilities (非流動負債) Learning Handout HTML.
Kieso Intermediate Accounting IFRS Edition Chapter 14.
Full Traditional Chinese Handout with English Terminology, MathJax 3 + Offline fallback,
Interactive Labs, and Multi-directory deployment.
"""

import os
import shutil

HANDOUT_HTML = r'''<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="中級會計學 IFRS 第四版 第十四章：非流動負債（Non-Current Liabilities）繁體中文精緻學習講義。包含應付公司債折溢價發行、有效利息法攤銷、非公允利率長期應付票據、債務實質除列（提前贖回/資產抵債/權益抵債/債務條款修改）、公允價值選擇權、表外融資與財務比率分析。">
  <title>Chapter 14 非流動負債｜IFRS 中級會計學精緻學習講義 [資本魔導契約篇]</title>

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
    // 離線優雅降級 Fallback 腳本 (若 2 秒內 CDN 未載入)
    setTimeout(() => {
      if (!window.MathJax || !window.MathJax.typeset) {
        console.warn("MathJax CDN 加載逾時，啟動離線公式美化降級協議...");
        document.querySelectorAll('.math-tex, .formula-box, p, li, td, span').forEach(el => {
          let html = el.innerHTML;
          html = html.replace(/\$([^\$]+)\$/g, '<span class="offline-math"><em>$1</em></span>');
          html = html.replace(/\\times/g, ' × ')
                     .replace(/\\approx/g, ' ≈ ')
                     .replace(/\\le/g, ' ≤ ')
                     .replace(/\\ge/g, ' ≥ ')
                     .replace(/\\ne/g, ' ≠ ')
                     .replace(/\\sqrt\{([^\}]+)\}/g, '√($1)')
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
      --primary: #4338ca;
      --primary-light: #e0e7ff;
      --primary-dark: #312e81;
      --accent: #0284c7;
      --accent-light: #e0f2fe;
      --accent-dark: #0369a1;
      --gold: #b45309;
      --gold-light: #fef3c7;
      --success: #059669;
      --success-light: #d1fae5;
      --danger: #dc2626;
      --danger-light: #fee2e2;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #1e293b;
      --muted: #64748b;
      --line: #e2e8f0;
      --radius: 12px;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang TC", "Microsoft JhengHei", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.75;
      padding: 0;
      margin: 0;
    }

    /* 頂部 Hero 橫幅 */
    .hero {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%);
      color: #ffffff;
      padding: 3.5rem 2rem 3rem;
      position: relative;
      overflow: hidden;
      border-bottom: 4px solid var(--accent);
    }
    .hero::after {
      content: "BONDS & DEBT";
      position: absolute;
      right: -20px;
      bottom: -25px;
      font-size: 5rem;
      font-weight: 900;
      color: rgba(255, 255, 255, 0.04);
      pointer-events: none;
    }
    .hero .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: #93c5fd;
      margin-bottom: 1rem;
    }
    .hero h1 {
      font-size: 2.3rem;
      font-weight: 800;
      margin-bottom: 0.75rem;
      line-height: 1.25;
    }
    .hero .subtitle {
      font-size: 1.05rem;
      color: #c7d2fe;
      max-width: 820px;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .hero-meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.85rem;
      color: #a5b4fc;
      flex-wrap: wrap;
    }
    .hero-meta span { display: flex; align-items: center; gap: 0.4rem; }

    /* 主版面雙欄佈局 */
    .container {
      max-width: 1380px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      display: grid;
      grid-template-columns: 1fr 310px;
      gap: 2rem;
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
      color: var(--primary-dark);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 2px solid var(--primary-light);
      padding-bottom: 0.5rem;
    }
    .toc-list { list-style: none; font-size: 0.86rem; }
    .toc-list li { margin-bottom: 0.45rem; }
    .toc-list a {
      color: var(--muted);
      text-decoration: none;
      display: block;
      padding: 0.35rem 0.6rem;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .toc-list a:hover, .toc-list a.active {
      color: var(--primary);
      background: var(--primary-light);
      font-weight: 600;
    }

    /* 內容主軸 */
    main { min-width: 0; }

    /* 大標題與副標題 */
    h2 {
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--primary-dark);
      margin: 2.8rem 0 1.25rem;
      padding-left: 0.9rem;
      border-left: 5px solid var(--primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    h3 {
      font-size: 1.28rem;
      font-weight: 700;
      color: #1e293b;
      margin: 1.8rem 0 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    h4 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #334155;
      margin: 1.2rem 0 0.5rem;
    }
    p { margin-bottom: 1.1rem; color: #334155; }

    /* 故事引言卡片 */
    .story-card {
      background: #fdf4ff;
      border: 1px dashed #c084fc;
      border-radius: var(--radius);
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.8rem;
      box-shadow: var(--shadow);
    }
    .story-header {
      font-weight: 700;
      color: #7e22ce;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
    }

    /* 英文術語高亮膠囊 */
    .en-term {
      color: #1d4ed8;
      font-weight: 600;
      background: #eff6ff;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      border: 1px solid #dbeafe;
    }

    /* 比較與數據表格 */
    .q-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2rem 0 1.6rem;
      background: var(--card-bg);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: var(--shadow);
      font-size: 0.9rem;
    }
    .q-table th, .q-table td {
      border: 1px solid var(--line);
      padding: 0.65rem 0.9rem;
      text-align: left;
    }
    .q-table th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
    }
    .q-table tr:hover { background: #f8fafc; }

    /* 公式與觀念框 */
    .formula-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid var(--primary);
      border-radius: 8px;
      padding: 1.2rem 1.4rem;
      margin: 1.4rem 0;
      font-size: 0.96rem;
      overflow-x: auto;
    }
    .formula-title {
      font-weight: 700;
      color: var(--primary-dark);
      margin-bottom: 0.4rem;
      font-size: 0.92rem;
    }

    /* 會計分錄展示盒 */
    .journal-box {
      background: #0f172a;
      color: #f8fafc;
      border-radius: 8px;
      padding: 1.2rem 1.4rem;
      margin: 1.2rem 0 1.5rem;
      font-family: "Cascadia Code", "Fira Code", Consolas, monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      box-shadow: var(--shadow);
    }
    .journal-title {
      color: #38bdf8;
      font-weight: 700;
      margin-bottom: 0.6rem;
      border-bottom: 1px solid #334155;
      padding-bottom: 0.4rem;
    }
    .dr { color: #f43f5e; font-weight: 600; }
    .cr { color: #34d399; font-weight: 600; padding-left: 1.8rem; }
    .amt { color: #fbbf24; font-weight: 600; }

    /* 警告與防雷盒 */
    .alert-box {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 1rem 1.25rem;
      border-radius: 0 8px 8px 0;
      margin: 1.3rem 0;
      font-size: 0.92rem;
      color: #92400e;
    }

    /* 互動實驗室外框 */
    .interactive-widget {
      background: var(--card-bg);
      border: 2px solid var(--accent);
      border-radius: var(--radius);
      padding: 1.75rem;
      margin: 2.2rem 0;
      box-shadow: var(--shadow-lg);
    }
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px dashed #bae6fd;
      padding-bottom: 0.8rem;
      margin-bottom: 1.2rem;
    }
    .widget-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--accent-dark);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .widget-badge {
      background: var(--accent);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
    }
    .widget-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .input-group { display: flex; flex-direction: column; gap: 0.3rem; }
    .input-group label { font-size: 0.82rem; font-weight: 700; color: #475569; }
    .input-group input, .input-group select {
      padding: 0.55rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
    }
    .input-group input:focus, .input-group select:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
    }
    .btn-calc {
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.65rem 1.4rem;
      border-radius: 7px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-calc:hover {
      background: var(--accent-dark);
      transform: translateY(-2px);
    }
    .widget-result {
      background: #f0fdf4;
      border-left: 4px solid var(--success);
      padding: 1rem 1.25rem;
      border-radius: 8px;
      margin-top: 1rem;
      font-size: 0.92rem;
    }

    /* 題目盒與解答折疊 */
    .problem-box {
      background: var(--card-bg);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 1.4rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow);
    }
    .problem-head {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.6rem;
    }
    .problem-tag {
      background: var(--primary-light);
      color: var(--primary-dark);
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.15rem 0.55rem;
      border-radius: 4px;
    }
    .solution-toggle {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.7rem;
      transition: all 0.2s;
    }
    .solution-toggle:hover { background: #e2e8f0; }
    .solution-body {
      display: none;
      margin-top: 1rem;
      padding: 1.1rem;
      background: #f8fafc;
      border-left: 4px solid var(--accent);
      border-radius: 6px;
      font-size: 0.91rem;
      line-height: 1.65;
    }

    /* 頁腳 */
    footer {
      background: #0f172a;
      color: #94a3b8;
      text-align: center;
      padding: 3rem 1rem;
      font-size: 0.88rem;
      border-top: 4px solid var(--primary);
      margin-top: 4rem;
    }

    @media (max-width: 992px) {
      .container { grid-template-columns: 1fr; }
      .toc-sidebar { display: none; }
    }
  </style>
</head>
<body>

  <!-- 頂部 Hero 橫幅 -->
  <header class="hero">
    <div class="eyebrow">👑 Intermediate Accounting · IFRS Edition (4th/5th Ed.) · Chapter 14</div>
    <h1>Chapter 14：非流動負債</h1>
    <div class="subtitle">
      Non-Current Liabilities：跨越時空的資本契約！全面解構應付公司債折溢價發行、有效利息法精算、非公允長期應付票據、債務終止（提前贖回 / 資產抵債 / 權益抵債 / 條款修改）與表外融資之秘。
    </div>
    <div class="hero-meta">
      <span>📚 教材對應：Kieso, Weygandt, Warfield <i>Intermediate Accounting (IFRS)</i> Ch 14</span>
      <span>🌲 知識架構：負債之衡量、攤銷與實質除列</span>
      <span>🎮 學習導師：冒險者公會首席大掌櫃</span>
      <span>⚡ 準則精粹：IFRS 9 淨額法無折溢價獨立科目</span>
    </div>
  </header>

  <div class="container">

    <!-- 主講義內容 -->
    <main>

      <!-- 開篇引言 -->
      <section id="prologue">
        <div class="story-card">
          <div class="story-header">
            <span>🧙‍♂️</span> 冒險者公會首席大掌櫃的「長期資本契約召集令」
          </div>
          <p>
            「金幣放在當下，只是一袋沉甸甸的金屬；但若向未來的冒險者借調一百萬枚金幣，並承諾在未來二十年每半年分派魔法利息，這便締結了長期的【資本魔導契約（Bond Indenture）】！在商業世界中，當單一錢莊無法承受龐大的擴張資金時，發行公司債（Bonds Payable）或長期票據（Long-Term Notes Payable）就是唯一的登天之路。然而，市場瞬息萬變，市場利率永遠不會乖乖等於票面利率。折價、溢價、兩期之間發行、提前贖回，乃至於瀕臨破產時的債務重組（Debt Extinguishment）—— 這一章，我們將徹底掌握跨期資本負債的每一枚銅板！」
          </p>
        </div>
      </section>

      <!-- LO 1：應付公司債本質與發行會計 -->
      <section id="lo-1">
        <h2>LO 1：應付公司債本質與發行會計 (Bonds Payable & Issuance)</h2>
        
        <p>
          <span class="en-term">Non-Current Liabilities (長期負債)</span> 指履行義務不需在一年或一個正常營業週期（以較長者為準）內以流動資產償付或產生其他流動負債之現時義務。最常見的型態包含應付公司債、長期應付票據、抵押借款、租賃負債與退休金負債。
        </p>

        <h3>1. 公司債之核心術語與契約本質 (Bond Indenture)</h3>
        <p>公司債代表發行公司對投資人的一項承諾契約，載明於<span class="en-term">Bond Indenture (債券契約)</span>中，承諾於指定到期日償還<strong>面額 (Face Value / Par Value)</strong>，並於存續期間按<strong>票面利率 (Stated / Coupon / Nominal Rate)</strong> 定期支付利息。</p>

        <table class="q-table">
          <thead>
            <tr><th>常見公司債類型 (Types of Bonds)</th><th>英文名詞</th><th>魔導特性與金融機制</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>擔保債券 vs 無擔保信用債券</strong></td><td>Secured vs Unsecured (Debenture)</td><td>擔保債有土地、廠房等特定資產抵押；Debenture 僅憑發行公司的整體信用作為擔保。</td></tr>
            <tr><td><strong>到期一次償還 vs 分期分批償還</strong></td><td>Term Bonds vs Serial Bonds</td><td>Term 一次到期；Serial 分成不同梯次於不同年份陸續到期。</td></tr>
            <tr><td><strong>可贖回公司債</strong></td><td>Callable Bonds</td><td>發行公司擁有「提前按約定價格買回」的特權（防禦未來利率大跌）。</td></tr>
            <tr><td><strong>可轉換公司債</strong></td><td>Convertible Bonds</td><td>持有者擁有依特定比例轉換為發行公司普通股的權利。</td></tr>
            <tr><td><strong>商品連結 / 深幅折價債券</strong></td><td>Commodity-Backed / Deep-Discount</td><td>商品連結本利與石油/黃金連動；Deep-Discount（如零息債券）不付現息，以極低折價發行。</td></tr>
            <tr><td><strong>記名債券 vs 無記名息票債券</strong></td><td>Registered vs Bearer (Coupon) Bonds</td><td>記名債由發行公司登記持有者姓名；Bearer 憑票息認券不認人。</td></tr>
          </tbody>
        </table>

        <h3>2. 兩大利率：決定公司債售價的靈魂天平</h3>
        <div class="formula-box">
          <div class="formula-title">⚖️ 核心雙軌利息計算公式</div>
          <p>
            • <strong>每期實付現金利息 (Cash Interest Paid)：</strong>
            $$\text{Cash Paid} = \text{Bond Face Value} \times \text{Stated Coupon Rate} \times \text{Time Period}$$
          </p>
          <p>
            • <strong>每期帳面利息費用 (Interest Expense Recognized)：</strong>
            $$\text{Interest Expense} = \text{Carrying Value at Beginning} \times \text{Market / Effective Rate} \times \text{Time Period}$$
          </p>
        </div>

        <table class="q-table">
          <thead>
            <tr><th>市場有效利率 (Market Rate) vs 票面利率 (Stated Rate)</th><th>發行狀態 (Issued At)</th><th>經濟實質意義</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>$\text{Market Rate} < \text{Stated Rate}$ (市場 6% vs 票面 8%)</td>
              <td><strong>溢價發行 (Premium)</strong><br>售價 &gt; 面額</td>
              <td>公司給的利息優於市場，投資人搶購，願意預先支付溢價補償發行公司。</td>
            </tr>
            <tr>
              <td>$\text{Market Rate} = \text{Stated Rate}$ (市場 8% vs 票面 8%)</td>
              <td><strong>平價發行 (Par Value)</strong><br>售價 = 面額</td>
              <td>公司給的利息剛好等於市場要求報酬率。</td>
            </tr>
            <tr>
              <td>$\text{Market Rate} > \text{Stated Rate}$ (市場 10% vs 票面 8%)</td>
              <td><strong>折價發行 (Discount)</strong><br>售價 &lt; 面額</td>
              <td>公司給的利息低於市場，投資人拒付面額，必須打折出售以補足實質報酬率。</td>
            </tr>
          </tbody>
        </table>

        <div class="alert-box">
          <strong>⚡ IFRS vs U.S. GAAP 絕大分歧點（必背！）：</strong><br>
          • <strong>U.S. GAAP：</strong> 將「應付公司債折價 (Discount)」或「溢價 (Premium)」設立為獨立的評價科目（如 Discount on Bonds Payable 作為備抵折減項目）。<br>
          • <strong>IFRS (準則 9 號)：</strong> <strong>嚴禁使用單獨的折價或溢價帳戶！</strong> 公司債在發行時直接按<strong>「淨額 (Net Amount)」</strong>入帳。折溢價直接包含在 Bonds Payable 的帳面金額中！
        </div>

        <h3>3. 平價、折價與溢價發行經典範例 (Santos SA & Evermaster)</h3>

        <div class="journal-box">
          <div class="journal-title">📜 範例 1：平價發行 (Par) &mdash; Santos SA (面額 100,000, 5 年期, 票面 9%, 市場 9%, 年付息)</div>
          現值計算：$PV = 100,000 \times 0.64993 + 9,000 \times 3.88965 = \mathbf{100,000}$<br><br>
          <strong>2022/1/1 發行：</strong><br>
          <span class="dr">Dr. Cash</span> <span class="amt">100,000</span><br>
          <span class="cr">Cr. Bonds Payable</span> <span class="amt">100,000</span><br><br>
          <strong>2022/12/31 應計利息：</strong><br>
          <span class="dr">Dr. Interest Expense</span> ($100,000 \times 9\%$) <span class="amt">9,000</span><br>
          <span class="cr">Cr. Interest Payable</span> <span class="amt">9,000</span><br><br>
          <strong>2023/1/1 付現利息：</strong><br>
          <span class="dr">Dr. Interest Payable</span> <span class="amt">9,000</span><br>
          <span class="cr">Cr. Cash</span> <span class="amt">9,000</span>
        </div>

        <div class="journal-box">
          <div class="journal-title">📜 範例 2：折價發行 (Discount) &mdash; Santos SA (面額 100,000, 5 年期, 票面 9%, 市場 11%, 年付息)</div>
          現值計算：$PV = 100,000 \times (1.11)^{-5} + 9,000 \times \left[\frac{1-(1.11)^{-5}}{0.11}\right] = 59,345 + 33,263 = \mathbf{92,608}$<br><br>
          <strong>2022/1/1 發行 (IFRS 直接以淨額入帳)：</strong><br>
          <span class="dr">Dr. Cash</span> <span class="amt">92,608</span><br>
          <span class="cr">Cr. Bonds Payable</span> <span class="amt">92,608</span><br><br>
          <strong>2022/12/31 應計利息與折價攤銷：</strong><br>
          實付利息 $= 100,000 \times 9\% = 9,000$ ｜ 利息費用 $= 92,608 \times 11\% = 10,187$<br>
          折價攤銷額 $= 10,187 - 9,000 = 1,187$（增加負債帳面金額）<br>
          <span class="dr">Dr. Interest Expense</span> <span class="amt">10,187</span><br>
          <span class="cr">Cr. Interest Payable</span> <span class="amt">9,000</span><br>
          <span class="cr">Cr. Bonds Payable</span> (折價攤銷) <span class="amt">1,187</span>
        </div>

        <h3>4. 有效利息法 (Effective-Interest Method) 攤銷表精髓</h3>
        <p>IFRS 強制規定：公司債折溢價攤銷<strong>必須採用有效利息法</strong>（直線法除非金額極小不具重大性，否則不准使用）。有效利息法保證每一期的利息費用率恆等於期初帳面價值乘上發行時的有效利率！</p>

        <!-- 互動實驗室 1：公司債定價與攤銷生成器 -->
        <div class="interactive-widget" id="widget-bond-amort">
          <div class="widget-header">
            <div class="widget-title">
              <span>🏛️ 互動實驗室 1</span> Evermaster 公司債有效利息法動態攤銷天平
            </div>
            <span class="widget-badge">BOND AMORTIZATION ENGINE</span>
          </div>
          <p style="font-size:0.88rem; color:#64748b; margin-bottom:1rem;">
            動態調整公司債參數，即刻推演每半年付息一次的現值售價與完整 10 期攤銷明細表！
          </p>
          <div class="widget-grid">
            <div class="input-group">
              <label>公司債面額 Face Value ($)</label>
              <input type="number" id="wb-face" value="100000" step="5000">
            </div>
            <div class="input-group">
              <label>年票面利率 Coupon Rate (%)</label>
              <input type="number" id="wb-coupon" value="8" step="0.5">
            </div>
            <div class="input-group">
              <label>年市場殖利率 Market Rate (%)</label>
              <input type="number" id="wb-market" value="10" step="0.5">
            </div>
            <div class="input-group">
              <label>年限 Years (每半年付息一次)</label>
              <input type="number" id="wb-years" value="5" step="1">
            </div>
          </div>
          <button class="btn-calc" onclick="generateBondTable()">⚡ 施展有效利息法魔導計算</button>
          <div class="widget-result" id="wb-result">
            點擊上方按鈕生成動態攤銷表...
          </div>
        </div>

        <h3>5. 兩付息日間發行公司債 (Bonds Issued Between Interest Dates)</h3>
        <p>若公司債核准發行日為 1 月 1 日，但延遲至 5 月 1 日才正式賣出：</p>
        <div class="formula-box">
          <p>• <strong>投資人必須預先墊付過去 4 個月累積的應計利息 (Accrued Interest)：</strong></p>
          $$\text{Accrued Interest} = \text{Face Value} \times \text{Stated Rate} \times \frac{4}{12} = 100,000 \times 8\% \times \frac{4}{12} = \mathbf{2,667}$$
          <p>• <strong>下一次 7 月 1 日付息時，公司依然發放滿整整 6 個月的利息（$4,000$）。</strong><br>
          投資人實質只拿到持有 2 個月的淨利息：$4,000 - 2,667 = \mathbf{1,333}$！</p>
        </div>
      </section>

      <!-- LO 2：長期應付票據會計 -->
      <section id="lo-2">
        <h2>LO 2：長期應付票據會計 (Long-Term Notes Payable)</h2>
        <p>長期應付票據的會計原理與公司債高度一致：<strong>以未來現金流量（本金與利息）按發行時的有效利率折現衡量現值。</strong></p>

        <h3>1. 無息長期票據 (Zero-Interest-Bearing Notes)</h3>
        <p>表面無息，實則發行面額遠高於取得的現金額！差額即為實質隱含利息。</p>
        <div class="journal-box">
          <div class="journal-title">📜 範例：Turtle Cove (3 年期無息票據 $10,000，隱含利率 9%，現值 $7,721.80)</div>
          現值折現：$PV = 10,000 \times (1.09)^{-3} = \mathbf{7,721.80}$<br><br>
          <strong>發行日分錄 (IFRS 直接入淨額)：</strong><br>
          <span class="dr">Dr. Cash</span> <span class="amt">7,721.80</span><br>
          <span class="cr">Cr. Notes Payable</span> <span class="amt">7,721.80</span><br><br>
          <strong>第 1 年末認列利息費用 ($7,721.80 \times 9\% = 694.96$)：</strong><br>
          <span class="dr">Dr. Interest Expense</span> <span class="amt">694.96</span><br>
          <span class="cr">Cr. Notes Payable</span> (負債帳面增加) <span class="amt">694.96</span>
        </div>

        <h3>2. 非公允低利票據換取商品、勞務或固定資產 (Imputed Interest Rate)</h3>
        <p>當企業簽發低利票據換取建築服務或機器，且勞務與票據皆無活絡市場時，必須<strong>設算利率 (Imputation)</strong>。</p>
        <div class="journal-box">
          <div class="journal-title">📜 範例：Wunderlich plc (面額 £550,000, 5 年期, 票面 2%, 設算市場利率 8% 換取建築設計)</div>
          每年付息：$550,000 \times 2\% = 11,000$ ｜ 設算現值：$PV = 550,000 \times (1.08)^{-5} + 11,000 \times PVF\text{-}OA_{5, 8\%} = 374,319 + 43,920 = \mathbf{418,239}$<br><br>
          <strong>取得建築服務入帳：</strong><br>
          <span class="dr">Dr. Building (or Construction in Process)</span> <span class="amt">418,239</span><br>
          <span class="cr">Cr. Notes Payable</span> <span class="amt">418,239</span><br><br>
          <strong>第 1 年末付息 (£11,000) 與攤銷 (£418,239 &times; 8% = £33,459 利息費用)：</strong><br>
          <span class="dr">Dr. Interest Expense</span> <span class="amt">33,459</span><br>
          <span class="cr">Cr. Notes Payable</span> (折價攤銷) <span class="amt">22,459</span><br>
          <span class="cr">Cr. Cash</span> <span class="amt">11,000</span>
        </div>
      </section>

      <!-- LO 3：非流動負債之實質除列 -->
      <section id="lo-3">
        <h2>LO 3：非流動負債之實質除列 (Extinguishment of Debt)</h2>
        <p>非流動負債在到期前清償或解除法律義務，稱為<strong>除列 (Derecognition / Extinguishment)</strong>。常見四大情境：</p>

        <h3>1. 提前以現金贖回 (Extinguishment with Cash Before Maturity)</h3>
        <div class="formula-box">
          $$\text{淨帳面價值 (Net Carrying Value)} > \text{再購回代價 (Reacquisition Price)} \implies \mathbf{贖回利益 (Gain)}$$
          $$\text{再購回代價 (Reacquisition Price)} > \text{淨帳面價值 (Net Carrying Value)} \implies \mathbf{贖回損失 (Loss)}$$
        </div>
        <div class="journal-box">
          <div class="journal-title">📜 範例：Evermaster 於第 2 年末以 101 贖回帳面價值 €94,925 之公司債</div>
          贖回付款 $= 100,000 \times 101\% = \mathbf{101,000}$<br>
          除列損失 $= 101,000 - 94,925 = \mathbf{6,075}$<br><br>
          <span class="dr">Dr. Bonds Payable</span> <span class="amt">94,925</span><br>
          <span class="dr">Dr. Loss on Extinguishment of Debt</span> <span class="amt">6,075</span><br>
          <span class="cr">Cr. Cash</span> <span class="amt">101,000</span>
        </div>

        <h3>2. 移轉非現金資產抵債 (Transfer of Assets)</h3>
        <p>債務人以不動產清償借款時，分為兩段損益：<strong>「資產處分損益 (帳面 vs 公允)」</strong> 與 <strong>「債務除列利益 (債務帳面 vs 資產公允)」</strong>！</p>
        <div class="journal-box">
          <div class="journal-title">📜 範例：Bonn Mortgage 以帳面 €21M、公允 €16M 不動產清償 €20M 貸款</div>
          資產處分損失 $= 21,000,000 - 16,000,000 = \mathbf{5,000,000}$<br>
          債務重整利益 $= 20,000,000 - 16,000,000 = \mathbf{4,000,000}$<br><br>
          <span class="dr">Dr. Note Payable (Hamburg Bank)</span> <span class="amt">20,000,000</span><br>
          <span class="dr">Dr. Loss on Disposal of Real Estate</span> <span class="amt">5,000,000</span><br>
          <span class="cr">Cr. Real Estate</span> <span class="amt">21,000,000</span><br>
          <span class="cr">Cr. Gain on Extinguishment of Debt</span> <span class="amt">4,000,000</span>
        </div>

        <h3>3. 增發普通股抵充債務 (Granting of Equity Interest)</h3>
        <div class="journal-box">
          <div class="journal-title">📜 範例：Bonn 發行 320,000 股（面額 €10，公允價值 €16M）抵清 €20M 債務</div>
          股本 $= 320,000 \times 10 = 3,200,000$ ｜ 資本公積 $= 16,000,000 - 3,200,000 = 12,800,000$<br>
          債務除列利益 $= 20,000,000 - 16,000,000 = \mathbf{4,000,000}$<br><br>
          <span class="dr">Dr. Note Payable</span> <span class="amt">20,000,000</span><br>
          <span class="cr">Cr. Share Capital &mdash; Ordinary</span> <span class="amt">3,200,000</span><br>
          <span class="cr">Cr. Share Premium &mdash; Ordinary</span> <span class="amt">12,800,000</span><br>
          <span class="cr">Cr. Gain on Extinguishment of Debt</span> <span class="amt">4,000,000</span>
        </div>

        <h3>4. 修改債務條款 (Modification of Terms)</h3>
        <p>
          當債務人陷入財務困難時，銀行可能調降本金、延長年限或降低利率。<strong>IFRS 9 規範：實質修改條款一律視為「舊債除列並發行新債（Extinguishment of Old & Issuance of New）」</strong>，新負債以<strong>重組當下的市場折現率（15%）</strong>折現認列公允價值！
        </p>
        <div class="journal-box">
          <div class="journal-title">📜 範例：Resorts Development (舊債 ¥10.5M，重組為面額 ¥9M，4 年期，利息 8%，市場折現率 15%)</div>
          新票據公允價值 $= 9,000,000 \times (1.15)^{-4} + 720,000 \times PVF\text{-}OA_{4, 15\%} = 5,145,750 + 2,055,586 = \mathbf{7,201,336}$<br>
          債務重組利益 $= 10,500,000 - 7,201,336 = \mathbf{3,298,664}$<br><br>
          <span class="dr">Dr. Note Payable (Old)</span> <span class="amt">10,500,000</span><br>
          <span class="cr">Cr. Note Payable (New)</span> <span class="amt">7,201,336</span><br>
          <span class="cr">Cr. Gain on Extinguishment of Debt</span> <span class="amt">3,298,664</span>
        </div>

        <!-- 互動實驗室 2：債務重組與提前清償損益計算機 -->
        <div class="interactive-widget" id="widget-extinguish">
          <div class="widget-header">
            <div class="widget-title">
              <span>⚖️ 互動實驗室 2</span> 債務提前贖回與重組清償損益試算機
            </div>
            <span class="widget-badge">EXTINGUISHMENT CALCULATOR</span>
          </div>
          <div class="widget-grid">
            <div class="input-group">
              <label>舊負債當前帳面價值 ($)</label>
              <input type="number" id="we-old-cv" value="10500000" step="50000">
            </div>
            <div class="input-group">
              <label>清償方式</label>
              <select id="we-type" onchange="toggleExtinguishInputs()">
                <option value="cash">提前現金贖回 (Call with Cash)</option>
                <option value="asset">移轉資產抵債 (Transfer Asset)</option>
                <option value="modify" selected>修改條款發行新債 (Modification)</option>
              </select>
            </div>
            <div class="input-group" id="we-param1-box">
              <label id="we-param1-lbl">新債公允價值 / 贖回現金 ($)</label>
              <input type="number" id="we-param1" value="7201336" step="10000">
            </div>
            <div class="input-group" id="we-param2-box" style="display:none;">
              <label id="we-param2-lbl">抵債資產帳面價值 ($)</label>
              <input type="number" id="we-param2" value="21000000" step="10000">
            </div>
          </div>
          <button class="btn-calc" onclick="calcExtinguishment()">🎯 計算除列損益與分錄解析</button>
          <div class="widget-result" id="we-result">
            請點擊計算...
          </div>
        </div>
      </section>

      <!-- LO 4：表達與財務比率分析 -->
      <section id="lo-4">
        <h2>LO 4：表達、表外融資與財務比率分析 (Presentation & Analysis)</h2>
        
        <h3>1. 公允價值選擇權 (Fair Value Option)</h3>
        <p>IFRS 允許企業在初次認列時不可撤銷地指定將金融負債按公允價值衡量，後續公允價值變動計入損益（若由企業自身信用風險引起之變動則計入 OCI）。</p>
        <div class="journal-box">
          <div class="journal-title">📜 範例：Edmonds 發行 €500,000 公司債，因市場利率上升，年底公允價值跌至 €480,000</div>
          負債價值下降產生未實現利益：€500,000 &minus; €480,000 = <strong>€20,000</strong><br><br>
          <span class="dr">Dr. Bonds Payable</span> <span class="amt">20,000</span><br>
          <span class="cr">Cr. Unrealized Holding Gain or Loss &mdash; Income</span> <span class="amt">20,000</span>
        </div>

        <h3>2. 表外融資 (Off-Balance-Sheet Financing)</h3>
        <p>企業企圖以不將債務記錄於資產負債表上的方式籌措資金，常見手段包含<strong>非合併子公司 (Non-Consolidated Subsidiary)</strong> 與 <strong>特殊目的實體 (Special Purpose Entity, SPE)</strong>。動機在於美化負債比率、規避借貸契約限制。</p>

        <h3>3. 兩大長期償債能力指標 (Solvency Ratios)</h3>
        <div class="formula-box">
          <p>• <strong>負債比率 (Debt to Assets Ratio)：</strong>
            $$\text{Debt to Assets} = \frac{\text{Total Liabilities}}{\text{Total Assets}}$$
            <em>比例越高，企業長期償債風險越大。</em>
          </p>
          <p>• <strong>利息保障倍數 (Times Interest Earned)：</strong>
            $$\text{Times Interest Earned} = \frac{\text{Net Income} + \text{Interest Expense} + \text{Income Tax Expense}}{\text{Interest Expense}} = \frac{\text{EBIT}}{\text{Interest Expense}}$$
            <em>倍數越高，代表當期營業獲利支付利息的能力越充裕。</em>
          </p>
        </div>

        <!-- 互動實驗室 3：財務比率速算 -->
        <div class="interactive-widget" id="widget-ratios">
          <div class="widget-header">
            <div class="widget-title">
              <span>📊 互動實驗室 3</span> Novartis 償債能力與財務槓桿診斷器
            </div>
            <span class="widget-badge">SOLVENCY ANALYZER</span>
          </div>
          <div class="widget-grid">
            <div class="input-group">
              <label>總負債 Total Liabilities ($M)</label>
              <input type="number" id="wr-liab" value="66871">
            </div>
            <div class="input-group">
              <label>總資產 Total Assets ($M)</label>
              <input type="number" id="wr-assets" value="145563">
            </div>
            <div class="input-group">
              <label>稅前息前獲利 EBIT ($M) [淨利12614+利息957+稅1221]</label>
              <input type="number" id="wr-ebit" value="14792">
            </div>
            <div class="input-group">
              <label>利息費用 Interest Expense ($M)</label>
              <input type="number" id="wr-interest" value="957">
            </div>
          </div>
          <button class="btn-calc" onclick="calcSolvencyRatios()">📈 評估財務健康度</button>
          <div class="widget-result" id="wr-result">
            請點擊評估...
          </div>
        </div>
      </section>

      <!-- LO 5：IFRS vs U.S. GAAP 深度對照 -->
      <section id="lo-5">
        <h2>LO 5：IFRS vs U.S. GAAP 國際準則深度對照</h2>
        <table class="q-table">
          <thead>
            <tr><th>比較維度</th><th>IFRS (國際財務報導準則)</th><th>U.S. GAAP (美國公認會計原則)</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>折溢價會計科目</strong></td>
              <td><strong>無獨立科目！</strong> 直接以淨額 (Net Amount) 入帳於 Bonds Payable。</td>
              <td><strong>設立獨立科目！</strong> 設有 Discount 或 Premium on Bonds Payable。</td>
            </tr>
            <tr>
              <td><strong>折溢價攤銷方法</strong></td>
              <td><strong>強制要求有效利息法</strong>，直線法原則上禁止。</td>
              <td>首選有效利息法，但若直線法無重大差異時允許使用。</td>
            </tr>
            <tr>
              <td><strong>債務條款修改重整</strong></td>
              <td>實質修改一律視為<strong>舊債除列與發行新債</strong>。</td>
              <td>設有「問題債務重整 (Troubled Debt Restructuring)」專屬規範與不同認列條件。</td>
            </tr>
            <tr>
              <td><strong>債務展期 (Refinancing) 流動性劃分</strong></td>
              <td>在<strong>報導期間結束日（資產負債表日）前</strong>必須完成長期展期協議，否則列為流動負債。</td>
              <td>只要在<strong>財務報表發布日前</strong>完成展期，即可列為非流動負債。</td>
            </tr>
            <tr>
              <td><strong>發行成本 (Bond Issue Costs)</strong></td>
              <td>自負債初次認列帳面金額中直接扣除（折價增加或溢價減少）。</td>
              <td>與 IFRS 相同，直接扣減負債帳面價值（ASU 2015-03 後一致）。</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 課後自我檢測 -->
      <section id="review-quiz">
        <h2>課後精選自我檢測與魔導試煉 (Review Quizzes)</h2>
        
        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">試煉題 1</span>
            <span>折價發行的公司債，其各期利息費用與折價攤銷額隨時間呈現何種走勢？</span>
          </div>
          <p>在有效利息法下，折價發行的公司債每期支付的現金利息固定，那麼其利息費用與折價攤銷金額逐期是增加、減少還是不變？為什麼？</p>
          <button class="solution-toggle" onclick="toggleSolution('sol-q1')">💡 展開掌櫃解析</button>
          <div id="sol-q1" class="solution-body">
            <p><strong>【核心解答】</strong> 利息費用與折價攤銷額<strong>雙雙逐期增加</strong>！</p>
            <p><strong>【思路剖析】</strong><br>
              1. 帳面價值（Carrying Value）每期因折價攤銷而<strong>逐期遞增</strong>，朝向面額靠攏。<br>
              2. 利息費用 $= \text{期初帳面價值} \times \text{有效利率}$。因為帳面價值越來越大，利息費用必然<strong>逐期遞增</strong>。<br>
              3. 每期現金利息固定（$\text{Face} \times \text{Stated}$），折價攤銷額 $= \text{利息費用} - \text{現金利息}$，因此攤銷額也必然<strong>逐期遞增</strong>！
            </p>
          </div>
        </div>

        <div class="problem-box">
          <div class="problem-head">
            <span class="problem-tag">試煉題 2</span>
            <span>以資產清償債務時，IFRS 下為何要將處分損益與債務除列損益分開衡量？</span>
          </div>
          <p>某公司以帳面價值 $100,000、公允價值 $70,000 的土地，全額清償 $90,000 的即期負債。請問其損益應如何表達？</p>
          <button class="solution-toggle" onclick="toggleSolution('sol-q2')">💡 展開掌櫃解析</button>
          <div id="sol-q2" class="solution-body">
            <p><strong>【核心解答】</strong> 應拆分為兩筆獨立損益，嚴禁淨額混淆！</p>
            <ul>
              <li><strong>資產處分損失 (Loss on Disposal of Land)：</strong> $\text{Carrying } 100,000 - \text{Fair Value } 70,000 = \mathbf{\$30,000}$（屬於營運或資產管理損益）。</li>
              <li><strong>債務除列利益 (Gain on Extinguishment of Debt)：</strong> $\text{Debt } 90,000 - \text{Fair Value } 70,000 = \mathbf{\$20,000}$（屬於金融重組利益）。</li>
            </ul>
            <p>分錄：<br>
              Dr. Note Payable 90,000<br>
              Dr. Loss on Disposal of Land 30,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Land 100,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Gain on Extinguishment of Debt 20,000
            </p>
          </div>
        </div>
      </section>

      <!-- 總結與記憶膠囊 -->
      <section id="summary">
        <div class="story-card" style="border-left-color: var(--gold); background: linear-gradient(145deg, #ffffff 0%, var(--gold-light) 100%);">
          <div class="story-header" style="color: #92400e;">
            <span>💎</span> 冒險者公會大掌櫃的「Chapter 14 核心記憶膠囊」
          </div>
          <ol style="margin-left:1.2rem; font-size:0.92rem; line-height:1.75;">
            <li><strong>雙軌利息定錨：</strong> 票面利率乘面額算「實付現金」；有效利率乘帳面價值算「利息費用」。兩者差額即為攤銷。</li>
            <li><strong>IFRS 淨額法鐵則：</strong> 公司債初次認列以公允售價淨額入帳，嚴禁使用單獨的 Discount / Premium 獨立科目！</li>
            <li><strong>有效利息法走勢：</strong> 折價發行時帳面遞增、利息費用遞增、攤銷額遞增；溢價發行時帳面遞減、利息費用遞減、攤銷額遞增！</li>
            <li><strong>兩期之間發行：</strong> 買方墊付發行前應計利息，下次付息日退還整期利息，實質利息費用自發行日起算。</li>
            <li><strong>債務除列兩階段：</strong> 非現金資產抵債先按公允認列資產處分損益，再按公允與負債差額認列債務消滅利益；重組修改條款一律按新市場利率折現認列新債。</li>
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
        <li><a href="#lo-1">LO 1：公司債本質與發行會計</a></li>
        <li><a href="#widget-bond-amort">└ 🏛️ 公司債動態攤銷天平</a></li>
        <li><a href="#lo-2">LO 2：長期應付票據會計</a></li>
        <li><a href="#lo-3">LO 3：非流動負債實質除列</a></li>
        <li><a href="#widget-extinguish">└ ⚖️ 債務清償損益試算機</a></li>
        <li><a href="#lo-4">LO 4：表達、表外融資與比率</a></li>
        <li><a href="#widget-ratios">└ 📊 償債能力指標診斷器</a></li>
        <li><a href="#lo-5">LO 5：IFRS vs GAAP 深度對照</a></li>
        <li><a href="#review-quiz">課後自我檢測</a></li>
        <li><a href="#summary">本章記憶膠囊</a></li>
      </ul>
    </aside>

  </div>

  <!-- 頁腳 -->
  <footer>
    <div style="max-width:800px; margin:0 auto;">
      <p style="font-weight:700; color:#e2e8f0; margin-bottom:0.5rem;">🌲 WikiTree Living Knowledge Ecosystem · 中級會計學模組</p>
      <p style="font-size:0.8rem; margin:0;">
        Crafted with precision for adventurers in Corporate Finance &amp; Financial Reporting.<br>
        依據 Kieso, Weygandt, Warfield <i>Intermediate Accounting (IFRS Edition)</i> 專屬鍛造。
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

    // 互動實驗室 1：公司債有效利息法攤銷生成器
    function generateBondTable() {
      const face = parseFloat(document.getElementById('wb-face').value);
      const couponRate = parseFloat(document.getElementById('wb-coupon').value) / 100;
      const marketRate = parseFloat(document.getElementById('wb-market').value) / 100;
      const years = parseInt(document.getElementById('wb-years').value);

      const semiCoupon = couponRate / 2;
      const semiMarket = marketRate / 2;
      const n = years * 2;
      const pmt = face * semiCoupon;

      // PV 計算
      const pv_prin = face * Math.pow(1 + semiMarket, -n);
      const pv_int = pmt * ((1 - Math.pow(1 + semiMarket, -n)) / semiMarket);
      const issuePrice = pv_prin + pv_int;
      const diff = issuePrice - face;
      const isDiscount = diff < -0.01;
      const isPremium = diff > 0.01;

      let typeText = isDiscount ? `<span style="color:#dc2626; font-weight:700;">折價發行 (Discount: $${Math.abs(diff).toFixed(2)})</span>` : 
                     (isPremium ? `<span style="color:#059669; font-weight:700;">溢價發行 (Premium: $${diff.toFixed(2)})</span>` : 
                     `<span style="color:#4338ca; font-weight:700;">平價發行 (Par)</span>`);

      let html = `
        <h4 style="margin:0 0 0.5rem; color:var(--primary-dark);">發行結果：${typeText}</h4>
        <p style="margin-bottom:0.8rem;">
          • 每期付現利息：<strong>$${pmt.toFixed(2)}</strong> ｜ 
          • 發行淨額 (初始帳面價值)：<strong>$${issuePrice.toFixed(2)}</strong>
        </p>
        <div style="overflow-x:auto;">
        <table class="q-table" style="font-size:0.85rem; margin:0;">
          <thead>
            <tr><th>期數</th><th>實付利息 (Stated)</th><th>利息費用 (Effective)</th><th>攤銷金額</th><th>期末帳面價值 (Carrying Value)</th></tr>
          </thead>
          <tbody>
            <tr><td>0 (發行日)</td><td>—</td><td>—</td><td>—</td><td><strong>$${issuePrice.toFixed(2)}</strong></td></tr>
      `;

      let cv = issuePrice;
      let totalPaid = 0;
      let totalExp = 0;
      let totalAmort = 0;

      for (let i = 1; i <= n; i++) {
        let exp = cv * semiMarket;
        let amort = Math.abs(exp - pmt);
        if (i === n) {
          // 最後一期微調防浮點誤差
          amort = isDiscount ? (face - cv) : (cv - face);
          exp = isDiscount ? (pmt + amort) : (pmt - amort);
          cv = face;
        } else {
          cv = isDiscount ? (cv + amort) : (cv - amort);
        }

        totalPaid += pmt;
        totalExp += exp;
        totalAmort += amort;

        html += `
          <tr>
            <td>第 ${i} 期</td>
            <td>$${pmt.toFixed(2)}</td>
            <td>$${exp.toFixed(2)}</td>
            <td>$${amort.toFixed(2)}</td>
            <td><strong>$${cv.toFixed(2)}</strong></td>
          </tr>
        `;
      }

      html += `
          <tr style="font-weight:700; background:#f1f5f9;">
            <td>合計</td>
            <td>$${totalPaid.toFixed(2)}</td>
            <td>$${totalExp.toFixed(2)}</td>
            <td>$${totalAmort.toFixed(2)}</td>
            <td>$${face.toFixed(2)}</td>
          </tr>
        </tbody></table></div>
      `;

      document.getElementById('wb-result').innerHTML = html;
    }

    // 互動實驗室 2：債務重組與提前清償計算
    function toggleExtinguishInputs() {
      const type = document.getElementById('we-type').value;
      const param1Box = document.getElementById('we-param1-box');
      const param2Box = document.getElementById('we-param2-box');
      const param1Lbl = document.getElementById('we-param1-lbl');

      if (type === 'cash') {
        param1Box.style.display = 'flex';
        param2Box.style.display = 'none';
        param1Lbl.innerText = '贖回支付現金總額 ($)';
      } else if (type === 'asset') {
        param1Box.style.display = 'flex';
        param2Box.style.display = 'flex';
        param1Lbl.innerText = '抵債資產公允價值 ($)';
      } else if (type === 'modify') {
        param1Box.style.display = 'flex';
        param2Box.style.display = 'none';
        param1Lbl.innerText = '新債公允價值 ($)';
      }
    }

    function calcExtinguishment() {
      const oldCV = parseFloat(document.getElementById('we-old-cv').value);
      const type = document.getElementById('we-type').value;
      const p1 = parseFloat(document.getElementById('we-param1').value);

      let html = '';
      if (type === 'cash') {
        const diff = oldCV - p1;
        if (diff >= 0) {
          html = `<strong style="color:var(--success);">✅ 提前贖回利益 (Gain on Extinguishment)：$${diff.toFixed(2)}</strong><br>
                  分錄：借記 Bonds Payable $${oldCV.toFixed(2)}，貸記 Cash $${p1.toFixed(2)}，貸記 Gain $${diff.toFixed(2)}。`;
        } else {
          html = `<strong style="color:var(--danger);">⚠️ 提前贖回損失 (Loss on Extinguishment)：$${Math.abs(diff).toFixed(2)}</strong><br>
                  分錄：借記 Bonds Payable $${oldCV.toFixed(2)}，借記 Loss $${Math.abs(diff).toFixed(2)}，貸記 Cash $${p1.toFixed(2)}。`;
        }
      } else if (type === 'asset') {
        const assetCV = parseFloat(document.getElementById('we-param2').value);
        const assetFV = p1;
        const dispGainLoss = assetFV - assetCV;
        const extGain = oldCV - assetFV;

        let dispText = dispGainLoss >= 0 ? `<span style="color:var(--success);">資產處分利益：$${dispGainLoss.toFixed(2)}</span>` : `<span style="color:var(--danger);">資產處分損失：$${Math.abs(dispGainLoss).toFixed(2)}</span>`;
        let extText = extGain >= 0 ? `<span style="color:var(--success);">債務消滅利益：$${extGain.toFixed(2)}</span>` : `<span style="color:var(--danger);">債務消滅損失：$${Math.abs(extGain).toFixed(2)}</span>`;

        html = `<strong>兩階段損益拆解：</strong><br>
                1. ${dispText} (資產公允 $${assetFV.toFixed(2)} &minus; 帳面 $${assetCV.toFixed(2)})<br>
                2. ${extText} (負債帳面 $${oldCV.toFixed(2)} &minus; 資產公允 $${assetFV.toFixed(2)})`;
      } else if (type === 'modify') {
        const gain = oldCV - p1;
        html = `<strong style="color:var(--success);">✅ 債務條款修改利益 (Gain on Extinguishment)：$${gain.toFixed(2)}</strong><br>
                IFRS 9 規範：舊負債全額除列 ($${oldCV.toFixed(2)})，新負債以重組日現值入帳 ($${p1.toFixed(2)})，差額計入重整利益。`;
      }

      document.getElementById('we-result').innerHTML = html;
    }

    // 互動實驗室 3：償債能力比率計算
    function calcSolvencyRatios() {
      const liab = parseFloat(document.getElementById('wr-liab').value);
      const assets = parseFloat(document.getElementById('wr-assets').value);
      const ebit = parseFloat(document.getElementById('wr-ebit').value);
      const interest = parseFloat(document.getElementById('wr-interest').value);

      const debtToAssets = (liab / assets) * 100;
      const tie = ebit / interest;

      document.getElementById('wr-result').innerHTML = `
        <strong>📊 財務診斷報告：</strong><br>
        • <strong>負債比率 (Debt to Assets)：${debtToAssets.toFixed(2)}%</strong> 
          ${debtToAssets > 60 ? '⚠️ 財務槓桿偏高' : '✅ 槓桿結構健康'}<br>
        • <strong>利息保障倍數 (Times Interest Earned)：${tie.toFixed(2)} 倍</strong> 
          ${tie > 5 ? '👑 利息支付安全邊際極高' : '⚠️ 獲利覆蓋利息能力脆弱'}
      `;
    }

    window.addEventListener('DOMContentLoaded', () => {
      generateBondTable();
      calcSolvencyRatios();
    });
  </script>
</body>
</html>
'''

def main():
    target_filename = "Ch14_非流動負債_學習講義.html"

    # 目標部署清單
    paths = [
        os.path.join(r"收件苗圃", "學習講義合輯", target_filename),
        os.path.join(r"C:\Users\閻星澄\Documents\WikiTree\收件苗圃\中級會計學", target_filename),
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
