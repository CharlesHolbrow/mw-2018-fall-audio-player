// get all audio files. cb takes an err and the array
window.allAudiofiles = function(cb){
  var req = new XMLHttpRequest();
  req.open('GET', '/all/audiofiles', true);
  req.addEventListener('load', function(){
    var result, error;
    try {
      result = JSON.parse(this.response);
    } catch (e){
      error = e;
    }
    cb(error, result);
  });
  req.addEventListener('error', function(event){
    cb(event, null);
  })
  req.send();
}

window.removeAllChildren = function(node){
  while (node.firstChild) node.removeChild(node.firstChild);
}

// trim off the final . file extension
var trimAudiofile = function(audiofile){
  var parts = audiofile.split('.');
  var name;
  if (parts.length === 1)  name = audiofile;
  else name = parts.slice(0, parts.length-1).join('.')
  return name;
}

var currentAudiofiles = [];
var updateNames = function(){
  allAudiofiles(function(err, files){
    if (err) return console.log('error getting audio files:', err);

    if (_.isEqual(files, currentAudiofiles)) return;
    currentAudiofiles = files;

    var el = document.getElementById('links');
    if (!el) return;

    console.log(files);
    removeAllChildren(el)
    for (let audiofile of files) {
      var li = document.createElement('li')
      var link = document.createElement('a')
      li.appendChild(link);
      el.appendChild(li);
      link.href = '/play/'+audiofile;
    
      link.innerText = trimAudiofile(audiofile);
    }
  })
};

setInterval(updateNames, 400);