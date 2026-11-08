// =====================================================================
//  Script 04: Eliminación de datos (DELETE)
//  - Soft delete  : el registro se marca, no se borra (trazabilidad clínica)
//  - $pull        : eliminar un elemento de un arreglo embebido
//  - Hard delete  : deleteOne / deleteMany sobre registros de prueba
//  Ejecución:  mongosh --file scripts/04_eliminar_datos.js
// =====================================================================

db = db.getSiblingDB("hce_hospitalizacion");

// ---------------------------------------------------------------------
// D1. SOFT DELETE de una hospitalización registrada por error (duplicada)
//     Primero se simula el registro duplicado de HOS-0007
// ---------------------------------------------------------------------
db.hospitalizaciones.insertOne({
  _id: "HOS-0013", paciente_id: "PAC-008", medico_id: "MED-001", cama_id: "CAMA-104", servicio: "Medicina Interna",
  fecha_ingreso: new Date("2026-11-07T07:50:00Z"), fecha_egreso: null, estado: "Activa",
  motivo_ingreso: "Hiperglucemia sostenida y poliuria",
  diagnosticos: [ { codigo_cie10: "E11.9", descripcion: "Diabetes mellitus tipo 2 sin complicaciones", tipo: "Principal" } ],
  evoluciones: [], medicamentos: [], eliminado: false
});

let r1 = db.hospitalizaciones.updateOne(
  { _id: "HOS-0013" },
  { $set: { eliminado: true,
            auditoria_eliminacion: {
              fecha:   new Date("2026-11-08T11:00:00Z"),
              usuario: "admin.hce",
              motivo:  "Registro duplicado de HOS-0007" } } }
);
print("- D1 Soft delete HOS-0013        -> modificados: " + r1.modifiedCount);

// ---------------------------------------------------------------------
// D2. SOFT DELETE de un paciente: se inactiva, no se borra su historia
// ---------------------------------------------------------------------
let r2 = db.pacientes.updateOne(
  { _id: "PAC-009" },
  { $set: { activo: false, motivo_inactivacion: "Traslado de residencia fuera del departamento" } }
);
print("- D2 Paciente inactivado PAC-009 -> modificados: " + r2.modifiedCount);

// ---------------------------------------------------------------------
// D3. $pull: suspender (retirar) la Prednisolona del plan de HOS-0002
// ---------------------------------------------------------------------
let r3 = db.hospitalizaciones.updateOne(
  { _id: "HOS-0002" },
  { $pull: { medicamentos: { nombre: "Prednisolona" } } }
);
print("- D3 $pull Prednisolona HOS-0002 -> modificados: " + r3.modifiedCount);

// ---------------------------------------------------------------------
// D4. HARD DELETE (eliminación definitiva) de camas de prueba
//     Solo se aplica a datos sin valor clínico (registros de prueba)
// ---------------------------------------------------------------------
db.camas.insertMany([
  { _id: "CAMA-997", servicio: "Cirugía", piso: 9, estado: "Disponible", es_prueba: true },
  { _id: "CAMA-998", servicio: "Cirugía", piso: 9, estado: "Disponible", es_prueba: true },
  { _id: "CAMA-999", servicio: "UCI",     piso: 9, estado: "Disponible", es_prueba: true }
]);

let r4 = db.camas.deleteOne({ _id: "CAMA-999" });
print("- D4 deleteOne CAMA-999          -> eliminados: " + r4.deletedCount);

let r5 = db.camas.deleteMany({ es_prueba: true });
print("- D5 deleteMany camas de prueba  -> eliminados: " + r5.deletedCount);

// ---------------------------------------------------------------------
// VERIFICACIÓN
// ---------------------------------------------------------------------
print("\nHospitalizaciones visibles (eliminado: false): " +
      db.hospitalizaciones.countDocuments({ eliminado: false }));
print("Hospitalizaciones con soft delete (eliminado: true): " +
      db.hospitalizaciones.countDocuments({ eliminado: true }));
print("Camas totales tras el hard delete: " + db.camas.countDocuments());
print("Medicamentos actuales de HOS-0002:");
printjson(db.hospitalizaciones.findOne({ _id: "HOS-0002" }, { _id: 0, "medicamentos.nombre": 1 }));
