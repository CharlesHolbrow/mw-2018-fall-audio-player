Slightly hacky demo buit for member's week fall 2018.

This illustrates how a server can show realtime analytics of audio playback.

There are a few html enpoints:

- `GET /play/:audiofile` html audio player of a specific file
- `GET /` same as `/play/:audiofile`, but selects a random file
- `GET /stats` realtime updating html5 chart.js show's playback statistics

**A quick note about cdb**

`cdb` (short for crapDB) is a minimal tool for persistence between server restarts. It writes the contents of a json object to to `./db.json` at a regular interval. This file is automatically loaded into the `cdb.content` object when the server starts. 
