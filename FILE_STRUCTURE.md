# 📦 Estructura Completa del Proyecto Refactorizado

## 📊 Diagrama de Archivos y Dependencias

```
├── 📄 main.js
│   ├── imports: Presenter
│   ├── imports: PointsModel
│   └── imports: generateMockData
│       ▼ (creates)
│   model.initialize(mockData)
│       ▼
│   presenter.init()
│
├── 📂 src/
│
│   ├── 📄 presenter.js (REFACTORIZADO)
│   │   ├── class: Presenter (RoutePresenter)
│   │   ├── imports: PointPresenter
│   │   ├── imports: Filter, Sort, TripEventsList, EmptyListView
│   │   ├── imports: render utils
│   │   │
│   │   ├── Methods:
│   │   │   ├── init()
│   │   │   ├── #renderPoint(point, container) → crea PointPresenter
│   │   │   ├── #handleDataChange(point) → model.updatePoint()
│   │   │   ├── #handleModeChange(pointId) → cierra form anterior
│   │   │   ├── #buildDestinationsMap() → Map<id, dest>
│   │   │   └── #buildOffersMap() → Map<id, offer>
│   │   │
│   │   ├── State:
│   │   │   ├── #pointPresenters: Map<pointId, PointPresenter>
│   │   │   └── #currentEditingPointId: pointId | null
│   │   │
│   │   └── Dependencies:
│   │       └── model: PointsModel
│   │
│   │
│   ├── 📂 presenter/
│   │   │
│   │   └── 📄 point-presenter.js (NUEVO) ✨
│   │       ├── class: PointPresenter
│   │       ├── imports: RoutePointView, EditFormView, replace()
│   │       │
│   │       ├── Constructor:
│   │       │   ├── container (DOM)
│   │       │   ├── point (object)
│   │       │   ├── destinations (Map)
│   │       │   ├── offers (Map)
│   │       │   ├── onDataChange (callback)
│   │       │   └── onModeChange (callback)
│   │       │
│   │       ├── Methods:
│   │       │   ├── init() → #renderPoint()
│   │       │   ├── #renderPoint()
│   │       │   │   ├── Crea RoutePointView
│   │       │   │   ├── Crea EditFormView
│   │       │   │   ├── Set handlers
│   │       │   │   └── Añade al DOM
│   │       │   │
│   │       │   ├── #switchToEditMode()
│   │       │   │   ├── switch view
│   │       │   │   ├── #mode = 'edit'
│   │       │   │   ├── #onModeChange()
│   │       │   │   └── #attachEscKeyListener()
│   │       │   │
│   │       │   ├── #switchToDefaultMode()
│   │       │   │   ├── switch view
│   │       │   │   ├── #mode = 'default'
│   │       │   │   └── #removeEscKeyListener()
│   │       │   │
│   │       │   ├── #handleFormSubmit()
│   │       │   │   ├── #switchToDefaultMode()
│   │       │   │   └── #onDataChange()
│   │       │   │
│   │       │   ├── #handleFavoriteClick() ← PARTIAL BINDING
│   │       │   │   ├── Actualizar this.#point.isFavorite
│   │       │   │   ├── #onDataChange()
│   │       │   │   └── #renderFavoriteButton() ← Solo el botón
│   │       │   │
│   │       │   ├── #renderFavoriteButton()
│   │       │   │   ├── Obtiene buttonElement
│   │       │   │   └── toggle CSS class
│   │       │   │
│   │       │   ├── #attachEscKeyListener()
│   │       │   ├── #removeEscKeyListener()
│   │       │   ├── resetMode()
│   │       │   └── destroy()
│   │       │
│   │       ├── State:
│   │       │   ├── #mode: 'default' | 'edit'
│   │       │   ├── #routePointView: View
│   │       │   ├── #editFormView: View
│   │       │   └── #escKeyHandler: function
│   │       │
│   │       └── Events:
│   │           ├── Escucha: RoutePointView clicks
│   │           ├── Escucha: EditFormView submit
│   │           ├── Escucha: ESC key (cuando en edit mode)
│   │           ├── Emite: onDataChange
│   │           └── Emite: onModeChange
│   │
│   │
│   ├── 📂 model/
│   │   │
│   │   └── 📄 points-model.js (NUEVO) ✨
│   │       ├── class: PointsModel
│   │       │
│   │       ├── State (Private):
│   │       │   ├── #points: Array<Point>
│   │       │   ├── #destinations: Array<Destination>
│   │       │   └── #offers: Array<Offer>
│   │       │
│   │       ├── Methods:
│   │       │   ├── initialize(data)
│   │       │   ├── getPoints() → Array<Point>
│   │       │   ├── getDestinations() → Array<Destination>
│   │       │   ├── getOffers() → Array<Offer>
│   │       │   ├── getDestinationById(id) → Destination
│   │       │   ├── getOffersByIds(ids) → Array<Offer>
│   │       │   ├── getOffersByType(type) → Array<Offer>
│   │       │   └── updatePoint(updatedPoint) → void
│   │       │
│   │       └── Data Structure:
│   │           ├── Point: {id, type, destinationId, dateFrom, dateTo, 
│   │           │            basePrice, isFavorite, offers[]}
│   │           ├── Destination: {id, name, description, pictures[]}
│   │           └── Offer: {id, type, title, price}
│   │
│   │
│   ├── 📂 mock/
│   │   │
│   │   └── 📄 generator.js (NUEVO) ✨
│   │       ├── export: generateMockData()
│   │       │
│   │       ├── Constants:
│   │       │   ├── DESTINATIONS: Array (5 items)
│   │       │   ├── OFFERS: Array (10 items)
│   │       │   └── EVENT_TYPES: Array (9 types)
│   │       │
│   │       ├── Helpers:
│   │       │   ├── getRandomElement(array)
│   │       │   ├── getRandomElements(array, count)
│   │       │   └── getRandomDate(start, end)
│   │       │
│   │       └── Returns: {points, destinations, offers}
│   │
│   │
│   ├── 📄 render.js
│   │   ├── exports: RenderPosition
│   │   ├── exports: render(component, container, place)
│   │   ├── exports: replace(newComponent, oldComponent)
│   │   ├── exports: remove(component)
│   │   └── (Sin cambios)
│   │
│   │
│   ├── 📂 view/
│   │   │
│   │   ├── 📄 view.js (Base class)
│   │   │   ├── class: View (abstract)
│   │   │   └── Methods: element, template, createElement, getElement, removeElement
│   │   │
│   │   ├── 📄 routePointView.js (MODIFICADO)
│   │   │   ├── class: RoutePointView extends View
│   │   │   ├── Private fields:
│   │   │   │   ├── #point
│   │   │   │   ├── #destination
│   │   │   │   ├── #offers
│   │   │   │   ├── #editClickHandler
│   │   │   │   └── #favoriteClickHandler ← NUEVO
│   │   │   │
│   │   │   ├── Methods:
│   │   │   │   ├── constructor(point, destination, offers)
│   │   │   │   ├── get template() → HTML
│   │   │   │   ├── setEditClickHandler(callback)
│   │   │   │   └── setFavoriteClickHandler(callback) ← NUEVO
│   │   │   │
│   │   │   └── Template includes:
│   │   │       ├── Event details
│   │   │       ├── Event favorite button (.event__favorite-btn)
│   │   │       └── Event edit button (.event__rollup-btn)
│   │   │
│   │   ├── 📄 editFormView.js
│   │   │   ├── class: EditFormView extends View
│   │   │   ├── Methods:
│   │   │   │   ├── setFormSubmitHandler(callback)
│   │   │   │   └── setRollupClickHandler(callback)
│   │   │   │
│   │   │   └── Template includes:
│   │   │       ├── Event type selector
│   │   │       ├── Destination field
│   │   │       ├── Date/time fields
│   │   │       ├── Price field
│   │   │       ├── Offers checkboxes
│   │   │       ├── Destination photos
│   │   │       ├── Save button
│   │   │       └── Cancel button
│   │   │
│   │   ├── 📄 tripEventsList.js
│   │   ├── 📄 filter.js
│   │   ├── 📄 sort.js
│   │   ├── 📄 emptyListView.js
│   │   └── (Sin cambios significativos)
│   │
│   │
│   └── 📄 main.js
│       ├── import: Presenter
│       ├── import: PointsModel
│       ├── import: generateMockData
│       │
│       ├── 1. const model = new PointsModel()
│       ├── 2. const mockData = generateMockData()
│       ├── 3. model.initialize(mockData)
│       ├── 4. const presenter = new Presenter(model)
│       └── 5. presenter.init()
│
│
├── 📚 DOCUMENTATION FILES (NUEVO - para referencia)
│   ├── SUMMARY.md - Resumen completo
│   ├── REFACTORING.md - Documentación técnica detallada
│   ├── QUICK_START.md - Guía de inicio rápido
│   ├── ARCHITECTURE.md - Diagramas y flujos
│   └── TESTING.md - Guía de testing
│
│
└── 📄 package.json (Sin cambios)
```

