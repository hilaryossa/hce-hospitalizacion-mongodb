# HCE Básica – Subsistema de Hospitalización en MongoDB

**Autora:** Hilary David Ossa
**Caso:** Gobernación de Antioquia – Historia Clínica Electrónica (HCE) Básica
**Motor:** MongoDB 8.x · mongosh 2.x
**Base de datos:** `hce_hospitalizacion`

Implementación documental del subsistema de hospitalización: modelo con validación `$jsonSchema`, datos simulados, operaciones CRUD (incluye soft delete), consultas con el Aggregation Framework, consultas propias y evidencia de uso de IA.

---

## Estructura del repositorio

```
hce-hospitalizacion-mongodb/
├── README.md                          ← este archivo (orden de ejecución)
├── scripts/
│   ├── 01_crear_base_datos.js         ← colecciones, validaciones e índices
│   ├── 02_insertar_datos.js           ← CREATE: insertMany + insertOne
│   ├── 03_actualizar_datos.js         ← UPDATE: simples, anidados, arreglos, updateMany
│   ├── 04_eliminar_datos.js           ← DELETE: soft delete, $pull, deleteOne/deleteMany
│   ├── 05_consultas_agregacion.js     ← 5 pipelines de 2 a 4 etapas (C1–C5)
│   └── 06_consultas_propias.js        ← 3 consultas avanzadas propias (P1–P3)
├── datos/                             ← datos de prueba en JSON (Extended JSON)
│   ├── medicos.json
│   ├── pacientes.json
│   ├── camas.json
│   └── hospitalizaciones.json
├── ia/
│   ├── interacciones_ia.md            ← prompts + resultados
│   └── evidencia_optimizacion.js      ← explain() con y sin índice
├── resultados/                        ← salida en texto de cada script
├── capturas/                          ← imágenes de la ejecución
├── docs/
│   └── modelo_documental.png          ← diagrama del modelo
└── informe/
    └── Informe_Tecnico_HCE_MongoDB_Hilary_David_Ossa.pdf
```

---

## Requisitos

1. **MongoDB Community Server 7.0 o superior** en ejecución local (`mongodb://localhost:27017`).
2. **mongosh** (MongoDB Shell). Viene con MongoDB Compass o se instala aparte.

Verificar en la terminal:

```bash
mongosh --version
```

---

## Orden de ejecución

Abrir una terminal **en la carpeta raíz del repositorio** y ejecutar los scripts en este orden. Cada uno depende del anterior.

| Paso | Comando | Qué hace |
|:-:|---|---|
| 1 | `mongosh --file scripts/01_crear_base_datos.js` | Crea `hce_hospitalizacion`, las 4 colecciones con validación y 5 índices. Borra lo anterior si existe. |
| 2 | `mongosh --file scripts/02_insertar_datos.js` | Inserta 6 médicos, 11 pacientes, 12 camas y 12 hospitalizaciones. |
| 3 | `mongosh --file scripts/03_actualizar_datos.js` | Ejecuta 9 actualizaciones (U1–U8) y muestra la verificación. |
| 4 | `mongosh --file scripts/04_eliminar_datos.js` | Soft delete, `$pull` y eliminación definitiva de registros de prueba. |
| 5 | `mongosh --file scripts/05_consultas_agregacion.js` | Ejecuta las consultas C1 a C5. |
| 6 | `mongosh --file scripts/06_consultas_propias.js` | Ejecuta las consultas propias P1 a P3. |
| 7 | `mongosh --file ia/evidencia_optimizacion.js` | (Opcional) Compara el plan de ejecución con y sin índice. |

> Para volver a empezar desde cero basta con ejecutar de nuevo el paso 1.

**Alternativa con MongoDB Compass:** abrir la pestaña *MONGOSH* (parte inferior), escribir `load("C:/ruta/al/repositorio/scripts/01_crear_base_datos.js")` y repetir con cada script en el mismo orden.

**Carga alternativa de datos (opcional):** los archivos de `datos/` se pueden importar con `mongoimport --db hce_hospitalizacion --collection pacientes --jsonArray --file datos/pacientes.json`, después del paso 1. El script 02 ya hace esta carga, así que no es necesario.

---

## Modelo de datos (resumen)

| Colección | Tipo | Contenido |
|---|---|---|
| `pacientes` | Referenciada | Identificación, EPS, municipio, contacto (subdocumento), alergias (arreglo), `activo` |
| `medicos` | Referenciada | Nombre, especialidad, registro médico |
| `camas` | Referenciada | Servicio, piso, estado (`Disponible`, `Ocupada`, `Mantenimiento`) |
| `hospitalizaciones` | Central | Referencias a paciente, médico y cama; **embebe** diagnósticos CIE-10, evoluciones con signos vitales y medicamentos; bandera `eliminado` |

Criterio: lo que pertenece a una sola estancia y se lee junto se embebe; lo que se comparte entre estancias se referencia.

---

## Consultas incluidas

| Código | Consulta | Etapas |
|:-:|---|---|
| C1 | Ocupación de camas por servicio | `$group` → `$project` → `$sort` |
| C2 | Diagnósticos CIE-10 más frecuentes | `$match` → `$unwind` → `$group` → `$sort` |
| C3 | Censo de pacientes hospitalizados | `$match` → `$lookup` → `$lookup` → `$project` |
| C4 | Carga asistencial por médico | `$match` → `$group` → `$lookup` → `$sort` |
| C5 | Estancia promedio por servicio | `$match` → `$group` → `$project` → `$sort` |
| P1 | Alerta clínica temprana (SpO2 < 92 % o T ≥ 38.5 °C) | Propia |
| P2 | Perfil epidemiológico por municipio | Propia |
| P3 | Detección de reingresos | Propia |

---

## Nota sobre los datos

Todos los datos son **simulados**. Nombres, documentos y teléfonos fueron inventados para el ejercicio y no corresponden a personas reales.
