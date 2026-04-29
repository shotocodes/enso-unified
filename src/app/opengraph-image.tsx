import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// nodejs runtime so we can readFile the brush PNG from public/ at request time.
// Edge runtime can't access the local filesystem, and depending on absolute
// URLs at request time gets fragile across preview / prod / local dev.
export const runtime = "nodejs";
export const alt = "ENSO — Design your days. Own your time.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const brushBuffer = await readFile(join(process.cwd(), "public", "enso-brush.png"));
  const brushDataUrl = `data:image/png;base64,${brushBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at center, #0f1f17 0%, #0a0a0a 70%)",
          position: "relative",
        }}
      >
        {/* Decorative dashed orbital ring behind the mark */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 460,
            height: 460,
            transform: "translate(-50%, -50%)",
            borderRadius: 9999,
            border: "1px dashed rgba(16, 185, 129, 0.18)",
          }}
        />

        {/* The brand mark */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brushDataUrl}
          width={320}
          height={320}
          alt=""
          style={{
            marginBottom: 36,
            filter: "drop-shadow(0 0 32px rgba(16, 185, 129, 0.35))",
          }}
        />

        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            color: "#ededed",
            letterSpacing: "0.12em",
            marginBottom: 14,
          }}
        >
          ENSO
        </div>

        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.02em",
          }}
        >
          Design your days. Own your time.
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 36,
          }}
        >
          {["TIMER", "TASK", "FOCUS", "JOURNAL"].map((name) => (
            <div
              key={name}
              style={{
                fontSize: 14,
                color: "#10b981",
                letterSpacing: "0.16em",
                padding: "8px 18px",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: 9999,
              }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Subtle bottom watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            fontSize: 14,
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.12em",
          }}
        >
          ensolife.app
        </div>
      </div>
    ),
    { ...size }
  );
}
