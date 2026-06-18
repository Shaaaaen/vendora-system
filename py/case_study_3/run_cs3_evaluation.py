import numpy as np
import pandas as pd
import sys
import os

# ── make sure forecast_engine is importable ──────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from forecast_engine import evaluate_scenario

SCENARIOS = [
    {
        "label": "A",
        "name":  "Stable (365 days, closed Sundays, low noise)",
        "file":  "cs3_scenario_a.csv",
        "seed":  42,
    },
    {
        "label": "B",
        "name":  "Seasonal (180 days, Ramadan/Hari Raya spikes, no closing day)",
        "file":  "cs3_scenario_b.csv",
        "seed":  42,
    },
    {
        "label": "C",
        "name":  "Sparse (90 days, ~30% random zero days, very high noise)",
        "file":  "cs3_scenario_c.csv",
        "seed":  42,
    },
    {
        "label": "D",
        "name":  "Transitional (89 days, Sunday closure adopted in final 29 days)",
        "file":  "cs3_scenario_d.csv",
        "seed":  15,
    },
]

DIVIDER = "=" * 70

def run_scenario(cfg):
    df = pd.read_csv(cfg["file"])
    # normalise column names
    df = df.rename(columns={"date": "ds", "total_revenue": "y"})[["ds", "y"]]
    result = evaluate_scenario(df, country_code="MY", verbose=False)
    return result

def fmt(val):
    return f"{val:.4f}" if val is not None else "N/A"

def fmt2(val):
    return f"{val:.2f}" if val is not None else "N/A"

def fmt1(val):
    return f"{val:.1f}" if val is not None else "N/A"

def print_table(result, label):
    p = result["prophet"]
    h = result["hybrid"]
    x = result["xgb"]
    winner_map = {"prophet": "Prophet", "hybrid": "Hybrid Prophet", "xgb": "XGBoost"}
    winner = winner_map.get(result["winner"], result["winner"])

    header = f"  {'Model':<18} {'WMAPE':>8} {'MAE (RM)':>10} {'RMSE (RM)':>10} {'Accuracy':>10}"
    print(header)
    print("  " + "-" * 60)

    def model_row(name, m, is_winner):
        mark = " ◄ WINNER" if is_winner else ""
        row = (f"  {name:<18} {fmt(m['wmape_open']):>8} "
               f"{fmt2(m['mae']):>10} {fmt2(m['rmse']):>10} "
               f"{fmt1(m['accuracy']):>9}%{mark}")
        print(row)

    model_row("Prophet",        p, result["winner"] == "prophet")
    model_row("Hybrid Prophet", h, result["winner"] == "hybrid")
    if x:
        model_row("XGBoost",    x, result["winner"] == "xgb")
    else:
        print(f"  {'XGBoost':<18} {'N/A':>8} {'N/A':>10} {'N/A':>10} {'N/A':>10}")

    print()
    print(f"  Auto-selected model : {winner}")
    print(f"  Folds used          : {result['n_folds']}")
    print(f"  Training days used  : {result['N_used']} / {result['N_total']}")

    # Hybrid-specific notes
    if p and h:
        mae_gap  = round(p["mae"]  - h["mae"],  2)
        rmse_gap = round(p["rmse"] - h["rmse"], 2)
        if abs(mae_gap) > 0.01:
            pct = abs(mae_gap) / p["mae"] * 100 if p["mae"] > 0 else 0
            direction = "lower" if mae_gap > 0 else "higher"
            print(f"  Hybrid vs Prophet   : MAE {abs(mae_gap):.2f} RM {direction} "
                  f"({pct:.1f}%), RMSE {abs(rmse_gap):.2f} RM {direction}")


if __name__ == "__main__":
    print()
    print(DIVIDER)
    print("  VENDORA — Case Study 3: AI Sales Forecasting Model Evaluation")
    print(DIVIDER)

    summary_rows = []

    for cfg in SCENARIOS:
        label = cfg["label"]
        name  = cfg["name"]

        print()
        print(f"  Scenario {label}  —  {name}")
        print("  " + "-" * 60)

        if not os.path.exists(cfg["file"]):
            print(f"  ERROR: {cfg['file']} not found.")
            continue

        result = run_scenario(cfg)
        print_table(result, label)

        winner_map = {"prophet": "Prophet", "hybrid": "Hybrid Prophet", "xgb": "XGBoost"}
        w = result["winner"]
        best = result[w]
        summary_rows.append({
            "Scenario": f"{label} — {name.split('(')[0].strip()}",
            "Best Model": winner_map.get(w, w),
            "WMAPE": best["wmape_open"],
            "MAE (RM)": best["mae"],
            "RMSE (RM)": best["rmse"],
            "Accuracy (%)": best["accuracy"],
        })

    print()
    print(DIVIDER)
    print("  SUMMARY — Best Model Per Scenario")
    print(DIVIDER)
    summary_df = pd.DataFrame(summary_rows)
    print(summary_df.to_string(index=False))
    print()
    print(DIVIDER)
    print("  Evaluation complete.")
    print(DIVIDER)
    print()
