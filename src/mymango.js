'use strict'

;(function init() {
  if (/^\/\/?read-online/.test(location.pathname)) {
    initReader()
  }
})()

function initReader() {
  let urls = map(x => (x ? x.href : null), {
    prev: document.querySelector('div.nav_chapter a.left'),
    next: document.querySelector('div.nav_chapter a.right'),
  })
  let imgs = document.querySelectorAll('#divImage img')

  c.debug('reader', {urls, imgs})

  if (urls.next) {
    Array.from(imgs).forEach((img) => {
      let link = document.createElement('a')
      link.setAttribute('href', urls.next)

      img.parentNode.insertBefore(link, img)
      link.appendChild(img)
    })
  }

  document.addEventListener('keydown', (e) => {
    changeChapter(urls[{37: 'prev', 39: 'next'}[e.keyCode]])
  }, false)
}

function changeChapter(url) {
  if (!url) {
    return
  }
  location.href = url
}
