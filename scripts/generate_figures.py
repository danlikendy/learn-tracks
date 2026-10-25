#!/usr/bin/env python3
"""Pedagogical figures for Data Science notes (site beige theme)."""
from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Circle, FancyBboxPatch, Rectangle

OUT = Path(__file__).resolve().parents[1] / "app" / "public" / "figures"
FONT_DIR = Path(__file__).resolve().parent / "fonts"
BG = "#f4efe6"
FG = "#1c1917"
MUTED = "#57534e"
ACCENT = "#8b5a2b"
GREEN = "#3f5d4a"
RED = "#9a3b2f"
BLUE = "#3d5a80"

from matplotlib import font_manager

for _ttf in FONT_DIR.glob("IBMPlexSans-*.ttf"):
    font_manager.fontManager.addfont(str(_ttf))

plt.rcParams.update(
    {
        "figure.facecolor": BG,
        "axes.facecolor": BG,
        "axes.edgecolor": MUTED,
        "axes.labelcolor": FG,
        "xtick.color": FG,
        "ytick.color": FG,
        "text.color": FG,
        "font.family": "IBM Plex Sans",
        "font.size": 10,
        "axes.titlesize": 12,
        "legend.fontsize": 9,
        "figure.dpi": 120,
        "savefig.bbox": "tight",
        "savefig.pad_inches": 0.12,
    }
)


def save(fig, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    fig.suptitle("")
    for ax in fig.get_axes():
        ax.set_title("")
    try:
        fig.tight_layout()
    except Exception:
        pass
    fig.savefig(OUT / name, dpi=130, bbox_inches="tight", facecolor=BG)
    plt.close(fig)


def style(ax) -> None:
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)


def fig_ols() -> None:
    rng = np.random.default_rng(2)
    x = np.linspace(0, 8, 24)
    y = 1.2 + 0.7 * x + rng.normal(0, 0.55, size=x.size)
    coef = np.polyfit(x, y, 1)
    line = np.polyval(coef, x)
    fig, ax = plt.subplots(figsize=(5.1, 3.15))
    ax.scatter(x, y, c=ACCENT, s=36, zorder=3)
    ax.plot(x, line, color=GREEN, lw=2)
    for xi, yi, fi in zip(x, y, line):
        ax.plot([xi, xi], [yi, fi], color=RED, lw=0.8, alpha=0.7)
    ax.set_xlabel("x")
    ax.set_ylabel("y")
    ax.set_title("МНК: квадраты ошибок до прямой")
    style(ax)
    save(fig, "ols.png")


def fig_sigmoid() -> None:
    x = np.linspace(-8, 8, 400)
    y = 1 / (1 + np.exp(-x))
    fig, ax = plt.subplots(figsize=(5.1, 3.05))
    ax.plot(x, y, color=ACCENT, lw=2.4)
    ax.axhline(0.5, color=MUTED, ls="--", lw=0.8)
    ax.axvline(0, color=MUTED, ls="--", lw=0.8)
    ax.set_xlabel("x")
    ax.set_ylabel("y(x)")
    ax.set_title("Логистическая функция (сигмоида)")
    style(ax)
    save(fig, "logistic-sigmoid.png")


def fig_logistic_weights() -> None:
    x = np.linspace(-8, 8, 400)
    fig, ax = plt.subplots(figsize=(5.1, 3.15))
    for w1, c in [(0.6, MUTED), (1.2, ACCENT), (2.4, GREEN)]:
        ax.plot(x, 1 / (1 + np.exp(-(0 + w1 * x))), color=c, lw=2, label=rf"$w_1={w1}$")
    ax.legend(frameon=False)
    ax.set_xlabel("x")
    ax.set_ylabel("y(x)")
    ax.set_title("Веса логистической функции")
    style(ax)
    save(fig, "logistic-weights.png")


def fig_mse_mae() -> None:
    e = np.linspace(-3, 3, 400)
    fig, ax = plt.subplots(figsize=(5.1, 3.15))
    ax.plot(e, e**2, color=ACCENT, lw=2.2, label="MSE (квадрат ошибки)")
    ax.plot(e, np.abs(e), color=GREEN, lw=2.2, label="MAE (модуль ошибки)")
    ax.legend(frameon=False, loc="upper center")
    ax.set_xlabel("ошибка e = y_true − y_pred")
    ax.set_ylabel("штраф")
    ax.set_title("MSE сильнее штрафует большие отклонения")
    style(ax)
    save(fig, "mse-mae.png")


def fig_svm_hyperplane() -> None:
    rng = np.random.default_rng(1)
    a = rng.normal([-1.4, -1.2], 0.35, (18, 2))
    b = rng.normal([1.4, 1.2], 0.35, (18, 2))
    fig, ax = plt.subplots(figsize=(6.2, 4.2))
    ax.scatter(a[:, 0], a[:, 1], c=ACCENT, s=40, label="класс −1")
    ax.scatter(b[:, 0], b[:, 1], c=GREEN, s=40, label="класс +1")
    t = np.linspace(-2.8, 2.8, 50)
    ax.plot(t, -t, color=FG, lw=2, label=r"$w^{T}x + w_0 = 0$")
    ax.legend(frameon=False, loc="upper left")
    ax.set_title("SVM: разделяющая гиперплоскость")
    ax.set_aspect("equal")
    style(ax)
    save(fig, "svm-hyperplane.png")


def fig_svm_margin() -> None:
    fig, ax = plt.subplots(figsize=(5.1, 3.4))
    t = np.linspace(-2.6, 2.6, 50)
    ax.plot(t, -t, color=FG, lw=2, label="граница")
    ax.plot(t, -t + 1.1, color=MUTED, ls="--", label="зазор")
    ax.plot(t, -t - 1.1, color=MUTED, ls="--")
    sv_neg = np.array([[-0.7, -0.4], [-1.5, -0.4], [-0.2, -0.9]])
    sv_pos = np.array([[0.7, 0.4], [1.5, 0.4], [0.2, 0.9]])
    ax.scatter(*sv_neg.T, c=ACCENT, s=55, edgecolors=FG, lw=1.2, zorder=4, label="опорные векторы")
    ax.scatter(*sv_pos.T, c=GREEN, s=55, edgecolors=FG, lw=1.2, zorder=4)
    extra_n = np.array([[-2.1, -1.6], [-1.8, -2.0], [-2.4, -0.7]])
    extra_p = np.array([[2.1, 1.6], [1.8, 2.0], [2.4, 0.7]])
    ax.scatter(*extra_n.T, c=ACCENT, s=28)
    ax.scatter(*extra_p.T, c=GREEN, s=28)
    ax.legend(frameon=False, loc="upper right", fontsize=8)
    ax.set_title("Отступ (margin) и опорные векторы")
    ax.set_aspect("equal")
    style(ax)
    save(fig, "svm-margin.png")


