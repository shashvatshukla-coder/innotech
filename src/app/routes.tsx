import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Shell } from '../components/layout/shell';
import { ProtectedRoute } from '../features/auth/protected-route';
import { LoginPage } from '../features/auth/login-page';
import { UnauthorizedPage } from '../features/auth/unauthorized-page';

// Admin
import { AdminOverviewPage } from '../features/admin/admin-overview-page';
import { CustomersPage } from '../features/admin/customers-page';
import { CustomerDetailPage } from '../features/admin/customer-detail-page';
import { CompaniesPage } from '../features/admin/companies-page';
import { SalesPage } from '../features/admin/sales-page';
import { InvoicesPage } from '../features/admin/invoices-page';

// Fleet
import { FleetOverviewPage } from '../features/fleet/fleet-overview-page';
import { VehiclesPage } from '../features/fleet/vehicles-page';
import { VehicleDetailPage } from '../features/fleet/vehicle-detail-page';
import { DriversPage } from '../features/fleet/drivers-page';
import { DriverDetailPage } from '../features/fleet/driver-detail-page';
import { IncidentsPage } from '../features/fleet/incidents-page';
import { IncidentDetailPage } from '../features/fleet/incident-detail-page';
import { ReportsPage } from '../features/fleet/reports-page';

// Lab
import { DeviceLabPage } from '../features/device-lab/device-lab-page';
import { DeviceDetailLabPage } from '../features/device-lab/device-detail-lab-page';
import { EventsTimelinePage } from '../features/device-lab/events-timeline-page';

// Driver
import { DriverMonitorPage } from '../features/driver-monitor/driver-monitor-page';
import { DriverSessionPage } from '../features/driver-monitor/driver-session-page';

import { ROUTES } from '../constants/routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.PUBLIC.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.PUBLIC.UNAUTHORIZED,
    element: <UnauthorizedPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Shell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.OWNER.OVERVIEW} replace />,
      },
      // Admin Routes
      {
        path: ROUTES.ADMIN.ROOT,
        children: [
          { index: true, element: <Navigate to={ROUTES.ADMIN.OVERVIEW} replace /> },
          {
            path: 'overview',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOverviewPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customers',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <CustomersPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customers/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <CustomerDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'companies',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <CompaniesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'companies/:id',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <CustomerDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'sales',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <SalesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'subscriptions',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <SalesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'invoices',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <InvoicesPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      // Fleet Owner / Manager / Reviewer Routes
      {
        path: ROUTES.OWNER.ROOT,
        children: [
          { index: true, element: <Navigate to={ROUTES.OWNER.OVERVIEW} replace /> },
          {
            path: 'overview',
            element: (
              <ProtectedRoute allowedRoles={['owner', 'manager', 'reviewer']}>
                <FleetOverviewPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'vehicles',
            element: (
              <ProtectedRoute allowedRoles={['owner', 'manager', 'reviewer']}>
                <VehiclesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'vehicles/:id',
            element: (
              <ProtectedRoute allowedRoles={['owner', 'manager', 'reviewer']}>
                <VehicleDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'drivers',
            element: (
              <ProtectedRoute allowedRoles={['owner', 'manager', 'reviewer']}>
                <DriversPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'drivers/:id',
            element: (
              <ProtectedRoute allowedRoles={['owner', 'manager', 'reviewer']}>
                <DriverDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'incidents',
            element: (
              <ProtectedRoute allowedRoles={['owner', 'manager', 'reviewer']}>
                <IncidentsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'incidents/:id',
            element: (
              <ProtectedRoute allowedRoles={['owner', 'manager', 'reviewer']}>
                <IncidentDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'reports',
            element: (
              <ProtectedRoute allowedRoles={['owner', 'manager', 'reviewer']}>
                <ReportsPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      // AI Testing Lab Routes
      {
        path: ROUTES.LAB.ROOT,
        children: [
          { index: true, element: <DeviceLabPage /> },
          { path: 'devices/:id', element: <DeviceDetailLabPage /> },
          { path: 'events', element: <EventsTimelinePage /> },
        ],
      },
      // Driver In-Cab Routes
      {
        path: ROUTES.DRIVER.ROOT,
        children: [
          { index: true, element: <Navigate to={ROUTES.DRIVER.MONITOR} replace /> },
          { path: 'monitor', element: <DriverMonitorPage /> },
          { path: 'session', element: <DriverSessionPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.PUBLIC.LOGIN} replace />,
  },
]);
