// =====================================================================
//  Script 05: Consultas avanzadas con el Aggregation Framework
//  Cada pipeline usa entre 2 y 4 etapas ($match, $group, $project, $lookup...)
//  Ejecución:  mongosh --file scripts/05_consultas_agregacion.js
// =====================================================================

db = db.getSiblingDB("hce_hospitalizacion");

function titulo(t) { print("\n==================== " + t + " ===================="); }

// ---------------------------------------------------------------------
// C1. OCUPACIÓN DE CAMAS POR SERVICIO  ($group -> $project -> $sort)
//     Pregunta: ¿qué servicio está más congestionado?
// ---------------------------------------------------------------------
titulo("C1. Ocupación de camas por servicio");
printjson(db.camas.aggregate([
  { $group: {
      _id: "$servicio",
      total_camas: { $sum: 1 },
      ocupadas:    { $sum: { $cond: [{ $eq: ["$estado", "Ocupada"] }, 1, 0] } } } },
  { $project: {
      _id: 0, servicio: "$_id", total_camas: "$total_camas", ocupadas: "$ocupadas",
      porcentaje_ocupacion: { $round: [{ $multiply: [{ $divide: ["$ocupadas", "$total_camas"] }, 100] }, 1] } } },
  { $sort: { porcentaje_ocupacion: -1 } }
]).toArray());

// ---------------------------------------------------------------------
// C2. DIAGNÓSTICOS MÁS FRECUENTES (reporte epidemiológico)
//     ($match -> $unwind -> $group -> $sort)
// ---------------------------------------------------------------------
titulo("C2. Diagnósticos CIE-10 más frecuentes");
printjson(db.hospitalizaciones.aggregate([
  { $match: { eliminado: false } },
  { $unwind: "$diagnosticos" },
  { $group: {
      _id: { codigo: "$diagnosticos.codigo_cie10", descripcion: "$diagnosticos.descripcion" },
      casos: { $sum: 1 } } },
  { $sort: { casos: -1, "_id.codigo": 1 } }
]).toArray());

// ---------------------------------------------------------------------
// C3. CENSO HOSPITALARIO: pacientes activos con nombre y médico tratante
//     ($match -> $lookup -> $lookup -> $project)
// ---------------------------------------------------------------------
titulo("C3. Censo de pacientes hospitalizados (activos)");
printjson(db.hospitalizaciones.aggregate([
  { $match: { estado: "Activa", eliminado: false } },
  { $lookup: { from: "pacientes", localField: "paciente_id", foreignField: "_id", as: "paciente" } },
  { $lookup: { from: "medicos",   localField: "medico_id",   foreignField: "_id", as: "medico" } },
  { $project: {
      _id: 0, hospitalizacion: "$_id", servicio: "$servicio", cama: "$cama_id",
      paciente: { $concat: [{ $first: "$paciente.nombres" }, " ", { $first: "$paciente.apellidos" }] },
      medico:   { $first: "$medico.nombre" },
      diagnostico_principal: { $first: "$diagnosticos.descripcion" } } }
]).toArray());

// ---------------------------------------------------------------------
// C4. CARGA ASISTENCIAL POR MÉDICO
//     ($match -> $group -> $lookup -> $sort)
//     El $lookup usa un sub-pipeline para traer solo nombre y especialidad
// ---------------------------------------------------------------------
titulo("C4. Carga asistencial por médico");
printjson(db.hospitalizaciones.aggregate([
  { $match: { eliminado: false } },
  { $group: {
      _id: "$medico_id",
      total_atenciones:  { $sum: 1 },
      pacientes_activos: { $sum: { $cond: [{ $eq: ["$estado", "Activa"] }, 1, 0] } } } },
  { $lookup: {
      from: "medicos", localField: "_id", foreignField: "_id", as: "medico",
      pipeline: [ { $project: { _id: 0, nombre: 1, especialidad: 1 } } ] } },
  { $sort: { total_atenciones: -1, pacientes_activos: -1 } }
]).toArray());

// ---------------------------------------------------------------------
// C5. ESTANCIA PROMEDIO (DÍAS) POR SERVICIO, solo pacientes egresados
//     ($match -> $group -> $project -> $sort)
// ---------------------------------------------------------------------
titulo("C5. Estancia promedio por servicio (egresados)");
printjson(db.hospitalizaciones.aggregate([
  { $match: { estado: "Egresada", eliminado: false } },
  { $group: {
      _id: "$servicio",
      egresos: { $sum: 1 },
      promedio: { $avg: { $dateDiff: { startDate: "$fecha_ingreso", endDate: "$fecha_egreso", unit: "day" } } } } },
  { $project: { _id: 0, servicio: "$_id", egresos: "$egresos", estancia_promedio_dias: { $round: ["$promedio", 1] } } },
  { $sort: { estancia_promedio_dias: -1 } }
]).toArray());
