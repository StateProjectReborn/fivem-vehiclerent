const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));
import { Vector3 } from 'fivem-js';
import * as cfx from "fivem-js";
import { locale } from '../global/locale'
import { rent } from '../global/configRent'


//инициализируем программу
const init = setTick(async () => {

    await Delay(1000)
    //отрисовываем блипы

})