// =====================================================================
//  Script 02: Inserción de datos simulados (CREATE)
//  - insertMany: carga inicial de médicos, pacientes, camas y hospitalizaciones
//  - insertOne : registro de un nuevo ingreso hospitalario
//  Ejecución:  mongosh --file scripts/02_insertar_datos.js
// =====================================================================

db = db.getSiblingDB("hce_hospitalizacion");

// ---------------------------------------------------------------------
// 1. MÉDICOS
// ---------------------------------------------------------------------
db.medicos.insertMany([
  { _id: "MED-001", nombre: "Laura Restrepo Gómez",    especialidad: "Medicina Interna",  registro_medico: "RM-05-11823", telefono: "3104521187", activo: true },
  { _id: "MED-002", nombre: "Andrés Felipe Zapata",    especialidad: "Cirugía General",   registro_medico: "RM-05-09412", telefono: "3157789012", activo: true },
  { _id: "MED-003", nombre: "Catalina Mejía Arango",   especialidad: "Pediatría",         registro_medico: "RM-05-13377", telefono: "3006654321", activo: true },
  { _id: "MED-004", nombre: "Santiago Ochoa Vélez",    especialidad: "Medicina Crítica",  registro_medico: "RM-05-08860", telefono: "3112290045", activo: true },
  { _id: "MED-005", nombre: "Julián Cardona Ríos",     especialidad: "Neumología",        registro_medico: "RM-05-10254", telefono: "3205531178", activo: true },
  { _id: "MED-006", nombre: "Paula Andrea Giraldo",    especialidad: "Infectología",      registro_medico: "RM-05-12098", telefono: "3168847720", activo: true }
]);

// ---------------------------------------------------------------------
// 2. PACIENTES (municipios de Antioquia)
// ---------------------------------------------------------------------
db.pacientes.insertMany([
  { _id: "PAC-001", documento: { tipo: "CC", numero: "43521876" },   nombres: "María Eugenia", apellidos: "Londoño Pérez",
    fecha_nacimiento: new Date("1958-03-14"), sexo: "F", eps: "SURA",        municipio: "Medellín",
    contacto: { telefono: "3014452210", direccion: "Cra 45 # 52-10, Medellín" }, alergias: ["Penicilina"], activo: true },
  { _id: "PAC-002", documento: { tipo: "CC", numero: "70112345" },   nombres: "Jorge Iván",    apellidos: "Muñoz Castaño",
    fecha_nacimiento: new Date("1951-07-22"), sexo: "M", eps: "Nueva EPS",   municipio: "Bello",
    contacto: { telefono: "3128874401", direccion: "Calle 50 # 48-21, Bello" }, alergias: [], activo: true },
  { _id: "PAC-003", documento: { tipo: "CC", numero: "1036654987" }, nombres: "Daniela",       apellidos: "Herrera Ruiz",
    fecha_nacimiento: new Date("1999-11-05"), sexo: "F", eps: "Sanitas",     municipio: "Itagüí",
    contacto: { telefono: "3009917745", direccion: "Cra 52 # 35-08, Itagüí" }, alergias: [], activo: true },
  { _id: "PAC-004", documento: { tipo: "CC", numero: "71654320" },   nombres: "Carlos Alberto", apellidos: "Ramírez Toro",
    fecha_nacimiento: new Date("1965-01-30"), sexo: "M", eps: "SURA",        municipio: "Envigado",
    contacto: { telefono: "3045563310", direccion: "Calle 38 Sur # 43-15, Envigado" }, alergias: ["Sulfas"], activo: true },
  { _id: "PAC-005", documento: { tipo: "CC", numero: "1040234561" }, nombres: "Yesica Andrea", apellidos: "Valencia Mora",
    fecha_nacimiento: new Date("1994-06-18"), sexo: "F", eps: "Savia Salud", municipio: "Apartadó",
    contacto: { telefono: "3137782290", direccion: "Barrio Ortiz, Apartadó" }, alergias: [], activo: true },
  { _id: "PAC-006", documento: { tipo: "CC", numero: "39187654" },   nombres: "Rosa Elena",    apellidos: "Quintero Gil",
    fecha_nacimiento: new Date("1972-09-09"), sexo: "F", eps: "Salud Total", municipio: "Rionegro",
    contacto: { telefono: "3106678823", direccion: "Cra 50 # 46-30, Rionegro" }, alergias: [], activo: true },
  { _id: "PAC-007", documento: { tipo: "TI", numero: "1033987456" }, nombres: "Samuel",        apellidos: "Ospina Vargas",
    fecha_nacimiento: new Date("2017-04-12"), sexo: "M", eps: "SURA",        municipio: "Sabaneta",
    contacto: { telefono: "3015542098", direccion: "Calle 70 Sur # 45-12, Sabaneta" }, alergias: ["Ibuprofeno"], activo: true },
  { _id: "PAC-008", documento: { tipo: "CC", numero: "8456123" },    nombres: "Luis Fernando", apellidos: "Correa Betancur",
    fecha_nacimiento: new Date("1960-12-03"), sexo: "M", eps: "Nueva EPS",   municipio: "Caucasia",
    contacto: { telefono: "3148890012", direccion: "Barrio El Palmar, Caucasia" }, alergias: [], activo: true },
  { _id: "PAC-009", documento: { tipo: "CC", numero: "1045678912" }, nombres: "Kevin Andrés",  apellidos: "Palacios Moreno",
    fecha_nacimiento: new Date("2001-02-27"), sexo: "M", eps: "Savia Salud", municipio: "Turbo",
    contacto: { telefono: "3216673341", direccion: "Barrio Pueblo Nuevo, Turbo" }, alergias: [], activo: true },
  { _id: "PAC-010", documento: { tipo: "RC", numero: "1036112233" }, nombres: "Valentina",     apellidos: "Arango Ceballos",
    fecha_nacimiento: new Date("2021-08-15"), sexo: "F", eps: "Sanitas",     municipio: "La Ceja",
    contacto: { telefono: "3002214567", direccion: "Calle 20 # 18-40, La Ceja" }, alergias: [], activo: true }
]);

