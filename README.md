# My Service Worker test

## Serve this
```gulp watch``` or ```gulp serve```

## 檢查瀏覽器是否支援

```if('serviceWorker' in navigator){ ... }```

## Load & Register(service-worker.js is your service-worker.js)

```
if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js') // 註冊 Service Worker
        .then(function(reg) {
            console.log('Service Worker: 註冊成功 Scope is ' + reg.scope); // 註冊成功
        }).catch(function(error) {
            console.log('Service Worker: 註冊失敗: ' + error); // 註冊失敗
        });
    })
}
```
## Install
```
self.addEventListener('install', (event) => {
    console.log('Service Worker: install')
    // 確認Install完成後，新增Cache
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log('Service Worker: Chcing Files:', cacheAssets);
            return cache.addAll(cacheAssets);
        })
        .then(() => { })
        .catch(err => console.log('Error while fetching assets', err))
    )
});
```
## Activate
```
self.addEventListener('activate', (event) => {
    console.log('Service Worker: activate');
    // 清除舊版的cache
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if(cache !== cacheName) {
                        console.log('Service Worker: 清除舊版cache');
                        return caches.delete(cache);
                    }
                })
            )
        })
    )
});
```
## Fetch (攔截HTTP Request，利用respondWith()處理後續回應)
```
self.addEventListener('fetch', (event) => {
    console.log('Service Worker: Fetching');
    // 取自於: https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/respondWith
    event.respondWith(async function() {
        // Try to get the response from a cache.
        const cachedResponse = await caches.match(event.request);
        // Return it if we found one.
        if (cachedResponse) return cachedResponse;
        // If we didn't find a match in the cache, use the network.
        return fetch(event.request);
    }());
});
```
## Methods
Methods(MDN): https://developer.mozilla.org/en-US/docs/Web/API/Cache
cache method:
    caches.open(): 創建或打開一個cache
    caches.match(): 在cache storage找緩存的資料
    caches.keys(): 得到所有的cache
    caches.delete(): 刪除某個cache('版本名') ex: caches.delete('v1')
    cache.add()新增快取資源 ex: cache.add('/base.css')

event method:
    waitUntil(): 確保 Service Worker 在安裝完畢後才去處理快取
    respondWith(): fetch event 會攔截HTTP請求，讓我們能利用respondWith()處理後續回應。