# Линейные модели в машинном обучении

## Задача и модель

Задача — это то, что нужно решить, а модель — то, что решает задачу.

Чтобы подобрать коэффициенты функции, алгоритм использует метод наименьших квадратов. Это отлично работает, если целевой признак зависит от входных линейно.

Метод наименьших квадратов

$$
S = \sum_{i=1}^{n} (y_{\mathrm{true},i} - y_{\mathrm{pred},i})^2 \to \min
$$

(Он считает сумму квадратов всех ошибок среди предсказанных целевых признаков.)

Помимо диаграммы рассеяния, проверить линейную связь между признаками можно по матрице корреляции. Для признаков total_area и price из данных о квартирах в разных городах коэффициент Пирсона составляет 0.027588. Согласно шкале Чеддока, такое значение говорит об отсутствии линейной связи.

## Метрики регрессии

Среднеквадратичная ошибка (Если разделить сумму квадратов ошибок на число объектов прогноза, то получится средний квадрат ошибки)

$$
\mathrm{MSE} = \frac{1}{N} \sum_{i=1}^{n} (y_{\mathrm{true}} - y_{\mathrm{pred}})^2
$$

Корень среднеквадратичной ошибки

$$
\mathrm{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^{n} (y_{\mathrm{true}} - y_{\mathrm{pred}})^2}
$$

## Векторы и расстояния

Скалярное произведение

$$
a \cdot b = \sum_{i=1}^{n} (a_i \cdot b_i)
$$

Косинусное сходство

$$
\mathrm{sim}_{\cos}(a,b) = \cos(a,b)
$$

Косинусное расстояние

$$
d_{\cos}(a,b) = 1 - \cos(a,b) = 1 - \frac{a \cdot b}{|a| \cdot |b|}
$$

готовая функция для расчёта косинусного расстояния хоть и не в numpy, но существует — в библиотеке scipy.

Евклидово расстояние. Рассчитать евклидово расстояние можно по теореме Пифагора

$$
d(a,b) = \sqrt{\sum_{i=1}^{n} (a_i - b_i)^2}
$$

Евклидово расстояние учитывает не только направление векторов, но и длину.

## Матрицы и нормальное уравнение

Узнать форму матрицы или вектора можно с помощью атрибута `shape`.

Вот так можно найти коэффициенты линейной регрессии с помощью линала:

$$
w = (X^{T} X)^{-1} X^{T} y
$$

## Средняя абсолютная ошибка и $R^2$

Средняя абсолютная ошибка

$$
\mathrm{MAE} = \frac{1}{N} \sum_{i=1}^{n} |y_{\mathrm{true}} - y_{\mathrm{pred}}|
$$

Эту разницу легко увидеть, если построить графики для обеих метрик: параболу для MSE и функцию модуля для MAE. Чем больше разница между фактическим значением и предсказанием, тем больше метрика MSE по сравнению с MAE.

Из этого следует несколько выводов:

- Выбросы негативно влияют на точность модели: из-за них возрастает ошибка предсказания.
- MSE и RMSE чувствительнее к выбросам, чем MAE. Это связано с формулой расчёта — возведение в квадрат сильно увеличивает итоговые значения метрики модели, особенно из-за выбросов. При взятии модуля такого не происходит.

Коэффициент детерминации $R^2$

$$
R^{2} = 1 - \frac{\sum_{i=1}^{n} (y_{\mathrm{true}} - y_{\mathrm{pred}})^{2}}{\sum_{i=1}^{n} (y_{\mathrm{true}} - \overline{y})^{2}} = 1 - \frac{\frac{1}{N}\sum_{i=1}^{n} (y_{\mathrm{true}} - y_{\mathrm{pred}})^{2}}{\frac{1}{N}\sum_{i=1}^{n} (y_{\mathrm{true}} - \overline{y})^{2}} = 1 - \frac{\mathrm{MSE}}{D}
$$

Коэффициент детерминации оценивает обобщающую способность модели. Это значит, что он определяет, насколько хорошо модель «объясняет», предсказывает целевой признак по входным.

Коэффициент детерминации $R^2$ лежит в диапазоне $[-\infty, 1]$.

## Типы признаков и подготовка данных

