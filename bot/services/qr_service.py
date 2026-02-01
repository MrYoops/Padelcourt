"""Генерация QR-кода по user_id (UUID)."""
import io
from uuid import UUID

import qrcode


def generate_qr_image(user_id: str | UUID) -> io.BytesIO:
    """Сгенерировать изображение QR с user_id. Возвращает BytesIO."""
    data = str(user_id)
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer
