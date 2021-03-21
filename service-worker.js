/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [
    ["about.html", "56a0c265448e001d4dfd122902124e06"],
    ["css/style.css", "3215c3fe07c5976aeb61ecdb023eb17f"],
    ["debug.log", "883adb5a07823fdb51805f22c6eed5e4"],
    ["favicon_io.zip", "81d1ce4555392031734b9d0d40964736"],
    ["images/a.jpg", "17c829fa860b5ec6bbe0d952e9adab6a"],
    ["images/b.gif", "4140e29233463ff4b19497241f561f01"],
    ["images/b.jpg", "e8dd32deb23599939ebe234dbb2a1422"],
    ["images/c.jpg", "7480447513525a942931e850ae134ea3"],
    ["images/css.png", "7923f176347f2b9a73e6bcbd561837d9"],
    ["images/d.jpg", "4c6ec2c255aaf542f2d34a5de0b6ac9b"],
    ["images/design.ico", "261e77caf317fd7e78b1fc5cd7d91af2"],
    ["images/download.png", "d0eefa46462c3da9e6180a9741c8c664"],
    ["images/e.jpg", "5cb8b9a97e9cf4132c8ee2fccb2948d6"],
    ["images/f.jpg", "5fae785fce266971fa544f0ae3d82001"],
    ["images/favicons/about.txt", "59506c2f4931bfdb4b73b82c99b9dc11"],
    ["images/favicons/android-chrome-192x192.png", "846855af92f2f71f4d6e2dda3e5f9521"],
    ["images/favicons/android-chrome-512x512.png", "882778c8347b94dc5397292544a095a8"],
    ["images/favicons/apple-touch-icon.png", "ce9876d8deae5cd9682ecd1f8ce1a0d2"],
    ["images/favicons/favicon-16x16.png", "458fb811b52bf02e0fa757252a298b3c"],
    ["images/favicons/favicon-32x32.png", "f2757722195c50d16e6ca0d520f5606f"],
    ["images/favicons/favicon.ico", "fbd48a09d4c36b4ecfdd252db789ba85"],
    ["images/favicons/site.webmanifest", "053100cb84a50d2ae7f5492f7dd7f25e"],
    ["images/html.png", "c7a0ffde141263c80ec8c56c1e3c75f1"],
    ["images/html2.jfif", "4097042c1db951b52c8d08d6aa729f73"],
    ["images/js.png", "47b20999b7ae77e499099e4e248ad641"],
    ["images/js2.png", "90d0129a5da6c7f377da80a4b70df2b7"],
    ["images/logo.jpg", "b0d42571addd13dc72078d3694d45942"],
    ["index.html", "b97dbe957b4623e5430e01b646f28b89"],
    ["js/index.js", "14f59c7c14cbdc15042c95aa18e537e7"],
    ["services.html", "f8f0455be47863e0d1c0f84f506a313e"],
    ["site.webmanifest", "662866afb319692e75e85de4b00cfede"]
];
var cacheName = 'sw-precache-v3-sw-precache-' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function(originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
        url.pathname += index;
    }
    return url.toString();
};

var cleanResponse = function(originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
        return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
        Promise.resolve(originalResponse.body) :
        originalResponse.blob();

    return bodyPromise.then(function(body) {
        // new Response() is happy when passed either a stream or a Blob.
        return new Response(body, {
            headers: originalResponse.headers,
            status: originalResponse.status,
            statusText: originalResponse.statusText
        });
    });
};

var createCacheKey = function(originalUrl, paramName, paramValue,
    dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
        url.search += (url.search ? '&' : '') +
            encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
};

var isPathWhitelisted = function(whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
        return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
        return path.match(whitelistedPathRegex);
    });
};

var stripIgnoredUrlParameters = function(originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
        .split('&') // Split into an array of 'key=value' strings
        .map(function(kv) {
            return kv.split('='); // Split each 'key=value' string into a [key, value] array
        })
        .filter(function(kv) {
            return ignoreUrlParametersMatching.every(function(ignoredRegex) {
                return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
            });
        })
        .map(function(kv) {
            return kv.join('='); // Join each [key, value] array into a 'key=value' string
        })
        .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
};


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
    precacheConfig.map(function(item) {
        var relativeUrl = item[0];
        var hash = item[1];
        var absoluteUrl = new URL(relativeUrl, self.location);
        var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
        return [absoluteUrl.toString(), cacheKey];
    })
);

function setOfCachedUrls(cache) {
    return cache.keys().then(function(requests) {
        return requests.map(function(request) {
            return request.url;
        });
    }).then(function(urls) {
        return new Set(urls);
    });
}

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return setOfCachedUrls(cache).then(function(cachedUrls) {
                return Promise.all(
                    Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
                        // If we don't have a key matching url in the cache already, add it.
                        if (!cachedUrls.has(cacheKey)) {
                            var request = new Request(cacheKey, { credentials: 'same-origin' });
                            return fetch(request).then(function(response) {
                                // Bail out of installation unless we get back a 200 OK for
                                // every request.
                                if (!response.ok) {
                                    throw new Error('Request for ' + cacheKey + ' returned a ' +
                                        'response with status ' + response.status);
                                }

                                return cleanResponse(response).then(function(responseToCache) {
                                    return cache.put(cacheKey, responseToCache);
                                });
                            });
                        }
                    })
                );
            });
        }).then(function() {

            // Force the SW to transition from installing -> active state
            return self.skipWaiting();

        })
    );
});

self.addEventListener('activate', function(event) {
    var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.keys().then(function(existingRequests) {
                return Promise.all(
                    existingRequests.map(function(existingRequest) {
                        if (!setOfExpectedUrls.has(existingRequest.url)) {
                            return cache.delete(existingRequest);
                        }
                    })
                );
            });
        }).then(function() {

            return self.clients.claim();

        })
    );
});


self.addEventListener('fetch', function(event) {
    if (event.request.method === 'GET') {
        // Should we call event.respondWith() inside this fetch event handler?
        // This needs to be determined synchronously, which will give other fetch
        // handlers a chance to handle the request if need be.
        var shouldRespond;

        // First, remove all the ignored parameters and hash fragment, and see if we
        // have that URL in our cache. If so, great! shouldRespond will be true.
        var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
        shouldRespond = urlsToCacheKeys.has(url);

        // If shouldRespond is false, check again, this time with 'index.html'
        // (or whatever the directoryIndex option is set to) at the end.
        var directoryIndex = 'index.html';
        if (!shouldRespond && directoryIndex) {
            url = addDirectoryIndex(url, directoryIndex);
            shouldRespond = urlsToCacheKeys.has(url);
        }

        // If shouldRespond is still false, check to see if this is a navigation
        // request, and if so, whether the URL matches navigateFallbackWhitelist.
        var navigateFallback = '';
        if (!shouldRespond &&
            navigateFallback &&
            (event.request.mode === 'navigate') &&
            isPathWhitelisted([], event.request.url)) {
            url = new URL(navigateFallback, self.location).toString();
            shouldRespond = urlsToCacheKeys.has(url);
        }

        // If shouldRespond was set to true at any point, then call
        // event.respondWith(), using the appropriate cache key.
        if (shouldRespond) {
            event.respondWith(
                caches.open(cacheName).then(function(cache) {
                    return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
                        if (response) {
                            return response;
                        }
                        throw Error('The cached response that was expected is missing.');
                    });
                }).catch(function(e) {
                    // Fall back to just fetch()ing the request if some unexpected error
                    // prevented the cached response from being valid.
                    console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
                    return fetch(event.request);
                })
            );
        }
    }
});