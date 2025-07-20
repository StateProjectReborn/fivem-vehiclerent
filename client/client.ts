import {pedCreate} from "../client/utils";

const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

import { Vector3 } from 'fivem-js';
import * as utils from '../client/utils';
import { rent } from '../global/configRent';

const blips: number[] = [];
const peds: number[] = [];

// Основная функция
async function initializeRentalBlips() {
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

        if (blip) blips.push(blip);
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
        if (ped) peds.push(ped)
        //tempData.push(targetTemp)
    }
    //let targetNumber: number = await global.exports['qb-target'].SpawnPed(tempData)
    //if (targetNumber) peds.push(targetNumber)

}

// Функция очистки
async function cleanup() {
    blips.forEach(blip => RemoveBlip(blip));
    blips.length = 0;
    //console.debug(`cleanup ${peds.length} ${JSON.stringify(peds)}`)
    for (const ped of peds) {
        //console.debug(`ped for delete  ${ped}`)
        SetBlockingOfNonTemporaryEvents(ped, false)
        ClearPedTasksImmediately(ped)
        SetEntityAsNoLongerNeeded(ped)
        await Delay(5000);
        DeletePed(ped);
        DeleteEntity(ped);
    }
    peds.length = 0;
    //console.debug(`cleanup ${peds.length}`)
}

// Запуск инициализации
const init = setTick(async () => {
    await initializeRentalBlips();
    clearTick(init);
});

export { cleanup };


on("onResourceStop", (resource: string) => {
    if (resource == GetCurrentResourceName()) {
        cleanup();
    }
});