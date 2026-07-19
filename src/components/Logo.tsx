
interface LogoProps {
  className?: string
  iconOnly?: boolean
  size?: number
}

export function Logo({ className = "", iconOnly = false, size = 24 }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Abstract geometric mark representing direction, flow, and guidance */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Flow Chevron */}
        <path
          d="M6 8L16 18L13 24L3 14L6 8Z"
          fill="hsl(var(--primary))"
          opacity="0.8"
        />
        {/* Pilot Diamond */}
        <path
          d="M26 8L16 18L19 24L29 14L26 8Z"
          fill="hsl(var(--primary))"
        />
        {/* Core Node */}
        <circle cx="16" cy="18" r="3" fill="hsl(var(--foreground))" />
      </svg>

      {!iconOnly && (
        <span className="font-extrabold tracking-tight text-foreground text-[15px] font-sans select-none">
          Flow<span className="text-primary font-medium">Pilot</span>
        </span>
      )}
    </div>
  )
}