def fig_nonlinear() -> None:
    rng = np.random.default_rng(0)
    n = 120
    r = rng.uniform(0.15, 0.85, n)
    ang = rng.uniform(0, 2 * np.pi, n)
    inner = np.c_[r * np.cos(ang), r * np.sin(ang)] * 0.9
    r2 = rng.uniform(1.4, 2.1, n)
    outer = np.c_[r2 * np.cos(ang), r2 * np.sin(ang)]
    fig, ax = plt.subplots(figsize=(6.2, 4.2))
    ax.scatter(inner[:, 0], inner[:, 1], c=ACCENT, s=18)
    ax.scatter(outer[:, 0], outer[:, 1], c=GREEN, s=18)
    circ = plt.Circle((0, 0), 1.15, fill=False, color=FG, lw=2)
    ax.add_patch(circ)
    ax.set_aspect("equal")
    ax.set_title("Линейно неразделимые классы, нелинейная граница")
    style(ax)
    save(fig, "svm-nonlinear.png")


def fig_two_blobs() -> None:
    rng = np.random.default_rng(4)
    ang = rng.uniform(0, 2 * np.pi, 80)
    inner = 0.55 * np.c_[np.cos(ang), np.sin(ang)] + rng.normal(0, 0.08, (80, 2))
    outer = 1.7 * np.c_[np.cos(ang), np.sin(ang)] + rng.normal(0, 0.1, (80, 2))
    fig, ax = plt.subplots(figsize=(6.2, 4.2))
    ax.scatter(inner[:, 0], inner[:, 1], c=ACCENT, s=28)
    ax.scatter(outer[:, 0], outer[:, 1], c=GREEN, s=28)
    ax.set_aspect("equal")
    ax.set_title("Два класса: линейной плоскостью в 2D не разделить")
    style(ax)
    save(fig, "kernel-2d.png")


def fig_kernel_3d(with_plane: bool) -> None:
    rng = np.random.default_rng(4)
    ang = rng.uniform(0, 2 * np.pi, 70)
    inner = 0.55 * np.c_[np.cos(ang), np.sin(ang)] + rng.normal(0, 0.06, (70, 2))
    outer = 1.7 * np.c_[np.cos(ang), np.sin(ang)] + rng.normal(0, 0.08, (70, 2))
    zi = inner[:, 0] ** 2 + inner[:, 1] ** 2
    zo = outer[:, 0] ** 2 + outer[:, 1] ** 2
    fig = plt.figure(figsize=(6.4, 4.6))
    ax = fig.add_subplot(111, projection="3d")
    ax.set_facecolor(BG)
    ax.scatter(inner[:, 0], inner[:, 1], zi, c=ACCENT, s=18)
    ax.scatter(outer[:, 0], outer[:, 1], zo, c=GREEN, s=18)
    if with_plane:
        xx, yy = np.meshgrid(np.linspace(-2, 2, 8), np.linspace(-2, 2, 8))
        zz = np.full_like(xx, 1.15)
        ax.plot_surface(xx, yy, zz, alpha=0.25, color=BLUE)
        ax.set_title("В 3D уже можно провести линейную границу")
    else:
        ax.set_title("Новый признак $z=x_1^2+x_2^2$ искривляет расположение")
    ax.set_xlabel("$x_1$")
    ax.set_ylabel("$x_2$")
    ax.set_zlabel("$z$")
    save(fig, "kernel-3d-plane.png" if with_plane else "kernel-3d.png")


def fig_bias_variance_curves() -> None:
    x = np.linspace(0.4, 8, 80)
    bias = 3.2 / x
    var = 0.08 * x ** 1.4
    tot = bias + var + 0.25
    fig, ax = plt.subplots(figsize=(6.4, 3.8))
    ax.plot(x, bias, color=ACCENT, lw=2, label="смещение")
    ax.plot(x, var, color=GREEN, lw=2, label="разброс")
    ax.plot(x, tot, color=FG, lw=2.2, label="суммарная ошибка")
    ax.axvline(2.6, color=MUTED, ls="--", lw=0.9)
    ax.set_xlabel("сложность модели")
    ax.set_ylabel("ошибка")
    ax.legend(frameon=False)
    ax.set_title("Компромисс смещения и разброса")
    style(ax)
    save(fig, "bias-variance-curves.png")


def fig_targets() -> None:
    fig, axes = plt.subplots(2, 2, figsize=(6.2, 6.2))
    titles = [
        ("низкое смещение,\nнизкий разброс", [(0.0, 0.0)] * 10),
        ("низкое смещение,\nвысокий разброс", None),
        ("высокое смещение,\nнизкий разброс", [(-0.55, 0.45)] * 10),
        ("высокое смещение,\nвысокий разброс", None),
    ]
    rng = np.random.default_rng(3)
    for ax, (title, pts) in zip(axes.ravel(), titles):
        ax.set_aspect("equal")
        ax.add_patch(Circle((0, 0), 1, fill=False, color=MUTED, lw=1))
        ax.add_patch(Circle((0, 0), 0.62, fill=False, color=MUTED, lw=0.8))
        ax.add_patch(Circle((0, 0), 0.28, fill=False, color=MUTED, lw=0.8))
        if pts is None:
            if "низкое смещение" in title:
                xy = rng.normal(0, 0.42, (12, 2))
            else:
                xy = rng.normal([-0.5, 0.4], 0.38, (12, 2))
        else:
            jitter = rng.normal(0, 0.06, (10, 2))
            xy = np.array(pts) + jitter
        ax.scatter(xy[:, 0], xy[:, 1], c=ACCENT, s=18)
        ax.set_xlim(-1.2, 1.2)
        ax.set_ylim(-1.2, 1.2)
        ax.axis("off")
        ax.set_title(title, fontsize=10)
    fig.suptitle("Смещение и разброс: мишени")
    save(fig, "bias-variance-targets.png")


def fig_svm_c() -> None:
    fig, axes = plt.subplots(1, 2, figsize=(7.4, 3.6))
    rng = np.random.default_rng(0)
    for ax, title, width in zip(axes, ["большое C, узкий зазор", "маленькое C, широкий зазор"], [0.7, 1.4]):
        a = rng.normal([-1.1, 0], 0.28, (16, 2))
        b = rng.normal([1.1, 0], 0.28, (16, 2))
        ax.scatter(a[:, 0], a[:, 1], c=ACCENT, s=28)
        ax.scatter(b[:, 0], b[:, 1], c=GREEN, s=28)
        ax.axvline(0, color=FG, lw=1.6)
        ax.axvline(-width, color=MUTED, ls="--")
        ax.axvline(width, color=MUTED, ls="--")
        ax.set_title(title, fontsize=11)
        style(ax)
    save(fig, "svm-c.png")


