Requerimientos del Sistema — Clinica "Salud Integral"

# 1. Entidades Principales

- **Specialty (Especialidades):** Catalogo de ramas medicas. Incluye soft delete y reglas de admision ('allowedGender', 'minAge', 'maxAge').
- **Doctor (Medicos):** Profesionales de la salud asignados a una especialidad. Vinculacion opcional 1:1 con un usuario del sistema ('user_id'). Maneja soft delete.
- **Patient (Pacientes):** Registro de pacientes con fecha de nacimiento y genero biologico obligatorio para validaciones clinicas. Maneja soft delete.
- **Appointment (Citas Medicas):** Agendamiento entre paciente y medico. Nace en estado 'PROGRAMADA'.
- **User (Usuarios):** Cuentas de acceso para autenticacion y autorizacion por roles ('RECEPCIONISTA', 'MEDICO', 'GERENCIA').

---

# 2. Diccionario de Datos

### Tabla: 'specialties'

| Atributo         | Tipo de Dato | Restricciones / Notas                                     |
| :--------------- | :----------- | :-------------------------------------------------------- |
| 'id'             | INT          | [PK], Autoincremental                                     |
| 'name'           | VARCHAR(100) | Obligatorio, [Unico]                                      |
| 'allowed_gender' | ENUM         | Obligatorio, Default 'TODOS' (TODOS, MASCULINO, FEMENINO) |
| 'min_age'        | INT          | Opcional, Nullable                                        |
| 'max_age'        | INT          | Opcional, Nullable                                        |
| 'is_active'      | BOOLEAN      | Obligatorio, Default TRUE                                 |
| 'created_at'     | TIMESTAMP    | Obligatorio, Default NOW                                  |
| 'updated_at'     | TIMESTAMP    | Obligatorio, Auto-update                                  |

### Tabla: 'doctors'

| Atributo       | Tipo de Dato | Restricciones / Notas                  |
| :------------- | :----------- | :------------------------------------- |
| 'id'           | INT          | [PK], Autoincremental                  |
| 'first_name'   | VARCHAR(100) | Obligatorio                            |
| 'last_name'    | VARCHAR(100) | Obligatorio                            |
| 'specialty_id' | INT          | Obligatorio, [FK] -> 'specialties(id)' |
| 'user_id'      | INT          | Opcional, [FK], [Unico] -> 'users(id)' |
| 'is_active'    | BOOLEAN      | Obligatorio, Default TRUE              |
| 'created_at'   | TIMESTAMP    | Obligatorio, Default NOW               |
| 'updated_at'   | TIMESTAMP    | Obligatorio, Auto-update               |

### Tabla: 'patients'

| Atributo     | Tipo de Dato | Restricciones / Notas                   |
| :----------- | :----------- | :-------------------------------------- |
| 'id'         | INT          | [PK], Autoincremental                   |
| 'first_name' | VARCHAR(100) | Obligatorio                             |
| 'last_name'  | VARCHAR(100) | Obligatorio                             |
| 'email'      | VARCHAR(150) | Obligatorio, [Unico]                    |
| 'phone'      | VARCHAR(20)  | Obligatorio                             |
| 'gender'     | ENUM         | Obligatorio (MASCULINO, FEMENINO, OTRO) |
| 'birth_date' | DATE         | Obligatorio, no futura                  |
| 'is_active'  | BOOLEAN      | Obligatorio, Default TRUE               |
| 'created_at' | TIMESTAMP    | Obligatorio, Default NOW                |
| 'updated_at' | TIMESTAMP    | Obligatorio, Auto-update                |

### Tabla: 'appointments'

| Atributo       | Tipo de Dato | Restricciones / Notas                                    |
| :------------- | :----------- | :------------------------------------------------------- |
| 'id'           | INT          | [PK], Autoincremental                                    |
| 'patient_id'   | INT          | Obligatorio, [FK] -> 'patients(id)'                      |
| 'doctor_id'    | INT          | Obligatorio, [FK] -> 'doctors(id)'                       |
| 'scheduled_at' | TIMESTAMP    | Obligatorio, fecha/hora futura                           |
| 'reason'       | TEXT         | Opcional                                                 |
| 'status'       | ENUM         | Default 'PROGRAMADA' (PROGRAMADA, COMPLETADA, CANCELADA) |
| 'created_at'   | TIMESTAMP    | Obligatorio, Default NOW                                 |
| 'updated_at'   | TIMESTAMP    | Obligatorio, Auto-update                                 |

### Tabla: 'users'

| Atributo     | Tipo de Dato | Restricciones / Notas                         |
| :----------- | :----------- | :-------------------------------------------- |
| 'id'         | INT          | [PK], Autoincremental                         |
| 'email'      | VARCHAR(150) | Obligatorio, [Unico]                          |
| 'password'   | VARCHAR(255) | Obligatorio, Hashed                           |
| 'role'       | ENUM         | Obligatorio (RECEPCIONISTA, MEDICO, GERENCIA) |
| 'is_active'  | BOOLEAN      | Obligatorio, Default TRUE                     |
| 'created_at' | TIMESTAMP    | Obligatorio, Default NOW                      |
| 'updated_at' | TIMESTAMP    | Obligatorio, Auto-update                      |

---

## 3. Relaciones del Modelo

- **Especialidad — Medicos (1:N):** _Una especialidad puede tener muchos medicos, pero un medico pertenece a una sola especialidad._
- **Medico — Citas (1:N):** _Un medico puede tener muchas citas programadas, pero una cita pertenece a un solo medico._
- **Paciente — Citas (1:N):** _Un paciente puede tener muchas citas registradas, pero una cita pertenece a un solo paciente._
- **Usuario — Medico (1:1 Opcional):** _Un usuario puede estar asociado a un solo medico, y un medico puede tener asignada una sola cuenta de usuario._

# 4. Reglas de Negocio

1. **Soft Delete Condicional:** Ninguna entidad principal se destruye fisicamente de la base de datos. Solo se actualiza 'is_active = false'. En las consultas 'GET', los usuarios con rol 'GERENCIA' pueden visualizar todos los registros (activos e inactivos), mientras que 'RECEPCIONISTA' y 'MEDICO' solo acceden a registros con 'is_active = true'.
2. **Restriccion de Especialidad:** Al agendar una cita, se verifica que el genero biologico del paciente coincida con 'allowed_gender' (si no es 'TODOS') y que la edad cumplida a la fecha de la cita se encuentre dentro del rango '[min_age, max_age]'.
