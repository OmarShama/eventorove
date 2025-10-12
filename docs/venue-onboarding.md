## Venue Onboarding Plan (Reference)

This document captures the agreed business workflow for adding a new venue, the policy answers to key questions, and a practical MVP vs post-MVP scope to guide implementation.

### Objectives
- Ensure only legitimate venues go live while keeping host onboarding low-friction.
- Support both host self-serve creation and admin-assisted onboarding.
- Provide clear states, documents, and review processes with auditability.

### Roles and Permissions
- Host: create and edit their own venues, submit for review.
- Admin: create venues for hosts, review/approve/reject, request info, override.
- RBAC: Host (own scope), Admin (global scope with audit logging).

### Venue Limits Strategy
- New hosts: conservative caps (e.g., 1 approved, up to 3 pending).
- Verified/performant hosts: higher limits or no cap based on plan tier.
- Optional monetization: Free tier vs Pro/Enterprise with higher limits.

### Contracting Approach
- Default: virtual agreement (clickwrap ToS + optional e-sign venue/host agreement).
- Enterprise: physical/e-signed MSA when needed; version agreements, store signed PDFs.

### Fees and Pricing Strategy
- Recommended: no listing fee; commission on bookings.
- Optionally gate higher venue counts behind subscription or performance history.

### Fraud/Scam Prevention and Verification
- Automations: address geocoding, duplicate checks (name + address radius), email/phone verification.
- Optionally: KYC/KYB provider, device/IP risk, velocity limits, external footprint (website, social, Google Maps link).
- Manual review triggers: high-risk signals, mismatched docs, fuzzy duplicates, large volume.

### Required Documents (approval checklist)
- Individual host: government ID, proof of address or lease/deed, venue photos, bank/tax details (for payouts), insurance if applicable.
- Business host: incorporation/registration, UBO IDs, proof of venue control, business bank/tax, insurance and safety permits as applicable.
- Store expiration dates and verification results; surface renewal reminders.

### Admin-Created Host and Venue
- Allow admins to create the host and first venue (source=field_sales, createdBy=admin).
- Send invite for host to claim account and complete verification; still require docs before approval.
- Keep full audit trail for compliance.

### Workflow and States
- States: Draft → Submitted → NeedsInfo (loop) → PendingVerification → Approved → Rejected → Suspended.
- Host flow: create Draft, fill details, upload docs, accept ToS/e-sign, Submit.
- System checks: duplicate detection, basic verification; route low-risk for auto-approve or queue for manual review.
- Admin review: risk score, doc completeness, approve/reject/request info with reasons.

### Minimal Data Model
- Venue: id, hostId, name, address (structured + lat/lng), photos[], capacity, amenities[], status, riskScore, source, createdBy, approvedAt.
- Host: id, type (individual/business), contact info, verificationStatus, payoutStatus, planTier, createdBy, source.
- Documents: id, hostId/venueId, type, issuer, uploadedAt, verifiedAt, expiresAt, verificationResult.
- Agreement: id, hostId, version, signedAt, signerIp, documentUrl.
- Review: id, venueId, reviewerId, decision, notes, reasonCodes.
- AuditLog: actorId, action, target, timestamp, diff.

### Admin Tooling (essentials)
- Search and filter by status, risk, missing docs.
- Approve/reject and request info with templates.
- Duplicate suggestions with merge/deny actions.
- Doc viewer with pass/fail and reason codes.

### Defaults
- Venue limits: Free 1 approved, up to 3 pending; higher with Pro/Enterprise.
- Fees: 10–20% commission per booking; optional subscription for multi-venue.
- SLA: manual review within 24–48 hours; suspensions for expired docs or risk.

---

## MVP vs Post-MVP

### MVP (Must Have)
- Roles: Host and Admin with basic RBAC.
- Venue lifecycle: Draft → Submitted → PendingVerification → Approved/Rejected/NeedsInfo.
- Host self-serve: create venue, edit details, upload photos and at least one proof of venue control (utility bill, lease, or deed), accept ToS (clickwrap), submit.
- Verification: email and phone verification; geocode + simple duplicate check (name + address radius); manual review queue.
- Admin console (minimal): list/filter venues by state, view submission and documents, approve/reject/request info with notes, audit log entries.
- Limits and anti-abuse: cap to 1 approved venue per Free host, max 3 concurrent pending submissions; basic rate limiting.
- Data model and storage for venues, hosts, documents, agreements (ToS acceptance record), reviews, audit logs.
- Notifications: transactional emails for submission received, needs info requested, approved/rejected.

### Post-MVP (Can Wait)
- Full KYC/KYB integration (liveness, UBO collection, automated sanctions/PEP checks).
- E-sign integration with DocuSign/HelloSign (versioned agreements, signed PDF storage).
- Auto-approval rules based on risk scoring and completeness; risk engine with device fingerprinting and velocity analysis.
- Subscription/plan tiers, billing, and higher venue limits based on plan/performance.
- Advanced duplicate management queue with merge tooling.
- Expiration tracking and automated reminders for insurance, permits, and IDs.
- Admin impersonation (with audit) to assist hosts.
- External footprint checks (Google Places link validation, website domain verification, social signals).
- Photo forensics (EXIF checks, stock image detection) and content moderation.
- Enterprise workflows: MSAs, custom SLAs, field sales creation flows, custom pricing.
- Analytics and reporting on conversion, approval rates, and risk metrics.

---

### Quick Answers Recap
- Who can add? Hosts and admins; admins approve.
- Limit venues? Tiered limits with anti-abuse caps.
- Contract type? Virtual ToS by default; e-sign later or for enterprise.
- Fees for >1 venue? Prefer commission; subscription later.
- Anti-scam? Basic verification + manual review in MVP; advanced risk later.
- Docs required? Proof of control + photos in MVP; full KYC/KYB/insurance later.
- Admin creates first venue? Supported; still requires verification; audit all actions.


