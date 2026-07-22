import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: Registry;
  
  // HTTP metrics
  public readonly httpRequestsTotal: Counter<string>;
  public readonly httpRequestDuration: Histogram<string>;
  public readonly httpActiveRequests: Gauge<string>;
  
  // Business metrics
  public readonly searchQueriesTotal: Counter<string>;
  public readonly clicksTotal: Counter<string>;
  public readonly affiliateConversionsTotal: Counter<string>;
  public readonly affiliateRevenueTotal: Counter<string>;
  
  // System metrics
  public readonly cacheHitsTotal: Counter<string>;
  public readonly cacheMissesTotal: Counter<string>;
  public readonly scraperProductsTotal: Counter<string>;
  public readonly scraperErrorsTotal: Counter<string>;
  
  // Queue metrics
  public readonly queueJobsTotal: Counter<string>;
  public readonly queueJobDuration: Histogram<string>;
  public readonly queueActiveJobs: Gauge<string>;

  constructor() {
    this.registry = new Registry();
    
    // HTTP metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.httpActiveRequests = new Gauge({
      name: 'http_active_requests',
      help: 'Number of active HTTP requests',
      registers: [this.registry],
    });

    // Business metrics
    this.searchQueriesTotal = new Counter({
      name: 'search_queries_total',
      help: 'Total number of search queries',
      labelNames: ['source'],
      registers: [this.registry],
    });

    this.clicksTotal = new Counter({
      name: 'clicks_total',
      help: 'Total number of affiliate clicks',
      labelNames: ['retailer', 'product_id'],
      registers: [this.registry],
    });

    this.affiliateConversionsTotal = new Counter({
      name: 'affiliate_conversions_total',
      help: 'Total number of affiliate conversions',
      labelNames: ['retailer'],
      registers: [this.registry],
    });

    this.affiliateRevenueTotal = new Counter({
      name: 'affiliate_revenue_total',
      help: 'Total affiliate revenue in rupees',
      labelNames: ['retailer'],
      registers: [this.registry],
    });

    // System metrics
    this.cacheHitsTotal = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
      registers: [this.registry],
    });

    this.cacheMissesTotal = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
      registers: [this.registry],
    });

    this.scraperProductsTotal = new Counter({
      name: 'scraper_products_total',
      help: 'Total number of products scraped',
      labelNames: ['retailer', 'status'],
      registers: [this.registry],
    });

    this.scraperErrorsTotal = new Counter({
      name: 'scraper_errors_total',
      help: 'Total number of scraper errors',
      labelNames: ['retailer', 'error_type'],
      registers: [this.registry],
    });

    // Queue metrics
    this.queueJobsTotal = new Counter({
      name: 'queue_jobs_total',
      help: 'Total number of queue jobs',
      labelNames: ['queue_name', 'job_type', 'status'],
      registers: [this.registry],
    });

    this.queueJobDuration = new Histogram({
      name: 'queue_job_duration_seconds',
      help: 'Duration of queue jobs in seconds',
      labelNames: ['queue_name', 'job_type'],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 300],
      registers: [this.registry],
    });

    this.queueActiveJobs = new Gauge({
      name: 'queue_active_jobs',
      help: 'Number of active queue jobs',
      labelNames: ['queue_name'],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ register: this.registry });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }

  // Helper methods for recording metrics
  recordHttpRequest(method: string, route: string, status: number, durationMs: number) {
    const labels = { method, route, status: status.toString() };
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(labels, durationMs / 1000);
  }

  recordSearch(source: string = 'api') {
    this.searchQueriesTotal.inc({ source });
  }

  recordClick(retailer: string, productId: string) {
    this.clicksTotal.inc({ retailer, product_id: productId });
  }

  recordConversion(retailer: string, revenue: number) {
    this.affiliateConversionsTotal.inc({ retailer });
    this.affiliateRevenueTotal.inc({ retailer }, revenue);
  }

  recordCacheHit(cacheType: string) {
    this.cacheHitsTotal.inc({ cache_type: cacheType });
  }

  recordCacheMiss(cacheType: string) {
    this.cacheMissesTotal.inc({ cache_type: cacheType });
  }

  recordScrapedProducts(retailer: string, count: number, status: 'success' | 'failed') {
    this.scraperProductsTotal.inc({ retailer, status }, count);
  }

  recordScraperError(retailer: string, errorType: string) {
    this.scraperErrorsTotal.inc({ retailer, error_type: errorType });
  }

  recordQueueJob(queueName: string, jobType: string, status: 'completed' | 'failed' | 'added') {
    this.queueJobsTotal.inc({ queue_name: queueName, job_type: jobType, status });
  }

  recordQueueJobDuration(queueName: string, jobType: string, durationMs: number) {
    this.queueJobDuration.observe({ queue_name: queueName, job_type: jobType }, durationMs / 1000);
  }
}
