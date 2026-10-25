# -*- coding: utf-8 -*-
# Update Chapter 1 Corporate Finance Handout with Midterm Exam Simulation

import os
import shutil

base_path = r"C:\Users\閻星澄\Desktop\WikiTree-master\scripts\build_ch01_handout.py"
with open(base_path, "r", encoding="utf-8") as f:
    orig_code = f.read()

# 構造 20 題期中模擬試卷的 HTML 區塊
exam_section_html = r'''
      <!-- 第六節：冒險者公會期中修煉大典——20 題深水區期中模擬試煉 -->
      <section id="midterm-exam">
        <div class="story-card" style="border-left-color: #8b5cf6; background: linear-gradient(145deg, #ffffff 0%, #f5f3ff 100%);">
          <div class="story-header" style="color: #6d28d9; font-size: 1.3rem;">
            <span>⚔️ 🏆</span> 冒險者公會期中封神試煉：Chapter 1 深度考核殿堂 (20 題期中魔王題)
          </div>
          <p>
            嘿，年輕的見習掌櫃！你以為讀懂課本定義就能在殘酷的金融大陸立足嗎？期中大典的考官可不會只考名詞默寫！
            以下 20 題皆源自頂尖商學院期中考實戰與特許金融分析師 (CFA Level 1) 改編，融入真實公會冒險情境。
            題目極具<strong>陷阱與計算深度</strong>，涵蓋：雙重課稅跨國套利、S-Corp 資格排他性、LLC 破產連帶防火牆、委託代理倫理困境、敵意收購毒藥丸機制、限價訂單簿深度吃單 (Walking the Book)、高頻交易潛伏過期單、以及 Dodd-Frank 監管架構。
          </p>
          <div style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #ddd6fe; display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: space-between; align-items: center;">
            <div>
              <strong>試卷規格：</strong> 10 題深度情境選擇題（每題 5 分）＋ 10 題高難度計算與論述填充題（每題 5 分）＝ 滿分 100 分<br>
              <strong>榮譽段位：</strong> 90+ 傳奇公會大掌櫃 ｜ 75-89 皇家特許理財魔導師 ｜ 60-74 資深行會管事 ｜ &lt;60 重回新手村研讀
            </div>
            <div>
              <button class="btn-calc" style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);" onclick="checkAllExamAnswers()">
                <span>🎯 一鍵智能批改試卷並評定公會榮譽段位</span>
              </button>
            </div>
          </div>
          <div id="exam-score-banner" style="display:none; margin-top:1.2rem; padding:1.2rem; border-radius:8px; font-weight:700;"></div>
        </div>

        <!-- Part A: 10 題單一選擇題 -->
        <h3 style="color: #6d28d9; border-bottom: 2px solid #ddd6fe; padding-bottom: 0.5rem; margin-top: 2rem;">
          第一戰區：十道策略與陷阱選擇題 (Part A: 10 Multiple-Choice Questions, 50%)
        </h3>

        <!-- MCQ 1 -->
        <div class="problem-box" id="mcq-box-1">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">MCQ 01 · 稅務魔導深水陷阱</span>
            <span>「雙重課稅」與實質有效稅率之跨組織套利</span>
          </div>
          <p>
            【冒險情境】「艾澤拉斯礦業公司」今年每股稅前營業盈餘為 <strong>$12.50</strong>。已知法定企業所得稅率為 <strong>$\tau_c = 24\%$</strong>，個人股利所得稅率為 <strong>$\tau_d = 15\%$</strong>，而若作為穿透個體時適用的個人綜合所得稅率為 <strong>$\tau_p = 35\%$</strong>。該公司目前發行普通股 100 萬股，若其以傳統 C 型公司 (C-Corp) 營運並將稅後盈餘 100% 分派為現金股利；對比若其符合資格轉型為 S 型公司 (S-Corp)，則<strong>每一股</strong>能讓股東多保留（或少保留）多少現金？其 C-Corp 的整體實質有效稅率為何？
          </p>
          <div style="margin: 0.8rem 0; font-size: 0.95rem;">
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq1" value="A"> A. S-Corp 每股少拿 $0.075；C-Corp 實質有效稅率為 39.0%</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq1" value="B"> B. S-Corp 每股多拿 $0.050；C-Corp 實質有效稅率為 35.4%</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq1" value="C"> C. S-Corp 每股多拿 $0.050；C-Corp 實質有效稅率為 39.0%</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq1" value="D"> D. S-Corp 每股少拿 $0.050；C-Corp 實質有效稅率為 35.4%</label>
          </div>
          <button class="solution-toggle" onclick="toggleSolution('sol-mcq-1')">💡 展開考官解剖思路</button>
          <div id="sol-mcq-1" class="solution-body">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【精密計算步驟】</strong></p>
            <ol>
              <li><strong>C-Corp 模式：</strong><br>
                • 企業繳納所得稅：$$\$12.50 \times 24\% = \$3.00$$<br>
                • 剩餘稅後盈餘分派股利：$$\$12.50 - \$3.00 = \$9.50$$<br>
                • 股東繳納個人股利稅：$$\$9.50 \times 15\% = \$1.425$$<br>
                • 股東最終實拿現金：$$\$9.50 - \$1.425 = \mathbf{\$8.075}$$<br>
                • C-Corp 實質有效稅率：$$\text{Effective Rate} = 1 - (1 - 0.24)(1 - 0.15) = 1 - (0.76 \times 0.85) = 1 - 0.646 = \mathbf{35.4\%}$$
              </li>
              <li><strong>S-Corp 模式：</strong><br>
                • 企業層級免稅，稅前盈餘 \$12.50 全數穿透至股東個人。<br>
                • 股東繳納個人所得稅：$$\$12.50 \times 35\% = \$4.375$$<br>
                • 股東最終實拿現金：$$\$12.50 - \$4.375 = \mathbf{\$8.125}$$
              </li>
              <li><strong>差異比對：</strong>$$\$8.125 (\text{S-Corp}) - \$8.075 (\text{C-Corp}) = \mathbf{+\$0.050}$$（S-Corp 讓股東每股多拿到 \$0.05 元！）</li>
            </ol>
          </div>
        </div>

        <!-- MCQ 2 -->
        <div class="problem-box" id="mcq-box-2">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">MCQ 02 · 組織血統與法律特權</span>
            <span>四大企業型態之法律責任與制度防火牆辨析</span>
          </div>
          <p>
            【冒險情境】「巨神兵重工」是由五位傳奇鐵匠設立的組織。下列關於各類企業組織型態法律特徵的陳述，<strong>何者在法律與財務學理上完全正確？</strong>
          </p>
          <div style="margin: 0.8rem 0; font-size: 0.95rem;">
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq2" value="A"> A. 在有限合夥企業 (Limited Partnership) 中，若有限合夥人 (LP) 長期積極介入工廠日常營運與人事管理，其依法依然享有神聖不可侵犯的有限責任保護</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq2" value="B"> B. 有限責任公司 (LLC) 雖享有全員有限責任，但依美國稅法規定，其必須強制與 C 型公司承擔相同的雙重課稅義務</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq2" value="C"> C. 1819 年美國最高法院「達特茅斯學院案」的里程碑意義，在於確立了公司是一項受憲法契約條款保護的私人財產實體，各州政府無權擅自竄改或沒收其法人契約</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq2" value="D"> D. 獨資企業 (Sole Proprietorship) 的創辦人雖承擔無限責任，但當創辦人逝世時，該獨資商號仍可如同股份有限公司般具備「無限存續期 (Perpetual Life)」自動永久存續</label>
          </div>
          <button class="solution-toggle" onclick="toggleSolution('sol-mcq-2')">💡 展開考官解剖思路</button>
          <div id="sol-mcq-2" class="solution-body">
            <p><strong>【正確答案：C】</strong></p>
            <p><strong>【陷阱拆解與知識要點】</strong></p>
            <ul>
              <li><strong>選項 A 錯誤：</strong>有限合夥人 (LP) 的有限責任保護是以「不插手日常管理 (No managerial control)」為前提；一旦 LP 越俎代庖積極干預管理，法庭將認定其喪失屏障，視同普通合夥人 (GP) 承擔無限責任！</li>
              <li><strong>選項 B 錯誤：</strong>LLC 的巨大制度優勢正是「混血特權」——既享有全員有限責任，又享有合夥企業般的單一穿透課稅 (Pass-through taxation)，免除企業所得稅。</li>
              <li><strong>選項 C 完全正確：</strong>John Marshall 首席大法官在 1819 年判決確立公司為受憲法保護之契約，防止國家任意沒收民營企業資產，為現代股份有限公司奠定了法治基石。</li>
              <li><strong>選項 D 錯誤：</strong>獨資企業與業主靈魂綁定，業主死亡或退休，該獨資實體依法即告解散，絕無永續生命。</li>
            </ul>
          </div>
        </div>

        <!-- MCQ 3 -->
        <div class="problem-box" id="mcq-box-3">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">MCQ 03 · 資本市場微觀結構</span>
            <span>訂單簿深度 (Order Book Depth) 與流動性消耗 (Market Impact)</span>
          </div>
          <p>
            【冒險情境】某精靈科技股於那斯達克市場的即時限價訂單簿如下：<br>
            • <strong>Ask (賣盤掛單)：</strong>\$100.10 (300股)、\$100.25 (500股)、\$100.40 (1,000股)<br>
            • <strong>Bid (買盤掛單)：</strong>\$99.90 (400股)、\$99.75 (600股)、\$99.50 (1,200股)<br>
            若此時市場突發一筆<strong>「市價買單 1,200 股 (Market Buy Order for 1,200 shares)」</strong>湧入，則該筆訂單的<strong>成交加權平均價格 (VWAP)</strong> 以及成交後的<strong>最新買賣價差 (New Bid-Ask Spread)</strong> 分別為何？
          </p>
          <div style="margin: 0.8rem 0; font-size: 0.95rem;">
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq3" value="A"> A. 平均成交價 \$100.2625；最新買賣價差 \$0.50</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq3" value="B"> B. 平均成交價 \$100.2625；最新買賣價差 \$0.35</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq3" value="C"> C. 平均成交價 \$100.2125；最新買賣價差 \$0.50</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq3" value="D"> D. 平均成交價 \$100.2125；最新買賣價差 \$0.35</label>
          </div>
          <button class="solution-toggle" onclick="toggleSolution('sol-mcq-3')">💡 展開考官解剖思路</button>
          <div id="sol-mcq-3" class="solution-body">
            <p><strong>【正確答案：A】</strong></p>
            <p><strong>【深度撮合演算 Walking the Book】</strong></p>
            <ol>
              <li>買入 1,200 股需沿著 Ask 檔位往上吃單：<br>
                • 吃掉 Ask 1：以 <strong>\$100.10</strong> 成交 300 股 $\to$ 金額 $\$30,030$<br>
                • 吃掉 Ask 2：以 <strong>\$100.25</strong> 成交 500 股 $\to$ 金額 $\$50,125$<br>
                • 剩餘需求 $1,200 - 300 - 500 = 400$ 股，由 Ask 3 支應：以 <strong>\$100.40</strong> 成交 400 股 $\to$ 金額 $\$40,160$<br>
                • 總成交金額 = $\$30,030 + \$50,125 + \$40,160 = \mathbf{\$120,315}$<br>
                • 加權平均價格 = $$\frac{\$120,315}{1,200} = \mathbf{\$100.2625}$$
              </li>
              <li>成交後盤面變化：<br>
                • Ask 1 (\$100.10) 與 Ask 2 (\$100.25) 已全數清空！<br>
                • Ask 3 (\$100.40) 原有 1,000 股被吃掉 400 股，尚餘 600 股掛在 \$100.40。<br>
                • 因此<strong>最新 Best Ask = \$100.40</strong>；而買盤完全未動，<strong>Best Bid 仍為 \$99.90</strong>。<br>
                • 最新價差 = $$\$100.40 - \$99.90 = \mathbf{\$0.50}$$（流動性遭大單消耗，價差瞬間擴大！）
              </li>
            </ol>
          </div>
        </div>

        <!-- MCQ 4 -->
        <div class="problem-box" id="mcq-box-4">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">MCQ 04 · 治理與代理人賽局</span>
            <span>CEO 自利併購與激進股東防禦策略</span>
          </div>
          <p>
            【冒險情境】「風暴斗篷魔法藥劑公司」的股價長期低迷，管理層過度保守。某大型私募基金（掠奪者）認為若開除現任 CEO 並出售虧損事業群，公司每股價值將提升 45%。現任 CEO 為保住職位，提議利用公款以 30% 溢價強行收購另一家「防禦型重甲工坊」。這種行為在公司治理中稱為什麼？而市場上用以制衡此類惡意擺爛管理層的最強外部威懾力量為何？
          </p>
          <div style="margin: 0.8rem 0; font-size: 0.95rem;">
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq4" value="A"> A. 資訊不對稱 (Information Asymmetry)；陶德-弗蘭克諮詢性投票 (Say-on-Pay)</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq4" value="B"> B. 代理人問題之帝國擴張 (Empire Building)；敵意收購威脅 (Threat of Hostile Takeover)</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq4" value="C"> C. 逆向選擇 (Adverse Selection)；董事會交叉持股機制 (Cross-Shareholding)</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq4" value="D"> D. 道德風險 (Moral Hazard)；暗池大宗交易 (Dark Pools Trading)</label>
          </div>
          <button class="solution-toggle" onclick="toggleSolution('sol-mcq-4')">💡 展開考官解剖思路</button>
          <div id="sol-mcq-4" class="solution-body">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【考官題解剖析】</strong></p>
            <p>
              當經理人為追求個人權力、聲望與薪酬而盲目擴大規模，即使摧毀股東價值亦在所不惜時，是標準的<strong>「代理人問題—帝國擴張主義 (Empire Building)」</strong>。而當內部董事會監督失靈時，外部市場最致命的糾偏武器就是<strong>敵意收購 (Hostile Takeover)</strong>——掠奪者在公開市場繞過管理層直接收購多數股權，隨後強勢改組董事會並革職原管理層，釋放被壓抑的企業價值。
            </p>
          </div>
        </div>

        <!-- MCQ 5 -->
        <div class="problem-box" id="mcq-box-5">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">MCQ 05 · 初級與次級市場流通</span>
            <span>發行市場籌資與次級市場資產定價之真實互動</span>
          </div>
          <p>
            【冒險情境】下列關於初級市場 (Primary Market) 與次級市場 (Secondary Market) 的互動關係，何者陳述<strong>最為精準深刻</strong>？
          </p>
          <div style="margin: 0.8rem 0; font-size: 0.95rem;">
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq5" value="A"> A. 投資人在次級市場向另一位投資人買入台積電股票時，其支付的資金將直接流入台積電的銀行帳戶，供其採購極紫外光 (EUV) 機台</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq5" value="B"> B. 若次級市場缺乏流動性且交易成本極高，初級市場的投資人依然會樂意以高價認購公司發行的新股，因為兩者法律主體不同</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq5" value="C"> C. 次級市場為投資人提供了隨時變現的「流動性 (Liquidity)」，並為資產提供了即時市場評價；若沒有健全高流動性的次級市場，企業在初級市場發行新股的融資成本將大幅飆升</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq5" value="D"> D. 首度公開募股 (IPO) 與現金增資 (SEO) 皆屬於次級市場的典型交易</label>
          </div>
          <button class="solution-toggle" onclick="toggleSolution('sol-mcq-5')">💡 展開考官解剖思路</button>
          <div id="sol-mcq-5" class="solution-body">
            <p><strong>【正確答案：C】</strong></p>
            <p><strong>【概念剖析】</strong></p>
            <p>
              次級市場是投資人間的二手流通市場，資金在投資者之間流轉，發行公司<strong>不會直接獲得資金</strong>（選項 A 錯）。IPO 與 SEO 皆是公司親自發行新證券籌資，屬於<strong>初級市場</strong>（選項 D 錯）。如果次級市場沒有流動性，投資人買入股票後無法隨時賣掉，就必須要求極高的「非流動性折價」，導致公司在初級市場發行股票時價格大跌、資本成本暴增（選項 B 錯，選項 C 正確）。
            </p>
          </div>
        </div>

        <!-- MCQ 6 -->
        <div class="problem-box" id="mcq-box-6">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">MCQ 06 · S-Corp 資格排他性審查</span>
            <span>美國境內穿透實體之法定紅線審查</span>
          </div>
          <p>
            【冒險情境】「泰坦科技」打算在美國德拉瓦州登記為 S 型公司 (S Corporation) 以規避雙重課稅。下列四種股東與股權結構提案中，<strong>哪一項會直接導致該公司「喪失 S-Corp 資格」而強制被打回 C-Corp 課稅？</strong>
          </p>
          <div style="margin: 0.8rem 0; font-size: 0.95rem;">
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq6" value="A"> A. 公司擁有 95 位股東，且全數為具備美國公民身分的自然人</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq6" value="B"> B. 公司引進了具備合法永久居留權 (綠卡持有者) 的外籍自然人作為其第 80 位股東</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq6" value="C"> C. 公司為了吸引創投資本，發行了享有優先分紅權但無表決權的「特別股 (Preferred Stock)」，形成兩種不同權利等級的股份類別</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq6" value="D"> D. 公司全年度營業利潤未向股東發放任何現金股利，而是全數保留於公司進行技術研發</label>
          </div>
          <button class="solution-toggle" onclick="toggleSolution('sol-mcq-6')">💡 展開考官解剖思路</button>
          <div id="sol-mcq-6" class="solution-body">
            <p><strong>【正確答案：C】</strong></p>
            <p><strong>【S-Corp 法定三大紅線】</strong></p>
            <ol>
              <li>股東人數上限為 <strong>100 人</strong>（95 人合規）。</li>
              <li>股東必須為美國公民或<strong>稅務居民自然人 (Resident Alien / 綠卡持有者亦合規)</strong>；機構法人或外國非居民不得持股。</li>
              <li><strong>只能發行單一種類股票 (Single Class of Stock)</strong>！若發行享有不同清償或分紅順序的特別股，立即違反單一股份限制，資格當場註銷！</li>
            </ol>
          </div>
        </div>

        <!-- MCQ 7 -->
        <div class="problem-box" id="mcq-box-7">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">MCQ 07 · 高頻交易與微觀風險</span>
            <span>暗池 (Dark Pools) 機制與過期限價單 (Stale Limit Orders) 危機</span>
          </div>
          <p>
            【冒險情境】某國王退休基金希望在不驚動市場的情況下秘密拋售 50 萬股「皇家魔藥集團」股票。關於<strong>暗池 (Dark Pools)</strong> 與<strong>高頻交易商 (HFT)</strong> 的微觀機制，下列何者敘述<strong>正確</strong>？
          </p>
          <div style="margin: 0.8rem 0; font-size: 0.95rem;">
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq7" value="A"> A. 暗池交易系統會將大額買賣單即時廣播至全球所有公開交易所，以保證 100% 立即撮合成交</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq7" value="B"> B. 在暗池中交易的代價是「放棄即時成交保證」，若當時缺乏反向大宗委託，訂單可能無法成交；但優點是不會向市場洩漏交易意圖且通常撮合於價差中位數 (Midpoint)</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq7" value="C"> C. 當市場突發重大負面消息時，高頻交易機器人會優先幫助普通散戶撤銷過期的限價買單，避免散戶虧損</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq7" value="D"> D. 高頻交易商的唯一利潤來源是長期持有價值被低估的股票並領取季度股利</label>
          </div>
          <button class="solution-toggle" onclick="toggleSolution('sol-mcq-7')">💡 展開考官解剖思路</button>
          <div id="sol-mcq-7" class="solution-body">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【微觀市場學理】</strong></p>
            <p>
              暗池（Dark Pools）的核心賣點正是<strong>不公開訂單簿深度</strong>，讓機構法人避免大單曝光引發不利的市場衝擊（Market Impact），並常以買賣價中點撮合省下買賣價差；代價則是<strong>不保證成交（Sacrifice Immediacy）</strong>（選項 B 正確，A 錯誤）。高頻交易商利用超高速光纖搶在一般流動性提供者撤單前「狙擊吃掉過期報價（Stale Limit Orders）」進行套利，絕不可能替散戶護盤（選項 C、D 錯誤）。
            </p>
          </div>
        </div>

        <!-- MCQ 8 -->
        <div class="problem-box" id="mcq-box-8">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">MCQ 08 · 金融風暴與監管改革</span>
            <span>2010 年陶德-弗蘭克法案 (Dodd-Frank Act) 之高管薪酬監管核心</span>
          </div>
          <p>
            【冒險情境】2008 年華爾街金融海嘯後，美國國會通過《陶德-弗蘭克華爾街改革與消費者保護法案》。下列哪一項<strong>不是</strong>該法案針對公司高管薪酬與公司治理所制定的強制規範？
          </p>
          <div style="margin: 0.8rem 0; font-size: 0.95rem;">
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq8" value="A"> A. 至少每三年給予股東一次「非約束性諮詢投票權」以表決高管薪酬 (Say-on-Pay)</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq8" value="B"> B. 強制規定所有上市公司 CEO 的年薪上限不得超過普通員工平均薪資的 20 倍，超額部分直接沒收充公</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq8" value="C"> C. 設立「追回條款 (Clawback Provisions)」，當公司財報發生重大錯誤重編時，公司有權追回多發放給高管的績效獎金</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq8" value="D"> D. 強制揭露公司因收購而給予離職高層之「黃金降落傘 (Golden Parachutes)」大額補償方案並交由股東審查</label>
          </div>
          <button class="solution-toggle" onclick="toggleSolution('sol-mcq-8')">💡 展開考官解剖思路</button>
          <div id="sol-mcq-8" class="solution-body">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【法案核心知識】</strong></p>
            <p>
              陶德-弗蘭克法案（Dodd-Frank Act）旨在透過「資訊透明與股東參與」抑制高管盲目冒險，包含 Say-on-Pay 投票、CEO 與基層薪酬中位數比率的<strong>揭露要求</strong>、重編財報時的追回條款 (Clawbacks)、以及黃金降落傘揭露。但美國身為自由市場經濟體，<strong>法律絕對沒有設定固定倍數的薪資上限或直接沒收</strong>（選項 B 屬於虛構干預，為正確答案）。
            </p>
          </div>
        </div>

        <!-- MCQ 9 -->
        <div class="problem-box" id="mcq-box-9">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">MCQ 09 · 企業清算與破產優先權</span>
            <span>破產法第 11 章 (Chapter 11) vs 第 7 章 (Chapter 7) 之控制權移轉</span>
          </div>
          <p>
            【冒險情境】「矮人巨斧採礦工會」由於金價暴跌無法償還到期債券本息而陷入財務危機。關於現代企業破產（Corporate Bankruptcy）之法定程序，下列何者正確？
          </p>
          <div style="margin: 0.8rem 0; font-size: 0.95rem;">
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq9" value="A"> A. 只要公司發生債務違約，股東依然保有 100% 的最高控制權，債權人無權對公司資產主張任何處置權</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq9" value="B"> B. 在美國破產法第 7 章 (Chapter 7) 程序下，法院會指派破產管理人將企業所有資產全數變賣拍賣清算，所得價款依清償順位分發給債權人，企業隨後徹底消滅</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq9" value="C"> C. 在美國破產法第 11 章 (Chapter 11) 重組程序下，公司必須立刻停止所有營業活動並關閉全體門市</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq9" value="D"> D. 破產清算所得分配時，普通股股東享有最高清償優先權，優先於公司債債權人受償</label>
          </div>
          <button class="solution-toggle" onclick="toggleSolution('sol-mcq-9')">💡 展開考官解剖思路</button>
          <div id="sol-mcq-9" class="solution-body">
            <p><strong>【正確答案：B】</strong></p>
            <p><strong>【破產重組與清算機制】</strong></p>
            <p>
              破產法第 7 章為<strong>清算程序 (Liquidation)</strong>，拍賣資產並終結公司實體（選項 B 正確）。第 11 章為<strong>重組程序 (Reorganization)</strong>，允許公司在破產保護傘下繼續日常營運，並由債權人與管理層重組債務重生（選項 C 錯）。在清償順位上，債權人擁有法定優先求償權，股東是<strong>剩餘索償人 (Residual Claimants)</strong>，排在最末位（選項 D 錯）。一旦違約，企業實質控制權轉移至債權人手中（選項 A 錯）。
            </p>
          </div>
        </div>

        <!-- MCQ 10 -->
        <div class="problem-box" id="mcq-box-10">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">MCQ 10 · 財務長職責分工</span>
            <span>資本預算、資本結構與營運資金管理之實務辨認</span>
          </div>
          <p>
            【冒險情境】冒險者公會新聘了一位天才財務長 (CFO)。下列三項由 CFO 拍板定案的商業決策，其與財務決策類別的對應<strong>完全正確</strong>的是哪一組？<br>
            <strong>決策甲：</strong>決定向公眾發行 5 億金幣的 10 年期低利公司債，而非增發普通股。<br>
            <strong>決策乙：</strong>決定斥資 12 億金幣在遠古森林設立一座全新煉金實驗室與飛空艇船塢。<br>
            <strong>決策丙：</strong>將應收帳款的平均收款信用期限由 60 天緊縮為 30 天，並在錢包常備 5,000 萬流動現金。
          </p>
          <div style="margin: 0.8rem 0; font-size: 0.95rem;">
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq10" value="A"> A. 甲：資本預算 (投資) ｜ 乙：資本結構 (融資) ｜ 丙：營運資金管理</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq10" value="B"> B. 甲：資本結構 (融資) ｜ 乙：營運資金管理 ｜ 丙：資本預算 (投資)</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq10" value="C"> C. 甲：營運資金管理 ｜ 乙：資本預算 (投資) ｜ 丙：資本結構 (融資)</label>
            <label style="display:block; margin:0.4rem 0;"><input type="radio" name="mcq10" value="D"> D. 甲：資本結構 (融資) ｜ 乙：資本預算 (投資) ｜ 丙：營運資金管理</label>
          </div>
          <button class="solution-toggle" onclick="toggleSolution('sol-mcq-10')">💡 展開考官解剖思路</button>
          <div id="sol-mcq-10" class="solution-body">
            <p><strong>【正確答案：D】</strong></p>
            <p><strong>【CFO 三大核心權限歸納】</strong></p>
            <ul>
              <li><strong>決策甲（發債 vs 增資）：</strong>決定公司資金來源中股權與債權的槓桿配比，屬於<strong>融資決策 / 資本結構 (Financing / Capital Structure)</strong>。</li>
              <li><strong>決策乙（投資船塢與實驗室）：</strong>決定將長期資金投向哪些具備正淨現值的實體資產，屬於<strong>投資決策 / 資本預算 (Investment / Capital Budgeting)</strong>。</li>
              <li><strong>決策丙（催收款與現金常備）：</strong>管理流動資產與流動負債的日常運作，屬於<strong>營運資金管理 (Working Capital Management)</strong>。</li>
            </ul>
          </div>
        </div>

        <!-- Part B: 10 題計算與論述填充題 -->
        <h3 style="color: #6d28d9; border-bottom: 2px solid #ddd6fe; padding-bottom: 0.5rem; margin-top: 3.5rem;">
          第二戰區：十道深水演算與精準填空題 (Part B: 10 Fill-in-the-Blank &amp; Calculation Problems, 50%)
        </h3>

        <!-- Blank 1 -->
        <div class="problem-box" id="blank-box-1">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">Blank 01 · 雙重課稅跨期試算</span>
            <span>跨國雙層稅率之股東可支配淨利推演</span>
          </div>
          <p>
            【試題】某大型上市 C 型公司今年度每股稅前利潤為 <strong>$15.00</strong>。若法定企業所得稅率為 <strong>$28\%$</strong>，在全數稅後利潤皆發放為現金股利的前提下，股東個人繳納完 <strong>$20\%$</strong> 的個人股利所得稅後，每股最終實拿現金為 <input type="text" id="fb1" style="width:120px; font-weight:700; text-align:center;" placeholder="填入金額，如 8.64"> 元，該公司的整體實質總有效稅率為 <input type="text" id="fb1_rate" style="width:100px; font-weight:700; text-align:center;" placeholder="如 42.4%">。（金額請四捨五入計算至小數點後兩位，百分比至小數點後一位）
          </p>
          <button class="solution-toggle" onclick="toggleSolution('sol-fb-1')">💡 展開推導步驟</button>
          <div id="sol-fb-1" class="solution-body">
            <p><strong>【核心解答：$8.64 元 ｜ 42.4%】</strong></p>
            <p>
              1. 企業所得稅 = $\$15.00 \times 28\% = \$4.20$<br>
              2. 稅後分派股利 = $\$15.00 - \$4.20 = \$10.80$<br>
              3. 個人股利稅 = $\$10.80 \times 20\% = \$2.16$<br>
              4. 股東實拿現金 = $\$10.80 - \$2.16 = \mathbf{\$8.64}$<br>
              5. 實質有效總稅率 = $$1 - (1 - 0.28)(1 - 0.20) = 1 - (0.72 \times 0.80) = 1 - 0.576 = \mathbf{42.4\%}$$
            </p>
          </div>
        </div>

        <!-- Blank 2 -->
        <div class="problem-box" id="blank-box-2">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">Blank 02 · 訂單簿深度吃單計算</span>
            <span>大額買單穿透兩檔賣盤之平均成交價演算</span>
          </div>
          <p>
            【試題】微軟 (MSFT) 股票當前電子訂單簿顯示：最優賣價 Ask 1 為 <strong>$320.10</strong> (掛單量 300 股)，次優賣價 Ask 2 為 <strong>$320.40</strong> (掛單量 700 股)。若某對沖基金送出一筆 <strong>500 股的市價買單</strong>，則該筆買單成交的<strong>總花費金額</strong>為 <input type="text" id="fb2_tot" style="width:140px; font-weight:700; text-align:center;" placeholder="填入總金額"> 元，其平均每股成交價格為 <input type="text" id="fb2_avg" style="width:120px; font-weight:700; text-align:center;" placeholder="填入每股平均價"> 元。
          </p>
          <button class="solution-toggle" onclick="toggleSolution('sol-fb-2')">💡 展開推導步驟</button>
          <div id="sol-fb-2" class="solution-body">
            <p><strong>【核心解答：$160,110 元 ｜ $320.22】</strong></p>
            <p>
              1. 吃掉 Ask 1：以 \$320.10 買入 300 股，花費 $\$320.10 \times 300 = \$96,030$<br>
              2. 往上吃 Ask 2：以 \$320.40 買入剩下的 200 股，花費 $\$320.40 \times 200 = \$64,080$<br>
              3. 總花費金額 = $\$96,030 + \$64,080 = \mathbf{\$160,110}$<br>
              4. 平均每股成交價 = $$\frac{\$160,110}{500} = \mathbf{\$320.22}$$
            </p>
          </div>
        </div>

        <!-- Blank 3 -->
        <div class="problem-box" id="blank-box-3">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">Blank 03 · 買賣價差之造市商報酬率</span>
            <span>做市商 (Market Maker) 雙向買賣淨利差率</span>
          </div>
          <p>
            【試題】紐約證交所 (NYSE) 的指定造市商 (DMM) 同時報出某股票買價 $\text{Bid} = \$49.80$ 與賣價 $\text{Ask} = \$50.20$。如果造市商成功在同一時間以 Bid 買進 10,000 股並以 Ask 賣出 10,000 股，其鎖定的純價差毛利潤為 <input type="text" id="fb3_prof" style="width:120px; font-weight:700; text-align:center;" placeholder="填入金額"> 元；而對此時立即市價買入該股票又因故立刻市價賣出的投資人而言，其瞬間承擔的交易成本百分比 (以 Ask 買入價為基準) 為 <input type="text" id="fb3_pct" style="width:100px; font-weight:700; text-align:center;" placeholder="如 0.8%">。（百分比計算至小數點後二位）
          </p>
          <button class="solution-toggle" onclick="toggleSolution('sol-fb-3')">💡 展開推導步驟</button>
          <div id="sol-fb-3" class="solution-body">
            <p><strong>【核心解答：$4,000 元 ｜ 0.80%】</strong></p>
            <p>
              1. 每一股價差 = $\$50.20 - \$49.80 = \$0.40$<br>
              2. 造市商毛利 = $\$0.40 \times 10,000 = \mathbf{\$4,000}$<br>
              3. 投資人摩擦成本比率 = $$\frac{\$0.40}{\$50.20} \approx \mathbf{0.7968\% \approx 0.80\%}$$
            </p>
          </div>
        </div>

        <!-- Blank 4 -->
        <div class="problem-box" id="blank-box-4">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">Blank 04 · 公司法律實體判例</span>
            <span>確立現代股份有限公司受憲法契約保護之最高法院判例</span>
          </div>
          <p>
            【試題】在美國法律歷史上，奠定現代私人企業所有權與法人地位不受州政府任意接管侵奪的劃時代憲法判例為 1819 年的「<input type="text" id="fb4" style="width:220px; font-weight:700; text-align:center;" placeholder="輸入判例名稱"> 案 (Dartmouth College Case)」。該判決確立了公司章程本質上屬於受憲法第一條第十款保護的私人契約。
          </p>
          <button class="solution-toggle" onclick="toggleSolution('sol-fb-4')">💡 展開解答</button>
          <div id="sol-fb-4" class="solution-body">
            <p><strong>【核心解答：達特茅斯學院 / Dartmouth College】</strong></p>
            <p>
              1819 年「達特茅斯學院訴伍德沃德案 (Trustees of Dartmouth College v. Woodward)」，確立州政府不得通過任何侵害契約義務的法律，保護了企業組織的永續性與私人財產權。
            </p>
          </div>
        </div>

        <!-- Blank 5 -->
        <div class="problem-box" id="blank-box-5">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">Blank 05 · 公司治理組織架構</span>
            <span>股東大會、董事會與執行長的權力委任鏈</span>
          </div>
          <p>
            【試題】在現代股份有限公司的治理結構中，成千上萬的股東透過投票選舉產生 <input type="text" id="fb5_1" style="width:160px; font-weight:700; text-align:center;" placeholder="職能機構中文"> (Board of Directors)，該機構擁有企業最高治理裁決權，並負責任命、考核與決定 <input type="text" id="fb5_2" style="width:160px; font-weight:700; text-align:center;" placeholder="職位中文或縮寫"> (Chief Executive Officer) 的薪酬與任免。
          </p>
          <button class="solution-toggle" onclick="toggleSolution('sol-fb-5')">💡 展開解答</button>
          <div id="sol-fb-5" class="solution-body">
            <p><strong>【核心解答：董事會 ｜ 執行長 (或 CEO / 總經理)】</strong></p>
            <p>
              此體制體現了現代公司「所有權與控制權分離」的核心特質。
            </p>
          </div>
        </div>

        <!-- Blank 6 -->
        <div class="problem-box" id="blank-box-6">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">Blank 07 · 交易場所機制演進</span>
            <span>專門造市專家 vs 電子通訊撮合網絡</span>
          </div>
          <p>
            【試題】在歷史悠久的紐約證券交易所 (NYSE) 實體交易廳中，負責在特定交易櫃檯撮合個別股票買賣並掛出雙向報價的關鍵交易員傳統上稱為「<input type="text" id="fb7_1" style="width:160px; font-weight:700; text-align:center;" placeholder="英文或中文職稱"> (Specialist / DMM)」；而在全電子化的那斯達克 (NASDAQ) 市場中，股票則是透過分散的多家「<input type="text" id="fb7_2" style="width:160px; font-weight:700; text-align:center;" placeholder="英文或中文職稱"> (Market Makers)」進行報價與競爭。
          </p>
          <button class="solution-toggle" onclick="toggleSolution('sol-fb-6')">💡 展開解答</button>
          <div id="sol-fb-6" class="solution-body">
            <p><strong>【核心解答：專家經紀人 (或指定造市商 / Specialist) ｜ 造市商 (或經紀商 / Market Makers)】</strong></p>
            <p>
              NYSE 早期採單一專家制 (Single Specialist)，後改為指定造市商 (Designated Market Maker, DMM)；NASDAQ 則自創立之初即為多造市商競爭網路。
            </p>
          </div>
        </div>

        <!-- Blank 7 -->
        <div class="problem-box" id="blank-box-7">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">Blank 06 · 敵意收購與防禦武器</span>
            <span>次級市場控制權爭奪與防禦稀釋策略</span>
          </div>
          <p>
            【試題】當外部收購者繞過目標公司管理層，直接向股東公開出價收購股份以謀求控制權時，稱為「<input type="text" id="fb6_1" style="width:160px; font-weight:700; text-align:center;" placeholder="填入收購型態"> (Hostile Takeover)」；而目標公司管理層為了防禦此類收購，常設計一種允許原有股東以極低價格大幅增購新股、進而極度稀釋收購者持股比例的防禦機制，俗稱為「<input type="text" id="fb6_2" style="width:160px; font-weight:700; text-align:center;" placeholder="填入策略俗稱"> (Poison Pill)」。
          </p>
          <button class="solution-toggle" onclick="toggleSolution('sol-fb-7')">💡 展開解答</button>
          <div id="sol-fb-7" class="solution-body">
            <p><strong>【核心解答：敵意收購 (或惡意收購) ｜ 毒藥丸策略 (或毒藥丸條款)】</strong></p>
            <p>
              毒藥丸策略（股東權利計畫 Shareholder Rights Plan）是美國企業防禦敵意併購最著名的武器之一。
            </p>
          </div>
        </div>

        <!-- Blank 8 -->
        <div class="problem-box" id="blank-box-8">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">Blank 08 · 委託代理薪酬對齊</span>
            <span>經理人激勵契約中化解道德風險之股權工具</span>
          </div>
          <p>
            【試題】為了解決經理人追求個人私利而損害股東利益的「委託代理問題」，董事會常將高管薪酬與企業長期績效相綁定，其中最常見的兩大金融工具為「股票選擇權 (Stock Options)」與「<input type="text" id="fb8" style="width:180px; font-weight:700; text-align:center;" placeholder="中文或英文工具名稱"> (Restricted Stock)」。
          </p>
          <button class="solution-toggle" onclick="toggleSolution('sol-fb-8')">💡 展開解答</button>
          <div id="sol-fb-8" class="solution-body">
            <p><strong>【核心解答：限制型股票 / 限制性股票】</strong></p>
            <p>
              限制型股票（Restricted Stock）需經特定服務年限或績效達標後才能解鎖賣出，能有效避免經理人只炒作短期股價便套現離職。
            </p>
          </div>
        </div>

        <!-- Blank 9 -->
        <div class="problem-box" id="blank-box-9">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">Blank 09 · 另類交易系統之大宗隱匿</span>
            <span>不公開深層掛單之撮合平台英文專有名詞</span>
          </div>
          <p>
            【試題】在現代股票市場中，不向公眾揭露買賣限價訂單簿、專門供機構投資人進行大額隱密交易以避免衝擊市場價格的另類電子交易池，其英文正式術語為「<input type="text" id="fb9" style="width:160px; font-weight:700; text-align:center;" placeholder="英文兩字"> (Dark Pools)」。
          </p>
          <button class="solution-toggle" onclick="toggleSolution('sol-fb-9')">💡 展開解答</button>
          <div id="sol-fb-9" class="solution-body">
            <p><strong>【核心解答：Dark Pools / 暗池】</strong></p>
            <p>
              暗池佔美國目前股票交易量超過三分之一，提供大額流動性隱匿性，但被監管機構檢視是否損害公開市場的價格發現功能。
            </p>
          </div>
        </div>

        <!-- Blank 10 -->
        <div class="problem-box" id="blank-box-10">
          <div class="problem-head">
            <span class="problem-tag" style="background:#ede9fe; color:#6d28d9;">Blank 10 · 金融科技創新演化</span>
            <span>演算法全自動財富管理與避稅收割平台模式</span>
          </div>
          <p>
            【試題】在金融科技 (Fintech) 領域中，像 Wealthfront 這類利用演算法取代昂貴的私人理財專員、依據投資人風險偏好全自動構建與動態再平衡多元化 ETF 投資組合的數位化平台，在金融學界被統稱為「<input type="text" id="fb10" style="width:200px; font-weight:700; text-align:center;" placeholder="中文或英文統稱"> (Robo-Advisor)」。
          </p>
          <button class="solution-toggle" onclick="toggleSolution('sol-fb-10')">💡 展開解答</button>
          <div id="sol-fb-10" class="solution-body">
            <p><strong>【核心解答：智能理財顧問 / 機器人理財 / Robo-Advisor】</strong></p>
            <p>
              Robo-Advisor 大幅降低了資產管理費率（從 1.5% 降至 0.25%），並實現每日自動化的「稅務虧損收割 (Tax-Loss Harvesting)」，體現科技對傳統金融中介的普惠顛覆。
            </p>
          </div>
        </div>

      </section>
'''

