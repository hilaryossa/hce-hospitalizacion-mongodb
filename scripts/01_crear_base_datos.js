// =====================================================================
//  HCE BÁSICA - SUBSISTEMA DE HOSPITALIZACIÓN (MongoDB)
//  Script 01: Creación de la base de datos, colecciones, validaciones e índices
//  Autor: Hilary David Ossa
//  Ejecución:  mongosh --file scripts/01_crear_base_datos.js
// =====================================================================

db = db.getSiblingDB("hce_hospitalizacion");

// Se eliminan las colecciones si ya existen, para poder re-ejecutar el proyecto desde cero
db.getCollectionNames().forEach(function (c) { db[c].drop(); });

// ---------------------------------------------------------------------
// 1. COLECCIÓN: medicos
// ---------------------------------------------------------------------
db.createCollection("medicos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "nombre", "especialidad", "registro_medico", "activo"],
      properties: {
        _id:             { bsonType: "string", description: "Código del médico (MED-###)" },
        nombre:          { bsonType: "string" },
        especialidad:    { bsonType: "string" },
        registro_medico: { bsonType: "string" },
        telefono:        { bsonType: "string" },
        activo:          { bsonType: "bool" }
      }
    }
  }
});

// ---------------------------------------------------------------------
// 2. COLECCIÓN: pacientes  (contacto como subdocumento, alergias como arreglo)
// ---------------------------------------------------------------------
db.createCollection("pacientes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "documento", "nombres", "apellidos", "fecha_nacimiento", "sexo", "eps", "activo"],
      properties: {
        _id: { bsonType: "string", description: "Código del paciente (PAC-###)" },
        documento: {
          bsonType: "object",
          required: ["tipo", "numero"],
          properties: {
            tipo:   { enum: ["CC", "TI", "CE", "RC"] },
            numero: { bsonType: "string" }
          }
        },
        nombres:          { bsonType: "string" },
        apellidos:        { bsonType: "string" },
        fecha_nacimiento: { bsonType: "date" },
        sexo:             { enum: ["F", "M"] },
        eps:              { bsonType: "string" },
        municipio:        { bsonType: "string" },
        contacto: {
          bsonType: "object",
          properties: {
            telefono:  { bsonType: "string" },
            direccion: { bsonType: "string" }
          }
        },
        alergias: { bsonType: "array", items: { bsonType: "string" } },
        activo:   { bsonType: "bool" }
      }
    }
  }
});

// ---------------------------------------------------------------------
// 3. COLECCIÓN: camas
// ---------------------------------------------------------------------
db.createCollection("camas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "servicio", "piso", "estado"],
      properties: {
        _id:      { bsonType: "string", description: "Código de la cama (CAMA-###)" },
        servicio: { enum: ["Medicina Interna", "Cirugía", "Pediatría", "UCI"] },
        piso:     { bsonType: "number" },
        estado:   { enum: ["Disponible", "Ocupada", "Mantenimiento"] }
      }
    }
  }
});

// ---------------------------------------------------------------------
// 4. COLECCIÓN: hospitalizaciones (documento central)
//    Embebe: diagnósticos, evoluciones clínicas y medicamentos
//    Referencia: paciente_id, medico_id, cama_id
// ---------------------------------------------------------------------
db.createCollection("hospitalizaciones", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "paciente_id", "medico_id", "cama_id", "servicio",
                 "fecha_ingreso", "estado", "motivo_ingreso", "diagnosticos", "eliminado"],
      properties: {
        _id:            { bsonType: "string", description: "Código de la hospitalización (HOS-####)" },
        paciente_id:    { bsonType: "string" },
        medico_id:      { bsonType: "string" },
        cama_id:        { bsonType: "string" },
        servicio:       { bsonType: "string" },
        fecha_ingreso:  { bsonType: "date" },
        fecha_egreso:   { bsonType: ["date", "null"] },
        estado:         { enum: ["Activa", "Egresada"] },
        motivo_ingreso: { bsonType: "string" },
        diagnosticos: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["codigo_cie10", "descripcion", "tipo"],
            properties: {
              codigo_cie10: { bsonType: "string" },
              descripcion:  { bsonType: "string" },
              tipo:         { enum: ["Principal", "Secundario"] }
            }
          }
        },
        evoluciones: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["fecha", "medico_id", "nota"],
            properties: {
              fecha:     { bsonType: "date" },
              medico_id: { bsonType: "string" },
              nota:      { bsonType: "string" },
              signos_vitales: {
                bsonType: "object",
                properties: {
                  presion:     { bsonType: "string" },
                  fc:          { bsonType: "number" },
                  temperatura: { bsonType: "number" },
                  spo2:        { bsonType: "number" }
                }
              }
            }
          }
        },
        medicamentos: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["nombre", "dosis", "via", "frecuencia"],
            properties: {
              nombre:     { bsonType: "string" },
              dosis:      { bsonType: "string" },
              via:        { enum: ["Oral", "Intravenosa", "Subcutánea", "Inhalada"] },
              frecuencia: { bsonType: "string" }
            }
          }
        },
        eliminado: { bsonType: "bool", description: "Bandera de soft delete" }
      }
    }
  }
});

// ---------------------------------------------------------------------
// 5. ÍNDICES (aceleran los filtros y los $lookup más usados)
// ---------------------------------------------------------------------
db.pacientes.createIndex({ "documento.numero": 1 }, { unique: true, name: "ux_documento" });
db.camas.createIndex({ servicio: 1, estado: 1 }, { name: "ix_servicio_estado" });
db.hospitalizaciones.createIndex({ estado: 1, eliminado: 1 }, { name: "ix_estado_eliminado" });
db.hospitalizaciones.createIndex({ paciente_id: 1 }, { name: "ix_paciente" });
db.hospitalizaciones.createIndex({ "diagnosticos.codigo_cie10": 1 }, { name: "ix_cie10" });

print("Base de datos 'hce_hospitalizacion' creada.");
print("Colecciones: " + db.getCollectionNames().sort().join(", "));
print("Índices en hospitalizaciones: " +
      db.hospitalizaciones.getIndexes().map(function (i) { return i.name; }).join(", "));
