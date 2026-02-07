/**
 * Vite plugin: inyecta un polyfill de MessageChannel al inicio de cada chunk del servidor.
 * Solo para build de producción (Cloudflare). No afecta dev local.
 * Soluciona: "MessageChannel is not defined" en Astro + React 19 + Cloudflare Pages.
 */
const MESSAGECHANNEL_POLYFILL = `(function(){if(typeof globalThis.MessageChannel!=="undefined")return;var noop=function(){};globalThis.MessageChannel=function MessageChannel(){var self=this;var port1={onmessage:null,postMessage:function(data){if(port2.onmessage)Promise.resolve().then(function(){port2.onmessage({data:data})})}};var port2={onmessage:null,postMessage:function(data){if(port1.onmessage)Promise.resolve().then(function(){port1.onmessage({data:data})})}};this.port1=port1;this.port2=port2;};})();
`;

export function messageChannelPolyfillPlugin() {
  return {
    name: "messagechannel-polyfill",
    apply: "build",
    enforce: "pre",
    generateBundle(_, bundle) {
      for (const [id, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.code && id.endsWith(".mjs")) {
          chunk.code = MESSAGECHANNEL_POLYFILL + chunk.code;
        }
      }
    },
  };
}
