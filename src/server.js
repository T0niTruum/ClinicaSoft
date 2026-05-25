import path from 'path';
import express from 'express';
import dotenv from 'dotenv';

import pacientesApiRouter from './routes/pacientes.js';
import pacienteCrudRouter from './routes/pacienteCrud.js';
import medicosRouter from './routes/medicos.js';
import citasRouter from './routes/citas.js';
import healthRouter from './routes/health.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/health', healthRouter);
app.use('/api/pacientes', pacientesApiRouter);
app.use('/pacientes', pacienteCrudRouter);
app.use('/api/medicos', medicosRouter);
app.use('/api/citas', citasRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`ClinicaDelLlano backend listening on port ${PORT}`);
});

export default app;
