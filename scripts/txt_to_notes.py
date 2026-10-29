#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
from pathlib import Path

HEADING_REWRITE = {
    "1. УСЛОВИЕ": "Условие 1. Максимальный зазор",
    "2. УСЛОВИЕ": "Условие 2. Отступ (margin)",
    "L1-регуляризация L2-регуляризация": "Сравнение L1 и L2",
    "Переобучение и недообучение": "Переобучение и недообучение",
    "Недообучение": "Недообучение",
    "L2-регуляризация": "L2-регуляризация",
    "L1-регуляризация": "L1-регуляризация",
    "Регуляризация регрессий": "Регуляризация регрессий",
    "Модель kNN": "Модель kNN",
    "Метрики TPR, FPR": "Метрики TPR, FPR",
    "Стратификация выборок": "Стратификация выборок",
    "Базовый оверсэмплинг": "Базовый оверсэмплинг",
    "Undersampling": "Undersampling",
    "SMOTE": "SMOTE",
    "TOMEK Links": "Tomek Links",
    "Взвешивание классов": "Взвешивание классов",
    "Методы отбора признаков": "Методы отбора признаков",
    "GridSearchCV в sklearn": "GridSearchCV в sklearn",
}

HEADING_ONCE = {
    "L2-регуляризация",
    "L1-регуляризация",
    "Модель kNN",
    "Недообучение",
}

NL = "\n"
FORMULAS = [
    (
        r"d=\(\|Ax_0\+By_0\+C\|\)/\(sqrt\(A\^2\+B\^2\)\) = \(\|w_1x_1\+w_2x_2\+w_0\|\)/\(sqrt\(w_1\^2\+w_2\^2\)\) = \(\|f\(w,x\)\+w_0\|\)/\(sqrt\(w_1\^2\+w_2\^2\)\) = \(\|f\(w,x\)\+w_0\|\)/\(\|\|w\|\|\)",
        NL.join(["$$", r"d = \frac{|A x_0 + B y_0 + C|}{\sqrt{A^2+B^2}} = \frac{|w_1 x_1 + w_2 x_2 + w_0|}{\sqrt{w_1^2+w_2^2}} = \frac{|f(w,x)+w_0|}{\|w\|}", "$$"]),
    ),
    (r"w_0\+w_1x_1\+w_2x_2\+\.\.\.\+w_nx_n=0", NL.join(["$$", r"w_0 + w_1 x_1 + w_2 x_2 + \ldots + w_n x_n = 0", "$$"])),
    (r"y\(x\)=sign\(w\^tx\+w_0\)", NL.join(["$$", r"y(x) = \mathrm{sign}(w^{T}x + w_0)", "$$"])),
    (r"max\|f\(w,x\)\+w0\|=1", NL.join(["$$", r"\max |f(w,x)+w_0| = 1", "$$"])),
    (r"2/\|\|w\|\| -> max", NL.join(["$$", r"\frac{2}{\|w\|} \to \max", "$$"])),
    (r"M=y\*\(w\^t\*x\+w_0\)", NL.join(["$$", r"M = y (w^{T} x + w_0)", "$$"])),
    (r"y\(w\^t\*x\+w_0\) >= 1 - E_i", NL.join(["$$", r"y(w^{T} x + w_0) \ge 1 - E_i", "$$"])),
    (r"y\(w\^t\*x\+w_0\)>=1", NL.join(["$$", r"y(w^{T} x + w_0) \ge 1", "$$"])),
    (r"y\(w\^t\*x\+w_0\) >= 1", NL.join(["$$", r"y(w^{T} x + w_0) \ge 1", "$$"])),
    (r"\|\|w\|\|\^2 \+cE_i -> min", NL.join(["$$", r"\|w\|^2 + c E_i \to \min", "$$"])),
    (r"^E_i > 0$", NL.join(["$$", r"E_i > 0", "$$"])),
    (r"f\(x,y\)=exp\(-gamma\|x-y\|\^2\)", r"$f(x,y)=\exp(-\gamma |x-y|^2)$"),
    (r"f\(x,y\)=tang\(gammax\^Ty\+c_0\)", r"$f(x,y)=\tanh(\gamma x^{T} y + c_0)$"),
    (r"f\(x,y\)=\(gammax\^Ty\+c_0\)\^d", r"$f(x,y)=(\gamma x^{T} y + c_0)^d$"),
    (
        r"sum_\(i=1\)\^n\(y_ture_i-y_pred_i\)\^2 -> min",
        NL.join(["$$", r"\sum_{i=1}^{n}(y_{\mathrm{true}, i}-y_{\mathrm{pred}, i})^2 \to \min", "$$"]),
    ),
    (
        r"\(f\(w,x_i\)-y\)\^2\+l1_ratioλ\|\|w\|\|\+\(1-l1_ratio\)λ\|\|w\|\|\^2→min",
        NL.join(
            [
                "$$",
                r"(f(w,x_i)-y)^2 + \mathrm{l1\_ratio}\,\lambda\|w\| + (1-\mathrm{l1\_ratio})\,\lambda\|w\|^2 \to \min",
                "$$",
            ]
        ),
    ),
    (r"Fβ=\(β\^2\+1\)\*\(precision\*recall\)/\(β\^2\*precision\+recall\)", NL.join(["$$", r"F_{\beta}=(\beta^2+1)\frac{\mathrm{precision}\cdot\mathrm{recall}}{\beta^2\cdot\mathrm{precision}+\mathrm{recall}}", "$$"])),
    (r"\(f\(w,x_i\)-y\)\^2\+λ\|\|w\|\|\^2 -> min", NL.join(["$$", r"(f(w,x_i)-y)^2 + \lambda \|w\|^2 \to \min", "$$"])),
    (r"\(f\(w,x_i\) -y\)\^2\+λ\|\|w\|\| -> min", NL.join(["$$", r"(f(w,x_i)-y)^2 + \lambda \|w\| \to \min", "$$"])),
    (r"\(f\(w,x_i\)-y\)\^2 -> min", NL.join(["$$", r"(f(w,x_i)-y)^2 \to \min", "$$"])),
    (r"Error\(a\)=bias\^2\(a\)\+variance\(a\)\+ξ", NL.join(["$$", r"\mathrm{Error}(a)=\mathrm{bias}^2(a)+\mathrm{variance}(a)+\xi", "$$"])),
    (r"d\(a,b\)=sum\^n_\(i=1\)\(\|a_i-b_i\|\)", NL.join(["$$", r"d(a,b)=\sum_{i=1}^{n}|a_i-b_i|", "$$"])),
    (r"^\|\|w\|\|\^2 -> min$", NL.join(["$$", r"\|w\|^2 \to \min", "$$"])),
    (r"^w -> min$", NL.join(["$$", r"w \to \min", "$$"])),
    (r"C=1/λ", NL.join(["$$", r"C = \frac{1}{\lambda}", "$$"])),
    (r"C=1/c", NL.join(["$$", r"C = \frac{1}{c}", "$$"])),
    (r"0\.99\^3 = 0\.97", r"$0.99^{3} = 0.97$"),
    (r"1\.01\^3 = 1\.03", r"$1.01^{3} = 1.03$"),
    (r"0\.99\^10 = 0\.9", r"$0.99^{10} = 0.9$"),
    (r"1\.01\^10 = 1\.1", r"$1.01^{10} = 1.1$"),
    (r"5\.5\^2 = 30\.25", r"$5.5^{2} = 30.25$"),
    (r"6\.5\^2 = 42\.25", r"$6.5^{2} = 42.25$"),
]

CODE_START = re.compile(
    r"""^(
        import\s|from\s|def\s|class\s|for\s|while\s|if\s|elif\s|else:|try:|except|with\s|
        !pip\s|print\(|return\s|assert\s|raise\s|pass$|break$|continue$|@|
        \#\s|\#[А-Яа-я]|
        RANDOM_STATE\b|TEST_SIZE\b|
        plt\.|sns\.|np\.|pd\.|shap\.|fig\.|axes\[
    )""",
    re.X,
)
CALL_OR_ASSIGN = re.compile(r"^[A-Za-z_][\w\.]*\s*(\(|\s*=)")
MULTI_ASSIGN = re.compile(r"^[A-Za-z_][\w\.]*(?:\s*,\s*[A-Za-z_][\w\.]*)+\s*=")
CYR = re.compile(r"[А-Яа-яЁё]")
LAT = re.compile(r"[A-Za-z]")


def cyr_ratio(s: str) -> float:
    c = len(CYR.findall(s))
    l = len(LAT.findall(s))
    if c + l == 0:
        return 0.0
    return c / (c + l)


def is_mathy(s: str) -> bool:
    if s.startswith("|---") or s.startswith("|   |"):
        return False
    if s.startswith("$$") or "\\frac" in s or "\\sum" in s:
        return True
    if re.match(r"^C=1/", s):
        return True
    if re.match(r"^[A-Za-z]=-?[\d.]+[;.]?$", s):
        return True
    if re.search(r"(>=|<=|-> min|-> max|sum_\(|sum\^n_|w\^t|w\^T|\|\|w\|\||λ\|\||\\lambda)", s, re.I):
        return True
    if re.search(r"d=\(\||M=y\*|w_0\+|y\(x\)=sign|y\(w", s):
        return True
    if re.search(
        r"(Var\[|E\[X\]|sum_\^n_|sum\^n_|sum\^N_|P_n=|A\^k_n|C\^k_n|X∼|sigma\^2|\bмю\b|X_ = N\(|SEM\(X_\)|∼N\(|∼Pois|λ\^k|s\^2=|P\(Y=k\)|P\(X=k\)|P\(F\()",
        s,
    ):
        return True
    if re.search(r"\^|∑|∇|∣", s) and not re.search(
        r"\b(import|def|class|return|print|for|while|elif)\b|np\.|pd\.|plt\.|torch\.|cv2\.|sklearn",
        s,
    ):
        return True
    if re.match(r"^(w|T|f|F|P|L|MSE|MAE|BCE|CCE|ELU|Swish)\b", s) and "=" in s and "." not in s:
        return True
    if re.match(r"^T\(", s):
        return True
    if re.search(r"[²³]", s) and cyr_ratio(s) < 0.2:
        return True
    return False


def looks_like_code(s: str) -> bool:
    return bool(
        CODE_START.match(s)
        or CALL_OR_ASSIGN.match(s)
        or MULTI_ASSIGN.match(s)
        or s.startswith("train_test_split")
        or s.endswith("\\")
    )


def is_code_line(line: str, in_code: bool) -> bool:
    raw = line.rstrip()
    s = raw.strip()
    if not s:
        return in_code
    if s.lower().startswith("см изображ"):
        return False
    if s.startswith("|---") or s.startswith("|   |"):
        return True
    if is_mathy(s):
        return False
    if s.startswith("#") and in_code:
        return True
    ratio = cyr_ratio(s)
    if in_code:
        if raw[:1] in " \t":
            return True
        if s[0] in "0123456789)]},\\":
            return True
        if s.endswith((",", "[", "(", "\\")) or "])" in s or ")]" in s:
            return True
        if ratio > 0.55 and not s.startswith("#") and not looks_like_code(s):
            return False
        if looks_like_code(s):
            return True
        if re.match(r"^[\d. ,\]]+", s):
            return True
        return ratio < 0.25
    if ratio > 0.4 and not s.startswith("#"):
        return False
    return looks_like_code(s)


def convert_formulas(text: str) -> str:
    ordered = sorted(FORMULAS, key=lambda pair: len(pair[0]), reverse=True)
    for src, dst in ordered:
        flags = re.M if src.startswith("^") else 0
        text = re.sub(src, lambda _m, d=dst: d, text, flags=flags)
    text = text.replace("X_train_scalled", "X_train_scaled")
    text = text.replace("X_test_scalled", "X_test_scaled")
    text = text.replace("X_valid_scalled", "X_valid_scaled")
    text = text.replace("X_new_scalled", "X_new_scaled")
    text = text.replace("X_bпринадлежат", "X_b принадлежат")
    text = text.replace("X_a-X_b", r"$X_a$–$X_b$")
    text = re.sub(r"(?<!\$)\bX_a\b(?!\$)", r"$X_a$", text)
    text = re.sub(r"(?<!\$)\bX_b\b(?!\$)", r"$X_b$", text)
    text = text.replace("x_i;y_i", r"$x_i$, $y_i$")
    text = text.replace("(x_i;y_i)", r"($x_i$, $y_i$)")
    text = text.replace("объекта x_i", r"объекта $x_i$")
    xi = "$" + chr(92) + "xi_i$"
    text = re.sub(r"ξ_i(?=\s*[А-Яа-я])", lambda _m: xi + " ", text)
    text = re.sub(r"(?<!\$)\bξ_i\b(?!\$)", lambda _m: xi, text)
    text = text.replace("bias^2(a)", r"$\mathrm{bias}^2(a)$")
    text = text.replace("variance(a)", r"$\mathrm{variance}(a)$")
    text = text.replace("16%−15%=1%", r"$16\%-15\%=1\%$")
    return text


