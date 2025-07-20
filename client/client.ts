import {pedCreate} from "../client/utils";
import { RentalManager as manager } from '../global/classes/rentalManager';
const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

import { Vector3 } from 'fivem-js';
import * as utils from '../client/utils';
import { rent } from '../global/configRent';

let rentalManager:manager;





// Запуск инициализации
const init = setTick(async () => {

    rentalManager = new manager();


    //await initializeRentalBlips();
    clearTick(init);
    console.log('Система аренды инициализирована');
});

//export { cleanup };


on("onResourceStop", (resource: string) => {
    if (resource == GetCurrentResourceName()) {
        rentalManager.cleanup().then(r => console.debug("cleanup is correctly finished"));
    }
});