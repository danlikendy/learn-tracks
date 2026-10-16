# Практика: линейные модели в машинном обучении

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

## MAE и \(R^2\)

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
