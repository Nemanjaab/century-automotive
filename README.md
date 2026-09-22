# Century Automotive — V4 Production Candidate

A premium automotive service website concept built with PHP, vanilla JavaScript, Three.js and GSAP. No React, TypeScript, npm or build step.

## V4 goals
V4 keeps the same recognizable 3D/blueprint engine experience on desktop, tablet and phone, but shifts the project toward real usability: faster scanning, better mobile layout, stronger booking validation, a more useful staff workflow and tighter security.

### Public site
- Same procedural Three.js engine and seven-stage teardown story across device sizes.
- Responsive camera/layout rather than replacing the phone experience with a different site.
- Adaptive render density based on viewport/device capability; geometry and teardown content remain the same.
- Mobile component callouts remain available in a compact form instead of removing the engineering layer.
- Engine rendering pauses when it is off-screen/hidden to reduce needless GPU work.
- WebGL fallback messaging if the 3D context is unavailable.
- Quicker engineering scroll length so the motion story supports the service goal instead of dominating it.
- Quick-action strip for Call / Request Service / Directions.
- Persistent Call / Request Service dock on phones.
- Service category filters for Repair, Tires & Alignment, Mobility and Care & Maintenance.
- Accessible skip link, keyboard-friendly navigation and reduced-motion support.
- SEO/social metadata and baseline browser security headers.

### Booking
- Three-step request flow with visible progress.
- Vehicle, service, symptom, preferred date/window, phone and email validation.
- Monday-Friday date enforcement on both browser and server side.
- Optional towing, replacement-vehicle and wash requests.
- Preferred contact method: phone, email or either.
- Honeypot spam field, CSRF validation and a basic double-submit throttle.
- Unique request reference returned to the customer.
- Requests are stored outside the public web root.

The booking remains a **service request**, not an automatic promise that the selected time is available. The shop confirms the appointment.

### Staff Service Desk
Open `/admin/` on the same domain.

Workflow:

`New → Confirmed → Vehicle received → In service → Ready for pickup → Completed`

A request can also be declined or reopened.

Staff features:
- Search by name, phone, email, vehicle, service or reference.
- Status filters and live queue counts.
- Customer contact details and preferred contact method.
- Requested towing / replacement vehicle / wash add-ons.
- Internal staff notes.
- 30-second quiet refresh while the dashboard is visible.
- Direct `tel:` and `mailto:` links.
- Admin route is `noindex` and is not linked from the public website.

## Run locally
Open Command Prompt in this folder:

```bash
php -S localhost:8080
```

Public site:

`http://localhost:8080`

Staff Service Desk:

`http://localhost:8080/admin/`

### Local-only demo login
If no production password is configured and the request is coming from localhost, the fallback password is:

`demo1234`

The fallback does **not** work for a public/non-local deployment.

## Production admin password
A normal strong environment password is supported:

```bash
CENTURY_ADMIN_PASSWORD="use-a-long-random-password"
```

Prefer a password hash when the host supports environment variables cleanly. Generate one with PHP:

```bash
php -r "echo password_hash('YOUR-STRONG-PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"
```

Then configure:

```bash
CENTURY_ADMIN_PASSWORD_HASH="$2y$..."
```

If the hash variable is present, it is used instead of the plaintext password variable.

## Private appointment storage
By default requests are stored one directory above the project:

`../century-automotive-private/appointments.json`

For production, point the site to a writable directory outside `public_html` / the public document root:

```bash
CENTURY_DATA_DIR="/private/path/century-data"
```

## Hosting
Requires PHP 8+.

A normal PHP shared host, managed PHP host or VPS can run the full project. **Netlify alone will only host the static frontend and will not execute this PHP booking/admin backend.**

The visitor also needs internet access for the current CDN-loaded Three.js, GSAP and Google Fonts assets.

## Security included in the demo
- CSRF validation.
- HttpOnly / SameSite session cookie configuration.
- Session ID regeneration on successful admin login.
- Local-only fallback demo password.
- Optional password-hash environment configuration.
- Basic login-attempt cooldown.
- Customer data outside the public web root.
- `X-Content-Type-Options`, `X-Frame-Options`, Referrer Policy, Permissions Policy and a restrictive CSP matching this project’s CDNs.
- Admin API returns `401 Unauthorized` without an authenticated staff session.

For a real high-volume deployment, move from JSON storage to a database, place the app behind HTTPS, use host-level backups, and add a real transactional email/SMS provider rather than relying on server mail.

## Important before presenting it as Century Automotive's official site
This is still a client-acquisition/demo concept. The added tire hotel, tire sales, towing, replacement-vehicle and wash services were requested for the concept and have **not** been independently confirmed as services Century Automotive currently offers. Confirm their actual service list, policies, branding permission, review wording and appointment workflow before an official launch.


V5 notes: removed stray technical ring line, reduced WebGL artifacting, tuned hero spin, lowered heavy edge overlays, and kept the same design language across desktop/mobile while focusing on polish rather than new features.
