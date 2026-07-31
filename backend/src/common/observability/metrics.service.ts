import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

// Initialize Prometheus metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

@Injectable()
export class MetricsService {
  private register: client.Registry;

  constructor() {
    this.register = register;
  }

  // HTTP request counter
  private httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status_code'],
  });

  // HTTP request duration histogram
  private httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  });

  // Agent instances gauge
  private agentInstancesGauge = new client.Gauge({
    name: 'agent_instances_active',
    help: 'Number of active agent instances',
    labelNames: ['status'],
  });

  // Mission completion counter
  private missionsCompletedTotal = new client.Counter({
    name: 'missions_completed_total',
    help: 'Total number of completed missions',
    labelNames: ['type', 'status'],
  });

  // Simulation duration histogram
  private simulationDuration = new client.Histogram({
    name: 'simulation_duration_seconds',
    help: 'Duration of simulations in seconds',
    labelNames: ['type'],
    buckets: [1, 5, 10, 30, 60, 300],
  });

  // API latency histogram
  private apiLatency = new client.Histogram({
    name: 'api_latency_seconds',
    help: 'API endpoint latency in seconds',
    labelNames: ['endpoint', 'method'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1],
  });

  // Cache hit ratio
  private cacheHitsTotal = new client.Counter({
    name: 'cache_hits_total',
    help: 'Total cache hits',
  });

  private cacheMissesTotal = new client.Counter({
    name: 'cache_misses_total',
    help: 'Total cache misses',
  });

  // Database query duration
  private dbQueryDuration = new client.Histogram({
    name: 'db_query_duration_seconds',
    help: 'Database query duration in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
  });

  registerMetrics() {
    return [
      this.httpRequestsTotal,
      this.httpRequestDuration,
      this.agentInstancesGauge,
      this.missionsCompletedTotal,
      this.simulationDuration,
      this.apiLatency,
      this.cacheHitsTotal,
      this.cacheMissesTotal,
      this.dbQueryDuration,
    ];
  }

  // HTTP metrics
  recordHttpRequest(method: string, path: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, path, status_code: statusCode });
    this.httpRequestDuration.observe({ method, path }, duration / 1000);
  }

  // Agent metrics
  setAgentInstances(status: string, count: number) {
    this.agentInstancesGauge.set({ status }, count);
  }

  // Mission metrics
  incrementMissionCompletion(type: string, status: string) {
    this.missionsCompletedTotal.inc({ type, status });
  }

  // Simulation metrics
  recordSimulationDuration(type: string, durationSeconds: number) {
    this.simulationDuration.observe({ type }, durationSeconds);
  }

  // API metrics
  recordApiLatency(endpoint: string, method: string, durationSeconds: number) {
    this.apiLatency.observe({ endpoint, method }, durationSeconds);
  }

  // Cache metrics
  recordCacheHit() {
    this.cacheHitsTotal.inc();
  }

  recordCacheMiss() {
    this.cacheMissesTotal.inc();
  }

  // Database metrics
  recordDbQuery(operation: string, table: string, durationSeconds: number) {
    this.dbQueryDuration.observe({ operation, table }, durationSeconds);
  }

  // Get all metrics in Prometheus format
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  // Get content type for metrics
  getContentType(): string {
    return this.register.contentType;
  }
}
