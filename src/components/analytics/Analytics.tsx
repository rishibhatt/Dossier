import Script from "next/script"

/**
 * Loads Google Analytics 4 and Microsoft Clarity.
 * Preconfigured with GA (G-TVF4GDK6G0) and Clarity (yv0n7udwvu), overridable via env vars.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-TVF4GDK6G0"
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "yv0n7udwvu"

/** Only ids made of letters, digits and dashes reach the page. Anything else is dropped. */
const safe = (v: string | undefined) => (v && /^[\w-]+$/.test(v) ? v : undefined)

export function Analytics() {
  const ga = safe(GA_ID)
  const clarity = safe(CLARITY_ID)

  return (
    <>
      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga}');`}
          </Script>
        </>
      ) : null}
      {clarity ? (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarity}");`}
        </Script>
      ) : null}
    </>
  )
}

