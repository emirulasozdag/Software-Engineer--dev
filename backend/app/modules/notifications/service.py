from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class OutboundEmail:
    to_email: str
    subject: str
    body: str


class NotificationService:
    """Dev-friendly notification adapter.

    In a real deployment this would send emails via an external provider.
    For now, routers may optionally surface tokens as dev-only fields.
    """

    def send_email(self, email: OutboundEmail) -> None:
        # Intentionally a no-op for MVP.
        # You can later replace this with SMTP / SendGrid / SES, etc.
        return


notification_service = NotificationService()