Количественные, или числовые, содержат действительные числа и принимают любое значение на определённом интервале. Этот тип не делится на другие.

Категориальные, или качественные, принимают одно из ограниченного числа фиксированных значений. Они делятся на номинальные, порядковые и бинарные, ко всем из них нужен свой подход.

Масштабирование. Если количественные признаки слишком сильно отличаются масштабом, то нужно привести их к одному. Масштабирование изменяет данные без искажений их структуры и сохраняет все зависимости между признаками при переводе в новый диапазон значений.

Кодирование. Оно приводит категориальные признаки к понятным модели стандартам. Большинство моделей не умеет напрямую работать с номинальными, порядковыми и бинарными данными, поэтому их нужно закодировать как количественные.

Стандартизация

$$
x_{\mathrm{standart}} = \frac{x_i - \overline{x}}{\sigma(x)}, \quad \sigma(x)\text{ — стандартное отклонение}
$$

Важное правило — не масштабируйте тренировочные и тестовые данные одновременно! Если сразу передать `StandardScaler()` весь датасет, то произойдёт утечка данных. Это ситуация, когда из-за масштабирования тренировочная и тестовая выборки будут обладать общими свойствами.

Нормализация

$$
x_{\mathrm{normaliz}} = \frac{x_i - x_{\min}}{x_{\max} - x_{\min}}
$$

Самый известный из методов кодирования — One-Hot Encoding.

Избегание дамми-ловушек позволяет: удалить излишние признаки, которые не добавляют новой информации в данные для модели.

уменьшить количество данных — после кодирования количество признаков будет равно $N-1$, где $N$ — это количество уникальных значений категориального признака.

Если выбрать значение `first`, то каждый первый столбец при кодировании качественного признака будет удалён. При значении `'if_binary'` кодировщик удалит только первый столбец в каждом бинарном признаке, а остальные признаки закодирует, не обращая внимания на дамми-ловушки.

## Анализ остатков

Остатки модели

$$
\mathrm{residuals} = y_{\mathrm{true}} - y_{\mathrm{pred}}
$$

Основное правило анализа остатков: если модель правильно подобрана к исходным данным, то в остатках не должно остаться никаких закономерностей.

Симметричное нормальное распределение, Асимметричное нормальное распределение со смещением влево, Несимметричное нормальное распределение со смещением вправо, Несимметричное мультимодальное распределение, Выбросы.

Для всех случаев ненормального распределения данных подходят два совета:

- Найти и добавить в модель дополнительные признаки. Скорее всего, на этапе сбора данных не была учтена какая-то информация.
- Трансформировать данные, чтобы изменить взаимосвязь входных признаков с целевым. Этим преобразованиям вы научитесь в следующем курсе.

Постоянство дисперсии.

Нормальная дисперсия остатков, Чередование низкой и высокой дисперсии остатков, «Дуга».

Что делать?

Рецепты — те же, что и в случае смещённого распределения на гистограмме:

- Найти и добавить в модель дополнительные признаки. Скорее всего, на этапе сбора данных не учли какие-то признаки.
- Трансформировать данные, чтобы изменить взаимосвязь входных признаков с целевым. Этим преобразованиям будет посвящён следующий курс.

Основные этапы подготовки данных перед обучением модели:

1. разделить датасет на тренировочную и тестовую выборки;
2. выделить категориальные и количественные признаки;
3. отмасштабировать количественные признаки;
4. закодировать категориальные признаки;
5. объединить категориальные и количественные признаки;
6. обучить модель;
7. проверить её качество методом анализа остатков;
8. получить итоговую метрику качества работы модели.

## Классификация

Задача классификации. Задачи классификации нельзя путать с задачами регрессии. Вот в чём разница между ними:

Целевой признак в задачах классификации принимает категориальные значения, в задачах регрессии — количественные.

Цель задачи регрессии — найти функцию, описывающую связь между входными признаками $X_n$ и целевым $y$. Цель задачи классификации — присвоить класс объектам с входными признаками $X_n$. Значение целевого признака $y$, или метка класса, показано цветом точки.

Целевой признак в задачах бинарной классификации принимает значения 0 и 1.

$$
\mathrm{accuracy} = \frac{T}{N}
$$

