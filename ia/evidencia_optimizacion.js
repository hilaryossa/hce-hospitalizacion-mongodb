// =====================================================================
//  Evidencia de optimización sugerida por la IA
//  Compara el filtro del censo hospitalario (C3) SIN índice vs CON índice
//  Ejecución:  mongosh --file ia/evidencia_optimizacion.js
// =====================================================================
db = db.getSiblingDB("hce_hospitalizacion");

const filtro = { estado: "Activa", eliminado: false };

function resumen(nombre, exp) {
  const plan = JSON.stringify(exp.queryPlanner.winningPlan);
  const st = exp.executionStats;
  print(nombre);
  print("   tipo de recorrido    : " + (plan.includes("IXSCAN") ? "IXSCAN (usa índice)" : "COLLSCAN (lee toda la colección)"));
  print("   índice               : " + ((plan.match(/"indexName":"([^"]+)"/) || [, "ninguno"])[1]));
  print("   documentos leídos    : " + st.totalDocsExamined);
  print("   documentos devueltos : " + st.nReturned);
}

// ANTES: se fuerza el recorrido completo, como si no existiera el índice
resumen("ANTES  (sin índice)",
  db.hospitalizaciones.find(filtro).hint({ $natural: 1 }).explain("executionStats"));

// DESPUÉS: se usa el índice compuesto ix_estado_eliminado { estado: 1, eliminado: 1 }
resumen("DESPUÉS (con ix_estado_eliminado)",
  db.hospitalizaciones.find(filtro).explain("executionStats"));
