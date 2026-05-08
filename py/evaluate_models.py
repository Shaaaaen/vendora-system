"""
evaluate_models.py
==================
Standalone model evaluation script for Vendora FYP — Chapter 5.

Evaluates three forecasting models on four raw source datasets using
a hold-out backtest methodology:
  - 80% training / 20% hold-out split per source
  - Rolling-origin cross-validation within the hold-out window
  - Metrics: WMAPE, MAE, RMSE, Accuracy (%)

Models evaluated:
  1. Prophet (baseline)
  2. Hybrid Prophet (Prophet + public holiday effects)
  3. XGBoost (lag + calendar features)

Datasets used (raw CSV files — no merging required):
  1. uci_micro_vendor.csv          — UCI Online Retail II (UK)
  2. MY_Private_Dataset.csv        — Private Malaysian F&B vendor
  3. 9. Sales-Data-Analysis.csv    — Restaurant Sales (EU cities, Kaggle)
  4. retail_store_inventory.csv    — Retail Store Inventory (Kaggle)

Excluded dataset:
  - retail_sales_dataset.csv (Retail Sales Dataset by M. Talib, Kaggle)
    Reason: lag-1 autocorr = 0.033, lag-7 = 0.036 — near-zero, no temporal
    structure. All models score below 42% accuracy — not representative of
    real micro-vendor conditions. See Chapter 5 Section 5.2.5.

HOW TO RUN:
  1. Open terminal or VS Code in:
       C:\\Users\\yixuan\\Downloads\\Vendora_frontend\\project_root\\py
  2. Install dependencies (one-time):
       pip install pandas numpy prophet xgboost holidays
  3. Run:
       python evaluate_models.py
  4. Output:
       - Results table printed in terminal
       - model_evaluation_results.csv saved to the py folder

EXPECTED RUNTIME: ~3-8 minutes depending on your machine.
"""

import warnings
warnings.filterwarnings("ignore")

import os
import pandas as pd
import numpy as np
import holidays as hol_lib

# =============================================================================
# CONFIG — paths set to your actual folder structure
#   Sources: C:\Users\yixuan\Downloads\Vendora_frontend\project_root\sources
#   Script:  C:\Users\yixuan\Downloads\Vendora_frontend\project_root\py
# =============================================================================

SOURCES_DIR = r"C:\Users\yixuan\Downloads\Vendora_frontend\project_root\sources"
OUTPUT_DIR  = r"C:\Users\yixuan\Downloads\Vendora_frontend\project_root\py"

SOURCE_CONFIG = [
    {
        "name":        "UCI Online Retail II",
        "file":        os.path.join(SOURCES_DIR, "uci_micro_vendor.csv"),
        "date_col":    "Date",
        "revenue_col": "Total Sales",   # already aggregated daily revenue
        "price_col":   None,
        "qty_col":     None,
        "country":     "GB",
        "dayfirst":    False,
    },
    {
        "name":        "Private Dataset (Malaysia)",
        "file":        os.path.join(SOURCES_DIR, "MY_Private_Dataset.csv"),
        "date_col":    "Date",
        "revenue_col": "Total Sales",   # already aggregated daily revenue
        "price_col":   None,
        "qty_col":     None,
        "country":     "MY",
        "dayfirst":    False,
    },
    {
        "name":        "Restaurant Sales Dataset (Kaggle)",
        "file":        os.path.join(SOURCES_DIR, "9. Sales-Data-Analysis.csv"),
        "date_col":    "Date",
        "revenue_col": None,            # computed as Price x Quantity
        "price_col":   "Price",
        "qty_col":     "Quantity",
        "country":     "GB",
        "dayfirst":    True,
    },
    {
        "name":        "Retail Store Inventory (Kaggle)",
        "file":        os.path.join(SOURCES_DIR, "retail_store_inventory.csv"),
        "date_col":    "Date",
        "revenue_col": None,            # computed as Price x Units Sold
        "price_col":   "Price",
        "qty_col":     "Units Sold",
        "country":     "GB",
        "dayfirst":    False,
    },
]

# =============================================================================
# METRIC HELPERS
# =============================================================================

def calc_metrics(y_true, y_pred):
    yt    = np.array(y_true, dtype=float)
    yp    = np.clip(np.array(y_pred, dtype=float), 0, None)
    mae   = float(np.mean(np.abs(yt - yp)))
    rmse  = float(np.sqrt(np.mean((yt - yp) ** 2)))
    denom = float(np.sum(np.abs(yt))) + 1e-8
    wmape = float(np.sum(np.abs(yt - yp)) / denom)
    acc   = round(max(0.0, min(100.0, (1.0 - wmape) * 100.0)), 1)
    return {"wmape": round(wmape, 4), "mae": round(mae, 2),
            "rmse": round(rmse, 2), "acc": acc}

