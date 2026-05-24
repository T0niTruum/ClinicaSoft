import express from 'express';
import { pool } from '../db/postgres.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.motivo,
        c.estado,
        c.fecha_creacion AS "fechaCreacion",
        c.paciente_id AS "pacienteId",
        p.nombre AS "pacienteNombre",
        p.apellido AS "pacienteApellido",
        c.medico_id AS "medicoId",
        mp.nombre AS "medicoNombre",
        mp.apellido AS "medicoApellido",
        c.horario_id AS "horarioId",
        h.fecha,
        h.hora_inicio AS "horaInicio",
        h.hora_fin AS "horaFin"
      FROM cita c
      JOIN paciente pc ON pc.id = c.paciente_id
      JOIN persona p ON p.id = pc.id
      JOIN medico m ON m.id = c.medico_id
      JOIN persona mp ON mp.id = m.id
      JOIN horario h ON h.id = c.horario_id
      ORDER BY c.fecha_creacion DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const { pacienteId, medicoId, horarioId, motivo } = req.body;
  const client = await pool.connect();

  try {
    const pacienteResult = await client.query('SELECT estado_paciente FROM paciente WHERE id = $1', [pacienteId]);
    if (pacienteResult.rowCount === 0) return res.status(400).json({ error: 'Paciente no existe' });
    if (pacienteResult.rows[0].estado_paciente !== 'ACTIVO') return res.status(400).json({ error: 'Paciente no activo' });

    await client.query('BEGIN');
    const horarioResult = await client.query('SELECT medico_id, disponible, hora_inicio FROM horario WHERE id = $1 FOR UPDATE', [horarioId]);
    if (horarioResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Horario no existe' });
    }

    const horario = horarioResult.rows[0];
    if (!horario.disponible) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Horario no disponible' });
    }
    if (horario.medico_id !== medicoId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Horario no corresponde al médico' });
    }
    if (new Date(horario.hora_inicio) <= new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No se pueden agendar citas en fechas pasadas' });
    }

    const updateResult = await client.query('UPDATE horario SET disponible = false WHERE id = $1 AND disponible = true', [horarioId]);
    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El horario seleccionado ya no está disponible' });
    }

    const insertResult = await client.query(
      `INSERT INTO cita (id, paciente_id, medico_id, horario_id, motivo, estado, fecha_creacion)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ASIGNADO', now())
       RETURNING *`,
      [pacienteId, medicoId, horarioId, motivo]
    );

    await client.query('COMMIT');
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

export default router;
