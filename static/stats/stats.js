var ctx = document.getElementById("myChart").getContext('2d');


// get data for a song
var get = function(audiofile, cb) {
  var req = new XMLHttpRequest();
  req.open('GET', '/data/' + audiofile, true);
  // req.setRequestHeader('Content-Type', 'application/json');
  req.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        console.log('req ok');
      } else {
        console.log('send req fail:', this);
        cb(new Error('Failed to get song data:'+ this), null);
      }
    }
  };
  req.addEventListener('load', function(event){
    try {
      var result = JSON.parse(this.response);
      cb(null, result);
    } catch(e){
      cb(e, null)
    }
    console.log(this.response)
  });
  
  req.send(); 
};


// get data all files
var getAll = function(cb) {
  var req = new XMLHttpRequest();
  req.open('GET', '/alldata/', true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        console.log('req ok'); // call cb on load;
      } else {
        console.log('send req fail:', this);
        cb(new Error('Failed to get song data:'+ this), null);
      }
    }
  };
  req.addEventListener('load', function(event){
    try {
      var result = JSON.parse(this.response);
      cb(null, result);
    } catch(e){
      cb(e, null)
    }
  });
  
  req.send();
};

var colors = [
  '#004600',
  '#00aa00',
  '#00ff00',
  '#004080',
  '#006680',
  '#009080',
  '#00cc80',
  '#00ff80',
  '#0040b0',
  '#0066b0',
  '#0090b0',
  '#00ccb0',
  '#00ffb0',
  '#0040ff',
  '#0066ff',
  '#0090ff',
  '#00ccff',
  '#00ffff',
];

var options = {
  responsive: true,
  animation: {
    duration: 0,
  },
  responsiveAnimationDuration: 0,
  scales: {
    xAxes: [{
      display: true,
      type: 'linear',
      scaleLabel: {
        display: true,
        labelString: 'Seconds', // this is written underneath the x axis
      },
      ticks: {
        suggestedMin: 0,
        suggestedMax: 100,
      }
    }],
    yAxes: [{
      display: true,
      // type: 'linear',
      scaleLabel: {
        display: true,
        labelString: 'Playback frequency'
      },
      ticks: {
        suggestedMin: 0,
        suggestedMax: 7,
      }
    }],
  },
};

var lineChart = new Chart(ctx, {
  type: 'line',
  // labels: _.range(0, 7),
  data: {
    datasets: [
      {
        data: [
          {x:0, y:0},
          {x:1, y:1},
          {x:2, y:-3},
          {x:3, y:1}
        ],
      }
    ]
  },
  options: options
});

var update = function() {
  getAll(function(err, allSongs){
    // map to the format expected by chart.js
    var i = 0;
    var datasets = _(allSongs).map(function(song, audiofile){
      var dataset = {
        borderColor: colors[(i++) % colors.length],
        lineTension: 0,
        pointRadius: 0,
        fill: false,
        label: audiofile,
        data: _(song.playData).map(function(v, k){
          return {x: parseInt(k), y: v};
        }),
      };
      return dataset;
    });
    lineChart.data.datasets = datasets
    
    _(datasets).each(function(newDataset, dsIndex){
      const current = lineChart.data.datasets[dsIndex];
      debugger;
      if (current && current.label === newDataset.label) {
        newDataset.data.forEach(function(xy, i) {
          if (current.data[i]) current.data[i].y = xy.y;
          else current.data[i] = xy;
        });
        
        // current.data[2].y = Math.random() * 3;
      } else {
        lineChart.data.datasets[dsIndex] = newDataset;
      }
    });
    lineChart.update();
  });
};
update();
var interval = setInterval(update, 200);
