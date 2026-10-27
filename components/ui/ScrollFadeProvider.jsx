"use client"
import useScrollFadeIn from "@/hooks/useFadeOnScroll"

export default function ScrollFadeProvider({ children }) {
    useScrollFadeIn()
    return <>{children}</>
}
