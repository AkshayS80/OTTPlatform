async function fetchData() {
  try {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('❌ Failed to fetch dashboard data:', err);
    return {
      revenue_contribution: [],
      top_songs: [],
      language_dist: [],
      artist_perf: [],
      efficiency: [],
      royalty_admin: [],
      album_perf: [],
      error: err.message
    };
  }
}

// 🎶 1. Revenue Contribution by Platform (Pie Chart)
function revenueContribution(data) {
  if (!data.revenue_contribution || data.revenue_contribution.length === 0) {
    document.getElementById('revenueContribution').innerText = 'No revenue data available';
    return;
  }

  const labels = data.revenue_contribution.map(d => d.platform);
  const values = data.revenue_contribution.map(d => d.revenue);
  const total = values.reduce((a, b) => a + b, 0);

  const trace = {
    labels,
    values,
    type: 'pie',
    hole: 0.4,
    textinfo: 'label+percent',
    hoverinfo: 'label+value+percent',
    marker: { colors: ['#ff7f50', '#00a8a8', '#0f4c81'] }
  };

  const layout = {
    title: `Revenue Contribution (Total ₹${total.toFixed(2)})`,
    margin: { l: 20, r: 20, t: 40, b: 10 },
    showlegend: true
  };

  Plotly.newPlot('revenueContribution', [trace], layout, { responsive: true });
}

// 📊 2. Top Songs by Revenue (Bar Chart)
function topSongsRevenue(data) {
  if (!data.top_songs || data.top_songs.length === 0) {
    document.getElementById('topSongsRevenue').innerText = 'No song revenue data available';
    return;
  }

  const songs = data.top_songs.map(d => d.song);
  const revenues = data.top_songs.map(d => d.revenue);

  Plotly.newPlot('topSongsRevenue', [{
    x: songs,
    y: revenues,
    type: 'bar',
    marker: { color: '#6a5acd' }
  }], {
    title: 'Top Songs by Revenue',
    xaxis: { tickangle: -45 },
    yaxis: { title: 'Revenue' }
  }, { responsive: true });
}

// 🌍 3. Language Distribution of Songs (Donut Chart)
function languageDistribution(data) {
  if (!data.language_dist || data.language_dist.length === 0) {
    document.getElementById('languageDistribution').innerText = 'No language data available';
    return;
  }

  const labels = data.language_dist.map(d => d.language);
  const values = data.language_dist.map(d => d.count);

  Plotly.newPlot('languageDistribution', [{
    labels,
    values,
    type: 'pie',
    hole: 0.5,
    marker: {
      colors: ['#ffd700', '#87ceeb', '#32cd32', '#ff7f50'],
      line: {
        width: 0,
        color: 'transparent'
      }
    },
    textinfo: 'none',           // 🔥 removes all visible text labels
    hoverinfo: 'label + values'          // 👈 shows only language name on hover
  }], {
    title: 'Language Distribution'
  }, { responsive: true });
}

function artistPerformance(data) {
  if (!data.artist_perf || data.artist_perf.length === 0) {
    document.getElementById('artistPerformance').innerText = 'No artist performance data available';
    return;
  }

  // Aggregate total revenue per artist
  const revenueMap = {};
  data.artist_perf.forEach(d => {
    if (!revenueMap[d.artist]) revenueMap[d.artist] = 0;
    revenueMap[d.artist] += d.revenue;
  });

  // Sort and select top 10
  const sortedArtists = Object.entries(revenueMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const artists = sortedArtists.map(([artist]) => artist);
  const revenues = sortedArtists.map(([_, revenue]) => revenue);

  // Plot single bar per artist
  const trace = {
    x: artists,
    y: revenues,
    type: 'bar',
    marker: { color: 'teal' }
  };

  Plotly.newPlot('artistPerformance', [trace], {
    title: 'Top 10 Artists by Total Revenue',
    xaxis: { title: 'Artists', tickangle: -45 },
    yaxis: { title: 'Revenue' }
  }, { responsive: true });
}

// 📈 5. Streams vs Income Efficiency (Scatter Plot)
function streamsEfficiency(data) {
  if (!data.efficiency || data.efficiency.length === 0) {
    document.getElementById('streamsEfficiency').innerText = 'No efficiency data available';
    return;
  }

  Plotly.newPlot('streamsEfficiency', [{
    x: data.efficiency.map(d => d.streams),
    y: data.efficiency.map(d => d.income),
    text: data.efficiency.map(d => d.song),
    mode: 'markers',
    type: 'scatter',
    marker: { size: 12, color: '#00a8a8' }
  }], {
    title: 'Streams vs Income Efficiency',
    xaxis: { title: 'Streams' },
    yaxis: { title: 'Income' }
  }, { responsive: true });
}

// 💰 6. Royalty vs Admin Expenses (Grouped Bar Chart)
function royaltyAdmin(data) {
  if (!data.royalty_admin || data.royalty_admin.length === 0) {
    document.getElementById('royaltyAdmin').innerText = 'No royalty/admin data available';
    return;
  }

  // Step 1: Aggregate total amount per song
  const totals = data.royalty_admin.map(d => ({
    song: d.song,
    royalty: d.royalty,
    admin: d.admin,
    total: d.royalty + d.admin
  }));

  // Step 2: Sort by total descending and take top 10
  const top10 = totals.sort((a, b) => b.total - a.total).slice(0, 10);

  // Step 3: Extract values
  const songs = top10.map(d => d.song);
  const royalty = top10.map(d => d.royalty);
  const admin = top10.map(d => d.admin);

  // Step 4: Plot grouped bar chart
  const trace1 = {
    x: songs,
    y: royalty,
    name: 'Royalty',
    type: 'bar',
    marker: { color: '#32cd32' }
  };

  const trace2 = {
    x: songs,
    y: admin,
    name: 'Admin Expenses',
    type: 'bar',
    marker: { color: '#ff7f50' }
  };

  Plotly.newPlot('royaltyAdmin', [trace1, trace2], {
    barmode: 'group',
    title: 'Top 10 Songs: Royalty vs Admin Expenses',
    xaxis: { tickangle: -45 },
    yaxis: { title: 'Amount' }
  }, { responsive: true });
}


// 🚀 Init
(async function init() {
  const data = await fetchData();
  revenueContribution(data);
  topSongsRevenue(data);
  languageDistribution(data);
  artistPerformance(data);
  streamsEfficiency(data);
  royaltyAdmin(data);
  albumPerformance(data);

  window.addEventListener('resize', () => {
    Plotly.Plots.resize(document.getElementById('revenueContribution'));
    Plotly.Plots.resize(document.getElementById('topSongsRevenue'));
    Plotly.Plots.resize(document.getElementById('languageDistribution'));
    Plotly.Plots.resize(document.getElementById('artistPerformance'));
    Plotly.Plots.resize(document.getElementById('streamsEfficiency'));
    Plotly.Plots.resize(document.getElementById('royaltyAdmin'));
    Plotly.Plots.resize(document.getElementById('albumPerformance'));
  });
})();