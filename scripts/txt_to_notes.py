#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

CODE_RE = re.compile(
    r"""^(
        import\s|from\s|def\s|class\s|for\s|while\s|if\s|elif\s|else:|try:|except|with\s|
        !pip\s|print\(|return\s|assert\s|raise\s|pass$|break$|continue$|
        RANDOM_STATE\b|TEST_SIZE\b|scaler\s*=|clf\s*=|model\s*=|encoder\s*=|
        X\s*=|y\s*=|X_|y_|df\s*=|data\s*=|sns\.|plt\.|np\.|pd\.|
        \#\s|\#объяв|\#\s*обуч|\#\s*созда|\#\s*постро|\#\s*инициал|
        kernels\s*=|columns\s*=|results\s*=|ohe_|ord_|num_|pipe_|param_|
        randomized_search|grid_search|result\s*=|predicts\s*=|TP\s*=|FP\s*=|
        money\s*=|acc\s*=|r\s*=|k\s*=|C_\s*=|gamma_\s*=|sample\s*=
    )""",
    re.X,
)

FORMULAS = [
    (r"w_0\+w_1x_1\+w_2x_2\+\.\.\.\+w_nx_n=0", r"$$w_0 + w_1 x_1 + w_2 x_2 + \ldots + w_n x_n = 0$$"),
    (r"y\(x\)=sign\(w\^tx\+w_0\)", r"$$y(x) = \mathrm{sign}(w^{T}x + w_0)$$"),
    (
        r"d=\(\|Ax_0\+By_0\+C\|\)/\(sqrt\(A\^2\+B\^2\)\) = \(\|w_1x_1\+w_2x_2\+w_0\|\)/\(sqrt\(w_1\^2\+w_2\^2\)\) = \(\|f\(w,x\)\+w_0\|\)/\(sqrt\(w_1\^2\+w_2\^2\)\) = \(\|f\(w,x\)\+w_0\|\)/\(\|\|w\|\|\)",
        r"$$d = \frac{|A x_0 + B y_0 + C|}{\sqrt{A^2+B^2}} = \frac{|w_1 x_1 + w_2 x_2 + w_0|}{\sqrt{w_1^2+w_2^2}} = \frac{|f(w,x)+w_0|}{\|w\|}$$",
    ),
    (r"max\|f\(w,x\)\+w0\|=1", r"$$\max |f(w,x)+w_0| = 1$$"),
    (r"2/\|\|w\|\| -> max", r"$$\frac{2}{\|w\|} \to \max$$"),
    (r"\|\|w\|\|\^2 -> min", r"$$\|w\|^2 \to \min$$"),
    (r"w -> min", r"$$w \to \min$$"),
    (r"M=y\*\(w\^t\*x\+w_0\)", r"$$M = y (w^{T} x + w_0)$$"),
    (r"y\(w\^t\*x\+w_0\)>=1", r"$$y(w^{T} x + w_0) \ge 1$$"),
    (r"y\(w\^t\*x\+w_0\) >= 1 - E_i", r"$$y(w^{T} x + w_0) \ge 1 - E_i$$"),
    (r"y\(w\^t\*x\+w_0\) >= 1", r"$$y(w^{T} x + w_0) \ge 1$$"),
    (r"\|\|w\|\|\^2 \+cE_i -> min", r"$$\|w\|^2 + c E_i \to \min$$"),
    (r"E_i > 0", r"$$E_i > 0$$"),
    (r"f\(x,y\)=exp\(-gamma\|x-y\|\^2\)", r"$f(x,y)=\exp(-\gamma |x-y|^2)$"),
    (r"f\(x,y\)=tang\(gammax\^Ty\+c_0\)", r"$f(x,y)=\tanh(\gamma x^{T} y + c_0)$"),
    (r"f\(x,y\)=\(gammax\^Ty\+c_0\)\^d", r"$f(x,y)=(\gamma x^{T} y + c_0)^d$"),
    (r"sum_\(i=1\)\^n\(y_ture_i-y_pred_i\)\^2 -> min", r"$$\sum_{i=1}^{n}(y_{\mathrm{true},i}-y_{\mathrm{pred},i})^2 \to \min$$"),
    (r"\(f\(w,x_i\)-y\)\^2\+λ\|\|w\|\|\^2 -> min", r"$$(f(w,x_i)-y)^2 + \lambda \|w\|^2 \to \min$$"),
    (r"\(f\(w,x_i\)-y\)\^2 -> min", r"$$(f(w,x_i)-y)^2 \to \min$$"),
    (r"\(f\(w,x_i\) -y\)\^2\+λ\|\|w\|\| -> min", r"$$(f(w,x_i)-y)^2 + \lambda \|w\| \to \min$$"),
    (r"Error\(a\)=bias\^2\(a\)\+variance\(a\)\+ξ", r"$$\mathrm{Error}(a)=\mathrm{bias}^2(a)+\mathrm{variance}(a)+\xi$$"),
    (r"C=1/λ", r"$$C = \frac{1}{\lambda}$$"),
    (r"C=1/c", r"$$C = \frac{1}{c}$$"),
]


