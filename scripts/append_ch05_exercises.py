# -*- coding: utf-8 -*-
"""
Append Exercises E5.1 to E5.24 to Chapter 5 IFRS Learning Handout.
- Answers are in English.
- Explanations are primarily in Traditional Chinese (繁體中文).
- Includes all step-by-step mathematical procedures, journal entries, and financial statement presentations.
- Adds "展開/收合全部習題解析" toggle button.
- Updates TOC sidebar.
- Synchronizes across workspace and all target locations.
"""

import os

def get_exercises_html():
    return r'''
      <!-- ========================================== -->
      <!-- 第五章課後精選綜合習題全解 (E5.1 ~ E5.24) -->
      <!-- ========================================== -->
      <section id="chapter-exercises">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-bottom:1.5rem; border-bottom:3px solid var(--accent-light); padding-bottom:0.75rem;">
          <div>
            <h2 style="margin:0; color:var(--dark);">📚 Chapter 5 課後綜合實戰習題全解 (Exercises E5.1 ~ E5.24)</h2>
            <p style="margin:0.25rem 0 0; color:var(--muted); font-size:0.92rem;">
              收錄中級會計學（IFRS）第五章現金與應收款項全部 24 道精選實戰題。<strong>【答案與會計分錄以英文呈現，解題思路與準則剖析以繁體中文詳盡拆解】</strong>
            </p>
          </div>
          <div style="margin-top:0.5rem;">
            <button class="solution-toggle" style="background:var(--accent-dark); color:white; padding:0.55rem 1.1rem;" onclick="toggleAllExercises()">
              👁️ 一鍵展開 / 收合全部習題解析
            </button>
          </div>
        </div>

        <!-- E5.1 -->
        <div class="problem-box" id="ex-5-1">
          <div class="problem-head">
            <span class="problem-tag">E5.1 (LO 1)</span>
            <span>Determine Cash Balance & Proper Classification (現金與約當現金精確邊界判定)</span>
          </div>
          <p>The controller for Wallaby plc is attempting to determine the amount of cash and cash equivalents to be reported on its December 31, 2026, statement of financial position. The following information is provided:</p>
          <ol style="font-size:0.9rem; line-height:1.6; margin-left:1.2rem;">
            <li>Commercial savings account of &pound;600,000 and commercial checking account of &pound;800,000 held at First National Bank of Olathe.</li>
            <li>Money market fund account held at Volonte Co. permits Wallaby to write checks on this balance, &pound;5,000,000.</li>
            <li>Travel advances of &pound;180,000 for executive travel for first quarter of next year (employee reimburses via salary reduction).</li>
            <li>Separate cash fund of &pound;1,500,000 restricted for retirement of long-term debt.</li>
            <li>Petty cash fund of &pound;1,000.</li>
            <li>An I.O.U. from Marianne Koch, a customer, in the amount of &pound;150,000.</li>
            <li>Bank overdraft of &pound;110,000 at a bank where company has no other deposits.</li>
            <li>Two certificates of deposit totaling &pound;1,000,000 (&pound;500,000 each) with maturity of 120 days.</li>
            <li>Postdated check from a customer dated January 12, 2027, for &pound;125,000.</li>
            <li>Compensating balance of &pound;500,000 maintained at First National Bank of Olathe to ensure credit availability.</li>
            <li>Commercial paper of Sergio Leone Co. of &pound;2,100,000 due in 60 days.</li>
            <li>Currency and coin on hand of &pound;7,700.</li>
          </ol>
          <p><strong>Instructions:</strong> (a) Compute Cash and Cash Equivalents at Dec 31, 2026. (b) Indicate proper reporting for excluded items.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-1')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-1" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p><strong>(a) Total Cash and Cash Equivalents to be reported: &pound;8,508,700</strong></p>
            <table class="q-table" style="width:100%; max-width:650px; margin:0.6rem 0;">
              <thead><tr><th>Item Included</th><th>Amount (&pound;)</th></tr></thead>
              <tbody>
                <tr><td>1. Commercial savings account</td><td>&pound;600,000</td></tr>
                <tr><td>1. Commercial checking account</td><td>800,000</td></tr>
                <tr><td>2. Money market fund (with checking privileges)</td><td>5,000,000</td></tr>
                <tr><td>5. Petty cash fund</td><td>1,000</td></tr>
                <tr><td>11. Commercial paper (due in 60 days &le; 90 days)</td><td>2,100,000</td></tr>
                <tr><td>12. Currency and coin on hand</td><td>7,700</td></tr>
                <tr style="font-weight:bold; background:#f0fdf4;"><td>Total Cash and Cash Equivalents</td><td>&pound;8,508,700</td></tr>
              </tbody>
            </table>
            <p><strong>(b) Proper Statement of Financial Position Classification for Excluded Items:</strong></p>
            <ul style="font-size:0.9rem; line-height:1.65;">
              <li><strong>Item 3 (&pound;180,000 Travel advances):</strong> Reported as <strong>Prepaid Expenses / Receivables from Employees</strong> under Current Assets.</li>
              <li><strong>Item 4 (&pound;1,500,000 Restricted cash for debt):</strong> Reported as <strong>Restricted Cash / Investments (Non-Current Assets)</strong> because the liability is long-term.</li>
              <li><strong>Item 6 (&pound;150,000 I.O.U.):</strong> Reported as <strong>Accounts / Notes Receivable</strong> under Current Assets.</li>
              <li><strong>Item 7 (&pound;110,000 Bank overdraft):</strong> Reported as <strong>Current Liabilities (Bank Overdraft / Loans Payable)</strong> because there is no offsetting deposit at this bank.</li>
              <li><strong>Item 8 (&pound;1,000,000 CDs - 120 days):</strong> Reported as <strong>Short-Term Investments / Temporary Cash Investments</strong> under Current Assets (maturity exceeds 90 days).</li>
              <li><strong>Item 9 (&pound;125,000 Postdated check):</strong> Reported as <strong>Accounts Receivable</strong> under Current Assets until Jan 12, 2027.</li>
              <li><strong>Item 10 (&pound;500,000 Compensating balance):</strong> Reported separately as <strong>Restricted Cash</strong> (Current or Non-Current Asset depending on the loan agreement term) with required note disclosure.</li>
            </ul>
            <p><strong>【中文解題剖析】</strong><br>
              依據 IAS 7 與 IFRS 準則定義，<strong>約當現金（Cash Equivalents）</strong>必須是「可隨時轉換為確定金額之現金，且自取得日起算到期日<strong>不超過 3 個月（90 天）</strong>」之高流動性投資。第 11 項商業本票 60 天到期符合約當現金；但第 8 項定存為 120 天，超過 90 天門檻，故只能歸類為短期投資。
            </p>
          </div>
        </div>

        <!-- E5.2 -->
        <div class="problem-box" id="ex-5-2">
          <div class="problem-head">
            <span class="problem-tag">E5.2 (LO 1)</span>
            <span>Determine Cash Balance & Explanations (五種獨立情境之現金餘額判定)</span>
          </div>
          <p>For each individual situation, determine the amount that should be reported as cash. If the item(s) is not reported as cash, explain the rationale.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-2')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-2" class="solution-body exercise-sol">
            <p><strong>【Answers & Explanations】</strong></p>
            <ol style="line-height:1.75; font-size:0.92rem;">
              <li><strong>Situation 1: Cash = $925,000.</strong><br>
                &bull; CD ($1,400,000) is a temporary investment.<br>
                &bull; Cash advance to subsidiary ($980,000) is a receivable (current or non-current).<br>
                &bull; Utility deposit ($180) is an other asset (refundable deposit/prepaid).
              </li>
              <li><strong>Situation 2: Cash = $484,650.</strong> ($500,000 Checking &minus; $17,000 Overdraft + $300 Petty Cash + $1,350 Currency/Coins)<br>
                &bull; Under IFRS / U.S. GAAP, overdraft in a special checking account at the <em>same bank</em> can be legally offset against the positive checking account balance.<br>
                &bull; Bond sinking fund cash ($200,000) is restricted for long-term purpose and classified under non-current investments.
              </li>
              <li><strong>Situation 3: Cash = $599,800.</strong> ($590,000 Checking + $9,800 Certified Check)<br>
                &bull; Certified check from customer is guaranteed by the bank and is treated as cash.<br>
                &bull; Postdated check ($11,000) is an accounts receivable.<br>
                &bull; Compensating balance ($100,000) is reported separately as restricted cash.<br>
                &bull; Postage stamps ($620) are office supplies or prepaid expenses.
              </li>
              <li><strong>Situation 4: Cash = $90,000.</strong> ($42,000 Checking + $48,000 Money Market with checking privileges)<br>
                &bull; Money market funds with check-writing capabilities qualify as cash equivalents.<br>
                &bull; NSF check ($800) is returned uncollected and reclassified as accounts receivable.
              </li>
              <li><strong>Situation 5: Cash = $700,900.</strong> ($700,000 Checking + $900 Customer Cash Advance on hand)<br>
                &bull; Currency received from customer on hand ($900) is cash.<br>
                &bull; Plant expansion cash ($500,000) is restricted for non-current capital expenditure.<br>
                &bull; Short-term T-bills ($180,000) are short-term investments (unless specified &le;90 days at acquisition).<br>
                &bull; Advance to executive ($7,000) is a receivable from officers/employees.<br>
                &bull; Refundable deposit ($26,000) to government is a receivable/other asset.
              </li>
            </ol>
          </div>
        </div>

        <!-- E5.3 -->
        <div class="problem-box" id="ex-5-3">
          <div class="problem-head">
            <span class="problem-tag">E5.3 (LO 2)</span>
            <span>Financial Statement Presentation of Receivables (應收款項資產負債表分類呈現)</span>
          </div>
          <p>Pique AG shows a balance of &euro;241,140 in Accounts Receivable on December 31, 2026. Details:</p>
          <ul style="font-size:0.9rem;">
            <li>Installment accounts due in 2027: &euro;23,000</li>
            <li>Installment accounts due after 2027 (within operating cycle): &euro;34,000</li>
            <li>Overpayments to creditors: &euro;2,640</li>
            <li>Due from regular customers (of which &euro;40,000 pledged as security for loan): &euro;89,000</li>
            <li>Advances to employees: &euro;1,500</li>
            <li>Advance to subsidiary company (made in 2024): &euro;91,000</li>
          </ul>
          <p><strong>Instructions:</strong> Illustrate how the information should be shown on the statement of financial position of Pique AG on December 31, 2026.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-3')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-3" class="solution-body exercise-sol">
            <p><strong>【Answer: Statement of Financial Position Presentation】</strong></p>
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:1rem; font-family:monospace; font-size:0.9rem;">
              <strong>Pique AG<br>Statement of Financial Position (Partial)<br>As of December 31, 2026</strong><br><br>
              <strong>Current Assets:</strong><br>
              &nbsp;&nbsp;Trade and Other Receivables:<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Accounts Receivable (regular customers) [Note 1] ........ &euro;89,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Installment Accounts Receivable [Note 2] .................. 57,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>Total Trade Accounts Receivable ......................... &euro;146,000</em><br>
              &nbsp;&nbsp;&nbsp;&nbsp;Advances to Employees ...................................... 1,500<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Other Current Assets (Overpayments to Creditors) ........... 2,640<br><br>
              <strong>Non-Current Assets:</strong><br>
              &nbsp;&nbsp;Investments / Long-Term Receivables:<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Advance to Subsidiary Company ............................. &euro;91,000<br><br>
              <strong>Note Disclosures:</strong><br>
              [Note 1] Accounts receivable of &euro;40,000 are pledged as collateral for a bank loan.<br>
              [Note 2] Installment accounts include &euro;34,000 due after 2027 collectible within the normal operating cycle.
            </div>
            <p><strong>【中文解題剖析】</strong><br>
              1. <strong>營業週期標準：</strong>分期應收帳款雖然在 2027 年以後才收現，但只要在「正常營業週期（Operating Cycle）」內收回，依 IFRS 規定仍全額列為<strong>流動資產</strong>（合計 &euro;23,000 + &euro;34,000 = &euro;57,000）。<br>
              2. <strong>應付帳款借餘（Overpayments to creditors）：</strong>因溢付給供應商產生，應單獨作為流動資產（Other Current Assets）列示，不得與對客應收帳款混淆。<br>
              3. <strong>質押應收款（Pledged Accounts）：</strong>帳款所有權仍屬公司，維持在應收帳款內，但在附註中揭露質押擔保事實。<br>
              4. <strong>長期關係企業預付款（Advance to subsidiary）：</strong>性質屬於長期資金融通，應列入非流動資產。
            </p>
          </div>
        </div>

        <!-- E5.4 -->
        <div class="problem-box" id="ex-5-4">
          <div class="problem-head">
            <span class="problem-tag">E5.4 (LO 2)</span>
            <span>Determine Ending Accounts Receivable & Shortages (毛利率法推算應收帳款漏失金額)</span>
          </div>
          <p>You decided to test the accuracy of the accounts receivable balance of $117,000 shown in the ledger. Year 1 data: Collections from customers $198,000; Merchandise purchased $320,000; Ending inventory $70,000; Goods marked to sell at 40% above cost. All sales made on credit.</p>
          <p><strong>Instructions:</strong> Compute estimated ending balance of accounts receivable and any apparent shortage.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-4')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-4" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p>
              &bull; <strong>Estimated Ending Accounts Receivable:</strong> <strong>$152,000</strong><br>
              &bull; <strong>Apparent Shortage (Missing Cash/Embezzlement):</strong> <strong>$35,000</strong> ($152,000 &minus; $117,000)
            </p>
            <p><strong>【中文解題剖析與三步驟反推】</strong></p>
            <ol>
              <li><strong>第一步：求銷貨成本 (Cost of Goods Sold, COGS)</strong><br>
                第一年營業初存為 0：<br>
                $$\text{COGS} = \text{Beginning Inventory} (0) + \text{Purchases} (320,000) - \text{Ending Inventory} (70,000) = \mathbf{\$250,000}$$
              </li>
              <li><strong>第二步：求本期賒銷總額 (Credit Sales)</strong><br>
                商品定價為「成本加成 40%（40% above cost）」：<br>
                $$\text{Sales} = \text{COGS} \times (1 + 0.40) = 250,000 \times 1.40 = \mathbf{\$350,000}$$
              </li>
              <li><strong>第三步：推算應有應收帳款餘額與短缺額</strong><br>
                $$\text{Estimated Ending AR} = \text{Beginning AR} (0) + \text{Credit Sales} (350,000) - \text{Collections} (198,000) = \mathbf{\$152,000}$$
                帳面僅記錄 $117,000，表示有 <strong>$35,000</strong> 的款項已被顧客償還但未入帳或帳目被刻意沖銷掩飾，顯示存在 <strong>$35,000</strong> 之舞弊或短缺！
              </li>
            </ol>
          </div>
        </div>

        <!-- E5.5 -->
        <div class="problem-box" id="ex-5-5">
          <div class="problem-head">
            <span class="problem-tag">E5.5 (LO 2)</span>
            <span>Recording Sales Gross and Net (總額法與淨額法完整會計分錄對比)</span>
          </div>
          <p>June 3: Sold merchandise &pound;2,000, terms 2/10, n/60. June 8: Freight invoice &pound;90 received by customer. June 12: Received payment for balance due.</p>
          <p><strong>Instructions:</strong> (a) Prepare journal entries under: 1. Gross method, 2. Net method. (b) Prepare entry under net method assuming payment received July 29.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-5')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-5" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <p><strong>(a) 1. Gross Method (總額法):</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              <strong>June 3:</strong><br>
              Dr. Accounts Receivable .................... 2,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Sales Revenue .......................... 2,000<br><br>
              <strong>June 12 (Within discount period: 2,000 &times; 2% = 40 discount):</strong><br>
              Dr. Cash .................................... 1,960<br>
              Dr. Sales Discounts (Variable consideration) . 40<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable .................... 2,000
            </div>

            <p style="margin-top:0.8rem;"><strong>(a) 2. Net Method (淨額法):</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              <strong>June 3 (Recorded net: 2,000 &times; 98% = 1,960):</strong><br>
              Dr. Accounts Receivable .................... 1,960<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Sales Revenue .......................... 1,960<br><br>
              <strong>June 12 (Paid within discount period):</strong><br>
              Dr. Cash .................................... 1,960<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable .................... 1,960
            </div>

            <p style="margin-top:0.8rem;"><strong>(b) Net Method assuming payment on July 29 (Discount forfeited):</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              <strong>July 29:</strong><br>
              Dr. Cash .................................... 2,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable .................... 1,960<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Sales Discounts Forfeited (Finance Income) 40
            </div>
            <p><strong>【中文解題剖析】</strong><br>
              IFRS 15 視現金折扣為「變動對價（Variable Consideration）」。淨額法在銷貨時直接按預期可收取之對價（扣除折扣後之 &pound;1,960）認列銷貨收入；若客戶逾期未享折扣，收到的額外 &pound;40 則認列為「顧客未享折扣（Sales Discounts Forfeited）」，性質上屬於財務融資利息收入。
            </p>
          </div>
        </div>

        <!-- E5.6 -->
        <div class="problem-box" id="ex-5-6">
          <div class="problem-head">
            <span class="problem-tag">E5.6 (LO 2)</span>
            <span>Recording Sales Transactions under Gross Method (總額法下銷貨與收款分錄實戰)</span>
          </div>
          <p>July 1: Sold R$30,000 computers, terms 3/15, n/60 (gross method). July 10: Received payment from Smallwood in full. July 17: Sold R$250,000 computers, terms 2/10, n/30. July 30: The Hernandez Store paid Lopez for purchase of July 17.</p>
          <p><strong>Instructions:</strong> Prepare journal entries for Lopez Computers.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-6')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-6" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              <strong>July 1:</strong><br>
              Dr. Accounts Receivable (Smallwood) ....... 30,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Sales Revenue .......................... 30,000<br><br>
              <strong>July 10 (Within 15 days, 3% discount = 30,000 &times; 3% = 900):</strong><br>
              Dr. Cash .................................... 29,100<br>
              Dr. Sales Discounts ......................... 900<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable (Smallwood) ........ 30,000<br><br>
              <strong>July 17:</strong><br>
              Dr. Accounts Receivable (Hernandez) ...... 250,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Sales Revenue ......................... 250,000<br><br>
              <strong>July 30 (13 days elapsed > 10 days, discount forfeited, pays full):</strong><br>
              Dr. Cash ................................... 250,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable (Hernandez) ....... 250,000
            </div>
            <p><strong>【中文解題剖析】</strong><br>
              7 月 30 日距離 7 月 17 日已達 13 天，超過了 2/10 折扣優惠期（10 天），因此客戶 Hernandez Store 喪失折扣資格，必須全額繳納 R$250,000。
            </p>
          </div>
        </div>

        <!-- E5.7 -->
        <div class="problem-box" id="ex-5-7">
          <div class="problem-head">
            <span class="problem-tag">E5.7 (LO 3)</span>
            <span>Recording Bad Debts &mdash; Credit vs Debit Existing Allowance (貸餘與借餘調整分錄)</span>
          </div>
          <p>Duncan SA reports: Accounts Receivable &euro;100,000 (Dr.), Allowance for Doubtful Accounts &euro;2,000 (Cr.), Sales Revenue &euro;900,000 (Cr.).</p>
          <p><strong>Instructions:</strong> Record bad debt expense assuming bad debts estimated at: (a) 5% of AR, (b) 5% of AR, and the Allowance has a &euro;1,500 debit balance.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-7')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-7" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <p>Target Allowance Balance = $\text{&euro;}100,000 \times 5\% = \mathbf{\text{&euro;}5,000\text{ (Cr.)}}$</p>
            <p><strong>(a) Allowance has &euro;2,000 Credit Balance:</strong><br>
            Adjustment required = &euro;5,000 &minus; &euro;2,000 = <strong>&euro;3,000</strong>.</p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Bad Debt Expense ...................... 3,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Allowance for Doubtful Accounts ........ 3,000
            </div>

            <p style="margin-top:0.8rem;"><strong>(b) Allowance has &euro;1,500 Debit Balance:</strong><br>
            Adjustment required = &euro;5,000 &minus; (&minus;&euro;1,500) = <strong>&euro;6,500</strong>.</p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Bad Debt Expense ...................... 6,500<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Allowance for Doubtful Accounts ........ 6,500
            </div>
            <p><strong>【中文解題剖析】</strong><br>
              資產負債表法（應收帳款百分比法）的目標是使「調整後的備抵損失餘額」精確等於估計數（&euro;5,000 貸餘）。若調整前有借餘 &euro;1,500（因本期實際沖銷超過前期提撥所致），調整分錄必須先補平該借餘、再補足至貸餘 &euro;5,000，故需認列 $\text{&euro;}5,000 + \text{&euro;}1,500 = \text{&euro;}6,500$ 的預期信用損失費用。
            </p>
          </div>
        </div>

        <!-- E5.8 -->
        <div class="problem-box" id="ex-5-8">
          <div class="problem-head">
            <span class="problem-tag">E5.8 (LO 3)</span>
            <span>Recording Bad Debts &amp; Cash Realizable Value Impact (實質沖銷對帳面淨額之影響)</span>
          </div>
          <p>Accounts receivable &pound;900,000, allowance &pound;40,000. On Jan 16, 2027, Sorter determined receivable of &pound;8,000 will not be collected and authorized write-off.</p>
          <p><strong>Instructions:</strong> (a) Prepare write-off entry. (b) Compute cash realizable value before write-off. (c) Compute cash realizable value after write-off.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-8')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-8" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p><strong>(a) Write-off Journal Entry:</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Allowance for Doubtful Accounts ....... 8,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable .................... 8,000
            </div>
            <p style="margin-top:0.6rem;">
              &bull; <strong>(b) Cash Realizable Value Before Write-off:</strong> $\text{&pound;}900,000 - \text{&pound;}40,000 = \mathbf{\text{&pound;}860,000}$<br>
              &bull; <strong>(c) Cash Realizable Value After Write-off:</strong> $(\text{&pound;}900,000 - \text{&pound;}8,000) - (\text{&pound;}40,000 - \text{&pound;}8,000) = \text{&pound;}892,000 - \text{&pound;}32,000 = \mathbf{\text{&pound;}860,000}$
            </p>
            <p><strong>【中文解題剖析】</strong><br>
              ⭐ <strong>中會核心必考觀念：</strong>實際沖銷壞帳時，借記備抵呆帳、貸記應收帳款，兩者等額減少，因此<strong>應收帳款的「可變現淨值（Cash Realizable Value）」完全不受沖銷影響，保持不變！</strong>
            </p>
          </div>
        </div>

        <!-- E5.9 -->
        <div class="problem-box" id="ex-5-9">
          <div class="problem-head">
            <span class="problem-tag">E5.9 (LO 3)</span>
            <span>Computing Bad Debts &amp; Preparing Journal Entries (4% 與 5% 應收帳款百分比法)</span>
          </div>
          <p>Trial balance: Accounts Receivable $80,000 (Dr.), Allowance for Doubtful Accounts $1,750 (Cr.), Sales Revenue $580,000 (Cr.).</p>
          <p><strong>Instructions:</strong> Give the entry for estimated bad debts assuming: (a) 4% of gross AR, (b) 5% of gross AR and allowance has a $1,700 credit balance.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-9')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-9" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <p><strong>(a) Allowance at 4% of gross AR ($80,000 &times; 4% = $3,200):</strong><br>
            Adjustment required = $3,200 &minus; $1,750 = <strong>$1,450</strong>.</p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Bad Debt Expense ...................... 1,450<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Allowance for Doubtful Accounts ........ 1,450
            </div>

            <p style="margin-top:0.8rem;"><strong>(b) Allowance at 5% of gross AR ($80,000 &times; 5% = $4,000) with existing $1,700 credit balance:</strong><br>
            Adjustment required = $4,000 &minus; $1,700 = <strong>$2,300</strong>.</p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Bad Debt Expense ...................... 2,300<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Allowance for Doubtful Accounts ........ 2,300
            </div>
            <p><strong>【中文解題剖析】</strong><br>
              應收帳款百分比法之利息費用調整額 $= \text{期末應有備抵餘額} - \text{調整前既有貸餘}$。
            </p>
          </div>
        </div>

        <!-- E5.10 -->
        <div class="problem-box" id="ex-5-10">
          <div class="problem-head">
            <span class="problem-tag">E5.10 (LO 3)</span>
            <span>Direct Write-Off vs. Allowance Method Analysis (直接沖銷法 vs. 備抵法準則批判與淨利差異)</span>
          </div>
          <p>Dickinson Corporation writes off accounts by directly debiting Bad Debt Expense ($34,330 total in current year). Chief accountant argues it matches tax rules. Credit sales $2,200,000, ending AR $77,000, 12% estimated uncollectible (zero initial allowance).</p>
          <p><strong>Instructions:</strong> (a) Do you agree with Dickinson's policy? Why or why not? (b) By what amount would net income differ under percentage-of-receivables approach?</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-10')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-10" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p><strong>(a) Evaluation of Accounting Policy:</strong><br>
            <strong>Disagree.</strong> The direct write-off method violates the <strong>accrual accounting</strong> and <strong>matching principles</strong> under IFRS / GAAP. It recognizes bad debts in the period of default rather than the period of revenue generation, and overstates accounts receivable on the statement of financial position. Tax law rules do not dictate financial reporting standards.
            </p>
            <p><strong>(b) Impact on Net Income:</strong><br>
            Under the percentage-of-receivables (allowance) method, <strong>Net Income would be $9,240 LOWER</strong>.</p>
            <p><strong>【中文解題剖析與精算推導】</strong></p>
            <ol>
              <li>直接沖銷法認列之呆帳費用 $= 7,800 + 9,700 + 7,000 + 9,830 = \mathbf{\$34,330}$。</li>
              <li>備抵法（應收帳款百分比法）下：<br>
                &bull; 期末應有備抵餘額 $= \$77,000 \times 12\% = \mathbf{\$9,240}$。<br>
                &bull; 在備抵法下，本期的實際沖銷 $34,330 應借記備抵呆帳（而非直接計入費用）。<br>
                &bull; 因此為使期初為 0 的備抵科目在沖銷 $34,330 後達到貸餘 $9,240，本期應認列的呆帳費用為：<br>
                $$\text{Bad Debt Expense} = \$9,240 + \$34,330 - \$0 = \mathbf{\$43,570}$$
              </li>
              <li>淨利差異比較：<br>
                備抵法費用（$43,570）比直接沖銷法費用（$34,330）多出 <strong>$9,240</strong>，故<strong>淨利將減少 $9,240</strong>（即未提列之期末備抵金額）！
              </li>
            </ol>
          </div>
        </div>

        <!-- E5.11 -->
        <div class="problem-box" id="ex-5-11">
          <div class="problem-head">
            <span class="problem-tag">E5.11 (LO 3)</span>
            <span>Aging of Accounts Receivable (明細帳逐筆沖銷與帳齡分析診斷)</span>
          </div>
          <p>Puckett AG customer Alstott Co. T-account transactions for the year. (Amounts in dollars).</p>
          <p><strong>Instructions:</strong> Age the balance and specify any items that apparently require particular attention at year-end.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-11')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-11" class="solution-body exercise-sol">
            <p><strong>【Answer: Aging Schedule & Analysis】</strong></p>
            <table class="q-table" style="width:100%; margin:0.6rem 0;">
              <thead>
                <tr><th>Date of Origin</th><th>Source Reference</th><th>Original / Unpaid</th><th>Aging Category</th><th>Amount</th></tr>
              </thead>
              <tbody>
                <tr><td>Prior to Jan 1</td><td>1/1 Balance forward ($700 &minus; $255 paid 4/10)</td><td>$445</td><td>Over 360 days (Past due)</td><td><strong>$445</strong></td></tr>
                <tr><td>April 12</td><td>Invoice #2412 ($1,710 &minus; $1,000 &minus; $400)</td><td>$310</td><td>Over 240 days (Past due)</td><td><strong>$310</strong></td></tr>
                <tr><td>November 18</td><td>Invoice #5681 ($2,000 &minus; $1,250)</td><td>$750</td><td>31&ndash;60 days</td><td><strong>$750</strong></td></tr>
                <tr style="font-weight:bold; background:#f8fafc;">
                  <td colspan="4">Total Outstanding Balance at December 31</td>
                  <td><strong>$1,505</strong></td>
                </tr>
              </tbody>
            </table>
            <p><strong>Items Requiring Particular Attention:</strong><br>
            The unpaid balance of <strong>$445 from prior year</strong> and <strong>$310 from Invoice #2412 (April 12)</strong> are severely delinquent (over 8 to 12 months past due). While the customer has made payments on more recent invoices (#3614, #4912, #6347), these old remnant balances were skipped and require immediate collection follow-up or specific impairment provisioning.
            </p>
            <p><strong>【中文解題剖析】</strong><br>
              透過逐筆核對收款憑證可知：9/20 收到 $890 是付清 #3614（$490）加上 #2412 的部分款項（$400）；12/1 收到 $1,250 僅償還 #5681 的部分款項。因此期末未收餘額 $1,505 中，竟有 $755 屬於逾期超過 8 個月以上的呆滯款項，是審計與催收的最高警報區域！
            </p>
          </div>
        </div>

        <!-- E5.12 -->
        <div class="problem-box" id="ex-5-12">
          <div class="problem-head">
            <span class="problem-tag">E5.12 (LO 2, 3, 5)</span>
            <span>Journalizing Various Receivable Transactions (淨額法、讓售、質押、破產沖銷與票據減損)</span>
          </div>
          <p>Sanford SA: July 1 net sales &euro;10,000 (2/10, n/60); July 5 factored &euro;12,000 without guarantee (9% fee); July 9 pledged &euro;9,000 for &euro;6,000 loan (6% fee); Dec 29 customer bankrupt, pays 10%; Dec 31 note receivable carrying &euro;350,000 assessed PV is &euro;275,000.</p>
          <p><strong>Instructions:</strong> Prepare all necessary entries in general journal form for Sanford SA.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-12')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-12" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              <strong>July 1 (Recorded net: 10,000 &times; 98% = 9,800):</strong><br>
              Dr. Accounts Receivable .................... 9,800<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Sales Revenue .......................... 9,800<br><br>
              <strong>July 5 (Factoring without guarantee: 12,000 &times; 9% fee = 1,080):</strong><br>
              Dr. Cash ................................... 10,920<br>
              Dr. Loss on Sale of Receivables ............ 1,080<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable ................... 12,000<br><br>
              <strong>July 9 (Pledging / Assignment of receivables for loan: fee 6,000 &times; 6% = 360):</strong><br>
              Dr. Cash .................................... 5,640<br>
              Dr. Finance Expense (or Discount on Notes) ... 360<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Notes Payable (Bank Loan) .............. 6,000<br><br>
              <strong>July 11 (Discount period expired for Legler Co. sale of July 1):</strong><br>
              Dr. Accounts Receivable ...................... 200<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Sales Discounts Forfeited ................ 200<br>
              <em>(Legler AR is now restored to gross amount &euro;10,000)</em><br><br>
              <strong>Dec. 29 (Legler pays 10% = 1,000, 90% = 9,000 written off):</strong><br>
              Dr. Cash .................................... 1,000<br>
              Dr. Allowance for Doubtful Accounts ........ 9,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable (Legler) .......... 10,000<br><br>
              <strong>Dec. 31 (Impairment of Note Receivable: 350,000 &minus; 275,000 = 75,000):</strong><br>
              Dr. Bad Debt Expense (Impairment Loss) ..... 75,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Allowance for Doubtful Accounts (Notes) 75,000
            </div>
          </div>
        </div>

        <!-- E5.13 -->
        <div class="problem-box" id="ex-5-13">
          <div class="problem-head">
            <span class="problem-tag">E5.13 (LO 4)</span>
            <span>Notes Transactions at Unrealistic Interest Rates (非公允利率應收票據之公允折現定價)</span>
          </div>
          <p>July 1, 2026: (1) Sold land (cost &pound;590,000, FV &pound;900,000) for 4-year zero-interest note face &pound;1,416,163. Customer rate 12%. (2) Rendered services for 3%, 8-year note face &pound;400,000 (annual interest &pound;12,000). Market rate 12%.</p>
          <p><strong>Instructions:</strong> Record the two sales transaction journal entries for Rentoul plc on July 1, 2026.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-13')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-13" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <p><strong>1. Sale of Land (Zero-interest note):</strong><br>
            Note PV $= \text{&pound;}1,416,163 \times (1.12)^{-4} = \text{&pound;}1,416,163 \times 0.635518 = \mathbf{\text{&pound;}900,000}$.<br>
            Discount $= \text{&pound;}1,416,163 - \text{&pound;}900,000 = \mathbf{\text{&pound;}516,163}$. Gain on disposal $= 900,000 - 590,000 = \mathbf{\text{&pound;}310,000}$.</p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Notes Receivable .................... 1,416,163<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Land ................................... 590,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Gain on Disposal of Land ............... 310,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Discount on Notes Receivable ........... 516,163
            </div>

            <p style="margin-top:0.8rem;"><strong>2. Service Rendered (Below-market 3% interest note, market rate 12%):</strong><br>
            PV of Face Value $= \text{&pound;}400,000 \times (1.12)^{-8} = \text{&pound;}400,000 \times 0.403883 = \text{&pound;}161,553.29$.<br>
            PV of Interest Payments $= \text{&pound;}12,000 \times PVF\text{-}OA_{8, 12\%} = 12,000 \times 4.967640 = \text{&pound;}59,611.68$.<br>
            Total Present Value $= 161,553.29 + 59,611.68 = \mathbf{\text{&pound;}221,164.97 \approx \text{&pound;}221,165}$.<br>
            Discount $= 400,000 - 221,165 = \mathbf{\text{&pound;}178,835}$.</p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Notes Receivable ...................... 400,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Service Revenue ....................... 221,165<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Discount on Notes Receivable .......... 178,835
            </div>
            <p><strong>【中文解題剖析】</strong><br>
              依據 IFRS 9，以非市場利率取得之票據，必須採用<strong>債務人（買方）的市場增額借款利率（12%）</strong>進行現值折現，以反映真實交易之公允價值。
            </p>
          </div>
        </div>

        <!-- E5.14 -->
        <div class="problem-box" id="ex-5-14">
          <div class="problem-head">
            <span class="problem-tag">E5.14 (LO 4)</span>
            <span>Notes Receivable with Unrealistic Interest Rate (無息票據有效利息法三年完整會計分錄)</span>
          </div>
          <p>Dec 31, 2026: Accepted $300,000 zero-interest note due Dec 31, 2028, for consulting services. Cascade credit rate is 10%, Hurly credit rate is 6%.</p>
          <p><strong>Instructions:</strong> Prepare journal entries for: (a) Dec 31, 2026, (b) Dec 31, 2027, (c) Dec 31, 2028.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-14')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-14" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <p>Present value at 10% for 2 years $= \$300,000 / (1.10)^2 = \mathbf{\$247,933.88 \approx \$247,934}$. Total Discount $= \$52,066$.</p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              <strong>(a) December 31, 2026 (Issuance):</strong><br>
              Dr. Notes Receivable ...................... 300,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Service Revenue ....................... 247,934<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Discount on Notes Receivable .......... 52,066<br><br>
              <strong>(b) December 31, 2027 (Year 1 Interest: 247,934 &times; 10% = 24,793):</strong><br>
              Dr. Discount on Notes Receivable ........... 24,793<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Interest Revenue ....................... 24,793<br>
              <em>(Carrying value at Dec 31, 2027 becomes $272,727)</em><br><br>
              <strong>(c) December 31, 2028 (Year 2 Interest & Settlement):</strong><br>
              Dr. Discount on Notes Receivable ........... 27,273<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Interest Revenue (52,066 &minus; 24,793) ..... 27,273<br>
              Dr. Cash ................................... 300,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Notes Receivable ...................... 300,000
            </div>
            <p><strong>【中文解題剖析】</strong><br>
              折現率應使用發票人（債務人 Cascade）的風險利率 10%，而非受款人自身的借款利率 6%。透過「有效利息法」逐期攤銷折價，帳面價值自 $247,934 遞增至到期時的 $300,000。
            </p>
          </div>
        </div>

        <!-- E5.15 -->
        <div class="problem-box" id="ex-5-15">
          <div class="problem-head">
            <span class="problem-tag">E5.15 (LO 5)</span>
            <span>Assigning Accounts Receivable (應收帳款質押借款完整流程分錄)</span>
          </div>
          <p>April 1, 2026: Prince assigned $500,000 AR as collateral for a $300,000 bank loan due July 1, 2026. Bank charges 2% finance fee on assigned AR and 10% annual interest on loan. Prince collects receivables. $350,000 collected through June 30. Repaid in full July 1.</p>
          <p><strong>Instructions:</strong> Prepare journal entries for: (a) April 1, 2026, (b) Collections through June 30, (c) July 1, 2026 payment.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-15')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-15" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              <strong>(a) April 1, 2026 (Loan secured; Fee = 500,000 &times; 2% = 10,000):</strong><br>
              Dr. Cash (300,000 &minus; 10,000) ................. 290,000<br>
              Dr. Finance Expense (or Bank Fee) .......... 10,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Notes Payable ......................... 300,000<br>
              <em>(Note: AR Assigned of $500,000 is reclassified or disclosed in notes)</em><br><br>
              <strong>(b) April 1 &ndash; June 30, 2026 (Collections on assigned AR):</strong><br>
              Dr. Cash ................................... 350,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable (Assigned) ........ 350,000<br><br>
              <strong>(c) July 1, 2026 (Pay loan + 3 months interest: 300,000 &times; 10% &times; 3/12 = 7,500):</strong><br>
              Dr. Notes Payable .......................... 300,000<br>
              Dr. Interest Expense ......................... 7,500<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Cash ................................... 307,500
            </div>
          </div>
        </div>

        <!-- E5.16 -->
        <div class="problem-box" id="ex-5-16">
          <div class="problem-head">
            <span class="problem-tag">E5.16 (LO 3, 5)</span>
            <span>Journalizing Various Receivable Transactions (讓售、指定質押借款與壞帳提列)</span>
          </div>
          <p>Trial balance: AR &yen;82,000, Allowance &yen;1,750 (Cr.), Sales Revenue &yen;430,000. Prepare independent journal entries for cases 1 to 4.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-16')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-16" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              <strong>1. Factoring without guarantee (&yen;20,000 &times; 10% fee = &yen;2,000):</strong><br>
              Dr. Cash (&yen;20,000 &minus; &yen;2,000) ................. &yen;18,000<br>
              Dr. Loss on Sale of Receivables ............ 2,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable ................... &yen;20,000<br><br>
              <strong>2. Assignment for loan (&yen;55,000 loan, 8% fee on loan = &yen;4,400):</strong><br>
              Dr. Cash (&yen;55,000 &minus; &yen;4,400) ................. &yen;50,600<br>
              Dr. Finance Expense ........................ 4,400<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Notes Payable ......................... &yen;55,000<br><br>
              <strong>3. Allowance at 5% of AR (&yen;82,000 &times; 5% = &yen;4,100; Adj = 4,100 &minus; 1,750 = &yen;2,350):</strong><br>
              Dr. Bad Debt Expense ...................... &yen;2,350<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Allowance for Doubtful Accounts ........ &yen;2,350<br><br>
              <strong>4. Aging allowance &yen;5,800 with existing &yen;1,100 credit balance (Adj = 5,800 &minus; 1,100 = &yen;4,700):</strong><br>
              Dr. Bad Debt Expense ...................... &yen;4,700<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Allowance for Doubtful Accounts ........ &yen;4,700
            </div>
          </div>
        </div>

        <!-- E5.17 -->
        <div class="problem-box" id="ex-5-17">
          <div class="problem-head">
            <span class="problem-tag">E5.17 (LO 5)</span>
            <span>Transfer of Receivables with Guarantee (附全額保證讓售之有擔保借款處理)</span>
          </div>
          <p>Bryant Ltd. factors receivables carrying amount &pound;200,000 to Warren Company for &pound;190,000 and guarantees all credit losses.</p>
          <p><strong>Instructions:</strong> Prepare the appropriate journal entry to record this transaction on the books of Bryant Ltd.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-17')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-17" class="solution-body exercise-sol">
            <p><strong>【Answer: Journal Entry】</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Cash ................................... 190,000<br>
              Dr. Finance Expense (or Discount on Loan) ... 10,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Borrowings / Notes Payable ............ 200,000
            </div>
            <p><strong>【中文解題剖析 &mdash; IFRS 9 除列鐵律】</strong><br>
              ⭐ <strong>關鍵準則點：</strong> Bryant 提供了「全額信用損失保證（guarantees ALL credit losses）」，這意味著應收帳款違約的<strong>實質所有風險與報酬（Substantially all risks and rewards）完全未移轉！</strong><br>
              依據 IFRS 9 規定，此交易<strong>不得除列（Cannot derecognize）應收帳款</strong>，本質上屬於「以應收款為抵押的有擔保借款（Secured Borrowing）」，故貸記借款負債（Borrowings / Notes Payable），差額 &pound;10,000 認列為融資費用。
            </p>
          </div>
        </div>

        <!-- E5.18 -->
        <div class="problem-box" id="ex-5-18">
          <div class="problem-head">
            <span class="problem-tag">E5.18 (LO 5)</span>
            <span>Transfer of Receivables without Guarantee (無保證讓售之出售認列與分錄)</span>
          </div>
          <p>Bohannon SA factors &euro;250,000 AR without guarantee (no recourse). Winkler charges 2% fee and withholds 4% reserve for sales adjustments.</p>
          <p><strong>Instructions:</strong> (a) Conditions for transfer with guarantee to qualify as a sale. (b) August 15, 2026 journal entry for Bohannon.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-18')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-18" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p><strong>(a) Conditions for a Transfer of Receivables to Qualify as a Sale (Derecognition under IFRS 9):</strong><br>
            A transfer of receivables qualifies for derecognition (sale treatment) only if:<br>
            1. The contractual rights to receive cash flows have been transferred; OR the entity assumes an obligation to pass through the cash flows without material delay.<br>
            2. The entity transfers <strong>substantially all the risks and rewards of ownership</strong> of the financial asset.<br>
            <em>(Note: If the transfer includes a limited guarantee, it qualifies as a sale only if the transferor neither transfers nor retains substantially all risks/rewards, but has transferred CONTROL of the asset).</em></p>

            <p style="margin-top:0.6rem;"><strong>(b) August 15, 2026 Journal Entry:</strong><br>
            Finance Charge $= \text{&euro;}250,000 \times 2\% = \mathbf{\text{&euro;}5,000}$.<br>
            Due from Factor $= \text{&euro;}250,000 \times 4\% = \mathbf{\text{&euro;}10,000}$.<br>
            Cash Received $= 250,000 - 5,000 - 10,000 = \mathbf{\text{&euro;}235,000}$.</p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Cash ................................... 235,000<br>
              Dr. Due from Factor ......................... 10,000<br>
              Dr. Loss on Sale of Receivables ............. 5,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable ................... 250,000
            </div>
            <p><strong>【中文解題剖析】</strong><br>
              「應收融資商款項（Due from Factor）」為預防銷貨退回或折讓的保留款，屬於受讓商退還前之應收款資產；手續費 &euro;5,000 則列為應收款出售損失。
            </p>
          </div>
        </div>

        <!-- E5.19 -->
        <div class="problem-box" id="ex-5-19">
          <div class="problem-head">
            <span class="problem-tag">E5.19 (LO 5)</span>
            <span>Transfer of Receivables without Guarantee &mdash; Both Parties (買賣雙方同步會計分錄)</span>
          </div>
          <p>July 1, 2026: SEK Group factors &yen;400,000 AR with Mays Finance without recourse. Fee is 1.5%, factor retains 4% for returns/discounts.</p>
          <p><strong>Instructions:</strong> Prepare journal entry on July 1, 2026 for: (a) SEK Group, (b) Mays Finance.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-19')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-19" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <p>Finance Charge $= \text{&yen;}400,000 \times 1.5\% = \mathbf{\text{&yen;}6,000}$.<br>
            Retention (Reserve) $= \text{&yen;}400,000 \times 4\% = \mathbf{\text{&yen;}16,000}$.<br>
            Net Cash $= 400,000 - 6,000 - 16,000 = \mathbf{\text{&yen;}378,000}$.</p>
            
            <p><strong>(a) Seller's Books (SEK Group):</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Cash ................................... 378,000<br>
              Dr. Due from Factor ......................... 16,000<br>
              Dr. Loss on Sale of Receivables ............. 6,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable .................. 400,000
            </div>

            <p style="margin-top:0.8rem;"><strong>(b) Buyer's Books (Mays Finance):</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Accounts Receivable (Purchased) ....... 400,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Due to Customer (SEK Group) ............ 16,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Financing Revenue (Fee) ................. 6,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Cash ................................... 378,000
            </div>
            <p><strong>【中文解題剖析】</strong><br>
              賣方的「Due from Factor（應收融資商款項，資產）」剛好與買方帳上的「Due to Customer（應付客戶保留款，負債）」完美鏡像對稱！融資商賺取的手續費 &yen;6,000 認列為融資收入。
            </p>
          </div>
        </div>

        <!-- E5.20 -->
        <div class="problem-box" id="ex-5-20">
          <div class="problem-head">
            <span class="problem-tag">E5.20 (LO 5)</span>
            <span>Transfer of Receivables with Limited Guarantee (附有限追索保證讓售之保證負債處理)</span>
          </div>
          <p>May 1, 2026: Brubaker factors &pound;800,000 AR with Calder Finance, guaranteeing up to &pound;80,000 credit losses. Fee 1%, retention 5%. Fair value of recourse guarantee liability is &pound;18,000.</p>
          <p><strong>Instructions:</strong> Prepare May 1, 2026 journal entry for: (a) Brubaker Inc., (b) Calder Finance.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-20')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-20" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <p>Finance Charge $= \text{&pound;}800,000 \times 1\% = \mathbf{\text{&pound;}8,000}$.<br>
            Due from Factor $= \text{&pound;}800,000 \times 5\% = \mathbf{\text{&pound;}40,000}$.<br>
            Net Cash Proceeds $= 800,000 - 8,000 - 40,000 = \mathbf{\text{&pound;}752,000}$.<br>
            Recourse Liability Fair Value $= \mathbf{\text{&pound;}18,000}$.<br>
            Total Loss on Sale $= \text{Finance Fee } (8,000) + \text{Guarantee Liability } (18,000) = \mathbf{\text{&pound;}26,000}$.</p>

            <p><strong>(a) Seller's Books (Brubaker Inc.):</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Cash ................................... 752,000<br>
              Dr. Due from Factor ......................... 40,000<br>
              Dr. Loss on Sale of Receivables ............ 26,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable .................. 800,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Recourse Liability (Guarantee) ......... 18,000
            </div>

            <p style="margin-top:0.8rem;"><strong>(b) Buyer's Books (Calder Finance):</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Accounts Receivable .................... 800,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Due to Customer ........................ 40,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Financing Revenue ....................... 8,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Cash ................................... 752,000
            </div>
            <p><strong>【中文解題剖析】</strong><br>
              在有限保證讓售且滿足出售條件下，出讓方（Brubaker）必須以公允價值（&pound;18,000）單獨認列「保證負債（Recourse Liability）」，該保證負債直接增加出售應收款項之損失（總損失 $= 8,000 + 18,000 = \text{&pound;}26,000$）。
            </p>
          </div>
        </div>

        <!-- E5.21 -->
        <div class="problem-box" id="ex-5-21">
          <div class="problem-head">
            <span class="problem-tag">E5.21 (LO 5)</span>
            <span>Derecognition of a Part of a Receivable (應收票據特定現金流量部分除列)</span>
          </div>
          <p>Jan 1, 2024: 5-year, &euro;100,000 note, 10% annual interest (market rate 12%). On Jan 1, 2026, Schmitt sold the right to receive remaining 3 interest payments without recourse when market rate was 6%.</p>
          <p><strong>Instructions:</strong> Prepare the journal entry on January 1, 2026, for Schmitt Company to record the sale of the interest payments to the bank.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-21')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-21" class="solution-body exercise-sol">
            <p><strong>【Answer: Journal Entry】</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Cash .................................... 26,730.12<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Notes Receivable (or Discount Contra) ... 24,018.31<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Gain on Sale of Receivables ............ 2,711.81
            </div>
            <p><strong>【中文解題剖析與現值精算過程】</strong></p>
            <ol>
              <li>2026 年 1 月 1 日，票據尚餘 3 年到期（每年收取利息 $\text{&euro;}100,000 \times 10\% = \text{&euro;}10,000$）。</li>
              <li><strong>銀行購買價格（按當前市場利率 6% 折現 3 年年金現值）：</strong><br>
                $$\text{Cash Received} = \text{&euro;}10,000 \times \left[\frac{1 - (1.06)^{-3}}{0.06}\right] = 10,000 \times 2.673012 = \mathbf{\text{&euro;}26,730.12}$$
              </li>
              <li><strong>被除列之利息權利帳面價值（按歷史原始有效利率 12% 衡量）：</strong><br>
                $$\text{Carrying Value of Interest} = \text{&euro;}10,000 \times \left[\frac{1 - (1.12)^{-3}}{0.12}\right] = 10,000 \times 2.401831 = \mathbf{\text{&euro;}24,018.31}$$
              </li>
              <li><strong>認列出售利息權利利益：</strong><br>
                $$\text{Gain on Sale} = \text{&euro;}26,730.12 - \text{&euro;}24,018.31 = \mathbf{\text{&euro;}2,711.81}$$
              </li>
            </ol>
            <p>依據 IFRS 9 部分除列原則，出讓方將未來 3 年利息現金流獨立剝離除列，收到的現金大於帳面價值部分直接計入當期損益。</p>
          </div>
        </div>

        <!-- E5.22 -->
        <div class="problem-box" id="ex-5-22">
          <div class="problem-head">
            <span class="problem-tag">E5.22 (LO 5)</span>
            <span>Servicing Assets and Liabilities (保留服務權利之服務資產與服務負債認列)</span>
          </div>
          <p>Brooks Ltd. factors receivables carrying amount &pound;250,000 for &pound;240,000 without guarantee, retaining the right to service receivables.</p>
          <p><strong>Instructions:</strong> Prepare journal entries assuming: (a) Buyer additionally pays &pound;15,000 for servicing (fair servicing cost is &pound;5,000). (b) No additional payment for servicing (fair servicing cost is &pound;8,000).</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-22')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-22" class="solution-body exercise-sol">
            <p><strong>【Answers: Journal Entries】</strong></p>
            <p><strong>(a) Additional Payment &pound;15,000 > Fair Compensation &pound;5,000 &rarr; Servicing Asset recognized:</strong><br>
            Net Servicing Asset $= \text{&pound;}15,000 - \text{&pound;}5,000 = \mathbf{\text{&pound;}10,000}$. Total Cash $= 240,000 + 15,000 = \text{&pound;}255,000$.<br>
            <em>(Alternative presentation: Net Servicing Asset &pound;10,000 with Cash &pound;240,000)</em>:</p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Cash (&pound;240,000 + &pound;15,000) ............... 255,000<br>
              Dr. Servicing Asset ........................ 10,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable .................. 250,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Gain on Sale of Receivables ............ 15,000
            </div>

            <p style="margin-top:0.8rem;"><strong>(b) No Additional Payment for Servicing &rarr; Servicing Liability recognized:</strong><br>
            Because Brooks receives no compensation for servicing but incurs &pound;8,000 fair value obligations, a <strong>Servicing Liability of &pound;8,000</strong> must be recorded, increasing the loss on sale to &pound;18,000 ($250,000 &minus; 240,000 + 8,000):</p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Cash ................................... 240,000<br>
              Dr. Loss on Sale of Receivables ............ 18,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable .................. 250,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Servicing Liability ..................... 8,000
            </div>
            <p><strong>【中文解題剖析】</strong><br>
              當出售應收款但保留後續帳務催收服務時：若預期服務收入<strong>大於</strong>公允服務成本，其差額應資本化為「<strong>服務資產（Servicing Asset）</strong>」；反之，若無補償或補償不足，則必須認列「<strong>服務負債（Servicing Liability）</strong>」，並增加出售損失。
            </p>
          </div>
        </div>

        <!-- E5.23 -->
        <div class="problem-box" id="ex-5-23">
          <div class="problem-head">
            <span class="problem-tag">E5.23 (LO 2, 5)</span>
            <span>Analysis of Receivables &amp; Turnover Ratio (應收帳款週轉率與流動性分析)</span>
          </div>
          <p>Grant AG: 1. Beginning AR &euro;15,000. 2. Net credit sales &euro;100,000. 3. Collections &euro;80,000. No bad debts.</p>
          <p><strong>Instructions:</strong> (a) Summary journal entries. (b) Compute accounts receivable turnover. (c) Analyze Grant's liquidity if prior year turnover was 7.0.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-23')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-23" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p><strong>(a) Summary Journal Entries:</strong></p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              1. Dr. Accounts Receivable ................. 100,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cr. Sales Revenue ....................... 100,000<br>
              2. Dr. Cash ................................. 80,000<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable .................. 80,000
            </div>
            <p style="margin-top:0.6rem;">
              &bull; <strong>(b) Accounts Receivable Turnover:</strong><br>
              Ending AR $= \text{&euro;}15,000 + \text{&euro;}100,000 - \text{&euro;}80,000 = \mathbf{\text{&euro;}35,000}$.<br>
              Average AR $= \frac{15,000 + 35,000}{2} = \mathbf{\text{&euro;}25,000}$.<br>
              $$\text{Accounts Receivable Turnover} = \frac{\text{Net Credit Sales}}{\text{Average Net AR}} = \frac{\text{&euro;}100,000}{\text{&euro;}25,000} = \mathbf{4.0\text{ times (次)}}$$
              $$\text{Days to Collect} = \frac{365}{4.0} = \mathbf{91.25\text{ days (天)}}$$
            </p>
            <p><strong>(c) Liquidity Analysis:</strong><br>
            Grant's liquidity has <strong>significantly deteriorated</strong>. The turnover dropped sharply from <strong>7.0 times</strong> last year (average collection period of 52.1 days) to <strong>4.0 times</strong> this year (91.25 days). It now takes nearly 40 days longer to collect receivables, which ties up working capital and raises credit risk.
            </p>
          </div>
        </div>

        <!-- E5.24 -->
        <div class="problem-box" id="ex-5-24">
          <div class="problem-head">
            <span class="problem-tag">E5.24 (LO 5)</span>
            <span>Factoring Impact on Turnover Ratio &amp; Window Dressing (讓售對週轉率之美化影響)</span>
          </div>
          <p>Grant AG factors &euro;10,000 AR at year-end without guarantee. Factor retains 5% and assesses 4% finance fee.</p>
          <p><strong>Instructions:</strong> (a) Prepare factoring journal entry. (b) Compute revised turnover and discuss how factoring affects the ratio.</p>

          <button class="solution-toggle" onclick="toggleSolution('sol-e5-24')">💡 展開詳細解答與剖析</button>
          <div id="sol-e5-24" class="solution-body exercise-sol">
            <p><strong>【Answers】</strong></p>
            <p><strong>(a) Factoring Journal Entry:</strong><br>
            Finance Charge $= \text{&euro;}10,000 \times 4\% = \mathbf{\text{&euro;}400}$. Due from Factor $= \text{&euro;}10,000 \times 5\% = \mathbf{\text{&euro;}500}$. Cash $= \mathbf{\text{&euro;}9,100}$.</p>
            <div style="background:#f8fafc; padding:0.8rem; border-radius:6px; font-family:monospace; font-size:0.88rem;">
              Dr. Cash .................................... 9,100<br>
              Dr. Due from Factor ........................... 500<br>
              Dr. Loss on Sale of Receivables ............... 400<br>
              &nbsp;&nbsp;&nbsp;&nbsp;Cr. Accounts Receivable ................... 10,000
            </div>

            <p style="margin-top:0.6rem;"><strong>(b) Revised Accounts Receivable Turnover:</strong><br>
            Revised Ending AR $= \text{&euro;}35,000 - \text{&euro;}10,000 = \mathbf{\text{&euro;}25,000}$.<br>
            Revised Average AR $= \frac{15,000 + 25,000}{2} = \mathbf{\text{&euro;}20,000}$.<br>
            $$\text{Revised Turnover} = \frac{\text{&euro;}100,000}{\text{&euro;}20,000} = \mathbf{5.0\text{ times (次)}} \quad (\text{Days to Collect} = 73.0\text{ days})$$
            </p>
            <p><strong>Discussion of Financial Impact:</strong><br>
            Factoring receivables removes &euro;10,000 from the balance sheet, artificially reducing ending accounts receivable and lowering the average receivables denominator. This boosts the reported turnover ratio from <strong>4.0 times to 5.0 times</strong> (shortening collection days from 91.3 to 73.0 days). Management may use year-end factoring as a form of <strong>window dressing</strong> to make company liquidity and operational efficiency appear stronger to creditors and investors than they actually are.
            </p>
            <p><strong>【中文解題剖析】</strong><br>
              這是一道經典的「財務報表粉飾與實質流動性分析」綜合題。透過期末將應收款無追索權讓售，分母平均應收帳款被壓低，使得週轉率瞬間從 4.0 次拉升到 5.0 次，但實質上銷貨收現速度並未改善，甚至還承擔了 4% 的融資折損手續費！
            </p>
          </div>
        </div>

      </section>
'''

def update_handout():
    file_path = r"收件苗圃\學習講義合輯\Ch05_IFRS_學習講義.html"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. 更新側邊欄 (toc-list)
    old_toc_item = '<li><a href="#summary">本章記憶膠囊</a></li>'
    new_toc_item = '''<li><a href="#chapter-exercises">📚 課後習題全解 (E5.1~E5.24)</a></li>
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
        r"C:\Users\閻星澄\Documents\WikiTree\收件苗圃\中級會計學\Ch05_IFRS_學習講義.html",
        r"C:\Users\閻星澄\Desktop\學習講義合集\Ch05_IFRS_學習講義.html"
    ]
    for target in sync_targets:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Synced to: {target}")

if __name__ == "__main__":
    update_handout()