показывает долю правильных ответов.

## Логистическая регрессия

Проблема линейной регресси в том, что если у нас будут хоть и количественные признаки, но, например, в интервале от 1 до 10 с шагом 1, - то-есть категории в действительности, а линейная регрессия будет воспринимать этот интервл как непрерывный, что неверно, мы не можем смотреть на светофор где показан градиент, а не 1 - зелёный, 2 - жёлтый, 3 - красный, поэтому использую логистическую регрессию.

см изображение.

Линейная регрессия не разделяет границей группы объектов, а наоборот, ищет взаимосвязь между ними. Поэтому задачи классификации решают другими методами: например, для бинарной классификации подходит логистическая регрессия.

Логистическая регрессия — это статистическая модель, которая классифицирует объекты при помощи логистической функции.

$$
y(x) = \frac{1}{1 + e^{-x}}
$$

см изображение.

Логистическая функция преобразует значения $x$ из интервала $(-\infty,+\infty)$ в интервал $(0,1)$.

Веса логистической функции

$$
y(x) = \frac{1}{1 + e^{-(w_{0} + w_{1} x)}}
$$

Ситуацию, когда у объекта только один входной признак, называют одномерным случаем.

Если взять логарифм в обеих частях уравнения, то формула логистической функции станет похожа на формулу линейной регрессии.

Разница в том, что $y$ логистической функции — это не просто скалярное значение, а натуральный логарифм отношения на основе класса объекта. Это выражение называется логит-функцией, оно позволяет работать с числами 0 и 1 как с метками классов. Для линейной регрессии 0 и 1 — это произвольные числовые значения.

Логистическая и линейная регрессии входят в семейство линейных моделей. Их объединяет то, что они основаны на регрессионном анализе — методе, которым изучают связи между независимыми переменными и зависимой, или между входными признаками и целевым.

## Оценки принадлежности к классу

`LogisticRegression` использует метод `predict_proba`. Он возвращает оценки вероятностей на промежутке 0 до 1 для всех объектов и каждого класса.

В левой колонке указана вероятность принадлежности объекта к классу 0, а справа — к классу 1. В задачах бинарной классификации достаточно учесть оценки в одном столбце, ведь сумма оценок в строке всегда равна единице. Обычно берут оценки для класса 1 из второго столбца.

Коэффициенты в `coef_` расположены в том же порядке, что и переданные методу `fit` признаки.

Значение каждого коэффициента определяет, как именно изменение каждого признака на величину от 0 до 1 повлияет на вероятность дефолта. Другие признаки при этом значения не меняют. Математически это влияние выражается логарифмом отношения шансов, $\mathrm{OR}_i$.

ЧТО ЭТО ТАКОЕ? логарифм отношения шансов?!

## Мультиклассовая классификация

Задачи мультиклассовой классификации. Задачи мультиклассовой классификации нельзя решить теми же средствами, что и задачи бинарной.

«Один против всех» - способ свести мультиклассовую классификацию к бинарной — создать много бинарных классификаторов.

Каждый бинарный классификатор будет предсказывать принадлежность к одному из классов задачи в противовес всем остальным.

Качество мультиклассового классификатора также можно оценивать по метрике accuracy.

Последовательность действий при обучении модели логистической регрессии: Загрузить данные → Выделить целевой признак → Разделить датасет на выборки → Обучить scaler() → Масштабировать обе выборки → Кодировать обе выборки → Обучить модель.

## Мультиколлинеарность

Прежде чем обучать модель, посмотрите на матрицу корреляций между признаками.

см изображение.

Целевой признак default коррелирует с входными credit_amount и loan_annuity, а новый признак all_credits_amount — с credit_amount, loan_annuity и default.

Когда у двух или нескольких признаков высокая корреляция, коэффициенты модели становятся неустойчивыми, и вычислить влияние каждого из них на таргет уже невозможно.

Как правило, о мультиколлинеарности говорят при значении коэффициента корреляции от 0.9 до 0.95 по модулю. В такой ситуации лишние коррелирующие признаки нужно удалять из обучающей выборки.

Учитывайте два фактора, когда анализируете входные признаки на мультиколлинеарность:

