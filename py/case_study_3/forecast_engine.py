import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import holidays as hol_lib
from datetime import timedelta

PROPHET_MAX_DAYS = 365   # same cap used in app.py


def calc_metrics(y_true, y_pred):
    y_true = np.array(y_true, dtype=float)
    y_pred = np.clip(np.array(y_pred, dtype=float), 0, None)
    mae = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
    mask = y_true > 0
    if mask.sum() == 0:
        return {'wmape_open': 1.0, 'mae': round(mae, 2), 'rmse': round(rmse, 2), 'accuracy': 0.0}
    yt, yp = y_true[mask], y_pred[mask]
    wmape_open = float(np.sum(np.abs(yt - yp)) / (np.sum(yt) + 1e-8))
    accuracy = round(max(0.0, min(100.0, (1 - wmape_open) * 100)), 1)
    return {'wmape_open': round(wmape_open, 4), 'mae': round(mae, 2),
            'rmse': round(rmse, 2), 'accuracy': accuracy}


def evaluate_scenario(df_in, country_code='MY', verbose=True):
    """
    df_in: DataFrame with columns ['ds','y'] — daily date and daily revenue.
    Returns dict with per-model averaged metrics, winner, and fold count —
    identical structure/logic to the live /api/forecast pipeline.
    """
    df_full = df_in.copy()
    df_full['ds'] = pd.to_datetime(df_full['ds'])
    df_full['y'] = df_full['y'].astype(float)
    df_full = df_full.sort_values('ds').drop_duplicates('ds').reset_index(drop=True)

    full_range = pd.date_range(df_full['ds'].min(), df_full['ds'].max(), freq='D')
    df_full = df_full.set_index('ds').reindex(full_range, fill_value=0).reset_index()
    df_full.columns = ['ds', 'y']

    N_total = len(df_full)
    if N_total > PROPHET_MAX_DAYS:
        df = df_full.iloc[-PROPHET_MAX_DAYS:].copy().reset_index(drop=True)
    else:
        df = df_full.copy()
    N = len(df)
    df_xgb = df_full.copy()

    CLOSING_THRESHOLD = 0.90
    LOW_SALES_PCT = 0.05
    LOOKBACK_DAYS = min(28, max(7, N // 4))
    WINDOW_SIZE = min(14, max(7, N // 10))
    EVALUATION_PERIOD = min(7, max(3, N // 10))

    if N >= 200:
        N_FOLDS, FOLD_STRIDE = 5, 30
    elif N >= 90:
        N_FOLDS, FOLD_STRIDE = 4, 14
    elif N >= 30:
        N_FOLDS, FOLD_STRIDE = 3, 7
    else:
        N_FOLDS = 2
        FOLD_STRIDE = max(3, (N - EVALUATION_PERIOD - WINDOW_SIZE) // 3)

    years = sorted(set(df['ds'].dt.year.tolist()))
    try:
        h_lib = hol_lib.country_holidays(country_code, years=years)
    except Exception:
        h_lib = {}
    hol_ts = {pd.Timestamp(k): v for k, v in h_lib.items()}
    prophet_hols_df = pd.DataFrame(
        [{'ds': ts, 'holiday': nm.replace(' ', '_')} for ts, nm in hol_ts.items()]
    ) if hol_ts else pd.DataFrame(columns=['ds', 'holiday'])
    if not prophet_hols_df.empty:
        prophet_hols_df['ds'] = pd.to_datetime(prophet_hols_df['ds'])

    def add_payday(frame):
        frame = frame.copy()
        frame['ds'] = pd.to_datetime(frame['ds'])
        frame['is_payday'] = frame['ds'].dt.day.apply(lambda d: 1 if d >= 25 or d <= 5 else 0)
        return frame

    def detect_closing_days(df_train_raw):
        cutoff = df_train_raw['ds'].max() - timedelta(days=LOOKBACK_DAYS)
        recent = df_train_raw[df_train_raw['ds'] >= cutoff].copy()
        recent['is_zero'] = (recent['y'] == 0).astype(int)
        summary = recent.groupby(recent['ds'].dt.dayofweek)['is_zero'].mean()
        return summary[summary >= CLOSING_THRESHOLD].index.tolist()

    MIN_TRAIN = max(WINDOW_SIZE + EVALUATION_PERIOD, 14)
    fold_indices = []
    for i in range(N_FOLDS, 0, -1):
        s = N - i * FOLD_STRIDE
        e = s + EVALUATION_PERIOD
        if s >= MIN_TRAIN and e <= N:
            fold_indices.append((s, e))
    if not fold_indices:
        s = max(MIN_TRAIN, N - EVALUATION_PERIOD - 1)
        e = s + EVALUATION_PERIOD
        if e <= N:
            fold_indices = [(s, e)]

    def run_prophet_fold(s, apply_rules):
        from prophet import Prophet
        df_train_raw = df.iloc[:s].copy()
        df_test = df.iloc[s:s + EVALUATION_PERIOD].copy()
        df_clean = df_train_raw.copy()
        if len(df_clean) > 30:
            df_clean = df_clean[df_clean['y'] >= df_clean['y'].quantile(LOW_SALES_PCT)]
        df_train = add_payday(df_clean)
        cp_scale = 0.05 if len(df_train) < 60 else 0.15
        m = Prophet(
            seasonality_mode='additive' if len(df_train) < 60 else 'multiplicative',
            changepoint_prior_scale=cp_scale,
            holidays_prior_scale=10,
            daily_seasonality=False,
            weekly_seasonality=len(df_train) >= 14,
            yearly_seasonality=len(df_train) >= 90,
            holidays=prophet_hols_df if (not prophet_hols_df.empty and len(df_train) >= 30) else None,
        )
        if len(df_train) >= 14:
            fourier_order = min(3, max(1, len(df_train) // 20))
            m.add_seasonality(name='weekly_custom', period=7, fourier_order=fourier_order, prior_scale=10)
        m.add_regressor('is_payday')
        m.fit(df_train)
        future = m.make_future_dataframe(periods=EVALUATION_PERIOD, freq='D', include_history=False)
        future = add_payday(future)
        forecast = m.predict(future)
        if apply_rules:
            closing = detect_closing_days(df_train_raw)
            mask = forecast['ds'].dt.dayofweek.isin(closing)
            forecast.loc[mask, ['yhat', 'yhat_lower', 'yhat_upper']] = 0
            # Low-sales suppressor
            roll_avg = df_train_raw['y'].tail(28).mean() if len(df_train_raw) else 0
            if roll_avg > 0:
                low_mask = forecast['yhat'] < (LOW_SALES_PCT * roll_avg)
                forecast.loc[low_mask, 'yhat'] = 0
        bt = forecast[['ds', 'yhat']].merge(df_test[['ds', 'y']], on='ds', how='left').fillna(0)
        bt['yhat'] = bt['yhat'].clip(lower=0)
        return bt, calc_metrics(bt['y'], bt['yhat'])

    def run_xgb_fold(s):
        from xgboost import XGBRegressor
        df_feat = df_xgb.copy()
        df_feat['is_payday'] = df_feat['ds'].dt.day.apply(lambda d: 1 if d >= 25 or d <= 5 else 0)
        df_feat['dow'] = df_feat['ds'].dt.dayofweek
        df_feat['is_holiday'] = df_feat['ds'].apply(lambda d: 1 if pd.Timestamp(d) in hol_ts else 0)
        df_feat['lag_1'] = df_feat['y'].shift(1).fillna(0)
        df_feat['lag_7'] = df_feat['y'].shift(7).fillna(0)
        df_feat['roll_7'] = df_feat['y'].rolling(7, min_periods=1).mean()
        FEATURES = ['is_payday', 'dow', 'is_holiday', 'lag_1', 'lag_7', 'roll_7']
        train = df_feat.iloc[:s]
        test = df_feat.iloc[s:s + EVALUATION_PERIOD]
        if len(train) < 10:
            raise ValueError("Not enough training data for XGBoost")
        mdl = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1,
                            subsample=0.8, verbosity=0, random_state=42)
        mdl.fit(train[FEATURES], train['y'])
        preds = np.clip(mdl.predict(test[FEATURES]), 0, None)
        return test, calc_metrics(test['y'].values, preds)

    _empty_m = {'wmape_open': 1.0, 'mae': 0.0, 'rmse': 0.0, 'accuracy': 0.0}
    h_metrics, p_metrics, x_metrics = [], [], []
    use_xgb = N >= 20

    for s, e in fold_indices:
        try:
            _, mh = run_prophet_fold(s, apply_rules=True)
            h_metrics.append(mh)
        except Exception as ex:
            if verbose:
                print("  hybrid fold error:", ex)
            h_metrics.append(_empty_m.copy())
        try:
            _, mp = run_prophet_fold(s, apply_rules=False)
            p_metrics.append(mp)
        except Exception as ex:
            if verbose:
                print("  prophet fold error:", ex)
            p_metrics.append(_empty_m.copy())
        if use_xgb:
            try:
                _, mx = run_xgb_fold(s)
                x_metrics.append(mx)
            except Exception as ex:
                if verbose:
                    print("  xgb fold error:", ex)
                x_metrics.append(_empty_m.copy())

    def avg_m(ml):
        if not ml:
            return _empty_m.copy()
        return {k: round(float(np.mean([m[k] for m in ml if k in m])), 4) for k in ml[0]}

    p_avg = avg_m(p_metrics)
    h_avg = avg_m(h_metrics)
    x_avg = avg_m(x_metrics) if (use_xgb and x_metrics) else None

    candidates = {'prophet': p_avg['wmape_open'], 'hybrid': h_avg['wmape_open']}
    if x_avg is not None:
        candidates['xgb'] = x_avg['wmape_open']
    winner = min(candidates, key=candidates.get)

    return {
        'N_total': N_total, 'N_used': N, 'n_folds': len(fold_indices),
        'use_xgb': use_xgb and x_avg is not None,
        'prophet': p_avg, 'hybrid': h_avg, 'xgb': x_avg,
        'winner': winner,
    }


def future_forecast(df_in, country_code='MY', model='xgb', forecast_days=7):
    """
    Generates an n-day-ahead future forecast using the SAME training logic
    as the live app's prophet_future()/XGBoost future-forecast block, for
    whichever model is requested ('prophet', 'hybrid', or 'xgb').
    Returns a list of {'date':..., 'predicted':...} dicts.
    """
    df_full = df_in.copy()
    df_full['ds'] = pd.to_datetime(df_full['ds'])
    df_full['y'] = df_full['y'].astype(float)
    df_full = df_full.sort_values('ds').drop_duplicates('ds').reset_index(drop=True)
    full_range = pd.date_range(df_full['ds'].min(), df_full['ds'].max(), freq='D')
    df_full = df_full.set_index('ds').reindex(full_range, fill_value=0).reset_index()
    df_full.columns = ['ds', 'y']
    N_total = len(df_full)
    df = df_full.iloc[-PROPHET_MAX_DAYS:].copy().reset_index(drop=True) if N_total > PROPHET_MAX_DAYS else df_full.copy()
    today = df['ds'].max() + timedelta(days=1)

    years = sorted(set(df['ds'].dt.year.tolist() + [today.year]))
    try:
        h_lib = hol_lib.country_holidays(country_code, years=years)
    except Exception:
        h_lib = {}
    hol_ts = {pd.Timestamp(k): v for k, v in h_lib.items()}
    prophet_hols_df = pd.DataFrame(
        [{'ds': ts, 'holiday': nm.replace(' ', '_')} for ts, nm in hol_ts.items()]
    ) if hol_ts else pd.DataFrame(columns=['ds', 'holiday'])
    if not prophet_hols_df.empty:
        prophet_hols_df['ds'] = pd.to_datetime(prophet_hols_df['ds'])

    def add_payday(frame):
        frame = frame.copy()
        frame['ds'] = pd.to_datetime(frame['ds'])
        frame['is_payday'] = frame['ds'].dt.day.apply(lambda d: 1 if d >= 25 or d <= 5 else 0)
        return frame

    if model in ('prophet', 'hybrid'):
        from prophet import Prophet
        LOW_SALES_PCT = 0.05
        df_clean = df.copy()
        if len(df_clean) > 30:
            df_clean = df_clean[df_clean['y'] >= df_clean['y'].quantile(LOW_SALES_PCT)]
        df_train = add_payday(df_clean)
        cp_scale = 0.05 if len(df_train) < 60 else 0.15
        m = Prophet(
            seasonality_mode='additive' if len(df_train) < 60 else 'multiplicative',
            changepoint_prior_scale=cp_scale, holidays_prior_scale=10,
            daily_seasonality=False, weekly_seasonality=len(df_train) >= 14,
            yearly_seasonality=len(df_train) >= 90,
            holidays=prophet_hols_df if (not prophet_hols_df.empty and len(df_train) >= 30) else None,
        )
        if len(df_train) >= 14:
            fourier_order = min(3, max(1, len(df_train) // 20))
            m.add_seasonality(name='weekly_custom', period=7, fourier_order=fourier_order, prior_scale=10)
        m.add_regressor('is_payday')
        m.fit(df_train)
        future = m.make_future_dataframe(periods=forecast_days, freq='D', include_history=False)
        future = add_payday(future)
        fc = m.predict(future)
        if model == 'hybrid':
            CLOSING_THRESHOLD = 0.90
            LOOKBACK_DAYS = min(28, max(7, len(df) // 4))
            cutoff = df['ds'].max() - timedelta(days=LOOKBACK_DAYS)
            recent = df[df['ds'] >= cutoff].copy()
            recent['is_zero'] = (recent['y'] == 0).astype(int)
            summary = recent.groupby(recent['ds'].dt.dayofweek)['is_zero'].mean()
            closing = summary[summary >= CLOSING_THRESHOLD].index.tolist()
            mask = fc['ds'].dt.dayofweek.isin(closing)
            fc.loc[mask, 'yhat'] = 0
        return [{'date': str(r['ds'].date()), 'predicted': round(max(0, r['yhat']), 2)} for _, r in fc.iterrows()]

    elif model == 'xgb':
        from xgboost import XGBRegressor
        df_feat = df_full.copy()
        df_feat['is_payday'] = df_feat['ds'].dt.day.apply(lambda d: 1 if d >= 25 or d <= 5 else 0)
        df_feat['dow'] = df_feat['ds'].dt.dayofweek
        df_feat['is_holiday'] = df_feat['ds'].apply(lambda d: 1 if pd.Timestamp(d) in hol_ts else 0)
        df_feat['lag_1'] = df_feat['y'].shift(1).fillna(0)
        df_feat['lag_7'] = df_feat['y'].shift(7).fillna(0)
        df_feat['roll_7'] = df_feat['y'].rolling(7, min_periods=1).mean()
        FEATURES = ['is_payday', 'dow', 'is_holiday', 'lag_1', 'lag_7', 'roll_7']
        mdl = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1,
                            subsample=0.8, verbosity=0, random_state=42)
        mdl.fit(df_feat[FEATURES], df_feat['y'])
        hist = df_full.copy()
        results = []
        for fi in range(forecast_days):
            fd = today + timedelta(days=fi)
            lag_1 = float(hist['y'].iloc[-1])
            lag_7 = float(hist['y'].iloc[-7]) if len(hist) >= 7 else 0.0
            roll7 = float(hist['y'].iloc[-7:].mean()) if len(hist) >= 7 else float(hist['y'].mean())
            row = {'is_payday': 1 if (fd.day >= 25 or fd.day <= 5) else 0, 'dow': fd.weekday(),
                   'is_holiday': 1 if pd.Timestamp(fd) in hol_ts else 0,
                   'lag_1': lag_1, 'lag_7': lag_7, 'roll_7': roll7}
            pred = float(np.clip(mdl.predict(pd.DataFrame([row])[FEATURES])[0], 0, None))
            results.append({'date': str(fd.date()), 'predicted': round(pred, 2)})
            hist = pd.concat([hist, pd.DataFrame([{'ds': pd.Timestamp(fd), 'y': pred}])], ignore_index=True)
        return results
