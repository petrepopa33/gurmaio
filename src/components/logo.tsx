import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-base" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" }
  };

  const iconSize = sizes[size].icon;
  const textSize = sizes[size].text;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="oklch(0.45 0.12 155)"
        />
        <path
          d="M 25 50 Q 25 35, 35 35 L 65 35 Q 75 35, 75 50"
          stroke="oklch(0.98 0 0)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <circle
          cx="40"
          cy="50"
          r="8"
          fill="oklch(0.98 0 0)"
        />
        <circle
          cx="60"
          cy="50"
          r="8"
          fill="oklch(0.98 0 0)"
        />
        <path
          d="M 32 70 Q 50 85, 68 70"
          stroke="oklch(0.98 0 0)"
          strokeWidth="3"
          fill="none"
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
