const configPath = "config/rent.json";
// @ts-ignore
const rawData = LoadResourceFile(GetCurrentResourceName(), configPath);

import {Rent} from '../global/interfaces/rent'

let rent:any;

if (rawData !== null) {
    try {
        const _rent: Rent = JSON.parse(rawData);
        rent = _rent;
    }
    catch (error) {
        console.error('error parsing file')
    }
}
else {
    // @ts-ignore
    console.error(`error reading file ${GetCurrentResourceName()} ${rawData}`)
}

export {rent}