def prose_math(text: str) -> str:
    text = text.replace("мю - среднее, sigma^2 - дисперсия, X_ - оценка среднего", r"$\mu$ — среднее, $\sigma^2$ — дисперсия, $\bar{X}$ — оценка среднего")
    text = text.replace("D_i = средний чек в B_i - средний чек в A_i", r"$D_i$ = средний чек в $B_i$ − средний чек в $A_i$")
    text = text.replace("X_ = N(мю, (sigma_2)/n)", r"$\bar{X} \sim \mathcal{N}(\mu, \sigma^2/n)$")
    text = text.replace("p(x_i)=1/n", r"$p(x_i)=1/n$")
    text = text.replace("P(A)=k/n", r"$P(A)=k/n$")
    text = text.replace("P(X=a)", r"$P(X=a)$")
    text = text.replace("P(X⩽x)", r"$P(X \leqslant x)$")
    text = re.sub(r"(?<!\$)\bP_n\b(?!\$)", r"$P_n$", text)
    text = text.replace("A^k_n", r"$A_n^k$")
    text = text.replace("C^k_n", r"$C_n^k$")
    text = text.replace("n⋅m", r"$n \cdot m$")
    text = text.replace("k_1 ⋅ k_2 ⋅ ... ⋅ k_n", r"$k_1 \cdot k_2 \cdot \ldots \cdot k_n$")
    text = text.replace("n⋅(n−1)⋅(n−2)⋅...⋅(n−k+1)", r"$n(n-1)(n-2)\cdots(n-k+1)$")
    text = text.replace("(n!)/(n-k)!", r"$\frac{n!}{(n-k)!}$")
    text = text.replace("(n!)/(k!(n-k)!)", r"$\frac{n!}{k!(n-k)!}$")
    text = text.replace("H₀", r"$H_0$")
    text = text.replace("H₁", r"$H_1$")
    text = text.replace("H_0", r"$H_0$")
    text = text.replace("H_1", r"$H_1$")
    text = text.replace(
        "E[X]=∑^n_(i=1)(P(X=x_i)*x_i),",
        NL.join(["$$", r"E[X]=\sum_{i=1}^{n} P(X=x_i)\, x_i", "$$"]),
    )
    text = text.replace(
        "Var[X]=∑^n_(i=1)((x_i-E[X])^2*(P(X=x_i)),",
        NL.join(["$$", r"\mathrm{Var}[X]=\sum_{i=1}^{n}(x_i-E[X])^2 P(X=x_i)", "$$"]),
    )
    text = text.replace(
        "Var[X]=E[X^2]-(E[X])^2=∑^n_(i=1)((x_i-E[X])^2*(P(X=x_i)),",
        NL.join(["$$", r"\mathrm{Var}[X]=E[X^2]-(E[X])^2=\sum_{i=1}^{n}(x_i-E[X])^2 P(X=x_i)", "$$"]),
    )
    text = text.replace("∑^n_(i=1)", r"$\sum_{i=1}^{n}$")
    text = text.replace("∑^n_(x=1)", r"$\sum_{x=1}^{n}$")
    text = text.replace("- x_i —", r"- $x_i$ —")
    text = text.replace("- P(X=x_i) —", r"- $P(X=x_i)$ —")
    text = text.replace("X∼N(μ,σ²)", r"$X \sim \mathcal{N}(\mu,\sigma^2)$")
    text = text.replace("X∼N(μ,σ^2)", r"$X \sim \mathcal{N}(\mu,\sigma^2)$")
    text = text.replace("X∼U_[a,b]", r"$X \sim U_{[a,b]}$")
    parts = re.split(r"(\$\$[\s\S]*?\$\$)", text)
    out = []
    for part in parts:
        if part.startswith("$$"):
            out.append(part)
        else:
            out.append(re.sub(r"(?<!\$)\bE\[X\](?!\$)", r"$E[X]$", part))
    return "".join(out)


EMOJI_RE = re.compile(
    r"[\U0001F300-\U0001FAFF\u2600-\u27BF✔️✔✅❌⚠️💡📊📈⭐👉✓✗☑☝]+"
)


