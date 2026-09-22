<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
$csrf = century_csrf();
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#07090b">
  <meta name="description" content="Century Automotive — honest automotive service and repair in Austin, Texas. Diagnostics, tires, alignment, towing and appointment requests.">
  <meta name="robots" content="index,follow">
  <meta property="og:title" content="Century Automotive | Austin, TX">
  <meta property="og:description" content="Straight answers. Skilled mechanical work. Request service online.">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary">
  <meta name="csrf-token" content="<?= htmlspecialchars($csrf, ENT_QUOTES) ?>">
  <title>Century Automotive | Austin, TX</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/styles.css?v=4">
</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <div class="noise" aria-hidden="true"></div>
  <div class="cursor-glow" aria-hidden="true"></div>

  <header class="site-header" id="top">
    <a class="brand" href="#top" aria-label="Century Automotive home">
      <span class="brand-mark"><i></i><i></i><i></i></span>
      <span><b>CENTURY</b><small>AUTOMOTIVE / AUSTIN</small></span>
    </a>
    <nav class="desktop-nav" aria-label="Primary navigation">
      <a href="#services">Services</a>
      <a href="#engineering">Why Century</a>
      <a href="#reviews">Reviews</a>
      <a href="#contact">Contact</a>
    </nav>
    <div class="header-actions">
      <a class="phone-link" href="tel:+15124671255">(512) 467-1255</a>
      <a class="button button-small" href="#book">Request service</a>
    </div>
    <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
  </header>

  <div id="engine-canvas" class="engine-canvas is-hero" aria-hidden="true">
    <div class="engine-fallback"><span>ENGINE VISUAL</span><b>Loading technical model…</b></div>
  </div>

  <main id="main">
    <section class="hero" id="hero">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="hero-shade" aria-hidden="true"></div>

      <div class="hero-copy container">
        <div class="eyebrow reveal"><span class="pulse"></span>AUSTIN, TX · INDEPENDENT AUTO REPAIR</div>
        <h1 class="hero-title" aria-label="Machines are complicated. Trust shouldn't be.">
          <span class="line"><span>MACHINES ARE</span></span>
          <span class="line accent-line"><span>COMPLICATED.</span></span>
          <span class="line"><span>TRUST SHOULDN’T BE.</span></span>
        </h1>
        <p class="hero-lede reveal">Straight answers. Skilled mechanical work. No unnecessary upsell. Just the kind of shop you want working on the car that gets you home.</p>
        <div class="hero-actions reveal">
          <a class="button magnetic" href="#book">Request an appointment <span>↗</span></a>
          <a class="text-link" href="#engineering">See how we work <span>↓</span></a>
        </div>
      </div>

      <div class="hero-meta">
        <div><strong>4.9<span>★</span></strong><small>178 GOOGLE REVIEWS</small></div>
        <div><strong>07—17</strong><small>MONDAY — FRIDAY</small></div>
        <div><strong>AUSTIN</strong><small>5220A JIM HOGG AVE</small></div>
      </div>
      <div class="scroll-cue" aria-hidden="true"><span></span><small>SCROLL TO DISASSEMBLE</small></div>
    </section>

    <section class="utility-strip" aria-label="Quick actions">
      <div class="container utility-grid">
        <a href="tel:+15124671255"><small>NEED TO TALK?</small><b>Call (512) 467-1255</b><span>↗</span></a>
        <a href="#book"><small>READY TO PLAN A VISIT?</small><b>Request service</b><span>↓</span></a>
        <a href="https://www.google.com/maps/dir/?api=1&destination=5220A+Jim+Hogg+Ave,+Austin,+TX+78756" target="_blank" rel="noopener"><small>COMING TO THE SHOP?</small><b>Get directions</b><span>↗</span></a>
      </div>
    </section>

    <section class="engineering" id="engineering">
      <div class="engineering-stage">
        <div class="engine-outline" aria-hidden="true"></div>
        <div class="blueprint-caption" aria-hidden="true"><span>TECHNICAL CUTAWAY</span><b>ENGINE / ASSEMBLY 01</b></div>
        <div class="container engineering-layout">
          <div class="engineering-index">
            <span>01</span><i><b data-engine-progress></b></i><span>07</span>
          </div>
          <div class="engineering-copy">
            <div class="chapter is-active" data-engine-step="0">
              <div class="eyebrow">01 / DIAGNOSE</div>
              <h2>Read the system.<br><em>Then touch the tools.</em></h2>
              <p>A repair starts with evidence: symptoms, scan data, fluid condition, compression, noise, temperature and visual inspection. The engine stays whole until the problem has a direction.</p>
              <div class="spec-row"><span>INPUT</span><b>SYMPTOM + DATA</b><span>VIEW</span><b>FULL ASSEMBLY</b></div>
            </div>
            <div class="chapter" data-engine-step="1">
              <div class="eyebrow">02 / EXTERNAL SYSTEMS</div>
              <h2>Strip the outside.<br><em>Preserve the logic.</em></h2>
              <p>Coils, intake, fuel rail, exhaust, cooling hardware, belts and accessories move away first. The technical view keeps every subsystem visible while the engine opens up.</p>
              <div class="spec-row"><span>AIR / FUEL</span><b>SEPARATED</b><span>ACCESSORIES</span><b>REMOVED</b></div>
            </div>
            <div class="chapter" data-engine-step="2">
              <div class="eyebrow">03 / VALVE TRAIN</div>
              <h2>Zoom into the<br><em>top-end geometry.</em></h2>
              <p>Valve cover, camshafts, cam caps, springs, valves, spark plugs and timing components separate into a blueprint-style detail view. Synchronization becomes something you can actually see.</p>
              <div class="spec-row"><span>CAM PHASE</span><b>INDEXED</b><span>VALVES</span><b>EXPOSED</b></div>
            </div>
            <div class="chapter" data-engine-step="3">
              <div class="eyebrow">04 / COMBUSTION</div>
              <h2>Inside the cylinder.<br><em>Where pressure becomes motion.</em></h2>
              <p>The head and gasket lift away and the camera moves into the bore line. Pistons, rings, wrist pins, valves and injector paths are shown as individual working pieces.</p>
              <div class="spec-row"><span>BORES</span><b>VISIBLE</b><span>PISTONS</span><b>EXTRACTED</b></div>
            </div>
            <div class="chapter" data-engine-step="4">
              <div class="eyebrow">05 / BOTTOM END</div>
              <h2>Follow the force<br><em>all the way down.</em></h2>
              <p>Connecting rods, crankshaft, main caps, bearings, flywheel, oil pump and pickup are isolated. This is the structure that turns combustion into dependable rotation.</p>
              <div class="spec-row"><span>CRANK</span><b>EXPOSED</b><span>LUBE PATH</span><b>VISIBLE</b></div>
            </div>
            <div class="chapter" data-engine-step="5">
              <div class="eyebrow">06 / REBUILD</div>
              <h2>Clearances. Torque.<br><em>Sequence.</em></h2>
              <p>The exploded drawing reverses. Bearings seat, crank and rods return, pistons enter the bores, the head indexes to the block and the valve train closes in the correct order.</p>
              <div class="spec-row"><span>ASSEMBLY</span><b>IN SEQUENCE</b><span>SHORTCUTS</span><b>NONE</b></div>
            </div>
            <div class="chapter" data-engine-step="6">
              <div class="eyebrow">07 / RETURN</div>
              <h2>One machine again.<br><em>Ready for the road.</em></h2>
              <p>The technical drawing fades back into a complete engine. The goal is never the teardown itself — it is a vehicle that leaves correctly diagnosed, correctly assembled and ready to work.</p>
              <div class="spec-row"><span>RESULT</span><b>ROAD READY</b><span>STATE</span><b>SYSTEM / READY</b></div>
            </div>
          </div>
          <aside class="engineering-hud" aria-hidden="true">
            <div class="hud-title">LIVE SYSTEM VIEW <span data-hud-percent>00%</span></div>
            <div class="hud-detail"><span>DETAIL VIEW</span><b data-detail-title>FULL ASSEMBLY</b><small data-detail-copy>ENGINE OVERVIEW · SCALE 1:8</small></div>
            <div class="hud-row"><span>CRANK</span><i></i><b data-hud="crank">LOCKED</b></div>
            <div class="hud-row"><span>PISTONS</span><i></i><b data-hud="pistons">SYNC</b></div>
            <div class="hud-row"><span>HEAD</span><i></i><b data-hud="head">SEALED</b></div>
            <div class="hud-row"><span>STATE</span><i></i><b data-hud="state">DIAGNOSE</b></div>
            <div class="hud-scan"><span></span></div>
          </aside>
        </div>
      </div>
    </section>

    <section class="services section-pad" id="services">
      <div class="container">
        <div class="section-head">
          <div><div class="eyebrow">CAPABILITIES / 02</div><h2>From engine internals<br>to the <em>whole vehicle.</em></h2></div>
          <p>A full-service concept covering mechanical repair, tires, alignment, recovery, mobility and vehicle care.</p>
        </div>

        <div class="engine-coverage">
          <div class="engine-coverage-copy">
            <span class="eyebrow">ENGINE LAB / MULTI-ARCHITECTURE</span>
            <h3>Not one engine shape.<br><em>Engine systems in every layout.</em></h3>
            <p>The animated cutaway uses an inline-four so the components are easy to read, but the service concept is designed around a broad range of gasoline, diesel and hybrid-combustion powertrains.</p>
          </div>
          <div class="engine-type-grid" aria-label="Example engine types">
            <span>INLINE-3</span><span>INLINE-4</span><span>INLINE-5</span><span>INLINE-6</span>
            <span>V6</span><span>V8</span><span>V10</span><span>BOXER-4</span><span>BOXER-6</span>
            <span>NATURALLY ASPIRATED</span><span>TURBOCHARGED</span><span>SUPERCHARGED</span>
            <span>GASOLINE / GDI</span><span>DIESEL / CRDI</span><span>HYBRID ICE</span>
          </div>
        </div>

        <div class="service-tools" aria-label="Filter services">
          <span>FIND A SERVICE</span>
          <div class="service-filters" role="group" aria-label="Service categories">
            <button type="button" class="is-active" data-service-filter="all">All</button>
            <button type="button" data-service-filter="repair">Repair</button>
            <button type="button" data-service-filter="tires">Tires & alignment</button>
            <button type="button" data-service-filter="mobility">Mobility</button>
            <button type="button" data-service-filter="care">Care & maintenance</button>
          </div>
        </div>

        <div class="service-grid expanded-services">
          <article class="service-card service-card-featured" data-service="Engine Diagnostics & Repair" data-category="repair">
            <span class="service-no">01</span><div class="service-icon engine-icon" aria-hidden="true"></div>
            <h3>Engine diagnostics<br>& repair</h3><p>Gasoline, diesel, turbo, naturally aspirated and hybrid-combustion systems — diagnosis, leaks, timing, cooling, compression, drivability and internal repair.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Tire Change & Mounting" data-category="tires">
            <span class="service-no">02</span><div class="service-icon tire-icon" aria-hidden="true"></div>
            <h3>Tire change<br>& mounting</h3><p>Seasonal swaps, mounting and careful wheel handling for passenger cars, SUVs and light trucks.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Seasonal Tire Storage / Tire Hotel" data-category="tires">
            <span class="service-no">03</span><div class="service-icon storage-icon" aria-hidden="true"></div>
            <h3>Tire hotel<br>& storage</h3><p>Seasonal tire and wheel storage so customers do not have to transport or make room for an extra set.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Tire Sales" data-category="tires">
            <span class="service-no">04</span><div class="service-icon tire-sale-icon" aria-hidden="true"></div>
            <h3>All types<br>of tires</h3><p>Summer, winter, all-season, performance, touring, SUV and light-truck tire sourcing and fitment.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Wheel Balancing & Centering" data-category="tires">
            <span class="service-no">05</span><div class="service-icon balance-icon" aria-hidden="true"></div>
            <h3>Centering<br>& balancing</h3><p>Precision wheel centering and balancing to reduce vibration and protect tires, bearings and suspension components.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Wheel Alignment / Suspension Geometry" data-category="tires">
            <span class="service-no">06</span><div class="service-icon alignment-icon" aria-hidden="true"></div>
            <h3>Wheel alignment<br>& geometry</h3><p>Toe, camber and caster checks with suspension geometry adjustment for straight tracking and even tire wear.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Towing / Vehicle Recovery" data-category="mobility">
            <span class="service-no">07</span><div class="service-icon tow-icon" aria-hidden="true"></div>
            <h3>Towing<br>& recovery</h3><p>Vehicle recovery and transport to the shop when driving it in is not possible or not advisable.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Replacement Vehicle / Courtesy Rental" data-category="mobility">
            <span class="service-no">08</span><div class="service-icon replacement-icon" aria-hidden="true"></div>
            <h3>Replacement<br>vehicle</h3><p>A temporary mobility option during eligible repairs, requested together with the service visit and confirmed by the shop.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Vehicle Wash & Delivery Clean" data-category="care">
            <span class="service-no">09</span><div class="service-icon wash-icon" aria-hidden="true"></div>
            <h3>Vehicle wash<br>& delivery clean</h3><p>Exterior wash and finishing option so the vehicle can leave the shop mechanically sorted and clean.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Air Conditioning & Heating" data-category="repair">
            <span class="service-no">10</span><div class="service-icon fan-icon" aria-hidden="true"><i></i><i></i><i></i></div>
            <h3>A/C &<br>heating</h3><p>Climate-system diagnosis and repair to keep the cabin comfortable through Texas weather.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Brakes & Safety Inspection" data-category="repair">
            <span class="service-no">11</span><div class="service-icon rotor-icon" aria-hidden="true"></div>
            <h3>Brakes &<br>safety</h3><p>Inspection and repair of brake and safety-critical systems, from pads and rotors to hydraulic concerns.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Oil Change & Scheduled Maintenance" data-category="care">
            <span class="service-no">12</span><div class="service-icon drop-icon" aria-hidden="true"></div>
            <h3>Maintenance<br>& oil service</h3><p>Routine service that protects reliability, longevity and the value of the vehicle.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Battery & Electrical" data-category="repair">
            <span class="service-no">13</span><div class="service-icon battery-icon" aria-hidden="true"></div>
            <h3>Battery &<br>electrical</h3><p>Starting, charging, battery and electrical-system diagnosis when something does not add up.</p><button type="button">Request this service <span>↗</span></button>
          </article>
          <article class="service-card" data-service="Pre-Purchase Inspection" data-category="care">
            <span class="service-no">14</span><div class="service-icon scan-icon" aria-hidden="true"><i></i></div>
            <h3>Pre-purchase<br>inspection</h3><p>A second set of experienced eyes before somebody else’s car becomes your car.</p><button type="button">Request this service <span>↗</span></button>
          </article>
        </div>
        <p class="concept-note">Demo service catalog — final availability, tire brands, towing radius and replacement-vehicle terms should be confirmed with Century Automotive before public launch.</p>
      </div>
    </section>

    <section class="proof" id="reviews">
      <div class="proof-track" aria-hidden="true"><span>HONEST WORK · CLEAR ANSWERS · LOCAL SHOP · HONEST WORK · CLEAR ANSWERS · LOCAL SHOP ·&nbsp;</span><span>HONEST WORK · CLEAR ANSWERS · LOCAL SHOP · HONEST WORK · CLEAR ANSWERS · LOCAL SHOP ·&nbsp;</span></div>
      <div class="container proof-grid">
        <div class="proof-score">
          <div class="eyebrow">TRUST / 03</div>
          <strong>4.9<sup>★</sup></strong>
          <p>Google rating from <b>178 reviews</b>.</p>
          <a class="text-link" href="https://www.google.com/maps/search/?api=1&query=Century+Automotive+5220A+Jim+Hogg+Ave+Austin+TX" target="_blank" rel="noopener">Open Google Maps <span>↗</span></a>
        </div>
        <div class="quote-stack">
          <blockquote><p>“Trusted and quality car service shop in Austin.”</p><footer>Verified service customer · 2026</footer></blockquote>
          <blockquote><p>“Honest, reliable and trustworthy.”</p><footer>Verified service customer · 2026</footer></blockquote>
          <blockquote><p>“Old-school pride in their craft and a job done well.”</p><footer>Verified service customer · 2026</footer></blockquote>
        </div>
      </div>
    </section>

    <section class="process section-pad">
      <div class="container">
        <div class="section-head"><div><div class="eyebrow">WHAT HAPPENS NEXT / 04</div><h2>Three steps.<br><em>No runaround.</em></h2></div></div>
        <div class="process-list">
          <div class="process-row"><span>01</span><h3>Tell us what the car is doing.</h3><p>Send the vehicle, symptom and the best day to look at it.</p></div>
          <div class="process-row"><span>02</span><h3>We review your request.</h3><p>Your selected time is a preference, not an automatic confirmation.</p></div>
          <div class="process-row"><span>03</span><h3>We confirm the plan.</h3><p>The shop follows up to confirm timing before you bring the vehicle in.</p></div>
        </div>
      </div>
    </section>

    <section class="booking" id="book">
      <div class="booking-backdrop" aria-hidden="true"><span>REQUEST</span><span>SERVICE</span></div>
      <div class="container booking-grid">
        <div class="booking-copy">
          <div class="eyebrow">SERVICE REQUEST / 05</div>
          <h2>Tell us what<br>your car is <em>telling you.</em></h2>
          <p>Choose a preferred day and window. This sends a request to the shop; your appointment is confirmed only after we contact you.</p>
          <div class="booking-contact">
            <a href="tel:+15124671255"><span>CALL THE SHOP</span><b>(512) 467-1255</b></a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=5220A+Jim+Hogg+Ave,+Austin,+TX+78756" target="_blank" rel="noopener"><span>FIND US</span><b>5220A Jim Hogg Ave ↗</b></a>
          </div>
        </div>

        <form class="booking-form" id="booking-form" novalidate>
          <input class="hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="form-progress" aria-hidden="true"><i data-form-progress></i></div>
          <div class="selected-service" data-selected-service hidden><span>SELECTED SERVICE</span><b></b></div>
          <div class="form-step is-active" data-form-step="1">
            <div class="form-top"><span>STEP 01 / 03</span><b>YOUR VEHICLE</b></div>
            <div class="field-row three">
              <label><span>Year</span><input name="vehicle_year" inputmode="numeric" placeholder="2019" maxlength="4" required></label>
              <label><span>Make</span><input name="vehicle_make" placeholder="Toyota" maxlength="40" required></label>
              <label><span>Model</span><input name="vehicle_model" placeholder="4Runner" maxlength="40" required></label>
            </div>
            <label><span>What do you need?</span>
              <select name="service" required>
                <option value="">Select a service</option>
                <option>Engine Diagnostics & Repair</option><option>Tire Change & Mounting</option><option>Seasonal Tire Storage / Tire Hotel</option><option>Tire Sales</option><option>Wheel Balancing & Centering</option><option>Wheel Alignment / Suspension Geometry</option><option>Towing / Vehicle Recovery</option><option>Replacement Vehicle / Courtesy Rental</option><option>Vehicle Wash & Delivery Clean</option><option>Air Conditioning & Heating</option><option>Brakes & Safety Inspection</option><option>Oil Change & Scheduled Maintenance</option><option>Battery & Electrical</option><option>Pre-Purchase Inspection</option><option>Not sure / Diagnose a problem</option><option>Other</option>
              </select>
            </label>
            <button class="button form-next" type="button">Continue <span>→</span></button>
          </div>

          <div class="form-step" data-form-step="2">
            <div class="form-top"><span>STEP 02 / 03</span><b>WHAT’S HAPPENING?</b></div>
            <label><span>Describe the issue</span><textarea name="issue" rows="5" maxlength="1200" placeholder="Noise, warning light, leak, vibration, when it happens…" required></textarea></label>
            <div class="field-row two">
              <label><span>Preferred date</span><input type="date" name="preferred_date" required></label>
              <label><span>Preferred window</span><select name="preferred_window" required><option value="">Choose a window</option><option>Morning · 7–10 AM</option><option>Midday · 10 AM–1 PM</option><option>Afternoon · 1–4 PM</option><option>Any time that day</option></select></label>
            </div>
            <div class="assistance-options">
              <span class="field-caption">Mobility & add-ons</span>
              <label class="check-option"><input type="checkbox" name="needs_tow" value="yes"><span><b>Towing / recovery</b><small>I may need the vehicle transported to the shop.</small></span></label>
              <label class="check-option"><input type="checkbox" name="needs_replacement_vehicle" value="yes"><span><b>Replacement vehicle</b><small>Request temporary transportation while my vehicle is being repaired.</small></span></label>
              <label class="check-option"><input type="checkbox" name="add_wash" value="yes"><span><b>Vehicle wash</b><small>Add a wash / delivery clean if available.</small></span></label>
            </div>
            <div class="form-nav"><button class="text-link form-back" type="button">← Back</button><button class="button form-next" type="button">Continue <span>→</span></button></div>
          </div>

          <div class="form-step" data-form-step="3">
            <div class="form-top"><span>STEP 03 / 03</span><b>HOW SHOULD WE REACH YOU?</b></div>
            <label><span>Name</span><input name="name" autocomplete="name" maxlength="80" required></label>
            <div class="field-row two">
              <label><span>Phone</span><input name="phone" type="tel" autocomplete="tel" maxlength="30" required></label>
              <label><span>Email</span><input name="email" type="email" autocomplete="email" maxlength="120" required></label>
            </div>
            <fieldset class="contact-preference"><legend>Preferred contact</legend><label><input type="radio" name="contact_preference" value="phone" checked><span>Phone</span></label><label><input type="radio" name="contact_preference" value="email"><span>Email</span></label><label><input type="radio" name="contact_preference" value="either"><span>Either</span></label></fieldset>
            <p class="form-disclaimer">By sending this request, you’re asking Century Automotive to contact you about scheduling. This is not an instant booking confirmation.</p>
            <div class="form-nav"><button class="text-link form-back" type="button">← Back</button><button class="button submit-button" type="submit"><span class="submit-label">Send service request</span><span class="submit-loader"></span></button></div>
          </div>
          <div class="form-status" role="status" aria-live="polite"></div>
        </form>
      </div>
    </section>

    <section class="contact" id="contact">
      <div class="container contact-grid">
        <div class="map-panel">
          <div class="map-grid" aria-hidden="true"></div><div class="map-ring one" aria-hidden="true"></div><div class="map-ring two" aria-hidden="true"></div><span class="map-pin" aria-hidden="true"></span>
          <div class="map-label"><small>30.3247° N · 97.7387° W</small><b>5220A JIM HOGG AVE<br>AUSTIN, TX 78756</b><a href="https://www.google.com/maps/dir/?api=1&destination=5220A+Jim+Hogg+Ave,+Austin,+TX+78756" target="_blank" rel="noopener">GET DIRECTIONS ↗</a></div>
        </div>
        <div class="contact-info">
          <div class="eyebrow">SHOP INFO / 06</div><h2>Local shop.<br><em>Easy to find.</em></h2>
          <dl><div><dt>PHONE</dt><dd><a href="tel:+15124671255">(512) 467-1255</a></dd></div><div><dt>HOURS</dt><dd>MON–FRI / 7:00 AM–5:00 PM<br>SAT–SUN / CLOSED</dd></div><div><dt>ADDRESS</dt><dd>5220A Jim Hogg Ave<br>Austin, TX 78756</dd></div></dl>
          <a class="button" href="#book">Request service <span>↗</span></a>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer-top"><a class="brand" href="#top"><span class="brand-mark"><i></i><i></i><i></i></span><span><b>CENTURY</b><small>AUTOMOTIVE / AUSTIN</small></span></a><h2>KEEP IT<br><em>MOVING.</em></h2></div>
    <div class="container footer-bottom"><span>© <?= date('Y') ?> CENTURY AUTOMOTIVE</span><span>INDEPENDENT AUTO REPAIR · AUSTIN, TX</span><span>REQUESTS CONFIRMED BY THE SHOP</span></div>
  </footer>

  <div class="mobile-menu" aria-hidden="true"><a href="#services">Services</a><a href="#engineering">Why Century</a><a href="#reviews">Reviews</a><a href="#book">Request service</a><a href="tel:+15124671255">(512) 467-1255</a></div>
  <div class="mobile-action-dock" aria-label="Quick actions"><a href="tel:+15124671255">Call</a><a href="#book">Request service</a></div>

  <noscript><div class="noscript">JavaScript is required for the interactive engine and online service request. You can still call (512) 467-1255.</div></noscript>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="assets/app.js?v=4"></script>
</body>
</html>
