import { CheckCircle, XCircle } from 'lucide-react'
import type { RatioItem } from '../../types/health'

interface RatioTableProps {
  ratios: RatioItem[]
}

export const RatioTable = ({ ratios }: RatioTableProps) => (
  <div className="bg-theme-card border border-theme-border rounded-xl p-5">
    <p className="text-xs text-theme-muted uppercase tracking-wider mb-4">Key Ratios</p>
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[400px]">
        <thead>
          <tr className="border-b border-theme-border">
            <th className="text-left text-xs text-theme-muted font-medium pb-2 pr-4">Ratio</th>
            <th className="text-right text-xs text-theme-muted font-medium pb-2 pr-4">Your Value</th>
            <th className="text-right text-xs text-theme-muted font-medium pb-2 pr-4">Healthy Range</th>
            <th className="text-center text-xs text-theme-muted font-medium pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {ratios.map((ratio) => (
            <tr key={ratio.name} className="border-b border-theme-border/50 last:border-0">
              <td className="py-2.5 pr-4 text-theme-text font-medium">{ratio.name}</td>
              <td className="py-2.5 pr-4 text-right font-mono text-theme-text">
                {ratio.displayValue}
              </td>
              <td className="py-2.5 pr-4 text-right text-theme-muted text-xs">{ratio.range}</td>
              <td className="py-2.5 text-center">
                {ratio.pass ? (
                  <CheckCircle size={15} className="text-success inline-block" />
                ) : (
                  <XCircle size={15} className="text-danger inline-block" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)
