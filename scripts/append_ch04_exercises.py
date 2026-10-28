# -*- coding: utf-8 -*-
"""
Append Exercises E4.1 to E4.25 to Chapter 4 IFRS Learning Handout.
- Answers are in English.
- Explanations are primarily in Traditional Chinese (繁體中文).
- Includes all step-by-step mathematical procedures with LaTeX math formatting.
- Adds "展開/收合全部習題解析" toggle button.
- Updates TOC sidebar.
- Synchronizes across workspace and all target locations.
"""

import os
import re

def get_exercises_html():
    return r'''
      <!-- ========================================== -->
      <!-- 第四章課後精選綜合習題全解 (E4.1 ~ E4.25) -->
      <!-- ========================================== -->
      <section id="chapter-exercises">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-bottom:1.5rem; border-bottom:3px solid var(--accent-light); padding-bottom:0.75rem;">
          <div>
            <h2 style="margin:0; color:var(--dark);">📚 Chapter 4 課後綜合實戰習題全解 (Exercises E4.1 ~ E4.25)</h2>
            <p style="margin:0.25rem 0 0; color:var(--muted); font-size:0.92rem;">
              收錄中級會計學（IFRS）第四章全部 25 道經典題型。<strong>【答案以英文呈現，解題思路與觀念剖析以中文詳盡拆解】</strong>
            </p>
          </div>
          <div style="margin-top:0.5rem;">
            <button class="solution-toggle" style="background:var(--accent-dark); color:white; padding:0.55rem 1.1rem;" onclick="toggleAllExercises()">
              👁️ 一鍵展開 / 收合全部習題解析
            </button>
          </div>
        </div>

        <!-- E4.1 -->
        <div class="problem-box" id="ex-4-1">
          <div class="problem-head">
            <span class="problem-tag">E4.1 (LO 1)</span>
            <span>Using Interest Tables (查閱利率表之期數與利率轉換)</span>
          </div>
          <p>For each of the following cases, indicate (a) to what rate columns, and (b) to what number of periods you would refer in looking up the interest factor.</p>
          
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; margin:0.8rem 0;">
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.8rem;">
              <strong>1. In a future value of 1 table:</strong>
              <table style="width:100%; font-size:0.85rem; margin-top:0.4rem; border-collapse:collapse;">
                <tr style="border-bottom:1px solid #cbd5e1;"><th>Case</th><th>Annual Rate</th><th>Years Invested</th><th>Compounded</th></tr>
                <tr><td>a.</td><td>9%</td><td>9</td><td>Annually</td></tr>
                <tr><td>b.</td><td>12%</td><td>5</td><td>Quarterly</td></tr>
                <tr><td>c.</td><td>10%</td><td>15</td><td>Semiannually</td></tr>
              </table>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.8rem;">
              <strong>2. In a present value of an annuity of 1 table:</strong>
              <table style="width:100%; font-size:0.85rem; margin-top:0.4rem; border-collapse:collapse;">
                <tr style="border-bottom:1px solid #cbd5e1;"><th>Case</th><th>Annual Rate</th><th>Years Invested</th><th>Frequency of Rents</th></tr>
                <tr><td>a.</td><td>9%</td><td>25</td><td>Annually (25 rents)</td></tr>
                <tr><td>b.</td><td>10%</td><td>15</td><td>Semiannually (30 rents)</td></tr>
                <tr><td>c.</td><td>12%</td><td>7</td><td>Quarterly (28 rents)</td></tr>
              </table>
            </div>
          </div>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-1')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-1" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p><strong>1. Future Value of 1 Table:</strong><br>
              &bull; <strong>Case a:</strong> (a) <strong>Rate column: 9%</strong>, (b) <strong>Number of periods: 9 periods</strong>.<br>
              &bull; <strong>Case b:</strong> (a) <strong>Rate column: 3%</strong> ($12\% / 4$), (b) <strong>Number of periods: 20 periods</strong> ($5 \times 4$).<br>
              &bull; <strong>Case c:</strong> (a) <strong>Rate column: 5%</strong> ($10\% / 2$), (b) <strong>Number of periods: 30 periods</strong> ($15 \times 2$).
            </p>
            <p><strong>2. Present Value of an Annuity of 1 Table:</strong><br>
              &bull; <strong>Case a:</strong> (a) <strong>Rate column: 9%</strong>, (b) <strong>Number of periods: 25 periods</strong>.<br>
              &bull; <strong>Case b:</strong> (a) <strong>Rate column: 5%</strong> ($10\% / 2$), (b) <strong>Number of periods: 30 periods</strong> ($15 \times 2$).<br>
              &bull; <strong>Case c:</strong> (a) <strong>Rate column: 3%</strong> ($12\% / 4$), (b) <strong>Number of periods: 28 periods</strong> ($7 \times 4$).
            </p>
            <p><strong>【中文解題剖析】</strong><br>
              當利息計算頻率非「每年計息一次」時，查閱複利表必須遵守兩大黃金轉換鐵律：<br>
              1. <strong>期利率（Rate per period, $i$）：</strong> 名目年利率除以每年計息次數 $m$（即 $i = \text{Annual Rate} / m$）。<br>
              2. <strong>總計息期數（Total periods, $n$）：</strong> 總投資年數乘以每年計息次數 $m$（即 $n = \text{Years} \times m$）。
            </p>
          </div>
        </div>

        <!-- E4.2 -->
        <div class="problem-box" id="ex-4-2">
          <div class="problem-head">
            <span class="problem-tag">E4.2 (LO 1, 2)</span>
            <span>Simple and Compound Interest Computations (單利與複利累積計算)</span>
          </div>
          <p>Sue Ang invests HK$20,000 at 8% annual interest, leaving the money invested without withdrawing any of the interest for 8 years. At the end of the 8 years, Sue withdraws the accumulated amount of money.</p>
          <p><strong>Instructions:</strong> Compute the amount Sue would withdraw assuming the investment earns: (a) simple interest, (b) interest compounded annually, and (c) interest compounded semiannually.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-2')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-2" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>Part a (Simple Interest):</strong> <strong>HK$32,800.00</strong><br>
              &bull; <strong>Part b (Compounded Annually):</strong> <strong>HK$37,018.60</strong><br>
              &bull; <strong>Part c (Compounded Semiannually):</strong> <strong>HK$37,459.62</strong>
            </p>
            <p><strong>【中文解題剖析與精算過程】</strong></p>
            <ol>
              <li><strong>(a) 單利計算 (Simple Interest)：</strong><br>
                利息僅以原始本金計算：$I = P \times i \times n = 20,000 \times 8\% \times 8 = \text{HK\$}12,800$。<br>
                終值累積金額 $FV = P + I = 20,000 + 12,800 = \mathbf{\text{HK\$}32,800}$。
              </li>
              <li><strong>(b) 每年複利一次 (Compounded Annually)：</strong><br>
                $i = 8\%$, $n = 8$。<br>
                $FV = PV \times (1 + i)^n = 20,000 \times (1.08)^8 = 20,000 \times 1.8509302 = \mathbf{\text{HK\$}37,018.60}$。
              </li>
              <li><strong>(c) 每半年複利一次 (Compounded Semiannually)：</strong><br>
                每半年利率 $i = 8\% / 2 = 4\%$，總期數 $n = 8 \times 2 = 16$。<br>
                $FV = PV \times (1 + i)^n = 20,000 \times (1.04)^{16} = 20,000 \times 1.8729812 = \mathbf{\text{HK\$}37,459.62}$。<br>
                <em>（觀察：計息頻率越密集，複利利滾利威力越強，半年複利比單利整整多出 HK$4,659.62！）</em>
              </li>
            </ol>
          </div>
        </div>

        <!-- E4.3 -->
        <div class="problem-box" id="ex-4-3">
          <div class="problem-head">
            <span class="problem-tag">E4.3 (LO 2, 3, 4)</span>
            <span>Computation of Future Values and Present Values (終值與現值綜合計算)</span>
          </div>
          <p>Using the appropriate interest table, answer each of the following questions. (Each case is independent of the others.)</p>
          <p>
            a. What is the future value of &euro;7,000 at the end of 5 periods at 8% compounded interest?<br>
            b. What is the present value of &euro;7,000 due 8 periods hence, discounted at 6%?<br>
            c. What is the future value of 15 periodic payments of &euro;7,000 each made at the end of each period and compounded at 10%?<br>
            d. What is the present value of &euro;7,000 to be received at the end of each of 20 periods, discounted at 5% compound interest?
          </p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-3')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-3" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>a. Future Value of Single Sum:</strong> <strong>&euro;10,285.30</strong> (or &euro;10,285.31)<br>
              &bull; <strong>b. Present Value of Single Sum:</strong> <strong>&euro;4,391.89</strong> (Table factor $0.62741 \implies$ &euro;4,391.87)<br>
              &bull; <strong>c. Future Value of Ordinary Annuity:</strong> <strong>&euro;222,407.37</strong> (Table factor $31.77248 \implies$ &euro;222,407.36)<br>
              &bull; <strong>d. Present Value of Ordinary Annuity:</strong> <strong>&euro;87,235.47</strong> (Table factor $12.46221 \implies$ &euro;87,235.47)
            </p>
            <p><strong>【中文解題剖析與精算過程】</strong></p>
            <ul>
              <li><strong>a. 單筆終值 ($FVF_{5, 8\%}$)：</strong><br>
                $FV = PV \times (1 + i)^n = 7,000 \times (1.08)^5 = 7,000 \times 1.469328 = \mathbf{\text{&euro;}10,285.30}$。</li>
              <li><strong>b. 單筆現值 ($PVF_{8, 6\%}$)：</strong><br>
                $PV = FV \times (1 + i)^{-n} = 7,000 \times (1.06)^{-8} = 7,000 \times 0.627412 = \mathbf{\text{&euro;}4,391.89}$。</li>
              <li><strong>c. 普通年金終值 ($FVF\text{-}OA_{15, 10\%}$)：</strong><br>
                $FV = R \times \left[\frac{(1+i)^n - 1}{i}\right] = 7,000 \times \left[\frac{(1.10)^{15} - 1}{0.10}\right] = 7,000 \times 31.772482 = \mathbf{\text{&euro;}222,407.37}$。</li>
              <li><strong>d. 普通年金現值 ($PVF\text{-}OA_{20, 5\%}$)：</strong><br>
                $PV = R \times \left[\frac{1 - (1+i)^{-n}}{i}\right] = 7,000 \times \left[\frac{1 - (1.05)^{-20}}{0.05}\right] = 7,000 \times 12.462210 = \mathbf{\text{&euro;}87,235.47}$。</li>
            </ul>
          </div>
        </div>

        <!-- E4.4 -->
        <div class="problem-box" id="ex-4-4">
          <div class="problem-head">
            <span class="problem-tag">E4.4 (LO 3, 4)</span>
            <span>Annuity Due Computations (到期年金 / 期初年金計算)</span>
          </div>
          <p>Using the appropriate interest table, answer the following questions. (Each case is independent of the others.)</p>
          <p>
            a. What is the future value of 20 periodic payments of $4,000 each, made at the beginning of each period and compounded at 8%?<br>
            b. What is the present value of $2,500 to be received at the beginning of each of 30 periods, discounted at 10% compound interest?<br>
            c. What is the future value of 15 deposits of $2,000 each, made at the beginning of each period and compounded at 10%? (Future value as of the end of the fifteenth period.)<br>
            d. What is the present value of six receipts of $1,000 each, received at the beginning of each period, discounted at 9% compounded interest?
          </p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-4')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-4" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>a. Future Value of Annuity Due:</strong> <strong>$197,691.69</strong><br>
              &bull; <strong>b. Present Value of Annuity Due:</strong> <strong>$25,924.01</strong><br>
              &bull; <strong>c. Future Value of Annuity Due:</strong> <strong>$69,899.46</strong><br>
              &bull; <strong>d. Present Value of Annuity Due:</strong> <strong>$4,889.65</strong>
            </p>
            <p><strong>【中文解題剖析】</strong><br>
              題目關鍵字皆為 <strong>"at the beginning of each period"</strong>，代表款項發生在「期初」，屬於<strong>到期年金（Annuity Due, 先付年金）</strong>。<br>
              到期年金的計算核心鐵律：<strong>每一筆款項都比普通年金多滾動/多折現一期的利息</strong>，因此公式為：<br>
              $$\text{FV}_{\text{due}} = \text{FV}_{\text{ordinary}} \times (1 + i)$$
              $$\text{PV}_{\text{due}} = \text{PV}_{\text{ordinary}} \times (1 + i)$$
            </p>
            <ul>
              <li><strong>a:</strong> $4,000 \times \left[\frac{(1.08)^{20} - 1}{0.08}\right] \times 1.08 = 4,000 \times 45.761964 \times 1.08 = \mathbf{\$197,691.69}$。</li>
              <li><strong>b:</strong> $2,500 \times \left[\frac{1 - (1.10)^{-30}}{0.10}\right] \times 1.10 = 2,500 \times 9.426914 \times 1.10 = \mathbf{\$25,924.01}$。</li>
              <li><strong>c:</strong> $2,000 \times \left[\frac{(1.10)^{15} - 1}{0.10}\right] \times 1.10 = 2,000 \times 31.772482 \times 1.10 = \mathbf{\$69,899.46}$。</li>
              <li><strong>d:</strong> $1,000 \times \left[\frac{1 - (1.09)^{-6}}{0.09}\right] \times 1.09 = 1,000 \times 4.485919 \times 1.09 = \mathbf{\$4,889.65}$。</li>
            </ul>
          </div>
        </div>

        <!-- E4.5 -->
        <div class="problem-box" id="ex-4-5">
          <div class="problem-head">
            <span class="problem-tag">E4.5 (LO 4)</span>
            <span>Computation of Present Value & Deferred Annuities (遞延年金現值計算)</span>
          </div>
          <p>Using the appropriate interest table, compute the present values of the following periodic amounts due at the end of the designated periods:</p>
          <p>
            a. &pound;30,000 receivable at the end of each period for 8 periods compounded at 12%.<br>
            b. &pound;30,000 payments to be made at the end of each period for 16 periods at 9%.<br>
            c. &pound;30,000 payable at the end of the seventh, eighth, ninth, and tenth periods at 12%.
          </p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-5')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-5" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>a. PV of Ordinary Annuity (8 periods, 12%):</strong> <strong>&pound;149,029.19</strong> (Table factor $4.96764 \implies$ &pound;149,029.20)<br>
              &bull; <strong>b. PV of Ordinary Annuity (16 periods, 9%):</strong> <strong>&pound;249,376.75</strong> (Table factor $8.31256 \implies$ &pound;249,376.80)<br>
              &bull; <strong>c. PV of Deferred Annuity (4 payments deferred 6 periods, 12%):</strong> <strong>&pound;46,164.47</strong> (or &pound;46,163.66 depending on table rounding)
            </p>
            <p><strong>【中文解題剖析】</strong></p>
            <ul>
              <li><strong>a:</strong> 普通年金現值 $PV = 30,000 \times \left[\frac{1 - (1.12)^{-8}}{0.12}\right] = 30,000 \times 4.967640 = \mathbf{\text{&pound;}149,029.19}$。</li>
              <li><strong>b:</strong> 普通年金現值 $PV = 30,000 \times \left[\frac{1 - (1.09)^{-16}}{0.09}\right] = 30,000 \times 8.312558 = \mathbf{\text{&pound;}249,376.75}$。</li>
              <li><strong>c:</strong> <strong>此題為經典「遞延年金（Deferred Annuity）」！</strong><br>
                款項共 4 期，分別發生在第 7、8、9、10 期末。有兩種官方解法：<br>
                <strong>方法一（兩階段折現法）：</strong><br>
                先將 4 期年金折現到空窗期末（即第 6 期末）：<br>
                $PV_6 = 30,000 \times \left[\frac{1 - (1.12)^{-4}}{0.12}\right] = 30,000 \times 3.037349 = \text{&pound;}91,120.48$。<br>
                再將 $PV_6$ 作為單筆款項折現 6 期回第 0 期：<br>
                $PV_0 = 91,120.48 \times (1.12)^{-6} = 91,120.48 \times 0.506631 = \mathbf{\text{&pound;}46,164.47}$。<br>
                <strong>方法二（查表相減法）：</strong><br>
                $PV_0 = 30,000 \times [PVF\text{-}OA_{10, 12\%} - PVF\text{-}OA_{6, 12\%}] = 30,000 \times [5.65022 - 4.11141] = 30,000 \times 1.53881 = \mathbf{\text{&pound;}46,164.30}$。
              </li>
            </ul>
          </div>
        </div>

        <!-- E4.6 -->
        <div class="problem-box" id="ex-4-6">
          <div class="problem-head">
            <span class="problem-tag">E4.6 (LO 2, 3, 4)</span>
            <span>Business Applications of TVM (租賃保證金、償債基金與薪酬決策)</span>
          </div>
          <p>Presented below are three unrelated situations (amounts in thousands):</p>
          <p>
            a. Li Chang Ltd., recently signed a lease for a new office building, for a lease period of 10 years. Under the lease agreement, a security deposit of &yen;12,000 is made, with the deposit to be returned at the expiration of the lease, with interest compounded at 5% per year. What amount will the company receive at the time the lease expires?<br>
            b. Having recently issued a &#8361;20 million, 15-year bond issue, Ron Wu Ltd. is committed to make annual sinking fund deposits of &#8361;600,000. The deposits are made on the last day of each year and yield a return of 10%. Will the fund at the end of 15 years be sufficient to retire the bonds? If not, what will the deficiency be?<br>
            c. Under the terms of his salary agreement, president Juan Rivera has an option of receiving either an immediate bonus of R$55,000, or a deferred bonus of R$70,000 payable in 10 years. Ignoring tax considerations and assuming a relevant interest rate of 4%, which form of settlement should Rivera accept?
          </p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-6')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-6" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>a. Future Value of Deposit:</strong> <strong>&yen;19,546.74</strong> (or &yen;19,547 thousand)<br>
              &bull; <strong>b. Sinking Fund Evaluation:</strong> <strong>No, the fund will NOT be sufficient.</strong> The fund accumulates to <strong>&#8361;19,063,489</strong>, resulting in a <strong>deficiency of &#8361;936,511</strong> (or &#8361;936,512).<br>
              &bull; <strong>c. Compensation Decision:</strong> Rivera should accept the <strong>immediate bonus of R$55,000</strong>. The present value of the deferred bonus is only <strong>R$47,289.49</strong>, which is less than R$55,000 by <strong>R$7,710.51</strong>.
            </p>
            <p><strong>【中文解題剖析與精算過程】</strong></p>
            <ol>
              <li><strong>a:</strong> 單筆複利終值問題：<br>
                $FV = PV \times (1 + i)^n = \text{&yen;}12,000 \times (1.05)^{10} = 12,000 \times 1.628895 = \mathbf{\text{&yen;}19,546.74}$。</li>
              <li><strong>b:</strong> 普通年金終值計算償債基金累積金額：<br>
                $FV = 600,000 \times \left[\frac{(1.10)^{15} - 1}{0.10}\right] = 600,000 \times 31.772482 = \mathbf{\text{\&#8361;}19,063,489}$。<br>
                因為 $19,063,489 < 20,000,000$，基金<strong>不足以</strong>全額贖回債券！<br>
                不足額（Deficiency）$= 20,000,000 - 19,063,489 = \mathbf{\text{\&#8361;}936,511}$。</li>
              <li><strong>c:</strong> 比較兩方案在同一個時間點（現值 $t=0$）的價值：<br>
                方案 1（立即拿現）：現值 $= \mathbf{\text{R\$}55,000}$。<br>
                方案 2（10 年後拿 70,000）：$PV = 70,000 \times (1.04)^{-10} = 70,000 \times 0.675564 = \mathbf{\text{R\$}47,289.49}$。<br>
                結論：因為立即獎金的現值（R$55,000）遠大於遞延獎金的現值（R$47,289.49），故應果斷選擇<strong>立即領取 R$55,000 獎金</strong>！
              </li>
            </ol>
          </div>
        </div>

        <!-- E4.7 -->
        <div class="problem-box" id="ex-4-7">
          <div class="problem-head">
            <span class="problem-tag">E4.7 (LO 5)</span>
            <span>Computation of Bond Prices (不同市場殖利率下之公司債定價)</span>
          </div>
          <p>What would you pay for a $100,000 debenture bond that matures in 15 years and pays $10,000 a year in interest if you wanted to earn a yield of: (a) 4%? (b) 5%? (c) 6%?</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-7')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-7" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>a. Bond Price at 4% Yield:</strong> <strong>$166,710.32</strong> (or $166,710)<br>
              &bull; <strong>b. Bond Price at 5% Yield:</strong> <strong>$151,898.29</strong> (or $151,898)<br>
              &bull; <strong>c. Bond Price at 6% Yield:</strong> <strong>$138,849.00</strong> (or $138,849)
            </p>
            <p><strong>【中文解題剖析】</strong><br>
              公司債定價公式為：<strong>本金單筆現值 $+$ 票面利息年金現值</strong>。<br>
              面額 $FV = \$100,000$，票面利息 $PMT = \$10,000$（票面利率為 $10,000 / 100,000 = 10\%$），到期年限 $n = 15$ 年。<br>
              由於要求的殖利率（4%、5%、6%）皆遠低於票面利率（10%），因此此債券在三種情況下全部屬於<strong>大幅溢價發行（Premium Bonds, Price > Par）</strong>！
            </p>
            <ul>
              <li><strong>a. 殖利率 4%：</strong><br>
                $PV = 100,000 \times (1.04)^{-15} + 10,000 \times \left[\frac{1 - (1.04)^{-15}}{0.04}\right] = 55,526.45 + 111,183.87 = \mathbf{\$166,710.32}$。</li>
              <li><strong>b. 殖利率 5%：</strong><br>
                $PV = 100,000 \times (1.05)^{-15} + 10,000 \times \left[\frac{1 - (1.05)^{-15}}{0.05}\right] = 48,101.71 + 103,796.58 = \mathbf{\$151,898.29}$。</li>
              <li><strong>c. 殖利率 6%：</strong><br>
                $PV = 100,000 \times (1.06)^{-15} + 10,000 \times \left[\frac{1 - (1.06)^{-15}}{0.06}\right] = 41,726.51 + 97,122.49 = \mathbf{\$138,849.00}$。</li>
            </ul>
          </div>
        </div>

        <!-- E4.8 -->
        <div class="problem-box" id="ex-4-8">
          <div class="problem-head">
            <span class="problem-tag">E4.8 (LO 5)</span>
            <span>Computations for a Retirement Fund (退休基金提領與定期提撥精算)</span>
          </div>
          <p>Stephen Bosworth, a super salesman contemplating retirement on his fifty-fifth birthday, decides to create a fund on an 8% basis that will enable him to withdraw $20,000 per year on June 30, beginning in 2030 and continuing through 2033. To develop this fund, Stephen intends to make equal contributions on June 30 of each of the years 2026&ndash;2029.</p>
          <p><strong>Instructions:</strong><br>
            a. How much must the balance of the fund equal on June 30, 2029, in order for Stephen Bosworth to satisfy his objective?<br>
            b. What are each of Stephen's contributions to the fund?
          </p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-8')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-8" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>a. Required Fund Balance on June 30, 2029:</strong> <strong>$66,242.54</strong> (or $66,243)<br>
              &bull; <strong>b. Annual Contribution (2026&ndash;2029):</strong> <strong>$14,700.60</strong> (or $14,701)
            </p>
            <p><strong>【中文解題剖析與兩步驟倒推】</strong></p>
            <ol>
              <li><strong>第一步：求 2029 年 6 月 30 日帳戶所需現值（Part a）</strong><br>
                Stephen 預計在 2030, 2031, 2032, 2033 的 6 月 30 日提領 4 筆、每筆 $20,000。<br>
                第一筆提領發生在 2030 年 6 月 30 日，相對於 2029 年 6 月 30 日剛好是 1 年後，因此對 2029 年 6 月 30 日而言，這是一個<strong>標準的 4 期普通年金現值（Ordinary Annuity PV）</strong>：<br>
                $$PV = R \times \left[\frac{1 - (1+i)^{-n}}{i}\right] = 20,000 \times \left[\frac{1 - (1.08)^{-4}}{0.08}\right] = 20,000 \times 3.312127 = \mathbf{\$66,242.54}$$
              </li>
              <li><strong>第二步：求 2026~2029 年每年需提撥的金額（Part b）</strong><br>
                Stephen 在 2026, 2027, 2028, 2029 年 6 月 30 日各存入一筆等額款項 $C$。<br>
                最後一筆存款剛好在 2029 年 6 月 30 日存入，因此這是一個<strong> 4 期普通年金終值（Ordinary Annuity FV）</strong>問題：<br>
                $$FV = C \times \left[\frac{(1.08)^4 - 1}{0.08}\right] \implies 66,242.54 = C \times 4.506112$$
                $$C = \frac{66,242.54}{4.506112} = \mathbf{\$14,700.60}$$
              </li>
            </ol>
          </div>
        </div>

        <!-- E4.9 -->
        <div class="problem-box" id="ex-4-9">
          <div class="problem-head">
            <span class="problem-tag">E4.9 (LO 2)</span>
            <span>Unknown Rate (單筆複利逆推隱含利率)</span>
          </div>
          <p>Kross plc purchased a machine at a price of &pound;100,000 by signing a note payable, which requires a single payment of &pound;123,210 in 2 years. Assuming annual compounding of interest, what rate of interest is being paid on the loan?</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-9')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-9" class="solution-body exercise-sol">
            <p><strong>【Answer】</strong></p>
            <p><strong>Interest Rate: 11.00%</strong></p>
            <p><strong>【中文解題剖析】</strong><br>
              已知現值 $PV = \text{&pound;}100,000$，2 年後終值 $FV = \text{&pound;}123,210$，期數 $n = 2$：<br>
              $$FV = PV \times (1 + i)^n \implies 123,210 = 100,000 \times (1 + i)^2$$
              $$(1 + i)^2 = \frac{123,210}{100,000} = 1.2321$$
              $$1 + i = \sqrt{1.2321} = 1.11 \implies i = \mathbf{11\%}$$
              因此該筆借款承擔的年利率為 <strong>11%</strong>。
            </p>
          </div>
        </div>

        <!-- E4.10 -->
        <div class="problem-box" id="ex-4-10">
          <div class="problem-head">
            <span class="problem-tag">E4.10 (LO 2)</span>
            <span>Unknown Periods and Unknown Interest Rate (逆推期數與逆推利率)</span>
          </div>
          <p>Consider the following independent situations:</p>
          <p>
            a. R. Chopra wishes to become a millionaire. His money market fund has a balance of $92,296 and has a guaranteed interest rate of 10%. How many years must Chopra leave that balance in the fund in order to get his desired $1,000,000?<br>
            b. Assume that Elvira Lehman desires to accumulate $1 million in 15 years using her money market fund balance of $182,696. At what interest rate must Elvira's investment compound annually?
          </p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-10')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-10" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>a. Number of Years:</strong> <strong>25 years</strong><br>
              &bull; <strong>b. Required Interest Rate:</strong> <strong>12.00%</strong>
            </p>
            <p><strong>【中文解題剖析】</strong></p>
            <ul>
              <li><strong>a. 求期數 $n$：</strong><br>
                $PV = \$92,296$, $FV = \$1,000,000$, $i = 10\%$。<br>
                $$FV = PV \times (1 + i)^n \implies 1,000,000 = 92,296 \times (1.10)^n$$
                $$(1.10)^n = \frac{1,000,000}{92,296} \approx 10.834706$$
                取自然對數：$n = \frac{\ln(10.834706)}{\ln(1.10)} = \frac{2.382755}{0.095310} = \mathbf{25\text{ 年}}$。</li>
              <li><strong>b. 求利率 $i$：</strong><br>
                $PV = \$182,696$, $FV = \$1,000,000$, $n = 15$。<br>
                $$1,000,000 = 182,696 \times (1 + i)^{15} \implies (1 + i)^{15} = \frac{1,000,000}{182,696} \approx 5.473574$$
                $$1 + i = (5.473574)^{1/15} = 1.120000 \implies i = \mathbf{12.00\%}$$。
              </li>
            </ul>
          </div>
        </div>

        <!-- E4.11 -->
        <div class="problem-box" id="ex-4-11">
          <div class="problem-head">
            <span class="problem-tag">E4.11 (LO 4)</span>
            <span>Evaluation of Purchase Options (設備採購付款方案評估)</span>
          </div>
          <p>Rossi Excavating is purchasing a bulldozer. The equipment has a price of &euro;100,000. The manufacturer has offered a payment plan that would allow Rossi to make 10 equal annual payments of &euro;16,274.53, with the first payment due 1 year after the purchase.</p>
          <p><strong>Instructions:</strong><br>
            a. How much total interest will Rossi pay on this payment plan?<br>
            b. Rossi could borrow &euro;100,000 from its bank to finance the purchase at an annual rate of 8%. Should Rossi borrow from the bank or use the manufacturer's payment plan to pay for the equipment?
          </p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-11')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-11" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>a. Total Interest Paid:</strong> <strong>&euro;62,745.30</strong><br>
              &bull; <strong>b. Recommendation:</strong> <strong>Rossi should borrow from the bank.</strong> The manufacturer's plan carries an implicit interest rate of <strong>10%</strong>, which is higher than the bank's loan rate of <strong>8%</strong>.
            </p>
            <p><strong>【中文解題剖析】</strong></p>
            <ol>
              <li><strong>(a) 總利息支出：</strong><br>
                10 期總付款金額 $= 10 \times \text{&euro;}16,274.53 = \text{&euro;}162,745.30$。<br>
                扣除設備現購價本金 &euro;100,000：<br>
                $\text{Total Interest} = 162,745.30 - 100,000 = \mathbf{\text{&euro;}62,745.30}$。
              </li>
              <li><strong>(b) 決策分析（兩種視角）：</strong><br>
                <strong>視角一：比較隱含利率</strong><br>
                $100,000 = 16,274.53 \times PVF\text{-}OA_{10, i} \implies PVF\text{-}OA_{10, i} = \frac{100,000}{16,274.53} = 6.14457$。<br>
                查 10 期普通年金現值表，係數 6.14457 剛好對應 <strong>$i = 10\%$</strong>！<br>
                廠商分期方案實質利率高達 10%，而銀行貸款利率僅 8%。因此向銀行借款以現金購機明顯更划算！<br>
                <strong>視角二：用銀行利率 8% 評估分期款現值</strong><br>
                若以 8% 折現，廠商 10 期分期付款之現值為：<br>
                $PV = 16,274.53 \times PVF\text{-}OA_{10, 8\%} = 16,274.53 \times 6.710081 = \text{&euro;}109,203$。<br>
                分期方案現值（&euro;109,203）大於直接現購價（&euro;100,000），因此向銀行借款直接買下可現省 &euro;9,203！
              </li>
            </ol>
          </div>
        </div>

        <!-- E4.12 -->
        <div class="problem-box" id="ex-4-12">
          <div class="problem-head">
            <span class="problem-tag">E4.12 (LO 4)</span>
            <span>Analysis of Alternatives (三種建廠與租賃方案之現值成本抉擇)</span>
          </div>
          <p>Brubaker Inc. has decided to locate a new factory in Florida. The committee has narrowed down the available sites to the following three buildings:</p>
          <ul>
            <li><strong>Building A:</strong> Purchase for a cash price of $600,000, useful life 25 years.</li>
            <li><strong>Building B:</strong> Lease for 25 years with annual lease payments of $69,000 being made at the beginning of the year.</li>
            <li><strong>Building C:</strong> Purchase for $650,000 cash. Excess space can be sublet for 25 years at a net annual rental of $7,000 received at the end of each year.</li>
          </ul>
          <p><strong>Instructions:</strong> In which building would you recommend that Brubaker Inc. locate, assuming a 12% cost of funds?</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-12')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-8" class="solution-body exercise-sol">
            <p><strong>【Answer】</strong></p>
            <p><strong>Recommendation: Brubaker Inc. should locate in Building C.</strong> It has the lowest net present cost among the three alternatives ($595,098 < $600,000 < $606,118).</p>
            <p><strong>【中文解題剖析與成本現值對比表】</strong></p>
            <table class="q-table" style="width:100%; margin:0.8rem 0;">
              <thead>
                <tr><th>方案</th><th>現金流型態與計算過程 ($i = 12\%, n = 25$)</th><th>淨現值成本 (Net PV Cost)</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Building A</strong></td>
                  <td>現金購買：即期一次性支付本金</td>
                  <td><strong>$600,000.00</strong></td>
                </tr>
                <tr>
                  <td><strong>Building B</strong></td>
                  <td>期初租金（到期年金）：$69,000 \times PVF\text{-}AD_{25, 12\%} = 69,000 \times 7.843139 \times 1.12$</td>
                  <td><strong>$606,117.79</strong> (約 $606,118)</td>
                </tr>
                <tr>
                  <td><strong>Building C</strong></td>
                  <td>購買成本 $650,000 減去分租租金現值（普通年金）：<br>
                  $\$650,000 - [7,000 \times 7.843139] = \$650,000 - \$54,901.97$</td>
                  <td><strong>$595,098.03</strong> (約 $595,098)</td>
                </tr>
              </tbody>
            </table>
            <p>結論：方案 C 雖然初始購價較高，但 25 年的轉租租金現值抵減了 $54,902，使得整體淨資金負擔降至 <strong>$595,098</strong>，為成本最低之最優方案！</p>
          </div>
        </div>

        <!-- E4.13 -->
        <div class="problem-box" id="ex-4-13">
          <div class="problem-head">
            <span class="problem-tag">E4.13 (LO 5)</span>
            <span>Computation of Bond Liability (半年付息公司債發行售價計算)</span>
          </div>
          <p>Messier SA issued &euro;2,000,000 of 11% term company bonds on March 1, 2026, due on March 1, 2041 (15 years), with interest payable each March 1 and September 1. At the time of issuance, the market interest rate for similar financial instruments is 10%.</p>
          <p><strong>Instructions:</strong> As the controller of the company, determine the selling price of the bonds.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-13')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-13" class="solution-body exercise-sol">
            <p><strong>【Answer】</strong></p>
            <p><strong>Selling Price of the Bonds: &euro;2,153,724.51</strong> (or &euro;2,153,725)</p>
            <p><strong>【中文解題剖析與半期要素拆解】</strong></p>
            <ul>
              <li><strong>每期票面利息（Semiannual Coupon）：</strong><br>
                $PMT = \text{&euro;}2,000,000 \times 11\% \times \frac{6}{12} = \mathbf{\text{&euro;}110,000}$。</li>
              <li><strong>半期市場有效利率：</strong> $i = 10\% / 2 = \mathbf{5\%}$。</li>
              <li><strong>總計息期數：</strong> $n = 15 \text{ 年} \times 2 = \mathbf{30 \text{ 期}}$。</li>
              <li><strong>1. 本金現值 (PV of Face Value)：</strong><br>
                $PV = 2,000,000 \times (1.05)^{-30} = 2,000,000 \times 0.231377 = \mathbf{\text{&euro;}462,754.87}$。</li>
              <li><strong>2. 利息年金現值 (PV of Semiannual Coupons)：</strong><br>
                $PV = 110,000 \times \left[\frac{1 - (1.05)^{-30}}{0.05}\right] = 110,000 \times 15.372451 = \mathbf{\text{&euro;}1,690,969.61}$。</li>
              <li><strong>公司債總發行價格：</strong><br>
                $\text{Price} = 462,754.87 + 1,690,969.61 = \mathbf{\text{&euro;}2,153,724.48 \approx \text{&euro;}2,153,725}$。<br>
                <em>（驗證：票面利率 11% 大於市場利率 10%，因此呈現溢價發行，溢價金額為 &euro;153,725！）</em>
              </li>
            </ul>
          </div>
        </div>

        <!-- E4.14 -->
        <div class="problem-box" id="ex-4-14">
          <div class="problem-head">
            <span class="problem-tag">E4.14 (LO 5)</span>
            <span>Computation of Pension Liability (員工退休金負債現值精算)</span>
          </div>
          <p>Calder, Inc. decided to initiate a pension plan on January 1, 2026. The actuary develops the following information:</p>
          <ul>
            <li>Average length of time to retirement: 15 years</li>
            <li>Expected life duration after retirement: 10 years</li>
            <li>Total pension payment expected each year after retirement: $700,000 per year (payment made at the end of each year)</li>
            <li>Interest rate to be used: 8%</li>
          </ul>
          <p><strong>Instructions:</strong> Determine the present value of the pension liability on January 1, 2026.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-14')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-14" class="solution-body exercise-sol">
            <p><strong>【Answer】</strong></p>
            <p><strong>Present Value of the Pension Liability: $1,480,708.25</strong> (or $1,480,708)</p>
            <p><strong>【中文解題剖析與兩階段折現】</strong></p>
            <ol>
              <li><strong>第一階段：計算退休當下（15 年後，即 $t=15$）所需的退休金準備總額</strong><br>
                退休後每年底支付 $700,000，共支付 10 年，折現率 8%：<br>
                $$PV_{15} = 700,000 \times \left[\frac{1 - (1.08)^{-10}}{0.08}\right] = 700,000 \times 6.710081 = \mathbf{\$4,697,056.70}$$
              </li>
              <li><strong>第二階段：將 $PV_{15}$ 折現 15 年回目前時點（2026 年 1 月 1 日，$t=0$）</strong><br>
                $$PV_0 = PV_{15} \times (1.08)^{-15} = 4,697,056.70 \times 0.3152417 = \mathbf{\$1,480,708.25}$$
              </li>
            </ol>
            <p>此題在會計上即為典型的「遞延年金負債衡量」，公司目前應在資產負債表上認列之負債現值即為 <strong>$1,480,708</strong>。</p>
          </div>
        </div>

        <!-- E4.15 -->
        <div class="problem-box" id="ex-4-15">
          <div class="problem-head">
            <span class="problem-tag">E4.15 (LO 2, 3)</span>
            <span>Investment Decision & Endowment Fund (基金成長年數與定期定額投資)</span>
          </div>
          <p>Derek Lee received a signing bonus of $1,000,000, invested at 8% compounded annually.</p>
          <p><strong>Instructions:</strong><br>
            a. If Lee plans to establish the DL Foundation once the fund grows to $1,999,000, how many years until he can establish the foundation?<br>
            b. Instead of investing the entire $1,000,000, Lee invests $300,000 today and plans to make 9 equal annual investments into the fund beginning 1 year from today. What amount should the payments be if Lee plans to establish the $1,999,000 foundation at the end of 9 years?
          </p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-15')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-15" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>a. Number of Years:</strong> <strong>9 years</strong><br>
              &bull; <strong>b. Annual Payment Amount:</strong> <strong>$112,055.43</strong> (or $112,055)
            </p>
            <p><strong>【中文解題剖析】</strong></p>
            <ul>
              <li><strong>Part a:</strong><br>
                $$1,999,000 = 1,000,000 \times (1.08)^n \implies (1.08)^n = 1.999000$$
                $$n = \frac{\ln(1.999000)}{\ln(1.08)} = \frac{0.692647}{0.076961} \approx \mathbf{9.00\text{ 年}}$$。</li>
              <li><strong>Part b:</strong><br>
                目標在第 9 年末達到 $\$1,999,000$：<br>
                1. 今天存入的 $\$300,000$ 經 9 年累積之終值為：<br>
                $FV_{\text{initial}} = 300,000 \times (1.08)^9 = 300,000 \times 1.999005 = \mathbf{\$599,701.39}$。<br>
                2. 尚需透過未來 9 年年金積累之差額為：<br>
                $FV_{\text{needed}} = 1,999,000 - 599,701.39 = \mathbf{\$1,399,298.61}$。<br>
                3. 未來 9 年等額年金付款額 $PMT$（9 期普通年金）：<br>
                $$PMT \times \left[\frac{(1.08)^9 - 1}{0.08}\right] = 1,399,298.61 \implies PMT \times 12.487558 = 1,399,298.61$$
                $$PMT = \frac{1,399,298.61}{12.487558} = \mathbf{\$112,055.43}$$
              </li>
            </ul>
          </div>
        </div>

        <!-- E4.16 -->
        <div class="problem-box" id="ex-4-16">
          <div class="problem-head">
            <span class="problem-tag">E4.16 (LO 3)</span>
            <span>Retirement of Debt (十年債務償還與五年償債基金提撥)</span>
          </div>
          <p>Rual Fernandez borrowed $70,000 on March 1, 2024. This amount plus accrued interest at 6% compounded semiannually is to be repaid March 1, 2034. To retire this debt, Rual plans to contribute to a debt retirement fund five equal amounts starting on March 1, 2029, and for the next 4 years. The fund is expected to earn 5% per annum.</p>
          <p><strong>Instructions:</strong> How much must be contributed each year by Rual Fernandez to provide a fund sufficient to retire the debt on March 1, 2034?</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-16')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-16" class="solution-body exercise-sol">
            <p><strong>【Answer】</strong></p>
            <p><strong>Annual Contribution Required: $21,790.71</strong> (Compounded to 2034; or <strong>$22,880.24</strong> if deposits are treated as ordinary annuity terminating on March 1, 2034)</p>
            <p><strong>【中文解題剖析與標準時序推導】</strong></p>
            <ol>
              <li><strong>計算 2034 年 3 月 1 日到期的債務總本利和：</strong><br>
                借款期間共 10 年，半年計息一次（$i = 6\% / 2 = 3\%$，期數 $n = 10 \times 2 = 20$）：<br>
                $$FV_{\text{debt}} = 70,000 \times (1.03)^{20} = 70,000 \times 1.806111 = \mathbf{\$126,427.79}$$
              </li>
              <li><strong>計算每年應提撥之償債基金金額：</strong><br>
                題目說明「自 2029 年 3 月 1 日起提撥，並持續隨後 4 年（starting on March 1, 2029, and for the next 4 years）」，即共有 5 筆存款：分別在 2029, 2030, 2031, 2032, 2033 的 3 月 1 日存入。<br>
                最後一筆存款於 2033 年 3 月 1 日存入，距 2034 年 3 月 1 日償債日尚有 1 年利息（年利率 5%）：<br>
                $$FV_{2034} = PMT \times \left[\frac{(1.05)^5 - 1}{0.05}\right] \times (1.05) = PMT \times 5.525631 \times 1.05 = PMT \times 5.801913$$
                $$PMT = \frac{126,427.79}{5.801913} = \mathbf{\$21,790.71}$$
                <em>（備註：若將 5 筆提撥視為剛好在 2030~2034 年底存入之普通年金，則 $PMT = 126,427.79 / 5.525631 = \$22,880.24$。考試時建議完整寫出時序假設以保全全部分數！）</em>
              </li>
            </ol>
          </div>
        </div>

        <!-- E4.17 -->
        <div class="problem-box" id="ex-4-17">
          <div class="problem-head">
            <span class="problem-tag">E4.17 (LO 4)</span>
            <span>Computation of Amount of Rentals (租賃合約每期等額租金精算)</span>
          </div>
          <p>Wyeth Leasing Ltd. is preparing a contract to lease a machine to Souvenirs plc for a period of 25 years. Wyeth has an investment cost of &pound;365,755 in the machine, with a useful life of 25 years and no residual value. Wyeth is interested in earning an 11% return on investment and agreed to accept 25 equal rental payments at the end of each of the next 25 years.</p>
          <p><strong>Instructions:</strong> Provide Wyeth with the amount of each of the 25 rental payments that will yield an 11% return on investment.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-17')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-17" class="solution-body exercise-sol">
            <p><strong>【Answer】</strong></p>
            <p><strong>Amount of Each Rental Payment: &pound;43,429.84</strong> (or &pound;43,430)</p>
            <p><strong>【中文解題剖析】</strong><br>
              出租人初始投資成本現值等於未來 25 期期末等額租金之現值（25 期普通年金）：<br>
              $$\text{Investment Cost} = \text{Rental} \times PVF\text{-}OA_{25, 11\%}$$
              $$365,755 = \text{Rental} \times \left[\frac{1 - (1.11)^{-25}}{0.11}\right] = \text{Rental} \times 8.421744$$
              $$\text{Rental} = \frac{365,755}{8.421744} = \mathbf{\text{&pound;}43,429.84}$$
            </p>
          </div>
        </div>

        <!-- E4.18 -->
        <div class="problem-box" id="ex-4-18">
          <div class="problem-head">
            <span class="problem-tag">E4.18 (LO 4)</span>
            <span>Least Costly Payoff &mdash; Ordinary Annuity (債務償還方案現值最小化評估)</span>
          </div>
          <p>Aoki Ltd. has a contractual debt outstanding. Aoki has two means of settlement: It can either make immediate payment of &yen;2,600,000, or make annual payments of &yen;300,000 for 15 years, each payment due on the last day of the year (yen in thousands).</p>
          <p><strong>Instructions:</strong> Which method of payment do you recommend, assuming an expected effective-interest rate of 8% during the future period?</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-18')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-18" class="solution-body exercise-sol">
            <p><strong>【Answer】</strong></p>
            <p><strong>Recommendation: Aoki Ltd. should choose the installment payment method (annual payments of &yen;300,000).</strong></p>
            <p><strong>【中文解題剖析】</strong><br>
              1. 立即償付方案現值：$\text{&yen;}2,600,000$。<br>
              2. 分期償還方案現值（15 期普通年金，每期末支付，利率 8%）：<br>
              $$PV = 300,000 \times \left[\frac{1 - (1.08)^{-15}}{0.08}\right] = 300,000 \times 8.559479 = \mathbf{\text{&yen;}2,567,843.61}$$
              3. 方案比較：<br>
              分期付款之現值成本（&yen;2,567,844）小於立即付款（&yen;2,600,000），現值省下約 <strong>&yen;32,156</strong>，因此建議採取<strong>分期付款</strong>！
            </p>
          </div>
        </div>

        <!-- E4.19 -->
        <div class="problem-box" id="ex-4-19">
          <div class="problem-head">
            <span class="problem-tag">E4.19 (LO 4)</span>
            <span>Least Costly Payoff &mdash; Annuity Due (期初付款下的方案決策逆轉)</span>
          </div>
          <p>Assuming the same facts as those in E4.18 except that the payments must begin now and be made on the first day of each of the 15 years, what payment method would you recommend?</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-19')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-19" class="solution-body exercise-sol">
            <p><strong>【Answer】</strong></p>
            <p><strong>Recommendation: Aoki Ltd. should choose the immediate lump-sum payment of &yen;2,600,000.</strong></p>
            <p><strong>【中文解題剖析】</strong><br>
              本題款項改為「每年第一天支付（on the first day of each of the 15 years）」，轉變為<strong>到期年金（Annuity Due）</strong>：<br>
              $$PV_{\text{due}} = PV_{\text{ordinary}} \times (1 + i) = \text{&yen;}2,567,843.61 \times 1.08 = \mathbf{\text{&yen;}2,773,271.10}$$
              比較現值成本：<br>
              到期年金分期現值（&yen;2,773,271）> 立即支付（&yen;2,600,000），因此決策發生關鍵反轉！改為建議<strong>立即一次性付清 &yen;2,600,000</strong>，可節省 &yen;173,271！
            </p>
          </div>
        </div>

        <!-- E4.20 -->
        <div class="problem-box" id="ex-4-20">
          <div class="problem-head">
            <span class="problem-tag">E4.20 (LO 5)</span>
            <span>Expected Cash Flows (機率加權期望現金流量計算)</span>
          </div>
          <p>For each of the following, determine the expected cash flows:</p>
          <table class="q-table" style="width:100%; max-width:600px; margin:0.8rem 0;">
            <thead>
              <tr><th>Case</th><th>Cash Flow Estimates</th><th>Probability Assessment</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>a.</strong></td><td>&pound;4,800 / &pound;6,300 / &pound;7,500</td><td>20% / 50% / 30%</td></tr>
              <tr><td><strong>b.</strong></td><td>&pound;5,400 / &pound;7,200 / &pound;8,400</td><td>30% / 50% / 20%</td></tr>
              <tr><td><strong>c.</strong></td><td>&pound;(1,000) / &pound;3,000 / &pound;5,000</td><td>10% / 80% / 10%</td></tr>
            </tbody>
          </table>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-20')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-20" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>Case a Expected Cash Flow:</strong> <strong>&pound;6,360</strong><br>
              &bull; <strong>Case b Expected Cash Flow:</strong> <strong>&pound;6,900</strong><br>
              &bull; <strong>Case c Expected Cash Flow:</strong> <strong>&pound;2,800</strong>
            </p>
            <p><strong>【中文解題剖析】</strong><br>
              依據 IFRS 13 / 觀念架構之「期望現金流量法（Expected Cash Flow Approach）」，期望現金流等於所有可能情境之數值乘上各自機率之總和：<br>
              &bull; <strong>a:</strong> $(4,800 \times 20\%) + (6,300 \times 50\%) + (7,500 \times 30\%) = 960 + 3,150 + 2,250 = \mathbf{\text{&pound;}6,360}$。<br>
              &bull; <strong>b:</strong> $(5,400 \times 30\%) + (7,200 \times 50\%) + (8,400 \times 20\%) = 1,620 + 3,600 + 1,680 = \mathbf{\text{&pound;}6,900}$。<br>
              &bull; <strong>c:</strong> $[(-1,000) \times 10\%] + (3,000 \times 80\%) + (5,000 \times 10\%) = -100 + 2,400 + 500 = \mathbf{\text{&pound;}2,800}$。
            </p>
          </div>
        </div>

        <!-- E4.21 -->
        <div class="problem-box" id="ex-4-21">
          <div class="problem-head">
            <span class="problem-tag">E4.21 (LO 5)</span>
            <span>Expected Cash Flows and Present Value (不確定修車成本之期望現值準備)</span>
          </div>
          <p>Angela Contreras is trying to determine the amount to set aside so that she will have enough money on hand in 2 years to overhaul the engine on her vintage used car. Estimates:</p>
          <table class="q-table" style="width:100%; max-width:480px; margin:0.8rem 0;">
            <thead><tr><th>Estimated Cash Outflow</th><th>Probability Assessment</th></tr></thead>
            <tbody>
              <tr><td>$200</td><td>10%</td></tr>
              <tr><td>$450</td><td>30%</td></tr>
              <tr><td>$600</td><td>50%</td></tr>
              <tr><td>$750</td><td>10%</td></tr>
            </tbody>
          </table>
          <p><strong>Instructions:</strong> How much should Angela Contreras deposit today in an account earning 6%, compounded annually, so that she will have enough money on hand in 2 years to pay for the overhaul?</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-21')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-21" class="solution-body exercise-sol">
            <p><strong>【Answer】</strong></p>
            <p><strong>Amount to Deposit Today: $471.70</strong></p>
            <p><strong>【中文解題剖析與兩步法】</strong></p>
            <ol>
              <li><strong>第一步：求 2 年後的期望現金支出（Expected Cash Flow）：</strong><br>
                $$E(CF) = (200 \times 10\%) + (450 \times 30\%) + (600 \times 50\%) + (750 \times 10\%) = 20 + 135 + 300 + 75 = \mathbf{\$530}$$
              </li>
              <li><strong>第二步：折現 2 年求今天應存入之現值（$i = 6\%, n = 2$）：</strong><br>
                $$PV = \frac{E(CF)}{(1 + i)^n} = \frac{530}{(1.06)^2} = \frac{530}{1.1236} = \mathbf{\$471.70}$$
              </li>
            </ol>
          </div>
        </div>

        <!-- E4.22 -->
        <div class="problem-box" id="ex-4-22">
          <div class="problem-head">
            <span class="problem-tag">E4.22 (LO 5)</span>
            <span>Fair Value Estimate (IFRS 商標權減損公允價值評估與層級判定)</span>
          </div>
          <p>Killroy Company owns a trade name (book value $3,500,000) assessed for impairment annually. Trade name generates annual cash flows over next 8 years with no residual value (flows occur at end of each year):</p>
          <table class="q-table" style="width:100%; max-width:480px; margin:0.8rem 0;">
            <thead><tr><th>Cash Flow Estimate</th><th>Probability Assessment</th></tr></thead>
            <tbody>
              <tr><td>$380,000</td><td>20%</td></tr>
              <tr><td>$630,000</td><td>50%</td></tr>
              <tr><td>$750,000</td><td>30%</td></tr>
            </tbody>
          </table>
          <p><strong>Instructions:</strong><br>
            a. What is the estimated fair value of the trade name? Discount rate = 8%. (Round calculations to nearest dollar.)<br>
            b. Is the estimate developed for part (a) a Level 1 or Level 3 fair value estimate? Explain.
          </p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-22')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-22" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>a. Estimated Fair Value:</strong> <strong>$3,539,930</strong><br>
              &bull; <strong>b. Fair Value Hierarchy:</strong> <strong>Level 3 Fair Value Estimate.</strong>
            </p>
            <p><strong>【中文解題剖析】</strong></p>
            <ul>
              <li><strong>Part a:</strong><br>
                1. 每年期望現金流入：<br>
                $$E(CF) = (380,000 \times 20\%) + (630,000 \times 50\%) + (750,000 \times 30\%) = 76,000 + 315,000 + 225,000 = \mathbf{\$616,000}$$
                2. 以 8% 折現 8 年普通年金現值：<br>
                $$PV = 616,000 \times \left[\frac{1 - (1.08)^{-8}}{0.08}\right] = 616,000 \times 5.746639 = \mathbf{\$3,539,929.59 \approx \$3,539,930}$$
                <em>（因公允價值 $3,539,930 高於帳面價值 $3,500,000，故不需認列減損損失！）</em>
              </li>
              <li><strong>Part b: 公允價值層級判定理由</strong><br>
                本估計屬於 <strong>Level 3（第三等級公允價值）</strong>。<br>
                依據 IFRS 13 規定：Level 1 為相同資產於活絡市場之公開報價；Level 2 為活絡市場中類似資產的可觀察報價；而本題的現金流量估計完全基於<strong>「公司內部未公開之不可觀察輸入值（Unobservable inputs）」</strong>，故無疑屬於第三等級。
              </li>
            </ul>
          </div>
        </div>

        <!-- *E4.23 -->
        <div class="problem-box" id="ex-4-23">
          <div class="problem-head">
            <span class="problem-tag">*E4.23 (LO 6)</span>
            <span>Computing Number of Periods (Excel NPER 函數求太空旅行儲蓄期數)</span>
          </div>
          <p>With a goal of purchasing one of the coveted trips to space offered by SpaceX, you deposit $55,000 in an account today that earns 6% compounded annually. You estimate the price tag for a trip to space to be $250,000.</p>
          <p><strong>Instructions:</strong> Using the NPER function in Excel or a financial calculator, determine how long it will take you to accumulate enough money to purchase a ticket.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-23')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-23" class="solution-body exercise-sol">
            <p><strong>【Answer】</strong></p>
            <p><strong>Time Required: 25.99 years (approximately 26 years)</strong></p>
            <p><strong>【中文解題剖析與 Excel 函數語法】</strong></p>
            <ul>
              <li><strong>Excel 函數公式：</strong><br>
                <code>=NPER(rate, pmt, pv, [fv])</code><br>
                輸入：<code>=NPER(6%, 0, -55000, 250000)</code><br>
                計算傳回值：<strong>25.985 年 &asymp; 26 年</strong>。
              </li>
              <li><strong>代數手算驗證：</strong><br>
                $$55,000 \times (1.06)^n = 250,000 \implies (1.06)^n = \frac{250,000}{55,000} \approx 4.545455$$
                $$n = \frac{\ln(4.545455)}{\ln(1.06)} = \frac{1.514128}{0.058269} = \mathbf{25.985\text{ 年}}$$
              </li>
            </ul>
          </div>
        </div>

        <!-- *E4.24 -->
        <div class="problem-box" id="ex-4-24">
          <div class="problem-head">
            <span class="problem-tag">*E4.24 (LO 6)</span>
            <span>Solve for Interest Rate (Excel RATE 函數求火星之旅所需報酬率)</span>
          </div>
          <p>Your ultimate goal is to take a trip to Mars on SpaceX's Starship in 25 years at a price of $500,000. You have $75,000 available to deposit today.</p>
          <p><strong>Instructions:</strong> Using the RATE function in Excel or a financial calculator, determine the annual interest rate you must earn to make this trip a reality.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-24')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-24" class="solution-body exercise-sol">
            <p><strong>【Answer】</strong></p>
            <p><strong>Annual Interest Rate Required: 7.88%</strong></p>
            <p><strong>【中文解題剖析與 Excel 函數語法】</strong></p>
            <ul>
              <li><strong>Excel 函數公式：</strong><br>
                <code>=RATE(nper, pmt, pv, [fv])</code><br>
                輸入：<code>=RATE(25, 0, -75000, 500000)</code><br>
                傳回值：<strong>7.88%</strong>。
              </li>
              <li><strong>代數手算驗證：</strong><br>
                $$75,000 \times (1 + r)^{25} = 500,000 \implies (1 + r)^{25} = \frac{500,000}{75,000} = 6.666667$$
                $$1 + r = (6.666667)^{1/25} = 1.078838 \implies r = \mathbf{7.88\%}$$
              </li>
            </ul>
          </div>
        </div>

        <!-- *E4.25 -->
        <div class="problem-box" id="ex-4-25">
          <div class="problem-head">
            <span class="problem-tag">*E4.25 (LO 6)</span>
            <span>Solving for Present and Future Values with Excel (退休金終值、租賃現值與複合金流求解利率)</span>
          </div>
          <p>Consider the following three independent scenarios:</p>
          <p>
            a. To save for retirement, you invest $10,000 at the end of each year for 25 years. If your investment earns interest at an annual rate of 5%, how much will you have when you retire?<br>
            b. Lobner's Candle Company signed a 20-year lease that requires annual payments of $7,000 at the beginning of each year. Assuming an annual interest rate of 6.5%, what is the present value of the lease payments?<br>
            c. Maxwell Enterprises would like to have $1,000,000 saved up in 10 years to fund equipment and building upgrades. If Maxwell invests $180,000 today and commits to depositing $50,000 at the end of each of the next 10 years, what annual interest rate must the fund earn to reach $1,000,000?
          </p>
          <p><strong>Instructions:</strong> Using functions in Excel or a financial calculator, solve for the unknowns in each of the scenarios.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e4-25')">💡 展開詳細解答與剖析</button>
          <div id="sol-e4-25" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>Scenario a (Retirement FV):</strong> <strong>$477,270.99</strong> (or $477,271)<br>
              &bull; <strong>Scenario b (Lease PV):</strong> <strong>$82,142.97</strong> (or $82,143)<br>
              &bull; <strong>Scenario c (Required Rate):</strong> <strong>6.30%</strong>
            </p>
            <p><strong>【中文解題剖析與 Excel 專業語法】</strong></p>
            <ol>
              <li><strong>Scenario a: 普通年金終值 (FV)</strong><br>
                Excel 語法：<code>=FV(5%, 25, -10000)</code><br>
                手算驗證：$FV = 10,000 \times \left[\frac{(1.05)^{25} - 1}{0.05}\right] = 10,000 \times 47.727099 = \mathbf{\$477,270.99}$。
              </li>
              <li><strong>Scenario b: 到期年金現值 (PV of Annuity Due)</strong><br>
                注意每期初付款，Excel 的 type 參數須設為 1！<br>
                Excel 語法：<code>=PV(6.5%, 20, -7000, 0, 1)</code><br>
                手算驗證：$PV = 7,000 \times \left[\frac{1 - (1.065)^{-20}}{0.065}\right] \times 1.065 = 7,000 \times 11.018507 \times 1.065 = \mathbf{\$82,142.97}$。
              </li>
              <li><strong>Scenario c: 包含首期單筆與分期年金之內部報酬率 (RATE)</strong><br>
                同時存在期初投入本金 $PV = -\$180,000$ 與每期末提撥 $PMT = -\$50,000$，10 年後累積終值 $FV = \$1,000,000$：<br>
                Excel 語法：<code>=RATE(10, -50000, -180000, 1000000)</code><br>
                計算傳回值：<strong>6.3001% &asymp; 6.30%</strong>！<br>
                手算驗證式：$180,000 \times (1+r)^{10} + 50,000 \times \left[\frac{(1+r)^{10}-1}{r}\right] = 1,000,000$。<br>
                代入 $r = 6.30\%$：$180,000 \times 1.84218 + 50,000 \times 13.3679 = 331,592 + 668,395 = \$999,987 \approx \$1,000,000$。
              </li>
            </ol>
          </div>
        </div>

      </section>
'''

