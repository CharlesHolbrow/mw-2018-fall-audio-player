const path = require('path');
const fs = require('fs');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require('express');


// write to cdb.content for persistence between restarts
const cdb = require('./server/cdb');

// global vars
let audioFilenames = [];

////////////////////////////////////////////////////////////////////////////////
//
// Periodically update audioFilenames
setInterval(()=> {
  fs.readdir(path.join(__dirname, 'audio'), (err, files) => {
    // Log and abort if there was an error reading files
    if (err) {
      console.log('error reading audio dir:', err);
      return;
    }

    // get only names with audio file extensions
    files = files.filter((fn) => {
      fn = fn.toLowerCase()
      return fn.endsWith('.wav') || fn.endsWith('.mp3');
    });

    // Log if the number of files changed
    if (files.length !== audioFilenames.length) {
      console.log(`There are ${files.length} audio files`, files);
    }
    // stick the filenames in a global variable
    audioFilenames = files;
  });
}, 500);

////////////////////////////////////////////////////////////////////////////////
//
// Setup Express
const app = express();

// Make cookes available as json to method handlers
app.use(cookieParser());
app.use(bodyParser.json());

// give every request a random audio filename
app.use(function(req, res, next){
  if (audioFilenames.length) {
    const fns = audioFilenames;
    const fn = fns[Math.floor(Math.random()*fns.length)]
    res.cookie('audiofile', fn);
  }
  next();
});

app.use('/audio', express.static(path.join(__dirname, 'audio')));
app.use('/', express.static(path.join(__dirname, 'static')));

// 
app.post('/playing', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ok: true}));
  
  console.log('post to /playing:', req.body);
  const audiofile = req.body.playing;
  const time = req.body.time;
  if (!cdb.ready) return;
  if (typeof audiofile !== 'string' || audiofile.length > 128) return;
  if (typeof time !== 'number') return;
  if (!cdb.content.files) cdb.content.files = {};
  if (!cdb.content.files[audiofile]) cdb.content.files[audiofile] = {
    playData: {},
  };

  const dbInfo = cdb.content.files[audiofile];
  if (typeof dbInfo.playData[time] !== 'number') {
    dbInfo.playData[time] = 1;
  } else {
    dbInfo.playData[time]++;
  }

});

const server = app.listen(3000, '127.0.0.1');
