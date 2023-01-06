/*! For license information please see service-worker.js.LICENSE.txt */
!function(){"use strict";var e={392:function(){try{self["workbox:core:6.5.3"]&&_()}catch(e){}},606:function(){try{self["workbox:precaching:6.5.3"]&&_()}catch(e){}},519:function(){try{self["workbox:routing:6.5.3"]&&_()}catch(e){}},907:function(){try{self["workbox:strategies:6.5.3"]&&_()}catch(e){}}},t={};function r(n){var a=t[n];if(void 0!==a)return a.exports;var i=t[n]={exports:{}};return e[n](i,i.exports,r),i.exports}!function(){function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}function t(){t=function(){return r};var r={},n=Object.prototype,a=n.hasOwnProperty,i="function"==typeof Symbol?Symbol:{},c=i.iterator||"@@iterator",o=i.asyncIterator||"@@asyncIterator",s=i.toStringTag||"@@toStringTag";function u(e,t,r){return Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{u({},"")}catch(C){u=function(e,t,r){return e[t]=r}}function f(e,t,r,n){var a=t&&t.prototype instanceof p?t:p,i=Object.create(a.prototype),c=new O(n||[]);return i._invoke=function(e,t,r){var n="suspendedStart";return function(a,i){if("executing"===n)throw new Error("Generator is already running");if("completed"===n){if("throw"===a)throw i;return P()}for(r.method=a,r.arg=i;;){var c=r.delegate;if(c){var o=m(c,r);if(o){if(o===h)continue;return o}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if("suspendedStart"===n)throw n="completed",r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);n="executing";var s=l(e,t,r);if("normal"===s.type){if(n=r.done?"completed":"suspendedYield",s.arg===h)continue;return{value:s.arg,done:r.done}}"throw"===s.type&&(n="completed",r.method="throw",r.arg=s.arg)}}}(e,r,c),i}function l(e,t,r){try{return{type:"normal",arg:e.call(t,r)}}catch(C){return{type:"throw",arg:C}}}r.wrap=f;var h={};function p(){}function v(){}function d(){}var y={};u(y,c,(function(){return this}));var b=Object.getPrototypeOf,x=b&&b(b(S([])));x&&x!==n&&a.call(x,c)&&(y=x);var g=d.prototype=p.prototype=Object.create(y);function w(e){["next","throw","return"].forEach((function(t){u(e,t,(function(e){return this._invoke(t,e)}))}))}function k(t,r){function n(i,c,o,s){var u=l(t[i],t,c);if("throw"!==u.type){var f=u.arg,h=f.value;return h&&"object"==e(h)&&a.call(h,"__await")?r.resolve(h.__await).then((function(e){n("next",e,o,s)}),(function(e){n("throw",e,o,s)})):r.resolve(h).then((function(e){f.value=e,o(f)}),(function(e){return n("throw",e,o,s)}))}s(u.arg)}var i;this._invoke=function(e,t){function a(){return new r((function(r,a){n(e,t,r,a)}))}return i=i?i.then(a,a):a()}}function m(e,t){var r=e.iterator[t.method];if(void 0===r){if(t.delegate=null,"throw"===t.method){if(e.iterator.return&&(t.method="return",t.arg=void 0,m(e,t),"throw"===t.method))return h;t.method="throw",t.arg=new TypeError("The iterator does not provide a 'throw' method")}return h}var n=l(r,e.iterator,t.arg);if("throw"===n.type)return t.method="throw",t.arg=n.arg,t.delegate=null,h;var a=n.arg;return a?a.done?(t[e.resultName]=a.value,t.next=e.nextLoc,"return"!==t.method&&(t.method="next",t.arg=void 0),t.delegate=null,h):a:(t.method="throw",t.arg=new TypeError("iterator result is not an object"),t.delegate=null,h)}function E(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function _(e){var t=e.completion||{};t.type="normal",delete t.arg,e.completion=t}function O(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(E,this),this.reset(!0)}function S(e){if(e){var t=e[c];if(t)return t.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var r=-1,n=function t(){for(;++r<e.length;)if(a.call(e,r))return t.value=e[r],t.done=!1,t;return t.value=void 0,t.done=!0,t};return n.next=n}}return{next:P}}function P(){return{value:void 0,done:!0}}return v.prototype=d,u(g,"constructor",d),u(d,"constructor",v),v.displayName=u(d,s,"GeneratorFunction"),r.isGeneratorFunction=function(e){var t="function"==typeof e&&e.constructor;return!!t&&(t===v||"GeneratorFunction"===(t.displayName||t.name))},r.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,d):(e.__proto__=d,u(e,s,"GeneratorFunction")),e.prototype=Object.create(g),e},r.awrap=function(e){return{__await:e}},w(k.prototype),u(k.prototype,o,(function(){return this})),r.AsyncIterator=k,r.async=function(e,t,n,a,i){void 0===i&&(i=Promise);var c=new k(f(e,t,n,a),i);return r.isGeneratorFunction(t)?c:c.next().then((function(e){return e.done?e.value:c.next()}))},w(g),u(g,s,"Generator"),u(g,c,(function(){return this})),u(g,"toString",(function(){return"[object Generator]"})),r.keys=function(e){var t=[];for(var r in e)t.push(r);return t.reverse(),function r(){for(;t.length;){var n=t.pop();if(n in e)return r.value=n,r.done=!1,r}return r.done=!0,r}},r.values=S,O.prototype={constructor:O,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(_),!e)for(var t in this)"t"===t.charAt(0)&&a.call(this,t)&&!isNaN(+t.slice(1))&&(this[t]=void 0)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var t=this;function r(r,n){return c.type="throw",c.arg=e,t.next=r,n&&(t.method="next",t.arg=void 0),!!n}for(var n=this.tryEntries.length-1;n>=0;--n){var i=this.tryEntries[n],c=i.completion;if("root"===i.tryLoc)return r("end");if(i.tryLoc<=this.prev){var o=a.call(i,"catchLoc"),s=a.call(i,"finallyLoc");if(o&&s){if(this.prev<i.catchLoc)return r(i.catchLoc,!0);if(this.prev<i.finallyLoc)return r(i.finallyLoc)}else if(o){if(this.prev<i.catchLoc)return r(i.catchLoc,!0)}else{if(!s)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return r(i.finallyLoc)}}}},abrupt:function(e,t){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&a.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var i=n;break}}i&&("break"===e||"continue"===e)&&i.tryLoc<=t&&t<=i.finallyLoc&&(i=null);var c=i?i.completion:{};return c.type=e,c.arg=t,i?(this.method="next",this.next=i.finallyLoc,h):this.complete(c)},complete:function(e,t){if("throw"===e.type)throw e.arg;return"break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=this.arg=e.arg,this.method="return",this.next="end"):"normal"===e.type&&t&&(this.next=t),h},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var r=this.tryEntries[t];if(r.finallyLoc===e)return this.complete(r.completion,r.afterLoc),_(r),h}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var r=this.tryEntries[t];if(r.tryLoc===e){var n=r.completion;if("throw"===n.type){var a=n.arg;_(r)}return a}}throw new Error("illegal catch attempt")},delegateYield:function(e,t,r){return this.delegate={iterator:S(e),resultName:t,nextLoc:r},"next"===this.method&&(this.arg=void 0),h}},r}function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t,r,n,a,i,c){try{var o=e[i](c),s=o.value}catch(u){return void r(u)}o.done?t(s):Promise.resolve(s).then(n,a)}function o(e){return function(){var t=this,r=arguments;return new Promise((function(n,a){var i=e.apply(t,r);function o(e){c(i,n,a,o,s,"next",e)}function s(e){c(i,n,a,o,s,"throw",e)}o(void 0)}))}}r(392);var s=null;function u(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function f(e,t,r){return t&&u(e.prototype,t),r&&u(e,r),Object.defineProperty(e,"prototype",{writable:!1}),e}function l(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function h(e,t){return h=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},h(e,t)}function p(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&h(e,t)}function v(e){return v=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},v(e)}function d(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}function y(t,r){if(r&&("object"===e(r)||"function"===typeof r))return r;if(void 0!==r)throw new TypeError("Derived constructors may only return object or undefined");return function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(t)}function b(e){var t=d();return function(){var r,n=v(e);if(t){var a=v(this).constructor;r=Reflect.construct(n,arguments,a)}else r=n.apply(this,arguments);return y(this,r)}}function x(e,t,r){return x=d()?Reflect.construct.bind():function(e,t,r){var n=[null];n.push.apply(n,t);var a=new(Function.bind.apply(e,n));return r&&h(a,r.prototype),a},x.apply(null,arguments)}function g(e){var t="function"===typeof Map?new Map:void 0;return g=function(e){if(null===e||(r=e,-1===Function.toString.call(r).indexOf("[native code]")))return e;var r;if("function"!==typeof e)throw new TypeError("Super expression must either be null or a function");if("undefined"!==typeof t){if(t.has(e))return t.get(e);t.set(e,n)}function n(){return x(e,arguments,v(this).constructor)}return n.prototype=Object.create(e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),h(n,e)},g(e)}var w=function(e){for(var t=e,r=arguments.length,n=new Array(r>1?r-1:0),a=1;a<r;a++)n[a-1]=arguments[a];return n.length>0&&(t+=" :: ".concat(JSON.stringify(n))),t},k=function(e){p(r,e);var t=b(r);function r(e,n){var a;l(this,r);var i=w(e,n);return(a=t.call(this,i)).name=e,a.details=n,a}return f(r)}(g(Error)),m=new Set;var E,_={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:"undefined"!==typeof registration?registration.scope:""},O=function(e){return[_.prefix,e,_.suffix].filter((function(e){return e&&e.length>0})).join("-")},S=function(e){!function(e){for(var t=0,r=Object.keys(_);t<r.length;t++)e(r[t])}((function(t){"string"===typeof e[t]&&(_[t]=e[t])}))},P=function(e){return e||O(_.precache)},C=function(e){return e||O(_.runtime)};function R(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function j(e,t){if(e){if("string"===typeof e)return R(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?R(e,t):void 0}}function T(e,t){var r="undefined"!==typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=j(e))||t&&e&&"number"===typeof e.length){r&&(e=r);var n=0,a=function(){};return{s:a,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,c=!0,o=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return c=e.done,e},e:function(e){o=!0,i=e},f:function(){try{c||null==r.return||r.return()}finally{if(o)throw i}}}}function N(e,t){var r,n=new URL(e),a=T(t);try{for(a.s();!(r=a.n()).done;){var i=r.value;n.searchParams.delete(i)}}catch(c){a.e(c)}finally{a.f()}return n.href}function L(e,t,r,n){return q.apply(this,arguments)}function q(){return(q=o(t().mark((function e(r,n,a,i){var c,o,s,u,f,l,h;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(c=N(n.url,a),n.url!==c){e.next=3;break}return e.abrupt("return",r.match(n,i));case 3:return o=Object.assign(Object.assign({},i),{ignoreSearch:!0}),e.next=6,r.keys(n,o);case 6:s=e.sent,u=T(s),e.prev=8,u.s();case 10:if((f=u.n()).done){e.next=17;break}if(l=f.value,h=N(l.url,a),c!==h){e.next=15;break}return e.abrupt("return",r.match(l,i));case 15:e.next=10;break;case 17:e.next=22;break;case 19:e.prev=19,e.t0=e.catch(8),u.e(e.t0);case 22:return e.prev=22,u.f(),e.finish(22);case 25:return e.abrupt("return");case 26:case"end":return e.stop()}}),e,null,[[8,19,22,25]])})))).apply(this,arguments)}function A(){if(void 0===E){var e=new Response("");if("body"in e)try{new Response(e.body),E=!0}catch(t){E=!1}E=!1}return E}var I=f((function e(){var t=this;l(this,e),this.promise=new Promise((function(e,r){t.resolve=e,t.reject=r}))}));function K(){return F.apply(this,arguments)}function F(){return(F=o(t().mark((function e(){var r,n,a;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:0,r=T(m),e.prev=2,r.s();case 4:if((n=r.n()).done){e.next=11;break}return a=n.value,e.next=8,a();case 8:0;case 9:e.next=4;break;case 11:e.next=16;break;case 13:e.prev=13,e.t0=e.catch(2),r.e(e.t0);case 16:return e.prev=16,r.f(),e.finish(16);case 19:0;case 20:case"end":return e.stop()}}),e,null,[[2,13,16,19]])})))).apply(this,arguments)}var D=function(e){return new URL(String(e),location.href).href.replace(new RegExp("^".concat(location.origin)),"")};function U(e){return new Promise((function(t){return setTimeout(t,e)}))}function G(e,t){return M.apply(this,arguments)}function M(){return(M=o(t().mark((function e(r,n){var a,i,c,o,s,u;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(a=null,r.url&&(i=new URL(r.url),a=i.origin),a===self.location.origin){e.next=4;break}throw new k("cross-origin-copy-response",{origin:a});case 4:if(c=r.clone(),o={headers:new Headers(c.headers),status:c.status,statusText:c.statusText},s=n?n(o):o,!A()){e.next=11;break}e.t0=c.body,e.next=14;break;case 11:return e.next=13,c.blob();case 13:e.t0=e.sent;case 14:return u=e.t0,e.abrupt("return",new Response(u,s));case 16:case"end":return e.stop()}}),e)})))).apply(this,arguments)}r(606);function W(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var r=null==e?null:"undefined"!==typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=r){var n,a,i=[],c=!0,o=!1;try{for(r=r.call(e);!(c=(n=r.next()).done)&&(i.push(n.value),!t||i.length!==t);c=!0);}catch(s){o=!0,a=s}finally{try{c||null==r.return||r.return()}finally{if(o)throw a}}return i}}(e,t)||j(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function B(e){return function(e){if(Array.isArray(e))return R(e)}(e)||function(e){if("undefined"!==typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||j(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}r(907);function H(e){return"string"===typeof e?new Request(e):e}var V=function(){function e(t,r){l(this,e),this._cacheKeys={},Object.assign(this,r),this.event=r.event,this._strategy=t,this._handlerDeferred=new I,this._extendLifetimePromises=[],this._plugins=B(t.plugins),this._pluginStateMap=new Map;var n,a=T(this._plugins);try{for(a.s();!(n=a.n()).done;){var i=n.value;this._pluginStateMap.set(i,{})}}catch(c){a.e(c)}finally{a.f()}this.event.waitUntil(this._handlerDeferred.promise)}return f(e,[{key:"fetch",value:function(e){function t(t){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}(function(){var e=o(t().mark((function e(r){var n,a,i,c,o,s,u,f,l,h,p,v;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=this.event,!("navigate"===(a=H(r)).mode&&n instanceof FetchEvent&&n.preloadResponse)){e.next=9;break}return e.next=5,n.preloadResponse;case 5:if(!(i=e.sent)){e.next=9;break}return e.abrupt("return",i);case 9:c=this.hasCallback("fetchDidFail")?a.clone():null,e.prev=10,o=T(this.iterateCallbacks("requestWillFetch")),e.prev=12,o.s();case 14:if((s=o.n()).done){e.next=21;break}return u=s.value,e.next=18,u({request:a.clone(),event:n});case 18:a=e.sent;case 19:e.next=14;break;case 21:e.next=26;break;case 23:e.prev=23,e.t0=e.catch(12),o.e(e.t0);case 26:return e.prev=26,o.f(),e.finish(26);case 29:e.next=35;break;case 31:if(e.prev=31,e.t1=e.catch(10),!(e.t1 instanceof Error)){e.next=35;break}throw new k("plugin-error-request-will-fetch",{thrownErrorMessage:e.t1.message});case 35:return f=a.clone(),e.prev=36,e.next=39,fetch(a,"navigate"===a.mode?void 0:this._strategy.fetchOptions);case 39:l=e.sent,h=T(this.iterateCallbacks("fetchDidSucceed")),e.prev=42,h.s();case 44:if((p=h.n()).done){e.next=51;break}return v=p.value,e.next=48,v({event:n,request:f,response:l});case 48:l=e.sent;case 49:e.next=44;break;case 51:e.next=56;break;case 53:e.prev=53,e.t2=e.catch(42),h.e(e.t2);case 56:return e.prev=56,h.f(),e.finish(56);case 59:return e.abrupt("return",l);case 62:if(e.prev=62,e.t3=e.catch(36),!c){e.next=68;break}return e.next=68,this.runCallbacks("fetchDidFail",{error:e.t3,event:n,originalRequest:c.clone(),request:f.clone()});case 68:throw e.t3;case 69:case"end":return e.stop()}}),e,this,[[10,31],[12,23,26,29],[36,62],[42,53,56,59]])})));return function(t){return e.apply(this,arguments)}}())},{key:"fetchAndCachePut",value:function(){var e=o(t().mark((function e(r){var n,a;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.fetch(r);case 2:return n=e.sent,a=n.clone(),this.waitUntil(this.cachePut(r,a)),e.abrupt("return",n);case 6:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"cacheMatch",value:function(){var e=o(t().mark((function e(r){var n,a,i,c,o,s,u,f,l,h;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=H(r),i=this._strategy,c=i.cacheName,o=i.matchOptions,e.next=4,this.getCacheKey(n,"read");case 4:return s=e.sent,u=Object.assign(Object.assign({},o),{cacheName:c}),e.next=8,caches.match(s,u);case 8:a=e.sent,f=T(this.iterateCallbacks("cachedResponseWillBeUsed")),e.prev=11,f.s();case 13:if((l=f.n()).done){e.next=23;break}return h=l.value,e.next=17,h({cacheName:c,matchOptions:o,cachedResponse:a,request:s,event:this.event});case 17:if(e.t0=e.sent,e.t0){e.next=20;break}e.t0=void 0;case 20:a=e.t0;case 21:e.next=13;break;case 23:e.next=28;break;case 25:e.prev=25,e.t1=e.catch(11),f.e(e.t1);case 28:return e.prev=28,f.f(),e.finish(28);case 31:return e.abrupt("return",a);case 32:case"end":return e.stop()}}),e,this,[[11,25,28,31]])})));return function(t){return e.apply(this,arguments)}}()},{key:"cachePut",value:function(){var e=o(t().mark((function e(r,n){var a,i,c,o,u,f,l,h,p,v,d,y,b;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a=H(r),e.next=3,U(0);case 3:return e.next=5,this.getCacheKey(a,"write");case 5:i=e.sent,e.next=11;break;case 9:(c=n.headers.get("Vary"))&&s.debug("The response for ".concat(D(i.url)," ")+"has a 'Vary: ".concat(c,"' header. ")+"Consider setting the {ignoreVary: true} option on your strategy to ensure cache matching and deletion works as expected.");case 11:if(n){e.next=14;break}throw new k("cache-put-with-no-response",{url:D(i.url)});case 14:return e.next=16,this._ensureResponseSafeToCache(n);case 16:if(o=e.sent){e.next=20;break}return e.abrupt("return",!1);case 20:return u=this._strategy,f=u.cacheName,l=u.matchOptions,e.next=23,self.caches.open(f);case 23:if(h=e.sent,!(p=this.hasCallback("cacheDidUpdate"))){e.next=31;break}return e.next=28,L(h,i.clone(),["__WB_REVISION__"],l);case 28:e.t0=e.sent,e.next=32;break;case 31:e.t0=null;case 32:return v=e.t0,e.prev=34,e.next=37,h.put(i,p?o.clone():o);case 37:e.next=46;break;case 39:if(e.prev=39,e.t1=e.catch(34),!(e.t1 instanceof Error)){e.next=46;break}if("QuotaExceededError"!==e.t1.name){e.next=45;break}return e.next=45,K();case 45:throw e.t1;case 46:d=T(this.iterateCallbacks("cacheDidUpdate")),e.prev=47,d.s();case 49:if((y=d.n()).done){e.next=55;break}return b=y.value,e.next=53,b({cacheName:f,oldResponse:v,newResponse:o.clone(),request:i,event:this.event});case 53:e.next=49;break;case 55:e.next=60;break;case 57:e.prev=57,e.t2=e.catch(47),d.e(e.t2);case 60:return e.prev=60,d.f(),e.finish(60);case 63:return e.abrupt("return",!0);case 64:case"end":return e.stop()}}),e,this,[[34,39],[47,57,60,63]])})));return function(t,r){return e.apply(this,arguments)}}()},{key:"getCacheKey",value:function(){var e=o(t().mark((function e(r,n){var a,i,c,o,s;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(a="".concat(r.url," | ").concat(n),this._cacheKeys[a]){e.next=24;break}i=r,c=T(this.iterateCallbacks("cacheKeyWillBeUsed")),e.prev=4,c.s();case 6:if((o=c.n()).done){e.next=15;break}return s=o.value,e.t0=H,e.next=11,s({mode:n,request:i,event:this.event,params:this.params});case 11:e.t1=e.sent,i=(0,e.t0)(e.t1);case 13:e.next=6;break;case 15:e.next=20;break;case 17:e.prev=17,e.t2=e.catch(4),c.e(e.t2);case 20:return e.prev=20,c.f(),e.finish(20);case 23:this._cacheKeys[a]=i;case 24:return e.abrupt("return",this._cacheKeys[a]);case 25:case"end":return e.stop()}}),e,this,[[4,17,20,23]])})));return function(t,r){return e.apply(this,arguments)}}()},{key:"hasCallback",value:function(e){var t,r=T(this._strategy.plugins);try{for(r.s();!(t=r.n()).done;){if(e in t.value)return!0}}catch(n){r.e(n)}finally{r.f()}return!1}},{key:"runCallbacks",value:function(){var e=o(t().mark((function e(r,n){var a,i,c;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:a=T(this.iterateCallbacks(r)),e.prev=1,a.s();case 3:if((i=a.n()).done){e.next=9;break}return c=i.value,e.next=7,c(n);case 7:e.next=3;break;case 9:e.next=14;break;case 11:e.prev=11,e.t0=e.catch(1),a.e(e.t0);case 14:return e.prev=14,a.f(),e.finish(14);case 17:case"end":return e.stop()}}),e,this,[[1,11,14,17]])})));return function(t,r){return e.apply(this,arguments)}}()},{key:"iterateCallbacks",value:t().mark((function e(r){var n,a,i,c=this;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:n=T(this._strategy.plugins),e.prev=1,i=t().mark((function e(){var n,i,o;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("function"!==typeof(n=a.value)[r]){e.next=6;break}return i=c._pluginStateMap.get(n),o=function(e){var t=Object.assign(Object.assign({},e),{state:i});return n[r](t)},e.next=6,o;case 6:case"end":return e.stop()}}),e)})),n.s();case 4:if((a=n.n()).done){e.next=8;break}return e.delegateYield(i(),"t0",6);case 6:e.next=4;break;case 8:e.next=13;break;case 10:e.prev=10,e.t1=e.catch(1),n.e(e.t1);case 13:return e.prev=13,n.f(),e.finish(13);case 16:case"end":return e.stop()}}),e,this,[[1,10,13,16]])}))},{key:"waitUntil",value:function(e){return this._extendLifetimePromises.push(e),e}},{key:"doneWaiting",value:function(){var e=o(t().mark((function e(){var r;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!(r=this._extendLifetimePromises.shift())){e.next=5;break}return e.next=3,r;case 3:e.next=0;break;case 5:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"destroy",value:function(){this._handlerDeferred.resolve(null)}},{key:"_ensureResponseSafeToCache",value:function(){var e=o(t().mark((function e(r){var n,a,i,c,o;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:n=r,a=!1,i=T(this.iterateCallbacks("cacheWillUpdate")),e.prev=3,i.s();case 5:if((c=i.n()).done){e.next=18;break}return o=c.value,e.next=9,o({request:this.request,response:n,event:this.event});case 9:if(e.t0=e.sent,e.t0){e.next=12;break}e.t0=void 0;case 12:if(n=e.t0,a=!0,n){e.next=16;break}return e.abrupt("break",18);case 16:e.next=5;break;case 18:e.next=23;break;case 20:e.prev=20,e.t1=e.catch(3),i.e(e.t1);case 23:return e.prev=23,i.f(),e.finish(23);case 26:return a||n&&200!==n.status&&(n=void 0),e.abrupt("return",n);case 28:case"end":return e.stop()}}),e,this,[[3,20,23,26]])})));return function(t){return e.apply(this,arguments)}}()}]),e}(),J=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};l(this,e),this.cacheName=C(t.cacheName),this.plugins=t.plugins||[],this.fetchOptions=t.fetchOptions,this.matchOptions=t.matchOptions}return f(e,[{key:"handle",value:function(e){return W(this.handleAll(e),1)[0]}},{key:"handleAll",value:function(e){e instanceof FetchEvent&&(e={event:e,request:e.request});var t=e.event,r="string"===typeof e.request?new Request(e.request):e.request,n="params"in e?e.params:void 0,a=new V(this,{event:t,request:r,params:n}),i=this._getResponse(a,r,t);return[i,this._awaitComplete(i,a,r,t)]}},{key:"_getResponse",value:function(){var e=o(t().mark((function e(r,n,a){var i,c,o,s,u,f,l;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.runCallbacks("handlerWillStart",{event:a,request:n});case 2:return i=void 0,e.prev=3,e.next=6,this._handle(n,r);case 6:if((i=e.sent)&&"error"!==i.type){e.next=9;break}throw new k("no-response",{url:n.url});case 9:e.next=39;break;case 11:if(e.prev=11,e.t0=e.catch(3),!(e.t0 instanceof Error)){e.next=34;break}c=T(r.iterateCallbacks("handlerDidError")),e.prev=15,c.s();case 17:if((o=c.n()).done){e.next=26;break}return s=o.value,e.next=21,s({error:e.t0,event:a,request:n});case 21:if(!(i=e.sent)){e.next=24;break}return e.abrupt("break",26);case 24:e.next=17;break;case 26:e.next=31;break;case 28:e.prev=28,e.t1=e.catch(15),c.e(e.t1);case 31:return e.prev=31,c.f(),e.finish(31);case 34:if(i){e.next=38;break}throw e.t0;case 38:0;case 39:u=T(r.iterateCallbacks("handlerWillRespond")),e.prev=40,u.s();case 42:if((f=u.n()).done){e.next=49;break}return l=f.value,e.next=46,l({event:a,request:n,response:i});case 46:i=e.sent;case 47:e.next=42;break;case 49:e.next=54;break;case 51:e.prev=51,e.t2=e.catch(40),u.e(e.t2);case 54:return e.prev=54,u.f(),e.finish(54);case 57:return e.abrupt("return",i);case 58:case"end":return e.stop()}}),e,this,[[3,11],[15,28,31,34],[40,51,54,57]])})));return function(t,r,n){return e.apply(this,arguments)}}()},{key:"_awaitComplete",value:function(){var e=o(t().mark((function e(r,n,a,i){var c,o;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,r;case 3:c=e.sent,e.next=8;break;case 6:e.prev=6,e.t0=e.catch(0);case 8:return e.prev=8,e.next=11,n.runCallbacks("handlerDidRespond",{event:i,request:a,response:c});case 11:return e.next=13,n.doneWaiting();case 13:e.next=18;break;case 15:e.prev=15,e.t1=e.catch(8),e.t1 instanceof Error&&(o=e.t1);case 18:return e.next=20,n.runCallbacks("handlerDidComplete",{event:i,request:a,response:c,error:o});case 20:if(n.destroy(),!o){e.next=23;break}throw o;case 23:case"end":return e.stop()}}),e,null,[[0,6],[8,15]])})));return function(t,r,n,a){return e.apply(this,arguments)}}()}]),e}(),Y=function(e){p(n,e);var r=b(n);function n(){var e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return l(this,n),t.cacheName=P(t.cacheName),(e=r.call(this,t))._fallbackToNetwork=!1!==t.fallbackToNetwork,e.plugins.push(n.copyRedirectedCacheableResponsesPlugin),e}return f(n,[{key:"_handle",value:function(){var e=o(t().mark((function e(r,n){var a;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n.cacheMatch(r);case 2:if(!(a=e.sent)){e.next=5;break}return e.abrupt("return",a);case 5:if(!n.event||"install"!==n.event.type){e.next=9;break}return e.next=8,this._handleInstall(r,n);case 8:case 11:return e.abrupt("return",e.sent);case 9:return e.next=11,this._handleFetch(r,n);case 12:case"end":return e.stop()}}),e,this)})));return function(t,r){return e.apply(this,arguments)}}()},{key:"_handleFetch",value:function(){var e=o(t().mark((function e(r,n){var a,i,c,o,u,f;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(i=n.params||{},!this._fallbackToNetwork){e.next=17;break}return c=i.integrity,o=r.integrity,u=!o||o===c,e.next=8,n.fetch(new Request(r,{integrity:"no-cors"!==r.mode?o||c:void 0}));case 8:if(a=e.sent,!c||!u||"no-cors"===r.mode){e.next=15;break}return this._useDefaultCacheabilityPluginIfNeeded(),e.next=13,n.cachePut(r,a.clone());case 13:e.sent;case 15:e.next=18;break;case 17:throw new k("missing-precache-entry",{cacheName:this.cacheName,url:r.url});case 18:e.next=34;break;case 23:e.t0=e.sent;case 24:f=e.t0,s.groupCollapsed("Precaching is responding to: "+D(r.url)),s.log("Serving the precached url: ".concat(D(f instanceof Request?f.url:f))),s.groupCollapsed("View request details here."),s.log(r),s.groupEnd(),s.groupCollapsed("View response details here."),s.log(a),s.groupEnd(),s.groupEnd();case 34:return e.abrupt("return",a);case 35:case"end":return e.stop()}}),e,this)})));return function(t,r){return e.apply(this,arguments)}}()},{key:"_handleInstall",value:function(){var e=o(t().mark((function e(r,n){var a;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return this._useDefaultCacheabilityPluginIfNeeded(),e.next=3,n.fetch(r);case 3:return a=e.sent,e.next=6,n.cachePut(r,a.clone());case 6:if(e.sent){e.next=9;break}throw new k("bad-precaching-response",{url:r.url,status:a.status});case 9:return e.abrupt("return",a);case 10:case"end":return e.stop()}}),e,this)})));return function(t,r){return e.apply(this,arguments)}}()},{key:"_useDefaultCacheabilityPluginIfNeeded",value:function(){var e,t=null,r=0,a=T(this.plugins.entries());try{for(a.s();!(e=a.n()).done;){var i=W(e.value,2),c=i[0],o=i[1];o!==n.copyRedirectedCacheableResponsesPlugin&&(o===n.defaultPrecacheCacheabilityPlugin&&(t=c),o.cacheWillUpdate&&r++)}}catch(s){a.e(s)}finally{a.f()}0===r?this.plugins.push(n.defaultPrecacheCacheabilityPlugin):r>1&&null!==t&&this.plugins.splice(t,1)}}]),n}(J);Y.defaultPrecacheCacheabilityPlugin={cacheWillUpdate:function(e){return o(t().mark((function r(){var n;return t().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if((n=e.response)&&!(n.status>=400)){t.next=3;break}return t.abrupt("return",null);case 3:return t.abrupt("return",n);case 4:case"end":return t.stop()}}),r)})))()}},Y.copyRedirectedCacheableResponsesPlugin={cacheWillUpdate:function(e){return o(t().mark((function r(){var n;return t().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(!(n=e.response).redirected){t.next=7;break}return t.next=4,G(n);case 4:t.t0=t.sent,t.next=8;break;case 7:t.t0=n;case 8:return t.abrupt("return",t.t0);case 9:case"end":return t.stop()}}),r)})))()}};r(519);var z,Q=function(e){if(e&&"object"===typeof e){var t=e,r=t.access,n=t.refresh;if(r&&"string"===typeof r&&n&&"string"===typeof n)return!0}return!1},$=function(){var e=o(t().mark((function e(r,n){var a,i;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch("/account/api/token/refresh/",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({refresh:r}),signal:n});case 2:if((a=e.sent).ok){e.next=5;break}throw new Error("refresh token error");case 5:return e.next=7,a.json();case 7:if(i=e.sent,!Q(i)){e.next=10;break}return e.abrupt("return",i);case 10:throw new Error("Missing token in response.");case 11:case"end":return e.stop()}}),e)})));return function(t,r){return e.apply(this,arguments)}}();!function(e){e.GET_REFRESH_TOKEN="GET_REFRESH_TOKEN",e.REFRESH_TOKEN_RESPONSE="REFRESH_TOKEN_RESPONSE",e.GET_ACCESS_TOKEN="GET_ACCESS_TOKEN",e.ACCESS_TOKEN_RESPONSE="ACCESS_TOKEN_RESPONSE",e.SET_TOKEN="SET_TOKEN",e.LOGOUT="LOGOUT"}(z||(z={}));var X,Z=JSON.parse('{"u2":"standalone_site","i8":"4.0.0-beta.12"}'),ee=["/account/api/token/"];X={prefix:Z.u2,suffix:Z.i8},S(X),self.addEventListener("activate",(function(){return self.clients.claim()})),[{'revision':'a42e5f5342029f512de0d3fb33675296','url':'/index.html'},{'revision':null,'url':'/static/css/main.904dabbf.css'},{'revision':null,'url':'/static/js/178.b4e7c5b8.chunk.js'},{'revision':null,'url':'/static/js/195.f23a0fd1.chunk.js'},{'revision':null,'url':'/static/js/251.8dce0ba7.chunk.js'},{'revision':null,'url':'/static/js/365.fa778a8b.chunk.js'},{'revision':null,'url':'/static/js/376.3d84bc10.chunk.js'},{'revision':null,'url':'/static/js/493.3ef06bda.chunk.js'},{'revision':null,'url':'/static/js/589.80a4300c.chunk.js'},{'revision':null,'url':'/static/js/645.ca2cec31.chunk.js'},{'revision':null,'url':'/static/js/main.1d54abd9.js'},{'revision':null,'url':'/static/media/bbbBackground.2dec4492ef695537c72e.png'},{'revision':'d1ed90ed409bd9c92ec866f16fc06354','url':'/static/media/burger.4bdb266814e6f53ebc7aed126dbe4a9f.svg'},{'revision':null,'url':'/static/media/homepage-banner.3436d31f0759c4d5c461.png'},{'revision':'e5981ba110ea0c787e2faac1f66d5983','url':'/static/media/iko_avatarsvg.746fb0f9b3fdcf14f3c036e504ec382f.svg'},{'revision':'5fba9e6c3b58165c1c4dfa7fc29c0008','url':'/static/media/iko_checklistsvg.151bb24e089a3a97415ea5d51c786171.svg'},{'revision':'46faa9473e39dc48552b2416059e8cf1','url':'/static/media/iko_homesvg.f4360a679c6ffd23d9dd1a3f40c12cca.svg'},{'revision':'9545912a754d284278de2cfd303a612d','url':'/static/media/iko_starsvg.31c694ad48e8103cf76892497aaf15a0.svg'},{'revision':'92cadd4804071ee5fb9a91a0b45d8b5d','url':'/static/media/iko_vuelistesvg.705deeb84cb2752068f446c4fb8aa4a3.svg'},{'revision':'8b2613410564d40845fc244fa284e732','url':'/static/media/iko_webinairesvg.2d2918d4d6034e37c5914f6c09f10314.svg'},{'revision':'6c22cb928fdac1aef0f53bc9205e3ade','url':'/static/media/logo_marsha.508683950a8451e076c9b2a9d64743a6.svg'},{'revision':null,'url':'/static/media/roboto-bold.75371f53f06181df75f1.ttf'},{'revision':null,'url':'/static/media/roboto-medium.7429a63c09f79a1760b0.ttf'},{'revision':null,'url':'/static/media/roboto-regular.a8d6ac03c7b96b7acb62.ttf'},{'revision':null,'url':'/static/media/telescope.bd491e68d685713d626e.png'}],self.addEventListener("install",(function(e){e.waitUntil(self.skipWaiting())})),self.addEventListener("activate",(function(e){e.waitUntil(self.clients.claim())})),self.addEventListener("message",(function(e){e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),self.addEventListener("fetch",(function(e){!ee.some((function(t){return e.request.url.includes(t)}))&&e.request.url.includes("/api")&&e.respondWith(fetch(e.request).then(function(){var r=o(t().mark((function r(n){var a,c,s;return t().wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if(401===n.status){r.next=2;break}return r.abrupt("return",n);case 2:return a=new Promise((function(e){setTimeout(e,1500,n)})),s=new Promise((function(r){var a=Math.floor(Math.random()*Date.now());c=function(c){var s=e.request,u=e.clientId,f=r,l=c.data,h=l.action,p=l.requestId,v=l.valueClient;if(p===a){var d=function(){self.clients.get(u).then((function(e){e&&e.postMessage({action:z.LOGOUT})})),f(n)};switch(h){case z.ACCESS_TOKEN_RESPONSE:var y=v;if(!y){d();break}var b=function(){var e=o(t().mark((function e(){var r;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,fetch(s,i(i({},s),{},{headers:i(i({},s.headers),{},{Authorization:"Bearer ".concat(y)})}));case 3:if(401!==(r=e.sent).status){e.next=6;break}throw new Error("Access token is not valid");case 6:f(r),e.next=12;break;case 9:e.prev=9,e.t0=e.catch(0),d();case 12:case"end":return e.stop()}}),e,null,[[0,9]])})));return function(){return e.apply(this,arguments)}}();b();break;case z.REFRESH_TOKEN_RESPONSE:var x=v;if(!x){d();break}o(t().mark((function e(){var r;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,$(x);case 3:return r=e.sent,self.clients.get(u).then((function(e){e&&e.postMessage({action:z.SET_TOKEN,valueSW:r})})),e.t0=f,e.next=8,fetch(s,i(i({},s),{},{headers:i(i({},s.headers),{},{Authorization:"Bearer ".concat(r.access)})}));case 8:e.t1=e.sent,(0,e.t0)(e.t1),e.next=15;break;case 12:e.prev=12,e.t2=e.catch(0),self.clients.get(u).then((function(e){e&&e.postMessage({action:z.GET_ACCESS_TOKEN,requestId:a})}));case 15:case"end":return e.stop()}}),e,null,[[0,12]])})))()}}},self.addEventListener("message",c),self.clients.get(e.clientId).then((function(e){e&&e.postMessage({action:z.GET_REFRESH_TOKEN,requestId:a})}))})),r.next=6,Promise.race([s,a]).then((function(e){return self.removeEventListener("message",c),e}));case 6:return r.abrupt("return",r.sent);case 7:case"end":return r.stop()}}),r)})));return function(e){return r.apply(this,arguments)}}()))}))}()}();
//# sourceMappingURL=service-worker.js.map