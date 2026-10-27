import Link from 'next/link';
import Logo from '@/components/Logo';
import AnimatedCTAButton from './ui/AnimatedButton';

const PrivacyPage = () => {
    return (
        <div className="bg-brand-dark min-h-screen text-brand-light font-sans">
            <header className="bg-brand-surface border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-3">
                        <Logo className="h-8 w-auto text-white" />
                    </Link>
                    <Link href="/">
                        <AnimatedCTAButton className="text-white font-medium">Zurück zur Agentur</AnimatedCTAButton>
                    </Link>
                </div>
            </header>
            <main className="container mx-auto px-6 py-16 lg:py-24">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-8">Datenschutzerklärung</h1>

                    <div className="space-y-6 text-brand-gray">
                        <h2 className="text-2xl font-semibold text-white">1. Datenschutz auf einen Blick</h2>
                        <p>
                            Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Diese Datenschutzerklärung erläutert, welche Daten wir erheben, wofür wir sie nutzen und welche Rechte Sie diesbezüglich haben. Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website finden Sie im <Link href="/impressum" className="text-brand-magenta hover:underline">Impressum</Link>.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8">2. Ihre Rechte als Nutzer</h2>
                        <p>
                            Ihnen stehen im Rahmen der geltenden Datenschutzgesetze (DSGVO) verschiedene Rechte zu. Dazu gehören das Recht auf Auskunft über Ihre von uns verarbeiteten Daten, das Recht auf Berichtigung, Löschung oder Einschränkung der Verarbeitung. Für die Geltendmachung Ihrer Rechte kontaktieren Sie uns bitte über die im Impressum angegebenen Kontaktdaten.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8">3. Datenerfassung auf dieser Website</h2>
                        <p>
                            <strong>Cookies</strong><br />
                            Wir respektieren Ihre Privatsphäre. Daher verzichtet diese Website bewusst auf den Einsatz von Cookies, die für Marketing, Analyse oder das Tracking Ihres Surfverhaltens eingesetzt werden. Ein Cookie-Banner ist aus diesem Grund nicht erforderlich.
                        </p>
                        <p>
                            <strong>Server-Log-Dateien</strong><br />
                            Unser Hosting-Anbieter erhebt automatisch Daten, die Ihr Browser übermittelt (sog. Server-Log-Dateien), um die Sicherheit und Funktionsfähigkeit der Website zu gewährleisten. Dazu gehören typischerweise IP-Adresse, Browsertyp, Uhrzeit und die aufgerufene Seite. Diese Daten dienen ausschliesslich der technischen Bereitstellung und werden nicht mit anderen Datenquellen zusammengeführt. Rechtsgrundlage hierfür ist unser berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO) an einem sicheren und performanten Webauftritt.
                        </p>
                        <p>
                            <strong>Kontaktformular</strong><br />
                            Wenn Sie uns per Kontaktformular kontaktieren, speichern wir Ihre Angaben zur Bearbeitung Ihrer Anfrage und für eventuelle Anschlussfragen. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung erfolgt zur Erfüllung eines Vertrags oder zur Durchführung vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO) oder zur Wahrung unseres berechtigten Interesses an einer effektiven Kommunikation (Art. 6 Abs. 1 lit. f DSGVO).
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPage;