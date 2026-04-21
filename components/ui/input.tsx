import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#94a3b8",
              letterSpacing: "0.01em",
            }}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn("talrat-input", error && "talrat-input-error", className)}
          {...props}
        />
        {hint && !error && (
          <span style={{ fontSize: 12, color: "#475569" }}>{hint}</span>
        )}
        {error && (
          <span style={{ fontSize: 12, color: "#f87171" }}>{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };