// =====================================================================
//  Script 06: Consultas avanzadas PROPIAS (diseño de la autora)
//  P1. Alerta clínica temprana por signos vitales críticos
//  P2. Perfil epidemiológico por municipio de Antioquia
//  P3. Detección de reingresos hospitalarios
//  Ejecución:  mongosh --file scripts/06_consultas_propias.js
// =====================================================================

db = db.getSiblingDB("hce_hospitalizacion");

function titulo(t) { print("\n==================== " + t + " ===================="); }

// ---------------------------------------------------------------------
// P1. ALERTA CLÍNICA TEMPRANA
//     Toma la ÚLTIMA evolución de cada paciente activo y lo marca si
//     SpO2 < 92 % (hipoxemia) o temperatura >= 38.5 °C (fiebre alta).
// ---------------------------------------------------------------------
titulo("P1. Alerta clínica temprana (pacientes activos)");
printjson(db.hospitalizaciones.aggregate([
  { $match: { estado: "Activa", eliminado: false } },
  { $project: { paciente_id: 1, cama_id: 1, servicio: 1, ultima: { $last: "$evoluciones" } } },
  { $match: { $or: [ { "ultima.signos_vitales.spo2": { $lt: 92 } },
                     { "ultima.signos_vitales.temperatura": { $gte: 38.5 } } ] } },
  { $lookup: { from: "pacientes", localField: "paciente_id", foreignField: "_id", as: "paciente" } },
  { $project: {
      _id: 0, hospitalizacion: "$_id", servicio: "$servicio", cama: "$cama_id",
      paciente: { $concat: [{ $first: "$paciente.nombres" }, " ", { $first: "$paciente.apellidos" }] },
      spo2: "$ultima.signos_vitales.spo2",
      temperatura: "$ultima.signos_vitales.temperatura",
      alerta: { $switch: { branches: [
        { case: { $and: [ { $lt: ["$ultima.signos_vitales.spo2", 92] },
                          { $gte: ["$ultima.signos_vitales.temperatura", 38.5] } ] }, then: "CRÍTICA: hipoxemia + fiebre alta" },
        { case: { $lt: ["$ultima.signos_vitales.spo2", 92] }, then: "Hipoxemia" } ],
        default: "Fiebre alta" } } } },
  { $sort: { alerta: 1 } }
]).toArray());

// ---------------------------------------------------------------------
// P2. PERFIL EPIDEMIOLÓGICO POR MUNICIPIO
//     Casos, edad promedio al ingreso y diagnósticos principales.
// ---------------------------------------------------------------------
titulo("P2. Perfil epidemiológico por municipio");
printjson(db.hospitalizaciones.aggregate([
  { $match: { eliminado: false } },
  { $lookup: { from: "pacientes", localField: "paciente_id", foreignField: "_id", as: "paciente" } },
  { $project: {
      municipio: { $first: "$paciente.municipio" },
      // edad cumplida = días vividos / 365.25 (unit "year" contaría cambios de año, no años cumplidos)
      edad: { $floor: { $divide: [ { $dateDiff: { startDate: { $first: "$paciente.fecha_nacimiento" },
                                                   endDate: "$fecha_ingreso", unit: "day" } }, 365.25 ] } },
      diagnostico: { $first: "$diagnosticos.descripcion" } } },
  { $group: {
      _id: "$municipio",
      casos: { $sum: 1 },
      edad_promedio: { $avg: "$edad" },
      diagnosticos: { $addToSet: "$diagnostico" } } },
  { $project: { _id: 0, municipio: "$_id", casos: "$casos", edad_promedio: { $round: ["$edad_promedio", 0] }, diagnosticos: "$diagnosticos" } },
  { $sort: { casos: -1, municipio: 1 } }
]).toArray());

// ---------------------------------------------------------------------
// P3. REINGRESOS: pacientes con más de una hospitalización registrada
// ---------------------------------------------------------------------
titulo("P3. Pacientes con reingreso hospitalario");
printjson(db.hospitalizaciones.aggregate([
  { $match: { eliminado: false } },
  { $group: { _id: "$paciente_id", ingresos: { $sum: 1 }, fechas: { $push: "$fecha_ingreso" } } },
  { $match: { ingresos: { $gt: 1 } } },
  { $lookup: { from: "pacientes", localField: "_id", foreignField: "_id", as: "paciente" } },
  { $project: { _id: 0, paciente_id: "$_id",
      paciente: { $concat: [{ $first: "$paciente.nombres" }, " ", { $first: "$paciente.apellidos" }] },
      ingresos: "$ingresos", fechas: "$fechas" } }
]).toArray());