- Из всех моделей МО линейная регрессия сильнее всего страдает от корреляции входных признаков (не логистическая!). Из-за мультиколлинеарности матрицы признаков могут стать вырожденными, и тогда у системы линейных уравнений не будет одного решения. Логистическая регрессия также уязвима перед мультиколлинеарностью, но в меньшей степени.
- Существуют разные коэффициенты корреляции, и не все из них универсальны. Например, корреляция Пирсона не подходит для категориальных признаков. Есть и более гибкие инструменты: так, коэффициент корреляции Фи, $\phi_k$, находит взаимосвязь между категориальными, порядковыми и интервальными признаками. Чем ближе его значение по модулю к 1, тем сильнее связь.

$\phi_k$ рассчитывают средствами библиотеки phik для корреляционного анализа. Проще всего вызвать метод `phik_matrix`, чтобы построить матрицу корреляций для всех входных признаков в датасете.

## Матрица ошибок

Например, модель расценит ненадёжного клиента как надёжного, банк даст ему кредит — а потом случится дефолт, и агентство понесёт убытки - это сильно хуже, поэтому стоит учитывать цену ошибки.

Сама по себе метрика accuracy измеряет только общую точность модели и не позволяет анализировать долю ошибочных прогнозов у каждого класса. Зато с этим справляется другой инструмент — матрица ошибок (англ. confusion matrix).

Предсказание = 0 / Предсказание = 1

- Реальность = 0: Предсказание верно / Предсказание неверно
- Реальность = 1: Предсказание неверно / Предсказание верно

Предсказание = 0 / Предсказание = 1

- Реальность = 0: True Negative (TN) / False Positive (FP)
- Реальность = 1: False Negative (FN) / True Positive (TP)

Ошибки классификации включают в себя оценки двух видов: False Positive и False Negative. В статистике их называют ошибками первого рода и второго рода.

см изображение.

$$
\mathrm{accuracy} = \frac{\mathrm{TP} + \mathrm{TN}}{\mathrm{TP} + \mathrm{TN} + \mathrm{FP} + \mathrm{FN}}
$$

С помощью матрицы ошибок вы сможете более точно проанализировать результаты классификации. Однако она просто наглядно демонстрирует ошибки и верные предсказания, а не даёт конкретную оценку качества модели.

## Precision и Recall

Precision - метрика показывающая точность, с которой модель присваивает объектам класс 1, то есть получает результат типа Positive. Иными словами, precision определяет, не слишком ли часто модель выставляет класс 1 объектам класса 0.

$$
\mathrm{precision} = \frac{\mathrm{TP}}{\mathrm{TP} + \mathrm{FP}}
$$

C precision нужно обращаться осторожно. Вы можете настроить модель так, что она будет проставлять класс 1, только когда полностью будет уверена в этом. Она не будет допускать ошибок первого рода — не выдаст результатов False Positive. Её precision всегда будет равен 100%. Однако такой показатель точности не учитывает, как часто модель присваивает объектам класса 1 класс 0!

Recall измеряет, смогла ли модель классификации присвоить класс 1 всем объектам этого класса. Предсказания False Negative рассматриваются метрикой как «неучтённые» True Positive. Чем выше recall, тем больше прогнозов Positive модель смогла дать верно.

$$
\mathrm{recall} = \frac{\mathrm{TP}}{\mathrm{TP} + \mathrm{FN}}
$$

Поэтому модель, которая всегда выставляет объектам класс 1, не вызовет у неё подозрений. Ни одно предсказание True Positive не упустили? Всё в порядке!

## Порог классификации

Модель классификации можно настроить с помощью изменения порогов. Это меняет чувствительность модели, из-за чего она начинает чаще классифицировать объекты каким-то из классов.

## Когда машинное обучение уместно

Перед обучением нужно изучить корреляции между целевым и входными признаками, проверить признаки на мультиколлинеарность и очистить данные от выбросов.

Accuracy оценивает только общую точность модели, но этого бывает мало. Иногда важнее найти, какой класс модель предсказывает хуже, чем другой.

Машинное обучение практически не даёт абсолютно точных предсказаний. Если цена ошибки слишком велика, то лучше подумать о математических методах решения задачи.