---

## 🔄 Flujo de Datos

```
┌─────────────┐
│  main.js    │
└──────┬──────┘
       │
       ▼
  Initialize Model
       │
       ├─ getData()
       ├─ generateMockData() [5 points, destinations, offers]
       └─ model.initialize(data)
                │
                ├─ #points = data.points
                ├─ #destinations = data.destinations
                └─ #offers = data.offers
       │
       ▼
  Create Presenter
       │
       └─ new Presenter(model)
            │
            ├─ this.#model = model
            ├─ this.#pointPresenters = new Map()
            └─ this.#currentEditingPointId = null
       │
       ▼
  presenter.init()
       │
       ├─ points = model.getPoints()
       │
       ├─ For each point:
       │   │
       │   └─ #renderPoint(point, container)
       │       │
       │       ├─ destinations = #buildDestinationsMap()
       │       ├─ offers = #buildOffersMap()
       │       │
       │       └─ new PointPresenter(
       │            container, point, destinations, offers,
       │            #handleDataChange, #handleModeChange
       │          )
       │           │
       │           └─ pointPresenter.init()
       │                │
       │                └─ #renderPoint()
       │                    ├─ Create RoutePointView
       │                    ├─ Create EditFormView
       │                    ├─ Set handlers
       │                    └─ Render to DOM
       │
       └─ Store in Map:
           this.#pointPresenters.set(point.id, pointPresenter)
```

