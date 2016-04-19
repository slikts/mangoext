'use strict';


(function init() {
  if (document.querySelector('#mangaimg')) {
    initChapterList();
  } else if (document.querySelector('#imgholder')) {
    initReader();
  }
})();

function initChapterList() {
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === 39) {
      window.location += '/1';
    }
  }, false);
}

function initReader() {
  var imgLink = document.body.querySelector('#imgholder a');
  var chapter = getChapterLinks();

  initPageLoading(imgLink);
  initChapterNav(imgLink, chapter);
}

function getNextPages() {
  var selected = false;

  return Array.prototype.map.call(document.querySelectorAll('#pageMenu option'), function(option) {
    if (!selected) {
      if (option.selected) {
        selected = true;
      }

      return null;
    }

    return option.value;
  }).filter(function(x) {
    return x !== null;
  });
}

function getChapterLinks() {
  var pathParts = window.location.pathname.match(/(.+?)\/(\d+)(?:\/\d+)?$/);
  var baseUrl = pathParts[1];
  var num = pathParts[2] * 1;

  return {
    num: num,
    base: baseUrl.replace('/', ''),
    prev: num === 1 ? baseUrl : [baseUrl, (num - 1)].join('/'),
    next: [baseUrl, (num + 1)].join('/')
  };
}

function changeChapter(chapters, e) {
  switch (e.keyCode) {
    case 37:
      window.location = chapters.prev;
      break;
    case 39:
      window.location = chapters.next;
  }
}

function loadNextPage(queue, imgLink, scrollUpdate) {
  var xhr = new XMLHttpRequest();
  var url = queue.shift();

  xhr.open('GET', window.location.origin + url);
  xhr.onload = function() {
    if (xhr.status !== 200) {
      console.error(xhr.status);

      return;
    }

    var responseBody = document.implementation.createHTMLDocument().body;

    responseBody.innerHTML = xhr.responseText;
    imgLink.appendChild(responseBody.querySelector('#imgholder img'));
    scrollUpdate();
  };

  xhr.send();
}

function getLastImg() {
  return document.querySelector('#imgholder img:last-of-type');
}

function initChapterNav(imgLink, chapters) {
  var navi = document.querySelector('#navi');

  if (!navi) {
    return;
  }

  imgLink.setAttribute('href', chapters.next);

  navi.querySelector('.prev a').setAttribute('href', chapters.prev);
  navi.querySelector('.next a').setAttribute('href', chapters.next);

  document.addEventListener('keydown', changeChapter.bind(null, chapters), false);
}

function initPageLoading(imgLink) {
  var next = loadNextPage.bind(null, getNextPages(), imgLink, scrollUpdate);

  function scrollUpdate() {
    if (document.body.scrollTop >= getLastImg().offsetTop - window.innerHeight) {
      next();
    }
  }

  document.addEventListener('scroll', scrollUpdate, false);

  next();
}