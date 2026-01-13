import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" }
  };

  const iconSize = sizes[size].icon;
  const textSize = sizes[size].text;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="oklch(0.45 0.12 155)"
          stroke="oklch(0.35 0.12 155)"
          strokeWidth="2"
        />
        
        <path
          d="M 25 50 Q 25 35, 35 35 L 65 35 Q 75 35, 75 50"
          fill="none"
          stroke="oklch(0.98 0 0)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        <circle
          cx="40"
          cy="55"
          r="8"
          fill="oklch(0.72 0.18 85)"
        />
        
        <circle
          cx="60"
          cy="55"
          r="8"
          fill="oklch(0.85 0.15 125)"
        />
        
        <path
          d="M 32 65 Q 50 70, 68 65"
          fill="none"
          stroke="oklch(0.98 0 0)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        <path
          d="M 50 30 L 50 40"
          stroke="oklch(0.98 0 0)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="27"
          r="2.5"
          fill="oklch(0.98 0 0)"
        />
      </svg>
      
      {showText && (
        <span className={cn("font-heading font-bold text-primary", textSize)}>
          Gurmaio
        </span>
      )}
    </div>
  );
}
