// SafeDrive AI - Application Routes

export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
    UNAUTHORIZED: '/unauthorized',
  },
  ADMIN: {
    ROOT: '/admin',
    OVERVIEW: '/admin/overview',
    CUSTOMERS: '/admin/customers',
    CUSTOMER_DETAIL: (id: string = ':id') => `/admin/customers/${id}`,
    COMPANIES: '/admin/companies',
    COMPANY_DETAIL: (id: string = ':id') => `/admin/companies/${id}`,
    SALES: '/admin/sales',
    SUBSCRIPTIONS: '/admin/subscriptions',
    INVOICES: '/admin/invoices',
  },
  OWNER: {
    ROOT: '/owner',
    OVERVIEW: '/owner/overview',
    VEHICLES: '/owner/vehicles',
    VEHICLE_DETAIL: (id: string = ':id') => `/owner/vehicles/${id}`,
    DRIVERS: '/owner/drivers',
    DRIVER_DETAIL: (id: string = ':id') => `/owner/drivers/${id}`,
    INCIDENTS: '/owner/incidents',
    INCIDENT_DETAIL: (id: string = ':id') => `/owner/incidents/${id}`,
    REPORTS: '/owner/reports',
  },
  LAB: {
    ROOT: '/lab',
    DEVICES: '/lab',
    DEVICE_DETAIL: (id: string = ':id') => `/lab/devices/${id}`,
    EVENTS: '/lab/events',
  },
  DRIVER: {
    ROOT: '/driver',
    MONITOR: '/driver/monitor',
    SESSION: '/driver/session',
  },
} as const;
