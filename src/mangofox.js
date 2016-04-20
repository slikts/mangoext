'use strict'

;(function init() {
  if (document.querySelector('#chapters')) {
    initChapterList()
  } else if (document.querySelector('#viewer')) {
    initReader()
  }
})()

function initChapterList() {
  c.log('chapter list')
}

let parsedPath = (function parsePath() {
  let match = location.pathname.match(/\/manga\/(.+?)\/(.+)\/(\d+)/)
  let [,name, chapter, page] = match || []

  return {name, chapter, page}
})()

function makeUrl(path) {
  path = Object.assign({}, parsedPath, path)

  return `manga/${path.name}/${path.chapter}/${path.page}.html`
}

function observeChapters(chapterSelect, callback) {
  function getChapters(paths) {
    let i = paths.indexOf(parsedPath.chapter)


    let chapters = fromPairs(
      [['prev', -1], ['next', 1]]
        .map(([k, v]) => [k, makeUrl({chapter: paths[i + v], page: 1})])
    )
    let basePath = `manga/${parsedPath.name}/`
    if (!~i) {
      c.error('bad chapter')
    }
    if (i === 0 || !~i) {
      chapters.prev = basePath
    }
    if (i === paths.length - 1 || !~i) {
      chapters.next = basePath
    }

    return chapters
  }

  let observer = new MutationObserver(mutations => callback(getChapters(
    pluck('addedNodes')(mutations)
      .map(unary(Array.from))
      .map(pluck('value'))
      .reduce(flatten)
  )))
  observer.observe(chapterSelect, {childList: true})
}

function getPages() {
  let pageSelect = document.querySelector('div.r.m select')

  return {
    total: Array.from(pageSelect.querySelectorAll('option')).length,
    current: +pageSelect.options[pageSelect.selectedIndex].value,
  }
}

var queue
var imgLink = document.querySelector('#viewer a')
function chaptersReady(chapters) {
  c.debug('chapters', chapters)
  document.addEventListener('keydown', partial(changeChapter, chapters), false)

  imgLink.setAttribute('href', chapters.next || '#')
  imgLink.removeAttribute('onclick')
  imgLink.onclick = () => location.pathname = chapters.next

  let pages = getPages()
  c.debug('pages', pages)

  queue = buildPageQueue(pages)
  c.debug('page queue', queue)

  next()

  document.addEventListener('scroll', scrollUpdate, false)
}

function initReader() {
  observeChapters(document.querySelector('#top_chapter_list'), chaptersReady)
}

function buildPageQueue({total, current}) {
  let baseUrl = location.href.replace(/\d+\.html/, '')

  let queue = Array(total).fill().map((x, i) => ({
    url: `${baseUrl}${i}.html`,
    placeholder: (() => {
      let el = document.createElement('div')
      el.classList.add('__img_placeholder__')
      el.setAttribute('data-i', i)

      return el
    })()
  })).slice(current + 1)

  queue.forEach(({placeholder}) => imgLink.appendChild(placeholder))

  return queue
}

function changeChapter(chapters, e) {
  switch (e.keyCode) {
  case 37:
    location.pathname = chapters.prev
    break
  case 39:
    location.pathname = chapters.next
  }
}

function getImg(ctx) {
  return ctx.querySelector('#viewer img')
}
var images = [getImg(document)]

function loadImg({placeholder, url}, fn) {
  let xhr = new XMLHttpRequest()
  let _c = c('xhr')

  xhr.open('GET', url)
  xhr.onload = function() {
    if (xhr.status !== 200) {
      _c.error(xhr.status)

      return
    }

    let responseBody = document.implementation.createHTMLDocument().body
    responseBody.innerHTML = xhr.responseText

    let img = getImg(responseBody)
    images.push(img)
    _c.debug('img', img.src)
    fn(img, placeholder)
  }

  xhr.send()
}

var loading = 0
function next() {
  if (loading > 0 || !queue.length) {
    return
  }

  c.debug('next, loading', loading)
  loading += 1
  loadImg(queue.shift(), (img, placeholder) => {
    loading -= 1
    placeholder.appendChild(img)
  })
}

function scrollUpdate() {
  if (document.body.scrollTop + 500 >= last(images).offsetTop - window.innerHeight) {
    next()
  }
}
