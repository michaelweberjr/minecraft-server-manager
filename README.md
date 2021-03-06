# minecraft-server-manager
Provides a react app for running a minecraft server. For setting up the server you will need to provide a '.env' file with following options set:
```
FORGE_JAR='name of jar file that starts the server'
MINECRAFT_PATH='path to the minecraft server'
ADMIN_NAME='username for logging in as an admin'
ADMIN_PWS='password for logging in as an admin'
DOWNLOAD_LOCAL='set to true if modpack is downloaded locally at MINECRAFT_PATH + MODPACK_LINK'
MODPACK_NAME='name of the modpack for downloading'
MODPACK_LINK='link to the modpack'
RAM='The amount of ram in GB to allocate to the server'
APP_PORT='sets the port for the app running https'
WEBSOCKET_PORT='sets the port for the websocket server for server updates'
HTTP_PORT='port of the server running http to automatic redirect to https'
DOMAIN='sets the ip/domain address of the manager server, the path will add 'wss://' and the port number'
SERVER_KEY='sets the server key file for HTTPS'
SERVER_CERT='sets the server cert file for HTTPS'
DEBUG='set to true to output all of the minecraft server's output to the console'
```
You can start the manager with `npm start`
The download file should be in the same folder as `MINECRAFT_PATH`

If you want to make the manager accessable outside of your network you will need to setup port forwarding to the ports. You will also need to supply certificates for the HTTPS protocal.