def polish_math(text: str) -> str:
    text = EMOJI_RE.sub("", text)
    exact = [
        ("s^2=1/n*Σ^n_(i=1)(x_i-x_)^2", r"$s^2=\frac{1}{n}\sum_{i=1}^{n}(x_i-\bar{x})^2$"),
        ("x_=1/n*Σ^n_(i=1)(x_i)", r"$\bar{x}=\frac{1}{n}\sum_{i=1}^{n} x_i$"),
        (
            "s=sqrt(s^2)=sqrt(1/n*Σ^n_(i=1)(x_i-x_)^2)",
            r"$s=\sqrt{s^2}=\sqrt{\frac{1}{n}\sum_{i=1}^{n}(x_i-\bar{x})^2}$",
        ),
        (
            "σ=sqrt((sum^N_(i=1)(b_i-μ)^2/N)",
            NL.join(["$$", r"\sigma=\sqrt{\frac{1}{N}\sum_{i=1}^{N}(b_i-\mu)^2}", "$$"]),
        ),
        (
            "^σ^2=D(X)=(sum^n_(i=1)(x_i-x_)^2)/(n-1)",
            NL.join(
                ["$$", r"\hat{\sigma}^2=D(X)=\frac{\sum_{i=1}^{n}(x_i-\bar{x})^2}{n-1}", "$$"]
            ),
        ),
        (
            "P(Y=k)=λ^k/(k!⋅e^λ)",
            NL.join(["$$", r"P(Y=k)=\frac{\lambda^k}{k!\,e^{\lambda}}", "$$"]),
        ),
        (
            "P(X=k)=λ^k/(k!⋅e^λ)",
            NL.join(["$$", r"P(X=k)=\frac{\lambda^k}{k!\,e^{\lambda}}", "$$"]),
        ),
        (
            "(95−100)/10=(178−180)/4=−0.5",
            NL.join(["$$", r"\frac{95-100}{10}=\frac{178-180}{4}=-0.5", "$$"]),
        ),
        (
            "(a−3.5)/0.7=(a−3.9)/0.5",
            NL.join(["$$", r"\frac{a-3.5}{0.7}=\frac{a-3.9}{0.5}", "$$"]),
        ),
        ("0.7⋅(a−3.9)=0.5⋅(a−3.5).", NL.join(["$$", r"0.7(a-3.9)=0.5(a-3.5)", "$$"])),
        ("0.7a−2.73=0.5a−1.75;", NL.join(["$$", r"0.7a-2.73=0.5a-1.75", "$$"])),
        ("0.2a=0.98;", NL.join(["$$", r"0.2a=0.98", "$$"])),
        ("(X−μ)/σ∼Z", r"$\dfrac{X-\mu}{\sigma} \sim Z$"),
        ("(X−μ)/σ∼N(0,1)", r"$\dfrac{X-\mu}{\sigma} \sim \mathcal{N}(0,1)$"),
        (
            "(X_-мю)/(SEM(X_))~N(0,1^2)",
            NL.join(
                [
                    "$$",
                    r"\frac{\bar{X}-\mu}{\mathrm{SEM}(\bar{X})} \sim \mathcal{N}(0,1)",
                    "$$",
                ]
            ),
        ),
        (
            "SEM(X_) = sigma / sqrt(n)",
            NL.join(["$$", r"\mathrm{SEM}(\bar{X})=\frac{\sigma}{\sqrt{n}}", "$$"]),
        ),
        (
            "P(F(0.05)<(мю-X_)/(SEM(X_))<F(0.95))=90%",
            NL.join(
                [
                    "$$",
                    r"P\bigl(F(0.05)<\frac{\mu-\bar{X}}{\mathrm{SEM}(\bar{X})}<F(0.95)\bigr)=90\%",
                    "$$",
                ]
            ),
        ),
        (
            "P(X_+F(0.05)*SEM(X_)<мю<X_+F(0.95)*SEM(X_))=90%",
            NL.join(
                [
                    "$$",
                    r"P\bigl(\bar{X}+F(0.05)\,\mathrm{SEM}(\bar{X})<\mu<\bar{X}+F(0.95)\,\mathrm{SEM}(\bar{X})\bigr)=90\%",
                    "$$",
                ]
            ),
        ),
        (
            "P(X_+t(0.05)*SEM(X_)<мю<X_+t(0.95)*SEM(X_))=90%",
            NL.join(
                [
                    "$$",
                    r"P\bigl(\bar{X}+t(0.05)\,\mathrm{SEM}(\bar{X})<\mu<\bar{X}+t(0.95)\,\mathrm{SEM}(\bar{X})\bigr)=90\%",
                    "$$",
                ]
            ),
        ),
        (
            "P(k успехов из n попыток)=$C_n^k$*p^k*(1-p)^(n-k)",
            r"$P(\text{$k$ успехов из $n$ попыток})=C_n^k p^k (1-p)^{n-k}$",
        ),
        ("P(M≥a)=P(F≥a)", r"$P(M \ge a)=P(F \ge a)$"),
        ("(b-a)*1/(b-a)=1", r"$(b-a)\cdot\frac{1}{b-a}=1$"),
        ("X∼U_[13.5,15]", r"$X \sim U_{[13.5,15]}$"),
        ("[μ−3⋅σ,μ+3⋅σ]", r"$[\mu-3\sigma,\mu+3\sigma]$"),
        ("[μ−σ,μ+σ]", r"$[\mu-\sigma,\mu+\sigma]$"),
        ("N(1000,100^2)", r"$\mathcal{N}(1000,100^{2})$"),
        ("λ^0/(0!⋅e^λ)", r"$\dfrac{\lambda^{0}}{0!\,e^{\lambda}}$"),
        ("λ^1/(1!⋅e^λ)", r"$\dfrac{\lambda^{1}}{1!\,e^{\lambda}}$"),
        ("λ^2/(2!⋅e^λ)", r"$\dfrac{\lambda^{2}}{2!\,e^{\lambda}}$"),
        ("λ^k/(k!⋅e^λ)", r"$\dfrac{\lambda^{k}}{k!\,e^{\lambda}}$"),
        ("μ_1=μ_2", r"$\mu_1=\mu_2$"),
        ("μ_1≠μ_2", r"$\mu_1 \neq \mu_2$"),
        ("рубли^2", r"рубли$^2$"),
        ("в a^2 раз", r"в $a^2$ раз"),
        ("x_1, x_2, ..., x_n", r"$x_1, x_2, \ldots, x_n$"),
        ("(x_i-x_)^2", r"$(x_i-\bar{x})^2$"),
        ("где x_", r"где $\bar{x}$"),
        ("10×10=100", r"$10 \times 10 = 100$"),
        ("Валовая маржинальность (рентабельность) = Валовая прибыль / Выручка * 100%",
         r"Валовая маржинальность (рентабельность) $= \dfrac{\text{Валовая прибыль}}{\text{Выручка}} \times 100\%$"),
        ("Операционная маржинальность = Операционная прибыль / Выручка * 100%",
         r"Операционная маржинальность $= \dfrac{\text{Операционная прибыль}}{\text{Выручка}} \times 100\%$"),
        ("Валовая прибыль = Оборот - Себестоимость",
         r"Валовая прибыль $=$ Оборот $-$ Себестоимость"),
        ("Операционная прибыль = Валовая прибыль - Операционные расходы",
         r"Операционная прибыль $=$ Валовая прибыль $-$ Операционные расходы"),
        ("Чистая прибыль = Операционная прибыль - Налоги - Обслуживание долга",
         r"Чистая прибыль $=$ Операционная прибыль $-$ Налоги $-$ Обслуживание долга"),
        ("ROI = (Итоговая прибыль - Инвестиции) / Инвестиции",
         r"$\mathrm{ROI} = \dfrac{\text{Итоговая прибыль} - \text{Инвестиции}}{\text{Инвестиции}}$"),
    ]
    exact.sort(key=lambda pair: len(pair[0]), reverse=True)
    for src, dst in exact:
        text = text.replace(src, dst)
    def outside_math(part: str) -> str:
        part = re.sub(
            r"(?<!\$)\b([A-Z])∼N\(([^)]+)\)",
            lambda m: f"${m.group(1)} \\sim \\mathcal{{N}}({m.group(2)})$",
            part,
        )
        part = re.sub(
            r"(?<!\$)\b([A-Z])∼Pois\(([^)]+)\)",
            lambda m: f"${m.group(1)} \\sim \\mathrm{{Pois}}({m.group(2)})$",
            part,
        )
        part = part.replace("⇒", r" $\Rightarrow$ ")
        part = re.sub(r"(?<!\$)(?<![\\])\bσ\^2\b", lambda _m: r"$\sigma^2$", part)
        part = re.sub(r"(?<!\$)\ba=4\.9\.", "$a=4.9$.", part)
        part = re.sub(r"(?<!\$)\bx=95\b", "$x=95$", part)
        part = re.sub(r"(?<!\$)\by=178\b", "$y=178$", part)
        part = re.sub(r"(?<!\$)\bλ=3\b", lambda _m: r"$\lambda=3$", part)
        part = re.sub(r"(?<!\$)(?<![\\])\bμ\b", lambda _m: r"$\mu$", part)
        part = re.sub(r"(?<!\$)(?<![\\])\bσ\b", lambda _m: r"$\sigma$", part)
        part = re.sub(r"(?<!\$)(?<![\\])\bλ\b", lambda _m: r"$\lambda$", part)
        part = re.sub(r"(?<!\$)\bs\^2\b", lambda _m: r"$s^2$", part)
        part = re.sub(r"(?<!\$)\bx_i\b", lambda _m: r"$x_i$", part)
        part = part.replace("P(Y=k)", r"$P(Y=k)$")
        part = part.replace("P(X=k)", r"$P(X=k)$")
        return part

    chunks = re.split(r"(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)", text)
    text = "".join(chunk if chunk.startswith("$") else outside_math(chunk) for chunk in chunks)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


APIS = (
    "LogisticRegression",
    "GridSearchCV",
    "RandomizedSearchCV",
    "OptunaSearchCV",
    "StandardScaler",
    "KNeighborsClassifier",
    "Pipeline",
    "SVC",
    "LinearRegression",
    "OneHotEncoder",
    "train_test_split",
)

STATS_HEADINGS = {
    "Вероятность: классическое и геометрическое определения",
    "Классическое определение вероятности",
    "Геометрическое определение вероятности",
    "Диаграмма Эйлера-Венна",
    "Мода",
    "Медиана",
    "Выбор характеристики положения",
    "Вторая формула дисперсии",
    "Свойства математического ожидания и дисперсии случайной величины",
    "Биномиальное распределение",
    "Графики биномиальных распределений",
    "Непрерывное равномерное и нормальное распределения",
    "Непрерывное равномерное распределение",
    "Нормальное распределение",
    "Вероятности попадания в интервал",
    "Правило трёх сигм",
    "Функция нормального распределения",
    "Вероятность попадания в конечный интервал",
    "Стандартное нормальное распределение и стандартизация",
    "Z-значение",
    "Percent Point Function для нормального распределения",
    "Распределение Пуассона",
    "График распределения Пуассона",
    "Функция распределения Пуассона",
    "Аппроксимация биномиального распределения распределением Пуассона",
    "Аппроксимация биномиального распределения нормальным",
    "Как рассчитывать вероятности с помощью аппроксимации",
    "Генеральная совокупность. Случайные и стратифицированные выборки",
    "Оценка параметров генеральной совокупности по выборке",
    "Стандартная ошибка среднего",
    "Уровень статистической значимости",
    "Распределение Стьюдента",
    "Как проверить одностороннюю гипотезу в Python",
    "Гипотеза о равенстве средних двух генеральных совокупностей",
    "Односторонние гипотезы для средних двух генеральных совокупностей",
    "Гипотеза о равенстве средних для зависимых (парных) выборок",
}

