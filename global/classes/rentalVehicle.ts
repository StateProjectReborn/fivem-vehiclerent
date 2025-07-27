import * as utils from '../../client/utils'
import { Vehicle, Vector3, Blip } from 'fivem-js';

//глобальная переменная с ox-lib
const lib = global.exports['ox_lib'];
//глобальная переменная QBCore
let QBCore = global.exports['qb-core'].GetCoreObject();

export class RentalVehicle {
    // Событие окончания аренды (с типизацией)
    public onRentalExpired: ((vehicle: RentalVehicle) => void) | null = null;

    private vehicle: Vehicle;       // Ссылка на созданное ТС
    private blip: Blip;            // Блип на карте для ТС
    private expiryTime: number;    // Время окончания аренды (в мс)
    private timerHandle:number;

    constructor(
        private model: string,     // Название модели ТС (например 'blista')
        private rentalDuration: number,   // Длительность аренды в минутах
        private spawnPosition: Vector3,  // Позиция спавна (x, y, z)
        private spawnHeading: number,    // Направление спавна (угол поворота)

    ) {
        this.spawn();  // Автоматически спавним ТС при создании объекта

    }

    /*private triggerExpiredEvent(): void {
        clearTick(this.timerHandle);

        // Вызываем событие если есть подписчики
        if (this.onRentalExpired) {
            this.onRentalExpired(this);
        }


    }*/

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
        const letters = "RENT";
        const numbers = Math.floor(Math.random() * 900 + 100); // От 100 до 999

        // @ts-ignore
        SetVehicleNumberPlateText(this.vehicle.Handle, `${letters}0${numbers}`);
        SetVehicleEngineOn(this.vehicle.Handle, true, true, false);
        SetVehicleFuelLevel(this.vehicle.Handle, 100.0)
        DecorSetFloat(this.vehicle.Handle, "_FUEL_LEVEL", GetVehicleFuelLevel(this.vehicle.Handle))
        SetVehicleRadioEnabled(this.vehicle.Handle,false)
        emit('vehiclekeys:client:SetOwner', `${letters}0${numbers}`)
        this.createBlip();  // Создаем метку на карте
        this.startTimer();  // Запускаем таймер аренды
        this.showNotification(`Аренда на ${this.rentalDuration} минут. По окончании ТС будет удалено автоматически`, 7500);
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
        this.timerHandle = setTick(() => {
            // @ts-ignore
            // Расчет оставшегося времени в миллисекундах
            const remainingMs = this.expiryTime - GetGameTimer();

            // Конвертация в часы, минуты, секунды
            const hours = Math.floor(remainingMs / 3600000);
            const minutes = Math.floor((remainingMs % 3600000) / 60000);
            const seconds = Math.floor((remainingMs % 60000) / 1000);

            // Форматирование времени (добавляем ведущие нули)
            const timeString =
                `${hours.toString().padStart(2, '0')}:` +
                `${minutes.toString().padStart(2, '0')}:` +
                `${seconds.toString().padStart(2, '0')}`;

            // Динамические эффекты
            const isWarning = remainingMs < 300000; // 5 минут
            const isCritical = remainingMs < 15000; // 15 секунд

            // Параметры отрисовки
            const scale = isCritical ?
                0.6 + (0.05 * Math.sin(GetGameTimer() / 200)) : // Пульсация
                0.5;

            const color = isCritical ?
                [255, 0, 0, 255] : // Красный (критично)
                isWarning ?
                    [255, 165, 0, 255] : // Оранжевый (предупреждение)
                    [255, 255, 255, 255]; // Белый (норма)

            // Отрисовка текста
            utils.DrawText2D(
                `Время до окончания аренды: ${timeString}`,
                [0.5, 0.95], // Центр нижней части экрана
                scale,
                color,
                4
            );

            // Автоматический возврат при истечении времени
            if (remainingMs <= 0) {
                this.returnVehicle();
                clearTick(this.timerHandle); // Останавливаем проверку
                return;
            }
        });
    }
    /**
     * Продлевает время аренды
     * @param minutes - количество минут для продления
     */
    public extendRental(minutes: number): void {
        this.expiryTime += minutes * 60000;
        // @ts-ignore
        this.showNotification(`Аренда продлена на ${minutes} минут`, 5000);
    }

    /**
     * Завершает аренду и удаляет ТС
     */
    public returnVehicle(): void {
        clearTick(this.timerHandle)
        // Удаляем ТС если существует
        if (this.vehicle && this.vehicle.exists) {
            this.vehicle.delete();
        }

        // Удаляем блип если существует
        if (this.blip && this.blip.exists) {
            this.blip.delete();
        }
        // @ts-ignore
        this.showNotification("Аренда завершена", 5000);

        // Вызываем событие если есть подписчики
        if (this.onRentalExpired) {
            this.onRentalExpired(this);
        }
    }

    private showNotification(message: string, duration: number = 3000, title:string = "Аренда", type:string = "success") {

        lib.notify({
            title: title,
            description: message,
            type: type,
            duration: duration
        });
    }
}
