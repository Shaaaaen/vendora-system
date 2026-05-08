"""
wmape_chart.py
==============
Generates Figure 5.6: WMAPE grouped bar chart for Vendora FYP Chapter 5.

HOW TO RUN:
  1. Open terminal or VS Code in:
       C:\\Users\\yixuan\\Downloads\\Vendora_frontend\\project_root\\py
  2. Install dependency (one-time):
       pip install matplotlib
  3. Run:
       python wmape_chart.py
  4. Output:
       Figure5_6_WMAPE_Chart.png saved to the py folder
"""

import matplotlib.pyplot as plt
import numpy as np
import os

# =============================================================================
# CONFIG — output folder set to your py directory
# =============================================================================

OUTPUT_DIR = r"C:\Users\yixuan\Downloads\Vendora_frontend\project_root\py"

# =============================================================================
# DATA — from model_evaluation_results.csv (evaluate_models.py output)
# Updated to match actual computed results (previously hardcoded from earlier run)
# =============================================================================

sources = [
    'UCI Online\nRetail II (UK)',
    'Private Dataset\n(Malaysia)',
    'Restaurant\nSales (EU)',
    'Retail Store\nInventory (Synthetic)'
]

prophet = [0.3591, 0.0973, 0.0975, 0.0922]
hybrid  = [0.3580, 0.0976, 0.1012, 0.0933]
xgb     = [0.3514, 0.0907, 0.0532, 0.0854]

# =============================================================================
# PLOT
# =============================================================================

x     = np.arange(len(sources))
width = 0.25

fig, ax = plt.subplots(figsize=(12, 6))

b1 = ax.bar(x - width, prophet, width, label='Prophet',
            color='steelblue', edgecolor='white')
b2 = ax.bar(x,          hybrid,  width, label='Hybrid Prophet',
            color='darkorange', edgecolor='white')
b3 = ax.bar(x + width,  xgb,     width, label='XGBoost',
            color='mediumseagreen', edgecolor='white')

# Value labels on top of each bar
for bars in [b1, b2, b3]:
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width() / 2,
                bar.get_height() + 0.004,
                f'{bar.get_height():.4f}',
                ha='center', va='bottom', fontsize=8)

# Gold star on winning bar per group
# UCI: XGBoost wins (0.3514), MY: XGBoost (0.0907), Rest: XGBoost (0.0532), Store: XGBoost (0.0854)
winners_x = [x[0] + width, x[1] + width, x[2] + width, x[3] + width]
winners_y = [0.3514,        0.0907,        0.0532,        0.0854]
ax.scatter(winners_x,
           [y + 0.020 for y in winners_y],
           marker='*', s=180, color='gold', zorder=5, label='Best model (★)')

# Axes and labels
ax.set_xlabel('Dataset Source', fontsize=12)
ax.set_ylabel('WMAPE (lower = better)', fontsize=12)
ax.set_title('Figure 5.6: Model Evaluation Results — WMAPE by Dataset Source',
             fontsize=13, fontweight='bold', pad=15)
ax.set_xticks(x)
ax.set_xticklabels(sources, fontsize=9)
ax.legend(fontsize=10, loc='upper right')
ax.set_ylim(0, 0.44)
ax.grid(axis='y', alpha=0.3, linestyle='--')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

plt.tight_layout()

# Save to py folder
out_path = os.path.join(OUTPUT_DIR, "Figure5_6_WMAPE_Chart.png")
plt.savefig(out_path, dpi=150, bbox_inches='tight')
plt.show()
print(f"Saved -> {out_path}")