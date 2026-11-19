/**
 * mAyaNet Javascript Library
 *
 * @category Library
 * @package  Script Loading
 * @author   Murat AKSARAY <web@murataksaray.com>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://www.mayanets.com/
 *
 */

import { EventEmitter } from "node:events";

export class Script {
    static cache = new Map();
    static emitter = new EventEmitter();

    static Load(url, timeout = 10000) {
        if (Script.cache.has(url)) {
            return Script.cache.get(url);
        }
        const promise = new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${url}"]`)) {
                Script.emitEvent("loaded", url);
                resolve();
                return;
            }
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.defer = true;
            script.src = url;
            const timer = setTimeout(() => {
                Script.emitEvent("timeout", url);
                reject(new Error(`Script yükleme zaman aşımına uğradı: ${url}`));
            }, timeout);
            script.onload = () => {
                clearTimeout(timer);
                Script.emitEvent("loaded", url);
                resolve();
            };
            script.onerror = () => {
                clearTimeout(timer);
                Script.emitEvent("error", url);
                reject(new Error(`Script yüklenemedi: ${url}`));
            };
            document.head.appendChild(script);
        });
        Script.cache.set(url, promise);
        return promise;
    }

    static LoadAll(urls, timeout = 10000) {
        const promises = urls.map(url => Script.Load(url, timeout));
        return Promise.all(promises);
    }

    static async LoadSequential(urls, timeout = 10000) {
        for (const url of urls) {
            await Script.Load(url, timeout);
        }
    }

    static clearCache(url) {
        Script.cache.delete(url);
    }

    static clearAllCache() {
        Script.cache.clear();
    }

    static onEvent(event, listener) {
        Script.emitter.on(event, listener);
    }

    static onceEvent(event, listener) {
        Script.emitter.once(event, listener);
    }

    static removeEvent(event, listener) {
        Script.emitter.removeListener(event, listener);
    }

    static emitEvent(event, url) {
        const payload = { event, url };
        Script.emitter.emit(event, payload);
    }
}
