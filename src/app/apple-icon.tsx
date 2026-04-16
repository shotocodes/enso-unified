import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={120} height={120} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="32" stroke="#10b981" strokeWidth="5" fill="none" opacity="0.9" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
