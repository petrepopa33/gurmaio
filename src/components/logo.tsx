import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo(props: LogoProps) {
  const { className, size = "md", showText = true } = props;
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
          stroke="oklch(0.35 0.18 140)"
          strokeWidth="4"
          fill="oklch(0.98 0.005 140)"
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="oklch(0.35 0.18 140)"
        />
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="oklch(0.98 0.005 140)"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className={cn("font-heading font-bold tracking-tight", textSize)}>
          Gurmaio
        </span>
      )}
    </div>
  );
}
