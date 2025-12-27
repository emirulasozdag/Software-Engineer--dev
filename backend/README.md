# Adaptive Learning Backend (Modular FastAPI)

Bu klasör, **AI-Powered Adaptive Curriculum** projesi için modüler bir backend iskeleti sağlar.

## Kurulum

1) Sanal ortam (opsiyonel ama önerilir)

- Windows (PowerShell):
  - `python -m venv .venv`
  - `.\.venv\Scripts\Activate.ps1`

2) Bağımlılıklar

- `pip install -r requirements.txt`

3) Ortam değişkenleri

- `.env.example` dosyasını `.env` olarak kopyalayın ve `JWT_SECRET` değerini değiştirin.

## Çalıştırma

- `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`

- OpenAPI/Swagger:
  - `http://127.0.0.1:8000/docs`

## Modüller (MVP)

- Auth: `/auth/*` (register/login/email verification/forgot+reset password)
- Users: `/users/me`
- Placement test: `/tests/placement/*`
- AI Content (mock): `/ai/content/*`
- Chatbot (mock): `/chatbot/message`
- Progress: `/progress/*`
- Feedback: `/feedback/*`

## Hızlı deneme akışı

1) Register
- `POST /auth/register`
  - Not: MVP’de doğrulama token’ı `dev_only_email_verification_token` alanında dönüyor.

2) Verify email
- `POST /auth/verify-email`

3) Login
- `POST /auth/login` → `access_token`

4) AI content üret
- `POST /ai/content/generate` (Authorization: Bearer ...)

5) İçeriği tamamlandı işaretle
- `POST /progress/complete`

## Notlar

- AI entegrasyonu şu an **MockAIProvider** ile çalışır. Sonraki adımda gerçek API (OpenAI/Azure/Google vb.) için `AIProvider` implementasyonu eklenebilir.
- DB varsayılan olarak SQLite: `backend/app.db`
