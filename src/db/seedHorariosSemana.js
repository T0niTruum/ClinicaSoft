import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { pool } from './postgres.js';
import { seedHorariosSemanaActual } from './horarioSemana.js';

dotenv.config();

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await seedHorariosSemanaActual(client);
    await client.query('COMMIT');
    const from = result.weekStart.toISOString().slice(0, 10);
    const to = result.weekEnd.toISOString().slice(0, 10);
    console.log(
      `Horarios de la semana (${from} a ${to}): ${result.inserted} franjas insertadas para ${result.medicos} médico(s).`
    );
    console.log('Franjas diarias: 08:00, 09:00, 10:00, 11:00, 14:00, 15:00, 16:00 (1 hora cada una).');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al generar horarios:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main();
}
