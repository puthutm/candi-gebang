export interface EventEnvelope<T = any> {
  event_id: string;
  event_name: string;
  event_version: string;
  event_key: string;
  event_type: 'DOMAIN_EVENT' | 'INTEGRATION_EVENT' | 'NOTIFICATION_EVENT' | 'SNAPSHOT_EVENT';
  publisher_service: string;
  publisher_database: string;
  aggregate_type: string;
  aggregate_id: string;
  correlation_id: string;
  causation_id: string;
  occurred_at: string;
  published_at?: string;
  payload: T;
}
