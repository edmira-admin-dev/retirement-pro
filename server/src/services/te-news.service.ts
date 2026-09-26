import axios from 'axios'

export type TeTag = 'RBI' | 'FED' | 'MAJOR'

export interface TeEvent {
  id: number
  title: string
  description: string
  category: string
  country: string
  importance: number
  date: string
  url: string
  tag: TeTag
}

interface RawTeItem {
  ID: number
  title: string
  description: string
  category: string
  country: string
  importance: number
  date: string
  url: string
}

const STREAM_COUNTRIES = ['india', 'united states']

async function fetchTeStream (country: string): Promise<RawTeItem[]> {
  try {
    const { data } = await axios.get<RawTeItem[]>('https://tradingeconomics.com/ws/stream.ashx', {
      params: { start: 0, size: 30, c: country },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Referer': `https://tradingeconomics.com/${country.replace(' ', '-')}/news`,
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 10000,
    })
    return data ?? []
  } catch (err) {
    console.error(`[te-news] stream error ${country}`, (err as Error).message)
    return []
  }
}

// Daily index open/close recaps ("Sensex Closes Lower", "The SENSEX Index
// Closes 0.40% Lower") are routine market-wrap noise — they often mention RBI
// or the Fed only in passing context ("...ahead of RBI's policy decision")
// and shouldn't be tagged as real RBI/Fed/major news on that basis alone.
const NOISY_CATEGORIES = new Set(['stock market', 'stocks'])

function tagItem (item: RawTeItem): TeTag | null {
  if (NOISY_CATEGORIES.has(item.category.toLowerCase())) return null
  const text = `${item.title} ${item.description}`.toLowerCase()
  if (/\brbi\b|reserve bank of india|repo rate|monetary policy committee/.test(text)) return 'RBI'
  if (/\bfed\b|federal reserve|fomc|jerome powell/.test(text)) return 'FED'
  if (item.importance >= 2) return 'MAJOR'
  return null
}

function dedupeByTitle<T extends { title: string }> (items: T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of items) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').slice(0, 6).join(' ')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

let streamCache: { combined: RawTeItem[]; fetchedAt: number } | null = null

async function loadStreams (): Promise<RawTeItem[]> {
  const results = await Promise.all(STREAM_COUNTRIES.map(fetchTeStream))
  const combined = results.flat()
  streamCache = { combined, fetchedAt: Date.now() }
  return combined
}

export async function getMajorEvents (forceRefresh = false): Promise<TeEvent[]> {
  const combined = (!forceRefresh && streamCache) ? streamCache.combined : await loadStreams()
  const tagged = combined
    .map(item => ({ item, tag: tagItem(item) }))
    .filter((x): x is { item: RawTeItem; tag: TeTag } => x.tag !== null)
    .map(({ item, tag }) => ({
      id: item.ID,
      title: item.title,
      description: item.description,
      category: item.category,
      country: item.country,
      importance: item.importance,
      date: item.date,
      url: `https://tradingeconomics.com${item.url}`,
      tag,
    }))

  return dedupeByTitle(tagged)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12)
}
