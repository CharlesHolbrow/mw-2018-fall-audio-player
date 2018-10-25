const fs = require('fs');
////////////////////////////////////////////////////////////////////////////////
//
// cdb - the crap data base
//
// This is a hacky way to implement persistence using the filesystem.
const cdb = {content: null};

// Read the db form the filesystem on load
fs.readFile('db.json', 'utf8', (err, data) => {
  if (err) {
    console.log('failed to read db.json:', e);
    cdb.content = {};
  } else {
    try {
      cdb.content = JSON.parse(data);
      console.log('loaded db.json');
    } catch(e) {
      cdb.content = {};
      console.log('failed to parse db.json');
    }
  }
  cdb.ready = true;
});

// Periodically write the DB to disk
setInterval(() => {
  if (!cdb.content || !Object.keys(cdb.content).length) return; // do nothign if it's empty
  fs.writeFile('./db.json', JSON.stringify(cdb.content), 'utf8', (err) => {
    if (err) return console.error('Failed to write db:', err);
  });
}, 1500);

module.exports = cdb;
