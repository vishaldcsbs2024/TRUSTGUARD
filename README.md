# TRUSTGUARD
#  TrustGuard — Intelligent Claims Fraud Detection for Guidewire

> **Hackathon Submission | Guidewire Innovation Challenge**
> An AI-powered, multi-signal fraud detection layer built natively on top of Guidewire ClaimCenter.

---

##  The Problem

Insurance fraud costs the global industry **over $80 billion annually**. Delivery and gig-economy claims are among the fastest-growing fraud vectors — agents gaming weather conditions, faking locations, and coordinating false reports at scale.

Traditional rule-based systems fail because:
- GPS data is trivially spoofed with free apps
- Single-signal verification is gamed once patterns are understood
- Static rules can't adapt to emerging fraud networks
- Honest agents are penalized by blanket verification requirements

**The threat is no longer theoretical.** A 500-person syndicate recently drained a parametric insurance liquidity pool in hours — coordinating via Telegram, faking GPS into a red-alert weather zone while resting safely at home. Simple GPS checks caught nothing.

**The core challenge:** How do you verify physical reality at scale, without harassing the honest majority who just need their claim processed?

---

##  Our Solution: TrustGuard

TrustGuard is a **multi-layered intelligent fraud detection system** integrated into Guidewire ClaimCenter. It combines environmental fingerprinting, device integrity checks, graph-based fraud network detection, and a reputation economy to make fraud economically irrational — while keeping the experience frictionless for honest agents.

### The Philosophy

> *"Don't just verify data. Verify reality."*

Instead of asking "does the GPS match?", we ask: **"Does the entire physical environment match what the agent claims?"**

---

##  Who Is Our User?

### Primary Users

**Claims Investigators (Internal — Guidewire Users)**
- Overwhelmed by volume; need AI-assisted triage
- Need explainable fraud scores, not black-box rejections
- Rely on Guidewire ClaimCenter daily for workflow management

**Delivery/Gig Agents (External — End Claimants)**
- Submit weather, distance, and condition-based claims
- Honest majority should face zero friction
- High-risk minority attempts GPS spoofing, fake app usage, and coordinated ring fraud

**Insurance Operations Managers**
- Need dashboards showing fraud rates, savings, and system trust scores
- Responsible for compliance and audit trails

### The Persona Problem Honest Agents Face

An honest delivery agent caught in a rainstorm files a claim. Under legacy systems:
- Manual review: 3–5 days
- Blanket suspicion: morale damage
- Inconsistent standards: unfair outcomes

Under TrustGuard:
- Real-time environmental verification
- Instant payout for high-reputation agents
- Human review reserved for genuinely ambiguous edge cases

---

##  How the AI Actually Works

TrustGuard is built on **seven AI layers** that stack on top of each other, each one raising the cost of fraud.

---

### Layer 1 — Environmental Fingerprinting (Reality Hash)

**The problem GPS spoofing solves — and why it doesn't work here.**

When an agent files a claim, we don't just check GPS. We generate an **Environment Hash** — a multi-signal snapshot of physical reality at the claim moment:

| Signal | Source | What It Catches |
|---|---|---|
| GPS coordinates | Device | Basic location spoofing |
| Temperature | Device sensor vs. Weather API | Fake device readings |
| Ambient sound | Microphone sample (non-recorded) | Rain, traffic, wind — matches claimed conditions |
| Light levels | Camera luminosity | Indoor vs. outdoor, time-of-day consistency |
| Magnetometer | Device compass | Urban metallic interference vs. open rural space |

**Environment Hash = Reality Signature**

All five signals are hashed together and compared against the claim's environmental assertion. A rainstorm claim should produce: low light, high ambient noise, wet-condition temperature, matching weather API data for that GPS zone.

Spoofing one signal is easy. Spoofing all five simultaneously, in real time, without the agent knowing the weighting algorithm, is **computationally and practically infeasible**.

---

### Layer 2 — Device Integrity Scoring

Before trusting any signal, we ask: **Is this device trustworthy?**

