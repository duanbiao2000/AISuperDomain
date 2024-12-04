(() => {
  'use strict';
  var e,
    t,
    n,
    r = {};
  (r.g = (function () {
    if ('object' == typeof globalThis) return globalThis;
    try {
      return this || new Function('return this')();
    } catch (e) {
      if ('object' == typeof window) return window;
    }
  })()),
    (function (e) {
      window.DotNet = e;
      const t = [],
        n = new Map(),
        r = new Map(),
        o = '__jsObjectId',
        i = '__byte[]';
      class s {
        constructor(e) {
          (this._jsObject = e), (this._cachedFunctions = new Map());
        }
        findFunction(e) {
          const t = this._cachedFunctions.get(e);
          if (t) return t;
          let n,
            r = this._jsObject;
          if (
            (e.split('.').forEach((t) => {
              if (!(t in r))
                throw new Error(
                  `Could not find '${e}' ('${t}' was undefined).`
                );
              (n = r), (r = r[t]);
            }),
            r instanceof Function)
          )
            return (r = r.bind(n)), this._cachedFunctions.set(e, r), r;
          throw new Error(`The value '${e}' is not a function.`);
        }
        getWrappedObject() {
          return this._jsObject;
        }
      }
      const a = {},
        c = { 0: new s(window) };
      c[0]._cachedFunctions.set(
        'import',
        (e) => (
          'string' == typeof e &&
            e.startsWith('./') &&
            (e = document.baseURI + e.substr(2)),
          import(e)
        )
      );
      let l,
        h = 1,
        u = 1,
        d = null;
      function p(e) {
        t.push(e);
      }
      function f(e) {
        if (e && 'object' == typeof e) {
          c[u] = new s(e);
          const t = { [o]: u };
          return u++, t;
        }
        throw new Error(
          `Cannot create a JSObjectReference from the value '${e}'.`
        );
      }
      function g(e) {
        let t = -1;
        if (
          (e instanceof ArrayBuffer && (e = new Uint8Array(e)),
          e instanceof Blob)
        )
          t = e.size;
        else {
          if (!(e.buffer instanceof ArrayBuffer))
            throw new Error('Supplied value is not a typed array or blob.');
          if (void 0 === e.byteLength)
            throw new Error(
              `Cannot create a JSStreamReference from the value '${e}' as it doesn't have a byteLength.`
            );
          t = e.byteLength;
        }
        const n = { __jsStreamReferenceLength: t };
        try {
          const t = f(e);
          n.__jsObjectId = t.__jsObjectId;
        } catch (t) {
          throw new Error(
            `Cannot create a JSStreamReference from the value '${e}'.`
          );
        }
        return n;
      }
      function m(e) {
        return e
          ? JSON.parse(e, (e, n) => t.reduce((t, n) => n(e, t), n))
          : null;
      }
      function y(e, t, n, r) {
        const o = v();
        if (o.invokeDotNetFromJS) {
          const i = D(r),
            s = o.invokeDotNetFromJS(e, t, n, i);
          return s ? m(s) : null;
        }
        throw new Error(
          'The current dispatcher does not support synchronous calls from JS to .NET. Use invokeMethodAsync instead.'
        );
      }
      function w(e, t, n, r) {
        if (e && n)
          throw new Error(
            `For instance method calls, assemblyName should be null. Received '${e}'.`
          );
        const o = h++,
          i = new Promise((e, t) => {
            a[o] = { resolve: e, reject: t };
          });
        try {
          const i = D(r);
          v().beginInvokeDotNetFromJS(o, e, t, n, i);
        } catch (e) {
          b(o, !1, e);
        }
        return i;
      }
      function v() {
        if (null !== d) return d;
        throw new Error('No .NET call dispatcher has been set.');
      }
      function b(e, t, n) {
        if (!a.hasOwnProperty(e))
          throw new Error(`There is no pending async call with ID ${e}.`);
        const r = a[e];
        delete a[e], t ? r.resolve(n) : r.reject(n);
      }
      function _(e) {
        return e instanceof Error
          ? `${e.message}\n${e.stack}`
          : e
          ? e.toString()
          : 'null';
      }
      function E(e, t) {
        const n = c[t];
        if (n) return n.findFunction(e);
        throw new Error(
          `JS object instance with ID ${t} does not exist (has it been disposed?).`
        );
      }
      function S(e) {
        delete c[e];
      }
      (e.attachDispatcher = function (e) {
        d = e;
      }),
        (e.attachReviver = p),
        (e.invokeMethod = function (e, t, ...n) {
          return y(e, t, null, n);
        }),
        (e.invokeMethodAsync = function (e, t, ...n) {
          return w(e, t, null, n);
        }),
        (e.createJSObjectReference = f),
        (e.createJSStreamReference = g),
        (e.disposeJSObjectReference = function (e) {
          const t = e && e.__jsObjectId;
          'number' == typeof t && S(t);
        }),
        (function (e) {
          (e[(e.Default = 0)] = 'Default'),
            (e[(e.JSObjectReference = 1)] = 'JSObjectReference'),
            (e[(e.JSStreamReference = 2)] = 'JSStreamReference'),
            (e[(e.JSVoidResult = 3)] = 'JSVoidResult');
        })((l = e.JSCallResultType || (e.JSCallResultType = {}))),
        (e.jsCallDispatcher = {
          findJSFunction: E,
          disposeJSObjectReferenceById: S,
          invokeJSFromDotNet: (e, t, n, r) => {
            const o = T(E(e, r).apply(null, m(t)), n);
            return null == o ? null : D(o);
          },
          beginInvokeJSFromDotNet: (e, t, n, r, o) => {
            const i = new Promise((e) => {
              e(E(t, o).apply(null, m(n)));
            });
            e &&
              i
                .then((t) => D([e, !0, T(t, r)]))
                .then(
                  (t) => v().endInvokeJSFromDotNet(e, !0, t),
                  (t) =>
                    v().endInvokeJSFromDotNet(
                      e,
                      !1,
                      JSON.stringify([e, !1, _(t)])
                    )
                );
          },
          endInvokeDotNetFromJS: (e, t, n) => {
            const r = t ? m(n) : new Error(n);
            b(parseInt(e, 10), t, r);
          },
          receiveByteArray: (e, t) => {
            n.set(e, t);
          },
          supplyDotNetStream: (e, t) => {
            if (r.has(e)) {
              const n = r.get(e);
              r.delete(e), n.resolve(t);
            } else {
              const n = new k();
              n.resolve(t), r.set(e, n);
            }
          },
        });
      class C {
        constructor(e) {
          this._id = e;
        }
        invokeMethod(e, ...t) {
          return y(null, e, this._id, t);
        }
        invokeMethodAsync(e, ...t) {
          return w(null, e, this._id, t);
        }
        dispose() {
          w(null, '__Dispose', this._id, null).catch((e) => console.error(e));
        }
        serializeAsArg() {
          return { __dotNetObject: this._id };
        }
      }
      (e.DotNetObject = C),
        p(function (e, t) {
          if (t && 'object' == typeof t) {
            if (t.hasOwnProperty('__dotNetObject'))
              return new C(t.__dotNetObject);
            if (t.hasOwnProperty(o)) {
              const e = t.__jsObjectId,
                n = c[e];
              if (n) return n.getWrappedObject();
              throw new Error(
                `JS object instance with Id '${e}' does not exist. It may have been disposed.`
              );
            }
            if (t.hasOwnProperty(i)) {
              const e = t['__byte[]'],
                r = n.get(e);
              if (void 0 === r)
                throw new Error(`Byte array index '${e}' does not exist.`);
              return n.delete(e), r;
            }
            if (t.hasOwnProperty('__dotNetStream'))
              return new I(t.__dotNetStream);
          }
          return t;
        });
      class I {
        constructor(e) {
          if (r.has(e))
            (this._streamPromise = r.get(e).streamPromise), r.delete(e);
          else {
            const t = new k();
            r.set(e, t), (this._streamPromise = t.streamPromise);
          }
        }
        stream() {
          return this._streamPromise;
        }
        async arrayBuffer() {
          return new Response(await this.stream()).arrayBuffer();
        }
      }
      class k {
        constructor() {
          this.streamPromise = new Promise((e, t) => {
            (this.resolve = e), (this.reject = t);
          });
        }
      }
      function T(e, t) {
        switch (t) {
          case l.Default:
            return e;
          case l.JSObjectReference:
            return f(e);
          case l.JSStreamReference:
            return g(e);
          case l.JSVoidResult:
            return null;
          default:
            throw new Error(`Invalid JS call result type '${t}'.`);
        }
      }
      let x = 0;
      function D(e) {
        return (x = 0), JSON.stringify(e, R);
      }
      function R(e, t) {
        if (t instanceof C) return t.serializeAsArg();
        if (t instanceof Uint8Array) {
          d.sendByteArray(x, t);
          const e = { [i]: x };
          return x++, e;
        }
        return t;
      }
    })(e || (e = {})),
    (function (e) {
      (e[(e.prependFrame = 1)] = 'prependFrame'),
        (e[(e.removeFrame = 2)] = 'removeFrame'),
        (e[(e.setAttribute = 3)] = 'setAttribute'),
        (e[(e.removeAttribute = 4)] = 'removeAttribute'),
        (e[(e.updateText = 5)] = 'updateText'),
        (e[(e.stepIn = 6)] = 'stepIn'),
        (e[(e.stepOut = 7)] = 'stepOut'),
        (e[(e.updateMarkup = 8)] = 'updateMarkup'),
        (e[(e.permutationListEntry = 9)] = 'permutationListEntry'),
        (e[(e.permutationListEnd = 10)] = 'permutationListEnd');
    })(t || (t = {})),
    (function (e) {
      (e[(e.element = 1)] = 'element'),
        (e[(e.text = 2)] = 'text'),
        (e[(e.attribute = 3)] = 'attribute'),
        (e[(e.component = 4)] = 'component'),
        (e[(e.region = 5)] = 'region'),
        (e[(e.elementReferenceCapture = 6)] = 'elementReferenceCapture'),
        (e[(e.markup = 8)] = 'markup');
    })(n || (n = {}));
  class o {
    constructor(e, t) {
      (this.componentId = e), (this.fieldValue = t);
    }
    static fromEvent(e, t) {
      const n = t.target;
      if (n instanceof Element) {
        const t = (function (e) {
          return e instanceof HTMLInputElement
            ? e.type && 'checkbox' === e.type.toLowerCase()
              ? { value: e.checked }
              : { value: e.value }
            : e instanceof HTMLSelectElement || e instanceof HTMLTextAreaElement
            ? { value: e.value }
            : null;
        })(n);
        if (t) return new o(e, t.value);
      }
      return null;
    }
  }
  const i = new Map(),
    s = new Map(),
    a = [];
  function c(e) {
    return i.get(e);
  }
  function l(e) {
    const t = i.get(e);
    return (null == t ? void 0 : t.browserEventName) || e;
  }
  function h(e, t) {
    e.forEach((e) => i.set(e, t));
  }
  function u(e) {
    const t = [];
    for (let n = 0; n < e.length; n++) {
      const r = e[n];
      t.push({
        identifier: r.identifier,
        clientX: r.clientX,
        clientY: r.clientY,
        screenX: r.screenX,
        screenY: r.screenY,
        pageX: r.pageX,
        pageY: r.pageY,
      });
    }
    return t;
  }
  function d(e) {
    return {
      detail: e.detail,
      screenX: e.screenX,
      screenY: e.screenY,
      clientX: e.clientX,
      clientY: e.clientY,
      offsetX: e.offsetX,
      offsetY: e.offsetY,
      pageX: e.pageX,
      pageY: e.pageY,
      movementX: e.movementX,
      movementY: e.movementY,
      button: e.button,
      buttons: e.buttons,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      type: e.type,
    };
  }
  h(['input', 'change'], {
    createEventArgs: function (e) {
      const t = e.target;
      if (
        (function (e) {
          return -1 !== p.indexOf(e.getAttribute('type'));
        })(t)
      ) {
        const e = (function (e) {
          const t = e.value,
            n = e.type;
          switch (n) {
            case 'date':
            case 'month':
            case 'week':
              return t;
            case 'datetime-local':
              return 16 === t.length ? t + ':00' : t;
            case 'time':
              return 5 === t.length ? t + ':00' : t;
          }
          throw new Error(`Invalid element type '${n}'.`);
        })(t);
        return { value: e };
      }
      if (
        (function (e) {
          return e instanceof HTMLSelectElement && 'select-multiple' === e.type;
        })(t)
      ) {
        const e = t;
        return {
          value: Array.from(e.options)
            .filter((e) => e.selected)
            .map((e) => e.value),
        };
      }
      {
        const e = (function (e) {
          return (
            !!e &&
            'INPUT' === e.tagName &&
            'checkbox' === e.getAttribute('type')
          );
        })(t);
        return { value: e ? !!t.checked : t.value };
      }
    },
  }),
    h(['copy', 'cut', 'paste'], { createEventArgs: (e) => ({ type: e.type }) }),
    h(
      [
        'drag',
        'dragend',
        'dragenter',
        'dragleave',
        'dragover',
        'dragstart',
        'drop',
      ],
      {
        createEventArgs: (e) => {
          return {
            ...d((t = e)),
            dataTransfer: t.dataTransfer
              ? {
                  dropEffect: t.dataTransfer.dropEffect,
                  effectAllowed: t.dataTransfer.effectAllowed,
                  files: Array.from(t.dataTransfer.files).map((e) => e.name),
                  items: Array.from(t.dataTransfer.items).map((e) => ({
                    kind: e.kind,
                    type: e.type,
                  })),
                  types: t.dataTransfer.types,
                }
              : null,
          };
          var t;
        },
      }
    ),
    h(['focus', 'blur', 'focusin', 'focusout'], {
      createEventArgs: (e) => ({ type: e.type }),
    }),
    h(['keydown', 'keyup', 'keypress'], {
      createEventArgs: (e) => {
        return {
          key: (t = e).key,
          code: t.code,
          location: t.location,
          repeat: t.repeat,
          ctrlKey: t.ctrlKey,
          shiftKey: t.shiftKey,
          altKey: t.altKey,
          metaKey: t.metaKey,
          type: t.type,
        };
        var t;
      },
    }),
    h(
      [
        'contextmenu',
        'click',
        'mouseover',
        'mouseout',
        'mousemove',
        'mousedown',
        'mouseup',
        'mouseleave',
        'mouseenter',
        'dblclick',
      ],
      { createEventArgs: (e) => d(e) }
    ),
    h(['error'], {
      createEventArgs: (e) => {
        return {
          message: (t = e).message,
          filename: t.filename,
          lineno: t.lineno,
          colno: t.colno,
          type: t.type,
        };
        var t;
      },
    }),
    h(['loadstart', 'timeout', 'abort', 'load', 'loadend', 'progress'], {
      createEventArgs: (e) => {
        return {
          lengthComputable: (t = e).lengthComputable,
          loaded: t.loaded,
          total: t.total,
          type: t.type,
        };
        var t;
      },
    }),
    h(
      [
        'touchcancel',
        'touchend',
        'touchmove',
        'touchenter',
        'touchleave',
        'touchstart',
      ],
      {
        createEventArgs: (e) => {
          return {
            detail: (t = e).detail,
            touches: u(t.touches),
            targetTouches: u(t.targetTouches),
            changedTouches: u(t.changedTouches),
            ctrlKey: t.ctrlKey,
            shiftKey: t.shiftKey,
            altKey: t.altKey,
            metaKey: t.metaKey,
            type: t.type,
          };
          var t;
        },
      }
    ),
    h(
      [
        'gotpointercapture',
        'lostpointercapture',
        'pointercancel',
        'pointerdown',
        'pointerenter',
        'pointerleave',
        'pointermove',
        'pointerout',
        'pointerover',
        'pointerup',
      ],
      {
        createEventArgs: (e) => {
          return {
            ...d((t = e)),
            pointerId: t.pointerId,
            width: t.width,
            height: t.height,
            pressure: t.pressure,
            tiltX: t.tiltX,
            tiltY: t.tiltY,
            pointerType: t.pointerType,
            isPrimary: t.isPrimary,
          };
          var t;
        },
      }
    ),
    h(['wheel', 'mousewheel'], {
      createEventArgs: (e) => {
        return {
          ...d((t = e)),
          deltaX: t.deltaX,
          deltaY: t.deltaY,
          deltaZ: t.deltaZ,
          deltaMode: t.deltaMode,
        };
        var t;
      },
    }),
    h(['toggle'], { createEventArgs: () => ({}) });
  const p = ['date', 'datetime-local', 'month', 'time', 'week'],
    f = new Map();
  let g,
    m,
    y = 0;
  const w = {
    async add(e, t, n) {
      if (!n)
        throw new Error('initialParameters must be an object, even if empty.');
      const r = '__bl-dynamic-root:' + (++y).toString();
      f.set(r, e);
      const o = await _().invokeMethodAsync('AddRootComponent', t, r),
        i = new b(o, m[t]);
      return await i.setParameters(n), i;
    },
  };
  class v {
    invoke(e) {
      return this._callback(e);
    }
    setCallback(t) {
      this._selfJSObjectReference ||
        (this._selfJSObjectReference = e.createJSObjectReference(this)),
        (this._callback = t);
    }
    getJSObjectReference() {
      return this._selfJSObjectReference;
    }
    dispose() {
      this._selfJSObjectReference &&
        e.disposeJSObjectReference(this._selfJSObjectReference);
    }
  }
  class b {
    constructor(e, t) {
      (this._jsEventCallbackWrappers = new Map()), (this._componentId = e);
      for (const e of t)
        'eventcallback' === e.type &&
          this._jsEventCallbackWrappers.set(e.name.toLowerCase(), new v());
    }
    setParameters(e) {
      const t = {},
        n = Object.entries(e || {}),
        r = n.length;
      for (const [e, r] of n) {
        const n = this._jsEventCallbackWrappers.get(e.toLowerCase());
        n && r
          ? (n.setCallback(r), (t[e] = n.getJSObjectReference()))
          : (t[e] = r);
      }
      return _().invokeMethodAsync(
        'SetRootComponentParameters',
        this._componentId,
        r,
        t
      );
    }
    async dispose() {
      if (null !== this._componentId) {
        await _().invokeMethodAsync('RemoveRootComponent', this._componentId),
          (this._componentId = null);
        for (const e of this._jsEventCallbackWrappers.values()) e.dispose();
      }
    }
  }
  function _() {
    if (!g)
      throw new Error(
        'Dynamic root components have not been enabled in this application.'
      );
    return g;
  }
  const E = new Map();
  let S;
  const C = new Promise((e) => {
    S = e;
  });
  function I(e, t, n) {
    return T(e, t.eventHandlerId, () =>
      k(e).invokeMethodAsync('DispatchEventAsync', t, n)
    );
  }
  function k(e) {
    const t = E.get(e);
    if (!t)
      throw new Error(`No interop methods are registered for renderer ${e}`);
    return t;
  }
  let T = (e, t, n) => n();
  const x = N([
      'abort',
      'blur',
      'canplay',
      'canplaythrough',
      'change',
      'cuechange',
      'durationchange',
      'emptied',
      'ended',
      'error',
      'focus',
      'load',
      'loadeddata',
      'loadedmetadata',
      'loadend',
      'loadstart',
      'mouseenter',
      'mouseleave',
      'pointerenter',
      'pointerleave',
      'pause',
      'play',
      'playing',
      'progress',
      'ratechange',
      'reset',
      'scroll',
      'seeked',
      'seeking',
      'stalled',
      'submit',
      'suspend',
      'timeupdate',
      'toggle',
      'unload',
      'volumechange',
      'waiting',
      'DOMNodeInsertedIntoDocument',
      'DOMNodeRemovedFromDocument',
    ]),
    D = { submit: !0 },
    R = N(['click', 'dblclick', 'mousedown', 'mousemove', 'mouseup']);
  class P {
    constructor(e) {
      (this.browserRendererId = e), (this.afterClickCallbacks = []);
      const t = ++P.nextEventDelegatorId;
      (this.eventsCollectionKey = `_blazorEvents_${t}`),
        (this.eventInfoStore = new U(this.onGlobalEvent.bind(this)));
    }
    setListener(e, t, n, r) {
      const o = this.getEventHandlerInfosForElement(e, !0),
        i = o.getHandler(t);
      if (i) this.eventInfoStore.update(i.eventHandlerId, n);
      else {
        const i = {
          element: e,
          eventName: t,
          eventHandlerId: n,
          renderingComponentId: r,
        };
        this.eventInfoStore.add(i), o.setHandler(t, i);
      }
    }
    getHandler(e) {
      return this.eventInfoStore.get(e);
    }
    removeListener(e) {
      const t = this.eventInfoStore.remove(e);
      if (t) {
        const e = t.element,
          n = this.getEventHandlerInfosForElement(e, !1);
        n && n.removeHandler(t.eventName);
      }
    }
    notifyAfterClick(e) {
      this.afterClickCallbacks.push(e),
        this.eventInfoStore.addGlobalListener('click');
    }
    setStopPropagation(e, t, n) {
      this.getEventHandlerInfosForElement(e, !0).stopPropagation(t, n);
    }
    setPreventDefault(e, t, n) {
      this.getEventHandlerInfosForElement(e, !0).preventDefault(t, n);
    }
    onGlobalEvent(e) {
      if (!(e.target instanceof Element)) return;
      this.dispatchGlobalEventToAllElements(e.type, e);
      const t = ((n = e.type), s.get(n));
      var n;
      t && t.forEach((t) => this.dispatchGlobalEventToAllElements(t, e)),
        'click' === e.type && this.afterClickCallbacks.forEach((t) => t(e));
    }
    dispatchGlobalEventToAllElements(e, t) {
      const n = t.composedPath();
      let r = n.shift(),
        i = null,
        s = !1;
      const a = Object.prototype.hasOwnProperty.call(x, e);
      let l = !1;
      for (; r; ) {
        const d = r,
          p = this.getEventHandlerInfosForElement(d, !1);
        if (p) {
          const n = p.getHandler(e);
          if (
            n &&
            ((h = d),
            (u = t.type),
            !(
              (h instanceof HTMLButtonElement ||
                h instanceof HTMLInputElement ||
                h instanceof HTMLTextAreaElement ||
                h instanceof HTMLSelectElement) &&
              Object.prototype.hasOwnProperty.call(R, u) &&
              h.disabled
            ))
          ) {
            if (!s) {
              const n = c(e);
              (i = (null == n ? void 0 : n.createEventArgs)
                ? n.createEventArgs(t)
                : {}),
                (s = !0);
            }
            Object.prototype.hasOwnProperty.call(D, t.type) &&
              t.preventDefault(),
              I(
                this.browserRendererId,
                {
                  eventHandlerId: n.eventHandlerId,
                  eventName: e,
                  eventFieldInfo: o.fromEvent(n.renderingComponentId, t),
                },
                i
              );
          }
          p.stopPropagation(e) && (l = !0),
            p.preventDefault(e) && t.preventDefault();
        }
        r = a || l ? void 0 : n.shift();
      }
      var h, u;
    }
    getEventHandlerInfosForElement(e, t) {
      return Object.prototype.hasOwnProperty.call(e, this.eventsCollectionKey)
        ? e[this.eventsCollectionKey]
        : t
        ? (e[this.eventsCollectionKey] = new A())
        : null;
    }
  }
  P.nextEventDelegatorId = 0;
  class U {
    constructor(e) {
      (this.globalListener = e),
        (this.infosByEventHandlerId = {}),
        (this.countByEventName = {}),
        a.push(this.handleEventNameAliasAdded.bind(this));
    }
    add(e) {
      if (this.infosByEventHandlerId[e.eventHandlerId])
        throw new Error(`Event ${e.eventHandlerId} is already tracked`);
      (this.infosByEventHandlerId[e.eventHandlerId] = e),
        this.addGlobalListener(e.eventName);
    }
    get(e) {
      return this.infosByEventHandlerId[e];
    }
    addGlobalListener(e) {
      if (
        ((e = l(e)),
        Object.prototype.hasOwnProperty.call(this.countByEventName, e))
      )
        this.countByEventName[e]++;
      else {
        this.countByEventName[e] = 1;
        const t = Object.prototype.hasOwnProperty.call(x, e);
        document.addEventListener(e, this.globalListener, t);
      }
    }
    update(e, t) {
      if (Object.prototype.hasOwnProperty.call(this.infosByEventHandlerId, t))
        throw new Error(`Event ${t} is already tracked`);
      const n = this.infosByEventHandlerId[e];
      delete this.infosByEventHandlerId[e],
        (n.eventHandlerId = t),
        (this.infosByEventHandlerId[t] = n);
    }
    remove(e) {
      const t = this.infosByEventHandlerId[e];
      if (t) {
        delete this.infosByEventHandlerId[e];
        const n = l(t.eventName);
        0 == --this.countByEventName[n] &&
          (delete this.countByEventName[n],
          document.removeEventListener(n, this.globalListener));
      }
      return t;
    }
    handleEventNameAliasAdded(e, t) {
      if (Object.prototype.hasOwnProperty.call(this.countByEventName, e)) {
        const n = this.countByEventName[e];
        delete this.countByEventName[e],
          document.removeEventListener(e, this.globalListener),
          this.addGlobalListener(t),
          (this.countByEventName[t] += n - 1);
      }
    }
  }
  class A {
    constructor() {
      (this.handlers = {}),
        (this.preventDefaultFlags = null),
        (this.stopPropagationFlags = null);
    }
    getHandler(e) {
      return Object.prototype.hasOwnProperty.call(this.handlers, e)
        ? this.handlers[e]
        : null;
    }
    setHandler(e, t) {
      this.handlers[e] = t;
    }
    removeHandler(e) {
      delete this.handlers[e];
    }
    preventDefault(e, t) {
      return (
        void 0 !== t &&
          ((this.preventDefaultFlags = this.preventDefaultFlags || {}),
          (this.preventDefaultFlags[e] = t)),
        !!this.preventDefaultFlags && this.preventDefaultFlags[e]
      );
    }
    stopPropagation(e, t) {
      return (
        void 0 !== t &&
          ((this.stopPropagationFlags = this.stopPropagationFlags || {}),
          (this.stopPropagationFlags[e] = t)),
        !!this.stopPropagationFlags && this.stopPropagationFlags[e]
      );
    }
  }
  function N(e) {
    const t = {};
    return (
      e.forEach((e) => {
        t[e] = !0;
      }),
      t
    );
  }
  const $ = G('_blazorLogicalChildren'),
    L = G('_blazorLogicalParent'),
    B = G('_blazorLogicalEnd');
  function M(e, t) {
    if (e.childNodes.length > 0 && !t)
      throw new Error(
        'New logical elements must start empty, or allowExistingContents must be true'
      );
    return $ in e || (e[$] = []), e;
  }
  function O(e, t) {
    const n = document.createComment('!');
    return F(n, e, t), n;
  }
  function F(e, t, n) {
    const r = e;
    if (e instanceof Comment && J(r) && J(r).length > 0)
      throw new Error('Not implemented: inserting non-empty logical container');
    if (H(r))
      throw new Error('Not implemented: moving existing logical children');
    const o = J(t);
    if (n < o.length) {
      const t = o[n];
      t.parentNode.insertBefore(e, t), o.splice(n, 0, r);
    } else X(e, t), o.push(r);
    (r[L] = t), $ in r || (r[$] = []);
  }
  function j(e, t) {
    const n = J(e).splice(t, 1)[0];
    if (n instanceof Comment) {
      const e = J(n);
      if (e) for (; e.length > 0; ) j(n, 0);
    }
    const r = n;
    r.parentNode.removeChild(r);
  }
  function H(e) {
    return e[L] || null;
  }
  function W(e, t) {
    return J(e)[t];
  }
  function z(e) {
    const t = V(e);
    return (
      'http://www.w3.org/2000/svg' === t.namespaceURI &&
      'foreignObject' !== t.tagName
    );
  }
  function J(e) {
    return e[$];
  }
  function q(e, t) {
    const n = J(e);
    t.forEach((e) => {
      (e.moveRangeStart = n[e.fromSiblingIndex]),
        (e.moveRangeEnd = Y(e.moveRangeStart));
    }),
      t.forEach((t) => {
        const r = document.createComment('marker');
        t.moveToBeforeMarker = r;
        const o = n[t.toSiblingIndex + 1];
        o ? o.parentNode.insertBefore(r, o) : X(r, e);
      }),
      t.forEach((e) => {
        const t = e.moveToBeforeMarker,
          n = t.parentNode,
          r = e.moveRangeStart,
          o = e.moveRangeEnd;
        let i = r;
        for (; i; ) {
          const e = i.nextSibling;
          if ((n.insertBefore(i, t), i === o)) break;
          i = e;
        }
        n.removeChild(t);
      }),
      t.forEach((e) => {
        n[e.toSiblingIndex] = e.moveRangeStart;
      });
  }
  function V(e) {
    if (e instanceof Element || e instanceof DocumentFragment) return e;
    if (e instanceof Comment) return e.parentNode;
    throw new Error('Not a valid logical element');
  }
  function K(e) {
    const t = J(H(e));
    return t[Array.prototype.indexOf.call(t, e) + 1] || null;
  }
  function X(e, t) {
    if (t instanceof Element || t instanceof DocumentFragment) t.appendChild(e);
    else {
      if (!(t instanceof Comment))
        throw new Error(
          `Cannot append node because the parent is not a valid logical element. Parent: ${t}`
        );
      {
        const n = K(t);
        n ? n.parentNode.insertBefore(e, n) : X(e, H(t));
      }
    }
  }
  function Y(e) {
    if (e instanceof Element || e instanceof DocumentFragment) return e;
    const t = K(e);
    if (t) return t.previousSibling;
    {
      const t = H(e);
      return t instanceof Element || t instanceof DocumentFragment
        ? t.lastChild
        : Y(t);
    }
  }
  function G(e) {
    return 'function' == typeof Symbol ? Symbol() : e;
  }
  function Q(e) {
    return `_bl_${e}`;
  }
  e.attachReviver((e, t) =>
    t &&
    'object' == typeof t &&
    Object.prototype.hasOwnProperty.call(t, '__internalId') &&
    'string' == typeof t.__internalId
      ? (function (e) {
          const t = `[${Q(e)}]`;
          return document.querySelector(t);
        })(t.__internalId)
      : t
  );
  const Z = '_blazorDeferredValue',
    ee = document.createElement('template'),
    te = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
    ne = {},
    re = '__internal_',
    oe = 'preventDefault_',
    ie = 'stopPropagation_';
  class se {
    constructor(e) {
      (this.rootComponentIds = new Set()),
        (this.childComponentLocations = {}),
        (this.eventDelegator = new P(e)),
        this.eventDelegator.notifyAfterClick((e) => {
          if (!fe) return;
          if (
            0 !== e.button ||
            (function (e) {
              return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
            })(e)
          )
            return;
          if (e.defaultPrevented) return;
          const t = (function (e) {
            const t =
              !window._blazorDisableComposedPath &&
              e.composedPath &&
              e.composedPath();
            if (t) {
              for (let e = 0; e < t.length; e++) {
                const n = t[e];
                if (n instanceof Element && 'A' === n.tagName) return n;
              }
              return null;
            }
            return Ae(e.target, 'A');
          })(e);
          if (
            t &&
            (function (e) {
              const t = e.getAttribute('target');
              return (
                (!t || '_self' === t) &&
                e.hasAttribute('href') &&
                !e.hasAttribute('download')
              );
            })(t)
          ) {
            const n = Ue(t.getAttribute('href'));
            Ne(n) && (e.preventDefault(), Ie(n, !0, !1));
          }
        });
    }
    attachRootComponentToLogicalElement(e, t, n) {
      this.attachComponentToElement(e, t),
        this.rootComponentIds.add(e),
        n || (ne[e] = t);
    }
    updateComponent(e, t, n, r) {
      var o;
      const i = this.childComponentLocations[t];
      if (!i)
        throw new Error(
          `No element is currently associated with component ${t}`
        );
      const s = ne[t];
      if (s) {
        const e = (function (e) {
          return e[B] || null;
        })(s);
        delete ne[t],
          e
            ? (function (e, t) {
                const n = H(e);
                if (!n)
                  throw new Error(
                    "Can't clear between nodes. The start node does not have a logical parent."
                  );
                const r = J(n),
                  o = r.indexOf(e) + 1,
                  i = r.indexOf(t);
                for (let e = o; e <= i; e++) j(n, o);
                e.textContent = '!';
              })(s, e)
            : (function (e) {
                let t;
                for (; (t = e.firstChild); ) e.removeChild(t);
              })(s);
      }
      const a = null === (o = V(i)) || void 0 === o ? void 0 : o.getRootNode(),
        c = a && a.activeElement;
      this.applyEdits(e, t, i, 0, n, r),
        c instanceof HTMLElement && a && a.activeElement !== c && c.focus();
    }
    disposeComponent(e) {
      this.rootComponentIds.delete(e) &&
        (function (e) {
          const t = J(e);
          for (; t.length; ) j(e, 0);
        })(this.childComponentLocations[e]),
        delete this.childComponentLocations[e];
    }
    disposeEventHandler(e) {
      this.eventDelegator.removeListener(e);
    }
    attachComponentToElement(e, t) {
      this.childComponentLocations[e] = t;
    }
    applyEdits(e, n, r, o, i, s) {
      let a,
        c = 0,
        l = o;
      const h = e.arrayBuilderSegmentReader,
        u = e.editReader,
        d = e.frameReader,
        p = h.values(i),
        f = h.offset(i),
        g = f + h.count(i);
      for (let i = f; i < g; i++) {
        const h = e.diffReader.editsEntry(p, i),
          f = u.editType(h);
        switch (f) {
          case t.prependFrame: {
            const t = u.newTreeIndex(h),
              o = e.referenceFramesEntry(s, t),
              i = u.siblingIndex(h);
            this.insertFrame(e, n, r, l + i, s, o, t);
            break;
          }
          case t.removeFrame:
            j(r, l + u.siblingIndex(h));
            break;
          case t.setAttribute: {
            const t = u.newTreeIndex(h),
              o = e.referenceFramesEntry(s, t),
              i = W(r, l + u.siblingIndex(h));
            if (!(i instanceof Element))
              throw new Error('Cannot set attribute on non-element child');
            this.applyAttribute(e, n, i, o);
            break;
          }
          case t.removeAttribute: {
            const t = W(r, l + u.siblingIndex(h));
            if (!(t instanceof Element))
              throw new Error('Cannot remove attribute from non-element child');
            {
              const n = u.removedAttributeName(h);
              this.tryApplySpecialProperty(e, t, n, null) ||
                t.removeAttribute(n);
            }
            break;
          }
          case t.updateText: {
            const t = u.newTreeIndex(h),
              n = e.referenceFramesEntry(s, t),
              o = W(r, l + u.siblingIndex(h));
            if (!(o instanceof Text))
              throw new Error('Cannot set text content on non-text child');
            o.textContent = d.textContent(n);
            break;
          }
          case t.updateMarkup: {
            const t = u.newTreeIndex(h),
              n = e.referenceFramesEntry(s, t),
              o = u.siblingIndex(h);
            j(r, l + o), this.insertMarkup(e, r, l + o, n);
            break;
          }
          case t.stepIn:
            (r = W(r, l + u.siblingIndex(h))), c++, (l = 0);
            break;
          case t.stepOut:
            (r = H(r)), c--, (l = 0 === c ? o : 0);
            break;
          case t.permutationListEntry:
            (a = a || []),
              a.push({
                fromSiblingIndex: l + u.siblingIndex(h),
                toSiblingIndex: l + u.moveToSiblingIndex(h),
              });
            break;
          case t.permutationListEnd:
            q(r, a), (a = void 0);
            break;
          default:
            throw new Error(`Unknown edit type: ${f}`);
        }
      }
    }
    insertFrame(e, t, r, o, i, s, a) {
      const c = e.frameReader,
        l = c.frameType(s);
      switch (l) {
        case n.element:
          return this.insertElement(e, t, r, o, i, s, a), 1;
        case n.text:
          return this.insertText(e, r, o, s), 1;
        case n.attribute:
          throw new Error(
            'Attribute frames should only be present as leading children of element frames.'
          );
        case n.component:
          return this.insertComponent(e, r, o, s), 1;
        case n.region:
          return this.insertFrameRange(
            e,
            t,
            r,
            o,
            i,
            a + 1,
            a + c.subtreeLength(s)
          );
        case n.elementReferenceCapture:
          if (r instanceof Element)
            return (
              (h = r),
              (u = c.elementReferenceCaptureId(s)),
              h.setAttribute(Q(u), ''),
              0
            );
          throw new Error(
            'Reference capture frames can only be children of element frames.'
          );
        case n.markup:
          return this.insertMarkup(e, r, o, s), 1;
        default:
          throw new Error(`Unknown frame type: ${l}`);
      }
      var h, u;
    }
    insertElement(e, t, r, o, i, s, a) {
      const c = e.frameReader,
        l = c.elementName(s),
        h =
          'svg' === l || z(r)
            ? document.createElementNS('http://www.w3.org/2000/svg', l)
            : document.createElement(l),
        u = M(h);
      let d = !1;
      const p = a + c.subtreeLength(s);
      for (let s = a + 1; s < p; s++) {
        const a = e.referenceFramesEntry(i, s);
        if (c.frameType(a) !== n.attribute) {
          F(h, r, o), (d = !0), this.insertFrameRange(e, t, u, 0, i, s, p);
          break;
        }
        this.applyAttribute(e, t, h, a);
      }
      d || F(h, r, o),
        h instanceof HTMLOptionElement
          ? this.trySetSelectValueFromOptionElement(h)
          : Z in h && ue(h, h._blazorDeferredValue);
    }
    trySetSelectValueFromOptionElement(e) {
      const t = this.findClosestAncestorSelectElement(e);
      if (
        !(function (e) {
          return !!e && Z in e;
        })(t)
      )
        return !1;
      if (le(t)) e.selected = -1 !== t._blazorDeferredValue.indexOf(e.value);
      else {
        if (t._blazorDeferredValue !== e.value) return !1;
        he(t, e.value), delete t._blazorDeferredValue;
      }
      return !0;
    }
    insertComponent(e, t, n, r) {
      const o = O(t, n),
        i = e.frameReader.componentId(r);
      this.attachComponentToElement(i, o);
    }
    insertText(e, t, n, r) {
      const o = e.frameReader.textContent(r);
      F(document.createTextNode(o), t, n);
    }
    insertMarkup(e, t, n, r) {
      const o = O(t, n),
        i =
          ((s = e.frameReader.markupContent(r)),
          z(t)
            ? ((te.innerHTML = s || ' '), te)
            : ((ee.innerHTML = s || ' '), ee.content));
      var s;
      let a = 0;
      for (; i.firstChild; ) F(i.firstChild, o, a++);
    }
    applyAttribute(e, t, n, r) {
      const o = e.frameReader,
        i = o.attributeName(r),
        s = o.attributeEventHandlerId(r);
      if (s) {
        const e = ce(i);
        this.eventDelegator.setListener(n, e, s, t);
      } else
        this.tryApplySpecialProperty(e, n, i, r) ||
          n.setAttribute(i, o.attributeValue(r));
    }
    tryApplySpecialProperty(e, t, n, r) {
      switch (n) {
        case 'value':
          return this.tryApplyValueProperty(e, t, r);
        case 'checked':
          return this.tryApplyCheckedProperty(e, t, r);
        default:
          return (
            !!n.startsWith(re) &&
            (this.applyInternalAttribute(e, t, n.substring(re.length), r), !0)
          );
      }
    }
    applyInternalAttribute(e, t, n, r) {
      const o = r ? e.frameReader.attributeValue(r) : null;
      if (n.startsWith(ie)) {
        const e = ce(n.substring(ie.length));
        this.eventDelegator.setStopPropagation(t, e, null !== o);
      } else {
        if (!n.startsWith(oe))
          throw new Error(`Unsupported internal attribute '${n}'`);
        {
          const e = ce(n.substring(oe.length));
          this.eventDelegator.setPreventDefault(t, e, null !== o);
        }
      }
    }
    tryApplyValueProperty(e, t, n) {
      const r = e.frameReader;
      let o = n ? r.attributeValue(n) : null;
      switch (
        (o &&
          'INPUT' === t.tagName &&
          (o = (function (e, t) {
            switch (t.getAttribute('type')) {
              case 'time':
                return 8 !== e.length ||
                  (!e.endsWith('00') && t.hasAttribute('step'))
                  ? e
                  : e.substring(0, 5);
              case 'datetime-local':
                return 19 !== e.length ||
                  (!e.endsWith('00') && t.hasAttribute('step'))
                  ? e
                  : e.substring(0, 16);
              default:
                return e;
            }
          })(o, t)),
        t.tagName)
      ) {
        case 'INPUT':
        case 'SELECT':
        case 'TEXTAREA':
          return (
            o && t instanceof HTMLSelectElement && le(t) && (o = JSON.parse(o)),
            ue(t, o),
            (t._blazorDeferredValue = o),
            !0
          );
        case 'OPTION':
          return (
            o || '' === o
              ? t.setAttribute('value', o)
              : t.removeAttribute('value'),
            this.trySetSelectValueFromOptionElement(t),
            !0
          );
        default:
          return !1;
      }
    }
    tryApplyCheckedProperty(e, t, n) {
      if ('INPUT' === t.tagName) {
        const r = n ? e.frameReader.attributeValue(n) : null;
        return (t.checked = null !== r), !0;
      }
      return !1;
    }
    findClosestAncestorSelectElement(e) {
      for (; e; ) {
        if (e instanceof HTMLSelectElement) return e;
        e = e.parentElement;
      }
      return null;
    }
    insertFrameRange(e, t, n, r, o, i, s) {
      const a = r;
      for (let a = i; a < s; a++) {
        const i = e.referenceFramesEntry(o, a);
        (r += this.insertFrame(e, t, n, r, o, i, a)), (a += ae(e, i));
      }
      return r - a;
    }
  }
  function ae(e, t) {
    const r = e.frameReader;
    switch (r.frameType(t)) {
      case n.component:
      case n.element:
      case n.region:
        return r.subtreeLength(t) - 1;
      default:
        return 0;
    }
  }
  function ce(e) {
    if (e.startsWith('on')) return e.substring(2);
    throw new Error(
      `Attribute should be an event name, but doesn't start with 'on'. Value: '${e}'`
    );
  }
  function le(e) {
    return 'select-multiple' === e.type;
  }
  function he(e, t) {
    e.value = t || '';
  }
  function ue(e, t) {
    e instanceof HTMLSelectElement
      ? le(e)
        ? (function (e, t) {
            t || (t = []);
            for (let n = 0; n < e.options.length; n++)
              e.options[n].selected = -1 !== t.indexOf(e.options[n].value);
          })(e, t)
        : he(e, t)
      : (e.value = t);
  }
  const de = {};
  let pe = !1,
    fe = !1,
    ge = !1,
    me = !1,
    ye = 0,
    we = 0,
    ve = null,
    be = null,
    _e = async function (e) {
      var t, n, r;
      if ((Te(), me)) {
        const o =
            null !==
              (n =
                null === (t = e.state) || void 0 === t ? void 0 : t._index) &&
            void 0 !== n
              ? n
              : 0,
          i = null === (r = e.state) || void 0 === r ? void 0 : r.userState,
          s = o - ye,
          a = location.href;
        if ((await ke(-s), !(await xe(a, i, !1)))) return;
        await ke(s);
      }
      await De(!1);
    },
    Ee = null;
  const Se = {
    listenForNavigationEvents: function (e, t) {
      var n, r;
      (ve = e),
        (be = t),
        ge ||
          ((ge = !0),
          window.addEventListener('popstate', Re),
          (ye =
            null !==
              (r =
                null === (n = history.state) || void 0 === n
                  ? void 0
                  : n._index) && void 0 !== r
              ? r
              : 0));
    },
    enableNavigationInterception: function () {
      fe = !0;
    },
    setHasLocationChangingListeners: function (e) {
      me = e;
    },
    endLocationChanging: function (e, t) {
      Ee && e === we && (Ee(t), (Ee = null));
    },
    navigateTo: function (e, t) {
      Ce(e, t, !0);
    },
    getBaseURI: () => document.baseURI,
    getLocationHref: () => location.href,
  };
  function Ce(e, t, n = !1) {
    const r = Ue(e);
    !t.forceLoad && Ne(r)
      ? Ie(r, !1, t.replaceHistoryEntry, t.historyEntryState, n)
      : (function (e, t) {
          if (location.href === e) {
            const t = e + '?';
            history.replaceState(null, '', t), location.replace(e);
          } else t ? location.replace(e) : (location.href = e);
        })(e, t.replaceHistoryEntry);
  }
  async function Ie(e, t, n, r, o = !1) {
    Te(),
      (o || !me || (await xe(e, r, t))) &&
        ((pe = !0),
        n
          ? history.replaceState({ userState: r, _index: ye }, '', e)
          : (ye++, history.pushState({ userState: r, _index: ye }, '', e)),
        await De(t));
  }
  function ke(e) {
    return new Promise((t) => {
      const n = _e;
      (_e = () => {
        (_e = n), t();
      }),
        history.go(e);
    });
  }
  function Te() {
    Ee && (Ee(!1), (Ee = null));
  }
  function xe(e, t, n) {
    return new Promise((r) => {
      Te(), be ? (we++, (Ee = r), be(we, e, t, n)) : r(!1);
    });
  }
  async function De(e) {
    var t;
    ve &&
      (await ve(
        location.href,
        null === (t = history.state) || void 0 === t ? void 0 : t.userState,
        e
      ));
  }
  async function Re(e) {
    var t, n;
    _e && (await _e(e)),
      (ye =
        null !==
          (n =
            null === (t = history.state) || void 0 === t ? void 0 : t._index) &&
        void 0 !== n
          ? n
          : 0);
  }
  let Pe;
  function Ue(e) {
    return (Pe = Pe || document.createElement('a')), (Pe.href = e), Pe.href;
  }
  function Ae(e, t) {
    return e ? (e.tagName === t ? e : Ae(e.parentElement, t)) : null;
  }
  function Ne(e) {
    const t = (n = document.baseURI).substring(0, n.lastIndexOf('/'));
    var n;
    const r = e.charAt(t.length);
    return e.startsWith(t) && ('' === r || '/' === r || '?' === r || '#' === r);
  }
  const $e = {
      focus: function (e, t) {
        if (e instanceof HTMLElement) e.focus({ preventScroll: t });
        else {
          if (!(e instanceof SVGElement))
            throw new Error('Unable to focus an invalid element.');
          if (!e.hasAttribute('tabindex'))
            throw new Error(
              'Unable to focus an SVG element that does not have a tabindex.'
            );
          e.focus({ preventScroll: t });
        }
      },
      focusBySelector: function (e) {
        const t = document.querySelector(e);
        t && (t.hasAttribute('tabindex') || (t.tabIndex = -1), t.focus());
      },
    },
    Le = {
      init: function (e, t, n, r = 50) {
        const o = Me(t);
        (o || document.documentElement).style.overflowAnchor = 'none';
        const i = document.createRange();
        h(n.parentElement) &&
          ((t.style.display = 'table-row'), (n.style.display = 'table-row'));
        const s = new IntersectionObserver(
          function (r) {
            r.forEach((r) => {
              var o;
              if (!r.isIntersecting) return;
              i.setStartAfter(t), i.setEndBefore(n);
              const s = i.getBoundingClientRect().height,
                a =
                  null === (o = r.rootBounds) || void 0 === o
                    ? void 0
                    : o.height;
              r.target === t
                ? e.invokeMethodAsync(
                    'OnSpacerBeforeVisible',
                    r.intersectionRect.top - r.boundingClientRect.top,
                    s,
                    a
                  )
                : r.target === n &&
                  n.offsetHeight > 0 &&
                  e.invokeMethodAsync(
                    'OnSpacerAfterVisible',
                    r.boundingClientRect.bottom - r.intersectionRect.bottom,
                    s,
                    a
                  );
            });
          },
          { root: o, rootMargin: `${r}px` }
        );
        s.observe(t), s.observe(n);
        const a = l(t),
          c = l(n);
        function l(e) {
          const t = { attributes: !0 },
            n = new MutationObserver((n, r) => {
              h(e.parentElement) &&
                (r.disconnect(),
                (e.style.display = 'table-row'),
                r.observe(e, t)),
                s.unobserve(e),
                s.observe(e);
            });
          return n.observe(e, t), n;
        }
        function h(e) {
          return (
            null !== e &&
            ((e instanceof HTMLTableElement && '' === e.style.display) ||
              'table' === e.style.display ||
              (e instanceof HTMLTableSectionElement &&
                '' === e.style.display) ||
              'table-row-group' === e.style.display)
          );
        }
        Be[e._id] = {
          intersectionObserver: s,
          mutationObserverBefore: a,
          mutationObserverAfter: c,
        };
      },
      dispose: function (e) {
        const t = Be[e._id];
        t &&
          (t.intersectionObserver.disconnect(),
          t.mutationObserverBefore.disconnect(),
          t.mutationObserverAfter.disconnect(),
          e.dispose(),
          delete Be[e._id]);
      },
    },
    Be = {};
  function Me(e) {
    return e && e !== document.body && e !== document.documentElement
      ? 'visible' !== getComputedStyle(e).overflowY
        ? e
        : Me(e.parentElement)
      : null;
  }
  const Oe = {
      getAndRemoveExistingTitle: function () {
        var e;
        const t = document.head
          ? document.head.getElementsByTagName('title')
          : [];
        if (0 === t.length) return null;
        let n = null;
        for (let r = t.length - 1; r >= 0; r--) {
          const o = t[r],
            i = o.previousSibling;
          (i instanceof Comment && null !== H(i)) ||
            (null === n && (n = o.textContent),
            null === (e = o.parentNode) || void 0 === e || e.removeChild(o));
        }
        return n;
      },
    },
    Fe = {
      init: function (e, t) {
        (t._blazorInputFileNextFileId = 0),
          t.addEventListener('click', function () {
            t.value = '';
          }),
          t.addEventListener('change', function () {
            t._blazorFilesById = {};
            const n = Array.prototype.map.call(t.files, function (e) {
              const n = {
                id: ++t._blazorInputFileNextFileId,
                lastModified: new Date(e.lastModified).toISOString(),
                name: e.name,
                size: e.size,
                contentType: e.type,
                readPromise: void 0,
                arrayBuffer: void 0,
                blob: e,
              };
              return (t._blazorFilesById[n.id] = n), n;
            });
            e.invokeMethodAsync('NotifyChange', n);
          });
      },
      toImageFile: async function (e, t, n, r, o) {
        const i = je(e, t),
          s = await new Promise(function (e) {
            const t = new Image();
            (t.onload = function () {
              URL.revokeObjectURL(t.src), e(t);
            }),
              (t.onerror = function () {
                (t.onerror = null), URL.revokeObjectURL(t.src);
              }),
              (t.src = URL.createObjectURL(i.blob));
          }),
          a = await new Promise(function (e) {
            var t;
            const i = Math.min(1, r / s.width),
              a = Math.min(1, o / s.height),
              c = Math.min(i, a),
              l = document.createElement('canvas');
            (l.width = Math.round(s.width * c)),
              (l.height = Math.round(s.height * c)),
              null === (t = l.getContext('2d')) ||
                void 0 === t ||
                t.drawImage(s, 0, 0, l.width, l.height),
              l.toBlob(e, n);
          }),
          c = {
            id: ++e._blazorInputFileNextFileId,
            lastModified: i.lastModified,
            name: i.name,
            size: (null == a ? void 0 : a.size) || 0,
            contentType: n,
            blob: a || i.blob,
          };
        return (e._blazorFilesById[c.id] = c), c;
      },
      readFileData: async function (e, t) {
        return je(e, t).blob;
      },
    };
  function je(e, t) {
    const n = e._blazorFilesById[t];
    if (!n)
      throw new Error(
        `There is no file with ID ${t}. The file list may have changed. See https://aka.ms/aspnet/blazor-input-file-multiple-selections.`
      );
    return n;
  }
  const He = new Set(),
    We = {
      enableNavigationPrompt: function (e) {
        0 === He.size && window.addEventListener('beforeunload', ze), He.add(e);
      },
      disableNavigationPrompt: function (e) {
        He.delete(e),
          0 === He.size && window.removeEventListener('beforeunload', ze);
      },
    };
  function ze(e) {
    e.preventDefault(), (e.returnValue = !0);
  }
  async function Je(e, t, n) {
    return e instanceof Blob
      ? await (async function (e, t, n) {
          const r = e.slice(t, t + n),
            o = await r.arrayBuffer();
          return new Uint8Array(o);
        })(e, t, n)
      : (function (e, t, n) {
          return new Uint8Array(e.buffer, e.byteOffset + t, n);
        })(e, t, n);
  }
  const qe = new Map(),
    Ve = {
      navigateTo: function (e, t, n = !1) {
        Ce(
          e,
          t instanceof Object ? t : { forceLoad: t, replaceHistoryEntry: n }
        );
      },
      registerCustomEventType: function (e, t) {
        if (!t) throw new Error('The options parameter is required.');
        if (i.has(e))
          throw new Error(`The event '${e}' is already registered.`);
        if (t.browserEventName) {
          const n = s.get(t.browserEventName);
          n ? n.push(e) : s.set(t.browserEventName, [e]),
            a.forEach((n) => n(e, t.browserEventName));
        }
        i.set(e, t);
      },
      rootComponents: w,
      _internal: {
        navigationManager: Se,
        domWrapper: $e,
        Virtualize: Le,
        PageTitle: Oe,
        InputFile: Fe,
        NavigationLock: We,
        getJSDataStreamChunk: Je,
        receiveDotNetDataStream: function (t, n, r, o) {
          let i = qe.get(t);
          if (!i) {
            const n = new ReadableStream({
              start(e) {
                qe.set(t, e), (i = e);
              },
            });
            e.jsCallDispatcher.supplyDotNetStream(t, n);
          }
          o
            ? (i.error(o), qe.delete(t))
            : 0 === r
            ? (i.close(), qe.delete(t))
            : i.enqueue(n.length === r ? n : n.subarray(0, r));
        },
        attachWebRendererInterop: function (t, n, r, o) {
          if (E.has(t))
            throw new Error(
              `Interop methods are already registered for renderer ${t}`
            );
          E.set(t, n),
            Object.keys(r).length > 0 &&
              (function (t, n, r) {
                if (g)
                  throw new Error(
                    'Dynamic root components have already been enabled.'
                  );
                (g = t), (m = n);
                for (const [t, o] of Object.entries(r)) {
                  const r = e.jsCallDispatcher.findJSFunction(t, 0);
                  for (const e of o) r(e, n[e]);
                }
              })(k(t), r, o),
            S();
        },
      },
    };
  window.Blazor = Ve;
  const Ke = [0, 2e3, 1e4, 3e4, null];
  class Xe {
    constructor(e) {
      this._retryDelays = void 0 !== e ? [...e, null] : Ke;
    }
    nextRetryDelayInMilliseconds(e) {
      return this._retryDelays[e.previousRetryCount];
    }
  }
  class Ye {}
  (Ye.Authorization = 'Authorization'), (Ye.Cookie = 'Cookie');
  class Ge {
    constructor(e, t, n) {
      (this.statusCode = e), (this.statusText = t), (this.content = n);
    }
  }
  class Qe {
    get(e, t) {
      return this.send({ ...t, method: 'GET', url: e });
    }
    post(e, t) {
      return this.send({ ...t, method: 'POST', url: e });
    }
    delete(e, t) {
      return this.send({ ...t, method: 'DELETE', url: e });
    }
    getCookieString(e) {
      return '';
    }
  }
  class Ze extends Qe {
    constructor(e, t) {
      super(), (this._innerClient = e), (this._accessTokenFactory = t);
    }
    async send(e) {
      let t = !0;
      this._accessTokenFactory &&
        (!this._accessToken || (e.url && e.url.indexOf('/negotiate?') > 0)) &&
        ((t = !1), (this._accessToken = await this._accessTokenFactory())),
        this._setAuthorizationHeader(e);
      const n = await this._innerClient.send(e);
      return t && 401 === n.statusCode && this._accessTokenFactory
        ? ((this._accessToken = await this._accessTokenFactory()),
          this._setAuthorizationHeader(e),
          await this._innerClient.send(e))
        : n;
    }
    _setAuthorizationHeader(e) {
      e.headers || (e.headers = {}),
        this._accessToken
          ? (e.headers[Ye.Authorization] = `Bearer ${this._accessToken}`)
          : this._accessTokenFactory &&
            e.headers[Ye.Authorization] &&
            delete e.headers[Ye.Authorization];
    }
    getCookieString(e) {
      return this._innerClient.getCookieString(e);
    }
  }
  class et extends Error {
    constructor(e, t) {
      const n = new.target.prototype;
      super(`${e}: Status code '${t}'`),
        (this.statusCode = t),
        (this.__proto__ = n);
    }
  }
  class tt extends Error {
    constructor(e = 'A timeout occurred.') {
      const t = new.target.prototype;
      super(e), (this.__proto__ = t);
    }
  }
  class nt extends Error {
    constructor(e = 'An abort occurred.') {
      const t = new.target.prototype;
      super(e), (this.__proto__ = t);
    }
  }
  class rt extends Error {
    constructor(e, t) {
      const n = new.target.prototype;
      super(e),
        (this.transport = t),
        (this.errorType = 'UnsupportedTransportError'),
        (this.__proto__ = n);
    }
  }
  class ot extends Error {
    constructor(e, t) {
      const n = new.target.prototype;
      super(e),
        (this.transport = t),
        (this.errorType = 'DisabledTransportError'),
        (this.__proto__ = n);
    }
  }
  class it extends Error {
    constructor(e, t) {
      const n = new.target.prototype;
      super(e),
        (this.transport = t),
        (this.errorType = 'FailedToStartTransportError'),
        (this.__proto__ = n);
    }
  }
  class st extends Error {
    constructor(e) {
      const t = new.target.prototype;
      super(e),
        (this.errorType = 'FailedToNegotiateWithServerError'),
        (this.__proto__ = t);
    }
  }
  class at extends Error {
    constructor(e, t) {
      const n = new.target.prototype;
      super(e), (this.innerErrors = t), (this.__proto__ = n);
    }
  }
  var ct, lt, ht, ut, dt;
  !(function (e) {
    (e[(e.Trace = 0)] = 'Trace'),
      (e[(e.Debug = 1)] = 'Debug'),
      (e[(e.Information = 2)] = 'Information'),
      (e[(e.Warning = 3)] = 'Warning'),
      (e[(e.Error = 4)] = 'Error'),
      (e[(e.Critical = 5)] = 'Critical'),
      (e[(e.None = 6)] = 'None');
  })(ct || (ct = {}));
  class pt {
    constructor() {}
    log(e, t) {}
  }
  pt.instance = new pt();
  class ft {
    static isRequired(e, t) {
      if (null == e) throw new Error(`The '${t}' argument is required.`);
    }
    static isNotEmpty(e, t) {
      if (!e || e.match(/^\s*$/))
        throw new Error(`The '${t}' argument should not be empty.`);
    }
    static isIn(e, t, n) {
      if (!(e in t)) throw new Error(`Unknown ${n} value: ${e}.`);
    }
  }
  class gt {
    static get isBrowser() {
      return 'object' == typeof window && 'object' == typeof window.document;
    }
    static get isWebWorker() {
      return 'object' == typeof self && 'importScripts' in self;
    }
    static get isReactNative() {
      return 'object' == typeof window && void 0 === window.document;
    }
    static get isNode() {
      return !this.isBrowser && !this.isWebWorker && !this.isReactNative;
    }
  }
  function mt(e, t) {
    let n = '';
    return (
      yt(e)
        ? ((n = `Binary data of length ${e.byteLength}`),
          t &&
            (n += `. Content: '${(function (e) {
              const t = new Uint8Array(e);
              let n = '';
              return (
                t.forEach((e) => {
                  n += `0x${e < 16 ? '0' : ''}${e.toString(16)} `;
                }),
                n.substr(0, n.length - 1)
              );
            })(e)}'`))
        : 'string' == typeof e &&
          ((n = `String data of length ${e.length}`),
          t && (n += `. Content: '${e}'`)),
      n
    );
  }
  function yt(e) {
    return (
      e &&
      'undefined' != typeof ArrayBuffer &&
      (e instanceof ArrayBuffer ||
        (e.constructor && 'ArrayBuffer' === e.constructor.name))
    );
  }
  async function wt(e, t, n, r, o, i) {
    const s = {},
      [a, c] = _t();
    (s[a] = c),
      e.log(
        ct.Trace,
        `(${t} transport) sending data. ${mt(o, i.logMessageContent)}.`
      );
    const l = yt(o) ? 'arraybuffer' : 'text',
      h = await n.post(r, {
        content: o,
        headers: { ...s, ...i.headers },
        responseType: l,
        timeout: i.timeout,
        withCredentials: i.withCredentials,
      });
    e.log(
      ct.Trace,
      `(${t} transport) request complete. Response status: ${h.statusCode}.`
    );
  }
  class vt {
    constructor(e, t) {
      (this._subject = e), (this._observer = t);
    }
    dispose() {
      const e = this._subject.observers.indexOf(this._observer);
      e > -1 && this._subject.observers.splice(e, 1),
        0 === this._subject.observers.length &&
          this._subject.cancelCallback &&
          this._subject.cancelCallback().catch((e) => {});
    }
  }
  class bt {
    constructor(e) {
      (this._minLevel = e), (this.out = console);
    }
    log(e, t) {
      if (e >= this._minLevel) {
        const n = `[${new Date().toISOString()}] ${ct[e]}: ${t}`;
        switch (e) {
          case ct.Critical:
          case ct.Error:
            this.out.error(n);
            break;
          case ct.Warning:
            this.out.warn(n);
            break;
          case ct.Information:
            this.out.info(n);
            break;
          default:
            this.out.log(n);
        }
      }
    }
  }
  function _t() {
    let e = 'X-SignalR-User-Agent';
    return (
      gt.isNode && (e = 'User-Agent'),
      [e, Et('8.0.0-dev', St(), gt.isNode ? 'NodeJS' : 'Browser', Ct())]
    );
  }
  function Et(e, t, n, r) {
    let o = 'Microsoft SignalR/';
    const i = e.split('.');
    return (
      (o += `${i[0]}.${i[1]}`),
      (o += ` (${e}; `),
      (o += t && '' !== t ? `${t}; ` : 'Unknown OS; '),
      (o += `${n}`),
      (o += r ? `; ${r}` : '; Unknown Runtime Version'),
      (o += ')'),
      o
    );
  }
  function St() {
    if (!gt.isNode) return '';
    switch (process.platform) {
      case 'win32':
        return 'Windows NT';
      case 'darwin':
        return 'macOS';
      case 'linux':
        return 'Linux';
      default:
        return process.platform;
    }
  }
  function Ct() {
    if (gt.isNode) return process.versions.node;
  }
  function It(e) {
    return e.stack ? e.stack : e.message ? e.message : `${e}`;
  }
  class kt extends Qe {
    constructor(e) {
      if ((super(), (this._logger = e), 'undefined' == typeof fetch)) {
        const e = require;
        (this._jar = new (e('tough-cookie').CookieJar)()),
          (this._fetchType = e('node-fetch')),
          (this._fetchType = e('fetch-cookie')(this._fetchType, this._jar));
      } else
        this._fetchType = fetch.bind(
          (function () {
            if ('undefined' != typeof globalThis) return globalThis;
            if ('undefined' != typeof self) return self;
            if ('undefined' != typeof window) return window;
            if (void 0 !== r.g) return r.g;
            throw new Error('could not find global');
          })()
        );
      if ('undefined' == typeof AbortController) {
        const e = require;
        this._abortControllerType = e('abort-controller');
      } else this._abortControllerType = AbortController;
    }
    async send(e) {
      if (e.abortSignal && e.abortSignal.aborted) throw new nt();
      if (!e.method) throw new Error('No method defined.');
      if (!e.url) throw new Error('No url defined.');
      const t = new this._abortControllerType();
      let n;
      e.abortSignal &&
        (e.abortSignal.onabort = () => {
          t.abort(), (n = new nt());
        });
      let r,
        o = null;
      if (e.timeout) {
        const r = e.timeout;
        o = setTimeout(() => {
          t.abort(),
            this._logger.log(ct.Warning, 'Timeout from HTTP request.'),
            (n = new tt());
        }, r);
      }
      '' === e.content && (e.content = void 0),
        e.content &&
          ((e.headers = e.headers || {}),
          yt(e.content)
            ? (e.headers['Content-Type'] = 'application/octet-stream')
            : (e.headers['Content-Type'] = 'text/plain;charset=UTF-8'));
      try {
        r = await this._fetchType(e.url, {
          body: e.content,
          cache: 'no-cache',
          credentials: !0 === e.withCredentials ? 'include' : 'same-origin',
          headers: { 'X-Requested-With': 'XMLHttpRequest', ...e.headers },
          method: e.method,
          mode: 'cors',
          redirect: 'follow',
          signal: t.signal,
        });
      } catch (e) {
        if (n) throw n;
        throw (
          (this._logger.log(ct.Warning, `Error from HTTP request. ${e}.`), e)
        );
      } finally {
        o && clearTimeout(o), e.abortSignal && (e.abortSignal.onabort = null);
      }
      if (!r.ok) {
        const e = await Tt(r, 'text');
        throw new et(e || r.statusText, r.status);
      }
      const i = Tt(r, e.responseType),
        s = await i;
      return new Ge(r.status, r.statusText, s);
    }
    getCookieString(e) {
      return '';
    }
  }
  function Tt(e, t) {
    let n;
    switch (t) {
      case 'arraybuffer':
        n = e.arrayBuffer();
        break;
      case 'text':
      default:
        n = e.text();
        break;
      case 'blob':
      case 'document':
      case 'json':
        throw new Error(`${t} is not supported.`);
    }
    return n;
  }
  class xt extends Qe {
    constructor(e) {
      super(), (this._logger = e);
    }
    send(e) {
      return e.abortSignal && e.abortSignal.aborted
        ? Promise.reject(new nt())
        : e.method
        ? e.url
          ? new Promise((t, n) => {
              const r = new XMLHttpRequest();
              r.open(e.method, e.url, !0),
                (r.withCredentials =
                  void 0 === e.withCredentials || e.withCredentials),
                r.setRequestHeader('X-Requested-With', 'XMLHttpRequest'),
                '' === e.content && (e.content = void 0),
                e.content &&
                  (yt(e.content)
                    ? r.setRequestHeader(
                        'Content-Type',
                        'application/octet-stream'
                      )
                    : r.setRequestHeader(
                        'Content-Type',
                        'text/plain;charset=UTF-8'
                      ));
              const o = e.headers;
              o &&
                Object.keys(o).forEach((e) => {
                  r.setRequestHeader(e, o[e]);
                }),
                e.responseType && (r.responseType = e.responseType),
                e.abortSignal &&
                  (e.abortSignal.onabort = () => {
                    r.abort(), n(new nt());
                  }),
                e.timeout && (r.timeout = e.timeout),
                (r.onload = () => {
                  e.abortSignal && (e.abortSignal.onabort = null),
                    r.status >= 200 && r.status < 300
                      ? t(
                          new Ge(
                            r.status,
                            r.statusText,
                            r.response || r.responseText
                          )
                        )
                      : n(
                          new et(
                            r.response || r.responseText || r.statusText,
                            r.status
                          )
                        );
                }),
                (r.onerror = () => {
                  this._logger.log(
                    ct.Warning,
                    `Error from HTTP request. ${r.status}: ${r.statusText}.`
                  ),
                    n(new et(r.statusText, r.status));
                }),
                (r.ontimeout = () => {
                  this._logger.log(ct.Warning, 'Timeout from HTTP request.'),
                    n(new tt());
                }),
                r.send(e.content);
            })
          : Promise.reject(new Error('No url defined.'))
        : Promise.reject(new Error('No method defined.'));
    }
  }
  class Dt extends Qe {
    constructor(e) {
      if ((super(), 'undefined' != typeof fetch)) this._httpClient = new kt(e);
      else {
        if ('undefined' == typeof XMLHttpRequest)
          throw new Error('No usable HttpClient found.');
        this._httpClient = new xt(e);
      }
    }
    send(e) {
      return e.abortSignal && e.abortSignal.aborted
        ? Promise.reject(new nt())
        : e.method
        ? e.url
          ? this._httpClient.send(e)
          : Promise.reject(new Error('No url defined.'))
        : Promise.reject(new Error('No method defined.'));
    }
    getCookieString(e) {
      return this._httpClient.getCookieString(e);
    }
  }
  !(function (e) {
    (e[(e.None = 0)] = 'None'),
      (e[(e.WebSockets = 1)] = 'WebSockets'),
      (e[(e.ServerSentEvents = 2)] = 'ServerSentEvents'),
      (e[(e.LongPolling = 4)] = 'LongPolling');
  })(lt || (lt = {})),
    (function (e) {
      (e[(e.Text = 1)] = 'Text'), (e[(e.Binary = 2)] = 'Binary');
    })(ht || (ht = {}));
  class Rt {
    constructor() {
      (this._isAborted = !1), (this.onabort = null);
    }
    abort() {
      this._isAborted ||
        ((this._isAborted = !0), this.onabort && this.onabort());
    }
    get signal() {
      return this;
    }
    get aborted() {
      return this._isAborted;
    }
  }
  class Pt {
    constructor(e, t, n) {
      (this._httpClient = e),
        (this._logger = t),
        (this._pollAbort = new Rt()),
        (this._options = n),
        (this._running = !1),
        (this.onreceive = null),
        (this.onclose = null);
    }
    get pollAborted() {
      return this._pollAbort.aborted;
    }
    async connect(e, t) {
      if (
        (ft.isRequired(e, 'url'),
        ft.isRequired(t, 'transferFormat'),
        ft.isIn(t, ht, 'transferFormat'),
        (this._url = e),
        this._logger.log(ct.Trace, '(LongPolling transport) Connecting.'),
        t === ht.Binary &&
          'undefined' != typeof XMLHttpRequest &&
          'string' != typeof new XMLHttpRequest().responseType)
      )
        throw new Error(
          'Binary protocols over XmlHttpRequest not implementing advanced features are not supported.'
        );
      const [n, r] = _t(),
        o = { [n]: r, ...this._options.headers },
        i = {
          abortSignal: this._pollAbort.signal,
          headers: o,
          timeout: 1e5,
          withCredentials: this._options.withCredentials,
        };
      t === ht.Binary && (i.responseType = 'arraybuffer');
      const s = `${e}&_=${Date.now()}`;
      this._logger.log(ct.Trace, `(LongPolling transport) polling: ${s}.`);
      const a = await this._httpClient.get(s, i);
      200 !== a.statusCode
        ? (this._logger.log(
            ct.Error,
            `(LongPolling transport) Unexpected response code: ${a.statusCode}.`
          ),
          (this._closeError = new et(a.statusText || '', a.statusCode)),
          (this._running = !1))
        : (this._running = !0),
        (this._receiving = this._poll(this._url, i));
    }
    async _poll(e, t) {
      try {
        for (; this._running; )
          try {
            const n = `${e}&_=${Date.now()}`;
            this._logger.log(
              ct.Trace,
              `(LongPolling transport) polling: ${n}.`
            );
            const r = await this._httpClient.get(n, t);
            204 === r.statusCode
              ? (this._logger.log(
                  ct.Information,
                  '(LongPolling transport) Poll terminated by server.'
                ),
                (this._running = !1))
              : 200 !== r.statusCode
              ? (this._logger.log(
                  ct.Error,
                  `(LongPolling transport) Unexpected response code: ${r.statusCode}.`
                ),
                (this._closeError = new et(r.statusText || '', r.statusCode)),
                (this._running = !1))
              : r.content
              ? (this._logger.log(
                  ct.Trace,
                  `(LongPolling transport) data received. ${mt(
                    r.content,
                    this._options.logMessageContent
                  )}.`
                ),
                this.onreceive && this.onreceive(r.content))
              : this._logger.log(
                  ct.Trace,
                  '(LongPolling transport) Poll timed out, reissuing.'
                );
          } catch (e) {
            this._running
              ? e instanceof tt
                ? this._logger.log(
                    ct.Trace,
                    '(LongPolling transport) Poll timed out, reissuing.'
                  )
                : ((this._closeError = e), (this._running = !1))
              : this._logger.log(
                  ct.Trace,
                  `(LongPolling transport) Poll errored after shutdown: ${e.message}`
                );
          }
      } finally {
        this._logger.log(ct.Trace, '(LongPolling transport) Polling complete.'),
          this.pollAborted || this._raiseOnClose();
      }
    }
    async send(e) {
      return this._running
        ? wt(
            this._logger,
            'LongPolling',
            this._httpClient,
            this._url,
            e,
            this._options
          )
        : Promise.reject(
            new Error('Cannot send until the transport is connected')
          );
    }
    async stop() {
      this._logger.log(ct.Trace, '(LongPolling transport) Stopping polling.'),
        (this._running = !1),
        this._pollAbort.abort();
      try {
        await this._receiving,
          this._logger.log(
            ct.Trace,
            `(LongPolling transport) sending DELETE request to ${this._url}.`
          );
        const e = {},
          [t, n] = _t();
        e[t] = n;
        const r = {
          headers: { ...e, ...this._options.headers },
          timeout: this._options.timeout,
          withCredentials: this._options.withCredentials,
        };
        await this._httpClient.delete(this._url, r),
          this._logger.log(
            ct.Trace,
            '(LongPolling transport) DELETE request sent.'
          );
      } finally {
        this._logger.log(ct.Trace, '(LongPolling transport) Stop finished.'),
          this._raiseOnClose();
      }
    }
    _raiseOnClose() {
      if (this.onclose) {
        let e = '(LongPolling transport) Firing onclose event.';
        this._closeError && (e += ' Error: ' + this._closeError),
          this._logger.log(ct.Trace, e),
          this.onclose(this._closeError);
      }
    }
  }
  class Ut {
    constructor(e, t, n, r) {
      (this._httpClient = e),
        (this._accessToken = t),
        (this._logger = n),
        (this._options = r),
        (this.onreceive = null),
        (this.onclose = null);
    }
    async connect(e, t) {
      return (
        ft.isRequired(e, 'url'),
        ft.isRequired(t, 'transferFormat'),
        ft.isIn(t, ht, 'transferFormat'),
        this._logger.log(ct.Trace, '(SSE transport) Connecting.'),
        (this._url = e),
        this._accessToken &&
          (e +=
            (e.indexOf('?') < 0 ? '?' : '&') +
            `access_token=${encodeURIComponent(this._accessToken)}`),
        new Promise((n, r) => {
          let o,
            i = !1;
          if (t === ht.Text) {
            if (gt.isBrowser || gt.isWebWorker)
              o = new this._options.EventSource(e, {
                withCredentials: this._options.withCredentials,
              });
            else {
              const t = this._httpClient.getCookieString(e),
                n = {};
              n.Cookie = t;
              const [r, i] = _t();
              (n[r] = i),
                (o = new this._options.EventSource(e, {
                  withCredentials: this._options.withCredentials,
                  headers: { ...n, ...this._options.headers },
                }));
            }
            try {
              (o.onmessage = (e) => {
                if (this.onreceive)
                  try {
                    this._logger.log(
                      ct.Trace,
                      `(SSE transport) data received. ${mt(
                        e.data,
                        this._options.logMessageContent
                      )}.`
                    ),
                      this.onreceive(e.data);
                  } catch (e) {
                    return void this._close(e);
                  }
              }),
                (o.onerror = (e) => {
                  i
                    ? this._close()
                    : r(
                        new Error(
                          'EventSource failed to connect. The connection could not be found on the server, either the connection ID is not present on the server, or a proxy is refusing/buffering the connection. If you have multiple servers check that sticky sessions are enabled.'
                        )
                      );
                }),
                (o.onopen = () => {
                  this._logger.log(
                    ct.Information,
                    `SSE connected to ${this._url}`
                  ),
                    (this._eventSource = o),
                    (i = !0),
                    n();
                });
            } catch (e) {
              return void r(e);
            }
          } else
            r(
              new Error(
                "The Server-Sent Events transport only supports the 'Text' transfer format"
              )
            );
        })
      );
    }
    async send(e) {
      return this._eventSource
        ? wt(this._logger, 'SSE', this._httpClient, this._url, e, this._options)
        : Promise.reject(
            new Error('Cannot send until the transport is connected')
          );
    }
    stop() {
      return this._close(), Promise.resolve();
    }
    _close(e) {
      this._eventSource &&
        (this._eventSource.close(),
        (this._eventSource = void 0),
        this.onclose && this.onclose(e));
    }
  }
  class At {
    constructor(e, t, n, r, o, i) {
      (this._logger = n),
        (this._accessTokenFactory = t),
        (this._logMessageContent = r),
        (this._webSocketConstructor = o),
        (this._httpClient = e),
        (this.onreceive = null),
        (this.onclose = null),
        (this._headers = i);
    }
    async connect(e, t) {
      let n;
      return (
        ft.isRequired(e, 'url'),
        ft.isRequired(t, 'transferFormat'),
        ft.isIn(t, ht, 'transferFormat'),
        this._logger.log(ct.Trace, '(WebSockets transport) Connecting.'),
        this._accessTokenFactory && (n = await this._accessTokenFactory()),
        new Promise((r, o) => {
          let i;
          e = e.replace(/^http/, 'ws');
          const s = this._httpClient.getCookieString(e);
          let a = !1;
          if (gt.isReactNative) {
            const t = {},
              [r, o] = _t();
            (t[r] = o),
              n && (t[Ye.Authorization] = `Bearer ${n}`),
              s && (t[Ye.Cookie] = s),
              (i = new this._webSocketConstructor(e, void 0, {
                headers: { ...t, ...this._headers },
              }));
          } else
            n &&
              (e +=
                (e.indexOf('?') < 0 ? '?' : '&') +
                `access_token=${encodeURIComponent(n)}`);
          i || (i = new this._webSocketConstructor(e)),
            t === ht.Binary && (i.binaryType = 'arraybuffer'),
            (i.onopen = (t) => {
              this._logger.log(ct.Information, `WebSocket connected to ${e}.`),
                (this._webSocket = i),
                (a = !0),
                r();
            }),
            (i.onerror = (e) => {
              let t = null;
              (t =
                'undefined' != typeof ErrorEvent && e instanceof ErrorEvent
                  ? e.error
                  : 'There was an error with the transport'),
                this._logger.log(
                  ct.Information,
                  `(WebSockets transport) ${t}.`
                );
            }),
            (i.onmessage = (e) => {
              if (
                (this._logger.log(
                  ct.Trace,
                  `(WebSockets transport) data received. ${mt(
                    e.data,
                    this._logMessageContent
                  )}.`
                ),
                this.onreceive)
              )
                try {
                  this.onreceive(e.data);
                } catch (e) {
                  return void this._close(e);
                }
            }),
            (i.onclose = (e) => {
              if (a) this._close(e);
              else {
                let t = null;
                (t =
                  'undefined' != typeof ErrorEvent && e instanceof ErrorEvent
                    ? e.error
                    : 'WebSocket failed to connect. The connection could not be found on the server, either the endpoint may not be a SignalR endpoint, the connection ID is not present on the server, or there is a proxy blocking WebSockets. If you have multiple servers check that sticky sessions are enabled.'),
                  o(new Error(t));
              }
            });
        })
      );
    }
    send(e) {
      return this._webSocket &&
        this._webSocket.readyState === this._webSocketConstructor.OPEN
        ? (this._logger.log(
            ct.Trace,
            `(WebSockets transport) sending data. ${mt(
              e,
              this._logMessageContent
            )}.`
          ),
          this._webSocket.send(e),
          Promise.resolve())
        : Promise.reject('WebSocket is not in the OPEN state');
    }
    stop() {
      return this._webSocket && this._close(void 0), Promise.resolve();
    }
    _close(e) {
      this._webSocket &&
        ((this._webSocket.onclose = () => {}),
        (this._webSocket.onmessage = () => {}),
        (this._webSocket.onerror = () => {}),
        this._webSocket.close(),
        (this._webSocket = void 0)),
        this._logger.log(ct.Trace, '(WebSockets transport) socket closed.'),
        this.onclose &&
          (!this._isCloseEvent(e) || (!1 !== e.wasClean && 1e3 === e.code)
            ? e instanceof Error
              ? this.onclose(e)
              : this.onclose()
            : this.onclose(
                new Error(
                  `WebSocket closed with status code: ${e.code} (${
                    e.reason || 'no reason given'
                  }).`
                )
              ));
    }
    _isCloseEvent(e) {
      return e && 'boolean' == typeof e.wasClean && 'number' == typeof e.code;
    }
  }
  class Nt {
    constructor(e, t = {}) {
      var n;
      if (
        ((this._stopPromiseResolver = () => {}),
        (this.features = {}),
        (this._negotiateVersion = 1),
        ft.isRequired(e, 'url'),
        (this._logger =
          void 0 === (n = t.logger)
            ? new bt(ct.Information)
            : null === n
            ? pt.instance
            : void 0 !== n.log
            ? n
            : new bt(n)),
        (this.baseUrl = this._resolveUrl(e)),
        ((t = t || {}).logMessageContent =
          void 0 !== t.logMessageContent && t.logMessageContent),
        'boolean' != typeof t.withCredentials && void 0 !== t.withCredentials)
      )
        throw new Error(
          "withCredentials option was not a 'boolean' or 'undefined' value"
        );
      (t.withCredentials = void 0 === t.withCredentials || t.withCredentials),
        (t.timeout = void 0 === t.timeout ? 1e5 : t.timeout),
        'undefined' == typeof WebSocket ||
          t.WebSocket ||
          (t.WebSocket = WebSocket),
        'undefined' == typeof EventSource ||
          t.EventSource ||
          (t.EventSource = EventSource),
        (this._httpClient = new Ze(
          t.httpClient || new Dt(this._logger),
          t.accessTokenFactory
        )),
        (this._connectionState = 'Disconnected'),
        (this._connectionStarted = !1),
        (this._options = t),
        (this.onreceive = null),
        (this.onclose = null);
    }
    async start(e) {
      if (
        ((e = e || ht.Binary),
        ft.isIn(e, ht, 'transferFormat'),
        this._logger.log(
          ct.Debug,
          `Starting connection with transfer format '${ht[e]}'.`
        ),
        'Disconnected' !== this._connectionState)
      )
        return Promise.reject(
          new Error(
            "Cannot start an HttpConnection that is not in the 'Disconnected' state."
          )
        );
      if (
        ((this._connectionState = 'Connecting'),
        (this._startInternalPromise = this._startInternal(e)),
        await this._startInternalPromise,
        'Disconnecting' === this._connectionState)
      ) {
        const e =
          'Failed to start the HttpConnection before stop() was called.';
        return (
          this._logger.log(ct.Error, e),
          await this._stopPromise,
          Promise.reject(new nt(e))
        );
      }
      if ('Connected' !== this._connectionState) {
        const e =
          "HttpConnection.startInternal completed gracefully but didn't enter the connection into the connected state!";
        return this._logger.log(ct.Error, e), Promise.reject(new nt(e));
      }
      this._connectionStarted = !0;
    }
    send(e) {
      return 'Connected' !== this._connectionState
        ? Promise.reject(
            new Error(
              "Cannot send data if the connection is not in the 'Connected' State."
            )
          )
        : (this._sendQueue || (this._sendQueue = new $t(this.transport)),
          this._sendQueue.send(e));
    }
    async stop(e) {
      return 'Disconnected' === this._connectionState
        ? (this._logger.log(
            ct.Debug,
            `Call to HttpConnection.stop(${e}) ignored because the connection is already in the disconnected state.`
          ),
          Promise.resolve())
        : 'Disconnecting' === this._connectionState
        ? (this._logger.log(
            ct.Debug,
            `Call to HttpConnection.stop(${e}) ignored because the connection is already in the disconnecting state.`
          ),
          this._stopPromise)
        : ((this._connectionState = 'Disconnecting'),
          (this._stopPromise = new Promise((e) => {
            this._stopPromiseResolver = e;
          })),
          await this._stopInternal(e),
          void (await this._stopPromise));
    }
    async _stopInternal(e) {
      this._stopError = e;
      try {
        await this._startInternalPromise;
      } catch (e) {}
      if (this.transport) {
        try {
          await this.transport.stop();
        } catch (e) {
          this._logger.log(
            ct.Error,
            `HttpConnection.transport.stop() threw error '${e}'.`
          ),
            this._stopConnection();
        }
        this.transport = void 0;
      } else
        this._logger.log(
          ct.Debug,
          'HttpConnection.transport is undefined in HttpConnection.stop() because start() failed.'
        );
    }
    async _startInternal(e) {
      let t = this.baseUrl;
      (this._accessTokenFactory = this._options.accessTokenFactory),
        (this._httpClient._accessTokenFactory = this._accessTokenFactory);
      try {
        if (this._options.skipNegotiation) {
          if (this._options.transport !== lt.WebSockets)
            throw new Error(
              'Negotiation can only be skipped when using the WebSocket transport directly.'
            );
          (this.transport = this._constructTransport(lt.WebSockets)),
            await this._startTransport(t, e);
        } else {
          let n = null,
            r = 0;
          do {
            if (
              ((n = await this._getNegotiationResponse(t)),
              'Disconnecting' === this._connectionState ||
                'Disconnected' === this._connectionState)
            )
              throw new nt('The connection was stopped during negotiation.');
            if (n.error) throw new Error(n.error);
            if (n.ProtocolVersion)
              throw new Error(
                'Detected a connection attempt to an ASP.NET SignalR Server. This client only supports connecting to an ASP.NET Core SignalR Server. See https://aka.ms/signalr-core-differences for details.'
              );
            if ((n.url && (t = n.url), n.accessToken)) {
              const e = n.accessToken;
              (this._accessTokenFactory = () => e),
                (this._httpClient._accessToken = e),
                (this._httpClient._accessTokenFactory = void 0);
            }
            r++;
          } while (n.url && r < 100);
          if (100 === r && n.url)
            throw new Error('Negotiate redirection limit exceeded.');
          await this._createTransport(t, this._options.transport, n, e);
        }
        this.transport instanceof Pt && (this.features.inherentKeepAlive = !0),
          'Connecting' === this._connectionState &&
            (this._logger.log(
              ct.Debug,
              'The HttpConnection connected successfully.'
            ),
            (this._connectionState = 'Connected'));
      } catch (e) {
        return (
          this._logger.log(ct.Error, 'Failed to start the connection: ' + e),
          (this._connectionState = 'Disconnected'),
          (this.transport = void 0),
          this._stopPromiseResolver(),
          Promise.reject(e)
        );
      }
    }
    async _getNegotiationResponse(e) {
      const t = {},
        [n, r] = _t();
      t[n] = r;
      const o = this._resolveNegotiateUrl(e);
      this._logger.log(ct.Debug, `Sending negotiation request: ${o}.`);
      try {
        const e = await this._httpClient.post(o, {
          content: '',
          headers: { ...t, ...this._options.headers },
          timeout: this._options.timeout,
          withCredentials: this._options.withCredentials,
        });
        if (200 !== e.statusCode)
          return Promise.reject(
            new Error(
              `Unexpected status code returned from negotiate '${e.statusCode}'`
            )
          );
        const n = JSON.parse(e.content);
        return (
          (!n.negotiateVersion || n.negotiateVersion < 1) &&
            (n.connectionToken = n.connectionId),
          n
        );
      } catch (e) {
        let t = 'Failed to complete negotiation with the server: ' + e;
        return (
          e instanceof et &&
            404 === e.statusCode &&
            (t +=
              ' Either this is not a SignalR endpoint or there is a proxy blocking the connection.'),
          this._logger.log(ct.Error, t),
          Promise.reject(new st(t))
        );
      }
    }
    _createConnectUrl(e, t) {
      return t ? e + (-1 === e.indexOf('?') ? '?' : '&') + `id=${t}` : e;
    }
    async _createTransport(e, t, n, r) {
      let o = this._createConnectUrl(e, n.connectionToken);
      if (this._isITransport(t))
        return (
          this._logger.log(
            ct.Debug,
            'Connection was provided an instance of ITransport, using that directly.'
          ),
          (this.transport = t),
          await this._startTransport(o, r),
          void (this.connectionId = n.connectionId)
        );
      const i = [],
        s = n.availableTransports || [];
      let a = n;
      for (const n of s) {
        const s = this._resolveTransportOrError(n, t, r);
        if (s instanceof Error) i.push(`${n.transport} failed:`), i.push(s);
        else if (this._isITransport(s)) {
          if (((this.transport = s), !a)) {
            try {
              a = await this._getNegotiationResponse(e);
            } catch (e) {
              return Promise.reject(e);
            }
            o = this._createConnectUrl(e, a.connectionToken);
          }
          try {
            return (
              await this._startTransport(o, r),
              void (this.connectionId = a.connectionId)
            );
          } catch (e) {
            if (
              (this._logger.log(
                ct.Error,
                `Failed to start the transport '${n.transport}': ${e}`
              ),
              (a = void 0),
              i.push(new it(`${n.transport} failed: ${e}`, lt[n.transport])),
              'Connecting' !== this._connectionState)
            ) {
              const e = 'Failed to select transport before stop() was called.';
              return this._logger.log(ct.Debug, e), Promise.reject(new nt(e));
            }
          }
        }
      }
      return i.length > 0
        ? Promise.reject(
            new at(
              `Unable to connect to the server with any of the available transports. ${i.join(
                ' '
              )}`,
              i
            )
          )
        : Promise.reject(
            new Error(
              'None of the transports supported by the client are supported by the server.'
            )
          );
    }
    _constructTransport(e) {
      switch (e) {
        case lt.WebSockets:
          if (!this._options.WebSocket)
            throw new Error(
              "'WebSocket' is not supported in your environment."
            );
          return new At(
            this._httpClient,
            this._accessTokenFactory,
            this._logger,
            this._options.logMessageContent,
            this._options.WebSocket,
            this._options.headers || {}
          );
        case lt.ServerSentEvents:
          if (!this._options.EventSource)
            throw new Error(
              "'EventSource' is not supported in your environment."
            );
          return new Ut(
            this._httpClient,
            this._httpClient._accessToken,
            this._logger,
            this._options
          );
        case lt.LongPolling:
          return new Pt(this._httpClient, this._logger, this._options);
        default:
          throw new Error(`Unknown transport: ${e}.`);
      }
    }
    _startTransport(e, t) {
      return (
        (this.transport.onreceive = this.onreceive),
        (this.transport.onclose = (e) => this._stopConnection(e)),
        this.transport.connect(e, t)
      );
    }
    _resolveTransportOrError(e, t, n) {
      const r = lt[e.transport];
      if (null == r)
        return (
          this._logger.log(
            ct.Debug,
            `Skipping transport '${e.transport}' because it is not supported by this client.`
          ),
          new Error(
            `Skipping transport '${e.transport}' because it is not supported by this client.`
          )
        );
      if (
        !(function (e, t) {
          return !e || 0 != (t & e);
        })(t, r)
      )
        return (
          this._logger.log(
            ct.Debug,
            `Skipping transport '${lt[r]}' because it was disabled by the client.`
          ),
          new ot(`'${lt[r]}' is disabled by the client.`, r)
        );
      if (!(e.transferFormats.map((e) => ht[e]).indexOf(n) >= 0))
        return (
          this._logger.log(
            ct.Debug,
            `Skipping transport '${lt[r]}' because it does not support the requested transfer format '${ht[n]}'.`
          ),
          new Error(`'${lt[r]}' does not support ${ht[n]}.`)
        );
      if (
        (r === lt.WebSockets && !this._options.WebSocket) ||
        (r === lt.ServerSentEvents && !this._options.EventSource)
      )
        return (
          this._logger.log(
            ct.Debug,
            `Skipping transport '${lt[r]}' because it is not supported in your environment.'`
          ),
          new rt(`'${lt[r]}' is not supported in your environment.`, r)
        );
      this._logger.log(ct.Debug, `Selecting transport '${lt[r]}'.`);
      try {
        return this._constructTransport(r);
      } catch (e) {
        return e;
      }
    }
    _isITransport(e) {
      return e && 'object' == typeof e && 'connect' in e;
    }
    _stopConnection(e) {
      if (
        (this._logger.log(
          ct.Debug,
          `HttpConnection.stopConnection(${e}) called while in state ${this._connectionState}.`
        ),
        (this.transport = void 0),
        (e = this._stopError || e),
        (this._stopError = void 0),
        'Disconnected' !== this._connectionState)
      ) {
        if ('Connecting' === this._connectionState)
          throw (
            (this._logger.log(
              ct.Warning,
              `Call to HttpConnection.stopConnection(${e}) was ignored because the connection is still in the connecting state.`
            ),
            new Error(
              `HttpConnection.stopConnection(${e}) was called while the connection is still in the connecting state.`
            ))
          );
        if (
          ('Disconnecting' === this._connectionState &&
            this._stopPromiseResolver(),
          e
            ? this._logger.log(
                ct.Error,
                `Connection disconnected with error '${e}'.`
              )
            : this._logger.log(ct.Information, 'Connection disconnected.'),
          this._sendQueue &&
            (this._sendQueue.stop().catch((e) => {
              this._logger.log(
                ct.Error,
                `TransportSendQueue.stop() threw error '${e}'.`
              );
            }),
            (this._sendQueue = void 0)),
          (this.connectionId = void 0),
          (this._connectionState = 'Disconnected'),
          this._connectionStarted)
        ) {
          this._connectionStarted = !1;
          try {
            this.onclose && this.onclose(e);
          } catch (t) {
            this._logger.log(
              ct.Error,
              `HttpConnection.onclose(${e}) threw error '${t}'.`
            );
          }
        }
      } else
        this._logger.log(
          ct.Debug,
          `Call to HttpConnection.stopConnection(${e}) was ignored because the connection is already in the disconnected state.`
        );
    }
    _resolveUrl(e) {
      if (
        0 === e.lastIndexOf('https://', 0) ||
        0 === e.lastIndexOf('http://', 0)
      )
        return e;
      if (!gt.isBrowser) throw new Error(`Cannot resolve '${e}'.`);
      const t = window.document.createElement('a');
      return (
        (t.href = e),
        this._logger.log(ct.Information, `Normalizing '${e}' to '${t.href}'.`),
        t.href
      );
    }
    _resolveNegotiateUrl(e) {
      const t = e.indexOf('?');
      let n = e.substring(0, -1 === t ? e.length : t);
      return (
        '/' !== n[n.length - 1] && (n += '/'),
        (n += 'negotiate'),
        (n += -1 === t ? '' : e.substring(t)),
        -1 === n.indexOf('negotiateVersion') &&
          ((n += -1 === t ? '?' : '&'),
          (n += 'negotiateVersion=' + this._negotiateVersion)),
        n
      );
    }
  }
  class $t {
    constructor(e) {
      (this._transport = e),
        (this._buffer = []),
        (this._executing = !0),
        (this._sendBufferedData = new Lt()),
        (this._transportResult = new Lt()),
        (this._sendLoopPromise = this._sendLoop());
    }
    send(e) {
      return (
        this._bufferData(e),
        this._transportResult || (this._transportResult = new Lt()),
        this._transportResult.promise
      );
    }
    stop() {
      return (
        (this._executing = !1),
        this._sendBufferedData.resolve(),
        this._sendLoopPromise
      );
    }
    _bufferData(e) {
      if (this._buffer.length && typeof this._buffer[0] != typeof e)
        throw new Error(
          `Expected data to be of type ${typeof this
            ._buffer} but was of type ${typeof e}`
        );
      this._buffer.push(e), this._sendBufferedData.resolve();
    }
    async _sendLoop() {
      for (;;) {
        if ((await this._sendBufferedData.promise, !this._executing)) {
          this._transportResult &&
            this._transportResult.reject('Connection stopped.');
          break;
        }
        this._sendBufferedData = new Lt();
        const e = this._transportResult;
        this._transportResult = void 0;
        const t =
          'string' == typeof this._buffer[0]
            ? this._buffer.join('')
            : $t._concatBuffers(this._buffer);
        this._buffer.length = 0;
        try {
          await this._transport.send(t), e.resolve();
        } catch (t) {
          e.reject(t);
        }
      }
    }
    static _concatBuffers(e) {
      const t = e.map((e) => e.byteLength).reduce((e, t) => e + t),
        n = new Uint8Array(t);
      let r = 0;
      for (const t of e) n.set(new Uint8Array(t), r), (r += t.byteLength);
      return n.buffer;
    }
  }
  class Lt {
    constructor() {
      this.promise = new Promise(
        (e, t) => ([this._resolver, this._rejecter] = [e, t])
      );
    }
    resolve() {
      this._resolver();
    }
    reject(e) {
      this._rejecter(e);
    }
  }
  class Bt {
    static write(e) {
      return `${e}${Bt.RecordSeparator}`;
    }
    static parse(e) {
      if (e[e.length - 1] !== Bt.RecordSeparator)
        throw new Error('Message is incomplete.');
      const t = e.split(Bt.RecordSeparator);
      return t.pop(), t;
    }
  }
  (Bt.RecordSeparatorCode = 30),
    (Bt.RecordSeparator = String.fromCharCode(Bt.RecordSeparatorCode));
  class Mt {
    writeHandshakeRequest(e) {
      return Bt.write(JSON.stringify(e));
    }
    parseHandshakeResponse(e) {
      let t, n;
      if (yt(e)) {
        const r = new Uint8Array(e),
          o = r.indexOf(Bt.RecordSeparatorCode);
        if (-1 === o) throw new Error('Message is incomplete.');
        const i = o + 1;
        (t = String.fromCharCode.apply(
          null,
          Array.prototype.slice.call(r.slice(0, i))
        )),
          (n = r.byteLength > i ? r.slice(i).buffer : null);
      } else {
        const r = e,
          o = r.indexOf(Bt.RecordSeparator);
        if (-1 === o) throw new Error('Message is incomplete.');
        const i = o + 1;
        (t = r.substring(0, i)), (n = r.length > i ? r.substring(i) : null);
      }
      const r = Bt.parse(t),
        o = JSON.parse(r[0]);
      if (o.type)
        throw new Error('Expected a handshake response from the server.');
      return [n, o];
    }
  }
  !(function (e) {
    (e[(e.Invocation = 1)] = 'Invocation'),
      (e[(e.StreamItem = 2)] = 'StreamItem'),
      (e[(e.Completion = 3)] = 'Completion'),
      (e[(e.StreamInvocation = 4)] = 'StreamInvocation'),
      (e[(e.CancelInvocation = 5)] = 'CancelInvocation'),
      (e[(e.Ping = 6)] = 'Ping'),
      (e[(e.Close = 7)] = 'Close');
  })(ut || (ut = {}));
  class Ot {
    constructor() {
      this.observers = [];
    }
    next(e) {
      for (const t of this.observers) t.next(e);
    }
    error(e) {
      for (const t of this.observers) t.error && t.error(e);
    }
    complete() {
      for (const e of this.observers) e.complete && e.complete();
    }
    subscribe(e) {
      return this.observers.push(e), new vt(this, e);
    }
  }
  !(function (e) {
    (e.Disconnected = 'Disconnected'),
      (e.Connecting = 'Connecting'),
      (e.Connected = 'Connected'),
      (e.Disconnecting = 'Disconnecting'),
      (e.Reconnecting = 'Reconnecting');
  })(dt || (dt = {}));
  class Ft {
    constructor(e, t, n, r) {
      (this._nextKeepAlive = 0),
        (this._freezeEventListener = () => {
          this._logger.log(
            ct.Warning,
            'The page is being frozen, this will likely lead to the connection being closed and messages being lost. For more information see the docs at https://docs.microsoft.com/aspnet/core/signalr/javascript-client#bsleep'
          );
        }),
        ft.isRequired(e, 'connection'),
        ft.isRequired(t, 'logger'),
        ft.isRequired(n, 'protocol'),
        (this.serverTimeoutInMilliseconds = 3e4),
        (this.keepAliveIntervalInMilliseconds = 15e3),
        (this._logger = t),
        (this._protocol = n),
        (this.connection = e),
        (this._reconnectPolicy = r),
        (this._handshakeProtocol = new Mt()),
        (this.connection.onreceive = (e) => this._processIncomingData(e)),
        (this.connection.onclose = (e) => this._connectionClosed(e)),
        (this._callbacks = {}),
        (this._methods = {}),
        (this._closedCallbacks = []),
        (this._reconnectingCallbacks = []),
        (this._reconnectedCallbacks = []),
        (this._invocationId = 0),
        (this._receivedHandshakeResponse = !1),
        (this._connectionState = dt.Disconnected),
        (this._connectionStarted = !1),
        (this._cachedPingMessage = this._protocol.writeMessage({
          type: ut.Ping,
        }));
    }
    static create(e, t, n, r) {
      return new Ft(e, t, n, r);
    }
    get state() {
      return this._connectionState;
    }
    get connectionId() {
      return (this.connection && this.connection.connectionId) || null;
    }
    get baseUrl() {
      return this.connection.baseUrl || '';
    }
    set baseUrl(e) {
      if (
        this._connectionState !== dt.Disconnected &&
        this._connectionState !== dt.Reconnecting
      )
        throw new Error(
          'The HubConnection must be in the Disconnected or Reconnecting state to change the url.'
        );
      if (!e) throw new Error('The HubConnection url must be a valid url.');
      this.connection.baseUrl = e;
    }
    start() {
      return (
        (this._startPromise = this._startWithStateTransitions()),
        this._startPromise
      );
    }
    async _startWithStateTransitions() {
      if (this._connectionState !== dt.Disconnected)
        return Promise.reject(
          new Error(
            "Cannot start a HubConnection that is not in the 'Disconnected' state."
          )
        );
      (this._connectionState = dt.Connecting),
        this._logger.log(ct.Debug, 'Starting HubConnection.');
      try {
        await this._startInternal(),
          gt.isBrowser &&
            window.document.addEventListener(
              'freeze',
              this._freezeEventListener
            ),
          (this._connectionState = dt.Connected),
          (this._connectionStarted = !0),
          this._logger.log(ct.Debug, 'HubConnection connected successfully.');
      } catch (e) {
        return (
          (this._connectionState = dt.Disconnected),
          this._logger.log(
            ct.Debug,
            `HubConnection failed to start successfully because of error '${e}'.`
          ),
          Promise.reject(e)
        );
      }
    }
    async _startInternal() {
      (this._stopDuringStartError = void 0),
        (this._receivedHandshakeResponse = !1);
      const e = new Promise((e, t) => {
        (this._handshakeResolver = e), (this._handshakeRejecter = t);
      });
      await this.connection.start(this._protocol.transferFormat);
      try {
        const t = {
          protocol: this._protocol.name,
          version: this._protocol.version,
        };
        if (
          (this._logger.log(ct.Debug, 'Sending handshake request.'),
          await this._sendMessage(
            this._handshakeProtocol.writeHandshakeRequest(t)
          ),
          this._logger.log(
            ct.Information,
            `Using HubProtocol '${this._protocol.name}'.`
          ),
          this._cleanupTimeout(),
          this._resetTimeoutPeriod(),
          this._resetKeepAliveInterval(),
          await e,
          this._stopDuringStartError)
        )
          throw this._stopDuringStartError;
        this.connection.features.inherentKeepAlive ||
          (await this._sendMessage(this._cachedPingMessage));
      } catch (e) {
        throw (
          (this._logger.log(
            ct.Debug,
            `Hub handshake failed with error '${e}' during start(). Stopping HubConnection.`
          ),
          this._cleanupTimeout(),
          this._cleanupPingTimer(),
          await this.connection.stop(e),
          e)
        );
      }
    }
    async stop() {
      const e = this._startPromise;
      (this._stopPromise = this._stopInternal()), await this._stopPromise;
      try {
        await e;
      } catch (e) {}
    }
    _stopInternal(e) {
      return this._connectionState === dt.Disconnected
        ? (this._logger.log(
            ct.Debug,
            `Call to HubConnection.stop(${e}) ignored because it is already in the disconnected state.`
          ),
          Promise.resolve())
        : this._connectionState === dt.Disconnecting
        ? (this._logger.log(
            ct.Debug,
            `Call to HttpConnection.stop(${e}) ignored because the connection is already in the disconnecting state.`
          ),
          this._stopPromise)
        : ((this._connectionState = dt.Disconnecting),
          this._logger.log(ct.Debug, 'Stopping HubConnection.'),
          this._reconnectDelayHandle
            ? (this._logger.log(
                ct.Debug,
                'Connection stopped during reconnect delay. Done reconnecting.'
              ),
              clearTimeout(this._reconnectDelayHandle),
              (this._reconnectDelayHandle = void 0),
              this._completeClose(),
              Promise.resolve())
            : (this._cleanupTimeout(),
              this._cleanupPingTimer(),
              (this._stopDuringStartError =
                e ||
                new nt(
                  'The connection was stopped before the hub handshake could complete.'
                )),
              this.connection.stop(e)));
    }
    stream(e, ...t) {
      const [n, r] = this._replaceStreamingParams(t),
        o = this._createStreamInvocation(e, t, r);
      let i;
      const s = new Ot();
      return (
        (s.cancelCallback = () => {
          const e = this._createCancelInvocation(o.invocationId);
          return (
            delete this._callbacks[o.invocationId],
            i.then(() => this._sendWithProtocol(e))
          );
        }),
        (this._callbacks[o.invocationId] = (e, t) => {
          t
            ? s.error(t)
            : e &&
              (e.type === ut.Completion
                ? e.error
                  ? s.error(new Error(e.error))
                  : s.complete()
                : s.next(e.item));
        }),
        (i = this._sendWithProtocol(o).catch((e) => {
          s.error(e), delete this._callbacks[o.invocationId];
        })),
        this._launchStreams(n, i),
        s
      );
    }
    _sendMessage(e) {
      return this._resetKeepAliveInterval(), this.connection.send(e);
    }
    _sendWithProtocol(e) {
      return this._sendMessage(this._protocol.writeMessage(e));
    }
    send(e, ...t) {
      const [n, r] = this._replaceStreamingParams(t),
        o = this._sendWithProtocol(this._createInvocation(e, t, !0, r));
      return this._launchStreams(n, o), o;
    }
    invoke(e, ...t) {
      const [n, r] = this._replaceStreamingParams(t),
        o = this._createInvocation(e, t, !1, r);
      return new Promise((e, t) => {
        this._callbacks[o.invocationId] = (n, r) => {
          r
            ? t(r)
            : n &&
              (n.type === ut.Completion
                ? n.error
                  ? t(new Error(n.error))
                  : e(n.result)
                : t(new Error(`Unexpected message type: ${n.type}`)));
        };
        const r = this._sendWithProtocol(o).catch((e) => {
          t(e), delete this._callbacks[o.invocationId];
        });
        this._launchStreams(n, r);
      });
    }
    on(e, t) {
      e &&
        t &&
        ((e = e.toLowerCase()),
        this._methods[e] || (this._methods[e] = []),
        -1 === this._methods[e].indexOf(t) && this._methods[e].push(t));
    }
    off(e, t) {
      if (!e) return;
      e = e.toLowerCase();
      const n = this._methods[e];
      if (n)
        if (t) {
          const r = n.indexOf(t);
          -1 !== r &&
            (n.splice(r, 1), 0 === n.length && delete this._methods[e]);
        } else delete this._methods[e];
    }
    onclose(e) {
      e && this._closedCallbacks.push(e);
    }
    onreconnecting(e) {
      e && this._reconnectingCallbacks.push(e);
    }
    onreconnected(e) {
      e && this._reconnectedCallbacks.push(e);
    }
    _processIncomingData(e) {
      if (
        (this._cleanupTimeout(),
        this._receivedHandshakeResponse ||
          ((e = this._processHandshakeResponse(e)),
          (this._receivedHandshakeResponse = !0)),
        e)
      ) {
        const t = this._protocol.parseMessages(e, this._logger);
        for (const e of t)
          switch (e.type) {
            case ut.Invocation:
              this._invokeClientMethod(e);
              break;
            case ut.StreamItem:
            case ut.Completion: {
              const t = this._callbacks[e.invocationId];
              if (t) {
                e.type === ut.Completion &&
                  delete this._callbacks[e.invocationId];
                try {
                  t(e);
                } catch (e) {
                  this._logger.log(
                    ct.Error,
                    `Stream callback threw error: ${It(e)}`
                  );
                }
              }
              break;
            }
            case ut.Ping:
              break;
            case ut.Close: {
              this._logger.log(
                ct.Information,
                'Close message received from server.'
              );
              const t = e.error
                ? new Error('Server returned an error on close: ' + e.error)
                : void 0;
              !0 === e.allowReconnect
                ? this.connection.stop(t)
                : (this._stopPromise = this._stopInternal(t));
              break;
            }
            default:
              this._logger.log(ct.Warning, `Invalid message type: ${e.type}.`);
          }
      }
      this._resetTimeoutPeriod();
    }
    _processHandshakeResponse(e) {
      let t, n;
      try {
        [n, t] = this._handshakeProtocol.parseHandshakeResponse(e);
      } catch (e) {
        const t = 'Error parsing handshake response: ' + e;
        this._logger.log(ct.Error, t);
        const n = new Error(t);
        throw (this._handshakeRejecter(n), n);
      }
      if (t.error) {
        const e = 'Server returned handshake error: ' + t.error;
        this._logger.log(ct.Error, e);
        const n = new Error(e);
        throw (this._handshakeRejecter(n), n);
      }
      return (
        this._logger.log(ct.Debug, 'Server handshake complete.'),
        this._handshakeResolver(),
        n
      );
    }
    _resetKeepAliveInterval() {
      this.connection.features.inherentKeepAlive ||
        ((this._nextKeepAlive =
          new Date().getTime() + this.keepAliveIntervalInMilliseconds),
        this._cleanupPingTimer());
    }
    _resetTimeoutPeriod() {
      if (
        !(
          (this.connection.features &&
            this.connection.features.inherentKeepAlive) ||
          ((this._timeoutHandle = setTimeout(
            () => this.serverTimeout(),
            this.serverTimeoutInMilliseconds
          )),
          void 0 !== this._pingServerHandle)
        )
      ) {
        let e = this._nextKeepAlive - new Date().getTime();
        e < 0 && (e = 0),
          (this._pingServerHandle = setTimeout(async () => {
            if (this._connectionState === dt.Connected)
              try {
                await this._sendMessage(this._cachedPingMessage);
              } catch {
                this._cleanupPingTimer();
              }
          }, e));
      }
    }
    serverTimeout() {
      this.connection.stop(
        new Error(
          'Server timeout elapsed without receiving a message from the server.'
        )
      );
    }
    async _invokeClientMethod(e) {
      const t = e.target.toLowerCase(),
        n = this._methods[t];
      if (!n)
        return (
          this._logger.log(
            ct.Warning,
            `No client method with the name '${t}' found.`
          ),
          void (
            e.invocationId &&
            (this._logger.log(
              ct.Warning,
              `No result given for '${t}' method and invocation ID '${e.invocationId}'.`
            ),
            await this._sendWithProtocol(
              this._createCompletionMessage(
                e.invocationId,
                "Client didn't provide a result.",
                null
              )
            ))
          )
        );
      const r = n.slice(),
        o = !!e.invocationId;
      let i, s, a;
      for (const n of r)
        try {
          const r = i;
          (i = await n.apply(this, e.arguments)),
            o &&
              i &&
              r &&
              (this._logger.log(
                ct.Error,
                `Multiple results provided for '${t}'. Sending error to server.`
              ),
              (a = this._createCompletionMessage(
                e.invocationId,
                'Client provided multiple results.',
                null
              ))),
            (s = void 0);
        } catch (e) {
          (s = e),
            this._logger.log(
              ct.Error,
              `A callback for the method '${t}' threw error '${e}'.`
            );
        }
      a
        ? await this._sendWithProtocol(a)
        : o
        ? (s
            ? (a = this._createCompletionMessage(e.invocationId, `${s}`, null))
            : void 0 !== i
            ? (a = this._createCompletionMessage(e.invocationId, null, i))
            : (this._logger.log(
                ct.Warning,
                `No result given for '${t}' method and invocation ID '${e.invocationId}'.`
              ),
              (a = this._createCompletionMessage(
                e.invocationId,
                "Client didn't provide a result.",
                null
              ))),
          await this._sendWithProtocol(a))
        : i &&
          this._logger.log(
            ct.Error,
            `Result given for '${t}' method but server is not expecting a result.`
          );
    }
    _connectionClosed(e) {
      this._logger.log(
        ct.Debug,
        `HubConnection.connectionClosed(${e}) called while in state ${this._connectionState}.`
      ),
        (this._stopDuringStartError =
          this._stopDuringStartError ||
          e ||
          new nt(
            'The underlying connection was closed before the hub handshake could complete.'
          )),
        this._handshakeResolver && this._handshakeResolver(),
        this._cancelCallbacksWithError(
          e ||
            new Error(
              'Invocation canceled due to the underlying connection being closed.'
            )
        ),
        this._cleanupTimeout(),
        this._cleanupPingTimer(),
        this._connectionState === dt.Disconnecting
          ? this._completeClose(e)
          : this._connectionState === dt.Connected && this._reconnectPolicy
          ? this._reconnect(e)
          : this._connectionState === dt.Connected && this._completeClose(e);
    }
    _completeClose(e) {
      if (this._connectionStarted) {
        (this._connectionState = dt.Disconnected),
          (this._connectionStarted = !1),
          gt.isBrowser &&
            window.document.removeEventListener(
              'freeze',
              this._freezeEventListener
            );
        try {
          this._closedCallbacks.forEach((t) => t.apply(this, [e]));
        } catch (t) {
          this._logger.log(
            ct.Error,
            `An onclose callback called with error '${e}' threw error '${t}'.`
          );
        }
      }
    }
    async _reconnect(e) {
      const t = Date.now();
      let n = 0,
        r =
          void 0 !== e
            ? e
            : new Error('Attempting to reconnect due to a unknown error.'),
        o = this._getNextRetryDelay(n++, 0, r);
      if (null === o)
        return (
          this._logger.log(
            ct.Debug,
            'Connection not reconnecting because the IRetryPolicy returned null on the first reconnect attempt.'
          ),
          void this._completeClose(e)
        );
      if (
        ((this._connectionState = dt.Reconnecting),
        e
          ? this._logger.log(
              ct.Information,
              `Connection reconnecting because of error '${e}'.`
            )
          : this._logger.log(ct.Information, 'Connection reconnecting.'),
        0 !== this._reconnectingCallbacks.length)
      ) {
        try {
          this._reconnectingCallbacks.forEach((t) => t.apply(this, [e]));
        } catch (t) {
          this._logger.log(
            ct.Error,
            `An onreconnecting callback called with error '${e}' threw error '${t}'.`
          );
        }
        if (this._connectionState !== dt.Reconnecting)
          return void this._logger.log(
            ct.Debug,
            'Connection left the reconnecting state in onreconnecting callback. Done reconnecting.'
          );
      }
      for (; null !== o; ) {
        if (
          (this._logger.log(
            ct.Information,
            `Reconnect attempt number ${n} will start in ${o} ms.`
          ),
          await new Promise((e) => {
            this._reconnectDelayHandle = setTimeout(e, o);
          }),
          (this._reconnectDelayHandle = void 0),
          this._connectionState !== dt.Reconnecting)
        )
          return void this._logger.log(
            ct.Debug,
            'Connection left the reconnecting state during reconnect delay. Done reconnecting.'
          );
        try {
          if (
            (await this._startInternal(),
            (this._connectionState = dt.Connected),
            this._logger.log(
              ct.Information,
              'HubConnection reconnected successfully.'
            ),
            0 !== this._reconnectedCallbacks.length)
          )
            try {
              this._reconnectedCallbacks.forEach((e) =>
                e.apply(this, [this.connection.connectionId])
              );
            } catch (e) {
              this._logger.log(
                ct.Error,
                `An onreconnected callback called with connectionId '${this.connection.connectionId}; threw error '${e}'.`
              );
            }
          return;
        } catch (e) {
          if (
            (this._logger.log(
              ct.Information,
              `Reconnect attempt failed because of error '${e}'.`
            ),
            this._connectionState !== dt.Reconnecting)
          )
            return (
              this._logger.log(
                ct.Debug,
                `Connection moved to the '${this._connectionState}' from the reconnecting state during reconnect attempt. Done reconnecting.`
              ),
              void (
                this._connectionState === dt.Disconnecting &&
                this._completeClose()
              )
            );
          (r = e instanceof Error ? e : new Error(e.toString())),
            (o = this._getNextRetryDelay(n++, Date.now() - t, r));
        }
      }
      this._logger.log(
        ct.Information,
        `Reconnect retries have been exhausted after ${
          Date.now() - t
        } ms and ${n} failed attempts. Connection disconnecting.`
      ),
        this._completeClose();
    }
    _getNextRetryDelay(e, t, n) {
      try {
        return this._reconnectPolicy.nextRetryDelayInMilliseconds({
          elapsedMilliseconds: t,
          previousRetryCount: e,
          retryReason: n,
        });
      } catch (n) {
        return (
          this._logger.log(
            ct.Error,
            `IRetryPolicy.nextRetryDelayInMilliseconds(${e}, ${t}) threw error '${n}'.`
          ),
          null
        );
      }
    }
    _cancelCallbacksWithError(e) {
      const t = this._callbacks;
      (this._callbacks = {}),
        Object.keys(t).forEach((n) => {
          const r = t[n];
          try {
            r(null, e);
          } catch (t) {
            this._logger.log(
              ct.Error,
              `Stream 'error' callback called with '${e}' threw error: ${It(t)}`
            );
          }
        });
    }
    _cleanupPingTimer() {
      this._pingServerHandle &&
        (clearTimeout(this._pingServerHandle),
        (this._pingServerHandle = void 0));
    }
    _cleanupTimeout() {
      this._timeoutHandle && clearTimeout(this._timeoutHandle);
    }
    _createInvocation(e, t, n, r) {
      if (n)
        return 0 !== r.length
          ? { arguments: t, streamIds: r, target: e, type: ut.Invocation }
          : { arguments: t, target: e, type: ut.Invocation };
      {
        const n = this._invocationId;
        return (
          this._invocationId++,
          0 !== r.length
            ? {
                arguments: t,
                invocationId: n.toString(),
                streamIds: r,
                target: e,
                type: ut.Invocation,
              }
            : {
                arguments: t,
                invocationId: n.toString(),
                target: e,
                type: ut.Invocation,
              }
        );
      }
    }
    _launchStreams(e, t) {
      if (0 !== e.length) {
        t || (t = Promise.resolve());
        for (const n in e)
          e[n].subscribe({
            complete: () => {
              t = t.then(() =>
                this._sendWithProtocol(this._createCompletionMessage(n))
              );
            },
            error: (e) => {
              let r;
              (r =
                e instanceof Error
                  ? e.message
                  : e && e.toString
                  ? e.toString()
                  : 'Unknown error'),
                (t = t.then(() =>
                  this._sendWithProtocol(this._createCompletionMessage(n, r))
                ));
            },
            next: (e) => {
              t = t.then(() =>
                this._sendWithProtocol(this._createStreamItemMessage(n, e))
              );
            },
          });
      }
    }
    _replaceStreamingParams(e) {
      const t = [],
        n = [];
      for (let r = 0; r < e.length; r++) {
        const o = e[r];
        if (this._isObservable(o)) {
          const i = this._invocationId;
          this._invocationId++,
            (t[i] = o),
            n.push(i.toString()),
            e.splice(r, 1);
        }
      }
      return [t, n];
    }
    _isObservable(e) {
      return e && e.subscribe && 'function' == typeof e.subscribe;
    }
    _createStreamInvocation(e, t, n) {
      const r = this._invocationId;
      return (
        this._invocationId++,
        0 !== n.length
          ? {
              arguments: t,
              invocationId: r.toString(),
              streamIds: n,
              target: e,
              type: ut.StreamInvocation,
            }
          : {
              arguments: t,
              invocationId: r.toString(),
              target: e,
              type: ut.StreamInvocation,
            }
      );
    }
    _createCancelInvocation(e) {
      return { invocationId: e, type: ut.CancelInvocation };
    }
    _createStreamItemMessage(e, t) {
      return { invocationId: e, item: t, type: ut.StreamItem };
    }
    _createCompletionMessage(e, t, n) {
      return t
        ? { error: t, invocationId: e, type: ut.Completion }
        : { invocationId: e, result: n, type: ut.Completion };
    }
  }
  class jt {
    constructor() {
      (this.name = 'json'), (this.version = 1), (this.transferFormat = ht.Text);
    }
    parseMessages(e, t) {
      if ('string' != typeof e)
        throw new Error(
          'Invalid input for JSON hub protocol. Expected a string.'
        );
      if (!e) return [];
      null === t && (t = pt.instance);
      const n = Bt.parse(e),
        r = [];
      for (const e of n) {
        const n = JSON.parse(e);
        if ('number' != typeof n.type) throw new Error('Invalid payload.');
        switch (n.type) {
          case ut.Invocation:
            this._isInvocationMessage(n);
            break;
          case ut.StreamItem:
            this._isStreamItemMessage(n);
            break;
          case ut.Completion:
            this._isCompletionMessage(n);
            break;
          case ut.Ping:
          case ut.Close:
            break;
          default:
            t.log(
              ct.Information,
              "Unknown message type '" + n.type + "' ignored."
            );
            continue;
        }
        r.push(n);
      }
      return r;
    }
    writeMessage(e) {
      return Bt.write(JSON.stringify(e));
    }
    _isInvocationMessage(e) {
      this._assertNotEmptyString(
        e.target,
        'Invalid payload for Invocation message.'
      ),
        void 0 !== e.invocationId &&
          this._assertNotEmptyString(
            e.invocationId,
            'Invalid payload for Invocation message.'
          );
    }
    _isStreamItemMessage(e) {
      if (
        (this._assertNotEmptyString(
          e.invocationId,
          'Invalid payload for StreamItem message.'
        ),
        void 0 === e.item)
      )
        throw new Error('Invalid payload for StreamItem message.');
    }
    _isCompletionMessage(e) {
      if (e.result && e.error)
        throw new Error('Invalid payload for Completion message.');
      !e.result &&
        e.error &&
        this._assertNotEmptyString(
          e.error,
          'Invalid payload for Completion message.'
        ),
        this._assertNotEmptyString(
          e.invocationId,
          'Invalid payload for Completion message.'
        );
    }
    _assertNotEmptyString(e, t) {
      if ('string' != typeof e || '' === e) throw new Error(t);
    }
  }
  const Ht = {
    trace: ct.Trace,
    debug: ct.Debug,
    info: ct.Information,
    information: ct.Information,
    warn: ct.Warning,
    warning: ct.Warning,
    error: ct.Error,
    critical: ct.Critical,
    none: ct.None,
  };
  class Wt {
    configureLogging(e) {
      if ((ft.isRequired(e, 'logging'), void 0 !== e.log)) this.logger = e;
      else if ('string' == typeof e) {
        const t = (function (e) {
          const t = Ht[e.toLowerCase()];
          if (void 0 !== t) return t;
          throw new Error(`Unknown log level: ${e}`);
        })(e);
        this.logger = new bt(t);
      } else this.logger = new bt(e);
      return this;
    }
    withUrl(e, t) {
      return (
        ft.isRequired(e, 'url'),
        ft.isNotEmpty(e, 'url'),
        (this.url = e),
        (this.httpConnectionOptions =
          'object' == typeof t
            ? { ...this.httpConnectionOptions, ...t }
            : { ...this.httpConnectionOptions, transport: t }),
        this
      );
    }
    withHubProtocol(e) {
      return ft.isRequired(e, 'protocol'), (this.protocol = e), this;
    }
    withAutomaticReconnect(e) {
      if (this.reconnectPolicy)
        throw new Error('A reconnectPolicy has already been set.');
      return (
        e
          ? Array.isArray(e)
            ? (this.reconnectPolicy = new Xe(e))
            : (this.reconnectPolicy = e)
          : (this.reconnectPolicy = new Xe()),
        this
      );
    }
    build() {
      const e = this.httpConnectionOptions || {};
      if ((void 0 === e.logger && (e.logger = this.logger), !this.url))
        throw new Error(
          "The 'HubConnectionBuilder.withUrl' method must be called before building the connection."
        );
      const t = new Nt(this.url, e);
      return Ft.create(
        t,
        this.logger || pt.instance,
        this.protocol || new jt(),
        this.reconnectPolicy
      );
    }
  }
  var zt = 4294967295;
  function Jt(e, t, n) {
    var r = Math.floor(n / 4294967296),
      o = n;
    e.setUint32(t, r), e.setUint32(t + 4, o);
  }
  function qt(e, t) {
    return 4294967296 * e.getInt32(t) + e.getUint32(t + 4);
  }
  var Vt =
    ('undefined' == typeof process || 'never' !== process.env.TEXT_ENCODING) &&
    'undefined' != typeof TextEncoder &&
    'undefined' != typeof TextDecoder;
  function Kt(e) {
    for (var t = e.length, n = 0, r = 0; r < t; ) {
      var o = e.charCodeAt(r++);
      if (0 != (4294967168 & o))
        if (0 == (4294965248 & o)) n += 2;
        else {
          if (o >= 55296 && o <= 56319 && r < t) {
            var i = e.charCodeAt(r);
            56320 == (64512 & i) &&
              (++r, (o = ((1023 & o) << 10) + (1023 & i) + 65536));
          }
          n += 0 == (4294901760 & o) ? 3 : 4;
        }
      else n++;
    }
    return n;
  }
  var Xt = Vt ? new TextEncoder() : void 0,
    Yt = Vt
      ? 'undefined' != typeof process && 'force' !== process.env.TEXT_ENCODING
        ? 200
        : 0
      : zt,
    Gt = (null == Xt ? void 0 : Xt.encodeInto)
      ? function (e, t, n) {
          Xt.encodeInto(e, t.subarray(n));
        }
      : function (e, t, n) {
          t.set(Xt.encode(e), n);
        };
  function Qt(e, t, n) {
    for (var r = t, o = r + n, i = [], s = ''; r < o; ) {
      var a = e[r++];
      if (0 == (128 & a)) i.push(a);
      else if (192 == (224 & a)) {
        var c = 63 & e[r++];
        i.push(((31 & a) << 6) | c);
      } else if (224 == (240 & a)) {
        c = 63 & e[r++];
        var l = 63 & e[r++];
        i.push(((31 & a) << 12) | (c << 6) | l);
      } else if (240 == (248 & a)) {
        var h =
          ((7 & a) << 18) |
          ((c = 63 & e[r++]) << 12) |
          ((l = 63 & e[r++]) << 6) |
          (63 & e[r++]);
        h > 65535 &&
          ((h -= 65536),
          i.push(((h >>> 10) & 1023) | 55296),
          (h = 56320 | (1023 & h))),
          i.push(h);
      } else i.push(a);
      i.length >= 4096 &&
        ((s += String.fromCharCode.apply(String, i)), (i.length = 0));
    }
    return i.length > 0 && (s += String.fromCharCode.apply(String, i)), s;
  }
  var Zt,
    en = Vt ? new TextDecoder() : null,
    tn = Vt
      ? 'undefined' != typeof process && 'force' !== process.env.TEXT_DECODER
        ? 200
        : 0
      : zt,
    nn = function (e, t) {
      (this.type = e), (this.data = t);
    },
    rn =
      ((Zt = function (e, t) {
        return (
          (Zt =
            Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array &&
              function (e, t) {
                e.__proto__ = t;
              }) ||
            function (e, t) {
              for (var n in t)
                Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
            }),
          Zt(e, t)
        );
      }),
      function (e, t) {
        if ('function' != typeof t && null !== t)
          throw new TypeError(
            'Class extends value ' + String(t) + ' is not a constructor or null'
          );
        function n() {
          this.constructor = e;
        }
        Zt(e, t),
          (e.prototype =
            null === t
              ? Object.create(t)
              : ((n.prototype = t.prototype), new n()));
      }),
    on = (function (e) {
      function t(n) {
        var r = e.call(this, n) || this,
          o = Object.create(t.prototype);
        return (
          Object.setPrototypeOf(r, o),
          Object.defineProperty(r, 'name', {
            configurable: !0,
            enumerable: !1,
            value: t.name,
          }),
          r
        );
      }
      return rn(t, e), t;
    })(Error),
    sn = {
      type: -1,
      encode: function (e) {
        var t, n, r, o;
        return e instanceof Date
          ? (function (e) {
              var t,
                n = e.sec,
                r = e.nsec;
              if (n >= 0 && r >= 0 && n <= 17179869183) {
                if (0 === r && n <= 4294967295) {
                  var o = new Uint8Array(4);
                  return (t = new DataView(o.buffer)).setUint32(0, n), o;
                }
                var i = n / 4294967296,
                  s = 4294967295 & n;
                return (
                  (o = new Uint8Array(8)),
                  (t = new DataView(o.buffer)).setUint32(0, (r << 2) | (3 & i)),
                  t.setUint32(4, s),
                  o
                );
              }
              return (
                (o = new Uint8Array(12)),
                (t = new DataView(o.buffer)).setUint32(0, r),
                Jt(t, 4, n),
                o
              );
            })(
              ((r =
                1e6 * ((t = e.getTime()) - 1e3 * (n = Math.floor(t / 1e3)))),
              { sec: n + (o = Math.floor(r / 1e9)), nsec: r - 1e9 * o })
            )
          : null;
      },
      decode: function (e) {
        var t = (function (e) {
          var t = new DataView(e.buffer, e.byteOffset, e.byteLength);
          switch (e.byteLength) {
            case 4:
              return { sec: t.getUint32(0), nsec: 0 };
            case 8:
              var n = t.getUint32(0);
              return {
                sec: 4294967296 * (3 & n) + t.getUint32(4),
                nsec: n >>> 2,
              };
            case 12:
              return { sec: qt(t, 4), nsec: t.getUint32(0) };
            default:
              throw new on(
                'Unrecognized data size for timestamp (expected 4, 8, or 12): ' +
                  e.length
              );
          }
        })(e);
        return new Date(1e3 * t.sec + t.nsec / 1e6);
      },
    },
    an = (function () {
      function e() {
        (this.builtInEncoders = []),
          (this.builtInDecoders = []),
          (this.encoders = []),
          (this.decoders = []),
          this.register(sn);
      }
      return (
        (e.prototype.register = function (e) {
          var t = e.type,
            n = e.encode,
            r = e.decode;
          if (t >= 0) (this.encoders[t] = n), (this.decoders[t] = r);
          else {
            var o = 1 + t;
            (this.builtInEncoders[o] = n), (this.builtInDecoders[o] = r);
          }
        }),
        (e.prototype.tryToEncode = function (e, t) {
          for (var n = 0; n < this.builtInEncoders.length; n++)
            if (null != (r = this.builtInEncoders[n]) && null != (o = r(e, t)))
              return new nn(-1 - n, o);
          for (n = 0; n < this.encoders.length; n++) {
            var r, o;
            if (null != (r = this.encoders[n]) && null != (o = r(e, t)))
              return new nn(n, o);
          }
          return e instanceof nn ? e : null;
        }),
        (e.prototype.decode = function (e, t, n) {
          var r = t < 0 ? this.builtInDecoders[-1 - t] : this.decoders[t];
          return r ? r(e, t, n) : new nn(t, e);
        }),
        (e.defaultCodec = new e()),
        e
      );
    })();
  function cn(e) {
    return e instanceof Uint8Array
      ? e
      : ArrayBuffer.isView(e)
      ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength)
      : e instanceof ArrayBuffer
      ? new Uint8Array(e)
      : Uint8Array.from(e);
  }
  var ln = (function () {
    function e(e, t, n, r, o, i, s, a) {
      void 0 === e && (e = an.defaultCodec),
        void 0 === t && (t = void 0),
        void 0 === n && (n = 100),
        void 0 === r && (r = 2048),
        void 0 === o && (o = !1),
        void 0 === i && (i = !1),
        void 0 === s && (s = !1),
        void 0 === a && (a = !1),
        (this.extensionCodec = e),
        (this.context = t),
        (this.maxDepth = n),
        (this.initialBufferSize = r),
        (this.sortKeys = o),
        (this.forceFloat32 = i),
        (this.ignoreUndefined = s),
        (this.forceIntegerToFloat = a),
        (this.pos = 0),
        (this.view = new DataView(new ArrayBuffer(this.initialBufferSize))),
        (this.bytes = new Uint8Array(this.view.buffer));
    }
    return (
      (e.prototype.getUint8Array = function () {
        return this.bytes.subarray(0, this.pos);
      }),
      (e.prototype.reinitializeState = function () {
        this.pos = 0;
      }),
      (e.prototype.encode = function (e) {
        return (
          this.reinitializeState(), this.doEncode(e, 1), this.getUint8Array()
        );
      }),
      (e.prototype.doEncode = function (e, t) {
        if (t > this.maxDepth)
          throw new Error('Too deep objects in depth ' + t);
        null == e
          ? this.encodeNil()
          : 'boolean' == typeof e
          ? this.encodeBoolean(e)
          : 'number' == typeof e
          ? this.encodeNumber(e)
          : 'string' == typeof e
          ? this.encodeString(e)
          : this.encodeObject(e, t);
      }),
      (e.prototype.ensureBufferSizeToWrite = function (e) {
        var t = this.pos + e;
        this.view.byteLength < t && this.resizeBuffer(2 * t);
      }),
      (e.prototype.resizeBuffer = function (e) {
        var t = new ArrayBuffer(e),
          n = new Uint8Array(t),
          r = new DataView(t);
        n.set(this.bytes), (this.view = r), (this.bytes = n);
      }),
      (e.prototype.encodeNil = function () {
        this.writeU8(192);
      }),
      (e.prototype.encodeBoolean = function (e) {
        !1 === e ? this.writeU8(194) : this.writeU8(195);
      }),
      (e.prototype.encodeNumber = function (e) {
        Number.isSafeInteger(e) && !this.forceIntegerToFloat
          ? e >= 0
            ? e < 128
              ? this.writeU8(e)
              : e < 256
              ? (this.writeU8(204), this.writeU8(e))
              : e < 65536
              ? (this.writeU8(205), this.writeU16(e))
              : e < 4294967296
              ? (this.writeU8(206), this.writeU32(e))
              : (this.writeU8(207), this.writeU64(e))
            : e >= -32
            ? this.writeU8(224 | (e + 32))
            : e >= -128
            ? (this.writeU8(208), this.writeI8(e))
            : e >= -32768
            ? (this.writeU8(209), this.writeI16(e))
            : e >= -2147483648
            ? (this.writeU8(210), this.writeI32(e))
            : (this.writeU8(211), this.writeI64(e))
          : this.forceFloat32
          ? (this.writeU8(202), this.writeF32(e))
          : (this.writeU8(203), this.writeF64(e));
      }),
      (e.prototype.writeStringHeader = function (e) {
        if (e < 32) this.writeU8(160 + e);
        else if (e < 256) this.writeU8(217), this.writeU8(e);
        else if (e < 65536) this.writeU8(218), this.writeU16(e);
        else {
          if (!(e < 4294967296))
            throw new Error('Too long string: ' + e + ' bytes in UTF-8');
          this.writeU8(219), this.writeU32(e);
        }
      }),
      (e.prototype.encodeString = function (e) {
        if (e.length > Yt) {
          var t = Kt(e);
          this.ensureBufferSizeToWrite(5 + t),
            this.writeStringHeader(t),
            Gt(e, this.bytes, this.pos),
            (this.pos += t);
        } else
          (t = Kt(e)),
            this.ensureBufferSizeToWrite(5 + t),
            this.writeStringHeader(t),
            (function (e, t, n) {
              for (var r = e.length, o = n, i = 0; i < r; ) {
                var s = e.charCodeAt(i++);
                if (0 != (4294967168 & s)) {
                  if (0 == (4294965248 & s)) t[o++] = ((s >> 6) & 31) | 192;
                  else {
                    if (s >= 55296 && s <= 56319 && i < r) {
                      var a = e.charCodeAt(i);
                      56320 == (64512 & a) &&
                        (++i, (s = ((1023 & s) << 10) + (1023 & a) + 65536));
                    }
                    0 == (4294901760 & s)
                      ? ((t[o++] = ((s >> 12) & 15) | 224),
                        (t[o++] = ((s >> 6) & 63) | 128))
                      : ((t[o++] = ((s >> 18) & 7) | 240),
                        (t[o++] = ((s >> 12) & 63) | 128),
                        (t[o++] = ((s >> 6) & 63) | 128));
                  }
                  t[o++] = (63 & s) | 128;
                } else t[o++] = s;
              }
            })(e, this.bytes, this.pos),
            (this.pos += t);
      }),
      (e.prototype.encodeObject = function (e, t) {
        var n = this.extensionCodec.tryToEncode(e, this.context);
        if (null != n) this.encodeExtension(n);
        else if (Array.isArray(e)) this.encodeArray(e, t);
        else if (ArrayBuffer.isView(e)) this.encodeBinary(e);
        else {
          if ('object' != typeof e)
            throw new Error(
              'Unrecognized object: ' + Object.prototype.toString.apply(e)
            );
          this.encodeMap(e, t);
        }
      }),
      (e.prototype.encodeBinary = function (e) {
        var t = e.byteLength;
        if (t < 256) this.writeU8(196), this.writeU8(t);
        else if (t < 65536) this.writeU8(197), this.writeU16(t);
        else {
          if (!(t < 4294967296)) throw new Error('Too large binary: ' + t);
          this.writeU8(198), this.writeU32(t);
        }
        var n = cn(e);
        this.writeU8a(n);
      }),
      (e.prototype.encodeArray = function (e, t) {
        var n = e.length;
        if (n < 16) this.writeU8(144 + n);
        else if (n < 65536) this.writeU8(220), this.writeU16(n);
        else {
          if (!(n < 4294967296)) throw new Error('Too large array: ' + n);
          this.writeU8(221), this.writeU32(n);
        }
        for (var r = 0, o = e; r < o.length; r++) {
          var i = o[r];
          this.doEncode(i, t + 1);
        }
      }),
      (e.prototype.countWithoutUndefined = function (e, t) {
        for (var n = 0, r = 0, o = t; r < o.length; r++)
          void 0 !== e[o[r]] && n++;
        return n;
      }),
      (e.prototype.encodeMap = function (e, t) {
        var n = Object.keys(e);
        this.sortKeys && n.sort();
        var r = this.ignoreUndefined
          ? this.countWithoutUndefined(e, n)
          : n.length;
        if (r < 16) this.writeU8(128 + r);
        else if (r < 65536) this.writeU8(222), this.writeU16(r);
        else {
          if (!(r < 4294967296)) throw new Error('Too large map object: ' + r);
          this.writeU8(223), this.writeU32(r);
        }
        for (var o = 0, i = n; o < i.length; o++) {
          var s = i[o],
            a = e[s];
          (this.ignoreUndefined && void 0 === a) ||
            (this.encodeString(s), this.doEncode(a, t + 1));
        }
      }),
      (e.prototype.encodeExtension = function (e) {
        var t = e.data.length;
        if (1 === t) this.writeU8(212);
        else if (2 === t) this.writeU8(213);
        else if (4 === t) this.writeU8(214);
        else if (8 === t) this.writeU8(215);
        else if (16 === t) this.writeU8(216);
        else if (t < 256) this.writeU8(199), this.writeU8(t);
        else if (t < 65536) this.writeU8(200), this.writeU16(t);
        else {
          if (!(t < 4294967296))
            throw new Error('Too large extension object: ' + t);
          this.writeU8(201), this.writeU32(t);
        }
        this.writeI8(e.type), this.writeU8a(e.data);
      }),
      (e.prototype.writeU8 = function (e) {
        this.ensureBufferSizeToWrite(1),
          this.view.setUint8(this.pos, e),
          this.pos++;
      }),
      (e.prototype.writeU8a = function (e) {
        var t = e.length;
        this.ensureBufferSizeToWrite(t),
          this.bytes.set(e, this.pos),
          (this.pos += t);
      }),
      (e.prototype.writeI8 = function (e) {
        this.ensureBufferSizeToWrite(1),
          this.view.setInt8(this.pos, e),
          this.pos++;
      }),
      (e.prototype.writeU16 = function (e) {
        this.ensureBufferSizeToWrite(2),
          this.view.setUint16(this.pos, e),
          (this.pos += 2);
      }),
      (e.prototype.writeI16 = function (e) {
        this.ensureBufferSizeToWrite(2),
          this.view.setInt16(this.pos, e),
          (this.pos += 2);
      }),
      (e.prototype.writeU32 = function (e) {
        this.ensureBufferSizeToWrite(4),
          this.view.setUint32(this.pos, e),
          (this.pos += 4);
      }),
      (e.prototype.writeI32 = function (e) {
        this.ensureBufferSizeToWrite(4),
          this.view.setInt32(this.pos, e),
          (this.pos += 4);
      }),
      (e.prototype.writeF32 = function (e) {
        this.ensureBufferSizeToWrite(4),
          this.view.setFloat32(this.pos, e),
          (this.pos += 4);
      }),
      (e.prototype.writeF64 = function (e) {
        this.ensureBufferSizeToWrite(8),
          this.view.setFloat64(this.pos, e),
          (this.pos += 8);
      }),
      (e.prototype.writeU64 = function (e) {
        this.ensureBufferSizeToWrite(8),
          (function (e, t, n) {
            var r = n / 4294967296,
              o = n;
            e.setUint32(t, r), e.setUint32(t + 4, o);
          })(this.view, this.pos, e),
          (this.pos += 8);
      }),
      (e.prototype.writeI64 = function (e) {
        this.ensureBufferSizeToWrite(8),
          Jt(this.view, this.pos, e),
          (this.pos += 8);
      }),
      e
    );
  })();
  function hn(e) {
    return (
      (e < 0 ? '-' : '') + '0x' + Math.abs(e).toString(16).padStart(2, '0')
    );
  }
  var un = (function () {
      function e(e, t) {
        void 0 === e && (e = 16),
          void 0 === t && (t = 16),
          (this.maxKeyLength = e),
          (this.maxLengthPerKey = t),
          (this.hit = 0),
          (this.miss = 0),
          (this.caches = []);
        for (var n = 0; n < this.maxKeyLength; n++) this.caches.push([]);
      }
      return (
        (e.prototype.canBeCached = function (e) {
          return e > 0 && e <= this.maxKeyLength;
        }),
        (e.prototype.find = function (e, t, n) {
          e: for (var r = 0, o = this.caches[n - 1]; r < o.length; r++) {
            for (var i = o[r], s = i.bytes, a = 0; a < n; a++)
              if (s[a] !== e[t + a]) continue e;
            return i.str;
          }
          return null;
        }),
        (e.prototype.store = function (e, t) {
          var n = this.caches[e.length - 1],
            r = { bytes: e, str: t };
          n.length >= this.maxLengthPerKey
            ? (n[(Math.random() * n.length) | 0] = r)
            : n.push(r);
        }),
        (e.prototype.decode = function (e, t, n) {
          var r = this.find(e, t, n);
          if (null != r) return this.hit++, r;
          this.miss++;
          var o = Qt(e, t, n),
            i = Uint8Array.prototype.slice.call(e, t, t + n);
          return this.store(i, o), o;
        }),
        e
      );
    })(),
    dn = function (e, t) {
      var n,
        r,
        o,
        i,
        s = {
          label: 0,
          sent: function () {
            if (1 & o[0]) throw o[1];
            return o[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (i = { next: a(0), throw: a(1), return: a(2) }),
        'function' == typeof Symbol &&
          (i[Symbol.iterator] = function () {
            return this;
          }),
        i
      );
      function a(i) {
        return function (a) {
          return (function (i) {
            if (n) throw new TypeError('Generator is already executing.');
            for (; s; )
              try {
                if (
                  ((n = 1),
                  r &&
                    (o =
                      2 & i[0]
                        ? r.return
                        : i[0]
                        ? r.throw || ((o = r.return) && o.call(r), 0)
                        : r.next) &&
                    !(o = o.call(r, i[1])).done)
                )
                  return o;
                switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                  case 0:
                  case 1:
                    o = i;
                    break;
                  case 4:
                    return s.label++, { value: i[1], done: !1 };
                  case 5:
                    s.label++, (r = i[1]), (i = [0]);
                    continue;
                  case 7:
                    (i = s.ops.pop()), s.trys.pop();
                    continue;
                  default:
                    if (
                      !(
                        (o = (o = s.trys).length > 0 && o[o.length - 1]) ||
                        (6 !== i[0] && 2 !== i[0])
                      )
                    ) {
                      s = 0;
                      continue;
                    }
                    if (3 === i[0] && (!o || (i[1] > o[0] && i[1] < o[3]))) {
                      s.label = i[1];
                      break;
                    }
                    if (6 === i[0] && s.label < o[1]) {
                      (s.label = o[1]), (o = i);
                      break;
                    }
                    if (o && s.label < o[2]) {
                      (s.label = o[2]), s.ops.push(i);
                      break;
                    }
                    o[2] && s.ops.pop(), s.trys.pop();
                    continue;
                }
                i = t.call(e, s);
              } catch (e) {
                (i = [6, e]), (r = 0);
              } finally {
                n = o = 0;
              }
            if (5 & i[0]) throw i[1];
            return { value: i[0] ? i[1] : void 0, done: !0 };
          })([i, a]);
        };
      }
    },
    pn = function (e) {
      if (!Symbol.asyncIterator)
        throw new TypeError('Symbol.asyncIterator is not defined.');
      var t,
        n = e[Symbol.asyncIterator];
      return n
        ? n.call(e)
        : ((e =
            'function' == typeof __values ? __values(e) : e[Symbol.iterator]()),
          (t = {}),
          r('next'),
          r('throw'),
          r('return'),
          (t[Symbol.asyncIterator] = function () {
            return this;
          }),
          t);
      function r(n) {
        t[n] =
          e[n] &&
          function (t) {
            return new Promise(function (r, o) {
              !(function (e, t, n, r) {
                Promise.resolve(r).then(function (t) {
                  e({ value: t, done: n });
                }, t);
              })(r, o, (t = e[n](t)).done, t.value);
            });
          };
      }
    },
    fn = function (e) {
      return this instanceof fn ? ((this.v = e), this) : new fn(e);
    },
    gn = function (e, t, n) {
      if (!Symbol.asyncIterator)
        throw new TypeError('Symbol.asyncIterator is not defined.');
      var r,
        o = n.apply(e, t || []),
        i = [];
      return (
        (r = {}),
        s('next'),
        s('throw'),
        s('return'),
        (r[Symbol.asyncIterator] = function () {
          return this;
        }),
        r
      );
      function s(e) {
        o[e] &&
          (r[e] = function (t) {
            return new Promise(function (n, r) {
              i.push([e, t, n, r]) > 1 || a(e, t);
            });
          });
      }
      function a(e, t) {
        try {
          (n = o[e](t)).value instanceof fn
            ? Promise.resolve(n.value.v).then(c, l)
            : h(i[0][2], n);
        } catch (e) {
          h(i[0][3], e);
        }
        var n;
      }
      function c(e) {
        a('next', e);
      }
      function l(e) {
        a('throw', e);
      }
      function h(e, t) {
        e(t), i.shift(), i.length && a(i[0][0], i[0][1]);
      }
    },
    mn = new DataView(new ArrayBuffer(0)),
    yn = new Uint8Array(mn.buffer),
    wn = (function () {
      try {
        mn.getInt8(0);
      } catch (e) {
        return e.constructor;
      }
      throw new Error('never reached');
    })(),
    vn = new wn('Insufficient data'),
    bn = new un(),
    _n = (function () {
      function e(e, t, n, r, o, i, s, a) {
        void 0 === e && (e = an.defaultCodec),
          void 0 === t && (t = void 0),
          void 0 === n && (n = zt),
          void 0 === r && (r = zt),
          void 0 === o && (o = zt),
          void 0 === i && (i = zt),
          void 0 === s && (s = zt),
          void 0 === a && (a = bn),
          (this.extensionCodec = e),
          (this.context = t),
          (this.maxStrLength = n),
          (this.maxBinLength = r),
          (this.maxArrayLength = o),
          (this.maxMapLength = i),
          (this.maxExtLength = s),
          (this.keyDecoder = a),
          (this.totalPos = 0),
          (this.pos = 0),
          (this.view = mn),
          (this.bytes = yn),
          (this.headByte = -1),
          (this.stack = []);
      }
      return (
        (e.prototype.reinitializeState = function () {
          (this.totalPos = 0), (this.headByte = -1), (this.stack.length = 0);
        }),
        (e.prototype.setBuffer = function (e) {
          (this.bytes = cn(e)),
            (this.view = (function (e) {
              if (e instanceof ArrayBuffer) return new DataView(e);
              var t = cn(e);
              return new DataView(t.buffer, t.byteOffset, t.byteLength);
            })(this.bytes)),
            (this.pos = 0);
        }),
        (e.prototype.appendBuffer = function (e) {
          if (-1 !== this.headByte || this.hasRemaining(1)) {
            var t = this.bytes.subarray(this.pos),
              n = cn(e),
              r = new Uint8Array(t.length + n.length);
            r.set(t), r.set(n, t.length), this.setBuffer(r);
          } else this.setBuffer(e);
        }),
        (e.prototype.hasRemaining = function (e) {
          return this.view.byteLength - this.pos >= e;
        }),
        (e.prototype.createExtraByteError = function (e) {
          var t = this.view,
            n = this.pos;
          return new RangeError(
            'Extra ' +
              (t.byteLength - n) +
              ' of ' +
              t.byteLength +
              ' byte(s) found at buffer[' +
              e +
              ']'
          );
        }),
        (e.prototype.decode = function (e) {
          this.reinitializeState(), this.setBuffer(e);
          var t = this.doDecodeSync();
          if (this.hasRemaining(1)) throw this.createExtraByteError(this.pos);
          return t;
        }),
        (e.prototype.decodeMulti = function (e) {
          return dn(this, function (t) {
            switch (t.label) {
              case 0:
                this.reinitializeState(), this.setBuffer(e), (t.label = 1);
              case 1:
                return this.hasRemaining(1) ? [4, this.doDecodeSync()] : [3, 3];
              case 2:
                return t.sent(), [3, 1];
              case 3:
                return [2];
            }
          });
        }),
        (e.prototype.decodeAsync = function (e) {
          var t, n, r, o, i, s, a;
          return (
            (i = this),
            void 0,
            (a = function () {
              var i, s, a, c, l, h, u, d;
              return dn(this, function (p) {
                switch (p.label) {
                  case 0:
                    (i = !1), (p.label = 1);
                  case 1:
                    p.trys.push([1, 6, 7, 12]), (t = pn(e)), (p.label = 2);
                  case 2:
                    return [4, t.next()];
                  case 3:
                    if ((n = p.sent()).done) return [3, 5];
                    if (((a = n.value), i))
                      throw this.createExtraByteError(this.totalPos);
                    this.appendBuffer(a);
                    try {
                      (s = this.doDecodeSync()), (i = !0);
                    } catch (e) {
                      if (!(e instanceof wn)) throw e;
                    }
                    (this.totalPos += this.pos), (p.label = 4);
                  case 4:
                    return [3, 2];
                  case 5:
                    return [3, 12];
                  case 6:
                    return (c = p.sent()), (r = { error: c }), [3, 12];
                  case 7:
                    return (
                      p.trys.push([7, , 10, 11]),
                      n && !n.done && (o = t.return) ? [4, o.call(t)] : [3, 9]
                    );
                  case 8:
                    p.sent(), (p.label = 9);
                  case 9:
                    return [3, 11];
                  case 10:
                    if (r) throw r.error;
                    return [7];
                  case 11:
                    return [7];
                  case 12:
                    if (i) {
                      if (this.hasRemaining(1))
                        throw this.createExtraByteError(this.totalPos);
                      return [2, s];
                    }
                    throw (
                      ((h = (l = this).headByte),
                      (u = l.pos),
                      (d = l.totalPos),
                      new RangeError(
                        'Insufficient data in parsing ' +
                          hn(h) +
                          ' at ' +
                          d +
                          ' (' +
                          u +
                          ' in the current buffer)'
                      ))
                    );
                }
              });
            }),
            new ((s = void 0) || (s = Promise))(function (e, t) {
              function n(e) {
                try {
                  o(a.next(e));
                } catch (e) {
                  t(e);
                }
              }
              function r(e) {
                try {
                  o(a.throw(e));
                } catch (e) {
                  t(e);
                }
              }
              function o(t) {
                var o;
                t.done
                  ? e(t.value)
                  : ((o = t.value),
                    o instanceof s
                      ? o
                      : new s(function (e) {
                          e(o);
                        })).then(n, r);
              }
              o((a = a.apply(i, [])).next());
            })
          );
        }),
        (e.prototype.decodeArrayStream = function (e) {
          return this.decodeMultiAsync(e, !0);
        }),
        (e.prototype.decodeStream = function (e) {
          return this.decodeMultiAsync(e, !1);
        }),
        (e.prototype.decodeMultiAsync = function (e, t) {
          return gn(this, arguments, function () {
            var n, r, o, i, s, a, c, l, h;
            return dn(this, function (u) {
              switch (u.label) {
                case 0:
                  (n = t), (r = -1), (u.label = 1);
                case 1:
                  u.trys.push([1, 13, 14, 19]), (o = pn(e)), (u.label = 2);
                case 2:
                  return [4, fn(o.next())];
                case 3:
                  if ((i = u.sent()).done) return [3, 12];
                  if (((s = i.value), t && 0 === r))
                    throw this.createExtraByteError(this.totalPos);
                  this.appendBuffer(s),
                    n &&
                      ((r = this.readArraySize()), (n = !1), this.complete()),
                    (u.label = 4);
                case 4:
                  u.trys.push([4, 9, , 10]), (u.label = 5);
                case 5:
                  return [4, fn(this.doDecodeSync())];
                case 6:
                  return [4, u.sent()];
                case 7:
                  return u.sent(), 0 == --r ? [3, 8] : [3, 5];
                case 8:
                  return [3, 10];
                case 9:
                  if (!((a = u.sent()) instanceof wn)) throw a;
                  return [3, 10];
                case 10:
                  (this.totalPos += this.pos), (u.label = 11);
                case 11:
                  return [3, 2];
                case 12:
                  return [3, 19];
                case 13:
                  return (c = u.sent()), (l = { error: c }), [3, 19];
                case 14:
                  return (
                    u.trys.push([14, , 17, 18]),
                    i && !i.done && (h = o.return)
                      ? [4, fn(h.call(o))]
                      : [3, 16]
                  );
                case 15:
                  u.sent(), (u.label = 16);
                case 16:
                  return [3, 18];
                case 17:
                  if (l) throw l.error;
                  return [7];
                case 18:
                  return [7];
                case 19:
                  return [2];
              }
            });
          });
        }),
        (e.prototype.doDecodeSync = function () {
          e: for (;;) {
            var e = this.readHeadByte(),
              t = void 0;
            if (e >= 224) t = e - 256;
            else if (e < 192)
              if (e < 128) t = e;
              else if (e < 144) {
                if (0 != (r = e - 128)) {
                  this.pushMapState(r), this.complete();
                  continue e;
                }
                t = {};
              } else if (e < 160) {
                if (0 != (r = e - 144)) {
                  this.pushArrayState(r), this.complete();
                  continue e;
                }
                t = [];
              } else {
                var n = e - 160;
                t = this.decodeUtf8String(n, 0);
              }
            else if (192 === e) t = null;
            else if (194 === e) t = !1;
            else if (195 === e) t = !0;
            else if (202 === e) t = this.readF32();
            else if (203 === e) t = this.readF64();
            else if (204 === e) t = this.readU8();
            else if (205 === e) t = this.readU16();
            else if (206 === e) t = this.readU32();
            else if (207 === e) t = this.readU64();
            else if (208 === e) t = this.readI8();
            else if (209 === e) t = this.readI16();
            else if (210 === e) t = this.readI32();
            else if (211 === e) t = this.readI64();
            else if (217 === e)
              (n = this.lookU8()), (t = this.decodeUtf8String(n, 1));
            else if (218 === e)
              (n = this.lookU16()), (t = this.decodeUtf8String(n, 2));
            else if (219 === e)
              (n = this.lookU32()), (t = this.decodeUtf8String(n, 4));
            else if (220 === e) {
              if (0 !== (r = this.readU16())) {
                this.pushArrayState(r), this.complete();
                continue e;
              }
              t = [];
            } else if (221 === e) {
              if (0 !== (r = this.readU32())) {
                this.pushArrayState(r), this.complete();
                continue e;
              }
              t = [];
            } else if (222 === e) {
              if (0 !== (r = this.readU16())) {
                this.pushMapState(r), this.complete();
                continue e;
              }
              t = {};
            } else if (223 === e) {
              if (0 !== (r = this.readU32())) {
                this.pushMapState(r), this.complete();
                continue e;
              }
              t = {};
            } else if (196 === e) {
              var r = this.lookU8();
              t = this.decodeBinary(r, 1);
            } else if (197 === e)
              (r = this.lookU16()), (t = this.decodeBinary(r, 2));
            else if (198 === e)
              (r = this.lookU32()), (t = this.decodeBinary(r, 4));
            else if (212 === e) t = this.decodeExtension(1, 0);
            else if (213 === e) t = this.decodeExtension(2, 0);
            else if (214 === e) t = this.decodeExtension(4, 0);
            else if (215 === e) t = this.decodeExtension(8, 0);
            else if (216 === e) t = this.decodeExtension(16, 0);
            else if (199 === e)
              (r = this.lookU8()), (t = this.decodeExtension(r, 1));
            else if (200 === e)
              (r = this.lookU16()), (t = this.decodeExtension(r, 2));
            else {
              if (201 !== e) throw new on('Unrecognized type byte: ' + hn(e));
              (r = this.lookU32()), (t = this.decodeExtension(r, 4));
            }
            this.complete();
            for (var o = this.stack; o.length > 0; ) {
              var i = o[o.length - 1];
              if (0 === i.type) {
                if (
                  ((i.array[i.position] = t),
                  i.position++,
                  i.position !== i.size)
                )
                  continue e;
                o.pop(), (t = i.array);
              } else {
                if (1 === i.type) {
                  if ('string' != (s = typeof t) && 'number' !== s)
                    throw new on(
                      'The type of key must be string or number but ' + typeof t
                    );
                  if ('__proto__' === t)
                    throw new on('The key __proto__ is not allowed');
                  (i.key = t), (i.type = 2);
                  continue e;
                }
                if (
                  ((i.map[i.key] = t), i.readCount++, i.readCount !== i.size)
                ) {
                  (i.key = null), (i.type = 1);
                  continue e;
                }
                o.pop(), (t = i.map);
              }
            }
            return t;
          }
          var s;
        }),
        (e.prototype.readHeadByte = function () {
          return (
            -1 === this.headByte && (this.headByte = this.readU8()),
            this.headByte
          );
        }),
        (e.prototype.complete = function () {
          this.headByte = -1;
        }),
        (e.prototype.readArraySize = function () {
          var e = this.readHeadByte();
          switch (e) {
            case 220:
              return this.readU16();
            case 221:
              return this.readU32();
            default:
              if (e < 160) return e - 144;
              throw new on('Unrecognized array type byte: ' + hn(e));
          }
        }),
        (e.prototype.pushMapState = function (e) {
          if (e > this.maxMapLength)
            throw new on(
              'Max length exceeded: map length (' +
                e +
                ') > maxMapLengthLength (' +
                this.maxMapLength +
                ')'
            );
          this.stack.push({
            type: 1,
            size: e,
            key: null,
            readCount: 0,
            map: {},
          });
        }),
        (e.prototype.pushArrayState = function (e) {
          if (e > this.maxArrayLength)
            throw new on(
              'Max length exceeded: array length (' +
                e +
                ') > maxArrayLength (' +
                this.maxArrayLength +
                ')'
            );
          this.stack.push({
            type: 0,
            size: e,
            array: new Array(e),
            position: 0,
          });
        }),
        (e.prototype.decodeUtf8String = function (e, t) {
          var n;
          if (e > this.maxStrLength)
            throw new on(
              'Max length exceeded: UTF-8 byte length (' +
                e +
                ') > maxStrLength (' +
                this.maxStrLength +
                ')'
            );
          if (this.bytes.byteLength < this.pos + t + e) throw vn;
          var r,
            o = this.pos + t;
          return (
            (r =
              this.stateIsMapKey() &&
              (null === (n = this.keyDecoder) || void 0 === n
                ? void 0
                : n.canBeCached(e))
                ? this.keyDecoder.decode(this.bytes, o, e)
                : e > tn
                ? (function (e, t, n) {
                    var r = e.subarray(t, t + n);
                    return en.decode(r);
                  })(this.bytes, o, e)
                : Qt(this.bytes, o, e)),
            (this.pos += t + e),
            r
          );
        }),
        (e.prototype.stateIsMapKey = function () {
          return (
            this.stack.length > 0 &&
            1 === this.stack[this.stack.length - 1].type
          );
        }),
        (e.prototype.decodeBinary = function (e, t) {
          if (e > this.maxBinLength)
            throw new on(
              'Max length exceeded: bin length (' +
                e +
                ') > maxBinLength (' +
                this.maxBinLength +
                ')'
            );
          if (!this.hasRemaining(e + t)) throw vn;
          var n = this.pos + t,
            r = this.bytes.subarray(n, n + e);
          return (this.pos += t + e), r;
        }),
        (e.prototype.decodeExtension = function (e, t) {
          if (e > this.maxExtLength)
            throw new on(
              'Max length exceeded: ext length (' +
                e +
                ') > maxExtLength (' +
                this.maxExtLength +
                ')'
            );
          var n = this.view.getInt8(this.pos + t),
            r = this.decodeBinary(e, t + 1);
          return this.extensionCodec.decode(r, n, this.context);
        }),
        (e.prototype.lookU8 = function () {
          return this.view.getUint8(this.pos);
        }),
        (e.prototype.lookU16 = function () {
          return this.view.getUint16(this.pos);
        }),
        (e.prototype.lookU32 = function () {
          return this.view.getUint32(this.pos);
        }),
        (e.prototype.readU8 = function () {
          var e = this.view.getUint8(this.pos);
          return this.pos++, e;
        }),
        (e.prototype.readI8 = function () {
          var e = this.view.getInt8(this.pos);
          return this.pos++, e;
        }),
        (e.prototype.readU16 = function () {
          var e = this.view.getUint16(this.pos);
          return (this.pos += 2), e;
        }),
        (e.prototype.readI16 = function () {
          var e = this.view.getInt16(this.pos);
          return (this.pos += 2), e;
        }),
        (e.prototype.readU32 = function () {
          var e = this.view.getUint32(this.pos);
          return (this.pos += 4), e;
        }),
        (e.prototype.readI32 = function () {
          var e = this.view.getInt32(this.pos);
          return (this.pos += 4), e;
        }),
        (e.prototype.readU64 = function () {
          var e,
            t,
            n =
              ((e = this.view),
              (t = this.pos),
              4294967296 * e.getUint32(t) + e.getUint32(t + 4));
          return (this.pos += 8), n;
        }),
        (e.prototype.readI64 = function () {
          var e = qt(this.view, this.pos);
          return (this.pos += 8), e;
        }),
        (e.prototype.readF32 = function () {
          var e = this.view.getFloat32(this.pos);
          return (this.pos += 4), e;
        }),
        (e.prototype.readF64 = function () {
          var e = this.view.getFloat64(this.pos);
          return (this.pos += 8), e;
        }),
        e
      );
    })();
  class En {
    static write(e) {
      let t = e.byteLength || e.length;
      const n = [];
      do {
        let e = 127 & t;
        (t >>= 7), t > 0 && (e |= 128), n.push(e);
      } while (t > 0);
      t = e.byteLength || e.length;
      const r = new Uint8Array(n.length + t);
      return r.set(n, 0), r.set(e, n.length), r.buffer;
    }
    static parse(e) {
      const t = [],
        n = new Uint8Array(e),
        r = [0, 7, 14, 21, 28];
      for (let o = 0; o < e.byteLength; ) {
        let i,
          s = 0,
          a = 0;
        do {
          (i = n[o + s]), (a |= (127 & i) << r[s]), s++;
        } while (s < Math.min(5, e.byteLength - o) && 0 != (128 & i));
        if (0 != (128 & i) && s < 5)
          throw new Error('Cannot read message size.');
        if (5 === s && i > 7)
          throw new Error('Messages bigger than 2GB are not supported.');
        if (!(n.byteLength >= o + s + a))
          throw new Error('Incomplete message.');
        t.push(
          n.slice ? n.slice(o + s, o + s + a) : n.subarray(o + s, o + s + a)
        ),
          (o = o + s + a);
      }
      return t;
    }
  }
  const Sn = new Uint8Array([145, ut.Ping]);
  class Cn {
    constructor(e) {
      (this.name = 'messagepack'),
        (this.version = 1),
        (this.transferFormat = ht.Binary),
        (this._errorResult = 1),
        (this._voidResult = 2),
        (this._nonVoidResult = 3),
        (e = e || {}),
        (this._encoder = new ln(
          e.extensionCodec,
          e.context,
          e.maxDepth,
          e.initialBufferSize,
          e.sortKeys,
          e.forceFloat32,
          e.ignoreUndefined,
          e.forceIntegerToFloat
        )),
        (this._decoder = new _n(
          e.extensionCodec,
          e.context,
          e.maxStrLength,
          e.maxBinLength,
          e.maxArrayLength,
          e.maxMapLength,
          e.maxExtLength
        ));
    }
    parseMessages(e, t) {
      if (
        !(n = e) ||
        'undefined' == typeof ArrayBuffer ||
        !(
          n instanceof ArrayBuffer ||
          (n.constructor && 'ArrayBuffer' === n.constructor.name)
        )
      )
        throw new Error(
          'Invalid input for MessagePack hub protocol. Expected an ArrayBuffer.'
        );
      var n;
      null === t && (t = pt.instance);
      const r = En.parse(e),
        o = [];
      for (const e of r) {
        const n = this._parseMessage(e, t);
        n && o.push(n);
      }
      return o;
    }
    writeMessage(e) {
      switch (e.type) {
        case ut.Invocation:
          return this._writeInvocation(e);
        case ut.StreamInvocation:
          return this._writeStreamInvocation(e);
        case ut.StreamItem:
          return this._writeStreamItem(e);
        case ut.Completion:
          return this._writeCompletion(e);
        case ut.Ping:
          return En.write(Sn);
        case ut.CancelInvocation:
          return this._writeCancelInvocation(e);
        default:
          throw new Error('Invalid message type.');
      }
    }
    _parseMessage(e, t) {
      if (0 === e.length) throw new Error('Invalid payload.');
      const n = this._decoder.decode(e);
      if (0 === n.length || !(n instanceof Array))
        throw new Error('Invalid payload.');
      const r = n[0];
      switch (r) {
        case ut.Invocation:
          return this._createInvocationMessage(this._readHeaders(n), n);
        case ut.StreamItem:
          return this._createStreamItemMessage(this._readHeaders(n), n);
        case ut.Completion:
          return this._createCompletionMessage(this._readHeaders(n), n);
        case ut.Ping:
          return this._createPingMessage(n);
        case ut.Close:
          return this._createCloseMessage(n);
        default:
          return (
            t.log(ct.Information, "Unknown message type '" + r + "' ignored."),
            null
          );
      }
    }
    _createCloseMessage(e) {
      if (e.length < 2) throw new Error('Invalid payload for Close message.');
      return {
        allowReconnect: e.length >= 3 ? e[2] : void 0,
        error: e[1],
        type: ut.Close,
      };
    }
    _createPingMessage(e) {
      if (e.length < 1) throw new Error('Invalid payload for Ping message.');
      return { type: ut.Ping };
    }
    _createInvocationMessage(e, t) {
      if (t.length < 5)
        throw new Error('Invalid payload for Invocation message.');
      const n = t[2];
      return n
        ? {
            arguments: t[4],
            headers: e,
            invocationId: n,
            streamIds: [],
            target: t[3],
            type: ut.Invocation,
          }
        : {
            arguments: t[4],
            headers: e,
            streamIds: [],
            target: t[3],
            type: ut.Invocation,
          };
    }
    _createStreamItemMessage(e, t) {
      if (t.length < 4)
        throw new Error('Invalid payload for StreamItem message.');
      return {
        headers: e,
        invocationId: t[2],
        item: t[3],
        type: ut.StreamItem,
      };
    }
    _createCompletionMessage(e, t) {
      if (t.length < 4)
        throw new Error('Invalid payload for Completion message.');
      const n = t[3];
      if (n !== this._voidResult && t.length < 5)
        throw new Error('Invalid payload for Completion message.');
      let r, o;
      switch (n) {
        case this._errorResult:
          r = t[4];
          break;
        case this._nonVoidResult:
          o = t[4];
      }
      return {
        error: r,
        headers: e,
        invocationId: t[2],
        result: o,
        type: ut.Completion,
      };
    }
    _writeInvocation(e) {
      let t;
      return (
        (t = e.streamIds
          ? this._encoder.encode([
              ut.Invocation,
              e.headers || {},
              e.invocationId || null,
              e.target,
              e.arguments,
              e.streamIds,
            ])
          : this._encoder.encode([
              ut.Invocation,
              e.headers || {},
              e.invocationId || null,
              e.target,
              e.arguments,
            ])),
        En.write(t.slice())
      );
    }
    _writeStreamInvocation(e) {
      let t;
      return (
        (t = e.streamIds
          ? this._encoder.encode([
              ut.StreamInvocation,
              e.headers || {},
              e.invocationId,
              e.target,
              e.arguments,
              e.streamIds,
            ])
          : this._encoder.encode([
              ut.StreamInvocation,
              e.headers || {},
              e.invocationId,
              e.target,
              e.arguments,
            ])),
        En.write(t.slice())
      );
    }
    _writeStreamItem(e) {
      const t = this._encoder.encode([
        ut.StreamItem,
        e.headers || {},
        e.invocationId,
        e.item,
      ]);
      return En.write(t.slice());
    }
    _writeCompletion(e) {
      const t = e.error
        ? this._errorResult
        : e.result
        ? this._nonVoidResult
        : this._voidResult;
      let n;
      switch (t) {
        case this._errorResult:
          n = this._encoder.encode([
            ut.Completion,
            e.headers || {},
            e.invocationId,
            t,
            e.error,
          ]);
          break;
        case this._voidResult:
          n = this._encoder.encode([
            ut.Completion,
            e.headers || {},
            e.invocationId,
            t,
          ]);
          break;
        case this._nonVoidResult:
          n = this._encoder.encode([
            ut.Completion,
            e.headers || {},
            e.invocationId,
            t,
            e.result,
          ]);
      }
      return En.write(n.slice());
    }
    _writeCancelInvocation(e) {
      const t = this._encoder.encode([
        ut.CancelInvocation,
        e.headers || {},
        e.invocationId,
      ]);
      return En.write(t.slice());
    }
    _readHeaders(e) {
      const t = e[1];
      if ('object' != typeof t) throw new Error('Invalid headers.');
      return t;
    }
  }
  let In = !1;
  function kn() {
    const e = document.querySelector('#blazor-error-ui');
    e && (e.style.display = 'block'),
      In ||
        ((In = !0),
        document.querySelectorAll('#blazor-error-ui .reload').forEach((e) => {
          e.onclick = function (e) {
            location.reload(), e.preventDefault();
          };
        }),
        document.querySelectorAll('#blazor-error-ui .dismiss').forEach((e) => {
          e.onclick = function (e) {
            const t = document.querySelector('#blazor-error-ui');
            t && (t.style.display = 'none'), e.preventDefault();
          };
        }));
  }
  const Tn = 'function' == typeof TextDecoder ? new TextDecoder('utf-8') : null,
    xn = Tn
      ? Tn.decode.bind(Tn)
      : function (e) {
          let t = 0;
          const n = e.length,
            r = [],
            o = [];
          for (; t < n; ) {
            const n = e[t++];
            if (0 === n) break;
            if (0 == (128 & n)) r.push(n);
            else if (192 == (224 & n)) {
              const o = 63 & e[t++];
              r.push(((31 & n) << 6) | o);
            } else if (224 == (240 & n)) {
              const o = 63 & e[t++],
                i = 63 & e[t++];
              r.push(((31 & n) << 12) | (o << 6) | i);
            } else if (240 == (248 & n)) {
              let o =
                ((7 & n) << 18) |
                ((63 & e[t++]) << 12) |
                ((63 & e[t++]) << 6) |
                (63 & e[t++]);
              o > 65535 &&
                ((o -= 65536),
                r.push(((o >>> 10) & 1023) | 55296),
                (o = 56320 | (1023 & o))),
                r.push(o);
            }
            r.length > 1024 &&
              (o.push(String.fromCharCode.apply(null, r)), (r.length = 0));
          }
          return o.push(String.fromCharCode.apply(null, r)), o.join('');
        },
    Dn = Math.pow(2, 32),
    Rn = Math.pow(2, 21) - 1;
  function Pn(e, t) {
    return e[t] | (e[t + 1] << 8) | (e[t + 2] << 16) | (e[t + 3] << 24);
  }
  function Un(e, t) {
    return e[t] + (e[t + 1] << 8) + (e[t + 2] << 16) + ((e[t + 3] << 24) >>> 0);
  }
  function An(e, t) {
    const n = Un(e, t + 4);
    if (n > Rn)
      throw new Error(
        `Cannot read uint64 with high order part ${n}, because the result would exceed Number.MAX_SAFE_INTEGER.`
      );
    return n * Dn + Un(e, t);
  }
  class Nn {
    constructor(e) {
      this.batchData = e;
      const t = new Mn(e);
      (this.arrayRangeReader = new On(e)),
        (this.arrayBuilderSegmentReader = new Fn(e)),
        (this.diffReader = new $n(e)),
        (this.editReader = new Ln(e, t)),
        (this.frameReader = new Bn(e, t));
    }
    updatedComponents() {
      return Pn(this.batchData, this.batchData.length - 20);
    }
    referenceFrames() {
      return Pn(this.batchData, this.batchData.length - 16);
    }
    disposedComponentIds() {
      return Pn(this.batchData, this.batchData.length - 12);
    }
    disposedEventHandlerIds() {
      return Pn(this.batchData, this.batchData.length - 8);
    }
    updatedComponentsEntry(e, t) {
      const n = e + 4 * t;
      return Pn(this.batchData, n);
    }
    referenceFramesEntry(e, t) {
      return e + 20 * t;
    }
    disposedComponentIdsEntry(e, t) {
      const n = e + 4 * t;
      return Pn(this.batchData, n);
    }
    disposedEventHandlerIdsEntry(e, t) {
      const n = e + 8 * t;
      return An(this.batchData, n);
    }
  }
  class $n {
    constructor(e) {
      this.batchDataUint8 = e;
    }
    componentId(e) {
      return Pn(this.batchDataUint8, e);
    }
    edits(e) {
      return e + 4;
    }
    editsEntry(e, t) {
      return e + 16 * t;
    }
  }
  class Ln {
    constructor(e, t) {
      (this.batchDataUint8 = e), (this.stringReader = t);
    }
    editType(e) {
      return Pn(this.batchDataUint8, e);
    }
    siblingIndex(e) {
      return Pn(this.batchDataUint8, e + 4);
    }
    newTreeIndex(e) {
      return Pn(this.batchDataUint8, e + 8);
    }
    moveToSiblingIndex(e) {
      return Pn(this.batchDataUint8, e + 8);
    }
    removedAttributeName(e) {
      const t = Pn(this.batchDataUint8, e + 12);
      return this.stringReader.readString(t);
    }
  }
  class Bn {
    constructor(e, t) {
      (this.batchDataUint8 = e), (this.stringReader = t);
    }
    frameType(e) {
      return Pn(this.batchDataUint8, e);
    }
    subtreeLength(e) {
      return Pn(this.batchDataUint8, e + 4);
    }
    elementReferenceCaptureId(e) {
      const t = Pn(this.batchDataUint8, e + 4);
      return this.stringReader.readString(t);
    }
    componentId(e) {
      return Pn(this.batchDataUint8, e + 8);
    }
    elementName(e) {
      const t = Pn(this.batchDataUint8, e + 8);
      return this.stringReader.readString(t);
    }
    textContent(e) {
      const t = Pn(this.batchDataUint8, e + 4);
      return this.stringReader.readString(t);
    }
    markupContent(e) {
      const t = Pn(this.batchDataUint8, e + 4);
      return this.stringReader.readString(t);
    }
    attributeName(e) {
      const t = Pn(this.batchDataUint8, e + 4);
      return this.stringReader.readString(t);
    }
    attributeValue(e) {
      const t = Pn(this.batchDataUint8, e + 8);
      return this.stringReader.readString(t);
    }
    attributeEventHandlerId(e) {
      return An(this.batchDataUint8, e + 12);
    }
  }
  class Mn {
    constructor(e) {
      (this.batchDataUint8 = e),
        (this.stringTableStartIndex = Pn(e, e.length - 4));
    }
    readString(e) {
      if (-1 === e) return null;
      {
        const n = Pn(this.batchDataUint8, this.stringTableStartIndex + 4 * e),
          r = (function (e, t) {
            let n = 0,
              r = 0;
            for (let o = 0; o < 4; o++) {
              const i = e[t + o];
              if (((n |= (127 & i) << r), i < 128)) break;
              r += 7;
            }
            return n;
          })(this.batchDataUint8, n),
          o = n + ((t = r) < 128 ? 1 : t < 16384 ? 2 : t < 2097152 ? 3 : 4),
          i = new Uint8Array(
            this.batchDataUint8.buffer,
            this.batchDataUint8.byteOffset + o,
            r
          );
        return xn(i);
      }
      var t;
    }
  }
  class On {
    constructor(e) {
      this.batchDataUint8 = e;
    }
    count(e) {
      return Pn(this.batchDataUint8, e);
    }
    values(e) {
      return e + 4;
    }
  }
  class Fn {
    constructor(e) {
      this.batchDataUint8 = e;
    }
    offset(e) {
      return 0;
    }
    count(e) {
      return Pn(this.batchDataUint8, e);
    }
    values(e) {
      return e + 4;
    }
  }
  var jn;
  !(function (e) {
    (e[(e.Trace = 0)] = 'Trace'),
      (e[(e.Debug = 1)] = 'Debug'),
      (e[(e.Information = 2)] = 'Information'),
      (e[(e.Warning = 3)] = 'Warning'),
      (e[(e.Error = 4)] = 'Error'),
      (e[(e.Critical = 5)] = 'Critical'),
      (e[(e.None = 6)] = 'None');
  })(jn || (jn = {}));
  class Hn {
    constructor(e, t) {
      (this.nextBatchId = 2), (this.browserRendererId = e), (this.logger = t);
    }
    static getOrCreate(e) {
      return Hn.instance || (Hn.instance = new Hn(0, e)), this.instance;
    }
    async processBatch(e, t, n) {
      if (e < this.nextBatchId)
        return (
          await this.completeBatch(n, e),
          void this.logger.log(
            jn.Debug,
            `Batch ${e} already processed. Waiting for batch ${this.nextBatchId}.`
          )
        );
      if (e > this.nextBatchId)
        return this.fatalError
          ? (this.logger.log(
              jn.Debug,
              `Received a new batch ${e} but errored out on a previous batch ${
                this.nextBatchId - 1
              }`
            ),
            void (await n.send(
              'OnRenderCompleted',
              this.nextBatchId - 1,
              this.fatalError.toString()
            )))
          : void this.logger.log(
              jn.Debug,
              `Waiting for batch ${this.nextBatchId}. Batch ${e} not processed.`
            );
      try {
        this.nextBatchId++,
          this.logger.log(jn.Debug, `Applying batch ${e}.`),
          (function (e, t) {
            const n = de[e];
            if (!n)
              throw new Error(`There is no browser renderer with ID ${e}.`);
            const r = t.arrayRangeReader,
              o = t.updatedComponents(),
              i = r.values(o),
              s = r.count(o),
              a = t.referenceFrames(),
              c = r.values(a),
              l = t.diffReader;
            for (let e = 0; e < s; e++) {
              const r = t.updatedComponentsEntry(i, e),
                o = l.componentId(r),
                s = l.edits(r);
              n.updateComponent(t, o, s, c);
            }
            const h = t.disposedComponentIds(),
              u = r.values(h),
              d = r.count(h);
            for (let e = 0; e < d; e++) {
              const r = t.disposedComponentIdsEntry(u, e);
              n.disposeComponent(r);
            }
            const p = t.disposedEventHandlerIds(),
              f = r.values(p),
              g = r.count(p);
            for (let e = 0; e < g; e++) {
              const r = t.disposedEventHandlerIdsEntry(f, e);
              n.disposeEventHandler(r);
            }
            pe && ((pe = !1), window.scrollTo && window.scrollTo(0, 0));
          })(this.browserRendererId, new Nn(t)),
          await this.completeBatch(n, e);
      } catch (t) {
        throw (
          ((this.fatalError = t.toString()),
          this.logger.log(jn.Error, `There was an error applying batch ${e}.`),
          n.send('OnRenderCompleted', e, t.toString()),
          t)
        );
      }
    }
    getLastBatchid() {
      return this.nextBatchId - 1;
    }
    async completeBatch(e, t) {
      try {
        await e.send('OnRenderCompleted', t, null);
      } catch {
        this.logger.log(
          jn.Warning,
          `Failed to deliver completion notification for render '${t}'.`
        );
      }
    }
  }
  class Wn {
    log(e, t) {}
  }
  Wn.instance = new Wn();
  class zn {
    constructor(e) {
      this.minLevel = e;
    }
    log(e, t) {
      if (e >= this.minLevel) {
        const n = `[${new Date().toISOString()}] ${jn[e]}: ${t}`;
        switch (e) {
          case jn.Critical:
          case jn.Error:
            console.error(n);
            break;
          case jn.Warning:
            console.warn(n);
            break;
          case jn.Information:
            console.info(n);
            break;
          default:
            console.log(n);
        }
      }
    }
  }
  class Jn {
    constructor(e, t) {
      (this.circuitId = void 0),
        (this.components = e),
        (this.applicationState = t);
    }
    reconnect(e) {
      if (!this.circuitId) throw new Error('Circuit host not initialized.');
      return e.state !== dt.Connected
        ? Promise.resolve(!1)
        : e.invoke('ConnectCircuit', this.circuitId);
    }
    initialize(e) {
      if (this.circuitId)
        throw new Error(
          `Circuit host '${this.circuitId}' already initialized.`
        );
      this.circuitId = e;
    }
    async startCircuit(e) {
      if (e.state !== dt.Connected) return !1;
      const t = await e.invoke(
        'StartCircuit',
        Se.getBaseURI(),
        Se.getLocationHref(),
        JSON.stringify(this.components.map((e) => e.toRecord())),
        this.applicationState || ''
      );
      return !!t && (this.initialize(t), !0);
    }
    resolveElement(e) {
      const t = (function (e) {
        const t = f.get(e);
        if (t) return f.delete(e), t;
      })(e);
      if (t) return M(t, !0);
      const n = Number.parseInt(e);
      if (!Number.isNaN(n))
        return (function (e, t) {
          if (!e.parentNode)
            throw new Error(
              `Comment not connected to the DOM ${e.textContent}`
            );
          const n = e.parentNode,
            r = M(n, !0),
            o = J(r);
          return (
            Array.from(n.childNodes).forEach((e) => o.push(e)),
            (e[L] = r),
            t && ((e[B] = t), M(t)),
            M(e)
          );
        })(this.components[n].start, this.components[n].end);
      throw new Error(`Invalid sequence number or identifier '${e}'.`);
    }
  }
  const qn = {
    configureSignalR: (e) => {},
    logLevel: jn.Warning,
    reconnectionOptions: {
      maxRetries: 8,
      retryIntervalMilliseconds: 2e4,
      dialogId: 'components-reconnect-modal',
    },
  };
  class Vn {
    constructor(e, t, n, r) {
      (this.maxRetries = t),
        (this.document = n),
        (this.logger = r),
        (this.addedToDom = !1),
        (this.modal = this.document.createElement('div')),
        (this.modal.id = e),
        (this.maxRetries = t),
        (this.modal.style.cssText = [
          'position: fixed',
          'top: 0',
          'right: 0',
          'bottom: 0',
          'left: 0',
          'z-index: 1050',
          'display: none',
          'overflow: hidden',
          'background-color: #fff',
          'opacity: 0.8',
          'text-align: center',
          'font-weight: bold',
          'transition: visibility 0s linear 500ms',
        ].join(';')),
        (this.message = this.document.createElement('h5')),
        (this.message.style.cssText = 'margin-top: 20px'),
        (this.button = this.document.createElement('button')),
        (this.button.style.cssText = 'margin:5px auto 5px'),
        (this.button.textContent = 'Retry');
      const o = this.document.createElement('a');
      o.addEventListener('click', () => location.reload()),
        (o.textContent = 'reload'),
        (this.reloadParagraph = this.document.createElement('p')),
        (this.reloadParagraph.textContent = 'Alternatively, '),
        this.reloadParagraph.appendChild(o),
        this.modal.appendChild(this.message),
        this.modal.appendChild(this.button),
        this.modal.appendChild(this.reloadParagraph),
        (this.loader = this.getLoader()),
        this.message.after(this.loader),
        this.button.addEventListener('click', async () => {
          this.show();
          try {
            (await Ve.reconnect()) || this.rejected();
          } catch (e) {
            this.logger.log(jn.Error, e), this.failed();
          }
        });
    }
    show() {
      this.addedToDom ||
        ((this.addedToDom = !0), this.document.body.appendChild(this.modal)),
        (this.modal.style.display = 'block'),
        (this.loader.style.display = 'inline-block'),
        (this.button.style.display = 'none'),
        (this.reloadParagraph.style.display = 'none'),
        (this.message.textContent = 'Attempting to reconnect to the server...'),
        (this.modal.style.visibility = 'hidden'),
        setTimeout(() => {
          this.modal.style.visibility = 'visible';
        }, 0);
    }
    update(e) {
      this.message.textContent = `Attempting to reconnect to the server: ${e} of ${this.maxRetries}`;
    }
    hide() {
      this.modal.style.display = 'none';
    }
    failed() {
      (this.button.style.display = 'block'),
        (this.reloadParagraph.style.display = 'none'),
        (this.loader.style.display = 'none');
      const e = this.document.createTextNode('Reconnection failed. Try '),
        t = this.document.createElement('a');
      (t.textContent = 'reloading'),
        t.setAttribute('href', ''),
        t.addEventListener('click', () => location.reload());
      const n = this.document.createTextNode(
        " the page if you're unable to reconnect."
      );
      this.message.replaceChildren(e, t, n);
    }
    rejected() {
      (this.button.style.display = 'none'),
        (this.reloadParagraph.style.display = 'none'),
        (this.loader.style.display = 'none');
      const e = this.document.createTextNode(
          'Could not reconnect to the server. '
        ),
        t = this.document.createElement('a');
      (t.textContent = 'Reload'),
        t.setAttribute('href', ''),
        t.addEventListener('click', () => location.reload());
      const n = this.document.createTextNode(
        ' the page to restore functionality.'
      );
      this.message.replaceChildren(e, t, n);
    }
    getLoader() {
      const e = this.document.createElement('div');
      return (
        (e.style.cssText = [
          'border: 0.3em solid #f3f3f3',
          'border-top: 0.3em solid #3498db',
          'border-radius: 50%',
          'width: 2em',
          'height: 2em',
          'display: inline-block',
        ].join(';')),
        e.animate(
          [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
          { duration: 2e3, iterations: 1 / 0 }
        ),
        e
      );
    }
  }
  class Kn {
    constructor(e, t, n) {
      (this.dialog = e),
        (this.maxRetries = t),
        (this.document = n),
        (this.document = n);
      const r = this.document.getElementById(Kn.MaxRetriesId);
      r && (r.innerText = this.maxRetries.toString());
    }
    show() {
      this.removeClasses(), this.dialog.classList.add(Kn.ShowClassName);
    }
    update(e) {
      const t = this.document.getElementById(Kn.CurrentAttemptId);
      t && (t.innerText = e.toString());
    }
    hide() {
      this.removeClasses(), this.dialog.classList.add(Kn.HideClassName);
    }
    failed() {
      this.removeClasses(), this.dialog.classList.add(Kn.FailedClassName);
    }
    rejected() {
      this.removeClasses(), this.dialog.classList.add(Kn.RejectedClassName);
    }
    removeClasses() {
      this.dialog.classList.remove(
        Kn.ShowClassName,
        Kn.HideClassName,
        Kn.FailedClassName,
        Kn.RejectedClassName
      );
    }
  }
  (Kn.ShowClassName = 'components-reconnect-show'),
    (Kn.HideClassName = 'components-reconnect-hide'),
    (Kn.FailedClassName = 'components-reconnect-failed'),
    (Kn.RejectedClassName = 'components-reconnect-rejected'),
    (Kn.MaxRetriesId = 'components-reconnect-max-retries'),
    (Kn.CurrentAttemptId = 'components-reconnect-current-attempt');
  class Xn {
    constructor(e, t, n) {
      (this._currentReconnectionProcess = null),
        (this._logger = e),
        (this._reconnectionDisplay = t),
        (this._reconnectCallback = n || Ve.reconnect);
    }
    onConnectionDown(e, t) {
      if (!this._reconnectionDisplay) {
        const t = document.getElementById(e.dialogId);
        this._reconnectionDisplay = t
          ? new Kn(t, e.maxRetries, document)
          : new Vn(e.dialogId, e.maxRetries, document, this._logger);
      }
      this._currentReconnectionProcess ||
        (this._currentReconnectionProcess = new Yn(
          e,
          this._logger,
          this._reconnectCallback,
          this._reconnectionDisplay
        ));
    }
    onConnectionUp() {
      this._currentReconnectionProcess &&
        (this._currentReconnectionProcess.dispose(),
        (this._currentReconnectionProcess = null));
    }
  }
  class Yn {
    constructor(e, t, n, r) {
      (this.logger = t),
        (this.reconnectCallback = n),
        (this.isDisposed = !1),
        (this.reconnectDisplay = r),
        this.reconnectDisplay.show(),
        this.attemptPeriodicReconnection(e);
    }
    dispose() {
      (this.isDisposed = !0), this.reconnectDisplay.hide();
    }
    async attemptPeriodicReconnection(e) {
      for (let t = 0; t < e.maxRetries; t++) {
        this.reconnectDisplay.update(t + 1);
        const n =
          0 === t && e.retryIntervalMilliseconds > Yn.MaximumFirstRetryInterval
            ? Yn.MaximumFirstRetryInterval
            : e.retryIntervalMilliseconds;
        if ((await this.delay(n), this.isDisposed)) break;
        try {
          return (await this.reconnectCallback())
            ? void 0
            : void this.reconnectDisplay.rejected();
        } catch (e) {
          this.logger.log(jn.Error, e);
        }
      }
      this.reconnectDisplay.failed();
    }
    delay(e) {
      return new Promise((t) => setTimeout(t, e));
    }
  }
  Yn.MaximumFirstRetryInterval = 3e3;
  const Gn = /^\s*Blazor-Component-State:(?<state>[a-zA-Z0-9+/=]+)$/;
  function Qn(e) {
    var t;
    if (e.nodeType === Node.COMMENT_NODE) {
      const n = e.textContent || '',
        r = Gn.exec(n),
        o = r && r.groups && r.groups.state;
      return (
        o && (null === (t = e.parentNode) || void 0 === t || t.removeChild(e)),
        o
      );
    }
    if (!e.hasChildNodes()) return;
    const n = e.childNodes;
    for (let e = 0; e < n.length; e++) {
      const t = Qn(n[e]);
      if (t) return t;
    }
  }
  function Zn(e, t) {
    if (!e.hasChildNodes()) return [];
    const n = [],
      r = new or(e.childNodes);
    for (; r.next() && r.currentElement; ) {
      const e = tr(r, t);
      if (e) n.push(e);
      else {
        const e = Zn(r.currentElement, t);
        for (let t = 0; t < e.length; t++) {
          const r = e[t];
          n.push(r);
        }
      }
    }
    return n;
  }
  const er = new RegExp(/^\s*Blazor:[^{]*(?<descriptor>.*)$/);
  function tr(e, t) {
    const n = e.currentElement;
    if (n && n.nodeType === Node.COMMENT_NODE && n.textContent) {
      const r = er.exec(n.textContent),
        o = r && r.groups && r.groups.descriptor;
      if (!o) return;
      try {
        const r = (function (e) {
          const t = JSON.parse(e),
            { type: n } = t;
          if ('server' !== n && 'webassembly' !== n)
            throw new Error(`Invalid component type '${n}'.`);
          return t;
        })(o);
        switch (t) {
          case 'webassembly':
            return (function (e, t, n) {
              const {
                type: r,
                assembly: o,
                typeName: i,
                parameterDefinitions: s,
                parameterValues: a,
                prerenderId: c,
              } = e;
              if ('webassembly' === r) {
                if (!o)
                  throw new Error(
                    'assembly must be defined when using a descriptor.'
                  );
                if (!i)
                  throw new Error(
                    'typeName must be defined when using a descriptor.'
                  );
                if (c) {
                  const e = nr(c, n);
                  if (!e)
                    throw new Error(
                      `Could not find an end component comment for '${t}'`
                    );
                  return {
                    type: r,
                    assembly: o,
                    typeName: i,
                    parameterDefinitions: s && atob(s),
                    parameterValues: a && atob(a),
                    start: t,
                    prerenderId: c,
                    end: e,
                  };
                }
                return {
                  type: r,
                  assembly: o,
                  typeName: i,
                  parameterDefinitions: s && atob(s),
                  parameterValues: a && atob(a),
                  start: t,
                };
              }
            })(r, n, e);
          case 'server':
            return (function (e, t, n) {
              const { type: r, descriptor: o, sequence: i, prerenderId: s } = e;
              if ('server' === r) {
                if (!o)
                  throw new Error(
                    'descriptor must be defined when using a descriptor.'
                  );
                if (void 0 === i)
                  throw new Error(
                    'sequence must be defined when using a descriptor.'
                  );
                if (!Number.isInteger(i))
                  throw new Error(
                    `Error parsing the sequence '${i}' for component '${JSON.stringify(
                      e
                    )}'`
                  );
                if (s) {
                  const e = nr(s, n);
                  if (!e)
                    throw new Error(
                      `Could not find an end component comment for '${t}'`
                    );
                  return {
                    type: r,
                    sequence: i,
                    descriptor: o,
                    start: t,
                    prerenderId: s,
                    end: e,
                  };
                }
                return { type: r, sequence: i, descriptor: o, start: t };
              }
            })(r, n, e);
        }
      } catch (e) {
        throw new Error(
          `Found malformed component comment at ${n.textContent}`
        );
      }
    }
  }
  function nr(e, t) {
    for (; t.next() && t.currentElement; ) {
      const n = t.currentElement;
      if (n.nodeType !== Node.COMMENT_NODE) continue;
      if (!n.textContent) continue;
      const r = er.exec(n.textContent),
        o = r && r[1];
      if (o) return rr(o, e), n;
    }
  }
  function rr(e, t) {
    const n = JSON.parse(e);
    if (1 !== Object.keys(n).length)
      throw new Error(`Invalid end of component comment: '${e}'`);
    const r = n.prerenderId;
    if (!r)
      throw new Error(
        `End of component comment must have a value for the prerendered property: '${e}'`
      );
    if (r !== t)
      throw new Error(
        `End of component comment prerendered property must match the start comment prerender id: '${t}', '${r}'`
      );
  }
  class or {
    constructor(e) {
      (this.childNodes = e), (this.currentIndex = -1), (this.length = e.length);
    }
    next() {
      return (
        this.currentIndex++,
        this.currentIndex < this.length
          ? ((this.currentElement = this.childNodes[this.currentIndex]), !0)
          : ((this.currentElement = void 0), !1)
      );
    }
  }
  class ir {
    constructor(e, t, n, r, o) {
      (this.type = e),
        (this.start = t),
        (this.end = n),
        (this.sequence = r),
        (this.descriptor = o);
    }
    toRecord() {
      return {
        type: this.type,
        sequence: this.sequence,
        descriptor: this.descriptor,
      };
    }
  }
  class sr {
    constructor(e, t, n, r, o, i, s) {
      (this.id = sr.globalId++),
        (this.type = e),
        (this.assembly = r),
        (this.typeName = o),
        (this.parameterDefinitions = i),
        (this.parameterValues = s),
        (this.start = t),
        (this.end = n);
    }
  }
  sr.globalId = 1;
  class ar {
    constructor() {
      this.afterStartedCallbacks = [];
    }
    async importInitializersAsync(e, t) {
      await Promise.all(
        e.map((e) =>
          (async function (e, n) {
            const r = (function (e) {
                const t = document.baseURI;
                return t.endsWith('/') ? `${t}${e}` : `${t}/${e}`;
              })(n),
              o = await import(r);
            if (void 0 === o) return;
            const { beforeStart: i, afterStarted: s } = o;
            return s && e.afterStartedCallbacks.push(s), i ? i(...t) : void 0;
          })(this, e)
        )
      );
    }
    async invokeAfterStartedCallbacks(e) {
      await C, await Promise.all(this.afterStartedCallbacks.map((t) => t(e)));
    }
  }
  let cr,
    lr = !1,
    hr = !1;
  async function ur(e) {
    if (hr) throw new Error('Blazor has already started.');
    hr = !0;
    const t = (function (e) {
        const t = { ...qn, ...e };
        return (
          e &&
            e.reconnectionOptions &&
            (t.reconnectionOptions = {
              ...qn.reconnectionOptions,
              ...e.reconnectionOptions,
            }),
          t
        );
      })(e),
      n = await (async function (e) {
        const t = await fetch('_blazor/initializers', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache',
          }),
          n = await t.json(),
          r = new ar();
        return await r.importInitializersAsync(n, [e]), r;
      })(t),
      r = new zn(t.logLevel);
    (Ve.reconnect = async (e) => {
      if (lr) return !1;
      const n = e || (await dr(t, r, s));
      return (await s.reconnect(n))
        ? (t.reconnectionHandler.onConnectionUp(), !0)
        : (r.log(
            jn.Information,
            'Reconnection attempt to the circuit was rejected by the server. This may indicate that the associated state is no longer available on the server.'
          ),
          !1);
    }),
      (Ve.defaultReconnectionHandler = new Xn(r)),
      (t.reconnectionHandler =
        t.reconnectionHandler || Ve.defaultReconnectionHandler),
      r.log(jn.Information, 'Starting up Blazor server-side application.');
    const o = (function (e, t) {
        return (function (e) {
          const t = Zn(e, 'server'),
            n = [];
          for (let e = 0; e < t.length; e++) {
            const r = t[e],
              o = new ir(r.type, r.start, r.end, r.sequence, r.descriptor);
            n.push(o);
          }
          return n.sort((e, t) => e.sequence - t.sequence);
        })(e);
      })(document),
      i = Qn(document),
      s = new Jn(o, i || '');
    Ve._internal.navigationManager.listenForNavigationEvents(
      (e, t, n) => cr.send('OnLocationChanged', e, t, n),
      (e, t, n, r) => cr.send('OnLocationChanging', e, t, n, r)
    ),
      (Ve._internal.forceCloseConnection = () => cr.stop()),
      (Ve._internal.sendJSDataStream = (e, t, n) =>
        (function (e, t, n, r) {
          setTimeout(async () => {
            let o = 5,
              i = new Date().valueOf();
            try {
              const s = t instanceof Blob ? t.size : t.byteLength;
              let a = 0,
                c = 0;
              for (; a < s; ) {
                const l = Math.min(r, s - a),
                  h = await Je(t, a, l);
                if ((o--, o > 1))
                  await e.send('ReceiveJSDataChunk', n, c, h, null);
                else {
                  if (!(await e.invoke('ReceiveJSDataChunk', n, c, h, null)))
                    break;
                  const t = new Date().valueOf(),
                    r = t - i;
                  (i = t), (o = Math.max(1, Math.round(500 / Math.max(1, r))));
                }
                (a += l), c++;
              }
            } catch (t) {
              await e.send('ReceiveJSDataChunk', n, -1, null, t.toString());
            }
          }, 0);
        })(cr, e, t, n));
    const a = await dr(t, r, s);
    if (!(await s.startCircuit(a)))
      return void r.log(jn.Error, 'Failed to start the circuit.');
    let c = !1;
    const l = () => {
      if (!c) {
        const e = new FormData(),
          t = s.circuitId;
        e.append('circuitId', t),
          (c = navigator.sendBeacon('_blazor/disconnect', e));
      }
    };
    (Ve.disconnect = l),
      window.addEventListener('unload', l, { capture: !1, once: !0 }),
      r.log(jn.Information, 'Blazor server-side application started.'),
      n.invokeAfterStartedCallbacks(Ve);
  }
  async function dr(t, n, r) {
    var o, i;
    const s = new Cn();
    s.name = 'blazorpack';
    const a = new Wt().withUrl('_blazor').withHubProtocol(s);
    t.configureSignalR(a);
    const c = a.build();
    c.on('JS.AttachComponent', (e, t) =>
      (function (e, t, n, r) {
        let o = de[0];
        o || ((o = new se(0)), (de[0] = o)),
          o.attachRootComponentToLogicalElement(n, t, !1);
      })(0, r.resolveElement(t), e)
    ),
      c.on('JS.BeginInvokeJS', e.jsCallDispatcher.beginInvokeJSFromDotNet),
      c.on('JS.EndInvokeDotNet', e.jsCallDispatcher.endInvokeDotNetFromJS),
      c.on('JS.ReceiveByteArray', e.jsCallDispatcher.receiveByteArray),
      c.on('JS.BeginTransmitStream', (t) => {
        const n = new ReadableStream({
          start(e) {
            c.stream('SendDotNetStreamToJS', t).subscribe({
              next: (t) => e.enqueue(t),
              complete: () => e.close(),
              error: (t) => e.error(t),
            });
          },
        });
        e.jsCallDispatcher.supplyDotNetStream(t, n);
      });
    const l = Hn.getOrCreate(n);
    c.on('JS.RenderBatch', (e, t) => {
      n.log(
        jn.Debug,
        `Received render batch with id ${e} and ${t.byteLength} bytes.`
      ),
        l.processBatch(e, t, c);
    }),
      c.on(
        'JS.EndLocationChanging',
        Ve._internal.navigationManager.endLocationChanging
      ),
      c.onclose(
        (e) =>
          !lr &&
          t.reconnectionHandler.onConnectionDown(t.reconnectionOptions, e)
      ),
      c.on('JS.Error', (e) => {
        (lr = !0), pr(c, e, n), kn();
      });
    try {
      await c.start(), (cr = c);
    } catch (e) {
      if ((pr(c, e, n), 'FailedToNegotiateWithServerError' === e.errorType))
        throw e;
      kn(),
        e.innerErrors &&
          (e.innerErrors.some(
            (e) =>
              'UnsupportedTransportError' === e.errorType &&
              e.transport === lt.WebSockets
          )
            ? n.log(
                jn.Error,
                'Unable to connect, please ensure you are using an updated browser that supports WebSockets.'
              )
            : e.innerErrors.some(
                (e) =>
                  'FailedToStartTransportError' === e.errorType &&
                  e.transport === lt.WebSockets
              )
            ? n.log(
                jn.Error,
                'Unable to connect, please ensure WebSockets are available. A VPN or proxy may be blocking the connection.'
              )
            : e.innerErrors.some(
                (e) =>
                  'DisabledTransportError' === e.errorType &&
                  e.transport === lt.LongPolling
              ) &&
              n.log(
                jn.Error,
                'Unable to initiate a SignalR connection to the server. This might be because the server is not configured to support WebSockets. For additional details, visit https://aka.ms/blazor-server-websockets-error.'
              ));
    }
    return (
      (null ===
        (i =
          null === (o = c.connection) || void 0 === o ? void 0 : o.features) ||
      void 0 === i
        ? void 0
        : i.inherentKeepAlive) &&
        n.log(
          jn.Warning,
          'Failed to connect via WebSockets, using the Long Polling fallback transport. This may be due to a VPN or proxy blocking the connection. To troubleshoot this, visit https://aka.ms/blazor-server-using-fallback-long-polling.'
        ),
      e.attachDispatcher({
        beginInvokeDotNetFromJS: (e, t, n, r, o) => {
          c.send(
            'BeginInvokeDotNetFromJS',
            e ? e.toString() : null,
            t,
            n,
            r || 0,
            o
          );
        },
        endInvokeJSFromDotNet: (e, t, n) => {
          c.send('EndInvokeJSFromDotNet', e, t, n);
        },
        sendByteArray: (e, t) => {
          c.send('ReceiveByteArray', e, t);
        },
      }),
      c
    );
  }
  function pr(e, t, n) {
    n.log(jn.Error, t), e && e.stop();
  }
  (Ve.start = ur),
    document &&
      document.currentScript &&
      'false' !== document.currentScript.getAttribute('autostart') &&
      ur();
})();
