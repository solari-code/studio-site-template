import LegalPage from '@/components/LegalPage';

// Texts live in messages/<locale>.json under "Privacy".
// The Umami paragraph is only rendered when analytics is enabled (same condition as the script in the layout).
const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID);

const PrivacyPage = () => <LegalPage namespace="Privacy" extraSections={analyticsEnabled ? ['umami'] : []} />;

export default PrivacyPage;
