/**
 * WikiTree 筆記修整比對工具 (Note Revision Diff Utility)
 * 計算新舊筆記內容之行級比對、新增行與刪除行。
 */

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export interface DiffResult {
  addedLines: string[];
  removedLines: string[];
  allLines: DiffLine[];
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
  isPureInsert: boolean;
}

export interface PendingDiffInfo {
  addedContent: string;
  removedContent: string;
  fullNewContent: string;
  addedLinesCount: number;
  removedLinesCount: number;
}

/**
 * 使用 LCS (Longest Common Subsequence) 演算法比對兩份文字行
 */
export function computeLineDiff(oldText: string, newText: string): DiffResult {
  const oldLines = oldText ? oldText.split('\n') : [];
  const newLines = newText ? newText.split('\n') : [];

  if (oldLines.length === 0) {
    const added = newLines.filter(l => l.trim().length > 0);
    return {
      addedLines: added,
      removedLines: [],
      allLines: newLines.map(text => ({ type: 'added', text })),
      addedCount: added.length,
      removedCount: 0,
      unchangedCount: 0,
      isPureInsert: true,
    };
  }

  // 1. 去除首尾相同的公共部分以提升比對效能
  let prefixCount = 0;
  while (
    prefixCount < oldLines.length &&
    prefixCount < newLines.length &&
    oldLines[prefixCount] === newLines[prefixCount]
  ) {
    prefixCount++;
  }

  let suffixCount = 0;
  while (
    suffixCount < oldLines.length - prefixCount &&
    suffixCount < newLines.length - prefixCount &&
    oldLines[oldLines.length - 1 - suffixCount] === newLines[newLines.length - 1 - suffixCount]
  ) {
    suffixCount++;
  }

  const midOld = oldLines.slice(prefixCount, oldLines.length - suffixCount);
  const midNew = newLines.slice(prefixCount, newLines.length - suffixCount);

  // 2. 對中間差異區塊進行動態規劃 LCS
  const n = midOld.length;
  const m = midNew.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (midOld[i - 1] === midNew[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 3. 回溯獲取變更行
  const midDiff: DiffLine[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && midOld[i - 1] === midNew[j - 1]) {
      midDiff.unshift({ type: 'unchanged', text: midOld[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      midDiff.unshift({ type: 'added', text: midNew[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      midDiff.unshift({ type: 'removed', text: midOld[i - 1] });
      i--;
    }
  }

  const allLines: DiffLine[] = [
    ...oldLines.slice(0, prefixCount).map(text => ({ type: 'unchanged' as const, text })),
    ...midDiff,
    ...oldLines.slice(oldLines.length - suffixCount).map(text => ({ type: 'unchanged' as const, text })),
  ];

  const addedLines = allLines.filter(l => l.type === 'added' && l.text.trim().length > 0).map(l => l.text);
  const removedLines = allLines.filter(l => l.type === 'removed' && l.text.trim().length > 0).map(l => l.text);
  const unchangedCount = allLines.filter(l => l.type === 'unchanged').length;

  return {
    addedLines,
    removedLines,
    allLines,
    addedCount: addedLines.length,
    removedCount: removedLines.length,
    unchangedCount,
    isPureInsert: removedLines.length === 0,
  };
}
