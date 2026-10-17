# Learn Tracks

Открытый учебный репозиторий: конспекты уже пройденных тем и сайт для повторения. Первая специальность — Data Science.

Сайт: [https://danlikendy.github.io/learn-tracks/](https://danlikendy.github.io/learn-tracks/)

Ключевые слова: data science, machine learning, supervised learning, linear models, logistic regression, SVM, scikit-learn, notes, GitHub Pages.

Исходные заметки переносятся близко к тексту. Формулы набраны в LaTeX, код приведён к одному стилю (`X`, `y`, `y_pred`, `model_lr`, `clf`, `RANDOM_STATE = 42`).

## Структура

- `content/` — треки, темы, исходные txt, полный конспект, карточки
- `app/` — GitHub Pages: конспект, закрепление теорией и практикой, прогресс, кабинет, тема, уведомления
- `.cursor/rules/` — правила контента и обозначений

## Локально

```bash
cd app
npm install
npm run dev
```

Откройте `http://localhost:5173/learn-tracks/`.

Сайт на GitHub Pages собирается Actions при каждом пуше в `main` (`app/dist`, базовый путь `/learn-tracks/`).

## Сейчас

Data Science: «Линейные модели в машинном обучении» и «Обучение с учителем: качество модели». Дальше материалы будут добавляться постепенно, в том числе из внешнего MCP-ресурса.
