interface Env {
  ASSETS: Fetcher;
}

const securityHeaders: Record<string, string> = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https://*.google-analytics.com https://www.googletagmanager.com; object-src 'none'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pl30995799.profitableratecpmnetwork.com https://www.highrevenueformat.com; style-src 'self' 'unsafe-inline'",
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === 'www.howtofishgamehelp.com') {
      url.hostname = 'howtofishgamehelp.com';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (url.hostname === 'howtofishgamehelp.com' && url.protocol !== 'https:') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);
    for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);
    if (url.hostname.endsWith('.workers.dev') || url.hostname.endsWith('.workers.dev.localhost')) {
      headers.set('X-Robots-Tag', 'noindex, nofollow');
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;

