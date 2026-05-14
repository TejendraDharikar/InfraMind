# Inframind Backend - Project Structure

## 📂 Directory Layout

```
inframind-backend/
├── src/
│   ├── index.ts                    # Main Express app (135 lines)
│   ├── db.ts                       # Prisma client export
│   └── routes/
│       ├── servers.ts             # Server endpoints (207 lines)
│       ├── metrics.ts             # Metrics endpoints (175 lines)
│       ├── alerts.ts              # Alerts endpoints (229 lines)
│       └── dashboard.ts           # Dashboard endpoint (98 lines)
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── dev.db                      # SQLite database
│   └── migrations/                # Database migrations
│
├── dist/                          # Compiled JavaScript (auto-generated)
│   ├── index.js
│   ├── db.js
│   └── routes/
│       ├── servers.js
│       ├── metrics.js
│       ├── alerts.js
│       └── dashboard.js
│
├── node_modules/                  # Dependencies
│
├── package.json                   # Project configuration
├── package-lock.json              # Dependency lock file
├── tsconfig.json                  # TypeScript configuration
│
├── API_DOCUMENTATION.md           # Comprehensive API docs
├── IMPLEMENTATION_SUMMARY.md      # Implementation details
├── QUICK_REFERENCE.md             # Quick API reference
├── PROJECT_STRUCTURE.md           # This file
│
├── .env                           # Environment variables
└── README.md                      # Project README

```

## 📊 File Statistics

| File | Lines | Purpose |
|------|-------|---------|
| src/index.ts | 135 | Main Express app, route mounting |
| src/routes/servers.ts | 207 | Server CRUD endpoints |
| src/routes/metrics.ts | 175 | Metrics endpoints |
| src/routes/alerts.ts | 229 | Alerts CRUD endpoints |
| src/routes/dashboard.ts | 98 | Dashboard summary |
| API_DOCUMENTATION.md | 533 | Full API documentation |
| IMPLEMENTATION_SUMMARY.md | 223 | Implementation overview |
| QUICK_REFERENCE.md | 213 | Quick reference guide |
| **Total** | **1,813** | **Total lines of code** |

## 🎯 Code Organization

### By Feature (Routes)

```
/api/servers                    (5 endpoints)
├── GET     /                   → List all servers
├── GET     /:id                → Get server details
├── POST    /                   → Create server
├── PUT     /:id                → Update server
└── DELETE  /:id                → Delete server

/api/metrics                    (4 endpoints)
├── GET     /                   → List all metrics
├── GET     /:id                → Get metric
├── POST    /                   → Create metric
└── GET     /server/:serverId/latest → Latest 24 metrics

/api/alerts                     (5 endpoints)
├── GET     /                   → List alerts
├── GET     /:id                → Get alert
├── POST    /                   → Create alert
├── PUT     /:id                → Update alert
└── DELETE  /:id                → Delete alert

/api/dashboard                  (1 endpoint)
└── GET     /summary            → Dashboard summary

System Endpoints                (2 endpoints)
├── GET     /api/health         → Health check
└── GET     /api/metrics        → System metrics
```

## 🔄 Request Flow

```
Client Request
    ↓
Express Middleware (CORS, JSON parsing)
    ↓
Route Handler (/routes/*.ts)
    ↓
Validation & Error Handling
    ↓
Database Query (Prisma)
    ↓
JSON Response
    ↓
Client Response
```

## 💾 Database Models (Prisma Schema)

### Server
```prisma
- id: String (CUID)
- name: String
- hostName: String
- status: String
- createdAt: DateTime
- updatedAt: DateTime
- metrics: Metric[]
- alerts: Alert[]
```

### Metric
```prisma
- id: String (CUID)
- serverId: String (FK)
- timestamp: DateTime
- cpuUsage: Float
- memoryUsage: Float
- networkUsage: Float
- diskUsage: Float
```

### Alert
```prisma
- id: String (CUID)
- serverId: String (FK)
- type: String
- message: String
- severity: String
- status: String
- createdAt: DateTime
- resolvedAt: DateTime (nullable)
```

