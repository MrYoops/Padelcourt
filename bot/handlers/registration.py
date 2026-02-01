"""FSM регистрация: имя → фото → телефон → QR и главное меню."""
from aiogram import Bot, F, Router
from aiogram.filters import CommandStart
from aiogram.types import BufferedInputFile, Message, ReplyKeyboardRemove
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import KeyboardButton, ReplyKeyboardMarkup

from bot.database.models import create_user as db_create_user
from bot.keyboards.main_menu import get_main_keyboard
from bot.services.qr_service import generate_qr_image
from bot.services.user_service import get_user_by_telegram_id


class RegistrationStates(StatesGroup):
    waiting_name = State()
    waiting_photo = State()
    waiting_phone = State()


router = Router(name="registration")


def get_contact_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="Поделиться контактом", request_contact=True)],
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext) -> None:
    try:
        user = await get_user_by_telegram_id(message.from_user.id if message.from_user else 0)
    except Exception:
        await state.clear()
        await message.answer(
            "Привет! 👋 База данных временно недоступна.\n\n"
            "Запустите PostgreSQL: в папке проекта выполните\n"
            "docker compose up -d postgres\n\n"
            "Затем отправьте /start снова.",
            reply_markup=get_main_keyboard(),
        )
        return
    if user:
        await state.clear()
        await message.answer(
            f"С возвращением, {user['name']}! 🎾\nВыберите действие:",
            reply_markup=get_main_keyboard(),
        )
        return
    await state.set_state(RegistrationStates.waiting_name)
    await message.answer(
        "Привет! 👋 Это PadelSense — умный корт.\n\n"
        "Давайте зарегистрируем вас. Как вас зовут? (Напишите имя)",
        reply_markup=ReplyKeyboardRemove(),
    )


@router.message(RegistrationStates.waiting_name, F.text)
async def process_name(message: Message, state: FSMContext) -> None:
    name = (message.text or "").strip()
    if not name:
        await message.answer("Введите имя текстом.")
        return
    await state.update_data(name=name)
    await state.set_state(RegistrationStates.waiting_photo)
    await message.answer("Отлично! Теперь отправьте своё фото (любое).")


@router.message(RegistrationStates.waiting_photo, F.photo)
async def process_photo(message: Message, state: FSMContext) -> None:
    photo = message.photo[-1] if message.photo else None
    photo_url = ""
    if photo and message.photo:
        file = await message.bot.get_file(photo.file_id)
        photo_url = message.bot.session.api.file_url(file.file_path) if hasattr(message.bot, "session") else ""
    await state.update_data(photo_url=photo_url or None)
    await state.set_state(RegistrationStates.waiting_phone)
    await message.answer(
        "Теперь поделитесь номером телефона (нужно для входа на корт):",
        reply_markup=get_contact_keyboard(),
    )


@router.message(RegistrationStates.waiting_phone, F.contact)
async def process_phone(message: Message, state: FSMContext, bot: Bot) -> None:
    contact = message.contact
    phone = contact.phone_number if contact else None
    data = await state.get_data()
    name = data.get("name", "Игрок")
    photo_url = data.get("photo_url")
    telegram_id = message.from_user.id if message.from_user else 0
    user = await db_create_user(telegram_id=telegram_id, name=name, phone=phone, photo_url=photo_url)
    await state.clear()
    qr_buffer = generate_qr_image(user["id"])
    await message.answer(
        "Регистрация завершена! 🎾 Ваш QR-код для входа на корт:",
        reply_markup=get_main_keyboard(),
    )
    await bot.send_photo(
        chat_id=message.chat.id,
        photo=BufferedInputFile(qr_buffer.read(), filename="my-qr.png"),
        caption="Покажите этот QR на планшете у корта.",
    )


@router.message(RegistrationStates.waiting_phone, F.text)
async def process_phone_text(message: Message, state: FSMContext) -> None:
    await message.answer("Нажмите кнопку «Поделиться контактом» ниже.", reply_markup=get_contact_keyboard())