def avg_metrics(fold_list):
    if not fold_list:
        return {"wmape": 1.0, "mae": 0.0, "rmse": 0.0, "acc": 0.0}
    return {k: round(float(np.mean([m[k] for m in fold_list])), 4)
            for k in fold_list[0]}

# =============================================================================
# LOAD AND PREPROCESS ONE SOURCE
# =============================================================================

def load_source(cfg):
    path = cfg["file"]
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"\nCannot find: '{path}'\n"
            f"Please check the file exists in:\n  {SOURCES_DIR}\n"
            f"Source: '{cfg['name']}'"
        )

    df = pd.read_csv(path)
    df[cfg["date_col"]] = pd.to_datetime(
        df[cfg["date_col"]], dayfirst=cfg["dayfirst"], errors="coerce"
    )
    df = df.dropna(subset=[cfg["date_col"]])

    if cfg["revenue_col"]:
        df["_rev"] = pd.to_numeric(df[cfg["revenue_col"]], errors="coerce")
    else:
        price      = pd.to_numeric(df[cfg["price_col"]], errors="coerce")
        qty        = pd.to_numeric(df[cfg["qty_col"]],   errors="coerce")
        df["_rev"] = price * qty

    df = df[df["_rev"] > 0].copy()

    daily = (df.groupby(cfg["date_col"])["_rev"]
               .sum()
               .reset_index()
               .rename(columns={cfg["date_col"]: "ds", "_rev": "y"})
               .sort_values("ds")
               .reset_index(drop=True))
    return daily

# =============================================================================
# CORE EVALUATION FUNCTION
# =============================================================================

