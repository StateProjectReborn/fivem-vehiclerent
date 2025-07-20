import { Vector3 } from 'fivem-js';
import { RentalVehicle } from './rentalVehicle';
import { locale } from '../locale'

import * as utils from  '../../client/utils'
import { rent } from '../configRent';
//глобальная переменная с ox-lib
const lib = global.exports['ox_lib'];
let QBCore = global.exports['qb-core'].GetCoreObject();

const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

export class RentalManager {
    private currentVehicle: RentalVehicle | null = null;  // Текущее арендованное ТС
    //private rentalPoints: IRentalPoint[];  // Массив точек аренды

    private blips: number[] = [];
    private peds: number[] = [];
    
    
    constructor() {
        this.initializeRentalPoints();  // Инициализируем точки аренды
        //this.createInteractionZones();  // Создаем зоны взаимодействия
    }
    /**
     * Инициализация точек аренды (можно вынести в конфиг)
     */
    private async initializeRentalPoints() {
        await Delay(1000);
        const tempData = []
        // Создаем блипы
        for (const place of Object.values(rent.Office.Places)) {
            const pos = new Vector3(
                place.PedPosition.x,
                place.PedPosition.y,
                place.PedPosition.z
            );

            const blip = await utils.blipCreate(
                pos,
                rent.Office.Blip.Name,
                rent.Office.Blip.Sprite,
                rent.Office.Blip.Color,
                rent.Office.Blip.Scale
            );

            if (blip) this.blips.push(blip);
            //Добавляем педов и таргеты
            const v3 = new Vector3(place.PedPosition.x, place.PedPosition.y, place.PedPosition.z)

            let ped = await utils.pedCreate(rent.Office.Ped, v3, place.PedPosition.w, rent.Office.PedScenario);
            global.exports['qb-target'].AddTargetEntity(ped, {
                options: [
                    //начинаем работать
                    {
                        type : 'client',
                        event : 'c-vehicleRent:client:vehicleMenu',
                        args: place,
                        icon : rent.Office.TargetIcon,
                        label : rent.Office.TargetLabel,
                        //canInteract: () => {return  !inMission},
                    },
                ],
                distance: 2.5,
            });
            if (ped) this.peds.push(ped)
        }
    }

    // /**
    //  * Функция очистки
    //  */
    public async cleanup() {
        this.blips.forEach(blip => RemoveBlip(blip));
        this.blips.length = 0;
        for (const ped of this.peds) {
            SetBlockingOfNonTemporaryEvents(ped, false)
            ClearPedTasksImmediately(ped)
            SetEntityAsNoLongerNeeded(ped)
            await Delay(5000);
            DeletePed(ped);
            DeleteEntity(ped);
        }
        this.peds.length = 0;
    }
    // /**
    //  * Запускает процесс аренды выбранного ТС
    //  */
    public async prepareRentalProcess(model: string, price: number, coords: Vector3, heading: number){
        try {
            // Запрос времени аренды
            const input = await lib.inputDialog('Время аренды', [{
                type: 'number',
                label: 'Введите время аренды в минутах (1-120)',
                icon: 'hashtag',
                placeholder: '15',
                min: 1,
                max: 120
            }]);

            if (!input) {
                console.log('Пользователь отменил ввод');
                return;
            }

            const duration = parseInt(input);
            if (isNaN(duration)) {
                lib.notify({ type: 'error', description: 'Некорректное время аренды' });
                return;
            }

            // Расчет стоимости
            const totalPrice = duration * price;

            // Подтверждение аренды
            const confirm = await lib.registerContext({
                title: `Подтверждение аренды`,
                id: 'rent_confirm',
                options: [
                    // {
                    //     title: `Арендовать ${model} на ${duration} мин`,
                    //     description: `Общая стоимость: $${totalPrice}`,
                    //     icon: 'car',
                    //     arrow: true,
                    //     event: 'c-vehicleRent:client:confirmRental',
                    //     args: { model, duration, price: totalPrice }
                    // }
                    {
                        title: `Арендовать ${model} на ${duration} мин`,
                        description: `Общая стоимость: $${totalPrice}`,
                        icon: 'car',
                        onSelect: () => {
                            console.debug('Pressed the button!');
                            console.debug(`${model} ${duration} ${totalPrice}`);
                            this.checkMoneyForRental(model, duration, totalPrice, coords, heading);
                        }
                    }
                ]
            });
            lib.showContext('rent_confirm');

        } catch (e) {
            console.error('Ошибка в процессе аренды:', e);
            lib.notify({ type: 'error', description: 'Ошибка при оформлении аренды' });
        }
    }
    private checkMoneyForRental(model: string, duration: number, totalPrice: number, coords: Vector3, heading :number) {
        QBCore.Functions.TriggerCallback('c-vehiclerent:server:CanPay', async (result:boolean) => {
            if (result) {
                this.startRentalProcess(model, duration, totalPrice, coords, heading)
            }
            else QBCore.Functions.Notify(locale.OutMoney, "error", 5000);
        }, totalPrice)
    }

    private startRentalProcess(model: string, duration: number, totalPrice: number, coords: Vector3, heading :number) {
        emitNet("c-vehiclerent:server:pay", totalPrice);
        let vehicle = new RentalVehicle(model, duration, coords, heading)
    }
}





