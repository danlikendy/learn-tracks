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

const ida = 'ida'
const lm = 'linear-models'
const stats = 'statistics'
const nm = 'numerical-methods'
const dl = 'deep-learning'
const cv = 'computer-vision'
const nlp = 'nlp'
const llm = 'llm'
const rag = 'rag'
const ts = 'time-series'
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
 * Machine Learning roadmap aligned with machine-learning.pdf / roadmap.sh outline.
 * Leaf nodes link to existing conspect sections where available.
 */
export const CONCEPTS: Concept[] = [
  node(
    'ml',
    'Machine Learning',
    [
      'intro',
      'math-found',
      'prog-fund',
      'data-collection',
      'data-cleaning',
      'ml-core',
      'supervised',
      'unsupervised',
      'reinforcement',
      'model-eval',
      'deep',
      'advanced-ml',
    ],
    {
      ...at(ida, 'Интеллектуальный анализ данных, большие данные и машинное обучение: основные понятия и методы'),
    },
  ),

  // —— Introduction ——
  node('intro', 'Introduction', ['intro-ml-eng', 'intro-vs-ai', 'intro-skills'], {
    blurb: 'Роли, отличия, зона ответственности.',
  }),
  node('intro-ml-eng', 'What is an ML Engineer?'),
  node('intro-vs-ai', 'ML Engineer vs AI Engineer'),
  node('intro-skills', 'Skills and Responsibilities'),

  // —— Mathematical Foundations ——
  node('math-found', 'Mathematical Foundations', ['la', 'calc', 'disc-math', 'stats-block', 'prob-block'], {
    ...at(lm, 'Векторы и расстояния'),
  }),

  node('la', 'Linear Algebra', ['la-matrices', 'la-vectors-tensors', 'la-svd', 'la-det-inv', 'la-eigen'], {
    ...at(lm, 'Матрицы и нормальное уравнение'),
  }),
  node('la-matrices', 'Matrix & Matrix Operations', [], { ...at(lm, 'Матрицы и нормальное уравнение') }),
  node('la-vectors-tensors', 'Scalars, Vectors, Tensors', [], {
    ...at(dl, 'Тензор'),
  }),
  node('la-svd', 'Singular Value Decomposition', [], { ...at(ida, 'Методы снижения размерности и их использование') }),
  node('la-det-inv', 'Determinants, inverse of Matrix'),
  node('la-eigen', 'Eigenvalues, Diagonalization', [], { ...at(ida, 'Снижение размерности. Метод главных компонент') }),

  node('calc', 'Calculus', ['calc-grad', 'calc-chain', 'calc-partial'], {
    ...at(nm, 'Градиент функции'),
  }),
  node('calc-grad', 'Gradient, Jacobian, Hessian', [], { ...at(nm, 'Градиент функции') }),
  node('calc-chain', 'Chain rule of derivation', [], { ...at(dl, 'Обратное распространение ошибки') }),
  node('calc-partial', 'Derivatives, Partial Derivatives', [], { ...at(nm, 'Градиент функции') }),

  node('disc-math', 'Discrete Mathematics'),

  node('stats-block', 'Statistics', ['stats-basic', 'stats-descr', 'stats-graphs', 'stats-inf'], {
    ...at(ida, 'Статистические основы обработки данных'),
  }),
  node('stats-basic', 'Basic concepts', [], { ...at(ida, 'Статистические основы обработки данных') }),
  node('stats-descr', 'Descriptive Statistics', [], { ...at(stats, 'Мода') }),
  node('stats-graphs', 'Graphs & Charts'),
  node('stats-inf', 'Inferential Statistics', [], { ...at(stats, 'Гипотеза о равенстве средних двух генеральных совокупностей') }),

  node('prob-block', 'Probability', ['prob-basics', 'prob-dist', 'prob-rv-pdf', 'prob-bayes'], {
    ...at(stats, 'Вероятность: классическое и геометрическое определения'),
  }),
  node('prob-basics', 'Basics of Probability', [], { ...at(stats, 'Классическое определение вероятности') }),
  node('prob-dist', 'Types of Distribution', ['prob-normal', 'prob-binom', 'prob-poisson'], {
    ...at(stats, 'Непрерывное равномерное и нормальное распределения'),
  }),
  node('prob-normal', 'Normal distribution', [], { ...at(stats, 'Нормальное распределение') }),
  node('prob-binom', 'Binomial', [], { ...at(stats, 'Биномиальное распределение') }),
  node('prob-poisson', 'Poisson', [], { ...at(stats, 'Распределение Пуассона') }),
  node('prob-rv-pdf', 'Random Variances, PDFs', [], { ...at(stats, 'Функция нормального распределения') }),
  node('prob-bayes', 'Bayes Theorem'),

  // —— Programming Fundamentals ——
  node('prog-fund', 'Programming Fundamentals', ['prog-syntax', 'prog-python', 'prog-oop', 'prog-libs'], {
    ...at(lm, 'sklearn и размерности'),
  }),

  node('prog-syntax', 'Basic Syntax (overview)'),

  node('prog-python', 'Python', ['py-ds', 'py-vars', 'py-loops', 'py-cond', 'py-exc', 'py-func'], {
    ...at(lm, 'Матрицы numpy'),
  }),
  node('py-ds', 'Data Structures', [], { ...at(lm, 'Матрицы numpy') }),
  node('py-vars', 'Variables and Data Types'),
  node('py-loops', 'Loops'),
  node('py-cond', 'Conditionals'),
  node('py-exc', 'Exceptions'),
  node('py-func', 'Functions, Builtin Functions'),

  node('prog-oop', 'Object Oriented Programming'),

  node('prog-libs', 'Essential libraries', ['lib-numpy', 'lib-pandas', 'lib-mpl', 'lib-seaborn'], {
    ...at(lm, 'sklearn и размерности'),
  }),
  node('lib-numpy', 'NumPy', [], { ...at(lm, 'Матрицы numpy') }),
  node('lib-pandas', 'Pandas'),
  node('lib-mpl', 'Matplotlib', [], { ...at(cv, 'Выводим изображение в Jupyter Notebook с помощью matplotlib') }),
  node('lib-seaborn', 'Seaborn', [], { ...at(lm, 'Матрица корреляции') }),

  // —— Data Collection ——
  node('data-collection', 'Data Collection', ['dc-sources', 'dc-formats'], {
    ...at(ida, 'Введение в науку о данных. Виды и типы данных. Источники данных. Разведывательный анализ данных'),
  }),

  node('dc-sources', 'Data Sources', ['ds-iot', 'ds-mobile', 'ds-internet', 'ds-api', 'ds-db'], {
    ...at(ida, 'Источники данных'),
  }),
  node('ds-iot', 'IoT'),
  node('ds-mobile', 'Mobile Apps'),
  node('ds-internet', 'Internet'),
  node('ds-api', 'APIs'),
  node('ds-db', 'Databases (SQL, No-SQL)'),

  node('dc-formats', 'Data Formats', ['df-excel', 'df-csv', 'df-json', 'df-parquet', 'df-other'], {
    ...at(ida, 'Виды и типы данных'),
  }),
  node('df-excel', 'Excel'),
  node('df-csv', 'CSV'),
  node('df-json', 'JSON'),
  node('df-parquet', 'Parquet'),
  node('df-other', 'Other Data Formats'),

  // —— Data Cleaning / Preprocessing ——
  node('data-cleaning', 'Data Cleaning', ['prep-tech'], {
    ...at(ida, 'Цикл обработки данных'),
  }),
  node('prep-tech', 'Preprocessing Techniques', ['prep-clean', 'prep-fe', 'prep-scale', 'prep-dimred', 'prep-fsel'], {
    ...at(ida, '3. Подготовка'),
  }),
  node('prep-clean', 'Data Cleaning', [], { ...at(ida, '3. Подготовка') }),
  node('prep-fe', 'Feature Engineering', [], { ...at(lm, 'Типы признаков и подготовка данных') }),
  node('prep-scale', 'Feature Scaling & Normalization', [], { ...at(lm, 'Стандартизация и нормализация') }),
  node('prep-dimred', 'Dimensionality Reduction', ['prep-pca', 'prep-ae'], {
    ...at(ida, 'Снижение размерности. Метод главных компонент'),
  }),
  node('prep-pca', 'PCA', [], { ...at(ida, 'Снижение размерности. Метод главных компонент') }),
  node('prep-ae', 'Autoencoders'),
  node('prep-fsel', 'Feature Selection', [], { ...at(ida, 'Снижение размерности. Выделение признаков. Отбор признаков') }),

  // —— Machine Learning (overview, types, sklearn) ——
  node('ml-core', 'ML overview & Scikit-learn', ['ml-what', 'ml-types', 'sklearn-block'], {
    ...at(ida, 'Основные классы моделей машинного обучения'),
  }),
  node('ml-what', 'What is Machine Learning?', [], { ...at(ida, 'Машинное обучение') }),
  node('ml-types', 'Types of Machine Learning', ['mt-sup', 'mt-unsup', 'mt-self', 'mt-semi', 'mt-rl'], {
    ...at(ida, 'Основные классы моделей машинного обучения'),
  }),
  node('mt-sup', 'Supervised Learning', [], { ...at(ida, 'Обучение с учителем') }),
  node('mt-unsup', 'Unsupervised Learning', [], { ...at(ida, 'Обучение без учителя') }),
  node('mt-self', 'Self-supervised Learning'),
  node('mt-semi', 'Semi-supervised Learning'),
  node('mt-rl', 'Reinforcement Learning', [], { ...at(ida, 'Обучение с подкреплением') }),

  node('sklearn-block', 'Scikit-learn', ['sk-load', 'sk-split', 'sk-prep', 'sk-select', 'sk-predict', 'sk-tune'], {
    ...at(lm, 'sklearn и размерности'),
  }),
  node('sk-load', 'Data Loading', [], { ...at(lm, 'sklearn и размерности') }),
  node('sk-split', 'Train - Test Data', [], { ...at(ida, 'Как отделяют оценку от обучения') }),
  node('sk-prep', 'Data Preparation', [], { ...at(lm, 'Стандартизация и нормализация') }),
  node('sk-select', 'Model Selection', [], { ...at(ida, '4. Моделирование') }),
  node('sk-predict', 'Prediction', [], { ...at(lm, 'Линейная регрессия') }),
  node('sk-tune', 'Tuning', [], { ...at(nm, 'Регуляризация градиентного бустинга') }),

  // —— Supervised Learning (detail) ——
  node('supervised', 'Supervised Learning', ['sup-what', 'sup-cls', 'sup-reg'], {
    ...at(ida, 'Обучение с учителем'),
  }),
  node('sup-what', 'What is Supervised Learning?', [], { ...at(lm, 'Задача и модель') }),

  node('sup-cls', 'Classification', ['cls-knn', 'cls-logreg', 'cls-svm', 'cls-trees', 'cls-gbm'], {
    ...at(lm, 'Классификация'),
  }),
  node('cls-knn', 'K-Nearest Neighbors (KNN)', [], { ...at(sq, 'Модель kNN') }),
  node('cls-logreg', 'Logistic Regression', [], {
    formula: 'y(x) = \\frac{1}{1+e^{-x}}',
    ...at(ida, 'Логистическая регрессия. Метрики качества логистической регрессии'),
  }),
  node('cls-svm', 'Support Vector Machines', [], { ...at(ida, 'Машины опорных векторов') }),
  node('cls-trees', 'Decision Trees, Random Forest', ['cls-tree-gini', 'cls-tree-ent', 'cls-rf'], {
    ...at(ida, 'Деревья решений'),
  }),
  node('cls-tree-gini', 'Gini', [], { ...at(ida, 'Джини из квадрата вероятностей') }),
  node('cls-tree-ent', 'Entropy', [], { ...at(ida, 'Энтропия из правдоподобия') }),
  node('cls-rf', 'Random Forest', [], { ...at(nm, 'Ансамбли и бустинг') }),
  node('cls-gbm', 'Gradient Boosting Machines', ['cls-xgb', 'cls-lgbm', 'cls-cat'], {
    ...at(nm, 'Градиентный бустинг'),
  }),
  node('cls-xgb', 'XGBoost', [], { ...at(nm, 'Библиотеки для градиентного бустинга') }),
  node('cls-lgbm', 'LightGBM', [], { ...at(nm, 'Библиотеки для градиентного бустинга') }),
  node('cls-cat', 'CatBoost', [], { ...at(nm, 'Библиотеки для градиентного бустинга') }),

  node('sup-reg', 'Regression', ['reg-lin', 'reg-poly', 'reg-elastic', 'reg-lasso', 'reg-ridge'], {
    ...at(ida, 'Линейная регрессия. Метрики качества регрессионной модели'),
  }),
  node('reg-lin', 'Linear Regression', ['reg-pred', 'reg-ols', 'reg-mse-task', 'reg-normal', 'reg-train-cost'], {
    ...at(lm, 'Задача и модель'),
  }),
  node('reg-pred', 'Prediction', [], {
    formula: 'y_{\\mathrm{pred}} = Xw',
    ...at(nm, 'Время обучения линейной регрессии'),
  }),
  node('reg-ols', 'МНК / OLS', [], {
    formula: 'w = (X^{T} X)^{-1} X^{T} y',
    ...at(lm, 'Матрицы и нормальное уравнение'),
  }),
  node('reg-mse-task', 'Задача обучения (MSE)', [], {
    formula: 'w = \\arg\\min \\mathrm{MSE}(Xw, y)',
    ...at(nm, 'Время обучения линейной регрессии'),
  }),
  node('reg-normal', 'Нормальное уравнение', [], { ...at(nm, 'Время обучения линейной регрессии') }),
  node('reg-train-cost', 'Сложность обучения', [], {
    formula: 'T(n, p) \\sim np^{2}',
    ...at(nm, 'Время обучения линейной регрессии'),
  }),
  node('reg-poly', 'Polynomial Regression', [], { ...at(ida, 'Подгонка нелинейных признаков (полиномиальные признаки в линейной регрессии)') }),
  node('reg-elastic', 'ElasticNet Regularization', [], { ...at(sq, 'Сравнение L1 и L2') }),
  node('reg-lasso', 'Lasso', [], { ...at(sq, 'L1-регуляризация') }),
  node('reg-ridge', 'Ridge', [], { ...at(sq, 'L2-регуляризация') }),

  // —— Unsupervised Learning ——
  node('unsupervised', 'Unsupervised Learning', ['unsup-what', 'unsup-cluster', 'unsup-dimred'], {
    ...at(ida, 'Обучение без учителя'),
  }),
  node('unsup-what', 'What is Unsupervised Learning?', [], { ...at(ida, 'Обучение без учителя') }),

  node('unsup-cluster', 'Clustering', ['cl-kmeans', 'cl-exclusive', 'cl-overlap', 'cl-hier', 'cl-prob'], {
    ...at(ida, 'Кластерный анализ. Метод k-средних. Метод сдвига к среднему. Метод DBSCAN. Метод иерархического слияния'),
  }),
  node('cl-kmeans', 'k-means', [], { ...at(ida, 'Метод k-средних') }),
  node('cl-exclusive', 'Exclusive', [], { ...at(ida, 'Метод k-средних') }),
  node('cl-overlap', 'Overlapping', [], { ...at(ida, 'DBSCAN') }),
  node('cl-hier', 'Hierarchical', [], { ...at(ida, 'Иерархическое слияние') }),
  node('cl-prob', 'Probabilistic', [], { ...at(ida, 'Кластерный анализ. Метод k-средних. Метод сдвига к среднему. Метод DBSCAN. Метод иерархического слияния') }),

  node('unsup-dimred', 'Dimensionality Reduction (unsupervised)', ['ud-pca', 'ud-ae'], {
    ...at(ida, 'Снижение размерности. Метод главных компонент'),
  }),
  node('ud-pca', 'Principal Component Analysis', [], { ...at(ida, 'Снижение размерности. Метод главных компонент') }),
  node('ud-ae', 'Autoencoders'),

  // —— Reinforcement Learning ——
  node('reinforcement', 'Reinforcement Learning', ['rl-what', 'rl-dqn', 'rl-pg', 'rl-ac', 'rl-q'], {
    ...at(ida, 'Обучение с подкреплением'),
  }),
  node('rl-what', 'What is Reinforcement Learning?', [], { ...at(ida, 'Обучение с подкреплением') }),
  node('rl-dqn', 'Deep-Q Networks'),
  node('rl-pg', 'Policy Gradient'),
  node('rl-ac', 'Actor-Critic Methods'),
  node('rl-q', 'Q-Learning'),

  // —— Model Evaluation ——
  node('model-eval', 'Model Evaluation', ['me-what', 'me-why', 'me-metrics', 'me-metrics-reg', 'me-val'], {
    ...at(ida, 'Методы оценки качества моделей классификации'),
  }),
  node('me-what', 'What is Model Evaluation?', [], { ...at(ida, '5. Оценка') }),
  node('me-why', 'Why is it important?', [], { ...at(ida, 'Как отделяют оценку от обучения') }),
  node('me-metrics', 'Metrics to Evaluate', ['m-f1', 'm-logloss', 'm-roc', 'm-cm', 'm-acc', 'm-prec', 'm-rec'], {
    ...at(ida, 'Методы оценки качества моделей классификации'),
  }),
  node('m-f1', 'F1-Score', [], { ...at(lm, 'Precision и Recall') }),
  node('m-logloss', 'Log Loss', [], { ...at(dl, 'Функция потерь') }),
  node('m-roc', 'ROC-AUC', [], { ...at(sq, 'Метрики TPR, FPR') }),
  node('m-cm', 'Confusion Matrix', [], { ...at(lm, 'Матрица ошибок') }),
  node('m-acc', 'Accuracy', [], { ...at(lm, 'Матрица ошибок') }),
  node('m-prec', 'Precision', [], { ...at(lm, 'Precision и Recall') }),
  node('m-rec', 'Recall', [], { ...at(lm, 'Precision и Recall') }),
  node('me-metrics-reg', 'Regression metrics', ['mr-mse', 'mr-rmse', 'mr-mae', 'mr-r2'], {
    ...at(lm, 'Метрики регрессии'),
  }),
  node('mr-mse', 'MSE', [], {
    formula: '\\mathrm{MSE} = \\frac{1}{N} \\sum_{i=1}^{n} (y_{\\mathrm{true}} - y_{\\mathrm{pred}})^2',
    ...at(lm, 'Метрики регрессии'),
  }),
  node('mr-rmse', 'RMSE', [], {
    formula: '\\mathrm{RMSE} = \\sqrt{\\frac{1}{N} \\sum_{i=1}^{n} (y_{\\mathrm{true}} - y_{\\mathrm{pred}})^2}',
    ...at(lm, 'Метрики регрессии'),
  }),
  node('mr-mae', 'MAE', [], {
    formula: '\\mathrm{MAE} = \\frac{1}{N} \\sum_{i=1}^{n} |y_{\\mathrm{true}} - y_{\\mathrm{pred}}|',
    ...at(lm, 'Средняя абсолютная ошибка и $R^2$'),
  }),
  node('mr-r2', 'R²', [], {
    formula: 'R^{2} = 1 - \\frac{\\sum_{i=1}^{n} (y_{\\mathrm{true}} - y_{\\mathrm{pred}})^{2}}{\\sum_{i=1}^{n} (y_{\\mathrm{true}} - \\overline{y})^{2}}',
    ...at(lm, 'Средняя абсолютная ошибка и $R^2$'),
  }),
  node('me-val', 'Validation Techniques', ['v-kfold', 'v-loocv'], {
    ...at(ida, 'Как отделяют оценку от обучения'),
  }),
  node('v-kfold', 'K-Fold Cross Validation', [], { ...at(ida, 'Как отделяют оценку от обучения') }),
  node('v-loocv', 'LOOCV', [], { ...at(ida, 'Как отделяют оценку от обучения') }),

  // —— Deep Learning ——
  node(
    'deep',
    'Deep Learning',
    [
      'dl-nn-basics',
      'dl-libs',
      'dl-arch',
      'dl-cnn',
      'dl-cnn-apps',
      'dl-rnn',
      'dl-attn',
      'dl-ae',
      'dl-gan',
    ],
    {
      ...at(dl, 'Типы задач для нейронных сетей'),
    },
  ),

  node('dl-nn-basics', 'Neural Network (NN) Basics', ['nn-perc', 'nn-fwd', 'nn-bp', 'nn-act', 'nn-loss'], {
    ...at(dl, 'Биологический и искусственный нейрон'),
  }),
  node('nn-perc', 'Perceptron, Multi-layer Perceptrons', [], { ...at(dl, 'Полносвязная нейросеть прямого распространения, ПНС') }),
  node('nn-fwd', 'Forward propagation', [], { ...at(dl, 'Полносвязная нейросеть прямого распространения, ПНС') }),
  node('nn-bp', 'Back Propagation', [], { ...at(dl, 'Обратное распространение ошибки') }),
  node('nn-act', 'Activation Functions', ['act-relu', 'act-sig', 'act-tanh'], {
    ...at(dl, 'Функция активации'),
  }),
  node('act-relu', 'ReLU', [], { ...at(dl, 'Функция активации ReLU') }),
  node('act-sig', 'Sigmoid', [], {
    formula: 'y(x) = \\frac{1}{1+e^{-x}}',
    ...at(dl, 'Логистическая функция и гиперболический тангенс'),
  }),
  node('act-tanh', 'tanh', [], { ...at(dl, 'Логистическая функция и гиперболический тангенс') }),
  node('nn-loss', 'Loss Functions', [], { ...at(dl, 'Функция потерь') }),

  node('dl-libs', 'Deep Learning Libraries', ['lib-tf', 'lib-keras', 'lib-pt', 'lib-sklearn-dl'], {
    ...at(dl, 'Введение в PyTorch'),
  }),
  node('lib-tf', 'TensorFlow'),
  node('lib-keras', 'Keras', [], { ...at(cv, 'Библиотека Keras') }),
  node('lib-pt', 'PyTorch', [], { ...at(dl, 'Введение в PyTorch') }),
  node('lib-sklearn-dl', 'Scikit-learn', [], { ...at(lm, 'sklearn и размерности') }),

  node('dl-arch', 'Deep Learning Architectures', [], { ...at(dl, 'Слои и архитектура нейронной сети') }),

  node('dl-cnn', 'Convolutional Neural Network', ['cnn-conv', 'cnn-pool', 'cnn-stride', 'cnn-pad'], {
    ...at(dl, 'Свёрточная нейронная сеть, ConvNet'),
  }),
  node('cnn-conv', 'Convolution', [], { ...at(cv, 'Что такое ядро свёртки?') }),
  node('cnn-pool', 'Pooling', [], { ...at(cv, 'Pooling') }),
  node('cnn-stride', 'Strides', [], { ...at(cv, 'Двумерная свёртка') }),
  node('cnn-pad', 'Padding', [], { ...at(cv, 'Свёрточный слой') }),

  node('dl-cnn-apps', 'Applications of CNNs', ['cnn-imgvid', 'cnn-cls', 'cnn-seg', 'cnn-reco'], {
    ...at(cv, 'Задача классификации изображений'),
  }),
  node('cnn-imgvid', 'Image & Video Recognition', [], { ...at(cv, 'Типы изображений') }),
  node('cnn-cls', 'Image Classification', [], { ...at(cv, 'Задача классификации изображений') }),
  node('cnn-seg', 'Image Segmentation', [], { ...at(cv, 'Задача сегментации изображений') }),
  node('cnn-reco', 'Recommendation Systems', [], { ...at(ts, 'Задача прогнозирования') }),

  node('dl-rnn', 'Recurrent Neural Networks', ['rnn-rnn', 'rnn-lstm', 'rnn-gru'], {
    ...at(dl, 'Рекуррентная нейронная сеть, РНС'),
  }),
  node('rnn-rnn', 'RNN', [], { ...at(dl, 'Рекуррентная нейронная сеть, РНС') }),
  node('rnn-lstm', 'LSTM', [], { ...at(dl, 'Рекуррентная нейронная сеть, РНС') }),
  node('rnn-gru', 'GRU', [], { ...at(dl, 'Рекуррентная нейронная сеть, РНС') }),

  node('dl-attn', 'Attention Mechanisms', ['att-self', 'att-tr', 'att-mh'], {
    ...at(llm, 'Самовнимание'),
  }),
  node('att-self', 'Self-Attention', [], { ...at(llm, 'Самовнимание') }),
  node('att-tr', 'Transformers', [], { ...at(llm, 'Блок декодера. Энкодер, декодер и энкодер-декодер') }),
  node('att-mh', 'Multi-head Attention', [], { ...at(llm, 'Блок декодера. Энкодер, декодер и энкодер-декодер') }),

  node('dl-ae', 'Autoencoders'),
  node('dl-gan', 'Generative Adversarial Networks', [], { ...at(dl, 'Генеративная нейронная сеть, GAN') }),

  // —— Advanced Concepts ——
  node('advanced-ml', 'Advanced Concepts in ML', ['adv-nlp', 'adv-xai'], {
    blurb: 'NLP, объяснимость.',
  }),

  node('adv-nlp', 'Natural Language Processing', ['nlp-tok', 'nlp-lem', 'nlp-emb', 'nlp-att', 'nlp-stem', 'nlp-rag'], {
    ...at(nlp, 'Мешок слов и N-граммы'),
  }),
  node('nlp-tok', 'Tokenization', [], { ...at(llm, 'Токены. Как текст превращается в числа') }),
  node('nlp-lem', 'Lemmatization', [], { ...at(nlp, 'Регулярные выражения') }),
  node('nlp-emb', 'Embeddings', [], { ...at(nlp, 'Embeddings') }),
  node('nlp-att', 'Attention Models', [], { ...at(llm, 'Самовнимание') }),
  node('nlp-stem', 'Stemming', [], { ...at(nlp, 'Регулярные выражения') }),
  node('nlp-rag', 'RAG / retrieval', ['rag-chunk', 'rag-bm25', 'rag-vec'], {
    ...at(rag, 'Зачем RAG'),
  }),
  node('rag-chunk', 'Chunks & index', [], { ...at(rag, 'Документ, кусок и индекс') }),
  node('rag-bm25', 'BM25', [], { ...at(rag, 'Разреженный поиск и поиск по векторам') }),
  node('rag-vec', 'Vector search', [], { ...at(rag, 'Разреженный поиск и поиск по векторам') }),

  node('adv-xai', 'Explainable AI', ['xai-shap'], {
    ...at(sq, 'Методы отбора признаков'),
  }),
  node('xai-shap', 'SHAP', [], { ...at(sq, 'Методы отбора признаков') }),
]

export const CONCEPT_BY_ID = new Map(CONCEPTS.map((c) => [c.id, c]))

export const ROOT_ID = 'ml'

/** First screen: root only (expand branches as needed). */
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
