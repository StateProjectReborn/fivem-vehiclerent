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
        const myVector4 = {
            x: place.PedPosition.x,
            y: place.PedPosition.y,
            z: place.PedPosition.z,
            w: place.PedPosition.w
        };
        let targetTemp = {
            model : rent.Office.Ped,
            coords : myVector4,
            minusOne : true,
            freeze : true,
            invincible : true,
            blockevents : true,
            animDict : 'abigail_mcs_1_concat-0',
            anim : 'csb_abigail_dual-0',
            flag : 1,
            scenario : rent.Office.PedScenario,
            target : {
                options : [
                    {
                        type : 'client',
                        event : 'c-fractionGarage:client:vehicleMenu',
                        icon : rent.Office.TargetIcon,
                        label : rent.Office.TargetLabel,
                    }
                ],
                distance : 2.5
            },
            spawnNow : true
        }
        tempData.push(targetTemp)
    }
    let targetNumber: number = global.exports['qb-target'].SpawnPed(tempData)
    if (targetNumber) peds.push(targetNumber)

}

// Функция очистки
function cleanup() {
    blips.forEach(blip => RemoveBlip(blip));
    blips.length = 0;

    peds.forEach(ped => {
        DeleteEntity(ped);
        DeletePed(ped);
    });
    peds.length = 0;
}

// Запуск инициализации
const init = setTick(async () => {
    await initializeRentalBlips();
    clearTick(init);
});

export { cleanup };