import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Prerender the image once per language.
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Starter.OgImage" });

    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    background: "#0D1117",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "system-ui, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Glow — centered top, matches hero */}
                <div
                    style={{
                        position: "absolute",
                        top: "-60px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "900px",
                        height: "500px",
                        background: "radial-gradient(ellipse, rgba(6,182,212,0.18) 0%, transparent 65%)",
                        pointerEvents: "none",
                    }}
                />

                {/* Badge */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 20px",
                        borderRadius: "999px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#22d3ee",
                        fontSize: "13px",
                        fontWeight: "700",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: "32px",
                    }}
                >
                    {t("badge")}
                </div>

                {/* Heading */}
                <div
                    style={{
                        fontSize: "76px",
                        fontWeight: "800",
                        color: "#ffffff",
                        lineHeight: 1.05,
                        textAlign: "center",
                        marginBottom: "12px",
                        letterSpacing: "-0.02em",
                        display: "flex",
                    }}
                >
                    {t("line1")}
                </div>
                <div
                    style={{
                        fontSize: "76px",
                        fontWeight: "800",
                        lineHeight: 1.05,
                        textAlign: "center",
                        letterSpacing: "-0.02em",
                        background: "linear-gradient(90deg, #d946ef, #22d3ee)",
                        backgroundClip: "text",
                        color: "transparent",
                        display: "flex",
                    }}
                >
                    {t("line2")}
                </div>
            </div>
        ),
        { ...size }
    );
}
