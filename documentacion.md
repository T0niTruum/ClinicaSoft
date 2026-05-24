## AGENDAR CITA MÉDICA

## Transacción: Agendar cita médica

## Modelado de clases

## ● Persona: id, nombre, apellido, documento, tipoDocumento, email, telefono.

## ● Paciente: fechaNacimiento, estadoCivil, estadoPaciente

## ● Médico: tarjetaProfesional, disponibilidad

## ● Especialidad: id, nombre, descripcion, disponibilidad.

## Horario: id, fecha, horaInicio, horaFin, disponible.

## ● Cita: id, estado, motivo, fechaCreacion.

## Relaciones y cardinalidades:

## ● Médico y Paciente → heredan atributos de la clase Persona.

## ● Paciente (1) → (0 .. *) Cita.

## ● Especialidad(1) → (1 .. *) Médico.

## ● Médico (1) → (0 .. *) Horario.

## ● Horario (1) → (0 .. 1) Cita.

## Invariante de Horario: 
Un objeto Horario no puede existir de forma huérfana; debe estar vinculado
obligatoriamente a una instancia de Médico (1..1) en todo su ciclo de vida.
## Invariante de Cita: 
Una Cita en estado ASIGNADO debe estar asociada simultáneamente a
exactamente un Paciente y a un Horario cuyo flag disponible sea estrictamente false.
## Invariante de Integridad Biográfica: 
Los atributos heredados documento y tipoDocumento de una
Persona son inmutables una vez el objeto Paciente ha sido persistido en el sistema.


## Caso de Uso Estrella: CU-01 Agendar Cita Médica (Transacción)

**Actor Principal:** Usuario Administrativo
**Descripción:** Permite reservar un espacio de atención médica vinculando a un paciente activo con un
médico, una especialidad y un horario disponible específico.
**Precondiciones**
● El paciente debe estar previamente registrado en el sistema y tener un estado **"Activo"** (según
**RN-08** ).
● El médico debe estar registrado, activo y contar con bloques de horarios previamente
configurados en el sistema.
**Flujo Básico**

1. El usuario administrativo ingresa al módulo de agendamiento de citas.
2. El sistema solicita el número de documento del paciente.
3. El usuario ingresa el documento del paciente.
4. El sistema busca al paciente, verifica que exista y valida que su estado sea **"Activo"**.
5. El sistema despliega un listado de las especialidades médicas disponibles ( **RN-05** ).
6. El usuario selecciona una especialidad.
7. El sistema filtra y muestra los médicos asignados a esa especialidad que tengan disponibilidad
    activa.
8. El usuario selecciona al médico correspondiente.
9. El sistema consulta y despliega el calendario con los bloques de **Horarios** disponibles para
    ese médico ( **RN-06** ).
10. El usuario selecciona la fecha y hora deseadas del bloque e ingresa el motivo de la consulta.
11. El sistema valida en tiempo real que el horario siga disponible y que corresponda a una fecha
    futura ( **RN-02** y **RN-03** ).
12. El usuario hace clic en el botón **"Confirmar Agendamiento"**.
13. El sistema registra la nueva **Cita** con el estado **"ASIGNADO"** , actualiza el estado del
    **Horario** a disponible = false y muestra un mensaje de éxito en pantalla.

