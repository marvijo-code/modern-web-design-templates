---
name: api-design-java
description: Design or extend the haven-realestate API (Java 21 + Spring Boot 3) idiomatically — records, Specification search, ProblemDetail, virtual threads, Testcontainers. Use for any change to templates/haven-realestate/API.md or new Java API design work in this repo.
---

# API Design — Java · Spring Boot (haven-realestate)

Owns `templates/haven-realestate/API.md`. Haven is an estate agency (listing search, favorites, bond estimation, agents, valuation leads).

## Stack choices (fixed)
- **Spring Boot 3.4** Web MVC (not WebFlux) with **virtual threads** enabled; Spring Data JPA + Flyway on PostgreSQL; springdoc-openapi; JWT resource server with `CUSTOMER`/`AGENT`/`ADMIN` roles; Micrometer/Actuator.
- DTOs are **records**; enums for closed sets (`ListingStatus`, `PropertyType`); `jakarta.validation` annotations on request records.
- Errors: Spring's built-in RFC 9457 `ProblemDetail` — never custom error envelopes.

## Conventions to preserve
- Search = one `Specification` composed per non-null filter field, `Pageable` with `@PageableDefault(size = 12)`, returning Spring `Page<T>`. Don't fork into bespoke query methods per filter combo.
- Listing status machine: `DRAFT → LIVE → UNDER_OFFER → SOLD` (+`WITHDRAWN`); invalid transitions → 409 ProblemDetail, enforced in the domain layer, not the controller.
- Money in minor units + currency; bond math server-side mirrors the UI amortization formula.
- Bucket4j rate limit on `/valuations` (5/min/IP); Caffeine cache on `/areas` + hot listings.

## When adding an endpoint
1. Request/response as records with validation annotations; add to the OpenAPI group.
2. Controller method thin: `@Valid` in, service call, typed record out; `@PreAuthorize` declares the role.
3. New searchable fields → extend the filter record + Specification + a DB index in a Flyway migration.
4. Media/files via signed object-storage URLs — nothing binary through the API.
5. Update API.md endpoint table + representative types.
6. Testing story: `@WebMvcTest` slice per controller, Testcontainers PostgreSQL for repos, REST Assured against the springdoc schema.

## Idiom checklist
- Constructor injection only; no field `@Autowired`.
- Pagination/sort via `Pageable` (`?sort=price,desc`), never hand-rolled params.
- Actuator health groups for liveness/readiness; new caches registered with metrics.