// ---------------------------------------------------------------------
// 3. CAMAS (4 servicios, 12 camas)
// ---------------------------------------------------------------------
db.camas.insertMany([
  { _id: "CAMA-101", servicio: "Medicina Interna", piso: 1, estado: "Ocupada" },
  { _id: "CAMA-102", servicio: "Medicina Interna", piso: 1, estado: "Ocupada" },
  { _id: "CAMA-103", servicio: "Medicina Interna", piso: 1, estado: "Ocupada" },
  { _id: "CAMA-104", servicio: "Medicina Interna", piso: 1, estado: "Ocupada" },
  { _id: "CAMA-201", servicio: "Cirugía",          piso: 2, estado: "Ocupada" },
  { _id: "CAMA-202", servicio: "Cirugía",          piso: 2, estado: "Disponible" },
  { _id: "CAMA-203", servicio: "Cirugía",          piso: 2, estado: "Mantenimiento" },
  { _id: "CAMA-301", servicio: "Pediatría",        piso: 3, estado: "Ocupada" },
  { _id: "CAMA-302", servicio: "Pediatría",        piso: 3, estado: "Disponible" },
  { _id: "CAMA-401", servicio: "UCI",              piso: 4, estado: "Ocupada" },
  { _id: "CAMA-402", servicio: "UCI",              piso: 4, estado: "Disponible" },
  { _id: "CAMA-403", servicio: "UCI",              piso: 4, estado: "Disponible" }
]);

// ---------------------------------------------------------------------
// 4. HOSPITALIZACIONES (documento central con datos embebidos)
// ---------------------------------------------------------------------
db.hospitalizaciones.insertMany([
  { _id: "HOS-0001", paciente_id: "PAC-001", medico_id: "MED-001", cama_id: "CAMA-101", servicio: "Medicina Interna",
    fecha_ingreso: new Date("2026-11-02T08:30:00Z"), fecha_egreso: null, estado: "Activa",
    motivo_ingreso: "Fiebre, tos productiva y dificultad respiratoria de 4 días",
    diagnosticos: [
      { codigo_cie10: "J18.9", descripcion: "Neumonía, no especificada", tipo: "Principal" },
      { codigo_cie10: "I10",   descripcion: "Hipertensión esencial",     tipo: "Secundario" } ],
    evoluciones: [
      { fecha: new Date("2026-11-02T14:00:00Z"), medico_id: "MED-001", nota: "Ingresa con crépitos en base derecha. Se inicia antibiótico.",
        signos_vitales: { presion: "150/90", fc: 102, temperatura: 38.4, spo2: 92 } },
      { fecha: new Date("2026-11-07T09:00:00Z"), medico_id: "MED-001", nota: "Persiste fiebre y desaturación. Se solicita radiografía de control.",
        signos_vitales: { presion: "145/88", fc: 108, temperatura: 38.7, spo2: 90 } } ],
    medicamentos: [
      { nombre: "Ampicilina/Sulbactam", dosis: "3 g",  via: "Intravenosa", frecuencia: "Cada 6 horas", fecha_inicio: new Date("2026-11-02") },
      { nombre: "Acetaminofén",         dosis: "1 g",  via: "Oral",        frecuencia: "Cada 8 horas", fecha_inicio: new Date("2026-11-02") } ],
    eliminado: false },

  { _id: "HOS-0002", paciente_id: "PAC-002", medico_id: "MED-005", cama_id: "CAMA-102", servicio: "Medicina Interna",
    fecha_ingreso: new Date("2026-11-04T10:15:00Z"), fecha_egreso: null, estado: "Activa",
    motivo_ingreso: "Aumento de disnea y expectoración purulenta",
    diagnosticos: [
      { codigo_cie10: "J44.1", descripcion: "EPOC con exacerbación aguda", tipo: "Principal" } ],
    evoluciones: [
      { fecha: new Date("2026-11-04T16:00:00Z"), medico_id: "MED-005", nota: "Sibilancias difusas. Se inician nebulizaciones.",
        signos_vitales: { presion: "130/80", fc: 96, temperatura: 37.0, spo2: 89 } },
      { fecha: new Date("2026-11-07T08:30:00Z"), medico_id: "MED-005", nota: "Mejoría parcial de la disnea, aún requiere oxígeno.",
        signos_vitales: { presion: "128/78", fc: 90, temperatura: 37.2, spo2: 91 } } ],
    medicamentos: [
      { nombre: "Salbutamol",    dosis: "4 puff", via: "Inhalada", frecuencia: "Cada 4 horas",  fecha_inicio: new Date("2026-11-04") },
      { nombre: "Prednisolona",  dosis: "40 mg",  via: "Oral",     frecuencia: "Cada 24 horas", fecha_inicio: new Date("2026-11-04") } ],
    eliminado: false },

  { _id: "HOS-0003", paciente_id: "PAC-003", medico_id: "MED-002", cama_id: "CAMA-201", servicio: "Cirugía",
    fecha_ingreso: new Date("2026-11-05T22:40:00Z"), fecha_egreso: null, estado: "Activa",
    motivo_ingreso: "Dolor abdominal en fosa ilíaca derecha",
    diagnosticos: [
      { codigo_cie10: "K35.8", descripcion: "Apendicitis aguda, otra y la no especificada", tipo: "Principal" } ],
    evoluciones: [
      { fecha: new Date("2026-11-06T07:00:00Z"), medico_id: "MED-002", nota: "Posoperatorio de apendicectomía sin complicaciones.",
        signos_vitales: { presion: "118/72", fc: 84, temperatura: 37.4, spo2: 97 } } ],
    medicamentos: [
      { nombre: "Cefazolina", dosis: "1 g",    via: "Intravenosa", frecuencia: "Cada 8 horas", fecha_inicio: new Date("2026-11-05") },
      { nombre: "Dipirona",   dosis: "2.5 g",  via: "Intravenosa", frecuencia: "Cada 8 horas", fecha_inicio: new Date("2026-11-05") } ],
    eliminado: false },

  { _id: "HOS-0004", paciente_id: "PAC-004", medico_id: "MED-004", cama_id: "CAMA-401", servicio: "UCI",
    fecha_ingreso: new Date("2026-11-03T03:20:00Z"), fecha_egreso: null, estado: "Activa",
    motivo_ingreso: "Hipotensión, fiebre y alteración del estado de conciencia",
    diagnosticos: [
      { codigo_cie10: "A41.9", descripcion: "Sepsis, no especificada",      tipo: "Principal" },
      { codigo_cie10: "N39.0", descripcion: "Infección de vías urinarias",  tipo: "Secundario" } ],
    evoluciones: [
      { fecha: new Date("2026-11-03T06:00:00Z"), medico_id: "MED-004", nota: "Requiere soporte vasopresor. Se toman hemocultivos.",
        signos_vitales: { presion: "85/50", fc: 124, temperatura: 39.1, spo2: 93 } },
      { fecha: new Date("2026-11-07T06:00:00Z"), medico_id: "MED-004", nota: "Disminuye requerimiento vasopresor. Persiste febril.",
        signos_vitales: { presion: "100/62", fc: 110, temperatura: 38.9, spo2: 94 } } ],
    medicamentos: [
      { nombre: "Meropenem",     dosis: "1 g",          via: "Intravenosa", frecuencia: "Cada 8 horas", fecha_inicio: new Date("2026-11-03") },
      { nombre: "Noradrenalina", dosis: "0.1 mcg/kg/min", via: "Intravenosa", frecuencia: "Infusión continua", fecha_inicio: new Date("2026-11-03") } ],
    eliminado: false },

  { _id: "HOS-0005", paciente_id: "PAC-005", medico_id: "MED-006", cama_id: "CAMA-103", servicio: "Medicina Interna",
    fecha_ingreso: new Date("2026-11-06T12:00:00Z"), fecha_egreso: null, estado: "Activa",
    motivo_ingreso: "Fiebre alta, dolor retroocular y petequias",
    diagnosticos: [
      { codigo_cie10: "A91", descripcion: "Fiebre del dengue hemorrágico", tipo: "Principal" } ],
    evoluciones: [
      { fecha: new Date("2026-11-07T10:00:00Z"), medico_id: "MED-006", nota: "Plaquetas en descenso. Hidratación intravenosa.",
        signos_vitales: { presion: "105/65", fc: 98, temperatura: 38.6, spo2: 96 } } ],
    medicamentos: [
      { nombre: "Lactato de Ringer", dosis: "1000 ml", via: "Intravenosa", frecuencia: "Cada 8 horas", fecha_inicio: new Date("2026-11-06") },
      { nombre: "Acetaminofén",      dosis: "1 g",     via: "Oral",        frecuencia: "Cada 8 horas", fecha_inicio: new Date("2026-11-06") } ],
    eliminado: false },

  { _id: "HOS-0006", paciente_id: "PAC-007", medico_id: "MED-003", cama_id: "CAMA-301", servicio: "Pediatría",
    fecha_ingreso: new Date("2026-11-03T18:00:00Z"), fecha_egreso: null, estado: "Activa",
    motivo_ingreso: "Tos, fiebre y tirajes subcostales",
    diagnosticos: [
      { codigo_cie10: "J18.9", descripcion: "Neumonía, no especificada", tipo: "Principal" } ],
    evoluciones: [
      { fecha: new Date("2026-11-07T08:00:00Z"), medico_id: "MED-003", nota: "Afebril hace 48 horas, buena tolerancia oral.",
        signos_vitales: { presion: "100/60", fc: 92, temperatura: 36.8, spo2: 97 } } ],
    medicamentos: [
      { nombre: "Amoxicilina", dosis: "500 mg", via: "Oral", frecuencia: "Cada 8 horas", fecha_inicio: new Date("2026-11-03") } ],
    eliminado: false },

  { _id: "HOS-0007", paciente_id: "PAC-008", medico_id: "MED-001", cama_id: "CAMA-104", servicio: "Medicina Interna",
    fecha_ingreso: new Date("2026-11-07T07:45:00Z"), fecha_egreso: null, estado: "Activa",
    motivo_ingreso: "Hiperglucemia sostenida y poliuria",
    diagnosticos: [
      { codigo_cie10: "E11.9", descripcion: "Diabetes mellitus tipo 2 sin complicaciones", tipo: "Principal" },
      { codigo_cie10: "I10",   descripcion: "Hipertensión esencial",                     tipo: "Secundario" } ],
    evoluciones: [
      { fecha: new Date("2026-11-07T15:00:00Z"), medico_id: "MED-001", nota: "Glucometrías en descenso con esquema de insulina.",
        signos_vitales: { presion: "138/86", fc: 80, temperatura: 36.9, spo2: 97 } } ],
    medicamentos: [
      { nombre: "Insulina glargina", dosis: "20 UI", via: "Subcutánea", frecuencia: "Cada 24 horas", fecha_inicio: new Date("2026-11-07") },
      { nombre: "Losartán",          dosis: "50 mg", via: "Oral",       frecuencia: "Cada 12 horas", fecha_inicio: new Date("2026-11-07") } ],
    eliminado: false },

  // ---- Hospitalizaciones ya egresadas (historial) ----
  { _id: "HOS-0008", paciente_id: "PAC-006", medico_id: "MED-002", cama_id: "CAMA-202", servicio: "Cirugía",
    fecha_ingreso: new Date("2026-10-20T09:00:00Z"), fecha_egreso: new Date("2026-10-25T11:00:00Z"), estado: "Egresada",
    motivo_ingreso: "Cólico biliar recurrente",
    diagnosticos: [ { codigo_cie10: "K80.2", descripcion: "Cálculo de la vesícula biliar sin colecistitis", tipo: "Principal" } ],
    evoluciones: [
      { fecha: new Date("2026-10-24T08:00:00Z"), medico_id: "MED-002", nota: "Colecistectomía laparoscópica exitosa.",
        signos_vitales: { presion: "120/75", fc: 76, temperatura: 36.7, spo2: 98 } } ],
    medicamentos: [ { nombre: "Tramadol", dosis: "50 mg", via: "Oral", frecuencia: "Cada 8 horas", fecha_inicio: new Date("2026-10-24") } ],
    eliminado: false },

  { _id: "HOS-0009", paciente_id: "PAC-009", medico_id: "MED-006", cama_id: "CAMA-101", servicio: "Medicina Interna",
    fecha_ingreso: new Date("2026-10-12T14:00:00Z"), fecha_egreso: new Date("2026-10-18T10:00:00Z"), estado: "Egresada",
    motivo_ingreso: "Fiebre y dolor osteomuscular intenso",
    diagnosticos: [ { codigo_cie10: "A91", descripcion: "Fiebre del dengue hemorrágico", tipo: "Principal" } ],
    evoluciones: [
      { fecha: new Date("2026-10-17T09:00:00Z"), medico_id: "MED-006", nota: "Recuperación de plaquetas. Apto para egreso.",
        signos_vitales: { presion: "115/70", fc: 78, temperatura: 36.8, spo2: 98 } } ],
    medicamentos: [ { nombre: "Acetaminofén", dosis: "1 g", via: "Oral", frecuencia: "Cada 8 horas", fecha_inicio: new Date("2026-10-12") } ],
    eliminado: false },

  { _id: "HOS-0010", paciente_id: "PAC-010", medico_id: "MED-003", cama_id: "CAMA-302", servicio: "Pediatría",
    fecha_ingreso: new Date("2026-10-28T20:00:00Z"), fecha_egreso: new Date("2026-10-31T12:00:00Z"), estado: "Egresada",
    motivo_ingreso: "Fiebre y dificultad respiratoria",
    diagnosticos: [ { codigo_cie10: "J18.9", descripcion: "Neumonía, no especificada", tipo: "Principal" } ],
    evoluciones: [
      { fecha: new Date("2026-10-30T08:00:00Z"), medico_id: "MED-003", nota: "Mejoría clínica, sin requerimiento de oxígeno.",
        signos_vitales: { presion: "95/60", fc: 110, temperatura: 37.0, spo2: 97 } } ],
    medicamentos: [ { nombre: "Amoxicilina", dosis: "250 mg", via: "Oral", frecuencia: "Cada 8 horas", fecha_inicio: new Date("2026-10-28") } ],
    eliminado: false },

  { _id: "HOS-0011", paciente_id: "PAC-001", medico_id: "MED-001", cama_id: "CAMA-102", servicio: "Medicina Interna",
    fecha_ingreso: new Date("2026-09-10T11:00:00Z"), fecha_egreso: new Date("2026-09-14T09:00:00Z"), estado: "Egresada",
    motivo_ingreso: "Cefalea intensa y cifras tensionales elevadas",
    diagnosticos: [ { codigo_cie10: "I10", descripcion: "Hipertensión esencial", tipo: "Principal" } ],
    evoluciones: [
      { fecha: new Date("2026-09-13T08:00:00Z"), medico_id: "MED-001", nota: "Control de cifras tensionales con ajuste de tratamiento.",
        signos_vitales: { presion: "135/85", fc: 74, temperatura: 36.6, spo2: 97 } } ],
    medicamentos: [ { nombre: "Losartán", dosis: "50 mg", via: "Oral", frecuencia: "Cada 12 horas", fecha_inicio: new Date("2026-09-10") } ],
    eliminado: false }
]);

