export class CalendlyEventType {
  uri: string;
  name: string;
  scheduling_url: string;
  pooling_type: string;
  active: boolean;
  duration: number;
  kind: string;
  type: string;
  color: string;
  description_plain: string;
  description_html: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export class CalendlyEventTypesResponse {
  collection: CalendlyEventType[];
}

export class CalendlyAvailableTime {
  status: string;
  start_time: string;
  end_time: string;
}

export class CalendlyAvailableTimesResponse {
  collection: CalendlyAvailableTime[];
}

export class CalendlySchedulingLink {
  booking_url: string;
  owner: string;
  owner_type: string;
}

export class CalendlySchedulingLinkResponse {
  resource: CalendlySchedulingLink;
} 