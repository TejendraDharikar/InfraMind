/**
 * Anomaly Detection Service
 *
 * Threshold-based anomaly detection for server metrics.
 * Analyzes incoming metrics and generates alert suggestions
 * when values exceed defined thresholds.
 *
 * Future: Replace with ML-based detection (Isolation Forest, etc.)
 */

export interface AnomalyAlert {
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

interface MetricInput {
  cpuUsage: number;
  memoryUsage: number;
  networkUsage: number;
  diskUsage: number;
  serverName?: string;
}

interface ThresholdRule {
  metric: keyof Pick<
    MetricInput,
    'cpuUsage' | 'memoryUsage' | 'networkUsage' | 'diskUsage'
  >;
  warningThreshold: number;
  criticalThreshold: number;
  label: string;
}

const THRESHOLD_RULES: ThresholdRule[] = [
  {
    metric: 'cpuUsage',
    warningThreshold: 70,
    criticalThreshold: 85,
    label: 'CPU usage',
  },
  {
    metric: 'memoryUsage',
    warningThreshold: 75,
    criticalThreshold: 90,
    label: 'Memory usage',
  },
  {
    metric: 'networkUsage',
    warningThreshold: 80,
    criticalThreshold: 95,
    label: 'Network usage',
  },
  {
    metric: 'diskUsage',
    warningThreshold: 80,
    criticalThreshold: 92,
    label: 'Disk usage',
  },
];

/**
 * Analyze a set of metrics and return any anomaly alerts.
 */
export function analyzeMetrics(metrics: MetricInput): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = [];
  const serverLabel = metrics.serverName || 'Server';

  for (const rule of THRESHOLD_RULES) {
    const value = metrics[rule.metric];

    if (value >= rule.criticalThreshold) {
      alerts.push({
        type: rule.metric.replace('Usage', ''),
        message: `🔴 Critical: ${rule.label} at ${value.toFixed(1)}% on ${serverLabel}. Immediate action recommended — consider scaling resources or investigating runaway processes.`,
        severity: 'critical',
      });
    } else if (value >= rule.warningThreshold) {
      alerts.push({
        type: rule.metric.replace('Usage', ''),
        message: `⚠️ Warning: ${rule.label} at ${value.toFixed(1)}% on ${serverLabel}. Monitor closely — may require attention if trend continues.`,
        severity: 'warning',
      });
    }
  }

  // Compound anomaly: multiple metrics elevated simultaneously
  const elevatedCount = THRESHOLD_RULES.filter(
    (rule) => metrics[rule.metric] >= rule.warningThreshold,
  ).length;

  if (elevatedCount >= 3) {
    alerts.push({
      type: 'anomaly',
      message: `🧠 AI Insight: ${elevatedCount} metrics elevated simultaneously on ${serverLabel}. This pattern suggests a resource contention issue — consider reviewing active workloads or scaling the instance.`,
      severity: 'critical',
    });
  }

  return alerts;
}

/**
 * Get AI-style recommendation based on metric type and severity.
 */
export function getRecommendation(type: string, severity: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    cpu: {
      warning:
        'Consider identifying CPU-intensive processes with `top` or `htop`. If sustained, evaluate horizontal scaling.',
      critical:
        'Immediate action needed: Check for runaway processes, consider emergency scaling, or enable auto-scaling policies.',
    },
    memory: {
      warning:
        'Review memory allocation. Check for memory leaks using profiling tools. Consider increasing swap or RAM.',
      critical:
        'Risk of OOM kills. Restart memory-intensive services, increase instance memory, or enable memory limits.',
    },
    network: {
      warning:
        'Monitor bandwidth patterns. Check for unexpected traffic spikes or potential DDoS activity.',
      critical:
        'Network saturation detected. Enable rate limiting, check for DDoS, or upgrade network capacity.',
    },
    disk: {
      warning:
        'Clean up old logs, temporary files, and unused data. Consider expanding storage volume.',
      critical:
        'Disk nearly full. Immediately free space by clearing logs/temp files. Expand volume ASAP to avoid service disruption.',
    },
  };

  return (
    recommendations[type]?.[severity] ||
    'Monitor the situation and take action if metrics continue to deteriorate.'
  );
}