TABLE_ROW = re.compile(
    r"^(sklearn\.[\w.]+|feature_engine\.[\w.]+|imblearn\.[\w.]+)\s+(\S+(?:,\s*\S+)*)\s+([А-ЯЁ].+)$"
)


def space_code(code: str) -> str:
    lines = code.split("\n")
    out: list[str] = []
    for i, line in enumerate(lines):
        s = line.strip()
        prev = out[-1].strip() if out else ""
        if s.startswith("#") and prev and not prev.startswith("#"):
            if out[-1] != "":
                out.append("")
        if re.match(r"^(for |if |with |def |class |while |try:)", s) and prev and not prev.endswith((":", "\\")):
            if out and out[-1] != "":
                out.append("")
        out.append(line)
        nxt = lines[i + 1].strip() if i + 1 < len(lines) else ""
        if (s.startswith("import ") or s.startswith("from ")) and nxt and not nxt.startswith(("import ", "from ")):
            out.append("")
        if (s.startswith("print(") or s.endswith(".fit(") or ".fit(" in s) and nxt.startswith(("print(", "y_")):
            pass
        if s and not s.startswith(("#", "import ", "from ")) and nxt.startswith("#"):
            if i + 1 < len(lines) and not nxt.startswith("# ") and False:
                pass
    text = "\n".join(out)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip("\n")


def ascii_formula(s: str) -> str:
    t = s.strip().rstrip(".;")
    t = (
        t.replace("²", "^{2}")
        .replace("³", "^{3}")
        .replace("σ", r"\sigma")
        .replace("μ", r"\mu")
        .replace("λ", r"\lambda")
        .replace("η", r"\eta")
        .replace("Δ", r"\Delta")
        .replace("∇", r"\nabla ")
        .replace("∑", r"\sum")
        .replace("∣", r"|")
        .replace("~", r"\sim")
        .replace("≈", r"\approx")
    )
    t = t.replace("arg min", r"\arg\min ")
    t = t.replace("*", r" \cdot ")
    t = re.sub(r"\^\(([^)]+)\)", r"^{\1}", t)
    t = re.sub(
        r"(sum|П)\^(?:\{([^}]+)\}|([A-Za-z0-9]+))_\(([^)]+)\)",
        lambda m: (
            ("\\sum" if m.group(1) == "sum" else "\\prod")
            + "_{" + m.group(4) + "}^{" + (m.group(2) or m.group(3)) + "}"
        ),
        t,
    )
    t = t.replace("log_(10)", r"\log_{10}")
    t = t.replace("∂", r"\partial ")
    t = re.sub(r"\^([A-Za-z0-9])", r"^{\1}", t)
    t = re.sub(r"([А-Яа-яЁё]+)", lambda m: r"\text{" + m.group(1) + "}", t)
    return t


def emit_prose_line(s: str) -> list[str]:
    s = s.strip()
    if not s:
        return []
    s = EMOJI_RE.sub("", s).strip()
    if not s:
        return []
    if is_mathy(s) and cyr_ratio(s) < 0.5 and not s.startswith(("**", "-", "#")):
        return ["$$", ascii_formula(s), "$$", ""]
    for name in APIS:
        s = s.replace(f"{name}()", f"`{name}()`")
    m_pen = re.match(r"^(penalty\s*=\s*['\"]?[\w]+['\"]?)\s*[—–-]\s*(.+)$", s)
    if m_pen:
        return [f"- `{m_pen.group(1)}` — {m_pen.group(2)}", ""]
    if re.match(r"^penalty\s*=", s, re.I):
        return [f"- `{s}`", ""]
    if re.match(r"^[10] — ", s):
        return [f"- {s}", ""]
    if ";" in s and s.count("—") >= 2 and len(s) > 140:
        parts = [p.strip(" ;") for p in s.split(";") if p.strip()]
        if len(parts) >= 3:
            return [f"- {p}" for p in parts] + [""]
    m_def = re.match(r"^([^—\n]{2,90}) — (.+)$", s)
    if m_def:
        term = m_def.group(1).strip()
        rest = m_def.group(2).strip()
        if (
            len(term.split()) <= 10
            and "$" not in term
            and not term.startswith(("Если", "Чтобы", "Когда", "После", "-", "•"))
            and not re.search(r"[_^∼✔✔️σμλ]", term)
        ):
            s = f"**{term}** — {rest}"
    return [s, ""]


def cases_formula(table_lines: list[list[str]]) -> str | None:
    """Tab-separated piecewise formula, not a data table."""
    blob = " ".join(cell for row in table_lines for cell in row)
    if not re.search(r"sum\^|П\^|Likelihood|log_\(10\)", blob):
        return None
    left = ""
    branches: list[tuple[str, str]] = []
    for row in table_lines:
        cells = [cell for cell in row if cell]
        if not cells:
            continue
        if not left and "=" in cells[0] and cells[0] not in {"{", "}"}:
            left = cells[0]
            cells = cells[1:]
        if cells and cells[0] == "{":
            cells = cells[1:]
        if not cells:
            continue
        expr = cells[0].rstrip(",")
        cond = " ".join(cells[1:]) if len(cells) > 1 else ""
        if expr:
            branches.append((expr, cond))
    if not left or len(branches) < 2:
        return None
    lines = [ascii_formula(left), r"\begin{cases}"]
    for expr, cond in branches:
        right = ascii_formula(expr)
        if cond.startswith("если "):
            right += r" & \text{если } " + cond[len("если ") :]
        elif cond:
            right += r" & " + cond
        lines.append(right + r" \\")
    lines.append(r"\end{cases}")
    return "\n".join(lines)


def markdown_table(header: list[str], rows: list[list[str]]) -> str:
    body = ["| " + " | ".join(header) + " |", "| " + " | ".join("---" for _ in header) + " |"]
    for row in rows:
        padded = row + [""] * (len(header) - len(row))
        body.append("| " + " | ".join(padded[: len(header)]) + " |")
    return "\n".join(body)


