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
    TargetLabelManager:string;
    TargetLabelManagerDone:string;
    TargetIcon:string;
    Places:IPlaces[];
    Blip:Blip,
}
interface IPlaces {
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