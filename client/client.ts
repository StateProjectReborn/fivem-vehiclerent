import { RentalManager as manager } from '../global/classes/rentalManager';
import {IPlaces} from "../global/interfaces/rent";
import {Vector3} from "fivem-js";
const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

//глобальная переменная с ox-lib
const lib = global.exports['ox_lib'];
//глобальная переменная с экземпляром класса
let rentalManager:manager;

// Запуск инициализации
const init = setTick(async () => {
    //Создаем экземпляр класса
    rentalManager = new manager();
    clearTick(init);
    console.log('Система аренды инициализирована');
});



//Событие открытия меню офиса
on("c-vehicleRent:client:vehicleMenu", (data: any) => {
    console.debug(`c-vehicleRent:client:vehicleMenu ${JSON.stringify(data.args.VehicleList)}`)
    if (!data?.args?.VehicleList) {
        console.error('Некорректные данные для меню аренды');
        return;
    }
    try {
        // Подготавливаем опции меню
        const menuOptions = Object.values(data.args.VehicleList).map((vehicle: any) => ({
            label: vehicle.Model || 'Неизвестная модель',
            description: `Стоимость: $${vehicle.Price || 0}/мин`,
            args: {
                model: vehicle.Model,
                price: vehicle.Price,
                coords: new Vector3(
                    data.args.VehicleSpawnPosition.x,
                    data.args.VehicleSpawnPosition.y,
                    data.args.VehicleSpawnPosition.z),
                heading: data.args.VehicleSpawnPosition.w
            }
        }));

        // Регистрируем меню
        lib.registerMenu({
            id: 'vehicle_rent_menu',
            title: 'Аренда транспортного средства',
            position: 'top-right',
            options: menuOptions,
            onClose: () => console.log('Меню аренды закрыто')
        }, (selected: number, scrollIndex: number, args: any) => {
            // Обработка выбора в меню
            if (args?.model) {
                console.debug(`Выбрана модель: ${args.model}`);
                rentalManager.prepareRentalProcess(args.model, args.price,  args.coords,  args.heading)

                //startRentalProcess(args.model, args.price);
            }
        });

        // Отображаем меню
        lib.showMenu('vehicle_rent_menu');
    } catch (e) {
        console.error('Ошибка при открытии меню аренды:', e);
    }
});



//Событие выключения скрипта
on("onResourceStop", (resource: string) => {
    if (resource == GetCurrentResourceName()) {
        //Вызываем метод класса для очистки
        rentalManager.cleanup().then(r => console.debug("cleanup is correctly finished"));
    }
});