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

    // check if files were removed
    if (cdb.ready && cdb.content && cdb.content.files) {
      for (let fn in cdb.content.files) { // for each file in cdb
        if (cdb.content.files.hasOwnProperty(fn)) { 
          if (!files.includes(fn)){       // check if that files is also in the new
            console.log(`remove ${fn} fromcdb`);
            delete cdb.content.files[fn]; // if not, remove
          }
        }
      }
    }

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
const EMPTY_OBJECT = {};

// Make cookes available as json to method handlers
// app.use(cookieParser());
app.use(bodyParser.json());

// give every request a random audio filename
app.use(function(req, res, next){
  if (req.path === '/' || req.path.split('/').length === 1) {
    if (audioFilenames.length) {
      const fns = audioFilenames;
      const fn = fns[Math.floor(Math.random()*fns.length)]
      res.cookie('audiofile', fn);
    }
  }
  next();
});

app.use('/audio', express.static(path.join(__dirname, 'audio')));
app.use('/', express.static(path.join(__dirname, 'static')));

// store the playback data in cdb
app.post('/playing', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ok: true}));
  
  console.log('post to /playing:', req.body);
  const audiofile = req.body.playing;
  const time = req.body.time;
  if (!cdb.ready) return;
  if (typeof audiofile !== 'string' || audiofile.length > 128 || EMPTY_OBJECT[audiofile]) return;
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

app.get('/play/:audiofile', function(req, res){
  res.cookie('audiofile', req.params.audiofile);
  res.sendFile(path.join(__dirname, 'static/index.html'));
});

app.get('/data/:audiofile', function(req, res){
  const audiofile = req.params.audiofile;
  if (typeof audiofile !== 'string' || audiofile.length > 128 || EMPTY_OBJECT[audiofile]) return;
  if (!cdb.ready) return;
  if (!cdb.content.files) cdb.content.files = {};

  const data = cdb.content.files[audiofile]
  if (!data) return res.status(404).send('Not found');
  
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
});

app.get('/alldata/', function(req,res){
  if (!cdb.ready) return res.status(503).send('not ready');
  if (!cdb.content || !cdb.content.files) return res.status(503).send('retry');
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(cdb.content.files));
});

app.get('/random/audiofile', function(req, res){
  if (audioFilenames.length) {
    res.setHeader('Content-Type', 'text/plain')
    res.end(audioFilenames[Math.floor(Math.random()*audioFilenames.length)]);
  } else {
    res.status(503).send('not ready');
  }
});

const server = app.listen(3000, '127.0.0.1');
