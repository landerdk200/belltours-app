# De app van Bell Tours (Android en iPhone)

De chauffeurs-app als echte app op de gsm, zonder Play Store of App Store. Het verschil met de chauffeurs-app in de browser:
**grensovergangen worden ook doorgegeven als de app in de achtergrond staat of de gsm vergrendeld is** (bv. terwijl de
chauffeur Google Maps of Apple Plans gebruikt). Dat gebeurt enkel tijdens een dienst. Al de rest is dezelfde chauffeurs-app van
je server: wat je op de server bijwerkt, staat meteen ook in de app.

Hoe het werkt:

1. **GitHub bouwt de app** uit deze map. Jij drukt op een knop en krijgt na 10 à 20 minuten een bestand: een `.apk` voor
   Android of een `.ipa` voor de iPhone.
2. Dat bestand laad je op in de **backoffice › Apps & QR-codes › Bell Tours-app**.
3. De chauffeurs openen **`/chauffeurs/app`** op hun gsm (de link of de QR-code staat in de backoffice) en installeren de app.

| | Android | iPhone |
|---|---|---|
| Wat kost het | niets | niets extra (je Apple Developer Program) |
| Installeren | de APK downloaden en openen | eerst de iPhone aanmelden; daarna installeren |
| Hoeveel toestellen | onbeperkt | max. 100 iPhones per jaar |
| Hoelang geldig | onbeperkt | 1 jaar, daarna opnieuw bouwen (deel E) |

> **Eerst testen.** Bouw de app eerst voor je eigen gsm. Test een dienst met een rit over de grens, of over een korte
> afstand: open de app, start een dienst, vergrendel de gsm en rij een eind. Pas daarna verdeel je de app onder de chauffeurs.

Wat je nodig hebt:

- deze map (`belltours-app`);
- de map **`belltours-app-GEHEIM`** (de sleutels; apart verstuurd). **Bewaar die goed en zet ze nooit op GitHub.** Zonder de
  sleutel voor Android kan een nieuwe versie niet meer over de oude geïnstalleerd worden: de chauffeurs moeten de app dan eerst
  verwijderen;
- een gratis account op GitHub;
- voor de iPhone: je Apple Developer-account.

---

## A. GitHub (één keer)