## 🛠️ Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.18.2 | Web framework |
| TypeScript | 5.1.3 | Language |
| Prisma | 6.19.3 | ORM |
| SQLite | (via Prisma) | Database |
| CORS | 2.8.5 | Cross-origin support |
| dotenv | 16.3.1 | Environment variables |

## 📦 Dependencies

### Production
- `@prisma/client`: ^6.19.3 - Database client
- `cors`: ^2.8.5 - CORS middleware
- `dotenv`: ^16.3.1 - Environment config
- `express`: ^4.18.2 - Web framework

### Development
- `@types/cors`: ^2.8.13 - CORS types
- `@types/express`: ^4.17.17 - Express types
- `@types/node`: ^20.3.1 - Node types
- `@typescript-eslint/eslint-plugin`: ^5.59.8 - Linting
- `@typescript-eslint/parser`: ^5.59.8 - TS parser
- `eslint`: ^8.42.0 - Linter
- `prisma`: ^6.19.3 - ORM CLI
- `tsx`: ^3.12.7 - TypeScript executor
- `typescript`: ^5.1.3 - TypeScript compiler

## 🚀 NPM Scripts

```json
{
  "dev": "tsx watch src/index.ts",      // Start with auto-reload
  "build": "tsc",                       // Compile TypeScript
  "start": "node dist/index.js",        // Run compiled code
  "lint": "eslint src --ext .ts"        // Lint code
}
```

## 🔒 Configuration

### Environment Variables (.env)
```
PORT=5000
DATABASE_URL=file:./prisma/dev.db
```

### CORS Settings
- Origin: `http://localhost:3000`
- Credentials: Enabled

### TypeScript Settings (tsconfig.json)
- Target: ES2020
- Module: CommonJS
- Strict mode: Enabled
- Source maps: Enabled for debugging

## 📋 Features

### ✅ Implemented
- [x] Full CRUD for servers, metrics, alerts
- [x] Pagination and filtering
- [x] Dashboard summary
- [x] Error handling
- [x] Input validation
- [x] Relationship includes
- [x] Cascading deletes
- [x] TypeScript type safety
- [x] Graceful shutdown
- [x] Comprehensive logging

### 🔮 Possible Enhancements
- [ ] Authentication/JWT
- [ ] Request logging
- [ ] Rate limiting
- [ ] Caching (Redis)
- [ ] WebSocket real-time
- [ ] Batch operations
- [ ] Data export (CSV/JSON)
- [ ] Metrics aggregation jobs
- [ ] Alert rules engine
- [ ] User management

## 📖 Documentation Files

1. **API_DOCUMENTATION.md** - Full API reference with examples
2. **IMPLEMENTATION_SUMMARY.md** - Implementation overview
3. **QUICK_REFERENCE.md** - Quick copy-paste examples
4. **PROJECT_STRUCTURE.md** - This file

## 🧪 Testing

### Manual Testing
Use curl or Postman with examples in QUICK_REFERENCE.md

### Automated Testing
(To be implemented)

## 🔄 Development Workflow

1. Start dev server: `npm run dev`
2. Make changes to TypeScript files
3. Hot reload automatically applies changes
4. Test endpoints using curl/Postman
5. Run `npm run build` before commit
6. Run `npm run lint` to check code

## 📝 Code Style

- Language: TypeScript
- Framework: Express.js
- Database: Prisma ORM
- Response Format: JSON with consistent schema
- Error Handling: Try-catch with descriptive messages
- Naming: camelCase for variables/functions, PascalCase for types

## 🎨 Response Format

All endpoints return consistent JSON structure:

```json
{
  "success": true/false,
  "data": { ... },
  "message": "Optional message",
  "pagination": { ... },
  "timestamp": "ISO 8601"
}
```

## 🔍 Debugging

### Enable TypeScript source maps
```json
// tsconfig.json
{
  "sourceMap": true
}
```

### Check compiled code
```bash
ls -la dist/
cat dist/index.js
```

### Database inspection
```bash
npm run prisma studio
```

---

**Total Implementation**: 17 API endpoints across 4 resources + 2 system endpoints
**Status**: ✅ Complete and ready for use
