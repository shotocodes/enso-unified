import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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
          background: "#0a0a0a",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brushDataUrl}
          width={220}
          height={220}
          alt=""
          style={{ marginBottom: 32 }}
        />

        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ededed",
            letterSpacing: "0.14em",
            marginBottom: 12,
          }}
        >
          ENSO
        </div>

        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.02em",
          }}
        >
          Design your days. Own your time.
        </div>
      </div>
    ),
    { ...size }
  );
}
