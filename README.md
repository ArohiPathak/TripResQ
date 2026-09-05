<div align="center">

# 🛡️ TripResQ

**AI-Powered Travel Disruption Intelligence & Recovery Platform**
*with Proactive Risk Radar, Dependency-Aware Recovery & Family Cohort Rescue*

[![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy-003B57?logo=sqlite&logoColor=white)](https://www.sqlalchemy.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#-license)

</div>

---

## 📖 Overview

**TripResQ** is an intelligent travel safety and disruption-recovery platform that goes beyond simply notifying travelers about delays.

It models a journey as a **dependency graph**, continuously evaluates disruption risk, identifies how one disruption can affect downstream plans, and recommends **validated recovery actions**.

The platform is designed to answer:

> **"What happens next, and what is the safest way to recover?"**

---

## ✨ Key Features

| Category | Capability |
|---|---|
| 🧠 **Risk Radar** | Proactively evaluates travel connections and generates confidence/risk scores |
| ⚡ **Disruption Propagation** | Detects how delays or cancellations affect downstream itinerary nodes |
| 🕸️ **Journey Dependency Graph** | Represents flights, trains, hotels and activities as connected itinerary nodes |
| 🔄 **Intelligent Recovery Control** | Generates recovery options instead of only reporting disruption |
| 👨‍👩‍👧 **Cohort Rescue** | Protects families/groups even when members are booked under separate PNRs |
| 🛡️ **Guardian Protection** | Prevents a child from being rebooked without a designated adult guardian |
| ✈️ **Unified Rescue** | Validates group recovery plans before they are accepted |
| 👤 **Advance Party Rescue** | Allows one guardian to travel ahead while maintaining child protection |
| 📊 **Confidence Scoring** | Uses historical and contextual data to improve risk assessment |
| 🍽️ **Destination Intelligence** | Provides destination-aware restaurant/dining recommendations |
| 🔔 **Proactive Alerts** | Surfaces high-risk connections before they become critical |
| 🧪 **API Testing** | Swagger documentation for testing and verifying backend APIs |
| 🧬 **Deterministic Demo** | Seeded disruption scenarios for reliable demonstrations |

---

## 🏗️ System Architecture

```text
                    Traveler Journey
                          │
                          ▼
                 Itinerary Graph
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
        Risk Radar              Dependency Engine
              │                       │
              └───────────┬───────────┘
                          ▼
                Disruption Propagation
                          │
                          ▼
                 Recovery Control
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
       Individual Rescue        Cohort / Family Rescue
                                       │
                            Guardian + Cohesion Rules
                                       │
                                       ▼
                              Validated Recovery Plan
                                       │
                                       ▼
                              Traveler Dashboard
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19 · Vite · Tailwind CSS · Framer Motion · Lucide React |
| **Backend** | Python · Flask · Flask-CORS · Flasgger |
| **Database** | SQLite · SQLAlchemy · Flask-Migrate |
| **API** | REST APIs · Swagger/OpenAPI |
| **Risk Engine** | Risk Radar · Historical Data · Confidence Scoring |
| **Recovery Engine** | Dependency Graph · Disruption Propagation · Recovery Validation |
| **Testing** | Pytest · End-to-End Tests |

---

## 📂 Project Structure

```text
TripResQ/
│
├── app/
│   ├── models/
│   ├── routers/
│   ├── services/
│   ├── core/
│   ├── mock_data/
│   └── __init__.py
│
├── src/
│   ├── components/
│   │   ├── recovery/
│   │   ├── dining/
│   │   └── ...
│   ├── services/
│   ├── App.jsx
│   └── index.css
│
├── public/
│   └── dining/
│
├── tests/
│   ├── test_e2e.py
│   ├── test_next_stop.py
│   └── test_risk_radar.py
│
├── instance/
│   └── tripresq.sqlite
│
├── package.json
├── requirements.txt
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🔄 How TripResQ Works

```text
1. Create / Load Journey
          ↓
2. Build Itinerary Dependency Graph
          ↓
3. Monitor Connection Risk
          ↓
4. Detect Disruption
          ↓
5. Propagate Impact to Dependent Nodes
          ↓
6. Generate Recovery Options
          ↓
7. Validate Recovery Constraints
          ↓
8. Present Safest Recovery Plan
```

---

## 🧠 The WOW Factor — Proactive Risk Radar

Traditional travel applications generally react **after** a disruption occurs.

TripResQ introduces a proactive **Risk Radar** that continuously evaluates upcoming connections.

It considers:

- Historical disruption patterns
- Connection dependencies
- Available buffer time
- Downstream itinerary impact
- Data confidence
- Severity of potential disruption

The result is a continuously updated **Confidence / Risk assessment** rather than a simple delay notification.

---

## 🔗 Dependency-Aware Disruption Propagation

A journey is not treated as a collection of independent bookings.

TripResQ models the journey as a **dependency graph**:

```text
Flight
  │
  ├──► Airport Transfer
  │        │
  │        └──► Hotel Check-in
  │
  └──► Connecting Flight
             │
             └──► Activity
```

If one node is disrupted, TripResQ determines which downstream nodes are affected instead of forcing the traveler to manually check the entire itinerary.

---

## 👨‍👩‍👧 Family & Group Cohort Rescue

One of TripResQ's key differentiators is **Cohort Rescue**.

Families can have separate PNRs, meaning airline rebooking systems may treat each traveler independently.

TripResQ creates a logical **travel cohort** and protects group-level constraints.

### Example

```text
COHORT-001

Rahul   → Adult / Guardian
Priya   → Adult / Guardian
Aarav   → Child

        ↓ Disruption

❌ Independent rebooking
❌ Child separated from guardians
❌ Family fractured across flights

        ↓ TripResQ

✅ Cohort-aware recovery
✅ Guardian constraint enforced
✅ Group cohesion protected
```

---

## 🛡️ Guardian Constraint Engine

TripResQ explicitly validates child/guardian relationships during recovery.

A recovery plan is rejected if:

```text
Child
  ↓
No designated guardian
  ↓
❌ INVALID RECOVERY
```

Valid recovery requires the child to remain with at least one designated guardian.

---

## ✈️ Advance Party Rescue

TripResQ also supports situations where the entire group cannot remain on the same flight.

Instead of simply rejecting the recovery:

```text
Guardian ──► Earlier Flight
     │
     └──► Child + Guardian
             │
             ▼
        Protected Cohort
```

The system can validate an **Advance Party** strategy where one guardian travels ahead while maintaining the child's protection constraints.

---

## 🔄 Intelligent Recovery Control

Recovery is not simply:

> "Your flight is cancelled."

TripResQ moves toward:

> **"Your connection is at risk. Here are recovery options that preserve your journey constraints."**

Recovery plans are validated against:

- Connection buffers
- Journey dependencies
- Cohort cohesion
- Guardian requirements
- Seating preferences
- Downstream itinerary constraints

---

## 🧪 Demo & API Testing

TripResQ includes a deterministic demo-seeding flow:

```text
POST /api/seed-demo
```

The backend exposes Swagger documentation for API inspection and testing:

```text
http://localhost:5000/api/docs
```

The seeded scenario makes it possible to consistently demonstrate:

- Risk detection
- Disruption propagation
- Recovery planning
- Family fracture detection
- Cohort rescue
- Guardian validation

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/ArohiPathak/TripResQ.git
cd TripResQ
```

### 2. Backend Setup

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS / Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start Flask:

```bash
python -m flask --app app run --port 5000
```

Backend:

```text
http://localhost:5000
```

Swagger:

```text
http://localhost:5000/api/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🧪 Testing

Run the complete backend test suite:

```bash
python -m pytest tests/ -v
```

The test suite covers:

- End-to-end disruption & recovery
- Next-stop destination resolution
- Historical risk data
- Confidence scoring
- Risk weighting
- Risk Radar behaviour
- Alert deduplication
- Recovery buffer planning

---

## 🚀 Deployment

### Frontend

The React/Vite frontend can be deployed on platforms such as:

- Vercel
- Netlify

### Backend

The Flask backend can be deployed on:

- Render
- Railway
- Other Python-compatible cloud services

### Database

**SQLite** is used for the prototype/demo deployment.

For production-scale deployments, SQLite can be replaced with a managed relational database such as PostgreSQL.

---

## 💰 Cost Estimate

| Component | Prototype Cost |
|---|---:|
| React/Vite Frontend | ₹0 |
| Flask Backend | ₹0–₹1,000/month |
| SQLite | ₹0 |
| API / Cloud Infrastructure | ₹0–₹1,000/month |
| **Estimated Total** | **₹0–₹2,000/month** |

Costs can increase depending on traffic, database requirements and cloud infrastructure.

---

## 🆚 Existing Solutions & Gap

| Existing Approach | Gap | TripResQ |
|---|---|---|
| Flight tracking apps | Mostly notify after disruption | **Proactive Risk Radar** |
| Airline rebooking | Optimizes individual passengers | **Cohort-aware recovery** |
| Travel itinerary apps | Limited dependency reasoning | **Journey dependency graph** |
| Generic alerts | Do not explain downstream impact | **Disruption propagation** |
| Manual family coordination | Easy to fracture across bookings | **Guardian + cohesion constraints** |
| Basic recovery suggestions | May ignore journey constraints | **Validated Recovery Control** |

---

## 🔮 Future Roadmap

- [ ] Real-time airline & railway APIs
- [ ] Live weather integration
- [ ] Multi-airline automated rebooking
- [ ] Production-grade PostgreSQL deployment
- [ ] Real-time location-aware recovery
- [ ] Smart travel insurance integration
- [ ] Multi-language traveler support
- [ ] Mobile application
- [ ] Predictive disruption forecasting

---

## 👥 Team

| Name | Role |
|---|---|
| Akshata Chettiar | Full Stack / Integration |
| Kaveesh Kadirvel | Frontend |
| Pavitra Boga | Backend |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

### 🛡️ **TripResQ — Don't Just Track the Journey. Rescue It.**

</div>
