let QBCore = global.exports['qb-core'].GetCoreObject();


QBCore.Functions.CreateCallback('c-vehicleRent:server:CanPay', (source:number, cb:any, price:number) => {
    let Player = QBCore.Functions.GetPlayer(source)
    cb(Player.PlayerData.money['bank']>= price || Player.PlayerData.money['cash']>= price);
})

QBCore.Commands.Add('termrent','Завершить текущую аренду ТС', {}, false,(source: number, args: any[]) => {
    const Player = QBCore.Functions.GetPlayer(source);
    if (!Player) return;
    console.debug(`[RENTAL] Игрок ${Player.PlayerData.name} (${source}) запросил завершение аренды`);
    emitNet('c-vehicleRent:client:terminate', source);
});




onNet('c-vehicleRent:server:pay', (price:number) => {
    let src = source
    let Player = QBCore.Functions.GetPlayer(src)
    console.debug(`c-vehicleRent:server:pay ${price}`)
    if (Player.PlayerData.money['bank']>= price){
        console.debug(`c-vehicleRent:server:pay bank  ${price}`)
        Player.Functions.RemoveMoney("bank", price, "vehiclerent")
    }
    else if (Player.PlayerData.money['cash']>= price)  {
        console.debug(`c-vehicleRent:server:pay cash  ${price}`)
        Player.Functions.RemoveMoney("cash", price, "vehiclerent")
    }
})
