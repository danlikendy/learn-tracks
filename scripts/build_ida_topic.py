"""Assemble the IDA topic from scripts/ida_answers.md.

Each second-level heading is one theory card. The wording in that file is the
source of the published notes: conspect sentences stay intact, the order is
the order of the question.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ANSWERS = Path(__file__).resolve().parent / "ida_answers.md"
OUT = ROOT / "content" / "data-science" / "ida"

EXPECTED = [
    "Интеллектуальный анализ данных, большие данные и машинное обучение: основные понятия и методы",
    "Введение в науку о данных. Виды и типы данных. Источники данных. Разведывательный анализ данных",
    "Области применения методов и технологий интеллектуального анализа данных, машинного обучения и обработки больших данных. Примеры задач",
    "Цикл обработки данных",
    "Статистические основы обработки данных",
    "Современные технологии машинного обучения",
    "Основные классы моделей машинного обучения",
    "Линейная регрессия. Метрики качества регрессионной модели",
    "Логистическая регрессия. Метрики качества логистической регрессии",
    "Модель множественной линейной регрессии",
    "Подгонка нелинейных признаков (полиномиальные признаки в линейной регрессии)",
    "Деревья решений",
    "Методы оценки качества моделей классификации",
    "Нейронные сети. Градиентный спуск. Метод обратного распространения ошибки",
    "Машины опорных векторов",
    "Кластерный анализ. Метод k-средних. Метод сдвига к среднему. Метод DBSCAN. Метод иерархического слияния",
    "Методы снижения размерности и их использование",
    "Снижение размерности. Выделение признаков. Отбор признаков",
    "Снижение размерности. Метод главных компонент",
    "Принципы анализа текстовой информации",
    "Принципы анализа графической информации",
]

INTRO = (
    "Каждый вопрос ниже отвечает на свою формулировку, в том порядке, "
    "в каком она задана. Определения и формулы из конспектов перенесены "
    "без пересказа. Связки между ними написаны отдельно. Главы учебника "
    "[Яндекса](https://github.com/pos002/ml_yandex_handbook) в текст не копировались: "
    "из них взяты только недостающие шаги, и у каждого такого шага указана глава."
)


def cards(text: str) -> list[tuple[str, str]]:
    chunks = text.split("\n## ")
    found: list[tuple[str, str]] = []
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        title, _, body = chunk.partition("\n")
        title = title.removeprefix("## ").strip()
        body = body.strip() + "\n"
        found.append((title, body))
    return found


def main() -> None:
    found = cards(ANSWERS.read_text(encoding="utf-8"))
    titles = [title for title, _ in found]
    if titles != EXPECTED:
        raise SystemExit(f"titles diverged:\n{titles}")

    bodies = [f"## {title}\n\n{body.strip()}" for title, body in found]
    notes = "# Интеллектуальный анализ данных\n\n" + INTRO + "\n\n" + "\n\n".join(bodies) + "\n"
    items = [
        {
            "id": f"data-science-ida-t-{index:02d}",
            "kind": "theory",
            "title": title,
            "tags": ["ida"],
            "body": body,
        }
        for index, (title, body) in enumerate(found, start=1)
    ]
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "notes.md").write_text(notes, encoding="utf-8")
    (OUT / "topic.json").write_text(
        json.dumps(
            {
                "id": "ida",
                "trackId": "data-science",
                "title": "Интеллектуальный анализ данных",
                "summary": "Двадцать один вопрос программы: определения, модели, метрики, текст и изображения.",
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    (OUT / "items.json").write_text(
        json.dumps(
            {"topicId": "ida", "trackId": "data-science", "items": items},
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    for index, (_, body) in enumerate(found, start=1):
        print(f"{index:02d} chars {len(body)}")


if __name__ == "__main__":
    main()
