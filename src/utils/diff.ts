export interface DiffLine {
  type: 'added' | 'removed' | 'normal';
  value: string;
}

/**
 * Computes a simple line-by-line diff between two strings.
 * Uses a basic LCS (Longest Common Subsequence) algorithm for line-level diffing.
 */
export function diffLines(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  const oldLen = oldLines.length;
  const newLen = newLines.length;
  
  // Matrix for LCS
  const dp: number[][] = Array(oldLen + 1).fill(0).map(() => Array(newLen + 1).fill(0));
  
  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const result: DiffLine[] = [];
  let i = oldLen;
  let j = newLen;
  
  // Backtrack to find diff
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({ type: 'normal', value: oldLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', value: newLines[j - 1] });
      j--;
    } else {
      result.unshift({ type: 'removed', value: oldLines[i - 1] });
      i--;
    }
  }
  
  return result;
}
