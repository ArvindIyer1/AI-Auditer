// Simple in-memory rate limiter for API routes
// Limits 5 requests per IP per hour

const requestMap = new Map<string, number[]>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = requestMap.get(ip) || [];

  // Remove old requests outside the window
  const recentRequests = requests.filter((time) => now - time < WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS) {
    return true;
  }

  // Add current request
  recentRequests.push(now);
  requestMap.set(ip, recentRequests);

  return false;
}

export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
