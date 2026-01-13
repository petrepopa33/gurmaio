import { cn } from "@/lib/utils";

  size?: "sm" | "md" 
}
export function Logo({ class
    sm: { icon: 24, t
 

  const textSize = sizes[size].text;
  return (
      <svg
        height={iconSize}
        fill="none"
    

          cy="50"
          fill="oklch(0.45 0.12 155)

        
          d="M 25 50 Q 25 35, 35 35 L 65 35 Q 75 35, 75 50"
          
          strokeLinecap=
        
          cx="40"
          r="8"
        />
        <circle
       
          fill=
        
          d="M 32
          stroke
          strokeLinecap="round"
        
          d="M 50 30 L 50
          
        
          cx=
          r="2.5"
        />
      
        <span className={
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
