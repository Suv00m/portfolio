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
          justifyContent: "center",
          gap: "28px",
          padding: "56px 80px",
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

        <div
          style={{
            color: "#555",
            fontSize: "22px",
            lineHeight: 1.6,
            maxWidth: "900px",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          <span>Ex-CTO at&nbsp;</span>
          <span style={{ color: "#dddde0" }}>behooked.co</span>
          <span>. Built the&nbsp;</span>
          <span style={{ color: "#dddde0" }}>multimodal transcoding pipeline</span>
          <span style={{ display: "flex" }}>
            <span>&nbsp;(</span>
            <span style={{ color: "#dddde0" }}>100k+ media files</span>
            <span>)</span>
          </span>
          <span>&nbsp;and an&nbsp;</span>
          <span style={{ color: "#dddde0" }}>AI agent orchestrator</span>
          <span>&nbsp;that generated&nbsp;</span>
          <span style={{ color: "#dddde0" }}>1.5k+ videos</span>
          <span>, out-competing&nbsp;</span>
          <span style={{ color: "#dddde0" }}>HeyGen</span>
          <span>&nbsp;and&nbsp;</span>
          <span style={{ color: "#dddde0" }}>Caption</span>
          <span>.&nbsp;</span>
          <span style={{ color: "#dddde0" }}>2x Kaggle Expert</span>
          <span>.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: "#666", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 500 }}>ACTIVITY</div>
          <div style={{ display: "flex", gap: "4px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingTop: "14px", width: "24px" }}>
              <div style={{ height: "10px", fontSize: "9px", color: "transparent", display: "flex", alignItems: "center", justifyContent: "flex-end" }} />
              <div style={{ height: "10px", fontSize: "9px", color: "#555", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>Mon</div>
              <div style={{ height: "10px", fontSize: "9px", color: "transparent", display: "flex", alignItems: "center", justifyContent: "flex-end" }} />
              <div style={{ height: "10px", fontSize: "9px", color: "#555", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>Wed</div>
              <div style={{ height: "10px", fontSize: "9px", color: "transparent", display: "flex", alignItems: "center", justifyContent: "flex-end" }} />
              <div style={{ height: "10px", fontSize: "9px", color: "#555", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>Fri</div>
              <div style={{ height: "10px", fontSize: "9px", color: "transparent", display: "flex", alignItems: "center", justifyContent: "flex-end" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ display: "flex", gap: "0px", height: "12px", width: "624px" }}>
                {["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"].map((m) => (
                  <div key={m} style={{ width: "52px", fontSize: "9px", color: "#555" }}>{m}</div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "2px" }}>
                {Array.from({ length: 52 }).map((_, wi) => (
                  <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {Array.from({ length: 7 }).map((__, di) => {
                      const seed = (wi * 7 + di * 13 + wi * di * 3) % 100;
                      let bg = "#141414";
                      if (seed > 85) bg = "#4ade80";
                      else if (seed > 72) bg = "#2d7a4a";
                      else if (seed > 58) bg = "#1a5c36";
                      else if (seed > 38) bg = "#143326";
                      return <div key={di} style={{ width: "10px", height: "10px", borderRadius: "2px", background: bg }} />;
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ color: "#444", fontSize: "16px", marginTop: "8px" }}>shuvam.in</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
