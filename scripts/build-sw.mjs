import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Generate from the actual production files so new hashed bundles are cached together.
const files = ['index.html', 'manifest.webmanifest', 'favicon.svg'];
for (const dir of ['assets', 'icons']) {
  for (const file of await readdir(`dist/${dir}`)) {
    if (!file.endsWith('.map')) files.push(`${dir}/${file}`);
  }
}
const hash = createHash('sha256');
for (const file of files) hash.update(await readFile(`dist/${file}`));
const version = hash.digest('hex').slice(0, 16);
await writeFile('dist/sw.js', `
const CACHE = 'opneet-shell-${version}';
const FILES = ${JSON.stringify(files)};
const ROOT = new URL('./', self.registration.scope);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(file => new URL(file, ROOT).href))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('opneet-shell-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      // Keep each HTML shell paired with the assets precached by this worker.
      // Updates activate after existing app windows close, without interrupting a test.
      const cached = await caches.open(CACHE).then(cache => cache.match(new URL('index.html', ROOT).href));
      return cached || fetch(request);
    })());
    return;
  }
  event.respondWith((async () => {
    // These are public precached files, identical across Origin header variants.
    const cached = await caches.open(CACHE).then(cache => cache.match(request, { ignoreVary: true }));
    return cached || fetch(request);
  })());
});
`);
console.log(`Built offline shell ${version} (${files.length} files)`);
