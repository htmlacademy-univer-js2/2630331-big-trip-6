import View from './view.js';

/**
 * AbstractStatefulView - Base class for components with internal state management
 * Extends View to add reactive state management and re-rendering capabilities
 */
export default class AbstractStatefulView extends View {
  #state = {};

  constructor(initialState = {}) {
    super();
    this.#state = { ...initialState };
  }

  /**
   * Get current component state
   * @returns {Object} Current state object
   */
  getState() {
    return { ...this.#state };
  }

  /**
   * Update state and trigger re-render
   * @param {Object} updates - Partial state updates
   */
  updateState(updates) {
    this.#state = {
      ...this.#state,
      ...updates
    };
    this.rerender();
  }

  /**
   * Update entire state and trigger re-render
   * @param {Object} newState - Complete new state
   */
  setState(newState) {
    this.#state = { ...newState };
    this.rerender();
  }

  /**
   * Get specific state value
   * @param {string} key - State property key
   * @returns {*} State value
   */
  getStateValue(key) {
    return this.#state[key];
  }

  /**
   * Re-render the component without recreating the element
   * Replaces innerHTML and re-attaches event listeners
   */
  rerender() {
    const currentElement = this.element;
    if (!currentElement) return;

    // Create new element from updated template
    const newElement = this.createElement(this.template);

    // Replace old element with new one
    currentElement.replaceWith(newElement);

    // Clear cached element reference so next access uses new element
    this.removeElement();

    // Re-attach event listeners
    this.attachEventListeners();
  }

  /**
   * Template method: Subclasses should implement this
   * Automatically called when state changes
   * @returns {string} HTML template
   */
  get template() {
    throw new Error('template getter must be implemented in subclass');
  }

  /**
   * Hook: Subclasses can override to attach event listeners
   * Called automatically after rendering
   * This should be implemented by child classes
   */
  attachEventListeners() {
    // Override in subclass
  }

  /**
   * Called when element is initially created
   * Used to attach initial event listeners
   */
  onElementCreated() {
    this.attachEventListeners();
  }

  /**
   * Override the parent createElement to call onElementCreated hook
   * @param {string} markup - HTML markup
   * @returns {HTMLElement} Created element
   */
  createElement(markup) {
    const element = super.createElement(markup);
    this.onElementCreated();
    return element;
  }
}
