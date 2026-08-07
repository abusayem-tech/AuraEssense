import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const runtime = "edge";
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b0c",
          color: "#f5f1e9",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 12,
            color: "#c8a96a",
            textTransform: "uppercase",
          }}
        >
          The Last Note
        </div>
        <div style={{ fontSize: 110, letterSpacing: 8, marginTop: 16 }}>
          {SITE.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 32, color: "#c9c4b8", marginTop: 8 }}>
          {SITE.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