Если в данных отсутствуют причинно-следственные связи между описанием объекта и целевым признаком, модель МО вам никак не поможет.

Если вам достаточно получить одно решение и оно раз и навсегда решит возникшую проблему, то другие математические методы могут быть более уместны. Если же с течением времени ответы на задачу точно поменяются, то постоянно решать её заново может оказаться затруднительно и тогда проще донастраивать модель МО.

Качественные данные делают модель точной и надёжной. Они не должны содержать выбросов, аномалий, пропущенных значений и неточностей.

Другая проблема моделирования — ограничения разных моделей. К примеру, знакомые вам линейные модели хорошо работают, когда между признаками есть линейная зависимость. Если же зависимость нелинейная, то обученная модель может предсказывать неточно.

---

# Практика

Код приведён в едином стиле: `X`, `y`, `X_train` / `X_test`, `y_train` / `y_test`, `y_pred`, `y_proba`, `model_lr`, `clf`, `RANDOM_STATE = 42`, `X_train_scaled`. Формулировки комментариев как в исходных заметках.

## sklearn и размерности

```python
import sklearn
print(sklearn.__version__)

# вывод необходимых размерностей
print(X_train.shape)
```

## Линейная регрессия

```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

model_lr = LinearRegression()
model_lr.fit(X_train, y_train)
# рассчитанные коэффициенты
model_lr.coef_
# рассчитанный коэффициент w_0
model_lr.intercept_
y_pred = model_lr.predict(X_test)
```

## Матрица корреляции

```python
# импорт библиотеки seaborn
import seaborn as sns
# построение тепловой карты
sns.heatmap(df.corr(), annot=True, fmt=".2f")
```

## MSE и RMSE

```python
from sklearn.metrics import mean_squared_error

mse = mean_squared_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred, squared=False)
```

## Скалярное произведение

```python
import numpy as np

# вектор с коэффициентами
coefs = np.array([
    -472792, 58467, -7652, 387841, 55630, -47147, -49522
])
# вектор с константой и характеристиками квартиры
flat_test = np.array([1, 44, 27, 2.9, 2, 1.7, 2])
# создание переменной, содержащей скалярное произведение
price = np.multiply(coefs, flat_test).sum()
```

Скалярное произведение с функцией `dot`:

```python
dot_product = a.dot(b)
dot_product = np.dot(a, b)
```

## Косинусное расстояние

Расчёт косинусного расстояния в numpy. Длина вектора `norma_a = np.linalg.norm(a)`.

```python
d_cos = 1 - a.dot(b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

```python
import numpy as np


def get_d_cos(a, b):
    # скалярное произведение a и b
    dot_product = np.multiply(a, b)
    # длина a
    norma_a = np.linalg.norm(a)
    # длина b
    norma_b = np.linalg.norm(b)
    # косинус угла между a и b
    cos = norma_a * norma_b
    # косинусное расстояние
    d_cos = 1 - a.dot(b) / cos
    return d_cos


# векторы a и b
a = np.array([10, -2, 6, -2])
b = np.array([0, -4, 8, 1])
# косинусное расстояние
d_cos_a_b = get_d_cos(a, b)
```

готовая функция для расчёта косинусного расстояния хоть и не в numpy, но существует — в библиотеке scipy.

```python
from scipy.spatial.distance import cosine

d_cos = cosine(a, b)
```

## Евклидово расстояние

```python
d = (((a - b) ** 2).sum()) ** 0.5
```

```python
import numpy as np


def get_d(a, b):
    # поэлементная разность
    diff_a_b = a - b
    # возведение поэлементной разности в квадрат
    diff_a_b_squared = diff_a_b ** 2
    # сумма всех значений
    diff_a_b_squared_sum = diff_a_b_squared.sum()
    # корень квадратный суммы всех значений, евклидово расстояние
    d = diff_a_b_squared_sum ** 0.5
    return d


# векторы a и b
a = np.array([5, 8])
b = np.array([8, 4])
# евклидово расстояние
d_a_b = get_d(a, b)
```

```python
# та же функция, написанная в одну строку
def get_d(a, b):
    return (((a - b) ** 2).sum()) ** 0.5
