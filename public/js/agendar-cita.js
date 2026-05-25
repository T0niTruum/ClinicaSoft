function agendarCita() {
  return {
    step: 0,
    steps: ['Verificar Paciente', 'Especialidad', 'Médico', 'Horario'],
    form: {
      tipoDocumento: '',
      documento: '',
      especialidadId: '',
      medicoId: '',
      horarioId: '',
      motivo: '',
    },
    patient: null,
    especialidades: [],
    medicos: [],
    horarios: [],
    selectedDate: new Date().toISOString().slice(0, 10),
    selectedHorario: null,
    loading: { verify: false, especialidades: false, medicos: false, horarios: false },
    isSubmitting: false,
    errorBanner: '',

    init() {
      this.form.tipoDocumento = this.form.tipoDocumento || '';
      this.form.documento = this.form.documento || '';
      this.selectedDate = this.selectedDate;
      this.loadEspecialidades();
    },

    async loadEspecialidades() {
      this.loading.especialidades = true;
      try {
        const res = await fetch('/agendar-cita/especialidades', {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        const json = await res.json();
        this.especialidades = json.data?.especialidades || json.data || json;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading.especialidades = false;
      }
    },

    async verifyPatient() {
      if (!this.form.tipoDocumento || !this.form.documento) {
        showToast('error', 'Tipo de documento y número son requeridos');
        return;
      }
      this.loading.verify = true;
      this.errorBanner = '';
      try {
        const res = await fetch('/agendar-cita/buscar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({ tipoDocumento: this.form.tipoDocumento, documento: this.form.documento }),
        });
        const json = await res.json();
        if (!json.success) {
          this.patient = null;
          this.errorBanner = json.message || 'Paciente no registrado en el sistema';
          showToast('error', this.errorBanner);
          return;
        }
        this.patient = json.data.paciente || json.data;
        if (this.patient.paciente.estadoPaciente !== 'ACTIVO') {
          this.errorBanner = 'El paciente se encuentra inactivo en el sistema y no está autorizado para agendar citas';
          showToast('error', this.errorBanner);
          return;
        }
        showToast('success', 'Paciente verificado');
        this.next();
      } catch (err) {
        console.error(err);
        showToast('error', 'Error en la verificación del paciente');
      } finally {
        this.loading.verify = false;
      }
    },

    onSelectEspecialidad() {
      this.loadMedicos();
    },

    async loadMedicos() {
      if (!this.form.especialidadId) {
        this.medicos = [];
        return;
      }
      this.loading.medicos = true;
      try {
        const res = await fetch('/api/medicos?especialidadId=' + encodeURIComponent(this.form.especialidadId), {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        const json = await res.json();
        this.medicos = json.data || json;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading.medicos = false;
      }
    },

    selectMedico(med) {
      this.form.medicoId = med.id;
      this.next();
      this.loadHorarios();
    },

    async loadHorarios() {
      if (!this.form.medicoId) return;
      this.loading.horarios = true;
      try {
        const res = await fetch('/api/horarios?medicoId=' + encodeURIComponent(this.form.medicoId) + '&fecha=' + encodeURIComponent(this.selectedDate), {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        const json = await res.json();
        this.horarios = json.data || json;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading.horarios = false;
      }
    },

    selectHorario(h) {
      if (!h.disponible || new Date(h.horaInicio) <= new Date()) return;
      this.selectedHorario = h;
      this.form.horarioId = h.id;
      showToast('success', 'Horario seleccionado');
    },

    prev() {
      if (this.step > 0) this.step--;
    },
    next() {
      if (this.step < this.steps.length - 1) this.step++;
    },

    async confirmAgendar() {
      if (!this.patient) { showToast('error', 'Paciente no verificado'); return; }
      if (!this.form.especialidadId || !this.form.medicoId || !this.form.horarioId) { showToast('error', 'Seleccione especialidad, médico y horario'); return; }
      this.isSubmitting = true;
      this.errorBanner = '';
      try {
        const payload = {
          tipoDocumento: this.form.tipoDocumento,
          documento: this.form.documento,
          medicoId: this.form.medicoId,
          horarioId: this.form.horarioId,
          motivo: this.form.motivo,
        };
        const res = await fetch('/agendar-cita/confirmar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) {
          // concurrency or availability error
          this.errorBanner = json.message || 'El horario seleccionado ya no se encuentra disponible';
          showToast('error', this.errorBanner);
          // reload horarios to reflect current availability
          await this.loadHorarios();
          return;
        }

        showToast('success', 'Cita agendada correctamente');
        // reset form but keep patient data
        this.form.motivo = '';
        this.selectedHorario = null;
        this.form.horarioId = '';
        this.isSubmitting = false;
        // optionally redirect
        setTimeout(() => { window.location.href = '/citas'; }, 900);
      } catch (err) {
        console.error(err);
        this.errorBanner = 'Error al agendar la cita';
        showToast('error', 'Error al agendar la cita');
      } finally {
        this.isSubmitting = false;
      }
    }
  };
}

// expose showToast globally if partial included
window.showToast = window.showToast || function(type, message, timeout){
  try { /* use partial toast showToast if exists */
    if (typeof showToast === 'function' && showToast !== window.showToast) return;
  } catch(e){}
  // fallback: simple alert
  console[type==='success' ? 'log' : 'error'](message);
};

// polyfill for older browsers: nothing critical
