# 🎨 AbstractStatefulView - Visual Architecture

## Class Hierarchy Diagram

```
┌─────────────────────────────┐
│         View (Base)         │
│  - element (cached)         │
│  - template (getter)        │
│  - createElement()          │
│  - getElement()             │
│  - removeElement()          │
└──────────────┬──────────────┘
               │
               │ extends
               │
       ┌───────▼────────────────────────┐
       │  AbstractStatefulView          │
       │  - #state (Object)             │
       │  - getState()                  │
       │  - getStateValue(key)          │
       │  - updateState(updates)        │
       │  - setState(newState)          │
       │  - rerender()                  │
       │  - attachEventListeners() [▼]  │
       │  - onElementCreated() [▼]      │
       └───────┬──────────────────────┘
               │
               │ extends
               │
  ┌────────────▼──────────────────────────┐
  │      EditFormView                      │
  │  - #destination                        │
  │  - #availableOffers                    │
  │  - #formSubmitHandler                  │
  │  - #rollupClickHandler                 │
  │  ─────────────────────────────          │
  │  + attachEventListeners()              │
  │  + setFormSubmitHandler(callback)      │
  │  + setRollupClickHandler(callback)     │
  │  ─────────────────────────────          │
  │  State: {                              │
  │    type,                               │
  │    dateFrom,                           │
  │    dateTo,                             │
  │    basePrice,                          │
  │    selectedOffers                      │
  │  }                                     │
  └────────────────────────────────────────┘

Legend:
[▼] = Template method (overridable)
(+) = Public method
(#) = Private field
```

---

## State Management Flow

```
┌─────────────────────────────────────────┐
│  EditFormView Constructor               │
│                                         │
│  const initialState = {                 │
│    type: 'flight',                      │
│    dateFrom: ISO,                       │
│    dateTo: ISO,                         │
│    basePrice: 0,                        │
│    selectedOffers: []                   │
│  }                                      │
│  super(initialState)                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  AbstractStatefulView Constructor       │
│                                         │
│  this.#state = { ...initialState }      │
│                                         │
│  State initialized: ✓                   │
└─────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Element Creation                       │
│                                         │
│  createElement(template)                │
│    ↓                                    │
│  onElementCreated() called [hook]       │
│    ↓                                    │
│  attachEventListeners() [override]      │
└─────────────────────────────────────────┘
```

---

## Update & Re-render Flow

```
┌──────────────────────────────────────┐
│  User Interaction                    │
│  (clicks event type, offers, etc.)   │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Event Listener Triggered            │
│  (in attachEventListeners)           │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  updateState({ ... })                │
│                                      │
│  #state = {                          │
│    ...#state,                        │
│    ...updates                        │
│  }                                   │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  rerender() called                   │
└────────┬─────────────────────────────┘
         │
    ┌────┴────┬──────────┬────────────┐
    │          │          │           │
    ▼          ▼          ▼           ▼
 Get new     Create new  Replace    Clear cache
 template    element     in DOM     & re-attach
 (uses       (with new   (old elem  listeners
  state)     state)      → new)      (new elem)
    │          │          │           │
    └────┬─────┴──────────┴───────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Form Updated in UI                  │
│  (with new state values)             │
│                                      │
│  Example: type changes from          │
│  'flight' to 'taxi'                  │
│    - Icon updated to taxi            │
│    - Label updated to "Taxi"         │
│    - Form refreshed                  │
└──────────────────────────────────────┘
```

---

## DOM Update Process

```
┌─────────────────────────────────────────────┐
│  BEFORE: Form with flight icon              │
│                                             │
│  <form class="event event--edit">           │
│    <img src="img/icons/flight.png">         │
│    <label>Flight</label>                    │
│    [Offers...]                              │
│  </form>                                    │
│                                             │
│  State: { type: 'flight', ... }            │
└─────────────────────────────────────────────┘
                 │
                 │ User clicks "taxi" type
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  IN updateState()                           │
│  updateState({ type: 'taxi' })              │
│                                             │
│  State updated: { type: 'taxi', ... }      │
└─────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  IN rerender()                              │
│                                             │
│  1. Get updated template:                   │
│     template (reads: state.type = 'taxi')   │
│     → Returns HTML with taxi.png            │
│                                             │
│  2. Create new element:                     │
│     <form class="event event--edit">        │
│       <img src="img/icons/taxi.png">        │
│       <label>Taxi</label>                   │
│       [Offers...]                           │
│     </form>                                 │
│                                             │
│  3. Replace in DOM:                         │
│     oldElement.replaceWith(newElement)      │
│                                             │
│  4. Clear cache & re-attach:                │
│     removeElement()                         │
│     attachEventListeners()                  │
└─────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  AFTER: Form with taxi icon                 │
│                                             │
│  <form class="event event--edit">           │
│    <img src="img/icons/taxi.png">           │
│    <label>Taxi</label>                      │
│    [Offers...]                              │
│  </form>                                    │
│                                             │
│  State: { type: 'taxi', ... }              │
└─────────────────────────────────────────────┘
```

---

## Offer Selection Re-render

