from flask import Flask, render_template, jsonify
import pandas as pd
import os
import numpy as np

app = Flask(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

# -----------------------------
# Loaders for each CSV
# -----------------------------
def load_airtel():
    path = os.path.join(DATA_DIR, 'airtel-report.csv')
    df = pd.read_csv(path, sep=',', engine='python')
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

    # Ensure numeric income
    if 'income' in df.columns:
        df['income'] = pd.to_numeric(df['income'], errors='coerce').fillna(0)
    else:
        df['income'] = 0

    # Add missing fields for consistency
    if 'language' not in df.columns:
        df['language'] = 'Unknown'
    if 'royalty' not in df.columns:
        df['royalty'] = 0
    if 'admin_exp' not in df.columns:
        df['admin_exp'] = 0

    return df


def load_jiosaavn():
    path = os.path.join(DATA_DIR, 'jiosaavn-report.csv')
    df = pd.read_csv(path, sep=',', engine='python')
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

    # Normalize column names
    df.rename(columns={'royality': 'royalty', 'total': 'total_streams'}, inplace=True)

    # Ensure numeric
    for col in ['ad_supported_streams', 'subscription_streams', 'jio_trial_streams',
                'total_streams', 'income', 'admin_exp', 'royalty']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    return df


def load_wynk():
    path = os.path.join(DATA_DIR, 'wynk-report.csv')
    df = pd.read_csv(path, sep=',', engine='python')
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

    # Normalize column names
    df.rename(columns={'royality': 'royalty', 'total': 'total_streams'}, inplace=True)

    # Ensure numeric
    for col in ['total_streams', 'income', 'admin_exp', 'royalty']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    return df


# -----------------------------
# Helper: sanitize NaN for JSON
# -----------------------------
def sanitize_payload(payload):
    for key, value in payload.items():
        if isinstance(value, list):
            for item in value:
                for k, v in item.items():
                    if isinstance(v, float) and np.isnan(v):
                        item[k] = 0
                    elif v is None:
                        item[k] = 0
    return payload


# -----------------------------
# Aggregation logic
# -----------------------------
def aggregate_metrics():
    airtel = load_airtel()
    jio = load_jiosaavn()
    wynk = load_wynk()

    # 1. Revenue Contribution by Platform
    revenue_airtel = airtel['income'].sum()
    revenue_jio = jio['income'].sum()
    revenue_wynk = wynk['income'].sum()

    revenue_contribution = [
        {'platform': 'Airtel', 'revenue': float(revenue_airtel)},
        {'platform': 'JioSaavn', 'revenue': float(revenue_jio)},
        {'platform': 'Wynk', 'revenue': float(revenue_wynk)}
    ]

    # 2. Top Songs by Revenue (sorted)
    top_songs = []
    for df, platform in [(airtel, 'Airtel'), (jio, 'JioSaavn'), (wynk, 'Wynk')]:
        if 'song_name' in df.columns and 'income' in df.columns:
            for _, row in df.iterrows():
                top_songs.append({
                    'song': row['song_name'],
                    'revenue': float(row['income']),
                    'platform': platform
                })
    top_songs = sorted(top_songs, key=lambda x: x['revenue'], reverse=True)[:10]

    # 3. Language Distribution
    language_dist = []
    for df in [jio, wynk, airtel]:
        if 'language' in df.columns:
            df['language'] = df['language'].astype(str).str.strip().str.lower()
            for lang, count in df['language'].value_counts().items():
                language_dist.append({'language': lang, 'count': int(count)})

    # 4. Artist Performance Comparison
    artist_perf = []
    for df, platform in [(airtel, 'Airtel'), (jio, 'JioSaavn'), (wynk, 'Wynk')]:
        if 'artist_name' in df.columns and 'income' in df.columns:
            for _, row in df.iterrows():
                artist_perf.append({
                    'artist': row['artist_name'],
                    'platform': platform,
                    'revenue': float(row['income'])
                })

    # 5. Streams vs Income Efficiency (JioSaavn only)
    efficiency = []
    if {'song_name', 'total_streams', 'income'} <= set(jio.columns):
        for _, row in jio.iterrows():
            efficiency.append({
                'song': row['song_name'],
                'streams': float(row['total_streams']),
                'income': float(row['income'])
            })

    # 6. Royalty vs Admin Expenses
    royalty_admin = []
    for df, platform in [(jio, 'JioSaavn'), (wynk, 'Wynk')]:
        if {'song_name', 'royalty', 'admin_exp'} <= set(df.columns):
            for _, row in df.iterrows():
                royalty_admin.append({
                    'song': row['song_name'],
                    'platform': platform,
                    'royalty': float(row['royalty']),
                    'admin': float(row['admin_exp'])
                })


    payload = {
        'revenue_contribution': revenue_contribution,
        'top_songs': top_songs,
        'language_dist': language_dist,
        'artist_perf': artist_perf,
        'efficiency': efficiency,
        'royalty_admin': royalty_admin
    }

    return sanitize_payload(payload)


# -----------------------------
# Routes
# -----------------------------
@app.route('/')
def index():
    return render_template('index.html')
    
@app.route('/api/dashboard')
def api_dashboard():
    try:
        data = aggregate_metrics()
        return jsonify(data)
    except Exception as e:
        print("❌ Error in /api/dashboard:", e)
        return jsonify({
            'revenue_contribution': [],
            'top_songs': [],
            'language_dist': [],
            'artist_perf': [],
            'efficiency': [],
            'royalty_admin': [],
            'album_perf': [],
            'error': str(e)
        }), 200


if __name__ == '__main__':

    app.run(debug=True)
