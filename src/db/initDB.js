import fs from 'fs/promises';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { pool } from './postgres.js';
import { buildHorariosSemana, insertHorarios, startOfWeek } from './horarioSemana.js';

dotenv.config();

async function executeSqlSchema() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const sqlPath = path.join(__dirname, '../../prisma/schema.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');
  console.log(`Executing schema.sql from ${sqlPath}`);
  await pool.query(sql);
}

async function seed() {
  const countResult = await pool.query('SELECT COUNT(*) AS count FROM especialidad');
  const currentCount = parseInt(countResult.rows[0].count, 10);
  if (currentCount > 0) {
    console.log('Seed appears already applied. Skipping.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const esp1 = await client.query(
      'INSERT INTO especialidad (nombre, descripcion, disponibilidad) VALUES ($1, $2, $3) RETURNING id',
      ['Cardiología', 'Atención cardiovascular', true]
    );
    const esp2 = await client.query(
      'INSERT INTO especialidad (nombre, descripcion, disponibilidad) VALUES ($1, $2, $3) RETURNING id',
      ['Pediatría', 'Atención pediátrica', true]
    );
    const esp3 = await client.query(
      'INSERT INTO especialidad (nombre, descripcion, disponibilidad) VALUES ($1, $2, $3) RETURNING id',
      ['Dermatología', 'Cuidado de la piel', false]
    );

    const personaMed1 = await client.query(
      'INSERT INTO persona (nombre, apellido, tipo_documento, documento, email, telefono) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['Juan', 'Silva', 'CC', '8001001', 'juan.silva@clinicallano.com', '3001001001']
    );
    await client.query(
      'INSERT INTO medico (id, tarjeta_profesional, disponibilidad, especialidad_id) VALUES ($1, $2, $3, $4)',
      [personaMed1.rows[0].id, 'TP-1001', true, esp1.rows[0].id]
    );

    const personaMed2 = await client.query(
      'INSERT INTO persona (nombre, apellido, tipo_documento, documento, email, telefono) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['Laura', 'Martinez', 'CC', '8001002', 'laura.martinez@clinicallano.com', '3002002002']
    );
    await client.query(
      'INSERT INTO medico (id, tarjeta_profesional, disponibilidad, especialidad_id) VALUES ($1, $2, $3, $4)',
      [personaMed2.rows[0].id, 'TP-1002', true, esp2.rows[0].id]
    );

    const weekStart = startOfWeek(new Date());
    const medicoIds = [personaMed1.rows[0].id, personaMed2.rows[0].id];
    for (const medicoId of medicoIds) {
      await insertHorarios(client, buildHorariosSemana(weekStart, medicoId));
    }

    const personaPac1 = await client.query(
      'INSERT INTO persona (nombre, apellido, tipo_documento, documento, email, telefono) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['Carlos', 'Pérez', 'CC', '9002001', 'carlos.perez@example.com', '3105005001']
    );
    await client.query(
      'INSERT INTO paciente (id, fecha_nacimiento, estado_civil, estado_paciente) VALUES ($1, $2, $3, $4)',
      [personaPac1.rows[0].id, '1990-04-15', 'Soltero', 'ACTIVO']
    );

    const personaPac2 = await client.query(
      'INSERT INTO persona (nombre, apellido, tipo_documento, documento, email, telefono) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['María', 'Ruiz', 'CC', '9002002', 'maria.ruiz@example.com', '3105005002']
    );
    await client.query(
      'INSERT INTO paciente (id, fecha_nacimiento, estado_civil, estado_paciente) VALUES ($1, $2, $3, $4)',
      [personaPac2.rows[0].id, '1985-09-20', 'Casada', 'INACTIVO']
    );

    const horariosCitas = await client.query(
      `SELECT h.id, h.medico_id, h.hora_inicio, h.disponible
       FROM horario h
       WHERE h.medico_id IN ($1, $2)
       ORDER BY h.hora_inicio ASC
       LIMIT 4`,
      [personaMed1.rows[0].id, personaMed2.rows[0].id]
    );

    const citasDemo = [
      { horarioIdx: 0, motivo: 'Control de arritmia y revisión de marcapasos.', estado: 'FINALIZADO' },
      { horarioIdx: 1, motivo: 'Consulta por dolor torácico leve y antecedentes.', estado: 'CANCELADO' },
      { horarioIdx: 2, motivo: 'Control de rutina y solicitud de exámenes.', estado: 'ASIGNADO' },
    ];

    for (const demo of citasDemo) {
      const horario = horariosCitas.rows[demo.horarioIdx];
      if (!horario) continue;
      await client.query(
        `INSERT INTO cita (paciente_id, medico_id, horario_id, motivo, estado, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, now())`,
        [personaPac1.rows[0].id, horario.medico_id, horario.id, demo.motivo, demo.estado]
      );
      if (demo.estado !== 'CANCELADO') {
        await client.query('UPDATE horario SET disponible = false WHERE id = $1', [horario.id]);
      }
    }

    await client.query('COMMIT');
    console.log('Seed data inserted successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function initDB() {
  try {
    await executeSqlSchema();
    await seed();
    console.log('Database initialized and seeded successfully.');
  } catch (err) {
    console.error('Error during initDB:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run when executed directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  initDB();
}

export { initDB };
