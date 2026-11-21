# EduMentor Hub - Frontend

Angular 21 (Standalone Components, Reactive Forms, Signals, guardas e interceptores funcionales).

## Requisitos

- Node.js 20+ y npm
- Backend `edumentor-backend` en ejecucion en `http://localhost:8080`

## Ejecutar en local

```powershell
npm install
npm start
```

Abrir `http://localhost:4200/` en el navegador.

## Pruebas y compilacion

```powershell
npm test -- --watch=false
npm run build
```

## Rutas implementadas (autenticacion y vistas provisionales por rol)

- `/login` y `/registro`: formularios reactivos conectados a `/api/v1/auth/*` (protegidas con `guestGuard`)
- `/estudiante`, `/tutor`, `/coordinador`: vistas provisionales exclusivas por rol (`SOY <nombre_rol>`, protegidas con `roleGuard` y navbar por permisos)