## Flujos Alternos
● **FA1: Paciente Inactivo o No Registrado (Paso 4)**
1. Si el sistema detecta que el paciente no existe, muestra el mensaje: _"Paciente no
registrado en el sistema"_. El usuario administrativo es redirigido al CRUD de
pacientes.
2. Si el paciente existe pero su estado es **"Inactivo"** , el sistema bloquea el flujo
mostrando el error de la **RN-08** : _"El paciente se encuentra inactivo en el sistema y no
está autorizado para agendar citas"_. El caso de uso finaliza sin guardar cambios.
● **FA2: Conflicto de Horario Ocupado en Simultáneo (Paso 11)**
1. Si al intentar confirmar, otro usuario administrativo reservó el mismo bloque de
horario milisegundos antes, el sistema lanza una excepción: _"El horario seleccionado
ya no se encuentra disponible"_.
2. El sistema actualiza la vista de horarios, limpia la selección previa y le permite al
usuario elegir un horario diferente sin perder los datos del paciente ni del médico.
**Postcondiciones**
● **Éxito:** Se crea el objeto Cita en la base de datos y se bloquea el bloque en la tabla Horario
(disponible = false).
● **Fallo:** No se altera ningún registro en la base de datos y se preserva el estado original de los
horarios.

## Caso de Uso Secundario: CU-02 Modificar Datos de Paciente (CRUD)

**Actor Principal:** Usuario Administrativo
**Descripción:** Permite la actualización de la información personal, de contacto y de filiación de un
paciente existente.
**Precondiciones**
● El paciente debe estar registrado previamente en la base de datos del sistema.
**Flujo Básico**

1. El usuario administrativo ingresa al módulo de gestión (CRUD) de pacientes.
2. El sistema muestra la interfaz de búsqueda y el listado general de pacientes.
3. El usuario filtra al paciente ingresando su número de documento ( **RF-09** ).
4. El sistema localiza al paciente y muestra su información resumida en una fila.
5. El usuario hace clic en la acción **"Editar"** sobre el registro del paciente.
6. El sistema abre un formulario cargando todos los datos actuales del paciente. Por integridad,
    el campo de **Número de Documento** y **Tipo de Documento** aparecen bloqueados (de solo
    lectura).
7. El usuario realiza las modificaciones pertinentes en los campos editables (ej. teléfono, email,
    estado civil).
8. El usuario hace clic en el botón **"Guardar Cambios"**.
9. El sistema realiza las validaciones de formatos (como la estructura del email y la
    obligatoriedad de campos de texto).
10. El sistema actualiza el registro en la base de datos y muestra una notificación flotante de
    éxito: _"Datos del paciente actualizados correctamente"_.
## Flujos Alternos
● **FA1: Errores de Validación en el Formulario (Paso 9)**
1. Si el usuario administrativo deja un campo obligatorio vacío o introduce un formato
de correo electrónico inválido (ej. sin el símbolo @), el sistema detiene el envío.
2. El sistema resalta los campos con errores _inline_ (en línea) con texto en color rojo
explicando el fallo de validación.
3. El formulario permanece abierto esperando a que el usuario corrija los datos para
reintentar el guardado.
**Postcondiciones**
● **Éxito:** Los datos modificados del objeto Paciente se guardan persistentemente en la base de
datos afectando a las consultas futuras.
● **Fallo:** Se descartan los cambios introducidos en la interfaz y el registro del paciente mantiene
exactamente sus valores originales.

## Descripción del Flujo y Decisiones de las Reglas de Negocio

1. **Validación del Paciente (RN-08):** Tras buscar al paciente en el sistema, el flujo se bifurca. Si
    el paciente está inactivo o no existe, el sistema corta el flujo inmediatamente por seguridad
    transaccional, impidiendo que el operador avance en el formulario.
2. **Filtro de Especialidad (RN-05):** El sistema solo permite seleccionar especialidades
    habilitadas. Si se intenta forzar una inactiva, el sistema bloquea el paso y obliga a
    re-seleccionar.
3. **Estado del Médico (RN-04):** Se verifica en la base de datos que el médico seleccionado no
    esté en estado de licencia o suspendido.
4. **Control del Tiempo (RN-03 y RN-06):** Una vez seleccionado el espacio en la agenda, se
    ejecutan dos compuertas lógicas consecutivas:
       ○ **RN-03:** Valida en el backend que el objeto DateTime ingresado sea mayor al
          DateTime.now().
       ○ **RN-06:** Compara las propiedades horaInicio y horaFin seleccionadas contra los
          atributos correspondientes del perfil del Médico. Si falla, retorna al usuario a la vista
          de calendario.
