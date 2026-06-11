export default function ScrollIndicator() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col items-center gap-3 text-slate"
    >
      <span className="text-[11px] uppercase tracking-[0.2em]">Scroll</span>
      <span className="relative block h-8 w-px overflow-hidden bg-border">
        <span
          className="absolute left-0 top-0 h-1/3 w-full bg-light/60"
          style={{ animation: "scroll-line 1.8s ease-in-out infinite" }}
        />
      </span>
    </div>
  );
}
