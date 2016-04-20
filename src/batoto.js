'use strict'

;(function init() {
  if (/^\/comic\//.test(location.pathname)) {
    initChapterList()
  } else if (/^\/reader/.test(location.pathname)) {
    observeReader()
  }
})()

function initChapterList() {
  c.log('chapter list')
}

function observeReader() {
  let observer = new MutationObserver(initReader)
  observer.observe(reader, {childList: true})
}

function getChapters(reader) {
  let select = reader.querySelector('select[name=chapter_select]')
  let paths = Array.from(select.options).map(x => x.value)

  let chapters = fromPairs(
    [['prev', 1], ['next', -1], ['current', 0]]
      .map(([k, v]) => [k, paths[select.selectedIndex + v]])
  )

  let listLink = reader.querySelector('div.moderation_bar a').getAttribute('href')

  ;['prev', 'next'].forEach(x => {
    if (!chapters[x]) {
      chapters[x] = listLink
    }
  })

  return chapters
}


function getQueue(reader) {
  let select = reader.querySelector('select[name=page_select]')

  return Array.from(select.options)
    .map(x => x.value)
    .slice(select.selectedIndex + 1)
    .map(x => {
      let [, id, p] = x.match(/#(.+?)_(\d+)/)
      let url = `/areader?id=${id}&p=${p}`

      return {
        id, p, url,
        placeholder: (() => {
          let el = document.createElement('div')
          el.classList.add(classname('placeholder'))
          el.setAttribute('data-url', url)

          return el
        })(),
      }
    })
}

function getImg(ctx) {
  return ctx.querySelector('#comic_page')
}

var global = {}
function setGlobal(reader) {
  global = {
    chapters: getChapters(reader),
    images: [getImg(reader)],
    queue: getQueue(reader),
    init: true,
  }
}

function fixLink() {
  let imgLink = global.images[0].parentNode

  imgLink.setAttribute('href', global.chapters.next || '#')
  imgLink.removeAttribute('onclick')
  imgLink.addEventListener('click', (e) => {
    e.stopPropagation()
    changeChapter('next')
  }, true)

  global.queue.forEach(({placeholder}) => imgLink.appendChild(placeholder))
}

function initReader(mutations) {
  if (global.init) {
    return
  }

  let reader = document.querySelector('#reader')

  if (global.init === false) {
    scrollTo(document.body.scrollLeft, reader.offsetTop)
  }

  setGlobal(reader)
  c.debug('init reader', {global, reader, mutations})

  fixLink()

  next()
}

document.addEventListener('keydown', (e) => {
  e.stopPropagation()
  changeChapter({
    37: 'prev',
    39: 'next',
  }[e.keyCode])
}, true)
document.addEventListener('scroll', scrollUpdate, false)

function changeChapter(key) {
  let url = global.chapters[key]
  if (key && !url) {
    c.error('no chapter data')

    return
  }
  if (url) {
    c.debug('change chapter', url)
    global = {init: false}
    location.href = url
  }
}

var loading = 0
function next() {
  let loadLimit = 1
  if (!global.init || loading >= loadLimit || !global.queue.length) {
    return
  }

  let item = global.queue.shift()
  let chapter = global.chapters.current
  loading += 1
  let loadingClass = classname('loading')
  item.placeholder.classList.add(loadingClass)
  c.debug(`loading (${loading}/${loadLimit})`, item.url)
  load(item.url, responseBody => {
    loading -= 1
    if (!global.init || global.chapters.current !== chapter) {
      c.debug('img discarded', item.url)

      scrollUpdate()
      return
    }
    let img = getImg(responseBody)
    item.placeholder.appendChild(img)
    global.images.push(img)
    item.placeholder.classList.remove(loadingClass)
    scrollUpdate()
  })
}

function scrollUpdate() {
  if (global.init && document.body.scrollTop >= last(global.images).parentNode.offsetTop - window.innerHeight * 3) {
    next()
  }
}