def to_markdown(
    raw: str,
    title: str,
    figure_specs: list | None = None,
    extra_headings: set[str] | None = None,
    figure_inserts: dict[str, str] | None = None,
) -> str:
    lines = raw.replace("\r\n", "\n").split("\n")
    out: list[str] = [f"# {title}", ""]
    buf: list[str] = []
    mode = "prose"
    seen_headings: set[str] = set()
    default_figs = [
            ("svm-hyperplane.png", "Разделяющая гиперплоскость SVM"),
            ("svm-margin.png", "Отступ и опорные векторы"),
            ("svm-nonlinear.png", "Нелинейная граница SVM"),
            ("kernel-2d.png", "Два класса в исходном пространстве"),
            ("kernel-3d.png", "Переход в пространство большей размерности"),
            ("kernel-3d-plane.png", "Линейная граница в новом пространстве"),
            ("bias-variance-curves.png", "Смещение и разброс"),
            ("bias-variance-targets.png", "Мишени: смещение и разброс"),
            ("svm-c.png", "Коэффициент C и ширина зазора"),
            ("roc-curve.png", "ROC-кривая"),
            ("confusion-multi.png", "Матрица ошибок"),
            ("confusion.png", "True Positive, False Positive по классу"),
            None,
            None,
            ("tomek.png", "Tomek Links"),
            ("threshold.png", "Precision, recall и F1 при разных порогах"),
            ("kfold.png", "Кросс-валидация"),
            ("grid-vs-random.png", "GridSearch и RandomizedSearch"),
            ("bayes-1.png", "Байесовская оптимизация"),
            ("bayes-1.png", "Суррогатная функция"),
            ("bayes-2.png", "После первой точки"),
            ("bayes-3.png", "Суррогат ближе к целевой"),
            ("bayes-4.png", "Ещё ближе"),
            ("bayes-5.png", "Функция сбора"),
            ("optuna-history.png", "История Optuna"),
            ("corr-heatmap.png", "Матрица корреляций"),
            ("money-acc.png", "accuracy и money"),
            ("money-roc.png", "ROC-AUC и money"),
            ("money-f1.png", "F1 и money"),
            ("money-f1b.png", "F1 после согласования"),
            ("shap-beeswarm.png", "SHAP beeswarm"),
            ("shap-water.png", "SHAP waterfall"),
            ("shap-bar.png", "Важность признаков SHAP"),
            ("shap-beeswarm-2.png", "SHAP beeswarm"),
            ("shap-water-2.png", "SHAP waterfall"),
            ("shap-beeswarm.png", "SHAP beeswarm"),
            ("shap-water.png", "SHAP waterfall"),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
        ]
    figures = iter(figure_specs if figure_specs is not None else default_figs)

    def flush() -> None:
        nonlocal buf, mode
        if not buf:
            return
        if mode == "code":
            code = "\n".join(buf).rstrip()
            # drop accidental math that snuck in
            if is_mathy(code) and cyr_ratio(code) < 0.1 and "import " not in code and "def " not in code:
                out.append(convert_formulas(code))
                out.append("")
            else:
                lang = "text" if any(ln.strip().startswith("|---") for ln in buf) else "python"
                out.append(f"```{lang}")
                out.append(space_code(convert_formulas(code)) if lang == "python" else code)
                out.append("```")
                out.append("")
        else:
            block = prose_math(convert_formulas("\n".join(buf).strip()))
            if block:
                lines = [ln for ln in block.split("\n")]
                i_l = 0
                while i_l < len(lines):
                    line = lines[i_l]
                    nxts = []
                    if line.rstrip().endswith(":") and i_l + 1 < len(lines):
                        j = i_l + 1
                        while j < len(lines):
                            cand = lines[j].strip()
                            if not cand:
                                j += 1
                                continue
                            question = cand.endswith("?") or cand.startswith(("Как ", "Все ", "Что ", "Если "))
                            short = len(cand) < 180
                            if question or (short and cand[0].isupper() and j == i_l + 1):
                                nxts.append(cand)
                                j += 1
                                if question or len(nxts) < 3:
                                    continue
                            break
                        if len(nxts) >= 2:
                            out.extend(emit_prose_line(line))
                            for item in nxts:
                                out.append(f"- {item}")
                                out.append("")
                            i_l = j
                            continue
                    out.extend(emit_prose_line(line))
                    i_l += 1
        buf = []

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if stripped.lower().startswith("см изображ"):
            flush()
            try:
                spec = next(figures)
            except StopIteration:
                spec = None
            if spec:
                name, caption = spec
                out.append(f"![{caption}](figures/{name})")
                out.append("")
            else:
                out.append(stripped)
                out.append("")
            i += 1
            continue
        prefix_heads = {
            "A/B-тестирование, или сплит-тестирование": "A/B-тестирование",
            "Главная задача бизнеса": "Метрики бизнеса",
            "Одна из самых важных метрик — это конверсия": "Конверсия и воронка",
            "Целевая метрика качества модели": "Онлайн- и офлайн-метрики",
            "У A/B-теста есть проблема подглядывания": "Проблема подглядывания",
            "А/В-тест мы провели": "Гипотезы A/B-теста",
            "Пайплайн — это средство автоматизации": "Пайплайны",
        }
        for prefix, heading in prefix_heads.items():
            if stripped.startswith(prefix):
                flush()
                if heading not in seen_headings:
                    seen_headings.add(heading)
                    out.append(f"## {heading}")
                    out.append("")
                break
        if stripped in STATS_HEADINGS or stripped in (extra_headings or ()):
            flush()
            if stripped not in seen_headings:
                seen_headings.add(stripped)
                out.append(f"## {stripped}")
                out.append("")
            i += 1
            continue
        if stripped == "Библиотека Инструменты Описание":
            flush()
            rows = []
            i += 1
            while i < len(lines):
                row = TABLE_ROW.match(lines[i].strip())
                if not row:
                    break
                rows.append([row.group(1), row.group(2), row.group(3)])
                i += 1
            if rows:
                out.append(markdown_table(["Библиотека", "Инструменты", "Описание"], rows))
                out.append("")
            continue
        if "\t" in stripped and i + 1 < len(lines) and "\t" in lines[i + 1]:
            flush()
            table_lines = []
            while i < len(lines) and "\t" in lines[i]:
                table_lines.append([c.strip() for c in lines[i].split("\t")])
                i += 1
            cases = cases_formula(table_lines)
            if cases:
                out.extend(["$$", cases, "$$", ""])
            else:
                header, *rest = table_lines
                out.append(markdown_table(header, rest))
                out.append("")
            continue
        if stripped in HEADING_REWRITE:
            key = stripped
            title_h = HEADING_REWRITE[key]
            if key in HEADING_ONCE and key in seen_headings:
                i += 1
                continue
            flush()
            seen_headings.add(key)
            out.append(f"## {title_h}")
            out.append("")
            i += 1
            continue
        code = is_code_line(line, mode == "code")
        if mode == "code" and buf and buf[-1].rstrip().endswith((",", "[", "(", "\\")):
            code = True
        if stripped == "":
            if mode == "code" and buf:
                nxt = ""
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1
                if j < len(lines) and is_code_line(lines[j], True):
                    buf.append("")
                else:
                    flush()
                    mode = "prose"
            else:
                flush()
            i += 1
            continue
        next_mode = "code" if code else "prose"
        if buf and next_mode != mode:
            while buf and buf[-1].strip() == "":
                buf.pop()
            flush()
        mode = next_mode
        text_line = line.rstrip()
        if mode == "prose":
            if " • " in text_line or text_line.startswith("•"):
                parts = [p.strip() for p in re.split(r"(?:^|\s)•\s+", text_line) if p.strip()]
                buf.extend(f"- {p}" for p in parts)
                i += 1
                continue
        if re.fullmatch(r"random_state", stripped, re.I):
            i += 1
            continue
        if re.fullmatch(r"#(var|std)", stripped, re.I):
            i += 1
            continue
        buf.append(text_line)
        i += 1
    flush()
    text = "\n".join(out)
    inserts = {
        "## Модель kNN\n": "## Модель kNN\n\n![kNN: класс по ближайшим соседям](figures/knn.png)\n",
        "## Переобучение и недообучение\n": "## Переобучение и недообучение\n\n![Недообучение и переобучение](figures/overfit.png)\n",
        "## Сравнение L1 и L2\n": "## Сравнение L1 и L2\n\n![Геометрия L1 и L2](figures/l1-l2.png)\n",
        r"d(a,b)=\sum_{i=1}^{n}|a_i-b_i|" + "\n$$": r"d(a,b)=\sum_{i=1}^{n}|a_i-b_i|"
        + "\n$$\n\n![Евклидово и манхэттенское расстояние](figures/manhattan.png)",
        "## Диаграмма Эйлера-Венна\n": "## Диаграмма Эйлера-Венна\n\n![Диаграмма Эйлера-Венна](figures/stats-venn.png)\n",
        "## Нормальное распределение\n": "## Нормальное распределение\n\n![Нормальное распределение](figures/stats-normal.png)\n",
        "## Правило трёх сигм\n": "## Правило трёх сигм\n\n![Правило трёх сигм](figures/stats-sigma.png)\n",
        "## Биномиальное распределение\n": "## Биномиальное распределение\n\n![Биномиальное распределение](figures/stats-binomial.png)\n",
        "## A/B-тестирование\n": "## A/B-тестирование\n\n![A/B-тест: контроль и тест](figures/biz-ab.png)\n",
        "## Конверсия и воронка\n": "## Конверсия и воронка\n\n![Воронка конверсии](figures/biz-funnel.png)\n",
        "Для них можно построить гистограмму.\n": "Для них можно построить гистограмму.\n\n![Гистограмма непрерывной величины](figures/stats-hist.png)\n",
    }
    for src, dst in {**inserts, **(figure_inserts or {})}.items():
        text = text.replace(src, dst)
    text = re.sub(r"```python\n(\$\$[\s\S]*?\$\$)\n```", r"\1", text)
    text = re.sub(r"```python\n(\$\$[\s\S]*?\$\$)\n+", r"\1\n\n```python\n", text)
    text = map_outside_code(text, isolate_display_math)
    text = map_outside_code(
        text,
        lambda part: re.sub(r"(?<!\$)\bw_i\b(?!\$)", r"$w_i$", part),
    )
    text = map_outside_code(text, polish_math)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.rstrip() + "\n"


