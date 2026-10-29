"""Assemble the language-model track from the answer files.

Each second-level heading is one theory card. The wording in the answer
files is the published text.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = Path(__file__).resolve().parent

TOPICS = [
    {
        "id": "llm",
        "title": "Большие языковые модели",
        "summary": "От вероятности следующего токена до внимания, генерации и выравнивания.",
        "answers": SCRIPT / "llm_answers.md",
        "notes_title": "Большие языковые модели",
        "intro": (
            "Каждая карточка ниже отвечает на свою формулировку и читается отдельно. "
            "Формулы выведены из определения, которое введено в том же ответе. "
            "Главы курса Hugging Face и статьи по трансформерам в текст не копировались: "
            "из них взяты только недостающие шаги, и у каждого такого шага указан источник."
        ),
        "expected": [
            "Что такое языковая модель",
            "Токены. Как текст превращается в числа",
            "Эмбеддинги и позиция токена",
            "Самовнимание",
            "Блок декодера. Энкодер, декодер и энкодер-декодер",
            "Обучение предсказанию следующего токена",
            "Генерация. Температура, контекст и KV-кэш",
            "Инструкции, предпочтения и выравнивание",
            "Дообучение без полной копии весов. LoRA и квантизация",
            "Что модель знает и чего она не проверяет",
            "Практика. Внимание, температура и вызов модели",
        ],
    },
    {
        "id": "rag",
        "title": "RAG",
        "summary": "Retrieval-augmented generation: индекс, BM25, эмбеддинги и проверка ответа по источнику.",
        "answers": SCRIPT / "rag_answers.md",
        "notes_title": "RAG",
        "intro": (
            "RAG — retrieval-augmented generation. Модель отвечает по найденным документам, "
            "а не только по весам. Формулы ниже из Lewis et al., 2020, из BM25 "
            "(Robertson, Zaragoza, 2009) и из dense retrieval (Karpukhin et al., 2020). "
            "Текст статей сюда не переносился."
        ),
        "expected": [
            "Зачем RAG",
            "Документ, кусок и индекс",
            "Разреженный поиск и поиск по векторам",
            "Как найденные куски входят в ответ",
            "Где поиск ошибается и как это проверить",
            "Когда нужен поиск, а когда дообучение",
            "Практика. Индекс, BM25 и сборка ответа",
        ],
    },
]


def cards(text: str) -> list[tuple[str, str]]:
    found: list[tuple[str, str]] = []
    for chunk in text.split("\n## "):
        chunk = chunk.strip()
        if not chunk:
            continue
        title, _, body = chunk.partition("\n")
        title = title.removeprefix("## ").strip()
        found.append((title, body.strip() + "\n"))
    return found


def main() -> None:
    track = ROOT / "content" / "language-models"
    topic_rows = []
    for topic in TOPICS:
        found = cards(topic["answers"].read_text(encoding="utf-8"))
        titles = [title for title, _ in found]
        if titles != topic["expected"]:
            raise SystemExit(f"{topic['id']} titles diverged:\n{titles}")
        out = track / topic["id"]
        out.mkdir(parents=True, exist_ok=True)
        bodies = [f"## {title}\n\n{body.strip()}" for title, body in found]
        notes = f"# {topic['notes_title']}\n\n{topic['intro']}\n\n" + "\n\n".join(bodies) + "\n"
        items = [
            {
                "id": f"language-models-{topic['id']}-t-{index:02d}",
                "kind": "practice" if title.startswith("Практика.") else "theory",
                "title": title,
                "tags": [topic["id"]],
                "body": body.strip(),
            }
            for index, (title, body) in enumerate(found, start=1)
        ]
        (out / "notes.md").write_text(notes, encoding="utf-8")
        (out / "topic.json").write_text(
            json.dumps(
                {
                    "id": topic["id"],
                    "trackId": "language-models",
                    "title": topic["title"],
                    "summary": topic["summary"],
                },
                ensure_ascii=False,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        (out / "items.json").write_text(
            json.dumps(
                {"topicId": topic["id"], "trackId": "language-models", "items": items},
                ensure_ascii=False,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        topic_rows.append(
            {"id": topic["id"], "title": topic["title"], "kind": ["theory", "practice"]}
        )
        for index, (_, body) in enumerate(found, start=1):
            print(f"{topic['id']} {index:02d} chars {len(body)}")

    (track / "track.json").write_text(
        json.dumps(
            {
                "id": "language-models",
                "title": "Языковые модели",
                "topics": topic_rows,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
