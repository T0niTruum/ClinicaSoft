import express from 'express';
import dotenv from 'dotenv';

import pacientesRouter from './routes/pacientes.js';
import medicosRouter from './routes/medicos.js';
import citasRouter from './routes/citas.js';
import healthRouter from './routes/health.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/health', healthRouter);
app.use('/pacientes', pacientesRouter);
app.use('/medicos', medicosRouter);
app.use('/citas', citasRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`ClinicaDelLlano backend listening on port ${PORT}`);
});

export default app;
