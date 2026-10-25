// Bell Tours-app: de instellingen voor deze build (capacitor.config.json en de pagina zonder verbinding).
// Uit instellingen.json (in deze map; pas het aan op GitHub), of uit de omgeving:
//   server  / SERVER_URL    het adres van je Bell Tours-server, bv. https://planning.belltours.be (verplicht, https, zonder pad)
//   versie  / APP_VERSION   de versie die de chauffeurs zien, bv. 1.0.0
//   BUILD_NUMBER            een oplopend nummer per build (op GitHub: het nummer van de run)
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
let inst = {};
try { inst = JSON.parse(fs.readFileSync('instellingen.json', 'utf8')); } catch (e) { inst = {}; }
const url = String(process.env.SERVER_URL || inst.server || '').trim().replace(/\/+$/, '');
if (!/^https:\/\/[^\s/?#]+$/i.test(url)) {
  console.error('SERVER_URL ontbreekt of klopt niet: het adres van de server met https, zonder pad, bv. https://planning.belltours.be');
  process.exit(1);
}
const version = String(process.env.APP_VERSION || inst.versie || pkg.version).trim();
if (!/^\d+\.\d+\.\d+$/.test(version)) { console.error('APP_VERSION moet drie getallen zijn, bv. 1.0.0'); process.exit(1); }
const build = String(Math.max(1, parseInt(process.env.BUILD_NUMBER || '1', 10) || 1));

const cfg = {
  appId: 'be.belltours.chauffeurs',
  appName: 'Bell Tours',
  webDir: 'www',
  backgroundColor: '#0e0d0b',
  appendUserAgent: 'BellToursApp/' + version,
  server: {
    url: url + '/chauffeurs/exec',          // de chauffeurs-app van je server: elke wijziging op de server is meteen in de app
    errorPath: 'error.html'                 // zonder verbinding bij het openen
  },
  android: {
    useLegacyBridge: true,                  // anders stopt de locatie na 5 minuten in de achtergrond (zie de plug-in)
    adjustMarginsForEdgeToEdge: 'auto'      // Android 15: niets onder de statusbalk
  },
  ios: { contentInset: 'always' }
};
fs.writeFileSync('capacitor.config.json', JSON.stringify(cfg, null, 2) + '\n');
const tpl = fs.readFileSync('www/error.template.html', 'utf8');
fs.writeFileSync('www/error.html', tpl.split('__SERVER__').join(url + '/chauffeurs/exec'));
fs.mkdirSync('build', { recursive: true });
fs.writeFileSync('build/info.json', JSON.stringify({ url, version, build }, null, 2));
console.log('Bell Tours-app ' + version + ' (build ' + build + ') voor ' + url);
