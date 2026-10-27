import Link from 'next/link';
import Logo from '@/components/Logo';
import AnimatedCTAButton from './ui/AnimatedButton';
import { siteConfig } from '@/config/site';

const Impressum = () => {
    return (
        <div className="bg-brand-dark min-h-screen text-brand-light font-sans">
            <header className="bg-brand-surface border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-3">
                        <Logo className="h-8 w-auto text-white" />
                    </Link>
                    <Link href="/">
                        <AnimatedCTAButton className=" text-white font-medium">Back to Agency</AnimatedCTAButton>
                    </Link>
                </div>
            </header>
            <main className="container mx-auto px-6 py-16 lg:py-24">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-8">Impressum</h1>

                    <div className="space-y-6 text-brand-gray">
                        <h2 className="text-2xl font-semibold text-white">Angaben gemäß § 5 TMG</h2>
                        <p>
                            {siteConfig.name}<br />
                            Inhaber: Max Mustermann<br />
                            Musterstraße 1<br />
                            12345 Musterstadt
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8">Kontakt</h2>
                        <p>
                            Telefon: {siteConfig.contact.phone} <br />
                            E-Mail: {siteConfig.contact.email}
                        </p>

                        {/* <h2 className="text-2xl font-semibold text-white mt-8">Umsatzsteuer-ID</h2>
                        <p>
                            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                            [Hier Ihre Umsatzsteuer-ID eintragen, falls vorhanden]
                        </p> */}

                        <h2 className="text-2xl font-semibold text-white mt-8">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                        <p>
                            Max Mustermann<br />
                            Musterstraße 1<br />
                            12345 Musterstadt
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8">Haftungsausschluss (Disclaimer)</h2>
                        <p>
                            **Haftung für Inhalte**<br />
                            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                        </p>
                        <p>
                            **Haftung für Links**<br />
                            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
                        </p>
                        <p>
                            **Urheberrecht**<br />
                            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Impressum;
