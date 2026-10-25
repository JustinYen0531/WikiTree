# -*- coding: utf-8 -*-
"""
Generate Chapter 3 Handout HTML v2.0:
- Preserves all v1.0 sections, widgets, styles, and concepts.
- Adds Evolution Log / Changelog (v1.0 -> v2.0).
- Adds Part 8: Comprehensive Textbook Problems 1-18 (Non-Excel) with 15-yo guild arborist tone & rigorous math.
- Adds Part 9: Further Academic Readings & Key Terms Matrix.
- Outputs to Workspace, Documents, and Desktop folders.
"""
import os
import shutil

html_template = r'''<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chapter 3 財務決策與單一價格法則｜冒險者公會的首席大掌櫃修煉秘笈 [v2.0 增補演化版]</title>
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
    .version-tag {
      display: inline-block;
      background: #d48b28;
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
      color: #d1ebe3;
      max-width: 820px;
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
      grid-template-columns: 280px minmax(0, 1fr);
      gap: clamp(2rem, 4vw, 5rem);
      max-width: 1540px;
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
      font-size: 0.88rem;
      padding: 0.38rem 0.55rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      line-height: 1.4;
      margin-bottom: 0.2rem;
    }
    .toc a:hover {
      color: var(--accent);
      background: var(--accent-light);
      padding-left: 0.8rem;
    }
    .toc .toc-sub {
      padding-left: 1.4rem;
      font-size: 0.82rem;
      color: #728498;
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

    /* 原書 Example / Problem 詳解卡片 */
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
    .example-problem .orig-en {
      font-size: 0.92rem;
      color: #4b635c;
      font-style: italic;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px dashed #d5dedb;
    }
    .example-solution {
      padding: 0.5rem 0.2rem;
    }

    /* 演化歷史卡片 (Evolution Card) */
    .evolution-card {
      background: #fdfaf3;
      border: 2px dashed #e8c68a;
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .evolution-card h3 {
      margin-top: 0;
      color: #8c5b13;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .evolution-timeline {
      list-style: none;
      padding-left: 0.5rem;
      position: relative;
    }
    .evolution-timeline li {
      position: relative;
      padding-left: 1.5rem;
      margin-bottom: 1rem;
    }
    .evolution-timeline li::before {
      content: "●";
      position: absolute;
      left: 0;
      color: var(--gold);
      font-size: 1.1rem;
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

    /* 摺疊按鈕 / 詳細解答 */
    details.solution-details {
      margin-top: 1rem;
      background: #f4fbf7;
      border: 1px solid #c8e4d8;
      border-radius: 8px;
      padding: 0.8rem 1.2rem;
    }
    details.solution-details summary {
      cursor: pointer;
      font-weight: 700;
      color: var(--accent-dark);
      outline: none;
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
  <!-- 數學公式渲染雙保險：MathJax 3 + 離線優雅降級 Fallback -->
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
        processEscapes: true,
        processEnvironments: true
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
      }
    };
  
  // ==========================================
  // Chapter 3 期中模擬試卷 批改與略過交互邏輯
  // ==========================================
  const ch3McqAnswers = {
    c3_mcq1: "B",
    c3_mcq2: "B",
    c3_mcq3: "B",
    c3_mcq4: "B",
    c3_mcq5: "A",
    c3_mcq6: "B",
    c3_mcq7: "B",
    c3_mcq8: "B",
    c3_mcq9: "C",
    c3_mcq10: "C"
  };

  function checkAllCh03ExamAnswers() {
    let score = 0;

    // 1. 檢查 MCQ 1 ~ 10
    for (let i = 1; i <= 10; i++) {
      const name = "c3_mcq" + i;
      const radios = document.getElementsByName(name);
      let selected = "";
      for (let r of radios) {
        if (r.checked) {
          selected = r.value;
          break;
        }
      }
      const box = document.getElementById("ch3-mcq-box-" + i);
      if (selected === ch3McqAnswers[name]) {
        score += 5;
        if (box) box.style.border = "2px solid #16a34a";
      } else {
        if (box) box.style.border = "2px solid #dc2626";
      }
    }

    // 2. 檢查填充題 1 ~ 10
    // Blank 1: 10476.19, 接受
    const fb1 = (document.getElementById('c3_fb1').value || '').replace(/[+,\$]/g, '').trim();
    const fb1_act = (document.getElementById('c3_fb1_act').value || '').trim();
    if ((fb1.startsWith("10476") || fb1.startsWith("10,476")) && (fb1_act.includes("接受") || fb1_act.toLowerCase().includes("accept"))) {
      score += 5;
      document.getElementById('ch3-blank-box-1').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-1').style.border = "2px solid #dc2626";
    }

    // Blank 2: 1.1216 (或 1.1215)
    const fb2 = (document.getElementById('c3_fb2').value || '').trim();
    if (fb2.startsWith("1.1215") || fb2.startsWith("1.1216")) {
      score += 5;
      document.getElementById('ch3-blank-box-2').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-2').style.border = "2px solid #dc2626";
    }

    // Blank 3: 1000.40 / 1000.4
    const fb3 = (document.getElementById('c3_fb3').value || '').replace(/[,]/g, '').trim();
    if (fb3.startsWith("1000.4") || fb3.startsWith("1,000.4")) {
      score += 5;
      document.getElementById('ch3-blank-box-3').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-3').style.border = "2px solid #dc2626";
    }

    // Blank 4: 100
    const fb4 = (document.getElementById('c3_fb4').value || '').trim();
    if (fb4.startsWith("100")) {
      score += 5;
      document.getElementById('ch3-blank-box-4').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-4').style.border = "2px solid #dc2626";
    }

    // Blank 5: Law of One Price / LOOP
    const fb5 = (document.getElementById('c3_fb5').value || '').trim().toLowerCase();
    if (fb5.includes("law of one price") || fb5.includes("單一價格") || fb5.includes("loop")) {
      score += 5;
      document.getElementById('ch3-blank-box-5').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-5').style.border = "2px solid #dc2626";
    }

    // Blank 6: 風險 ｜ 資本 / 本金
    const fb6_1 = (document.getElementById('c3_fb6_1').value || '').trim();
    const fb6_2 = (document.getElementById('c3_fb6_2').value || '').trim();
    if ((fb6_1.includes("風險") || fb6_1.toLowerCase().includes("risk")) && (fb6_2.includes("資") || fb6_2.includes("本") || fb6_2.toLowerCase().includes("capital"))) {
      score += 5;
      document.getElementById('ch3-blank-box-6').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-6').style.border = "2px solid #dc2626";
    }

    // Blank 7: 複製組合 / Replicating
    const fb7 = (document.getElementById('c3_fb7').value || '').trim().toLowerCase();
    if (fb7.includes("複製") || fb7.includes("replicat")) {
      score += 5;
      document.getElementById('ch3-blank-box-7').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-7').style.border = "2px solid #dc2626";
    }

    // Blank 8: 0.9615
    const fb8 = (document.getElementById('c3_fb8').value || '').trim();
    if (fb8.startsWith("0.9615")) {
      score += 5;
      document.getElementById('ch3-blank-box-8').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-8').style.border = "2px solid #dc2626";
    }

    // Blank 9: 費雪分離 / 分離原則 / Fisher
    const fb9 = (document.getElementById('c3_fb9').value || '').trim().toLowerCase();
    if (fb9.includes("費雪") || fb9.includes("分離") || fb9.includes("fisher") || fb9.includes("separation")) {
      score += 5;
      document.getElementById('ch3-blank-box-9').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-9').style.border = "2px solid #dc2626";
    }

    // Blank 10: NPV > 0 / 大於0
    const fb10 = (document.getElementById('c3_fb10').value || '').replace(/\s+/g, '').toLowerCase();
    if (fb10.includes(">0") || fb10.includes("大於0") || fb10.includes("大于0") || fb10.includes("大於零") || fb10.includes("大于零")) {
      score += 5;
      document.getElementById('ch3-blank-box-10').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-10').style.border = "2px solid #dc2626";
    }

    // 評定段位
    const banner = document.getElementById("ch03-exam-score-banner");
    banner.style.display = "block";
    let rank = "";
    let rankColor = "";
    let comment = "";

    if (score >= 90) {
      rank = "👑 傳奇公會首席神掌櫃 (Legendary Arch-Arborist)";
      rankColor = "#15803d";
      banner.style.background = "#dcfce7";
      banner.style.border = "2px solid #86efac";
      comment = "震撼人心的表現！你對套利連環計、單一價格法則與價值加總性的理解已登峰造極，期中考勢必橫掃全場！";
    } else if (score >= 75) {
      rank = "⚔️ 皇家特許理財魔導師 (Royal Chartered Arborist)";
      rankColor = "#0369a1";
      banner.style.background = "#e0f2fe";
      banner.style.border = "2px solid #7dd3fc";
      comment = "優秀的定價功底！核心公式與無套利邏輯非常扎實，稍微注意多期債券與利率平價的小數點精度即可封神！";
    } else if (score >= 60) {
      rank = "🛡️ 資深行會管事 (Senior Guild Officer)";
      rankColor = "#d97706";
      banner.style.background = "#fef3c7";
      banner.style.border = "2px solid #fde68a";
      comment = "順利通過考核！但在無本借貸套現或複製組合的構造細節上略有猶豫，建議回顧前文的黃金期現貨套利實例！";
    } else {
      rank = "🌱 銅卡見習學徒 (Bronze Novice Apprentice)";
      rankColor = "#b91c1c";
      banner.style.background = "#fee2e2";
      banner.style.border = "2px solid #fca5a5";
      comment = "警報響起！基礎時間折現與無套利邏輯尚未融會貫通（紅框為失誤題目）。請點擊略過或展開思路詳讀考官推導！";
    }

    banner.innerHTML = `
      <div style="font-size:1.3rem; color:${rankColor}; margin-bottom:0.4rem;">
        試煉總得分：<strong>${score} / 100 分</strong> ｜ 榮譽封號：<strong>${rank}</strong>
      </div>
      <div style="font-size:0.95rem; color:#334155;">
        ${comment} (綠框標註為完全正確，紅框標註為答錯或未填，可點擊「展開考官解剖思路」查看詳盡公式演算！)
      </div>
    `;

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function skipAndRevealAllCh03Answers() {
    // 1. 自動勾選 MCQ 1 ~ 10 正確選項並展開思路
    for (let i = 1; i <= 10; i++) {
      const name = "c3_mcq" + i;
      const correctVal = ch3McqAnswers[name];
      const radios = document.getElementsByName(name);
      for (let r of radios) {
        if (r.value === correctVal) {
          r.checked = true;
        }
      }
      const box = document.getElementById("ch3-mcq-box-" + i);
      if (box) box.style.border = "2px solid #8b5cf6";

      const sol = document.getElementById("ch3-sol-mcq-" + i);
      if (sol) {
        sol.open = true;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([sol]);
        }
      }
    }

    // 2. 自動填入填充題 1 ~ 10 標準答案並展開思路
    const fills = {
      c3_fb1: "+10,476.19",
      c3_fb1_act: "接受",
      c3_fb2: "1.1216",
      c3_fb3: "1,000.40",
      c3_fb4: "100",
      c3_fb5: "Law of One Price",
      c3_fb6_1: "風險",
      c3_fb6_2: "資本",
      c3_fb7: "複製投資組合 (Replicating Portfolio)",
      c3_fb8: "0.9615",
      c3_fb9: "費雪分離定理 (Fisher Separation Theorem)",
      c3_fb10: "NPV > 0"
    };

    for (let id in fills) {
      const el = document.getElementById(id);
      if (el) {
        el.value = fills[id];
        el.style.backgroundColor = "#ede9fe";
        el.style.color = "#5b21b6";
      }
    }

    for (let j = 1; j <= 10; j++) {
      const box = document.getElementById("ch3-blank-box-" + j);
      if (box) box.style.border = "2px solid #8b5cf6";

      const sol = document.getElementById("ch3-sol-fb-" + j);
      if (sol) {
        sol.open = true;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([sol]);
        }
      }
    }

    // 3. 顯示橫幅提示
    const banner = document.getElementById("ch03-exam-score-banner");
    banner.style.display = "block";
    banner.style.background = "#f5f3ff";
    banner.style.border = "2px solid #8b5cf6";
    banner.innerHTML = `
      <div style="font-size:1.25rem; color:#6d28d9; margin-bottom:0.4rem;">
        ⏩ <strong>已啟動快捷模式：全卷標準答案已填入，解剖思路已全數為您展開！</strong>
      </div>
      <div style="font-size:0.95rem; color:#475569;">
        理解知識永遠比單純的考試分數更重要！您可以直接逐題研讀下方的詳細數學公式推導、套利四步表與法理背景，快速吸收 Chapter 3 的核心期中精華！
      </div>
    `;

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

</script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
  // ==========================================
  // Chapter 3 期中模擬試卷 批改與略過交互邏輯
  // ==========================================
  const ch3McqAnswers = {
    c3_mcq1: "B",
    c3_mcq2: "B",
    c3_mcq3: "B",
    c3_mcq4: "B",
    c3_mcq5: "A",
    c3_mcq6: "B",
    c3_mcq7: "B",
    c3_mcq8: "B",
    c3_mcq9: "C",
    c3_mcq10: "C"
  };

  function checkAllCh03ExamAnswers() {
    let score = 0;

    // 1. 檢查 MCQ 1 ~ 10
    for (let i = 1; i <= 10; i++) {
      const name = "c3_mcq" + i;
      const radios = document.getElementsByName(name);
      let selected = "";
      for (let r of radios) {
        if (r.checked) {
          selected = r.value;
          break;
        }
      }
      const box = document.getElementById("ch3-mcq-box-" + i);
      if (selected === ch3McqAnswers[name]) {
        score += 5;
        if (box) box.style.border = "2px solid #16a34a";
      } else {
        if (box) box.style.border = "2px solid #dc2626";
      }
    }

    // 2. 檢查填充題 1 ~ 10
    // Blank 1: 10476.19, 接受
    const fb1 = (document.getElementById('c3_fb1').value || '').replace(/[+,\$]/g, '').trim();
    const fb1_act = (document.getElementById('c3_fb1_act').value || '').trim();
    if ((fb1.startsWith("10476") || fb1.startsWith("10,476")) && (fb1_act.includes("接受") || fb1_act.toLowerCase().includes("accept"))) {
      score += 5;
      document.getElementById('ch3-blank-box-1').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-1').style.border = "2px solid #dc2626";
    }

    // Blank 2: 1.1216 (或 1.1215)
    const fb2 = (document.getElementById('c3_fb2').value || '').trim();
    if (fb2.startsWith("1.1215") || fb2.startsWith("1.1216")) {
      score += 5;
      document.getElementById('ch3-blank-box-2').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-2').style.border = "2px solid #dc2626";
    }

    // Blank 3: 1000.40 / 1000.4
    const fb3 = (document.getElementById('c3_fb3').value || '').replace(/[,]/g, '').trim();
    if (fb3.startsWith("1000.4") || fb3.startsWith("1,000.4")) {
      score += 5;
      document.getElementById('ch3-blank-box-3').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-3').style.border = "2px solid #dc2626";
    }

    // Blank 4: 100
    const fb4 = (document.getElementById('c3_fb4').value || '').trim();
    if (fb4.startsWith("100")) {
      score += 5;
      document.getElementById('ch3-blank-box-4').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-4').style.border = "2px solid #dc2626";
    }

    // Blank 5: Law of One Price / LOOP
    const fb5 = (document.getElementById('c3_fb5').value || '').trim().toLowerCase();
    if (fb5.includes("law of one price") || fb5.includes("單一價格") || fb5.includes("loop")) {
      score += 5;
      document.getElementById('ch3-blank-box-5').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-5').style.border = "2px solid #dc2626";
    }

    // Blank 6: 風險 ｜ 資本 / 本金
    const fb6_1 = (document.getElementById('c3_fb6_1').value || '').trim();
    const fb6_2 = (document.getElementById('c3_fb6_2').value || '').trim();
    if ((fb6_1.includes("風險") || fb6_1.toLowerCase().includes("risk")) && (fb6_2.includes("資") || fb6_2.includes("本") || fb6_2.toLowerCase().includes("capital"))) {
      score += 5;
      document.getElementById('ch3-blank-box-6').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-6').style.border = "2px solid #dc2626";
    }

    // Blank 7: 複製組合 / Replicating
    const fb7 = (document.getElementById('c3_fb7').value || '').trim().toLowerCase();
    if (fb7.includes("複製") || fb7.includes("replicat")) {
      score += 5;
      document.getElementById('ch3-blank-box-7').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-7').style.border = "2px solid #dc2626";
    }

    // Blank 8: 0.9615
    const fb8 = (document.getElementById('c3_fb8').value || '').trim();
    if (fb8.startsWith("0.9615")) {
      score += 5;
      document.getElementById('ch3-blank-box-8').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-8').style.border = "2px solid #dc2626";
    }

    // Blank 9: 費雪分離 / 分離原則 / Fisher
    const fb9 = (document.getElementById('c3_fb9').value || '').trim().toLowerCase();
    if (fb9.includes("費雪") || fb9.includes("分離") || fb9.includes("fisher") || fb9.includes("separation")) {
      score += 5;
      document.getElementById('ch3-blank-box-9').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-9').style.border = "2px solid #dc2626";
    }

    // Blank 10: NPV > 0 / 大於0
    const fb10 = (document.getElementById('c3_fb10').value || '').replace(/\s+/g, '').toLowerCase();
    if (fb10.includes(">0") || fb10.includes("大於0") || fb10.includes("大于0") || fb10.includes("大於零") || fb10.includes("大于零")) {
      score += 5;
      document.getElementById('ch3-blank-box-10').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-10').style.border = "2px solid #dc2626";
    }

    // 評定段位
    const banner = document.getElementById("ch03-exam-score-banner");
    banner.style.display = "block";
    let rank = "";
    let rankColor = "";
    let comment = "";

    if (score >= 90) {
      rank = "👑 傳奇公會首席神掌櫃 (Legendary Arch-Arborist)";
      rankColor = "#15803d";
      banner.style.background = "#dcfce7";
      banner.style.border = "2px solid #86efac";
      comment = "震撼人心的表現！你對套利連環計、單一價格法則與價值加總性的理解已登峰造極，期中考勢必橫掃全場！";
    } else if (score >= 75) {
      rank = "⚔️ 皇家特許理財魔導師 (Royal Chartered Arborist)";
      rankColor = "#0369a1";
      banner.style.background = "#e0f2fe";
      banner.style.border = "2px solid #7dd3fc";
      comment = "優秀的定價功底！核心公式與無套利邏輯非常扎實，稍微注意多期債券與利率平價的小數點精度即可封神！";
    } else if (score >= 60) {
      rank = "🛡️ 資深行會管事 (Senior Guild Officer)";
      rankColor = "#d97706";
      banner.style.background = "#fef3c7";
      banner.style.border = "2px solid #fde68a";
      comment = "順利通過考核！但在無本借貸套現或複製組合的構造細節上略有猶豫，建議回顧前文的黃金期現貨套利實例！";
    } else {
      rank = "🌱 銅卡見習學徒 (Bronze Novice Apprentice)";
      rankColor = "#b91c1c";
      banner.style.background = "#fee2e2";
      banner.style.border = "2px solid #fca5a5";
      comment = "警報響起！基礎時間折現與無套利邏輯尚未融會貫通（紅框為失誤題目）。請點擊略過或展開思路詳讀考官推導！";
    }

    banner.innerHTML = `
      <div style="font-size:1.3rem; color:${rankColor}; margin-bottom:0.4rem;">
        試煉總得分：<strong>${score} / 100 分</strong> ｜ 榮譽封號：<strong>${rank}</strong>
      </div>
      <div style="font-size:0.95rem; color:#334155;">
        ${comment} (綠框標註為完全正確，紅框標註為答錯或未填，可點擊「展開考官解剖思路」查看詳盡公式演算！)
      </div>
    `;

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function skipAndRevealAllCh03Answers() {
    // 1. 自動勾選 MCQ 1 ~ 10 正確選項並展開思路
    for (let i = 1; i <= 10; i++) {
      const name = "c3_mcq" + i;
      const correctVal = ch3McqAnswers[name];
      const radios = document.getElementsByName(name);
      for (let r of radios) {
        if (r.value === correctVal) {
          r.checked = true;
        }
      }
      const box = document.getElementById("ch3-mcq-box-" + i);
      if (box) box.style.border = "2px solid #8b5cf6";

      const sol = document.getElementById("ch3-sol-mcq-" + i);
      if (sol) {
        sol.open = true;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([sol]);
        }
      }
    }

    // 2. 自動填入填充題 1 ~ 10 標準答案並展開思路
    const fills = {
      c3_fb1: "+10,476.19",
      c3_fb1_act: "接受",
      c3_fb2: "1.1216",
      c3_fb3: "1,000.40",
      c3_fb4: "100",
      c3_fb5: "Law of One Price",
      c3_fb6_1: "風險",
      c3_fb6_2: "資本",
      c3_fb7: "複製投資組合 (Replicating Portfolio)",
      c3_fb8: "0.9615",
      c3_fb9: "費雪分離定理 (Fisher Separation Theorem)",
      c3_fb10: "NPV > 0"
    };

    for (let id in fills) {
      const el = document.getElementById(id);
      if (el) {
        el.value = fills[id];
        el.style.backgroundColor = "#ede9fe";
        el.style.color = "#5b21b6";
      }
    }

    for (let j = 1; j <= 10; j++) {
      const box = document.getElementById("ch3-blank-box-" + j);
      if (box) box.style.border = "2px solid #8b5cf6";

      const sol = document.getElementById("ch3-sol-fb-" + j);
      if (sol) {
        sol.open = true;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([sol]);
        }
      }
    }

    // 3. 顯示橫幅提示
    const banner = document.getElementById("ch03-exam-score-banner");
    banner.style.display = "block";
    banner.style.background = "#f5f3ff";
    banner.style.border = "2px solid #8b5cf6";
    banner.innerHTML = `
      <div style="font-size:1.25rem; color:#6d28d9; margin-bottom:0.4rem;">
        ⏩ <strong>已啟動快捷模式：全卷標準答案已填入，解剖思路已全數為您展開！</strong>
      </div>
      <div style="font-size:0.95rem; color:#475569;">
        理解知識永遠比單純的考試分數更重要！您可以直接逐題研讀下方的詳細數學公式推導、套利四步表與法理背景，快速吸收 Chapter 3 的核心期中精華！
      </div>
    `;

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

</script>
  <script>
    // 離線降級防護：若 2 秒內 MathJax 未加載（如離線無網環境），自動啟動純本地輕量替換，確保絕不露出原始碼
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        if (!window.MathJax || !window.MathJax.typeset) {
          console.warn("MathJax CDN 連線超時或處於離線狀態，啟動本地輕量公式美化引擎...");
          const walk = (node) => {
            if (node.nodeType === 3) {
              let text = node.nodeValue;
              if (text.includes('$') || text.includes('\\\\times') || text.includes('\\\\frac')) {
                let replaced = text
                  .replace(/\\\\\\$/g, '＄')
                  .replace(/\\$([^\\$]+)\\$/g, '<span style="font-family: Consolas, monospace; color: #0d5f4e; font-weight: 600;">$1</span>')
                  .replace(/\\\\times/g, ' × ')
                  .replace(/\\\\div/g, ' ÷ ')
                  .replace(/\\\\mathbf\\{([^\\}]+)\\}/g, '<strong>$1</strong>')
                  .replace(/\\\\text\\{([^\\}]+)\\}/g, '$1')
                  .replace(/\\\\approx/g, ' ≈ ')
                  .replace(/\\\\ge/g, ' ≥ ')
                  .replace(/\\\\le/g, ' ≤ ')
                  .replace(/\\\\([a-zA-Z]+)/g, '')
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
  
  // ==========================================
  // Chapter 3 期中模擬試卷 批改與略過交互邏輯
  // ==========================================
  const ch3McqAnswers = {
    c3_mcq1: "B",
    c3_mcq2: "B",
    c3_mcq3: "B",
    c3_mcq4: "B",
    c3_mcq5: "A",
    c3_mcq6: "B",
    c3_mcq7: "B",
    c3_mcq8: "B",
    c3_mcq9: "C",
    c3_mcq10: "C"
  };

  function checkAllCh03ExamAnswers() {
    let score = 0;

    // 1. 檢查 MCQ 1 ~ 10
    for (let i = 1; i <= 10; i++) {
      const name = "c3_mcq" + i;
      const radios = document.getElementsByName(name);
      let selected = "";
      for (let r of radios) {
        if (r.checked) {
          selected = r.value;
          break;
        }
      }
      const box = document.getElementById("ch3-mcq-box-" + i);
      if (selected === ch3McqAnswers[name]) {
        score += 5;
        if (box) box.style.border = "2px solid #16a34a";
      } else {
        if (box) box.style.border = "2px solid #dc2626";
      }
    }

    // 2. 檢查填充題 1 ~ 10
    // Blank 1: 10476.19, 接受
    const fb1 = (document.getElementById('c3_fb1').value || '').replace(/[+,\$]/g, '').trim();
    const fb1_act = (document.getElementById('c3_fb1_act').value || '').trim();
    if ((fb1.startsWith("10476") || fb1.startsWith("10,476")) && (fb1_act.includes("接受") || fb1_act.toLowerCase().includes("accept"))) {
      score += 5;
      document.getElementById('ch3-blank-box-1').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-1').style.border = "2px solid #dc2626";
    }

    // Blank 2: 1.1216 (或 1.1215)
    const fb2 = (document.getElementById('c3_fb2').value || '').trim();
    if (fb2.startsWith("1.1215") || fb2.startsWith("1.1216")) {
      score += 5;
      document.getElementById('ch3-blank-box-2').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-2').style.border = "2px solid #dc2626";
    }

    // Blank 3: 1000.40 / 1000.4
    const fb3 = (document.getElementById('c3_fb3').value || '').replace(/[,]/g, '').trim();
    if (fb3.startsWith("1000.4") || fb3.startsWith("1,000.4")) {
      score += 5;
      document.getElementById('ch3-blank-box-3').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-3').style.border = "2px solid #dc2626";
    }

    // Blank 4: 100
    const fb4 = (document.getElementById('c3_fb4').value || '').trim();
    if (fb4.startsWith("100")) {
      score += 5;
      document.getElementById('ch3-blank-box-4').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-4').style.border = "2px solid #dc2626";
    }

    // Blank 5: Law of One Price / LOOP
    const fb5 = (document.getElementById('c3_fb5').value || '').trim().toLowerCase();
    if (fb5.includes("law of one price") || fb5.includes("單一價格") || fb5.includes("loop")) {
      score += 5;
      document.getElementById('ch3-blank-box-5').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-5').style.border = "2px solid #dc2626";
    }

    // Blank 6: 風險 ｜ 資本 / 本金
    const fb6_1 = (document.getElementById('c3_fb6_1').value || '').trim();
    const fb6_2 = (document.getElementById('c3_fb6_2').value || '').trim();
    if ((fb6_1.includes("風險") || fb6_1.toLowerCase().includes("risk")) && (fb6_2.includes("資") || fb6_2.includes("本") || fb6_2.toLowerCase().includes("capital"))) {
      score += 5;
      document.getElementById('ch3-blank-box-6').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-6').style.border = "2px solid #dc2626";
    }

    // Blank 7: 複製組合 / Replicating
    const fb7 = (document.getElementById('c3_fb7').value || '').trim().toLowerCase();
    if (fb7.includes("複製") || fb7.includes("replicat")) {
      score += 5;
      document.getElementById('ch3-blank-box-7').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-7').style.border = "2px solid #dc2626";
    }

    // Blank 8: 0.9615
    const fb8 = (document.getElementById('c3_fb8').value || '').trim();
    if (fb8.startsWith("0.9615")) {
      score += 5;
      document.getElementById('ch3-blank-box-8').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-8').style.border = "2px solid #dc2626";
    }

    // Blank 9: 費雪分離 / 分離原則 / Fisher
    const fb9 = (document.getElementById('c3_fb9').value || '').trim().toLowerCase();
    if (fb9.includes("費雪") || fb9.includes("分離") || fb9.includes("fisher") || fb9.includes("separation")) {
      score += 5;
      document.getElementById('ch3-blank-box-9').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-9').style.border = "2px solid #dc2626";
    }

    // Blank 10: NPV > 0 / 大於0
    const fb10 = (document.getElementById('c3_fb10').value || '').replace(/\s+/g, '').toLowerCase();
    if (fb10.includes(">0") || fb10.includes("大於0") || fb10.includes("大于0") || fb10.includes("大於零") || fb10.includes("大于零")) {
      score += 5;
      document.getElementById('ch3-blank-box-10').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-10').style.border = "2px solid #dc2626";
    }

    // 評定段位
    const banner = document.getElementById("ch03-exam-score-banner");
    banner.style.display = "block";
    let rank = "";
    let rankColor = "";
    let comment = "";

    if (score >= 90) {
      rank = "👑 傳奇公會首席神掌櫃 (Legendary Arch-Arborist)";
      rankColor = "#15803d";
      banner.style.background = "#dcfce7";
      banner.style.border = "2px solid #86efac";
      comment = "震撼人心的表現！你對套利連環計、單一價格法則與價值加總性的理解已登峰造極，期中考勢必橫掃全場！";
    } else if (score >= 75) {
      rank = "⚔️ 皇家特許理財魔導師 (Royal Chartered Arborist)";
      rankColor = "#0369a1";
      banner.style.background = "#e0f2fe";
      banner.style.border = "2px solid #7dd3fc";
      comment = "優秀的定價功底！核心公式與無套利邏輯非常扎實，稍微注意多期債券與利率平價的小數點精度即可封神！";
    } else if (score >= 60) {
      rank = "🛡️ 資深行會管事 (Senior Guild Officer)";
      rankColor = "#d97706";
      banner.style.background = "#fef3c7";
      banner.style.border = "2px solid #fde68a";
      comment = "順利通過考核！但在無本借貸套現或複製組合的構造細節上略有猶豫，建議回顧前文的黃金期現貨套利實例！";
    } else {
      rank = "🌱 銅卡見習學徒 (Bronze Novice Apprentice)";
      rankColor = "#b91c1c";
      banner.style.background = "#fee2e2";
      banner.style.border = "2px solid #fca5a5";
      comment = "警報響起！基礎時間折現與無套利邏輯尚未融會貫通（紅框為失誤題目）。請點擊略過或展開思路詳讀考官推導！";
    }

    banner.innerHTML = `
      <div style="font-size:1.3rem; color:${rankColor}; margin-bottom:0.4rem;">
        試煉總得分：<strong>${score} / 100 分</strong> ｜ 榮譽封號：<strong>${rank}</strong>
      </div>
      <div style="font-size:0.95rem; color:#334155;">
        ${comment} (綠框標註為完全正確，紅框標註為答錯或未填，可點擊「展開考官解剖思路」查看詳盡公式演算！)
      </div>
    `;

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function skipAndRevealAllCh03Answers() {
    // 1. 自動勾選 MCQ 1 ~ 10 正確選項並展開思路
    for (let i = 1; i <= 10; i++) {
      const name = "c3_mcq" + i;
      const correctVal = ch3McqAnswers[name];
      const radios = document.getElementsByName(name);
      for (let r of radios) {
        if (r.value === correctVal) {
          r.checked = true;
        }
      }
      const box = document.getElementById("ch3-mcq-box-" + i);
      if (box) box.style.border = "2px solid #8b5cf6";

      const sol = document.getElementById("ch3-sol-mcq-" + i);
      if (sol) {
        sol.open = true;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([sol]);
        }
      }
    }

    // 2. 自動填入填充題 1 ~ 10 標準答案並展開思路
    const fills = {
      c3_fb1: "+10,476.19",
      c3_fb1_act: "接受",
      c3_fb2: "1.1216",
      c3_fb3: "1,000.40",
      c3_fb4: "100",
      c3_fb5: "Law of One Price",
      c3_fb6_1: "風險",
      c3_fb6_2: "資本",
      c3_fb7: "複製投資組合 (Replicating Portfolio)",
      c3_fb8: "0.9615",
      c3_fb9: "費雪分離定理 (Fisher Separation Theorem)",
      c3_fb10: "NPV > 0"
    };

    for (let id in fills) {
      const el = document.getElementById(id);
      if (el) {
        el.value = fills[id];
        el.style.backgroundColor = "#ede9fe";
        el.style.color = "#5b21b6";
      }
    }

    for (let j = 1; j <= 10; j++) {
      const box = document.getElementById("ch3-blank-box-" + j);
      if (box) box.style.border = "2px solid #8b5cf6";

      const sol = document.getElementById("ch3-sol-fb-" + j);
      if (sol) {
        sol.open = true;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([sol]);
        }
      }
    }

    // 3. 顯示橫幅提示
    const banner = document.getElementById("ch03-exam-score-banner");
    banner.style.display = "block";
    banner.style.background = "#f5f3ff";
    banner.style.border = "2px solid #8b5cf6";
    banner.innerHTML = `
      <div style="font-size:1.25rem; color:#6d28d9; margin-bottom:0.4rem;">
        ⏩ <strong>已啟動快捷模式：全卷標準答案已填入，解剖思路已全數為您展開！</strong>
      </div>
      <div style="font-size:0.95rem; color:#475569;">
        理解知識永遠比單純的考試分數更重要！您可以直接逐題研讀下方的詳細數學公式推導、套利四步表與法理背景，快速吸收 Chapter 3 的核心期中精華！
      </div>
    `;

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

</script>

</head>
<body>

<!-- 頂部 Hero Banner -->
<header class="hero">
  <div class="eyebrow">Corporate Finance · Berk & DeMarzo · Chapter 3</div>
  <h1>Chapter 3｜財務決策與單一價格法則 <span class="version-tag">v2.0 增補演化版</span></h1>
  <div class="subtitle">Financial Decision Making and the Law of One Price —— 像十五歲國中生一樣，搞懂公會大掌櫃的算錢神技！</div>
  <div class="meta-tags">
    <span class="meta-tag">⚔️ 角色：公會首席財務掌櫃</span>
    <span class="meta-tag">🎯 核心：評價原則 (Valuation Principle)</span>
    <span class="meta-tag">⏳ 武器：貨幣時間價值 (TVM) & 淨現值 (NPV)</span>
    <span class="meta-tag">⚖️ 終極真理：單一價格法則 (Law of One Price)</span>
    <span class="meta-tag">📝 擴充：課後 14 題經典非 Excel 題庫全詳解</span>
  </div>
</header>

<div class="layout">
  <!-- 側邊導航目錄 -->
  <nav class="toc" aria-label="講義目錄">
    <div class="toc-title">📖 冒險指南目錄</div>
    <a href="#evolution">📜 講義演化記錄 (Changelog)</a>
    <a href="#intro">🏰 序章：公會大掌櫃的神聖任務</a>
    <a href="#sec1">⚖️ 第一節：市場價格決定客觀價值</a>
    <a href="#sec2">⏳ 第二節：時間也是一種匯率 (TVM)</a>
    <a href="#sec3">💎 第三節：財務學第一金律 NPV</a>
    <a href="#sec4">🦊 第四節：套利與單一價格法則 (LOOP)</a>
    <a href="#sec5">📜 第五節：無套利證券定價與分離原則</a>
    <a href="#integration">🧩 全章心智地圖與十組易混概念</a>
    <a href="#practice">🎯 實戰演練：6 題觀念通關測驗</a>
    <a href="#textbook-problems">🔥 下半段增補：課後 14 大試煉題庫</a>
    <a class="toc-sub" href="#prob-valuing">↳ 1~5 決策評估篇</a>
    <a class="toc-sub" href="#prob-tvm">↳ 6~8 時間價值篇</a>
    <a class="toc-sub" href="#prob-npv">↳ 11 NPV 與無本借貸</a>
    <a class="toc-sub" href="#prob-arbitrage">↳ 12~14 套利與單一價格</a>
    <a class="toc-sub" href="#prob-securities">↳ 16~18 證券無套利定價</a>
    <a href="#further-reading">🔬 經典學術文獻與思想源流</a>
    <a href="#glossary">📚 必背英漢專業術語字典庫</a>
    <a href="#midterm-exam" style="color:#7c3aed; font-weight:800; background:#f5f3ff; border:1px solid #ddd6fe;">⚔️ 20題期中模擬大殿</a>
  </nav>

  <!-- 主體講義內容 -->
  <main>

    <!-- 演化記錄 -->
    <section id="evolution" class="evolution-card">
      <h3>📜 講義演化記錄 (Version Evolution & Changelog)</h3>
      <p style="color:#6d4b14; font-size:0.95rem;">本講義採用<strong>版本演化模式（Evolutionary Changelog）</strong>進行維護，確保知識累積過程清晰可溯，絕不任意破壞先前已建立的知識架構：</p>
      <ul class="evolution-timeline">
        <li>
          <strong>v1.0 (2026-10-20 初版上線)：</strong><br>
          建立 Chapter 3 核心理論骨架（評價原則、貨幣時間價值、NPV 決策黃金律、套利與單一價格法則、無套利證券定價與分離原則）；嵌入 5 大沉浸式原生 JS 互動實驗組件；納入原書 Example 3.1~3.7 與 6 題隨堂測驗。
        </li>
        <li>
          <strong>v2.0 (2026-10-20 演化增補版)：</strong><br>
          保持前半部全部內容完整不動；全新擴充<strong>下半段「課後 14 大試煉非 Excel 經典題庫詳解（Problems 1~18）」</strong>，涵蓋 Honda 汽車促銷折價、大蝦跨國外匯貿易、玉米轉化乙醇臨界定價、年終股票獎金一年閉鎖期、長野滑雪過期哩程、日本跨國專案評估、鍵盤無本融資採購、兩大銀行跨行套利、美日利差投機迷思、ADR 股價推算匯率、ETF 搬磚套利、零息債券組裝天平與反推殖利率；同步收錄 Fisher 等四大經典學術文獻思想導讀與頁碼索引。
        </li>
      </ul>
    </section>

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
        <div id="q4-fb" class="quiz-feedback"></div>
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

    <!-- 第八節：下半段增補 課後 14 大試煉題庫 -->
    <section id="textbook-problems">
      <h2>🔥 下半段增補：課後 14 大試煉題庫（Problems 1~18 詳解）</h2>
      <p class="lead"><strong>歡迎進入「大掌櫃魔鬼修煉場」！</strong> 這是課本第 113~116 頁最新釋出的非 Excel 課後習題。我們將分為 5 大模組，用最生動的比喻與精準算式，手把手帶你全數通關！</p>

      <!-- 模組 A：決策評估 (Valuing Decisions) -->
      <div id="prob-valuing">
        <h3>⚔️ 模組 A：決策評估篇（Valuing Decisions）</h3>

        <!-- Problem 1 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">🚗 Problem 1：Honda 汽車促銷折價方案</span>
            <span class="example-badge">PROBLEM 1</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                Honda Motor Company is considering offering a $1,600 rebate on its minivan, lowering the vehicle’s price from $29,000 to $27,400. The marketing group estimates that this rebate will increase sales over the next year from 42,000 to 60,000 vehicles. Suppose Honda’s profit margin with the rebate is $5,400 per vehicle. If the change in sales is the only consequence of this decision, what are its costs and benefits? Is it a good idea?
              </div>
              <p>Honda 車廠考慮推出促銷方案：休旅車每輛折價 <strong>$1,600</strong>（售價從 $29,000 降到 $27,400）。行銷團隊預估：這會讓明年銷量從 42,000 輛暴增到 60,000 輛。假設降價後每輛車的邊際利潤為 <strong>$5,400</strong>。這項促銷方案的成本與效益是多少？這是一筆好生意嗎？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：新舊銷量分流思考】</strong><br>
              很多初學者會把降價前後的總營收整個相乘減來減去，容易算錯。大掌櫃教你一秒看透的<strong>「增量分析法（Incremental Analysis）」</strong>：
              <ul>
                <li><strong>付出的代價（Costs）：</strong> 原本就算不促銷，閉著眼睛也能賣掉的 <strong>42,000 輛</strong>，現在每輛都平白無故少賺了 $1,600 折扣！<br>
                ➔ $\text{Cost} = 42,000 \text{ 輛} \times \$1,600 = \mathbf{\$67,200,000}$（成本為 6,720 萬美元）。</li>
                <li><strong>得到的效益（Benefits）：</strong> 因為促銷而額外多吸引來的新買家，新增銷量為 $60,000 - 42,000 = \mathbf{18,000 \text{ 輛}}$！每一輛帶來 $5,400 的淨利潤。<br>
                ➔ $\text{Benefit} = 18,000 \text{ 輛} \times \$5,400 = \mathbf{\$97,200,000}$（效益為 9,720 萬美元）。</li>
                <li><strong>淨利潤（Net Value）：</strong><br>
                ➔ $\text{Net Value} = \$97,200,000 - \$67,200,000 = \mathbf{+\$30,000,000}$（淨賺 3,000 萬美元！）。</li>
              </ul>
              <strong>🎯 結論：</strong> 效益遠大於成本，淨賺 3,000 萬美元！<strong>這是一個超級讚的點子（Definitely a Good Idea）！</strong>
            </div>
          </div>
        </div>

        <!-- Problem 2 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">🦐 Problem 2：國際大蝦跨國貿易陷阱</span>
            <span class="example-badge">PROBLEM 2</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                You are an international shrimp trader. A food producer in the Czech Republic offers to pay you 2.9 million Czech koruna today in exchange for a year’s supply of frozen shrimp. Your Thai supplier will provide you with the same supply for 22 million Thai baht today. If the current competitive market exchange rates are 24.24 koruna per dollar and 37.74 baht per dollar, what is the value of this deal?
              </div>
              <p>你是個跨國冷凍白蝦貿易商。捷克食品廠開出合約：今天付你 <strong>290 萬捷克克朗 (CZK)</strong> 買一整年的白蝦。你的泰國供應商報價：今天要你付 <strong>2,200 萬泰銖 (THB)</strong> 供貨。市場競爭匯率為：24.24 克朗/美元、37.74 泰銖/美元。這筆交易的淨價值是多少？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：統一幣別天平】</strong><br>
              在遊戲拍賣所，你不能拿「金幣」去直接減「銀幣」，必須先換算成同一貨幣（例如美元 USD）：
              <ul>
                <li><strong>收入（Benefit 現金流入）：</strong><br>
                $2,900,000 \text{ CZK} \div 24.24 \text{ CZK/\$} = \mathbf{\$119,636.96}$ 美元。</li>
                <li><strong>成本（Cost 現金流出）：</strong><br>
                $22,000,000 \text{ THB} \div 37.74 \text{ THB/\$} = \mathbf{\$582,935.88}$ 美元。</li>
                <li><strong>交易淨值（Net Value）：</strong><br>
                $\text{Net Value} = \$119,636.96 - \$582,935.88 = \mathbf{-\$463,298.92}$ 美元！</li>
              </ul>
              <strong>🎯 結論：</strong> 做這單會慘賠 <strong>46.3 萬美元</strong>！千萬不能接！這充分說明了為什麼必須用客觀競爭市場價格將各國貨幣量化，否則光看「290萬」跟「2200萬」數字根本不知道誰大誰小！
            </div>
          </div>
        </div>

        <!-- Problem 3 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">🌽 Problem 3：玉米轉化乙醇的煉金術</span>
            <span class="example-badge">PROBLEM 3</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                Suppose the current market price of corn is $3.75 per bushel. Your firm has a technology that can convert 1 bushel of corn to 3 gallons of ethanol. If the cost of conversion is $1.84 per bushel, at what market price of ethanol does conversion become attractive?
              </div>
              <p>目前玉米市價每蒲式耳 <strong>$3.75</strong>。你公司擁有黑科技，能把 1 蒲式耳玉米轉化為 <strong>3 加侖乙醇（酒精燃料）</strong>，轉化加工成本為每蒲式耳 <strong>$1.84</strong>。乙醇的市場價格要達到多少以上，這項轉化技術才有利可圖？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：算出一加侖成本臨界點】</strong><br>
              <ul>
                <li><strong>提煉 3 加侖乙醇的總成本：</strong> 買 1 蒲式耳玉米 ($3.75) + 工廠加工費 ($1.84) = <strong>$5.59 美元</strong>。</li>
                <li>因為 1 蒲式耳能產出 3 加侖乙醇，所以<strong>每加侖乙醇的損益平衡底線</strong>為：<br>
                $P_{\text{ethanol}} \ge \frac{\$5.59}{3 \text{ 加侖}} = \mathbf{\$1.8633 \text{ 美元/加侖}}$（約 $1.86/加侖）。</li>
              </ul>
              <strong>🎯 結論：</strong> 只要市場上乙醇價格<strong>高於 $1.8633/加侖</strong>，開機轉化就是賺錢的好生意！
            </div>
          </div>
        </div>

        <!-- Problem 4 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">🎁 Problem 4：年終獎金二選一（現金 vs 股票）</span>
            <span class="example-badge">PROBLEM 4</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                Suppose your employer offers you a choice between a $6,900 bonus and 400 shares of the company stock. Whichever one you choose will be awarded today. The stock is currently trading for $52 per share.<br>
                a. Suppose that if you receive the stock bonus, you are free to trade it. Which form of the bonus should you choose? What is its value?<br>
                b. Suppose that if you receive the stock bonus, you are required to hold it for at least one year. What can you say about the value of the stock bonus now? What will your decision depend on?
              </div>
              <p>老闆發年終給你二選一：今天領 <strong>$6,900 現金</strong>，或是領 <strong>400 股公司股票</strong>。目前股票市價為每股 $52。<br>
              a. 如果股票今天就能自由在市場上轉賣，你該選哪一個？它的價值是多少？<br>
              b. 如果股票被強制閉鎖「至少要抱緊一年不能賣」，此時股票的價值該怎麼評估？你的選擇會取決於什麼？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：流動性決定評價原則是否完全生效】</strong><br>
              <ul>
                <li><strong>子題 a（可自由交易）：</strong><br>
                400 股股票在競爭市場上的客觀現值 = $400 \times \$52 = \mathbf{\$20,800}$！<br>
                根據評價原則，<strong>果斷選股票！</strong> 就算你極度渴望現金，選股票後立刻在市場賣掉拿回 $20,800 現金，也比直接拿 $6,900 <strong>暴增了整整 $13,900 現金</strong>！</li>
                <li><strong>子題 b（閉鎖一年不能賣）：</strong><br>
                當資產失去競爭市場的即時流動性時，<strong>評價原則無法給出單一客觀現金現值</strong>！<br>
                股票價值現在充滿不確定性（一年後股價可能漲到 $100，也可能跌到 $10）。此時你的決策將高度取決於：
                <ol>
                  <li><strong>你的個人風險偏好（Risk Preferences）：</strong> 你是喜歡冒險還是害怕虧損？</li>
                  <li><strong>你今天對現金的迫切程度：</strong> 如果你今天不繳房租就會被房東趕出去，現金 $6,900 雖然少但能救命！</li>
                  <li><strong>你對公司未來一年獲利與股價的預期！</strong></li>
                </ol>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Problem 5 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">⛷️ Problem 5：長野滑雪哩程的機會成本</span>
            <span class="example-badge">PROBLEM 5</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                You have decided to take your daughter skiing in Nagano, Japan. The best price you have been able to find for a roundtrip air ticket is $555. You notice that you have 20,000 frequent flyer miles that are about to expire, but you need 25,000 miles to get her a free ticket. The airline offers to sell you 5,000 additional miles for $0.05 per mile.<br>
                a. Suppose that if you don’t use the miles for your daughter’s ticket they will become worthless. What should you do?<br>
                b. What additional information would your decision depend on if the miles were not expiring? Why?
              </div>
              <p>你要帶女兒去日本長野滑雪，來回機票查到最便宜是 <strong>$555</strong>。你發現手上有 <strong>20,000 哩即將過期的航空哩程</strong>，但兌換免費機票需要 25,000 哩。航空公司同意讓你補買 5,000 哩，每哩售價 <strong>$0.05</strong>。<br>
              a. 如果這次不用，這 2 萬哩馬上過期變廢紙。你該自費買機票還是補買哩程換票？<br>
              b. 如果這些哩程永遠不會過期，你的決策還需要什麼額外資訊？為什麼？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：沉沒成本與機會成本】</strong><br>
              <ul>
                <li><strong>子題 a（即將過期）：</strong><br>
                補買 5,000 哩的成本 = $5,000 \times \$0.05 = \mathbf{\$250}$。<br>
                付出 $250 就能省下原價 $555 的機票，相當於現賺 $\$555 - \$250 = \mathbf{\$305}$！<br>
                原本的 20,000 哩不用就歸零，機會成本為 0。<strong>明智選擇：立刻花 $250 買哩程換機票！</strong></li>
                <li><strong>子題 b（不會過期）：</strong><br>
                如果哩程不過期，那 20,000 哩就有<strong>「未來的使用價值（機會成本 Opportunity Cost）」</strong>！<br>
                決策取決於：<strong>這 20,000 哩未來能換到什麼價值的機票？</strong><br>
                例如：如果你未來打算換一張價值 $1,000 的歐美長途機票，那麼現在把哩程用在只值 $555 的日本線上就浪費了；反之，若你未來根本不常搭這家航空，那現在換掉依然最划算！</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      <!-- 模組 B：貨幣時間價值篇 (TVM) -->
      <div id="prob-tvm">
        <h3>⏳ 模組 B：時間價值與跨國利率篇（TVM）</h3>

        <!-- Problem 6 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">⏰ Problem 6：3.2% 利率下的時空穿越</span>
            <span class="example-badge">PROBLEM 6</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                Suppose the risk-free interest rate is 3.2%.<br>
                a. Having $500 today is equivalent to having what amount in one year?<br>
                b. Having $500 in one year is equivalent to having what amount today?<br>
                c. Which would you prefer, $500 today or $500 in one year? Does your answer depend on when you need the money? Why or why not?
              </div>
              <p>市場無風險年利率為 <strong>3.2%</strong>。<br>
              a. 今天的 $500，相當於一年後的多少錢？<br>
              b. 一年後的 $500，相當於今天的多少錢？<br>
              c. 今天的 $500 跟一年後的 $500，你會選哪一個？這會取決於你何時需要錢嗎？為什麼？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：利率就是時間轉換器】</strong><br>
              <ul>
                <li><strong>子題 a（往未來推 FV）：</strong><br>
                $\text{FV} = \$500 \times (1 + 0.032) = \mathbf{\$516.00}$（一年後的等價金幣）。</li>
                <li><strong>子題 b（往今天拉 PV）：</strong><br>
                $\text{PV} = \$500 \div (1 + 0.032) = \mathbf{\$484.50}$（今天的等價金幣）。</li>
                <li><strong>子題 c（偏好抉擇）：</strong><br>
                <strong>永遠優先選「今天的 $500」！而且跟何時需要錢完全無關！</strong><br>
                • 如果你今天需要錢：拿今天的 $500 剛好花掉，比拿一年後的 $500（今天只值 $484.50）多賺 $15.50。<br>
                • 如果你一年後才需要錢：拿今天的 $500 存進銀行賺 3.2% 利息，一年後會變成 <strong>$516</strong>，依然比苦等一年只拿 $500 多賺了 <strong>$16 元利息</strong>！</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Problem 7 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">🗾 Problem 7：跨國投資日本專案 NPV 陷阱</span>
            <span class="example-badge">PROBLEM 7</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                You have an investment opportunity in Japan. It requires an investment of $0.98 million today and will produce a cash flow of ¥107 million in one year with no risk. Suppose the risk-free interest rate in the United States is 3.9%, the risk-free interest rate in Japan is 2.3%, and the current competitive exchange rate is ¥110 per $1. What is the NPV of this investment? Is it a good opportunity?
              </div>
              <p>日本有一個無風險投資專案：今天需要投入 <strong>98 萬美元（$0.98M）</strong>，保證在一年後回收 <strong>1.07 億日圓（¥107M）</strong>。<br>
              已知：美國無風險利率 3.9%，日本無風險利率 2.3%，目前市場競爭即期匯率為 <strong>¥110 / $1 美元</strong>。請問該專案的 NPV 是多少？這是一個好投資嗎？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：在日圓的世界折現，再走匯率傳送門】</strong><br>
              注意陷阱！未來的日圓現金流，必須用<strong>「日圓的無風險利率 (2.3%)」</strong>折現成今天的日圓，再用即期匯率換回美元：
              <ol>
                <li><strong>一年後日圓折現為今天的日圓現值：</strong><br>
                $\text{PV(日圓)} = 107,000,000 \text{ 円} \div 1.023 = \mathbf{¥104,594,330.40}$。</li>
                <li><strong>通過即期匯率門換算為今天的美元價值：</strong><br>
                $\text{PV(美元效益)} = ¥104,594,330.40 \div 110 = \mathbf{\$950,857.55}$（約 95.09 萬美元）。</li>
                <li><strong>計算淨現值 NPV：</strong><br>
                $\text{NPV} = \text{效益現值} - \text{成本投入} = \$950,857.55 - \$980,000 = \mathbf{-\$29,142.45}$（負 2.91 萬美元！）。</li>
              </ol>
              <strong>🎯 結論：</strong> NPV < 0，做了會虧損近 3 萬美元！<strong>絕不是好專案，果斷拒絕（Reject）！</strong>
            </div>
          </div>
        </div>

        <!-- Problem 8 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">📈 Problem 8：無風險投資的吸引力利率門檻</span>
            <span class="example-badge">PROBLEM 8</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                Your firm has a risk-free investment opportunity where it can invest $163,000 today and receive $179,000 in one year. For what level of interest rates is this project attractive?
              </div>
              <p>你的公司有一個無風險專案：今天投資 <strong>$163,000</strong>，一年後保證拿回 <strong>$179,000</strong>。在什麼樣的市場利率水準下，這個專案才具有投資吸引力？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：算出專案本身的內建報酬率】</strong><br>
              專案本身的年收益率（投資報酬率 Return / 隱含利率）為：
              <div class="formula-banner">
專案回報率 r* = (179,000 - 163,000) ÷ 163,000 = 16,000 ÷ 163,000 ≈ 9.816% (約 9.82%)
              </div>
              <ul>
                <li>只要市場無風險利率 <strong>$r < 9.82\%$</strong>：<br>
                這項專案賺的比銀行多，NPV 就會是正的（$\text{NPV} = \frac{179,000}{1+r} - 163,000 > 0$），深具吸引力！</li>
                <li>若市場利率 $r > 9.82\%$：直接把錢存銀行利息還比較多，專案 NPV < 0 失去吸引力。</li>
              </ul>
              <strong>🎯 結論：</strong> 只要市場無風險利率<strong>低於 9.82%</strong>，該專案就是好專案！
            </div>
          </div>
        </div>

      </div>

      <!-- 模組 C：NPV 決策與無本借貸篇 -->
      <div id="prob-npv">
        <h3>💎 模組 C：NPV 決策與無本借貸篇（NPV & Financing）</h3>

        <!-- Problem 11 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">⌨️ Problem 11：鍵盤採購案與無本借貸魔術</span>
            <span class="example-badge">PROBLEM 11</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                Your computer manufacturing firm must purchase 12,000 keyboards from a supplier. One supplier demands a payment of $144,000 today plus $12 per keyboard payable in one year. Another supplier will charge $25 per keyboard, also payable in one year. The risk-free interest rate is 6%.<br>
                a. What is the difference in their offers in terms of dollars today? Which offer should your firm take?<br>
                b. Suppose your firm does not want to spend cash today. How can it take the first offer and not spend $144,000 of its own cash today?
              </div>
              <p>你的電腦工廠需要採購 <strong>12,000 個鍵盤</strong>。有兩家供應商開價（年利率 6%）：<br>
              • <strong>供應商 A：</strong> 今天先付 <strong>$144,000 現金</strong>，一年後每個鍵盤再付 $12。<br>
              • <strong>供應商 B：</strong> 今天 0 元，一年後每個鍵盤收 $25。<br>
              a. 以「今天的現值（Dollars Today）」衡量，兩家差多少？該選誰？<br>
              b. 假設公司今天「一毛自備款都不想花」，如何選擇供應商 A 卻不用掏出自己半毛錢？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：NPV 換算 + 銀行信用大借款】</strong><br>
              <ul>
                <li><strong>子題 a（折現比較現值成本）：</strong><br>
                • <strong>供應商 A 總現值：</strong><br>
                今天付 $144,000。<br>
                一年後付：$12,000 \times \$12 = \$144,000$。折現回今天 = $\$144,000 \div 1.06 = \$135,849.06$。<br>
                ➔ <strong>總現值成本 A = $\$144,000 + \$135,849.06 = \mathbf{\$279,849.06}$</strong>。<br><br>
                • <strong>供應商 B 總現值：</strong><br>
                一年後一次付：$12,000 \times \$25 = \$300,000$。<br>
                折現回今天 = $\$300,000 \div 1.06 = \mathbf{\$283,018.87}$。<br>
                ➔ <strong>成本差距：</strong> $\$283,018.87 - \$279,849.06 = \mathbf{\$3,169.81}$。<br>
                <strong>結論：選供應商 A！今天現省 $3,169.81 現金！</strong></li>

                <li><strong>子題 b（零自備款的無本操作法）：</strong><br>
                如果公司今天不想拿出現金，直接<strong>向銀行以 6% 利率借款 $144,000</strong> 付給供應商 A！<br>
                • <strong>今天現金流：</strong> 借到 +$144,000，付給廠商 -$144,000，<strong>自掏腰包 = $0 元</strong>！<br>
                • <strong>一年後總還款：</strong><br>
                還銀行本利和：$\$144,000 \times 1.06 = \$152,640$。<br>
                付廠商尾款：$\$144,000$。<br>
                一年後合計支出：$\$152,640 + \$144,000 = \mathbf{\$296,640}$。<br>
                <strong>驗證奇蹟：</strong> 就算加上銀行利息，一年後付 $296,640 依然比供應商 B 的 $300,000 <strong>足足省下了 $3,360</strong>！這就是分離原則與借貸調控的終極威力！</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      <!-- 模組 D：套利與單一價格法則篇 -->
      <div id="prob-arbitrage">
        <h3>🦊 模組 D：套利與單一價格法則篇（Arbitrage & LOOP）</h3>

        <!-- Problem 12 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">🏦 Problem 12：兩家銀行的跨行無本套利</span>
            <span class="example-badge">PROBLEM 12</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                Suppose Bank One offers a risk-free interest rate of 9% on both savings and loans, and Bank Enn offers a risk-free interest rate of 9.5% on both savings and loans.<br>
                a. What arbitrage opportunity is available?<br>
                b. Which bank would experience a surge in the demand for loans? Which bank would receive a surge in deposits?<br>
                c. What would you expect to happen to the interest rates the two banks are offering?
              </div>
              <p>假設第一銀行（Bank One）的無風險存款與放款利率都是 <strong>9%</strong>，而恩恩銀行（Bank Enn）的無風險存款與放款利率都是 <strong>9.5%</strong>。<br>
              a. 有什麼套利機會可以大賺一筆？<br>
              b. 哪家銀行的借款需求會被擠爆？哪家銀行的存款會排隊擠破頭？<br>
              c. 隨著套利者瘋狂湧入，兩家銀行的利率最終會怎麼演化變動？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：搬金幣跨行洗錢術】</strong><br>
              <ul>
                <li><strong>子題 a（套利密碼）：</strong><br>
                <strong>在 Bank One 以 9% 借錢，轉身存進 Bank Enn 賺 9.5%！</strong><br>
                假設你借 1,000 萬美元：<br>
                • 今天：向 Bank One 借 $1,000 萬，全數存入 Bank Enn。淨掏腰包 = <strong>$0</strong>。<br>
                • 一年後：Bank Enn 領回本利和 $1,095 萬，還給 Bank One $1,090 萬。<br>
                • <strong>口袋純落袋淨賺：$50,000 美元純利潤！</strong> 零成本、零風險！</li>
                <li><strong>子題 b（市場擠兌風暴）：</strong><br>
                • <strong>Bank One（借錢便宜 9%）：</strong> 大家搶著借，<strong>借款（Loans）需求引發暴衝</strong>！<br>
                • <strong>Bank Enn（利息超高 9.5%）：</strong> 大家搶著存，<strong>存款（Deposits）金額瘋狂湧入</strong>！</li>
                <li><strong>子題 c（利率演化回歸均衡）：</strong><br>
                • Bank One 發現資金快被借光了，必須<strong>提高利率（>9%）</strong>來抑制借款。<br>
                • Bank Enn 發現收了太多存款要付高額利息，必須<strong>調降利率（<9.5%）</strong>。<br>
                • 最終兩家銀行的利率會在中間拉平（例如拉平在 9.25%），套利機會徹底蒸發，單一價格法則再度君臨！</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Problem 13 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">💴 Problem 13：90 年代美日利差不是套利？</span>
            <span class="example-badge">PROBLEM 13</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                Throughout the 1990s, interest rates in Japan were lower than interest rates in the United States. As a result, many Japanese investors were tempted to borrow in Japan and invest the proceeds in the United States. Explain why this strategy does not represent an arbitrage opportunity.
              </div>
              <p>整個 1990 年代，日本的利率接近 0%，遠低於美國的利率。許多投資人借入低息日圓，換成美元投資美國高息國債。請解釋：為什麼這項操作<strong>「根本不是套利（NOT an arbitrage opportunity）」</strong>？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：請背誦套利的最嚴格鐵律】</strong><br>
              在財務學中，套利的定義只有一個：<strong>【零初始資金 + 零風險 + 保證有正利潤】</strong>！<br>
              借日圓買美債的操作（市場稱為渡邊太太的利差交易 Carry Trade），存在一個巨大的致命破綻——<strong>外匯匯率風險（Currency Exchange Risk）</strong>！
              <ul>
                <li>今天你把日圓換成美元，一年後你賺到了美元利息，但<strong>你最終必須把美元換回日圓去還債</strong>！</li>
                <li>如果這一年內日圓對美元大幅升值（例如從 120 升到 90），你賺到的那點微薄美債利差，還不夠補貼匯率暴跌的虧損，甚至會直接破產！</li>
              </ul>
              <strong>🎯 核心考點：</strong> 既然承擔了可能賠錢的匯率波動風險，這就叫做<strong>「投機賭博（Speculation）」</strong>，絕不是無風險套利！
            </div>
          </div>
        </div>

        <!-- Problem 14 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">📱 Problem 14：Nokia ADR 推算跨國匯率</span>
            <span class="example-badge">PROBLEM 14</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                An American Depositary Receipt (ADR) is a security issued by a U.S. bank and traded on a U.S. stock exchange that represents a specific number of shares of a foreign stock. For example, Nokia Corporation trades as an ADR with symbol NOK on the NYSE. Each ADR represents one share of Nokia Corporation stock, which trades with symbol NOK1V on the Helsinki stock exchange. If the U.S. ADR for Nokia is trading for $7.12 per share, and Nokia stock is trading on the Helsinki exchange for €5.01 per share, use the Law of One Price to determine the current $/€ exchange rate.
              </div>
              <p>美國存託憑證（ADR）是代表外國公司股票的證券。Nokia 在紐約證交所交易的 ADR（代碼 NOK），1 單位 ADR 恰好代表 1 股在芬蘭赫爾辛基證交所上市的 Nokia 原股（代碼 NOK1V）。<br>
              若美國 ADR 股價為 <strong>$7.12 美元</strong>，芬蘭赫爾辛基股價為 <strong>€5.01 歐元</strong>。請利用單一價格法則（LOOP），推算目前的美元/歐元（$/€）匯率是多少？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：相同資產必有相同價格】</strong><br>
              因為 1 單位 ADR 與 1 股芬蘭股票代表完全相同的公司所有權與分紅權益（現金流完全等價）。根據單一價格法則，兩者折算後的價格必須完全相等：
              <div class="formula-banner">
美國市價 ($7.12) = 芬蘭市價 (€5.01) × 匯率 ($/€)
              </div>
              倒推匯率：
              $$\text{匯率 (\$/€)} = \frac{\$7.12}{€5.01} \approx \mathbf{1.4212 \text{ 美元/歐元}}$$
              <strong>🎯 結論：</strong> 目前的均衡市場匯率必然是 <strong>1 歐元兌 1.4212 美元</strong>（或 1 美元兌 0.7037 歐元）！若非如此，就會立刻引發跨洋 ADR 搬磚套利！
            </div>
          </div>
        </div>

      </div>

      <!-- 模組 E：證券無套利定價與價值加總篇 -->
      <div id="prob-securities">
        <h3>📜 模組 E：證券定價與價值加總篇（Securities Pricing）</h3>

        <!-- Problem 16 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">🧺 Problem 16：ETF 投資組合定價與搬磚實戰</span>
            <span class="example-badge">PROBLEM 16</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                An Exchange-Traded Fund (ETF) is a security that represents a portfolio of individual stocks. Consider an ETF for which each share represents a portfolio of two shares of Hewlett-Packard (HPQ), three shares of Sears (SHLD), and three shares of General Electric (GE). Suppose the current stock prices of each individual stock are: HPQ = $28, SHLD = $38, GE = $17.<br>
                a. What is the price per share of the ETF in a normal market?<br>
                b. If the ETF currently trades for $203, what arbitrage opportunity is available? What trades would you make?<br>
                c. If the ETF currently trades for $233, what arbitrage opportunity is available? What trades would you make?
              </div>
              <p>某檔 ETF 是一籃子股票投資組合。每 1 股 ETF 包含：<strong>2 股 HPQ ($28) + 3 股 Sears ($38) + 3 股 GE ($17)</strong>。<br>
              a. 在正常市場中，每股 ETF 的公平價格是多少？<br>
              b. 若 ETF 市價跌到 <strong>$203</strong>，有何套利機會？如何具體操作？<br>
              c. 若 ETF 市價漲到 <strong>$233</strong>，有何套利機會？如何具體操作？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：組合包與單買的價格天平】</strong><br>
              <ul>
                <li><strong>子題 a（計算組合包公平無套利市價）：</strong><br>
                根據價值加總原則，組合包價格等於各成分股單買總和：<br>
                $\text{Price(ETF)} = (2 \times \$28) + (3 \times \$38) + (3 \times \$17) = \$56 + \$114 + \$51 = \mathbf{\$221}$ 美元。</li>

                <li><strong>子題 b（ETF 只要 $203：組合包太便宜了！）：</strong><br>
                • <strong>套利策略（買便宜、賣昂貴）：</strong><br>
                1. 在市場上用 <strong>$203 買進 1 股 ETF</strong>。<br>
                2. 同時在市場上<strong>賣空（或拆分賣出）2 股 HPQ、3 股 SHLD、3 股 GE</strong>，收回 <strong>$221 現金</strong>！<br>
                • <strong>純獲利：</strong> $\$221 - \$203 = \mathbf{+\$18 \text{ 美元}}$！無成本、零風險淨賺！</li>

                <li><strong>子題 c（ETF 飆到 $233：組合包太昂貴了！）：</strong><br>
                • <strong>套利策略（放空組合包、買入散裝）：</strong><br>
                1. <strong>賣空（Short Sale）1 股 ETF</strong>，市價賣出拿到 <strong>$233 現金</strong>。<br>
                2. 同時花 <strong>$221</strong> 在市場上買進散裝成分股（2 HPQ + 3 SHLD + 3 GE）鎖定風險！<br>
                • <strong>純獲利：</strong> $\$233 - \$221 = \mathbf{+\$12 \text{ 美元}}$！口袋立刻落袋為安！</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Problem 17 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">⚖️ Problem 17：零息債券積木拼圖與套利</span>
            <span class="example-badge">PROBLEM 17</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                Consider two securities that pay risk-free cash flows over the next two years and that have the current market prices shown here:<br>
                • B1: Price = $279, Cash flow Year 1 = $300, Cash flow Year 2 = $0<br>
                • B2: Price = $255, Cash flow Year 1 = $0, Cash flow Year 2 = $300<br>
                a. What is the no-arbitrage price of a security that pays cash flows of $300 in one year and $300 in two years?<br>
                b. What is the no-arbitrage price of a security that pays cash flows of $300 in one year and $2,700 in two years?<br>
                c. Suppose a security with cash flows of $150 in one year and $300 in two years is trading for a price of $390. What arbitrage opportunity is available?
              </div>
              <p>市場上有兩張無風險債券：<br>
              • <strong>B1 債券：</strong> 現價 <strong>$279</strong>，第一年付 $300，第二年付 $0。<br>
              • <strong>B2 債券：</strong> 現價 <strong>$255</strong>，第一年付 $0，第二年付 $300。<br>
              a. 一張「第一年付 $300、第二年付 $300」的證券，其無套利價格是多少？<br>
              b. 一張「第一年付 $300、第二年付 $2,700」的證券，其無套利價格是多少？<br>
              c. 若市場出現一張證券 X，「第一年付 $150、第二年付 $300」，目前市價賣 <strong>$390</strong>。請問有何套利機會？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：樂高積木組裝法】</strong><br>
              把 B1 當作「一年後交貨積木」，B2 當作「兩年後交貨積木」：
              <ul>
                <li><strong>子題 a：</strong> 恰好等於 <strong>1 個 B1 + 1 個 B2</strong>！<br>
                $\text{Price} = \$279 + \$255 = \mathbf{\$534}$ 美元。</li>

                <li><strong>子題 b：</strong> 第一年需要 $300（買 1 個 B1），第二年需要 $2,700（相當於買 9 個 B2，因為 $9 \times 300 = 2,700$）！<br>
                $\text{Price} = (1 \times \$279) + (9 \times \$255) = \$279 + \$2,295 = \mathbf{\$2,574}$ 美元。</li>

                <li><strong>子題 c（尋找定價 Bug 套利）：</strong><br>
                • <strong>該證券 X 的客觀公平價值：</strong><br>
                第一年 $150 = 0.5 個 B1（值 $0.5 \times \$279 = \$139.50$）；<br>
                第二年 $300 = 1 個 B2（值 $\$255$）。<br>
                理論公平價格 = $\$139.50 + \$255 = \mathbf{\$394.50}$！<br>
                • <strong>市場現實：</strong> 市面上只賣 <strong>$390</strong>（被低估了 $4.50，太便宜了！）<br>
                • <strong>套利策略（買進便宜貨，賣出散裝積木）：</strong><br>
                1. 買進 1 單位該證券（付現 -$390）。<br>
                2. 同時賣空 0.5 單位 B1，並賣空 1 單位 B2（收回現金 +$139.50 + $255 = +$394.50）。<br>
                • <strong>現金流驗證：</strong><br>
                • 今天現金淨利：$-\$390 + \$394.50 = \mathbf{+\$4.50}$ 純利落袋！<br>
                • 第一年：證券給我們 $150，剛好還給 0.5 個 B1 的買家（淨額 $0）。<br>
                • 第二年：證券給我們 $300，剛好還給 1 個 B2 的買家（淨額 $0）。<br>
                <strong>完美無風險空手套白狼淨賺 $4.50！</strong></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Problem 18 -->
        <div class="example-card">
          <div class="example-header">
            <span class="example-title">🎯 Problem 18：從債券市價反推無風險利率</span>
            <span class="example-badge">PROBLEM 18</span>
          </div>
          <div class="example-body">
            <div class="example-problem">
              <strong>【題目原文與情境】</strong>
              <div class="orig-en">
                Suppose a security with a risk-free cash flow of $147 in one year trades for $135 today. If there are no arbitrage opportunities, what is the current risk-free interest rate?
              </div>
              <p>某張證券保證一年後支付 <strong>$147</strong>，今天的市場交易價格為 <strong>$135</strong>。若市場不存在套利機會，目前的市場無風險利率是多少？</p>
            </div>
            <div class="example-solution">
              <strong>【15歲公會掌櫃拆解法：現值公式倒推法】</strong><br>
              根據無套利定價公式：
              $$\text{Price} = \frac{\text{FV}}{1 + r} \implies \$135 = \frac{\$147}{1 + r}$$
              將式子變形移項：
              $$1 + r = \frac{\$147}{\$135} \approx 1.088889 \implies r = \mathbf{8.89\%}$$
              <strong>🎯 結論：</strong> 目前的無風險利率必然是 <strong>8.89%</strong>！金融新聞每天報的國債殖利率，就是用這個簡單的公式天天反推算出來的！
            </div>
          </div>
        </div>

      </div>

    </section>

    <!-- 第九節：經典文獻與學術延伸 -->
    <section id="further-reading">
      <h2>🔬 經典學術文獻與思想源流（Further Reading）</h2>
      <p>想成為全伺服器最頂尖的傳奇大掌櫃嗎？課本推薦的這四部金融學經典著作，是支撐現代金融大廈的四根神柱：</p>
      
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>文獻與大師</th>
              <th>經典著作 / 論文</th>
              <th>大掌櫃的核心洞見與啟發</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Irving Fisher (費雪, 1930)</strong></td>
              <td><em>The Theory of Interest</em><br>《利息理論》</td>
              <td><strong>利率的始祖！</strong> 費雪提出時間偏好（不耐性）與投資機會的交互作用，確立了「資本與收入」、「跨期消費選擇」與 NPV 原則的理論根基。</td>
            </tr>
            <tr>
              <td><strong>Stephen Ross (羅斯, 2004)</strong></td>
              <td><em>Neoclassical Finance</em><br>《新古典金融學》</td>
              <td><strong>無套利定價的教父！</strong> 證明了「沒有套利機會」是整個資產定價理論（APT 模型、選擇權定價）最強大、最優美的單一公理。</td>
            </tr>
            <tr>
              <td><strong>Mark Rubinstein (2001)</strong></td>
              <td><em>Rational Markets: Yes or No?</em><br>《理性市場：肯定論》</td>
              <td>為「市場效率」與「單一價格法則」強烈辯護，論證為什麼在絕大多數競爭市場中，價格能神速反映真實價值。</td>
            </tr>
            <tr>
              <td><strong>Shleifer & Vishny (1997, 2000)</strong></td>
              <td><em>Limits of Arbitrage</em><br>《套利的極限與行為金融》</td>
              <td><strong>現實世界的清醒劑！</strong> 揭示了在真實世界中，套利者也需要借錢（槓桿）、面臨市場非理性維持太久的爆倉風險，解釋了金融危機與泡沫成因。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 第十節：術語字典庫與頁碼索引 -->
    <section id="glossary">
      <h2>📚 必背英漢專業術語字典庫（含原書頁碼對照）</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>英文專有名詞 (Key Term)</th>
              <th>繁體中文</th>
              <th>原書頁碼</th>
              <th>15歲極簡秒懂比喻與核心公式</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Valuation Principle</strong></td>
              <td>評價原則</td>
              <td>p. 68</td>
              <td>不管老闆喜不喜歡，以市場拍賣所公定價為準（價值 = 競爭市場價格）</td>
            </tr>
            <tr>
              <td><strong>Competitive Market</strong></td>
              <td>競爭市場</td>
              <td>p. 67</td>
              <td>買進價跟賣出價完全相同的透明市集，無個人偏見影響</td>
            </tr>
            <tr>
              <td><strong>Time Value of Money</strong></td>
              <td>貨幣時間價值</td>
              <td>p. 69</td>
              <td>今天的錢大於未來的錢，時間會讓金幣生利息；(1 + r) 是穿越時間的匯率</td>
            </tr>
            <tr>
              <td><strong>Risk-Free Interest Rate</strong></td>
              <td>無風險利率</td>
              <td>p. 70</td>
              <td>絕對不會倒閉的時光穿梭基準匯率</td>
            </tr>
            <tr>
              <td><strong>Interest Rate Factor</strong></td>
              <td>利率因子</td>
              <td>p. 70</td>
              <td>(1 + r)，把今天的 1 塊錢推向未來的換算倍數</td>
            </tr>
            <tr>
              <td><strong>Present Value (PV)</strong></td>
              <td>現值</td>
              <td>p. 71</td>
              <td>把未來的金幣拉回今天口袋值多少：PV = FV ÷ (1 + r)</td>
            </tr>
            <tr>
              <td><strong>Future Value (FV)</strong></td>
              <td>終值</td>
              <td>p. 71</td>
              <td>今天的金幣放在未來會長大成多少：FV = PV × (1 + r)</td>
            </tr>
            <tr>
              <td><strong>Discount Factor / Rate</strong></td>
              <td>折現因子 / 折現率</td>
              <td>p. 71</td>
              <td>折現因子為 1 ÷ (1 + r)；折現率為評估未來現金流的折算利率</td>
            </tr>
            <tr>
              <td><strong>Net Present Value (NPV)</strong></td>
              <td>淨現值</td>
              <td>p. 72</td>
              <td>扣除成本後，今天立刻多放進口袋的淨現金：NPV = PV(效益) - PV(成本)</td>
            </tr>
            <tr>
              <td><strong>NPV Decision Rule</strong></td>
              <td>NPV 決策法則</td>
              <td>p. 73</td>
              <td>接受所有 NPV > 0 的專案；在互斥專案中永遠選 NPV 最高的！</td>
            </tr>
            <tr>
              <td><strong>Arbitrage / Arbitrage Opportunity</strong></td>
              <td>套利 / 套利機會</td>
              <td>p. 76</td>
              <td>遊戲中零風險、零自備款的合法刷錢機制（正 NPV 免費午餐）</td>
            </tr>
            <tr>
              <td><strong>Law of One Price (LOOP)</strong></td>
              <td>單一價格法則</td>
              <td>p. 77</td>
              <td>一模一樣的兩樣東西在競爭市場中必只有一個相同價格</td>
            </tr>
            <tr>
              <td><strong>Financial Security / Security</strong></td>
              <td>金融證券</td>
              <td>p. 77</td>
              <td>在金融市場中交易、承諾未來特定現金流的合約</td>
            </tr>
            <tr>
              <td><strong>Bond</strong></td>
              <td>債券</td>
              <td>p. 78</td>
              <td>發行方承諾在未來特定時間還本付息的借貸憑據</td>
            </tr>
            <tr>
              <td><strong>Portfolio</strong></td>
              <td>投資組合</td>
              <td>p. 78</td>
              <td>把一籃子不同的證券或資產打包放在一起的組合包</td>
            </tr>
            <tr>
              <td><strong>Normal Market</strong></td>
              <td>正常市場</td>
              <td>p. 79</td>
              <td>沒有任何套利機會存活的均衡競爭市場</td>
            </tr>
            <tr>
              <td><strong>No-Arbitrage Price</strong></td>
              <td>無套利價格</td>
              <td>p. 79</td>
              <td>金融證券未來所有現金流折現回今天的總和：Price = PV(All Future CFs)</td>
            </tr>
            <tr>
              <td><strong>Short Sale</strong></td>
              <td>賣空（融券放空）</td>
              <td>p. 79</td>
              <td>手上沒貨借來賣，太貴時用來痛擊高價的招式（先借先賣，未來歸還）</td>
            </tr>
            <tr>
              <td><strong>Separation Principle</strong></td>
              <td>分離原則</td>
              <td>p. 82</td>
              <td>做實體投資（蓋廠）跟怎麼籌錢（融資）完全分開評估，因為金融交易 NPV = 0</td>
            </tr>
            <tr>
              <td><strong>Value Additivity</strong></td>
              <td>價值加總性</td>
              <td>p. 83</td>
              <td>組合包的價格等於各個單品價格直接相加：Price(A+B) = Price(A) + Price(B)</td>
            </tr>
            <tr>
              <td><strong>Return</strong></td>
              <td>投資報酬率</td>
              <td>p. 70</td>
              <td>投資獲得的淨利潤佔初始投入成本的百分比：(期末收益 - 成本) ÷ 成本</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  
    <!-- 第九節：冒險者公會期中封神試煉——Chapter 3 深度期中模擬試卷 (20 題) -->
    <section id="midterm-exam" style="border: 2px solid #8b5cf6; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #2e1065 0%, #5b21b6 50%, #7c3aed 100%); color: #ffffff; padding: 1.8rem 2rem; border-radius: var(--radius); margin-bottom: 2rem; box-shadow: var(--shadow);">
        <div style="display:inline-block; background:rgba(255,255,255,0.2); color:#fef08a; font-weight:700; font-size:0.82rem; padding:0.25rem 0.8rem; border-radius:20px; text-transform:uppercase; margin-bottom:0.8rem;">
          ⚔️ 🏆 Berk &amp; DeMarzo Ch 3 期中封神大典
        </div>
        <h2 style="color:#ffffff; margin:0 0 0.8rem; border:none; padding:0; font-size:1.85rem;">
          Chapter 3：財務決策與單一價格法則 · 20 題高難度期中模擬大殿
        </h2>
        <p style="color:#e9d5ff; font-size:1.05rem; margin:0; line-height:1.6;">
          恭喜大掌櫃來到全書最重要的<strong>定價地基試煉場</strong>！本試卷涵蓋<strong>競爭市場客觀價值、時間匯率跨期折現、NPV 決策黃金法則、套利四步連環計、單一價格法則 (LOOP)、價值加總性 (Value Additivity)、無套利零息債券定價</strong>與<strong>費雪分離定理</strong>。題目深具陷阱與計算難度，請全力迎戰！
        </p>
      </div>

      <!-- 控制面板與段位橫幅 -->
      <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 1.2rem 1.5rem; margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.95rem; color: #4c1d95;">
          <strong>試卷結構：</strong> 10 題深度策略選擇題（每題 5 分）＋ 10 題高階計算與論述填充題（每題 5 分）＝ 滿分 100 分<br>
          <strong>榮譽段位：</strong> 90+ 傳奇公會大掌櫃 ｜ 75-89 皇家特許理財魔導師 ｜ 60-74 資深行會管事 ｜ &lt;60 重回新手村研讀
        </div>
        <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
          <button class="btn" style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color:white; border:none; padding:0.75rem 1.4rem; font-weight:700; border-radius:8px; cursor:pointer;" onclick="checkAllCh03ExamAnswers()">
            <span>🎯 一鍵智能批改試卷並評定公會段位</span>
          </button>
          <button class="btn" style="background: linear-gradient(135deg, #475569 0%, #334155 100%); color:white; border:none; padding:0.75rem 1.4rem; font-weight:700; border-radius:8px; cursor:pointer;" onclick="skipAndRevealAllCh03Answers()">
            <span>⏩ 略過（直接填入標準答案並展開解剖思路）</span>
          </button>
        </div>
      </div>
      <div id="ch03-exam-score-banner" style="display:none; margin-bottom:2rem; padding:1.2rem 1.5rem; border-radius:8px; font-weight:700;"></div>

      <!-- 第一戰區：10 題策略選擇題 -->
      <h3 style="color: #6d28d9; border-bottom: 2px solid #ddd6fe; padding-bottom: 0.5rem; margin-top: 1rem;">
        第一戰區：十道策略與陷阱選擇題 (Part A: 10 Multiple-Choice Questions, 50%)
      </h3>

      <!-- MCQ 1 -->
      <div class="problem-card" id="ch3-mcq-box-1" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 01</span>
          競爭市場客觀價值 vs 掌櫃個人主觀偏好
        </div>
        <p>
          【情境題】公會的大掌櫃個人極度討厭生魚片（主觀價值評估為 \$0）。今天公會舉辦慶功宴，有商人以 \$80 的價格向公會兜售一張高檔日料自助餐券。已知在公開自由的「冒險者二手票券交易所」中，該餐券的即時市價穩定為 <strong>\$100</strong>。依據財務學第一章與第三章的<strong>客觀市場價格原則</strong>，大掌櫃最理性的決策應該是什麼？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq1" value="A"> A. 堅決拒絕購買，因為大掌櫃個人吃生魚片的效用為負，買了就是浪費金幣</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq1" value="B"> B. 以 \$80 買下該餐券，並立即在公開市場上以 \$100 轉售，為公會無風險淨賺 \$20 的客觀市場價值</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq1" value="C"> C. 買下餐券並強迫公會新手吃掉，因為個人主觀偏好永遠高於市場客觀價格</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq1" value="D"> D. 該決策在財務上淨現值為負 (\$0 - \$80 = -\$80)，任何理性財務長皆不應執行</label>
        </div>
        <details class="solution-details" id="ch3-sol-mcq-1" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【精髓剖析】</strong>財務學決策的第一核心定律：<strong>在競爭市場中，商品的客觀價值是由市場價格決定的，完全獨立於決策者的個人主觀偏好！</strong>只要可以用低於市場價格 (\$80) 買進具備更高市場流動價值 (\$100) 的資產，就能透過市場轉售創造 $\text{NPV} = \$100 - \$80 = +\$20$ 的客觀財富！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 2 -->
      <div class="problem-card" id="ch3-mcq-box-2" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 02</span>
          時間匯率折現與跨期套利之本質
        </div>
        <p>
          【情境題】無風險利率為 $r = 8\%$。某專案承諾在<strong>一年後確定支付 \$108,000</strong>。某位不懂財務的冒險商人向你推銷此專案，宣稱現在只要投入 <strong>\$101,000</strong>，就能淨賺 \$7,000 大發利市。請問該專案的淨現值 (NPV) 是多少？正確的財務決策為何？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq2" value="A"> A. $\text{NPV} = +\$7,000$，應立即接受該投資</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq2" value="B"> B. $\text{NPV} = -\$1,000$，應拒絕該投資，因為一年後的 \$108,000 在今天的現值僅為 \$100,000</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq2" value="C"> C. $\text{NPV} = +\$1,000$，應立即接受該投資</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq2" value="D"> D. $\text{NPV} = \$0$，該專案與銀行存款毫無差別</label>
        </div>
        <details class="solution-details" id="ch3-sol-mcq-2" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【精髓剖析】</strong>跨期現金流不能直接相減！一年後的 \$108,000 必須以無風險利率 $r=8\%$ 折現回今天：<br>
            $$\text{PV} = \frac{\$108,000}{1 + 0.08} = \frac{\$108,000}{1.08} = \mathbf{\$100,000}$$<br>
            專案淨現值：$$\text{NPV} = \text{PV} - \text{Cost} = \$100,000 - \$101,000 = \mathbf{-\$1,000}$$<br>
            投入 \$101,000 只換來價值 \$100,000 的資產，相當於白白蒸發 \$1,000 現金，必須斷然拒絕！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 3 -->
      <div class="problem-card" id="ch3-mcq-box-3" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 03</span>
          套利連環計：黃金期現貨無風險套利四步操作
        </div>
        <p>
          【情境題】無風險年利率為 $r = 5\%$。目前市場上黃金現貨即時價格為 <strong>每盎司 \$1,000</strong>，而一年後交割的黃金期貨合約交易價格為 <strong>每盎司 \$1,080</strong>（且無任何倉儲成本）。此時市場存在嚴重的套利機會！作為傳奇掌櫃，你該如何建構<strong>無本無風險套利策略 (Arbitrage Strategy)</strong>？每一盎司可淨賺多少？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq3" value="A"> A. 借入黃金現貨賣出，存入銀行，同時買進期貨合約；每盎司淨賺 \$30</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq3" value="B"> B. 向銀行無本借入 \$1,000 現金，買進黃金現貨，同時在期貨市場以 \$1,080 簽約放空賣出；一年後淨賺 \$30</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq3" value="C"> C. 買進黃金現貨並持有，不作任何避險；一年後賺取 \$80 價差</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq3" value="D"> D. 向銀行借入 \$1,080 購買期貨，一年後每盎司現值損失 \$28.57</label>
        </div>
        <details class="solution-details" id="ch3-sol-mcq-3" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【四步套利拆解 Cash and Carry Arbitrage】</strong></p>
            <ol>
              <li>今天向銀行借款 \$1,000（利率 5%），現金淨流入 +\$1,000。</li>
              <li>以 \$1,000 在現貨市場買入 1 盎司黃金，現金流出 -\$1,000（今天淨現金流 = \$0，完全無本！）。</li>
              <li>簽訂一年期期貨合約，鎖定一年後以 \$1,080 賣出 1 盎司黃金。</li>
              <li>一年後：履行期貨交付黃金獲得現金 +\$1,080；償還銀行本息 $\$1,000 \times 1.05 = \$1,050$。</li>
              <li><strong>一年後鎖定無風險純利：</strong>$$\$1,080 - \$1,050 = \mathbf{+\$30}$$（換算今天現值為 $\$30 \div 1.05 = \mathbf{\$28.57}$）！</li>
            </ol>
          </div>
        </details>
      </div>

      <!-- MCQ 4 -->
      <div class="problem-card" id="ch3-mcq-box-4" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 04</span>
          單一價格法則 (LOOP) 與無套利定價之推論
        </div>
        <p>
          【情境題】下列關於<strong>單一價格法則 (Law of One Price, LOOP)</strong> 與無套利原則的敘述，<strong>何者在財務學上是完全錯誤的陷阱陳述？</strong>
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq4" value="A"> A. 若兩個投資組合在未來的任何可能經濟狀態下，都產生完全相同的現金流，則兩者在今天的市場價格必須完全相等</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq4" value="B"> B. 單一價格法則的成立完全依賴全體投資人都必須具備相同的風險偏好與效用函數，否則該法則將徹底失效</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq4" value="C"> C. 只要市場上存在少數貪婪且具備資金動員力的套利者，他們的買低賣高行為就會迅速抹平價差，推動價格回歸無套利均衡</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq4" value="D"> D. 價值加總性 (Value Additivity) 是單一價格法則的直接必然推論，即組合資產的價格等於各單項資產價格的總和</label>
        </div>
        <details class="solution-details" id="ch3-sol-mcq-4" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B（此陳述為錯誤）】</strong></p>
            <p><strong>【深度辨析】</strong>單一價格法則的偉大之處，就在於它<strong>完全不需要假設投資人的風險偏好或主觀效用</strong>！無論你是極度厭惡風險還是熱愛賭博，沒有人會拒絕「白撿的無風險利潤 (Free Money)」。只要有價差，套利力量就會瞬間抹平它，因此選項 B 是錯誤的假命題！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 5 -->
      <div class="problem-card" id="ch3-mcq-box-5" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 05</span>
          複製投資組合 (Replicating Portfolio) 定價之實戰
        </div>
        <p>
          【情境題】無風險年利率為 $r = 6\%$。現有一種「冒險安全合約」，承諾在一年後無論發生何種情況皆確定給付 <strong>\$1,060</strong>。依據複製投資組合法，該合約今天的客觀無套利公允價格為：
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq5" value="A"> A. \$1,000</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq5" value="B"> B. \$1,060</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq5" value="C"> C. \$1,123.60</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq5" value="D"> D. \$943.40</label>
        </div>
        <details class="solution-details" id="ch3-sol-mcq-5" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：A】</strong></p>
            <p><strong>【複製組合演算】</strong>我們可以在今天向銀行存入 \$1,000，一年後連本帶利剛好產生 $\$1,000 \times (1 + 0.06) = \$1,060$！因為該存款組合的現金流與該合約 100% 相同，依單一價格法則，該合約今天的價格必須完全等於該複製組合的成本：$$\text{Price} = \frac{\$1,060}{1.06} = \mathbf{\$1,000}$$</p>
          </div>
        </details>
      </div>

      <!-- MCQ 6 -->
      <div class="problem-card" id="ch3-mcq-box-6" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 06</span>
          費雪分離定理 (Fisher Separation Theorem) 之真諦
        </div>
        <p>
          【情境題】一家上市公司擁有數萬名股東，有的股東是急需用錢辦婚禮的年輕人，有的股東是希望 30 年後才提款的長線退休基金。關於<strong>費雪分離定理 (Separation Principle)</strong>，下列哪一項結論最能指導 CEO 的財務決策？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq6" value="A"> A. CEO 必須對全體股東進行民意調查，妥協折中選擇一個迎合多數人跨期消費偏好的投資期限</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq6" value="B"> B. CEO 只需要專注於一件事：<strong>「最大化企業的淨現值 (NPV)」</strong>；個別股東可以透過發達的金融市場自行進行借貸與儲蓄，將財富調整至各自理想的跨期消費路徑</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq6" value="C"> C. 企業必須拒絕所有正 NPV 但投資期超過 3 年的專案，以保障急需用錢股東的權益</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq6" value="D"> D. 資本市場的借貸利率會隨股東個人主觀偏好波動，導致企業無法客觀計算 NPV</label>
        </div>
        <details class="solution-details" id="ch3-sol-mcq-6" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【概念真諦】</strong>這正是現代企業制度的立基之石——<strong>費雪分離定理</strong>！公司的投資決策（最大化財富蛋糕 NPV）與股東個人的消費選擇徹底分離。只要經理人把 NPV 最大化，股東無論想今天花光（透支借款）還是 20 年後花（存款放貸），都能借助金融市場達到最佳滿意度！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 7 -->
      <div class="problem-card" id="ch3-mcq-box-7" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 07</span>
          無套利零息債券推導無風險利率
        </div>
        <p>
          【情境題】市場上有一檔一年期無風險零息公債（到期面額 \$1,000），目前的市場交易價格為 <strong>\$943.40</strong>。依據無套利定價理論，當前市場隱含的<strong>無風險年利率 (Risk-Free Interest Rate)</strong> 最接近多少？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq7" value="A"> A. 5.66%</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq7" value="B"> B. 6.00%</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq7" value="C"> C. 6.36%</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq7" value="D"> D. 5.00%</label>
        </div>
        <details class="solution-details" id="ch3-sol-mcq-7" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【精準計算】</strong><br>
            $$\text{Price} = \frac{\text{Face Value}}{1 + r_f} \implies \$943.40 = \frac{\$1,000}{1 + r_f}$$<br>
            $$1 + r_f = \frac{\$1,000}{\$943.40} \approx 1.0599957 \implies r_f \approx \mathbf{6.00\%}$$</p>
          </div>
        </details>
      </div>

      <!-- MCQ 8 -->
      <div class="problem-card" id="ch3-mcq-box-8" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 08</span>
          價值加總性 (Value Additivity) 與分割組合溢價陷阱
        </div>
        <p>
          【情境題】某投資銀行向你推銷一個絕妙點子：將資產 A（市價 \$40）與資產 B（市價 \$60）打包成「超級豪華雙重收益包 C」，並在市場上以 <strong>\$115</strong> 發行出售。如果金融市場是完全競爭且無交易摩擦的，依據單一價格法則，這個 \$115 的價格將引發什麼市場反應？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq8" value="A"> A. 該包裝創造了巨大的協同價值，\$115 是合理的無套利均衡價格</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq8" value="B"> B. 套利者會買進個別資產 A 與 B（總成本 \$100），組裝後以 \$115 賣出組合 C，此套利賣壓將迅速迫使 C 的價格回落至 \$100</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq8" value="C"> C. 套利者會放空資產 A 與 B，同時買進組合 C，鎖定無風險利潤</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq8" value="D"> D. 資產 A 與 B 的市價會立刻自動上漲到 \$50 與 \$65，以迎合 C 的價格</label>
        </div>
        <details class="solution-details" id="ch3-sol-mcq-8" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【價值加總性原理】</strong>單純的組裝或拆分無法無中生有創造價值！$$\text{Price}(A+B) = \text{Price}(A) + \text{Price}(B) = \$40 + \$60 = \mathbf{\$100}$$。一旦有人敢掛 \$115 賣，全世界的套利者都會去市場花 \$100 買材料組裝並以 \$115 倒貨，每包無本現賺 \$15，直到組合價格跌回 \$100 為止！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 9 -->
      <div class="problem-card" id="ch3-mcq-box-9" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 09</span>
          NPV 決策準則與零淨現值專案
        </div>
        <p>
          【情境題】在完全競爭的證券市場中進行正常股票或債券的買賣，其淨現值 (NPV) 通常等於多少？這代表了什麼財務意涵？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq9" value="A"> A. $\text{NPV} > 0$，因為買股票總是能賺大錢</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq9" value="B"> B. $\text{NPV} < 0$，因為券商會收取手續費摧毀價值</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq9" value="C"> C. $\text{NPV} = 0$，代表交易價格完全反映了該證券的公允現值，投資人支付了公允對價，賺取與其承擔風險相對應的正常必要報酬率</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq9" value="D"> D. $\text{NPV}$ 無法計算，因為證券價格每秒都在跳動</label>
        </div>
        <details class="solution-details" id="ch3-sol-mcq-9" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：C】</strong></p>
            <p><strong>【深層洞察】</strong>很多新手誤以為 $\text{NPV} = 0$ 是「沒賺錢不用做」。錯！在競爭市場中，正常證券定價都是 $\text{NPV} = 0$（公允交易 Fair Trade）。它代表的是你沒有被坑（沒買貴），也沒有撿到免費午餐（沒買便宜），投資人獲得了剛好補償時間價值與風險的市場公平報酬！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 10 -->
      <div class="problem-card" id="ch3-mcq-box-10" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 10</span>
          風險溢酬 (Risk Premium) 與風險資產折現率
        </div>
        <p>
          【情境題】無風險年利率為 $r_f = 4\%$。某項生技新藥研發專案具有高度市場風險，預估一年後的期望現金流入為 <strong>\$120,000</strong>。市場上類似風險特徵之資產所要求的<strong>風險溢酬 (Risk Premium)</strong> 為 $6\%$。請問評估該專案時適用的<strong>資金成本 (折現率 $r$)</strong> 以及該期望現金流的公允現值分別為何？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq10" value="A"> A. 折現率 $r = 4\%$；現值 \$115,385</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq10" value="B"> B. 折現率 $r = 6\%$；現值 \$113,208</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq10" value="C"> C. 折現率 $r = 10\%$；現值 \$109,091</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c3_mcq10" value="D"> D. 折現率 $r = 2\%$；現值 \$117,647</label>
        </div>
        <details class="solution-details" id="ch3-sol-mcq-10" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：C】</strong></p>
            <p><strong>【公式拆解】</strong><br>
            1. 風險資產的總必要報酬率（折現率）= 無風險利率 $+$ 風險溢酬：<br>
            $$r = r_f + \text{Risk Premium} = 4\% + 6\% = \mathbf{10\%}$$<br>
            2. 公允現值折現：<br>
            $$\text{PV} = \frac{\mathbb{E}[C_1]}{1 + r} = \frac{\$120,000}{1 + 0.10} = \frac{\$120,000}{1.10} \approx \mathbf{\$109,091}$$</p>
          </div>
        </details>
      </div>

      <!-- 第二戰區：10 題高難度計算與論述填充題 -->
      <h3 style="color: #6d28d9; border-bottom: 2px solid #ddd6fe; padding-bottom: 0.5rem; margin-top: 3.5rem;">
        第二戰區：十道深水演算與精準填空題 (Part B: 10 Fill-in-the-Blank &amp; Calculation Problems, 50%)
      </h3>

      <!-- Blank 1 -->
      <div class="problem-card" id="ch3-blank-box-1" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 01</span>
          專案 NPV 精密折現與決策
        </div>
        <p>
          【計算題】無風險利率為 $r = 5\%$。某冒險公會考慮引進一套矮人自動採礦機，今日需一次性支付成本 <strong>\$180,000</strong>。該機具預計於一年後確定帶來 <strong>\$200,000</strong> 的無風險金幣產出。該專案在今天的<strong>淨現值 (NPV)</strong> 為 <input type="text" id="c3_fb1" style="width:140px; font-weight:700; text-align:center;" placeholder="填入正負金額"> 元（請四捨五入至小數點後兩位）。依據 NPV 法則，公會大掌櫃應 <input type="text" id="c3_fb1_act" style="width:90px; font-weight:700; text-align:center;" placeholder="接受/拒絕"> 該項專案。
        </p>
        <details class="solution-details" id="ch3-sol-fb-1" style="margin-top:0.8rem;">
          <summary>💡 展開推導步驟</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：10476.19 (或 +10,476.19) ｜ 接受】</strong></p>
            <p>
              $$\text{PV} = \frac{\$200,000}{1.05} \approx \$190,476.19$$<br>
              $$\text{NPV} = \text{PV} - \text{Cost} = \$190,476.19 - \$180,000 = \mathbf{+\$10,476.19}$$<br>
              因為 $\text{NPV} > 0$，能為公會創造相當於今天立即入袋 \$10,476.19 的純財富，故應「接受 (Accept)」！
            </p>
          </div>
        </details>
      </div>

      <!-- Blank 2 -->
      <div class="problem-card" id="ch3-blank-box-2" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 02</span>
          無套利遠期匯率與利息平價 (IRP)
        </div>
        <p>
          【計算題】已知美金無風險年利率為 $r_{USD} = 4\%$，歐元無風險年利率為 $r_{EUR} = 2\%$。今日歐元兌美金的即期匯率 (Spot Rate) 為 <strong>1 歐元 = 1.10 美元</strong>。依據單一價格法則與無套利原則，一年期歐元兌美金的<strong>無套利遠期匯率 (Forward Rate)</strong> 應為 1 歐元 = <input type="text" id="c3_fb2" style="width:130px; font-weight:700; text-align:center;" placeholder="填入遠期匯率"> 美元。（請計算至小數點後四位）
        </p>
        <details class="solution-details" id="ch3-sol-fb-2" style="margin-top:0.8rem;">
          <summary>💡 展開推導步驟</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：1.1216 (或 1.1215)】</strong></p>
            <p>
              依據拋補利率平價公式 (Covered Interest Parity, CIP)：<br>
              $$F = S \times \frac{1 + r_{USD}}{1 + r_{EUR}} = 1.10 \times \frac{1 + 0.04}{1 + 0.02} = 1.10 \times \frac{1.04}{1.02} \approx \mathbf{1.121568 \approx 1.1216}$$
            </p>
          </div>
        </details>
      </div>

      <!-- Blank 3 -->
      <div class="problem-card" id="ch3-blank-box-3" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 03</span>
          多期債券價值加總定價 (Value Additivity)
        </div>
        <p>
          【計算題】市場上有兩檔無風險零息公債：<br>
          • 一年期零息債券（到期面額 \$1,000）市價為 <strong>\$950</strong>；<br>
          • 兩年期零息債券（到期面額 \$1,000）市價為 <strong>\$890</strong>。<br>
          現有一檔「兩年期附息公債」，面額 \$1,000，每年底支付票面利息 <strong>\$60</strong>，並於第二年底償還本金 \$1,000。依據<strong>價值加總性 (Value Additivity)</strong>，這檔附息公債在今天的客觀公允市價應為 <input type="text" id="c3_fb3" style="width:130px; font-weight:700; text-align:center;" placeholder="填入公允價格"> 元。
        </p>
        <details class="solution-details" id="ch3-sol-fb-3" style="margin-top:0.8rem;">
          <summary>💡 展開推導步驟</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：1000.40 (或 1000.4)】</strong></p>
            <p>
              將附息公債拆解為兩筆確定現金流的線性組合：<br>
              1. 第一年底的 \$60 利息：相當於 $0.06$ 單位的一年期零息債券 $\to$ 現值 = $\$60 \times \frac{\$950}{\$1,000} = \$60 \times 0.95 = \mathbf{\$57.00}$<br>
              2. 第二年底的 \$1,060 本息：相當於 $1.06$ 單位的兩年期零息債券 $\to$ 現值 = $\$1,060 \times \frac{\$890}{\$1,000} = \$1,060 \times 0.89 = \mathbf{\$943.40}$<br>
              3. 依價值加總性相加：$$\text{Price} = \$57.00 + \$943.40 = \mathbf{\$1,000.40}$$
            </p>
          </div>
        </details>
      </div>

      <!-- Blank 4 -->
      <div class="problem-card" id="ch3-blank-box-4" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 04</span>
          套利無本借貸與現值即時套現
        </div>
        <p>
          【計算題】無風險年利率為 $r = 10\%$。某專案今天需投入成本 <strong>\$1,000 萬</strong>，一年後確定產生現金流入 <strong>\$1,210 萬</strong>。掌櫃若在今天完全不掏出自己的任何一毛本金，直接以專案未來的現金流為抵押向銀行借款，則大掌櫃在<strong>「今天」</strong>最多可以立即套現出多少純現金裝進自己口袋？答案為 <input type="text" id="c3_fb4" style="width:130px; font-weight:700; text-align:center;" placeholder="填入百萬金額"> 萬元。
        </p>
        <details class="solution-details" id="ch3-sol-fb-4" style="margin-top:0.8rem;">
          <summary>💡 展開推導步驟</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：100 (或 100萬 / 100.00)】</strong></p>
            <p>
              1. 一年後產出的 \$1,210 萬，在今天最多可向銀行抵押借出：<br>
              $$\text{Borrowing Amount} = \frac{\$1,210 \text{ 萬}}{1 + 0.10} = \mathbf{\$1,100 \text{ 萬}}$$<br>
              2. 今天收到借款 \$1,100 萬，支付專案成本 \$1,000 萬，剩餘：$$\$1,100 \text{ 萬} - \$1,000 \text{ 萬} = \mathbf{+\$100 \text{ 萬元}}$$！<br>
              3. 一年後專案產生的 \$1,210 萬剛好全數償還銀行本息（$\$1,100 \text{ 萬} \times 1.10 = \$1,210 \text{ 萬}$）。今天淨賺的 \$100 萬正是該專案的 NPV！
            </p>
          </div>
        </details>
      </div>

      <!-- Blank 5 -->
      <div class="problem-card" id="ch3-blank-box-5" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 05</span>
          單一價格法則英文專有名詞
        </div>
        <p>
          【填空題】在無摩擦的完全競爭市場中，兩項能產生完全相同未來現金流量的資產，其交易價格必然完全相等的財務學核心基石定律，其英文全名為「<input type="text" id="c3_fb5" style="width:230px; font-weight:700; text-align:center;" placeholder="輸入英文全稱"> (LOOP)」。
        </p>
        <details class="solution-details" id="ch3-sol-fb-5" style="margin-top:0.8rem;">
          <summary>💡 展開解答</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：Law of One Price / Law of one price】</strong></p>
            <p>即單一價格法則，縮寫為 LOOP。</p>
          </div>
        </details>
      </div>

      <!-- Blank 6 -->
      <div class="problem-card" id="ch3-blank-box-6" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 06</span>
          套利定義之三大神聖條件
        </div>
        <p>
          【填空題】嚴格的「套利 (Arbitrage)」在財務學上是指在不承擔任何 <input type="text" id="c3_fb6_1" style="width:90px; font-weight:700; text-align:center;" placeholder="填入二字">（Risk）、且完全不需要投入任何自有 <input type="text" id="c3_fb6_2" style="width:90px; font-weight:700; text-align:center;" placeholder="填入二字">（Capital）的前提下，鎖定純現金淨利潤的交易策略。
        </p>
        <details class="solution-details" id="ch3-sol-fb-6" style="margin-top:0.8rem;">
          <summary>💡 展開解答</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：風險 ｜ 資本 (或本金 / 資金)】</strong></p>
            <p>套利即「無風險 (Zero Risk)」且「無本 (Zero Capital)」的免費午餐。</p>
          </div>
        </details>
      </div>

      <!-- Blank 7 -->
      <div class="problem-card" id="ch3-blank-box-7" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 07</span>
          無套利定價之複製資產組合術語
        </div>
        <p>
          【填空題】為了給一項複雜且沒有現成市價的新證券定價，財務工程師利用市場上已存在且有公開報價的其他證券，拼裝組合出一個在未來每一種狀態下現金流皆與該新證券完全吻合的資產組合，此組合在學術上稱為「<input type="text" id="c3_fb7" style="width:230px; font-weight:700; text-align:center;" placeholder="中文或英文術語"> (Replicating Portfolio)」。
        </p>
        <details class="solution-details" id="ch3-sol-fb-7" style="margin-top:0.8rem;">
          <summary>💡 展開解答</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：複製投資組合 / 複製組合 / Replicating Portfolio】</strong></p>
            <p>複製組合的成本即為該目標資產的無套利公允價格。</p>
          </div>
        </details>
      </div>

      <!-- Blank 8 -->
      <div class="problem-card" id="ch3-blank-box-8" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 08</span>
          折現因子 (Discount Factor) 與利率的倒數關係
        </div>
        <p>
          【計算題】若一年期無風險利率為 $r = 4\%$，則對應的一年期無風險折現因子（Discount Factor, 即一年後支付 1 元在今天的現值）為 <input type="text" id="c3_fb8" style="width:120px; font-weight:700; text-align:center;" placeholder="填入小數點四位">。（請計算至小數點後四位）
        </p>
        <details class="solution-details" id="ch3-sol-fb-8" style="margin-top:0.8rem;">
          <summary>💡 展開推導步驟</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：0.9615】</strong></p>
            <p>
              $$\text{Discount Factor} = \frac{1}{1 + r} = \frac{1}{1.04} \approx \mathbf{0.961538 \approx 0.9615}$$
            </p>
          </div>
        </details>
      </div>

      <!-- Blank 9 -->
      <div class="problem-card" id="ch3-blank-box-9" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 09</span>
          費雪分離定理英文核心術語
        </div>
        <p>
          【填空題】指出「企業管理層的投資決策應僅致力於最大化公司市場價值 (NPV)，而與個別股東的主觀跨期消費偏好相互獨立」的著名經濟學定理為「<input type="text" id="c3_fb9" style="width:230px; font-weight:700; text-align:center;" placeholder="輸入定理中文或英文名"> (Separation Principle / Theorem)」。
        </p>
        <details class="solution-details" id="ch3-sol-fb-9" style="margin-top:0.8rem;">
          <summary>💡 展開解答</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：費雪分離定理 / 分離原則 / Fisher Separation Theorem】</strong></p>
            <p>由經濟學家歐文·費雪 (Irving Fisher) 於 1930 年提出。</p>
          </div>
        </details>
      </div>

      <!-- Blank 10 -->
      <div class="problem-card" id="ch3-blank-box-10" style="margin-bottom:1.8rem; border-left:4px solid #7c3aed;">
        <div style="font-weight:700; font-size:1.1rem; color:#4c1d95; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#6d28d9; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 10</span>
          競爭市場淨現值決策的終極黃金法則
        </div>
        <p>
          【填空題】在評估任何商業投資專案時，財務決策的黃金金律為：當且僅當專案的淨現值滿足「<input type="text" id="c3_fb10" style="width:140px; font-weight:700; text-align:center;" placeholder="填寫數學條件，如 NPV > 0">」時，該決策才能為企業股東創造真實的淨財富，此時應當果斷接受該專案。
        </p>
        <details class="solution-details" id="ch3-sol-fb-10" style="margin-top:0.8rem;">
          <summary>💡 展開解答</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：NPV > 0 / 大於零 / NPV大于0】</strong></p>
            <p>NPV > 0 代表產出效益折現大於投入成本，能實質增加企業價值。</p>
          </div>
        </details>
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

  // ==========================================
  // Chapter 3 期中模擬試卷 批改與略過交互邏輯
  // ==========================================
  const ch3McqAnswers = {
    c3_mcq1: "B",
    c3_mcq2: "B",
    c3_mcq3: "B",
    c3_mcq4: "B",
    c3_mcq5: "A",
    c3_mcq6: "B",
    c3_mcq7: "B",
    c3_mcq8: "B",
    c3_mcq9: "C",
    c3_mcq10: "C"
  };

  function checkAllCh03ExamAnswers() {
    let score = 0;

    // 1. 檢查 MCQ 1 ~ 10
    for (let i = 1; i <= 10; i++) {
      const name = "c3_mcq" + i;
      const radios = document.getElementsByName(name);
      let selected = "";
      for (let r of radios) {
        if (r.checked) {
          selected = r.value;
          break;
        }
      }
      const box = document.getElementById("ch3-mcq-box-" + i);
      if (selected === ch3McqAnswers[name]) {
        score += 5;
        if (box) box.style.border = "2px solid #16a34a";
      } else {
        if (box) box.style.border = "2px solid #dc2626";
      }
    }

    // 2. 檢查填充題 1 ~ 10
    // Blank 1: 10476.19, 接受
    const fb1 = (document.getElementById('c3_fb1').value || '').replace(/[+,\$]/g, '').trim();
    const fb1_act = (document.getElementById('c3_fb1_act').value || '').trim();
    if ((fb1.startsWith("10476") || fb1.startsWith("10,476")) && (fb1_act.includes("接受") || fb1_act.toLowerCase().includes("accept"))) {
      score += 5;
      document.getElementById('ch3-blank-box-1').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-1').style.border = "2px solid #dc2626";
    }

    // Blank 2: 1.1216 (或 1.1215)
    const fb2 = (document.getElementById('c3_fb2').value || '').trim();
    if (fb2.startsWith("1.1215") || fb2.startsWith("1.1216")) {
      score += 5;
      document.getElementById('ch3-blank-box-2').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-2').style.border = "2px solid #dc2626";
    }

    // Blank 3: 1000.40 / 1000.4
    const fb3 = (document.getElementById('c3_fb3').value || '').replace(/[,]/g, '').trim();
    if (fb3.startsWith("1000.4") || fb3.startsWith("1,000.4")) {
      score += 5;
      document.getElementById('ch3-blank-box-3').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-3').style.border = "2px solid #dc2626";
    }

    // Blank 4: 100
    const fb4 = (document.getElementById('c3_fb4').value || '').trim();
    if (fb4.startsWith("100")) {
      score += 5;
      document.getElementById('ch3-blank-box-4').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-4').style.border = "2px solid #dc2626";
    }

    // Blank 5: Law of One Price / LOOP
    const fb5 = (document.getElementById('c3_fb5').value || '').trim().toLowerCase();
    if (fb5.includes("law of one price") || fb5.includes("單一價格") || fb5.includes("loop")) {
      score += 5;
      document.getElementById('ch3-blank-box-5').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-5').style.border = "2px solid #dc2626";
    }

    // Blank 6: 風險 ｜ 資本 / 本金
    const fb6_1 = (document.getElementById('c3_fb6_1').value || '').trim();
    const fb6_2 = (document.getElementById('c3_fb6_2').value || '').trim();
    if ((fb6_1.includes("風險") || fb6_1.toLowerCase().includes("risk")) && (fb6_2.includes("資") || fb6_2.includes("本") || fb6_2.toLowerCase().includes("capital"))) {
      score += 5;
      document.getElementById('ch3-blank-box-6').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-6').style.border = "2px solid #dc2626";
    }

    // Blank 7: 複製組合 / Replicating
    const fb7 = (document.getElementById('c3_fb7').value || '').trim().toLowerCase();
    if (fb7.includes("複製") || fb7.includes("replicat")) {
      score += 5;
      document.getElementById('ch3-blank-box-7').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-7').style.border = "2px solid #dc2626";
    }

    // Blank 8: 0.9615
    const fb8 = (document.getElementById('c3_fb8').value || '').trim();
    if (fb8.startsWith("0.9615")) {
      score += 5;
      document.getElementById('ch3-blank-box-8').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-8').style.border = "2px solid #dc2626";
    }

    // Blank 9: 費雪分離 / 分離原則 / Fisher
    const fb9 = (document.getElementById('c3_fb9').value || '').trim().toLowerCase();
    if (fb9.includes("費雪") || fb9.includes("分離") || fb9.includes("fisher") || fb9.includes("separation")) {
      score += 5;
      document.getElementById('ch3-blank-box-9').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-9').style.border = "2px solid #dc2626";
    }

    // Blank 10: NPV > 0 / 大於0
    const fb10 = (document.getElementById('c3_fb10').value || '').replace(/\s+/g, '').toLowerCase();
    if (fb10.includes(">0") || fb10.includes("大於0") || fb10.includes("大于0") || fb10.includes("大於零") || fb10.includes("大于零")) {
      score += 5;
      document.getElementById('ch3-blank-box-10').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch3-blank-box-10').style.border = "2px solid #dc2626";
    }

    // 評定段位
    const banner = document.getElementById("ch03-exam-score-banner");
    banner.style.display = "block";
    let rank = "";
    let rankColor = "";
    let comment = "";

    if (score >= 90) {
      rank = "👑 傳奇公會首席神掌櫃 (Legendary Arch-Arborist)";
      rankColor = "#15803d";
      banner.style.background = "#dcfce7";
      banner.style.border = "2px solid #86efac";
      comment = "震撼人心的表現！你對套利連環計、單一價格法則與價值加總性的理解已登峰造極，期中考勢必橫掃全場！";
    } else if (score >= 75) {
      rank = "⚔️ 皇家特許理財魔導師 (Royal Chartered Arborist)";
      rankColor = "#0369a1";
      banner.style.background = "#e0f2fe";
      banner.style.border = "2px solid #7dd3fc";
      comment = "優秀的定價功底！核心公式與無套利邏輯非常扎實，稍微注意多期債券與利率平價的小數點精度即可封神！";
    } else if (score >= 60) {
      rank = "🛡️ 資深行會管事 (Senior Guild Officer)";
      rankColor = "#d97706";
      banner.style.background = "#fef3c7";
      banner.style.border = "2px solid #fde68a";
      comment = "順利通過考核！但在無本借貸套現或複製組合的構造細節上略有猶豫，建議回顧前文的黃金期現貨套利實例！";
    } else {
      rank = "🌱 銅卡見習學徒 (Bronze Novice Apprentice)";
      rankColor = "#b91c1c";
      banner.style.background = "#fee2e2";
      banner.style.border = "2px solid #fca5a5";
      comment = "警報響起！基礎時間折現與無套利邏輯尚未融會貫通（紅框為失誤題目）。請點擊略過或展開思路詳讀考官推導！";
    }

    banner.innerHTML = `
      <div style="font-size:1.3rem; color:${rankColor}; margin-bottom:0.4rem;">
        試煉總得分：<strong>${score} / 100 分</strong> ｜ 榮譽封號：<strong>${rank}</strong>
      </div>
      <div style="font-size:0.95rem; color:#334155;">
        ${comment} (綠框標註為完全正確，紅框標註為答錯或未填，可點擊「展開考官解剖思路」查看詳盡公式演算！)
      </div>
    `;

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function skipAndRevealAllCh03Answers() {
    // 1. 自動勾選 MCQ 1 ~ 10 正確選項並展開思路
    for (let i = 1; i <= 10; i++) {
      const name = "c3_mcq" + i;
      const correctVal = ch3McqAnswers[name];
      const radios = document.getElementsByName(name);
      for (let r of radios) {
        if (r.value === correctVal) {
          r.checked = true;
        }
      }
      const box = document.getElementById("ch3-mcq-box-" + i);
      if (box) box.style.border = "2px solid #8b5cf6";

      const sol = document.getElementById("ch3-sol-mcq-" + i);
      if (sol) {
        sol.open = true;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([sol]);
        }
      }
    }

    // 2. 自動填入填充題 1 ~ 10 標準答案並展開思路
    const fills = {
      c3_fb1: "+10,476.19",
      c3_fb1_act: "接受",
      c3_fb2: "1.1216",
      c3_fb3: "1,000.40",
      c3_fb4: "100",
      c3_fb5: "Law of One Price",
      c3_fb6_1: "風險",
      c3_fb6_2: "資本",
      c3_fb7: "複製投資組合 (Replicating Portfolio)",
      c3_fb8: "0.9615",
      c3_fb9: "費雪分離定理 (Fisher Separation Theorem)",
      c3_fb10: "NPV > 0"
    };

    for (let id in fills) {
      const el = document.getElementById(id);
      if (el) {
        el.value = fills[id];
        el.style.backgroundColor = "#ede9fe";
        el.style.color = "#5b21b6";
      }
    }

    for (let j = 1; j <= 10; j++) {
      const box = document.getElementById("ch3-blank-box-" + j);
      if (box) box.style.border = "2px solid #8b5cf6";

      const sol = document.getElementById("ch3-sol-fb-" + j);
      if (sol) {
        sol.open = true;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([sol]);
        }
      }
    }

    // 3. 顯示橫幅提示
    const banner = document.getElementById("ch03-exam-score-banner");
    banner.style.display = "block";
    banner.style.background = "#f5f3ff";
    banner.style.border = "2px solid #8b5cf6";
    banner.innerHTML = `
      <div style="font-size:1.25rem; color:#6d28d9; margin-bottom:0.4rem;">
        ⏩ <strong>已啟動快捷模式：全卷標準答案已填入，解剖思路已全數為您展開！</strong>
      </div>
      <div style="font-size:0.95rem; color:#475569;">
        理解知識永遠比單純的考試分數更重要！您可以直接逐題研讀下方的詳細數學公式推導、套利四步表與法理背景，快速吸收 Chapter 3 的核心期中精華！
      </div>
    `;

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

</script>

</body>
</html>
'''

target_paths = [
    r"收件苗圃\學習講義合輯\Ch03_財務決策與單一價格法則_學習講義.html",
    r"C:\Users\閻星澄\Documents\WikiTree\收件苗圃\學習講義合集\Ch03_財務決策與單一價格法則_學習講義.html",
    r"C:\Users\閻星澄\Desktop\學習講義合集\Ch03_財務決策與單一價格法則_學習講義.html"
]

# Write to workspace first
ws_path = target_paths[0]
with open(ws_path, "w", encoding="utf-8") as f:
    f.write(html_template)
print(f"Generated workspace file: {ws_path} ({os.path.getsize(ws_path)} bytes)")

# Distribute to Documents and Desktop
for p in target_paths[1:]:
    try:
        shutil.copy2(ws_path, p)
        print(f"Synced to: {p}")
    except Exception as e:
        print(f"Failed to copy to {p}: {e}")
