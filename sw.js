/* AI Chat site — офлайн-кэш (бинарные дистрибутивы не кэшируем) */
var CACHE = 'aichat-v1';
var CORE = ['./', './index.html', './css/qkc-core.css', './css/site.css', './js/qkc-core.js',
            './manifest.webmanifest', './assets/favicon.png', './assets/icon-192.png',
            './img/logo.png', './img/app1.jpg', './img/app2.jpg', './img/app3.jpg', './img/app4.jpg', './img/tg1.jpg', './img/tg2.jpg'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\.(apk|exe)$/i.test(url.pathname)) return;   // дистрибутивы всегда из сети
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { if (res.status === 200) c.put(req, copy); }).catch(function () {});
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || (url.pathname.slice(-1) === '/' ? caches.match('./index.html') : null);
      });
    })
  );
});
