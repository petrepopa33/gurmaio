import { Separator } from '@/components/ui/separator';
import { DISCLAIMERS } from '@/lib/disclaimers';
import { Shield, FileText, Trash, Envelope } from '@phosphor-icons/react';

interface AppFooterProps {
  onDeleteAccount?: () => void;
}

export function AppFooter({ onDeleteAccount }: AppFooterProps) {
  return (
    <footer className="border-t bg-muted/30 mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Legal & Privacy
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href="https://github.com/yourusername/gurmaio/blob/main/PRIVACY.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Shield size={16} />
                Privacy Policy
              </a>
              <a
                href="https://github.com/yourusername/gurmaio/blob/main/TERMS.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <FileText size={16} />
                Terms of Service
              </a>
              {onDeleteAccount && (
                <button
                  onClick={onDeleteAccount}
                  className="flex items-center gap-2 text-sm hover:text-destructive transition-colors text-left"
                >
                  <Trash size={16} />
                  Delete My Data
                </button>
              )}
              <a
                href="mailto:support@gurmaio.app"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Envelope size={16} />
                Contact Support
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Important Information
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <span>{DISCLAIMERS.medical.full}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">🤖</span>
                <span>{DISCLAIMERS.ai.full}</span>
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 Gurmaio. All values are estimates for informational purposes only.</p>
          <p className="mt-1">Not affiliated with any grocery stores or nutrition databases.</p>
        </div>
      </div>
    </footer>
  );
}
