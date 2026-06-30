import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Shuvam Mandal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#080607",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              color: "#dddde0",
              fontSize: "64px",
              fontWeight: 600,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
            }}
          >
            Shuvam Mandal
          </div>
          <div style={{ color: "#666", fontSize: "26px", fontWeight: 400 }}>
            Engineer. Builder.
          </div>
        </div>

        <div style={{ color: "#555", fontSize: "22px", lineHeight: 1.6, maxWidth: "900px" }}>
          Ex-CTO at behooked.co. Built the multimodal transcoding pipeline (100k+ media files)
          and an AI agent orchestrator that generated 1.5k+ videos, out-competing HeyGen and Caption.
          2x Kaggle Expert.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ color: "#444", fontSize: "18px" }}>shuvam.in</div>
          <div
            style={{
              color: "#3a8c5c",
              fontSize: "15px",
              border: "1px solid #2a5c3c",
              borderRadius: "6px",
              padding: "6px 14px",
            }}
          >
            dotresume.org · srch · yuj-v1
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
