fx_version 'cerulean'
game 'gta5'
author 'Mr. Cruso'
description 'Rent vehicle script for QBCore servers'
version '0.1.0'

files {
   'build/global/*.json',
   'build/global/*.js',
   'config/*.json',
   '*.json'
}
client_scripts {
	'build/client/client.js'
}

server_scripts {
	'build/server/server.js'
}