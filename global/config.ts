// Путь к файлу конфигурации (в той же папке, где и скрипт)
const configPath = "config.json";

// Загрузка файла конфигурации (игнорируем проверку типов TypeScript)
// @ts-ignore  
const rawData = LoadResourceFile(GetCurrentResourceName(), configPath);

// Интерфейс для типизации конфига (описывает структуру)
interface Config {
    message: string;  // Текстовое сообщение
    timeout: number;  // Время задержки (в мс или секундах)
}

// Переменная для хранения конфига (пока без типа)
let cfg: any;

// Если файл успешно загружен (не пустой)
if (rawData != null) {
    try {
        // Парсим JSON-строку в объект с проверкой структуры (Config)
        const config: Config = JSON.parse(rawData);
        cfg = config;  // Сохраняем конфиг
    }
    catch (e) {
        // Ошибка парсинга (например, невалидный JSON)
        console.error("Ошибка парсинга файла");
    }
}
else {
    // Файл не найден или не прочитан
    console.error("Ошибка чтения файла");
}

// Экспортируем конфиг для использования в других файлах
export { cfg };