def fig_roc() -> None:
    fpr = np.array([0, 0.05, 0.12, 0.22, 0.4, 1])
    tpr = np.array([0, 0.55, 0.78, 0.9, 0.96, 1])
    fig, ax = plt.subplots(figsize=(4.6, 4.2))
    ax.plot(fpr, tpr, color=ACCENT, lw=2.4, label="модель")
    ax.plot([0, 1], [0, 1], color=MUTED, ls="--", label="случайный классификатор")
    ax.fill_between(fpr, tpr, alpha=0.12, color=ACCENT)
    ax.set_xlabel("FPR")
    ax.set_ylabel("TPR")
    ax.set_title("ROC-кривая")
    ax.legend(frameon=True, loc="lower right", facecolor=BG, edgecolor=MUTED, framealpha=0.95)
    style(ax)
    save(fig, "roc-curve.png")


def fig_confusion(multi: bool) -> None:
    if multi:
        mat = np.array([[1005, 80, 338], [60, 890, 120], [40, 55, 920]])
        labels = ["Rock", "Classical", "Electronic"]
        name = "confusion-multi.png"
        title = "Матрица ошибок, несколько классов"
    else:
        mat = np.array([[42, 7], [11, 40]])
        labels = ["класс 0", "класс 1"]
        name = "confusion.png"
        title = "Матрица ошибок"
    fig, ax = plt.subplots(figsize=(5.6, 4.8))
    im = ax.imshow(mat, cmap="YlOrBr")
    ax.set_xticks(range(len(labels)), labels)
    ax.set_yticks(range(len(labels)), labels)
    ax.set_xlabel("предсказано")
    ax.set_ylabel("истина")
    for i in range(mat.shape[0]):
        for j in range(mat.shape[1]):
            ax.text(j, i, str(mat[i, j]), ha="center", va="center", color=FG)
    ax.set_title(title)
    fig.colorbar(im, ax=ax, fraction=0.046)
    save(fig, name)


def fig_macro_micro() -> None:
    fig, ax = plt.subplots(figsize=(6.4, 3.4))
    ax.axis("off")
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4)
    boxes = [("P, R по классам", 0.4, 1.6), ("среднее", 4.1, 1.6), ("macro F1", 7.2, 1.6)]
    for text, x, y in boxes:
        ax.add_patch(FancyBboxPatch((x, y), 2.4, 1.2, boxstyle="round,pad=0.15", fc="#fffaf3", ec=ACCENT))
        ax.text(x + 1.2, y + 0.6, text, ha="center", va="center")
    ax.annotate("", xy=(4.1, 2.2), xytext=(2.8, 2.2), arrowprops=dict(arrowstyle="->", color=FG))
    ax.annotate("", xy=(7.2, 2.2), xytext=(6.5, 2.2), arrowprops=dict(arrowstyle="->", color=FG))
    ax.set_title("Макро-усреднение: сначала метрики классов, потом среднее")
    save(fig, "macro-avg.png")
    fig, ax = plt.subplots(figsize=(6.4, 3.4))
    ax.axis("off")
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4)
    boxes = [("суммарные TP/FP/FN", 0.3, 1.6), ("P и R", 4.1, 1.6), ("micro F1", 7.2, 1.6)]
    for text, x, y in boxes:
        ax.add_patch(FancyBboxPatch((x, y), 2.6, 1.2, boxstyle="round,pad=0.15", fc="#fffaf3", ec=GREEN))
        ax.text(x + 1.3, y + 0.6, text, ha="center", va="center")
    ax.annotate("", xy=(4.1, 2.2), xytext=(2.9, 2.2), arrowprops=dict(arrowstyle="->", color=FG))
    ax.annotate("", xy=(7.2, 2.2), xytext=(6.7, 2.2), arrowprops=dict(arrowstyle="->", color=FG))
    ax.set_title("Микро-усреднение: сначала ответы, потом метрики")
    save(fig, "micro-avg.png")


def fig_f1() -> None:
    fig, ax = plt.subplots(figsize=(6.2, 3.6))
    ax.bar([0, 1, 2], [0.71, 0.68, 0.69], color=[ACCENT, GREEN, BLUE], width=0.55)
    ax.set_xticks([0, 1, 2], ["macro F1", "micro F1", "среднее F1 классов"])
    ax.set_ylim(0, 1)
    ax.set_title("Три способа получить итоговую F1")
    style(ax)
    save(fig, "f1-avg.png")


def fig_tomek() -> None:
    rng = np.random.default_rng(2)
    maj = rng.normal([-0.4, -0.2], 0.55, (36, 2))
    minor = rng.normal([1.5, 0.35], 0.22, (10, 2))
    fig, axes = plt.subplots(1, 2, figsize=(6.2, 3.15))
    axes[0].scatter(maj[:, 0], maj[:, 1], c=ACCENT, s=22)
    axes[0].scatter(minor[:, 0], minor[:, 1], c=GREEN, s=36)
    axes[0].plot([0.7, 1.15], [0.05, 0.2], color=FG, lw=1.2)
    axes[0].set_title("Связи Томека")
    axes[1].scatter(maj[:-5, 0], maj[:-5, 1], c=ACCENT, s=22)
    axes[1].scatter(minor[:, 0], minor[:, 1], c=GREEN, s=36)
    axes[1].set_title("Мажорные из пар удалены")
    for ax in axes:
        style(ax)
        ax.set_xlim(-2.0, 2.3)
        ax.set_ylim(-1.7, 1.5)
    fig.legend(
        [
            plt.Line2D([0], [0], marker="o", color="none", markerfacecolor=ACCENT, markersize=7),
            plt.Line2D([0], [0], marker="o", color="none", markerfacecolor=GREEN, markersize=8),
        ],
        ["мажорный", "минорный"],
        loc="upper center",
        ncol=2,
        frameon=False,
        bbox_to_anchor=(0.5, 1.12),
    )
    save(fig, "tomek.png")


def fig_threshold() -> None:
    thr = np.linspace(0.05, 0.95, 80)
    prec = np.clip(0.38 + 0.55 * thr + 0.05 * np.sin(6 * thr), 0, 1)
    rec = np.clip(0.97 - 0.78 * thr, 0, 1)
    f1 = 2 * prec * rec / (prec + rec)
    best = thr[np.argmax(f1)]
    fig, axes = plt.subplots(1, 2, figsize=(6.2, 3.05))
    axes[0].plot(thr, prec, color=ACCENT, lw=2, label="precision")
    axes[0].plot(thr, rec, color=GREEN, lw=2, label="recall")
    axes[0].set_title("Precision и recall")
    axes[1].plot(thr, f1, color=BLUE, lw=2, label="F1")
    axes[1].axvline(best, color=RED, ls="--", lw=1, label="лучший порог")
    axes[1].set_title("F1-мера")
    for ax in axes:
        ax.set_xlabel("порог вероятности")
        ax.set_ylim(0, 1.05)
        ax.legend(frameon=False, loc="best", fontsize=8)
        style(ax)
    save(fig, "threshold.png")


