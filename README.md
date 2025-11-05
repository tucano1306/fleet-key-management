# Fleet Key Management System 🔑

[![CI](https://github.com/tucano1306/fleet-key-management/actions/workflows/ci.yml/badge.svg)](https://github.com/tucano1306/fleet-key-management/actions/workflows/ci.yml)
[![Deploy](https://github.com/tucano1306/fleet-key-management/actions/workflows/deploy.yml/badge.svg)](https://github.com/tucano1306/fleet-key-management/actions/workflows/deploy.yml)
[![Code Quality](https://github.com/tucano1306/fleet-key-management/actions/workflows/code-quality.yml/badge.svg)](https://github.com/tucano1306/fleet-key-management/actions/workflows/code-quality.yml)

Sistema completo de gestión de llaves de vehículos con autenticación basada en PIN, desarrollado con Next.js 14, TypeScript, Prisma ORM y PostgreSQL.

**🚀 [Deploy en Vercel](./VERCEL_QUICKSTART.md)** | **📚 [Documentación Completa](./DEPLOYMENT.md)**

## 🚀 Características

- **Sistema de Roles**: DISPATCH (admin), DRIVER (chofer), CLEANING_STAFF (limpieza)
- **Autenticación Dual**: ID para dispatch, licencia para choferes/staff
- **Gestión de Llaves**: Retiro y devolución de llaves de vehículos
- **Retiro Rápido**: Interface optimizada para operaciones rápidas
- **Panel Administrativo**: Monitoreo, reportes y alertas en tiempo real
- **Dashboard Responsive**: Interfaz adaptable para escritorio, tablet y móvil
- **Transacciones en Tiempo Real**: Seguimiento de quién tiene cada llave
- **Registro de Incidentes**: Documentación de condiciones del vehículo
- **Base de Datos SQLite**: Almacenamiento confiable con Prisma ORM
- **Server Actions**: Operaciones del servidor optimizadas con Next.js 14

## 📋 Prerrequisitos

- Node.js 18.x o superior
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd app-key
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` y configurar:
```env
# Development - PostgreSQL local o SQLite
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fleet_key_db?schema=public"
# O usar SQLite: DATABASE_URL="file:./dev.db"

NEXTAUTH_SECRET="tu-secreto-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Configurar la base de datos**
```bash
# Crear las migraciones
npm run db:migrate

# Generar el cliente de Prisma
npm run db:generate

# Poblar con datos de prueba
npm run db:seed
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 👥 Usuarios de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

- **Usuario 1**: EMP001 / PIN: 1234
- **Usuario 2**: EMP002 / PIN: 5678
- **Usuario 3**: EMP003 / PIN: 9012

## 🗂️ Estructura del Proyecto

```
app-key/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Página de inicio de sesión
│   │   └── layout.tsx      # Layout para rutas de autenticación
│   ├── dashboard/
│   │   ├── actions.ts      # Server actions para checkout/checkin
│   │   ├── layout.tsx      # Layout principal con header
│   │   └── page.tsx        # Dashboard principal
│   ├── globals.css         # Estilos globales con Tailwind
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Página inicial (redirect)
├── components/
│   ├── ui/                 # Componentes UI reutilizables
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── key-list.tsx        # Lista de llaves disponibles
│   └── my-transactions.tsx # Llaves actualmente retiradas
├── lib/
│   ├── auth.ts             # Lógica de autenticación y sesiones
│   ├── prisma.ts           # Cliente de Prisma
│   └── utils.ts            # Funciones utilitarias
├── prisma/
│   ├── schema.prisma       # Esquema de base de datos
│   └── seed.ts             # Datos de prueba
└── package.json
```

## 🗄️ Esquema de Base de Datos

### User (Usuarios/Conductores)
- `id`: ID único
- `employeeId`: ID de empleado (único)
- `fullName`: Nombre completo
- `licenseNumber`: Número de licencia (único)
- `pinHash`: PIN hasheado con bcrypt
- `isActive`: Estado del usuario

### Key (Llaves)
- `id`: ID único
- `keyNumber`: Número de llave (único)
- `vehicleInfo`: Información del vehículo
- `location`: Ubicación física de la llave
- `status`: AVAILABLE | CHECKED_OUT | MAINTENANCE | LOST
- `notes`: Notas opcionales

### KeyTransaction (Transacciones)
- `id`: ID único
- `keyId`: Referencia a la llave
- `userId`: Referencia al usuario
- `checkoutTime`: Hora de retiro
- `checkinTime`: Hora de devolución (nullable)
- `status`: CHECKED_OUT | CHECKED_IN | OVERDUE

## 🎨 Diseño Responsive

El sistema está optimizado para múltiples dispositivos:

- **Mobile**: < 640px - Interfaz táctil optimizada
- **Tablet**: 640px - 1024px - Layout de 1-2 columnas
- **Desktop**: > 1024px - Layout completo de 3 columnas

Características responsive:
- Navegación colapsable en móviles
- Botones de tamaño apropiado para touch
- Formularios optimizados para entrada móvil
- Grid adaptable según el tamaño de pantalla

## 🔒 Seguridad

- PINs hasheados con bcrypt (10 rounds)
- Sesiones HTTP-only cookies
- Validación de entrada en cliente y servidor
- Protección contra CSRF
- Políticas de autenticación estrictas

## 📦 Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm start            # Iniciar servidor de producción
npm run lint         # Ejecutar linter
npm run db:generate  # Generar cliente de Prisma
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Poblar base de datos
npm run db:studio    # Abrir Prisma Studio
```

## 🚢 Deployment en Vercel

### 🚀 Deployment Rápido (5 minutos)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tucano1306/fleet-key-management)

**Ver guía completa**: [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)

**Pasos resumidos**:

1. **Crear Database en Vercel**
   - Dashboard → Storage → Create Database → Postgres
   - Nombre: `fleet-key-db`

2. **Importar desde GitHub**
   - Vercel Dashboard → Add New Project
   - Importar: `tucano1306/fleet-key-management`

3. **Conectar Database**
   - Storage tab → Connect Store
   - Vercel conecta automáticamente las variables

4. **Configurar Variables**
   ```bash
   NEXTAUTH_SECRET=genera-con-comando
   NEXTAUTH_URL=https://tu-proyecto.vercel.app
   ```

5. **Ejecutar Migraciones**
   ```bash
   npm i -g vercel
   vercel login && vercel link
   vercel env pull .env.production
   npx prisma migrate deploy
   npx prisma db seed
   ```

6. **¡Listo!** → `https://tu-proyecto.vercel.app`

### Otras Plataformas

- **Railway**: PostgreSQL + Next.js en un solo lugar
- **Render**: Alternativa con PostgreSQL incluido
- **AWS/GCP/Azure**: Para mayor control

**Documentación completa**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 📞 Soporte

Para preguntas o problemas, por favor abrir un issue en el repositorio.

---

Desarrollado con ❤️ usando Next.js, TypeScript y Tailwind CSS
