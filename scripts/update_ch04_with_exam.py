# -*- coding: utf-8 -*-
# Build and update Chapter 4 Handout (Corporate Finance) with Midterm Exam Simulation (20 Questions)
import os
import shutil
import codecs

base_script = r"C:\Users\閻星澄\Desktop\WikiTree-master\scripts\build_ch04_handout.py"
c = codecs.open(base_script, "r", "utf-8").read()

# 構造 20 題期中模擬試卷的 HTML 區塊
exam_section_html = r'''
    <!-- 第十節：冒險者公會期中封神試煉——Chapter 4 深度期中模擬試卷 (20 題) -->
    <section id="midterm-exam" style="border: 2px solid #8b5cf6; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #6366f1 100%); color: #ffffff; padding: 1.8rem 2rem; border-radius: var(--radius); margin-bottom: 2rem; box-shadow: var(--shadow);">
        <div style="display:inline-block; background:rgba(255,255,255,0.2); color:#fef08a; font-weight:700; font-size:0.82rem; padding:0.25rem 0.8rem; border-radius:20px; text-transform:uppercase; margin-bottom:0.8rem;">
          ⏳ 📈 Berk &amp; DeMarzo Ch 4 期中時空魔導大典
        </div>
        <h2 style="color:#ffffff; margin:0 0 0.8rem; border:none; padding:0; font-size:1.85rem;">
          Chapter 4：貨幣時間價值 · 20 題高難度期中模擬大殿
        </h2>
        <p style="color:#e0e7ff; font-size:1.05rem; margin:0; line-height:1.6;">
          歡迎來到全書計算量最震撼、最考驗跨期折現內力的<strong>時空魔導終極試煉場</strong>！本試卷深度涵蓋<strong>三大時間旅行法則、不規則多期現金流 NPV、永續年金 (Perpetuity)、成長型永續年金 (Gordon Model)、普通年金 (Annuity)、成長型年金 (Growing Annuity)、房貸分期還款 (Amortizing Loan) 求解、內部報酬率 (IRR) 與 72 法則複利暴擊</strong>。
        </p>
      </div>

      <!-- 控制面板與段位橫幅 -->
      <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 1.2rem 1.5rem; margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.95rem; color: #4338ca;">
          <strong>試卷結構：</strong> 10 題深度策略選擇題（每題 5 分）＋ 10 題高階計算與論述填充題（每題 5 分）＝ 滿分 100 分<br>
          <strong>榮譽段位：</strong> 90+ 傳奇公會大掌櫃 ｜ 75-89 皇家特許理財魔導師 ｜ 60-74 資深行會管事 ｜ &lt;60 重回新手村研讀
        </div>
        <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
          <button class="btn" style="background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); color:white; border:none; padding:0.75rem 1.4rem; font-weight:700; border-radius:8px; cursor:pointer;" onclick="checkAllCh04ExamAnswers()">
            <span>🎯 一鍵智能批改試卷並評定公會段位</span>
          </button>
          <button class="btn" style="background: linear-gradient(135deg, #475569 0%, #334155 100%); color:white; border:none; padding:0.75rem 1.4rem; font-weight:700; border-radius:8px; cursor:pointer;" onclick="skipAndRevealAllCh04Answers()">
            <span>⏩ 略過（直接填入標準答案並展開解剖思路）</span>
          </button>
        </div>
      </div>
      <div id="ch04-exam-score-banner" style="display:none; margin-bottom:2rem; padding:1.2rem 1.5rem; border-radius:8px; font-weight:700;"></div>

      <!-- 第一戰區：10 題策略選擇題 -->
      <h3 style="color: #4338ca; border-bottom: 2px solid #ddd6fe; padding-bottom: 0.5rem; margin-top: 1rem;">
        第一戰區：十道策略與陷阱選擇題 (Part A: 10 Multiple-Choice Questions, 50%)
      </h3>

      <!-- MCQ 1 -->
      <div class="problem-card" id="ch4-mcq-box-1" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 01</span>
          時間旅行第一法則之致命死穴
        </div>
        <p>
          【情境題】某公會實習會計師在評估一項五年期冒險合約時，合約預計在第 1 年底獲得 \$100、第 2 年底獲得 \$200、第 3 年底獲得 \$300。該實習生直接將這三筆現金流相加得到 \$600，並宣稱該合約今天的價值為 \$600。依據<strong>時間旅行三大法則</strong>，下列評論何者最為精準？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq1" value="A"> A. 該計算完全正確，因為加總現金流無須考慮時間先後</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq1" value="B"> B. 該計算嚴重違背第一法則（只有處在同一時點的現金流才能相加）；不同年份的現金流就像美金、日圓與黃金，未經折現折算成同一個時點的價值前絕不可直接相加</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq1" value="C"> C. 只要市場利率為正數，直接相加的結果必然會低估該合約的真正現值</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq1" value="D"> D. 第一法則只適用於借款，投資收益不在限制範圍內</label>
        </div>
        <details class="solution-details" id="ch4-sol-mcq-1" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【時間旅行第一法則 Rule 1】</strong>只有同一時點的現金流才能相互比較或合併相加！因為未來的錢具有時間價值折價，直接相加會大幅虛增資產現值，造成極其嚴重的資本配置失誤！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 2 -->
      <div class="problem-card" id="ch4-mcq-box-2" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 02</span>
          永續年金 (Perpetuity) 雙倍折現陷阱
        </div>
        <p>
          【情境題】無風險利率為 $r = 5\%$。某古老魔法基金會承諾：<strong>「自第 3 年底開始（即 $t=3$ 開始），每年底永遠支付 \$1,000 直至世界末日」</strong>。請問這筆遞延永續年金在<strong>「今天 ($t=0$)」</strong>的公允現值是多少？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq2" value="A"> A. \$20,000.00</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq2" value="B"> B. \$19,047.62</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq2" value="C"> C. \$18,140.59</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq2" value="D"> D. \$17,276.75</label>
        </div>
        <details class="solution-details" id="ch4-sol-mcq-2" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：C】</strong></p>
            <p><strong>【經典時間軸陷阱剖析】</strong><br>
            1. 永續年金公式 $\text{PV} = \frac{C}{r}$ 折現出來的時點，永遠落在<strong>「第一筆款項發生的前一期」</strong>！<br>
            2. 本題第一筆款項在 $t=3$ 發生，因此套用公式求得的是<strong>第 2 年底 ($t=2$)</strong> 的現值：<br>
            $$\text{PV}_2 = \frac{\$1,000}{0.05} = \mathbf{\$20,000}$$<br>
            3. 再將 $\text{PV}_2$ 單筆折現 2 期回到今天 ($t=0$)：<br>
            $$\text{PV}_0 = \frac{\text{PV}_2}{(1 + 0.05)^2} = \frac{\$20,000}{(1.05)^2} = \frac{\$20,000}{1.1025} \approx \mathbf{\$18,140.59}$$</p>
          </div>
        </details>
      </div>

      <!-- MCQ 3 -->
      <div class="problem-card" id="ch4-mcq-box-3" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 03</span>
          成長型永續年金之分母收斂條件
        </div>
        <p>
          【情境題】在評估高成長獨角獸企業時，高登成長模型（成長型永續年金公式 $\text{PV} = \frac{C}{r - g}$）是必備神器。下列關於成長率 $g$ 與折現率 $r$ 的數學與經濟約束，何者<strong>完全正確</strong>？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq3" value="A"> A. 只要企業營收成長迅猛，即使長期永續成長率 $g > r$，該公式依然有效成立且現值為正數</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq3" value="B"> B. 若長期永續成長率 $g \ge r$，現金流的幾何級數將發散至無窮大，現值將為無窮大（或失去經濟實質意涵），因此公式嚴格要求 $g < r$</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq3" value="C"> C. 當 $g = r$ 時，永續年金現值剛好等於零</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq3" value="D"> D. 成長率 $g$ 必須永遠大於等於 0，若成長率為負數則公式無法計算</label>
        </div>
        <details class="solution-details" id="ch4-sol-mcq-3" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【收斂約束】</strong>成長型永續年金公式本質是等比無窮級數求和，公比為 $\frac{1+g}{1+r}$。級數要收斂為有限數值，公比必須小於 1，即必然要求 $g < r$。在現實經濟中，沒有任何企業的長期增長率可以永遠超越總體經濟利率，否則該企業最終將買下整個銀河系！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 4 -->
      <div class="problem-card" id="ch4-mcq-box-4" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 04</span>
          72 法則之心算極速倍增
        </div>
        <p>
          【情境題】掌櫃將 \$10,000 本金存入一家年報酬率為 $r = 9\%$ 的矮人信用合作社（按年複利計息）。依據金融學傳奇心算捷徑<strong>「72 法則 (Rule of 72)」</strong>，這筆本金大約需要幾年時間會翻倍膨脹為 <strong>\$20,000</strong>？若要進一步翻成 <strong>\$40,000</strong>（四倍），總共約需幾年？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq4" value="A"> A. 翻倍需 8 年；翻成四倍總共約需 16 年</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq4" value="B"> B. 翻倍需 8 年；翻成四倍總共約需 24 年</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq4" value="C"> C. 翻倍需 6.5 年；翻成四倍總共約需 13 年</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq4" value="D"> D. 翻倍需 10 年；翻成四倍總共約需 20 年</label>
        </div>
        <details class="solution-details" id="ch4-sol-mcq-4" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：A】</strong></p>
            <p><strong>【72 法則心算法門】</strong><br>
            • 翻倍所需年數 $\approx \frac{72}{\text{年利率 \%}} = \frac{72}{9} = \mathbf{8 \text{ 年}}$！<br>
            • 從 \$10,000 到 \$20,000 是一次翻倍（需 8 年）；從 \$20,000 再翻倍到 \$40,000 是第二次翻倍（再需 8 年），因此總共約需 $8 + 8 = \mathbf{16 \text{ 年}}$！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 5 -->
      <div class="problem-card" id="ch4-mcq-box-5" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 05</span>
          普通年金 (Ordinary Annuity) 終值公式之物理拆解
        </div>
        <p>
          【情境題】普通年金終值公式為 $\text{FV} = C \times \frac{(1+r)^N - 1}{r}$。關於這條公式的推導邏輯，下列哪一項詮釋<strong>最符合金融物理學本質</strong>？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq5" value="A"> A. 它是將 $N$ 期每一筆款項單獨折現至第 0 期後，再全部除以利率 $r$</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq5" value="B"> B. 它可以視為先計算出年金現值 $\text{PV} = \frac{C}{r}[1 - \frac{1}{(1+r)^N}]$，再依時間旅行第二法則，將整筆現值一口氣複利滾存 $N$ 期：$\text{FV} = \text{PV} \times (1+r)^N$</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq5" value="C"> C. 它是到期年金終值直接除以 $(1+r)^2$</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq5" value="D"> D. 該公式假設第一筆款項在期初立即存入，並享受了整整 $N$ 期的完整複利</label>
        </div>
        <details class="solution-details" id="ch4-sol-mcq-5" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【公式物理本質】</strong>$$\text{FV} = \text{PV} \times (1+r)^N = \left( \frac{C}{r}\left[1 - \frac{1}{(1+r)^N}\right] \right) \times (1+r)^N = \frac{C}{r}[(1+r)^N - 1]$$。這展示了時間旅行三大法則的完美一致性！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 6 -->
      <div class="problem-card" id="ch4-mcq-box-6" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 06</span>
          內部報酬率 (IRR) 與多重解危機
        </div>
        <p>
          【情境題】某探險專案的現金流依序為：第 0 年投入 -\$1,000、第 1 年暴賺 +\$3,000、第 2 年因環境復原責任流出 -\$2,200。下列關於該專案<strong>內部報酬率 (Internal Rate of Return, IRR)</strong> 的陳述，何者<strong>完全正確</strong>？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq6" value="A"> A. 該專案只存在唯一的 IRR，且永遠等於銀行存款利率</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq6" value="B"> B. 由於現金流正負號變動了兩次（負 $\to$ 正 $\to$ 負），依笛卡兒符號法則，該專案可能存在兩個不同的 IRR（10% 與 100%），導致 IRR 法則出現嚴重的決策失靈危機</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq6" value="C"> C. 只要專案有兩個 IRR，我們只需取兩者的算術平均數即可作為唯一的投資判斷標準</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq6" value="D"> D. 只要 IRR 大於零，無論資金成本為何，該專案的 NPV 必然恆大於零</label>
        </div>
        <details class="solution-details" id="ch4-sol-mcq-6" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【IRR 多重解死穴】</strong>解方程式 $-1000 + \frac{3000}{1+r} - \frac{2200}{(1+r)^2} = 0$，令 $x = \frac{1}{1+r}$，得 $-1000 + 3000x - 2200x^2 = 0$。解得 $x = 0.90909$ ($r = 10\%$) 或 $x = 0.5$ ($r = 100\%$)！這正是經典的「非常規現金流」導致 IRR 多重解問題，此時必須堅決以 NPV 法則為唯一依歸！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 7 -->
      <div class="problem-card" id="ch4-mcq-box-7" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 07</span>
          房貸等額本息還款之利息與本金消長軌跡
        </div>
        <p>
          【情境題】大掌櫃辦理了一筆 30 年期、固定利率、按月等額本息償還的「城堡房貸 (Amortizing Mortgage)」。在償還貸款的這 360 個月過程中，每個月所支付的固定月供款中，<strong>「利息部分」</strong>與<strong>「償還本金部分」</strong>的變化趨勢為何？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq7" value="A"> A. 利息部分逐月遞增，償還本金部分逐月遞減</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq7" value="B"> B. 每個月的利息與償還本金完全等額固定，毫無變化</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq7" value="C"> C. 前期貸款餘額高，故利息佔比極大、本金佔比極小；隨著剩餘本金逐月償還減少，月供中利息逐月遞減，償還本金逐月遞增</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq7" value="D"> D. 本金在第一個月就全部還清，後續 359 個月全數皆為利息</label>
        </div>
        <details class="solution-details" id="ch4-sol-mcq-7" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：C】</strong></p>
            <p><strong>【分期償還本質 Amortization Schedule】</strong>每期利息 = 未償本金餘額 $\times$ 月利率。初期因為本金龐大，繳的月供幾乎 80%~90% 都在幫銀行繳利息；到了貸款後期，隨著未償本金大幅縮減，每期利息微乎其微，月供款絕大部分都轉化為真正償還本金！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 8 -->
      <div class="problem-card" id="ch4-mcq-box-8" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 08</span>
          到期年金 (Annuity Due) 與普通年金現值換算
        </div>
        <p>
          【情境題】某辦公室租賃契約規定，未來 5 年內，每年「年初」必須預先支付租金 \$12,000。已知適用的折現率為 $r = 6\%$。若查表得知 5 年期、6% 的<strong>普通年金現值因子</strong>為 $4.21236$，則這筆<strong>先付租金（到期年金）</strong>在今天的現值應為多少？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq8" value="A"> A. \$50,548.32</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq8" value="B"> B. \$53,581.22</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq8" value="C"> C. \$47,687.09</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq8" value="D"> D. \$60,000.00</label>
        </div>
        <details class="solution-details" id="ch4-sol-mcq-8" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【秒殺換算公式】</strong>到期年金的每一筆錢都比普通年金提早一期發生，因此現值等於普通年金現值直接乘以 $(1+r)$：<br>
            $$\text{PV-AD} = \text{PV-OA} \times (1 + r) = (\$12,000 \times 4.21236) \times 1.06 = \$50,548.32 \times 1.06 \approx \mathbf{\$53,581.22}$$</p>
          </div>
        </details>
      </div>

      <!-- MCQ 9 -->
      <div class="problem-card" id="ch4-mcq-box-9" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 09</span>
          複利頻率與實質有效年利率 (EAR) 暴擊
        </div>
        <p>
          【情境題】兩家哥布林錢莊提供以下貸款方案：<br>
          • <strong>方案甲：</strong>名目年利率 12%，每年複利 1 次；<br>
          • <strong>方案乙：</strong>名目年利率 11.6%，每月複利 1 次（月息 $11.6\% \div 12$）。<br>
          請問哪一個方案的<strong>實質有效年利率 (Effective Annual Rate, EAR)</strong> 較高？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq9" value="A"> A. 方案甲較高（甲為 12.00%，乙約為 11.60%）</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq9" value="B"> B. 方案乙較高（甲為 12.00%，乙約為 12.23%）</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq9" value="C"> C. 兩者完全相等，皆為 12%</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq9" value="D"> D. 方案乙較高，因為 11.6% 數字比 12% 靈活</label>
        </div>
        <details class="solution-details" id="ch4-sol-mcq-9" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【EAR 實質利率公式】</strong><br>
            • 方案甲：$\text{EAR} = \mathbf{12.00\%}$<br>
            • 方案乙：$$\text{EAR} = \left(1 + \frac{0.116}{12}\right)^{12} - 1 = (1 + 0.0096667)^{12} - 1 \approx 1.12234 - 1 \approx \mathbf{12.23\%}$$<br>
            名目利率雖然看起來只有 11.6%，但在每個月利滾利的強大威力下，實質年化成本高達 12.23%，比方案甲還要更貴！</p>
          </div>
        </details>
      </div>

      <!-- MCQ 10 -->
      <div class="problem-card" id="ch4-mcq-box-10" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">MCQ 10</span>
          未償貸款餘額 (Remaining Balance) 之兩種計算法
        </div>
        <p>
          【情境題】你在 5 年前辦理了一筆 20 年期固定利率房貸。今天你想知道<strong>「目前還欠銀行多少本金」</strong>。下列關於計算未償本金餘額的兩種學理方法，何者<strong>完全正確</strong>？
        </p>
        <div style="margin:0.8rem 0; font-size:0.95rem;">
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq10" value="A"> A. 只能用初始貸款總額扣除過去 5 年所繳交的全部月供款總和</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq10" value="B"> B. 前瞻法 (Forward-Looking)：當前未償本金剛好等於<strong>未來剩餘 15 年（180 期）月供款在今天的折現值總和</strong></label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq10" value="C"> C. 回顧法 (Backward-Looking) 與前瞻法計算出來的金額必然不相等</label>
          <label style="display:block; margin:0.4rem 0;"><input type="radio" name="c4_mcq10" value="D"> D. 未償本金永遠等於剩餘期數乘以每期月供款，無須折現</label>
        </div>
        <details class="solution-details" id="ch4-sol-mcq-10" style="margin-top:0.8rem;">
          <summary>💡 展開考官解剖思路</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【前瞻定價神技】</strong>在任何時點 $t$，未償貸款餘額在財務學上<strong>永遠等於未來剩餘所有還款在該時點的現值</strong>！這是最乾淨俐落的計算方法，完全不需要辛苦編製過去 5 年的 60 期攤銷表！</p>
          </div>
        </details>
      </div>

      <!-- 第二戰區：10 題高難度計算與論述填充題 -->
      <h3 style="color: #4338ca; border-bottom: 2px solid #ddd6fe; padding-bottom: 0.5rem; margin-top: 3.5rem;">
        第二戰區：十道深水演算與精準填空題 (Part B: 10 Fill-in-the-Blank &amp; Calculation Problems, 50%)
      </h3>

      <!-- Blank 1 -->
      <div class="problem-card" id="ch4-blank-box-1" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 01</span>
          普通年金現值精密計算
        </div>
        <p>
          【計算題】折現率為 $r = 7\%$。某項專利權授權合約將於未來 <strong>8 年內，每年底穩定支付 \$25,000</strong>。該合約在今天的<strong>公允現值 (PV)</strong> 為 <input type="text" id="c4_fb1" style="width:140px; font-weight:700; text-align:center;" placeholder="填入金額"> 元。（請四捨五入計算至小數點後兩位）
        </p>
        <details class="solution-details" id="ch4-sol-fb-1" style="margin-top:0.8rem;">
          <summary>💡 展開推導步驟</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：149,282.47 (或 149282.47)】</strong></p>
            <p>
              $$\text{PV} = C \times \frac{1}{r}\left[1 - \frac{1}{(1+r)^N}\right] = \$25,000 \times \frac{1}{0.07}\left[1 - \frac{1}{(1.07)^8}\right]$$<br>
              $$(1.07)^8 \approx 1.718186 \implies \frac{1}{1.718186} \approx 0.582009$$<br>
              $$\text{PV} = \$25,000 \times \frac{0.417991}{0.07} \approx \$25,000 \times 5.9712985 \approx \mathbf{\$149,282.47}$$
            </p>
          </div>
        </details>
      </div>

      <!-- Blank 2 -->
      <div class="problem-card" id="ch4-blank-box-2" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 02</span>
          成長型永續年金 (Gordon Growth) 現值推導
        </div>
        <p>
          【計算題】某公會投資的巨龍農場預計於<strong>一年後 ($t=1$)</strong> 產生第一筆分紅 <strong>\$60,000</strong>。由於農場產能持續擴張，預期往後每年的現金分紅將以 <strong>$g = 3\%$</strong> 的速度永久持續成長。若公會要求的權益資金成本為 <strong>$r = 8\%$</strong>，則該農場在今天的<strong>市場價值 (PV)</strong> 為 <input type="text" id="c4_fb2" style="width:140px; font-weight:700; text-align:center;" placeholder="填入總金額"> 元。
        </p>
        <details class="solution-details" id="ch4-sol-fb-2" style="margin-top:0.8rem;">
          <summary>💡 展開推導步驟</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：1,200,000 (或 1200000 / 120萬)】</strong></p>
            <p>
              $$\text{PV} = \frac{C_1}{r - g} = \frac{\$60,000}{0.08 - 0.03} = \frac{\$60,000}{0.05} = \mathbf{\$1,200,000}$$
            </p>
          </div>
        </details>
      </div>

      <!-- Blank 3 -->
      <div class="problem-card" id="ch4-blank-box-3" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 03</span>
          房貸月供款 (Loan Payment C) 逆推
        </div>
        <p>
          【計算題】矮人國王向銀行辦理了一筆 <strong>\$500,000</strong> 的城堡建造貸款，借款期限為 <strong>30 年（360 個月）</strong>，固定年利率為 <strong>$6\%$（即月利率為 $0.5\%$）</strong>。國王每個月底必須支付的固定等額月供款為 <input type="text" id="c4_fb3" style="width:130px; font-weight:700; text-align:center;" placeholder="填入月供款"> 元。（請計算至小數點後兩位）
        </p>
        <details class="solution-details" id="ch4-sol-fb-3" style="margin-top:0.8rem;">
          <summary>💡 展開推導步驟</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：2,997.75 (或 2997.75)】</strong></p>
            <p>
              月利率 $r = 6\% \div 12 = 0.005$，$N = 360$。<br>
              $$\text{Annuity Factor} = \frac{1}{0.005}\left[1 - \frac{1}{(1.005)^{360}}\right] \approx 200 \times [1 - 0.166041] \approx 166.7916$$<br>
              $$C = \frac{\text{Loan Amount}}{\text{Factor}} = \frac{\$500,000}{166.7916} \approx \mathbf{\$2,997.75}$$
            </p>
          </div>
        </details>
      </div>

      <!-- Blank 4 -->
      <div class="problem-card" id="ch4-blank-box-4" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 04</span>
          普通年金之終值逆推存款期數
        </div>
        <p>
          【計算題】冒險者打算在每年底固定存入 <strong>\$10,000</strong> 於年報酬率為 <strong>$r = 10\%$</strong> 的魔法基金中。若他的退休目標為累積到 <strong>\$175,311.70</strong>，則他必須連續存入 <input type="text" id="c4_fb4" style="width:90px; font-weight:700; text-align:center;" placeholder="填入整數年"> 年。
        </p>
        <details class="solution-details" id="ch4-sol-fb-4" style="margin-top:0.8rem;">
          <summary>💡 展開推導步驟</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：10 (或 10年)】</strong></p>
            <p>
              $$\text{FV} = C \times \frac{(1+r)^N - 1}{r} \implies \$175,311.70 = \$10,000 \times \frac{(1.10)^N - 1}{0.10}$$<br>
              $$\frac{(1.10)^N - 1}{0.10} = 17.53117 \implies (1.10)^N - 1 = 1.753117 \implies (1.10)^N = 2.753117$$<br>
              取對數：$$N = \frac{\ln(2.753117)}{\ln(1.10)} = \frac{1.01273}{0.09531} = \mathbf{10 \text{ 年}}$$！
            </p>
          </div>
        </details>
      </div>

      <!-- Blank 5 -->
      <div class="problem-card" id="ch4-blank-box-5" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 05</span>
          時間旅行第二法則英文術語
        </div>
        <p>
          【填空題】將當前的現金價值沿著時間軸向前推進至未來的時點，利用利率計算其本利和的運算過程，其英文專業術語稱為「<input type="text" id="c4_fb5" style="width:160px; font-weight:700; text-align:center;" placeholder="英文名詞"> (Compounding)」。
        </p>
        <details class="solution-details" id="ch4-sol-fb-5" style="margin-top:0.8rem;">
          <summary>💡 展開解答</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：Compounding / 複利】</strong></p>
            <p>即第二法則：$\text{FV}_n = C \times (1+r)^n$。</p>
          </div>
        </details>
      </div>

      <!-- Blank 6 -->
      <div class="problem-card" id="ch4-blank-box-6" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 06</span>
          時間旅行第三法則英文術語
        </div>
        <p>
          【填空題】將未來某一特定時點的現金流量沿著時間軸向後折算回當前時點的運算過程，其英文專業術語稱為「<input type="text" id="c4_fb6" style="width:160px; font-weight:700; text-align:center;" placeholder="英文名詞"> (Discounting)」。
        </p>
        <details class="solution-details" id="ch4-sol-fb-6" style="margin-top:0.8rem;">
          <summary>💡 展開解答</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：Discounting / 折現】</strong></p>
            <p>即第三法則：$\text{PV} = C \div (1+r)^n$。</p>
          </div>
        </details>
      </div>

      <!-- Blank 7 -->
      <div class="problem-card" id="ch4-blank-box-7" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 07</span>
          永續年金英文專有名詞
        </div>
        <p>
          【填空題】一種自某一時期開始，每期等額支付現金流且付款期數持續至無限遠未來的特殊年金，其英文專有名詞為「<input type="text" id="c4_fb7" style="width:180px; font-weight:700; text-align:center;" placeholder="輸入英文名詞"> (Perpetuity)」。
        </p>
        <details class="solution-details" id="ch4-sol-fb-7" style="margin-top:0.8rem;">
          <summary>💡 展開解答</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：Perpetuity / 永續年金】</strong></p>
            <p>其現值公式為極度優雅的 $\text{PV} = \frac{C}{r}$。</p>
          </div>
        </details>
      </div>

      <!-- Blank 8 -->
      <div class="problem-card" id="ch4-blank-box-8" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 08</span>
          成長型普通年金 (Growing Annuity) 現值推導
        </div>
        <p>
          【計算題】折現率為 $r = 10\%$，成長率為 $g = 4\%$。某專案預計在第一年底支付第一筆款項 <strong>\$10,000</strong>，往後款項每年成長 4%，總共持續支付 <strong>4 年</strong>。依據成長型年金公式，該專案在今天的<strong>公允現值 (PV)</strong> 為 <input type="text" id="c4_fb8" style="width:130px; font-weight:700; text-align:center;" placeholder="填入現值金額"> 元。（請計算至小數點後兩位）
        </p>
        <details class="solution-details" id="ch4-sol-fb-8" style="margin-top:0.8rem;">
          <summary>💡 展開推導步驟</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：33,873.34 (或 33873.34)】</strong></p>
            <p>
              $$\text{PV} = \frac{C}{r - g}\left[1 - \left(\frac{1+g}{1+r}\right)^N\right] = \frac{\$10,000}{0.10 - 0.04}\left[1 - \left(\frac{1.04}{1.10}\right)^4\right]$$<br>
              $$\frac{1.04}{1.10} \approx 0.9454545 \implies (0.9454545)^4 \approx 0.79676$$<br>
              $$\text{PV} = \frac{\$10,000}{0.06}[1 - 0.79676] = \$166,666.67 \times 0.20324 \approx \mathbf{\$33,873.34}$$
            </p>
          </div>
        </details>
      </div>

      <!-- Blank 9 -->
      <div class="problem-card" id="ch4-blank-box-9" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 09</span>
          內部報酬率英文全名與縮寫
        </div>
        <p>
          【填空題】使一項投資專案的所有未來現金流入現值總和，恰好等於初始投資成本（即淨現值 $\text{NPV} = 0$）的基準折現率，其英文全名為「<input type="text" id="c4_fb9" style="width:230px; font-weight:700; text-align:center;" placeholder="輸入英文全稱">」，英文縮寫為 <strong>IRR</strong>。
        </p>
        <details class="solution-details" id="ch4-sol-fb-9" style="margin-top:0.8rem;">
          <summary>💡 展開解答</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：Internal Rate of Return / Internal rate of return】</strong></p>
            <p>即內部報酬率，是資本預算評估的兩大支柱之一。</p>
          </div>
        </details>
      </div>

      <!-- Blank 10 -->
      <div class="problem-card" id="ch4-blank-box-10" style="margin-bottom:1.8rem; border-left:4px solid #6366f1;">
        <div style="font-weight:700; font-size:1.1rem; color:#312e81; margin-bottom:0.6rem;">
          <span style="background:#ede9fe; color:#4338ca; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.8rem; margin-right:0.5rem;">Blank 10</span>
          等額分期償還貸款英文專有名詞
        </div>
        <p>
          【填空題】一種借款人按期支付等額付款，每期付款中同時包含當期利息與部分本金償還，使得貸款本金餘額隨時間逐漸遞減至零的貸款型態，其英文術語為「<input type="text" id="c4_fb10" style="width:200px; font-weight:700; text-align:center;" placeholder="輸入英文術語"> (Amortizing Loan)」。
        </p>
        <details class="solution-details" id="ch4-sol-fb-10" style="margin-top:0.8rem;">
          <summary>💡 展開解答</summary>
          <div style="padding-top:0.8rem; font-size:0.95rem;">
            <p><strong>【核心解答：Amortizing Loan / Amortized Loan / 分期攤還貸款】</strong></p>
            <p>常見於房屋抵押貸款、汽車分期貸款與消費信用貸款。</p>
          </div>
        </details>
      </div>

    </section>
'''