def fig_kfold() -> None:
    fig, ax = plt.subplots(figsize=(6.8, 2.8))
    ax.set_xlim(0, 5)
    ax.set_ylim(0, 5.2)
    ax.axis("off")
    colors = [ACCENT if i == j else "#d7c4a8" for i in range(5) for j in range(5)]
    k = 0
    for fold in range(5):
        for part in range(5):
            color = ACCENT if part == (4 - fold) else "#e7d7bf"
            ax.add_patch(Rectangle((part, fold + 0.15), 0.92, 0.7, fc=color, ec=MUTED))
        ax.text(-0.15, fold + 0.5, f"фолд {fold+1}", ha="right", va="center", fontsize=9)
    ax.text(2.5, 5.0, "кросс-валидация: валидационный блок скользит", ha="center")
    save(fig, "kfold.png")


def fig_grid_random() -> None:
    rng = np.random.default_rng(1)
    fig, axes = plt.subplots(1, 2, figsize=(7.4, 3.6))
    xs, ys = np.meshgrid(np.linspace(0.2, 3.8, 5), np.linspace(0.2, 3.8, 5))
    axes[0].scatter(xs, ys, c=ACCENT, s=28)
    axes[0].set_title("GridSearch: все комбинации")
    pts = rng.uniform(0.2, 3.8, (12, 2))
    axes[1].scatter(pts[:, 0], pts[:, 1], c=GREEN, s=36)
    axes[1].set_title("RandomizedSearch: случайные точки")
    for ax in axes:
        ax.set_xlim(0, 4)
        ax.set_ylim(0, 4)
        ax.set_xlabel("гиперпараметр 1")
        ax.set_ylabel("гиперпараметр 2")
        style(ax)
    save(fig, "grid-vs-random.png")


def fig_bayes(step: int) -> None:
    rng = np.random.default_rng(0)
    x = np.linspace(0, 10, 200)
    target = np.sin(0.7 * x) + 0.15 * x
    fig, ax = plt.subplots(figsize=(6.4, 3.6))
    ax.plot(x, target, color="#6b4c9a", lw=2, label="целевая")
    n = [1, 2, 3, 4, 5][step]
    xs = np.array([1.2, 4.0, 7.3, 2.6, 8.8][:n])
    ys = np.sin(0.7 * xs) + 0.15 * xs
    # crude surrogate
    from numpy.polynomial.polynomial import polyfit, polyval

    if n == 1:
        surr = np.full_like(x, ys[0])
        band = np.full_like(x, 1.1)
    else:
        coef = polyfit(xs, ys, min(n, 3))
        surr = polyval(x, coef)
        band = 0.9 / (1 + 2 * n * np.exp(-((x[:, None] - xs) ** 2).min(axis=1)))
    ax.plot(x, surr, color=GREEN, lw=2, label="суррогат")
    ax.fill_between(x, surr - band, surr + band, color=GREEN, alpha=0.15)
    ax.scatter(xs, ys, c=FG, s=40, zorder=4)
    if step == 4:
        acq = band
        ax.plot(x, acq * 0.4 - 1.6, color=RED, lw=1.6, label="функция сбора")
    ax.legend(frameon=False, fontsize=8)
    ax.set_title(f"Байесовская оптимизация, шаг {step + 1}")
    style(ax)
    save(fig, f"bayes-{step + 1}.png")


def fig_optuna() -> None:
    rng = np.random.default_rng(2)
    trials = np.arange(1, 31)
    best = 0.62 + 0.25 * (1 - np.exp(-trials / 8)) + rng.normal(0, 0.01, 30)
    fig, ax = plt.subplots(figsize=(6.4, 3.6))
    ax.plot(trials, np.maximum.accumulate(best), color=ACCENT, lw=2)
    ax.scatter(trials, best, c=MUTED, s=16, alpha=0.6)
    ax.set_xlabel("trial")
    ax.set_ylabel("метрика")
    ax.set_title("История оптимизации Optuna")
    style(ax)
    save(fig, "optuna-history.png")


def fig_corr() -> None:
    rng = np.random.default_rng(0)
    a = rng.random((6, 6))
    a = (a + a.T) / 2
    np.fill_diagonal(a, 1)
    a[0, 1] = a[1, 0] = 1.0
    labels = ["target", "оценка", "цена", "время", "возраст", "класс"]
    fig, ax = plt.subplots(figsize=(5.8, 5.0))
    im = ax.imshow(a, cmap="YlOrBr", vmin=0, vmax=1)
    ax.set_xticks(range(6), labels, rotation=35, ha="right")
    ax.set_yticks(range(6), labels)
    ax.set_title("Корреляции: target и «оценка» = 1")
    fig.colorbar(im, ax=ax, fraction=0.046)
    save(fig, "corr-heatmap.png")


def fig_scatter_metric(name: str, corr: float, fname: str) -> None:
    rng = np.random.default_rng(abs(hash(name)) % 10_000)
    x = rng.uniform(10, 100, 40)
    y = corr * (x / 100) + (1 - abs(corr)) * rng.random(40)
    y = 0.4 + 0.5 * y
    fig, ax = plt.subplots(figsize=(5.6, 3.8))
    ax.scatter(x, y, c=ACCENT, s=28)
    ax.set_xlabel("money")
    ax.set_ylabel(name)
    ax.set_title(f"{name} против money")
    style(ax)
    save(fig, fname)


def fig_shap_beeswarm(name: str) -> None:
    rng = np.random.default_rng(1)
    fig, ax = plt.subplots(figsize=(6.4, 4.2))
    feats = [f"x_{i}" for i in range(8, 0, -1)]
    for i, f in enumerate(feats):
        n = 40
        val = rng.normal(0, 0.15 + 0.04 * i, n)
        color = rng.uniform(0, 1, n)
        ax.scatter(val, np.full(n, i) + rng.normal(0, 0.08, n), c=color, cmap="coolwarm", s=12)
    ax.set_yticks(range(8), feats)
    ax.axvline(0, color=MUTED, lw=0.8)
    ax.set_xlabel("SHAP value")
    ax.set_title("SHAP beeswarm")
    style(ax)
    save(fig, name)


def fig_shap_water(name: str) -> None:
    contrib = np.array([0.4, -0.25, 0.18, -0.12, 0.08, -0.05])
    labels = [f"x_{i}" for i in range(1, 7)]
    fig, ax = plt.subplots(figsize=(6.4, 3.8))
    start = 0.1
    colors = [GREEN if v > 0 else ACCENT for v in contrib]
    lefts = []
    cur = start
    for v in contrib:
        lefts.append(cur if v > 0 else cur + v)
        cur += v
    ax.barh(labels[::-1], np.abs(contrib[::-1]), left=np.array(lefts[::-1]), color=colors[::-1])
    ax.set_xlabel("вклад в предсказание")
    ax.set_title("SHAP waterfall")
    style(ax)
    save(fig, name)


