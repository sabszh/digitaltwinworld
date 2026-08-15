import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function JourneyCard({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`journey-card ${className}`} {...props} />;
}

export function JourneyBadge({ icon, children, tone = "default", className = "" }: { icon?: ReactNode; children: ReactNode; tone?: "default" | "success"; className?: string }) {
  return <span className={`journey-badge journey-badge--${tone} ${className}`}>{icon}{children}</span>;
}

export function JourneyButton({ variant = "primary", direction, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "tertiary"; direction?: "back" | "forward" }) {
  return (
    <button className={`journey-button journey-button--${variant} ${className}`} {...props}>
      {direction === "back" && <ArrowLeft size={17} aria-hidden="true" />}
      <span>{children}</span>
      {direction === "forward" && <ArrowRight size={17} aria-hidden="true" />}
    </button>
  );
}