TrustGuard runs a device attestation check at claim submission:

- **Root/Jailbreak detection** — Rooted devices can run mock location apps at the OS level
- **Mock location app scan** — Checks for known GPS spoofing apps (e.g., Fake GPS, Location Spoofer)
- **Emulator fingerprint** — Script-based fraud often runs on Android emulators; hardware identifiers reveal this
- **App integrity hash** — Validates the TrustGuard SDK hasn't been tampered with

**Output: Device Trust Score (0–100)**

This score gates the verification level required. A score above 85 enables streamlined claims. Below 50 triggers mandatory enhanced verification.

---

### Layer 3 — Geo-Fencing with Dynamic Risk Zones

**Not all locations are equal risk.**

TrustGuard maintains dynamic **risk zone maps** updated in near-real-time:

- **Fraud hotspots** — Zones with historically elevated false claim rates
- **Weather-risk zones** — Areas with active precipitation (from weather API integration)
- **Traffic-risk zones** — High-congestion corridors where delivery claims concentrate

**Micro-Zone Logic Example:**

```
Claim filed: Rain damage at 3:15 PM in Zone 7A
→ Weather API: Rain started 4:00 PM in Zone 7A
→ Verdict: Temporal mismatch — escalate to investigator
```

```
Claim filed: Heavy rain, agent is only active agent in Zone 12C
→ Weather API: Confirmed heavy rain in Zone 12C
→ Other verified agents in zone: 0 (no corroboration possible)
→ Verdict: Apply additional passive vision verification before auto-approval
```

---

### Layer 4 — Time Consistency Engine

**Does the story make sense over time?**

The Time Consistency Engine cross-references:

- Travel time vs. claimed route distance (is the speed physically possible?)
- Weather event timeline vs. claim timestamp (did rain exist when they say it did?)
- Delivery log timestamps vs. claim window (are the logs internally consistent?)
- Historical agent patterns vs. current claim (significant deviation from baseline?)

This layer catches the "story doesn't add up" fraud that environmental checks alone miss — agents who get the location right but not the timeline.

---

### Layer 5 — Reputation Economy (Game Theory Layer)

**Make honesty the most profitable strategy.**

Every agent carries a **Reputation Score** that evolves with their claims history:

| Score Range | Agent Treatment |
|---|---|
| 90–100 | Fast-track payouts, minimal verification |
| 70–89 | Standard verification, normal payout speed |
| 50–69 | Enhanced verification, slower processing |
| Below 50 | Manual review, all claims held |

**The Key Mechanism: Reputation is hard to rebuild, easy to lose.**

A single fraudulent claim creates a permanent record. Two flagged claims in 90 days triggers automatic probation. This creates powerful self-regulation — agents in fraud rings become liabilities to themselves when they realize their score is the bottleneck to income.

**Network Effect:** High-reputation agents who interact with low-reputation agents in suspicious clusters also receive soft flags — discouraging rings from recruiting trusted agents.

---

### Layer 6 — Randomized Challenge System

**Unpredictability is the strongest anti-fraud tool.**

Fixed verification rules get reverse-engineered and automated. TrustGuard randomizes challenges so no fraudster can pre-plan:

- Walk 5 steps (accelerometer verification)
- Rotate phone 360° (gyroscope liveness check)
- Capture a blurred ambient frame (passive vision — see Layer 8)
- Answer a micro-question about visible surroundings

Challenges are triggered probabilistically — not on every claim, not on a detectable schedule. Even honest agents see them only occasionally. This prevents automation while maintaining low friction for legitimate users.

---

### Layer 7 — Graph-Based Fraud Network Detection

**Detect relationships, not just individuals.**

The most sophisticated fraud isn't solo — it's coordinated rings. TrustGuard builds a **live fraud graph**:

- **Nodes** = individual agents
- **Edges** = shared signals (same device IDs, overlapping GPS zones, identical claim patterns, same IP ranges)

Graph analysis detects:

