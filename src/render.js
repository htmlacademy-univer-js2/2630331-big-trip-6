const RenderPosition = {
  BEFOREBEGIN: 'beforebegin',
AFTERBEGIN: 'afterbegin',
  BEFOREEND: 'beforeend',
  AFTEREND: 'afterend',
};

function createElement(template) {
  const newElement = document.createElement('div');
  newElement.innerHTML = template;
  return newElement.firstElementChild;
}

function render(component, container, place = RenderPosition.BEFOREEND) {
  container.insertAdjacentElement(place, component.getElement());
}

function replace(newComponent, oldComponent) {
  const oldElement = oldComponent instanceof Element ? oldComponent : oldComponent.element;
  const newElement = newComponent instanceof Element ? newComponent : newComponent.element;
  const parent = oldElement.parentElement;
  parent.replaceChild(newElement, oldElement);
}

export {RenderPosition, createElement, render, replace};