def fig_shap_bar(name: str) -> None:
    fig, ax = plt.subplots(figsize=(6.2, 3.8))
    feats = [f"x_{i}" for i in range(1, 8)]
    vals = np.array([0.22, 0.18, 0.15, 0.11, 0.09, 0.07, 0.04])
    ax.barh(feats[::-1], vals[::-1], color=ACCENT)
    ax.set_xlabel("средний |SHAP|")
    ax.set_title("Важность признаков")
    style(ax)
    save(fig, name)


def fig_pipeline(name: str, boxes: list[str], title: str) -> None:
    fig, ax = plt.subplots(figsize=(7.2, 2.4))
    ax.set_xlim(0, len(boxes) * 2.2)
    ax.set_ylim(0, 2)
    ax.axis("off")
    for i, text in enumerate(boxes):
        x = 0.15 + i * 2.2
        ax.add_patch(FancyBboxPatch((x, 0.55), 1.9, 0.9, boxstyle="round,pad=0.12", fc="#fffaf3", ec=ACCENT))
        ax.text(x + 0.95, 1.0, text, ha="center", va="center", fontsize=9)
        if i < len(boxes) - 1:
            ax.annotate("", xy=(x + 2.15, 1.0), xytext=(x + 2.05, 1.0),
                        arrowprops=dict(arrowstyle="->", color=FG))
    ax.set_title(title)
    save(fig, name)


def fig_manhattan() -> None:
    fig, ax = plt.subplots(figsize=(5.4, 4.4))
    ax.plot([0, 3], [0, 2], color=GREEN, lw=2, label="евклидово")
    ax.plot([0, 3, 3], [0, 0, 2], color=ACCENT, lw=2, label="манхэттенское")
    ax.scatter([0, 3], [0, 2], c=FG, s=40, zorder=3)
    ax.text(0.1, 0.15, "a")
    ax.text(3.05, 2.05, "b")
    ax.set_aspect("equal")
    ax.legend(frameon=False)
    ax.set_title("Евклидово и манхэттенское расстояние")
    style(ax)
    save(fig, "manhattan.png")


def fig_knn() -> None:
    rng = np.random.default_rng(1)
    a = rng.normal([0, 0], 0.5, (16, 2))
    b = rng.normal([1.6, 1.2], 0.45, (16, 2))
    q = np.array([0.9, 0.55])
    fig, ax = plt.subplots(figsize=(5.6, 4.4))
    ax.scatter(a[:, 0], a[:, 1], c=ACCENT, s=36, label="класс 0")
    ax.scatter(b[:, 0], b[:, 1], c=GREEN, s=36, label="класс 1")
    ax.scatter(*q, c=BLUE, s=90, marker="*", zorder=4, label="новый объект")
    circ = plt.Circle(q, 0.7, fill=False, ls="--", color=MUTED)
    ax.add_patch(circ)
    ax.set_aspect("equal")
    ax.legend(frameon=False)
    ax.set_title("kNN: класс по ближайшим соседям")
    style(ax)
    save(fig, "knn.png")


def fig_overfit() -> None:
    rng = np.random.default_rng(0)
    x = np.linspace(0, 1, 12)
    y = np.sin(2 * np.pi * x) + rng.normal(0, 0.15, size=x.size)
    xs = np.linspace(0, 1, 200)
    p_hi = np.polyfit(x, y, 9)
    p_lo = np.polyfit(x, y, 1)
    fig, axes = plt.subplots(1, 2, figsize=(7.4, 3.4))
    axes[0].scatter(x, y, c=ACCENT, zorder=3)
    axes[0].plot(xs, np.polyval(p_lo, xs), color=GREEN)
    axes[0].set_title("недообучение")
    axes[1].scatter(x, y, c=ACCENT, zorder=3)
    axes[1].plot(xs, np.polyval(p_hi, xs), color=RED)
    axes[1].set_title("переобучение")
    for ax in axes:
        style(ax)
    save(fig, "overfit.png")


def fig_l1_l2() -> None:
    fig, axes = plt.subplots(1, 2, figsize=(7.2, 3.6))
    t = np.linspace(-2, 2, 400)
    w1, w2 = np.meshgrid(t, t)
    axes[0].contour(w1, w2, np.abs(w1) + np.abs(w2), levels=[1], colors=ACCENT, linewidths=2)
    axes[0].contour(w1, w2, (w1 - 1.2) ** 2 + (w2 - 0.8) ** 2, levels=[0.4, 0.9, 1.5], colors=MUTED)
    axes[0].set_title("L1: ромб, веса могут обнулиться")
    axes[1].contour(w1, w2, w1**2 + w2**2, levels=[1], colors=GREEN, linewidths=2)
    axes[1].contour(w1, w2, (w1 - 1.2) ** 2 + (w2 - 0.8) ** 2, levels=[0.4, 0.9, 1.5], colors=MUTED)
    axes[1].set_title("L2: круг, веса сжимаются")
    for ax in axes:
        ax.set_aspect("equal")
        style(ax)
        ax.set_xlabel("$w_1$")
        ax.set_ylabel("$w_2$")
    save(fig, "l1-l2.png")


def fig_class_vs_reg() -> None:
    rng = np.random.default_rng(0)
    x = rng.uniform(0, 10, 40)
    y = 0.45 * x + rng.normal(0, 0.7, 40)
    fig, axes = plt.subplots(1, 2, figsize=(7.4, 3.4))
    axes[0].scatter(x, y, c=ACCENT, s=28)
    axes[0].set_title("регрессия: связь, не граница")
    cls = x + rng.normal(0, 1.1, 40) > 5
    axes[1].scatter(x, rng.uniform(-0.2, 0.2, 40) + cls, c=np.where(cls, GREEN, ACCENT), s=28)
    axes[1].set_yticks([0, 1], ["класс 0", "класс 1"])
    axes[1].set_title("классификация: метка класса")
    for ax in axes:
        style(ax)
        ax.set_xlabel("x")
    save(fig, "class-vs-reg.png")


def fig_stats_venn() -> None:
    fig, ax = plt.subplots(figsize=(5.2, 3.2))
    ax.add_patch(Rectangle((0.05, 0.08), 0.9, 0.84, fill=False, lw=1.4, edgecolor=MUTED))
    c1 = Circle((0.38, 0.5), 0.22, facecolor=ACCENT, alpha=0.25, edgecolor=ACCENT)
    c2 = Circle((0.62, 0.5), 0.22, facecolor=BLUE, alpha=0.25, edgecolor=BLUE)
    ax.add_patch(c1)
    ax.add_patch(c2)
    ax.text(0.28, 0.5, "A", ha="center", va="center")
    ax.text(0.72, 0.5, "B", ha="center", va="center")
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    save(fig, "stats-venn.png")