1. Maak een account op <https://github.com> (gratis), als je er nog geen hebt.
2. Rechtsboven **+ › New repository**. Naam: `belltours-app`. Kies **Private**. Klik **Create repository**.
3. Zet deze map erin. Het makkelijkst met **GitHub Desktop** (<https://desktop.github.com>, gratis):
   - GitHub Desktop openen en aanmelden.
   - **File › Clone repository** › `belltours-app` › kies een plaats op je computer.
   - Kopieer **de inhoud** van deze map (`belltours-app`) in die nieuwe map. Ook de verborgen map **`.github`** moet mee
     (Mac: in de Finder `Cmd + Shift + .` om verborgen mappen te zien; Windows: Beeld › Verborgen items).
   - In GitHub Desktop: onderaan links een korte tekst (bv. `eerste versie`), **Commit to main**, daarna **Push origin**.

   Zonder GitHub Desktop: op de pagina van de repository **uploading an existing file**, sleep alles uit deze map erin (ook de
   map `.github`) en klik **Commit changes**. Kijk daarna na of `.github/workflows/android.yml` en `ios.yml` er staan.
4. Kijk het adres van je server na in **`instellingen.json`** (op GitHub: klik erop › het potlood):

   ```json
   {"server":"https://81.247.216.213","versie":"1.0.0"}
   ```

   - `server`: het adres van je server, met **https**, zoals bij **Backoffice › Instellingen › Adres van de server**.
     Verander je later van adres (bv. naar `https://planning.belltours.be`), dan bouw je de app opnieuw.
   - `versie`: de versie die de chauffeurs zien. Bij een nieuwe versie maak je er bv. `1.0.1` van (verplicht is dat niet:
     elke build krijgt toch een hoger nummer).

GitHub rekent de minuten van de builds af op de gratis minuten van je account. Een build voor de iPhone telt zwaarder (een Mac),
maar enkele builds per maand blijven ruim binnen het gratis deel.

## B. De Android-app

**De geheimen (één keer).** Op GitHub, in de repository: **Settings › Secrets and variables › Actions › New repository secret**.
Maak er twee. De inhoud staat in de map `belltours-app-GEHEIM`: open het bestand met Kladblok of TextEdit, kopieer alles en plak het.

| Name | Secret (de inhoud van) |
|---|---|
| `ANDROID_KEYSTORE_B64` | `ANDROID_KEYSTORE_B64.txt` |
| `ANDROID_KEYSTORE_PASSWORD` | `ANDROID_KEYSTORE_PASSWORD.txt` |

**Bouwen.**

1. **Actions** (bovenaan) › links **Android-app bouwen** › rechts **Run workflow** › **Run workflow**.
2. Na een tiental minuten staat er een groen vinkje. Klik op de run; onderaan bij **Artifacts** staat
   `BellTours-Android-1.0.0`. Download het en pak de zip uit: daarin zit `BellTours-1.0.0.apk`.
3. **Backoffice › Apps & QR-codes › Bell Tours-app › Android (APK) › Opladen** › kies de `.apk`.

Een rood kruis? Klik op de run en op de stap met het kruis: de fout staat er in het Nederlands als het om een ontbrekend geheim gaat.

**Installeren op de gsm.** De chauffeur opent de link of scant de QR-code (in Chrome) en volgt de stappen. Waarschuwt de gsm
dat apps van buiten de Play Store niet zomaar mogen: de browser toelaten om apps te installeren. Waarschuwt Play Protect: **Meer
details › Toch installeren**. Bij het eerste gebruik vraagt de app de locatie (**Tijdens gebruik van de app**) en de meldingen
(de vaste melding *Bell Tours – in dienst* zolang de locatie loopt; door die melding mag de app de locatie ook met de gsm
vergrendeld gebruiken). Staat de batterijbesparing van de gsm heel streng (vooral Samsung, Xiaomi, Huawei): **Instellingen ›
Apps › Bell Tours › Batterij › Onbeperkt**.

> Google kondigde aan dat Android vanaf 2027 ook voor apps buiten de Play Store een geregistreerde ontwikkelaar vraagt
> (eenmalig 25 dollar). Is dat zover, dan registreer je `be.belltours.chauffeurs` met de sleutel uit de map GEHEIM; de app
> en de werkwijze blijven dezelfde.

## C. De iPhone-app (één keer instellen)

Alles bij Apple gebeurt op <https://developer.apple.com/account> › **Certificates, IDs & Profiles**.

**1. Het certificaat.**
**Certificates › +** › **Apple Distribution** › Continue › **Choose File**: `apple-distribution.csr` uit de map
`belltours-app-GEHEIM` › Continue › **Download**. Je krijgt `distribution.cer`. Zet dat bestand in de map **`apple/`** van de
repository (GitHub Desktop: in de map `apple` zetten, Commit, Push; of op GitHub: map `apple` › Add file › Upload files).
Het `.cer`-bestand is niet geheim.

**2. De app.**
**Identifiers › +** › **App IDs** › Continue › **App** › Continue. Description: `Bell Tours`. Bundle ID: **Explicit**,
`be.belltours.chauffeurs`. Geen extra mogelijkheden aanvinken › Continue › Register.

**3. De iPhones.**
Elke chauffeur met een iPhone meldt eerst zijn iPhone aan: hij opent `/chauffeurs/app` in **Safari** op zijn iPhone en volgt
**Stap 1** (het profiel downloaden, Instellingen › Profiel gedownload › Installeer). Daarna staat zijn iPhone in de backoffice
bij **Aangemelde iPhones**. Doe dat eerst ook met je eigen iPhone.
Dan in de backoffice **Lijst voor Apple downloaden** (`bell-tours-iphones.txt`), en bij Apple: **Devices › +** ›
**Register Multiple Devices** › kies dat bestand › Continue.

**4. Het profiel.**
**Profiles › +** › onder Distribution **Ad Hoc** › Continue › App ID `be.belltours.chauffeurs` › Continue › het certificaat
van stap 1 › Continue › **Select All** (de iPhones) › Continue › Provisioning Profile Name: `Bell Tours Ad Hoc` › Generate ›
**Download**. Zet het `.mobileprovision`-bestand in de map **`apple/`** van de repository (er mag er maar één staan).

**5. Het geheim.**
Zoals bij Android: **Settings › Secrets and variables › Actions › New repository secret**.

| Name | Secret (de inhoud van) |
|---|---|
| `APPLE_CERT_KEY_B64` | `APPLE_CERT_KEY_B64.txt` |

**6. Bouwen en opladen.**
**Actions › iPhone-app bouwen › Run workflow**. Na 15 à 20 minuten: onderaan bij **Artifacts** `BellTours-iPhone-1.0.0`
downloaden en uitpakken (`BellTours-1.0.0.ipa`). **Backoffice › Apps & QR-codes › Bell Tours-app › iPhone (IPA) › Opladen.**
De backoffice leest het profiel uit de app: hoeveel iPhones erin zitten en tot wanneer het geldt. Bij elke aangemelde iPhone
staat dan **In de app: Ja**.

**Installeren op de iPhone.** De chauffeur opent `/chauffeurs/app` in Safari, **Stap 2 › iPhone-app installeren** ›
Installeer. Dat werkt enkel via **https** met een geldig certificaat (zoals je server nu heeft). Bij het eerste gebruik vraagt
de app de locatie: **Bij gebruik van app**; later vraagt de iPhone één keer of de app de locatie ook **Altijd** mag gebruiken:
kies **Wijzig in Altijd toestaan**.

## D. Er komt een iPhone bij

1. De chauffeur meldt zijn iPhone aan op `/chauffeurs/app` (Stap 1). In de backoffice staat hij bij **Aangemelde iPhones** met
   **In de app: Nog niet**.
2. Bij Apple: **Devices › +**, naam en **Device ID (UDID)** overnemen uit de backoffice (het nummer onder het model) ›
   Continue › Register. (Meerdere tegelijk: **Lijst voor Apple downloaden** en Register Multiple Devices.)
3. **Profiles** › `Bell Tours Ad Hoc` › **Edit** › de nieuwe iPhone aanvinken › Save › **Download**.
4. Vervang het `.mobileprovision`-bestand in de map `apple/` van de repository door het nieuwe.
5. **Actions › iPhone-app bouwen › Run workflow**, en de nieuwe `.ipa` opladen in de backoffice.
6. De nieuwe chauffeur installeert de app. Wie ze al had, hoeft niets te doen.

Een iPhone die niet meer gebruikt wordt, kan je bij Apple pas uitzetten bij de jaarlijkse vernieuwing van je lidmaatschap.
Dan heb je weer plaats voor 100 iPhones.

## E. Elk jaar (de iPhone-app)

Het Ad Hoc-profiel en het certificaat gelden **één jaar**. Daarna start de iPhone-app niet meer. De backoffice waarschuwt
30 dagen op voorhand (bij **iPhone (IPA)**).

1. Is het certificaat verlopen: **Certificates › +** › Apple Distribution › **opnieuw `apple-distribution.csr`** › Download, en
   vervang het `.cer`-bestand in `apple/`. (Dezelfde sleutel: het geheim `APPLE_CERT_KEY_B64` blijft.)
2. **Profiles** › `Bell Tours Ad Hoc` › **Edit** › (het nieuwe certificaat kiezen) › Save › **Download**, en vervang het
   `.mobileprovision`-bestand in `apple/`.
3. **iPhone-app bouwen**, de nieuwe `.ipa` opladen in de backoffice.
4. De chauffeurs installeren de app opnieuw via `/chauffeurs/app` (over de oude; hun gegevens blijven).

## Goed om te weten

- **Meldingen.** In de app komen er (nog) geen meldingen als de planning wijzigt: webmeldingen werken niet in een app. Wie
  die meldingen wil, gebruikt de chauffeurs-app ook in Chrome of Safari (iPhone: op het beginscherm) en zet daar de
  meldingen aan. De app zegt dat ook bij Instellingen.
- **Zonder bereik bij het openen** toont de app een pagina *Geen verbinding* en probeert ze vanzelf opnieuw zodra er bereik is.
  Grensovergangen zonder bereik onthoudt de app en verstuurt ze later.
- **Een Excel of pdf downloaden** (bv. Mijn planning in Excel) lukt in de app misschien niet op elk toestel. Dan in de browser.
- **De batterij.** De locatie loopt enkel tijdens een dienst en vraagt niet meer dan een navigatie-app. Na het uitklokken stopt ze.
- **Privacy.** De app stuurt enkel iets naar het kantoor bij een grensovergang (het uur, de landen, de km). De route wordt niet
  bewaard.
- **Een nieuwe versie van de app** is zelden nodig: de inhoud komt van je server. Opnieuw bouwen enkel bij een nieuw adres van
  de server, een nieuwe iPhone of de jaarlijkse vernieuwing.

## Wat er in deze map zit

| | |
|---|---|
| `instellingen.json` | het adres van de server en de versie |
| `.github/workflows/android.yml`, `ios.yml` | de builds op GitHub |
| `scripts/` | stellen de app in (adres, versie, ondertekenen, de teksten voor de locatie) |
| `www/` | de pagina zonder verbinding (NL, FR, EN) |
| `assets/`, `resources/` | het icoon, het opstartscherm en het icoontje van de melding |
| `apple/` | het certificaat (`.cer`) en het profiel (`.mobileprovision`) van Apple |

Technisch: Capacitor 7 met de plug-in `@capacitor-community/background-geolocation`. De app opent de chauffeurs-app van de
server (`/chauffeurs/exec`); daar gebruikt de chauffeurs-app de locatie van de app in plaats van die van de browser.
