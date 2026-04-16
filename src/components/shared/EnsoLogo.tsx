interface Props {
  size?: number;
  className?: string;
  animate?: boolean;
  withDot?: boolean;
}

/** Pure enso ring (used as the global brand mark). */
export default function EnsoLogo({ size = 48, className = "", animate = false, withDot = false }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden>
      <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.9" />
      {withDot && (
        <circle cx="50" cy="18" r="5" fill="currentColor">
          {animate && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="8s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      )}
    </svg>
  );
}
