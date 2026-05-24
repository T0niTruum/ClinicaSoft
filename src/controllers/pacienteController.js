import { ValidationError } from '../errors/index.js';
import { PacienteService } from '../services/pacienteService.js';
import { validatePacienteCreation, validatePacienteUpdate } from '../validators/pacienteValidator.js';

export const listarPacientes = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 15;
  const filters = {
    estadoPaciente: req.query.estado || undefined,
    documento: req.query.documento || undefined,
  };

  const pacientes = await PacienteService.listPacientes(filters, { page, pageSize });

  return res.respond({
    success: true,
    message: 'Listado de pacientes',
    data: {
      items: pacientes.rows,
      total: pacientes.count,
      page,
      pageSize,
    },
    view: 'pacienteList',
    locals: {
      pacientes: pacientes.rows,
      pagination: {
        total: pacientes.count,
        page,
        pageSize,
      },
      filters,
    },
  });
};

export const renderCrearPaciente = async (req, res) => {
  return res.respond({
    success: true,
    message: 'Crear nuevo paciente',
    data: {},
    view: 'pacienteForm',
    locals: { paciente: {} },
  });
};

export const crearPaciente = async (req, res) => {
  const payload = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    tipoDocumento: req.body.tipoDocumento,
    documento: req.body.documento,
    email: req.body.email,
    telefono: req.body.telefono,
    fechaNacimiento: req.body.fechaNacimiento,
    estadoCivil: req.body.estadoCivil,
  };

  try {
    validatePacienteCreation(payload);
    const nuevoPaciente = await PacienteService.createPaciente(payload);

    if (req.xhr || req.query.format === 'json') {
      return res.respond({
        success: true,
        message: 'Paciente creado exitosamente',
        data: nuevoPaciente,
        status: 201,
      });
    }

    req.flash('success', 'Paciente creado correctamente');
    return res.redirect(`/pacientes/${nuevoPaciente.paciente.id}/editar`);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.respond({
        success: false,
        message: error.message,
        errors: error.errors || [{ message: error.message }],
        data: { paciente: payload },
        view: 'pacienteForm',
        locals: { paciente: { persona: payload } },
        status: error.statusCode || 400,
      });
    }
    throw error;
  }
};

export const renderEditarPaciente = async (req, res) => {
  const paciente = await PacienteService.findPacienteById(req.params.id);
  if (!paciente) {
    throw new ValidationError('Paciente no encontrado para edición.');
  }

  const pacienteJson = paciente.get ? paciente.get({ plain: true }) : paciente;

  return res.respond({
    success: true,
    message: 'Editar paciente',
    data: pacienteJson,
    view: 'pacienteForm',
    locals: { paciente: pacienteJson },
  });
};

export const editarPaciente = async (req, res) => {
  try {
    validatePacienteUpdate(req.body);
    const updated = await PacienteService.updatePaciente(req.params.id, {
      email: req.body.email,
      telefono: req.body.telefono,
      estadoCivil: req.body.estadoCivil,
    });

    if (req.xhr || req.query.format === 'json') {
      return res.respond({
        success: true,
        message: 'Paciente actualizado correctamente',
        data: updated,
      });
    }

    req.flash('success', 'Paciente actualizado correctamente');
    return res.redirect('/pacientes');
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.respond({
        success: false,
        message: error.message,
        errors: error.errors || [{ message: error.message }],
        data: { paciente: { persona: { ...req.body }, id: req.params.id } },
        view: 'pacienteForm',
        locals: { paciente: { persona: { ...req.body }, id: req.params.id } },
        status: error.statusCode || 400,
      });
    }
    throw error;
  }
};

export const inactivarPacientePOST = async (req, res) => {
  const paciente = await PacienteService.inactivatePaciente(req.params.id);

  if (req.xhr || req.query.format === 'json') {
    return res.respond({
      success: true,
      message: 'Paciente inactivado correctamente',
      data: paciente,
    });
  }

  req.flash('success', 'Paciente inactivado correctamente');
  return res.redirect('/pacientes');
};