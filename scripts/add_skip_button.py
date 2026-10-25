# -*- coding: utf-8 -*-
# Add "略過" (Skip / Reveal Answers & Explanations) button to Chapter 1 exam section

import codecs

file_path = r"C:\Users\閻星澄\Desktop\WikiTree-master\scripts\build_ch01_handout.py"
c = codecs.open(file_path, "r", "utf-8").read()

# 1. 替換按鈕區塊，加入「略過試煉 (直接看答案與解剖思路)」按鈕
old_button_block = """            <div>
              <button class="btn-calc" style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);" onclick="checkAllExamAnswers()">
                <span>🎯 一鍵智能批改試卷並評定公會榮譽段位</span>
              </button>
            </div>"""

new_button_block = """            <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
              <button class="btn-calc" style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);" onclick="checkAllExamAnswers()">
                <span>🎯 一鍵智能批改試卷並評定公會榮譽段位</span>
              </button>
              <button class="btn-calc" style="background: linear-gradient(135deg, #475569 0%, #334155 100%); box-shadow: 0 2px 8px rgba(71, 85, 105, 0.3);" onclick="skipAndRevealAllAnswers()">
                <span>⏩ 略過（直接填入標準答案並展開解剖思路）</span>
              </button>
            </div>"""

# 2. 加入 skipAndRevealAllAnswers() 函數
skip_js = """
    // 略過考試：自動填入 20 題標準答案，並自動展開所有題目的「解剖思路」
    function skipAndRevealAllAnswers() {
      // 1. 自動勾選 MCQ 1 ~ 10 正確選項並加綠色外框
      for (let i = 1; i <= 10; i++) {
        const name = "mcq" + i;
        const correctVal = mcqAnswers[name];
        const radios = document.getElementsByName(name);
        for (let r of radios) {
          if (r.value === correctVal) {
            r.checked = true;
          }
        }
        const box = document.getElementById("mcq-box-" + i);
        if (box) box.style.border = "2px solid #8b5cf6";
        
        // 自動展開思路
        const sol = document.getElementById("sol-mcq-" + i);
        if (sol) {
          sol.style.display = "block";
          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([sol]);
          }
        }
      }

      // 2. 自動填入填充題 1 ~ 10 標準答案並展開思路
      const fills = {
        fb1: "8.64",
        fb1_rate: "42.4%",
        fb2_tot: "160,110",
        fb2_avg: "320.22",
        fb3_prof: "4,000",
        fb3_pct: "0.80%",
        fb4: "達特茅斯學院 (Dartmouth College)",
        fb5_1: "董事會 (Board of Directors)",
        fb5_2: "執行長 (CEO)",
        fb6_1: "敵意收購 (Hostile Takeover)",
        fb6_2: "毒藥丸策略 (Poison Pill)",
        fb7_1: "指定造市商 / 專家經紀人 (Specialist / DMM)",
        fb7_2: "造市商 (Market Makers)",
        fb8: "限制型股票 (Restricted Stock)",
        fb9: "暗池 (Dark Pools)",
        fb10: "智能理財顧問 (Robo-Advisor)"
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
        const box = document.getElementById("blank-box-" + j);
        if (box) box.style.border = "2px solid #8b5cf6";

        const sol = document.getElementById("sol-fb-" + j);
        if (sol) {
          sol.style.display = "block";
          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([sol]);
          }
        }
      }

      // 3. 顯示橫幅提示
      const banner = document.getElementById("exam-score-banner");
      banner.style.display = "block";
      banner.style.background = "#f5f3ff";
      banner.style.border = "2px solid #8b5cf6";
      banner.innerHTML = `
        <div style="font-size:1.25rem; color:#6d28d9; margin-bottom:0.4rem;">
          ⏩ <strong>已啟動快捷模式：全卷標準答案已填入，解剖思路已全數為您展開！</strong>
        </div>
        <div style="font-size:0.95rem; color:#475569;">
          理解知識永遠比單純的考試分數更重要！您可以直接逐題研讀下方的詳細數學公式推導、法理判例背景與陷阱拆解，快速吸收期中核心精華！
        </div>
      `;

      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
"""

if old_button_block in c:
    c = c.replace(old_button_block, new_button_block)
    print("Button block replaced!")
else:
    print("WARNING: Button block not found!")

# 將 skip_js 插入到 checkAllExamAnswers 前面
if "function checkAllExamAnswers()" in c:
    c = c.replace("function checkAllExamAnswers()", skip_js + "\n    function checkAllExamAnswers()")
    print("skip_js inserted!")
else:
    print("WARNING: checkAllExamAnswers not found!")

codecs.open(file_path, "w", "utf-8").write(c)
print("File updated successfully!")
