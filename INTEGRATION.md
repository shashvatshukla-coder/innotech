# SafeDrive AI — Edge AI & Video Ingestion Architecture

## 1. Overview
SafeDrive AI links onboard edge computing hardware (running local computer vision detection) to the enterprise cloud SaaS portal. The system is architected to operate deterministically in remote corridors with intermittent 4G/LTE cellular coverage across India (e.g. NH48, Western Ghats freight routes).

---

## 2. Local Edge Computer Vision Pipeline
The edge program executes on onboard ARM64 / x86 compute units equipped with an optical camera sensor (`cv2.VideoCapture(0)`):

1. **Optical Capture**: Reads 30 FPS video frames from in-cab wide-angle sensor.
2. **Mobile Phone Detection**:
   - Model: Ultralytics YOLOv8 nano (`yolov8n.pt`).
   - Inference Latency: ~18ms per frame.
   - Classification threshold: Confidence $\ge 0.70$.
3. **Driver Facial Landmark Tracking & EAR**:
   - Model: MediaPipe Face Mesh (468 3D landmarks).
   - Landmark tracking calculates the **Eye Aspect Ratio (EAR)**:
     $$EAR = \frac{||p_2 - p_6|| + ||p_3 - p_5||}{2 \times ||p_1 - p_4||}$$
   - Threshold: Eye closure identified when $EAR < 0.22$.
4. **Head Pose Distraction Heuristic**:
   - PnP (Perspective-n-Point) solver estimates pitch and yaw angles from nasal and ocular landmarks.
   - Yaw deflection $> \pm 25^\circ$ flags potential distraction away from windshield.
5. **Cab Audio Announcements (Local Voice)**:
   - Voice synthesis: Google Text-to-Speech (gTTS) cached in Hindi.
   - Audio playback: `playsound` daemon directly outputting to in-cab speaker.
   - Thresholds:
     - Warning: Triggered after **5 continuous seconds** of violation.
     - Critical: Triggered after **10 continuous seconds** of prolonged eye closure.
     - Cooldown: **4-second** mute window between voice triggers to prevent audio fatigue.

---

## 3. Video Evidence Buffering & Cloud Ingestion
1. **Local Ring Buffer**:
   - OpenCV `VideoWriter` buffers continuous video in memory and writes a 10-second loop around incident timestamps (`.avi` container).
2. **Web Codec Transcoding**:
   - Browsers do not natively play `.avi` raw streams.
   - Edge or cloud ingest worker transcodes `.avi` to web-standard H.264 / AAC `.mp4`:
     ```bash
     ffmpeg -i alert_clip_8812.avi -c:v libx264 -preset fast -crf 23 -c:a aac -movflags +faststart alert_clip_8812.mp4
     ```
3. **Cloud Storage & Sync**:
   - Payload uploaded via HTTPS Multipart PUT to object storage (`safedrive-evidence-prod/transcoded/`).
   - Metadata payload submitted to `/api/incidents`:
     ```json
     {
       "device_id": "DEV-IND-091",
       "vehicle_id": "VEH-MH-12-4821",
       "driver_id": "DRV-001",
       "category": "phone_use",
       "severity": "warning",
       "duration_seconds": 6.8,
       "confidence": 0.89,
       "evidence_clip_url": "https://storage.safedrive.ai/transcoded/8811.mp4",
       "timestamp": "2026-10-19T07:42:10Z"
     }
     ```
4. **Fallback & Store-and-Forward**:
   - If cellular connectivity is severed (intermittent/offline), jobs buffer on edge SD flash storage (`/dev/mmcblk0p2`).
   - SQLite queue on edge device retries transmission exponentially with jitter.

---

## 4. Local Daemon REST Bridge
To connect the web app to a live edge unit running on localhost:
- Run: `python python_device/edge_server.py`
- Endpoints exposed on `http://127.0.0.1:8000`:
  - `GET /health`: Model status & camera connectivity.
  - `GET /status`: Hardware telemetry, CPU %, storage, active session.
  - `POST /monitoring/start`: Begin tracking trip session.
  - `POST /monitoring/stop`: End trip session.