```

Чтобы рассчитать евклидово расстояние с помощью scipy:

```python
from scipy.spatial.distance import euclidean

d_euclid = euclidean(a, b)
```

## Матрицы numpy

Определитель матрицы с помощью numpy:

```python
det_matrix_a = np.linalg.det(matrix_a)
```

Обратная матрица с помощью numpy:

```python
matrix_a_inv = np.linalg.inv(matrix_a)
```

Из датафрейма pandas в матрицу numpy:

```python
matrix = df.to_numpy()
```

```python
matrix.shape
```

Сохранение и чтение массивов numpy:

```python
np.save("matrix.npy", matrix)
matrix = np.load("matrix.npy")
```

Добавление константы с помощью numpy:

```python
matrix = np.insert(matrix, n, c, axis=1)
```

Коэффициенты линейной регрессии с помощью линала:

```python
w = np.linalg.inv(X.T @ X) @ X.T @ y
```

## MAE и $R^2$

```python
from sklearn.metrics import mean_absolute_error

mae = mean_absolute_error(y_test, y_pred)
```

```python
from sklearn.metrics import r2_score

r2 = r2_score(y_true, y_pred)
```

## Стандартизация и нормализация

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
scaler.fit(X_train)
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

```python
from sklearn.preprocessing import MinMaxScaler

scaler = MinMaxScaler()
scaler.fit(X_train)
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

## One-Hot Encoding

```python
from sklearn.preprocessing import OneHotEncoder

encoder = OneHotEncoder()
encoder.fit(X_train)
X_train_ohe = encoder.transform(X_train)
X_test_ohe = encoder.transform(X_test)
```

Обучение и преобразование данных можно выполнить одной командой:

```python
X_train_ohe = encoder.fit_transform(X_train)
```

Если вам нужно получить из кодировщика список новых признаков, используйте эту команду:

```python
encoder.get_feature_names()
encoder.get_feature_names_out()  # в новых версиях sklearn
```

Пример настройки OHE с выбором значений параметров:

```python
encoder = OneHotEncoder(drop="first", sparse=False)
# drop может быть {"first", "if_binary"}
```

```python
encoder = OneHotEncoder(sparse=False)
cat_col_names = ["building_type", "parking_place"]
X_train_ohe = encoder.fit_transform(X_train[cat_col_names])
encoder_col_names = encoder.get_feature_names()
# создайте датафрейм из закодированных данных
# передайте названия столбцов из переменной encoder_col_names
df_ohe = pd.DataFrame(X_train_ohe, columns=encoder_col_names)
```

One-Hot Encoding в pandas:

```python
df = pd.get_dummies(df, drop_first=True)
```

## Пример линейной регрессии и анализ остатков

```python
import pandas as pd
from matplotlib import pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression

RANDOM_STATE = 42

df = pd.read_csv("real_estate_clean_cat.csv")
X = df.drop("price", axis=1)
y = df["price"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    random_state=RANDOM_STATE,
)

cat_col_names = ["building_type", "parking_place", "rooms_number"]
num_col_names = [
    "total_area",
    "living_area",
    "ceil_height",
    "city_center_distance",
    "years_after_repair",
]

## подготовка признаков (масштабирование и кодирование)

encoder = OneHotEncoder(drop="first", sparse=False)
X_train_ohe = encoder.fit_transform(X_train[cat_col_names])
X_test_ohe = encoder.transform(X_test[cat_col_names])

encoder_col_names = encoder.get_feature_names()

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train[num_col_names])
X_test_scaled = scaler.transform(X_test[num_col_names])

X_train_ohe = pd.DataFrame(X_train_ohe, columns=encoder_col_names)
X_test_ohe = pd.DataFrame(X_test_ohe, columns=encoder_col_names)

X_train_scaled = pd.DataFrame(X_train_scaled, columns=num_col_names)
X_test_scaled = pd.DataFrame(X_test_scaled, columns=num_col_names)

X_train = pd.concat([X_train_ohe, X_train_scaled], axis=1)
X_test = pd.concat([X_test_ohe, X_test_scaled], axis=1)

# обучение модели и получение предсказаний на тестовых данных
model_lr = LinearRegression()
model_lr.fit(X_train, y_train)
y_pred = model_lr.predict(X_test)

# проведите анализ остатков
# перед этим рассчитайте остатки
residuals = y_test - y_pred

# постройте графики по количественным признакам — гистограмму частотности
# распределения и диаграмму рассеяния
fig, axes = plt.subplots(nrows=1, ncols=2, figsize=(10, 5))
axes[0].hist(residuals, bins=30, color="blue", alpha=0.7)
axes[0].set_title("Гистограмма распределения остатков")
axes[0].set_xlabel("Остатки")

axes[1].scatter(y_pred, residuals, alpha=0.5)
axes[1].set_xlabel("Предсказания модели")
axes[1].set_ylabel("Остатки")
axes[1].set_title("Анализ дисперсии")
plt.show()
```

## Accuracy

```python
from sklearn.metrics import accuracy_score

y_pred = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1]
y_true = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
acc = accuracy_score(y_true, y_pred)
```

## Логистическая регрессия

```python
from sklearn.linear_model import LogisticRegression

clf = LogisticRegression()
clf = clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
```

```python
import numpy as np
import matplotlib.pyplot as plt


# определяем логистическую функцию
def log_func(x, w0, w1):
    return 1 / (1 + np.exp(-(w0 + w1 * x)))


# строим график логистической функции
def plot_log_func(xmin, xmax, w0, w1):
    # xmin, xmax: границы интервала X, на котором откладываете график
    # w0: коэффициент w0
    # w1: коэффициент w1
    fig, ax = plt.subplots(figsize=(6, 4))
    X = np.linspace(xmin, xmax, num=100)
    y = log_func(X, w0, w1)
    ax.plot(X, y)
    ax.grid()
    ax.set_yticks(np.linspace(0, 1, num=11))
    ax.axhline(0.5, 0, 1, linestyle="-", color="r", alpha=0.5)
    ax.axvline(0, 0, 1, linestyle="-", color="r", alpha=0.5)
    ax.set_title(f"Линия логистической функции, $w_0$={w0}, $w_1$={w1}")
    fig.tight_layout()
    return fig


# строим график для заданных значений
fig = plot_log_func(xmin=-5, xmax=5, w0=3, w1=2)  # подставьте значения w0 и w1 сюда
```

## predict_proba

```python
y_proba = clf.predict_proba(X)
```

результат:

```text
[[0.21973247 0.78026753]
 [0.20331072 0.79668928]
 [0.65727478 0.34272522]
 [0.35885642 0.64114358]
 [0.57874368 0.42125632]
 [0.72555623 0.27444377]
 [0.37997208 0.62002792]
 [0.96912223 0.03087777]
 [0.06707868 0.93292132]
 [0.72426058 0.27573942]]
```

```python
y_proba_1 = y_proba[:, 1]
```

```python
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

df = pd.read_csv("car_loan.csv")
RANDOM_STATE = 42
# Возьмём по k объектов разных классов из данных
k = 5
df = pd.concat([
    df.query("default == 0").sample(k),
    df.query("default == 1").sample(k),
])
X = df.drop(columns=["default"])
y = df["default"]
clf = LogisticRegression()
clf = clf.fit(X, y)
# получаем прогнозные метки классов
y_proba = clf.predict_proba(X)
# выбираем оценки только для класса "1"
df["default_proba_1"] = y_proba[:, 1]
print(df)
```

```python
clf = LogisticRegression(random_state=0)
clf = clf.fit(X, y)
y_pred = clf.predict(X)
print(clf.coef_)
```

```text
[[ 8.66577289e-05 -3.34477636e-04 -2.24456165e-04  2.60637851e-06
  -3.58808474e-04 -3.80292600e-05]]
```

Коэффициенты в `coef_` расположены в том же порядке, что и переданные методу `fit` признаки. Поэтому эти данные можно представить в более наглядном виде:

```python
for feature_number, feature_name in enumerate(X.columns):
    weight = clf.coef_[0, feature_number]
    print(f"{feature_name:<20}: {weight:+.6f}")
```

```text
credit_amount       : +0.000087
loan_annuity        : -0.000334
age_days            : -0.000224
employed_days       : +0.000003
phone_change        : -0.000359
registration_days   : -0.000038
```