// ---------------------------------------------------------------------
// 5. insertOne: NUEVO INGRESO (paciente nuevo que llega a UCI)
// ---------------------------------------------------------------------
db.pacientes.insertOne({
  _id: "PAC-011", documento: { tipo: "CC", numero: "15432876" }, nombres: "Hernán Darío", apellidos: "Úsuga Montoya",
  fecha_nacimiento: new Date("1955-05-19"), sexo: "M", eps: "Nueva EPS", municipio: "Rionegro",
  contacto: { telefono: "3176654490", direccion: "Vereda Cabeceras, Rionegro" }, alergias: [], activo: true
});

db.hospitalizaciones.insertOne({
  _id: "HOS-0012", paciente_id: "PAC-011", medico_id: "MED-004", cama_id: "CAMA-402", servicio: "UCI",
  fecha_ingreso: new Date("2026-11-08T05:30:00Z"), fecha_egreso: null, estado: "Activa",
  motivo_ingreso: "Dolor torácico opresivo de 2 horas de evolución",
  diagnosticos: [ { codigo_cie10: "I21.9", descripcion: "Infarto agudo de miocardio, sin otra especificación", tipo: "Principal" } ],
  evoluciones: [
    { fecha: new Date("2026-11-08T06:00:00Z"), medico_id: "MED-004", nota: "Elevación del ST en cara inferior. Se activa protocolo de reperfusión.",
      signos_vitales: { presion: "160/95", fc: 112, temperatura: 36.9, spo2: 91 } } ],
  medicamentos: [
    { nombre: "Ácido acetilsalicílico", dosis: "300 mg", via: "Oral",        frecuencia: "Dosis única",    fecha_inicio: new Date("2026-11-08") },
    { nombre: "Enoxaparina",            dosis: "80 mg",  via: "Subcutánea",  frecuencia: "Cada 12 horas",  fecha_inicio: new Date("2026-11-08") } ],
  eliminado: false
});

// ---------------------------------------------------------------------
// 6. VERIFICACIÓN DE LA CARGA
// ---------------------------------------------------------------------
print("Datos insertados:");
print("  medicos           : " + db.medicos.countDocuments());
print("  pacientes         : " + db.pacientes.countDocuments());
print("  camas             : " + db.camas.countDocuments());
print("  hospitalizaciones : " + db.hospitalizaciones.countDocuments());
