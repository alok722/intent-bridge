"use client";

import Script from "next/script";
import { getGaMeasurementId, isAnalyticsEnabled } from "@/lib/google-analytics";

/**
 * Renders the GA4 gtag.js scripts when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
 * Place inside `<body>` in the root layout. Uses `afterInteractive` strategy
 * so it doesn't block First Contentful Paint.
 */
export function GoogleAnalyticsScript() {
  const gaId = getGaMeasurementId();

  if (!isAnalyticsEnabled()) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  );
}
