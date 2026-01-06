import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <title>Intersections</title>

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/assets/images/intersections-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/intersections-logo.png" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>
        {children}
        {/* Static footer for SEO crawlers - visually hidden but readable by crawlers */}
        <footer
          id="static-footer"
          style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          <a
            href="/privacy"
            style={{ color: '#a855f7', textDecoration: 'none', margin: '0 10px' }}
          >
            Privacy Policy
          </a>
          <span style={{ color: '#666' }}>|</span>
          <a
            href="/terms"
            style={{ color: '#a855f7', textDecoration: 'none', margin: '0 10px' }}
          >
            Terms of Service
          </a>
          <span style={{ color: '#666' }}>|</span>
          <a
            href="/about"
            style={{ color: '#a855f7', textDecoration: 'none', margin: '0 10px' }}
          >
            About
          </a>
          <span style={{ color: '#666' }}>|</span>
          <a
            href="/contact"
            style={{ color: '#a855f7', textDecoration: 'none', margin: '0 10px' }}
          >
            Contact
          </a>
        </footer>
      </body>
    </html>
  );
}
