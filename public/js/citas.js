document.addEventListener('alpine:init', () => {
  Alpine.data('citasHistorialManager', (initialPacienteId = '') => ({
    pacienteId: initialPacienteId || '',
    paciente: null,
    citas: [],
    total: 0,
    currentPage: 1,
    pageSize: 10,
    loading: { historial: false, filtros: false, pacientes: false },
    filters: {
      fechaDesde: '',
      fechaHasta: '',
      especialidadId: '',
      medicoId: '',
    },
    especialidades: [],
    medicos: [],
    patientSearch: '',
    patientResults: [],
    menuOpenId: null,

    get totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize));
    },

    get pageNumbers() {
      const pages = [];
      const max = Math.min(this.totalPages, 6);
      for (let i = 1; i <= max; i += 1) pages.push(i);
      return pages;
    },

    init() {
      if (!this.pacienteId) {
        const saved = sessionStorage.getItem('ultimoPacienteCitas');
        if (saved) this.pacienteId = saved;
      }
      this.loadFiltros();
      if (this.pacienteId) {
        this.loadPacienteResumen().then(() => this.loadHistorial());
      }
    },

    async loadPacienteResumen() {
      try {
        const res = await fetch(`/api/pacientes/${this.pacienteId}`, {
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });
        const json = await res.json();
        if (!json.success || !json.data) return;
        const plain = json.data;
        const persona = plain.persona;
        if (!persona) return;
        this.paciente = {
          id: plain.id,
          nombre: `${persona.nombre} ${persona.apellido}`,
          tipoDocumento: persona.tipoDocumento,
          documento: persona.documento,
          email: persona.email,
          telefono: persona.telefono,
          fechaNacimiento: plain.fechaNacimiento,
          edad: this.calcEdad(plain.fechaNacimiento),
          estadoPaciente: plain.estadoPaciente,
          iniciales: `${(persona.nombre[0] || '')}${(persona.apellido[0] || '')}`.toUpperCase(),
        };
      } catch (err) {
        console.error(err);
      }
    },

    async loadFiltros() {
      this.loading.filtros = true;
      try {
        const params = new URLSearchParams();
        if (this.filters.especialidadId) params.set('especialidadId', this.filters.especialidadId);
        const res = await fetch(`/api/citas/filtros?${params}`, {
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });
        const json = await res.json();
        if (json.success) {
          this.especialidades = json.data.especialidades || [];
          this.medicos = json.data.medicos || [];
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.loading.filtros = false;
      }
    },

    async searchPatients() {
      if (!this.patientSearch.trim()) {
        this.patientResults = [];
        return;
      }
      this.loading.pacientes = true;
      try {
        const params = new URLSearchParams({
          documento: this.patientSearch.trim(),
          page: '1',
          pageSize: '8',
        });
        const res = await fetch(`/api/pacientes?${params}`, {
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });
        const json = await res.json();
        this.patientResults = json.success ? (json.data.items || []) : [];
      } catch (err) {
        console.error(err);
        this.patientResults = [];
      } finally {
        this.loading.pacientes = false;
      }
    },

    selectPatient(item) {
      this.pacienteId = item.id;
      sessionStorage.setItem('ultimoPacienteCitas', item.id);
      this.paciente = {
        id: item.id,
        nombre: `${item.persona.nombre} ${item.persona.apellido}`,
        tipoDocumento: item.persona.tipoDocumento,
        documento: item.persona.documento,
        email: item.persona.email,
        telefono: item.persona.telefono,
        fechaNacimiento: item.fechaNacimiento,
        edad: this.calcEdad(item.fechaNacimiento),
        estadoPaciente: item.estadoPaciente,
        iniciales: `${(item.persona.nombre[0] || '')}${(item.persona.apellido[0] || '')}`.toUpperCase(),
      };
      this.patientResults = [];
      this.patientSearch = '';
      this.currentPage = 1;
      const url = new URL(window.location.href);
      url.searchParams.set('pacienteId', this.pacienteId);
      window.history.replaceState({}, '', url);
      this.loadHistorial();
    },

    calcEdad(fechaNacimiento) {
      if (!fechaNacimiento) return null;
      const hoy = new Date();
      const nac = new Date(fechaNacimiento);
      let edad = hoy.getFullYear() - nac.getFullYear();
      const mes = hoy.getMonth() - nac.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad -= 1;
      return edad;
    },

    async loadHistorial() {
      if (!this.pacienteId) return;
      this.loading.historial = true;
      try {
        const params = new URLSearchParams({
          pacienteId: this.pacienteId,
          page: String(this.currentPage),
          pageSize: String(this.pageSize),
        });
        if (this.filters.fechaDesde) params.set('fechaDesde', this.filters.fechaDesde);
        if (this.filters.fechaHasta) params.set('fechaHasta', this.filters.fechaHasta);
        if (this.filters.especialidadId) params.set('especialidadId', this.filters.especialidadId);
        if (this.filters.medicoId) params.set('medicoId', this.filters.medicoId);

        const res = await fetch(`/api/citas/historial?${params}`, {
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });
        const json = await res.json();
        if (!json.success) {
          showToast('error', json.message || 'No se pudo cargar el historial');
          this.citas = [];
          this.total = 0;
          return;
        }
        this.paciente = json.data.paciente;
        this.citas = json.data.items || [];
        this.total = json.data.total || 0;
      } catch (err) {
        console.error(err);
        showToast('error', 'Error al cargar el historial de citas');
      } finally {
        this.loading.historial = false;
      }
    },

    async onEspecialidadChange() {
      this.filters.medicoId = '';
      await this.loadFiltros();
      this.loadHistorial();
    },

    clearFilters() {
      this.filters = { fechaDesde: '', fechaHasta: '', especialidadId: '', medicoId: '' };
      this.currentPage = 1;
      this.loadFiltros();
      this.loadHistorial();
    },

    formatFechaHora(value) {
      if (!value) return '—';
      const d = new Date(value);
      return d.toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    truncateMotivo(text, max = 42) {
      if (!text) return '—';
      return text.length > max ? `${text.slice(0, max)}...` : text;
    },

    goToPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.loadHistorial();
    },

    prevPage() {
      this.goToPage(this.currentPage - 1);
    },

    nextPage() {
      this.goToPage(this.currentPage + 1);
    },

    toggleMenu(id) {
      this.menuOpenId = this.menuOpenId === id ? null : id;
    },

    async cancelarCita(cita) {
      if (!confirm('¿Desea cancelar esta cita?')) return;
      await this.updateEstado(cita.id, 'CANCELADO');
    },

    async completarCita(cita) {
      await this.updateEstado(cita.id, 'FINALIZADO');
    },

    async updateEstado(citaId, estado) {
      try {
        const res = await fetch(`/api/citas/${citaId}/estado`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({ estado }),
        });
        const json = await res.json();
        if (!json.success) {
          showToast('error', json.message || 'No se pudo actualizar la cita');
          return;
        }
        showToast('success', json.message || 'Cita actualizada');
        this.menuOpenId = null;
        await this.loadHistorial();
      } catch (err) {
        console.error(err);
        showToast('error', 'Error al actualizar la cita');
      }
    },

    verDetalle(cita) {
      showToast('success', `Cita del ${this.formatFechaHora(cita.fechaHora)} — ${cita.motivo || 'Sin motivo'}`);
    },

    descargarResumen() {
      showToast('success', 'El resumen clínico estará disponible próximamente para descarga.');
    },

    modificarCita(cita) {
      window.location.href = `/agendar-cita?tipoDocumento=${encodeURIComponent(this.paciente.tipoDocumento)}&documento=${encodeURIComponent(this.paciente.documento)}`;
    },
  }));
});
