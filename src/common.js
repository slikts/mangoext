'use strict'

var fromPairs = pairs => pairs.reduce((x, [k, v]) => { x[k] = v; return x }, {})
var partial = (fn, ...args) => ((...newArgs) => fn(...args, ...newArgs))
var pluck = key => (list => list.map(x => x[key]))
var unary = (fn) => (x => fn(x))
var flatten = (sum, x) => sum.concat(x)
var values = (obj) => Object.keys(obj).map(key => obj[key])
var zip = (a, b) => a.map((x, i) => [x, b[i]])
var pairs = obj => zip(Object.keys(obj), values(obj))
var map = (fn, obj) => fromPairs(pairs(obj).map(([k, v]) => [k, fn(v)]))
var last = list => list[list.length - 1]

var classname = (name) => `${chrome.runtime.id}_${name}`

let manifest = chrome.runtime.getManifest()

function c(x) {
  return map(fn => partial(fn, x), c)
}

Object.assign(c, fromPairs(['log', 'error', 'debug', 'info'].map(x => [x, partial((method, ...args) => {
  console[method](manifest.name, ...args)

  return args
}, x)])))

c.log(manifest.version)

function load(url, fn, xhrHeader = false) {
  let xhr = new XMLHttpRequest()
  let _c = c('xhr')

  xhr.open('GET', url)
  if (xhrHeader) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
  }
  xhr.onload = function() {
    if (xhr.status !== 200) {
      _c.error(xhr.status)

      return
    }

    _c.debug('loaded', url)

    let responseBody = document.implementation.createHTMLDocument().body
    responseBody.innerHTML = xhr.responseText

    fn(responseBody)
  }

  xhr.send()
}
