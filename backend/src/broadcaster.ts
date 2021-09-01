import * as Express from 'express';
import {BrowserWindow, dialog, ipcMain} from "electron";
import * as Alert from 'electron-alert';
import {Server} from "http";
import {Plugin, WebSocketBus, ApiClient} from 'vtubestudio';
import * as WebSocket from 'ws';
import * as path from "path";
import * as fs from "fs";
import * as ews from "express-ws";
import * as ngrok from "ngrok";
import {RequestHandler} from "express";
import Dict = NodeJS.Dict;
import {WithWebsocketMethod} from "express-ws";

const swal = new Alert(["<style>*{font-family: sans-serif !important;}</style>"]);

interface BroadcasterSettings {
    vts_port: number;
    serve_host: string;
    serve_port: number;
    model_path: string;
    ngrok: boolean;
    ngrok_token: string;
}

export class Broadcaster {
    protected window: BrowserWindow;
    protected express: Express.Application & WithWebsocketMethod;
    protected server: Server;
    protected plugin: Plugin;
    protected websocket: WebSocket;
    protected interval: NodeJS.Timer;
    protected loadedModels: Dict<RequestHandler> = {};
    protected modelPath: string;
    protected relayData: VTSRelay.RelayData;
    protected ngrokUrl: string;

    constructor(window: BrowserWindow){
        this.window = window;
        window.on('close', ()=>this.stop());
        ipcMain.on('connect', (ev, settings: BroadcasterSettings, vts_token: string)=>this.connect(settings, vts_token));
        ipcMain.on('browse', ()=>this.browse());
    }

    browse(){
        dialog.showOpenDialog(this.window, {
            properties: ['openDirectory']
        }).then(result => {
            this.window.webContents.send(
                'done-browse',
                result.canceled ?
                        null: result.filePaths[0]
            );
        }).catch(()=>{});
    }

    log(text: string){
        this.window.webContents.send('write-log', text);
    }

    async connect(settings: BroadcasterSettings, vts_token: string){
        if(this.websocket){
            return this.stop();
        } else {
            this.window.webContents.send('disable-button', true);
            return this.start(settings, vts_token)
                .finally(()=>{
                    this.window.webContents.send('disable-button', false);
                });
        }
    }

    async start(settings: BroadcasterSettings, vts_token: string) {
        this.loadedModels = {};
        this.relayData = {modelId: null, filename: null, parameters: []};
        try{
            this.websocket = await this.createWebsocket(`ws://127.0.0.1:${settings.vts_port}`);
            await this.preparePlugin(vts_token);
            this.express = ews(Express()).app;
            this.modelPath = settings.model_path;
            await this.setupExpress(settings);
            this.server = await this.startExpress(settings.serve_host, settings.serve_port);
            this.log(`Web server started, listening on: ${settings.serve_host}:${settings.serve_port}`);
            if(settings.ngrok){
                try{
                    this.ngrokUrl = await ngrok.connect({
                        proto: 'http',
                        addr: settings.serve_port,
                        authtoken: settings.ngrok_token == '' ? undefined : settings.ngrok_token,
                        binPath: path => path.replace('app.asar', 'app.asar.unpacked'),
                    });
                    this.log(`Ngrok tunnel started at: ${this.ngrokUrl}`);
                } catch (e){
                    this.promptError('Failed to start ngrok tunnel.');
                }
            }
        } catch (e){
            this.promptError(e);
            this.stop();
            return;
        }
        this.window.webContents.send('disable-form', true);
        this.window.webContents.send('rename-button', 'Stop');
    }

    stop(){
        if(this.interval){
            clearTimeout(this.interval);
            this.interval = void 0;
        }
        if(this.ngrokUrl){
            ngrok.kill().then(()=>this.log('Stopped ngrok tunnel'));
            this.ngrokUrl = void 0;
        }
        if(this.websocket){
            this.websocket.close();
            this.websocket = void 0;
            this.log(`Disconnected from Vtube Studio.`);
        }
        if(this.plugin){
            this.plugin = void 0;
        }
        if(this.server){
            this.server.close();
            this.express = void 0;
            this.log(`Web server stopped.`);
        }
        this.window.webContents.send('disable-form', false);
        this.window.webContents.send('rename-button', 'Connect');
    }

