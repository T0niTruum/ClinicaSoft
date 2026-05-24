import { ValidationError } from '../errors/index.js';
import { CitaService } from '../services/citaService.js';
import { EspecialidadService } from '../services/especialidadService.js';
import { MedicoService } from '../services/medicoService.js';
import { PacienteService } from '../services/pacienteService.js';
import { validateAgendamiento } from '../validators/agendamientoValidator.js';

const getFormData = (req) => ({
  tipoDocumento: req.body.tipoDocumento || req.query.tipoDocumento || '',
  documento: req.body.documento || req.query.documento || '',
  medicoId: req.body.medicoId || '',
  horarioId: req.body.horarioId || '',
  motivo: req.body.motivo || '',
});

export const buscarPacienteHandler = async (req, res) => {
  const { tipoDocumento, documento } = getFormData(req);

  if (!tipoDocumento || !documento) {
    return res.respond({
      success: false,
      message: 'Tipo de documento y documento son obligatorios para buscar un paciente.',
      errors: [
        { field: 'tipoDocumento', message: 'El tipo de documento es obligatorio.' },
        { field: 'documento', message: 'El documento es obligatorio.' },
      ],
      data: { form: { tipoDocumento, documento } },
      view: 'agendamientoForm',
      status: 400,
    });
  }

  const paciente = await PacienteService.findPacientePorDocumento(tipoDocumento, documento);
  if (!paciente) {
    const message = 'Paciente no registrado en el sistema';
    if (req.xhr || req.query.format === 'json') {
      return res.respond({ success: false, message, data: {}, status: 404 });
    }

    req.flash('warning', message);
    return res.redirect('/pacientes/nuevo');
  }

  if (paciente.paciente.estadoPaciente !== 'ACTIVO') {
    throw new ValidationError('El paciente se encuentra inactivo en el sistema y no está autorizado para agendar citas');
  }

  const [especialidades, medicos] = await Promise.all([
    EspecialidadService.listActiveEspecialidades(),
    MedicoService.listMedicosDisponibles(),
  ]);

  return res.respond({
    success: true,
    message: 'Paciente válido para agendar citas',
    data: {
      paciente: {
        ...paciente.get({ plain: true }),
        paciente: paciente.paciente.get({ plain: true }),
      },
      especialidades,
      medicos,
    },
    view: 'agendamientoForm',
    locals: {
      form: getFormData(req),
      paciente: paciente.get({ plain: true }),
      especialidades,
      medicos,
    },
  });
};

export const listarEspecialidadesYMedicosHandler = async (req, res) => {
  const especialidadId = req.query.especialidadId || null;
  const [especialidades, medicos] = await Promise.all([
    EspecialidadService.listActiveEspecialidades(),
    MedicoService.listMedicosDisponibles(especialidadId),
  ]);

  return res.respond({
    success: true,
    message: 'Especialidades y médicos disponibles',
    data: { especialidades, medicos },
    view: 'especialidades',
    locals: { especialidades, medicos, selectedEspecialidad: especialidadId },
  });
};

export const confirmarAgendamientoHandler = async (req, res) => {
  const form = getFormData(req);

  validateAgendamiento(form);

  try {
    const cita = await CitaService.agendarCita(form);

    if (req.xhr || req.query.format === 'json') {
      return res.respond({
        success: true,
        message: 'Cita agendada correctamente',
        data: cita,
        status: 201,
      });
    }

    req.flash('success', 'Cita agendada correctamente');
    return res.redirect('/dashboard');
  } catch (error) {
    if (error instanceof ValidationError) {
      const errors = error.errors || [{ message: error.message }];
      return res.respond({
        success: false,
        message: error.message,
        errors,
        data: { form },
        view: 'agendamientoForm',
        locals: { form, errors },
        status: error.statusCode || 400,
      });
    }

    throw error;
  }
};