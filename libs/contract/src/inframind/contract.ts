import { initContract } from "@ts-rest/core";
import { ErrorSchema } from "../common";
import z from "zod";
import {
  ServerResponseSchema,
  ServersListResponseSchema,
  CreateServerBodySchema,
  UpdateServerBodySchema,
  GetServersQuerySchema,
  MetricResponseSchema,
  MetricsListResponseSchema,
  LatestMetricsResponseSchema,
  CreateMetricBodySchema,
  GetMetricsQuerySchema,
  AlertResponseSchema,
  AlertsListResponseSchema,
  CreateAlertBodySchema,
  UpdateAlertBodySchema,
  GetAlertsQuerySchema,
  WebhookResponseSchema,
  WebhooksListResponseSchema,
  CreateWebhookBodySchema,
} from "./schema";

const c = initContract();

export const inframindContract = c.router({
  // ==========================================
  // Servers
  // ==========================================
  getServers: {
    method: "GET",
    path: "/servers",
    query: GetServersQuerySchema,
    responses: {
      200: ServersListResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Get all servers",
  },
  getServerById: {
    method: "GET",
    path: "/servers/:id",
    responses: {
      200: ServerResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Get server by ID",
  },
  createServer: {
    method: "POST",
    path: "/servers",
    body: CreateServerBodySchema,
    responses: {
      201: ServerResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Create a new server",
  },
  updateServer: {
    method: "PUT",
    path: "/servers/:id",
    body: UpdateServerBodySchema,
    responses: {
      200: ServerResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Update an existing server",
  },
  deleteServer: {
    method: "DELETE",
    path: "/servers/:id",
    body: z.any(),
    responses: {
      200: ServerResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Delete a server by ID",
  },

  // ==========================================
  // Metrics
  // ==========================================
  getMetrics: {
    method: "GET",
    path: "/metrics",
    query: GetMetricsQuerySchema,
    responses: {
      200: MetricsListResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Get all metrics",
  },
  getMetricById: {
    method: "GET",
    path: "/metrics/:id",
    responses: {
      200: MetricResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Get metric by ID",
  },
  createMetric: {
    method: "POST",
    path: "/metrics",
    body: CreateMetricBodySchema,
    responses: {
      201: MetricResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Create a new metric",
  },
  getLatestServerMetrics: {
    method: "GET",
    path: "/metrics/server/:serverId/latest",
    responses: {
      200: LatestMetricsResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Get latest metrics for a server",
  },

  // ==========================================
  // Alerts
  // ==========================================
  getAlerts: {
    method: "GET",
    path: "/alerts",
    query: GetAlertsQuerySchema,
    responses: {
      200: AlertsListResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Get all alerts",
  },
  getAlertById: {
    method: "GET",
    path: "/alerts/:id",
    responses: {
      200: AlertResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Get alert by ID",
  },
  createAlert: {
    method: "POST",
    path: "/alerts",
    body: CreateAlertBodySchema,
    responses: {
      201: AlertResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Create a new alert",
  },
  updateAlert: {
    method: "PUT",
    path: "/alerts/:id",
    body: UpdateAlertBodySchema,
    responses: {
      200: AlertResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Update an existing alert",
  },
  deleteAlert: {
    method: "DELETE",
    path: "/alerts/:id",
    body: z.any(),
    responses: {
      200: AlertResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Delete an alert by ID",
  },

  // ==========================================
  // Webhooks
  // ==========================================
  getWebhooks: {
    method: "GET",
    path: "/webhooks",
    responses: {
      200: WebhooksListResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Get all webhooks",
  },
  createWebhook: {
    method: "POST",
    path: "/webhooks",
    body: CreateWebhookBodySchema,
    responses: {
      201: WebhookResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Create a new webhook",
  },
  deleteWebhook: {
    method: "DELETE",
    path: "/webhooks/:id",
    body: z.any(),
    responses: {
      200: WebhookResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Delete a webhook by ID",
  },
  toggleWebhook: {
    method: "PUT",
    path: "/webhooks/:id/toggle",
    body: z.any(),
    responses: {
      200: WebhookResponseSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Toggle active state of a webhook by ID",
  },
});
