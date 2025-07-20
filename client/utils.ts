const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));
import {Prop}  from "fivem-js";
import * as cfx from "fivem-js";



export async function cfxBlipCreate(pos:cfx.Vector3, radius: number, name: string, sprite: number, color: number, scale:number): Promise<cfx.Blip>{
    let blip = cfx.World.createBlip(pos, radius);
    blip.Sprite = sprite;
    blip.Color = color;
    //blip.Scale = scale;
    SetBlipScale(blip.Handle, scale);
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentSubstringPlayerName(name);
    EndTextCommandSetBlipName(blip.Handle);
    console.log("blip created", JSON.stringify(blip))
    return blip;
}

export function blipCreate(pos:cfx.Vector3, name: string, sprite: number, color: number, scale:number): number{

    let blip = AddBlipForCoord(pos.x, pos.y, pos.z)
    SetBlipSprite(blip, sprite);
    SetBlipColour(blip, color);
    SetBlipScale(blip, scale);
    SetBlipDisplay(blip, 4);
    SetBlipAsShortRange(blip, true)
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentSubstringPlayerName(name);
    EndTextCommandSetBlipName(blip);
    console.log("blip created", JSON.stringify(blip))
    return blip;
}

export async function LoadModel(hash:number){
    if (!IsModelInCdimage(hash))
    {
        console.error(`model ${hash} invalid`);
        return;
    }
    RequestModel(hash);
    while(!HasModelLoaded(hash)) await Delay(100);
}


export async function pedCreate(model:string, pos:cfx.Vector3, heading:number, scenario:string):Promise<number>
{
    var hash = GetHashKey(model);
    await LoadModel(hash);
    var handle = CreatePed(4, hash, pos.x, pos.y, pos.z - 0.98, heading, false, true);
    PlaceObjectOnGroundProperly(handle);
    FreezeEntityPosition(handle, true);
    SetEntityInvincible(handle, true);
    SetBlockingOfNonTemporaryEvents(handle, true);
    TaskStartScenarioInPlace(handle, scenario, -1, true);
    console.log("ped created", handle)
    return handle;
}

/**
 * Отображает 2D текст на экране
 * @param text - Текст для отображения
 * @param position - Позиция [x, y] (нормализованные координаты 0-1)
 * @param scale - Масштаб текста
 * @param color - Цвет в формате RGBA (опционально)
 * @param font - Стиль текста (опционально)
 *
 */
export function DrawText2D(
    text: string,
    position: [number, number],
    scale: number,
    color: [number, number, number, number] = [255, 255, 255, 255],
    font: number = 4
): void {

    // Сброс предыдущих настроек
    ClearAllHelpMessages();

    // Установка стиля
    SetTextFont(font);
    SetTextScale(scale, scale);
    SetTextProportional(true);
    SetTextColour(color[0], color[1], color[2], color[3]);
    SetTextOutline();
    SetTextDropShadow();
    SetTextCentre(true);

    // Отрисовка
    BeginTextCommandDisplayText('STRING');
    AddTextComponentSubstringPlayerName(text);
    EndTextCommandDisplayText(position[0], position[1]);

}