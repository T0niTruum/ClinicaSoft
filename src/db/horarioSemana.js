/** Franjas horarias: 8–12 (4) y 14–17 (3) = 7 citas de 1 hora por día */
export const DAILY_SLOT_HOURS = [8, 9, 10, 11, 14, 15, 16];

export function setTime(date, hours, minutes = 0) {
  const n = new Date(date);
  n.setHours(hours, minutes, 0, 0);
  return n;
}

export function addDays(date, days) {
  const n = new Date(date);
  n.setDate(n.getDate() + days);
  return n;
}

/** Lunes de la semana calendaria que contiene `date` */
export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(weekStart) {
  return addDays(weekStart, 6);
}

export function buildHorariosSemana(weekStart, medicoId) {
  const horarios = [];
  for (let day = 0; day < 7; day += 1) {
    const fecha = addDays(weekStart, day);
    for (const hour of DAILY_SLOT_HOURS) {
      const horaInicio = setTime(fecha, hour, 0);
      const horaFin = setTime(fecha, hour + 1, 0);
      horarios.push({
        fecha,
        horaInicio,
        horaFin,
        disponible: true,
        medicoId,
      });
    }
  }
  return horarios;
}

export async function insertHorarios(client, horarios) {
  for (const horario of horarios) {
    await client.query(
      `INSERT INTO horario (fecha, hora_inicio, hora_fin, disponible, medico_id)
       VALUES ($1::date, $2, $3, $4, $5)`,
      [
        horario.fecha.toISOString().slice(0, 10),
        horario.horaInicio.toISOString(),
        horario.horaFin.toISOString(),
        horario.disponible,
        horario.medicoId,
      ]
    );
  }
}

/**
 * Elimina horarios libres de la semana (sin cita) y crea 7 franjas/día por médico.
 */
export async function seedHorariosSemanaActual(client, referenceDate = new Date()) {
  const weekStart = startOfWeek(referenceDate);
  const weekEnd = endOfWeek(weekStart);

  const medicos = await client.query('SELECT id FROM medico WHERE disponibilidad = true');
  if (medicos.rowCount === 0) {
    console.log('No hay médicos disponibles para asignar horarios.');
    return { inserted: 0, medicos: 0 };
  }

  await client.query(
    `DELETE FROM horario h
     WHERE h.disponible = true
       AND NOT EXISTS (SELECT 1 FROM cita c WHERE c.horario_id = h.id)
       AND h.fecha >= $1::date
       AND h.fecha <= $2::date`,
    [weekStart.toISOString().slice(0, 10), weekEnd.toISOString().slice(0, 10)]
  );

  let inserted = 0;
  for (const medico of medicos.rows) {
    const horarios = buildHorariosSemana(weekStart, medico.id);
    await insertHorarios(client, horarios);
    inserted += horarios.length;
  }

  return { inserted, medicos: medicos.rowCount, weekStart, weekEnd };
}
