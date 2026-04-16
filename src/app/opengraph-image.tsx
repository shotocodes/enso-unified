import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ENSO — Design your days. Own your time.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <svg
          width={140}
          height={140}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            r="32"
            stroke="#10b981"
            strokeWidth="5"
            fill="none"
            opacity="0.9"
          />
        </svg>

        <div
          style={{
            fontSize: 60,
            fontWeight: "bold",
            color: "#ededed",
            letterSpacing: "0.08em",
          }}
        >
          ENSO
        </div>

        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Design your days. Own your time.
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 12,
          }}
        >
          {["TIMER", "TASK", "FOCUS", "JOURNAL"].map((name) => (
            <div
              key={name}
              style={{
                fontSize: 13,
                color: "#10b981",
                letterSpacing: "0.08em",
                padding: "6px 16px",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: 8,
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
