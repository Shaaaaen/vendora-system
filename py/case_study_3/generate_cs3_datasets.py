"""
gen_cs3_datasets.py
===================
Generates all four synthetic daily-revenue datasets for Case Study 3
(Vendora FYP — AI Sales Forecasting and Restock Recommendation).

Each dataset simulates a realistic Malaysian micro F&B vendor profile:

  Scenario A — Stable year-round stall
                365 days (Jan–Dec 2024), closed every Sunday, noise ±RM80
                Base daily revenue: RM320, seed=42

  Scenario B — Seasonal / event-driven stall
                180 days (Mar–Aug 2024), no fixed closure, noise ±RM30
                Ramadan spike ×1.55 | Hari Raya surge ×2.10
                Base daily revenue: RM280, seed=42

  Scenario C — Sparse new stall
                90 days (Oct–Dec 2024), ~35% random zero-sales days
                (not tied to any fixed weekday), noise ±RM80, seed=42

  Scenario D — Transitional stall (recently adopted closing day)
                89 days (Sep–Nov 2024), open 7 days for first 60 days
                then closed every Sunday for final 29 days, noise ±RM50
                Base daily revenue: RM220, seed=15

Output files (written to same folder as this script):
  cs3_scenario_a.csv
  cs3_scenario_b.csv
  cs3_scenario_c.csv
  cs3_scenario_d.csv

Usage:
    python gen_cs3_datasets.py
"""

import numpy as np
import pandas as pd
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


# ─────────────────────────────────────────────────────────────────────────────
#  SCENARIO A — Stable Weekly-Pattern Vendor
#  Products: Nasi Lemak (RM8.50), Teh Tarik (RM3.00), Roti Canai (RM4.50)
# ─────────────────────────────────────────────────────────────────────────────
def generate_scenario_a(seed=42):
    np.random.seed(seed)
    dates = pd.date_range("2024-01-01", "2024-12-30", freq="D")   # 365 days
    revenues = []
    for d in dates:
        if d.weekday() == 6:            # Sunday — stall closed
            revenues.append(0.0)
        else:
            rev = 320 + np.random.normal(0, 80)
            revenues.append(max(0.0, round(rev, 2)))

    df = pd.DataFrame({"date": dates.strftime("%Y-%m-%d"),
                       "total_revenue": revenues})
    path = os.path.join(OUTPUT_DIR, "cs3_scenario_a.csv")
    df.to_csv(path, index=False)

    n_zero   = (df.total_revenue == 0).sum()
    mean_rev = df[df.total_revenue > 0].total_revenue.mean()
    print(f"Scenario A saved  →  {path}")
    print(f"  Rows: {len(df)} | Closed days (Sundays): {n_zero}"
          f" | Mean open-day revenue: RM{mean_rev:.2f}")
    return df


# ─────────────────────────────────────────────────────────────────────────────
#  SCENARIO B — Seasonal / Event-Driven Vendor
#  Products: Burger Bakar (RM9.00), Air Cincau (RM2.50), Pisang Goreng (RM3.50)
# ─────────────────────────────────────────────────────────────────────────────
def generate_scenario_b(seed=42):
    np.random.seed(seed)
    dates = pd.date_range("2024-03-01", "2024-08-27", freq="D")   # 180 days

    RAMADAN_START = pd.Timestamp("2024-03-11")
    RAMADAN_END   = pd.Timestamp("2024-04-09")
    RAYA_START    = pd.Timestamp("2024-04-10")
    RAYA_END      = pd.Timestamp("2024-04-13")

    revenues = []
    for d in dates:
        if RAYA_START <= d <= RAYA_END:
            multiplier = 2.10           # Hari Raya surge
        elif RAMADAN_START <= d <= RAMADAN_END:
            multiplier = 1.55           # Ramadan spike
        else:
            multiplier = 1.0

        rev = 280 * multiplier + np.random.normal(0, 30)
        revenues.append(max(0.0, round(rev, 2)))

    df = pd.DataFrame({"date": dates.strftime("%Y-%m-%d"),
                       "total_revenue": revenues})
    path = os.path.join(OUTPUT_DIR, "cs3_scenario_b.csv")
    df.to_csv(path, index=False)

    mean_rev = df.total_revenue.mean()
    max_rev  = df.total_revenue.max()
    print(f"Scenario B saved  →  {path}")
    print(f"  Rows: {len(df)} | Mean revenue: RM{mean_rev:.2f}"
          f" | Peak (Hari Raya): RM{max_rev:.2f}")
    return df