5. **Control de Concurrencia (RN-02):** Es la validación crítica justo antes del commit en la base
    de datos. Si dos recepcionistas hacen clic en "Confirmar" al mismo tiempo para el mismo
    horario, el sistema verifica el flag genérico disponible. El primer request en llegar cambia el
    flag a false; el segundo request rebota por esta regla, evitando la duplicidad de citas y
    redirigiendo al flujo alterno para escoger otra hora.


## Desglose Técnico

**Búsquedas (Queries):** * Se observan búsquedas clave hacia la base de datos en los mensajes 3
( _findByDocumento_ ) para identificar al cliente, y 9 ( _findByMedicoIdAndDisponibleTrue_ ) para traer
dinámicamente la cuadrícula de la agenda médica del profesional seleccionado.
**Validaciones (Business Rules):**
● **Validación Temprana (Mensaje 5):** Bloquea el flujo si se rompe la **RN-08** , evitando
procesar información con un paciente inactivo.
● **Validación Intermedia (Mensaje 11):** El controlador ejecuta lógica para asegurar que no se
expongan citas en el pasado (RN-03) ni por fuera del turno del médico (RN-06).
● **Validación Concurrente (Mensaje 16):** Evaluada dentro de un bloque crítico o
transaccional. Resuelve el problema de que dos operadores agenden la misma cita al mismo
tiempo ( **RN-02** ), usando una consulta selectiva de bloqueo ( _findByIdForUpdate_ ).
**Persistencia (Commands):**
● El diagrama exige un comportamiento transaccional atómico (bloque _critical_ ). Muestra dos
escrituras secuenciales obligatorias en disco: primero, la mutación del estado del horario
seleccionado (Mensaje 18: disponible = false) y segundo, la inserción del nuevo registro
transaccional en la tabla de citas (Mensaje 20: save(Cita)).


## Requisitos Funcionales

