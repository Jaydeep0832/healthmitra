from collections import defaultdict, deque
from time import monotonic

from fastapi import HTTPException, Request, status


def _get_client_ip(request: Request) -> str:
    """Resolve the real client IP behind a reverse proxy.

    Reads X-Forwarded-For (set by Nginx) first, then falls back to the
    direct connection address.  Only the leftmost (original client) entry
    in X-Forwarded-For is used to prevent spoofing via appended headers.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # X-Forwarded-For: client, proxy1, proxy2 — take the first
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class InMemoryRateLimiter:
    """Small per-process limiter for unauthenticated, cost-bearing endpoints."""

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, deque] = defaultdict(deque)

    async def __call__(self, request: Request) -> None:
        key = _get_client_ip(request)
        now = monotonic()
        request_times = self.requests[key]

        while request_times and now - request_times[0] >= self.window_seconds:
            request_times.popleft()

        if len(request_times) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": str(self.window_seconds)},
            )

        request_times.append(now)


llm_rate_limiter = InMemoryRateLimiter(max_requests=20, window_seconds=60)
chat_rate_limiter = InMemoryRateLimiter(max_requests=30, window_seconds=60)
registration_rate_limiter = InMemoryRateLimiter(max_requests=10, window_seconds=60)
login_rate_limiter = InMemoryRateLimiter(max_requests=10, window_seconds=60)
