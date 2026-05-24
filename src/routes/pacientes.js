import express from 'express';
import { pool } from '../db/postgres.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pa.id,
        p.nombre,
        p.apellido,
        p.tipo_documento AS "tipoDocumento",
        p.documento,
        p.email,
        p.telefono,
        pa.fecha_nacimiento AS "fechaNacimiento",
        pa.estado_civil AS "estadoCivil",
        pa.estado_paciente AS "estadoPaciente"
      FROM paciente pa
      JOIN persona p ON p.id = pa.id
      ORDER BY p.apellido, p.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT
        pa.id,
        p.nombre,
        p.apellido,
        p.tipo_documento AS "tipoDocumento",
        p.documento,
        p.email,
        p.telefono,
        pa.fecha_nacimiento AS "fechaNacimiento",
        pa.estado_civil AS "estadoCivil",
        pa.estado_paciente AS "estadoPaciente"
      FROM paciente pa
      JOIN persona p ON p.id = pa.id
      WHERE pa.id = $1
    `, [id]);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Paciente no encontrado' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
