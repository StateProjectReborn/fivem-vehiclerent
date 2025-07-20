import { Vector3 } from 'fivem-js';
import { RentalVehicle } from './rentalVehicle';
import {IRentalPoint} from '../interfaces/rentalPoint'

import * as utils from  '../../client/utils'
import { rent } from '../configRent';


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
                        event : 'c-fractionGarage:client:vehicleMenu',
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
    //  * Показывает меню выбора ТС
    //  * @param point - точка аренды
    //  */
    // private async showRentalMenu(point: RentalPoint): Promise<void> {
    //     // Создаем варианты выбора
    //     const menuItems = point.vehicles.map(vehicle => ({
    //         label: GetLabelText(vehicle) || vehicle,  // Локализованное название
    //         value: vehicle
    //     }));
    //
    //     // Показываем меню выбора
    //     const selectedVehicle = await ShowMenu(
    //         "АРЕНДА ТРАНСПОРТА",
    //         menuItems,
    //         "Выберите транспортное средство"
    //     );
    //
    //     if (selectedVehicle) {
    //         // Запрашиваем время аренды
    //         const duration = await ShowInput(
    //             "ВРЕМЯ АРЕНДЫ",
    //             "Введите время в минутах (макс. 180)",
    //             "30",
    //             3
    //         );
    //
    //         const durationNum = Number(duration);
    //         if (duration && durationNum > 0 && durationNum <= 180) {
    //             this.startRental(selectedVehicle, point, durationNum);
    //         } else {
    //             console.debug("~r~Некорректное время аренды");
    //         }
    //     }
    // }
    /**
     * Начинает процесс аренды
     */
    /*private startRental(model: string, point: RentalPoint, duration: number): void {
        // Если уже есть арендованное ТС - возвращаем его
        if (this.currentVehicle) {
            this.currentVehicle.returnVehicle();
        }

        // Создаем новое ТС
        this.currentVehicle = new RentalVehicle(
            model,
            point.position,
            point.heading,
            duration
        );

        console.debug(`~g~Вы арендовали ${GetLabelText(model) || model} на ${duration} минут`);
        

        // Регистрируем команду для продления
        RegisterCommand("extendrental", () => {
            this.showExtensionMenu();
        }, false);
    }
    */
    /**
     * Меню продления аренды
     */
    /*private async showExtensionMenu(): Promise<void> {
        if (!this.currentVehicle) {
            console.debug("~r~У вас нет арендованного ТС");
            return;
        }

        const minutes = await ShowInput(
            "ПРОДЛЕНИЕ АРЕНДЫ",
            "Введите количество минут",
            "15",
            3
        );

        const minutesNum = Number(minutes);
        if (minutes && minutesNum > 0) {
            this.currentVehicle.extendRental(minutesNum);
        } else {
            console.debug("~r~Некорректное значение");
        }
    }*/
}


