// Утилита для создания задержки
const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

// Импорты
import { Vector3, Blip } from 'fivem-js';
import { IPlaces } from '../global/interfaces/rent';
import * as utils from '../client/utils';
import { rent } from '../global/configRent';

// Переменные
let mainBlip: Blip | null = null;
const createdBlips: Blip[] = [];

// Основная функция инициализации
async function initializeRentalBlips() {
    await Delay(1000);

    // 1. Проверка структуры конфига
    if (!validateConfig(rent)) {
        return;
    }

    try {
        cleanupBlips();

        // 2. Создание блипов
        await createBlipsForPlaces();
    } catch (e) {
        console.error('Ошибка при инициализации блипов:', e);
    }
}

// Валидация структуры конфига
function validateConfig(config: any): config is { Office: { Places: Record<string, IPlaces>, Blip?: any } } {
    if (!config?.Office?.Places) {
        console.error('Неверная структура конфига. Ожидается rent.Office.Places');
        console.debug('Полученный конфиг:', JSON.stringify(config, null, 2));
        return false;
    }

    const places = Object.values(config.Office.Places);
    if (places.length === 0) {
        console.warn('Конфиг содержит пустой Places объект');
        return false;
    }

    return true;
}

// Создание блипов для всех мест
async function createBlipsForPlaces() {
    for (const [index, place] of Object.entries(rent.Office.Places)) {
        try {
            const blip = await createSingleBlip(place, index);
            if (blip) {
                createdBlips.push(blip);
                mainBlip = blip;
            }
        } catch (e) {
            console.error(`Ошибка при обработке места ${index}:`, e);
        }
    }
}

// Создание одного блипа
async function createSingleBlip(place: IPlaces, index: string): Promise<Blip | null> {
    if (!place?.PedPosition) {
        console.warn(`Место ${index} пропущено: отсутствует PedPosition`);
        return null;
    }

    const pos = new Vector3(
        place.PedPosition.x,
        place.PedPosition.y,
        place.PedPosition.z
    );

    console.debug(`Создание блипа для позиции ${index}:`, pos.toString());

    return await utils.blipCreate(
        pos,
        rent.Office?.Blip?.Name || "Аренда",
        rent.Office?.Blip?.Sprite || 1,
        rent.Office?.Blip?.Color || 3,
        rent.Office?.Blip?.Scale || 1.0
    );
}

// Очистка всех блипов
function cleanupBlips() {
    createdBlips.forEach(blip => {
        try {
            blip?.exists && blip.delete();
        } catch (e) {
            console.error('Ошибка при удалении блипа:', e);
        }
    });
    createdBlips.length = 0;
}

// Запуск инициализации
const init = setTick(async () => {
    await initializeRentalBlips();
    clearTick(init);
});

// Экспорт функций
export function cleanup() {
    cleanupBlips();
}