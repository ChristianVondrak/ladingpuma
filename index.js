export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Intercept tracking API requests
    if (url.pathname === "/api/track" && request.method === "POST") {
      return await handleTrackRequest(request, env);
    }

    // 2. Fallback to static assets
    return env.ASSETS.fetch(request);
  }
};

async function handleTrackRequest(request, env) {
  // 1. Parse request body
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { event_name, event_id, user_data = {}, custom_data = {} } = body;

  if (!event_name || !event_id) {
    return new Response(JSON.stringify({ error: "Missing event_name or event_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. Obtain Pixel ID and Access Token
  const PIXEL_ID = env.META_PIXEL_ID || '1603545378444024';
  const ACCESS_TOKEN = env.META_ACCESS_TOKEN || 'EAANfo0P1OA0BRneSoi2g4aZA0tN6T26V4Jfj9U8M9tUHHiCXH9lLv4asRMAptSo9Dq3tbIqKIy14eRBnAR7iBNleOhydJlIvyytDKQFKi8IVmegtvJoRTXVp5v0JPSHwbFblCI6ct3Vs4VUz1MrDH26gfqZB3XZAIg6Dl6STWFoOo1BEmwZCOohB5cZCvXMQWqQZDZD';

  // 3. Extract IP and User Agent
  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "";

  // 4. Extract Cookies (_fbp, _fbc)
  const cookieHeader = request.headers.get("Cookie") || "";
  let fbp = "";
  let fbc = "";
  cookieHeader.split(";").forEach(cookie => {
    const parts = cookie.split("=");
    const name = parts[0].trim();
    const value = parts[1] ? parts[1].trim() : "";
    if (name === "_fbp") fbp = value;
    if (name === "_fbc") fbc = value;
  });

  // If fbc wasn't in cookie, check if there's an fbclid in the referer URL
  const referer = request.headers.get("referer") || "";
  if (!fbc && referer) {
    try {
      const urlRef = new URL(referer);
      const fbclid = urlRef.searchParams.get("fbclid");
      if (fbclid) {
        fbc = `fb.1.${Date.now()}.${fbclid}`;
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  // 5. Hash user parameters securely using SHA-256 (if provided)
  const hashedUserData = {};

  const sha256 = async (text) => {
    if (!text) return undefined;
    const msgBuffer = new TextEncoder().encode(text.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  // Hash First Name ("nombre" maps to "fn")
  if (user_data.fn) {
    hashedUserData.fn = [await sha256(user_data.fn)];
  }

  // Add required browser indicators to user_data
  hashedUserData.client_ip_address = ip;
  hashedUserData.client_user_agent = userAgent;
  if (fbp) hashedUserData.fbp = fbp;
  if (fbc) hashedUserData.fbc = fbc;

  // 6. Build the payload
  const payload = {
    data: [
      {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        action_source: "website",
        event_source_url: referer || "https://landingpuma.pages.dev",
        user_data: hashedUserData,
        custom_data
      }
    ]
  };

  // 7. Send event to Meta Graph API
  try {
    const metaUrl = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
