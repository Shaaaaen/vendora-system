import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

scenarios = ["A — Stable\n(365 days)", "B — Seasonal\n(180 days)",
             "C — Sparse\n(90 days)", "D — Transitional\n(89 days)"]

wmape = {
    "Prophet":        [0.0584, 0.1593, 0.3867, 0.1652],
    "Hybrid Prophet": [0.0584, 0.1593, 0.4280, 0.1652],
    "XGBoost":        [0.0463, 0.0876, 0.5351, 0.2898],
}

mae = {
    "Prophet":        [18.90, 43.03, 92.93, 67.18],
    "Hybrid Prophet": [17.77, 43.03, 97.95, 55.50],
    "XGBoost":        [14.24, 23.73, 114.86, 65.52],
}
COLORS = {
    "Prophet":        "#2E75B6",   # blue
    "Hybrid Prophet": "#70AD47",   # green
    "XGBoost":        "#ED7D31",   # orange
}
WINNER_EDGE = "#1F4E79"
BAR_WIDTH   = 0.25
x           = np.arange(len(scenarios))

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
fig.patch.set_facecolor("white")

def draw_bars(ax, data, ylabel, title, winners, fmt="{:.4f}", ylim=None):
    offsets = [-BAR_WIDTH, 0, BAR_WIDTH]
    models  = list(data.keys())

    for i, model in enumerate(models):
        vals = data[model]
        bars = ax.bar(x + offsets[i], vals, BAR_WIDTH,
                      label=model, color=COLORS[model],
                      edgecolor="white", linewidth=0.6, zorder=3)
        # value labels on top
        for bar, v in zip(bars, vals):
            ax.text(bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + (0.008 if "WMAPE" in title else 1.5),
                    fmt.format(v),
                    ha="center", va="bottom", fontsize=7.5,
                    color="#333333", fontweight="normal")

    # winner highlight — star above the winning bar
    for sc_idx, (winner, w_val) in enumerate(winners):
        wi = models.index(winner)
        bx = x[sc_idx] + offsets[wi]
        ax.text(bx, w_val + (0.025 if "WMAPE" in title else 5),
                "★", ha="center", va="bottom",
                fontsize=13, color="#C00000", zorder=5)

    ax.set_xticks(x)
    ax.set_xticklabels(scenarios, fontsize=9.5)
    ax.set_ylabel(ylabel, fontsize=10.5)
    ax.set_title(title, fontsize=12, fontweight="bold", pad=10, color="#1F4E79")
    ax.yaxis.grid(True, linestyle="--", alpha=0.5, zorder=0)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    if ylim:
        ax.set_ylim(ylim)

# winners per scenario (model, value)
wmape_winners = [
    ("XGBoost",  wmape["XGBoost"][0]),
    ("XGBoost",  wmape["XGBoost"][1]),
    ("Prophet",  wmape["Prophet"][2]),
    ("Prophet",  wmape["Prophet"][3]),
]
mae_winners = [
    ("XGBoost",        mae["XGBoost"][0]),
    ("XGBoost",        mae["XGBoost"][1]),
    ("Prophet",        mae["Prophet"][2]),
    ("Hybrid Prophet", mae["Hybrid Prophet"][3]),   # Hybrid wins MAE in D
]

draw_bars(ax1, wmape, "WMAPE (lower is better)",
          "(a)  WMAPE by Scenario and Model",
          wmape_winners, fmt="{:.4f}", ylim=(0, 0.68))

draw_bars(ax2, mae, "MAE — RM (lower is better)",
          "(b)  MAE by Scenario and Model",
          mae_winners, fmt="{:.1f}", ylim=(0, 145))

legend_handles = [
    mpatches.Patch(color=COLORS[m], label=m) for m in COLORS
]
legend_handles.append(
    mpatches.Patch(color="white", label="★ = auto-selected winner (WMAPE)")
)
# star proxy
from matplotlib.lines import Line2D
star_proxy = Line2D([0], [0], marker="*", color="w",
                    markerfacecolor="#C00000", markersize=12,
                    label="★ = auto-selected winner")
legend_handles[-1] = star_proxy

fig.legend(handles=legend_handles, loc="lower center", ncol=4,
           fontsize=9.5, frameon=True, framealpha=0.9,
           bbox_to_anchor=(0.5, -0.04))

fig.suptitle(
    "WMAPE and MAE Comparison Across All Four Scenarios and Three Models",
    fontsize=12, fontweight="bold", color="#1F4E79", y=1.01
)

plt.tight_layout(rect=[0, 0.06, 1, 1])
plt.savefig("comparison.png", dpi=300, bbox_inches="tight",
            facecolor="white", edgecolor="none")
print("Saved: comparison.png")