const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));
import {Prop}  from "fivem-js";
import * as cfx from "fivem-js";



export async function BlipCreate(pos:cfx.Vector3, radius: number, name: string, sprite: number, color: number, scale:number): Promise<cfx.Blip>{
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