- **Clusters** — Groups filing similar claims in tight geographic windows
- **Rings** — Structured fraud networks with a central coordinator
- **Temporal coordination** — Claims filed in suspiciously synchronized bursts

This layer catches fraud that looks clean at the individual level but is statistically impossible at the network level.

---

### Layer 8 — Passive Vision Verification

**See without asking.**

Instead of demanding the agent photograph their surroundings (high friction, easy to fake), TrustGuard **occasionally and transparently** captures a single ambient frame:

- Image is processed on-device by a lightweight ML model
- Extracts: precipitation presence, road/surface type, approximate light level
- Only a classification result is transmitted — no raw image stored
- No faces, no identifying information

**Privacy-first design:** The agent is notified that environmental snapshots may be taken. The raw image never leaves the device. Only a structured result (`{rain: true, surface: "asphalt", light: "low"}`) is sent to the backend.

This is cross-referenced against the claim and the weather API. A rain claim with a sunny, bright-sky frame is an immediate flag.

---

##  Adversarial Defense & Anti-Spoofing Strategy

> **Critical Threat Response — DEVTrails 2026 Phase 1 Update**
>
> *Scenario: A 500-person syndicate in a tier-1 city is exploiting GPS spoofing via coordinated Telegram groups, faking location data to trigger mass weather-based payouts and drain the liquidity pool. Simple GPS verification is obsolete. This section documents TrustGuard's architectural response.*

---

### 1. Differentiating a Genuinely Stranded Agent from a Bad Actor

The fundamental insight is this: **GPS is a single number. Reality is a correlated system.** A fraudster at home can fake one coordinate. They cannot simultaneously, in real time, fake every physical signal that should co-occur with being genuinely stranded outdoors in a red-alert weather zone.

TrustGuard's differentiation engine runs a **Reality Coherence Score** — a weighted agreement check across all environmental signals against what the GPS and claim assert. Here is what a genuine stranded agent looks like vs. a spoofing actor at home:

| Signal | Genuine Stranded Agent | GPS-Spoofing Actor at Home |
|---|---|---|
| GPS coordinates | In red-alert zone | Faked — in red-alert zone |
| Ambient sound (mic sample) | Rain, wind, traffic noise | Indoor silence, home TV audio |
| Light level (camera luminosity) | Low — overcast, storm conditions | Indoor artificial lighting pattern |
| Temperature (device sensor) | Matches outdoor ambient for that zone | Indoor room temperature (~22°C) |
| Temperature (vs. Weather API) | Consistent with storm zone reading | Inconsistent — zone shows 8°C, device shows 21°C |
| Magnetometer pattern | Urban street-level interference | Home environment — different signature |
| Accelerometer / motion | Micro-vibrations from outdoor exposure, vehicle, walking | Stationary — resting on desk or couch |
| Network cell tower | Cell towers consistent with claimed GPS zone | Towers map to home address, not claimed zone |

**Any single signal mismatch is a weak signal. Four or more mismatches trigger automatic escalation.** The fraudster at home cannot fake being cold, outdoors, in rain noise, on wet asphalt, near specific cell towers — all simultaneously, without knowing which signals are being sampled or when.

**The accelerometer is particularly powerful against home-based fraud.** A person genuinely trapped outdoors in a storm exhibits continuous micro-motion — wind buffet, shifting weight, handling a vehicle. A device resting on a home desk is essentially still. This signal is invisible to fake GPS apps because it requires physical movement of the device itself.

---

### 2. Specific Data Points That Expose a Coordinated Ring

Beyond individual signals, TrustGuard's **Graph Fraud Detection layer** specifically targets the coordination patterns that make a syndicate detectable even when individual members look borderline-clean.

**The 500-person syndicate scenario produces these detectable signatures:**

**A. Temporal Clustering — The Simultaneous Trigger Problem**

Genuine weather events strand delivery workers over a rolling window of time as they encounter the storm at different points on their routes. A fraud ring receives the "trigger" message via Telegram at a single moment and files en masse.

