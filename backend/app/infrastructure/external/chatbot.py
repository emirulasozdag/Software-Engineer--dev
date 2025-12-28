from __future__ import annotations

import re


class Chatbot:
    def processQuery(self, query: str) -> str:
        q = (query or "").strip()
        if not q:
            return self.handleUnknownQuery()

        ql = q.lower()

        # A few helpful, assignment-friendly canned answers (no external API).
        if "present perfect" in ql:
            return (
                "Present Perfect (have/has + V3) geçmişte başlayıp şu ana etkisi olan durum/eylemler için kullanılır.\n"
                "- Examples: 'I have lived here for 2 years.' (2 yıldır burada yaşıyorum)\n"
                "- Signal words: already, yet, just, ever, never, for, since.\n"
                "İstersen 5 tane mini alıştırma da hazırlayabilirim."
            )
        if "pronunciation" in ql or "telaffuz" in ql:
            return (
                "Telaffuzu geliştirmek için hızlı bir plan:\n"
                "- Shadowing: 5 dk dinle-tekrar et (kısa cümleler)\n"
                "- Minimal pairs: ship/sheep, live/leave gibi\n"
                "- Kayıt al + 1 hatayı seçip düzelt\n"
                "Hangi kelimelerde zorlanıyorsun? 3 örnek yaz."
            )
        if "affect" in ql and "effect" in ql:
            return (
                "Genelde:\n"
                "- affect = fiil (etkilemek)\n"
                "- effect = isim (etki/sonuç)\n"
                "Examples: 'Noise affects my sleep.' / 'The effect was strong.'"
            )

        if re.search(r"\b(conditionals?|şart)\b", ql):
            return (
                "Conditionals kısa özet:\n"
                "- Zero: If + present, present (genel doğrular)\n"
                "- First: If + present, will (gerçekçi gelecek)\n"
                "- Second: If + past, would (varsayımsal)\n"
                "- Third: If + had + V3, would have + V3 (geçmişte varsayım)\n"
                "İstersen seviyene göre 8 soru hazırlayayım."
            )

        # Generic tutoring response
        return (
            "Anladım. Bunu birlikte çalışalım.\n"
            "1) Hedefin ne? (ör: sınav, konuşma akıcılığı, kelime)\n"
            "2) Seviye: A1–C2\n"
            "3) 1 örnek cümle/paragraph paylaşabilir misin?\n"
            "Buna göre sana mini-öğrenme adımı + örnekler çıkarayım."
        )

    def getContextualResponse(self, sessionId: int, query: str) -> str:
        # For now, context is not persisted in the "AI" itself; the session is stored in DB.
        # Keeping this hook for future upgrades (FR15/FR19).
        return self.processQuery(query)

    def handleUnknownQuery(self) -> str:
        return "Tam anlayamadım. Sorunu daha kısa/örnekli tekrar yazar mısın? (örn: 'Present Perfect örnek ver')"