# 構造對應的測驗自動批改 JS 腳本
exam_js = r'''
    // 測驗答案對照表
    const mcqAnswers = {
      mcq1: "B",
      mcq2: "C",
      mcq3: "A",
      mcq4: "B",
      mcq5: "C",
      mcq6: "C",
      mcq7: "B",
      mcq8: "B",
      mcq9: "B",
      mcq10: "D"
    };

    function checkAllExamAnswers() {
      let score = 0;

      // 1. 檢查 MCQ 1 ~ 10
      for (let i = 1; i <= 10; i++) {
        const name = "mcq" + i;
        const radios = document.getElementsByName(name);
        let selected = "";
        for (let r of radios) {
          if (r.checked) {
            selected = r.value;
            break;
          }
        }
        const box = document.getElementById("mcq-box-" + i);
        if (selected === mcqAnswers[name]) {
          score += 5;
          box.style.border = "2px solid #16a34a";
        } else {
          box.style.border = "2px solid #dc2626";
        }
      }

      // 2. 檢查填充題 1 ~ 10
      // Blank 1: 8.64, 42.4%
      const fb1 = (document.getElementById('fb1').value || '').trim();
      const fb1_r = (document.getElementById('fb1_rate').value || '').replace('%', '').trim();
      if ((fb1 === "8.64" || fb1 === "8.6") && (fb1_r === "42.4" || fb1_r === "42.4%")) {
        score += 5;
        document.getElementById('blank-box-1').style.border = "2px solid #16a34a";
      } else {
        document.getElementById('blank-box-1').style.border = "2px solid #dc2626";
      }

      // Blank 2: 160110, 320.22
      const fb2_tot = (document.getElementById('fb2_tot').value || '').replace(/[\$,]/g, '').trim();
      const fb2_avg = (document.getElementById('fb2_avg').value || '').replace(/[\$,]/g, '').trim();
      if (fb2_tot === "160110" && (fb2_avg === "320.22" || fb2_avg === "320.2")) {
        score += 5;
        document.getElementById('blank-box-2').style.border = "2px solid #16a34a";
      } else {
        document.getElementById('blank-box-2').style.border = "2px solid #dc2626";
      }

      // Blank 3: 4000, 0.8
      const fb3_prof = (document.getElementById('fb3_prof').value || '').replace(/[\$,]/g, '').trim();
      const fb3_pct = (document.getElementById('fb3_pct').value || '').replace('%', '').trim();
      if ((fb3_prof === "4000" || fb3_prof === "4,000") && (fb3_pct.startsWith("0.8") || fb3_pct.startsWith("0.79"))) {
        score += 5;
        document.getElementById('blank-box-3').style.border = "2px solid #16a34a";
      } else {
        document.getElementById('blank-box-3').style.border = "2px solid #dc2626";
      }

      // Blank 4: 達特茅斯學院 / Dartmouth
      const fb4 = (document.getElementById('fb4').value || '').trim().toLowerCase();
      if (fb4.includes("達特茅斯") || fb4.includes("dartmouth")) {
        score += 5;
        document.getElementById('blank-box-4').style.border = "2px solid #16a34a";
      } else {
        document.getElementById('blank-box-4').style.border = "2px solid #dc2626";
      }

      // Blank 5: 董事會 ｜ 執行長 / CEO
      const fb5_1 = (document.getElementById('fb5_1').value || '').trim();
      const fb5_2 = (document.getElementById('fb5_2').value || '').trim().toUpperCase();
      if ((fb5_1.includes("董事會") || fb5_1.toLowerCase().includes("board")) && (fb5_2.includes("CEO") || fb5_2.includes("執行長") || fb5_2.includes("總經理"))) {
        score += 5;
        document.getElementById('blank-box-5').style.border = "2px solid #16a34a";
      } else {
        document.getElementById('blank-box-5').style.border = "2px solid #dc2626";
      }

      // Blank 6: 敵意收購 ｜ 毒藥丸
      const fb6_1 = (document.getElementById('fb6_1').value || '').trim();
      const fb6_2 = (document.getElementById('fb6_2').value || '').trim();
      if ((fb6_1.includes("敵意") || fb6_1.includes("惡意") || fb6_1.toLowerCase().includes("hostile")) && (fb6_2.includes("毒藥丸") || fb6_2.toLowerCase().includes("poison"))) {
        score += 5;
        document.getElementById('blank-box-7').style.border = "2px solid #16a34a";
      } else {
        document.getElementById('blank-box-7').style.border = "2px solid #dc2626";
      }

      // Blank 7: 專家經紀人/DMM ｜ 造市商
      const fb7_1 = (document.getElementById('fb7_1').value || '').trim().toLowerCase();
      const fb7_2 = (document.getElementById('fb7_2').value || '').trim().toLowerCase();
      if ((fb7_1.includes("專") || fb7_1.includes("specialist") || fb7_1.includes("dmm") || fb7_1.includes("造市")) && (fb7_2.includes("造市") || fb7_2.includes("market maker") || fb7_2.includes("經紀"))) {
        score += 5;
        document.getElementById('blank-box-6').style.border = "2px solid #16a34a";
      } else {
        document.getElementById('blank-box-6').style.border = "2px solid #dc2626";
      }

      // Blank 8: 限制型股票
      const fb8 = (document.getElementById('fb8').value || '').trim().toLowerCase();
      if (fb8.includes("限制") || fb8.includes("restricted")) {
        score += 5;
        document.getElementById('blank-box-8').style.border = "2px solid #16a34a";
      } else {
        document.getElementById('blank-box-8').style.border = "2px solid #dc2626";
      }

      // Blank 9: 暗池 / Dark Pools
      const fb9 = (document.getElementById('fb9').value || '').trim().toLowerCase();
      if (fb9.includes("dark") || fb9.includes("暗池")) {
        score += 5;
        document.getElementById('blank-box-9').style.border = "2px solid #16a34a";
      } else {
        document.getElementById('blank-box-9').style.border = "2px solid #dc2626";
      }

      // Blank 10: 智能理財顧問 / 機器人理財 / Robo-Advisor
      const fb10 = (document.getElementById('fb10').value || '').trim().toLowerCase();
      if (fb10.includes("智能") || fb10.includes("機器人") || fb10.includes("robo") || fb10.includes("投顧")) {
        score += 5;
        document.getElementById('blank-box-10').style.border = "2px solid #16a34a";
      } else {
        document.getElementById('blank-box-10').style.border = "2px solid #dc2626";
      }

      // 評價與段位
      const banner = document.getElementById("exam-score-banner");
      banner.style.display = "block";
      let rank = "";
      let rankColor = "";
      let comment = "";

      if (score >= 90) {
        rank = "👑 傳奇公會首席神掌櫃 (Legendary Arch-Arborist)";
        rankColor = "#15803d";
        banner.style.background = "#dcfce7";
        banner.style.border = "2px solid #86efac";
        comment = "太震撼了！你對雙重課稅、微觀訂單簿吃單、代理人博弈與監管架構的掌握已經臻至化境！期中考試必將無懸念橫掃滿分！";
      } else if (score >= 75) {
        rank = "⚔️ 皇家特許理財魔導師 (Royal Chartered Arborist)";
        rankColor = "#0369a1";
        banner.style.background = "#e0f2fe";
        banner.style.border = "2px solid #7dd3fc";
        comment = "優異的戰績！核心概念非常清晰，少數題目可能在微觀小數點或術語細節上略有瑕疵，稍加複習即可封神！";
      } else if (score >= 60) {
        rank = "🛡️ 資深行會管事 (Senior Guild Officer)";
        rankColor = "#d97706";
        banner.style.background = "#fef3c7";
        banner.style.border = "2px solid #fde68a";
        comment = "達到及格門檻！但遇到深度跨章節綜合題（如訂單簿連續吃單或實質有效稅率反推）容易失誤，建議多玩幾次上方的互動實驗室！";
      } else {
        rank = "🌱 銅卡見習學徒 (Bronze Novice Apprentice)";
        rankColor = "#b91c1c";
        banner.style.background = "#fee2e2";
        banner.style.border = "2px solid #fca5a5";
        comment = "警報響起！基礎觀念尚有未打通之處（紅框標記為答錯或未作答題目）。請立刻展開解答詳讀考官剖析，重整裝備再戰！";
      }

      banner.innerHTML = `
        <div style="font-size:1.3rem; color:${rankColor}; margin-bottom:0.4rem;">
          試煉總得分：<strong>${score} / 100 分</strong> ｜ 榮譽封號：<strong>${rank}</strong>
        </div>
        <div style="font-size:0.95rem; color:#334155;">
          ${comment} (綠框標註為完全正確，紅框標註為答錯或未填，可點擊「展開思路」查看詳盡公式推導！)
        </div>
      `;

      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
'''

# 進行插入操作：
# 1. 在側邊目錄中的 `#summary` 前加入 `#midterm-exam` 的導覽連結
old_toc_summary = '<li><a href="#summary">2.0 本章記憶膠囊</a></li>'
new_toc_summary = '<li><a href="#midterm-exam" style="color:#7c3aed; font-weight:700;">⚔️ 20題期中模擬大典</a></li>\n        <li><a href="#summary">2.0 本章記憶膠囊</a></li>'

# 2. 在 `<section id="summary">` 前插入 `exam_section_html`
old_summary_sec = '<section id="summary">'
new_summary_sec = exam_section_html + '\n      <!-- 總結與記憶膠囊 -->\n      <section id="summary">'

# 3. 在 `<script>` 的結尾前插入 `exam_js`
old_script_end = "window.addEventListener('DOMContentLoaded', () => {"
new_script_end = exam_js + "\n    window.addEventListener('DOMContentLoaded', () => {"

# 替換
updated_code = orig_code.replace(old_toc_summary, new_toc_summary)
updated_code = updated_code.replace(old_summary_sec, new_summary_sec)
updated_code = updated_code.replace(old_script_end, new_script_end)

with open(base_path, "w", encoding="utf-8") as f:
    f.write(updated_code)

print("Updated scripts/build_ch01_handout.py successfully!")