**RF-01: Registrar un nuevo paciente
Descripción** : El sistema debe permitir registrar un nuevo paciente con sus datos personales y de
contacto.
**Criterios de aceptación** :
● El sistema valida que el documento de identidad sea único
● Se solicitan campos obligatorios: nombre, apellido, tipo de documento, número de
documento, email, teléfono
● El estado civil es un campo obligatorio
● El sistema genera automáticamente un ID único para cada paciente
● Se registra la fecha de nacimiento para futuras validaciones
**RF-02: Listar especialidades disponibles
Descripción** : El sistema debe mostrar todas las especialidades médicas disponibles en la clínica.
**Criterios de aceptación** :
● Se muestran solo especialidades con disponibilidad marcada como activa
● Para cada especialidad se visualiza: nombre, descripción
● Se indica el número de médicos disponibles por especialidad
**RF-03: Buscar médicos por especialidad
Descripción** : El sistema permite al paciente buscar médicos disponibles según la especialidad
seleccionada.
**Criterios de aceptación** :
● Se filtran los médicos según la especialidad elegida
● Se muestran sólo los médicos con disponibilidad activa
● Se visualiza para cada médico: nombre, especialidad, horarios disponibles
● Se ordena la lista alfabéticamente por apellido
**RF-04: Consultar horarios disponibles
Descripción** : El sistema debe mostrar los horarios disponibles de un médico específico.
**Criterios de aceptación** :
● Se mostrar los horarios de los próximos 30 días
● Se visualiza para cada horario: fecha, hora inicio, hora fin
● Se resalta visualmente si el horario está disponible o no
● Solo se muestran horarios de días futuro (no pasados)
● Se ordena cronológicamente de menor a mayor fecha
**RF-05: Agendar una cita médica
Descripción** : El sistema permite a un paciente agendar una cita seleccionando médico, especialidad,
horario y fecha.
**Criterios de aceptación** :
● El paciente selecciona médico, fecha y hora
● El sistema valida todas las reglas de negocio antes de confirmar
● Se registra automáticamente el estado como "PENDIENTE"
● Se muestra mensaje de confirmación con los detalles de la cita
● Se genera un ID único para la cita
● Se registra automáticamente la fecha y hora de creación
● El paciente puede ingresar el motivo de la cita (opcional)
**RF-06: Validar disponibilidad de horario
Descripción** : El sistema debe validar que un horario específico no esté ya reservado.
**Criterios de aceptación** :
● Antes de confirmar el agendamiento, se verifica el estado del horario
● Si el horario ya está reservado, se muestra un error y se ofrecen alternativas
● La validación ocurre en tiempo real
**RF-07: Visualizar cita agendada
Descripción** : El sistema permite al paciente visualizar los detalles completos de su cita agendada.
**Criterios de aceptación** :
● Se muestran todos los datos de la cita: fecha, hora, médico, especialidad
● Se muestra el estado actual de la cita
● Se visualiza el motivo de la consulta si fue registrado
● Se muestra la fecha y hora en que se agendó la cita
**RF-08: Listar citas del paciente
Descripción** : El sistema permite al paciente ver el histórico de sus citas.
**Criterios de aceptación** :
● Se muestran todas las citas del paciente (pasadas y futuras)
● Se separan las citas por estado: Pendiente, Asignado, Cancelado, Finalizado
● Se ordena por fecha (más reciente primero)
● Se incluye opción para filtrar por estado
**RF-09: Buscar paciente por documento
Descripción** : El sistema permite búsqueda de un paciente existente por su número de documento.
**Criterios de aceptación** :
● La búsqueda es obligatoria antes de agendar una cita
● Se valida el tipo de documento y el número
● Se retorna un único resultado si el paciente existe
● Si no existe, el sistema ofrece crear un nuevo paciente
**RF-10: Cancelar cita
Descripción** : El sistema permite al paciente o administrativo cancelar una cita agendada.
**Criterios de aceptación** :
● Sólo pueden cancelarse citas en estado "PENDIENTE" o "ASIGNADO"
● Se solicita una razón de cancelación
● El horario queda disponible nuevamente
● El estado de la cita cambia a "CANCELADO"
● Se registra la fecha y hora de cancelación
**RF-11: Actualizar datos del paciente
Descripción:** El sistema debe permitir modificar la información personal y de contacto de un paciente
previamente registrado en la plataforma.
**Criterios de aceptación:**
● El sistema permite buscar al paciente por su número de documento para cargar sus datos
actuales en el formulario de edición.
● Se permite la modificación de los campos editables: nombre, apellido, fecha de nacimiento,
estado civil, email y teléfono.
● Por motivos de integridad y seguridad de la información, el campo de número de documento
no podrá ser editado tras el registro inicial.
● Al guardar, el sistema realiza las mismas validaciones de campos obligatorios y formato de
datos que en el registro inicial.
● Al confirmar la actualización, el sistema guarda los cambios en la base de datos y muestra un
mensaje de éxito en la interfaz.
**RF-12: Inactivar paciente (Borrado lógico)
Descripción:** El sistema debe permitir cambiar el estado de un paciente a "Inactivo" para restringir
operaciones futuras en la plataforma, garantizando que no se borre físicamente su historial clínico o
transaccional.
**Criterios de aceptación:**
● El usuario administrativo debe seleccionar al paciente y solicitar su inactivación a través de la
interfaz del CRUD.
● El sistema debe mostrar un mensaje de advertencia solicitando una confirmación explícita
antes de proceder con el cambio de estado.
● Al confirmar, el atributo de estado del paciente cambia a "Inactivo" en la base de datos.
● Un paciente en estado "Inactivo" queda bloqueado para el agendamiento de nuevas citas
médicas y no aparecerá en las búsquedas de pacientes activos.
● Toda la información histórica de citas previas (finalizadas, canceladas o asistidas) asociadas a
dicho paciente se conserva intacta en el sistema para fines de auditoría.

