/*! pushbroom.c0 0.0.1 */

;(async function (window, document, host) {
  const loc = window.location
  host = host[0] === '{' ? 'analytics.' + loc.hostname : host
  console.log(host)
  const nav = window.navigator

  // Kill requests from bots and spiders
  if (nav.userAgent.search(/(bot|spider|crawl)/gi) > -1) {
    return
  }

  const disable = 'disablePushbroom',
    ael = 'addEventListener',
    rel = 'removeEventListener',
    cache = '/cache?',
    ps = 'pushState',
    sb = 'sendBeacon',
    tm = 'timing',
    ls = 'localStorage',
    ci = 'Pushbroom is',
    blocked = ['unblocked', 'blocked'],
    dce = 'data-pushbroom-event',
    log = console.log

  const block = viaPage => {
    let b = parseFloat(window[ls].getItem(blocked[1]))
    b &&
      viaPage &&
      log(
        ci +
          ' blocked on ' +
          loc.hostname +
          ' - Use pushbroom.blockMe(0) to unblock'
      )
    return b
  }

  const send = (url, viaPage) => {
    if (block(viaPage)) {
      return new Promise(resolve => resolve())
    }
    const xhr = new XMLHttpRequest()
    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          resolve(parseFloat(xhr.response))
        }
      }
      xhr.open('GET', url)
      xhr.send()
    })
  }

  const perf = window.performance
  const screen = window.screen

  const url = 'https://' + host // Should always be https://, only http:// for local testing
  const now = () => Date.now()
  const add = () => (duration += now() - snapshot)

  const params = data =>
    Object.keys(data)
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&')

  const beacon = (url, data) => {
    if (block()) {
      return
    }
    if (nav[sb]) {
      nav[sb](url, JSON.stringify(data))
    } else {
      return send(`${url}?${params(data)}`)
    }
  }

  let start, snapshot, duration, data

  const pageview = async () => {
    if (window[disable]) {
      delete window[disable]
      return
    }
    delete window[disable]

    start = now()
    snapshot = start
    duration = 0

    // Get the load time
    let time =
      perf && perf[tm]
        ? perf[tm].domContentLoadedEventEnd - perf[tm].navigationStart
        : 0

    // set data package
    data = {
      r: document.referrer,
      w: screen.width,
      s: 0, // temporary placeholder
      t: time > 0 ? time : 0,
      p: loc.href,
    }

    let h = loc.hostname
    let p = loc.pathname

    await Promise.all([
      send(url + cache + h).then(u => {
        data.u = u
      }),
      send(url + cache + h + p).then(up => {
        data.up = up
      }),
    ])

    send(url + '/hello?' + params(data), true)
  }

  document[ael]('visibilitychange', () => {
    document.hidden ? add() : (snapshot = now())
  })

  const sendDuration = async () => {
    if (window[disable]) {
      return
    }
    !document.hidden ? add() : null
    await beacon(url + '/duration', { d: duration, n: start, p: loc.href })
  }
  // log the pageview duration
  window[ael]('beforeunload', sendDuration)

  let _pushState = function (type) {
    let original = history[type]
    return function () {
      let r = original.apply(this, arguments),
        e
      if (typeof Event == 'function') {
        e = new Event(type)
      } else {
        e = doc.createEvent('Event')
        e.initEvent(type, true, true)
      }
      e.arguments = arguments
      window.dispatchEvent(e)
      return r
    }
  }

  window.history[ps] = _pushState(ps)
  window[ael](ps, () => {
    sendDuration()
    pageview()
  })

  let listener = e => pushbroom.event(e.target.getAttribute(dce))

  // add global object for capturing events
  window.pushbroom = {
    async event(value, callback) {
      add()
      const data = {
        e: value,
        p: loc.href,
        d: duration,
        n: start,
      }
      await beacon(url + '/event', data)
      callback && callback()
    },
    initEvents() {
      document.querySelectorAll('[' + dce + ']').forEach(item => {
        item[rel]('click', listener)
        item[ael]('click', listener)
      })
    },
    blockMe(v) {
      v = v ? 1 : 0
      window[ls].setItem(blocked[1], v)
      log(ci + ' now ' + blocked[v] + ' on ' + loc.hostname)
    },
  }
  pageview()
  pushbroom.initEvents()
})(window, document, '{{.Host}}')
