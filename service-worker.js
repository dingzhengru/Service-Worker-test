// 此檔案一定要跟index同目錄


// *下面是cache的方法說明
// caches.open(): 創建或打開一個cache
// caches.match(): 在cache storage找緩存的資料
// caches.keys(): 得到所有的cache
// caches.delete(): 刪除某個cache('版本名') ex: caches.delete('v1')
// cache.add()新增快取資源 ex: cache.add('/base.css')

// 其中sw裡面的事件在原始事件對象event,進行了拓展，
// 例如fetch event裡面擁有respondWith, waitUtil
// waitUntil(): 確保 Service Worker 在安裝完畢後才去快取這些檔案
// respondWith(): fetch event 會劫持HTTP請求，讓我們能利用respondWith()處理後續回應。


const cacheName = 'v1';
const cacheAssets = [
    './index.html',
    './public/js/test.js',
    './public/css/test.css'
]

// *安裝（Install）
// 可以在 application中的serviceWorker的offline看離線時網頁的樣子
// Catch 成功的話，可以到application => Cache => Cache Storage中找到cache的檔案
self.addEventListener('install', (event) => {
    console.log('Service Worker: install')
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log('Service Worker: Chcing Files:', cacheAssets);
            return cache.addAll(cacheAssets);
        })
        .then(() => {
            console.log('Chcing Files success,then skip wait');
            self.skipWaiting();
        })
        .catch(err => console.log('Error while fetching assets', err))
    )
});

// *啟動（Active）
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

// *存取（Fetch）詳細解說可參考:https://cythilya.github.io/2017/07/16/service-worker/
// 當有任何在 Service Worker 控制範圍底下的 HTTP 請求發出時，都會觸發 fetch 事件，
// 在本例的範圍是http://localhost:8081/, fetch event 會劫持這個 HTTP 請求，讓我們能利用respondWith()處理後續回應
// 利用caches.match(event.request)檢查發出的 HTTP Request 在快取中是否有相符的項目
self.addEventListener('fetch', (event) => {
    console.log('Service Worker: Fetching');
    // 劫持 HTTP Request
    // 當有一個cache時就直接當作response回傳
    // 取自於: https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/respondWith
    event.respondWith(async function() {
        // Try to get the response from a cache.
        const cachedResponse = await caches.match(event.request);
        // Return it if we found one.
        if (cachedResponse) return cachedResponse;
        // If we didn't find a match in the cache, use the network.
        return fetch(event.request);
    }());

    // 這段來自YT:https://www.youtube.com/watch?v=ksXwaWHCW6k
    // event.respondWith(
    //     fetch(event.request)
    //     .catch((error) => {
    //         console.log('fecth error:', error)
    //         // caches.match: 在cache storage查找緩存的資源
    //         caches.match(event.request);
    //     })
    // )
});

// *收發訊息（Message）
self.addEventListener('message', function(event) {
    console.log('Service Worker: Message')
    // event.source is a client object
    event.source.postMessage("Hello! Your message was: " + event.data);
});