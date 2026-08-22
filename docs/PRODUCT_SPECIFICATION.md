# Dukanen Marketplace — Product Specification

## Vision

Dukanen (دكانين) is a modern African multi-vendor marketplace designed initially for South Sudan and architected for later expansion into Uganda, Kenya, Rwanda, and other African markets.

**Concept:** A digital marketplace where people discover, buy, sell and grow.

Primary users are buyers, individual sellers, small businesses, shops, service providers, and marketplace administrators.

## Product principles

- Trust and marketplace safety
- Simple, clean UX
- Mobile-first design
- Fast loading and low-bandwidth usability
- Local African market relevance
- Scalable and portable architecture
- Strong search and discovery
- Useful seller tools
- Effective administrative control

## Core public experience

### Home
Include the Dukanen identity, search, location selector, authentication entry points, prominent Sell action, hero, popular categories, featured products, latest listings, recommendations, featured sellers, how-it-works content, trust/safety information, calls to action, and footer.

Hero message: **Buy. Sell. Discover.**

### Marketplace
Provide product browsing with search, category, location, price range, condition and seller-type filters; relevance/newest/price sorting; and pagination or efficient incremental loading.

Product cards should expose image, title, price, location, condition, seller, legitimate verification state, and favorite action.

### Product details
Provide image gallery, title, price, location, condition, description, seller information, rating, verification state, contact action, favorites, sharing, reporting and related products.

### Categories
Initial database-driven categories include Phones & Electronics, Computers, Vehicles, Property, Fashion, Home & Furniture, Jobs, Services, Agriculture, Beauty & Personal Care, Sports & Recreation, Baby & Kids, Business Equipment, and Other.

## Seller experience

Users can upgrade a normal account into a seller account. Seller profiles include store/business name, owner name, phone, email, location, description, logo/profile image, cover image and business category.

Seller dashboard metrics should include total listings, active listings, views, favorites, orders, sales/revenue summary and recent activity.

Listing management must support create, edit, delete, pause, mark sold and duplicate. Product creation includes title, description, category, price, currency, condition, location, multiple images, stock, notes and contact preference.

Every seller receives a public storefront at a predictable route such as `/seller/[seller-slug]`.

## Authentication and authorization

Support registration, login, logout, password reset, user profiles and seller profiles.

Roles:

- buyer
- seller
- admin

Authorization must be enforced server-side. Users can modify only resources they own unless an administrative role explicitly permits otherwise.

## Core data model

Entities include:

- users
- sellers
- categories
- products
- product_images
- favorites
- orders
- order_items
- reviews
- reports
- notifications

Relationships must enforce ownership and data integrity.

## Search and location

Search across product title, description, category, seller and location. Support suggestions, recent searches, popular searches and useful empty-state recommendations.

Location architecture should support country, state/region, city and neighborhood. Initial South Sudan focus includes Juba, Malakal, Wau, Bor, Yei, Aweil and Rumbek, without hard-coding the platform to one country.

## Orders and payments

Order states include pending, confirmed, processing, ready, shipped, delivered, cancelled and completed.

Listings may support direct seller contact, order request, or online checkout. Online payment must not be mandatory for every listing.

Keep payments provider-agnostic so Stripe, mobile money, local payment providers and bank payments can be integrated later. Never hard-code credentials.

## Communication

Provide a seller-contact flow containing seller contact options, inquiry form, product reference, buyer details and message while avoiding unnecessary public exposure of personal information. Keep the architecture ready for internal messaging later.

## Admin and moderation

Protect `/admin` and expose marketplace KPIs including users, sellers, active listings, orders, reported listings, new accounts and marketplace activity.

Administration covers users, sellers, products, categories, orders, reports, reviews, featured listings and platform settings.

Admins should be able to approve/reject listings, suspend accounts, remove inappropriate listings, feature products, manage categories and resolve reports.

Moderation reasons include fake listings, scams, incorrect information, prohibited items, duplicates and other concerns. Statuses include pending, investigating, resolved and dismissed.

## Trust system

Support legitimate seller verification, ratings, review counts, account age, listing history and reports. Never visually claim verification unless backed by stored verification state.

## Mobile-first requirements

Optimize for Android phones, small screens, slow connections and limited bandwidth. Use optimized images, lazy loading, minimal unnecessary animation, clear controls and large touch targets.

Suggested mobile navigation: Home | Browse | Sell | Favorites | Account.

Suggested desktop navigation: Logo | Browse | Categories | Sell | Favorites | Messages | Account.

## Design system

- Primary green: `#0B6B3A`
- Secondary green: `#168A4A`
- Accent yellow/gold: `#F4C542`
- Background: `#F8FAF8`
- Dark: `#17201A`
- Muted: `#66736B`
- White: `#FFFFFF`

Use readable modern typography with Arabic-compatible support, generous whitespace, rounded cards and a distinct Dukanen visual identity.

Reusable components should include navigation, footer, product/seller/category cards, search, filters, galleries, ratings, badges, buttons, modals, forms, notifications, empty/loading/error states, pagination, dashboard cards and tables.

## Quality requirements

Implement SEO fundamentals, accessible semantic HTML, keyboard support, good contrast, alt text, visible focus states, secure validation, sanitization, protected routes, ownership checks, secure uploads, secret isolation and polished loading/error/empty/offline states.

Optimize for small payloads, efficient queries, minimal JavaScript and fast first contentful paint.

## Scalability and portability

Prepare the architecture for multi-country operation, mobile apps, seller subscriptions, featured listings, advertising, delivery, mobile-money payments, internal messaging, analytics, business accounts, services and APIs without prematurely building all future features.

Avoid unnecessary vendor lock-in. Keep database relationships clear, URLs predictable, components reusable, business logic separated from presentation, integrations abstracted and secrets isolated.

## MVP implementation order

1. Homepage
2. Marketplace
3. Product listings
4. Product details
5. Search
6. Categories
7. Authentication
8. Seller accounts
9. Seller dashboard
10. Product management
11. Favorites
12. Seller profiles
13. Admin dashboard
14. Moderation
15. Orders
16. Notifications
17. Payment-ready architecture

The finished product should feel like a serious African technology marketplace, not a generic template or static product catalog.