TrustGuard monitors **claims-per-minute per weather zone**. The baseline for a genuine red-alert event in a tier-1 city might be 15–30 claims over 2–3 hours. A coordinated ring fires 200+ claims within a 12-minute window. This spike pattern has a near-zero probability of occurring naturally and is an immediate ring-detection trigger.

```
Detection Rule:
IF claims_per_zone_per_15min > (historical_baseline × 4)
AND avg_device_motion_score < 0.2 (stationary devices)
AND environmental_coherence_score < 0.5
THEN → SYNDICATE_ALERT: freeze zone payouts, escalate to investigator
```

**B. Cell Tower Mismatch — The Location They Can't Fake**

GPS coordinates are software. Cell tower associations are hardware-level network data. When 500 agents all claim to be in Zone 7A but their devices are connecting to cell towers in Zone 2C (a residential suburb), the mismatch is mathematically impossible to explain legitimately.

TrustGuard cross-references claimed GPS against **network-reported cell tower location** at claim time. This data is available via the mobile SDK without requiring any special permissions — the device's registered network location is captured as part of the claim metadata.

**C. Device Fingerprint Clustering**

In large fraud rings, organizers often distribute fake GPS apps from shared sources, or members use identical device configurations. TrustGuard's device integrity layer captures:

- Installed app signatures (flagging mock location tools)
- Device model distribution within a zone-claim cluster
- Shared IP range patterns (members on the same home router or VPN)
- Identical sensor calibration signatures suggesting emulator farms

When 80 of 500 claims come from devices with the same mock GPS app installed, or 40 share the same IP subnet, these are not coincidences. The graph layer surfaces these relationships as **edges** connecting suspicious nodes, collapsing what looks like 500 individual cases into 3–4 coordinated rings.

**D. Behavioral Pattern Homogeneity**

Genuine agents file claims in varied language, at varied times, with varied route histories. Coordinated fraud rings produce claims with:

