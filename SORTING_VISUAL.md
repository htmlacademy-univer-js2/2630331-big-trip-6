# 🎨 Dynamic Sorting - Visual Flow & Code Snippets

## 📊 Complete Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│               USER INTERFACE - Sort Controls                     │
│                                                                  │
│  [Day]  [Event]  [Time]  [Price]  [Offers]                      │
│   ✓        ✗      ○        ○        ✗                           │
│  (active) (disabled) (available) ...                             │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ User clicks "Price"
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  Sort Component - Event Listener Triggered                      │
│                                                                  │
│  .trip-sort__input[value="sort-price"]:change                  │
│  → Extract sortType: 'price'                                    │
│  → Call setSortTypeChangeHandler callback                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ Callback: this.#handleSortTypeChange
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  Presenter - Main Orchestrator                                  │
│                                                                  │
│  #handleSortTypeChange('price') {                              │
│    this.#currentSortType = 'price'                             │
│    this.#rerenderPointsList()                                  │
│  }                                                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  Presenter - Sort Logic                                         │
│                                                                  │
│  #rerenderPointsList() {                                       │
│    const sortedPoints = this.#sortPoints(this.#allPoints)     │
│    └─> #sortPoints('price') {...}                              │
│    returns: sorted array by basePrice descending               │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLEANUP PHASE - Remove Old Renderings                          │
│                                                                  │
│  1. Remove DOM elements:                                        │
│     #tripListContainer.querySelectorAll('.event').forEach(     │
│       el => el.remove()                                         │
│     )                                                            │
│                                                                  │
│  2. Destroy PointPresenters:                                    │
│     #pointPresenters.forEach(presenter => {                    │
│       presenter.destroy()  // Clean ESC listeners, remove DOM  │
│     })                                                          │
│     #pointPresenters.clear()  // Clear Map                     │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  RENDER PHASE - New Sorted List                                 │
│                                                                  │
│  #renderPointsList(sortedPoints) {                             │
│    sortedPoints.forEach(point => {                             │
│      this.#renderPoint(point, container)                       │
│      └─> new PointPresenter(...).init()                        │
│      └─> pointPresenter stores in #pointPresenters.set()       │
│    })                                                            │
│  }                                                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│               DOM - Updated List                                │
│                                                                  │
│  RoutePointView 1 (High Price)  ← €5000 ← Rendered 1st       │
│  RoutePointView 2 (High Price)  ← €3500 ← Rendered 2nd       │
│  RoutePointView 3 (Mid Price)   ← €1500 ← Rendered 3rd       │
│  RoutePointView 4 (Low Price)   ← €500  ← Rendered 4th       │
│  RoutePointView 5 (Low Price)   ← €100  ← Rendered 5th       │
│                                                                  │
│  ✅ List is now sorted by Price (Descending)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Transitions

```
┌──────────────────┐
│   INIT STATE     │
│                  │
│ #currentSortType │
│   = 'day'        │
│                  │
│ #allPoints = []  │
│ (populated)      │
│                  │
│ #pointPresenters │
│   = Map(n)       │
└────────┬─────────┘
         │
         │ User changes sort
         │ (click "Price")
         ▼
┌──────────────────────────────┐
│   SORT CHANGE EVENT          │
│                              │
│ #currentSortType = 'price'   │
│                              │
│ #allPoints unchanged         │
│ (still sorted by 'day')      │
│                              │
│ #pointPresenters (old) exist │
│ (still have 'day' sort UI)   │
└────────┬─────────────────────┘
         │
         │ #rerenderPointsList()
         │
         ▼
┌──────────────────────────────┐
│   CLEANUP PHASE              │
│                              │
│ DOM: remove .event elements  │
│      (visual list disappears)│
│                              │
│ #pointPresenters:            │
│   - forEach destroy()        │
│   - clear()                  │
│                              │
│ #currentSortType = 'price'   │
└────────┬─────────────────────┘
         │
         │ #sortPoints() returns
         │ new sorted array
         │
         ▼
┌──────────────────────────────┐
│   RENDER NEW STATE           │
│                              │
│ #currentSortType = 'price'   │
│ ✓ (active)                   │
│                              │
│ #allPoints unchanged         │
│ (still contains original)    │
│                              │
│ #pointPresenters = Map()     │
│   (new presenters added)     │
│                              │
│ DOM: new .event elements     │
│   (sorted by price)          │
└──────────────────────────────┘
```

---

## 📝 Code Snippets

### 1. Sort Change Handler Registration

**File: `src/presenter.js`**
```javascript
#renderWithContent(points, eventsSection) {
  // ... render sort component ...
  
  const sortStates = this.#computeSortStates();
  this.#sortComponent = new Sort(sortStates);
  render(this.#sortComponent, eventsSection, RenderPosition.BEFOREEND);
  
  // ✨ KEY LINE: Register handler
  this.#sortComponent.setSortTypeChangeHandler(
    this.#handleSortTypeChange.bind(this)
  );
  
  // ... continue rendering ...
}
```

### 2. Sort Type Handler

**File: `src/presenter.js`**
```javascript
#handleSortTypeChange(sortType) {
  this.#currentSortType = sortType;
  this.#rerenderPointsList();
}
```

### 3. Reset & Re-render

