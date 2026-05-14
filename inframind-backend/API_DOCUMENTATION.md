# Inframind Backend API Documentation

## Overview
This document describes all available API endpoints in the Inframind Backend. All endpoints return JSON responses with consistent formatting including `success`, `data`, and `timestamp` fields.

## Base URL
```
http://localhost:5000/api
```

## Health & Info Endpoints

### Health Check
- **GET** `/api/health`
- **Description**: Simple health check endpoint
- **Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Server Metrics (System)
- **GET** `/api/metrics`
- **Description**: Returns current system metrics (CPU and memory usage)
- **Response**:
```json
{
  "success": true,
  "data": {
    "cpu": {
      "user": 1000000,
      "system": 500000
    },
    "memory": {
      "rss": 52428800,
      "heapTotal": 33554432,
      "heapUsed": 20971520,
      "external": 1048576
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Server Management Endpoints

### List All Servers
- **GET** `/api/servers`
- **Description**: Retrieve all servers with their latest metrics and open alerts
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clr1a2b3c4d5e6f",
      "name": "Production Web Server",
      "hostName": "prod-web-01.example.com",
      "status": "stable",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "metrics": [
        {
          "id": "clr1x2y3z4a5b6c",
          "serverId": "clr1a2b3c4d5e6f",
          "cpuUsage": 45.2,
          "memoryUsage": 62.1,
          "networkUsage": 28.5,
          "diskUsage": 71.3,
          "timestamp": "2024-01-15T10:29:00.000Z"
        }
      ],
      "alerts": [
        {
          "id": "clr1p2q3r4s5t6u",
          "serverId": "clr1a2b3c4d5e6f",
          "type": "HIGH_CPU",
          "message": "CPU usage exceeded 80%",
          "severity": "warning",
          "status": "open",
          "createdAt": "2024-01-15T09:00:00.000Z",
          "resolvedAt": null
        }
      ]
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Server Details
- **GET** `/api/servers/:id`
- **Parameters**:
  - `id` (path): Server ID
- **Description**: Get detailed information about a specific server including all metrics and alerts
- **Response**: Server object with all metrics and alerts (up to 100 metrics and 50 alerts)

### Create New Server
- **POST** `/api/servers`
- **Description**: Create a new server entry
- **Request Body**:
```json
{
  "name": "Production Web Server",
  "hostName": "prod-web-01.example.com",
  "status": "stable"
}
```
- **Response**: 
```json
{
  "success": true,
  "data": {
    "id": "clr1a2b3c4d5e6f",
    "name": "Production Web Server",
    "hostName": "prod-web-01.example.com",
    "status": "stable",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Server created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
- **Status Code**: 201

### Update Server
- **PUT** `/api/servers/:id`
- **Parameters**:
  - `id` (path): Server ID
- **Description**: Update server information
- **Request Body** (all fields optional):
```json
{
  "name": "Updated Server Name",
  "hostName": "updated-host.example.com",
  "status": "unhealthy"
}
```
- **Response**: Updated server object with metrics and alerts
- **Status Code**: 200

### Delete Server
- **DELETE** `/api/servers/:id`
- **Parameters**:
  - `id` (path): Server ID
- **Description**: Delete a server and all associated metrics and alerts
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "clr1a2b3c4d5e6f",
    "name": "Production Web Server",
    "hostName": "prod-web-01.example.com",
    "status": "stable",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Server deleted successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
- **Status Code**: 200

---

## Metrics Endpoints

### List All Metrics
- **GET** `/api/metrics`
- **Query Parameters**:
  - `serverId` (optional): Filter metrics by server ID
  - `limit` (optional): Number of results per page (default: 100, max: 1000)
  - `offset` (optional): Number of results to skip (default: 0)
- **Description**: Get all metrics with pagination and optional filtering
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clr1x2y3z4a5b6c",
      "serverId": "clr1a2b3c4d5e6f",
      "cpuUsage": 45.2,
      "memoryUsage": 62.1,
      "networkUsage": 28.5,
      "diskUsage": 71.3,
      "timestamp": "2024-01-15T10:29:00.000Z",
      "server": {
        "id": "clr1a2b3c4d5e6f",
        "name": "Production Web Server",
        "hostName": "prod-web-01.example.com",
        "status": "stable",
        "createdAt": "2024-01-10T08:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    }
  ],
  "pagination": {
    "total": 1500,
    "limit": 100,
    "offset": 0
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Specific Metric
- **GET** `/api/metrics/:id`
- **Parameters**:
  - `id` (path): Metric ID
- **Description**: Get detailed information about a specific metric
- **Response**: Metric object with associated server info

### Create Metric
- **POST** `/api/metrics`
- **Description**: Create a new metric entry for a server
- **Request Body**:
```json
{
  "serverId": "clr1a2b3c4d5e6f",
  "cpuUsage": 45.2,
  "memoryUsage": 62.1,
  "networkUsage": 28.5,
  "diskUsage": 71.3
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "clr1x2y3z4a5b6c",
    "serverId": "clr1a2b3c4d5e6f",
    "cpuUsage": 45.2,
    "memoryUsage": 62.1,
    "networkUsage": 28.5,
    "diskUsage": 71.3,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "server": { ... }
  },
  "message": "Metric created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
- **Status Code**: 201

### Get Latest 24 Metrics for Server
- **GET** `/api/metrics/server/:serverId/latest`
- **Parameters**:
  - `serverId` (path): Server ID
- **Description**: Get the latest 24 metrics for a specific server in chronological order
- **Response**: Array of 24 metrics (or fewer if not available), sorted by timestamp
- **Status Code**: 200

---

## Alerts Endpoints

### List All Alerts
- **GET** `/api/alerts`
- **Query Parameters**:
  - `serverId` (optional): Filter by server ID
  - `severity` (optional): Filter by severity (critical, warning, info)
  - `status` (optional): Filter by status (open, resolved, closed)
  - `limit` (optional): Results per page (default: 100, max: 1000)
  - `offset` (optional): Results to skip (default: 0)
- **Description**: Get alerts with optional filtering and pagination
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clr1p2q3r4s5t6u",
      "serverId": "clr1a2b3c4d5e6f",
      "type": "HIGH_CPU",
      "message": "CPU usage exceeded 80%",
      "severity": "warning",
      "status": "open",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "resolvedAt": null,
      "server": { ... }
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 100,
    "offset": 0
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Alert Details
- **GET** `/api/alerts/:id`
- **Parameters**:
  - `id` (path): Alert ID
- **Description**: Get detailed information about a specific alert
- **Response**: Alert object with associated server info

### Create Alert
- **POST** `/api/alerts`
- **Description**: Create a new alert
- **Request Body**:
```json
{
  "serverId": "clr1a2b3c4d5e6f",
  "type": "HIGH_CPU",
  "message": "CPU usage exceeded 80%",
  "severity": "warning",
  "status": "open"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "clr1p2q3r4s5t6u",
    "serverId": "clr1a2b3c4d5e6f",
    "type": "HIGH_CPU",
    "message": "CPU usage exceeded 80%",
    "severity": "warning",
    "status": "open",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "resolvedAt": null,
    "server": { ... }
  },
  "message": "Alert created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
- **Status Code**: 201

### Update Alert
- **PUT** `/api/alerts/:id`
- **Parameters**:
  - `id` (path): Alert ID
- **Description**: Update alert status or details
- **Request Body** (all fields optional):
```json
{
  "status": "resolved",
  "message": "Issue has been resolved",
  "severity": "info"
}
```
- **Response**: Updated alert object
- **Status Code**: 200
- **Note**: Setting status to "resolved" or "closed" automatically sets the `resolvedAt` timestamp

### Delete Alert
- **DELETE** `/api/alerts/:id`
- **Parameters**:
  - `id` (path): Alert ID
- **Description**: Delete an alert
- **Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Alert deleted successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
- **Status Code**: 200

---

## Dashboard Endpoints

### Get Dashboard Summary
- **GET** `/api/dashboard/summary`
- **Description**: Get overall dashboard statistics and summary
- **Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalServers": 15,
      "totalAlerts": 8,
      "criticalAlerts": 2,
      "warningAlerts": 6
    },
    "serverStatus": {
      "stable": 12,
      "unhealthy": 2,
      "offline": 1
    },
    "metrics": {
      "average": {
        "cpu": 42.5,
        "memory": 58.3,
        "network": 24.2,
        "disk": 65.1
      },
      "recentDataPoints": 450
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: name, hostName, status",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Server not found",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create server",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (missing/invalid parameters)
- **404**: Not Found
- **500**: Internal Server Error

---

## Field Definitions

### Server Object
- `id`: Unique identifier (CUID)
- `name`: Server name/display name
- `hostName`: Hostname or IP address
- `status`: Current status (stable, unhealthy, offline, etc.)
- `createdAt`: ISO 8601 timestamp
- `updatedAt`: ISO 8601 timestamp

### Metric Object
- `id`: Unique identifier
- `serverId`: Associated server ID
- `cpuUsage`: CPU usage percentage (0-100)
- `memoryUsage`: Memory usage percentage (0-100)
- `networkUsage`: Network usage percentage (0-100)
- `diskUsage`: Disk usage percentage (0-100)
- `timestamp`: ISO 8601 timestamp (defaults to creation time)

### Alert Object
- `id`: Unique identifier
- `serverId`: Associated server ID
- `type`: Alert type (e.g., HIGH_CPU, DISK_FULL)
- `message`: Alert message/description
- `severity`: Severity level (critical, warning, info)
- `status`: Alert status (open, resolved, closed)
- `createdAt`: ISO 8601 timestamp
- `resolvedAt`: ISO 8601 timestamp or null

---

## Examples

### Example 1: Create a server and add metrics
```bash
# Create server
curl -X POST http://localhost:5000/api/servers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DB Server",
    "hostName": "db-01.prod.local",
    "status": "stable"
  }'

# Add metric for that server
curl -X POST http://localhost:5000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": "clr1a2b3c4d5e6f",
    "cpuUsage": 55.2,
    "memoryUsage": 78.5,
    "networkUsage": 35.1,
    "diskUsage": 82.3
  }'
```

### Example 2: Get alerts for a specific server
```bash
curl "http://localhost:5000/api/alerts?serverId=clr1a2b3c4d5e6f&severity=critical"
```

### Example 3: Get latest metrics and dashboard summary
```bash
# Latest 24 metrics for a server
curl http://localhost:5000/api/metrics/server/clr1a2b3c4d5e6f/latest

# Dashboard summary
curl http://localhost:5000/api/dashboard/summary
```

---

## Notes

- All timestamps are in ISO 8601 format
- All responses include a `timestamp` field for reference
- Pagination defaults: limit=100, offset=0
- Maximum limit is 1000 records per page
- Server IDs and metric/alert IDs are generated using CUID
- Cascading deletes: Deleting a server automatically deletes associated metrics and alerts
