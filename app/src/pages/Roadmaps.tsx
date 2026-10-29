import { Link } from 'react-router-dom'
import { TOPICS, displayHeading, type Topic } from '../lib/content'

const paths: {
  id: string
  title: string
  lead: string
  stages: { topicId: string; why: string }[]
}[] = [
  {
    id: 'math',
    title: 'Математическая база',
    lead: 'Сначала язык, на котором написаны метрики, градиент и проверка гипотез.',
    stages: [
      {
        topicId: 'statistics',
        why: 'Вероятность, распределения, доверительные интервалы и гипотезы о средних.',
      },
      {
        topicId: 'numerical-methods',
        why: 'Сколько операций стоит обучение и как итеративные методы ищут минимум.',
      },
    ],
  },
  {
    id: 'ml',
    title: 'Классический ML',
    lead: 'Линейные модели, качество, дисбаланс классов и то, как это считается в продукте.',
    stages: [
      {
        topicId: 'ida',
        why: 'Двадцать один вопрос программы: от определений до текста и изображений.',
      },
      {
        topicId: 'linear-models',
        why: 'Регрессия, логистическая регрессия, метрики и подготовка признаков.',
      },
      {
        topicId: 'supervised-quality',
        why: 'SVM, переобучение, валидация, подбор гиперпараметров и интерпретация.',
      },
      {
        topicId: 'ml-business',
        why: 'Деньги, воронка и A/B-тест: качество модели в метриках бизнеса.',
      },
    ],
  },
  {
    id: 'dl',
    title: 'Глубокое обучение',
    lead: 'От градиента и персептрона до PyTorch, обратного распространения и регуляризации.',
    stages: [
      {
        topicId: 'numerical-methods',
        why: 'Градиентный спуск, нейрон и бустинг — численный фундамент сетей.',
      },
      {
        topicId: 'deep-learning',
        why: 'Архитектуры, активации, тензоры, функция потерь, Dropout и BatchNorm.',
      },
    ],
  },
  {
    id: 'nlp',
    title: 'NLP',
    lead: 'Текст как признаки: от леммы и мешка слов до эмбеддингов и RuBERT.',
    stages: [
      {
        topicId: 'nlp',
        why: 'Предобработка, TF-IDF, тональность, word2vec и BERT.',
      },
      {
        topicId: 'deep-learning',
        why: 'Рекуррентные сети и генерация текста в курсе моделей.',
      },
    ],
  },
  {
    id: 'llm',
    title: 'Языковые модели',
    lead: 'Сначала сама модель: токен, внимание, генерация. Потом внешняя память, когда факта в весах нет.',
    stages: [
      {
        topicId: 'llm',
        why: 'Вероятность следующего токена, трансформер, температура, выравнивание и LoRA.',
      },
      {
        topicId: 'rag',
        why: 'RAG: индекс, BM25, эмбеддинги и проверка, что ответ следует из фрагмента.',
      },
    ],
  },
  {
    id: 'cv',
    title: 'Computer Vision',
    lead: 'Пиксель, свёртка, детекция и сегментация. Классическое зрение и нейросети.',
    stages: [
      {
        topicId: 'computer-vision',
        why: 'RGB, OpenCV, ядро свёртки, ResNet, детекция и сегментация.',
      },
      {
        topicId: 'deep-learning',
        why: 'Свёрточная сеть и GAN как архитектуры под изображение.',
      },
    ],
  },
  {
    id: 'series',
    title: 'Временные ряды',
    lead: 'Ряд, сезонность, лаги и прогноз — классикой и сетями.',
    stages: [
      {
        topicId: 'time-series',
        why: 'Ресемплирование, стационарность, скользящее среднее и признаки.',
      },
      {
        topicId: 'deep-learning',
        why: 'Прогнозирование рядов полносвязными и рекуррентными сетями.',
      },
    ],
  },
]

