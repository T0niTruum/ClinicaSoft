import express from 'express';
import { pool } from '../db/postgres.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        p.nombre,
        p.apellido,
        p.tipo_documento AS "tipoDocumento",
        p.documento,
        p.email,
        p.telefono,
        m.tarjeta_profesional AS "tarjetaProfesional",
        m.disponibilidad,
        m.especialidad_id AS "especialidadId",
        e.nombre AS "especialidadNombre",
        e.descripcion AS "especialidadDescripcion",
        e.disponibilidad AS "especialidadDisponible"
      FROM medico m
      JOIN persona p ON p.id = m.id
      JOIN especialidad e ON e.id = m.especialidad_id
      ORDER BY p.apellido, p.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/:id/horarios', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, fecha, hora_inicio AS "horaInicio", hora_fin AS "horaFin", disponible, medico_id AS "medicoId"
       FROM horario
       WHERE medico_id = $1
       ORDER BY fecha ASC, hora_inicio ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
