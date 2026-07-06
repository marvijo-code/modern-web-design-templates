# Mono API — Design Doc (Ruby · Ruby on Rails)

**Language:** Ruby 3.4 · **Framework:** [Ruby on Rails 8](https://rubyonrails.org) (API-only mode) · **Why:** Rails remains the best-in-class Ruby web framework — convention-over-configuration, ActiveRecord, Action Mailer for the newsletter, Solid Queue for jobs, and `rails new --api` produces a lean JSON service.

## Domain
Mono is a single-author blog: posts with categories, a newsletter with double-opt-in subscriptions, and an RSS-equivalent JSON feed.

## Conventions
- Base `/api/v1` (namespaced routes); JSON rendered with Jbuilder; `camelCase` via `Jbuilder.key_format camelize: :lower`.
- Public reads anonymous + HTTP-cached; author endpoints behind a session or token (`has_secure_password` on the single Author).
- Errors: `{ "error": { "code": "...", "message": "..." } }`; 422 for validation with field details.

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/posts` | — | Published posts (`?category=craft&page=`) |
| GET | `/posts/{slug}` | — | Full post (rendered HTML + reading time) |
| GET | `/categories` | — | Categories with post counts |
| GET | `/feed.json` | — | JSON Feed 1.1 of latest 20 posts |
| POST | `/subscriptions` | — | Newsletter signup → sends confirm email |
| GET | `/subscriptions/confirm?token=` | — | Double-opt-in confirmation |
| DELETE | `/subscriptions?token=` | — | One-click unsubscribe (the promise in the UI) |
| POST | `/author/posts` | author | Create draft |
| PATCH | `/author/posts/{id}` | author | Edit / publish (`publishedAt` set server-side) |
| GET | `/author/subscribers` | author | Counts only — no exportable PII by design |

## Representative models
```ruby
class Post < ApplicationRecord
  belongs_to :category
  validates :title, :body_markdown, presence: true
  validates :slug, uniqueness: true, format: /\A[a-z0-9-]+\z/
  scope :published, -> { where.not(published_at: nil).order(published_at: :desc) }

  def reading_minutes = (body_markdown.split.size / 220.0).ceil
end

class Subscription < ApplicationRecord
  has_secure_token :confirm_token
  has_secure_token :unsubscribe_token
  validates :email, format: URI::MailTo::EMAIL_REGEXP, uniqueness: true
  enum :status, { pending: 0, confirmed: 1, unsubscribed: 2 }
end
```

## Routes & controller wiring (illustrative)
```ruby
namespace :api do
  namespace :v1 do
    resources :posts, only: %i[index show], param: :slug
    resources :subscriptions, only: :create
    get    "subscriptions/confirm", to: "subscriptions#confirm"
    delete "subscriptions",          to: "subscriptions#destroy"
  end
end

class Api::V1::PostsController < ApplicationController
  def index
    posts = Post.published.includes(:category)
    posts = posts.joins(:category).where(categories: { slug: params[:category] }) if params[:category]
    fresh_when posts   # ETag/Last-Modified -> 304s for feed readers
    render :index, locals: { posts: posts.page(params[:page]).per(10) }
  end
end
```

## Newsletter flow
`POST /subscriptions` → `pending` + `SubscriptionMailer.confirm` (Solid Queue job) → user clicks confirm link → `confirmed`. Fortnightly issue: an `IssueJob` fans out per-subscriber mail with the `unsubscribe_token` in the `List-Unsubscribe` header — the "one click and actually works" promise is a header-level guarantee.

## Non-functional
- **Storage:** SQLite in dev, PostgreSQL in prod; markdown stored, HTML rendered at publish time (commonmarker) and cached.
- **Caching:** `fresh_when`/`stale?` conditional GETs everywhere public; CDN in front.
- **Rate limiting:** `Rack::Attack` — 5 subscription attempts/hour/IP; honeypot param dropped silently.
- **Privacy:** no open/click tracking; subscriber export deliberately absent.
- **Testing:** Minitest + fixtures; mailer previews; request specs assert JSON:API shape and cache headers.
