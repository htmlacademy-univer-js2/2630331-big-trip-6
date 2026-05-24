# AbstractStatefulView - Integration Guide

## Overview

This guide explains how `AbstractStatefulView` works within the larger MVP architecture of this application and how it integrates with `PointPresenter` and the data model.

---

## Architecture Context

```
┌─────────────────────────────────────────────┐
│         Application Layer                   │
│                                             │
│  src/main.js                                │
│    │                                        │
│    └─> new Presenter(model, view)           │
└─────────────────────┬───────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│  Model Layer     │        │  View Layer      │
│                  │        │                  │
│ PointsModel      │        │ Presenter        │
│ - getPoints()    │        │ - init()         │
│ - getOffers()    │        │ - #renderPoints()│
│ - updatePoint()  │        │                  │
│                  │        │ PointPresenter   │
│                  │        │ - init()         │
│                  │        │ - #switchMode()  │
│                  │        │                  │
│                  │        │ Views:           │
│                  │        │ - RoutePointView │
│                  │        │ - EditFormView◄──┼── NEW: extends
│                  │        │   (stateful)     │  AbstractStatefulView
│                  │        │ - Sort           │
│                  │        │ - Filter         │
│                  │        │                  │
└──────────────────┘        └──────────────────┘
```

---

## EditFormView Integration

### Before: Static View Model

