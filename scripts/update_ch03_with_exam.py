# -*- coding: utf-8 -*-
# Build and update Chapter 3 Handout with Midterm Exam Simulation (20 Questions)
import os
import shutil
import codecs

base_script = r"C:\Users\閻星澄\Desktop\WikiTree-master\scripts\build_ch03_handout_v2.py"
c = codecs.open(base_script, "r", "utf-8").read()

# 構造 20 題期中模擬試卷的 HTML 區塊
exam_section_html = r'''
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
'''

# 構造對應的測驗自動批改與略過 JS 腳本
exam_js_ch03 = r'''
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
'''

# 進行代碼融合
# 1. 在側邊目錄中的 `#glossary` 後加入 `#midterm-exam` 的導覽連結
old_toc = '<a href="#glossary">📚 必背英漢專業術語字典庫</a>'
new_toc = '<a href="#glossary">📚 必背英漢專業術語字典庫</a>\n    <a href="#midterm-exam" style="color:#7c3aed; font-weight:800; background:#f5f3ff; border:1px solid #ddd6fe;">⚔️ 20題期中模擬大殿</a>'

# 2. 在 `</main>` 前插入 `exam_section_html`
old_main_end = '</main>'
new_main_end = exam_section_html + '\n  </main>'

# 3. 在 `<script>` 的結尾 `</script>` 前插入 `exam_js_ch03`
old_script_end = '</script>'
new_script_end = exam_js_ch03 + '\n</script>'

c_updated = c.replace(old_toc, new_toc)
c_updated = c_updated.replace(old_main_end, new_main_end)
c_updated = c_updated.replace(old_script_end, new_script_end)

codecs.open(base_script, "w", "utf-8").write(c_updated)
print("Updated scripts/build_ch03_handout_v2.py successfully!")
