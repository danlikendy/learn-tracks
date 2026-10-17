#!/usr/bin/env python3
from __future__ import annotations

import json
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
    (r"\(f\(w,x_i\)-y\)\^2\+λ\|\|w\|\|\^2 -> min", NL.join(["$$", r"(f(w,x_i)-y)^2 + \lambda \|w\|^2 \to \min", "$$"])),
    (r"\(f\(w,x_i\) -y\)\^2\+λ\|\|w\|\| -> min", NL.join(["$$", r"(f(w,x_i)-y)^2 + \lambda \|w\| \to \min", "$$"])),
    (r"\(f\(w,x_i\)-y\)\^2 -> min", NL.join(["$$", r"(f(w,x_i)-y)^2 \to \min", "$$"])),
    (r"Error\(a\)=bias\^2\(a\)\+variance\(a\)\+ξ", NL.join(["$$", r"\mathrm{Error}(a)=\mathrm{bias}^2(a)+\mathrm{variance}(a)+\xi", "$$"])),
    (r"d\(a,b\)=sum\^n_\(i=1\)\(\|a_i-b_i\|\)", NL.join(["$$", r"d(a,b)=\sum_{i=1}^{n}|a_i-b_i|", "$$"])),
    (r"^\|\|w\|\|\^2 -> min$", NL.join(["$$", r"\|w\|^2 \to \min", "$$"])),
    (r"^w -> min$", NL.join(["$$", r"w \to \min", "$$"])),
    (r"C=1/λ", r"$C = \frac{1}{\lambda}$"),
    (r"C=1/c", r"$C = \frac{1}{c}$"),
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
    if s.startswith("$$") or "\\frac" in s or "\\sum" in s:
        return True
    if re.search(r"(>=|<=|-> min|-> max|sum_\(|sum\^n_|w\^t|w\^T|\|\|w\|\||λ\|\||\\lambda)", s, re.I):
        return True
    if re.search(r"d=\(\||M=y\*|w_0\+|y\(x\)=sign|y\(w", s):
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
    if is_mathy(s):
        return False
    if s.startswith("#") and in_code:
        return True
    ratio = cyr_ratio(s)
    if in_code:
        if ratio > 0.55 and not s.startswith("#") and not looks_like_code(s):
            return False
        if s[0] in ")]},\\":
            return True
        if raw[:1] in " \t":
            return True
        if looks_like_code(s):
            return True
        if re.match(r"^[\d.]+\s+[\d.]+", s) and ratio < 0.1:
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
    return text


def to_markdown(raw: str, title: str) -> str:
    lines = raw.replace("\r\n", "\n").split("\n")
    out: list[str] = [f"# {title}", ""]
    buf: list[str] = []
    mode = "prose"
    seen_headings: set[str] = set()
    figures = iter(
        [
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
    )

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
                out.append("```python")
                out.append(convert_formulas(code))
                out.append("```")
                out.append("")
        else:
            block = "\n".join(buf).strip()
            if block:
                out.append(convert_formulas(block))
                out.append("")
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
            i += 1
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
    }
    for src, dst in inserts.items():
        text = text.replace(src, dst)
    text = re.sub(r"```python\n(\$\$[\s\S]*?\$\$)\n```", r"\1", text)
    text = re.sub(r"\$\$,\s*", "$$\n\n", text)
    text = re.sub(r"([^\n])\n\$\$", r"\1\n\n$$", text)
    text = re.sub(r"\$\$\n(?!\$)(\S)", r"$$\n\n\1", text)
    text = text.replace("$$\n$$", "$$\n\n$$")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.rstrip() + "\n"


def cards_from_notes(md: str, topic_id: str) -> dict:
    parts = re.split(r"\n## ", md)
    items = []
    n_t = n_p = 0
    for part in parts[1:]:
        title, _, body = part.partition("\n")
        title = title.strip()
        body = body.strip()
        kind = "practice" if body.count("```") >= 2 else "theory"
        if kind == "theory":
            n_t += 1
            iid = f"ds-{topic_id}-t-{n_t:02d}"
        else:
            n_p += 1
            iid = f"ds-{topic_id}-p-{n_p:02d}"
        items.append(
            {
                "id": iid,
                "kind": kind,
                "title": title[:120],
                "tags": [topic_id],
                "body": f"## {title}\n\n{body}",
            }
        )
    return {"topicId": topic_id, "trackId": "data-science", "items": items}


def main() -> None:
    src = Path("/Users/luvgreyair/learn-tracks/content/data-science/supervised-quality/source/supervised-quality.txt")
    dest = src.parents[1]
    raw = src.read_text(encoding="utf-8")
    title = "Обучение с учителем: качество модели"
    notes = to_markdown(raw, title)
    (dest / "notes.md").write_text(notes)
    items = cards_from_notes(notes, "sq")
    (dest / "items.json").write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n")
    print("notes lines", notes.count("\n"), "items", len(items["items"]))


if __name__ == "__main__":
    main()
