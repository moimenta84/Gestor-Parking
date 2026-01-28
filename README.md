# 🚗 ParkingPereMaria – Gestor de Parking  
Aplicación web desarrollada para gestionar el acceso, control y administración del parking interno de la empresa **ParkingPereMaria**.  
Proyecto realizado como parte del examen de *Desarrollo Web en Entorno Cliente – 2º DAW*.

---

##  Demo en GitHub Pages  
Puedes acceder a la aplicación desplegada aquí:  
**https://TU_USUARIO.github.io/TU_REPO/**  
*(Sustituye por tu usuario y nombre de repositorio)*

---

##  Descripción del proyecto  
El sistema permite registrar vehículos, controlar entradas y salidas, gestionar plazas libres y administrar el operario responsable. Toda la lógica está implementada en JavaScript utilizando:

- Manipulación del **DOM**
- **localStorage** para persistencia
- Objetos y arrays
- Fechas y tiempos
- Eventos y validaciones

---

##  Funcionalidades principales

### 👤 Gestión de operario
- Solicitud del nombre al iniciar la aplicación  
- Persistencia mediante localStorage  
- Cambio de operario desde el menú  
- Mensaje dinámico: *“Bienvenido/a, NOMBRE_DEL_OPERARIO”*

---

### 🚘 Registro de vehículos
Cada vehículo almacena:
- Propietario: Alumno / Profesor  
- Tipo: Coche / Moto  
- Matrícula (única)  
- Curso (2025)  
- Operario que lo registró  
- Tiempo total acumulado  
- Historial de entradas y salidas  
- Estado actual (dentro / fuera)

---

### 🟢 Entrada de vehículo
- Entrada por matrícula  
- Verificación de existencia  
- Control de plazas disponibles  
- Registro de fecha/hora  
- Cambio de estado a *en parking*

---

### 🔴 Salida de vehículo
- Verificación de que está dentro  
- Cálculo del tiempo desde la última entrada  
- Suma al total acumulado  
- Registro de salida  
- Liberación de plaza

---

### 📋 Listado de vehículos
Incluye:
- Matrícula  
- Propietario  
- Tipo  
- Estado  
- Tiempo total  
- Última entrada  
- Última salida  
- Operario que lo registró  

Además:
- Total de vehículos registrados  
- Plazas libres actuales  
- Colores diferenciados según tipo/propietario

---

### 🔢 Contadores de plazas libres
Siempre visibles y actualizados tras:
- Registro  
- Entrada  
- Salida  

---

## 🛠️ Tecnologías utilizadas
- **HTML5**  
- **CSS3**  
- **JavaScript**  
- **localStorage**  
- GitHub Pages para despliegue  

---


