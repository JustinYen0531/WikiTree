export const isHtmlNote = (name: string) => /\.html?$/i.test(name);

export function renamedNoteName(original: string, input: string): string {
  if (isHtmlNote(original)) {
    const extension = original.match(/\.html?$/i)![0];
    return isHtmlNote(input) ? input : `${input.replace(/\.(md|markdown|txt)$/i, '')}${extension}`;
  }
  return /\.(md|markdown|txt)$/i.test(input) ? input : `${input}.md`;
}
