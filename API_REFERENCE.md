# 📋 All Classes & Methods Reference

## Quick Lookup: Complete API

---

## NEW: AbstractStatefulView

**File:** `src/view/abstract-stateful-view.js`  
**Extends:** `View`  
**Purpose:** Base class for stateful, reactive view components

### Constructor
```javascript
constructor(initialState = {})
  // Initialize with state object
  // Example: super({ type: 'flight', price: 160 })
```

### Public Methods

#### State Access
```javascript
getState()
  // Returns: Copy of entire state object
  // Usage: const { type, price } = this.getState()

getStateValue(key)
  // Returns: Value of specific state property
  // Usage: const type = this.getStateValue('type')
  // Throws: Error if key not in state
```

#### State Mutation
```javascript
updateState(updates)
  // Merges updates into state, triggers rerender
  // Param: updates {Object} - partial state update
  // Example: this.updateState({ type: 'taxi', price: 100 })
  // Result: Only specified fields updated, others preserved
  // Side Effect: Calls rerender() automatically

setState(newState)
  // Replaces entire state, triggers rerender
  // Param: newState {Object} - complete new state
  // Example: this.setState({ type: 'taxi', price: 100, ... })
  // Side Effect: Calls rerender() automatically
```

#### Lifecycle Management
```javascript
rerender()
  // Internal method - handles full DOM refresh cycle
  // 1. Gets new template from getter
  // 2. Creates new element
  // 3. Replaces old element in DOM
  // 4. Clears cache
  // 5. Calls attachEventListeners()
  // Note: Never call directly - called by updateState/setState

attachEventListeners()
  // Template method - override in subclass
  // Purpose: Attach event listeners to form elements
  // Called after: Component attached to DOM (first render)
  // Called after: Each rerender
  // Example:
  // this.getElement().querySelector('select')
  //   .addEventListener('change', (e) => {
  //     this.updateState({ type: e.target.value })
  //   })

onElementCreated()
  // Hook method - override in subclass if needed
  // Called after: Element created but before attachEventListeners
  // Purpose: One-time initialization of element
  // Example: Calls `flatpickr` date picker initialization
```

### Inherited from View

```javascript
getElement()
  // Returns: Element from cache or error if not in DOM

removeElement()
  // Clears cache and removes element from DOM

createElement(markup)
  // Enhanced: Calls onElementCreated() after element created
  // Calls: attachEventListeners() after onElementCreated()
```

### State Management Rules

✅ **DO:**
- Initialize state in constructor via super()
- Use getState() in template getter to read state
- Call updateState() -> automatic rerender
- Override attachEventListeners() for event binding

❌ **DON'T:**
- Modify #state directly (use updateState instead)
- Call rerender() manually
- Store component-level data outside state
- Forget to call attachEventListeners() after element creation

---

## REFACTORED: EditFormView

**File:** `src/view/editFormView.js`  
**Extended:** Was `View` → Now `AbstractStatefulView`  
**Purpose:** Edit form with internal state management

### Constructor
```javascript
constructor(point, destination, offers)
  // point {Object}         - Point data being edited
  // destination {Object}   - Destination for this point
  // offers {Array}         - All available offers
  // 
  // Initializes state from point:
  // {
  //   type: point.type,
  //   dateFrom: point.dateFrom,
  //   dateTo: point.dateTo,
  //   basePrice: point.basePrice,
  //   selectedOffers: point.offers.map(o => o.id)
  // }
```

### Public Methods

#### Handlers Setup
```javascript
setFormSubmitHandler(callback)
  // Param: callback {Function(formState)}
  // When: User clicks "Save" button
  // Passes: Complete form state object
  // Example:
  // editForm.setFormSubmitHandler((formData) => {
  //   console.log(formData) // { type, dateFrom, dateTo, ... }
  //   updateModel(formData)
  // })

setRollupClickHandler(callback)
  // Param: callback {Function()}
  // When: User clicks "Cancel/Rollup" button
  // Purpose: Handle form dismissal without saving
  // Example:
  // editForm.setRollupClickHandler(() => {
  //   switchToReadOnlyMode()
  // })
```

### Inherited Methods

```javascript
getState()
  // Returns form's current internal state
  // Example: editForm.getState()
  // Result: { type: 'taxi', basePrice: 150, ... }

updateState(updates)
  // Update specific form fields
  // Example: this.updateState({ type: 'taxi' })
  // Then: Form re-renders with all changes
```

### Template Getter
```javascript
get template()
  // Returns: HTML string for entire form
  // Reads: this.getState() for current values
  // Features:
  // - Event type selector
  // - Date/time pickers
  // - Price input
  // - Offers checkboxes
  // - Submit/Cancel buttons
```

### Event Listeners
```javascript
attachEventListeners()
  // Attached automatically on: first render + each rerender
  // Event bindings:
  // 
  // Type selector change:
  //   → updateState({ type: newType })
  //   → Form re-renders with new type
  // 
  // Offer checkbox change:
  //   → updateState({ selectedOffers: [...checked] })
  //   → Form re-renders with new selections
  // 
  // Submit button click:
  //   → Call #formSubmitHandler(state)
  //   → Parent handles update
  // 
  // Rollup button click:
  //   → Call #rollupClickHandler()
  //   → Parent handles cancellation
```