def map_outside_code(text: str, fn) -> str:
    parts = re.split(r"(```[\s\S]*?```)", text)
    return "".join(part if part.startswith("```") else fn(part) for part in parts)


def isolate_display_math(part: str) -> str:
    part = re.sub(r"\$\$,\s*", "$$\n\n", part)
    part = re.sub(r"([^\n$])[ \t]*\$\$[ \t]*(?=\n|$)", r"\1\n\n$$", part)
    part = re.sub(r"\$\$[ \t]+(?=\S)", "$$\n\n", part)
    part = re.sub(r"([^\n])\n\$\$", r"\1\n\n$$", part)
    part = re.sub(r"\$\$\n(?!\$)(\S)", r"$$\n\n\1", part)
    part = part.replace("$$\n$$", "$$\n\n$$")
    part = re.sub(r"\$\$\s*\.\s*", "$$\n\n", part)
    return part


def cards_from_notes(md: str, topic_id: str, track_id: str = "data-science") -> dict:
    parts = re.split(r"\n## ", md)
    items = []
    n_t = n_p = 0
    preamble = re.sub(r"^# .+\n+", "", parts[0]).strip()
    if preamble:
        n_t += 1
        h1 = re.match(r"^# (.+)$", md, re.M)
        items.append(
            {
                "id": f"{track_id}-{topic_id}-t-{n_t:02d}",
                "kind": "theory",
                "title": h1.group(1).strip() if h1 else topic_id,
                "tags": [topic_id],
                "body": preamble,
            }
        )
    for part in parts[1:]:
        title, _, body = part.partition("\n")
        title = title.strip()
        body = body.strip()
        kind = "practice" if body.count("```") >= 2 else "theory"
        if kind == "theory":
            n_t += 1
            iid = f"{track_id}-{topic_id}-t-{n_t:02d}"
        else:
            n_p += 1
            iid = f"{track_id}-{topic_id}-p-{n_p:02d}"
        items.append(
            {
                "id": iid,
                "kind": kind,
                "title": title[:120],
                "tags": [topic_id],
                "body": f"## {title}\n\n{body}",
            }
        )
    if not items:
        items.append(
            {
                "id": f"{track_id}-{topic_id}-t-01",
                "kind": "theory",
                "title": topic_id,
                "tags": [topic_id],
                "body": md,
            }
        )
    return {"topicId": topic_id, "trackId": track_id, "items": items}


def convert_topic(
    src: Path,
    dest: Path,
    title: str,
    topic_id: str,
    track_id: str,
    figure_specs: list | None,
    extra_headings: set[str] | None = None,
    figure_inserts: dict[str, str] | None = None,
) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    raw = src.read_text(encoding="utf-8")
    notes = to_markdown(raw, title, figure_specs, extra_headings, figure_inserts)
    (dest / "notes.md").write_text(notes)
    items = cards_from_notes(notes, topic_id, track_id)
    (dest / "items.json").write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n")
    print(dest.name, "notes", notes.count("\n"), "items", len(items["items"]))


def main() -> None:
    root = Path("/Users/luvgreyair/learn-tracks/content")
    if os.environ.get("LT_SKIP_OLD") == "1":
        convert_courses(root)
        return
    convert_topic(
        root / "data-science/supervised-quality/source/supervised-quality.txt",
        root / "data-science/supervised-quality",
        "Обучение с учителем: качество модели",
        "sq",
        "data-science",
        None,
    )
    convert_topic(
        root / "ml-business/overview/source/ml-business.txt",
        root / "ml-business/overview",
        "Машинное обучение в бизнесе",
        "biz",
        "ml-business",
        [],
    )
    convert_topic(
        root / "statistics/overview/source/statistical-analysis.txt",
        root / "statistics/overview",
        "Статистический анализ данных",
        "st",
        "statistics",
        [],
    )
    convert_courses(root)


