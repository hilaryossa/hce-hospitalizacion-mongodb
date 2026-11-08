// =====================================================================
//  Script 03: Actualización de datos (UPDATE)
//  Campos simples, campos anidados, arreglos ($push, operador posicional $)
//  y actualizaciones masivas (updateMany)
//  Ejecución:  mongosh --file scripts/03_actualizar_datos.js
// =====================================================================

db = db.getSiblingDB("hce_hospitalizacion");

function resultado(titulo, r) {
  print("- " + titulo + "  ->  coincidencias: " + r.matchedCount + " | modificados: " + r.modifiedCount);
}

// ---------------------------------------------------------------------
// U1. Campo SIMPLE: la paciente PAC-003 cambia de EPS
// ---------------------------------------------------------------------
resultado("U1 Cambio de EPS (PAC-003)",
  db.pacientes.updateOne(
    { _id: "PAC-003" },
    { $set: { eps: "SURA" } }
  ));

// ---------------------------------------------------------------------
// U2. Campo ANIDADO: actualizar teléfono y dirección dentro de 'contacto'
// ---------------------------------------------------------------------
resultado("U2 Contacto actualizado (PAC-002)",
  db.pacientes.updateOne(
    { _id: "PAC-002" },
    { $set: { "contacto.telefono": "3189904512",
              "contacto.direccion": "Diagonal 55 # 34-90, Bello" } }
  ));

// ---------------------------------------------------------------------
// U3. ARREGLO ($push): registrar una nueva evolución clínica en HOS-0003
// ---------------------------------------------------------------------
resultado("U3 Nueva evolución (HOS-0003)",
  db.hospitalizaciones.updateOne(
    { _id: "HOS-0003" },
    { $push: { evoluciones: {
        fecha: new Date("2026-11-07T07:30:00Z"), medico_id: "MED-002",
        nota: "Herida quirúrgica limpia, tolera dieta blanda. Posible egreso en 24 horas.",
        signos_vitales: { presion: "116/70", fc: 78, temperatura: 36.9, spo2: 98 } } } }
  ));

// ---------------------------------------------------------------------
// U4. ARREGLO ($push): agregar oxígeno al plan de medicamentos de HOS-0001
// ---------------------------------------------------------------------
resultado("U4 Nuevo medicamento (HOS-0001)",
  db.hospitalizaciones.updateOne(
    { _id: "HOS-0001" },
    { $push: { medicamentos: {
        nombre: "Oxígeno por cánula nasal", dosis: "2 L/min", via: "Inhalada",
        frecuencia: "Continuo", fecha_inicio: new Date("2026-11-07") } } }
  ));

// ---------------------------------------------------------------------
// U5. Elemento ANIDADO dentro de un arreglo (operador posicional $):
//     se precisa la descripción del diagnóstico secundario N39.0 en HOS-0004
// ---------------------------------------------------------------------
resultado("U5 Diagnóstico corregido (HOS-0004)",
  db.hospitalizaciones.updateOne(
    { _id: "HOS-0004", "diagnosticos.codigo_cie10": "N39.0" },
    { $set: { "diagnosticos.$.descripcion": "Infección de vías urinarias, sitio no especificado (foco de la sepsis)" } }
  ));

// ---------------------------------------------------------------------
// U6. Ocupar la cama CAMA-402 por el nuevo ingreso HOS-0012
// ---------------------------------------------------------------------
resultado("U6 Cama ocupada (CAMA-402)",
  db.camas.updateOne({ _id: "CAMA-402" }, { $set: { estado: "Ocupada" } }));

// ---------------------------------------------------------------------
// U7. EGRESO del paciente pediátrico HOS-0006 y liberación de su cama
// ---------------------------------------------------------------------
resultado("U7 Egreso registrado (HOS-0006)",
  db.hospitalizaciones.updateOne(
    { _id: "HOS-0006", estado: "Activa" },
    { $set: { estado: "Egresada", fecha_egreso: new Date("2026-11-08T10:00:00Z") } }
  ));
resultado("U7 Cama liberada (CAMA-301)",
  db.camas.updateOne({ _id: "CAMA-301" }, { $set: { estado: "Disponible" } }));

// ---------------------------------------------------------------------
// U8. updateMany: registrar en todos los pacientes la autorización
//     de tratamiento de datos personales (Ley 1581 de 2012)
// ---------------------------------------------------------------------
resultado("U8 Consentimiento de datos (todos los pacientes)",
  db.pacientes.updateMany(
    {},
    { $set: { consentimiento_datos: { autorizado: true, fecha: new Date("2026-11-08") } } }
  ));

// ---------------------------------------------------------------------
// VERIFICACIÓN
// ---------------------------------------------------------------------
print("\nVerificación PAC-002 (contacto):");
printjson(db.pacientes.findOne({ _id: "PAC-002" }, { _id: 1, eps: 1, contacto: 1 }));
print("Verificación HOS-0004 (diagnósticos):");
printjson(db.hospitalizaciones.findOne({ _id: "HOS-0004" }, { _id: 0, diagnosticos: 1 }));
print("Verificación HOS-0006 (egreso):");
printjson(db.hospitalizaciones.findOne({ _id: "HOS-0006" }, { estado: 1, fecha_egreso: 1 }));