```
┌──────────────────────────────────┐
│  Initial State                   │
│  selectedOffers: []              │
│                                  │
│  HTML Output:                    │
│  ☐ Offer A (not checked)         │
│  ☐ Offer B (not checked)         │
└──────────────┬───────────────────┘
               │
               │ User checks "Offer A"
               │
               ▼
┌──────────────────────────────────┐
│  Event Handler                   │
│  updateState({                   │
│    selectedOffers: ['offer-1']   │
│  })                              │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Template Re-render              │
│  State: selectedOffers: ['offer-1']
│                                  │
│  HTML Output:                    │
│  ☑ Offer A (checked)             │
│  ☐ Offer B (not checked)         │
│                                  │
│  (Icon changes based on state)   │
└──────────────────────────────────┘
```

---

## State Lifecycle

```
┌──────────────────────┐
│   Component Created  │
│  #state = {}         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────┐
│  Constructor runs        │
│  super(initialState)     │
│  #state initialized      │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   First Render          │
│   element created        │
│   listeners attached     │
└──────────┬───────────────┘
           │
           ├─ User interacts
           │      │
           │      ▼
           │ updateState()
           │      │
           │      ▼
           │ rerender()
           │      │
           │      ▼
           │ element replaced
           │ listeners re-attached
           │      │
           └──────┤
                  │
           ├─ component shown/hidden
           │      │
           │      ▼
           │   UI updated
           │      │
           └──────┤
                  │
           └─ component destroyed
                  │
                  ▼
           ┌──────────────────┐
           │  cleanup()       │
           │  listeners       │
           │  removed         │
           └──────────────────┘
```

---

## Method Interaction Diagram

```
┌─────────────────────────────────────────────┐
│  EditFormView Public Interface              │
│                                             │
│  getState()                                 │
│    │                                        │
│    ▼                                        │
│  AbstractStatefulView.getState()           │
│    └─> return { ...#state }                 │
│                                             │
│  updateState(updates)                       │
│    │                                        │
│    ├─> #state = { ...#state, ...updates }  │
│    │                                        │
│    └─> rerender()                           │
│        │                                    │
│        ├─> createElement(template)          │
│        │                                    │
│        ├─> currentElement.replaceWith()     │
│        │                                    │
│        ├─> removeElement()                  │
│        │                                    │
│        └─> attachEventListeners()           │
│            │                                │
│            └─> [EditFormView override]      │
│                ├─ Attach type listeners    │
│                ├─ Attach offer listeners   │
│                ├─ Attach submit listener   │
│                └─ Attach rollup listener   │
└─────────────────────────────────────────────┘
```

---

## Data Flow: User Action to UI Update

```
┌─────────────────┐
│  User clicks    │
│  "Taxi" type    │
└────────┬────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │  Event listener fires       │
    │  (attached in                │
    │   attachEventListeners)      │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │  updateState({              │
    │    type: 'taxi'             │
    │  })                         │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │  Internal #state updated    │
    │  {                          │
    │    type: 'taxi',     ← NEW  │
    │    dateFrom: ...,           │
    │    dateTo: ...,             │
    │    basePrice: ...,          │
    │    selectedOffers: [...]    │
    │  }                          │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │  rerender() called          │
    │  Template regenerated       │
    │  (reads new state)          │
    │  → HTML with taxi icon      │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │  DOM Updated                │
    │  Old element replaced       │
    │  New element inserted       │
    │  Listeners re-attached      │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │  UI Shows Update            │
    │  Icon: flight.png → taxi.png│
    │  Label: "Flight" → "Taxi"   │
    └─────────────────────────────┘
```

---

## Memory Management During Re-render

```
STEP 1: Before Re-render
┌──────────────────────────────┐
│  DOM:                        │
│  <form> (id=elem1)           │
│    <input type="radio">      │
│    <label>Flight</label>     │
│  </form>                     │
│                              │
│  JS:                         │
│  element = elem1             │
│  #escKeyHandler = fn1        │
│  listeners = [fn1, fn2, ...]│
└──────────────────────────────┘

STEP 2: Create New Element
┌──────────────────────────────┐
│  New HTML Created:           │
│  <form> (id=elem2)           │
│    <input type="radio">      │
│    <label>Taxi</label>       │
│  </form>                     │
│                              │
│  elem1 still in DOM          │
│  elem2 not yet inserted      │
└──────────────────────────────┘

STEP 3: Replace & Clean
┌──────────────────────────────┐
│  DOM:                        │
│  <form> (id=elem2) ← NEW    │
│    <input type="radio">      │
│    <label>Taxi</label>       │
│  </form>                     │
│                              │
│  elem1 removed from DOM      │
│  Old listeners detached      │
│  ✓ Memory freed              │
└──────────────────────────────┘

STEP 4: Re-attach Listeners
┌──────────────────────────────┐
│  DOM:                        │
│  <form> (id=elem2)           │
│    <input type="radio">      │
│    <label>Taxi</label>       │
│  </form>                     │
│                              │
│  New listeners attached      │
│  element = elem2             │
│  #escKeyHandler = fn_new     │
│  listeners = [fn_new, ...]   │
└──────────────────────────────┘
```

---

**Visual Architecture Guide Complete ✨**
