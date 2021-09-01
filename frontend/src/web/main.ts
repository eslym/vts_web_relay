import * as PIXI from 'pixi.js';

import {
    Live2DCubismFramework as live2dcubismframework,
    Option,
    LogLevel,
} from '@cubism-framework/live2dcubismframework';

import { Live2DModel } from '@pixijs-live2d/live2d_model';

const CubismFramework = live2dcubismframework.CubismFramework;

const app = new PIXI.Application({
    resizeTo: window,
    transparent: true,
});

const option = new Option();
option.logFunction = (message: string) => console.log(message);
option.loggingLevel = LogLevel.LogLevel_Verbose;
CubismFramework.startUp(option);
CubismFramework.initialize();

document.body.appendChild(app.view);

function createWebsocket(url: string): Promise<WebSocket>{
    return new Promise((resolve, reject)=>{
        let ok, err;
        ok = function(){
            ws.removeEventListener('open', ok);
            ws.removeEventListener('error', err);
            resolve(ws);
        };
        err = function(event){
            ws.removeEventListener('open', ok);
            ws.removeEventListener('error', err);
            reject(event);
        };
        let ws = new WebSocket(url);
        ws.addEventListener('open', ok);
        ws.addEventListener('error', err);
    });
}

let currentModel: Live2DModel = null;
let currentModelId: string = null;
let scale = 1;
let location = new URL(window.location.href);
location.protocol = location.protocol.startsWith('https') ? 'wss' : 'ws';
location.pathname = '/parameters';

window.addEventListener('wheel', (event)=>{
    if(currentModel === null) {
        return;
    }
    if(event.deltaY > 0){
        scale /= 1.1;
    } else {
        scale *= 1.1;
    }
    if(scale <= 0.1) scale = 0.1;
    currentModel.scale.set(scale, scale);
});

app.renderer.on('resize', ()=>{
    if(currentModel === null) {
        return;
    }
    currentModel.x = app.renderer.width / 2;
    currentModel.y = app.renderer.height / 2;
});

function loadResource (path): Promise<void>{
    return new Promise((res)=>{
        app.loader.add(path)
            .load(()=>res());
    });
}

createWebsocket(location.toString()).then((ws)=>{
    ws.addEventListener('message', async function(event){
        let received: {type:string, data: VTSRelay.RelayData} = JSON.parse(event.data);
        if(received.type !== 'query'){
            return;
        }
        if(received.data.modelId === null){
            if(currentModel !== null){
                app.stage.removeChild(currentModel);
                currentModel.destroy();
                currentModel = null;
            }
            return;
        }
        if(received.data.modelId !== currentModelId){
            if(currentModel !== null){
                app.stage.removeChild(currentModel);
                currentModel.destroy();
                currentModel = null;
            }
            currentModelId = received.data.modelId;
            let path = `/models/${currentModelId}/${received.data.filename}`;
            await loadResource(path);
            currentModel = await Live2DModel.fromModel(path);
            currentModel.setBreathing(false);
            currentModel.getBounds();

            currentModel.x = app.renderer.width / 2;
            currentModel.y = app.renderer.height / 2;

            currentModel.scale.set(scale, scale);

            app.stage.addChild(currentModel);
            return;
        }
        if(currentModel === null){
            return;
        }
        for (const param of received.data.parameters) {
            currentModel.setParameter(param.name, param.value);
        }
    });
    app.ticker.add(()=>{
        ws.send('query');
    });
});
