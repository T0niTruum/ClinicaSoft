import path from 'path';
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';

import pacientesApiRouter from './routes/pacientes.js';
import pacienteCrudRouter from './routes/pacienteCrud.js';
import agendamientoRouter from './routes/agendamiento.js';
import medicosRouter from './routes/medicos.js';
import horariosRouter from './routes/horarios.js';
import citasApiRouter from './routes/citas.js';
import citasPageRouter from './routes/citasPage.js';
import healthRouter from './routes/health.js';
import { hybridResponder } from './middlewares/responseMiddleware.js';
import { flashMiddleware } from './middlewares/flashMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
app.set('views', path.join(process.cwd(), 'src', 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'clinicasoft-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));
app.use(flashMiddleware);
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(hybridResponder);

app.use('/health', healthRouter);
app.use('/api/pacientes', pacientesApiRouter);
app.use('/pacientes', pacienteCrudRouter);
app.use('/agendar-cita', agendamientoRouter);
app.use('/api/medicos', medicosRouter);
app.use('/api/horarios', horariosRouter);
app.use('/citas', citasPageRouter);
app.use('/api/citas', citasApiRouter);

app.get('/', (req, res) => res.redirect('/pacientes'));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const terminalLink = (text, url) => `\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007`;

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`ClinicaDelLlano backend listening on port ${PORT}`);
  console.log(`  → ${terminalLink(url, url)}`);
});

export default app;