def fig_stats_normal() -> None:
    x = np.linspace(-4, 4, 400)
    y = np.exp(-0.5 * x**2) / np.sqrt(2 * np.pi)
    fig, ax = plt.subplots(figsize=(5.2, 3.1))
    ax.plot(x, y, color=GREEN, lw=2)
    ax.fill_between(x, y, color=GREEN, alpha=0.12)
    ax.axvline(0, color=MUTED, lw=0.8, ls="--")
    ax.set_xlabel("x")
    style(ax)
    save(fig, "stats-normal.png")


def fig_stats_sigma() -> None:
    x = np.linspace(-4, 4, 400)
    y = np.exp(-0.5 * x**2) / np.sqrt(2 * np.pi)
    fig, ax = plt.subplots(figsize=(5.4, 3.1))
    ax.plot(x, y, color=FG, lw=1.6)
    for a, b, c in ((-1, 1, GREEN), (-2, 2, ACCENT), (-3, 3, BLUE)):
        m = (x >= a) & (x <= b)
        ax.fill_between(x[m], y[m], color=c, alpha=0.18)
    ax.set_xticks([-3, -2, -1, 0, 1, 2, 3], [r"$-3\sigma$", r"$-2\sigma$", r"$-\sigma$", r"$\mu$", r"$\sigma$", r"$2\sigma$", r"$3\sigma$"])
    style(ax)
    save(fig, "stats-sigma.png")


def fig_stats_hist() -> None:
    rng = np.random.default_rng(3)
    data = rng.normal(50, 12, 180)
    fig, ax = plt.subplots(figsize=(5.2, 3.1))
    ax.hist(data, bins=12, color=ACCENT, alpha=0.85, edgecolor=BG)
    style(ax)
    save(fig, "stats-hist.png")


def fig_stats_binomial() -> None:
    from math import comb
    n, p = 12, 0.45
    ks = np.arange(0, n + 1)
    ps = [comb(n, int(k)) * p**k * (1 - p) ** (n - k) for k in ks]
    fig, ax = plt.subplots(figsize=(5.2, 3.1))
    ax.bar(ks, ps, color=BLUE, alpha=0.9)
    style(ax)
    ax.set_xlabel("k")
    save(fig, "stats-binomial.png")


def fig_biz_funnel() -> None:
    fig, ax = plt.subplots(figsize=(5.2, 3.2))
    widths = [0.9, 0.62, 0.38]
    labels = ["визит", "интерес", "покупка"]
    y = 0.78
    for w, lab in zip(widths, labels):
        ax.add_patch(FancyBboxPatch((0.5 - w / 2, y - 0.14), w, 0.18, boxstyle="round,pad=0.02", facecolor=ACCENT, alpha=0.35, edgecolor=ACCENT))
        ax.text(0.5, y - 0.05, lab, ha="center", va="center")
        y -= 0.24
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    save(fig, "biz-funnel.png")


def fig_biz_ab() -> None:
    fig, ax = plt.subplots(figsize=(5.2, 3.0))
    ax.add_patch(FancyBboxPatch((0.08, 0.25), 0.36, 0.5, boxstyle="round,pad=0.03", facecolor=MUTED, alpha=0.18, edgecolor=MUTED))
    ax.add_patch(FancyBboxPatch((0.56, 0.25), 0.36, 0.5, boxstyle="round,pad=0.03", facecolor=GREEN, alpha=0.2, edgecolor=GREEN))
    ax.text(0.26, 0.5, "A\nконтроль", ha="center", va="center")
    ax.text(0.74, 0.5, "B\nтест", ha="center", va="center")
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    save(fig, "biz-ab.png")


def fig_complexity() -> None:
    n = np.linspace(1, 40, 200)
    fig, ax = plt.subplots(figsize=(5.4, 3.2))
    ax.plot(n, np.ones_like(n) * 8, color=MUTED, label=r"$T(n)\sim 1$")
    ax.plot(n, n, color=BLUE, label=r"$T(n)\sim n$")
    ax.plot(n, (n**2) / 40, color=ACCENT, label=r"$T(n)\sim n^2$")
    ax.plot(n, (n**3) / 1600, color=RED, label=r"$T(n)\sim n^3$")
    ax.set_xlabel("n")
    ax.set_ylabel("T(n)")
    ax.legend(frameon=False)
    style(ax)
    save(fig, "nm-complexity.png")


def fig_bisection() -> None:
    x = np.linspace(-0.2, 2.4, 300)
    y = x**3 - x**2 - 2 * x
    fig, ax = plt.subplots(figsize=(5.4, 3.2))
    ax.plot(x, y, color=FG, lw=1.6)
    ax.axhline(0, color=MUTED, lw=0.8)
    a, b = 0.2, 2.2
    ax.plot([a, b], [0, 0], color=ACCENT, lw=4, solid_capstyle="round")
    ax.scatter([a, (a + b) / 2, b], [0, 0, 0], c=[RED, GREEN, BLUE], s=28, zorder=3)
    style(ax)
    ax.set_xlabel("x")
    save(fig, "nm-bisection.png")


def fig_gd() -> None:
    w = np.linspace(-2, 6, 300)
    loss = (w - 3) ** 2 + 0.4
    fig, ax = plt.subplots(figsize=(5.4, 3.2))
    ax.plot(w, loss, color=FG)
    x = -1.2
    for _ in range(6):
        grad = 2 * (x - 3)
        nxt = x - 0.35 * grad
        ax.annotate("", xy=(nxt, (nxt - 3) ** 2 + 0.4), xytext=(x, (x - 3) ** 2 + 0.4), arrowprops={"arrowstyle": "->", "color": ACCENT})
        x = nxt
    ax.scatter([3], [0.4], c=GREEN, s=36, zorder=3)
    style(ax)
    ax.set_xlabel("w")
    save(fig, "nm-gd.png")


def fig_sgd() -> None:
    t = np.arange(0, 28)
    batch = 4 * np.exp(-t / 9)
    rng = np.random.default_rng(1)
    stoch = batch + rng.normal(0, 0.18, size=t.size) * np.exp(-t / 14)
    fig, ax = plt.subplots(figsize=(5.4, 3.2))
    ax.plot(t, batch, color=GREEN, lw=2, label="пакет")
    ax.plot(t, stoch, color=ACCENT, lw=1.2, label="SGD")
    ax.legend(frameon=False)
    style(ax)
    ax.set_xlabel("шаг")
    save(fig, "nm-sgd.png")


def fig_neuron() -> None:
    fig, ax = plt.subplots(figsize=(5.6, 3.2))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis("off")
    for i, y in enumerate((4.6, 3.0, 1.4)):
        ax.add_patch(Circle((1.2, y), 0.38, facecolor=BG, edgecolor=FG, lw=1.2))
        ax.text(1.2, y, f"x{i+1}", ha="center", va="center", fontsize=8)
        ax.annotate("", xy=(4.3, 3.0), xytext=(1.6, y), arrowprops={"arrowstyle": "->", "color": MUTED})
    ax.add_patch(Circle((4.8, 3.0), 0.62, facecolor=ACCENT, alpha=0.25, edgecolor=ACCENT, lw=1.4))
    ax.text(4.8, 3.0, "Σ", ha="center", va="center")
    ax.annotate("", xy=(7.2, 3.0), xytext=(5.5, 3.0), arrowprops={"arrowstyle": "->", "color": FG})
    ax.add_patch(FancyBboxPatch((7.2, 2.45), 1.8, 1.1, boxstyle="round,pad=0.08", facecolor=GREEN, alpha=0.2, edgecolor=GREEN))
    ax.text(8.1, 3.0, "σ", ha="center", va="center")
    save(fig, "dl-neuron.png")


