# -*- coding: utf-8 -*-
"""
Generate Chapter 3 Handout HTML: Financial Decision Making and the Law of One Price
"""
import os

html_content = r'''<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chapter 3 財務決策與單一價格法則｜冒險者公會的首席大掌櫃修煉秘笈</title>
  <style>
    :root {
      --ink: #1f2d3d;
      --muted: #5a6e85;
      --paper: #fcfbf7;
      --wash: #f4f1ea;
      --line: #e2e8e5;
      --accent: #196b58;
      --accent-light: #eaf5f1;
      --accent-dark: #0f4538;
      --gold: #d48b28;
      --gold-light: #fef8ec;
      --gold-border: #f2d49c;
      --alert: #c0392b;
      --alert-light: #fdf2f0;
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
      line-height: 1.8;
    }

    /* 頂部英雄導覽 Banner */
    .hero {
      background: linear-gradient(135deg, #0d382f 0%, #196b58 60%, #2a8a72 100%);
      color: #ffffff;
      padding: 4.5rem 5vw 3.5rem;
      border-bottom: 4px solid var(--gold);
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: "⚖️ 💰 📈 ⏳ 💎";
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
      color: #f7e6a7;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.35rem 0.9rem;
      border-radius: 20px;
      margin-bottom: 1.2rem;
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
      color: #d1ebe3;
      max-width: 800px;
      margin: 0 0 1.2rem;
      font-weight: 300;
    }
    .hero .meta-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      font-size: 0.88rem;
    }
    .meta-tag {
      background: rgba(0, 0, 0, 0.25);
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* 佈局容器 */
    .layout {
      display: grid;
      grid-template-columns: 270px minmax(0, 1fr);
      gap: clamp(2rem, 4vw, 5rem);
      max-width: 1520px;
      margin: 0 auto;
      padding: 3rem 4vw;
    }

    /* 側邊 Sticky 目錄 */
    .toc {
      position: sticky;
      top: 1.8rem;
      align-self: start;
      max-height: calc(100vh - 3rem);
      overflow-y: auto;
      background: var(--card-bg);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 1.4rem;
      box-shadow: var(--shadow);
    }
    .toc-title {
      font-weight: 800;
      color: var(--accent-dark);
      font-size: 1.05rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 2px solid var(--accent-light);
      padding-bottom: 0.6rem;
    }
    .toc a {
      display: block;
      color: var(--muted);
      text-decoration: none;
      font-size: 0.9rem;
      padding: 0.42rem 0.6rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      line-height: 1.4;
      margin-bottom: 0.25rem;
    }
    .toc a:hover {
      color: var(--accent);
      background: var(--accent-light);
      padding-left: 0.9rem;
    }

    /* 主體內容 */
    main { min-width: 0; }
    section {
      background: var(--card-bg);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 2.5rem;
      margin-bottom: 3.5rem;
      box-shadow: var(--shadow);
      scroll-margin-top: 2rem;
    }

    h2 {
      font-size: 1.8rem;
      color: var(--accent-dark);
      margin: 0 0 1.2rem;
      padding-bottom: 0.6rem;
      border-bottom: 2px solid var(--line);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    h3 {
      font-size: 1.32rem;
      color: #174239;
      margin: 2rem 0 0.8rem;
    }
    h4 {
      font-size: 1.1rem;
      color: #2c4a43;
      margin: 1.5rem 0 0.5rem;
    }

    p { margin: 0.8rem 0; }
    strong { color: var(--accent-dark); font-weight: 700; }
    
    /* 專有名詞徽章 */
    .en-term {
      display: inline-flex;
      align-items: baseline;
      background: #eef5f3;
      color: #115243;
      padding: 0.1rem 0.45rem;
      border-radius: 4px;
      font-family: inherit;
      font-weight: 600;
      border: 1px solid #d1e5df;
      font-size: 0.94em;
    }
    .en-term small {
      color: #63857d;
      font-weight: 500;
      margin-left: 0.35rem;
      font-size: 0.85em;
    }

    /* 故事公會情境卡片 */
    .rpg-box {
      background: linear-gradient(135deg, #f8fbf9, #edf5f1);
      border-left: 5px solid var(--accent);
      border-radius: 8px;
      padding: 1.3rem 1.6rem;
      margin: 1.5rem 0;
    }
    .rpg-box h4 {
      margin: 0 0 0.5rem;
      color: var(--accent-dark);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* 警告 / 重點提示卡片 */
    .highlight-box {
      background: var(--gold-light);
      border: 1px solid var(--gold-border);
      border-radius: 8px;
      padding: 1.2rem 1.5rem;
      margin: 1.5rem 0;
    }
    .highlight-box h4 { margin: 0 0 0.4rem; color: #8a5814; }

    .law-box {
      background: #11362d;
      color: #f0fdf9;
      border-radius: 10px;
      padding: 1.6rem 2rem;
      margin: 1.8rem 0;
      box-shadow: 0 8px 24px rgba(17, 54, 45, 0.15);
      border: 2px solid var(--gold);
    }
    .law-box h3 { color: #fcebbd; margin-top: 0; }
    .law-box p { color: #d6eee7; margin-bottom: 0; }

    /* 原書 Example 詳解卡片 */
    .example-card {
      background: #ffffff;
      border: 1px solid #cbdad4;
      border-radius: 10px;
      margin: 2rem 0;
      overflow: hidden;
      box-shadow: 0 3px 12px rgba(0,0,0,0.04);
    }
    .example-header {
      background: #edf5f2;
      padding: 0.8rem 1.4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #dce8e3;
    }
    .example-title {
      font-weight: 700;
      color: var(--accent-dark);
      font-size: 1.05rem;
    }
    .example-badge {
      background: var(--accent);
      color: #fff;
      font-size: 0.78rem;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .example-body {
      padding: 1.4rem 1.6rem;
    }
    .example-problem {
      background: #fafaf8;
      padding: 1rem 1.2rem;
      border-radius: 6px;
      border-left: 3px solid #7c988f;
      margin-bottom: 1.2rem;
    }
    .example-solution {
      padding: 0.5rem 0.2rem;
    }

    /* 互動小實驗 Widget 容器 */
    .widget-container {
      background: #f7faf8;
      border: 2px solid #b7d6cb;
      border-radius: var(--radius);
      padding: 1.8rem;
      margin: 2rem 0;
      box-shadow: 0 4px 16px rgba(25, 107, 88, 0.08);
    }
    .widget-title {
      font-size: 1.22rem;
      font-weight: 800;
      color: var(--accent-dark);
      margin-top: 0;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      border-bottom: 1px dashed #c0ded4;
      padding-bottom: 0.7rem;
    }
    .widget-intro {
      font-size: 0.95rem;
      color: var(--muted);
      margin-bottom: 1.4rem;
    }
    .control-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.2rem;
      margin-bottom: 1.3rem;
    }
    .control-group {
      background: #ffffff;
      padding: 0.9rem 1.1rem;
      border-radius: 8px;
      border: 1px solid #dce5e1;
    }
    .control-group label {
      display: block;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--accent-dark);
      margin-bottom: 0.4rem;
    }
    .control-group input[type="range"] {
      width: 100%;
      accent-color: var(--accent);
      cursor: pointer;
    }
    .control-group input[type="number"] {
      width: 100%;
      padding: 0.4rem 0.6rem;
      border: 1px solid #cbd7d2;
      border-radius: 4px;
      font-size: 1rem;
    }
    .control-group .val-display {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--accent);
      margin-top: 0.3rem;
    }

    .widget-result-box {
      background: #ffffff;
      border: 2px solid var(--accent);
      border-radius: 10px;
      padding: 1.3rem 1.6rem;
      text-align: center;
      margin-top: 1.2rem;
    }
    .result-big {
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--accent-dark);
      line-height: 1.2;
    }
    .result-desc {
      font-size: 0.98rem;
      color: var(--muted);
      margin-top: 0.4rem;
    }

    /* 表格樣式 */
    .table-wrap {
      overflow-x: auto;
      margin: 1.4rem 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.94rem;
    }
    th, td {
      border: 1px solid var(--line);
      padding: 0.75rem 1rem;
      text-align: left;
    }
    th {
      background: #edf5f2;
      color: var(--accent-dark);
      font-weight: 700;
    }
    tr:nth-child(even) td { background: #fafaf8; }

    /* 公式高亮框 */
    .formula-banner {
      font-family: "Cascadia Code", Consolas, "Courier New", monospace;
      background: #202b38;
      color: #9feaf9;
      padding: 1.1rem 1.4rem;
      border-radius: 8px;
      font-size: 1.05rem;
      margin: 1.2rem 0;
      overflow-x: auto;
      border-left: 5px solid #28b485;
    }

    /* 互動小測驗 */
    .quiz-card {
      background: #fafaf7;
      border: 1px solid #dce2de;
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .quiz-q {
      font-weight: 700;
      color: #1a3c34;
      font-size: 1.05rem;
      margin-bottom: 1rem;
    }
    .quiz-options {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .quiz-opt {
      background: #ffffff;
      border: 1px solid #d1d9d5;
      padding: 0.75rem 1.1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.96rem;
      text-align: left;
    }
    .quiz-opt:hover {
      background: #edf5f2;
      border-color: var(--accent);
    }
    .quiz-feedback {
      display: none;
      margin-top: 1rem;
      padding: 0.9rem 1.1rem;
      border-radius: 6px;
      font-size: 0.93rem;
      line-height: 1.6;
    }
    .feedback-correct {
      background: #eaf6ef;
      border: 1px solid #73c799;
      color: #0e542c;
    }
    .feedback-wrong {
      background: #fdf2f0;
      border: 1px solid #f19f96;
      color: #8c261b;
    }

    /* 響應式 */
    @media (max-width: 960px) {
      .layout {
        display: block;
        padding: 1.5rem 4vw;
      }
      .toc {
        position: static;
        max-height: none;
        margin-bottom: 2rem;
      }
      section { padding: 1.6rem; }
      .hero { padding: 3rem 5vw 2.5rem; }
    }
  </style>
</head>
<body>

<!-- 頂部 Hero Banner -->
<header class="hero">
  <div class="eyebrow">Corporate Finance · Berk & DeMarzo · Chapter 3</div>
  <h1>Chapter 3｜財務決策與單一價格法則</h1>
  <div class="subtitle">Financial Decision Making and the Law of One Price —— 像十五歲國中生一樣，搞懂公會大掌櫃的算錢神技！</div>
  <div class="meta-tags">
    <span class="meta-tag">⚔️ 角色：公會首席財務掌櫃</span>
    <span class="meta-tag">🎯 核心：評價原則 (Valuation Principle)</span>
    <span class="meta-tag">⏳ 武器：貨幣時間價值 (TVM) & 淨現值 (NPV)</span>
    <span class="meta-tag">⚖️ 終極真理：單一價格法則 (Law of One Price)</span>
  </div>
</header>

<div class="layout">
  <!-- 側邊導航目錄 -->
  <nav class="toc" aria-label="講義目錄">
    <div class="toc-title">📖 冒險指南目錄</div>
    <a href="#intro">🏰 序章：公會大掌櫃的神聖任務</a>
    <a href="#sec1">⚖️ 第一節：市場價格決定客觀價值</a>
    <a href="#sec2">⏳ 第二節：時間也是一種匯率 (TVM)</a>
    <a href="#sec3">💎 第三節：財務學第一金律 NPV</a>
    <a href="#sec4">🦊 第四節：套利與單一價格法則 (LOOP)</a>
    <a href="#sec5">📜 第五節：無套利證券定價與分離原則</a>
    <a href="#integration">🧩 全章心智地圖與十組易混概念</a>
    <a href="#practice">🎯 實戰演練：6 題觀念通關測驗</a>
    <a href="#glossary">📚 必背英漢專業術語字典庫</a>
  </nav>

  <!-- 主體講義內容 -->
  <main>

    <!-- 序章 -->
    <section id="intro">
      <h2>🏰 序章：公會大掌櫃的神聖任務</h2>
      <div class="rpg-box">
        <h4>🎮 歡迎來到財務冒險者公會！</h4>
        <p>想像你是一個大型線上遊戲公會的<strong>「首席大掌櫃」（<span class="en-term">Financial Manager<small>財務經理</small></span>）</strong>。公會裡有幾千名冒險者與金主（<span class="en-term">Investors / Shareholders<small>投資人 / 股東</small></span>），他們把辛苦打怪賺來的金幣投資在公會金庫裡，由你全權負責做決定。</p>
        <p>某天，公會面臨抉擇：要不要花 10 萬金幣擴建鐵匠鋪？要不要發行公會債券跟玩家借錢？如果公會拿到一張稀有門票，要自己留著還是拿去拍賣所換現金？</p>
      </div>
      <p>身為財務經理，你的目標非常純粹且神聖：<strong>為公會的投資人做出能「最大化財富」的決策！</strong></p>
      <p>原則聽起來像一句廢話：<strong>只要一個決策帶來的「好處（<span class="en-term">Benefits<small>效益</small></span>）」大於它所付出的「代價（<span class="en-term">Costs<small>成本</small></span>）」，這就是個好決策！</strong></p>
      <p>但現實中，問題沒那麼簡單：</p>
      <ul>
        <li>如果付出的成本是「400 盎司的白銀」，得到的收益是「10 盎司的黃金」，怎麼比？</li>
        <li>如果付出的成本是「今天的 10 萬塊」，得到的收益是「一年後的 10 萬 5 千塊」，怎麼比？</li>
        <li>如果老闆個人超級討厭搖滾樂，他該不該收下一張價值連城的搖滾樂門票？</li>
      </ul>
      <p>這本教科書的第三章，就是為了解決這些問題而生！它將傳授你財務學中最根本、最強大的兩把尚方寶劍：<strong>【評價原則（Valuation Principle）】</strong>與<strong>【單一價格法則（Law of One Price）】</strong>！</p>
    </section>

    <!-- 第一節 -->
    <section id="sec1">
      <h2>⚖️ 第一節：市場價格決定客觀價值</h2>
      <p class="lead"><strong>核心思考：一件東西的真正價值，到底是由「我的個人喜好」決定，還是由「市場價格」決定？</strong></p>
      
      <h3>1. 競爭市場：無偏見的價值天平</h3>
      <p>在財務學中，我們最愛的一種地方叫做<strong><span class="en-term">Competitive Market<small>競爭市場</small></span></strong>。什麼是競爭市場？簡單來說：<strong>你在這個市場裡，可以用「完全相同的價格」買進，也可以用這個價格賣出！</strong>（就像拍賣所裡的流通金條，大家公認的公定價）。</p>
      <p>只要存在競爭市場，就會導出全宇宙最重要的<strong>【<span class="en-term">The Valuation Principle<small>評價原則</small></span>】</strong>：</p>

      <div class="law-box">
        <h3>📜 評價原則（The Valuation Principle）</h3>
        <p>一項資產對企業或投資人的價值，<strong>完全由其在競爭市場上的市場價格決定</strong>！評估一項決策的效益與成本時，必須一律轉換為「今天的現金價值」。只要效益的市場價值大於成本的市場價值，這項決策就能增加企業與投資人的財富，不管決策者個人的喜好如何！</p>
      </div>

      <!-- Example 3.1 -->
      <div class="example-card">
        <div class="example-header">
          <span class="example-title">💡 教科書範例 3.1：電台抽中門票的難題</span>
          <span class="example-badge">EXAMPLE 3.1</span>
        </div>
        <div class="example-body">
          <div class="example-problem">
            <strong>【題目情境】</strong><br>
            你參加電台抽獎幸運中獎了！主辦單位給你兩個選擇：<br>
            <strong>選擇 A：</strong>4 張 Def Leppard（80年代重金屬搖滾樂團）重聚演唱會門票（票面標價每張 $40）。但你根本不是搖滾迷，甚至覺得吵死了，打死都不會去看。<br>
            <strong>選擇 B：</strong>2 張你心目中最崇拜、做夢都想看的大神樂團演唱會門票（門票早已完售，票面標價每張 $45）。<br>
            你上黃牛拍賣網（StubHub）查了一下公定市價：<br>
            • Def Leppard 門票拍賣所買賣價都是每張 <strong>$30</strong>。<br>
            • 你最愛的樂團門票拍賣所買賣價都是每張 <strong>$50</strong>。<br>
            請問：你身為一個聰明的 15 歲小孩，你應該選擇哪一個獎項？
          </div>
          <div class="example-solution">
            <strong>【解題思維：不要被情感蒙蔽了理財的雙眼！】</strong><br>
            很多不懂財務的人會直覺大喊：「當然選 B 啊！我超愛那個樂團，而且我討厭搖滾樂！」——<strong>大錯特錯！</strong><br>
            讓我們算一下兩者的「市場現金價值（Cash Value）」：
            <ul>
              <li><strong>獎品 A 總市價：</strong>4 張 × $30/張 = <strong>$120 現金</strong>。</li>
              <li><strong>獎品 B 總市價：</strong>2 張 × $50/張 = <strong>$100 現金</strong>。</li>
            </ul>
            <strong>正確做法：</strong>果斷選 A！<br>
            拿到 4 張 Def Leppard 門票後，立刻掛到拍賣所賣掉換得 <strong>$120 現金</strong>。接著拿其中的 <strong>$100</strong> 去買 2 張你最愛樂團的門票。這樣你不僅如願看到了最愛的偶像，口袋還<strong>白白多出 $20 現金</strong>可以買一件紀念 T-shirt！
          </div>
        </div>
      </div>

      <!-- Example 3.2 -->
      <div class="example-card">
        <div class="example-header">
          <span class="example-title">💡 教科書範例 3.2：營運經理的原物料合約</span>
          <span class="example-badge">EXAMPLE 3.2</span>
        </div>
        <div class="example-body">
          <div class="example-problem">
            <strong>【題目情境】</strong><br>
            你是公會工廠的營運經理。之前簽了一份特殊合約，允許你用總價 <strong>$12,000</strong> 同時買下「200 桶原油」和「3,000 磅紅銅」。<br>
            目前市場競爭價格：原油每桶 $50，紅銅每磅 $2。<br>
            你擔心未來油價銅價會跌，而且工廠目前根本用不到這麼多油和銅。你該不該執行這個合約？
          </div>
          <div class="example-solution">
            <strong>【解題思維】</strong><br>
            換算成客觀現金價值：
            <ul>
              <li>原油現值：200 桶 × $50 = $10,000</li>
              <li>紅銅現值：3,000 磅 × $2 = $6,000</li>
              <li>總效益市場價值：$10,000 + $6,000 = <strong>$16,000</strong></li>
              <li>付出成本：<strong>$12,000</strong></li>
              <li>淨增加價值：$16,000 - $12,000 = <strong>+$4,000</strong></li>
            </ul>
            <strong>結論：</strong>一定要執行！即便工廠一滴油都不用，你在市場上轉手立刻賣掉，公會資產就無風險現賺 <strong>$4,000 現金</strong>！
          </div>
        </div>
      </div>

      <!-- 珠寶商黃金白銀案例與非競爭市場 (iPad) -->
      <div class="highlight-box">
        <h4>🔍 原書經典案例補充：珠寶商與 RBC 銀行送 iPad</h4>
        <p><strong>1. 珠寶商 400 盎司銀換 10 盎司金：</strong>白銀市價 $17/oz（值 $6,800），黃金市價 $1,300/oz（值 $13,000）。不能光看 400 比 10 數字大，以市場現金衡量，換了立刻現賺 $6,200！</p>
        <p><strong>2. 當沒有「競爭市場」時怎麼辦？（單向價格 One-Sided Prices）：</strong><br>
        2016 年加拿大皇家銀行（RBC）開戶送 iPad mini 2，市價定價 $329。但你不能拿 iPad 去按 $329 賣回給 Apple 專賣店！此時 $329 是「價值的最高上限」。如果你本來就要買，它對你值 $329；如果你用不到，二手只能轉賣朋友 $250，那它對你的價值就落在 $250~$329 之間。<strong>只有在雙向可自由買賣的競爭市場，資產價值才完全獨立於個人喜好！</strong></p>
      </div>

      <!-- 互動組件 1：拍賣所智慧天平 -->
      <div class="widget-container">
        <div class="widget-title">🧪 互動實驗 1：拍賣所的客觀天平（偏好 vs 現金）</div>
        <div class="widget-intro">拉動下面的滑桿，親身體驗為什麼「市場客觀價格」永遠比「主觀情感」更能幫公會賺大錢！</div>
        <div class="control-row">
          <div class="control-group">
            <label>搖滾門票市價 ($/張)</label>
            <input type="range" id="rockPrice" min="10" max="60" value="30" oninput="calcTickets()">
            <div class="val-display" id="rockPriceDisp">$30</div>
          </div>
          <div class="control-group">
            <label>偶像門票市價 ($/張)</label>
            <input type="range" id="idolPrice" min="30" max="90" value="50" oninput="calcTickets()">
            <div class="val-display" id="idolPriceDisp">$50</div>
          </div>
        </div>
        <div class="widget-result-box">
          <div class="result-big" id="ticketAdvise">選搖滾門票 (A)！</div>
          <div class="result-desc" id="ticketDetail">賣掉 4 張搖滾票得 $120，買 2 張偶像票花 $100，現賺 $20 買周邊！</div>
        </div>
      </div>

    </section>

    <!-- 第二節 -->
    <section id="sec2">
      <h2>⏳ 第二節：時間也是一種匯率 (TVM)</h2>
      <p class="lead"><strong>靈魂拷問：如果有人今天給你 10,000 元，或者一年後給你 10,000 元，你會選哪一個？</strong></p>
      <p>只要是正常人都會選「今天拿」！因為今天的 10,000 元，你可以存進銀行賺利息、買零食吃，或者投資裝備。這就是著名的<strong><span class="en-term">Time Value of Money (TVM)<small>貨幣時間價值</small></span></strong>！</p>

      <h3>1. 利率：穿越時空的匯率（Exchange Rate Across Time）</h3>
      <p>你去日本玩，要把「新台幣」換成「日圓」，你需要一個<strong>外幣匯率</strong>。</p>
      <p>同樣的道理！如果你要把「今天的錢（<span class="en-term">Money Today<small>現值</small></span>）」換成「一年後的錢（<span class="en-term">Money in Future<small>終值</small></span>）」，你需要一個<strong>穿越時空的匯率</strong>——這個匯率就是<strong><span class="en-term">Interest Rate (r)<small>市場利率</small></span></strong>！</p>
      <p>在沒有倒閉風險的世界裡，這個利率稱為<strong><span class="en-term">Risk-Free Interest Rate (r<sub>f</sub>)<small>無風險利率</small></span></strong>。</p>

      <div class="formula-banner">
【時光向前（複利 Compounding）】:  未來的錢 (FV) = 今天的錢 (PV) × (1 + r)
【時光倒流（折現 Discounting）】:  今天的錢 (PV) = 未來的錢 (FV) ÷ (1 + r)
【折現因子（Discount Factor）】:  1 / (1 + r) —— 相當於一年後的 1 元在今天值多少！
      </div>

      <p>注意看！因為未來的 1 塊錢縮水了，折現因子 <span class="en-term">Discount Factor</span> 必然<strong>小於 1</strong>！</p>

      <!-- Example 3.3 -->
      <div class="example-card">
        <div class="example-header">
          <span class="example-title">💡 教科書範例 3.3：舊金山海灣大橋（Bay Bridge）拖延工程的代價</span>
          <span class="example-badge">EXAMPLE 3.3</span>
        </div>
        <div class="example-body">
          <div class="example-problem">
            <strong>【題目情境】</strong><br>
            2004 年舊金山海灣大橋為了防震進行重建，估計造價為 <strong>30 億美元（$3B）</strong>。<br>
            工程師評估：如果工程拖延一年到 2005 年才動工，建材與人工會上漲 10%，變成 <strong>33 億美元（$3.3B）</strong>。<br>
            假設當時的無風險年利率為 <strong>2%</strong>。請問：拖延一年對 2004 年的納稅人來說，實質損失是多少？
          </div>
          <div class="example-solution">
            <strong>【解題思維：把未來的錢拉回今天才能比較！】</strong><br>
            2005 年要付的 $3.3B，在 2004 年相當於多少現金？
            <div class="formula-banner">
2005 年的 $3.3B ÷ (1 + 0.02) = 3.235 億美元（$3.235B in 2004）
            </div>
            所以拖延一年的實質額外成本為：<br>
            $3.235B - $3.000B = <strong>2.35 億美元（$235 Million in 2004 現金）</strong>！<br>
            拖延一年，就等於平白無故把 2.35 億美元倒進舊金山海灣裡！
          </div>
        </div>
      </div>

      <!-- 互動組件 2：時光任意門 -->
      <div class="widget-container">
        <div class="widget-title">🧪 互動實驗 2：時光金幣任意門（TVM 穿越計算機）</div>
        <div class="widget-intro">拉動利率滑桿，親眼看看未來的金幣被折現拉回今天時，會產生怎樣神奇的變化！</div>
        <div class="control-row">
          <div class="control-group">
            <label>一年後的金幣 (Future Value, FV)</label>
            <input type="number" id="tvmFV" value="105000" step="5000" oninput="calcTVM()">
          </div>
          <div class="control-group">
            <label>市場無風險年利率 (r)</label>
            <input type="range" id="tvmRate" min="1" max="20" value="7" oninput="calcTVM()">
            <div class="val-display" id="tvmRateDisp">7.0%</div>
          </div>
        </div>
        <div class="widget-result-box">
          <div class="result-big" id="tvmPVResult">$98,130.84</div>
          <div class="result-desc" id="tvmPVDesc">相當於你今天只要在銀行存入 $98,130.84，一年後就能領到 $105,000！折現因子為 0.9346。</div>
        </div>
      </div>

    </section>

    <!-- 第三節 -->
    <section id="sec3">
      <h2>💎 第三節：財務學第一金律 NPV</h2>
      <p class="lead"><strong>整個商學院最神聖的公式誕生了——<span class="en-term">Net Present Value (NPV)<small>淨現值</small></span>！</strong></p>

      <div class="formula-banner">
NPV = PV(所有收益 Benefits) - PV(所有成本 Costs)
    = PV(專案全部現金流 All Cash Flows)
      </div>

      <div class="law-box">
        <h3>🏆 NPV 決策黃金法則（The NPV Decision Rule）</h3>
        <p><strong>1. 單一方案決策：</strong><br>
        • 如果 <strong>NPV > 0</strong>：毫無懸念，<strong>接受（Accept）</strong>！這相當於今天立刻平白無故多拿現金。<br>
        • 如果 <strong>NPV < 0</strong>：果斷<strong>拒絕（Reject）</strong>！做了只會讓股東資產縮水。<br>
        • 如果 <strong>NPV = 0</strong>：不賺不賠（Break-even），做不做皆可。<br>
        <strong>2. 多選一互相排斥方案（Mutually Exclusive）：</strong><br>
        • 永遠挑選 <strong>NPV 最高的那個方案</strong>！</p>
      </div>

      <h3>魔法般的本質：NPV = 今天立刻落袋的純現金！</h3>
      <p>很多人問：「如果公會帳戶根本沒錢，一個好專案 NPV > 0，我們沒本金做怎麼辦？」</p>
      <p><strong>大掌櫃告訴你一個魔法：</strong>你根本不需要自掏腰包！</p>
      <p>例如一個專案：今天投資 $500，一年後拿回 $550（年利率 8%）。<br>
      • 一年後 $550 的現值為：$550 ÷ 1.08 = <strong>$509.26</strong>。<br>
      • 專案的 NPV = $509.26 - $500 = <strong>+$9.26</strong>。<br>
      如果公司連 $500 都沒有，怎麼辦？你直接走進銀行借 <strong>$509.26</strong>！<br>
      • 今天：借到 $509.26，拿 $500 去投資，<strong>口袋立刻多出 $9.26 現金花用</strong>！<br>
      • 一年後：專案回收 $550，正好拿去還銀行本利和（$509.26 × 1.08 = $550），債務完美歸零！<br>
      <strong>看到了嗎？NPV > 0 就等於今天直接從天上掉下來 $9.26 現金！這就是為什麼所有投資人無論貧富都會支持你做 NPV > 0 的決策！</strong></p>

      <!-- 影印機促銷案例 -->
      <div class="example-card">
        <div class="example-header">
          <span class="example-title">💡 實用生活例題：辦公室影印機的促銷方案</span>
          <span class="example-badge">PROMOTION OFFER</span>
        </div>
        <div class="example-body">
          <div class="example-problem">
            <strong>【題目情境】</strong><br>
            公司要買一台 $9,500 的影印機。廠商推出方案：「你可以今天立刻付 $9,500 現金，或者一年後再付 $10,000。」<br>
            假設銀行無風險利率為 7%。哪一種划算？
          </div>
          <div class="example-solution">
            <strong>【解題思維】</strong><br>
            若選一年後付 $10,000，其現值（成本）為：$10,000 ÷ 1.07 = <strong>$9,345.79</strong>。<br>
            好處是今天省下了 $9,500。<br>
            NPV = 省下的 $9,500 - 延遲付款現值 $9,345.79 = <strong>+$154.21</strong>！<br>
            <strong>結論：</strong>選一年後付錢！因為你今天只要把 $9,345.79 存進銀行生利息，一年後自然會滾成 $10,000 付給廠商，而你的口袋立刻多留下了 <strong>$154.21 現金</strong>！
          </div>
        </div>
      </div>

      <!-- Example 3.5 -->
      <div class="example-card">
        <div class="example-header">
          <span class="example-title">💡 教科書範例 3.5：網站代管業務的三個退場劇本</span>
          <span class="example-badge">EXAMPLE 3.5</span>
        </div>
        <div class="example-body">
          <div class="example-problem">
            <strong>【題目情境】</strong><br>
            你創辦了一家網站代管公司，現在要回學校深造，打算一年內把公司賣掉。買家出價：隨時都可以用 <strong>$200,000</strong> 買下。<br>
            市場利率為 10%。你有三個選擇：<br>
            1. <strong>現在立刻賣：</strong>今天拿 $200,000。<br>
            2. <strong>縮小規模維持一年後再賣：</strong>今天花維護費 $30,000，一年後賺利潤 $50,000 並以 $200,000 賣出。<br>
            3. <strong>聘專業經理人經營一年後再賣：</strong>今天花薪資支出 $50,000，一年後賺利潤 $100,000 並以 $200,000 賣出。<br>
            請問：身為大掌櫃，你該選哪個方案？如果你現在急需 $60,000 當學費生活費，答案會改變嗎？
          </div>
          <div class="example-solution">
            <strong>【解題思維：統一換算 NPV 比較】</strong><br>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>方案</th>
                    <th>今天現金流 (t=0)</th>
                    <th>一年後現金流 (t=1)</th>
                    <th>NPV 計算公式 (r=10%)</th>
                    <th>淨現值 (NPV)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1. 現在立刻賣</td>
                    <td>+$200,000</td>
                    <td>$0</td>
                    <td>$200,000</td>
                    <td><strong>$200,000</strong></td>
                  </tr>
                  <tr>
                    <td>2. 縮小規模</td>
                    <td>-$30,000</td>
                    <td>+$250,000</td>
                    <td>-$30,000 + ($250,000 ÷ 1.10)</td>
                    <td><strong>$197,273</strong></td>
                  </tr>
                  <tr>
                    <td>3. 聘請經理人</td>
                    <td>-$50,000</td>
                    <td>+$300,000</td>
                    <td>-$50,000 + ($300,000 ÷ 1.10)</td>
                    <td><strong>$222,727 (👑 最高)</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <strong>結論：</strong>選<strong>方案 3</strong>！它能為你多創造 $22,727 的財富！<br>
            <strong>就算你今天急需 $60,000 繳學費，也千萬不要選方案 1！</strong><br>
            你只要選擇方案 3，然後今天去跟銀行借 $110,000（其中 $50,000 支應經理人，剩下 $60,000 拿去繳學費）。一年後你賣掉公司收回 $300,000，還給銀行 $121,000 本利和，口袋還剩下 <strong>$179,000</strong>！比方案 1 賣掉拿 $200,000 花掉 $60,000 後剩下的 $140,000 存銀行滾出來的 $154,000，整整多了 <strong>$25,000</strong>！<br>
            <strong>記住原則：永遠先最大化 NPV，再透過借貸滿足個人現金時間偏好！</strong>
          </div>
        </div>
      </div>

      <!-- 互動組件 3：NPV 點金實驗室 -->
      <div class="widget-container">
        <div class="widget-title">🧪 互動實驗 3：NPV 財富點金石（一鍵模擬無本借貸）</div>
        <div class="widget-intro">輸入你的專案參數，看看為什麼 NPV 是「今天天上掉下來的無風險現金」！</div>
        <div class="control-row">
          <div class="control-group">
            <label>今天初期投資成本 ($)</label>
            <input type="number" id="npvCost" value="500" step="50" oninput="calcNPVDemo()">
          </div>
          <div class="control-group">
            <label>一年後預期保證收益 ($)</label>
            <input type="number" id="npvBenefit" value="550" step="50" oninput="calcNPVDemo()">
          </div>
          <div class="control-group">
            <label>市場無風險利率 (%)</label>
            <input type="range" id="npvRate" min="1" max="15" value="8" oninput="calcNPVDemo()">
            <div class="val-display" id="npvRateDisp">8.0%</div>
          </div>
        </div>
        <div class="widget-result-box">
          <div class="result-big" id="npvValue">+$9.26</div>
          <div class="result-desc" id="npvVerdict">好專案！立刻去銀行借 $509.26，付完 $500 成本後，今天口袋淨賺 $9.26 現金！</div>
        </div>
      </div>

    </section>

    <!-- 第四節 -->
    <section id="sec4">
      <h2>🦊 第四節：套利與單一價格法則 (LOOP)</h2>
      <p class="lead"><strong>如果有個地方能讓你「不花自己一毛錢、不冒任何風險、動動手指就刷出無限金幣」，這叫什麼？</strong></p>
      <p>在遊戲裡，這叫作「複製 Bug」；在金融市場裡，這叫作<strong>【<span class="en-term">Arbitrage<small>套利</small></span>】</strong>！</p>

      <h3>1. 什麼是套利？（Arbitrage & Arbitrage Opportunity）</h3>
      <p><strong><span class="en-term">Arbitrage<small>套利</small></span></strong>：利用不同市場的價格落差，在便宜的地方買進、同時在昂貴的地方賣出，從而獲得「零成本、零風險純利潤」的行為。<br>
      這種機會叫做<strong><span class="en-term">Arbitrage Opportunity<small>套利機會</small></span></strong>（天下真正掉下來的免費午餐）。</p>

      <div class="rpg-box">
        <h4>🌟 經典案例：跨國黃金搬磚</h4>
        <p>假設黃金在紐約交易所每盎司賣 <strong>$1,250</strong>，在倫敦交易所每盎司賣 <strong>$1,300</strong>。<br>
        如果你發現了，你會怎麼做？當然是：<strong>在紐約用 $1,250 買進 10,000 盎司，同時在倫敦用 $1,300 賣出 10,000 盎司！</strong><br>
        你瞬間淨賺：10,000 × ($1,300 - $1,250) = <strong>$500,000 美元利潤</strong>！不用承擔任何金價漲跌風險！</p>
      </div>

      <h3>2. 價格如何被推平？單一價格法則誕生！</h3>
      <p>世界上所有精明的獵人和電腦高頻程式都會瞬間看到這個機會：</p>
      <ul>
        <li>大家一窩蜂在紐約<strong>買進</strong>黃金 ➔ 紐約金價被推高 ⬆️</li>
        <li>大家一窩蜂在倫敦<strong>拋售</strong>黃金 ➔ 倫敦金價被砸低 ⬇️</li>
      </ul>
      <p>不到幾秒鐘，兩邊的價格就會在中間（比如 $1,275）拉平！套利機會立刻煙消雲散！</p>

      <div class="law-box">
        <h3>⚖️ 單一價格法則（The Law of One Price, LOOP）</h3>
        <p>在競爭市場中，只要兩項投資機會是<strong>等價的（具有完全相同的現金流）</strong>，而且同時在不同市場上交易，那麼<strong>它們在所有市場上的價格必須完全相同</strong>！</p>
      </div>

      <p>沒有套利機會存在的競爭市場，我們稱為<strong><span class="en-term">Normal Market<small>正常市場</small></span></strong>。在正常市場中，單一價格法則永遠成立！</p>

      <div class="highlight-box">
        <h4>😄 財務學家的經典冷笑話：地上的一百美元</h4>
        <p>一個財務學教授跟學生走在路上，學生看見地上有一張 100 美元鈔票，正要彎腰去撿。<br>
        教授嚴肅地攔住他：「別撿了！天下沒有白吃的午餐。如果那真是一張 100 美元鈔票，早就被別人撿走了！」<br>
        這個笑話雖然在調侃「無套利假設」，但背後的真相是：<strong>因為 100 美元很誘人，所以一旦真有人掉錢，它在地上留存的時間往往短到你根本看不見就被撿走了！市場上的套利機會也是如此！</strong></p>
      </div>

      <!-- 互動組件 4：套利獵人模擬器 -->
      <div class="widget-container">
        <div class="widget-title">🧪 互動實驗 4：跨國黃金套利獵人（Arbitrage Hunter）</div>
        <div class="widget-intro">調整兩地金價，若出現價差，點擊「一鍵搬磚套利」，觀察資金如何瞬間吞噬價差使價格恢復平衡！</div>
        <div class="control-row">
          <div class="control-group">
            <label>紐約金價 ($/盎司)</label>
            <input type="range" id="nyGold" min="1200" max="1350" value="1250" oninput="updateGold()">
            <div class="val-display" id="nyGoldDisp">$1,250</div>
          </div>
          <div class="control-group">
            <label>倫敦金價 ($/盎司)</label>
            <input type="range" id="ldGold" min="1200" max="1350" value="1300" oninput="updateGold()">
            <div class="val-display" id="ldGoldDisp">$1,300</div>
          </div>
        </div>
        <div style="text-align: center; margin: 1rem 0;">
          <button id="arbBtn" onclick="runArbitrage()" style="background: var(--accent); color: white; border: none; padding: 0.7rem 1.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 1rem;">⚡ 執行套利獵殺！</button>
        </div>
        <div class="widget-result-box">
          <div class="result-big" id="arbProfitMsg">價差存在：每盎司現賺 $50！</div>
          <div class="result-desc" id="arbDetailMsg">在紐約以 $1,250 買進，倫敦以 $1,300 放空，立刻無風險獲利！</div>
        </div>
      </div>

    </section>

    <!-- 第五節 -->
    <section id="sec5">
      <h2>📜 第五節：無套利證券定價與分離原則</h2>
      <p class="lead"><strong>既然單一價格法則成立，金融市場裡的債券與股票是怎麼定價的？</strong></p>

      <h3>1. 證券的無套利價格（No-Arbitrage Price）</h3>
      <p>任何一張證券（<span class="en-term">Security<small>金融證券</small></span>），本質上就是一張「在未來某些時間點付錢給你」的合約承諾。根據單一價格法則，它的價格<strong>必須等於自己複製這筆現金流的成本——也就是未來所有現金流的現值（PV）</strong>！</p>

      <div class="formula-banner">
證券無套利價格 Price(Security) = PV(該證券未來承諾支付的所有現金流)
      </div>

      <p>例如：一張承諾一年後支付 $1,000 的無風險政府債券，市場利率為 5%。<br>
      • 它未來的現值是：$1,000 ÷ 1.05 = <strong>$952.38</strong>。<br>
      • 這張債券在正常市場的價格<strong>必須恰好等於 $952.38</strong>！</p>

      <h3>如果債券價格不等於 $952.38 會怎樣？</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>市場異常情況</th>
              <th>套利戰略（空手套白狼）</th>
              <th>今天現金流</th>
              <th>一年後現金流</th>
              <th>市場最終反饋</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>債券被低估（太便宜）</strong><br>市價只要 $940</td>
              <td>1. 買進債券 (-$940)<br>2. 向銀行借 $952.38</td>
              <td>-$940 + $952.38 = <strong style="color:var(--accent);">+$12.38 (純賺)</strong></td>
              <td>債券收到 $1,000<br>還銀行本利和 $1,000<br><strong>淨額 = $0</strong></td>
              <td>買盤湧入，債券價格被推升至 $952.38</td>
            </tr>
            <tr>
              <td><strong>債券被高估（太貴）</strong><br>市價高達 $960</td>
              <td>1. <strong>賣空（<span class="en-term">Short Sale</span>）</strong>賣掉債券 (+$960)<br>2. 把 $952.38 存進銀行</td>
              <td>+$960 - $952.38 = <strong style="color:var(--accent);">+$7.62 (純賺)</strong></td>
              <td>銀行領出 $1,000<br>回補債券支付 $1,000<br><strong>淨額 = $0</strong></td>
              <td>賣盤湧入，債券價格被打壓至 $952.38</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rpg-box">
        <h4>💡 什麼是「賣空」（Short Sale）？</h4>
        <p>如果你手上沒有這張債券，怎麼賣？在金融市場裡，你可以先向別人「借一張債券」拿去市場上賣掉收現金。一年後當債券到期時，你再把領到的 $1,000 收益還給原本的債券持有人。這就是賣空！即使你沒有資產，也能痛擊過高的定價！</p>
      </div>

      <!-- Example 3.6 -->
      <div class="example-card">
        <div class="example-header">
          <span class="example-title">💡 教科書範例 3.6：複合證券定價與隱含利率</span>
          <span class="example-badge">EXAMPLE 3.6</span>
        </div>
        <div class="example-body">
          <div class="example-problem">
            <strong>【題目情境】</strong><br>
            某張證券承諾今天立即支付 $100，並且一年後再支付 $100（無任何風險）。無風險利率為 10%。<br>
            1. 這張證券在今天的無套利公平市價是多少？<br>
            2. 如果市場上有人賣 $195，有何套利機會？<br>
            3. 在什麼利率下，市價 $195 的套利機會才會完全消失？
          </div>
          <div class="example-solution">
            <strong>【解題思維】</strong><br>
            <strong>1. 計算無套利價格：</strong><br>
            今天的 $100 現值就是 $100。<br>
            一年後的 $100 現值 = $100 ÷ 1.10 = $90.91。<br>
            公平無套利市價 = $100 + $90.91 = <strong>$190.91</strong>。<br><br>
            <strong>2. 若市價為 $195：</strong><br>
            證券明顯被高估（定價過高！貴了 $195 - $190.91 = $4.09）。<br>
            <strong>套利招式：</strong>賣出這張證券拿回 $195 現金。其中拿 $100 應付今天的承諾，拿 $90.91 存進年息 10% 的銀行以應付一年後的 $100。你口袋立刻剩下 <strong>$195 - $100 - $90.91 = $4.09 的純套利利潤</strong>！<br><br>
            <strong>3. 反推隱含利率：</strong><br>
            扣掉今天的 $100，相當於買家花了 $95 去買一年後的 $100。<br>
            隱含報酬率 = ($100 - $95) ÷ $95 = <strong>5.26%</strong>。<br>
            只有當無風險利率降至 5.26% 時，$195 才是公平價格。
          </div>
        </div>
      </div>

      <h3>2. 震撼真相：在正常市場中，證券交易的 NPV 永遠為零！</h3>
      <p>買賣股票、買賣債券，NPV 到底是多少？</p>
      <div class="formula-banner">
NPV(買進證券) = PV(未來現金流) - 支付價格 = 0
NPV(賣出證券) = 收到的價格 - PV(放棄的現金流) = 0
      </div>
      <p><strong>這告訴我們一個極度深刻的人生與商業真理：</strong><br>
      金融市場上的買賣本身<strong>「既不創造財富，也不毀滅財富」</strong>（NPV = 0）！它只是一個幫人們調整「時間」與「風險」的天平。<br>
      <strong>真正為世界創造財富的，永遠是實體商業專案（研發新晶片、開新店、改善工廠效率，產生正 NPV）！</strong></p>

      <h3>3. 分離原則（Separation Principle）</h3>
      <div class="law-box">
        <h3>🌱 分離原則（The Separation Principle）</h3>
        <p>在正常市場中，證券交易本身 NPV = 0。因此，<strong>公司的「實體投資決策（是否蓋工廠）」與「財務融資決策（如何籌措資金）」可以完全拆開評估</strong>！只要投資專案本身的 NPV > 0，不管你是自己出資還是發行債券籌資，都不會改變該專案為公司增加的淨財富！</p>
      </div>

      <!-- Example 3.7 -->
      <div class="example-card">
        <div class="example-header">
          <span class="example-title">💡 教科書範例 3.7：投資與融資決策分離</span>
          <span class="example-badge">EXAMPLE 3.7</span>
        </div>
        <div class="example-body">
          <div class="example-problem">
            <strong>【題目情境】</strong><br>
            公司考慮一項投資案：今天投入 <strong>$1,000 萬</strong>，一年後保證收回 <strong>$1,200 萬</strong>。無風險利率為 10%。<br>
            公司考慮發行新證券來募資，承諾一年後給投資人 $550 萬。請問發行證券融資會不會改變專案的 NPV？
          </div>
          <div class="example-solution">
            <strong>【解題思維】</strong><br>
            • <strong>方案 A（純自資）：</strong><br>
            PV(收益) = $1,200 萬 ÷ 1.10 = $1,091 萬。<br>
            NPV = $1,091 萬 - $1,000 萬 = <strong>$91 萬</strong>。<br>
            • <strong>方案 B（發行證券募資）：</strong><br>
            發行證券在今天募得現值 = $550 萬 ÷ 1.10 = $500 萬。<br>
            公司今天只需自己補貼 $500 萬。<br>
            一年後公司賺得 $1,200 萬，但需付給證券投資人 $550 萬，剩餘 $650 萬。<br>
            剩餘現值 = $650 萬 ÷ 1.10 = $591 萬。<br>
            NPV = $591 萬 - $500 萬 = <strong>$91 萬</strong>！<br>
            <strong>完美證明：融資決策完全不影響專案創造的真實價值！</strong>
          </div>
        </div>
      </div>

      <h3>4. 價值加總原則（Value Additivity）</h3>
      <p>如果資產 C 是由資產 A 和資產 B 組合而成的投資組合（<span class="en-term">Portfolio<small>投資組合</small></span>），那麼：</p>
      <div class="formula-banner">
Price(C) = Price(A + B) = Price(A) + Price(B)
      </div>

      <!-- Holbrook 範例 -->
      <div class="example-card">
        <div class="example-header">
          <span class="example-title">💡 原書案例：Holbrook 控股與冰球隊的價值</span>
          <span class="example-badge">VALUE ADDITIVITY</span>
        </div>
        <div class="example-body">
          <div class="example-problem">
            <strong>【題目情境】</strong><br>
            Holbrook Holdings 是一家上市公司，總市值為 <strong>$1.6 億美元</strong>。這家公司名下只有兩樣資產：<br>
            1. 擁有上市公司 Harry’s Hotcakes（哈利鬆餅店）<strong>60% 的股權</strong>（鬆餅店整家市值為 $1.2 億美元）。<br>
            2. 一支未上市的職業冰球隊。<br>
            請問：在單一價格與價值加總法則下，這支冰球隊價值多少錢？
          </div>
          <div class="example-solution">
            <strong>【解題思維】</strong><br>
            整個控股公司 = 60% 鬆餅店 + 冰球隊<br>
            • 60% 鬆餅店價值 = 60% × $1.2 億 = <strong>$7,200 萬美元</strong>。<br>
            • 冰球隊價值 = 總市值 $1.6 億 - $7,200 萬 = <strong>$8,800 萬美元</strong>！<br>
            價值加總原則讓我們能直接用市場價格，秤出非上市資產的真實重量！
          </div>
        </div>
      </div>

      <!-- 2008 次貸海嘯專題 -->
      <div class="highlight-box">
        <h4>🌊 深入專題：2008 年金融海嘯與流動性之謎（Liquidity & Information）</h4>
        <p>單一價格法則的前提是<strong>「競爭市場」</strong>與<strong>「流動性（<span class="en-term">Liquidity</span>）」</strong>——也就是市場上有足夠多的買家和賣家能隨時交易。</p>
        <p>在 2008 年次貸危機中，房貸擔保證券（MBS）暴跌，買家全面消失，市場<strong>「失去流動性（Illiquid）」</strong>。當沒有人報價交易時，價格所乘載的「真實資訊」就中斷了！沒有人知道這些資產到底值多少錢，連鎖引發銀行互不信任、信貸市場全面癱瘓，迫使政府必須注資數千億美元親自下場提供流動性！</p>
      </div>

      <!-- 互動組件 5：價值加總天平 -->
      <div class="widget-container">
        <div class="widget-title">🧪 互動實驗 5：價值加總拼圖秤（Portfolio Valuation）</div>
        <div class="widget-intro">拉動控股公司市值與鬆餅店市值，即時推算冰球隊的客觀估值！</div>
        <div class="control-row">
          <div class="control-group">
            <label>控股公司總市值 ($ 百萬)</label>
            <input type="range" id="holdTotal" min="100" max="300" value="160" oninput="calcAdditivity()">
            <div class="val-display" id="holdTotalDisp">$160M</div>
          </div>
          <div class="control-group">
            <label>鬆餅店整家市值 ($ 百萬)</label>
            <input type="range" id="pancakeTotal" min="50" max="200" value="120" oninput="calcAdditivity()">
            <div class="val-display" id="pancakeTotalDisp">$120M</div>
          </div>
        </div>
        <div class="widget-result-box">
          <div class="result-big" id="hockeyResult">$88.00M</div>
          <div class="result-desc" id="hockeyDesc">冰球隊隱含市價 = $160M - (60% × $120M = $72M) = $88M！符合價值加總定律！</div>
        </div>
      </div>

    </section>

    <!-- 第六節：心智地圖與易混淆概念速查 -->
    <section id="integration">
      <h2>🧩 全章心智地圖與十組易混概念</h2>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>序號</th>
              <th>概念 A</th>
              <th>概念 B</th>
              <th>15歲小孩白話區分秘訣</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><strong>現值 (Present Value, PV)</strong></td>
              <td><strong>終值 (Future Value, FV)</strong></td>
              <td>PV 是把未來的錢「拉回今天」看縮水剩多少；FV 是今天的錢「存到未來」長大變多少。</td>
            </tr>
            <tr>
              <td>2</td>
              <td><strong>利率 (Interest Rate, r)</strong></td>
              <td><strong>折現因子 (Discount Factor)</strong></td>
              <td>利率是時間生錢的膨脹率（如 7%）；折現因子是未來的 1 塊錢在今天值幾毛（1/(1+r) < 1）。</td>
            </tr>
            <tr>
              <td>3</td>
              <td><strong>個人偏好 (Preferences)</strong></td>
              <td><strong>評價原則 (Valuation Principle)</strong></td>
              <td>個人偏好決定你喜不喜歡吃蘋果；評價原則只看拍賣所公定價能換多少現金。</td>
            </tr>
            <tr>
              <td>4</td>
              <td><strong>總效益現值 PV(Benefits)</strong></td>
              <td><strong>淨現值 NPV</strong></td>
              <td>PV(Benefits) 只算賺進來的現值；NPV 必須再<strong>扣掉投入成本</strong>（淨賺的落袋現金）。</td>
            </tr>
            <tr>
              <td>5</td>
              <td><strong>實體投資 (Real Investment)</strong></td>
              <td><strong>金融交易 (Financial Trades)</strong></td>
              <td>實體投資研發開廠會創造財富（NPV > 0）；正常市場買賣金融證券 NPV 永遠等於 0！</td>
            </tr>
            <tr>
              <td>6</td>
              <td><strong>套利 (Arbitrage)</strong></td>
              <td><strong>投機賭博 (Speculation)</strong></td>
              <td>投機是猜明天會漲會跌要承擔風險；套利是同時低買高賣<strong>零風險無本現賺</strong>！</td>
            </tr>
            <tr>
              <td>7</td>
              <td><strong>正常市場 (Normal Market)</strong></td>
              <td><strong>單一價格法則 (LOOP)</strong></td>
              <td>正常市場是指「沒有套利機會」的市場；而單一價格法則是正常市場必然具備的定價規律。</td>
            </tr>
            <tr>
              <td>8</td>
              <td><strong>買進被低估債券</strong></td>
              <td><strong>賣空被高估債券 (Short Sale)</strong></td>
              <td>便宜時「買進債券 + 借錢」；太貴時「借出賣空債券 + 存銀行」。兩者皆能空手套白狼！</td>
            </tr>
            <tr>
              <td>9</td>
              <td><strong>投資決策 (Investment)</strong></td>
              <td><strong>融資決策 (Financing)</strong></td>
              <td>分離原則告訴你：專案能不能賺錢（投資）與你去哪裡借錢（融資）互不干擾，各算各的！</td>
            </tr>
            <tr>
              <td>10</td>
              <td><strong>流動性 (Liquidity)</strong></td>
              <td><strong>價格資訊功能 (Information)</strong></td>
              <td>流動性是買賣隨時有人接單；當失去流動性時，市場價格就會失靈，無法傳遞真實價值。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 第七節：互動隨堂測驗 -->
    <section id="practice">
      <h2>🎯 實戰演練：6 題觀念通關測驗</h2>
      <p>點選你認為正確的選項，系統將即時告訴你對錯與完整思路剖析！</p>

      <!-- 題 1 -->
      <div class="quiz-card">
        <div class="quiz-q">1. （原書 Concept Check 3.1）如果原油在雙向自由交易的競爭市場中交易，一家需要原油煉油的工廠，會給這桶原油不同於一般投資人的價值評估嗎？</div>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q1', '雖然煉油廠需要原油，但它隨時可以按市場價格買賣，其客觀現金價值完全一樣！')">A. 會，因為煉油廠自己要用，對它的價值肯定高於不用的投資人</button>
          <button class="quiz-opt" onclick="checkQuiz(this, true, 'q1', '完全正確！根據評價原則，只要是競爭市場，資產價值完全由市場價格決定，與個別主體的用途或偏好無關！')">B. 不會，因為在競爭市場中，兩者都可以按相同市價買進或賣出，其現金價值完全相同</button>
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q1', '票面標價或主觀效用不能決定競爭市場中的現金價值！')">C. 會，因為煉油廠享有批發折扣，所以價值比較低</button>
        </div>
        <div id="q1-fb" class="quiz-feedback"></div>
      </div>

      <!-- 題 2 -->
      <div class="quiz-card">
        <div class="quiz-q">2. （原書 Concept Check 3.2）如果市場無風險年利率 r 上升，承諾在「一年後支付 100 美元」在今天的現值 (PV) 會發生什麼變化？</div>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q2', '公式為 PV = FV / (1 + r)，分母變大，整體數值會變小！')">A. 現值上升</button>
          <button class="quiz-opt" onclick="checkQuiz(this, true, 'q2', '賓果！現值 PV = 100 / (1 + r)。當利率 r 提高時，未來的錢縮水得更厲害（分母變大），所以今天折現後的現值變小！')">B. 現值下降</button>
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q2', '利率是時間的折現率，利率變動必定會影響現值！')">C. 現值保持不變</button>
        </div>
        <div id="q2-fb" class="quiz-feedback"></div>
      </div>

      <!-- 題 3 -->
      <div class="quiz-card">
        <div class="quiz-q">3. （原書 Concept Check 3.3）如果你今天手頭非常緊，急需 5 萬美元現金付學費，面對幾個投資方案，你應該：</div>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q3', '萬萬不可！不要為了解渴喝毒藥，選 NPV 低的方案會讓你的總財富永久性縮水！')">A. 放棄 NPV 法則，優先挑選今天能立刻拿到最多現金的方案</button>
          <button class="quiz-opt" onclick="checkQuiz(this, true, 'q3', '極度正確！NPV 代表淨財富最大化。先選 NPV 最高的方案，再透過向銀行借貸滿足今天的急需，總財富依然最高！')">B. 仍然挑選 NPV 最高的方案，然後透過銀行借貸將未來的現金流挪移到今天使用</button>
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q3', 'NPV 規則在任何現金流需求下都是普適的！')">C. 拒絕所有方案，因為沒錢的人不能投資</button>
        </div>
        <div id="q3-fb" class="quiz-feedback"></div>
      </div>

      <!-- 題 4 -->
      <div class="quiz-card">
        <div class="quiz-q">4. （原書 Concept Check 3.4）在競爭市場中，當投資人發現套利機會並進場搶著套利時，市場價格會發生什麼事？</div>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q4', '套利者是在便宜處買進、昂貴處賣出，價差會縮小而非擴大！')">A. 便宜的市場會變得更便宜，昂貴的市場變得更昂貴</button>
          <button class="quiz-opt" onclick="checkQuiz(this, true, 'q4', '太棒了！便宜處的買盤推升價格，昂貴處的賣盤打壓價格，直到兩者價格完全相等，套利空間消失！')">B. 便宜市場的價格被買盤推高，昂貴市場的價格被拋盤打低，直到兩者完全相等</button>
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q4', '市場具備自我修復機制，不需要政府出手，套利者就會迅速消除價差。')">C. 價格完全不動，直到交易所官方宣布停牌</button>
        </div>
        <div id="q4-fb" class="quiz-feedback"></div>
      </div>

      <!-- 題 5 -->
      <div class="quiz-card">
        <div class="quiz-q">5. （原書 Scan 8 核心洞見）在沒有摩擦的正常金融市場中，買賣一檔公允定價的證券，其 NPV 等於多少？</div>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q5', '若 NPV > 0 就等於天上掉下無風險免費午餐（套利機會），正常市場不會存在！')">A. 大於 0</button>
          <button class="quiz-opt" onclick="checkQuiz(this, true, 'q5', '滿分理解！在正常市場中，證券市價恰好等於未來現金流的折現值，所以成本 = 效益，NPV 永遠為零！金融交易本身不創造實體財富。')">B. 恰好等於 0</button>
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q5', '若是負數，理性投資人就不會進場自願交易！')">C. 小於 0</button>
        </div>
        <div id="q5-fb" class="quiz-feedback"></div>
      </div>

      <!-- 題 6 -->
      <div class="quiz-card">
        <div class="quiz-q">6. （原書分離原則）根據 Separation Principle，當我們評估要不要投資一個蓋新廠房的專案時：</div>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q6', '分離原則正是證明了兩者無關，不需綁在一起！')">A. 必須先確定公司是發債還是發行新股，否則根本無法計算專案好壞</button>
          <button class="quiz-opt" onclick="checkQuiz(this, true, 'q6', '完全正確！因為金融交易在正常市場中是零 NPV，籌資方式不創造也不毀滅價值，專案好壞完全取決於實體專案自身的 NPV！')">B. 可以完全獨立於公司的融資方式來評估專案本身的 NPV</button>
          <button class="quiz-opt" onclick="checkQuiz(this, false, 'q6', '只要借貸是公平定價，融資並不會吃掉實體專案的 NPV。')">C. 如果用借錢的方式融資，專案的 NPV 一定會變成負數</button>
        </div>
        <div id="q6-fb" class="quiz-feedback"></div>
      </div>

    </section>

    <!-- 術語字典庫 -->
    <section id="glossary">
      <h2>📚 必背英漢專業術語字典庫</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>英文專有名詞</th>
              <th>繁體中文</th>
              <th>15歲極簡秒懂比喻</th>
              <th>核心公式 / 關聯原則</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>The Valuation Principle</strong></td>
              <td>評價原則</td>
              <td>不管老闆喜不喜歡，以市場拍賣所公定價為準</td>
              <td>價值 = 競爭市場價格</td>
            </tr>
            <tr>
              <td><strong>Competitive Market</strong></td>
              <td>競爭市場</td>
              <td>買進價跟賣出價完全相同的透明市集</td>
              <td>無個人偏見影響</td>
            </tr>
            <tr>
              <td><strong>Time Value of Money (TVM)</strong></td>
              <td>貨幣時間價值</td>
              <td>今天的錢大於未來的錢，時間會讓金幣生利息</td>
              <td>(1 + r) 是穿越時間的匯率</td>
            </tr>
            <tr>
              <td><strong>Risk-Free Interest Rate (r<sub>f</sub>)</strong></td>
              <td>無風險利率</td>
              <td>絕對不會倒閉的時光穿梭匯率</td>
              <td>銀行存貸基準</td>
            </tr>
            <tr>
              <td><strong>Present Value (PV)</strong></td>
              <td>現值</td>
              <td>把未來的金幣拉回今天口袋值多少</td>
              <td>PV = FV ÷ (1 + r)</td>
            </tr>
            <tr>
              <td><strong>Future Value (FV)</strong></td>
              <td>終值</td>
              <td>今天的金幣放在未來會長大成多少</td>
              <td>FV = PV × (1 + r)</td>
            </tr>
            <tr>
              <td><strong>Discount Factor</strong></td>
              <td>折現因子</td>
              <td>一年後的一塊錢在今天相當於幾毛錢</td>
              <td>1 ÷ (1 + r)</td>
            </tr>
            <tr>
              <td><strong>Net Present Value (NPV)</strong></td>
              <td>淨現值</td>
              <td>扣除所有成本後，今天立刻多放進口袋的現金</td>
              <td>NPV = PV(效益) - PV(成本)</td>
            </tr>
            <tr>
              <td><strong>Arbitrage</strong></td>
              <td>套利</td>
              <td>遊戲中零風險、零本金的合法刷錢機制</td>
              <td>低買高賣，NPV > 0</td>
            </tr>
            <tr>
              <td><strong>Law of One Price (LOOP)</strong></td>
              <td>單一價格法則</td>
              <td>一模一樣的兩樣東西在競爭市場必只有一個價</td>
              <td>無套利均衡的基石</td>
            </tr>
            <tr>
              <td><strong>No-Arbitrage Price</strong></td>
              <td>無套利價格</td>
              <td>金融證券未來所有現金流折現回今天的總和</td>
              <td>Price = PV(All Future Cash Flows)</td>
            </tr>
            <tr>
              <td><strong>Short Sale</strong></td>
              <td>賣空（融券放空）</td>
              <td>手上沒貨借來賣，太貴時用來痛擊高價的招式</td>
              <td>先借先賣，未來歸還</td>
            </tr>
            <tr>
              <td><strong>Separation Principle</strong></td>
              <td>分離原則</td>
              <td>做實體投資（蓋廠）跟怎麼借錢（融資）分開評估</td>
              <td>金融交易 NPV = 0</td>
            </tr>
            <tr>
              <td><strong>Value Additivity</strong></td>
              <td>價值加總性</td>
              <td>組合包的價格等於各個單品價格直接相加</td>
              <td>Price(A+B) = Price(A) + Price(B)</td>
            </tr>
            <tr>
              <td><strong>Liquidity</strong></td>
              <td>流動性</td>
              <td>隨時想買就有人賣、想賣就有人買的順暢度</td>
              <td>失去流動性則價格資訊功能崩潰</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  </main>
</div>

<!-- 互動實驗 JS 邏輯腳本 -->
<script>
  // 實驗 1：門票計算機
  function calcTickets() {
    const rock = parseInt(document.getElementById('rockPrice').value);
    const idol = parseInt(document.getElementById('idolPrice').value);
    document.getElementById('rockPriceDisp').innerText = '$' + rock;
    document.getElementById('idolPriceDisp').innerText = '$' + idol;

    const rockTotal = 4 * rock;
    const idolTotal = 2 * idol;

    const advise = document.getElementById('ticketAdvise');
    const detail = document.getElementById('ticketDetail');

    if (rockTotal > idolTotal) {
      const diff = rockTotal - idolTotal;
      advise.innerText = '👑 毫無疑問：選搖滾門票 (A)！';
      advise.style.color = '#196b58';
      detail.innerHTML = `4 張搖滾票總市價 <strong>$${rockTotal}</strong>，2 張偶像票總市價 <strong>$${idolTotal}</strong>。<br>賣掉搖滾票去買偶像票，你還現賺 <strong>$${diff} 現金</strong> 買 T-shirt 或大吃一頓！`;
    } else if (rockTotal < idolTotal) {
      const diff = idolTotal - rockTotal;
      advise.innerText = '⭐ 此時應改選：偶像門票 (B)！';
      advise.style.color = '#d48b28';
      detail.innerHTML = `2 張偶像票總市價 <strong>$${idolTotal}</strong> 超過了搖滾票的 <strong>$${rockTotal}</strong>。<br>此時選偶像票更值錢（多值 $${diff}）！評價原則就是永遠跟隨客觀總市價！`;
    } else {
      advise.innerText = '⚖️ 兩者市場現金價值完全相等 ($' + rockTotal + ')';
      advise.style.color = '#5a6e85';
      detail.innerHTML = `兩者總市價完全相同，此時選哪一個都不影響公會總財富！`;
    }
  }

  // 實驗 2：TVM 任意門計算機
  function calcTVM() {
    const fv = parseFloat(document.getElementById('tvmFV').value) || 0;
    const rate = parseFloat(document.getElementById('tvmRate').value) / 100;
    document.getElementById('tvmRateDisp').innerText = (rate * 100).toFixed(1) + '%';

    const pv = fv / (1 + rate);
    const df = 1 / (1 + rate);

    document.getElementById('tvmPVResult').innerText = '$' + pv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('tvmPVDesc').innerHTML = `折現因子 (Discount Factor) 為 <strong>${df.toFixed(4)}</strong>。<br>相當於你今天只要在年利率 ${(rate*100).toFixed(1)}% 的銀行存入 $${pv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}，一年後就正好變成 $${fv.toLocaleString()}！`;
  }

  // 實驗 3：NPV 點金實驗室
  function calcNPVDemo() {
    const cost = parseFloat(document.getElementById('npvCost').value) || 0;
    const benefit = parseFloat(document.getElementById('npvBenefit').value) || 0;
    const rate = parseFloat(document.getElementById('npvRate').value) / 100;
    document.getElementById('npvRateDisp').innerText = (rate * 100).toFixed(1) + '%';

    const pvBenefit = benefit / (1 + rate);
    const npv = pvBenefit - cost;

    const valElem = document.getElementById('npvValue');
    const descElem = document.getElementById('npvVerdict');

    if (npv > 0) {
      valElem.innerText = '+$' + npv.toFixed(2);
      valElem.style.color = '#196b58';
      descElem.innerHTML = `🎉 <strong>大好專案（Accept）！</strong> 效益現值為 $${pvBenefit.toFixed(2)}，扣掉成本現值 $${cost.toFixed(2)}。<br>💡 <strong>無本套現驗證：</strong> 去銀行借 $${pvBenefit.toFixed(2)}，投入成本 $${cost.toFixed(2)} 後，<strong>今天口袋立刻落袋 $${npv.toFixed(2)} 純現金</strong>！一年後用回收的 $${benefit.toFixed(2)} 剛好還清貸款！`;
    } else if (npv < 0) {
      valElem.innerText = '-$' + Math.abs(npv).toFixed(2);
      valElem.style.color = '#c0392b';
      descElem.innerHTML = `⚠️ <strong>賠錢貨專案（Reject）！</strong> 做這個專案等於把 $${Math.abs(npv).toFixed(2)} 倒進馬桶裡。直接把錢放銀行賺 ${(rate*100).toFixed(1)}% 利息還賺得比較多！`;
    } else {
      valElem.innerText = '$0.00';
      valElem.style.color = '#5a6e85';
      descElem.innerHTML = `⚖️ <strong>剛好打平（Break-even）</strong>：收益現值正好抵銷成本，做與不做對公會總財富沒有增減。`;
    }
  }

  // 實驗 4：套利獵人
  function updateGold() {
    const ny = parseInt(document.getElementById('nyGold').value);
    const ld = parseInt(document.getElementById('ldGold').value);
    document.getElementById('nyGoldDisp').innerText = '$' + ny.toLocaleString();
    document.getElementById('ldGoldDisp').innerText = '$' + ld.toLocaleString();

    const profitMsg = document.getElementById('arbProfitMsg');
    const detailMsg = document.getElementById('arbDetailMsg');

    if (ny < ld) {
      const diff = ld - ny;
      profitMsg.innerText = `價差存在：每盎司現賺 $${diff}！`;
      profitMsg.style.color = '#196b58';
      detailMsg.innerText = `在紐約以 $${ny} 買進，同時在倫敦以 $${ld} 賣出，零成本、零風險純套利！`;
    } else if (ny > ld) {
      const diff = ny - ld;
      profitMsg.innerText = `反向價差：每盎司現賺 $${diff}！`;
      profitMsg.style.color = '#196b58';
      detailMsg.innerText = `在倫敦以 $${ld} 買進，同時在紐約以 $${ny} 賣出，零成本、零風險純套利！`;
    } else {
      profitMsg.innerText = '⚖️ 單一價格成立（無套利機會）';
      profitMsg.style.color = '#5a6e85';
      detailMsg.innerText = `紐約與倫敦金價完全一致 ($${ny})，市場處於「正常市場均衡狀態」。`;
    }
  }

  function runArbitrage() {
    let ny = parseInt(document.getElementById('nyGold').value);
    let ld = parseInt(document.getElementById('ldGold').value);
    if (ny === ld) {
      alert('兩邊價格已經完全一樣了，沒有套利空間囉！');
      return;
    }
    const avg = Math.round((ny + ld) / 2);
    document.getElementById('nyGold').value = avg;
    document.getElementById('ldGold').value = avg;
    updateGold();
    alert(`⚡ 搬磚成功！\n大量套利買盤推升了低價市場，大量拋盤打壓了高價市場！\n兩邊價格瞬間在 $${avg} 拉平，單一價格法則 (LOOP) 再次完美捍衛了世界的和平！`);
  }

  // 實驗 5：價值加總計算
  function calcAdditivity() {
    const hold = parseFloat(document.getElementById('holdTotal').value);
    const pancake = parseFloat(document.getElementById('pancakeTotal').value);
    document.getElementById('holdTotalDisp').innerText = '$' + hold + 'M';
    document.getElementById('pancakeTotalDisp').innerText = '$' + pancake + 'M';

    const pancakeStake = pancake * 0.6;
    const hockey = hold - pancakeStake;

    document.getElementById('hockeyResult').innerText = '$' + hockey.toFixed(2) + 'M';
    document.getElementById('hockeyDesc').innerHTML = `60% 鬆餅店股權價值 = 60% × $${pancake}M = $${pancakeStake.toFixed(2)}M。<br>根據價值加總法則：冰球隊市價 = 控股公司總市值 ($${hold}M) - 鬆餅店股權 ($${pancakeStake.toFixed(2)}M) = <strong>$${hockey.toFixed(2)}M</strong>！`;
  }

  // 測驗檢查函數
  function checkQuiz(btn, isCorrect, qId, explanation) {
    const fb = document.getElementById(qId + '-fb');
    fb.style.display = 'block';
    if (isCorrect) {
      fb.className = 'quiz-feedback feedback-correct';
      fb.innerHTML = '<strong>✅ 答對了！恭喜大掌櫃！</strong><br>' + explanation;
    } else {
      fb.className = 'quiz-feedback feedback-wrong';
      fb.innerHTML = '<strong>❌ 哎呀，選錯囉！再想想看～</strong><br>' + explanation;
    }
  }
</script>

</body>
</html>
'''

output_path = r"收件苗圃\學習講義合輯\Ch03_財務決策與單一價格法則_學習講義.html"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Handout successfully generated at: {output_path}")
print(f"File size: {os.path.getsize(output_path)} bytes")
