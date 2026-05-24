-- PostgreSQL SQL schema for ClinicaSoft domain model
-- UUID primary keys and referential integrity based on Prisma model.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_documento') THEN
    CREATE TYPE tipo_documento AS ENUM ('RC', 'TI', 'CC', 'CE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_paciente') THEN
    CREATE TYPE estado_paciente AS ENUM ('ACTIVO', 'INACTIVO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_cita') THEN
    CREATE TYPE estado_cita AS ENUM ('PENDIENTE', 'ASIGNADO', 'CANCELADO', 'FINALIZADO');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS persona (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  tipo_documento tipo_documento NOT NULL,
  documento TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  CONSTRAINT persona_documento_unique UNIQUE (tipo_documento, documento)
);

CREATE TABLE IF NOT EXISTS paciente (
  id UUID PRIMARY KEY,
  fecha_nacimiento DATE,
  estado_civil TEXT,
  estado_paciente estado_paciente NOT NULL DEFAULT 'ACTIVO',
  CONSTRAINT paciente_persona_fk FOREIGN KEY (id) REFERENCES persona(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS especialidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  disponibilidad BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS medico (
  id UUID PRIMARY KEY,
  tarjeta_profesional TEXT,
  disponibilidad BOOLEAN NOT NULL DEFAULT TRUE,
  especialidad_id UUID NOT NULL,
  CONSTRAINT medico_persona_fk FOREIGN KEY (id) REFERENCES persona(id) ON DELETE CASCADE,
  CONSTRAINT medico_especialidad_fk FOREIGN KEY (especialidad_id) REFERENCES especialidad(id)
);

CREATE TABLE IF NOT EXISTS horario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  hora_inicio TIMESTAMP NOT NULL,
  hora_fin TIMESTAMP NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  medico_id UUID NOT NULL,
  CONSTRAINT horario_medico_fk FOREIGN KEY (medico_id) REFERENCES medico(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS horario_medico_idx ON horario(medico_id);

CREATE TABLE IF NOT EXISTS cita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL,
  medico_id UUID NOT NULL,
  horario_id UUID NOT NULL UNIQUE,
  motivo TEXT,
  estado estado_cita NOT NULL DEFAULT 'PENDIENTE',
  fecha_creacion TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT cita_paciente_fk FOREIGN KEY (paciente_id) REFERENCES paciente(id),
  CONSTRAINT cita_medico_fk FOREIGN KEY (medico_id) REFERENCES medico(id),
  CONSTRAINT cita_horario_fk FOREIGN KEY (horario_id) REFERENCES horario(id)
);