## Requisitos No Funcionales

**RNF-01: Rendimiento**
● El sistema debe retornar listados de citas en máximo 2 segundos
● La búsqueda de horarios disponibles debe completarse en menos de 1 segundo
● Máximo 500 ms para validar disponibilidad de un horario
**RNF-02: Disponibilidad**
● El sistema debe estar disponible 24/7 durante el horario de atención de la clínica
● Permitir al menos 99% de disponibilidad mensual
● Realizar mantenimiento solo en horarios no laborales
**RNF-03: Seguridad**
● Todas las contraseñas deben encriptarse en almacenamiento
● El acceso a datos personales de pacientes debe estar restringido a usuarios autenticados
● Implementar validación de entrada para prevenir SQL injection
● Los datos sensibles (documento, email) deben validarse con expresiones regulares
**RNF-04: Usabilidad**
● La interfaz debe ser intuitiva y accesible
● El proceso de agendamiento no debe requerir más de 5 pasos
● Se deben mostrar mensajes de error claros y en español
● Implementar validaciones en tiempo real en formularios
**RNF-05: Escalabilidad**
● El sistema debe soportar al menos 1000 citas simultáneas sin degradación
● Debe permitir agregar nuevas especialidades sin afectar el rendimiento
● La base de datos debe permitir crecimiento de al menos 100,000 registros anuales
**RNF-06: Mantenibilidad**
● El código debe seguir estándares de nomenclatura consistentes
● Se deben documentar todas las reglas de negocio implementadas
● Máximo 3 niveles de anidamiento en funciones
● Implementar logging de todas las transacciones críticas
**RNF-07: Compatibilidad**
● Soportar navegadores Chrome, Firefox, Safari versiones actuales
● Funcionar correctamente en dispositivos móviles (responsive design)
● Compatible con resoluciones desde 320px hasta 2560px de ancho
**RNF-08: Auditoría**
● Registrar todas las acciones críticas: creación, modificación y cancelación de citas
● Incluir timestamp, usuario que realiza la acción y cambios realizados
● Mantener histórico de cambios por al menos 2 años

## Reglas de Negocio