```
┌────────────────────────────────────┐
│  PointPresenter                    │
│                                    │
│  init(point) {                     │
│    editFormView = new EditFormView │
│    editFormView.setPoint(point)    │
│    editFormView.render()           │
│                                    │
│    editFormView.setFormSubmit(..}  │
│  }                                 │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  EditFormView                      │
│                                    │
│  #point = null                     │
│                                    │
│  setPoint(point) {                 │
│    this.#point = point             │
│  }                                 │
│                                    │
│  get template() {                  │
│    return `<form>...               │
│      ${this.#point.type}           │
│    ...`                            │
│  }                                 │
│                                    │
│  Handlers must be called           │
│  externally:                       │
│  - onTypeChange()                  │
│  - onOfferChange()                 │
└────────────────────────────────────┘
```

**Problem:** Form state was external; view was passive.

### After: Stateful View Model

```
┌────────────────────────────────────┐
│  PointPresenter                    │
│                                    │
│  init(point) {                     │
│    editFormView = new EditFormView │
│      (point)  ← Pass data to       │
│               constructor          │
│                                    │
│    editFormView.setFormSubmit(..)  │
│    editFormView.render()           │
│                                    │
│    ✓ Form is self-managing         │
│  }                                 │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  EditFormView extends              │
│  AbstractStatefulView              │
│                                    │
│  constructor(point, ...) {         │
│    super({  ← Initialize state     │
│      type: point.type,             │
│      dateFrom: point.dateFrom,     │
│      ...                           │
│    })                              │
│  }                                 │
│                                    │
│  get template() {                  │
│    const state = this.getState()   │
│    return `<form>...               │
│      ${state.type}  ← Read state   │
│    ...`                            │
│  }                                 │
│                                    │
│  attachEventListeners() {          │
│    ✓ Self-managing events          │
│    Listen to changes → updateState()
│    updateState() → rerender()      │
│  }                                 │
└────────────────────────────────────┘
```

**Benefit:** Form manages its own state; interactive and reactive.

---

## Data Flow: Complete Picture

### 1. Initialization

```
src/presenter.js (Presenter)
    │
    ├─ Get point data from PointsModel
    │      pointData = {
    │        id: 1,
    │        type: 'flight',
    │        dateFrom: '2024-01-15',
    │        dateTo: '2024-01-15',
    │        basePrice: 160,
    │        offers: [offer1, offer2],
    │        isFavorite: false
    │      }
    │
    └─> new PointPresenter(model, pointData)
            │
            └─> this.editFormView = new EditFormView(
                  pointData,
                  destinations,
                  availableOffers
                )
                  │
                  ▼
              AbstractStatefulView constructor:
                this.#state = {
                  type: 'flight',
                  dateFrom: '2024-01-15',
                  dateTo: '2024-01-15',
                  basePrice: 160,
                  selectedOffers: [offer1.id, offer2.id],
                }
                
              State initialized ✓
```

### 2. Rendering

```
editFormView.getElement()
    │
    ├─ createElement(template)
    │      │
    │      ├─ Call template getter
    │      │  (reads state via this.getState())
    │      │
    │      ├─ Generate HTML:
    │      │  <form>
    │      │    <select value="flight">
    │      │      <option>flight</option>
    │      │      <option>taxi</option>
    │      │      ...
    │      │    </select>
    │      │    
    │      │    <input type="date" 
    │      │           value="2024-01-15">
    │      │    
    │      │    <input type="number"
    │      │           value="160">
    │      │    
    │      │    <div class="event__offers">
    │      │      <input type="checkbox"
    │      │             id="offer-1"
    │      │             checked>
    │      │      <label for="offer-1">...</label>
    │      │    </div>
    │      │    ...
    │      │  </form>
    │      │
    │      └─ callOnElementCreated()
    │             │
    │             └─ attachEventListeners()
    │                    │
    │                    ├─ querySelector('select')
    │                    │  .addEventListener('change', (e) => {
    │                    │    updateState({ 
    │                    │      type: e.target.value 
    │                    │    })
    │                    │  })
    │                    │
    │                    ├─ querySelectorAll('[name="offers"]')
    │                    │  .forEach(input => {
    │                    │    input.addEventListener('change', () => {
    │                    │      const offers = [...]
    │                    │      updateState({ 
    │                    │        selectedOffers: offers 
    │                    │      })
    │                    │    })
    │                    │  })
    │                    │
    │                    ├─ form.addEventListener('submit', ...)
    │                    │
    │                    └─ rollupBtn.addEventListener('click', ...)
    │
    └─ setData({ point, destinations, ... })
           └─ Form ready for interaction ✓
```

### 3. User Interaction

```
User clicks event type: "Taxi" (was "Flight")
    │
    └─> Event fired in EditFormView.attachEventListeners()
            │
            └─> selectElement.addEventListener('change', handler)
                  │
                  └─> handler calls:
                      updateState({
                        type: 'taxi'
                      })
                      
                      └─> AbstractStatefulView.updateState():
                          this.#state = {
                            ...this.#state,    /* keep old values */
                            type: 'taxi'       /* update type */
                          }
                          
                          this.rerender()
                          
                          ├─ Get new template (reads state.type='taxi')
                          │  HTML now has taxi icon, taxi label
                          │
                          ├─ Create new element from template
                          │
                          ├─ Replace old element in DOM
                          │  oldElement.replaceWith(newElement)
                          │
                          ├─ Clear cache (this.element = null)
                          │
                          └─ Call attachEventListeners() again
                             (re-attach to new elements)

Result: UI updated instantly ✓
        State: { type: 'taxi', ... }
```

### 4. Form Submission

```
User clicks "Save"
    │
    └─> Event fired in EditFormView.attachEventListeners()
            │
            └─> form.addEventListener('submit', (e) => {
                  e.preventDefault()
                  
                  this.#formSubmitHandler(
                    this.getState()  ← Get internal state
                  )
                })
                
                ├─ getState() returns:
                │  {
                │    type: 'taxi',
                │    dateFrom: '2024-01-16',
                │    dateTo: '2024-01-16',
                │    basePrice: 180,
                │    selectedOffers: ['offer-3', 'offer-5']
                │  }
                │
                └─> Handler is set by PointPresenter:
                    editFormView.setFormSubmitHandler((formData) => {
                      const updatedPoint = {
                        ...this.#point,
                        ...formData
                      }
                      
                      pointsModel.updatePoint(updatedPoint)
                      this.#switchToDefaultMode()
                    })

Result: Point updated in model ✓
        PointPresenter switches back to read mode ✓
```

### 5. State Access

```
At any time, external code can read form state:

const currentFormState = editFormView.getState()
{
  type: 'taxi',
  dateFrom: '2024-01-16',
  dateTo: '2024-01-16',
  basePrice: 180,
  selectedOffers: ['offer-3', 'offer-5']
}

This is useful for:
- Form validation before submission
- Comparing with original point data
- UI hints (e.g., "changes unsaved")
- Debugging form state
```

---

## Integration with PointPresenter

### Current Workflow

```
1. PointPresenter.init()
   │
   ├─ Create RoutePointView (read-only display)
   ├─ Create EditFormView (stateful form)
   │
   └─ setEditClickHandler(editFormView)
      setFormSubmitHandler(updatePointLogic)
      setRollupClickHandler(cancelEditLogic)

2. User clicks "Edit"
   │
   └─> #switchToEditMode()
       ├─ Replace RoutePointView with EditFormView
       ├─ EditFormView renders with initial state
       └─ Form listeners attached ✓

3. User modifies form (type, offers, etc.)
   │
   └─> All changes stay in EditFormView.#state
       UI re-renders automatically ✓

4. User clicks "Save"
   │
   └─> #formSubmitHandler called with:
       editFormView.getState()
       │
       ├─ Update model: pointsModel.updatePoint()
       ├─ Call #switchToDefaultMode()
       │  (returns to read-only view)
       └─ Form dismissed ✓

5. User clicks "Cancel" (rollup button)
   │
   └─> #rollupClickHandler called
       ├─ Discard form changes
       │  (state disposed with component)
       ├─ Call #switchToDefaultMode()
       └─ Returns to read-only view ✓
```

### Key Methods

```javascript
// In PointPresenter
#switchToEditMode() {
  // Replace current element with edit form
  replace(
    this.routePointView.getElement(),
    this.editFormView.getElement()  // renders + auto-attaches listeners
  )
}

#switchToDefaultMode() {
  // Replace edit form back with read-only view
  replace(
    this.editFormView.getElement(),
    this.routePointView.getElement()
  )
  
  // Clean up form
  this.editFormView.destroy()  // removes DOM + clears cache
}

#handleFormSubmit(formData) {
  // formData is the complete form state
  const updatedPoint = { ...this.#point, ...formData }
  this.#model.updatePoint(updatedPoint)
  
  this.#switchToDefaultMode()
}
```

---

## State Management Patterns

### Pattern 1: Initial State from Props

```javascript
// Constructor: receive point data
constructor(point, destinations, offers) {
  super({
    type: point.type,
    dateFrom: point.dateFrom,
    dateTo: point.dateTo,
    basePrice: point.basePrice,
    selectedOffers: point.offers.map(o => o.id)
  })
  
  this.#destination = destinations.find(d => d.id === point.destinationId)
  this.#availableOffers = offers
}

// State initialized from props ✓
```

### Pattern 2: Partial Updates

```javascript
// When user changes just one field:
updateState({ type: 'taxi' })

// AbstractStatefulView preserves other fields:
#state = {
  type: 'taxi',           // ← updated
  dateFrom: '...',        // ← unchanged
  dateTo: '...',          // ← unchanged
  basePrice: 160,         // ← unchanged
  selectedOffers: [...]   // ← unchanged
}
```

### Pattern 3: Template Reads State

```javascript
get template() {
  const {
    type,
    dateFrom,
    dateTo,
    basePrice,
    selectedOffers
  } = this.getState()  // ← Always fresh data
  
  return `
    <select value="${type}">
      <!-- options -->
    </select>
    
    <input type="date" value="${dateFrom}">
    <input type="number" value="${basePrice}">
    
    <div class="event__offers">
      ${this.#availableOffers.map(offer => `
        <input type="checkbox"
               ${selectedOffers.includes(offer.id) ? 'checked' : ''}>
      `).join('')}
    </div>
  `
}
```

### Pattern 4: Event → State → Render

```javascript
attachEventListeners() {
  const element = this.getElement()
  
  // When user selects different type
  element.querySelector('[name="type"]')
    .addEventListener('change', (e) => {
      // 1️⃣ User action
      // 2️⃣ Update state
      this.updateState({ type: e.target.value })
      // 3️⃣ Template re-renders (automatic)
      // 4️⃣ UI updates (automatic)
    })
}
```

---

## Memory Management

### Lifecycle Hooks

```javascript
// 1. Component created
constructor(point, ...) {
  super(initialState)
  // State initialized
}

// 2. Element created (first render)
createElement(markup) {
  const element = super.createElement(markup)
  
  // Called by base class - attach listeners here
  this.attachEventListeners()
  
  return element
}

// 3. Re-renders happen automatically
updateState({ ...updates }) {
  // Base class:
  // - Updates state
  // - Calls rerender()
  // - Calls attachEventListeners() again
}

// 4. Component destroyed
destroy() {
  // View.destroy() handles cleanup:
  // - removeElement() - removes from DOM
  // - Cache cleared
  // ✓ Listeners automatically removed with DOM
}
```

### Listener Lifecycle

```
CREATE
  ├─ attachEventListeners() called
  ├─ Listeners attached to form element
  └─ ✓ Ready to respond to user input

INTERACT
  ├─ User changes field
  ├─ Listener fires
  ├─ updateState() called
  ├─ rerender() called
  ├─ OLD element → OLD listeners removed (with DOM)
  ├─ NEW element created
  ├─ NEW listeners attached (fresh)
  └─ ✓ Form stays interactive

DESTROY
  ├─ destroy() called
  ├─ Element removed from DOM
  ├─ Listeners removed with DOM
  └─ ✓ No memory leaks
```

---

## Debugging Tips

### Inspecting State

```javascript
// In browser console:
const form = document.querySelector('[class*="event--edit"]')
// or use querySelector on your app element

// If you have reference to component:
console.log(editFormView.getState())
// Shows current form state
```

### Checking Re-renders

```javascript
// In template getter:
get template() {
  console.log('Template called with state:', this.getState())
  // Every time this logs, form will re-render
  
  // This logs once per update ✓
}

// In attachEventListeners:
attachEventListeners() {
  console.log('Attaching listeners to:', this.getElement())
  // Every time this logs, new listeners attached
  
  // This logs once per update ✓
}
```

### Memory Leak Detection

```javascript
// Before switching modes:
const elementsInitial = document.querySelectorAll('*').length

// After editing multiple points:
const elementsFinal = document.querySelectorAll('*').length

// If elementsFinal constantly increases:
// ⚠️ Possible memory leak
// ✓ Should be similar numbers with proper cleanup
```

---

## Performance Considerations

### Strengths

✅ Minimal DOM updates (only affected form re-renders)
✅ Event listeners cleaned up on each re-render
✅ State operations are O(1) (simple object merges)
✅ No global state (encapsulated per form)

### Optimization Opportunities

1. **Selective Re-renders**
   ```javascript
   // Could optimize to only re-render changed fields
   updateState(updates) {
     const oldState = this.getState()
     this.#state = { ...this.#state, ...updates }
     
     // Only rerender if state actually changed
     if (JSON.stringify(oldState) !== JSON.stringify(this.getState())) {
       this.rerender()
     }
   }
   ```

2. **Memoization**
   ```javascript
   // Cache template if state not changed
   #cachedTemplate = null
   #cachedState = null
   
   get template() {
     const state = this.getState()
     if (state === this.#cachedState) {
       return this.#cachedTemplate
     }
     // ... calculate template
   }
   ```

---

**Integration Complete! ✨**

The `AbstractStatefulView` pattern creates a self-managing, reactive form component that fits seamlessly into your MVP architecture while reducing external state management complexity.