def fig_activations() -> None:
    x = np.linspace(-4, 4, 400)
    fig, ax = plt.subplots(figsize=(5.4, 3.2))
    ax.plot(x, 1 / (1 + np.exp(-x)), color=ACCENT, label="sigmoid")
    ax.plot(x, np.tanh(x), color=BLUE, label="tanh")
    ax.plot(x, np.maximum(0, x) / 4, color=GREEN, label="ReLU / 4")
    ax.legend(frameon=False)
    style(ax)
    ax.set_xlabel("x")
    save(fig, "dl-activations.png")


def fig_backprop() -> None:
    fig, ax = plt.subplots(figsize=(5.6, 3.0))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4)
    ax.axis("off")
    xs = (1.5, 5.0, 8.5)
    labels = ("вход", "скрытый", "выход")
    for x, lab in zip(xs, labels):
        ax.add_patch(Circle((x, 2), 0.7, facecolor=BG, edgecolor=FG, lw=1.3))
        ax.text(x, 2, lab, ha="center", va="center", fontsize=8)
    ax.annotate("", xy=(4.2, 2), xytext=(2.3, 2), arrowprops={"arrowstyle": "->", "color": MUTED})
    ax.annotate("", xy=(7.7, 2), xytext=(5.8, 2), arrowprops={"arrowstyle": "->", "color": MUTED})
    ax.annotate("", xy=(5.8, 1.1), xytext=(7.7, 1.1), arrowprops={"arrowstyle": "->", "color": RED})
    ax.text(6.7, 0.7, "ошибка", ha="center", color=RED, fontsize=8)
    save(fig, "dl-backprop.png")


def fig_dropout() -> None:
    fig, ax = plt.subplots(figsize=(5.2, 3.0))
    ax.set_xlim(0, 8)
    ax.set_ylim(0, 5)
    ax.axis("off")
    rng = np.random.default_rng(4)
    for i in range(6):
        y = 0.6 + i * 0.7
        dropped = i in (1, 4)
        ax.add_patch(Circle((4, y), 0.28, facecolor=BG if dropped else ACCENT, edgecolor=MUTED if dropped else ACCENT, lw=1.2, alpha=0.35 if dropped else 1))
        if dropped:
            ax.plot([3.7, 4.3], [y - 0.18, y + 0.18], color=RED, lw=1.2)
    save(fig, "dl-dropout.png")


def fig_ts_series() -> None:
    t = np.arange(0, 180)
    y = 20 + 0.04 * t + 6 * np.sin(2 * np.pi * t / 30) + np.random.default_rng(0).normal(0, 0.6, t.size)
    fig, ax = plt.subplots(figsize=(5.6, 3.1))
    ax.plot(t, y, color=ACCENT, lw=1)
    style(ax)
    ax.set_xlabel("t")
    save(fig, "ts-series.png")


def fig_ts_rolling() -> None:
    t = np.arange(0, 160)
    rng = np.random.default_rng(2)
    y = 10 + 3 * np.sin(2 * np.pi * t / 24) + rng.normal(0, 0.7, t.size)
    kernel = np.ones(9) / 9
    roll = np.convolve(y, kernel, mode="same")
    fig, ax = plt.subplots(figsize=(5.6, 3.1))
    ax.plot(t, y, color=MUTED, lw=0.8, label="ряд")
    ax.plot(t, roll, color=ACCENT, lw=2, label="скользящее среднее")
    ax.legend(frameon=False)
    style(ax)
    ax.set_xlabel("t")
    save(fig, "ts-rolling.png")


def fig_ts_diff() -> None:
    t = np.arange(0, 80)
    y = 2 + 0.15 * t + np.sin(t / 3)
    fig, ax = plt.subplots(figsize=(5.6, 3.1))
    ax.plot(t, y, color=MUTED, label="ряд")
    ax.plot(t[1:], np.diff(y), color=BLUE, label="разность")
    ax.legend(frameon=False)
    style(ax)
    ax.set_xlabel("t")
    save(fig, "ts-diff.png")


def fig_bow() -> None:
    words = ["ехать", "Москва", "Петербург", "Фёдор"]
    counts = [1, 1, 1, 1]
    fig, ax = plt.subplots(figsize=(5.2, 3.0))
    ax.bar(words, counts, color=ACCENT)
    style(ax)
    save(fig, "nlp-bow.png")


def fig_tfidf() -> None:
    words = ["и", "в", "тупик", "лемма"]
    vals = [0.05, 0.08, 0.72, 0.41]
    fig, ax = plt.subplots(figsize=(5.2, 3.0))
    ax.bar(words, vals, color=BLUE)
    style(ax)
    save(fig, "nlp-tfidf.png")


def fig_rgb() -> None:
    fig, axes = plt.subplots(1, 3, figsize=(5.6, 2.2))
    tile = np.zeros((8, 8, 3))
    colors = [(0.75, 0.22, 0.18), (0.25, 0.55, 0.28), (0.22, 0.35, 0.7)]
    names = ("R", "G", "B")
    for ax, color, name in zip(axes, colors, names):
        img = np.zeros((8, 8, 3))
        img[..., 0] = color[0]
        img[..., 1] = color[1]
        img[..., 2] = color[2]
        ax.imshow(img)
        ax.set_xticks([])
        ax.set_yticks([])
        ax.set_xlabel(name)
    fig.tight_layout()
    save(fig, "cv-rgb.png")


def fig_conv() -> None:
    img = np.zeros((8, 8))
    img[2:6, 2:6] = 1
    fig, ax = plt.subplots(figsize=(4.2, 3.4))
    ax.imshow(img, cmap="Greys", vmin=0, vmax=1)
    ax.add_patch(Rectangle((-0.5, -0.5), 3, 3, fill=False, edgecolor=ACCENT, lw=2))
    ax.set_xticks([])
    ax.set_yticks([])
    save(fig, "cv-conv.png")


def fig_pool() -> None:
    grid = np.array([[1, 3, 0, 2], [4, 2, 1, 0], [0, 1, 5, 1], [2, 0, 1, 3]])
    fig, axes = plt.subplots(1, 2, figsize=(5.2, 2.6))
    axes[0].imshow(grid, cmap="Oranges")
    axes[1].imshow(np.array([[4, 2], [2, 5]]), cmap="Oranges")
    for ax in axes:
        ax.set_xticks([])
        ax.set_yticks([])
    save(fig, "cv-pool.png")


