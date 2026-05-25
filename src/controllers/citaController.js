import { ValidationError } from '../errors/index.js';
import { CitaService } from '../services/citaService.js';
import { EspecialidadService } from '../services/especialidadService.js';
import { MedicoService } from '../services/medicoService.js';

const parsePagination = (req) => ({
  page: Math.max(parseInt(req.query.page, 10) || 1, 1),
  pageSize: Math.min(Math.max(parseInt(req.query.pageSize, 10) || 10, 1), 50),
});

const parseHistorialFilters = (req) => ({
  pacienteId: req.query.pacienteId || '',
  especialidadId: req.query.especialidadId || '',
  medicoId: req.query.medicoId || '',
  fechaDesde: req.query.fechaDesde || '',
  fechaHasta: req.query.fechaHasta || '',
  estado: req.query.estado || '',
});

export const renderHistorialCitas = async (req, res) => {
  const pacienteId = req.query.pacienteId || '';
  let paciente = null;

  if (pacienteId) {
    try {
      paciente = await CitaService.obtenerPacienteResumen(pacienteId);
    } catch {
      paciente = null;
    }
  }

  return res.respond({
    success: true,
    message: 'Historial de citas médicas',
    view: 'citas',
    locals: {
      activePage: 'citas',
      pacienteId,
      paciente,
    },
  });
};

export const listarHistorialCitasHandler = async (req, res) => {
  const filters = parseHistorialFilters(req);
  const pagination = parsePagination(req);

  const historial = await CitaService.listarHistorial(filters, pagination);

  return res.respond({
    success: true,
    message: 'Historial de citas cargado',
    data: historial,
  });
};

export const listarFiltrosCitasHandler = async (req, res) => {
  const [especialidades, medicos] = await Promise.all([
    EspecialidadService.listActiveEspecialidades(),
    MedicoService.listMedicosDisponibles(req.query.especialidadId || null),
  ]);

  return res.respond({
    success: true,
    message: 'Filtros disponibles',
    data: {
      especialidades: especialidades.map((e) => e.get({ plain: true })),
      medicos: medicos.map((m) => {
        const plain = m.get({ plain: true });
        return {
          id: plain.id,
          nombre: plain.persona ? `Dr. ${plain.persona.nombre} ${plain.persona.apellido}` : 'Médico',
          especialidadId: plain.especialidadId,
        };
      }),
    },
  });
};

export const actualizarEstadoCitaHandler = async (req, res) => {
  const { estado } = req.body;
  if (!estado) throw new ValidationError('El estado es obligatorio.');

  const cita = await CitaService.actualizarEstado(req.params.id, estado);

  return res.respond({
    success: true,
    message: 'Estado de la cita actualizado',
    data: cita,
  });
};
