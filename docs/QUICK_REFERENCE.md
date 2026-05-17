# API Quick Reference Guide

## 🚀 Start the Server
```bash
npm run dev
```
Server runs on `http://localhost:5000`

## 📡 Core Endpoints

### Servers
```bash
# List all servers
GET /api/servers

# Get specific server
GET /api/servers/{id}

# Create server
POST /api/servers
{
  "name": "Server Name",
  "hostName": "hostname.local",
  "status": "stable"
}

# Update server
PUT /api/servers/{id}
{
  "name": "Updated Name",
  "status": "unhealthy"
}

# Delete server
DELETE /api/servers/{id}
```

### Metrics
```bash
# List all metrics (with pagination)
GET /api/metrics?serverId={id}&limit=100&offset=0

# Get specific metric
GET /api/metrics/{id}

# Create metric
POST /api/metrics
{
  "serverId": "{id}",
  "cpuUsage": 45.2,
  "memoryUsage": 62.1,
  "networkUsage": 28.5,
  "diskUsage": 71.3
}

# Get latest 24 metrics for server
GET /api/metrics/server/{serverId}/latest
```

### Alerts
```bash
# List all alerts (with filters)
GET /api/alerts?severity=critical&status=open&limit=100

# Get specific alert
GET /api/alerts/{id}

# Create alert
POST /api/alerts
{
  "serverId": "{id}",
  "type": "HIGH_CPU",
  "message": "CPU exceeded 80%",
  "severity": "warning",
  "status": "open"
}

# Update alert
PUT /api/alerts/{id}
{
  "status": "resolved"
}

# Delete alert
DELETE /api/alerts/{id}
```

### Dashboard
```bash
# Get summary
GET /api/dashboard/summary
```

## 📋 Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

## 🔍 Filter Examples
```bash
# Get critical alerts
GET /api/alerts?severity=critical

# Get open alerts for specific server
GET /api/alerts?serverId={id}&status=open

# Get metrics with pagination
GET /api/metrics?limit=50&offset=100
```

## 📊 Response Format
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Optional message"
}
```

## 💡 Common Values

### Server Status
- `stable`
- `unhealthy`
- `offline`

### Alert Severity
- `critical`
- `warning`
- `info`

### Alert Status
- `open`
- `resolved`
- `closed`

### Alert Types
- `HIGH_CPU`
- `HIGH_MEMORY`
- `DISK_FULL`
- `HIGH_NETWORK`
- `SERVICE_DOWN`

## 🧪 Quick Test Sequence

```bash
# 1. Create a server
curl -X POST http://localhost:5000/api/servers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Server",
    "hostName": "test.local",
    "status": "stable"
  }'

# 2. Get the server ID from response, use it as {serverId}

# 3. Create a metric
curl -X POST http://localhost:5000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": "{serverId}",
    "cpuUsage": 50,
    "memoryUsage": 60,
    "networkUsage": 30,
    "diskUsage": 70
  }'

# 4. Create an alert
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": "{serverId}",
    "type": "HIGH_CPU",
    "message": "CPU usage is high",
    "severity": "warning",
    "status": "open"
  }'

# 5. Get dashboard summary
curl http://localhost:5000/api/dashboard/summary

# 6. List all servers
curl http://localhost:5000/api/servers

# 7. Get server details
curl http://localhost:5000/api/servers/{serverId}

# 8. Get latest metrics
curl http://localhost:5000/api/metrics/server/{serverId}/latest
```

## 🛠️ Environment

- **Port**: 5000 (configurable via PORT env var)
- **Database**: SQLite (dev.db)
- **CORS**: Enabled for http://localhost:3000
- **Language**: TypeScript
- **Framework**: Express.js

## 📚 Documentation

- Full docs: See `API_DOCUMENTATION.md`
- Implementation details: See `IMPLEMENTATION_SUMMARY.md`

---

**Ready to use!** Start with `npm run dev`