def is_code(line: str) -> bool:
    if not line.strip():
        return False
    if CODE_RE.match(line):
        return True
    stripped = line.lstrip()
    if stripped.startswith(("=", "[[", "]]")):
        return True
    if re.match(r"^[A-Za-z_][\w\.]*\s*=", stripped):
        return True
    if stripped.endswith((":", ",", "\\", "(", "[", "{")) and not stripped[0].isupper():
        return True
    return False


def is_heading(line: str) -> bool:
    s = line.strip()
    if not (8 <= len(s) <= 70):
        return False
    if s.endswith((".", ";", ",", ":", "?", "!")):
        return False
    if s.startswith(("http", "`", "$", "-", "•")):
        return False
    if any(ch in s for ch in "=(){}[]"):
        return False
    if re.match(r"^\d+[.\s]\d", s):
        return False
    if "—" in s:
        return False
    return s[0].isupper() or bool(re.match(r"^\d+\.\s", s))


def convert_formulas(text: str) -> str:
    for src, dst in FORMULAS:
        text = re.sub(src, lambda _m, d=dst: d, text)
    text = text.replace("X_train_scalled", "X_train_scaled")
    text = text.replace("X_test_scalled", "X_test_scaled")
    text = text.replace("X_valid_scalled", "X_valid_scaled")
    text = text.replace("X_new_scalled", "X_new_scaled")
    return text


def to_markdown(raw: str, title: str) -> str:
    lines = raw.replace("\r\n", "\n").split("\n")
    out: list[str] = [f"# {title}", ""]
    buf: list[str] = []
    mode = "prose"

    def flush():
        nonlocal buf, mode
        if not buf:
            return
        if mode == "code":
            code = "\n".join(buf).rstrip()
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

    for line in lines:
        code = is_code(line)
        if line.strip() == "":
            if mode == "code" and buf:
                # blank inside code: keep if next is code, else flush
                buf.append(line)
            else:
                flush()
            continue
        next_mode = "code" if code else "prose"
        if buf and next_mode != mode:
            # trailing blanks in code
            while buf and buf[-1].strip() == "":
                buf.pop()
            flush()
        if buf and mode == "code" and line.startswith((" ", "\t")):
            next_mode = "code"
        mode = next_mode
        text = line.rstrip()
        if mode == "prose" and is_heading(text):
            flush()
            out.append(f"## {text}")
            out.append("")
            continue
        buf.append(text)
    flush()
    return "\n".join(out).rstrip() + "\n"


def cards_from_notes(md: str, topic_id: str) -> dict:
    parts = re.split(r"\n## ", md)
    items = []
    n_t = n_p = 0
    for i, part in enumerate(parts[1:], start=1):
        title, _, body = part.partition("\n")
        title = title.strip()
        body = body.strip()
        kind = "practice" if "```" in body and body.count("```") >= 2 and len(re.findall(r"[А-Яа-я]", body[:200])) < 40 else "theory"
        if "```" in body:
            kind = "practice" if title.lower().startswith(("sklearn", "пример", "пайплайн")) or body.lstrip().startswith("```") else kind
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
    src = Path("/Users/luvgreyair/Downloads/Обучение с учителем качество модели.txt")
    dest = Path("/Users/luvgreyair/learn-tracks/content/data-science/supervised-quality")
    dest.mkdir(parents=True, exist_ok=True)
    (dest / "source").mkdir(exist_ok=True)
    raw = src.read_text(encoding="utf-8")
    (dest / "source/supervised-quality.txt").write_text(raw)
    title = "Обучение с учителем: качество модели"
    notes = to_markdown(raw, title)
    (dest / "notes.md").write_text(notes)
    # full reading copy is notes.md only
    (dest / "topic.json").write_text(
        json.dumps(
            {
                "id": "supervised-quality",
                "trackId": "data-science",
                "title": title,
                "sourceFile": "source/supervised-quality.txt",
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n"
    )
    items = cards_from_notes(notes, "sq")
    (dest / "items.json").write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n")
    print("notes lines", notes.count("\n"), "items", len(items["items"]))


if __name__ == "__main__":
    main()
