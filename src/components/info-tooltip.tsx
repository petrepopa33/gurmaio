import { Info } from '@phosphor-icons/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InfoTooltipProps {
  content: string;
  ariaLabel?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function InfoTooltip({ content, ariaLabel = "More information", side = "top" }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label={ariaLabel}
            type="button"
          >
            <Info size={16} weight="fill" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