def evaluate_source(df_daily, source_name, country_code="GB"):
    df_daily = df_daily.copy().sort_values("ds").reset_index(drop=True)
    N = len(df_daily)

    if N < 30:
        print(f"    [SKIP] Only {N} rows — need at least 30.")
        return None

    split  = int(N * 0.80)
    TEST_N = N - split
    WINDOW  = min(12, max(3, TEST_N // 5))
    N_FOLDS = min(5,  max(2, TEST_N // WINDOW))
    stride  = max(1, (TEST_N - WINDOW) // max(1, N_FOLDS - 1))

    print(f"    rows={N}  train={split}  test={TEST_N}  "
          f"folds={N_FOLDS}  window={WINDOW}d  stride={stride}d")

    years = sorted(df_daily["ds"].dt.year.unique().tolist())
    try:
        hol_map = {pd.Timestamp(k): v
                   for k, v in hol_lib.country_holidays(country_code, years=years).items()}
    except Exception:
        hol_map = {}

    hol_rows = [{"holiday": v, "ds": k, "lower_window": 0, "upper_window": 1}
                for k, v in hol_map.items()]
    hols_df  = pd.DataFrame(hol_rows) if hol_rows else pd.DataFrame()

    df_feat = df_daily.copy()
    df_feat["is_payday"] = df_feat["ds"].dt.day.apply(
        lambda d: 1 if (d >= 25 or d <= 5) else 0)
    df_feat["dow"]    = df_feat["ds"].dt.dayofweek
    df_feat["is_hol"] = df_feat["ds"].apply(
        lambda d: 1 if pd.Timestamp(d) in hol_map else 0)
    df_feat["lag_1"]  = df_feat["y"].shift(1).fillna(0)
    df_feat["lag_7"]  = df_feat["y"].shift(7).fillna(0)
    df_feat["roll_7"] = df_feat["y"].rolling(7, min_periods=1).mean()
    XGB_FEAT = ["is_payday", "dow", "is_hol", "lag_1", "lag_7", "roll_7"]

    p_folds, h_folds, x_folds = [], [], []

    for i in range(N_FOLDS):
        fs = split + i * stride
        fe = fs + WINDOW
        if fe > N:
            break

        train_df = df_daily.iloc[:fs].copy()
        test_df  = df_daily.iloc[fs:fe].copy()
        if len(train_df) < 10:
            continue

        try:
            from prophet import Prophet
            m = Prophet(changepoint_prior_scale=0.05,
                        seasonality_prior_scale=10,
                        seasonality_mode="multiplicative",
                        weekly_seasonality=True,
                        daily_seasonality=False)
            m.fit(train_df)
            fc = m.predict(m.make_future_dataframe(periods=len(test_df), freq="D"))
            p_folds.append(calc_metrics(
                test_df["y"].values,
                np.clip(fc.tail(len(test_df))["yhat"].values, 0, None)))
        except Exception as e:
            print(f"      [Prophet fold {i}] {e}")

        try:
            from prophet import Prophet
            use_hols = hols_df if (not hols_df.empty and len(train_df) >= 30) else None
            m2 = Prophet(changepoint_prior_scale=0.05,
                         seasonality_prior_scale=10,
                         seasonality_mode="multiplicative",
                         weekly_seasonality=True,
                         daily_seasonality=False,
                         holidays=use_hols)
            m2.fit(train_df)
            fc2 = m2.predict(m2.make_future_dataframe(periods=len(test_df), freq="D"))
            h_folds.append(calc_metrics(
                test_df["y"].values,
                np.clip(fc2.tail(len(test_df))["yhat"].values, 0, None)))
        except Exception as e:
            print(f"      [Hybrid Prophet fold {i}] {e}")

        try:
            from xgboost import XGBRegressor
            tr_f = df_feat.iloc[:fs]
            te_f = df_feat.iloc[fs:fe]
            if len(tr_f) < 10:
                raise ValueError("too few rows")
            mdl = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1,
                               subsample=0.8, verbosity=0, random_state=42)
            mdl.fit(tr_f[XGB_FEAT], tr_f["y"])
            x_folds.append(calc_metrics(
                te_f["y"].values,
                np.clip(mdl.predict(te_f[XGB_FEAT]), 0, None)))
        except Exception as e:
            print(f"      [XGBoost fold {i}] {e}")

    return {
        "source":  source_name,
        "rows":    N,
        "prophet": avg_metrics(p_folds),
        "hybrid":  avg_metrics(h_folds),
        "xgb":     avg_metrics(x_folds),
    }

# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":

    all_results = []

    for cfg in SOURCE_CONFIG:
        print("=" * 65)
        print(f"Source : {cfg['name']}")
        print(f"File   : {cfg['file']}")
        try:
            daily = load_source(cfg)
            print(f"    Loaded {len(daily)} daily revenue rows "
                  f"({daily['ds'].min().date()} -> {daily['ds'].max().date()})")
            result = evaluate_source(daily, cfg["name"], cfg["country"])
            if result:
                all_results.append(result)
        except FileNotFoundError as e:
            print(e)
        print()

    if not all_results:
        print("No results produced. Check SOURCES_DIR path at top of script.")
        raise SystemExit(1)

    W = 100
    print("\n" + "=" * W)
    print("  VENDORA - MODEL EVALUATION RESULTS")
    print("  Method : Hold-out backtest (80/20 split) + Rolling-origin cross-validation")
    print("  KPI    : WMAPE (lower = better)  |  Accuracy% = max(0, (1-WMAPE)*100)")
    print("=" * W)
    print(f"  {'Source':<42} {'Model':<18} {'WMAPE':>7} {'MAE':>12} {'RMSE':>12} {'Acc%':>7}")
    print("-" * W)

    csv_rows = []
    for r in all_results:
        candidates = {"prophet": r["prophet"]["wmape"],
                      "hybrid":  r["hybrid"]["wmape"],
                      "xgb":     r["xgb"]["wmape"]}
        winner_key = min(candidates, key=candidates.get)

        for key, label in [("prophet", "Prophet"),
                            ("hybrid",  "Hybrid Prophet"),
                            ("xgb",     "XGBoost")]:
            m    = r[key]
            star = " *" if key == winner_key else "  "
            print(f"  {r['source']:<42} {label:<18} "
                  f"{m['wmape']:>7.4f} {m['mae']:>12.2f} {m['rmse']:>12.2f} "
                  f"{m['acc']:>6.1f}%{star}")
            csv_rows.append({
                "Source":      r["source"],
                "Rows":        r["rows"],
                "Model":       label,
                "WMAPE":       m["wmape"],
                "MAE":         m["mae"],
                "RMSE":        m["rmse"],
                "Accuracy(%)": m["acc"],
            })
        print()

    print("=" * W)
    print("  WINNER PER SOURCE  (* = model auto-selected by Vendora for that micro vendor)")
    print("-" * W)
    for r in all_results:
        cands  = {"Prophet":        r["prophet"]["wmape"],
                  "Hybrid Prophet": r["hybrid"]["wmape"],
                  "XGBoost":        r["xgb"]["wmape"]}
        winner = min(cands, key=cands.get)
        w_key  = {"Prophet": "prophet", "Hybrid Prophet": "hybrid", "XGBoost": "xgb"}[winner]
        w_acc  = r[w_key]["acc"]
        print(f"  {r['source']:<50}  {winner:<18}  "
              f"WMAPE={cands[winner]:.4f}  Accuracy={w_acc:.1f}%")
    print("=" * W)

    out_csv = os.path.join(OUTPUT_DIR, "model_evaluation_results.csv")
    pd.DataFrame(csv_rows).to_csv(out_csv, index=False)
    print(f"\n  Saved -> {out_csv}")
    print()
    print("  NOTE: 'retail_sales_dataset.csv' was intentionally excluded.")
    print("  lag-1 autocorr=0.033, lag-7=0.036 — no temporal structure.")
    print("  See FYP Chapter 5 Section 5.2.5.")