### Data Flow Example

```javascript
// 1. Create form with initial point data
const editForm = new EditFormView(point, destination, offers)

// 2. Set what happens when user saves
editForm.setFormSubmitHandler((formState) => {
  // formState = { type: 'taxi', dateFrom: '...', ... }
  model.updatePoint({ ...point, ...formState })
})

// 3. Set what happens when user cancels
editForm.setRollupClickHandler(() => {
  // Switch back to read-only view
})

// 4. Display form
container.innerHTML = ''
container.appendChild(editForm.getElement())

// 5. User changes event type selector
//    → attachEventListeners() fires event
//    → updateState({ type: 'taxi' }) called
//    → getState() called in template
//    → new HTML generated
//    → rerender() replaces element
//    → attachEventListeners() called again
//    → Form ready for next interaction

// 6. User submits
//    → form listener fires
//    → setFormSubmitHandler callback invoked
//    → Model updated
//    → Parent switches back to read-only
```

---

## NEW: PointsModel

**File:** `src/model/points-model.js`  
**Purpose:** Centralized data access and management

### Constructor
```javascript
constructor(points, destinations, offers)
  // points {Array}       - All route points
  // destinations {Array} - All available destinations
  // offers {Array}       - All available offers
```

### Getter Methods

```javascript
getPoints()
  // Returns: Array of all points
  // Immutable: Returns copy
  // Usage: const allPoints = model.getPoints()

getDestinations()
  // Returns: Array of all destinations
  // Usage: const dests = model.getDestinations()

getOffers()
  // Returns: Array of all offers
  // Usage: const allOffers = model.getOffers()
```

### Point Data Methods

```javascript
updatePoint(updatedPoint)
  // Updates single point in data
  // Param: updatedPoint {Object} - point with same id
  // Replaces: Old point with updated version
  // Usage: model.updatePoint({ id: 1, type: 'taxi', ... })

getOffersByType(type)
  // Returns: Offers available for this transport type
  // Param: type {String} - 'flight', 'taxi', 'bus', etc.
  // Usage: const offers = model.getOffersByType('taxi')

getOffersByIds(offerIds)
  // Returns: Offer objects for these IDs
  // Param: offerIds {Array} - ['offer-1', 'offer-2']
  // Usage: const selected = model.getOffersByIds(['o1', 'o2'])
```

---

## NEW: PointPresenter

**File:** `src/presenter/point-presenter.js`  
**Purpose:** Manage lifecycle and interactions of single route point

### Constructor
```javascript
constructor(
  model,           // PointsModel instance
  container,       // DOM element for rendering
  changeMode       // Callback when mode changes
)
  // changeMode callback: (currentEditPointId) => {}
  //   null = no edit form open
  //   pointId = that edit form is open
```

### Public Methods

```javascript
init(point)
  // Initialize: render point in read-only mode
  // Param: point {Object} - point data
  // Creates: ReadOnlyView + EventuallyEditFormView
  // Attaches: Click / favorites handlers

#switchToEditMode()
  // Internal: Replace read-only with edit form
  // Result: Form rendered and interactive
  // Calls: changeMode(this.#point.id)

#switchToDefaultMode()
  // Internal: Replace edit form with read-only
  // Result: Back to point display
  // Calls: changeMode(null)

destroy()
  // Cleanup: Remove all DOM elements and listeners
  // Called when: Point removed from display
  // Important: Prevents memory leaks
```

### Event Handlers (Private)

```javascript
#handleEditClick()
  // When: User clicks "Edit" on point
  // Does: Switch to edit mode

#handleFavoriteClick()
  // When: User clicks favorite button
  // Does: Partial update (button only, no re-render)
  // Updates: Model with toggled favorite

#handleFormSubmit(formData)
  // When: User saves edited form
  // Receives: Form state from EditFormView
  // Does: Update model, switch back to read-only

#handleRollupClick()
  // When: User cancels form edit
  // Does: Switch back to read-only, discard changes

#handleModeChange()
  // When: Another point enters edit mode
  // Does: Force this point back to read-only
  // Purpose: Ensure only one form open
```

---

## ENHANCED: Presenter (RoutePresenter)

**File:** `src/presenter.js`  
**Existing + New Methods**

### Existing Methods
```javascript
constructor(model, container)
init()  // Initialize app, render all points
```

### NEW: Sorting Methods

```javascript
#handleSortTypeChange(sortType)
  // Called by: Sort component on type change
  // Param: sortType {String} - 'day', 'time', or 'price'
  // Does: Save sort type, re-render points
  // Result: Points list updated with new order

#sortPoints(points)
  // Sorts array by current sort type
  // Returns: Sorted points array (original unchanged)
  // Sort types:
  //   'day': Ascending by dateFrom
  //   'time': Descending by duration
  //   'price': Descending by basePrice

#rerenderPointsList()
  // Complete list refresh:
  // 1. Destroy all PointPresenters (cleanup)
  // 2. Clear container
  // 3. Sort points
  // 4. Render fresh presenters
  // Called: When sort changes
  // Result: DOM fully refreshed

#renderPointsList()
  // Actually render points to DOM
  // Uses: PointPresenter for each point
  // Called: From #rerenderPointsList()
```

