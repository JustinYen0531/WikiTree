# -*- coding: utf-8 -*-
import codecs

file_path = r"C:\Users\閻星澄\Desktop\WikiTree-master\scripts\build_ch01_handout.py"
c = codecs.open(file_path, "r", "utf-8").read()

# 正規化換行後搜尋
c_norm = c.replace("\r\n", "\n")

target = """onclick="checkAllExamAnswers()">
                <span>🎯 一鍵智能批改試卷並評定公會榮譽段位</span>
              </button>
            </div>"""

repl = """onclick="checkAllExamAnswers()">
                <span>🎯 一鍵智能批改試卷並評定公會榮譽段位</span>
              </button>
              <button class="btn-calc" style="background: linear-gradient(135deg, #475569 0%, #334155 100%); box-shadow: 0 2px 8px rgba(71, 85, 105, 0.3);" onclick="skipAndRevealAllAnswers()">
                <span>⏩ 略過（直接填入標準答案並展開解剖思路）</span>
              </button>
            </div>"""

if target in c_norm:
    c_norm = c_norm.replace(target, repl)
    codecs.open(file_path, "w", "utf-8").write(c_norm)
    print("Button replaced successfully!")
else:
    print("Error: target not found!")
