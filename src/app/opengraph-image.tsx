import { ImageResponse } from "next/og"

/**
 * Default Open Graph image (1200x630), generated at build time. Applies to
 * every route that doesn't define a closer opengraph-image of its own.
 */
export const alt = "ONSET — La plateforme de casting figurants en Belgique"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        backgroundColor: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: -4 }}>ONSET</div>
      <div style={{ fontSize: 36, color: "#a3a3a3", textAlign: "center", maxWidth: 900 }}>
        Le casting de figurants, enfin simple.
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 24,
          color: "#fafafa",
          border: "2px solid #404040",
          borderRadius: 9999,
          padding: "10px 28px",
        }}
      >
        Productions & figurants — Belgique
      </div>
    </div>,
    size
  )
}