def update_handout():
    file_path = r"收件苗圃\學習講義合輯\Ch04_IFRS_學習講義.html"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. 更新側邊欄 (toc-list)
    old_toc_item = '<li><a href="#summary">本章記憶膠囊</a></li>'
    new_toc_item = '''<li><a href="#chapter-exercises">📚 課後習題全解 (E4.1~E4.25)</a></li>
        <li><a href="#summary">本章記憶膠囊</a></li>'''
    
    if 'href="#chapter-exercises"' not in content:
        content = content.replace(old_toc_item, new_toc_item)

    # 2. 在 <section id="summary"> 之前插入習題章節
    summary_marker = '<section id="summary">'
    if 'id="chapter-exercises"' not in content:
        exercises_block = get_exercises_html()
        content = content.replace(summary_marker, exercises_block + "\n\n      " + summary_marker)

    # 3. 在 <script> 中加入 toggleAllExercises 函數
    toggle_all_js = r'''
    let allExExpanded = false;
    function toggleAllExercises() {
      allExExpanded = !allExExpanded;
      document.querySelectorAll('.exercise-sol').forEach(el => {
        el.style.display = allExExpanded ? 'block' : 'none';
        if (allExExpanded && window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([el]);
        }
      });
    }
'''
    if 'toggleAllExercises' not in content:
        content = content.replace('function toggleSolution(id) {', toggle_all_js + '    function toggleSolution(id) {')

    # 儲存回本機檔案
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated: {file_path}")

    # 同步至其他兩個目標位置
    sync_targets = [
        r"C:\Users\閻星澄\Documents\WikiTree\收件苗圃\中級會計學\Ch04_IFRS_學習講義.html",
        r"C:\Users\閻星澄\Desktop\學習講義合集\Ch04_IFRS_學習講義.html"
    ]
    for target in sync_targets:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Synced to: {target}")

if __name__ == "__main__":
    update_handout()
