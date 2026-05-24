# MVP Architecture Refactoring - Документация

## Обзор изменений

Приложение было отрефакторено с использованием MVP (Model-View-Presenter) архитектуры. Основное внимание уделено разделению ответственности на уровне презентеров.

---

## Архитектура

### 1. **Presenter (RoutePresenter)** - `src/presenter.js`
Главный куратор приложения:
- Управляет жизненным циклом точек маршрута
- Создает `PointPresenter` для каждой точки
- Обеспечивает глобальное управление состоянием (только одна форма редактирования открыта)
- Обрабатывает фильтрацию и сортировку

**Ключевые изменения:**
- Удалена прямая работа с видами (`RoutePointView`, `EditFormView`)
- Добавлено использование `PointPresenter` вместо прямого управления UI
- Добавлено отслеживание активной точки редактирования (`#currentEditingPointId`)

```javascript
#handleModeChange(pointId) {
  // Закрывает форму редактирования другой точки
  if (this.#currentEditingPointId !== null && this.#currentEditingPointId !== pointId) {
    const prevPresenter = this.#pointPresenters.get(this.#currentEditingPointId);
    if (prevPresenter) {
      prevPresenter.resetMode();
    }
  }
  this.#currentEditingPointId = pointId;
}
```

---

### 2. **PointPresenter** - `src/presenter/point-presenter.js`
Отдельный куратор для каждой точки маршрута:
- Управляет переключением между видом точки и формой редактирования
- Обрабатывает все события пользователя для одной точки
- Реализует partial data binding для кнопки "Избранное"
- Управляет слушателем ESC для закрытия формы редактирования

**Конструктор:**
```javascript
constructor(
  container,           // DOM контейнер для рендеринга
  point,               // Объект точки маршрута
  destinations,        // Map<id, destination>
  offers,              // Map<id, offer>
  onDataChange,        // Колбэк для сохранения данных
  onModeChange         // Колбэк для управления режимом редактирования
)
```

**Основные методы:**
- `init()` - инициализирует и рендерит точку
- `#switchToEditMode()` - переключает на режим редактирования
- `#switchToDefaultMode()` - переключает на обычный вид
- `resetMode()` - закрывает форму редактирования (вызывается из основного Presenter)

---

### 3. **Partial Data Binding - Кнопка "Избранное"**
Реализовано обновление только кнопки "Избранное" без полной перерисовки:

```javascript
#handleFavoriteClick() {
  this.#point.isFavorite = !this.#point.isFavorite;
  this.#onDataChange(this.#point);
  // Перерисовка только кнопки (partial data binding)
  this.#renderFavoriteButton();
}

#renderFavoriteButton() {
  const pointElement = this.#routePointView.getElement();
  const favoriteBtn = pointElement.querySelector('.event__favorite-btn');
  
  if (favoriteBtn) {
    if (this.#point.isFavorite) {
      favoriteBtn.classList.add('event__favorite-btn--active');
    } else {
      favoriteBtn.classList.remove('event__favorite-btn--active');
    }
  }
}
```

---

### 4. **View Компоненты**

#### RoutePointView - `src/view/routePointView.js`
**Новый обработчик:**
```javascript
setFavoriteClickHandler(callback) {
  this.#favoriteClickHandler = callback;
  this.element.querySelector('.event__favorite-btn').addEventListener('click', () => {
    this.#favoriteClickHandler();
  });
}
```

#### EditFormView - `src/view/editFormView.js`
Остается без изменений, но теперь используется через `PointPresenter`.

---

### 5. **Model** - `src/model/points-model.js`
**Новые методы:**
```javascript
getDestinations()     // Возвращает все пункты назначения
getOffers()           // Возвращает все предложения
updatePoint(point)    // Обновляет точку маршрута в модели
```

**Совместимые методы:**
```javascript
getPoints()                    // Возвращает все точки маршрута
getDestinationById(id)        // Получить пункт назначения по ID
getOffersByIds(offerIds)      // Получить предложения по их ID
getOffersByType(type)         // Получить предложения по типу события
```

---

### 6. **Mock Data Generator** - `src/mock/generator.js`
Генерирует тестовые данные для разработки:
- 5 случайных точек маршрута
- Пункты назначения (Амстердам, Женева, Шамони, Париж, Брюссель)
- Предложения для различных типов событий

---

## Поток управления

### Рендеринг точки маршрута:
```
Presenter.init()
  ↓
Presenter.#renderWithContent()
  ↓
Presenter.#renderPoint() для каждой точки
  ↓
PointPresenter.init()
  ↓
PointPresenter.#renderPoint()
  ↓
RoutePointView / EditFormView рендерятся в контейнер
```

### Переключение метежу видом и редактированием:
```
RoutePointView прибор "открыть"
  ↓
PointPresenter.#switchToEditMode()
  ↓
EditFormView появляется
  ↓
Нажата кнопка "закрыть" или "Escape"
  ↓
PointPresenter.#switchToDefaultMode()
  ↓
RoutePointView снова отображается
```

### Управление открытыми формами редактирования:
```
Пользователь открывает форму точки #1
  ↓
PointPresenter #1 вызывает onModeChange()
  ↓
Presenter.#handleModeChange() запоминает pointId = 1
  ↓
Пользователь открывает форму точки #2
  ↓
PointPresenter #2 вызывает onModeChange()
  ↓
Presenter.#handleModeChange() закрывает форму точки #1 и запоминает pointId = 2
```

---

## Преимущества новой архитектуры

✅ **Разделение ответственности**: Каждый `PointPresenter` отвечает только за одну точку  
✅ **Только одна форма редактирования**: Глобальное управление состоянием  
✅ **Partial Data Binding**: Эффективное обновление UI  
✅ **Легче тестировать**: Каждый компонент имеет четкие границы  
✅ **Масштабируемость**: Легко добавить новые функции  

---

## Использование

```javascript
import Presenter from './presenter.js';
import PointsModel from './model/points-model.js';
import { generateMockData } from './mock/generator.js';

// Инициализация
const model = new PointsModel();
const mockData = generateMockData();
model.initialize(mockData);

// Создание и инициализация Presenter
const presenter = new Presenter(model);
presenter.init();
```

---

## Файловая структура

```
src/
├── presenter.js                 # RoutePresenter
├── presenter/
│   └── point-presenter.js       # PointPresenter (новый)
├── model/
│   └── points-model.js          # Model (новый)
├── mock/
│   └── generator.js             # Mock data (новый)
├── view/
│   ├── view.js                  # Base class
│   ├── routePointView.js        # Updated
│   ├── editFormView.js          # Unchanged
│   └── ... другие view компоненты
├── render.js                    # Utilities
└── main.js
```

---

## Следующие шаги

Для полной функциональности добавьте:
1. Валидацию формы редактирования
2. Асинхронное сохранение данных на сервер
3. Обработку ошибок при загрузке данных
4. Полную синхронизацию фильтров и сортировки
5. Анимацию переходов между видами
