import {Vector3} from "fivem-js";

// Интерфейс точки аренды
export interface IRentalPoint {
    position: Vector3;  // Координаты точки
    heading: number;    // Направление
    vehicles: string[]; // Доступные модели ТС
}