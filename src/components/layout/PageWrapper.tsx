interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-6 ${className}`}>
      {children}
    </div>
  )
}
