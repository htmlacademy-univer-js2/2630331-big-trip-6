# 🧪 Testing Guide - Validació de la Refactorización

## Pruebas Manuales (Browser)

### Test 1: Cargar la Aplicación
```
1. Ejecutar: npm start
2. Verificar que se carguen 5 puntos de viaje
3. ✅ Cada punto debe mostrar:
   - Tipo de evento (Taxi, Bus, Flight, etc.)
   - Destino
   - Horario
   - Precio
   - Botón favorito (corazón)
   - Botón editar
```

### Test 2: Partial Data Binding - Favorito
```
1. Localizar cualquier punto
2. Hacer clic el botón favorito (corazón) ❤️
3. ✅ El corazón debe cambiar de estilo INMEDIATAMENTE
4. ✅ NO debe recargar el formulario completo
5. ✅ El punto debe seguir en su lugar
6. Hacer clic de nuevo
7. ✅ El corazón vuelve al estado original
```

**Verificar en DevTools Console:**
```javascript
// Abrir Console
model._points[0].isFavorite;  // Ver si cambió
```

### Test 3: Una Forma Abierta - Múltiples Puntos
```
1. Localizar el punto #1
2. Hacer clic en el botón editar (arriba a la derecha)
3. ✅ Se abre el formulario de edición para punto #1
4. Localizar el punto #2
5. Hacer clic en el botón editar
6. ✅ El formulario #1 se cierra AUTOMÁTICAMENTE
7. ✅ Se abre el formulario #2
8. Localizar el punto #3
9. Hacer clic en el botón editar  
10. ✅ El formulario #2 se cierra
11. ✅ Se abre el formulario #3
```

**Verificar en DevTools:**
```javascript
presenter._currentEditingPointId;  // ID del actualmente abierto
presenter._pointPresenters.size;    // Número total de puntos
presenter._pointPresenters.get('1')._mode;  // Modo de punto #1
```

### Test 4: ESC Key Handler
```
1. Abrir formulario de cualquier punto
2. ✅ Formulario visible
3. Presionar tecla ESC
4. ✅ Formulario se cierra automáticamente
5. ✅ Vuelve a mostrar vista de punto
6. Abrir otro punto
7. Presionar ESC
8. ✅ Cierra correctamente
```

### Test 5: Cerrar con Botón "Cancelar"
```
1. Abrir formulario de edición
2. Localizar botón "Cancelar" (rollup-btn)
3. Hacer clic
4. ✅ Formulario se cierra
5. ✅ Vuelve a vista de punto
```

### Test 6: Cambio de Favorito en Edición
```
1. Abrir formulario de edición de punto A
2. Cerrar (ESC)
3. Cambiar favorito (clic corazón)
4. ✅ Solo corazón se actualiza
5. Abrir formulario punto B
6. ✅ Punto A sigue con favorito actualizado
```

---

## Tests de Consola (DevTools Console)

### Verificar Estructura del Modelo
```javascript
// Ver todos los datos cargados
console.log(model._points);
console.log(model._destinations);
console.log(model._offers);

// Verificar tipo de datos
console.log(typeof model.getPoints());        // function
console.log(model.getPoints().length);        // 5
console.log(model.getDestinations().length);  // 5
console.log(model.getOffers().length);        // 10
```

### Verificar Estructura del Presenter
```javascript
// Ver presentadores
console.log(presenter._pointPresenters);     // Map(5)
console.log(presenter._currentEditingPointId); // null o pointId

// Ver PointPresenter específico
const pointPresenter = presenter._pointPresenters.get('1');
console.log(pointPresenter._mode);           // 'default' o 'edit'
console.log(pointPresenter._point);          // Objeto del punto
```

### Simular Cambio de Favorito
```javascript
// Obtener un punto
const point = model.getPoints()[0];
console.log(point.isFavorite);               // false o true

// Cambiar desde consola
point.isFavorite = !point.isFavorite;
model.updatePoint(point);
console.log(point.isFavorite);               // Cambiado

// Verificar en el DOM:
// El botón favorito debe reflejar el cambio
```

### Verificar ESC Listener
```javascript
// Abrir formulario
const pointPresenter = presenter._pointPresenters.get('1');
console.log(pointPresenter._mode);           // 'default'
pointPresenter._switchToEditMode();

// En consola, presionar ESC
console.log(pointPresenter._mode);           // 'edit' → 'default'
```

---

## Tests Automatizados (Jest/Vitest)

### Test 1: PointPresenter Inicialización
```javascript
describe('PointPresenter', () => {
  it('should initialize with correct data', () => {
    const presenter = new PointPresenter(
      container,
      point,
      destinations,
      offers,
      onDataChange,
      onModeChange
    );
    
    expect(presenter._point).toEqual(point);
    expect(presenter._mode).toBe('default');
  });
});
```

