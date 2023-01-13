/*! pushbroom.c0 0.0.1 */
;(async function (window, document, host) {
  const loc = window.location
  let prev
  host = host[0] === '{' ? 'analytics.' + loc.hostname : host
  // host = host[0] === '{' ? 'localhost:5174' : host
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
    // tm = 'timing',
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
          resolve(xhr.response)
        }
      }
      xhr.open('GET', url)
      xhr.send()
    })
  }

  // const perf = window.performance
  const screen = window.screen

  const url = 'https://' + host
  // const url = 'http://' + host
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

    // set data package
    data = {
      r: document.referrer,
      w: screen.width,
      p: loc.href,
    }

    data.r ? data.r = data.r : data.r = prev
    let h = loc.hostname
    let p = loc.pathname

    await Promise.all([
      send(url + cache + h).then(u => {
        console.log(u)
        data.u = u
      })
    ])
    prev = data.p
    send(url + '/hello?' + params(data), true).then(r => {
      window.vid = r
    })
  }

  document[ael]('visibilitychange', () => {
    document.hidden ? add() : (snapshot = now())
  })

  const sendDuration = async () => {
    if (window[disable]) {
      return
    }
    !document.hidden ? add() : null
    await beacon(url + '/duration', { d: duration, v: vid })
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
        v: vid,
        d: duration
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
