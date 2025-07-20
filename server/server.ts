let QBCore = global.exports['qb-core'].GetCoreObject();


QBCore.Functions.CreateCallback('c-vehiclerent:server:CanPay', (source:number, cb:any, price:number) => {
    let Player = QBCore.Functions.GetPlayer(source)
    cb(Player.PlayerData.money['bank']>= price || Player.PlayerData.money['cash']>= price);
})