### Test 2: Cambio de Modo
```javascript
it('should switch to edit mode', () => {
  presenter.init();
  presenter._switchToEditMode();
  
  expect(presenter._mode).toBe('edit');
  expect(onModeChange).toHaveBeenCalledWith(point.id);
});
```

### Test 3: Data Binding Parcial
```javascript
it('should update only favorite button', () => {
  presenter.init();
  const initialState = presenter._point.isFavorite;
  
  presenter._handleFavoriteClick();
  
  expect(presenter._point.isFavorite).not.toBe(initialState);
  expect(onDataChange).toHaveBeenCalled();
});
```

### Test 4: Una Forma Abierta
```javascript
it('should close previous form when opening new one', () => {
  const presenter1 = new PointPresenter(...);
  const presenter2 = new PointPresenter(...);
  
  routePresenter._pointPresenters.set('1', presenter1);
  routePresenter._pointPresenters.set('2', presenter2);
  
  // Abrir #1
  presenter1._switchToEditMode();
  expect(routePresenter._currentEditingPointId).toBe('1');
  
  // Abrir #2
  routePresenter._handleModeChange('2');
  expect(presenter1._mode).toBe('default');
  expect(presenter2._mode).toBe('edit');
});
```

### Test 5: ESC Key Cleanup
```javascript
it('should cleanup ESC listener', () => {
  const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
  
  presenter.init();
  presenter._switchToEditMode();
  presenter._removeEscKeyListener();
  
  expect(removeEventListenerSpy).toHaveBeenCalledWith(
    'keydown',
    expect.any(Function)
  );
});
```

---

## Performance Checks

### Verificar Partial Data Binding
```javascript
// Abrir DevTools → Performance tab
// 1. Hacer clic en favorito
// Performance.measureUserAgentSpecificMemory() 
// ✅ Debe ser menor que full re-render

// Alternativa:
console.time('favorite-click');
element.querySelector('.event__favorite-btn').click();
console.timeEnd('favorite-click');
// ✅ Debe ser < 10ms
```

### Verificar Memory Leaks
```javascript
// DevTools → Memory → Take heap snapshot
// 1. Abrir 5 puntos
// 2. Cerrar todos
// 3. Tomar snapshot
// 4. Verificar que los listeners se hayan eliminado
// 5. Garbage collection
// 6. Tomar otro snapshot
// ✅ No debe haber aumento significativo
```

---

## Edge Cases a Probar

### Case 1: Favorito + Rápido
```
1. Hacer clic en favorito 5 veces rápidamente
2. ✅ Debe actualizar correctamente cada vez
3. ✅ No debe causar race conditions
```

### Case 2: Formulario + ESC + Favorito
```
1. Abrir formulario
2. Presionar ESC para cerrar
3. Inmediatamente clic en favorito
4. ✅ Debe cambiar correctamente
```

### Case 3: Cambio de Modo Múltiple
```
1. Abrir → Cerrar → Abrir → Cerrar
2. Repetir 10 veces
3. ✅ Debe funcionar sin errores
4. ✅ No debe haber memory leaks
```

### Case 4: Data Persistence
```
1. Cambiar favorito de punto #1
2. Abrir y cerrar formulario #1
3. Abrir formulario #1 de nuevo
4. ✅ El favorito debe ser el que guardamos
```

---

## Debugging Tips

### Enable Logging
```javascript
// En PointPresenter, agregar logs:
#switchToEditMode() {
  console.log(`[PointPresenter ${this.#point.id}] Switching to EDIT mode`);
  // ... resto del código
}

#switchToDefaultMode() {
  console.log(`[PointPresenter ${this.#point.id}] Switching to DEFAULT mode`);
  // ... resto del código
}
```

### DevTools Breakpoints
```javascript
// En PointPresenter.#handleModeChange:
debugger; // Presionar F5 para pausar aquí
console.log('Current editing point ID:', this.#currentEditingPointId);
```

### Monitor DOM Changes
```javascript
// En Chrome DevTools Console:
document.querySelectorAll('.event__favorite-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    console.log('Favorite button clicked');
  });
});
```

---

## Checklist Final de Validación

- [ ] Aplicación carga sin errores
- [ ] 5 puntos se muestran correctamente
- [ ] Clic en favorito → solo botón se actualiza
- [ ] Abrir punto A
- [ ] Abrir punto B → punto A se cierra
- [ ] Presionar ESC → cierra formulario
- [ ] Clic en "Cancelar" → cierra formulario
- [ ] Cambio de favorito en edición → persiste
- [ ] No hay memory leaks
- [ ] No hay errores de consola
- [ ] DevTools Performance está bien
- [ ] Responsive en móvil
- [ ] Funciona en Chrome, Firefox, Safari

---

## Comandos Útiles

```bash
# Iniciar aplicación
npm start

# Build para producción  
npm run build

# Ejecutar linter
npm run lint

# Verificar errores de TypeScript (si está configurado)
tsc --noEmit

# Monitor de memoria
node --inspect app.js
```

---

**¡Está listo para testing! 🚀**
