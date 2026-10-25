// Bell Tours-app: wat Capacitor zelf niet instelt, na "npx cap add android|ios" (de mappen android/ en ios/ maakt de build telkens opnieuw).
//   node scripts/patch-native.mjs android   versie, ondertekenen (de sleutel uit de geheimen van GitHub), de melding tijdens de dienst
//   node scripts/patch-native.mjs ios       versie, de teksten voor de locatie, locatie in de achtergrond, ondertekenen (Ad Hoc)
// Voor iOS: APPLE_TEAM_ID en PROFILE_NAME (de naam van het Ad Hoc-profiel); de workflow leest ze uit het profiel.
import fs from 'node:fs';
import path from 'node:path';

must(fs.existsSync('build/info.json'), 'build/info.json ontbreekt: eerst "node scripts/configure.mjs"');
const info = JSON.parse(fs.readFileSync('build/info.json', 'utf8'));
const which = process.argv[2];
const read = (f) => fs.readFileSync(f, 'utf8');
const write = (f, s) => fs.writeFileSync(f, s);
function must(cond, msg) { if (!cond) { console.error('patch-native: ' + msg); process.exit(1); } }
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// De teksten die de gsm toont als hij om de locatie vraagt (de taal van de gsm kiest iOS niet zelf uit één tekst: daarom de drie talen).
const WHY = 'Grensovergangen tijdens je dienst doorgeven aan het kantoor; je route wordt niet bewaard. / ' +
  'Signaler les passages de frontière pendant votre service ; votre trajet n\'est pas enregistré. / ' +
  'Report border crossings during your shift; your route is not stored.';
const WHY_BG = 'Ook met de gsm vergrendeld, enkel tijdens je dienst. / Aussi téléphone verrouillé, uniquement pendant le service. / Also with the phone locked, only during your shift.';

if (which === 'android') {
  const g = 'android/app/build.gradle';
  must(fs.existsSync(g), g + ' ontbreekt: eerst "npx cap add android"');
  let s = read(g);
  must(/versionCode \d+/.test(s) && /versionName "[^"]*"/.test(s), 'versionCode/versionName niet gevonden in ' + g);
  s = s.replace(/versionCode \d+/, 'versionCode ' + info.build).replace(/versionName "[^"]*"/, 'versionName "' + info.version + '"');
  if (s.indexOf('btRelease') < 0) {
    s += '\n// Bell Tours: ondertekenen met de sleutel uit de geheimen van GitHub (scripts/patch-native.mjs)\n' +
      'android {\n' +
      '    signingConfigs {\n' +
      '        btRelease {\n' +
      '            storeFile = file(System.getenv("BT_KEYSTORE") ?: "release.keystore")\n' +
      '            storePassword = System.getenv("BT_KEYSTORE_PASSWORD")?.trim()\n' +
      '            keyAlias = System.getenv("BT_KEY_ALIAS") ?: "belltours"\n' +
      '            keyPassword = (System.getenv("BT_KEY_PASSWORD") ?: System.getenv("BT_KEYSTORE_PASSWORD"))?.trim()\n' +
      '        }\n' +
      '    }\n' +
      '    buildTypes { release { signingConfig = signingConfigs.btRelease } }\n' +
      '}\n';
  }
  write(g, s);
  // de vaste melding zolang de locatie loopt (Android toont ze verplicht): de naam van het kanaal en een eigen icoontje
  const st = 'android/app/src/main/res/values/strings.xml';
  let x = read(st);
  const add = (name, val) => { if (x.indexOf('name="' + name + '"') < 0) x = x.replace('</resources>', '    <string name="' + name + '">' + esc(val) + '</string>\n</resources>'); };
  add('capacitor_background_geolocation_notification_channel_name', 'Bell Tours – in dienst');
  add('capacitor_background_geolocation_notification_icon', 'drawable/ic_stat_bt');
  write(st, x);
  must(fs.existsSync('resources/android'), 'de map resources/android ontbreekt: laad de volledige map belltours-app op GitHub (LEESMIJ.md, deel A)');
  for (const d of fs.readdirSync('resources/android')) {
    const to = path.join('android/app/src/main/res', d);
    fs.mkdirSync(to, { recursive: true });
    fs.copyFileSync(path.join('resources/android', d, 'ic_stat_bt.png'), path.join(to, 'ic_stat_bt.png'));
  }
  console.log('Android: versie ' + info.version + ' (' + info.build + '), ondertekenen, melding tijdens de dienst');
} else if (which === 'ios') {
  const p = 'ios/App/App/Info.plist';
  must(fs.existsSync(p), p + ' ontbreekt: eerst "npx cap add ios"');
  let s = read(p);
  const keys = {
    NSLocationWhenInUseUsageDescription: '<string>' + esc(WHY) + '</string>',
    NSLocationAlwaysAndWhenInUseUsageDescription: '<string>' + esc(WHY + ' ' + WHY_BG) + '</string>',
    UIBackgroundModes: '<array>\n\t\t<string>location</string>\n\t</array>',
    ITSAppUsesNonExemptEncryption: '<false/>'
  };
  for (const k of Object.keys(keys)) {
    if (s.indexOf('<key>' + k + '</key>') >= 0) continue;
    s = s.replace(/<\/dict>\s*<\/plist>\s*$/, '\t<key>' + k + '</key>\n\t' + keys[k] + '\n</dict>\n</plist>\n');
  }
  must(s.indexOf('<key>UIBackgroundModes</key>') > 0, 'Info.plist kon niet aangepast worden');
  write(p, s);
  const pb = 'ios/App/App.xcodeproj/project.pbxproj';
  let x = read(pb);
  x = x.replace(/MARKETING_VERSION = [^;]+;/g, 'MARKETING_VERSION = ' + info.version + ';').replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, 'CURRENT_PROJECT_VERSION = ' + info.build + ';');
  const team = String(process.env.APPLE_TEAM_ID || '').trim(), prof = String(process.env.PROFILE_NAME || '').trim();
  if (team && prof) {
    // enkel het doel "App" (het enige met CODE_SIGN_STYLE): met de hand ondertekenen, met het Ad Hoc-profiel
    const n0 = (x.match(/CODE_SIGN_STYLE = Automatic;/g) || []).length;
    must(n0 >= 1, 'CODE_SIGN_STYLE niet gevonden in ' + pb);
    x = x.replace(/CODE_SIGN_STYLE = Automatic;/g, 'CODE_SIGN_STYLE = Manual;\n\t\t\t\tDEVELOPMENT_TEAM = ' + team + ';\n\t\t\t\tPROVISIONING_PROFILE_SPECIFIER = "' + prof.replace(/"/g, '\\"') + '";\n\t\t\t\t"CODE_SIGN_IDENTITY[sdk=iphoneos*]" = "Apple Distribution";');
    console.log('iOS: ondertekenen met het profiel "' + prof + '" (team ' + team + ')');
  }
  write(pb, x);
  console.log('iOS: versie ' + info.version + ' (' + info.build + '), locatie in de achtergrond');
} else {
  must(false, 'gebruik: node scripts/patch-native.mjs android|ios');
}
