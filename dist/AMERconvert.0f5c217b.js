// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  externals,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"klwky":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 1234;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "09ae9a660f5c217b";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_SERVER_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_SERVER_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , disposedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ , bundleNotFound = false;
function getHostname() {
    return HMR_HOST || (typeof location !== 'undefined' && location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || (typeof location !== 'undefined' ? location.port : HMR_SERVER_PORT);
}
// eslint-disable-next-line no-redeclare
let WebSocket = globalThis.WebSocket;
if (!WebSocket && typeof module.bundle.root === 'function') try {
    // eslint-disable-next-line no-global-assign
    WebSocket = module.bundle.root('ws');
} catch  {
// ignore.
}
var hostname = getHostname();
var port = getPort();
var protocol = HMR_SECURE || typeof location !== 'undefined' && location.protocol === 'https:' && ![
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
].includes(hostname) ? 'wss' : 'ws';
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if (!parent || !parent.isParcelRequire) {
    // Web extension context
    var extCtx = typeof browser === 'undefined' ? typeof chrome === 'undefined' ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes('test.js');
    }
    var ws;
    if (HMR_USE_SSE) ws = new EventSource('/__parcel_hmr');
    else try {
        // If we're running in the dev server's node runner, listen for messages on the parent port.
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) {
            parentPort.on('message', async (message)=>{
                try {
                    await handleMessage(message);
                    parentPort.postMessage('updated');
                } catch  {
                    parentPort.postMessage('restart');
                }
            });
            // After the bundle has finished running, notify the dev server that the HMR update is complete.
            queueMicrotask(()=>parentPort.postMessage('ready'));
        }
    } catch  {
        if (typeof WebSocket !== 'undefined') try {
            ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
        } catch (err) {
            // Ignore cloudflare workers error.
            if (err.message && !err.message.includes('Disallowed operation called within global scope')) console.error(err.message);
        }
    }
    if (ws) {
        // $FlowFixMe
        ws.onmessage = async function(event /*: {data: string, ...} */ ) {
            var data /*: HMRMessage */  = JSON.parse(event.data);
            await handleMessage(data);
        };
        if (ws instanceof WebSocket) {
            ws.onerror = function(e) {
                if (e.message) console.error(e.message);
            };
            ws.onclose = function() {
                console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
            };
        }
    }
}
async function handleMessage(data /*: HMRMessage */ ) {
    checkedAssets = {} /*: {|[string]: boolean|} */ ;
    disposedAssets = {} /*: {|[string]: boolean|} */ ;
    assetsToAccept = [];
    assetsToDispose = [];
    bundleNotFound = false;
    if (data.type === 'reload') fullReload();
    else if (data.type === 'update') {
        // Remove error overlay if there is one
        if (typeof document !== 'undefined') removeErrorOverlay();
        let assets = data.assets;
        // Handle HMR Update
        let handled = assets.every((asset)=>{
            return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
        });
        // Dispatch a custom event in case a bundle was not found. This might mean
        // an asset on the server changed and we should reload the page. This event
        // gives the client an opportunity to refresh without losing state
        // (e.g. via React Server Components). If e.preventDefault() is not called,
        // we will trigger a full page reload.
        if (handled && bundleNotFound && assets.some((a)=>a.envHash !== HMR_ENV_HASH) && typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') handled = !window.dispatchEvent(new CustomEvent('parcelhmrreload', {
            cancelable: true
        }));
        if (handled) {
            console.clear();
            // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
            if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('parcelhmraccept'));
            await hmrApplyUpdates(assets);
            hmrDisposeQueue();
            // Run accept callbacks. This will also re-execute other disposed assets in topological order.
            let processedAssets = {};
            for(let i = 0; i < assetsToAccept.length; i++){
                let id = assetsToAccept[i][1];
                if (!processedAssets[id]) {
                    hmrAccept(assetsToAccept[i][0], id);
                    processedAssets[id] = true;
                }
            }
        } else fullReload();
    }
    if (data.type === 'error') {
        // Log parcel errors to console
        for (let ansiDiagnostic of data.diagnostics.ansi){
            let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
            console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
        }
        if (typeof document !== 'undefined') {
            // Render the fancy html overlay
            removeErrorOverlay();
            var overlay = createErrorOverlay(data.diagnostics.html);
            // $FlowFixMe
            document.body.appendChild(overlay);
        }
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="${protocol === 'wss' ? 'https' : 'http'}://${hostname}:${port}/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, '') : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + '</div>').join('')}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ''}
      </div>
    `;
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if (typeof location !== 'undefined' && 'reload' in location) location.reload();
    else if (typeof extCtx !== 'undefined' && extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
    else try {
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) parentPort.postMessage('restart');
    } catch (err) {
        console.error("[parcel] \u26A0\uFE0F An HMR update was not accepted. Please restart the process.");
    }
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', // $FlowFixMe
    href.split('?')[0] + '?' + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout || typeof document === 'undefined') return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === 'js') {
        if (typeof document !== 'undefined') {
            let script = document.createElement('script');
            script.src = asset.url + '?t=' + Date.now();
            if (asset.outputFormat === 'esmodule') script.type = 'module';
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === 'function') {
            // Worker scripts
            if (asset.outputFormat === 'esmodule') return import(asset.url + '?t=' + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + '?t=' + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != 'undefined' && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        }
        // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
        // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
        if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    checkedAssets = {};
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else if (a !== null) {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) {
            bundleNotFound = true;
            return true;
        }
        return hmrAcceptCheckOne(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return null;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    if (!cached) return true;
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
    return false;
}
function hmrDisposeQueue() {
    // Dispose all old assets.
    for(let i = 0; i < assetsToDispose.length; i++){
        let id = assetsToDispose[i][1];
        if (!disposedAssets[id]) {
            hmrDispose(assetsToDispose[i][0], id);
            disposedAssets[id] = true;
        }
    }
    assetsToDispose = [];
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        let assetsToAlsoAccept = [];
        cached.hot._acceptCallbacks.forEach(function(cb) {
            let additionalAssets = cb(function() {
                return getParents(module.bundle.root, id);
            });
            if (Array.isArray(additionalAssets) && additionalAssets.length) assetsToAlsoAccept.push(...additionalAssets);
        });
        if (assetsToAlsoAccept.length) {
            let handled = assetsToAlsoAccept.every(function(a) {
                return hmrAcceptCheck(a[0], a[1]);
            });
            if (!handled) return fullReload();
            hmrDisposeQueue();
        }
    }
}

},{}],"8Ekvk":[function(require,module,exports,__globalThis) {
// AMERconvert Main Script
// Handles CSV/XLSX parsing, segmentation, and JSON output for Bowlero/AMF/Lucky Strike brands
// Robust CSV parsing: quoted fields, arrays, headerless, nested, vertical/horizontal, criteria, segmentation, etc.
// Brand/type lists and field mappings
const BRAND_LIST = [
    "Bowlero",
    "AMF",
    "Lucky Strike"
];
const TYPE_LIST = [
    "Retail",
    "League",
    "Group Event",
    "GE"
];
const fieldMappings = {
    "Bowlero": {
        "Retail": {
            "pref": 413,
            "center": 412,
            "unsub": 418
        },
        "League": {
            "pref": 415,
            "center": 414,
            "unsub": 418
        },
        "Group Event": {
            "pref": 417,
            "center": 416,
            "unsub": 418
        },
        "GE": {
            "pref": 417,
            "center": 416,
            "unsub": 418
        }
    },
    "AMF": {
        "Retail": {
            "pref": 406,
            "center": 405,
            "unsub": 411
        },
        "League": {
            "pref": 408,
            "center": 407,
            "unsub": 411
        },
        "Group Event": {
            "pref": 410,
            "center": 409,
            "unsub": 411
        },
        "GE": {
            "pref": 410,
            "center": 409,
            "unsub": 411
        }
    },
    "Lucky Strike": {
        "Retail": {
            "pref": 1064,
            "center": 1065,
            "unsub": 1084
        },
        "League": {
            "pref": 1082,
            "center": 1083,
            "unsub": 1084
        },
        "Group Event": {
            "pref": 1067,
            "center": 1068,
            "unsub": 1084
        },
        "GE": {
            "pref": 1067,
            "center": 1068,
            "unsub": 1084
        }
    }
};
// State variables
let _header = [];
let _segmentationRows = [];
let _fileType = "";
let _isXlsxOptIn = false;
let _isRegularCsv = false;
let _lastUploadedFileName = undefined;
// DOM references
const fileInput = document.getElementById('fileInput');
const output = document.getElementById('output');
const rawDataInput = document.getElementById('rawDataInput');
const processRawDataButton = document.getElementById('processRawDataButton');
const jsonInput = document.getElementById('jsonInput');
const validateJsonButton = document.getElementById('validateJsonButton');
const jsonValidationResult = document.getElementById('jsonValidationResult');
// Transpose a 2D array
function transpose(matrix) {
    if (!matrix.length) return [];
    return matrix[0].map((_, colIndex)=>matrix.map((row)=>row[colIndex]));
}
// Normalize brand and type values
function normalizeBrand(brand) {
    const match = BRAND_LIST.find((b)=>b.toLowerCase() === (brand + '').toLowerCase());
    return match || brand;
}
function normalizeType(type) {
    if (type.toLowerCase() === "ge") return "Group Event";
    const found = TYPE_LIST.find((t)=>t.toLowerCase() === type.toLowerCase());
    return found || type;
}
// Read file as ArrayBuffer
function readFileAsync(file) {
    return new Promise((resolve, reject)=>{
        const reader = new FileReader();
        reader.onload = (e)=>resolve(e.target?.result);
        reader.onerror = (err)=>reject(err);
        reader.readAsArrayBuffer(file);
    });
}
// Check if header matches opt-in XLSX format
function isXlsxOptInHeader(header) {
    const normHeader = header.map((h)=>(h == null ? "" : String(h)).trim().toLowerCase());
    const hasOptinId = normHeader.some((cell)=>String(cell).includes('#') || String(cell).includes('id') || String(cell).includes('number') || String(cell).includes('optin'));
    const hasBrandOrCenter = normHeader.some((cell)=>String(cell).includes('brand') || String(cell).includes('center'));
    return hasOptinId && hasBrandOrCenter;
}
// Check if CSV is regular CSV, header is a flat array of strings
function isRegularCsv(header, data) {
    if (!Array.isArray(header) || header.some((h)=>Array.isArray(h) || typeof h === "object")) return false;
    const normHeader = header.map((h)=>(h == null ? "" : String(h)).trim().toLowerCase());
    const segmentationColumns = [
        "id",
        "brand",
        "type"
    ];
    const hasSegCols = segmentationColumns.every((h)=>normHeader.includes(h));
    const isCriteria = normHeader.length >= 4 && normHeader[0] === "type" && normHeader[1] === "field" && normHeader[2] === "operator" && normHeader[3] === "value";
    return !(isCriteria || hasSegCols);
}
// Convert array data to simple JSON objects
function arrayToSimpleJson(header, data) {
    return data.map((row)=>{
        const obj = {};
        header.forEach((h, i)=>{
            if (h && row[i] !== undefined) obj[h] = row[i];
        });
        return obj;
    });
}
// Guess brand/type from file name
function guessBrandTypeFromFileName(fileName) {
    const lower = fileName.toLowerCase();
    let brand = BRAND_LIST.find((b)=>lower.includes(b.toLowerCase())) || "Bowlero";
    let type = TYPE_LIST.find((t)=>lower.includes(t.toLowerCase().replace(/\s+/g, "")) || lower.includes(t.toLowerCase())) || "Retail";
    return {
        brand,
        type
    };
}
// Parse all sheets in an XLSX file
async function parseXlsxAllSheets(file) {
    const arrayBuffer = await readFileAsync(file);
    const workbook = XLSX.read(arrayBuffer, {
        type: 'array'
    });
    const result = {};
    for (const sheetName of workbook.SheetNames){
        const sheet = workbook.Sheets[sheetName];
        result[sheetName] = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: ""
        });
    }
    return result;
}
// Parse a file (CSV or XLSX) and return data and metadata
async function parseFile(file) {
    const fileName = file.name.toLowerCase();
    let data;
    let isCsv = fileName.endsWith('.csv');
    let isXlsx = fileName.endsWith('.xlsx');
    let fileType = "";
    let isXlsxOptIn = false;
    let workbook = undefined;
    if (isCsv) {
        const text = await file.text();
        workbook = XLSX.read(text, {
            type: 'string'
        });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        data = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: ""
        });
    } else if (isXlsx) {
        const arrayBuffer = await readFileAsync(file);
        workbook = XLSX.read(arrayBuffer, {
            type: 'array'
        });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        data = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: ""
        });
    } else throw new Error("Unsupported file format: " + fileName);
    let header = data[0];
    if (header.every((cell)=>typeof cell !== "string" || !cell || !isNaN(Number(cell)))) header = header.map((_, idx)=>`field${idx + 1}`);
    isXlsxOptIn = isXlsx && isXlsxOptInHeader(header);
    const lower = fileName.toLowerCase();
    for (let type of TYPE_LIST){
        if (lower.includes(type.toLowerCase().replace(/\s+/g, ''))) fileType = type;
        else if (lower.includes(type.toLowerCase())) fileType = type;
    }
    return {
        data,
        fileType,
        isXlsxOptIn,
        fileName,
        workbook
    };
}
// convert array data to SegmentationRow[]
function arrayToSegmentationRows(header, data, fileType, isXlsxOptIn = false) {
    let valueCol, brandCol, typeCol;
    if (isXlsxOptIn) {
        const normHeaders = header.map((h)=>(h ?? "").trim().toLowerCase());
        valueCol = normHeaders.findIndex((h)=>h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin'));
        brandCol = normHeaders.findIndex((h)=>h.includes('brand') || h.includes('center'));
        typeCol = normHeaders.findIndex((h)=>h === "type");
    } else {
        const normHeaders = header.map((h)=>String(h).trim().toLowerCase());
        valueCol = normHeaders.findIndex((h)=>h === "value");
        if (valueCol === -1) valueCol = normHeaders.findIndex((h)=>[
                "#",
                "id",
                "number",
                "optin"
            ].includes(h));
        if (valueCol === -1 && header.length === 2) valueCol = 0;
        if (valueCol === -1) valueCol = 0;
        brandCol = normHeaders.findIndex((h)=>h === "brand" || h === "field5" || h.includes("center") || h === "centername");
        if (brandCol === -1 && header.length === 2) brandCol = 1;
        if (brandCol === -1) brandCol = header.length - 1;
        typeCol = normHeaders.findIndex((h)=>h === "type");
    }
    let baseRows = data.filter((row)=>Array.isArray(row) && row.length).map((row)=>{
        let id = valueCol !== -1 ? row[valueCol] : "";
        let brand = brandCol !== -1 ? row[brandCol] : "";
        let type = typeCol !== -1 ? row[typeCol] : "";
        if (!brand) for (const cell of row){
            const found = BRAND_LIST.find((b)=>(cell + "").toLowerCase().includes(b.toLowerCase()));
            if (found) {
                brand = found;
                break;
            }
        }
        brand = normalizeBrand(brand);
        if (!type) for (const cell of row){
            const found = TYPE_LIST.find((t)=>(cell + "").toLowerCase().includes(t.toLowerCase()));
            if (found) {
                type = found;
                break;
            }
        }
        if (typeof id === "undefined" || id === null || id === "") id = "";
        return {
            id,
            brand,
            type
        };
    });
    if (baseRows.every((r)=>!r.type) && fileType) baseRows = baseRows.map((r)=>({
            ...r,
            type: fileType
        }));
    const rows = baseRows.filter((r)=>r.id !== "" && r.brand !== "" && r.type !== "");
    return rows;
}
// get checked types from UI
function getCheckedTypes() {
    const all = document.getElementById('all');
    if (all?.checked) return [
        "All"
    ];
    const types = [];
    if (document.getElementById('retail')?.checked) types.push("Retail");
    if (document.getElementById('ge')?.checked) types.push("GE");
    if (document.getElementById('league')?.checked) types.push("League");
    return types;
}
// build JSON structure for segmentation output
function buildJsonStructure(rows, fieldMapping, segmentName) {
    const prefCriteria = {
        type: "criteria",
        field: fieldMapping.pref.toString(),
        operator: "equals",
        value: "True"
    };
    const unsubCriteria = {
        type: "criteria",
        field: fieldMapping.unsub.toString(),
        operator: "empty",
        value: ""
    };
    const centerOrBlock = {
        type: "or",
        children: rows.map((row)=>({
                type: "criteria",
                field: fieldMapping.center.toString(),
                operator: "equals",
                value: row.id?.toString(),
                FIELD5: row.brand
            }))
    };
    // Wraps the criteria block with name and contactCriteria like Bruno
    return {
        name: segmentName,
        contactCriteria: {
            type: "and",
            children: [
                prefCriteria,
                unsubCriteria,
                centerOrBlock
            ]
        }
    };
}
// split large opt-in lists for output
function splitOptins(rows) {
    if (rows.length < 200) return [
        rows
    ];
    else {
        const firstChunk = Math.ceil(rows.length / 2);
        return [
            rows.slice(0, firstChunk),
            rows.slice(firstChunk)
        ];
    }
}
// group and split segmentation rows by brand/type
function groupAndSplitRows(rows, splitForXlsxOptIn) {
    const grouped = new Map();
    for (const row of rows){
        if (!row.brand || !row.type) continue;
        const brandKey = normalizeBrand(row.brand);
        const typeKey = normalizeType(row.type);
        const key = `${brandKey}|||${typeKey}`;
        if (!grouped.has(key)) grouped.set(key, []);
        let lastChunk = grouped.get(key)[grouped.get(key).length - 1];
        if (!lastChunk) {
            grouped.get(key).push({
                rows: [],
                brand: brandKey,
                type: typeKey
            });
            lastChunk = grouped.get(key)[grouped.get(key).length - 1];
        }
        lastChunk.rows.push(row);
    }
    const result = new Map();
    for (const [key, groupChunks] of grouped.entries()){
        const groupRows = groupChunks.flatMap((chunk)=>chunk.rows);
        const brand = groupChunks[0].brand;
        const type = groupChunks[0].type;
        const split = splitOptins(groupRows);
        result.set(key, split.map((rows)=>({
                rows,
                brand,
                type
            })));
    }
    return result;
}
// clear all CSV state and output
function clearCsvState() {
    _header = [];
    _segmentationRows = [];
    _fileType = "";
    _isRegularCsv = false;
    _isXlsxOptIn = false;
    _lastUploadedFileName = undefined;
    if (output) output.textContent = "";
}
// File input handler
fileInput?.addEventListener('change', async (event)=>{
    if (!fileInput.value) clearCsvState();
    if (!output) return;
    const file = event.target?.files?.[0];
    if (!file) {
        output.textContent = "No file selected.";
        return;
    }
    try {
        const lowerName = file.name.toLowerCase();
        const isXlsx = lowerName.endsWith('.xlsx');
        let checkedTypes = getCheckedTypes();
        if (!checkedTypes.length || checkedTypes.includes("All")) checkedTypes = TYPE_LIST;
        if (isXlsx) {
            // XLSX: Only process sheets with both ID and brand/center columns
            const sheetsData = await parseXlsxAllSheets(file);
            let segmentationOutputs = [];
            let foundSegmentation = false;
            for (const [sheetName, data] of Object.entries(sheetsData)){
                if (!data.length) continue;
                let header = data[0];
                if (header.every((cell)=>typeof cell !== "string" || !cell || !isNaN(Number(cell)))) header = header.map((_, idx)=>`field${idx + 1}`);
                // Check for ID and brand/center columns
                const normHeader = header.map((h)=>(h == null ? "" : String(h)).trim().toLowerCase());
                const hasId = normHeader.some((cell)=>typeof cell === "string" && (cell.includes('#') || cell.includes('id') || cell.includes('number') || cell.includes('optin')));
                const hasBrandOrCenter = normHeader.some((cell)=>typeof cell === "string" && (cell.includes('brand') || cell.includes('center')));
                if (!(hasId && hasBrandOrCenter)) {
                    segmentationOutputs.push(`// Sheet "${sheetName}" skipped: missing ID or brand/center column`);
                    continue;
                }
                let segmentationRows;
                let isXlsxOptIn = isXlsxOptInHeader(header);
                let fileType = "";
                if (isXlsxOptIn) {
                    // Expand opt-in rows for each checked type
                    const normHeaders = header.map((h)=>(h ?? "").trim().toLowerCase());
                    const valueCol = normHeaders.findIndex((h)=>h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin'));
                    const brandCol = normHeaders.findIndex((h)=>h.includes('brand') || h.includes('center'));
                    let expandedRows = [];
                    data.slice(1).forEach((row)=>{
                        checkedTypes.forEach((type)=>{
                            expandedRows.push([
                                valueCol !== -1 ? row[valueCol] : "",
                                brandCol !== -1 ? row[brandCol] : "",
                                type
                            ]);
                        });
                    });
                    header = [
                        "id",
                        "brand",
                        "type"
                    ];
                    segmentationRows = arrayToSegmentationRows(header, expandedRows, "", true);
                } else segmentationRows = arrayToSegmentationRows(header, data.slice(1), fileType, false);
                // --- Robust deduplication and normalization for XLSX segmentation output ---
                function cleanStr(val) {
                    if (val == null) return "";
                    return String(val).replace(/[\u200B-\u200D\uFEFF\u00A0\u202F\u2060\u180E]/g, "") // remove invisible/non-breaking
                    .replace(/\s+/g, " ") // collapse whitespace
                    .trim().toLowerCase();
                }
                const seen = new Set();
                segmentationRows = segmentationRows.filter((row)=>{
                    const normId = cleanStr(row.id);
                    const normBrand = cleanStr(normalizeBrand(row.brand));
                    const normType = cleanStr(normalizeType(row.type));
                    if (!normId || !normBrand || !normType) {
                        console.error(`Deduplication skip: Missing field(s) - id: '${row.id}', brand: '${row.brand}', type: '${row.type}' (normalized: id='${normId}', brand='${normBrand}', type='${normType}')`);
                        return false;
                    }
                    const key = `${normId}|||${normBrand}|||${normType}`;
                    if (seen.has(key)) {
                        console.error(`Deduplication skip: Duplicate key '${key}' for row id: '${row.id}', brand: '${row.brand}', type: '${row.type}'`);
                        return false;
                    }
                    seen.add(key);
                    // Store canonical-cased brand for output (not lowercased)
                    row.id = normId;
                    row.brand = normalizeBrand(row.brand); // preserve canonical casing for output
                    row.type = normalizeType(row.type); // enforce normalized type for grouping/output
                    return true;
                });
                // --- End robust deduplication ---
                const grouped = groupAndSplitRows(segmentationRows, isXlsxOptIn);
                let outputStr = "";
                for (const [key, chunks] of grouped.entries())for(let i = 0; i < chunks.length; i++){
                    const { rows, brand, type } = chunks[i];
                    const mapping = fieldMappings[brand]?.[normalizeType(type)];
                    if (!mapping) {
                        outputStr += `// No mapping for brand "${brand}" and type "${type}"
`;
                        continue;
                    }
                    // Fallback deduplication by id+brand+type within this chunk (with normalization)
                    const seenFinal = new Set();
                    const dedupedChunk = rows.filter((row)=>{
                        const key = `${cleanStr(row.id)}|||${cleanStr(normalizeBrand(row.brand))}|||${cleanStr(normalizeType(row.type))}`;
                        if (seenFinal.has(key)) return false;
                        seenFinal.add(key);
                        return true;
                    });
                    let name = `${brand} ${type}`;
                    if (chunks.length > 1) name += ` ${i + 1}`;
                    const jsonStr = JSON.stringify(buildJsonStructure(dedupedChunk, mapping, name), null, 2);
                    outputStr += `\n\n-- STARTS ${name} --\n\n`;
                    outputStr += jsonStr + "\n\n";
                    outputStr += `-- ENDS ${name} --\n\n`;
                }
                if (outputStr.trim()) {
                    foundSegmentation = true;
                    segmentationOutputs.push(`// ${sheetName}\n\n${outputStr.trim()}\n`);
                }
            }
            if (foundSegmentation) {
                output.textContent = segmentationOutputs.join('\n').trim();
                return;
            }
            output.textContent = segmentationOutputs.length ? segmentationOutputs.join('\n').trim() : "XLSX files are only supported for segmentation/criteria/opt-in formats with both ID and brand/center columns.";
            return;
        } else {
            // CSV: parse and handle all types
            const { data, fileType, isXlsxOptIn, fileName } = await parseFile(file);
            _lastUploadedFileName = file.name;
            let header = data[0];
            if (header.every((cell)=>typeof cell !== "string" || !cell || !isNaN(Number(cell)))) header = header.map((_, idx)=>`field${idx + 1}`);
            // Segmentation detection logic
            const normHeader = header.map((h)=>(h == null ? "" : String(h)).trim().toLowerCase());
            const isCriteriaHeader = normHeader.length === 4 && normHeader[0] === "type" && normHeader[1] === "field" && normHeader[2] === "operator" && normHeader[3] === "value";
            const isSegmentationHeader = normHeader.length === 3 && normHeader.includes("id") && normHeader.includes("brand") && normHeader.includes("type");
            let isSegmentation = false;
            if (isCriteriaHeader) isSegmentation = true;
            else if (isSegmentationHeader) {
                const brandIdx = normHeader.indexOf("brand");
                if (brandIdx !== -1) {
                    const brands = data.slice(1).map((row)=>(row[brandIdx] ?? "").toString().trim().toLowerCase());
                    if (brands.some((b)=>[
                            "bowlero",
                            "amf",
                            "lucky strike",
                            "luckystrike"
                        ].includes(b.replace(/\s+/g, "")))) isSegmentation = true;
                }
            }
            if (isSegmentation) {
                _header = header;
                _segmentationRows = data.slice(1);
                _isXlsxOptIn = false;
                updateOutput();
                return;
            }
            if (isXlsxOptIn) {
                // Expand opt-in rows for each checked type
                const normHeaders = header.map((h)=>(h ?? "").trim().toLowerCase());
                const valueCol = normHeaders.findIndex((h)=>h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin'));
                const brandCol = normHeaders.findIndex((h)=>h.includes('brand') || h.includes('center'));
                let expandedRows = [];
                data.slice(1).forEach((row)=>{
                    checkedTypes.forEach((type)=>{
                        expandedRows.push([
                            valueCol !== -1 ? row[valueCol] : "",
                            brandCol !== -1 ? row[brandCol] : "",
                            type
                        ]);
                    });
                });
                header = [
                    "id",
                    "brand",
                    "type"
                ];
                _header = header;
                _segmentationRows = arrayToSegmentationRows(header, expandedRows, "", true);
            } else {
                _header = header;
                _segmentationRows = data.slice(1);
            }
            _fileType = fileType;
            _isXlsxOptIn = isXlsxOptIn;
            updateOutput();
        }
    } catch (error) {
        output.textContent = `Error processing file: ${error.message}`;
    }
});
// Robust CSV parser for pasted/textarea input
function parseRawCsvToArray(raw) {
    function parseCsvRow(row) {
        const result = [];
        let curr = "";
        let inQuotes = false;
        for(let i = 0; i < row.length; i++){
            const char = row[i];
            if (char === '"') {
                if (inQuotes && row[i + 1] === '"') {
                    curr += '"';
                    i++;
                } else inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(curr);
                curr = "";
            } else curr += char;
        }
        result.push(curr);
        return result;
    }
    const lines = raw.trim().split('\n');
    // If any line is quoted, use robust parser
    if (lines.some((line)=>line.includes('"'))) {
        const parsed = lines.map(parseCsvRow);
        return parsed;
    }
    // Otherwise, try delimiter detection
    const delimiters = [
        ',',
        '\t',
        ';',
        '|'
    ];
    let bestRows = lines.map((line)=>line.split(','));
    let maxCols = bestRows[0].length;
    for (const delim of delimiters){
        const rows = lines.map((line)=>line.split(delim));
        if (rows[0].length > maxCols) {
            bestRows = rows;
            maxCols = rows[0].length;
        }
    }
    return bestRows;
}
// detect vertical header CSVs
function isVerticalHeader(data) {
    if (!data.length || !data[0].length) return false;
    const firstCol = data.map((row)=>row[0]);
    const stringCount = firstCol.filter((cell)=>typeof cell === "string" && isNaN(Number(cell)) && cell.trim() !== "").length;
    return data.length > data[0].length && stringCount > data.length * 0.6;
}
// Handler for processing pasted/raw CSV data
processRawDataButton?.addEventListener('click', ()=>{
    clearCsvState();
    if (!rawDataInput || !output) return;
    const raw = rawDataInput.value.trim();
    if (!raw) {
        output.textContent = "No raw data entered.";
        return;
    }
    let data = parseRawCsvToArray(raw);
    if (!data.length) {
        output.textContent = "Empty or invalid CSV.";
        return;
    }
    let header = data[0];
    if (header.every((cell)=>typeof cell !== "string" || !cell || !isNaN(Number(cell)))) header = header.map((_, idx)=>`field${idx + 1}`);
    let checkedTypes = getCheckedTypes();
    if (!checkedTypes.length || checkedTypes.includes("All")) checkedTypes = TYPE_LIST;
    // Segmentation detection logic
    const normHeader = header.map((h)=>(h == null ? "" : String(h)).trim().toLowerCase());
    const isCriteriaHeader = normHeader.length === 4 && normHeader[0] === "type" && normHeader[1] === "field" && normHeader[2] === "operator" && normHeader[3] === "value";
    const isSegmentationHeader = normHeader.length === 3 && normHeader.includes("id") && normHeader.includes("brand") && normHeader.includes("type");
    let isSegmentation = false;
    if (isCriteriaHeader) isSegmentation = true;
    else if (isSegmentationHeader) {
        const brandIdx = normHeader.indexOf("brand");
        if (brandIdx !== -1) {
            const brands = data.slice(1).map((row)=>(row[brandIdx] ?? "").toString().trim().toLowerCase());
            if (brands.some((b)=>[
                    "bowlero",
                    "amf",
                    "lucky strike",
                    "luckystrike"
                ].includes(b.replace(/\s+/g, "")))) isSegmentation = true;
        }
    }
    if (isSegmentation) {
        _header = header;
        _segmentationRows = data.slice(1);
        _isXlsxOptIn = false;
        updateOutput();
        return;
    }
    // Only check for opt-in if header is all strings and not auto-generated
    const isHeaderLikelyOptIn = header.every((cell)=>typeof cell === "string" && cell.trim() !== "");
    let isTwoColOptIn = false;
    if (isHeaderLikelyOptIn && header.length === 2) isTwoColOptIn = isXlsxOptInHeader(header);
    if (isTwoColOptIn) {
        const normHeaders = header.map((h)=>(h ?? "").trim().toLowerCase());
        const valueCol = normHeaders.findIndex((h)=>h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin'));
        const brandCol = normHeaders.findIndex((h)=>h.includes('brand') || h.includes('center'));
        let expandedRows = [];
        checkedTypes.forEach((type)=>{
            data.slice(1).forEach((row)=>{
                expandedRows.push([
                    valueCol !== -1 ? row[valueCol] : "",
                    brandCol !== -1 ? row[brandCol] : "",
                    type
                ]);
            });
        });
        header = [
            "id",
            "brand",
            "type"
        ];
        _header = header;
        _segmentationRows = arrayToSegmentationRows(header, expandedRows, "", true);
        _isXlsxOptIn = true;
    } else {
        _header = header;
        _segmentationRows = data.slice(1);
        _isXlsxOptIn = false;
    }
    updateOutput();
});
// Main output logic: handles all output types
function updateOutput() {
    if (!output || !_segmentationRows.length) return;
    function isCriteriaHeader(header) {
        const norm = header.map((h)=>String(h).trim().toLowerCase());
        return norm.length >= 4 && norm[0] === "type" && norm[1] === "field" && norm[2] === "operator" && norm[3] === "value";
    }
    // Criteria CSV output
    if (isCriteriaHeader(_header) && Array.isArray(_segmentationRows)) {
        const firstRow = _segmentationRows[0];
        let brand = "";
        let field = "";
        for(let i = 0; i < _header.length; i++){
            const header = (_header[i] + "").trim().toLowerCase();
            if (header === "field5" || header === "brand") brand = firstRow[i];
            if (header === "field") field = firstRow[i];
        }
        // Try to infer brand from field if not found in row
        if (!brand && field) for (const b of Object.keys(fieldMappings)){
            for (const t of Object.keys(fieldMappings[b]))if (fieldMappings[b][t].center.toString() === field.toString()) {
                brand = b;
                break;
            }
            if (brand) break;
        }
        brand = brand || "Bowlero";
        let foundType = "";
        for (const t of Object.keys(fieldMappings[brand] || {}))if (fieldMappings[brand][t].center.toString() === field.toString()) {
            foundType = t;
            break;
        }
        const type = foundType || "Retail";
        const mapping = fieldMappings[brand]?.[type];
        if (!mapping) {
            output.textContent = "// Could not determine pref/unsub mapping for this criteria CSV";
            return;
        }
        const centerCriteria = _segmentationRows.map((row)=>{
            const obj = {};
            _header.forEach((h, i)=>{
                if (h && row[i] !== undefined) obj[h] = row[i];
            });
            return {
                type: "criteria",
                field: obj.field !== undefined ? typeof obj.field === "string" ? obj.field : obj.field.toString() : "",
                operator: obj.operator,
                value: obj.value !== undefined ? typeof obj.value === "string" ? obj.value : obj.value.toString() : "",
                FIELD5: brand.toString()
            };
        });
        const centerOrBlock = {
            type: "or",
            children: centerCriteria
        };
        const prefCriteria = {
            type: "criteria",
            field: mapping.pref.toString(),
            operator: "equals",
            value: "True"
        };
        const unsubCriteria = {
            type: "criteria",
            field: mapping.unsub.toString(),
            operator: "empty",
            value: ""
        };
        const segmentName = `${brand} ${type}`;
        const wrapped = {
            name: segmentName,
            contactCriteria: {
                type: "and",
                children: [
                    prefCriteria,
                    unsubCriteria,
                    centerOrBlock
                ]
            }
        };
        output.textContent = JSON.stringify(wrapped, null, 2);
        return;
    }
    // Segmentation CSV output
    const normHeader = _header.map((h)=>String(h).trim().toLowerCase());
    const isSegmentation = normHeader.includes("id") && normHeader.includes("brand") && normHeader.includes("type");
    if (isSegmentation && Array.isArray(_segmentationRows)) {
        let rows = _segmentationRows.map((row)=>{
            const obj = {};
            _header.forEach((h, i)=>{
                if (h && row[i] !== undefined) obj[h] = row[i];
            });
            return obj;
        });
        // eliminate possible duped rows by id+brand+type (robust normalization)
        function cleanStr(val) {
            if (val == null) return "";
            return String(val).replace(/[\u200B-\u200D\uFEFF\u00A0\u202F\u2060\u180E]/g, "") // remove invisible/non-breaking
            .replace(/\s+/g, " ") // collapse whitespace
            .trim().toLowerCase();
        }
        const seen = new Set();
        rows = rows.filter((row)=>{
            const normId = cleanStr(row.id);
            const normBrand = cleanStr(normalizeBrand(row.brand));
            const normType = cleanStr(normalizeType(row.type));
            if (!normId || !normBrand || !normType) {
                console.error(`Deduplication skip: Missing field(s) - id: '${row.id}', brand: '${row.brand}', type: '${row.type}' (normalized: id='${normId}', brand='${normBrand}', type='${normType}')`);
                return false;
            }
            const key = `${normId}|||${normBrand}|||${normType}`;
            if (seen.has(key)) {
                console.error(`Deduplication skip: Duplicate key '${key}' for row id: '${row.id}', brand: '${row.brand}', type: '${row.type}'`);
                return false;
            }
            seen.add(key);
            //normalize values for grouping/output
            row.id = normId;
            row.brand = normBrand;
            row.type = normalizeType(row.type); // enforce normalized type for grouping/output
            return true;
        });
        // group by brand/type
        const grouped = {};
        for (const row of rows){
            const brand = row.brand;
            const type = row.type; // already normalized
            const key = `${brand}|||${type}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(row);
        }
        // split and output each group as separate JSON if >=200 rows
        let outputStr = "";
        let foundAny = false;
        for (const key of Object.keys(grouped)){
            const [brand, type] = key.split("|||");
            const mapping = fieldMappings[brand]?.[type];
            if (!mapping) {
                outputStr += `// No mapping for brand "${brand}" and type "${type}"
`;
                continue;
            }
            const groupRows = grouped[key];
            // split into chunks of <200
            const chunkSize = 200;
            for(let i = 0; i < groupRows.length; i += chunkSize){
                const chunk = groupRows.slice(i, i + chunkSize);
                // Fallback deduplication by id+brand+type within this chunk (with normalization)
                const seenFinal = new Set();
                const dedupedChunk = chunk.filter((row)=>{
                    const key = `${cleanStr(row.id)}|||${cleanStr(normalizeBrand(row.brand))}|||${cleanStr(normalizeType(row.type))}`;
                    if (seenFinal.has(key)) return false;
                    seenFinal.add(key);
                    return true;
                });
                let name = `${brand} ${type}`;
                if (groupRows.length > chunkSize) name += ` ${Math.floor(i / chunkSize) + 1}`;
                const centerOrBlock = {
                    type: "or",
                    children: dedupedChunk.map((row)=>({
                            type: "criteria",
                            field: mapping.center.toString(),
                            operator: "equals",
                            value: row.id?.toString(),
                            FIELD5: brand
                        }))
                };
                const prefCriteria = {
                    type: "criteria",
                    field: mapping.pref.toString(),
                    operator: "equals",
                    value: "True"
                };
                const unsubCriteria = {
                    type: "criteria",
                    field: mapping.unsub.toString(),
                    operator: "empty",
                    value: ""
                };
                const wrapped = {
                    name,
                    contactCriteria: {
                        type: "and",
                        children: [
                            prefCriteria,
                            unsubCriteria,
                            centerOrBlock
                        ]
                    }
                };
                outputStr += JSON.stringify(wrapped, null, 2) + "\n\n";
                foundAny = true;
            }
        }
        if (foundAny) {
            output.textContent = outputStr.trim();
            return;
        }
    }
    // Vertical CSV detection (headers in first column)
    if (_header && Array.isArray(_segmentationRows)) {
        let header = _header;
        let dataRows = _segmentationRows;
        if (isVerticalHeader([
            header,
            ...dataRows
        ])) {
            const matrix = [
                header,
                ...dataRows
            ];
            const transposed = transpose(matrix);
            header = transposed[0].map((cell)=>String(cell).trim());
            dataRows = transposed.slice(1);
            const firstRow = transposed[0];
            const isHeaderRow = firstRow.some((cell)=>typeof cell === "string" && isNaN(Number(cell)) && cell.trim() !== "");
            let records = [];
            if (isHeaderRow) {
                const newHeader = firstRow;
                for(let i = 1; i < transposed.length; i++){
                    const row = transposed[i];
                    const obj = {};
                    newHeader.forEach((h, idx)=>{
                        obj[h] = row[idx];
                    });
                    records.push(obj);
                }
            } else {
                const newHeader = firstRow.map((_, idx)=>`field${idx + 1}`);
                for(let i = 0; i < transposed.length; i++){
                    const row = transposed[i];
                    const obj = {};
                    newHeader.forEach((h, idx)=>{
                        obj[h] = row[idx];
                    });
                    records.push(obj);
                }
            }
            output.textContent = JSON.stringify(records, null, 2);
            return;
        }
    }
    // Regular CSV (robust parsing, arrays, nested, headerless, etc)
    if (_isRegularCsv && _header && Array.isArray(_segmentationRows)) {
        let header = _header;
        let dataRows = _segmentationRows;
        const isHeaderRow = header.some((cell)=>typeof cell === "string" && isNaN(Number(cell)) && cell.trim() !== "");
        if (!isHeaderRow) header = header.map((_, idx)=>`field${idx + 1}`);
        // Set nested value by dotted path
        function setNested(obj, path, value) {
            const parts = path.split(".");
            let curr = obj;
            for(let i = 0; i < parts.length - 1; i++){
                if (!curr[parts[i]]) curr[parts[i]] = {};
                curr = curr[parts[i]];
            }
            curr[parts[parts.length - 1]] = value;
        }
        const simpleJson = dataRows.map((row)=>{
            const obj = {};
            header.forEach((h, i)=>{
                let val = row[i];
                if (val === undefined || val === "") val = null;
                // Array support: split on ; if present and not quoted
                if (typeof val === "string" && val.includes(";")) {
                    let v = val.trim();
                    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
                    val = v.split(";").map((s)=>s.trim());
                } else if (typeof val === "string" && val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                // Nested support: dotted headers
                if (h.includes(".")) setNested(obj, h, val);
                else obj[h] = val;
            });
            return obj;
        });
        output.textContent = JSON.stringify(simpleJson, null, 2);
        return;
    }
    // Fallback treat as horizontal CSV
    if (_header && Array.isArray(_segmentationRows)) {
        let header = _header;
        let dataRows = _segmentationRows;
        const isHeaderRow = header.some((cell)=>typeof cell === "string" && isNaN(Number(cell)) && cell.trim() !== "");
        if (!isHeaderRow) header = header.map((_, idx)=>`field${idx + 1}`);
        const simpleJson = dataRows.map((row)=>{
            const obj = {};
            header.forEach((h, i)=>{
                obj[h] = row[i];
            });
            return obj;
        });
        output.textContent = JSON.stringify(simpleJson, null, 2);
        return;
    }
}
// JSON validation for manual input
validateJsonButton?.addEventListener('click', ()=>{
    if (!jsonInput || !jsonValidationResult) return;
    const raw = jsonInput.value.trim();
    if (!raw) {
        jsonValidationResult.textContent = "No input!";
        jsonValidationResult.style.color = "red";
        return;
    }
    try {
        const parsed = JSON.parse(raw);
        jsonValidationResult.textContent = "Valid JSON!\n\n" + JSON.stringify(parsed, null, 2);
        jsonValidationResult.style.color = "green";
    } catch (e) {
        jsonValidationResult.textContent = "Invalid JSON: " + e.message;
        jsonValidationResult.style.color = "red";
    }
});
// UI event listeners for type checkboxes
document.addEventListener('DOMContentLoaded', ()=>{
    [
        'all',
        'retail',
        'ge',
        'league'
    ].forEach((id)=>{
        document.getElementById(id)?.addEventListener('change', updateOutput);
    });
});
// Copy and download buttons
document.getElementById('copyButton')?.addEventListener('click', ()=>{
    if (output) navigator.clipboard.writeText(output.textContent || '');
});
document.getElementById('downloadButton')?.addEventListener('click', ()=>{
    if (output) {
        const blob = new Blob([
            output.textContent || ''
        ], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'result.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

},{}]},["klwky","8Ekvk"], "8Ekvk", "parcelRequire8bbe", {})

//# sourceMappingURL=AMERconvert.0f5c217b.js.map
