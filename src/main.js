(function() {
  if (document.getElementById('mangaimg')) {
    document.onkeydown = function(e) {
      if (e.keyCode === 39) {
        location += '/1';
      }
    }
  }

  var imgholder = document.getElementById('imgholder');

  if (!imgholder) {
    return;
  }

  var selected = false;
  var queue = Array.prototype.map.call(document.querySelectorAll('#pageMenu option'), function(option) {
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
  var a = document.body.querySelector('#imgholder a');
  var _parts = location.pathname.match(/(.+?)\/(\d+)(?:\/\d+)?$/);
  var baseUrl = _parts[1];
  var chapter = _parts[2] * 1;
  var prevUrl = chapter === 1 ? baseUrl : [baseUrl, (chapter - 1)].join('/');
  var nextUrl = [baseUrl, (chapter + 1)].join('/');

  a.setAttribute('href', nextUrl);
  document.querySelector('navi')

  document.onkeydown = function(e) {
    if (e.keyCode === 37) {
      location = prevUrl;
    } else if (e.keyCode === 39) {
      location = nextUrl;
    }
  }

  var img;

  function next() {
    var xhr = new XMLHttpRequest();
    var url = queue.shift();

    xhr.open('GET', location.origin + url);
    xhr.onload = function() {
      if (xhr.status !== 200) {
        console.error(xhr.status);

        return;
      }

      var body = document.implementation.createHTMLDocument().body;

      body.innerHTML = xhr.responseText;

      img = body.querySelector('#imgholder img');

      a.appendChild(img);

      test();
    }

    xhr.send();
  }

  function test() {
    if (!img) {
      return;
    }

    if (document.body.scrollTop >= img.offsetTop - window.innerHeight) {
      next();
    }
  }

  document.onscroll = test;

  next();
})();