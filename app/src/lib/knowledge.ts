import { TOPICS, slugifyHeading } from './content'

export type Concept = {
  id: string
  label: string
  blurb?: string
  formula?: string
  topicId?: string
  headingId?: string
  children: string[]
}

const nm = 'numerical-methods'
const lm = 'linear-models'
const ida = 'ida'
const sq = 'supervised-quality'

function at(topicId: string, heading: string): Pick<Concept, 'topicId' | 'headingId'> {
  return { topicId, headingId: slugifyHeading(heading) }
}

function node(
  id: string,
  label: string,
  children: string[] = [],
  extra: Partial<Omit<Concept, 'id' | 'label' | 'children'>> = {},
): Concept {
  return { id, label, children, ...extra }
}

/**
 * Hierarchy follows MachineLearningRoadmap (justxor):
 * foundation → classical ML → deep learning → LLM → generative → MLOps → specialization,
 * plus learning paradigms and numerical search that cut across tasks.
 */
export const CONCEPTS: Concept[] = [
  node('ml', 'Машинное обучение', [
    'foundation',
    'paradigms',
    'classical',
    'deep',
    'llm',
    'generative',
    'mlops',
    'specialize',
    'search',
  ], {
    ...at(ida, 'Интеллектуальный анализ данных, большие данные и машинное обучение: основные понятия и методы'),
  }),

  // —— Трек 1. Фундамент (roadmap: Python, math, stats, tools) ——
  node('foundation', 'Фундамент', ['math', 'stats', 'tools'], {
    ...at(ida, 'Введение в науку о данных. Виды и типы данных. Источники данных. Разведывательный анализ данных'),
  }),
  node('math', 'Математика для ML', [
    'vectors',
    'matrices',
    'eigen',
    'derivatives',
    'chain',
    'matrix-calc',
    'prob',
    'dist',
    'mle',
    'opt-math',
    'info-theory',
  ], {
    ...at(lm, 'Векторы и расстояния'),
  }),
  node('vectors', 'Векторы'),
  node('matrices', 'Матрицы', [], {
    formula: 'w = (X^{T} X)^{-1} X^{T} y',
    ...at(lm, 'Матрицы и нормальное уравнение'),
  }),
  node('eigen', 'Собственные значения и SVD'),
  node('derivatives', 'Производные'),
  node('chain', 'Цепное правило', [], {
    ...at('deep-learning', 'Обратное распространение ошибки'),
  }),
  node('matrix-calc', 'Матричное дифференцирование'),
  node('prob', 'Вероятность', [], {
    ...at('statistics', 'Вероятность: классическое и геометрическое определения'),
  }),
  node('dist', 'Распределения', ['normal-dist', 'binomial', 'poisson'], {
    ...at('statistics', 'Непрерывное равномерное и нормальное распределения'),
  }),
  node('normal-dist', 'Нормальное распределение', [], {
    ...at('statistics', 'Нормальное распределение'),
  }),
  node('binomial', 'Биномиальное распределение', [], {
    ...at('statistics', 'Биномиальное распределение'),
  }),
  node('poisson', 'Распределение Пуассона', [], {
    ...at('statistics', 'Распределение Пуассона'),
  }),
  node('mle', 'MLE и MAP'),
  node('opt-math', 'Оптимизация', [], {
    blurb: 'Минимум функции потерь. Связана с градиентным спуском и прямым решением.',
  }),
  node('info-theory', 'Теория информации'),
  node('stats', 'Статистика', ['hypothesis', 'ci', 'sampling'], {
    ...at(ida, 'Статистические основы обработки данных'),
  }),
  node('hypothesis', 'Проверка гипотез', [], {
    ...at('statistics', 'Гипотеза о равенстве средних двух генеральных совокупностей'),
  }),
  node('ci', 'Доверительные интервалы'),
  node('sampling', 'Выборки'),
  node('tools', 'Инструменты', ['python', 'numpy', 'pandas', 'sklearn-tool'], {
    ...at(lm, 'sklearn и размерности'),
  }),
  node('python', 'Python'),
  node('numpy', 'NumPy'),
  node('pandas', 'Pandas'),
  node('sklearn-tool', 'scikit-learn'),

  // —— Парадигмы ——
  node('paradigms', 'Парадигмы обучения', [
    'supervised',
    'unsupervised',
    'self-supervised',
    'rl',
  ], {
    blurb: 'Есть ли метка y, и что система должна вернуть.',
    ...at(ida, 'Основные классы моделей машинного обучения'),
  }),
  node('supervised', 'С учителем', ['regression', 'classification', 'ranking'], {
    blurb: 'В выборке есть ответ y. По новым X предсказывают y.',
    ...at(lm, 'Задача и модель'),
  }),
  node('unsupervised', 'Без учителя', ['cluster', 'dimred', 'density'], {
    blurb: 'Метки нет. Ищут структуру в X.',
    ...at(ida, 'Кластерный анализ. Метод k-средних. Метод сдвига к среднему. Метод DBSCAN. Метод иерархического слияния'),
  }),
  node('self-supervised', 'Self-supervised', [], {
    blurb: 'Метку строят из самих данных: следующий токен, маскированный кусок, аугментация.',
  }),
  node('rl', 'Обучение с подкреплением', ['rlhf'], {
    blurb: 'Агент действует в среде и максимизирует награду.',
  }),
  node('rlhf', 'RLHF / DPO', [], {
    blurb: 'Выравнивание языковой модели по предпочтениям человека.',
    ...at('llm', 'Инструкции, предпочтения и выравнивание'),
  }),

  // —— Трек 2. Классический ML ——
  node('classical', 'Классический ML', [
    'ensembles',
    'metrics',
    'validation',
    'regularization',
    'features',
  ], {
    ...at(ida, 'Современные технологии машинного обучения'),
  }),

  node('regression', 'Регрессия', [
    'linreg',
    'metrics-reg',
    'poly',
    'tree-reg',
  ], {
    blurb: 'Ответ y — число.',
    ...at(ida, 'Линейная регрессия. Метрики качества регрессионной модели'),
  }),
  node('linreg', 'Линейная регрессия', [
    'pred',
    'ols',
    'mse-task',
    'normal',
    'train-cost',
    'ridge',
    'lasso',
    'elastic',
  ], {
    blurb: 'Предсказание линейно по признакам. Веса — прямой формулой или градиентом.',
    ...at(ida, 'Линейная регрессия. Метрики качества регрессионной модели'),
  }),
  node('pred', 'Предсказание', [], {
    formula: 'y_{\\mathrm{pred}} = Xw',
    ...at(nm, 'Время обучения линейной регрессии'),
  }),
  node('ols', 'Метод наименьших квадратов', [], {
    formula: 'S = \\sum_{i=1}^{n} (y_{\\mathrm{true}, i} - y_{\\mathrm{pred}, i})^2 \\to \\min',
    ...at(lm, 'Задача и модель'),
  }),
  node('mse-task', 'Задача обучения', [], {
    formula: 'w = \\arg\\min \\mathrm{MSE}(Xw, y)',
    ...at(nm, 'Время обучения линейной регрессии'),
  }),
  node('normal', 'Нормальное уравнение', [], {
    formula: 'w = (X^{T} X)^{-1} X^{T} y',
    blurb: 'Прямой метод: точные веса одной формулой.',
    ...at(nm, 'Время обучения линейной регрессии'),
  }),
  node('train-cost', 'Сложность обучения', [], {
    formula: 'T(n, p) \\sim np^{2}',
    blurb: 'При p < n после XᵀX, обращения и Xᵀy остаётся np².',
    ...at(nm, 'Время обучения линейной регрессии'),
  }),
  node('ridge', 'Ridge (L2)', [], {
    ...at(sq, 'L2-регуляризация'),
  }),
  node('lasso', 'Lasso (L1)', [], {
    ...at(sq, 'L1-регуляризация'),
  }),
  node('elastic', 'ElasticNet'),
  node('poly', 'Полиномиальные признаки', [], {
    ...at(ida, 'Подгонка нелинейных признаков (полиномиальные признаки в линейной регрессии)'),
  }),
  node('tree-reg', 'Дерево (регрессия)', [], {
    blurb: 'В листе — среднее y.',
    ...at(ida, 'Деревья решений'),
  }),
  node('metrics-reg', 'Метрики регрессии', ['mse', 'rmse', 'mae', 'r2'], {
    ...at(lm, 'Метрики регрессии'),
  }),
  node('mse', 'MSE', [], {
    formula: '\\mathrm{MSE} = \\frac{1}{N} \\sum_{i=1}^{n} (y_{\\mathrm{true}} - y_{\\mathrm{pred}})^2',
    ...at(lm, 'Метрики регрессии'),
  }),
  node('rmse', 'RMSE', [], {
    formula: '\\mathrm{RMSE} = \\sqrt{\\frac{1}{N} \\sum_{i=1}^{n} (y_{\\mathrm{true}} - y_{\\mathrm{pred}})^2}',
    ...at(lm, 'Метрики регрессии'),
  }),
  node('mae', 'MAE', [], {
    formula: '\\mathrm{MAE} = \\frac{1}{N} \\sum_{i=1}^{n} |y_{\\mathrm{true}} - y_{\\mathrm{pred}}|',
    ...at(lm, 'Средняя абсолютная ошибка и $R^2$'),
  }),
  node('r2', 'R²', [], {
    formula: 'R^{2} = 1 - \\frac{\\sum_{i=1}^{n} (y_{\\mathrm{true}} - y_{\\mathrm{pred}})^{2}}{\\sum_{i=1}^{n} (y_{\\mathrm{true}} - \\overline{y})^{2}}',
    ...at(lm, 'Средняя абсолютная ошибка и $R^2$'),
  }),

  node('classification', 'Классификация', [
    'logreg',
    'svm',
    'tree',
    'knn',
    'naive-bayes',
    'metrics-cls',
    'imbalance',
  ], {
    blurb: 'Ответ y — метка класса. Бинарная, многоклассовая или мультилейбл.',
    ...at(lm, 'Классификация'),
  }),
  node('logreg', 'Логистическая регрессия', [], {
    formula: 'y(x) = \\frac{1}{1+e^{-x}}',
    blurb: 'Линейный счёт → вероятность. Веса ищут градиентом.',
    ...at(ida, 'Логистическая регрессия. Метрики качества логистической регрессии'),
  }),
  node('svm', 'SVM', [], {
    blurb: 'Гиперплоскость с максимальным зазором.',
    ...at(ida, 'Машины опорных векторов'),
  }),
  node('tree', 'Дерево решений', ['gini', 'entropy', 'cart'], {
    blurb: 'Один вид модели для классов и для числа.',
    ...at(ida, 'Деревья решений'),
  }),
  node('gini', 'Gini'),
  node('entropy', 'Энтропия'),
  node('cart', 'CART'),
  node('knn', 'k ближайших соседей', [], {
    ...at(sq, 'Модель kNN'),
  }),
  node('naive-bayes', 'Naive Bayes'),
  node('metrics-cls', 'Метрики классификации', [
    'confusion',
    'precision',
    'f1',
    'roc',
  ], {
    ...at(lm, 'Матрица ошибок'),
  }),
  node('confusion', 'Матрица ошибок', [], {
    ...at(lm, 'Матрица ошибок'),
  }),
  node('precision', 'Precision и recall', [], {
    formula: '\\mathrm{precision} = \\frac{\\mathrm{TP}}{\\mathrm{TP}+\\mathrm{FP}},\\ \\mathrm{recall} = \\frac{\\mathrm{TP}}{\\mathrm{TP}+\\mathrm{FN}}',
    ...at(lm, 'Precision и Recall'),
  }),
  node('f1', 'F1', [], {
    ...at(lm, 'Precision и Recall'),
  }),
  node('roc', 'ROC-AUC', [], {
    ...at(sq, 'Метрики TPR, FPR'),
  }),
  node('imbalance', 'Дисбаланс классов', ['smote', 'undersample', 'class-weight'], {
    ...at(sq, 'Базовый оверсэмплинг'),
  }),
  node('smote', 'SMOTE', [], { ...at(sq, 'SMOTE') }),
  node('undersample', 'Undersampling', [], { ...at(sq, 'Undersampling') }),
  node('class-weight', 'Веса классов', [], { ...at(sq, 'Взвешивание классов') }),
  node('ranking', 'Ранжирование', [], {
    blurb: 'Нужен порядок объектов, а не абсолютное число.',
  }),

  node('cluster', 'Кластеризация', ['kmeans', 'dbscan', 'meanshift', 'hier', 'gmm'], {
    ...at(ida, 'Кластерный анализ. Метод k-средних. Метод сдвига к среднему. Метод DBSCAN. Метод иерархического слияния'),
  }),
  node('kmeans', 'k средних', [], {
    ...at(ida, 'Кластерный анализ. Метод k-средних. Метод сдвига к среднему. Метод DBSCAN. Метод иерархического слияния'),
  }),
  node('dbscan', 'DBSCAN', [], {
    ...at(ida, 'Кластерный анализ. Метод k-средних. Метод сдвига к среднему. Метод DBSCAN. Метод иерархического слияния'),
  }),
  node('meanshift', 'Сдвиг к среднему', [], {
    ...at(ida, 'Кластерный анализ. Метод k-средних. Метод сдвига к среднему. Метод DBSCAN. Метод иерархического слияния'),
  }),
  node('hier', 'Иерархическое слияние', [], {
    ...at(ida, 'Кластерный анализ. Метод k-средних. Метод сдвига к среднему. Метод DBSCAN. Метод иерархического слияния'),
  }),
  node('gmm', 'GMM / EM'),
  node('density', 'Оценка плотности'),
  node('dimred', 'Снижение размерности', ['pca', 'tsne', 'umap', 'feat'], {
    ...at(ida, 'Методы снижения размерности и их использование'),
  }),
  node('pca', 'PCA', [], {
    ...at(ida, 'Снижение размерности. Метод главных компонент'),
  }),
  node('tsne', 't-SNE'),
  node('umap', 'UMAP'),
  node('feat', 'Отбор и выделение признаков', [], {
    ...at(ida, 'Снижение размерности. Выделение признаков. Отбор признаков'),
  }),

  node('ensembles', 'Ансамбли', ['bagging', 'rf', 'boost', 'stacking'], {
    ...at(nm, 'Ансамбли и бустинг'),
  }),
  node('bagging', 'Bagging'),
  node('rf', 'Random Forest'),
  node('boost', 'Градиентный бустинг', ['xgb', 'lgbm', 'catboost'], {
    blurb: 'Следующее дерево учится на градиенте потерь текущего ансамбля.',
    ...at(nm, 'Градиентный бустинг'),
  }),
  node('xgb', 'XGBoost', [], { ...at(nm, 'Библиотеки для градиентного бустинга') }),
  node('lgbm', 'LightGBM', [], { ...at(nm, 'Библиотеки для градиентного бустинга') }),
  node('catboost', 'CatBoost', [], { ...at(nm, 'Библиотеки для градиентного бустинга') }),
  node('stacking', 'Стекинг и блендинг'),

  node('metrics', 'Метрики качества', ['metrics-reg', 'metrics-cls'], {
    ...at(ida, 'Методы оценки качества моделей классификации'),
  }),
  node('validation', 'Валидация', ['holdout', 'kfold', 'leak'], {
    ...at(ida, 'Цикл обработки данных'),
  }),
  node('holdout', 'Train / val / test', [], {
    ...at(ida, 'Как отделяют оценку от обучения'),
  }),
  node('kfold', 'Кросс-валидация', [], {
    ...at(ida, 'Как отделяют оценку от обучения'),
  }),
  node('leak', 'Утечка данных', [], {
    ...at(ida, 'Как отделяют оценку от обучения'),
  }),
  node('regularization', 'Регуляризация', ['ridge', 'lasso', 'dropout', 'early-stop'], {
    ...at(sq, 'Сравнение L1 и L2'),
  }),
  node('dropout', 'Dropout', [], { ...at('deep-learning', 'Dropout') }),
  node('early-stop', 'Early stopping'),
  node('features', 'Признаки', ['scale', 'ohe', 'feature-eng'], {
    ...at(lm, 'Типы признаков и подготовка данных'),
  }),
  node('scale', 'Масштабирование', [], { ...at(lm, 'Стандартизация и нормализация') }),
  node('ohe', 'One-Hot Encoding', [], { ...at(lm, 'One-Hot Encoding') }),
  node('feature-eng', 'Feature engineering'),

  // —— Трек 3. Deep Learning ——
  node('deep', 'Deep Learning', [
    'neuron',
    'mlp',
    'activations',
    'loss',
    'backprop',
    'optimizers',
    'cnn',
    'rnn',
    'attention',
    'transformer',
    'batchnorm',
  ], {
    blurb: 'Нейросети на PyTorch: от персептрона до трансформера.',
    ...at('deep-learning', 'Типы задач для нейронных сетей'),
  }),
  node('neuron', 'Нейрон', [], { ...at(nm, 'Основы нейронных сетей') }),
  node('mlp', 'MLP / полносвязная сеть', [], {
    ...at('deep-learning', 'Полносвязная нейросеть прямого распространения, ПНС'),
  }),
  node('activations', 'Функции активации', ['relu', 'sigmoid-act', 'tanh'], {
    ...at('deep-learning', 'Функция активации'),
  }),
  node('relu', 'ReLU', [], { ...at('deep-learning', 'Функция активации ReLU') }),
  node('sigmoid-act', 'Сигмоида', [], {
    formula: 'y(x) = \\frac{1}{1+e^{-x}}',
    ...at('deep-learning', 'Логистическая функция и гиперболический тангенс'),
  }),
  node('tanh', 'tanh', [], {
    ...at('deep-learning', 'Логистическая функция и гиперболический тангенс'),
  }),
  node('loss', 'Функция потерь', ['ce'], {
    ...at('deep-learning', 'Функция потерь'),
  }),
  node('ce', 'Cross-entropy'),
  node('backprop', 'Обратное распространение', [], {
    ...at('deep-learning', 'Обратное распространение ошибки'),
  }),
  node('optimizers', 'Оптимизаторы', ['gd', 'sgd', 'adam'], {
    ...at(nm, 'Градиентный спуск'),
  }),
  node('gd', 'Градиентный спуск', [], {
    blurb: 'Шаг против градиента. Им учат регрессию, логистическую регрессию, сеть и бустинг.',
    ...at(nm, 'Градиентный спуск'),
  }),
  node('sgd', 'SGD', [], {
    ...at(nm, 'Стохастический градиентный спуск'),
  }),
  node('adam', 'Adam', [], {
    ...at('computer-vision', 'Алгоритм Adam'),
  }),
  node('cnn', 'CNN', ['conv', 'pooling', 'resnet'], {
    ...at('deep-learning', 'Свёрточная нейронная сеть, ConvNet'),
  }),
  node('conv', 'Свёртка', [], {
    ...at('computer-vision', 'Что такое ядро свёртки?'),
  }),
  node('pooling', 'Pooling', [], { ...at('computer-vision', 'Pooling') }),
  node('resnet', 'ResNet', [], { ...at('computer-vision', 'Что такое ResNet?') }),
  node('rnn', 'RNN / LSTM', [], {
    ...at('deep-learning', 'Рекуррентная нейронная сеть, РНС'),
  }),
  node('attention', 'Внимание', [], {
    ...at('llm', 'Самовнимание'),
  }),
  node('transformer', 'Трансформер', ['encoder-decoder', 'kv-cache'], {
    ...at('llm', 'Блок декодера. Энкодер, декодер и энкодер-декодер'),
  }),
  node('encoder-decoder', 'Энкодер / декодер', [], {
    ...at('llm', 'Блок декодера. Энкодер, декодер и энкодер-декодер'),
  }),
  node('kv-cache', 'KV-кэш', [], {
    ...at('llm', 'Генерация. Температура, контекст и KV-кэш'),
  }),
  node('batchnorm', 'BatchNorm', [], {
    ...at('deep-learning', 'Batch Normalization'),
  }),

  // —— Трек 4. LLM ——
  node('llm', 'LLM и трансформеры', [
    'tokens',
    'embed',
    'attention',
    'transformer',
    'next-token',
    'generation',
    'alignment',
    'finetune',
    'rag',
    'agents',
  ], {
    blurb: 'Внутренности GPT, fine-tuning, RAG, агенты.',
    ...at('llm', 'Что такое языковая модель'),
  }),
  node('tokens', 'Токены', [], {
    ...at('llm', 'Токены. Как текст превращается в числа'),
  }),
  node('embed', 'Эмбеддинги', [], {
    ...at('llm', 'Эмбеддинги и позиция токена'),
  }),
  node('next-token', 'Следующий токен', [], {
    blurb: 'Классификация по словарю на каждом шаге.',
    ...at('llm', 'Обучение предсказанию следующего токена'),
  }),
  node('generation', 'Генерация', ['temperature'], {
    ...at('llm', 'Генерация. Температура, контекст и KV-кэш'),
  }),
  node('temperature', 'Температура', [], {
    ...at('llm', 'Генерация. Температура, контекст и KV-кэш'),
  }),
  node('alignment', 'Выравнивание', ['rlhf'], {
    ...at('llm', 'Инструкции, предпочтения и выравнивание'),
  }),
  node('finetune', 'Дообучение', ['lora', 'quantize'], {
    ...at('llm', 'Дообучение без полной копии весов. LoRA и квантизация'),
  }),
  node('lora', 'LoRA', [], {
    ...at('llm', 'Дообучение без полной копии весов. LoRA и квантизация'),
  }),
  node('quantize', 'Квантизация', [], {
    ...at('llm', 'Дообучение без полной копии весов. LoRA и квантизация'),
  }),
  node('rag', 'RAG', ['chunk', 'bm25', 'vector-search', 'hybrid'], {
    ...at('rag', 'Зачем RAG'),
  }),
  node('chunk', 'Чанки и индекс', [], {
    ...at('rag', 'Документ, кусок и индекс'),
  }),
  node('bm25', 'BM25', [], {
    ...at('rag', 'Разреженный поиск и поиск по векторам'),
  }),
  node('vector-search', 'Векторный поиск', [], {
    ...at('rag', 'Разреженный поиск и поиск по векторам'),
  }),
  node('hybrid', 'Гибридный поиск', [], {
    ...at('rag', 'Разреженный поиск и поиск по векторам'),
  }),
  node('agents', 'Агенты', ['agent-tools', 'react']),
  node('agent-tools', 'Инструменты агента'),
  node('react', 'ReAct'),

  // —— Трек 5. Generative ——
  node('generative', 'Generative AI', ['gan', 'diffusion', 'multimodal', 'prompt'], {
    blurb: 'Диффузия, мультимодальность, prompt engineering.',
  }),
  node('gan', 'GAN', [], {
    ...at('deep-learning', 'Генеративная нейронная сеть, GAN'),
  }),
  node('diffusion', 'Diffusion'),
  node('multimodal', 'Мультимодальность', ['clip', 'vlm']),
  node('clip', 'CLIP'),
  node('vlm', 'VLM'),
  node('prompt', 'Prompt engineering'),

  // —— Трек 6. MLOps ——
  node('mlops', 'MLOps и прод', [
    'serving',
    'docker',
    'cicd',
    'monitor',
    'ab',
    'business',
  ], {
    blurb: 'От ноутбука до сервиса: Docker, мониторинг, A/B.',
  }),
  node('serving', 'Serving'),
  node('docker', 'Docker / K8s'),
  node('cicd', 'CI/CD'),
  node('monitor', 'Мониторинг и drift'),
  node('ab', 'A/B-тесты', [], {
    ...at('ml-business', 'A/B-тестирование'),
  }),
  node('business', 'Метрики бизнеса', [], {
    ...at('ml-business', 'Метрики бизнеса'),
  }),

  // —— Трек 7. Специализация ——
  node('specialize', 'Специализация', ['vision', 'nlp', 'series', 'recsys', 'safety'], {
    blurb: 'CV, NLP, ряды, рекомендации, safety — на выбор.',
  }),
  node('vision', 'Computer Vision', [
    'pixels',
    'cnn',
    'detection',
    'segmentation',
    'aug',
  ], {
    ...at('computer-vision', 'Типы изображений'),
  }),
  node('pixels', 'Пиксели и RGB', [], {
    ...at('computer-vision', 'Что такое пиксели?'),
  }),
  node('detection', 'Детекция', [], {
    ...at('computer-vision', 'Задача детекции объектов'),
  }),
  node('segmentation', 'Сегментация', [], {
    ...at('computer-vision', 'Задача сегментации изображений'),
  }),
  node('aug', 'Аугментации', [], {
    ...at('computer-vision', 'Аугментации изображений'),
  }),
  node('nlp', 'NLP', ['bow', 'tfidf', 'w2v', 'bert', 'llm'], {
    ...at('nlp', 'Мешок слов и N-граммы'),
  }),
  node('bow', 'Мешок слов', [], { ...at('nlp', 'Мешок слов и N-граммы') }),
  node('tfidf', 'TF-IDF', [], { ...at('nlp', 'TF-IDF') }),
  node('w2v', 'Word2vec', [], { ...at('nlp', 'Word2vec') }),
  node('bert', 'BERT / RuBERT', [], { ...at('nlp', 'BERT') }),
  node('series', 'Временные ряды', ['forecast', 'stationarity', 'lags'], {
    ...at('time-series', 'Временные ряды'),
  }),
  node('forecast', 'Прогноз', [], {
    blurb: 'Следующее значение — регрессия по лагам.',
    ...at('time-series', 'Задача прогнозирования'),
  }),
  node('stationarity', 'Стационарность', [], {
    ...at('time-series', 'Стационарные ряды'),
  }),
  node('lags', 'Лаги и признаки', [], {
    ...at('time-series', 'Создание признаков'),
  }),
  node('recsys', 'Рекомендательные системы'),
  node('safety', 'Safety и оценка'),

  // —— Поиск решения / численные методы ——
  node('search', 'Поиск решения', ['direct', 'iterative', 'complexity'], {
    blurb: 'Как находят веса: формулой, итерациями или градиентом. Один поиск обслуживает разные задачи.',
  }),
  node('direct', 'Прямой метод', ['normal', 'train-cost'], {
    blurb: 'Точное решение по формуле. Сложность не зависит от значений в выборке.',
    ...at(nm, 'Итеративные методы'),
  }),
  node('iterative', 'Итеративный метод', ['bisection', 'gd', 'sgd'], {
    blurb: 'Приближение за шаги. Сложность зависит от числа шагов и от данных.',
    ...at(nm, 'Итеративные методы'),
  }),
  node('bisection', 'Бисекция', ['mid', 'stop'], {
    ...at(nm, 'Метод бисекции'),
  }),
  node('mid', 'Середина отрезка', [], {
    formula: 'c = \\frac{a+b}{2}',
    ...at(nm, 'Метод бисекции'),
  }),
  node('stop', 'Остановка', [], {
    formula: 'b - a < \\mathrm{error}',
    ...at(nm, 'Метод бисекции'),
  }),
  node('complexity', 'Время работы', [
    'alg-time',
    'real-time',
    'wall',
    'asymp',
  ], {
    blurb: 'Секунды на разных машинах несравнимы. Считают операции и рост с n.',
  }),
  node('alg-time', 'algorithm running time', [], {
    formula: 'T(n)',
    blurb: 'Число элементарных операций. Для increase: T(n) = 4n + 3.',
  }),
  node('real-time', 'real running time', [], {
    blurb: 'Время на конкретном компьютере.',
  }),
  node('wall', 'wall-clock time', [], {
    blurb: 'Время по часам, не процессорное.',
  }),
  node('asymp', 'asymptotic running time', ['lin', 'quad', 'cub', 'konst'], {
    blurb: 'Как растёт T(n) при больших n. У многочлена оставляют старший одночлен.',
  }),
  node('lin', 'Линейная сложность', [], { formula: 'T(n) \\sim n' }),
  node('quad', 'Квадратичная сложность', [], { formula: 'T(n) \\sim n^{2}' }),
  node('cub', 'Кубическая сложность', [], { formula: 'T(n) \\sim n^{3}' }),
  node('konst', 'Константная сложность', [], { formula: 'T(n) \\sim 1' }),
]

