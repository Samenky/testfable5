export default function ScrollIndicator() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col items-center gap-3 text-text-secondary"
    >
      <span className="text-[11px] uppercase tracking-[0.2em]">Scroll</span>
      <span className="relative block h-12 w-px overflow-hidden bg-border-subtle">
        <span
          className="absolute left-0 top-0 h-1/3 w-full bg-text-primary-dark/60"
          style={{ animation: "scroll-line 1.8s ease-in-out infinite" }}
        />
      </span>
    </div>
  );
}
