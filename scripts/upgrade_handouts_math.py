# -*- coding: utf-8 -*-
"""
Upgrade MathJax & Math rendering on Ch03 and Ch04 handouts.
Adds MathJax 3 with processEscapes, Offline Fallback script, and sanitizes formulas.
Distributes to Workspace, Documents, and Desktop.
"""
import re
import os
import shutil

mathjax_block = r'''  <!-- 數學公式渲染雙保險：MathJax 3 + 離線優雅降級 Fallback -->
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
    // 離線降級防護：若 2 秒內 MathJax 未加載（如離線無網環境），自動啟動純本地輕量替換，確保絕不露出原始碼
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
'''

def upgrade_file(filepath):
    if not os.path.exists(filepath):
        print(f"Skipping non-existent file: {filepath}")
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. 注入 MathJax 模組
    if "MathJax-script" not in content:
        content = content.replace("</head>", mathjax_block + "\n</head>")

    # 2. 修正常見的 LaTeX 衝突：例如 \$ 與 $ 混雜
    # 針對 Ch04 圖片中的 Problem 4.7 子題 a 修正
    content = content.replace(r"$FV_5 = \$1,000 \times (1.06)^5 = \mathbf{\$1,338.23}$",
                              r"$$\text{FV}_5 = \$1,000 \times (1.06)^5 = \mathbf{\$1,338.23}$$")
    content = content.replace(r"$FV_{10} = \$1,000 \times (1.06)^{10} = \mathbf{\$1,790.85}$",
                              r"$$\text{FV}_{10} = \$1,000 \times (1.06)^{10} = \mathbf{\$1,790.85}$$")
    content = content.replace(r"$FV_{20} = \$1,000 \times (1.06)^{20} = \mathbf{\$3,207.14}$",
                              r"$$\text{FV}_{20} = \$1,000 \times (1.06)^{20} = \mathbf{\$3,207.14}$$")
    content = content.replace(r"$5 \text{ 年} \times \$60 = \$300",
                              r"5 年 × $60 = $300")
    content = content.replace(r"$\$338.23 - \$300 = \mathbf{\$38.23}$！",
                              r"$$\$338.23 - \$300 = \mathbf{\$38.23}$$")
    content = content.replace(r"$\$1,338.23 - \$1,000 = \$338.23$",
                              r"$$\$1,338.23 - \$1,000 = \$338.23$$")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Upgraded: {filepath}")

# 針對所有目標進行升級
files = [
    r"收件苗圃\學習講義合輯\Ch04_貨幣時間價值_學習講義.html",
    r"收件苗圃\學習講義合輯\Ch03_財務決策與單一價格法則_學習講義.html",
    r"C:\Users\閻星澄\Documents\WikiTree\收件苗圃\學習講義合集\Ch04_貨幣時間價值_學習講義.html",
    r"C:\Users\閻星澄\Documents\WikiTree\收件苗圃\學習講義合集\Ch03_財務決策與單一價格法則_學習講義.html",
    r"C:\Users\閻星澄\Desktop\學習講義合集\Ch04_貨幣時間價值_學習講義.html",
    r"C:\Users\閻星澄\Desktop\學習講義合集\Ch03_財務決策與單一價格法則_學習講義.html"
]

for f in files:
    upgrade_file(f)

print("All handouts upgraded successfully!")
