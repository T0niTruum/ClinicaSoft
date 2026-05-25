function agendarCita() {
  return {
    step: 0,
    steps: ['Verificación', 'Especialidad', 'Horario', 'Confirmación'],
    form: {
      tipoDocumento: 'CC',
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

    // Calendar state
    calendarYear: new Date().getFullYear(),
    calendarMonth: new Date().getMonth(),
    calendarDays: [],

    get calendarTitle() {
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return months[this.calendarMonth] + ' ' + this.calendarYear;
    },

    init() {
      this.buildCalendar();
      this.loadEspecialidades();
    },

    buildCalendar() {
      const year = this.calendarYear;
      const month = this.calendarMonth;
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();
      const today = new Date().toISOString().slice(0, 10);
      const days = [];

      // Previous month padding
      for (let i = firstDay - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        const date = new Date(year, month - 1, d);
        days.push({ day: d, date: date.toISOString().slice(0, 10), currentMonth: false, isToday: false });
      }

      // Current month
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dateStr = date.toISOString().slice(0, 10);
        days.push({ day: d, date: dateStr, currentMonth: true, isToday: dateStr === today });
      }

      // Next month padding
      const remaining = 42 - days.length;
      for (let d = 1; d <= remaining; d++) {
        const date = new Date(year, month + 1, d);
        days.push({ day: d, date: date.toISOString().slice(0, 10), currentMonth: false, isToday: false });
      }

      this.calendarDays = days;
    },

    prevMonth() {
      if (this.calendarMonth === 0) { this.calendarMonth = 11; this.calendarYear--; }
      else { this.calendarMonth--; }
      this.buildCalendar();
    },

    nextMonth() {
      if (this.calendarMonth === 11) { this.calendarMonth = 0; this.calendarYear++; }
      else { this.calendarMonth++; }
      this.buildCalendar();
    },

    selectCalendarDate(dateStr) {
      this.selectedDate = dateStr;
      if (this.form.medicoId) this.loadHorarios();
    },

    async loadEspecialidades() {
      this.loading.especialidades = true;
      try {
        const res = await fetch('/agendar-cita/especialidades', {
          headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
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
      if (!this.form.documento) {
        showToast('error', 'Ingresa el número de documento');
        return;
      }
      this.loading.verify = true;
      this.errorBanner = '';
      this.patient = null;
      try {
        const res = await fetch('/agendar-cita/buscar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({ tipoDocumento: this.form.tipoDocumento || 'CC', documento: this.form.documento }),
        });
        const json = await res.json();
        if (!json.success) {
          this.patient = null;
          this.errorBanner = json.message || 'Paciente no registrado en el sistema';
          return;
        }
        // API returns persona with paciente nested OR flat paciente object
        const raw = json.data?.paciente || json.data;
        // Normalize: if data has persona.paciente structure (from buscar endpoint)
        // The buscar endpoint returns: { persona: { ...personaFields, paciente: { estadoPaciente } } }
        if (raw && raw.persona) {
          // Format: { ...personaFields } with nested paciente
          this.patient = {
            id: raw.paciente?.id || raw.id,
            estadoPaciente: raw.paciente?.estadoPaciente || raw.estadoPaciente,
            persona: {
              nombre: raw.persona?.nombre || raw.nombre,
              apellido: raw.persona?.apellido || raw.apellido,
              tipoDocumento: raw.persona?.tipoDocumento || raw.tipoDocumento,
              documento: raw.persona?.documento || raw.documento,
              email: raw.persona?.email || raw.email,
              telefono: raw.persona?.telefono || raw.telefono,
            }
          };
        } else {
          this.patient = raw;
        }

        if (this.patient.estadoPaciente !== 'ACTIVO') {
          this.errorBanner = 'El paciente se encuentra inactivo en el sistema y no está autorizado para agendar citas.';
          showToast('error', this.errorBanner);
          return;
        }
        showToast('success', 'Paciente verificado correctamente');
      } catch (err) {
        console.error(err);
        showToast('error', 'Error en la verificación del paciente');
      } finally {
        this.loading.verify = false;
      }
    },

    nextFromStep0() {
      if (!this.patient || this.patient.estadoPaciente !== 'ACTIVO') {
        showToast('error', 'Verifique un paciente activo antes de continuar');
        return;
      }
      this.step = 1;
    },

    onSelectEspecialidad() {
      this.form.medicoId = '';
      this.horarios = [];
      this.selectedHorario = null;
      this.loadMedicos();
    },

    onSelectMedico() {
      this.horarios = [];
      this.selectedHorario = null;
      if (this.form.medicoId) this.loadHorarios();
    },

    async loadMedicos() {
      if (!this.form.especialidadId) { this.medicos = []; return; }
      this.loading.medicos = true;
      try {
        const res = await fetch('/api/medicos?especialidadId=' + encodeURIComponent(this.form.especialidadId), {
          headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });
        const json = await res.json();
        this.medicos = json.data || json;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading.medicos = false;
      }
    },

    async loadHorarios() {
      if (!this.form.medicoId) return;
      this.loading.horarios = true;
      try {
        const res = await fetch('/api/horarios?medicoId=' + encodeURIComponent(this.form.medicoId) + '&fecha=' + encodeURIComponent(this.selectedDate), {
          headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
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
      if (!this.form.especialidadId || !this.form.medicoId || !this.form.horarioId) {
        showToast('error', 'Seleccione especialidad, médico y horario'); return;
      }
      if (!this.form.motivo.trim()) { showToast('error', 'El motivo de la cita es obligatorio'); return; }
      this.isSubmitting = true;
      this.errorBanner = '';
      try {
        const payload = {
          tipoDocumento: this.form.tipoDocumento || 'CC',
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
          this.errorBanner = json.message || 'El horario seleccionado ya no está disponible';
          showToast('error', this.errorBanner);
          await this.loadHorarios();
          return;
        }
        showToast('success', 'Cita agendada correctamente');
        this.form.motivo = '';
        this.selectedHorario = null;
        this.form.horarioId = '';
        setTimeout(() => { window.location.href = '/citas'; }, 900);
      } catch (err) {
        console.error(err);
        this.errorBanner = 'Error al agendar la cita';
        showToast('error', 'Error al agendar la cita');
      } finally {
        this.isSubmitting = false;
      }
    },
  };
}