### NEW: Fields
```javascript
#currentSortType    // Tracks: 'day', 'time', or 'price'
#allPoints          // Cache: All points (for sorting)
#tripListContainer  // Reference: Container element
```

---

## NEW: Generator (Mock Data)

**File:** `src/mock/generator.js`  
**Purpose:** Generate test/mock data for development

### Exported Functions

```javascript
generatePoints(count)
  // Generates: Array of random points
  // Param: count {Number}
  // Returns: Array of point objects
  // Each point has: id, type, destination, dates, price, offers

generateDestination()
  // Generates: Single random destination
  // Returns: { id, name, description, pictures }

generateOffer()
  // Generates: Single random offer
  // Returns: { id, title, price }

generatePoints()  // Default export
  // Returns: 5-7 random points
  // Quick for testing
```

---

## ENHANCED: Sort View

**File:** `src/view/sort.js`  
**New Method Added**

### Method

```javascript
setSortTypeChangeHandler(callback)
  // Attach listener to sort radio buttons
  // Param: callback {Function(sortType)}
  // sortType: 'day', 'price', or 'time'
  // Called: When user selects sort type
  // Example:
  // sortView.setSortTypeChangeHandler((type) => {
  //   console.log('User selected:', type)
  //   rerenderPointsList()
  // })
```

---

## State Management Patterns

### Pattern: State-Driven Rendering

**Before:**
```javascript
setData(point) { this.point = point }
render() { return template(this.point) }
```

**After:**
```javascript
constructor(point) { super({ type: point.type, ... }) }
get template() { return template(this.getState()) }
updateState({ type }) { // auto-renderss }
```

### Pattern: Event → State → Render

```javascript
// 1. User event
input.addEventListener('change', (e) => {
  // 2. Update state
  this.updateState({ value: e.target.value })
  // 3. Automatic rerender
  //    - template getter called
  //    - new HTML generated
  //    - DOM updated
  //    - listeners re-attached
})
```

### Pattern: Memory Management

```javascript
// Before rerender
oldElement.remove()
oldListeners = []  // Cleaned up with DOM

// Rerender cycle
createElement() → attachEventListeners() → ready

// On destroy
element.remove()  // Listeners automatically removed
```

---

## Common Usage Patterns

### Create and Display Stateful Component

```javascript
// 1. Create
const form = new EditFormView(point, destination, offers)

// 2. Set handlers
form.setFormSubmitHandler((data) => { /* ... */ })
form.setRollupClickHandler(() => { /* ... */ })

// 3. Display
container.appendChild(form.getElement())

// 4. Interact
// User changes field → updateState → rerender → ready
```

### Work with Point Presenter

```javascript
// 1. Create
const presenter = new PointPresenter(model, container, onModeChange)

// 2. Initialize
presenter.init(point)

// 3. Component self-manages
// - Edit clicks → show form
// - Submit → save
// - Cancel → discard
// - Favorite → partial update
```

### Implement Custom Stateful View

```javascript
// 1. Extend AbstractStatefulView
class CustomView extends AbstractStatefulView {
  constructor(data) {
    super({ field1: data.f1, field2: data.f2 })
  }
  
  get template() {
    const { field1, field2 } = this.getState()
    return `<div>${field1} - ${field2}</div>`
  }
  
  attachEventListeners() {
    this.getElement()
      .querySelector('button')
      .addEventListener('click', () => {
        this.updateState({ field1: newValue })
      })
  }
}

// 2. Use
const view = new CustomView(data)
container.appendChild(view.getElement())
```

---

## Index of All New/Modified Files

### New Files (100% new)
| File | Lines | Purpose |
|------|-------|---------|
| `src/view/abstract-stateful-view.js` | 70 | State management base class |
| `src/presenter/point-presenter.js` | 134 | Individual point control |
| `src/model/points-model.js` | 40 | Data access layer |
| `src/mock/generator.js` | 80 | Test data generation |

### Modified Files (additions only)
| File | Changes | Purpose |
|------|---------|---------|
| `src/view/editFormView.js` | Extends AbstractStatefulView | Add state management |
| `src/view/sort.js` | New setSortTypeChangeHandler() | Sort event binding |
| `src/presenter.js` | 4 methods, 3 fields | Sorting logic |

---

## Verification Checklist

Use this to verify everything is working:

- [ ] `EditFormView` constructs without errors
- [ ] Form displays when edited
- [ ] Type selector changes form instantly
- [ ] Offers checkboxes update form instantly
- [ ] Favorite button updates without forming change
- [ ] Only one edit form open at a time
- [ ] Submit saves to model correctly
- [ ] Cancel discards changes
- [ ] Sort selector works
- [ ] List re-renders on sort change
- [ ] No console errors
- [ ] No memory leaks

---

**Quick Reference Complete! 📚**

See detailed docs for complete examples and integration guidance.