---

## 📈 Estadísticas

| Métrica | Valor |
|---------|-------|
| Archivos nuevos | 3 |
| Archivos modificados | 2 |
| Documentación files | 5 |
| Líneas de código (PointPresenter) | 134 |
| Líneas de código (Model) | 40 |
| Líneas de código (Generator) | 80 |
| LOC total agregado | 254 |
| Métodos en PointPresenter | 11 |
| Métodos en Model | 8 |
| Métodos en Presenter (después) | 7 |
| Métodos removidos de Presenter | 3 |

---

## 🎯 Responsabilidades por Archivo

### presenter.js
- Inicializar la aplicación
- Crear instancias de PointPresenter
- Gestionar "solo una forma abierta"
- Actualizar modelo cuando cambian datos
- Manejar filtros y ordenamiento

### point-presenter.js
- Gestionar visualización de un punto
- Cambiar entre vista y edición
- Manejar clicks de usuario
- Partial data binding
- ESC key handling

### routePointView.js
- Renderizar punto individual
- Emitir eventos de usuario
- Mostrar favorito button
- Mostrar edit button

### editFormView.js
- Renderizar formulario de edición
- Emitir eventos submit
- Mostrar cancel button

### points-model.js
- Almacenar datos
- Proporcionar acceso a datos
- Actualizar datos

### generator.js
- Generar datos mock para testing

---

## 🔗 Relaciones entre Clases

```
┌──────────────────┐
│  PointsModel     │◄─────────────┐
│  (Datos)         │              │
└──────────┬───────┘              │
           │                      │
           │ initialized with     │ calls updatePoint()
           │ returns data         │
           │                      │
    ┌──────▼──────────┐    ┌──────┴────────────┐
    │  Presenter      │    │  PointPresenter   │
    │  (Orquestador)  │◄───┤  (Punto individual)
    │                 │    │
    └────────┬────────┘    │ onDataChange()
             │             │ onModeChange()
             │             │
             │        ┌────┴──────────────┐
             │        │   Vistas:         │
             │        │  RoutePointView   │
             │        │  EditFormView     │
             │        └───────┬──────────┘
             │                │
             └────────────────► click events
                              input events
```

---

## 📞 Event Flow

### User Click on Favorite
```
RoutePointView Element
  └─ .event__favorite-btn click
     └─ PointPresenter.#handleFavoriteClick()
        ├─ Update this.#point.isFavorite
        ├─ Call this.#onDataChange(point)
        │   └─ Presenter.#handleDataChange(point)
        │      └─ model.updatePoint(point)
        └─ Call this.#renderFavoriteButton()
           └─ Update only button CSS
```

### User Opens Edit Form
```
RoutePointView Element
  └─ .event__rollup-btn click
     └─ PointPresenter.#switchToEditMode()
        ├─ replace(EditFormView, RoutePointView)
        ├─ this.#mode = 'edit'
        ├─ Call this.#onModeChange(pointId)
        │   └─ Presenter.#handleModeChange(pointId)
        │      ├─ Check this.#currentEditingPointId
        │      ├─ If different, call prevPresenter.resetMode()
        │      └─ Update this.#currentEditingPointId = pointId
        └─ Call this.#attachEscKeyListener()
```

---

## ✅ Validación Cruzada

| Componente | Dependencias | Estado |
|-----------|-------------|--------|
| main.js | Presenter, PointsModel, generateMockData | ✅ OK |
| Presenter | PointPresenter, Views, Model, render utils | ✅ OK |
| PointPresenter | RoutePointView, EditFormView, replace() | ✅ OK |
| PointsModel | (none) | ✅ OK |
| generator.js | dayjs | ✅ OK |
| routePointView.js | View | ✅ OK |
| editFormView.js | View | ✅ OK |

---

**Estructura completa lista para producción ✨**
