import Header from "@/components/Header";
import StarterPackageHero from "@/components/starter-package/StarterPackageHero";
import StarterPackagePricing from "@/components/starter-package/StarterPackagePricing";
import StarterPackageRoadmap from "@/components/starter-package/StarterPackageRoadmap";
import StarterPackageWhoIsThisFor from "@/components/starter-package/StarterPackageWhoIsThisFor";
import StarterPackageFaq from "@/components/starter-package/StarterPackageFaq";
import StarterPackageContact from "@/components/starter-package/StarterPackageContact";
import Footer from "@/components/Footer";

export default function StarterPackagePage() {

    return (
        <>
            <Header />
            <main>
                <StarterPackageHero />
                <StarterPackageWhoIsThisFor />
                <StarterPackagePricing />
                <StarterPackageRoadmap />
                <StarterPackageFaq />
                <StarterPackageContact />
            </main>
            <Footer />
        </>
    )
}