- Near-identical claim descriptions (copy-paste from Telegram instructions)
- Implausibly round numbers for distances and durations
- Zero variance in claimed environmental conditions across a zone (real storms have gradients; everyone doesn't experience *exactly* the same rainfall intensity at the same moment)

TrustGuard's NLP layer (applied to claim text at FNOL) flags statistical homogeneity across a cluster as a ring indicator. An entropy score below threshold for a zone-cluster triggers ring investigation.

---

### 3. UX Balance — Protecting Honest Agents During Genuine Network Drops

This is the most operationally critical design challenge: **in the same storm that fraudsters are exploiting, there are genuine agents who are wet, stressed, and in poor network conditions.** They may have intermittent GPS, degraded sensor readings, and understandably frustrated with any friction added to their claim.

TrustGuard's **Innocent Until Escalated** principle governs the flagged-claim workflow:

**Stage 1 — Silent Hold (Not a Rejection)**

When a claim triggers a fraud flag, the agent's app UI shows: *"Your claim is being processed. This may take a few extra minutes due to high claim volume in your area."*

The claim enters a **soft hold queue** — not rejected, not penalized, not alarming. The agent continues their day. This message is identical whether the hold is for fraud suspicion or genuine system load. No stigma, no accusation.

**Stage 2 — Passive Re-Verification (Zero Active Effort from Agent)**

During the hold window (up to 15 minutes), TrustGuard passively re-samples available signals:

- Does device motion increase? (agent moves, suggesting continued outdoor activity)
- Does the ambient environment evolve? (genuine storms intensify and move; a home environment is static)
- Do additional claims from the same zone arrive from other agents whose signals are clean? (corroborating the weather event's existence)

If passive re-verification resolves the ambiguity in the agent's favor, the claim auto-approves and the hold evaporates. The agent never knew they were flagged.

**Stage 3 — Lightweight Active Challenge (Only If Passive Fails)**

If passive signals remain ambiguous after 15 minutes, the agent receives a single, low-friction challenge — framed as a standard process, not an accusation:

> *"To speed up your claim, please do a quick check: tap 'Confirm' when you're ready, then rotate your phone slowly once."*

This liveness check (gyroscope-validated) costs the agent 10 seconds. It is impossible to automate at scale. A genuine agent outdoors completes it trivially. A farm of scripts cannot rotate 500 physical phones simultaneously.

**Stage 4 — Human Escalation with Agent Advocacy Tools**

If the challenge is not completed (e.g., the agent's phone died, they're in an emergency situation, network is completely down), the claim routes to a human investigator — but with a crucial difference from legacy systems:

The investigator's ClaimCenter view shows the agent's **full reputation history**, their **historical route data**, the **weather event confirmation** for their zone, and a **pre-populated appeal message** the agent can send with one tap. The investigator is primed to look for *reasons to approve*, not reasons to deny.

**The key design principle:** An honest agent in bad weather experiences a brief delay and a 10-second rotation. That is the full cost of this system to them. A fraudster at home experiences the same interface — but cannot pass Stage 2 or Stage 3, because their physical environment doesn't match the claim.

**Reputation Shield for Genuine Edge Cases**

High-reputation agents (score 85+) with a clean 12-month history receive an additional protection: their first ambiguous claim in any 90-day period is **automatically approved** regardless of flag score, and the flag is logged silently for pattern analysis. A genuine stranded agent who happens to have a dead phone sensor is not penalized for a hardware failure. The bar for overriding a high-reputation agent's claim is deliberately high.

---

### Syndicate Response Summary

| Attack Vector | TrustGuard Counter |
|---|---|
| GPS spoofing app | Device integrity scan flags mock location tools at claim submission |
| Home environment (warm, dry, indoor) | Temperature + light + ambient sound mismatch vs. claimed storm zone |
| Stationary device | Accelerometer near-zero motion — inconsistent with outdoor exposure |
| Cell tower in residential area | Network location cross-referenced against claimed GPS zone |
| Mass simultaneous filing | Temporal clustering detection triggers zone-wide freeze |
| Copy-paste claim descriptions | NLP entropy scoring flags homogeneous claim text clusters |
| Shared devices / emulator farms | Device fingerprint clustering exposes shared infrastructure |
| Recruiting high-rep agents | Reputation contagion — graph proximity to ring members triggers soft flag |

> **The syndicate's structural weakness:** Coordinating 500 people to simultaneously fake five independent physical signals — while keeping their devices moving, warm, outdoors, connected to correct cell towers, and producing natural-language claim variance — is operationally impossible. TrustGuard turns the size of the ring into a liability. Bigger rings produce stronger detection signals.

---

## 📉 Market Crash Resilience

> *"The Market Crash is still in play."*

TrustGuard is designed to **perform better during economic stress** — not worse.

During economic downturns, fraudulent claims historically spike 30–40% as financial pressure increases. TrustGuard's response:

**Dynamic threshold tightening:** During macro stress events (detectable via external economic indicators fed into the risk zone maps), verification thresholds automatically tighten across all agents without manual intervention.

**Reputation score weighting shifts:** The Game Theory layer amplifies reputation penalties during high-fraud periods, making ring participation even more costly for participating agents.

**Graph detection sensitivity increase:** Fraud ring detection thresholds lower during stress periods, catching coordinated patterns earlier in their lifecycle.

**Cost to insurers drops as fraud rises** — this is the inversion that matters. The system gets smarter and tighter precisely when fraud pressure is highest, protecting insurer margins exactly when they are most vulnerable.

---

##  Technical Architecture

```
Agent Mobile App (TrustGuard SDK)
        │
        ├── Environmental Fingerprint Collector
        ├── Device Integrity Attestation Module  
        ├── Passive Vision Processor (on-device ML)
        └── Randomized Challenge Engine
              │
              ▼
    TrustGuard API Layer (Cloud)
              │
        ┌─────┴──────┐
        │            │
  Real-time      Async Processing
  Scoring        Engine
        │            │
  ┌─────┴──┐    ┌────┴──────────┐
  │Weather │    │Graph Fraud    │
  │API     │    │Detection      │
  │        │    │(Neo4j / GDS)  │
  └────────┘    └───────────────┘
              │
              ▼
    Guidewire ClaimCenter Integration
    (REST API / Guidewire Cloud APIs)
              │
        ┌─────┴──────────────┐
        │                    │
  Fraud Score            Claims Workflow
  Dashboard              Auto-routing
  (Investigators)        (High/Med/Low risk)
```

**Core Tech Stack:**

- **Mobile SDK:** Android/iOS native modules for sensor access and on-device ML inference
- **Backend:** Node.js microservices on AWS Lambda (serverless scaling)
- **Graph DB:** Neo4j with Graph Data Science library for fraud network analysis
- **ML Models:** Lightweight MobileNet-variant for on-device vision; XGBoost for risk scoring
- **Weather Integration:** OpenWeatherMap API + NOAA historical data
- **Guidewire Integration:** ClaimCenter REST APIs, Guidewire Cloud Platform event streams
- **Data Store:** PostgreSQL for claims history, Redis for real-time reputation scoring

---

##  Guidewire Integration Points

| ClaimCenter Feature | TrustGuard Integration |
|---|---|
| First Notice of Loss (FNOL) | Attach TrustGuard fraud score at submission |
| Claim Assignment | Route by risk tier (auto-approve vs. investigator queue) |
| Claim Notes | Append structured fraud signal log |
| Workflow Rules | Trigger enhanced review on score thresholds |
| DataHub | Feed fraud outcomes back for model retraining |
| Guidewire Cloud Events | Real-time graph updates on claim state changes |

---

##  Expected Impact

| Metric | Baseline | With TrustGuard |
|---|---|---|
| Fraudulent claim rate | ~12% | Target: <4% |
| Average claim processing time | 3–5 days | <4 hours (high-rep agents) |
| Investigator workload | 100% manual review | ~15% requiring human review |
| False positive rate (honest agents flagged) | N/A | Target: <2% |
| Cost per verified claim | High | 60–70% reduction via automation |

---

##  Team

| Role | Responsibility |
|---|---|
| Product Lead | User research, Guidewire integration design, hackathon narrative |
| ML Engineer | Environmental fingerprinting models, on-device vision |
| Backend Engineer | API layer, graph detection, reputation scoring engine |
| Mobile Engineer | SDK, sensor fusion, device attestation |
| Frontend Engineer | Investigator dashboard, ClaimCenter UI integration |

---

##  Ethics & Privacy

TrustGuard is built on a privacy-first architecture:

- **No raw audio storage** — ambient sound is analyzed and discarded in real time
- **No raw image storage** — vision processing happens on-device; only structured results are transmitted
- **No biometric data** — challenges are behavioral (motion, rotation), not biometric
- **Explainability** — every fraud score comes with a structured reason log accessible to the agent and investigator
- **Agent appeals** — any automated rejection can be escalated to human review with one tap
- **Data minimization** — only signals necessary for fraud detection are collected

---

##  Repository Structure

```
trustguard/
├── sdk/                    # Mobile SDK (Android + iOS)
│   ├── fingerprint/        # Environmental fingerprinting
│   ├── integrity/          # Device trust scoring
│   ├── vision/             # On-device passive vision ML
│   └── challenges/         # Randomized challenge engine
├── api/                    # Backend services
│   ├── scoring/            # Real-time fraud scoring
│   ├── graph/              # Fraud network detection
│   ├── reputation/         # Agent reputation engine
│   └── integrations/       # Weather API, Guidewire
├── guidewire/              # ClaimCenter integration
│   ├── workflows/          # Custom workflow rules
│   ├── rest/               # API call configurations
│   └── datahub/            # Feedback loop config
├── dashboard/              # Investigator UI
│   ├── fraud-queue/        # Prioritized review queue
│   ├── agent-profile/      # Reputation and history
│   └── network-viz/        # Fraud graph visualization
├── docs/                   # Architecture diagrams, API docs
└── README.md               # This file
```

---

*Built for the Guidewire Hackathon. All claims processing integrations reference Guidewire ClaimCenter sandbox APIs.*