def fig_iou() -> None:
    fig, ax = plt.subplots(figsize=(4.6, 3.2))
    ax.add_patch(Rectangle((0.15, 0.2), 0.5, 0.55, fill=True, facecolor=BLUE, alpha=0.35, edgecolor=BLUE, lw=1.4))
    ax.add_patch(Rectangle((0.38, 0.35), 0.48, 0.5, fill=True, facecolor=ACCENT, alpha=0.35, edgecolor=ACCENT, lw=1.4))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    save(fig, "cv-iou.png")


def fig_tree_split() -> None:
    fig, ax = plt.subplots(figsize=(5.4, 3.3))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.2)
    ax.axis("off")

    def box(x, y, text, color):
        ax.add_patch(
            FancyBboxPatch(
                (x, y),
                2.6,
                0.95,
                boxstyle="round,pad=0.04,rounding_size=0.08",
                facecolor=BG,
                edgecolor=color,
                lw=1.5,
            )
        )
        ax.text(x + 1.3, y + 0.48, text, ha="center", va="center", fontsize=9)

    box(3.7, 4.7, "x₁ ≤ t ?", ACCENT)
    box(0.8, 2.5, "лист: среднее y", GREEN)
    box(6.6, 2.5, "x₂ ≤ s ?", ACCENT)
    box(5.3, 0.45, "класс 0", BLUE)
    box(8.0, 0.45, "класс 1", RED)
    ax.plot([5.0, 2.1], [4.7, 3.45], color=MUTED, lw=1.1)
    ax.plot([5.0, 7.9], [4.7, 3.45], color=MUTED, lw=1.1)
    ax.plot([7.9, 6.6], [2.5, 1.4], color=MUTED, lw=1.1)
    ax.plot([7.9, 9.3], [2.5, 1.4], color=MUTED, lw=1.1)
    ax.text(2.6, 4.15, "да", color=MUTED, fontsize=8)
    ax.text(6.6, 4.15, "нет", color=MUTED, fontsize=8)
    save(fig, "tree-split.png")


def fig_kmeans() -> None:
    rng = np.random.default_rng(3)
    centers = np.array([[0.0, 0.0], [2.4, 0.4], [1.1, 2.2]])
    clouds = [c + rng.normal(0, 0.38, size=(18, 2)) for c in centers]
    colors = [ACCENT, GREEN, BLUE]
    fig, ax = plt.subplots(figsize=(5.1, 3.2))
    for cloud, color, center in zip(clouds, colors, centers):
        ax.scatter(cloud[:, 0], cloud[:, 1], c=color, s=28, zorder=2)
        ax.scatter([center[0]], [center[1]], c=FG, s=70, marker="x", zorder=3)
    ax.set_xlabel("x₁")
    ax.set_ylabel("x₂")
    style(ax)
    save(fig, "kmeans.png")


def fig_pca() -> None:
    rng = np.random.default_rng(4)
    z = rng.normal(size=(80, 2))
    z[:, 1] *= 0.28
    theta = np.deg2rad(32)
    rot = np.array([[np.cos(theta), -np.sin(theta)], [np.sin(theta), np.cos(theta)]])
    pts = z @ rot.T
    direction = rot[:, 0]
    line = np.linspace(-2.6, 2.6, 2)
    fig, ax = plt.subplots(figsize=(5.1, 3.2))
    ax.scatter(pts[:, 0], pts[:, 1], c=ACCENT, s=22, alpha=0.9)
    ax.plot(direction[0] * line, direction[1] * line, color=GREEN, lw=2)
    ax.set_xlabel("x₁")
    ax.set_ylabel("x₂")
    ax.set_aspect("equal")
    style(ax)
    save(fig, "pca-axis.png")


def course_figures() -> None:
    fig_complexity()
    fig_bisection()
    fig_gd()
    fig_sgd()
    fig_neuron()
    fig_activations()
    fig_backprop()
    fig_dropout()
    fig_ts_series()
    fig_ts_rolling()
    fig_ts_diff()
    fig_bow()
    fig_tfidf()
    fig_rgb()
    fig_conv()
    fig_pool()
    fig_iou()


def main() -> None:
    fig_class_vs_reg()
    fig_ols()
    fig_sigmoid()
    fig_logistic_weights()
    fig_mse_mae()
    fig_svm_hyperplane()
    fig_svm_margin()
    fig_nonlinear()
    fig_two_blobs()
    fig_kernel_3d(False)
    fig_kernel_3d(True)
    fig_bias_variance_curves()
    fig_targets()
    fig_svm_c()
    fig_roc()
    fig_confusion(False)
    fig_confusion(True)
    fig_macro_micro()
    fig_f1()
    fig_tomek()
    fig_threshold()
    fig_kfold()
    fig_grid_random()
    for i in range(5):
        fig_bayes(i)
    fig_optuna()
    fig_corr()
    fig_scatter_metric("accuracy", 0.05, "money-acc.png")
    fig_scatter_metric("ROC-AUC", 0.35, "money-roc.png")
    fig_scatter_metric("F1", 0.55, "money-f1.png")
    fig_scatter_metric("F1 sync", 0.82, "money-f1b.png")
    fig_shap_beeswarm("shap-beeswarm.png")
    fig_shap_water("shap-water.png")
    fig_shap_bar("shap-bar.png")
    fig_shap_beeswarm("shap-beeswarm-2.png")
    fig_shap_water("shap-water-2.png")
    fig_pipeline("pipe-before.png", ["данные", "OHE", "imputer", "модель"], "Шаги по отдельности")
    fig_pipeline("pipe-ohe.png", ["OHE", "Ordinal", "passthrough"], "Кодирование в пайплайне")
    fig_pipeline("pipe-final.png", ["препроцессинг", "модель"], "Итоговый пайплайн")
    fig_pipeline("pipe-grid.png", ["scaler?", "модель", "GridSearch"], "Пайплайн + подбор")
    fig_pipeline("pipe-models.png", ["Tree", "SVM", "kNN", "LogReg"], "Несколько моделей в поиске")
    fig_pipeline("pipe-result.png", ["лучший: LogReg + MinMax"], "Результат поиска")
    fig_pipeline("pipe-rand.png", ["препроцессинг", "модели", "RandomizedSearch"], "Случайный поиск в пайплайне")
    fig_stats_venn()
    fig_stats_normal()
    fig_stats_sigma()
    fig_stats_hist()
    fig_stats_binomial()
    fig_biz_funnel()
    fig_biz_ab()
    fig_manhattan()
    fig_knn()
    fig_overfit()
    fig_l1_l2()
    fig_tree_split()
    fig_kmeans()
    fig_pca()
    course_figures()
    print("wrote", len(list(OUT.glob("*.png"))), "figures to", OUT)


if __name__ == "__main__":
    main()
