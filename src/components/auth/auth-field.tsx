"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AuthFieldProps {
  id: string;
  label: string;
  type?: React.ComponentProps<"input">["type"];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
  inputClassName?: string;
}

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
  disabled,
  inputClassName,
}: AuthFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={cn("h-10 rounded-xl bg-[#f8fafc]", inputClassName)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface AuthFormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthFormActions({ children, className }: AuthFormActionsProps) {
  return <div className={cn("mt-6 space-y-3", className)}>{children}</div>;
}
