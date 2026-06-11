# Архитектура MVP - Диаграмма

## Структура компонентов

```
┌─────────────────────────────────────┐
│           main.js                    │
│    Точка входа приложения           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      PointsModel (Model)            │
│  - getPoints()                      │
│  - getDestinations()                │
│  - getOffers()                      │
│  - updatePoint(point)               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Presenter (RoutePresenter)       │
│  - Управляет видимостью            │
│  - Создает PointPresenter           │
│  - Контролирует одну открытую       │
│    форму редактирования             │
└──────┬──────────────┬───────────────┘
       │              │
       ▼              ▼
    ┌──────┐   ┌───────────┐  ... (for each point)
    │Filter│   │PointPresenter 1
    └──────┘   │  - Управляет RoutePointView
               │  - Управляет EditFormView
       ┌──────┐│  - Переключение режимов
       │ Sort ││  - Обработка событий
       └──────┘└───────────┬─────────────────┐
                           │                 │
                    ┌──────▼───────┐  ┌───────▼──────┐
                    │RoutePointView │  │EditFormView  │
                    │ - Show point  │  │- Edit point  │
                    │ - Favorite btn│  │- Submit form │
                    │ - Edit button │  │- Cancel btn  │
                    └───────────────┘  └──────────────┘
```

## Поток данных

### 1. Инициализация
```
generateMockData()
    ▼
PointsModel.initialize(mockData)
    ▼
Presenter(model)
    ▼
Presenter.init()
    ▼
PointPresenter для каждой точки
    ▼
RoutePointView рендерятся
```

### 2. Клик на "Избранное" (Partial Data Binding)
```
RoutePointView.element.querySelector('.event__favorite-btn')
    ▼
#handleFavoriteClick()
    ▼
this.#point.isFavorite = !this.#point.isFavorite
    ▼
this.#onDataChange(this.#point)  [отправить в Model]
    ▼
this.#renderFavoriteButton()  [обновить только кнопку]
    ▼
favoriteBtn.classList.add/remove('event__favorite-btn--active')
```

### 3. Открытие формы редактирования (Only One Form Open)
```
RoutePointView: Клик на кнопку "открыть"
    ▼
PointPresenter.#switchToEditMode()
    ▼
replace(EditFormView, RoutePointView)
    ▼
this.#onModeChange(this.#point.id)
    ▼
Presenter.#handleModeChange(pointId)
    ▼
Если есть другая открытая форма:
    ▼
сохраня prevPresenter = этот PointPresenter
    ▼
prevPresenter.resetMode()
    ▼
replace(RoutePointView, EditFormView)  [закрыть форму]
    ▼
Установить новую текущую форму: pointId
```

### 4. Закрытие формы редактирования
```
Пользователь нажимает "Закрыть" или "Escape"
    ▼
PointPresenter.#switchToDefaultMode()
    ▼
replace(RoutePointView, EditFormView)
    ▼
this.#mode = 'default'
    ▼
this.#removeEscKeyListener()
    ▼
RoutePointView снова видна
```

## Различия в управлении ESC

### До (Старый код)
```javascript
// Один ESC слушатель для всего приложения
#escKeyListener = null;

#addEscKeyListener(pointId, callback) {
  if (this.#escKeyListener) {
    document.removeEventListener('keydown', this.#escKeyListener);
  }
  // Только последний слушатель работает!
  this.#escKeyListener = (evt) => {
    if (evt.key === 'Escape') {
      callback();
    }
  };
  document.addEventListener('keydown', this.#escKeyListener);
}
```

### После (Новый код)
```javascript
// ESC слушатель для каждого PointPresenter
#escKeyHandler = null;

#attachEscKeyListener() {
  this.#escKeyHandler = (evt) => {
    if (evt.key === 'Escape') {
      this.#switchToDefaultMode();
    }
  };
  document.addEventListener('keydown', this.#escKeyHandler);
}

#removeEscKeyListener() {
  if (this.#escKeyHandler) {
    document.removeEventListener('keydown', this.#escKeyHandler);
    this.#escKeyHandler = null;
  }
}
```

**Преимущество:** Каждый PointPresenter управляет своим слушателем и правильно его удаляет.

## Жизненный цикл PointPresenter

```
┌─────────────────────────┐
│   PointPresenter()      │ Конструктор
│        init()           │ Инициализация
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  #renderPoint()         │
│  - Создать Views       │
│  - Set Handlers        │
│  - Рендерить в DOM     │
│  - Mode = 'default'    │
└────────┬────────────────┘
         │
         ├─ Клик "Избранное"
         │   ▼
         ├─> #handleFavoriteClick()
         │   └─> #renderFavoriteButton()
         │
         ├─ Клик "Открыть"
         │   ▼
         ├─> #switchToEditMode()
         │   └─> #onModeChange()
         │   └─> #attachEscKeyListener()
         │
         ├─ ESC или клик "Закрыть"
         │   ▼
         └─> #switchToDefaultMode()
             └─> #removeEscKeyListener()
             └─> Mode = 'default'
```

## Состояния PointPresenter

```
┌──────────────┐
│   DEFAULT    │ RoutePointView видна
│   (mode)     │
└─────┬────────┘
      │
      │ Клик на "открыть"
      ▼
┌──────────────┐
│    EDIT      │ EditFormView видна
│   (mode)     │
└─────┬────────┘
      │
      │ Клик "закрыть" или Escape
      ▼
┌──────────────┐
│   DEFAULT    │ RoutePointView видна
│   (mode)     │
└──────────────┘
```

## Функции обратного вызова (Callbacks)

### onDataChange
```javascript
// Когда пользователь:
// - Кликает на "Избранное"
// - Отправляет форму редактирования

this.#onDataChange(this.#point);
    ▼
Presenter.#handleDataChange(point)
    ▼
this.#model.updatePoint(point)
    ▼
Model сохраняет изменения
```

### onModeChange  
```javascript
// Когда PointPresenter входит в режим редактирования

this.#onModeChange(this.#point.id);
    ▼
Presenter.#handleModeChange(pointId)
    ▼
Если существует другой открытый PointPresenter:
    ▼
prevPresenter.resetMode()
    ▼
Все остальные PointPresenter'ы закрываются
```

## Comparison: До и После

| Аспект | До | После |
|--------|---|-------|
| **Управление видом** | RoutePresenter | PointPresenter |
| **Единственная форма открыта** | ❌ Проблема | ✅ Гарантировано |
| **ESC слушатель** | Глобальный | Локальный для каждого |
| **Partial Data Binding** | ❌ Нет | ✅ Кнопка Избранное |
| **Код тестируется** | ❌ Сложно | ✅ Легко |
| **Масштабируемость** | Ограничена | ✅ Хорошая |
| **Повторное использование** | ❌ | ✅ PointPresenter |
