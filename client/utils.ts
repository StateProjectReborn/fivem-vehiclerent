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