## Сравнение и стандартизация признаков

```python
import math
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

RANDOM_STATE = 42
df = pd.read_csv("car_loan.csv")
X = df.drop(columns="default")
y = df["default"]
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    random_state=RANDOM_STATE,
)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
clf = LogisticRegression()
clf = clf.fit(X_train_scaled, y_train)
y_pred = clf.predict(X_test_scaled)
for feature_number, feature_name in enumerate(X.columns):
    exp_weight = math.exp(clf.coef_[0, feature_number])
    print(f"{feature_name:<20}: {exp_weight:+.2f}")
```

## One vs Rest

```python
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

RANDOM_STATE = 42
df = pd.read_csv("car_loan_levels.csv")
X = df.drop(columns="level")
y = df["level"]
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    random_state=RANDOM_STATE,
)
clf = OneVsRestClassifier(LogisticRegression())
clf = clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(acc)
```

## Корреляции и phik

```python
import pandas as pd
import seaborn as sns

df = pd.read_csv("car_loan.csv")
df1 = pd.read_csv("new_features_car_loan.csv")
# соединим таблицы функцией merge
df = df.merge(df1[["all_credits_amount"]], left_index=True, right_index=True)
sns.heatmap(df.corr(), annot=True, cmap="cividis")
```

```python
import phik

df.phik_matrix()
```

## Confusion matrix

```python
confusion = np.zeros((2, 2)).astype(np.int64)
for i in range(2):
    for j in range(2):
        confusion[i][j] = np.sum(np.logical_and(y_test == i, y_pred == j))
print(confusion)
```

```python
from sklearn.metrics import confusion_matrix
import seaborn as sns

cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues_r")
plt.ylabel("True label")
plt.xlabel("Predicted")
```

## Precision, recall и порог

```python
import pandas as pd
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import recall_score, precision_score

RANDOM_STATE = 42
df = pd.read_csv("car_loan.csv")
X = df.drop(columns="default")
y = df["default"]
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    random_state=RANDOM_STATE,
)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
clf = LogisticRegression()
clf = clf.fit(X_train_scaled, y_train)
y_pred = clf.predict(X_test_scaled)
recall = recall_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
print("recall: ", round(recall, 3))
print("precision: ", round(precision, 3))
```

Для компактности выведем только пять первых объектов. Вот как их отсортировать:

```python
y_proba = clf.predict_proba(X_test_scaled)[:, 1]

data = pd.DataFrame(
    zip(y_test, y_proba),
    columns=["y_valid", "y_proba"],
).sort_values(by="y_proba", ascending=False)

print(data.head())
```

Добавить пороги поможет функция `linspace`: она разделяет заданный промежуток на несколько более мелких. Посмотрим на то, как модель будет работать при четырёх разных порогах. Для этого укажем в linspace промежуток пороговых значений — от 0.1 до 1:

```python
thresholds = [round(i, 2) for i in np.linspace(0.1, 1, num=4, endpoint=False)]
print(thresholds)
```

```text
[0.1, 0.32, 0.55, 0.78]
```

Подбор порога:

```python
y_proba = clf.predict_proba(X_test_scaled)[:, 1]
data = pd.DataFrame(
    zip(y_test, y_proba), columns=["y_valid", "y_proba"]
).sort_values(by="y_proba", ascending=False)
```

Вот как применить её к прогнозным значениям при разных порогах:

```python
thresholds = [round(i, 2) for i in np.linspace(0.1, 1, num=12, endpoint=False)]
values = []
columns = []
for i in thresholds:
    columns.append("y_pred_" + str(i))
    data["y_pred_"] = data["y_proba"].apply(lambda x: 1 if x >= i else 0)
    data["check"] = data.apply(lambda x: cost(x.y_valid, x.y_pred_), 1)
    values.append(data["check"].sum())
costs = pd.DataFrame(zip(columns, values), columns=["Порог", "Потери"])
heatmap = sns.lineplot(
    x=thresholds,
    y=[i / 1000000 for i in values],
    size=50,
    legend=False,
)
plt.ylabel("Млн рублей")
plt.xlabel("Порог")
plt.title("Зависимость потерь в млн рублей от выбранного порога")
```
