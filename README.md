<div align="center">

# 🛡️ TripResQ

### AI-Powered Travel Disruption Intelligence & Recovery Platform

**with Proactive Risk Radar, Dependency-Aware Recovery & Family Cohort Rescue**

> **Don't Just Track the Journey. Rescue It.**

</div>

---

## 📖 Overview

**TripResQ** is an intelligent travel safety and disruption-recovery platform that goes beyond simply notifying travelers about delays.

Instead of treating a trip as a collection of independent bookings, TripResQ models the journey as a **connected dependency graph**. When a disruption occurs, the system determines how that disruption can propagate through the itinerary, identifies vulnerable connections, and recommends feasible recovery actions.

TripResQ is designed to answer:

> **"What happens next, and what is the safest way to recover?"**

The platform shifts travel disruption management from a **reactive notification system** to a **proactive recovery workflow**.

---

## 🎯 Problem Statement

Traditional travel platforms primarily focus on:

- Booking flights and accommodation
- Creating itineraries
- Tracking individual transportation segments
- Sending basic delay or cancellation notifications

However, when a disruption occurs, travelers are often left to manually determine:

- Which parts of their itinerary are affected
- Whether they will miss a connection
- Whether hotel or activity bookings are impacted
- Which alternative route is feasible
- How a group or family should be rebooked
- Whether children can remain with their designated guardians

A single delay can therefore create a **cascade of downstream failures**.

TripResQ addresses this gap by focusing not only on **tracking the journey**, but on **keeping the journey viable**.

---

# 💡 Proposed Solution

TripResQ represents a travel itinerary as a **dependency graph of connected journey nodes**.

Each node can represent an element such as:

- Flight
- Train
- Airport transfer
- Hotel check-in
- Activity
- Other planned travel events

When one node is disrupted, TripResQ analyzes the dependency graph to identify affected downstream nodes.

The platform combines four major intelligence components:

### 🧠 Risk Radar

Continuously evaluates upcoming connections and identifies vulnerable parts of the journey.

### 🔗 Disruption Propagation

Uses graph-based traversal to determine how a disruption can affect downstream itinerary nodes.

### 🔄 Recovery Engine

Evaluates alternative recovery paths and presents feasible recovery options.

### 👨‍👩‍👧 Cohort Constraint Engine

Handles group and family travel by enforcing constraints such as guardian-child relationships and group cohesion.

---

# ✨ Key Features

| Category | Capability |
|---|---|
| 🧠 **Risk Radar** | Proactively evaluates travel connections and generates risk/confidence scores |
| ⚡ **Disruption Propagation** | Determines how delays and cancellations affect downstream itinerary nodes |
| 🕸️ **Journey Dependency Graph** | Represents connected flights, trains, hotels and activities |
| 🔄 **Recovery Engine** | Generates alternative recovery options |
| 👨‍👩‍👧 **Cohort Rescue** | Protects families and groups even when members have separate PNRs |
| 🛡️ **Guardian Protection** | Prevents children from being rebooked without a designated guardian |
| ✈️ **Unified Rescue** | Validates group recovery plans before accepting them |
| 👤 **Advance Party Rescue** | Allows a guardian to travel ahead while maintaining child protection |
| 📊 **Confidence Scoring** | Uses historical and contextual information for risk assessment |
| 🔔 **Proactive Alerts** | Highlights high-risk connections before they become critical |
| 🍽️ **Destination Intelligence** | Provides destination-aware recommendations |
| 🧪 **Deterministic Demo** | Provides seeded disruption scenarios for reliable demonstrations |
| 📚 **Swagger API** | Enables backend API inspection and testing |

---

# 🚀 How TripResQ Works

```text
              TRAVELER JOURNEY
                     │
                     ▼
             ITINERARY GRAPH
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
     RISK RADAR        DEPENDENCY ENGINE
          │                     │
          └──────────┬──────────┘
                     ▼
          DISRUPTION PROPAGATION
                     │
                     ▼
             RECOVERY ENGINE
                     │
              ┌──────┴──────┐
              ▼             ▼
        INDIVIDUAL       COHORT/FAMILY
          RESCUE            RESCUE
                              │
                       Guardian Rules
                       Cohesion Rules
                              │
                              ▼
                    VALIDATED RECOVERY
                              │
                              ▼
                     TRAVELER DASHBOARD
