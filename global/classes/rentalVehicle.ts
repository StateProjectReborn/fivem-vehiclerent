import * as utils from '../../client/utils'
import { Vehicle, Vector3, Blip } from 'fivem-js';

export class RentalVehicle {
    private vehicle: Vehicle;       // Ссылка на созданное ТС
    private blip: Blip;            // Блип на карте для ТС
    private expiryTime: number;    // Время окончания аренды (в мс)

    constructor(
        private model: string,     // Название модели ТС (например 'blista')
        private spawnPosition: Vector3,  // Позиция спавна (x, y, z)
        private spawnHeading: number,    // Направление спавна (угол поворота)
        private rentalDuration: number   // Длительность аренды в минутах
    ) {
        this.spawn();  // Автоматически спавним ТС при создании объекта
    }

    /**
     * Загружает модель и создает транспортное средство
     */
    private async spawn(): Promise<void> {
        // Получаем хэш модели
        // @ts-ignore
        const modelHash = GetHashKey(this.model);

        // Асинхронно загружаем модель
        await utils.LoadModel(modelHash);

        // Создаем само ТС
        // @ts-ignore
        this.vehicle = new Vehicle(CreateVehicle(
            modelHash,
            this.spawnPosition.x,
            this.spawnPosition.y,
            this.spawnPosition.z,
            this.spawnHeading,
            true,  // Сетевой объект
            false  // Не загружать сразу
        ));

        // Настраиваем ТС
        // @ts-ignore
        SetVehicleNumberPlateText(this.vehicle.Handle, "RENTAL");
        // @ts-ignore
        SetVehicleEngineOn(this.vehicle.Handle, true, true, false);

        this.createBlip();  // Создаем метку на карте
        this.startTimer();  // Запускаем таймер аренды
    }
    /**
     * Создает блип (метку на карте) для арендованного ТС
     */
    private createBlip(): void {
        // @ts-ignore
        this.blip = AddBlipForEntity(this.vehicle.Handle);
        // @ts-ignore
        SetBlipSprite(this.blip.Handle, 225); // Иконка автомобиля
        // @ts-ignore
        SetBlipColour(this.blip.Handle, 3);   // Зеленый цвет
        // @ts-ignore
        SetBlipScale(this.blip.Handle, 0.8);  // Масштаб

        // Настройка текста
        // @ts-ignore
        BeginTextCommandSetBlipName("STRING");
        // @ts-ignore
        AddTextComponentString("Арендованный транспорт");
        // @ts-ignore
        EndTextCommandSetBlipName(this.blip.Handle);
    }

    /**
     * Запускает отсчет времени аренды
     */
    private startTimer(): void {
        // Устанавливаем время окончания (текущее время + длительность)
        // @ts-ignore
        this.expiryTime = GetGameTimer() + this.rentalDuration * 60000;

        // Запускаем проверку каждый кадр
        const timerTick = setTick(() => {
            // @ts-ignore
            const currentTime = GetGameTimer();

            // Если время вышло
            if (currentTime > this.expiryTime) {
                this.returnVehicle();
                clearTick(timerTick); // Останавливаем проверку
                return;
            }

            // Расчет оставшегося времени в минутах
            const remaining = Math.ceil((this.expiryTime - currentTime) / 60000);

            // Отрисовка текста на экране
            // @ts-ignore
            DrawText2D(
                `Осталось времени: ${remaining} мин`,
                [0.5, 0.95], // Позиция (центр снизу)
                0.5,         // Масштаб текста
                4            // Стиль текста
            );
        });
    }
    /**
     * Продлевает время аренды
     * @param minutes - количество минут для продления
     */
    public extendRental(minutes: number): void {
        this.expiryTime += minutes * 60000;
        // @ts-ignore
        ShowNotification(`~g~Аренда продлена на ${minutes} минут`);
    }

    /**
     * Завершает аренду и удаляет ТС
     */
    public returnVehicle(): void {
        // Удаляем ТС если существует
        if (this.vehicle && this.vehicle.exists) {
            this.vehicle.delete();
        }

        // Удаляем блип если существует
        if (this.blip && this.blip.exists) {
            this.blip.delete();
        }
        // @ts-ignore
        ShowNotification("~r~Аренда завершена");
    }
}
