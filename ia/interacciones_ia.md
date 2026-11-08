# Evidencia de uso de Inteligencia Artificial

**Proyecto:** HCE Básica – Subsistema de Hospitalización en MongoDB
**Autora:** Hilary David Ossa
**Herramienta:** Claude (Anthropic)
**Fecha:** 8 de noviembre de 2026

La IA se usó como asistente técnico en cuatro frentes: diseño del modelo, depuración de scripts, optimización de pipelines y explicación comparativa. Cada respuesta fue verificada ejecutando los scripts en MongoDB 8.2; las salidas reales están en `resultados/` y `capturas/`.

---

## Interacción 1 – Diseño del modelo documental

**Prompt**

> Estoy pasando el modelo relacional de hospitalización de la HCE a MongoDB. Tengo pacientes, médicos, camas, diagnósticos, evolución clínica y medicamentos. ¿Qué debo embeber y qué debo referenciar? Dame un criterio sencillo.

**Resultado (resumen)**

| Entidad | Decisión | Criterio |
|---|---|---|
| Diagnósticos, evoluciones, medicamentos | Embebidos en `hospitalizaciones` | Pertenecen a una sola estancia, se leen siempre juntos y no se consultan aislados del ingreso. |
| Pacientes | Referenciados (`paciente_id`) | Un paciente tiene varias hospitalizaciones (reingresos); embeberlo duplicaría sus datos. |
| Médicos | Referenciados (`medico_id`) | Atienden muchas hospitalizaciones; sus datos cambian de forma independiente. |
| Camas | Referenciadas (`cama_id`) | Tienen estado propio (Disponible / Ocupada / Mantenimiento) que cambia con cada ingreso y egreso. |

Regla aplicada: *"lo que se lee junto y tiene el mismo ciclo de vida se embebe; lo que se comparte entre documentos se referencia"*. También se recomendó guardar `servicio` dentro de la hospitalización como dato histórico del ingreso.

**Uso en el proyecto:** estructura de `scripts/01_crear_base_datos.js`.

---

## Interacción 2 – Depuración del validador `$jsonSchema`

**Prompt**

> Al insertar una evolución con `temperatura: 37.0` MongoDB responde *Document failed validation*, pero en el validador puse `bsonType: "double"`. ¿Por qué falla?

**Resultado (resumen)**

mongosh convierte los números enteros de JavaScript (incluido `37.0`, que en JS es igual a `37`) a `int32` al guardarlos. Un validador con `bsonType: "double"` rechaza ese valor. La corrección es usar `bsonType: "number"`, que acepta `int`, `long`, `double` y `decimal`. El mismo ajuste se aplicó a `piso`, `fc` y `spo2`.

**Prompt de seguimiento**

> Ahora probé insertar una cama con `estado: "Libre"` y también falla. ¿Cómo leo el error?

**Resultado:** el detalle está en `errInfo.details.schemaRulesNotSatisfied`. El error indica `propertyName: 'estado'`, `reason: 'value was not found in enum'` y `consideredValue: 'Libre'`: el valor no pertenece a la lista permitida. La validación funciona como se diseñó (ver `capturas/ia_error_validacion.png`).

---

## Interacción 3 – Optimización de pipelines

**Prompt**

> Revisa mi pipeline del censo hospitalario (`$match` → `$lookup` → `$lookup` → `$project`). ¿Cómo lo hago más eficiente y cómo demuestro la mejora?

**Resultado (resumen)**

1. Mantener `$match` como **primera etapa**: reduce los documentos que llegan a los `$lookup`.
2. Crear el índice compuesto `ix_estado_eliminado { estado: 1, eliminado: 1 }`, porque ese es el filtro que más se repite (pacientes activos no eliminados).
3. Demostrarlo con `explain("executionStats")` comparando el recorrido forzado sin índice contra el normal.

Observación verificada: MongoDB 8 ya mueve por sí solo un `$match` independiente antes del `$lookup`, por lo que la diferencia medible está en el índice y no en el orden. Escribir el `$match` primero sigue siendo buena práctica porque hace explícita la intención.

**Evidencia real** (`ia/evidencia_optimizacion.js`):

| Escenario | Recorrido | Documentos leídos | Devueltos |
|---|---|---|---|
| Sin índice | COLLSCAN | 13 | 7 |
| Con `ix_estado_eliminado` | IXSCAN | 7 | 7 |

Con el índice se leen solo los documentos que cumplen el filtro. Con 13 registros la diferencia es pequeña; en un hospital con miles de hospitalizaciones la reducción es proporcional.

---

## Interacción 4 – Ajuste de un pipeline al límite de etapas

**Prompt**

> La consulta de carga por médico tiene `$match`, `$group`, `$lookup` y `$project`, pero sale desordenada y no puedo pasar de 4 etapas. ¿Qué hago?

**Resultado (resumen)**

Reemplazar el `$project` final por un `$sort` y usar un **sub-pipeline dentro del `$lookup`** para traer solo `nombre` y `especialidad` del médico:

```js
{ $lookup: { from: "medicos", localField: "_id", foreignField: "_id", as: "medico",
             pipeline: [ { $project: { _id: 0, nombre: 1, especialidad: 1 } } ] } }
```

Así la proyección ocurre dentro del `$lookup` y queda espacio para ordenar. Se aplicó en la consulta C4.

---

## Interacción 5 – Explicación comparativa relacional vs. documental

**Prompt**

> Explícame en una tabla corta las diferencias entre el modelo relacional que hicimos antes y este modelo en MongoDB para la hospitalización.

**Resultado (resumen)**

| Aspecto | Modelo relacional (SQL) | Modelo documental (MongoDB) |
|---|---|---|
| Estructura | Tablas normalizadas con claves foráneas | Documentos JSON con datos embebidos |
| Una hospitalización completa | Requiere varios JOIN (diagnóstico, evolución, medicamento) | Se obtiene con una sola lectura |
| Esquema | Rígido, definido antes de insertar | Flexible, controlado con `$jsonSchema` |
| Integridad referencial | Garantizada por el motor | Responsabilidad de la aplicación |
| Fortaleza | Transacciones y reportes administrativos | Volumen, variedad y velocidad de datos clínicos |

Conclusión: ambos modelos se complementan; el relacional sostiene la parte administrativa y el documental el registro clínico variable. Esta idea es la base de la solución híbrida del proyecto integrador.

---

## Interacción 6 – Revisión de un cálculo de edad

**Prompt**

> En el perfil epidemiológico por municipio calculo la edad con `$dateDiff` y `unit: "year"`. ¿Es correcto?

**Resultado (resumen)**

No para la edad cumplida. `unit: "year"` cuenta los cambios de año calendario entre las dos fechas: un paciente nacido el 3 de diciembre de 1960 aparece con 66 años el 7 de noviembre de 2026, cuando en realidad tiene 65. Se reemplazó por los días transcurridos divididos entre 365.25 y redondeados hacia abajo:

```js
edad: { $floor: { $divide: [ { $dateDiff: { startDate: { $first: "$paciente.fecha_nacimiento" },
                                             endDate: "$fecha_ingreso", unit: "day" } }, 365.25 ] } }
```

Aplicado en la consulta P2 (`scripts/06_consultas_propias.js`).

---

## Validación humana

Toda sugerencia de la IA se ejecutó y se verificó antes de incluirla. Los datos usados en las consultas a la IA son **simulados**: no se compartieron datos clínicos reales con la herramienta.
