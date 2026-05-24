import fs from 'fs/promises';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { pool } from './postgres.js';

dotenv.config();

function setTime(date, hours, minutes) {
  const n = new Date(date);
  n.setHours(hours, minutes, 0, 0);
  return n;
}

function addDays(date, days) {
  const n = new Date(date);
  n.setDate(n.getDate() + days);
  return n;
}

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

    const now = new Date();
    const horarios1 = [
      { fecha: addDays(now, 1), horaInicio: setTime(addDays(now, 1), 9, 0), horaFin: setTime(addDays(now, 1), 9, 30), disponible: true },
      { fecha: addDays(now, 2), horaInicio: setTime(addDays(now, 2), 10, 0), horaFin: setTime(addDays(now, 2), 10, 30), disponible: true },
      { fecha: addDays(now, 3), horaInicio: setTime(addDays(now, 3), 11, 0), horaFin: setTime(addDays(now, 3), 11, 30), disponible: true },
      { fecha: addDays(now, 4), horaInicio: setTime(addDays(now, 4), 14, 0), horaFin: setTime(addDays(now, 4), 14, 30), disponible: true },
      { fecha: addDays(now, -3), horaInicio: setTime(addDays(now, -3), 8, 0), horaFin: setTime(addDays(now, -3), 8, 30), disponible: false }
    ];

    for (const horario of horarios1) {
      await client.query(
        'INSERT INTO horario (fecha, hora_inicio, hora_fin, disponible, medico_id) VALUES ($1, $2, $3, $4, $5)',
        [horario.fecha.toISOString(), horario.horaInicio.toISOString(), horario.horaFin.toISOString(), horario.disponible, personaMed1.rows[0].id]
      );
    }

    const horarios2 = [
      { fecha: addDays(now, 1), horaInicio: setTime(addDays(now, 1), 15, 0), horaFin: setTime(addDays(now, 1), 15, 30), disponible: true },
      { fecha: addDays(now, 5), horaInicio: setTime(addDays(now, 5), 9, 0), horaFin: setTime(addDays(now, 5), 9, 30), disponible: true },
      { fecha: addDays(now, 6), horaInicio: setTime(addDays(now, 6), 10, 0), horaFin: setTime(addDays(now, 6), 10, 30), disponible: true },
      { fecha: addDays(now, -1), horaInicio: setTime(addDays(now, -1), 12, 0), horaFin: setTime(addDays(now, -1), 12, 30), disponible: false }
    ];

    for (const horario of horarios2) {
      await client.query(
        'INSERT INTO horario (fecha, hora_inicio, hora_fin, disponible, medico_id) VALUES ($1, $2, $3, $4, $5)',
        [horario.fecha.toISOString(), horario.horaInicio.toISOString(), horario.horaFin.toISOString(), horario.disponible, personaMed2.rows[0].id]
      );
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
