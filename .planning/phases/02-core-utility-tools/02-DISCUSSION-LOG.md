# Phase 2: Core Utility Tools - Discussion Log

> **Audit trail only.** Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-18
**Phase:** 2-Core Utility Tools
**Areas discussed:** Tool granularity, Naming convention, Anti-collision descriptions, File/plan organization

---

## Tool granularity

| Option | Description | Selected |
|--------|-------------|----------|
| One per operation (~14, full parity) | Each HTTP endpoint → distinct tool; LLMs select better by name | ✓ |
| One per domain (5) with operation param | Compact, but hides capabilities behind enums, worse discovery | |
| Hybrid | Dedicated tool per primary op + grouped secondaries | |

**User's choice:** Full parity — ~14 tools, one per existing operation.

---

## Naming convention

| Option | Description | Selected |
|--------|-------------|----------|
| domain_operation (snake_case) | salary_net, phone_validate, geo_municipalities — groups siblings, MCP idiom | ✓ |
| descriptive verb | calculate_net_salary, validate_phone — matches roadmap criteria wording | |

**User's choice:** `domain_operation` snake_case. Roadmap criteria names treated as representative (mapping recorded in CONTEXT.md).

---

## Anti-collision descriptions

| Option | Description | Selected |
|--------|-------------|----------|
| "use when / not when" guidance | Each sibling names the opposite-case sibling; mitigates LLM tool-selection collision | ✓ |
| Simple description | One clear sentence per tool, no comparative guidance | |

**User's choice:** "use this when / do not use this when" guidance on sibling tools (hard requirement).

---

## File/plan organization

| Option | Description | Selected |
|--------|-------------|----------|
| 1 file per domain + parallel plans | tools/{salary,phone,geo,address,calendar}.ts; parallel domain plans; registry wired in a final integration step | ✓ |
| 1 file per domain + 1 sequential plan | Same files, single plan creates+wires all | |
| Leave to planner | Only fix "1 file per domain" | |

**User's choice:** 1 file per domain + parallel domain plans, registry wired in a final integration step.

---

## Claude's Discretion

- Exact Zod inputSchema per tool (mirror existing HTTP parsers).
- Exact description wording beyond the anti-collision requirement.
- Registry wiring mechanism (imports vs array).

## Deferred Ideas

- Phase 3 external-HTTP tools; Phase 4 document tools; v2 structuredContent / MCP resources.
