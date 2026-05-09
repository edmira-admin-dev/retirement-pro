export const toPaise = (rupees: number): number => Math.round(rupees * 100)

export const toRupees = (paise: number): number => paise / 100

export const formatRupees = (rupees: number): string =>
  '₹' + rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })

export const formatRupeesCompact = (rupees: number): string => {
  if (rupees >= 1_00_00_000) return `₹${(rupees / 1_00_00_000).toFixed(2)} Cr`
  if (rupees >= 1_00_000) return `₹${(rupees / 1_00_000).toFixed(2)} L`
  return formatRupees(rupees)
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function _sub100(n: number): string {
  return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
}

function _sub1000(n: number): string {
  if (n === 0) return ''
  if (n < 100) return _sub100(n)
  return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + _sub100(n % 100) : '')
}

/** Converts a rupee amount to Indian English words. e.g. 150000 → "One Lakh Fifty Thousand" */
export function rupeesToWords(n: number): string {
  if (!n || n <= 0 || !isFinite(n)) return ''
  const v = Math.floor(n)
  const cr       = Math.floor(v / 1_00_00_000)
  const lakh     = Math.floor((v % 1_00_00_000) / 1_00_000)
  const thousand = Math.floor((v % 1_00_000) / 1_000)
  const rem      = v % 1_000

  const parts: string[] = []
  if (cr > 0)       parts.push(_sub1000(cr) + ' Crore')
  if (lakh > 0)     parts.push(_sub100(lakh) + ' Lakh')
  if (thousand > 0) parts.push(_sub100(thousand) + ' Thousand')
  if (rem > 0)      parts.push(_sub1000(rem))

  return parts.join(' ')
}
