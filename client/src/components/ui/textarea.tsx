import { useDialogComposition } from "@/components/ui/dialog";
import { useComposition } from "@/hooks/useComposition";
import { cn } from "@/lib/utils";
import { checkServiceSpelling } from "@/utils/serviceSpellcheck";
import * as React from "react";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  showSpellAssistant?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  showSpellAssistant = true,
  ...props
}, ref) => {
  // Get dialog composition context if available (will be no-op if not inside Dialog)
  const dialogComposition = useDialogComposition();

  // Add composition event handlers to support input method editor (IME) for CJK languages.
  const {
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  } = useComposition<HTMLTextAreaElement>({
    onKeyDown: (e) => {
      // Check if this is an Enter key that should be blocked
      const isComposing = (e.nativeEvent as any).isComposing || dialogComposition.justEndedComposing();

      // If Enter key is pressed while composing or just after composition ended,
      // don't call the user's onKeyDown (this blocks the business logic)
      if (e.key === "Enter" && !e.shiftKey && isComposing) {
        return;
      }

      onKeyDown?.(e);
    },
    onCompositionStart: e => {
      dialogComposition.setComposing(true);
      onCompositionStart?.(e);
    },
    onCompositionEnd: e => {
      dialogComposition.markCompositionEnd();
      setTimeout(() => {
        dialogComposition.setComposing(false);
      }, 100);
      onCompositionEnd?.(e);
    },
  });

  const currentValue = typeof props.value === "string" ? props.value : "";
  const spellResult = React.useMemo(() => {
    if (!showSpellAssistant || !currentValue || currentValue.length < 3 || props.spellCheck === false) {
      return null;
    }
    const res = checkServiceSpelling(currentValue);
    if (res.hasCorrection && res.correctedText.trim() !== currentValue.trim()) {
      return res.correctedText;
    }
    return null;
  }, [showSpellAssistant, currentValue, props.spellCheck]);

  const handleApplySpellcheck = () => {
    if (!spellResult || !props.onChange) return;
    const syntheticEvent = {
      target: { value: spellResult },
      currentTarget: { value: spellResult }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    props.onChange(syntheticEvent);
  };

  return (
    <div className="w-full">
      <textarea
        ref={ref}
        data-slot="textarea"
        spellCheck={props.spellCheck ?? true}
        lang={props.lang ?? "pt-BR"}
        autoCorrect={props.autoCorrect ?? "on"}
        autoCapitalize={props.autoCapitalize ?? "sentences"}
        autoComplete={props.autoComplete ?? "on"}
        data-gramm="true"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {spellResult && (
        <div className="mt-1.5 flex items-center justify-between rounded-xl border border-lime-300 bg-[#f7faf2] px-3 py-1.5 text-xs text-[#284b42] shadow-xs animate-in fade-in duration-200">
          <span className="truncate mr-2">
            ✨ Correção sugerida: <strong className="text-[#173a34] font-medium">{spellResult}</strong>
          </span>
          <button
            type="button"
            onClick={handleApplySpellcheck}
            className="shrink-0 rounded-lg bg-[#173a34] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#28564d] transition-colors"
          >
            Aplicar correção
          </button>
        </div>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
