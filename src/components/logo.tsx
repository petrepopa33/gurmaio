import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
export function Logo(props: 
  const sizes = {
 

export function Logo(props: LogoProps) {
  const { className, size = "md", showText = true } = props;
  const sizes = {
    sm: { icon: 24, text: "text-base" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" }
  };

        viewBox="0 0 100 100"
  const textSize = sizes[size].text;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        />
        height={iconSize}
          stroke="oklch(0.98 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeLinecap="round"
        <c
          cy=
          fill="oklch(0.98 0 0)"
      </svg>
      {showText && (
          Gurmaio
      )}
  );









