# 構造對應的測驗自動批改與略過 JS 腳本
exam_js_ch04 = r'''
  // ==========================================
  // Chapter 4 期中模擬試卷 批改與略過交互邏輯
  // ==========================================
  const ch4McqAnswers = {
    c4_mcq1: "B",
    c4_mcq2: "C",
    c4_mcq3: "B",
    c4_mcq4: "A",
    c4_mcq5: "B",
    c4_mcq6: "B",
    c4_mcq7: "C",
    c4_mcq8: "B",
    c4_mcq9: "B",
    c4_mcq10: "B"
  };

  function checkAllCh04ExamAnswers() {
    let score = 0;

    // 1. 檢查 MCQ 1 ~ 10
    for (let i = 1; i <= 10; i++) {
      const name = "c4_mcq" + i;
      const radios = document.getElementsByName(name);
      let selected = "";
      for (let r of radios) {
        if (r.checked) {
          selected = r.value;
          break;
        }
      }
      const box = document.getElementById("ch4-mcq-box-" + i);
      if (selected === ch4McqAnswers[name]) {
        score += 5;
        if (box) box.style.border = "2px solid #16a34a";
      } else {
        if (box) box.style.border = "2px solid #dc2626";
      }
    }

    // 2. 檢查填充題 1 ~ 10
    // Blank 1: 149282.47
    const fb1 = (document.getElementById('c4_fb1').value || '').replace(/[+,\$]/g, '').trim();
    if (fb1.startsWith("149282") || fb1.startsWith("149,282")) {
      score += 5;
      document.getElementById('ch4-blank-box-1').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch4-blank-box-1').style.border = "2px solid #dc2626";
    }

    // Blank 2: 1200000 / 120萬
    const fb2 = (document.getElementById('c4_fb2').value || '').replace(/[+,\$]/g, '').trim();
    if (fb2.startsWith("1200000") || fb2.startsWith("1,200,000") || fb2.includes("120萬")) {
      score += 5;
      document.getElementById('ch4-blank-box-2').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch4-blank-box-2').style.border = "2px solid #dc2626";
    }

    // Blank 3: 2997.75
    const fb3 = (document.getElementById('c4_fb3').value || '').replace(/[+,\$]/g, '').trim();
    if (fb3.startsWith("2997.7") || fb3.startsWith("2,997.7")) {
      score += 5;
      document.getElementById('ch4-blank-box-3').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch4-blank-box-3').style.border = "2px solid #dc2626";
    }

    // Blank 4: 10
    const fb4 = (document.getElementById('c4_fb4').value || '').trim();
    if (fb4.startsWith("10")) {
      score += 5;
      document.getElementById('ch4-blank-box-4').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch4-blank-box-4').style.border = "2px solid #dc2626";
    }

    // Blank 5: Compounding / 複利
    const fb5 = (document.getElementById('c4_fb5').value || '').trim().toLowerCase();
    if (fb5.includes("compound") || fb5.includes("複利")) {
      score += 5;
      document.getElementById('ch4-blank-box-5').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch4-blank-box-5').style.border = "2px solid #dc2626";
    }

    // Blank 6: Discounting / 折現
    const fb6 = (document.getElementById('c4_fb6').value || '').trim().toLowerCase();
    if (fb6.includes("discount") || fb6.includes("折現")) {
      score += 5;
      document.getElementById('ch4-blank-box-6').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch4-blank-box-6').style.border = "2px solid #dc2626";
    }

    // Blank 7: Perpetuity / 永續年金
    const fb7 = (document.getElementById('c4_fb7').value || '').trim().toLowerCase();
    if (fb7.includes("perpetuity") || fb7.includes("永續")) {
      score += 5;
      document.getElementById('ch4-blank-box-7').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch4-blank-box-7').style.border = "2px solid #dc2626";
    }

    // Blank 8: 33873.34
    const fb8 = (document.getElementById('c4_fb8').value || '').replace(/[+,\$]/g, '').trim();
    if (fb8.startsWith("33873") || fb8.startsWith("33,873")) {
      score += 5;
      document.getElementById('ch4-blank-box-8').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch4-blank-box-8').style.border = "2px solid #dc2626";
    }

    // Blank 9: Internal Rate of Return
    const fb9 = (document.getElementById('c4_fb9').value || '').trim().toLowerCase();
    if (fb9.includes("internal rate of return") || fb9.includes("內部報酬率")) {
      score += 5;
      document.getElementById('ch4-blank-box-9').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch4-blank-box-9').style.border = "2px solid #dc2626";
    }

    // Blank 10: Amortizing / Amortized / 分期攤還
    const fb10 = (document.getElementById('c4_fb10').value || '').trim().toLowerCase();
    if (fb10.includes("amortiz") || fb10.includes("分期攤還") || fb10.includes("等額本息")) {
      score += 5;
      document.getElementById('ch4-blank-box-10').style.border = "2px solid #16a34a";
    } else {
      document.getElementById('ch4-blank-box-10').style.border = "2px solid #dc2626";
    }

    // 評定段位
    const banner = document.getElementById("ch04-exam-score-banner");
    banner.style.display = "block";
    let rank = "";
    let rankColor = "";
    let comment = "";

    if (score >= 90) {
      rank = "👑 傳奇公會首席神掌櫃 (Legendary Arch-Arborist)";
      rankColor = "#15803d";
      banner.style.background = "#dcfce7";
      banner.style.border = "2px solid #86efac";
      comment = "時空神力覺醒！你對跨期折現、年金逆推、房貸攤銷與高登模型的掌控已無懈可擊，期中試煉勢必斬獲最高榮譽！";
    } else if (score >= 75) {
      rank = "⚔️ 皇家特許理財魔導師 (Royal Chartered Arborist)";
      rankColor = "#0369a1";
      banner.style.background = "#e0f2fe";
      banner.style.border = "2px solid #7dd3fc";
      comment = "優異的時空算力！大部分年金與成長公式都非常精準，稍微注意成長型年金與房貸月供小數點精度即可封神！";
    } else if (score >= 60) {
      rank = "🛡️ 資深行會管事 (Senior Guild Officer)";
      rankColor = "#d97706";
      banner.style.background = "#fef3c7";
      banner.style.border = "2px solid #fde68a";
      comment = "及格達標！但在遞延永續年金（時點往前推一期）或多重 IRR 概念上略有遲疑，建議回顧前文的公式心智地圖！";
    } else {
      rank = "🌱 銅卡見習學徒 (Bronze Novice Apprentice)";
      rankColor = "#b91c1c";
      banner.style.background = "#fee2e2";
      banner.style.border = "2px solid #fca5a5";
      comment = "警報響起！跨期現金流不可直接相加等第一原則尚未根深蒂固（紅框為失誤題目）。請點擊略過展開思路詳讀考官演算！";
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

  function skipAndRevealAllCh04Answers() {
    // 1. 自動勾選 MCQ 1 ~ 10 正確選項並展開思路
    for (let i = 1; i <= 10; i++) {
      const name = "c4_mcq" + i;
      const correctVal = ch4McqAnswers[name];
      const radios = document.getElementsByName(name);
      for (let r of radios) {
        if (r.value === correctVal) {
          r.checked = true;
        }
      }
      const box = document.getElementById("ch4-mcq-box-" + i);
      if (box) box.style.border = "2px solid #6366f1";

      const sol = document.getElementById("ch4-sol-mcq-" + i);
      if (sol) {
        sol.open = true;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([sol]);
        }
      }
    }

    // 2. 自動填入填充題 1 ~ 10 標準答案並展開思路
    const fills = {
      c4_fb1: "149,282.47",
      c4_fb2: "1,200,000",
      c4_fb3: "2,997.75",
      c4_fb4: "10",
      c4_fb5: "Compounding",
      c4_fb6: "Discounting",
      c4_fb7: "Perpetuity",
      c4_fb8: "33,873.34",
      c4_fb9: "Internal Rate of Return",
      c4_fb10: "Amortizing Loan"
    };

    for (let id in fills) {
      const el = document.getElementById(id);
      if (el) {
        el.value = fills[id];
        el.style.backgroundColor = "#ede9fe";
        el.style.color = "#4338ca";
      }
    }

    for (let j = 1; j <= 10; j++) {
      const box = document.getElementById("ch4-blank-box-" + j);
      if (box) box.style.border = "2px solid #6366f1";

      const sol = document.getElementById("ch4-sol-fb-" + j);
      if (sol) {
        sol.open = true;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([sol]);
        }
      }
    }

    // 3. 顯示橫幅提示
    const banner = document.getElementById("ch04-exam-score-banner");
    banner.style.display = "block";
    banner.style.background = "#f5f3ff";
    banner.style.border = "2px solid #6366f1";
    banner.innerHTML = `
      <div style="font-size:1.25rem; color:#4338ca; margin-bottom:0.4rem;">
        ⏩ <strong>已啟動快捷模式：全卷標準答案已填入，解剖思路已全數為您展開！</strong>
      </div>
      <div style="font-size:0.95rem; color:#475569;">
        理解時間的價值永遠是第一位的！您可以直接逐題研讀下方的詳細數學公式推導、分期償還表與幾何級數證明，快速吸收 Chapter 4 的期中核心精華！
      </div>
    `;

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
'''

# 進行代碼融合
# 1. 在側邊目錄中的 `#glossary` 後加入 `#midterm-exam` 的導覽連結
old_toc = '<a href="#glossary">📚 必背英漢專業術語字典庫</a>'
new_toc = '<a href="#glossary">📚 必背英漢專業術語字典庫</a>\n    <a href="#midterm-exam" style="color:#6366f1; font-weight:800; background:#f5f3ff; border:1px solid #ddd6fe;">⏳ 20題期中時空大殿</a>'

# 2. 在 `</main>` 前插入 `exam_section_html`
old_main_end = '</main>'
new_main_end = exam_section_html + '\n  </main>'

# 3. 在 `<script>` 的結尾 `</script>` 前插入 `exam_js_ch04`
old_script_end = '</script>'
new_script_end = exam_js_ch04 + '\n</script>'

c_updated = c.replace(old_toc, new_toc)
c_updated = c_updated.replace(old_main_end, new_main_end)
c_updated = c_updated.replace(old_script_end, new_script_end)

codecs.open(base_script, "w", "utf-8").write(c_updated)
print("Updated scripts/build_ch04_handout.py successfully!")
