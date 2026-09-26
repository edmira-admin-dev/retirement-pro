function isTableLine (line: string): boolean {
  return /^\s*\|/.test(line)
}

function isStructuralLine (line: string): boolean {
  return isTableLine(line) || /^\s*#{1,6}\s/.test(line) || /^\s*>\s/.test(line) || /^\s*[-*]\s/.test(line) || /^\s*\d+\.\s/.test(line)
}

function splitSentences (text: string): string[] {
  const sentenceEndRe = /[a-zA-Z0-9)%][.!?](?=\s+\*{0,2}_{0,2}[A-Z(]|\s*$)/g
  const result: string[] = []
  let start = 0
  let m: RegExpExecArray | null
  while ((m = sentenceEndRe.exec(text))) {
    const end = m.index + m[0].length
    result.push(text.slice(start, end).trim())
    start = end
  }
  if (start < text.length) result.push(text.slice(start).trim())
  return result.filter(Boolean)
}

/** Breaks each sentence in prose paragraphs onto its own line, leaving tables/headings/lists untouched. */
export function insertSentenceBreaks (markdown: string): string {
  const lines = markdown.split('\n')
  const output: string[] = []
  let buffer: string[] = []

  function flush () {
    if (buffer.length === 0) return
    const text = buffer.join(' ').trim()
    buffer = []
    if (!text) return
    output.push(splitSentences(text).join('\n\n'))
  }

  for (const line of lines) {
    if (line.trim() === '' || isStructuralLine(line)) {
      flush()
      output.push(line)
    } else {
      buffer.push(line.trim())
    }
  }
  flush()

  return output.join('\n')
}
