const csvFiles = [
  'airtel-report.csv',
  'jiosaavn-report.csv',
  'wynk-report.csv'
];

const artistMap = {};

function loadCSV(file, parserOptions) {
  return fetch(file)
    .then(response => response.text())
    .then(text => Papa.parse(text, parserOptions));
}

function processData() {
  Promise.all(csvFiles.map(file => {
    return loadCSV(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => results.data
    });
  })).then(([airtel, jiosaavn, wynk]) => {
    // Airtel
    airtel.data.forEach(row => {
      const artist = row.artist_name?.trim();
      const income = parseFloat(row.income || 0);
      if (artist) artistMap[artist] = (artistMap[artist] || 0) + income;
    });

    // JioSaavn
    jiosaavn.data.forEach(row => {
      const artistNames = row.artist_name?.split('  ') || [];
      const income = parseFloat(row.income || 0);
      artistNames.forEach(name => {
        const artist = name.trim();
        if (artist) artistMap[artist] = (artistMap[artist] || 0) + income;
      });
    });

    // Wynk
    wynk.data.forEach(row => {
      const artist = row.artist_name?.trim();
      const income = parseFloat(row.income || 0);
      if (artist) artistMap[artist] = (artistMap[artist] || 0) + income;
    });

    renderTable();
  });
}

function renderTable() {
  const artistList = Object.entries(artistMap)
    .map(([artist, income]) => ({ artist, income }))
    .sort((a, b) => b.income - a.income);

  const tbody = document.querySelector("#artistTable tbody");
  tbody.innerHTML = artistList.map(d =>
    `<tr><td>${d.artist}</td><td>${d.income.toFixed(3)}</td></tr>`
  ).join("");
}

loadCSV(); // Start loading and rendering