document.addEventListener('alpine:init', () => {
  Alpine.data('pacienteManager', () => ({
    loading: { patients: false, saving: false, confirming: false },
    patients: [],
    totalPatients: 0,
    currentPage: 1,
    pageSize: 15,
    filters: { estado: '', documento: '' },
    modalOpen: false,
    confirmModalOpen: false,
    selectedPatient: null,
    isEditing: false,
    isViewing: false,
    saving: false,
    confirming: false,
    emailInvalid: false,
    form: {
      id: null,
      tipoDocumento: '',
      documento: '',
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      estadoCivil: '',
      email: '',
      telefono: '',
      estadoPaciente: 'ACTIVO',
    },

    init() {
      this.loadPatients();
    },

    async loadPatients() {
      this.loading.patients = true;
      try {
        const params = new URLSearchParams();
        if (this.filters.estado) params.append('estado', this.filters.estado);
        if (this.filters.documento) params.append('documento', this.filters.documento);
        params.append('page', this.currentPage);
        params.append('pageSize', this.pageSize);
        const response = await fetch('/api/pacientes?' + params.toString());
        const json = await response.json();
        if (json.success) {
          this.patients = json.data.items || json.data || [];
          this.totalPatients = json.data.total || this.patients.length;
        } else {
          this.patients = [];
          this.totalPatients = 0;
          showToast('error', json.message || 'No se pudieron cargar los pacientes');
        }
      } catch (error) {
        console.error(error);
        showToast('error', 'Error cargando la lista de pacientes');
      } finally {
        this.loading.patients = false;
      }
    },

    async prevPage() {
      if (this.currentPage > 1) { this.currentPage--; await this.loadPatients(); }
    },

    async nextPage() {
      if (this.patients.length >= this.pageSize) { this.currentPage++; await this.loadPatients(); }
    },

    openPatientModal(patient = null) {
      this.modalOpen = true;
      this.isViewing = false;
      if (patient) {
        this.isEditing = true;
        this.selectedPatient = patient;
        this.form = {
          id: patient.id,
          tipoDocumento: patient.persona.tipoDocumento,
          documento: patient.persona.documento,
          nombre: patient.persona.nombre,
          apellido: patient.persona.apellido,
          fechaNacimiento: patient.fechaNacimiento ? patient.fechaNacimiento.split('T')[0] : '',
          estadoCivil: patient.estadoCivil || '',
          email: patient.persona.email || '',
          telefono: patient.persona.telefono || '',
          estadoPaciente: patient.estadoPaciente || 'ACTIVO',
        };
      } else {
        this.isEditing = false;
        this.selectedPatient = null;
        this.form = {
          id: null,
          tipoDocumento: '',
          documento: '',
          nombre: '',
          apellido: '',
          fechaNacimiento: '',
          estadoCivil: '',
          email: '',
          telefono: '',
          estadoPaciente: 'ACTIVO',
        };
      }
      this.emailInvalid = false;
    },

    viewPatient(patient) {
      this.openPatientModal(patient);
      this.isViewing = true;
    },

    closeModal() {
      this.modalOpen = false;
      this.isEditing = false;
      this.isViewing = false;
      this.selectedPatient = null;
      this.emailInvalid = false;
    },

    toggleStatus() {
      this.form.estadoPaciente = this.form.estadoPaciente === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    },

    validateEmail() {
      if (!this.form.email) {
        this.emailInvalid = false;
        return;
      }
      this.emailInvalid = !/^\S+@\S+\.\S+$/.test(this.form.email);
    },

    async savePatient() {
      this.validateEmail();
      if (this.emailInvalid) {
        showToast('error', 'Corrige el correo electrónico antes de guardar');
        return;
      }
      if (!this.form.nombre || !this.form.apellido || !this.form.tipoDocumento || !this.form.documento) {
        showToast('error', 'Completa todos los campos obligatorios');
        return;
      }
      this.saving = true;
      try {
        const url = this.isEditing ? '/api/pacientes/' + this.form.id : '/api/pacientes';
        const method = this.isEditing ? 'PUT' : 'POST';
        const body = this.isEditing
          ? {
            nombre: this.form.nombre,
            apellido: this.form.apellido,
            fechaNacimiento: this.form.fechaNacimiento,
            estadoCivil: this.form.estadoCivil,
            email: this.form.email,
            telefono: this.form.telefono,
            estadoPaciente: this.form.estadoPaciente,
          }
          : {
            tipoDocumento: this.form.tipoDocumento,
            documento: this.form.documento,
            nombre: this.form.nombre,
            apellido: this.form.apellido,
            fechaNacimiento: this.form.fechaNacimiento,
            estadoCivil: this.form.estadoCivil,
            email: this.form.email,
            telefono: this.form.telefono,
            estadoPaciente: this.form.estadoPaciente,
          };
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) {
          showToast('error', json.message || 'No se pudo guardar el paciente');
          return;
        }
        await this.loadPatients();
        showToast('success', this.isEditing ? 'Paciente actualizado' : 'Paciente registrado');
        this.closeModal();
      } catch (error) {
        console.error(error);
        showToast('error', 'Error guardando el paciente');
      } finally {
        this.saving = false;
      }
    },

    openConfirmModal(patient) {
      this.confirmModalOpen = true;
      this.selectedPatient = patient;
    },

    closeConfirmModal() {
      this.confirmModalOpen = false;
      this.selectedPatient = null;
    },

    async confirmInactivation() {
      if (!this.selectedPatient) return;
      this.confirming = true;
      try {
        const res = await fetch('/api/pacientes/' + this.selectedPatient.id + '/inactivar', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });
        const json = await res.json();
        if (!json.success) {
          showToast('error', json.message || 'No se pudo inactivar al paciente');
          return;
        }
        await this.loadPatients();
        showToast('success', 'Paciente inactivado correctamente');
        this.closeConfirmModal();
      } catch (error) {
        console.error(error);
        showToast('error', 'Error al inactivar el paciente');
      } finally {
        this.confirming = false;
      }
    },
  }));
});