**RN-01: Validación de documento único para pacientes
Descripción** : Un paciente no puede estar registrado dos veces con el mismo número de documento,
independientemente del tipo de documento.
**Aplicabilidad** : Al crear o editar un paciente
**Impacto técnico** :
● Validar uniqueness en el campo documento + tipoDocumento
● Mostrar error: "El documento ya está registrado en el sistema"
● Permitir que el usuario inicie sesión con su documento existente
**Lugar de validación:** Interfaz de usuario (Validación asíncrona) y Backend (Capa de
Servicio/Restricción de base de datos UNIQUE).
**RN-02: Horario no puede tener más de una cita agendada
Descripción** : Un horario específico de un médico sólo puede tener máximo una cita agendada. Una
vez que se asigna a un paciente, queda ocupado para otros pacientes.
**Aplicabilidad** : Al agendar o confirmar una cita
**Impacto técnico** :
● Verificar Horario.disponible = true antes de crear cita
● Cambiar Horario.disponible = false al confirmarse la cita
● Validar cardinalidad (0..1) en la relación Horario-Cita
**Lugar de validación:** Backend (Bloqueo transaccional FOR UPDATE) y Base de datos.
**RN-03: Validación de fecha y hora futuras
Descripción** : Un paciente solo puede agendar citas para fechas y horas futuras. No se pueden agendar
citas en el pasado.
**Aplicabilidad** : Al agendar una cita
**Impacto técnico** :
● Comparar fecha + hora de la cita con fechaActual + horaActual del servidor
● Rechazar si fechaCita + horaCita <= ahora
● Mostrar error: "No se puede agendar citas en fechas pasadas"
**Lugar de validación:** Interfaz de usuario (Restricción del componente de calendario) y Backend
(Capa de Servicio).
**RN-04: Médico debe tener disponibilidad activa
Descripción** : Un paciente solo puede agendar cita con un médico que tenga disponibilidad = true. Los
médicos con disponibilidad desactivada no aparecen en las búsquedas.
**Aplicabilidad** : Al buscar médicos y al validar agendamiento
**Impacto técnico** :
● En RF-03: Filtrar Médico.disponibilidad = true
● Al agendar: Validar que Médico.disponibilidad = true
● Si cambia durante el proceso: Informar al paciente
**Lugar de validación:** Caso de Uso (Filtro en consultas de búsqueda) y Backend.
**RN-05: Especialidad debe estar disponible
Descripción** : Solo se pueden agendar citas de especialidades que tengan disponibilidad = true. Las
especialidades desactivadas no aparecen en el listado.
**Aplicabilidad** : Al listar especialidades y validar agendamiento
**Impacto técnico** :
● En RF-02: Filtrar Especialidad.disponibilidad = true
● Al agendar: Validar que la especialidad elegida tenga disponibilidad activa
● Si se desactiva una especialidad: Notificar a pacientes con citas pendientes
**Lugar de validación:** Interfaz de usuario (Filtro de vista) y Controlador Backend.
**RN-06: Validación de horario dentro del rango laboral del médico
Descripción** : Los horarios disponibles de un médico no pueden estar fuera de su rango laboral
definido. horaInicio y horaFin del horario deben estar dentro de horainicio y horaFin del médico.
**Aplicabilidad** : Al crear horarios y validar agendamiento
**Impacto técnico** :
● Al crear horario: Validar Horario.horaInicio >= Médico.horaInicio
● Y validar Horario.horaFin <= Médico.horaFin
● Mostrar error: "El horario está fuera del horario laboral del médico"
**Lugar de validación:** Backend (Capa de Servicio en el módulo de configuración de agendas).
**RN-07: Solo citas PENDIENTE y ASIGNADO pueden ser canceladas
Descripción** : Una cita solo puede ser cancelada si su estado es "PENDIENTE" o "ASIGNADO". No
se pueden cancelar citas ya "FINALIZADAS" o que ya fueron "CANCELADAS".
**Aplicabilidad** : Al intentar cancelar una cita (RF-10)
**Impacto técnico** :
● Validar Cita.estado IN [PENDIENTE, ASIGNADO]
● Si estado es FINALIZADO o CANCELADO: Mostrar error
● Al cancelar: Cambiar estado a "CANCELADO" y liberar el horario
● Registrar razón de cancelación
**Lugar de validación:** Caso de Uso (Flujo alterno) y Máquina de estados en el Backend.
**RN-08: Paciente debe tener estado activo para agendar
Descripción:** Un paciente solo puede agendar una nueva cita médica si su estado en el sistema es
"Activo". Si el paciente se encuentra en estado "Inactivo" (por bloqueo lógico o administrativo), el
sistema debe impedir de forma inmediata el proceso de reserva.
**Aplicabilidad:** Al buscar paciente (RF-09) y al validar el agendamiento de la cita (RF-05).
**Impacto técnico:**
● Al realizar la búsqueda previa: Verificar que Paciente.estado == "Activo".
● Antes de confirmar el agendamiento: Validar que Paciente.estado == "Activo" antes de
proceder a modificar el estado del horario.
● Si el estado es "Inactivo": Bloquear la confirmación del agendamiento y denegar el guardado
de la transacción.
● Mostrar error: _"El paciente se encuentra inactivo en el sistema y no está autorizado para
agendar citas"_.
**Lugar de validación:** Diagrama de Actividad, Interfaz de Usuario y Controlador Backend (Filtro
interceptor).

