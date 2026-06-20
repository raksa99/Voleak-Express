# 🚚 Voleak Express — Modern UI/UX Design System & Generative Prompts

This guide contains the design token definitions and exact prompts you can use with AI image generators (like Midjourney, DALL-E, or Stable Diffusion) or frontend builders (like Gemini, Cursor, v0, or Bolt.new) to create a state-of-the-art mobile user experience for **Voleak Express**.

---

## 🎨 1. Design System & Theme Specification

To make the app look premium, professional, and visually stunning, we use a custom design system instead of generic colors or boring tables:

*   **Theme**: Dark Mode with Glassmorphic Overlays (Semi-transparent panels with background blur).
*   **Palette**:
    *   `Background`: Deep Charcoal / Obsidian (`#0B0C10`)
    *   `Card / Surface`: Slate Gray (`#1F2833`)
    *   `Accent Primary`: Express Amber / Gold (`#F59E0B` — represents safety, delivery, speed)
    *   `Accent Secondary`: Cyan / Electric Blue (`#06B6D4` — represents telemetry, GPS, connectivity)
    *   `Status Positive`: Emerald Green (`#10B981` — active trips, healthy engines)
    *   `Status Alert`: Crimson Red (`#EF4444` — breakdowns, delays)
*   **Typography**: Clean, sans-serif fonts with distinct weight hierarchy:
    *   Headers: **Outfit** or **Plus Jakarta Sans** (Semi-bold / Bold)
    *   Body text: **Inter** (Regular / Medium)
*   **Micro-interactions**: Subtle ambient glow behind tracking pins, smooth slide transitions for sheets, and pulse animations for the active broadcasting GPS beacon.

---

## 📝 2. Master AI Prompts for UI Generation

Use the following prompts in image generators (e.g., Midjourney, DALL-E) to produce modern layouts.

### 🔐 Prompt 1: The Unified Login & Role Portal
> **Prompt**: `A premium mobile app UI design of a login screen for a logistics app called "Voleak Express". Dark mode theme with obsidian black background, glassmorphism card in the center with 20px border radius and 15% opacity blur, sleek input fields for username and password. High-contrast role-selector chips at the top labeled "Driver", "Manager", "Admin" with active state highlighted in a vibrant express amber glow (#F59E0B). Minimalist glowing lock icon, fingerprint/biometrics button at the bottom, modern UI/UX design, clean, vector style, 8k resolution, Figma showcase presentation.`

### 🗺️ Prompt 2: Driver's Real-time Navigation & Telemetry Screen
> **Prompt**: `Mobile app UI dashboard for a truck driver in "Voleak Express". Dark mode theme. The top half shows an elegant dark-theme vector map with a glowing yellow route path and an amber semi-truck icon indicating current location. The bottom half contains a glassmorphic sheet showing active trip stats: "PP -> SR", "Current Speed: 72 km/h", "Remaining: 180 km", and a big "START TRIP" primary button in solid glowing amber. Circular gauges displaying engine temperature and fuel status. Beautiful, clean typography, premium, high fidelity UI/UX.`

### 📊 Prompt 3: Manager's Fleet Monitoring & Dispatch Board
> **Prompt**: `Tablet and mobile UI dashboard for a logistics manager. Dark theme. Left sidebar displays active truck list cards with status badges (e.g., green dot "Active", yellow dot "Loading", red dot "On Break"). The right main panel shows a real-time map displaying multiple truck markers with lines tracing their paths. Float-out details card showing a 3D wireframe of a container truck, listing: "Plate: 3A-8888", "Driver: Seng Tri", "Load Capacity: 85%". Clean grid layout, beautiful charts representing delivery efficiency and on-time statistics, modern UI design.`

### ⚙️ Prompt 4: Admin Management & Role configuration Dashboard
> **Prompt**: `Admin panel dashboard mobile app UI for managing users, operators, and fleets. Obsidian black background, card surfaces in charcoal, sleek table lists showing user profiles with name, role labels (Admin, Manager, Driver), status switches. Interactive analytics charts showing weekly cargo weights and total active drivers. Vibrant neon amber and cyan accents, clean border lines, high-end professional software UI, Figma mockup style.`

### 🚛 Prompt 5: Detailed Truck Information & Diagnostics Sheet
> **Prompt**: `Mobile app UI/UX detail screen showing truck specifications and diagnostics. Glassmorphism design system. A high-tech vector line art of a semi-truck at the top. Grid list of parameters below: "Engine Status: Excellent", "Last Oil Change: 3 days ago", "Cargo Capacity: 25 Tons", "Assigned Driver: John Doe". Elegant slide-up panel, modern buttons for "Schedule Maintenance" and "Assign Driver". Dark background with neon orange highlights.`

---

## 🛠️ 3. Complete Feature Checklist (Expanded Requirements)

To make Voleak Express a complete logistics tracking solution, we expand the system with these essential modules:

1.  **Fleet Diagnostics & Maintenance Logger**:
    *   Monitor odometer readings, fuel consumption, tire pressure, and engine check lights.
    *   Provide alerts to Managers when a vehicle is overdue for maintenance.
2.  **Job & Cargo Manifesto**:
    *   Detail load manifests (weight, cargo description, temperature sensitivity, billing details).
    *   Interactive cargo check-in using QR code scanning by the driver or warehouse staff.
3.  **Real-Time Geofencing Alerts**:
    *   Automatic updates when a truck enters or exits predefined shipping depots (e.g., "Truck 3A-8888 has entered Phnom Penh Depot").
4.  **Incident & Delay Communication Hub**:
    *   Instant breakdown logging with photo attachments and exact GPS pinning.
    *   Real-time chat/notification channel between Driver and Manager.
5.  **Driver Performance & Safety Score**:
    *   Calculate driver scores based on average speed, sudden braking alerts, and on-time arrivals.
