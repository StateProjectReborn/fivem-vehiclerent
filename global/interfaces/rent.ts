import {Blip} from '../interfaces/blip'
import {Marker} from '../interfaces/marker'

type Rent = IRootObject

interface IRootObject {
    Office: IOffice;
    Marker: Marker;
}

interface IOffice {
    Ped: string;
    PedScenario: string;
    TargetLabel:string;
    TargetIcon:string;
    Places:IPlaces[];
    Blip:Blip,
}
export interface IPlaces {
    PedPosition:IPosition,
    VehicleSpawnPosition:IPosition
}

interface IPosition {
    x: number;
    y: number;
    z: number;
    w: number;
}

export {Rent}