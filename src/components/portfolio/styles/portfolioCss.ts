/**
 * Portfolio stylesheet. Single source for the live renderer (injected as <style>) and the ZIP export
 * (written to styles.css). Everything is scoped under `.pf` and reads `--de-*` tokens from the root.
 * Layout responds to the portfolio's own width (container queries), so the studio's phone and tablet
 * frames render the real phone and tablet layouts.
 *
 * Containers: `pf` = portfolio root, `pfbody` = a section's content column.
 */
export const PORTFOLIO_CSS = String.raw`
.pf{container:pf/inline-size;position:relative;min-width:0;overflow-x:clip;background:var(--de-bg);color:var(--de-fg);font-family:var(--de-font-body);font-size:1.0625rem;line-height:var(--de-lead-body,1.6);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;scrollbar-color:var(--de-border) transparent}
.pf[data-pf-mode=dark]{color-scheme:dark}
.pf[data-pf-mode=light]{color-scheme:light}
.pf *,.pf *::before,.pf *::after{box-sizing:border-box}
.pf :where(h1,h2,h3,h4,p,ul,ol,dl,dd,dt,figure,blockquote){margin:0;padding:0}
.pf :where(ul,ol){list-style:none}
.pf :where(h1,h2,h3,h4){font-size:inherit;font-weight:inherit}
.pf img{display:block;max-width:100%;height:auto}
:where(.pf a){color:inherit;text-decoration:none}
.pf ::selection{background:color-mix(in srgb,var(--de-primary) 30%,transparent);color:var(--de-fg)}
.pf :focus-visible{outline:2px solid var(--de-primary);outline-offset:3px;border-radius:2px}
.pf[data-pf-bg=grid]{background-image:linear-gradient(color-mix(in srgb,var(--de-fg) 7%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--de-fg) 7%,transparent) 1px,transparent 1px);background-size:4rem 4rem}

.pf-skip{position:absolute;left:1rem;top:-5rem;z-index:60;padding:.65rem 1rem;background:var(--de-fg);color:var(--de-bg);border-radius:var(--de-radius);font-weight:600}
.pf-float{position:sticky;bottom:0;z-index:40;height:0;display:flex;justify-content:flex-end;padding-inline:max(.75rem,env(safe-area-inset-right));pointer-events:none}
.pf-float a{pointer-events:auto;display:flex;align-items:center;height:2.75rem;padding-inline:.6875rem;border-radius:999px;background:#fffefb;border:1px solid rgba(16,17,20,.14);box-shadow:0 10px 28px -14px rgba(16,17,20,.55);transform:translateY(calc(-100% - .75rem - env(safe-area-inset-bottom)));transition:box-shadow .3s,transform .3s cubic-bezier(.22,1,.36,1)}
.pf-float__tile{display:block;flex:none;width:1.375rem;height:1.375rem}
.pf-float__label{display:block;overflow:hidden;max-width:0;transition:max-width .55s cubic-bezier(.22,1,.36,1)}
.pf-float__label img{display:block;height:1.6rem;width:auto;max-width:none;margin-left:.5rem}
.pf-float a:hover .pf-float__label,.pf-float a:focus-visible .pf-float__label{max-width:8rem}
.pf-float a:hover,.pf-float a:focus-visible{box-shadow:0 14px 32px -14px rgba(16,17,20,.6)}
.pf-float a:active{transform:translateY(calc(-100% - .7rem - env(safe-area-inset-bottom))) scale(.97)}
@keyframes pf-float-in{from{transform:translateY(calc(-100% + .5rem))}}
@keyframes pf-float-peek{0%,8%{max-width:0}22%,80%{max-width:8rem}100%{max-width:0}}
@media (prefers-reduced-motion:no-preference){.pf-float a{animation:pf-float-in .7s cubic-bezier(.22,1,.36,1) .5s backwards}.pf-float__label{animation:pf-float-peek 5.5s cubic-bezier(.22,1,.36,1) .5s backwards}}@media print{.pf-float{display:none}}.pf-skip:focus{top:1rem}

/* ---------- frame ---------- */
.pf-wrap{width:100%;max-width:calc(var(--de-max) + 2 * var(--de-pad-x));margin-inline:auto;padding-inline:var(--de-pad-x)}
.pf-shell{min-width:0}
.pf-main{min-width:0}
.pf-sec{--pf-sec-bg:var(--de-bg);position:relative;padding-block:var(--de-pad-y);scroll-margin-top:5rem}
.pf-sec[data-tone=alt]{--pf-sec-bg:var(--de-bg2);background:var(--de-bg2)}
.pf[data-pf-shell=wide] .pf-sec+.pf-sec{border-top:1px solid var(--de-border)}
.pf-sec--hero{padding-block:clamp(3rem,11cqi,8.5rem) clamp(3rem,8cqi,6rem)}
.pf-body{container:pfbody/inline-size;min-width:0}

/* ---------- section titles ---------- */
.pf-title{font-family:var(--de-font-display);font-weight:var(--de-w-heading);font-size:var(--de-h2-size);line-height:1.1;letter-spacing:-0.02em;color:var(--de-fg);text-wrap:balance;overflow-wrap:anywhere;min-width:0;margin-bottom:clamp(1.5rem,4cqi,2.75rem)}
.pf[data-pf-title=rule] .pf-title{border-top:2px solid var(--de-fg);padding-top:.875rem}
.pf[data-pf-dir=BRUTALIST_GRID] .pf-title{border-top:4px solid var(--de-fg);padding-top:.75rem;text-transform:uppercase;letter-spacing:.01em}
@container pf (min-width:64rem){
  .pf[data-pf-shell=wide] .pf-block{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2.6fr);column-gap:clamp(2rem,5cqi,5rem);align-items:start}
  .pf[data-pf-shell=wide] .pf-block>.pf-title{position:sticky;top:6rem;margin-bottom:0;font-size:min(var(--de-h2-size),2.5rem)}
}

/* ---------- text ---------- */
.pf-prose{max-width:65ch;color:var(--de-fg)}
.pf-prose p{white-space:pre-line;text-wrap:pretty}
.pf-prose p+p{margin-top:1em}
.pf-desc{margin-top:.5rem;color:var(--de-muted)}
.pf-meta{font-size:.875rem;line-height:1.5;color:var(--de-muted);font-variant-numeric:tabular-nums}
.pf-about--lead .pf-prose>p:first-child,.pf-about--columns .pf-prose>p:first-child{font-family:var(--de-font-display);font-weight:500;font-size:clamp(1.375rem,3.4cqi,2.125rem);line-height:1.3;letter-spacing:-0.01em;max-width:34ch;margin-bottom:.35em}
.pf-about--lead .pf-prose>p:not(:first-child),.pf-about--columns .pf-prose>p:not(:first-child){color:var(--de-muted)}
@container pfbody (min-width:48rem){
  .pf-about--columns .pf-prose{max-width:none;columns:2;column-gap:3rem}
  .pf-about--columns .pf-prose>p:first-child{column-span:all}
  .pf-about--columns .pf-prose p{break-inside:avoid}
}

/* ---------- links & buttons (default, hover, focus, active) ---------- */
.pf-link{display:inline-flex;align-items:baseline;gap:.35em;max-width:100%;min-width:0;color:var(--de-primary);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.22em;text-decoration-color:color-mix(in srgb,currentColor 45%,transparent);transition:text-decoration-color .2s,color .2s}
.pf-link:hover{text-decoration-color:currentColor}
.pf-link:active{opacity:.7}
.pf-link__text{min-width:0;overflow-wrap:anywhere}
.pf-arrow{flex:none;width:.8em;height:.8em;align-self:center;transition:transform .2s cubic-bezier(.2,.7,.2,1)}
.pf-link:hover .pf-arrow{transform:translate(2px,-2px)}
.pf-ctas{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:clamp(1.5rem,4cqi,2.25rem)}
.pf-btn{display:inline-flex;align-items:center;gap:.5rem;min-height:2.75rem;padding:.65rem 1.25rem;border:1px solid var(--de-primary);border-radius:var(--de-radius);background:var(--de-primary);color:var(--de-on-primary,var(--de-bg));font-weight:600;font-size:.9375rem;line-height:1.2;white-space:nowrap;transition:background-color .2s,color .2s,border-color .2s,transform .15s}
.pf-btn:hover{background:color-mix(in srgb,var(--de-primary) 84%,var(--de-fg))}
.pf-btn:active{transform:translateY(1px)}
.pf-btn--quiet{background:transparent;color:var(--de-fg);border-color:var(--de-border)}
.pf-btn--quiet:hover{background:transparent;border-color:var(--de-fg)}
.pf-btn--quiet:hover .pf-arrow{transform:translateX(3px)}
.pf[data-pf-btn=text] .pf-btn{padding-inline:0;border:0;background:none;color:var(--de-primary);text-decoration:underline;text-underline-offset:.3em;text-decoration-thickness:1px}
.pf[data-pf-btn=text] .pf-btn--quiet{color:var(--de-fg)}
.pf[data-pf-btn=text] .pf-btn:hover{text-decoration-thickness:2px}
.pf[data-pf-btn=outline] .pf-btn{background:transparent;color:var(--de-primary)}
.pf[data-pf-btn=outline] .pf-btn:hover{background:color-mix(in srgb,var(--de-primary) 12%,transparent)}
.pf[data-pf-btn=outline] .pf-btn--quiet{color:var(--de-fg);border-color:var(--de-border)}
.pf[data-pf-btn=block] .pf-btn{border-width:2px;border-radius:0;text-transform:uppercase;letter-spacing:.05em;font-size:.875rem}
.pf[data-pf-btn=block] .pf-btn--quiet{border-color:var(--de-fg)}

/* ---------- chips / lists ---------- */
.pf-chips{display:flex;flex-wrap:wrap;gap:.5rem}
.pf-chip{display:inline-flex;align-items:center;max-width:100%;min-height:2rem;padding:.3rem .8rem;border:1px solid var(--de-border);border-radius:999px;font-size:.875rem;line-height:1.3;color:var(--de-fg);overflow-wrap:anywhere}
.pf[data-pf-chip=pill] .pf-chip{background:var(--de-surface);border-color:color-mix(in srgb,var(--de-border) 50%,transparent)}
.pf[data-pf-chip=square] .pf-chip{border-radius:.25rem;font-family:var(--de-font-mono);font-size:.8125rem}
.pf-cols{columns:13rem;column-gap:2rem}
.pf-cols li{break-inside:avoid;padding-block:.6rem;border-bottom:1px solid var(--de-border);overflow-wrap:anywhere}
.pf-inline{display:flex;flex-wrap:wrap;row-gap:.15em;font-family:var(--de-font-display);font-size:clamp(1.25rem,3.2cqi,1.875rem);line-height:1.35;letter-spacing:-0.01em}
.pf-inline li{overflow-wrap:anywhere;min-width:0}
.pf-inline li:not(:last-child)::after{content:"/";margin-inline:.4em;color:var(--de-muted);font-weight:400}
.pf-list>li{padding-block:clamp(1rem,2.5cqi,1.5rem);border-top:1px solid var(--de-border)}
.pf-list>li:last-child{border-bottom:1px solid var(--de-border)}
.pf-bullets{display:grid;gap:.4rem;max-width:65ch;margin-top:.75rem;color:var(--de-muted)}
.pf-bullets li{position:relative;padding-left:1.15rem;text-wrap:pretty}
.pf-bullets li::before{content:"";position:absolute;left:0;top:.75em;width:.45rem;height:1px;background:var(--de-primary)}
.pf-tools{margin-top:.75rem;font-size:.875rem;color:var(--de-muted)}
.pf[data-pf-chip=square] .pf-tools{font-family:var(--de-font-mono);font-size:.8125rem}
.pf-item{min-width:0}
.pf-item__head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.25rem 1.5rem}
.pf-item__head>div{flex:1 1 16rem;min-width:0}
.pf-item__title{font-family:var(--de-font-display);font-weight:var(--de-w-heading);font-size:clamp(1.125rem,2.4cqi,1.375rem);line-height:1.25;letter-spacing:-0.01em;overflow-wrap:anywhere}
.pf-item__sub{margin-top:.15rem;font-weight:500;color:var(--de-fg);overflow-wrap:anywhere}
.pf-item__link{margin-top:.75rem;font-size:.9375rem}

/* ---------- grids & cards ---------- */
.pf-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(1rem,2.5cqi,1.5rem)}
@container pfbody (min-width:36rem){.pf-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container pfbody (min-width:58rem){.pf-grid--3{grid-template-columns:repeat(3,minmax(0,1fr))}}
.pf-card{min-width:0;padding:clamp(1.25rem,3cqi,1.75rem);border:1px solid var(--de-border);border-radius:var(--de-radius)}
.pf[data-pf-card=solid] .pf-card{background:var(--de-surface);border-color:color-mix(in srgb,var(--de-border) 55%,transparent)}
.pf[data-pf-card=solid] .pf-sec[data-tone=alt] .pf-card{background:var(--de-bg)}
.pf[data-pf-card=flat] .pf-card{padding-inline:0;border-width:1px 0 0;border-radius:0}
.pf[data-pf-card=brutalist] .pf-card{border:2px solid var(--de-fg);border-radius:0}
.pf-card>.pf-meta:first-child{margin-bottom:.4rem}
.pf-media{overflow:hidden;margin-bottom:1rem;border-radius:calc(var(--de-radius) * .75);background:var(--de-bg2)}
.pf-media img{width:100%;height:100%;object-fit:cover}
.pf[data-pf-parallax=on] .pf-media img[data-pf-parallax]{height:114%;margin-top:-7%}

/* ---------- experience ---------- */
.pf-tl{position:relative;display:grid;gap:clamp(1.75rem,4cqi,2.5rem);padding-left:1.75rem}
.pf-tl::before{content:"";position:absolute;left:.3rem;top:.6rem;bottom:.6rem;width:1px;background:var(--de-border)}
.pf-tl>li{position:relative}
.pf-tl>li::before{content:"";position:absolute;left:-1.78rem;top:.4em;width:.7rem;height:.7rem;border-radius:50%;background:var(--pf-sec-bg);border:2px solid var(--de-primary)}
.pf-rows>li{display:grid;gap:.5rem;padding-block:clamp(1.25rem,3cqi,2rem);border-top:1px solid var(--de-border)}
.pf-rows>li:last-child{border-bottom:1px solid var(--de-border)}
@container pfbody (min-width:40rem){.pf-rows>li{grid-template-columns:minmax(0,1fr) minmax(0,2.3fr);column-gap:2rem}}
.pf-row__side .pf-meta{margin-bottom:.2rem}
.pf-row__side .pf-item__sub{color:var(--de-muted)}

/* ---------- projects ---------- */
.pf-feature{display:grid;gap:.25rem;margin-bottom:clamp(1.5rem,4cqi,2.5rem)}
.pf-feature .pf-item__title{font-size:clamp(1.5rem,4.2cqi,2.375rem);line-height:1.1;letter-spacing:-0.02em}
.pf-feature .pf-desc{font-size:1.0625rem;color:var(--de-fg)}
@container pfbody (min-width:44rem){
  .pf-feature--media{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);column-gap:2rem;align-items:start}
  .pf-feature--media>.pf-media{grid-row:1/span 6;margin:0}
}
.pf-gallery{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(1rem,2.5cqi,1.5rem)}
@container pfbody (min-width:36rem){
  .pf-gallery{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pf-gallery>li:first-child:not(.pf-item--text){grid-column:1/-1}
}
.pf-tile.pf-item--text{display:flex;flex-direction:column;justify-content:flex-end;min-height:13rem;padding:clamp(1.25rem,3cqi,2rem);border-radius:var(--de-radius);background:var(--de-bg2)}
.pf-sec[data-tone=alt] .pf-tile.pf-item--text{background:var(--de-bg)}
.pf-tile.pf-item--text .pf-item__title{font-size:clamp(1.375rem,3.4cqi,1.875rem);line-height:1.15}

/* ---------- highlights ---------- */
.pf-figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,11rem),1fr));gap:clamp(1.25rem,3cqi,2rem)}
.pf-fig{display:flex;flex-direction:column-reverse;justify-content:flex-end;gap:.45rem;min-width:0;padding-top:1rem;border-top:2px solid var(--de-fg)}
.pf-fig__value{font-family:var(--de-font-display);font-weight:var(--de-w-display);font-size:clamp(2.25rem,6.5cqi,3.5rem);line-height:1;letter-spacing:-0.03em;color:var(--de-primary);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.pf-fig__label{max-width:26ch;font-size:.9375rem;color:var(--de-muted)}
.pf-hl-list .pf-fig{flex-direction:row-reverse;justify-content:flex-end;align-items:baseline;gap:1rem;padding-block:.9rem;border-top:1px solid var(--de-border)}
.pf-hl-list .pf-fig__value{min-width:4ch;font-size:clamp(1.5rem,3.6cqi,2rem)}
.pf-hl-list .pf-fig__label{max-width:none;color:var(--de-fg);font-size:1rem}

/* ---------- hero ---------- */
.pf-hero__name{max-width:15ch;min-width:0;font-family:var(--de-font-display);font-weight:var(--de-w-display);font-size:min(var(--de-hero-size),12.5cqi);line-height:var(--de-lead-display);letter-spacing:var(--de-track-display);color:var(--de-fg);overflow-wrap:anywhere;text-wrap:balance}
.pf-mask{display:inline-block;max-width:100%;overflow:hidden;vertical-align:top;padding-block:.06em .12em;margin-block:-.06em -.12em}
.pf-mask>span{display:inline-block;max-width:100%}
.pf-hero__role{margin-top:clamp(1rem,3cqi,1.75rem);font-size:clamp(1.0625rem,2.4cqi,1.375rem);font-weight:600;line-height:1.35;color:var(--de-fg);overflow-wrap:anywhere}
.pf-hero__tagline{max-width:44ch;margin-top:.75rem;font-size:clamp(1.0625rem,2.2cqi,1.25rem);line-height:1.5;color:var(--de-muted);text-wrap:pretty}
.pf-hero__foot{display:grid;gap:.75rem 2rem;margin-top:clamp(1.75rem,5cqi,3rem);padding-top:clamp(1rem,3cqi,1.5rem);border-top:1px solid var(--de-border)}
.pf-hero__foot .pf-hero__role,.pf-hero__foot .pf-hero__tagline{margin-top:0}
@container pf (min-width:48rem){.pf-hero__foot{grid-template-columns:minmax(0,1fr) minmax(0,1.6fr)}}
.pf-hero--banner .pf-hero__name{max-width:none;font-size:min(calc(var(--de-hero-size) * 1.3),15cqi)}
.pf-hero--centered{display:flex;flex-direction:column;align-items:center;text-align:center}
.pf-hero--centered .pf-hero__name{max-width:18ch}
.pf-hero--centered .pf-ctas{justify-content:center}
.pf-hero--split{display:grid;gap:clamp(2rem,6cqi,4rem);align-items:center}
@container pf (min-width:48rem){.pf-hero--split:not(.pf-hero--solo){grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}}
.pf-hero__main{min-width:0}
.pf-hero__aside{min-width:0}
.pf-hero__aside .pf-media{max-width:26rem;margin:0}
.pf-facts{display:grid;gap:1.1rem;padding-block:1.25rem;border-block:1px solid var(--de-border)}
.pf-facts dt{font-size:.875rem;color:var(--de-muted)}
.pf-facts dd{margin-top:.15rem;font-size:1.125rem;font-weight:500;overflow-wrap:anywhere}
.pf-hero__panel{padding:clamp(1.75rem,7cqi,4.5rem);border-radius:calc(var(--de-radius) * 1.5);background:var(--de-bg2)}
.pf-avatar{width:5.5rem;height:5.5rem;margin-bottom:1.5rem;border-radius:50%;object-fit:cover}
.pf-hero--terminal .pf-hero__name{font-size:min(var(--de-hero-size),10.5cqi)}
.pf-hero--terminal .pf-hero__role{font-family:var(--de-font-mono);font-weight:500}
.pf-term{color:var(--de-primary)}
.pf-hero--terminal .pf-hero__tagline::after{content:"";display:inline-block;width:.55em;height:1.1em;margin-left:.25em;vertical-align:-.15em;background:var(--de-primary)}
@media (prefers-reduced-motion:no-preference){.pf-hero--terminal .pf-hero__tagline::after{animation:pf-caret 1.1s steps(1) infinite}}
@keyframes pf-caret{50%{opacity:0}}

/* ---------- contact ---------- */
.pf-contact__headline{max-width:18ch;font-family:var(--de-font-display);font-weight:var(--de-w-display);font-size:clamp(2rem,7.5cqi,4.25rem);line-height:1.02;letter-spacing:var(--de-track-display);text-wrap:balance;overflow-wrap:anywhere}
.pf-contact__lead{display:inline-flex;max-width:100%;margin-top:clamp(1.25rem,4cqi,2rem);font-family:var(--de-font-display);font-size:clamp(1.25rem,4.6cqi,2.25rem);font-weight:var(--de-w-heading);line-height:1.2;letter-spacing:-0.015em}
.pf-contact__rows{display:grid;margin-top:clamp(1.5rem,4cqi,2.5rem)}
.pf-contact__rows>div{display:grid;grid-template-columns:minmax(0,1fr);gap:.1rem;padding-block:.85rem;border-top:1px solid var(--de-border)}
@container pf (min-width:36rem){.pf-contact__rows>div{grid-template-columns:8rem minmax(0,1fr);gap:1.5rem;align-items:baseline}}
.pf-contact__rows dt{font-size:.875rem;color:var(--de-muted)}
.pf-contact__rows dd{min-width:0;overflow-wrap:anywhere}
.pf-contact--card .pf-contact__rows,.pf-contact--list .pf-contact__rows{margin-top:0}
.pf-contact--card .pf-contact__rows>div:first-child{padding-top:0;border-top:0}
.pf-sec--contact:has(.pf-contact--footer){padding-block:0}
.pf-contact--footer{padding-block:clamp(4rem,12cqi,8rem);background:var(--de-fg);color:var(--de-bg)}
.pf-contact--footer .pf-link{color:var(--de-bg)}
.pf-contact--footer .pf-contact__rows>div{border-top-color:color-mix(in srgb,var(--de-bg) 24%,transparent)}
.pf-contact--footer dt{color:color-mix(in srgb,var(--de-bg) 74%,var(--de-fg))}
.pf-contact--footer :focus-visible{outline-color:var(--de-bg)}
.pf-contact--footer ::selection{background:color-mix(in srgb,var(--de-bg) 30%,transparent);color:var(--de-bg)}

/* ---------- nav ---------- */
.pf-nav{position:sticky;top:0;z-index:30;border-bottom:1px solid var(--de-border);background:color-mix(in srgb,var(--de-bg) 92%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.pf-nav__in{display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:3.5rem}
.pf-nav__brand{display:block;min-width:0;padding-block:.5rem;overflow:hidden;font-family:var(--de-font-display);font-weight:var(--de-w-heading);font-size:1rem;letter-spacing:-0.01em;white-space:nowrap;text-overflow:ellipsis}
.pf-nav__id{min-width:0}
.pf-nav__role{display:none}
.pf-nav__links{display:none;gap:clamp(1rem,2.4cqi,1.75rem)}
.pf-nav a.pf-nav__link{display:inline-flex;align-items:center;min-height:2.75rem;font-size:.9375rem;color:var(--de-muted);white-space:nowrap;transition:color .2s}
.pf-nav a.pf-nav__link:hover{color:var(--de-fg)}
.pf-nav a.pf-nav__link:active{opacity:.7}
.pf-nav__menu{position:relative;flex:none}
.pf-nav__menu summary{display:inline-flex;align-items:center;min-height:2.75rem;padding-inline:1rem;border:1px solid var(--de-border);border-radius:999px;font-size:.875rem;font-weight:500;list-style:none;cursor:pointer;transition:border-color .2s}
.pf-nav__menu summary::-webkit-details-marker{display:none}
.pf-nav__menu summary:hover,.pf-nav__menu[open] summary{border-color:var(--de-fg)}
.pf-nav__menu ul{position:absolute;right:0;top:calc(100% + .5rem);min-width:12rem;padding:.4rem;border:1px solid var(--de-border);border-radius:var(--de-radius);background:var(--de-bg);box-shadow:0 18px 40px -20px rgb(0 0 0 / .35)}
.pf-nav__menu a.pf-nav__link{display:flex;padding-inline:.75rem;border-radius:calc(var(--de-radius) * .6)}
.pf-nav__menu a.pf-nav__link:hover{background:var(--de-bg2)}
@container pf (min-width:52rem){.pf-nav__links{display:flex}.pf-nav__menu{display:none}}
.pf[data-pf-nav=floating-pill] .pf-nav{top:.75rem;padding-inline:var(--de-pad-x);border:0;background:none;-webkit-backdrop-filter:none;backdrop-filter:none;pointer-events:none}
.pf[data-pf-nav=floating-pill] .pf-nav__in{max-width:var(--de-max);min-height:3.25rem;padding:.25rem .4rem .25rem 1.1rem;border:1px solid var(--de-border);border-radius:999px;background:color-mix(in srgb,var(--de-bg) 88%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 10px 30px -20px rgb(0 0 0 / .4);pointer-events:auto}
.pf[data-pf-nav=floating-pill] .pf-nav__links{padding-right:.75rem}
@container pf (min-width:64rem){
  .pf[data-pf-shell=rail] .pf-shell{display:grid;grid-template-columns:15.5rem minmax(0,1fr)}
  .pf[data-pf-shell=rail] .pf-nav{align-self:start;max-height:100dvh;overflow:auto;border-bottom:0;border-right:1px solid var(--de-border);background:var(--de-bg2);-webkit-backdrop-filter:none;backdrop-filter:none}
  .pf[data-pf-shell=rail] .pf-nav__in{flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:2rem;max-width:none;padding:2.25rem 1.75rem}
  .pf[data-pf-shell=rail] .pf-nav__brand{padding:0;font-size:1.125rem;white-space:normal;overflow-wrap:anywhere}
  .pf[data-pf-shell=rail] .pf-nav__role{display:block;margin-top:.35rem;font-size:.875rem;color:var(--de-muted)}
  .pf[data-pf-shell=rail] .pf-nav__links{display:flex;flex-direction:column;gap:0}
  .pf[data-pf-shell=rail] .pf-nav a.pf-nav__link{min-height:2.5rem}
  .pf[data-pf-shell=rail] .pf-nav__menu{display:none}
}

/* ---------- credit ---------- */

/* ---------- studio edit mode ---------- */
.pf-edit{cursor:text;border-radius:2px;transition:box-shadow .15s}
.pf-edit:hover{box-shadow:0 0 0 1px var(--de-border)}
.pf-edit[contenteditable=true]{outline:2px solid var(--de-primary);outline-offset:2px;cursor:text}
.pf-edit:empty::before{content:attr(data-placeholder);color:var(--de-muted)}
`
