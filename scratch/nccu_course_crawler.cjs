const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// 預設查詢學期 (例如 113學年度第2學期)
const DEFAULT_SEMESTER = '1132';

// 取得命令列參數
const args = process.argv.slice(2);
const semester = args.find(arg => arg.startsWith('--semester='))?.split('=')[1] || DEFAULT_SEMESTER;

console.log('===================================================');
console.log('       NCCU 課程資訊爬蟲 (qrysub.nccu.edu.tw)      ');
console.log(` 查詢學期: ${semester} `);
console.log('===================================================');

// 封裝 HTTPS GET 請求，並自動處理 legacy TLS renegotiation
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      secureOptions: crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION
    };

    https.get(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP status ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// 主爬蟲流程
async function startCrawler() {
  try {
    // 1. 取得所有開課單位代碼 (unit.json)
    console.log('正在下載開課單位代碼對照表...');
    const units = await fetchJson('https://qrysub.nccu.edu.tw/assets/api/unit.json');
    
    // 建立所有查詢組合 (dp1, dp2)
    const queryPairs = [];
    units.forEach(u => {
      if (u.utCodL1 !== '0') {
        u.utL2.forEach(dept => {
          if (dept.utCodL2 !== '0') {
            queryPairs.push({
              dp1: u.utCodL1,
              dp1Text: u.utL1Text.split(' ')[0], // 簡化簡稱
              dp2: dept.utCodL2,
              dp2Text: dept.utL2Text.split(' ')[0]
            });
          }
        });
      }
    });

    console.log(`解析完成！共有 ${queryPairs.length} 個開課分類組合準備查詢。`);

    // 2. 循序爬取各單位的課程資訊 (避免過快被伺服器阻擋)
    const allCoursesMap = new Map();
    let completed = 0;

    for (const pair of queryPairs) {
      console.log(`[${++completed}/${queryPairs.length}] 正在爬取: ${pair.dp1Text} -> ${pair.dp2Text}...`);
      
      // 構建 API 請求 URL 
      // 網頁原始寫法: o = wt.myServer + this.courseApi + "/" + r + "/";
      // 參數寫法: o += ":sem=1132 :dp1=100 :dp2=1 :rcnt=1000 /"
      const apiPath = `/course/zh-TW/:sem=${semester} :dp1=${pair.dp1} :dp2=${pair.dp2} :rcnt=1000 /`;
      const url = `https://es.nccu.edu.tw${encodeURI(apiPath)}`;

      try {
        const courses = await fetchJson(url);
        if (Array.isArray(courses)) {
          let addedCount = 0;
          courses.forEach(c => {
            if (c.subNum && !allCoursesMap.has(c.subNum)) {
              allCoursesMap.set(c.subNum, c);
              addedCount++;
            }
          });
          console.log(`   └─ 成功擷取 ${courses.length} 門課程 (新增 ${addedCount} 門不重複課程)`);
        } else {
          console.log(`   └─ 警告: 回傳格式非陣列`);
        }
      } catch (err) {
        console.error(`   └─ 錯誤: 無法獲取該分類課程資料 (${err.message})`);
      }

      // 每次請求間隔 300 毫秒，禮貌爬取
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const finalCourses = Array.from(allCoursesMap.values());
    console.log(`\n===================================================`);
    console.log(` 爬取完畢！`);
    console.log(` 不重複課程總數: ${finalCourses.length} 門`);
    
    if (finalCourses.length === 0) {
      console.log('未擷取到任何課程，請確認學期代碼是否正確。');
      return;
    }

    // 3. 輸出為 JSON 檔案
    const jsonFileName = `nccu_courses_${semester}.json`;
    const jsonPath = path.join(process.cwd(), jsonFileName);
    fs.writeFileSync(jsonPath, JSON.stringify(finalCourses, null, 2), 'utf-8');
    console.log(` 💾 JSON 檔案已儲存: ${jsonFileName}`);

    // 4. 輸出為 CSV 檔案 (以便用 Excel 直接開啟)
    const csvFileName = `nccu_courses_${semester}.csv`;
    const csvPath = path.join(process.cwd(), csvFileName);
    
    // CSV 標頭
    const headers = [
      '學年度', '學期', '課程代碼', '課程名稱', '授課教師', 
      '上課時間', '上課教室', '學分', '選別', '開課學程/年級', 
      '授課語言', 'EMI課程', '學制分類', '備註'
    ];
    
    let csvContent = '\uFEFF' + headers.join(',') + '\n'; // 加上 BOM (UTF-8) 防止 Excel 中文亂碼
    
    finalCourses.forEach(c => {
      const row = [
        c.y || '',
        c.s || '',
        c.subNum || '',
        // 欄位內容若有逗號或雙引號，需用雙引號包起來
        `"${(c.subNam || '').replace(/"/g, '""')}"`,
        `"${(c.teaNam || '').replace(/"/g, '""')}"`,
        `"${(c.subTime || '').replace(/"/g, '""')}"`,
        `"${(c.subClassroom || '').replace(/"/g, '""')}"`,
        c.subPoint || '',
        c.subKind || '',
        `"${(c.subGde || '').replace(/"/g, '""')}"`,
        c.langTpe || '',
        c.emiType || '否',
        c.gdeType || '',
        `"${(c.note || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    fs.writeFileSync(csvPath, csvContent, 'utf-8');
    console.log(` 💾 CSV 檔案已儲存 (已支援 Excel 中文): ${csvFileName}`);
    console.log('===================================================');

  } catch (globalErr) {
    console.error('爬蟲過程中發生嚴重錯誤:', globalErr);
  }
}

startCrawler();
