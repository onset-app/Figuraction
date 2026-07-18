import { ImageResponse } from "next/og"

/**
 * Square PWA icon rendered at build time (see /icon-192 and /icon-512 routes).
 * Full-bleed dark background with the wordmark centered well inside the 80%
 * safe zone, so the same image works for both `any` and `maskable` purposes.
 */
export function pwaIconResponse(size: number): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "sans-serif",
        fontSize: size * 0.34,
        fontWeight: 700,
        letterSpacing: size * -0.01,
      }}
    >
      ON
    </div>,
    { width: size, height: size }
  )
}