**File: `src/presenter.js`**
```javascript
#rerenderPointsList() {
  const sortedPoints = this.#sortPoints(this.#allPoints);
  
  // PHASE 1: CLEANUP
  // Remove old DOM elements
  this.#tripListContainer.querySelectorAll('.event').forEach(el => {
    el.remove();
  });

  // Destroy old presenters
  this.#pointPresenters.forEach(presenter => {
    presenter.destroy();
  });
  this.#pointPresenters.clear();

  // PHASE 2: RENDER
  // Render sorted points
  this.#renderPointsList(sortedPoints);
}
```

### 4. Sort Algorithm

**File: `src/presenter.js`**
```javascript
#sortPoints(points) {
  const sortedPoints = [...points];  // Create shallow copy

  switch (this.#currentSortType) {
    case 'day':
      return sortedPoints.sort((a, b) => {
        const dateA = new Date(a.dateFrom);
        const dateB = new Date(b.dateFrom);
        return dateA - dateB;  // Ascending: oldest first
      });

    case 'time':
      return sortedPoints.sort((a, b) => {
        const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
        const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
        return durationB - durationA;  // Descending: longest first
      });

    case 'price':
      return sortedPoints.sort((a, b) => 
        b.basePrice - a.basePrice  // Descending: most expensive first
      );

    default:
      return sortedPoints;
  }
}
```

### 5. Sort Handler Attachment

**File: `src/view/sort.js`**
```javascript
setSortTypeChangeHandler(callback) {
  this.#sortTypeChangeHandler = callback;
  
  // Attach listeners to all sort inputs
  this.element.querySelectorAll('.trip-sort__input').forEach(input => {
    input.addEventListener('change', (evt) => {
      // Extract sort type from input ID
      // Input ID format: "sort-{type}"
      // Example: "sort-price" → "price"
      const sortType = evt.target.id.replace('sort-', '');
      
      // Call presenter callback
      this.#sortTypeChangeHandler(sortType);
    });
  });
}
```

### 6. Improved PointPresenter Cleanup

**File: `src/presenter/point-presenter.js`**
```javascript
destroy() {
  // Remove event listeners
  this.#removeEscKeyListener();
  
  // Remove DOM elements
  if (this.#routePointView) {
    this.#routePointView.getElement().remove();
  }
  if (this.#editFormView) {
    this.#editFormView.getElement().remove();
  }
}
```

---

## 🧮 Data Structure Change

### Before Sort Change
```
Model:
  #points = [
    { id: 1, dateFrom: '2026-05-16', basePrice: 1500 },
    { id: 2, dateFrom: '2026-05-14', basePrice: 3500 },
    { id: 3, dateFrom: '2026-05-20', basePrice: 500 }
  ]

Presenter:
  #currentSortType = 'day'
  #allPoints = [same as model - sorted by day]
  
DOM:
  [Point 2: 2026-05-14]
  [Point 1: 2026-05-16]
  [Point 3: 2026-05-20]
```

### After Selecting "Price" Sort
```
Model:
  #points = [UNCHANGED - data integrity]
    { id: 1, dateFrom: '2026-05-16', basePrice: 1500 },
    { id: 2, dateFrom: '2026-05-14', basePrice: 3500 },
    { id: 3, dateFrom: '2026-05-20', basePrice: 500 }

Presenter:
  #currentSortType = 'price'  ← CHANGED
  #allPoints = [UNCHANGED - original array kept]
  
DOM:  ← UPDATED
  [Point 2: €3500]  ← Most expensive first
  [Point 1: €1500]
  [Point 3: €500]   ← Least expensive last
```

---

## ⏱️ Timeline of Operations

```
Time  Event                              State
────  ─────────────────────────────────  ─────────────────────
T0    User clicks "Price" button         #currentSortType = 'day'
      
T1    change event fires                 Sort handler called
      
T2    #handleSortTypeChange('price')     #currentSortType = 'price'
      
T3    #rerenderPointsList() called       Cleanup phase starts
      
T4    DOM elements removed               .event elements deleted
      
T5    Old presenters destroyed           destroy() called on each
      
T6    #sortPoints() creates sorted array Sorting algorithm runs
      
T7    #renderPointsList() called         New presenters Created
      
T8    New PointPresenters init()         RoutePointView rendered
      
T9    New elements in DOM                List shows sorted by price
      
T10   Sort operation complete            ✅ Done
```

---

## 🔗 Dependency Graph

```
Sort Component
    │
    └─> (user clicks)
        │
        └─> setSortTypeChangeHandler callback
            │
            └─> Presenter.#handleSortTypeChange
                │
                ├─> Update #currentSortType
                │
                └─> #rerenderPointsList()
                    │
                    ├─> #sortPoints() [NEW ORDER]
                    │
                    ├─> Clear DOM
                    │   └─> .querySelectorAll('.event').remove()
                    │
                    ├─> Destroy old PointPresenters
                    │   └─> forEach presenter.destroy()
                    │
                    └─> #renderPointsList()
                        │
                        └─> For each sorted point:
                            │
                            ├─> #renderPoint()
                            │   │
                            │   └─> new PointPresenter(...).init()
                            │       │
                            │       └─> RoutePointView rendered
                            │
                            └─> Store in #pointPresenters.set()
```

---

## 📈 Performance Timeline

```
Operation              Duration    Notes
─────────────────────  ──────────  ────────────────
Sort algorithm         O(n log n)  5 points ≈ 0ms
DOM cleanup            O(n)        5 elements ≈ 1ms
Presenter cleanup      O(n)        5 presenters ≈ 2ms
New render             O(n)        5 points ≈ 5ms
─────────────────────  ──────────  ────────────────
Total                  ~8ms        Typically < 20ms
```

---

**Visual Sorting Guide Complete ✨**
