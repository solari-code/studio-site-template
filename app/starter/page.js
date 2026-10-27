import StarterPackagePage from "@/components/starter-package/StarterPackagePage";
import ScrollFadeProvider from "@/components/ui/ScrollFadeProvider";
import { siteConfig } from "@/config/site";

export const metadata = {
    title: `Starter Package — A Professional Landing Page in One Week | ${siteConfig.name}`,
    description: "A clean, fast landing page, designed, built and online in about a week. Fixed price of €499, with domain and hosting included for the first year.",
    alternates: {
        canonical: "/starter",
    },
    openGraph: {
        title: "Starter Package — A Professional Landing Page in One Week",
        description: "A clean, fast landing page, designed, built and online in about a week. Fixed price of €499, with domain and hosting included for the first year.",
        url: `${siteConfig.url}/starter`,
        siteName: siteConfig.name,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Starter Package — A Professional Landing Page in One Week",
        description: "A clean, fast landing page, designed, built and online in about a week. Fixed price of €499, with domain and hosting included for the first year.",
    },
}

export default function Page() {
    return (
        <ScrollFadeProvider>
            <StarterPackagePage />
        </ScrollFadeProvider>
    )
}