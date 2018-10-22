var audioElement = window.ae = document.getElementById('a0');

function getCookie(cookiename) {
  var cookiestring=RegExp(""+cookiename+"[^;]+").exec(document.cookie);
  return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./,"") : "");
}

// Get a random audio file from the server
var audiofile = getCookie('audiofile');
console.log('audiofile:', audiofile);
audioElement.src = '/audio/' + audiofile;
audioElement.load();

// post a message to the server
var send = function(data) {
  var req = new XMLHttpRequest();
  req.open('POST', '/playing', true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
      } else {
        console.log('send req fail:', this);
      }
    }
  };
  
  data.playing = audiofile

  req.send(JSON.stringify(data)); 
};


// Keep track of that the audio element is going. The event listeners below
// assume that there are never two consecutive plays.
let lastSend = null;
let interval = null;

// While playing, send updates every second
audioElement.addEventListener('play', function(){
  console.log('play');
  clearInterval(interval);

  // wrap send function
  var s = () => {
    var time = Math.floor(this.currentTime);
    lastSend = time;
    send({ time });
    console.log('playing', time);
  };

  s();

  // every 50 ms, check if we can send an update
  interval = setInterval(() => {
    if (!this.paused && (this.currentTime - lastSend) > 1) s();
  }, 50);
});

audioElement.addEventListener('pause', function(){
  lastSend = null;
  clearInterval(interval);
});