def convert_courses(root: Path) -> None:
    nm = {
        "Время обучения линейной регрессии",
        "Итеративные методы",
        "Метод бисекции",
        "Сравнение методов",
        "Минимизация функции потерь",
        "Градиент функции",
        "Градиентный спуск",
        "Градиентный спуск для линейной регрессии",
        "Стохастический градиентный спуск",
        "Основы нейронных сетей",
        "Обучение нейронных сетей",
        "Ансамбли и бустинг",
        "Градиентный бустинг",
        "Регуляризация градиентного бустинга",
        "Библиотеки для градиентного бустинга",
        "Проработка запроса",
    }
    dl = {
        "Этап 1. Зарождение",
        "Этап 2. Взросление",
        "Этап 3. Подростковый период",
        "Этап 4. Активный рост",
        "Типы задач для нейронных сетей",
        "Прогнозирование временных рядов",
        "Кластеризация",
        "Классификация",
        "Генерация",
        "Работа с текстами",
        "Связь с линейными уравнениями",
        "Биологический и искусственный нейрон",
        "Слои и архитектура нейронной сети",
        "Полносвязная нейросеть прямого распространения, ПНС",
        "Рекуррентная нейронная сеть, РНС",
        "Свёрточная нейронная сеть, ConvNet",
        "Генеративная нейронная сеть, GAN",
        "Связь архитектуры нейронной сети и типа решаемой задачи",
        "Функция активации",
        "Роль функции активации",
        "Пороговая функция активации",
        "Логистическая функция и гиперболический тангенс",
        "Функция активации ReLU",
        "Модификации функций. Стратегия использования",
        "Разновидности ReLU",
        "Leaky ReLU и ELU",
        "Выбор функции активации",
        "Введение в PyTorch",
        "Тензор",
        "Создание тензора",
        "Индексация при работе с тензорами",
        "Операции над тензором",
        "Построение методом линейной регрессии",
        "Решение нейросетевым подходом",
        "Алгоритм построения нейронной сети",
        "Многослойная нейронная сеть",
        "Нейронная сеть в PyTorch",
        "Сети прямого распространения в PyTorch",
        "Вычислительный граф",
        "Построение вычислительного графа",
        "Функция потерь",
        "Задача регрессии",
        "Задача бинарной классификации",
        "Задача многоклассовой классификации",
        "Обратное распространение ошибки",
        "Производные функций потерь",
        "Обратное распространение ошибки и вычислительный граф",
        "Затухание градиента",
        "Регуляризация весов",
        "Аугментация данных",
        "Batch Normalization",
        "Dropout",
    }
    ts = {
        "Временные ряды",
        "Ресемплирование",
        "Стационарные ряды",
        "Задача прогнозирования",
        "Качество прогноза",
        "Создание признаков",
    }
    nlp = {
        "Регулярные выражения",
        "Мешок слов и N-граммы",
        "TF-IDF",
        "Классификация тональности текста",
        "Embeddings",
        "Word2vec",
        "Embeddings для классификации",
        "BERT",
        "RuBERT и предобработка",
        "Предобработка твитов",
        "Эмбеддинги RuBERT",
    }
    cv = {
        "Беспилотные автомобили",
        "Медицина",
        "Поиск по картинкам",
        "Распознавание лиц",
        "Компьютерное зрение для развлечения",
        "Типы изображений",
        "Что такое RGB?",
        "Что такое пиксели?",
        "Параметры изображения",
        "Как посчитать размер изображения",
        "Аугментации изображений",
        "OpenCV",
        "Отражение по горизонтали и вертикали",
        "Яркость, контраст и гамма",
        "Пакет albumentations",
        "Библиотека Keras",
        "Логистическая регрессия в Keras",
        "Обучение многослойной сети [GPU]",
        "Что такое ядро свёртки?",
        "Размытие изображений",
        "Оператор Собеля",
        "Задачи свёрток",
        "Одномерная свёртка",
        "Двумерная свёртка",
        "Свёрточный слой",
        "Pooling",
        "Классификационная часть свёрточной нейросети",
        "Архитектура ResNet",
        "Причины возникновения ResNet",
        "Что такое ResNet?",
        "Ограничения классов",
        "Организация данных",
        "Препроцессинг данных",
        "Функции потерь и метрики качества",
        "Обучение с переносом опыта",
        "Голова сети",
        "Обучение модели классификации изображений",
        "Задача детекции объектов",
        "Метрики качества детекции",
        "Алгоритм детекции объектов",
        "Функция потерь в задаче детекции",
        "Главное в задаче детекции",
        "Задача сегментации изображений",
        "Метрики качества сегментации",
        "Алгоритм сегментации объектов",
        "Функция потерь в задаче сегментации",
        "Основные датасеты изображений",
        "CIFAR",
        "ImageNet",
        "MS COCO",
        "Cityscapes",
        "Алгоритм Adam",
        "Свёрточная сеть",
        "Предобработка",
    }

    def fig(heading: str, name: str, caption: str) -> dict[str, str]:
        return {f"## {heading}\n": f"## {heading}\n\n![{caption}](figures/{name})\n"}

    convert_topic(
        root / "numerical-methods/overview/source/numerical-methods.txt",
        root / "numerical-methods/overview",
        "Численные методы",
        "nm",
        "numerical-methods",
        [],
        nm,
        {
            **fig("Время обучения линейной регрессии", "nm-complexity.png", "Рост T(n): константа, линейная, квадратичная и кубическая сложность"),
            **fig("Метод бисекции", "nm-bisection.png", "Метод бисекции: деление отрезка пополам"),
            **fig("Градиентный спуск", "nm-gd.png", "Шаги градиентного спуска к минимуму"),
            **fig("Стохастический градиентный спуск", "nm-sgd.png", "Пакетный и стохастический градиентный спуск"),
        },
    )
    convert_topic(
        root / "deep-learning/models/source/models-algorithms.txt",
        root / "deep-learning/models",
        "Модели и алгоритмы в машинном обучении",
        "dl",
        "deep-learning",
        [],
        dl,
        {
            **fig("Биологический и искусственный нейрон", "dl-neuron.png", "Искусственный нейрон: входы, веса, сумма и активация"),
            **fig("Функция активации", "dl-activations.png", "Сигмоида, гиперболический тангенс и ReLU"),
            **fig("Обратное распространение ошибки", "dl-backprop.png", "Ошибка идёт от выхода сети к весам"),
            **fig("Dropout", "dl-dropout.png", "Dropout выключает часть нейронов на шаге обучения"),
        },
    )
    convert_topic(
        root / "time-series/overview/source/time-series.txt",
        root / "time-series/overview",
        "Временные ряды",
        "ts",
        "time-series",
        [],
        ts,
        {
            **fig("Временные ряды", "ts-series.png", "Временной ряд с сезонными колебаниями"),
            **fig("Ресемплирование", "ts-rolling.png", "Ряд и скользящее среднее"),
            **fig("Стационарные ряды", "ts-diff.png", "Ряд и его первая разность"),
        },
    )
    convert_topic(
        root / "nlp/texts/source/texts.txt",
        root / "nlp/texts",
        "Машинное обучение для текстов",
        "tx",
        "nlp",
        [],
        nlp,
        {
            **fig("Мешок слов и N-граммы", "nlp-bow.png", "Мешок слов: частоты токенов"),
            **fig("TF-IDF", "nlp-tfidf.png", "TF-IDF поднимает редкие содержательные слова"),
        },
    )
    convert_topic(
        root / "computer-vision/overview/source/computer-vision.txt",
        root / "computer-vision/overview",
        "Компьютерное зрение",
        "cv",
        "computer-vision",
        [],
        cv,
        {
            **fig("Что такое RGB?", "cv-rgb.png", "Каналы R, G и B складываются в цвет пикселя"),
            **fig("Что такое ядро свёртки?", "cv-conv.png", "Ядро свёртки скользит по изображению"),
            **fig("Pooling", "cv-pool.png", "Max pooling оставляет максимум в окне"),
            **fig("Метрики качества детекции", "cv-iou.png", "IoU: площадь пересечения к площади объединения"),
        },
    )


if __name__ == "__main__":
    main()