# ─────────────────────────────────────────────────────────────────────────────
#  SCENARIO C — Sparse New Vendor (Worst Case)
#  Products: Laksa (RM10.00), Cendol (RM4.00), Kuih (RM2.00)
# ─────────────────────────────────────────────────────────────────────────────
def generate_scenario_c(seed=42):
    np.random.seed(seed)
    dates = pd.date_range("2024-10-01", "2024-12-29", freq="D")   # 90 days
    revenues = []
    for d in dates:
        # ~35% probability of zero-sales day, randomly distributed across all weekdays
        if np.random.random() < 0.35:
            revenues.append(0.0)
        else:
            rev = 180 + np.random.normal(0, 80)
            revenues.append(max(0.0, round(rev, 2)))

    df = pd.DataFrame({"date": dates.strftime("%Y-%m-%d"),
                       "total_revenue": revenues})
    path = os.path.join(OUTPUT_DIR, "cs3_scenario_c.csv")
    df.to_csv(path, index=False)

    n_zero   = (df.total_revenue == 0).sum()
    zero_pct = round(n_zero / len(df) * 100, 1)
    print(f"Scenario C saved  →  {path}")
    print(f"  Rows: {len(df)} | Zero-revenue days: {n_zero} ({zero_pct}%)"
          f" | Not tied to any fixed weekday")
    return df


# ─────────────────────────────────────────────────────────────────────────────
#  SCENARIO D — Transitional Vendor: Recently Adopted Closing Day
#  Products: Char Kuey Teow (RM9.00), Teh O Ais (RM2.50), Cucur Udang (RM3.00)
# ─────────────────────────────────────────────────────────────────────────────
def generate_scenario_d(seed=15):
    np.random.seed(seed)
    dates = pd.date_range("2024-09-01", "2024-11-28", freq="D")   # 89 days
    revenues = []
    for i, d in enumerate(dates):
        # Days 0–59  : open every day (no fixed closing day yet)
        # Days 60–88 : closed every Sunday (newly adopted weekly rest day)
        if i >= 60 and d.weekday() == 6:
            revenues.append(0.0)
        else:
            rev = 220 + np.random.normal(0, 50)
            revenues.append(max(0.0, round(rev, 2)))

    df = pd.DataFrame({"date": dates.strftime("%Y-%m-%d"),
                       "total_revenue": revenues})
    path = os.path.join(OUTPUT_DIR, "cs3_scenario_d.csv")
    df.to_csv(path, index=False)

    n_zero = (df.total_revenue == 0).sum()
    print(f"Scenario D saved  →  {path}")
    print(f"  Rows: {len(df)} | Closed days: {n_zero}"
          f" (Sundays in final 29 days only — transition at day 60)")
    return df


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print()
    print("=" * 65)
    print("  Vendora — Case Study 3: Synthetic Dataset Generator")
    print("=" * 65)
    print()
    print("  Scenario | Vendor Profile          | Days | Seed")
    print("  ---------|-------------------------|------|-----")
    print("  A        | Stable (weekly pattern) |  365 |   42")
    print("  B        | Seasonal (Ramadan/Raya) |  180 |   42")
    print("  C        | Sparse / New vendor     |   90 |   42")
    print("  D        | Transitional            |   89 |   15")
    print()

    generate_scenario_a(seed=42)
    print()
    generate_scenario_b(seed=42)
    print()
    generate_scenario_c(seed=42)
    print()
    generate_scenario_d(seed=15)

    print()
    print("=" * 65)
    print("  All 4 CSVs generated successfully.")
    print("  Next: python run_cs3_evaluation.py")
    print("=" * 65)
    print()
