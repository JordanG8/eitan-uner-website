/**
 * The camera mark, rebuilt as vector.
 *
 * The original was a small raster PNG baked into the site123 template; lifting it
 * from a screenshot would have shipped a blurry ~70px bitmap. This traces the same
 * silhouette so it stays sharp at any size and weighs ~1KB.
 */
export function CameraMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 420"
      role="img"
      aria-label="פוטודוקותרפיה איתן אונר"
      className={className}
      fill="currentColor"
    >
      {/* viewfinder hump */}
      <path d="M258 112 L266 52 Q269 38 284 38 L356 38 Q371 38 374 52 L382 112 Z" />
      {/* shoulder tabs */}
      <rect x="78" y="84" width="112" height="32" rx="9" />
      <rect x="468" y="84" width="96" height="32" rx="9" />
      {/* body */}
      <rect x="34" y="108" width="572" height="296" rx="30" />

      {/* cut-outs: everything below is knocked out in white */}
      <g fill="#fff">
        {/* slot in the viewfinder */}
        <rect x="278" y="66" width="86" height="15" rx="7" />
        {/* top-plate parting line, left and right of the lens */}
        <rect x="54" y="177" width="150" height="14" rx="4" />
        <rect x="462" y="177" width="126" height="14" rx="4" />
        {/* shutter dot */}
        <circle cx="162" cy="158" r="8" />
        {/* window, upper right */}
        <rect x="482" y="146" width="72" height="23" rx="11" />
        {/* lens: white gap */}
        <circle cx="320" cy="257" r="141" />
      </g>

      {/* lens: outer ring */}
      <circle cx="320" cy="257" r="133" />
      {/* lens: inner gap */}
      <circle cx="320" cy="257" r="113" fill="#fff" />
      {/* lens: glass */}
      <circle cx="320" cy="257" r="104" />
      {/* glass highlight */}
      <path
        d="M243 220 A 82 82 0 0 1 297 180"
        fill="none"
        stroke="#fff"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex flex-col items-center leading-none text-brand-600">
      <CameraMark className={compact ? "h-7 w-auto" : "h-9 w-auto"} />
      <span
        className={`mt-1 font-bold tracking-tight ${
          compact ? "text-[13px]" : "text-[15px]"
        }`}
      >
        פוטודוקותרפיה איתן אונר
      </span>
    </span>
  );
}
