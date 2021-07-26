
// --- Data relevant to the chart: ---
let labelsArray = [];
let userEntriesArray = [];
let totalEntriesArray = [];
let TopViewedTVName = [];
let TopViewedTVNumber = [];
let amount = 7;
let maxValue = 0;
let minValue = 0;
let data;
let config; 
let inputs;

// Chart.defaults.color.fontcolor = 'white';

// Create the loved episodes chart.
// This function defines the looks and the animation for this chart.
const createLovedChart = () => {
    const ctx = document.querySelector('#mostLikedChart').getContext('2d');
    let lovedBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: TopViewedTVName,
            datasets: [
                {
                    label: 'Most Liked TV Shows',
                    backgroundColor: 'rgba(153, 42, 42, 0.4)',
                    borderColor: 'rgba(153, 42, 42, 1)',
                    borderWidth: 2,
                    data: TopViewedTVNumber
                }
            ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              ticks: {
                // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                // callback: function(val, index) {
                //   // Hide the label of every odd number
                //   // return index % 2 === 0 ? this.getLabelForValue(val) : null;
                //   // Empty string inside label of every odd number
                //   return index % 2 === 0 ? this.getLabelForValue(val) : '';

                // },
                // color: 'red',
              }
            }
          }
        },
    })
}

// Create the entries chart.
// This function defines the looks and the animation for this chart.
const createEntriesChart = () => {
    const ctx = document.querySelector('#entriesChart').getContext('2d');
    let entriesLinesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsArray,
            datasets: [
                {
                    // title of the graph
                    label: 'User Entries',
                    // if we want it to fill down to the bottom
                    fill: true,
                    lineTension: 0,
                    backgroundColor: 'rgba(107, 49, 134,0.4)',
                    borderColor: 'rgba(107, 49, 134,1)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(107, 49, 134,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(107, 49, 134,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: userEntriesArray,
                },
                {
                    // title of the graph
                    label: 'Total Entries',
                    // if we want it to fill down to the bottom
                    fill: true,
                    lineTension: 0,
                    backgroundColor: 'rgba(75, 192, 192, 0.4)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75, 192, 192, 1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: totalEntriesArray,
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// --- Functions: ---
const generateChartData = async () => {
    // Get data from Google FireBase for the number of entries
    ref = firebase.database().ref("Entries");
    await ref.once("value", snapshot => {
        // count the num of users entered each day
        Object.entries(snapshot.val()).forEach(([key, value]) => {
            var count = 0;
            for(let user in value) 
                if(value.hasOwnProperty(user))
                    ++count;
            userEntriesArray.push(count);
            labelsArray.push(key);
        });
        Object.entries(snapshot.val()).forEach(([date, userEntries]) => {
            let eachDayEntries = 0;
            Object.entries(userEntries).forEach(([userId, entries]) => {
                eachDayEntries += Object.keys(entries).length;
            })
            totalEntriesArray.push(eachDayEntries);
        });
    });
    await ref.child;
    // Get data from SQL server for the most watch TV shows
    await fetch(`../api/UserEpisodes/getMostViewedTVShows?userId=-1&amount=${amount}`)
        .then(response => response.json())
        .then(response => {
            console.log(response);
            response.forEach(tvShowString => {
                TopViewedTVName.push(tvShowString.split('|')[0]);
                TopViewedTVNumber.push(tvShowString.split('|')[1]);
            })
        });
    createEntriesChart()
    createLovedChart()
};