    protected promptError(error: string){
        this.log(error);
        swal.fireFrameless({
            title: 'Error',
            html: `<span class="sans-serif">${error}</span>`,
            icon: 'error'
        });
    }

    protected createWebsocket(url: string): Promise<WebSocket>{
        return new Promise((res, rej)=>{
            let ws: WebSocket = new WebSocket(url);
            let onSuccess, onError;
            ws.addEventListener('open', onSuccess = function (){
                ws.removeEventListener('open', onSuccess);
                ws.removeEventListener('error', onError);
                res(ws);
            })
            ws.addEventListener('error', (onError = ()=>{
                ws.removeEventListener('open', onSuccess);
                ws.removeEventListener('error', onError);
                rej("Failed to connect to Vtube Studio");
            }) as any);
        });
    }

    protected async preparePlugin(vts_token: string){
        let bus = new WebSocketBus(this.websocket);
        let client = new ApiClient(bus);
        try{
           await client.apiState();
        } catch (e){
            throw "Failed to connect to Vtube Studio";
        }
        this.log('Connected to Vtube Studio.');
        this.plugin = new Plugin(
            client,
            "Vtube Studio Web Relay",
            "0nepeop1e",
            undefined,
            vts_token,
            (token) => this.window.webContents.send('store-vts-token', token)
        );
        try{
            await this.plugin.statistics();
        } catch (e){
            throw "Failed to authenticate plugin.";
        }
        let refreshData = async ()=>{
            try{
                let model = await this.plugin.currentModel();
                if(model == null){
                    this.relayData = {modelId: null, filename: null, parameters: []};
                    this.interval = setTimeout(refreshData, 10);
                    return;
                }
                if(model.id != this.relayData.modelId){
                    this.log(`Model loaded: ${model.vtsModelName}`);
                    await this.setupModel(model);
                    this.relayData.modelId = model.id;
                    this.relayData.filename = model.vtsModelName.replace(/\.vtube\.json$/i, '.model3.json');
                }
                this.relayData.parameters = (await model.live2DParameters()).map((param)=>{
                    return {name: param.name, value: param.value};
                });
                this.interval = setTimeout(refreshData, 10);
            } catch (e){
                if(this.websocket){
                    this.promptError("Lost connection to Vtube Studio.");
                    this.stop();
                }
            }
        };
        this.interval = setTimeout(refreshData, 10);
        this.log('Plugin authenticated.')
    }

    protected async setupExpress(settings: BroadcasterSettings){
        this.express.use('/models/:modelId', async (req, res, next) => {
            let id = req.params.modelId;
            if(this.loadedModels.hasOwnProperty(id)){
                return this.loadedModels[id](req, res, next);
            }
            next();
        });
        this.express.ws('/parameters', (ws)=>{
            ws.on('message', (msg)=>{
                switch (msg){
                    case 'query':
                        ws.send(JSON.stringify({
                            type: msg,
                            data: this.relayData
                        }));
                        break;
                    case'ping':
                        ws.send(JSON.stringify({
                            type: msg,
                            data: 'pong'
                        }));
                        break;
                    default:
                        ws.send('null');
                        break;
                }
            });
        });
        this.express.use('/', Express.static(path.join(__dirname, '../res/web')));
    }

    protected startExpress(host: string, port: number): Promise<Server>{
        return new Promise((res,rej)=>{
            let err = ()=>{
                rej("Failed to start webserver.");
            }
            let server = this.express.listen(port, host, function(){
                server.off('error', err);
                res(server);
            }).once('error', err);
        });
    }

    protected async setupModel(model: {id: string, vtsModelName: string}){
        if(this.loadedModels.hasOwnProperty(model.id)){
            return;
        }
        let res = fs.readdirSync(this.modelPath).some((dir)=>{
            let vts_file = path.join(this.modelPath, dir, model.vtsModelName);
            if(fs.existsSync(vts_file)){
                let buff = fs.readFileSync(vts_file).toString('utf-8');
                try{
                    let data = JSON.parse(buff);
                    if(!data.hasOwnProperty('ModelID')){
                        return false;
                    }
                    if(data['ModelID'] !== model.id){
                        return false;
                    }
                    this.loadedModels[model.id] = Express.static(path.join(this.modelPath, dir));
                    return true;
                } catch (e){
                    return false;
                }
            }
        });
        if(!res) {
            this.promptError(`Cannot find model path of ${model.vtsModelName}`);
        }
    }
}
