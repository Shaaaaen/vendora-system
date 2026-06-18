import pandas as pd, sys
sys.path.insert(0, '.')
from forecast_engine import evaluate_scenario

for name, letter in [('cs3_scenario_a.csv','A'), ('cs3_scenario_b.csv','B')]:
    df = pd.read_csv(name).rename(columns={'date':'ds','total_revenue':'y'})[['ds','y']]
    r = evaluate_scenario(df, country_code='MY', verbose=False)
    print(f'\n=== Scenario {letter} ===')
    for model in ['prophet','hybrid','xgb']:
        m = r[model]
        if m:
            print(f'{model}: WMAPE={m["wmape_open"]} MAE={m["mae"]} RMSE={m["rmse"]} Acc={m["accuracy"]}')
    print('WINNER:', r['winner'])