const methodMap: { title: string; note: string; links: { to: string; label: string }[] }[] = [
  {
    title: 'С учителем',
    note: 'Ответ известен: число в регрессии, метка в классификации. Веса ищут прямой формулой или шагами градиента.',
    links: [
      { to: '/item/data-science-ida-t-08', label: 'Линейная регрессия' },
      { to: '/learn?topic=numerical-methods#время-обучения-линейной-регрессии', label: 'Прямой метод' },
      { to: '/learn?topic=numerical-methods#итеративные-методы', label: 'Итеративный метод' },
      {
        to: '/learn?topic=numerical-methods#градиентный-спуск-для-линейной-регрессии',
        label: 'Градиентный спуск для регрессии',
      },
      { to: '/item/data-science-ida-t-09', label: 'Логистическая регрессия' },
      { to: '/item/data-science-ida-t-12', label: 'Деревья решений' },
      { to: '/item/data-science-ida-t-15', label: 'SVM' },
      { to: '/item/data-science-ida-t-13', label: 'Метрики классификации' },
    ],
  },
  {
    title: 'Без учителя',
    note: 'Метки нет. Кластеризация собирает похожие объекты, снижение размерности оставляет оси с наибольшим разбросом.',
    links: [
      { to: '/item/data-science-ida-t-16', label: 'Кластеризация' },
      { to: '/item/data-science-ida-t-17', label: 'Снижение размерности' },
      { to: '/item/data-science-ida-t-19', label: 'Метод главных компонент' },
    ],
  },
  {
    title: 'Как ищут минимум',
    note: 'Бисекция требует разных знаков на концах отрезка и останавливается, когда длина отрезка меньше error. Градиент задаёт направление шага. Тем же шагом учат регрессию, сеть и бустинг.',
    links: [
      { to: '/learn?topic=numerical-methods#метод-бисекции', label: 'Бисекция и остановка' },
      { to: '/learn?topic=numerical-methods#градиент-функции', label: 'Градиент' },
      { to: '/learn?topic=numerical-methods#стохастический-градиентный-спуск', label: 'SGD' },
      { to: '/learn?topic=numerical-methods#основы-нейронных-сетей', label: 'Нейрон' },
      { to: '/learn?topic=numerical-methods#градиентный-бустинг', label: 'Градиентный бустинг' },
      { to: '/learn?topic=deep-learning', label: 'Глубокое обучение' },
    ],
  },
]

function topicById(id: string): Topic | undefined {
  return TOPICS.find((topic) => topic.id === id)
}

export function Roadmaps() {
  const covered = new Set(paths.flatMap((path) => path.stages.map((stage) => stage.topicId)))
  const rest = TOPICS.filter((topic) => !covered.has(topic.id))

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Роадмапы</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Сначала карта: откуда метод и в каком модуле он лежит. Ниже — те же модули
          по маршрутам. Ссылка открывает конспект или карточку, которая уже есть в курсе.
        </p>
        <nav className="mt-5 flex flex-wrap gap-2">
          {paths.map((path) => (
            <a
              key={path.id}
              href={`#path-${path.id}`}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-sm"
            >
              {path.title}
            </a>
          ))}
        </nav>
      </header>
      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl">Карта методов</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {methodMap.map((group) => (
            <article key={group.title} className="rounded-3xl border border-[var(--line)] p-5">
              <h3 className="font-serif text-xl">{group.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{group.note}</p>
              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="underline decoration-[var(--line)] underline-offset-4">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      {paths.map((path) => (
        <section key={path.id} id={`path-${path.id}`} className="scroll-mt-24">
          <h2 className="font-serif text-2xl">{path.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{path.lead}</p>
          <ol className="mt-6 flex flex-col gap-4">
            {path.stages.map((stage, index) => {
              const topic = topicById(stage.topicId)
              if (!topic) return null
              const theory = topic.items.filter((item) => item.kind === 'theory')
              const practice = topic.items.filter((item) => item.kind === 'practice')
              return (
                <li
                  key={`${path.id}-${stage.topicId}-${index}`}
                  className="rounded-3xl border border-[var(--line)] p-5"
                >
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-serif text-2xl text-[var(--muted)]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-serif text-xl">{topic.title}</h3>
                    <span className="text-xs text-[var(--muted)]">{topic.trackTitle}</span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6">{stage.why}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <Link
                      to={`/learn?topic=${topic.id}`}
                      className="rounded-full bg-[var(--fg)] px-3 py-1 text-[var(--bg)]"
                    >
                      Конспект
                    </Link>
                    <Link
                      to={`/cards?topic=${topic.id}`}
                      className="rounded-full border border-[var(--line)] px-3 py-1"
                    >
                      Теория · {theory.length}
                    </Link>
                    <Link
                      to={`/cards?topic=${topic.id}&kind=practice`}
                      className="rounded-full border border-[var(--line)] px-3 py-1"
                    >
                      Практика · {practice.length}
                    </Link>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {theory.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={`/item/${item.id}`}
                          className="inline-block rounded-full bg-[var(--bg-elev)] px-3 py-1 text-xs"
                        >
                          {displayHeading(item.title)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
      {rest.length > 0 ? (
        <section>
          <h2 className="font-serif text-2xl">Ещё не вошло в маршрут</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {rest.map((topic) => (
              <li key={topic.id}>
                <Link to={`/learn?topic=${topic.id}`}>{topic.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