## Casos de Aceptación

● Caso de Prueba 1: Intento de agendamiento con paciente bloqueado (Validación RN-08)
**Given (Dado que):** Un usuario administrativo está autenticado en el sistema y ha
seleccionado al paciente "Carlos Pérez", cuyo atributo estado es igual a INACTIVO. **When
(Cuando):** Intenta avanzar en el flujo del formulario para seleccionar una especialidad
médica. **Then (Entonces):** El sistema bloquea el flujo de inmediato, muestra un mensaje de
error inline en color rojo indicando "El paciente se encuentra inactivo en el sistema y no está
autorizado..." y no permite registrar la cita.
● Caso de Prueba 2: Conflicto de concurrencia transaccional en tiempo real (Validación
RN-02) **Given (Dado que):** Dos usuarios administrativos abren simultáneamente el
calendario del "Médico Dr. Silva" para el día de mañana a las 09:00 AM, el cual tiene su flag
disponible = true. **When (Cuando):** Ambos operadores hacen clic exactamente al mismo
tiempo en el botón "Confirmar Agendamiento". **Then (Entonces):** El primer request
procesado exitosamente muta el horario a disponible = false ; el segundo request es rechazado
inmediatamente por el backend, lanzando una excepción controlada con el mensaje _"El
horario seleccionado ya no se encuentra disponible"_ sin generar duplicados de citas.
● Caso de Prueba 3: Restricción cronológica de citas (Validación RN-03)**Given (Dado
que):** El usuario administrativo se encuentra en el formulario de la transacción de negocio.
**When (Cuando):** Intenta ingresar manualmente de forma errónea o forzada una fecha
correspondiente al día de ayer o una hora pasada. **Then (Entonces):** El sistema ejecuta la
validación comparativa contra la hora del servidor y deniega el guardado de la transacción
mostrando la advertencia _"No se puede agendar citas en fechas pasadas"_.
● Caso de Prueba 4: Persistencia y modificación de datos de filiación (CRUD - RF-11)
**Given (Dado que):** El operador se encuentra dentro del módulo CRUD en la vista de edición
del registro de un paciente activo. **When (Cuando):** Modifica los campos editables de
teléfono y email, y presiona el botón "Guardar Cambios". **Then (Entonces):** El sistema
efectúa la actualización persistente en la base de datos, retorna una alerta flotante de éxito
notificando _"Datos del paciente actualizados correctamente"_ y mantiene bloqueados por
seguridad los campos inmutables de documento y tipoDocumento.
● Caso de Prueba 5: Ejecución de Borrado Lógico e Inactivación de Paciente (RF-12 /
RN-08): **Given (Dado que):** El usuario administrativo se encuentra autenticado en el sistema
dentro del módulo de gestión de pacientes (CRUD) y ha buscado y seleccionado el perfil del
paciente "Carlos Pérez", cuyo atributo estado actual en la base de datos es igual a ACTIVO.
**When (Cuando):** El operador hace clic en la acción de "Inactivar Paciente" (o selecciona la
opción INACTIVO en el formulario de edición) y confirma la alerta del sistema para aplicar
el cambio. **Then (Entonces):** El sistema ejecuta un _borrado lógico_ realizando un UPDATE en
la base de datos para mutar el atributo Paciente.estado a INACTIVO (garantizando que el
registro físico no sea eliminado para preservar la integridad referencial y el historial de citas
previas), despliega una notificación flotante de éxito indicando _"El paciente ha sido
inactivado correctamente"_ y actualiza el listado general (UI) mostrando el _badge_ de estado en
color gris. **And (Y además):** Si inmediatamente después de esta acción el operador intenta
ingresar al módulo transaccional (CU-01) e introduce el número de documento de este mismo
paciente, el backend debe interceptar la solicitud en la capa de servicio y denegar el acceso al
calendario médico disparando la restricción de la RN-08.