export const CONCEPT_BY_ID = new Map(CONCEPTS.map((c) => [c.id, c]))

export const ROOT_ID = 'ml'

/** First screen: root + its immediate children only. */
export const INITIAL_OPEN = new Set<string>([ROOT_ID])

export function childrenOf(id: string): string[] {
  return CONCEPT_BY_ID.get(id)?.children ?? []
}

export function hasChildren(id: string): boolean {
  return childrenOf(id).length > 0
}

/** Visible = every opened node + children of opened nodes (and root). */
export function visibleFrom(opened: Set<string>): Set<string> {
  const visible = new Set<string>([ROOT_ID])
  for (const id of opened) {
    visible.add(id)
    for (const child of childrenOf(id)) visible.add(child)
  }
  return visible
}

function extractSection(topicId?: string, headingId?: string): string {
  if (!topicId) return ''
  const topic = TOPICS.find((entry) => entry.id === topicId)
  if (!topic) return ''
  if (!headingId) return topic.notes.trim()
  const lines = topic.notes.split('\n')
  const chunks: string[] = []
  let take = false
  let startLevel = 2
  let inCode = false
  for (const line of lines) {
    if (line.trim().startsWith('```')) inCode = !inCode
    const heading = !inCode ? /^(#{1,3})\s+(.+)$/.exec(line) : null
    if (heading) {
      const level = heading[1].length
      const id = slugifyHeading(heading[2])
      if (take && level <= startLevel) break
      if (id === headingId) {
        take = true
        startLevel = level
        chunks.push(line)
        continue
      }
    }
    if (take) chunks.push(line)
  }
  return chunks.join('\n').trim()
}

export function notesFor(concept: Concept): string {
  let section = extractSection(concept.topicId, concept.headingId)
  if (!section && concept.topicId) {
    section = extractSection(concept.topicId, slugifyHeading(concept.label))
  }
  const parts: string[] = []
  if (concept.formula) parts.push(`$$\n${concept.formula}\n$$`)
  if (section) parts.push(section)
  return parts.join('\n\n')
}
