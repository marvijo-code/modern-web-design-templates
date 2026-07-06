# Haven API — Design Doc (Java · Spring Boot)

**Language:** Java 21 (records, virtual threads) · **Framework:** [Spring Boot 3.4](https://spring.io/projects/spring-boot) (Spring Web MVC + Spring Data JPA) · **Why:** the definitive Java stack — mature validation (`jakarta.validation`), Spring Security for role-based staff access, springdoc-openapi for docs, and virtual threads make classic MVC scale like reactive without the complexity.

## Domain
Haven is an estate agency: property listings with rich search, saved favorites per user, bond (mortgage) estimation, agents, and valuation-booking leads.

## Conventions
- Base `/api/v1`; `camelCase` JSON (Jackson default); money as minor units + currency; `Page<T>` responses (`content`, `totalElements`, `page`, `size`).
- Auth: JWT resource server; anonymous search; `ROLE_CUSTOMER` for favorites; `ROLE_AGENT`/`ROLE_ADMIN` for listing management.
- Errors: RFC 9457 ProblemDetail (built into Spring 6).

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/listings` | — | Search: `?area=&type=&minBeds=&maxPrice=&status=&sort=price,desc&page=` |
| GET | `/listings/{id}` | — | Full listing (media, features, agent) |
| POST | `/listings` | agent | Create listing (starts `DRAFT`) |
| PATCH | `/listings/{id}` | agent | Update / transition status |
| GET | `/areas` | — | Areas with listing counts + median price |
| POST | `/favorites/{listingId}` | customer | Save a listing |
| DELETE | `/favorites/{listingId}` | customer | Unsave |
| GET | `/favorites` | customer | My saved listings |
| POST | `/bond/estimate` | — | Server-side amortization quote (mirrors UI calc) |
| POST | `/valuations` | — | Book-a-valuation lead (throttled) |
| GET | `/agents` / `/agents/{id}` | — | Team + track record |

## Representative types
```java
public record ListingSummary(
    UUID id, String name, String area, PropertyType type,
    long priceMinor, String currency, int beds, int baths, int floorM2,
    ListingStatus status, URI heroImage) {}

public enum ListingStatus { DRAFT, LIVE, UNDER_OFFER, SOLD, WITHDRAWN }

public record BondRequest(
    @Positive long priceMinor,
    @DecimalMin("0") @DecimalMax("90") BigDecimal depositPct,
    @Min(5) @Max(35) int termYears,
    @DecimalMin("0.1") @DecimalMax("30") BigDecimal annualRatePct) {}
```

## Controller wiring (illustrative)
```java
@RestController
@RequestMapping("/api/v1/listings")
class ListingController {

    @GetMapping
    Page<ListingSummary> search(@Valid ListingFilter filter,
                                @PageableDefault(size = 12) Pageable pageable) {
        return listings.search(filter, pageable);   // Spring Data Specification
    }

    @PostMapping
    @PreAuthorize("hasRole('AGENT')")
    @ResponseStatus(HttpStatus.CREATED)
    ListingDetail create(@Valid @RequestBody CreateListing cmd,
                         @AuthenticationPrincipal Jwt agent) {
        return listings.create(cmd, agent.getSubject());
    }
}
```

Search uses a JPA `Specification` composed per non-null filter field — one code path, index-friendly, no query explosion. Status transitions validated in the domain (`UNDER_OFFER → SOLD` allowed; `SOLD → LIVE` rejected → 409 ProblemDetail).

## Non-functional
- **Storage:** PostgreSQL, Flyway migrations; listing search columns indexed (`area`, `price_minor`, `beds`, `status`); media in object storage, URLs signed.
- **Caching:** Spring Cache (Caffeine) on `/areas` and hot listings; `ETag` shallow filter on GETs.
- **Rate limiting:** Bucket4j filter — 5/min per IP on `/valuations`.
- **Concurrency:** `spring.threads.virtual.enabled=true`; blocking JPA is fine on virtual threads.
- **Observability:** Actuator + Micrometer → Prometheus; `/actuator/health` liveness/readiness groups.
- **Testing:** `@WebMvcTest` slices per controller, Testcontainers PostgreSQL for repository/integration tests, REST Assured contract checks against the springdoc schema.
