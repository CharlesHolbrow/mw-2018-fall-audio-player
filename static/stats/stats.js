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


// var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// var config = {
//   type: 'line',
//   data: {
//     labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//     datasets: [{
//       label: 'My First dataset',
//       backgroundColor: window.chartColors.red,
//       borderColor: window.chartColors.red,
//       data: [
//         randomScalingFactor(),
//         randomScalingFactor(),
//         randomScalingFactor(),
//         randomScalingFactor(),
//         randomScalingFactor(),
//         randomScalingFactor(),
//         randomScalingFactor()
//       ],
//       fill: false,
//     }, {
//       label: 'My Second dataset',
//       fill: false,
//       backgroundColor: window.chartColors.blue,
//       borderColor: window.chartColors.blue,
//       data: [
//         randomScalingFactor(),
//         randomScalingFactor(),
//         randomScalingFactor(),
//         randomScalingFactor(),
//         randomScalingFactor(),
//         randomScalingFactor(),
//         randomScalingFactor()
//       ],
//     }]
//   },
//   options: {
//     responsive: true,
//     title: {
//       display: true,
//       text: 'Chart.js Line Chart'
//     },
//     tooltips: {
//       mode: 'index',
//       intersect: false,
//     },
//     hover: {
//       mode: 'nearest',
//       intersect: true
//     },
    
//   }
// };

// window.onload = function() {
//   var ctx = document.getElementById('canvas').getContext('2d');
//   window.myLine = new Chart(ctx, config);
// };

// document.getElementById('randomizeData').addEventListener('click', function() {
//   config.data.datasets.forEach(function(dataset) {
//     dataset.data = dataset.data.map(function() {
//       return randomScalingFactor();
//     });

//   });

//   window.myLine.update();
// });

// var colorNames = Object.keys(window.chartColors);
// document.getElementById('addDataset').addEventListener('click', function() {
//   var colorName = colorNames[config.data.datasets.length % colorNames.length];
//   var newColor = window.chartColors[colorName];
//   var newDataset = {
//     label: 'Dataset ' + config.data.datasets.length,
//     backgroundColor: newColor,
//     borderColor: newColor,
//     data: [],
//     fill: false
//   };

//   for (var index = 0; index < config.data.labels.length; ++index) {
//     newDataset.data.push(randomScalingFactor());
//   }

//   config.data.datasets.push(newDataset);
//   window.myLine.update();
// });

// document.getElementById('addData').addEventListener('click', function() {
//   if (config.data.datasets.length > 0) {
//     var month = MONTHS[config.data.labels.length % MONTHS.length];
//     config.data.labels.push(month);

//     config.data.datasets.forEach(function(dataset) {
//       dataset.data.push(randomScalingFactor());
//     });

//     window.myLine.update();
//   }
// });

// document.getElementById('removeDataset').addEventListener('click', function() {
//   config.data.datasets.splice(0, 1);
//   window.myLine.update();
// });

// document.getElementById('removeData').addEventListener('click', function() {
//   config.data.labels.splice(-1, 1); // remove the label first

//   config.data.datasets.forEach(function(dataset) {
//     dataset.data.pop();
//   });

//   window.myLine.update();
// });


// var myChart = new Chart(ctx, {
//   type: 'bar',
//   data: {
//     labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
//     datasets: [{
//       label: '# of Votes',
//       data: [12, 19, 3, 5, 2, 3],
//       backgroundColor: [
//         'rgba(255, 99, 132, 0.2)',
//         'rgba(54, 162, 235, 0.2)',
//         'rgba(255, 206, 86, 0.2)',
//         'rgba(75, 192, 192, 0.2)',
//         'rgba(153, 102, 255, 0.2)',
//         'rgba(255, 159, 64, 0.2)'
//       ],
//       borderColor: [
//         'rgba(255,99,132,1)',
//         'rgba(54, 162, 235, 1)',
//         'rgba(255, 206, 86, 1)',
//         'rgba(75, 192, 192, 1)',
//         'rgba(153, 102, 255, 1)',
//         'rgba(255, 159, 64, 1)'
//       ],
//       borderWidth: 1
//     }]
//   },
//   options: {
//     scales: {
//       yAxes: [{
//         ticks: {
//           beginAtZero: true
//         }
//       }]
//     }
//   }
// });
