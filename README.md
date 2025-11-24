# 🎧 OTT Solutions – Live Dashboard

This project contains a responsive and interactive Live Dashboard for OTT music analytics. It visualizes key metrics such as revenue contribution, language distribution, top-performing songs, artist comparisons, stream efficiency, and royalty vs admin expenses. Built with HTML, CSS, and Plotly.js, the dashboard uses a card-based grid layout and integrates smoothly with Flask/Django via templating (using `url_for`).

## Features
- **Revenue Contribution by Platform** – Donut chart comparing Airtel, JioSaavn, and Wynk revenue.
- **Language Distribution** – Shows song counts across major Indian and international languages.
- **Top Songs by Revenue** – Ranks songs using an interactive bar chart.
- **Artist Performance Comparison** – Full-width chart comparing artist revenue split across DSPs.
- **Streams vs Income Efficiency** – Scatter plot mapping song streams to income efficiency.
- **Royalty vs Admin Expenses** – Grouped bar chart comparing royalty payout and admin costs per song.

## Tech Stack
- HTML5  
- CSS3  
- Python  
- Plotly.js  

---

## 🛠️ How to Run This Project

### 1. **Open in GitHub Codespaces**
Clone this project or start a new Codespace from your GitHub repository.

---

### 2. **Set Up Dependencies**
Install the required Python packages (if not already installed):

```bash
pip install flask pandas numpy
```

### 3. **Run the application**
Use the following command to start the app
```bash
python app.py
```
The application will be accessible at [http://127.0.0.1:5000.](https://improved-memory-p47p7w9gw6q2j7j-5000.app.github.dev/)

### 4. **Explore the Dashboard**
Open the web interface to view:
- Revenue breakdowns
- Top songs by income
- Language distribution
- Artist and album performance
- Efficiency and royalty metrics

