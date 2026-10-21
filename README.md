# SafeDrive AI — Enterprise Fleet Safety & Driver Monitoring Platform

SafeDrive AI is an enterprise B2B SaaS platform engineered for commercial transport carriers to monitor driver alertness, detect mobile phone violations, track edge hardware telemetry, and manage safety compliance.

Designed with restrained information density, disciplined typography (Inter), consistent enterprise tokens (navy/slate navigation, neutral canvas, semantic status badges), and strict TypeScript architecture.

---

## 1. Core Dashboards & Implemented Portals

### 1. Platform Administration Portal (`/admin/*`)
- **Executive Overview (`/admin/overview`)**: Derived KPI cards (MRR, active clients, licensed vehicles, outstanding invoices), Monthly Recurring Revenue growth chart, subscription tier distribution, recent client registrations.
- **Client Management (`/admin/customers`)**: Searchable, sortable, paginated enterprise customer table. Includes `CustomerFormModal` with strict Zod validation (validating company name, contact, email, phone, vehicle count, Indian pincode), customer deactivation modal, and full customer dossiers (`/admin/customers/:id`).
- **Organization Directory (`/admin/companies`)**: Legal entities, industry segments, depot locations, and assigned account managers.
- **Commercial Plans & Sales (`/admin/sales`)**: Plan catalog with INR pricing (Starter Fleet, Pro Safety, Enterprise AI), active client subscriptions, renewal dates.
- **Invoices & Receivables (`/admin/invoices`)**: Invoice ledger, payment status badges (Paid, Pending, Overdue), and text invoice download.

### 2. Fleet Owner Portal (`/owner/*`)
- **Fleet Command Overview (`/owner/overview`)**: Live vehicle counts, online edge hardware units, today's warning alerts and critical violations, derived Fleet Safety Score, 7/14/30-day incident frequency chart, category breakdown, and drivers requiring coaching.
- **Vehicle Fleet (`/owner/vehicles`)**: Realistic Indian registrations (e.g. `MH-12-RN-4821`, `KA-04-DE-1092`), make/models (Tata Prima, Ashok Leyland, BharatBenz), assigned drivers, edge device links, and `VehicleFormModal` registration flow. Detail view at `/owner/vehicles/:id`.
- **Driver Directory (`/owner/drivers`)**: Commercial license records, duty statuses, monitored hours, session logs, emergency contacts, and driver dossiers at `/owner/drivers/:id`.
- **Incident Triage & Evidence Workspace (`/owner/incidents`)**: Multi-attribute filtering (date, category, severity, review status, evidence availability, keyword search).
- **Incident Detail & Video Player (`/owner/incidents/:id`)**: Integrated HTML5 video player component with play/pause, seek scrubber, duration counter, transcode badge (`.avi` to `.mp4`), immutable audit trail, and `IncidentReviewModal` to log coaching notes and resolve incidents.
- **Compliance Reports (`/owner/reports`)**: Filterable date-range tabs for incidents, drivers, vehicles, and edge sync jobs, with real browser CSV export engine.

### 3. AI Testing Lab (`/lab/*`)
- **Edge Device Fleet (`/lab`)**: Hardware serials, firmware versions, YOLOv8/MediaPipe runtime status, CPU/RAM utilization, and sync queue depths.
- **Live Testing Bench (`/lab/devices/:id`)**:
  - Live video pane supporting **Real Browser Webcam** via WebRTC (`getUserMedia`), simulated video loop, or stream off.
  - Telemetry HUD overlay: Driver Detected, Eye Aspect Ratio (EAR), YOLO phone detector, and active session timer.
  - Interactive Violation Injector: Trigger Warning (Phone Use) or Critical (Prolonged Eye Closure) that creates real events, updates counters, and broadcasts spoken voice alerts via Web Speech Synthesis in Hindi.
  - 8-stage Edge-to-Cloud Integration Pipeline visualizer with retry actions.
  - Threshold Calibration Form: Warning threshold (5s), critical threshold (10s), cooldown (4s), clip duration (10s).
- **Chronological Event Stream (`/lab/events`)**: Raw edge inference timeline with category and severity filters.

### 4. Commercial Driver In-Cab Monitor (`/driver/*`)
- **Driver Safety HUD (`/driver/monitor`)**: High-glanceability minimal distraction interface designed for rugged cab-mounted tablets.
- **Bilingual Alert Support**: English & Hindi (`ENG` / `हिन्दी`) toggles for visual and spoken reminders.
- **Safety States**: Monitored & Safe, Attention Required, Fatigue Detected, Phone Use Detected, Critical Stop Safely, and Connection Offline.
- **Shift Summary (`/driver/session`)**: Driving duration, recorded alerts, mandatory rest breaks, and vehicle handover report.

---

## 2. Technology Stack

- **Framework**: React 18 with TypeScript (strict type checking enabled).
- **Bundler & Tooling**: Vite 6, Vitest 2, Tailwind CSS 3.
- **Navigation & Routing**: React Router 6.
- **Data Management**: TanStack React Query 5.
- **Form Handling & Validation**: React Hook Form 7 with Zod 3 schemas (`@hookform/resolvers`).
- **Data Visualization**: Recharts (Responsive Area, Bar, and Pie charts).
- **Icons**: Lucide React.
- **Audio & Media**: Web Speech Synthesis API, HTML5 Video element with custom playback controls.

---

## 3. Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm `v9+` or `v11+`

### Installation
```bash
# Clone or navigate to the project directory
cd innotech

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### Typecheck & Testing
```bash
# Run strict TypeScript verification (0 errors)
npm run typecheck

# Run Vitest automated test suite (10/10 passed)
npm test
```

### Production Build
```bash
npm run build
```
Generates optimized static bundle in `dist/`.

---

## 4. Demo Roles & Interactive Personas

On the `/login` screen or via the header role selector, switch between:
1. **Platform Administrator**: Full access to commercial SaaS accounts, MRR, subscriptions, and billing.
2. **Fleet Owner**: Access to fleet analytics, vehicle directory, driver records, safety reports, and incident review.
3. **Safety Reviewer**: Focused incident triage workspace and audit sign-off workflows.
4. **AI Device Tester**: Access to the hardware testing lab, real webcam preview, pipeline visualizer, and threshold calibration.
5. **Commercial Driver**: High-glanceability HUD with English/Hindi voice alerts.

---

## 5. Architecture & Operational Integrity

- **Single Source of Truth**: All overview metrics (MRR, active vehicles, today's alerts, safety scores) are computed directly from active domain records via pure selectors (`src/utils/selectors.ts`).
- **In-Session Persistence**: Mock mutations (creating a customer, registering a vehicle, reviewing an incident, starting/stopping a session) persist within `localStorage` across page reloads and immediately trigger state subscribers.
- **Privacy & Evidence Separation**: Biometric video evidence is restricted by role. Raw local `.avi` paths are distinguished from transcoded web `.mp4` URLs.
- **No False Integration Claims**: When local Python devices are not connected, the UI explicitly flags the feed as "Simulated In-Cab Loop" or "Local Webcam". An accompanying `python_device/edge_server.py` bridge provides real REST endpoints on port 8000 when running edge detection locally.
