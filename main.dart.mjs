// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.setInt16),
      AD: x0 => x0.height,
      AE: x0 => x0.languages,
      AF: x0 => x0.deltaX,
      AG: x0 => x0.first(),
      AH: (x0,x1) => x0.add(x1),
      AI: x0 => x0.offsetWidth,
      AJ: x0 => x0.close(),
      AK: () => new FileReader(),
      AL: (x0,x1) => x0.getItem(x1),
      AM: x0 => x0.width,
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (x0,x1) => x0.observe(x1),
      BF: x0 => x0.wheelDeltaY,
      BG: x0 => x0.next(),
      BH: x0 => x0.data,
      BI: x0 => x0.stopPropagation(),
      BJ: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      BK: (x0,x1) => x0.readAsArrayBuffer(x1),
      BL: x0 => x0.localStorage,
      BM: (x0,x1) => { x0.height = x1 },
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      CF: x0 => x0.wheelDeltaX,
      CG: x0 => x0.current(),
      CH: (x0,x1) => { x0.scrollTop = x1 },
      CI: x0 => x0.disabled,
      CJ: (x0,x1) => x0.decode(x1),
      CK: x0 => ({type: x0}),
      CL: (x0,x1) => x0.key(x1),
      CM: x0 => x0.height,
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.setInt8),
      DD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      DE: x0 => new ResizeObserver(x0),
      DF: x0 => x0.key,
      DG: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      DH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      DI: (x0,x1) => { x0.min = x1 },
      DJ: x0 => x0.displayHeight,
      DK: (x0,x1) => new Blob(x0,x1),
      DL: x0 => x0.length,
      DM: (x0,x1) => { x0.scale = x1 },
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: Function.prototype.call.bind(DataView.prototype.getInt8),
      ED: x0 => x0.tabIndex,
      EE: (x0,x1) => x0.getPropertyValue(x1),
      EF: x0 => x0.identifier,
      EG: x0 => x0.v8BreakIterator,
      EH: (x0,x1) => { x0.value = x1 },
      EI: (x0,x1) => { x0.max = x1 },
      EJ: x0 => x0.displayWidth,
      EK: x0 => globalThis.URL.createObjectURL(x0),
      EL: (x0,x1,x2) => x0.setItem(x1,x2),
      EM: x0 => x0.numPages,
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      FD: (x0,x1) => x0.contains(x1),
      FE: x0 => globalThis.parseFloat(x0),
      FF: x0 => x0.touches,
      FG: () => globalThis.Intl,
      FH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      FI: (x0,x1) => { x0.disabled = x1 },
      FJ: x0 => x0.duration,
      FK: x0 => x0.size,
      FL: (x0,x1) => x0.removeItem(x1),
      FM: x0 => x0.promise,
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: (x0,x1) => x0.getComputedStyle(x1),
      GF: x0 => x0.pressure,
      GG: (x0,x1) => x0.segment(x1),
      GH: (x0,x1) => { x0.value = x1 },
      GI: (x0,x1) => { x0.scrollLeft = x1 },
      GJ: x0 => x0.image,
      GK: x0 => x0.name,
      GL: x0 => x0.hostElement,
      GM: (x0,x1) => { x0.cMapPacked = x1 },
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.documentElement,
      HF: x0 => x0.tiltY,
      HG: x0 => x0.index,
      HH: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      HI: (x0,x1) => { x0.spellcheck = x1 },
      HJ: () => globalThis.window.ImageDecoder,
      HK: x0 => x0.type,
      HL: x0 => x0.location,
      HM: (x0,x1) => { x0.cMapUrl = x1 },
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: x0 => x0.computedStyleMap(),
      IF: x0 => x0.tiltX,
      IG: x0 => x0.next(),
      IH: x0 => x0.value,
      II: (x0,x1) => { x0.disabled = x1 },
      IJ: (x0,x1,x2) => x0.open(x1,x2),
      IK: x0 => x0.result,
      IL: (x0,x1) => x0.getModifierState(x1),
      IM: (x0,x1) => { x0.data = x1 },
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.target,
      JE: (x0,x1) => x0.get(x1),
      JF: x0 => x0.pointerType,
      JG: x0 => x0.value,
      JH: x0 => x0.selectionDirection,
      JI: (x0,x1) => x0.transferFromImageBitmap(x1),
      JJ: () => globalThis.window,
      JK: x0 => x0.length,
      JL: x0 => x0.metaKey,
      JM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (o, p) => p in o,
      KF: x0 => x0.pointerId,
      KG: x0 => x0.done,
      KH: x0 => x0.selectionStart,
      KI: (x0,x1) => x0.getContext(x1),
      KJ: (x0,x1) => x0.get(x1),
      KK: x0 => x0.files,
      KL: x0 => x0.altKey,
      KM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      LD: x0 => x0.clientX,
      LE: (x0,x1) => { x0.textContent = x1 },
      LF: x0 => x0.getCoalescedEvents(),
      LG: (o, m, a) => o[m].apply(o, a),
      LH: x0 => x0.selectionEnd,
      LI: (x0,x1) => { x0.height = x1 },
      LJ: x0 => x0.body,
      LK: (x0,x1) => { x0.display = x1 },
      LL: x0 => x0.ctrlKey,
      LM: (x0,x1,x2) => x0.getCurrentPosition(x1,x2),
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MF: (x0,x1) => x0.getModifierState(x1),
      MG: x0 => x0.iterator,
      MH: x0 => x0.value,
      MI: (x0,x1) => { x0.width = x1 },
      MJ: x0 => x0.headers,
      MK: x0 => x0.style,
      ML: x0 => x0.isComposing,
      MM: () => globalThis.Notification.requestPermission(),
      N: o => String(o),
      NB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      NC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      ND: x0 => x0.getBoundingClientRect(),
      NE: x0 => x0.matches,
      NF: s => s.trimLeft(),
      NG: () => globalThis.Symbol,
      NH: x0 => x0.selectionDirection,
      NI: x0 => x0.height,
      NJ: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      NK: (x0,x1) => { x0.accept = x1 },
      NL: x0 => x0.code,
      NM: x0 => ({video: x0}),
      O: o => o === undefined,
      OB: x0 => new Uint16Array(x0),
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: (x0,x1) => x0.matchMedia(x1),
      OF: s => s.toUpperCase(),
      OG: (x0,x1) => new Intl.Segmenter(x0,x1),
      OH: x0 => x0.selectionStart,
      OI: x0 => x0.width,
      OJ: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      OK: (x0,x1) => { x0.multiple = x1 },
      OL: x0 => x0.repeat,
      OM: (x0,x1) => x0.getUserMedia(x1),
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: x0 => x0.matches,
      PF: x0 => x0.pop(),
      PG: x0 => x0.Segmenter,
      PH: x0 => x0.selectionEnd,
      PI: x0 => x0.rasterEndMilliseconds,
      PJ: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      PK: (x0,x1) => { x0.draggable = x1 },
      PL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PM: x0 => x0.getVideoTracks(),
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      QC: (x0,x1) => x0.item(x1),
      QD: Date.now,
      QE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      QF: x0 => x0.flags,
      QG: x0 => x0.buffer,
      QH: x0 => x0.keyCode,
      QI: x0 => x0.rasterStartMilliseconds,
      QJ: (x0,x1) => globalThis.fetch(x0,x1),
      QK: (x0,x1) => { x0.type = x1 },
      QL: x0 => x0.userAgent,
      QM: x0 => x0.stop(),
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: f => f.dartFunction,
      RF: (a, s) => a.join(s),
      RG: x0 => x0.wasmMemory,
      RH: (x0,x1) => x0.scrollIntoView(x1),
      RI: x0 => x0.imageBitmaps,
      RJ: (x0,x1) => x0.get(x1),
      RK: (x0,x1) => x0.createElement(x1),
      RL: x0 => x0.navigator,
      RM: x0 => x0.active,
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: x0 => new Float32Array(x0),
      SC: (x0,x1) => x0.querySelectorAll(x1),
      SD: (a, l) => a.length = l,
      SE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      SF: (x0,x1) => x0.error(x1),
      SG: () => globalThis.window._flutter_skwasmInstance,
      SH: x0 => x0.multiViewEnabled,
      SI: x0 => x0.canvasKitMaximumSurfaces,
      SJ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      SK: () => globalThis.document,
      SL: (x0,x1) => x0.replace(x1),
      SM: x0 => ({audio: x0}),
      T: o => o instanceof RegExp,
      TB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      TC: (x0,x1) => x0.getAttribute(x1),
      TD: (x0,x1) => x0.closest(x1),
      TE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      TF: () => globalThis.console,
      TG: () => new TextDecoder(),
      TH: (x0,x1) => x0.replaceWith(x1),
      TI: (a, i) => a.splice(i, 1),
      TJ: (x0,x1) => x0.forEach(x1),
      TK: x0 => new Blob(x0),
      TL: x0 => x0.origin,
      TM: x0 => x0.getAudioTracks(),
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: x0 => x0.bottom,
      UE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      UF: s => s.trimRight(),
      UG: (d, digits) => d.toFixed(digits),
      UH: (x0,x1) => { x0.type = x1 },
      UI: a => a.pop(),
      UJ: x0 => x0.statusText,
      UK: x0 => globalThis.URL.revokeObjectURL(x0),
      UL: x0 => x0.location,
      UM: x0 => x0.permissions,
      V: o => o,
      VB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      VC: (x0,x1) => x0.appendChild(x1),
      VD: x0 => x0.top,
      VE: (o, i) => o[i],
      VF: x0 => x0.blur(),
      VG: x0 => x0.maxHeight,
      VH: (x0,x1) => { x0.className = x1 },
      VI: x0 => new WeakRef(x0),
      VJ: x0 => x0.url,
      VK: (x0,x1) => { x0.download = x1 },
      VL: (x0,x1) => x0.getElementById(x1),
      VM: x0 => x0.geolocation,
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: x0 => new ArrayBuffer(x0),
      WC: (x0,x1) => x0.append(x1),
      WD: x0 => x0.right,
      WE: o => o.length,
      WF: x0 => x0.button,
      WG: x0 => x0.maxWidth,
      WH: (x0,x1) => { x0.tabIndex = x1 },
      WI: x0 => x0.deref(),
      WJ: x0 => x0.status,
      WK: (x0,x1) => { x0.target = x1 },
      WL: (x0,x1,x2) => x0.setAttribute(x1,x2),
      WM: x0 => x0.mediaDevices,
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.left,
      XE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      XF: x0 => x0.innerHeight,
      XG: x0 => x0.minHeight,
      XH: (x0,x1) => { x0.name = x1 },
      XI: () => globalThis.WeakRef,
      XJ: x0 => x0.getReader(),
      XK: (x0,x1) => { x0.href = x1 },
      XL: (x0,x1) => x0.append(x1),
      XM: x0 => x0.baseURI,
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientY,
      YE: x0 => x0.language,
      YF: x0 => x0.innerWidth,
      YG: x0 => x0.minWidth,
      YH: (x0,x1) => { x0.placeholder = x1 },
      YI: (a, t) => a.concat(t),
      YJ: x0 => x0.read(),
      YK: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      YL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      YM: x0 => x0.abort(),
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.clientX,
      ZE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      ZF: x0 => x0.height,
      ZG: x0 => x0.debugSkipFontRetryDelay,
      ZH: (x0,x1) => { x0.autocomplete = x1 },
      ZI: (map, o, v) => map.set(o, v),
      ZJ: x0 => x0.cancel(),
      ZK: x0 => x0.arrayBuffer(),
      ZL: x0 => x0.remove(),
      ZM: (x0,x1) => x0.querySelector(x1),
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.changedTouches,
      aE: () => globalThis.window.FinalizationRegistry,
      aF: x0 => x0.width,
      aG: x0 => x0.status,
      aH: (x0,x1) => { x0.name = x1 },
      aI: (map, o) => map.get(o),
      aJ: x0 => x0.value,
      aK: (x0,x1) => { x0.height = x1 },
      aL: x0 => x0.body,
      aM: (x0,x1) => { x0.id = x1 },
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      bC: x0 => x0.console,
      bD: x0 => x0.offsetY,
      bE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bF: x0 => x0.clientHeight,
      bG: (x0,x1,x2) => x0.set(x1,x2),
      bH: (x0,x1) => { x0.placeholder = x1 },
      bI: () => new WeakMap(),
      bJ: x0 => x0.done,
      bK: (x0,x1) => { x0.width = x1 },
      bL: (x0,x1) => { x0.innerHTML = x1 },
      bM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.offsetX,
      cE: x0 => new window.FinalizationRegistry(x0),
      cF: x0 => x0.clientWidth,
      cG: x0 => x0.arrayBuffer(),
      cH: (x0,x1) => { x0.action = x1 },
      cI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      cJ: x0 => x0.body,
      cK: x0 => x0.convertToBlob(),
      cL: x0 => x0.document,
      cM: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.type,
      dE: (x0,x1) => x0.unregister(x1),
      dF: (x0,x1) => { x0.content = x1 },
      dG: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      dH: (x0,x1) => { x0.method = x1 },
      dI: (a, s, e) => a.slice(s, e),
      dJ: x0 => x0.headers,
      dK: (x0,x1,x2) => new ImageData(x0,x1,x2),
      dL: (x0,x1) => { x0.exports = x1 },
      dM: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.maxTouchPoints,
      eE: (x0,x1) => x0.contains(x1),
      eF: (x0,x1) => { x0.name = x1 },
      eG: (x0,x1) => x0.fetch(x1),
      eH: (x0,x1) => { x0.noValidate = x1 },
      eI: (o, p) => p in o,
      eJ: x0 => x0.signal,
      eK: (x0,x1) => x0.getContext(x1),
      eL: (x0,x1) => { x0.module = x1 },
      eM: x0 => x0.height,
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o) => new DataView(b, o),
      fC: x0 => x0.length,
      fD: x0 => x0.platform,
      fE: (s) => +s,
      fF: x0 => x0.head,
      fG: x0 => x0.fontFallbackBaseUrl,
      fH: (x0,x1) => x0.removeAttribute(x1),
      fI: x0 => x0.groups,
      fJ: (x0,x1) => x0.getRandomValues(x1),
      fK: (x0,x1) => new OffscreenCanvas(x0,x1),
      fL: x0 => x0.head,
      fM: x0 => x0.width,
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: x0 => x0.body,
      gE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      gF: (x0,x1) => x0.removeChild(x1),
      gG: (handle) => clearInterval(handle),
      gH: x0 => x0.isConnected,
      gI: (x0,x1) => x0.revokeObjectURL(x1),
      gJ: () => globalThis.crypto,
      gK: x0 => x0.allocationSize(),
      gL: (x0,x1) => { x0.src = x1 },
      gM: (x0,x1) => { x0.src = x1 },
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: () => globalThis.document,
      hE: s => s.trim(),
      hF: x0 => x0.firstChild,
      hG: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      hH: x0 => x0.click(),
      hI: (x0,x1) => { x0.src = x1 },
      hJ: l => new DataView(new ArrayBuffer(l)),
      hK: (x0,x1) => x0.copyTo(x1),
      hL: (x0,x1) => { x0.async = x1 },
      hM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      i: x0 => new Promise(x0),
      iB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      iC: (a, i) => a[i],
      iD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      iE: x0 => x0.classList,
      iF: x0 => x0.viewConstraints,
      iG: () => Date.now(),
      iH: (x0,x1) => x0.getElementsByClassName(x1),
      iI: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      iJ: () => new AbortController(),
      iK: (x0,x1) => x0.toDataURL(x1),
      iL: (x0,x1) => { x0.type = x1 },
      iM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.hasFocus(),
      jE: x0 => x0.preventDefault(),
      jF: x0 => x0.hostElement,
      jG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      jH: (x0,x1) => x0.dispatchEvent(x1),
      jI: x0 => x0.naturalHeight,
      jJ: (a, l) => a.length = l,
      jK: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      jL: (o, p, v) => o[p] = v,
      jM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: (t, s) => t.set(s),
      kC: (x0,x1) => x0.test(x1),
      kD: x0 => x0.relatedTarget,
      kE: x0 => x0.parent,
      kF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      kH: (x0,x1) => x0.createEvent(x1),
      kI: x0 => x0.naturalWidth,
      kJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kK: x0 => x0.format,
      kL: () => ({}),
      kM: (x0,x1) => { x0.onerror = x1 },
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: x0 => x0.shiftKey,
      lE: x0 => x0.timeStamp,
      lF: x0 => ({runApp: x0}),
      lG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      lH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      lI: x0 => x0.decode(),
      lJ: (x0,x1,x2) => x0.addEventListener(x1,x2),
      lK: () => new XMLHttpRequest(),
      lL: x0 => globalThis.pdfjsLib.getDocument(x0),
      lM: (x0,x1) => { x0.oncancel = x1 },
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: (decoder, codeUnits) => decoder.decode(codeUnits),
      mE: (x0,x1) => x0.hasAttribute(x1),
      mF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      mG: x0 => x0.history,
      mH: x0 => x0.readText(),
      mI: (x0,x1) => { x0.decoding = x1 },
      mJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      mK: (x0,x1,x2) => x0.open(x1,x2),
      mL: (x0,x1) => x0.getContext(x1),
      mM: (x0,x1) => { x0.onchange = x1 },
      n: (o0, o1) => [o0, o1],
      nB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      nC: Function.prototype.call.bind(String.prototype.toLowerCase),
      nD: () => new TextDecoder("utf-8", {fatal: true}),
      nE: x0 => x0.buttons,
      nF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      nG: x0 => x0.search,
      nH: x0 => x0.clipboard,
      nI: (x0,x1) => { x0.crossOrigin = x1 },
      nJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      nK: (x0,x1) => x0.send(x1),
      nL: (x0,x1) => x0.getPage(x1),
      nM: x0 => x0.lastModified,
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: () => new TextDecoder("utf-8", {fatal: false}),
      oE: x0 => x0.ctrlKey,
      oF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      oG: x0 => x0.location,
      oH: (x0,x1) => x0.writeText(x1),
      oI: (x0,x1) => x0.createObjectURL(x1),
      oJ: (x0,x1) => x0.removeChild(x1),
      oK: x0 => x0.send(),
      oL: (x0,x1) => x0.getViewport(x1),
      oM: x0 => x0.target,
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      pC: x0 => x0.vendor,
      pD: (a, i, v) => a[i] = v,
      pE: x0 => x0.y,
      pF: () => typeof dartUseDateNowForTicks !== "undefined",
      pG: x0 => x0.pathname,
      pH: x0 => x0.unlock(),
      pI: x0 => x0.URL,
      pJ: x0 => x0.click(),
      pK: x0 => x0.abort(),
      pL: (x0,x1) => x0.render(x1),
      pM: (x0,x1) => x0.replaceChildren(x1),
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: Function.prototype.call.bind(DataView.prototype.getInt32),
      qC: (x0,x1) => x0.createTextNode(x1),
      qD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      qE: x0 => x0.x,
      qF: () => Date.now(),
      qG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      qH: (x0,x1) => x0.lock(x1),
      qI: x0 => new Blob(x0),
      qJ: (o, a) => o + a,
      qK: x0 => x0.upload,
      qL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qM: x0 => x0.length,
      r: (o, p) => o[p],
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      rC: (x0,x1) => { x0.id = x1 },
      rD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      rE: x0 => x0.scrollTop,
      rF: () => 1000 * performance.now(),
      rG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      rH: x0 => x0.orientation,
      rI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      rJ: x0 => x0.children,
      rK: x0 => x0.responseURL,
      rL: (x0,x1) => x0.toBlob(x1),
      rM: x0 => x0.getReader(),
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      sE: x0 => x0.offsetTop,
      sF: (x0,x1) => x0.requestAnimationFrame(x1),
      sG: o => Object.keys(o),
      sH: (x0,x1) => x0.querySelector(x1),
      sI: x0 => new window.ImageDecoder(x0),
      sJ: x0 => x0.firstChild,
      sK: x0 => x0.statusText,
      sL: x0 => x0.cleanup(),
      sM: x0 => x0.value,
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: x0 => x0.visibilityState,
      tE: x0 => x0.scrollLeft,
      tF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tG: x0 => x0.state,
      tH: (x0,x1) => { x0.title = x1 },
      tI: x0 => x0.name,
      tJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      tK: x0 => x0.getAllResponseHeaders(),
      tL: x0 => x0.destroy(),
      tM: x0 => x0.done,
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      uE: x0 => x0.offsetLeft,
      uF: x0 => x0.now(),
      uG: x0 => x0.hash,
      uH: (x0,x1) => x0.vibrate(x1),
      uI: x0 => x0.repetitionCount,
      uJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uK: x0 => x0.status,
      uL: x0 => x0.height,
      uM: x0 => x0.read(),
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: Function.prototype.call.bind(DataView.prototype.getInt16),
      vC: (x0,x1) => x0.attachShadow(x1),
      vD: x0 => x0.disconnect(),
      vE: x0 => x0.offsetParent,
      vF: x0 => x0.performance,
      vG: x0 => x0.state,
      vH: x0 => x0.content,
      vI: x0 => x0.frameCount,
      vJ: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      vK: x0 => x0.response,
      vL: x0 => x0.width,
      vM: x0 => x0.assetBase,
      w: (l, r) => l === r,
      wB: o => o instanceof Uint8ClampedArray,
      wC: (x0,x1) => x0.createElement(x1),
      wD: x0 => new Intl.Locale(x0),
      wE: (o, p, r) => o.replace(p, () => r),
      wF: x0 => new Uint8Array(x0),
      wG: (x0,x1) => x0.go(x1),
      wH: x0 => x0.document,
      wI: x0 => x0.selectedTrack,
      wJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      wK: (x0,x1) => { x0.timeout = x1 },
      wL: x0 => x0.promise,
      wM: x0 => x0.loader,
      x: x0 => x0.random(),
      xB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      xC: x0 => x0.scale,
      xD: x0 => x0.region,
      xE: (o, p, r) => o.replaceAll(p, () => r),
      xF: (x0,x1,x2) => x0.slice(x1,x2),
      xG: x0 => x0.parentElement,
      xH: (x0,x1,x2) => x0.insertBefore(x1,x2),
      xI: x0 => x0.completed,
      xJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xK: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      xL: (x0,x1) => { x0.viewport = x1 },
      xM: () => globalThis._flutter,
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: x0 => x0.script,
      yE: x0 => x0.deltaMode,
      yF: (x0,x1) => x0.decode(x1),
      yG: (x0,x1) => x0.querySelectorAll(x1),
      yH: x0 => x0.id,
      yI: x0 => x0.ready,
      yJ: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      yK: (x0,x1) => { x0.withCredentials = x1 },
      yL: (x0,x1) => { x0.canvasContext = x1 },
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.language,
      zE: x0 => x0.deltaY,
      zF: (x0,x1) => x0.adoptText(x1),
      zG: (x0,x1) => x0.removeProperty(x1),
      zH: x0 => x0.offsetHeight,
      zI: x0 => x0.tracks,
      zJ: (x0,x1) => x0.item(x1),
      zK: (x0,x1) => { x0.responseType = x1 },
      zL: (x0,x1) => { x0.width = x1 },

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
