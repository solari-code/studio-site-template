`message-diff` vergleicht die Übersetzungsdateien eines Projekts mit der Standardsprache und zeigt, was fehlt, was übrig ist und wo die Typen nicht passen. Es gibt nichts zu konfigurieren: einfach auf einen Ordner mit JSON-Dateien zeigen, den Rest findet es selbst heraus.

## Warum ich es gebaut habe

Übersetzungen driften auseinander. Ein neues Feature bringt zehn Schlüssel in `en.json`, und drei Wochen später fällt auf, dass die deutsche Seite in einer Ecke englischen Text zeigt. Die meisten i18n-Bibliotheken fallen still auf die Standardsprache zurück – gut für Besucher, schlecht fürs Bemerken.

Ich wollte eine Prüfung, die:

- in einer Sekunde läuft, lokal und in der CI,
- keine Konfigurationsdatei und kein Konto braucht,
- etwas ausgibt, mit dem Übersetzer arbeiten können, statt eines Stacktraces.

## Installation

```bash
npm install --save-dev message-diff
```

## Verwendung

Aufrufen mit dem Ordner, in dem die Sprachdateien liegen. Die alphabetisch erste Datei ist die Referenz, außer `--base` sagt etwas anderes.

```bash
npx message-diff messages/ --base en
```

```text
Checking messages against "en.json" (locales: en, de, fr)

de.json: 2 missing, 0 extra, 0 type mismatches
  ⚠ de: missing "Checkout.summary.shipping"
  ⚠ de: missing "Checkout.summary.total"
fr.json: 0 missing, 1 extra, 1 type mismatch
  ⚠ fr: extra "Legacy.banner"
  ⚠ fr: "Faq.items" is string, expected object
```

### Optionen

| Option | Standard | Was sie tut |
|---|---|---|
| `--base <locale>` | erste Datei | die Sprache, mit der die anderen verglichen werden |
| `--strict` | aus | beendet mit Code 1, wenn etwas fehlt – etwa um einen CI-Job scheitern zu lassen |
| `--json` | aus | gibt das Ergebnis als JSON aus, für andere Tools |
| `--ignore <muster>` | – | überspringt Schlüssel, die auf ein Muster passen, z. B. `Legacy.*` |

## Aus dem Code heraus

Das CLI ist eine dünne Hülle um eine einzige Funktion, eigene Auswertungen sind also schnell gebaut:

```js
import { diffMessages } from 'message-diff';

const report = await diffMessages('messages/', { base: 'en' });

for (const { locale, missing } of report) {
    if (missing.length > 0) {
        console.log(`${locale}: ${missing.length} texts to translate`);
    }
}
```

> Listen werden nach Position verglichen. Wer die Einträge einer Liste umsortiert, sieht geänderte Schlüssel – bei FAQs und Feature-Listen ist das meistens genau richtig.

## Was es mit dieser Website zu tun hat

Diese Website führt dieselbe Prüfung in `npm run check` aus, und ihre Laborseiten sind in Markdown geschrieben, eine Datei pro Sprache, in einem Ordner neben den Übersetzungen. Die Komponente [Scroll Gradient](/lab/scroll-gradient) stammt aus demselben Projekt.

## Roadmap

- [x] JSON-Dateien mit verschachtelten Schlüsseln und Listen
- [x] Typabweichungen (Text vs. Liste vs. Gruppe)
- [ ] YAML-Dateien
- [ ] Eine Option `--fix`, die fehlende Schlüssel übernimmt und zum Übersetzen markiert

Einen Fehler gefunden oder fehlt etwas? Gern ein Issue auf [GitHub](https://github.com/) anlegen.
