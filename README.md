# Shifto 🚀

**Organiza tus turnos de trabajo de forma inteligente**

Shifto es una aplicación web moderna diseñada para empleados que trabajan bajo modalidades de horarios rotativos. Proporciona herramientas de autogestión para empleados y una plataforma de organización transparente para empleadores.

## 🎯 Objetivo

Proveer organización y transparencia a un mercado tapado de irregularidades en el sector de horarios rotativos, especialmente en cafeterías, restaurantes, supermercados y negocios similares.

## ✨ Características Principales

### Para Empleados (Modo Personal)

#### 📅 **Gestión de Turnos**
- **Crear turnos**: Selecciona fechas, horarios de entrada/salida con validación automática
- **Configuración de tarifas**: Diferentes tarifas para días de semana vs. fines de semana/feriados
- **Cálculos automáticos**: Horas trabajadas y ganancias estimadas
- **Validación de superposición**: Previene conflictos de horarios

#### 📝 **Notas y Tareas**
- **Notas**: Recordatorios generales para el turno
- **Tareas obligatorias**: Lista de actividades que deben completarse
- **Seguimiento**: Marcar tareas como completadas o fallidas para métricas

#### ⏰ **Control de Turnos en Tiempo Real**
- **Iniciar turno**: Comienza el seguimiento cuando llegues al trabajo
- **Cronómetro en vivo**: Ve el tiempo transcurrido en tiempo real
- **Finalizar turno**: Calcula automáticamente horas reales y ganancias finales
- **Notas de finalización**: Agrega observaciones del turno completado

#### 📊 **Vista de Calendario**
- **Calendario visual**: Visualiza todos tus turnos programados, activos y completados
- **Códigos de color**: Diferencia entre turnos programados, activos y completados
- **Detalles rápidos**: Información de ganancias y tareas por día
- **Estadísticas**: Resumen de horas trabajadas y ganancias totales

#### 🔔 **Sistema de Notificaciones** (Próximamente)
- Recordatorios 30 minutos antes del turno (personalizable)
- Notificaciones de finalización de turno
- Alertas de tareas pendientes

### Para Empleadores (Modo Empresarial) - En Desarrollo

#### 👥 **Gestión de Equipos**
- Crear espacios de trabajo compartidos
- Agregar empleados al grupo
- Asignar turnos a empleados específicos
- Vista de estado actual del lugar de trabajo

#### 📋 **Asignación de Tareas**
- Asignar tareas específicas por empleado
- Seguimiento del estado de tareas (completado, en progreso, cancelado)
- Métricas de productividad por empleado

#### 💬 **Comunicación**
- Chat integrado para comunicación directa
- Notificaciones en tiempo real
- Coordinación de cambios de turno

#### 📈 **Reportes y Analytics**
- Reportes por empleado
- Análisis por período (día/semana/mes/año)
- Métricas de productividad y cumplimiento

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite
- **Estilos**: CSS3 (Diseño responsivo)
- **Calendario**: React-Calendar
- **Almacenamiento**: LocalStorage (futuro: base de datos)
- **Estado**: Context API + useReducer

## 🏗️ Arquitectura

```
src/
├── components/          # Componentes reutilizables
│   ├── calendar/       # Componentes de calendario
│   ├── shift/          # Gestión de turnos
│   ├── user/           # Configuración de usuario
│   └── common/         # Componentes comunes
├── context/            # Contextos de React (UserContext, ShiftContext)
├── hooks/              # Hooks personalizados
├── pages/              # Páginas principales
├── utils/              # Utilidades (fechas, validación, storage)
└── styles/             # Archivos CSS organizados
```

## 🚀 Comenzar

### Prerrequisitos
- Node.js 16+ 
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/luismanuelvera/shifto.git
cd shifto
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:5173/shifto
```

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construcción para producción
npm run preview      # Preview de la build
npm run deploy       # Deploy a GitHub Pages
```

## 🎮 Cómo Usar

### Primera vez usando Shifto

1. **Configuración inicial**: Al abrir por primera vez, configura tus tarifas por hora
2. **Crear primer turno**: Haz clic en "Crear mi primer turno"
3. **Seleccionar fecha**: Elige el día para tu turno
4. **Configurar horarios**: Establece hora de entrada y salida
5. **Agregar tareas/notas**: Añade recordatorios y tareas obligatorias
6. **Guardar turno**: Tu turno aparecerá en el calendario

### Durante un turno

1. **Iniciar turno**: En el dashboard, haz clic en "▶️ Iniciar" en tu turno
2. **Seguimiento en tiempo real**: Ve el cronómetro en vivo
3. **Gestionar tareas**: Marca tareas como completadas/fallidas
4. **Finalizar turno**: Agrega notas opcionales y finaliza

### Gestión diaria

- **Dashboard**: Ve estadísticas generales y turnos próximos
- **Calendario**: Navega por todos tus turnos pasados y futuros
- **Configuración**: Actualiza tarifas cuando sea necesario

## 📱 Responsive Design

Shifto está optimizado para:
- 📱 **Móviles**: iOS/Android
- 💻 **Tablets**: iPad, Android tablets
- 🖥️ **Desktop**: Navegadores modernos

## 🛣️ Roadmap

### Versión 1.1 (Próximamente)
- [ ] Sistema de notificaciones push
- [ ] Modo offline con sincronización
- [ ] Exportar reportes PDF
- [ ] Temas oscuro/claro

### Versión 2.0 (Futuro)
- [ ] Modo empresarial completo
- [ ] Backend con base de datos
- [ ] Aplicación móvil nativa
- [ ] Integración con sistemas de nómina

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE.txt` para más detalles.

## 👨‍💻 Autor

**Luis Manuel Vera**
- GitHub: [@luismanuelvera](https://github.com/luismanuelvera)

## 🙏 Agradecimientos

- React team por la excelente documentación
- Comunidad open source por las librerías utilizadas
- Beta testers por el feedback inicial

---

**¿Tienes preguntas o sugerencias?** 
Abre un issue o contáctanos directamente.

¡Organiza tus turnos de forma inteligente con Shifto! 🚀
