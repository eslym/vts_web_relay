"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Broadcaster = void 0;
var Express = require("express");
var electron_1 = require("electron");
var Alert = require("electron-alert");
var vtubestudio_1 = require("vtubestudio");
var WebSocket = require("ws");
var path = require("path");
var fs = require("fs");
var ews = require("express-ws");
var ngrok = require("ngrok");
var swal = new Alert(["<style>*{font-family: sans-serif !important;}</style>"]);
var Broadcaster = /** @class */ (function () {
    function Broadcaster(window) {
        var _this = this;
        this.loadedModels = {};
        this.window = window;
        window.on('close', function () { return _this.stop(); });
        electron_1.ipcMain.on('connect', function (ev, settings, vts_token) { return _this.connect(settings, vts_token); });
        electron_1.ipcMain.on('browse', function () { return _this.browse(); });
    }
    Broadcaster.prototype.browse = function () {
        var _this = this;
        electron_1.dialog.showOpenDialog(this.window, {
            properties: ['openDirectory']
        }).then(function (result) {
            _this.window.webContents.send('done-browse', result.canceled ?
                null : result.filePaths[0]);
        }).catch(function () { });
    };
    Broadcaster.prototype.log = function (text) {
        this.window.webContents.send('write-log', text);
    };
    Broadcaster.prototype.connect = function (settings, vts_token) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.websocket) {
                    return [2 /*return*/, this.stop()];
                }
                else {
                    this.window.webContents.send('disable-button', true);
                    return [2 /*return*/, this.start(settings, vts_token)
                            .finally(function () {
                            _this.window.webContents.send('disable-button', false);
                        })];
                }
                return [2 /*return*/];
            });
        });
    };
    Broadcaster.prototype.start = function (settings, vts_token) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, e_1, e_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.loadedModels = {};
                        this.relayData = { modelId: null, filename: null, parameters: [] };
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 10, , 11]);
                        _a = this;
                        return [4 /*yield*/, this.createWebsocket("ws://127.0.0.1:" + settings.vts_port)];
                    case 2:
                        _a.websocket = _d.sent();
                        return [4 /*yield*/, this.preparePlugin(vts_token)];
                    case 3:
                        _d.sent();
                        this.express = ews(Express()).app;
                        this.modelPath = settings.model_path;
                        return [4 /*yield*/, this.setupExpress(settings)];
                    case 4:
                        _d.sent();
                        _b = this;
                        return [4 /*yield*/, this.startExpress(settings.serve_host, settings.serve_port)];
                    case 5:
                        _b.server = _d.sent();
                        this.log("Web server started, listening on: " + settings.serve_host + ":" + settings.serve_port);
                        if (!settings.ngrok) return [3 /*break*/, 9];
                        _d.label = 6;
                    case 6:
                        _d.trys.push([6, 8, , 9]);
                        _c = this;
                        return [4 /*yield*/, ngrok.connect({
                                proto: 'http',
                                addr: settings.serve_port,
                                authtoken: settings.ngrok_token == '' ? undefined : settings.ngrok_token,
                                binPath: function (path) { return path.replace('app.asar', 'app.asar.unpacked'); },
                            })];
                    case 7:
                        _c.ngrokUrl = _d.sent();
                        this.log("Ngrok tunnel started at: " + this.ngrokUrl);
                        return [3 /*break*/, 9];
                    case 8:
                        e_1 = _d.sent();
                        this.promptError('Failed to start ngrok tunnel.');
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        e_2 = _d.sent();
                        this.promptError(e_2);
                        this.stop();
                        return [2 /*return*/];
                    case 11:
                        this.window.webContents.send('disable-form', true);
                        this.window.webContents.send('rename-button', 'Stop');
                        return [2 /*return*/];
                }
            });
        });
    };
    Broadcaster.prototype.stop = function () {
        var _this = this;
        if (this.interval) {
            clearTimeout(this.interval);
            this.interval = void 0;
        }
        if (this.ngrokUrl) {
            ngrok.kill().then(function () { return _this.log('Stopped ngrok tunnel'); });
            this.ngrokUrl = void 0;
        }
        if (this.websocket) {
            this.websocket.close();
            this.websocket = void 0;
            this.log("Disconnected from Vtube Studio.");
        }
        if (this.plugin) {
            this.plugin = void 0;
        }
        if (this.server) {
            this.server.close();
            this.express = void 0;
            this.log("Web server stopped.");
        }
        this.window.webContents.send('disable-form', false);
        this.window.webContents.send('rename-button', 'Connect');
    };
    Broadcaster.prototype.promptError = function (error) {
        this.log(error);
        swal.fireFrameless({
            title: 'Error',
            html: "<span class=\"sans-serif\">" + error + "</span>",
            icon: 'error'
        });
    };
    Broadcaster.prototype.createWebsocket = function (url) {
        return new Promise(function (res, rej) {
            var ws = new WebSocket(url);
            var onSuccess, onError;
            ws.addEventListener('open', onSuccess = function () {
                ws.removeEventListener('open', onSuccess);
                ws.removeEventListener('error', onError);
                res(ws);
            });
            ws.addEventListener('error', (onError = function () {
                ws.removeEventListener('open', onSuccess);
                ws.removeEventListener('error', onError);
                rej("Failed to connect to Vtube Studio");
            }));
        });
    };
    Broadcaster.prototype.preparePlugin = function (vts_token) {
        return __awaiter(this, void 0, void 0, function () {
            var bus, client, e_3, e_4, refreshData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bus = new vtubestudio_1.WebSocketBus(this.websocket);
                        client = new vtubestudio_1.ApiClient(bus);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, client.apiState()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        throw "Failed to connect to Vtube Studio";
                    case 4:
                        this.log('Connected to Vtube Studio.');
                        this.plugin = new vtubestudio_1.Plugin(client, "Vtube Studio Web Relay", "0nepeop1e", undefined, vts_token, function (token) { return _this.window.webContents.send('store-vts-token', token); });
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.plugin.statistics()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_4 = _a.sent();
                        throw "Failed to authenticate plugin.";
                    case 8:
                        refreshData = function () { return __awaiter(_this, void 0, void 0, function () {
                            var model, _a, e_5;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 5, , 6]);
                                        return [4 /*yield*/, this.plugin.currentModel()];
                                    case 1:
                                        model = _b.sent();
                                        if (model == null) {
                                            this.relayData = { modelId: null, filename: null, parameters: [] };
                                            this.interval = setTimeout(refreshData, 10);
                                            return [2 /*return*/];
                                        }
                                        if (!(model.id != this.relayData.modelId)) return [3 /*break*/, 3];
                                        this.log("Model loaded: " + model.vtsModelName);
                                        return [4 /*yield*/, this.setupModel(model)];
                                    case 2:
                                        _b.sent();
                                        this.relayData.modelId = model.id;
                                        this.relayData.filename = model.vtsModelName.replace(/\.vtube\.json$/i, '.model3.json');
                                        _b.label = 3;
                                    case 3:
                                        _a = this.relayData;
                                        return [4 /*yield*/, model.live2DParameters()];
                                    case 4:
                                        _a.parameters = (_b.sent()).map(function (param) {
                                            return { name: param.name, value: param.value };
                                        });
                                        this.interval = setTimeout(refreshData, 10);
                                        return [3 /*break*/, 6];
                                    case 5:
                                        e_5 = _b.sent();
                                        if (this.websocket) {
                                            this.promptError("Lost connection to Vtube Studio.");
                                            this.stop();
                                        }
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); };
                        this.interval = setTimeout(refreshData, 10);
                        this.log('Plugin authenticated.');
                        return [2 /*return*/];
                }
            });
        });
    };
    Broadcaster.prototype.setupExpress = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.express.use('/models/:modelId', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                    var id;
                    return __generator(this, function (_a) {
                        id = req.params.modelId;
                        if (this.loadedModels.hasOwnProperty(id)) {
                            return [2 /*return*/, this.loadedModels[id](req, res, next)];
                        }
                        next();
                        return [2 /*return*/];
                    });
                }); });
                this.express.ws('/parameters', function (ws) {
                    ws.on('message', function (msg) {
                        switch (msg) {
                            case 'query':
                                ws.send(JSON.stringify({
                                    type: msg,
                                    data: _this.relayData
                                }));
                                break;
                            case 'ping':
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
                return [2 /*return*/];
            });
        });
    };
    Broadcaster.prototype.startExpress = function (host, port) {
        var _this = this;
        return new Promise(function (res, rej) {
            var err = function () {
                rej("Failed to start webserver.");
            };
            var server = _this.express.listen(port, host, function () {
                server.off('error', err);
                res(server);
            }).once('error', err);
        });
    };
    Broadcaster.prototype.setupModel = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.loadedModels.hasOwnProperty(model.id)) {
                    return [2 /*return*/];
                }
                res = fs.readdirSync(this.modelPath).some(function (dir) {
                    var vts_file = path.join(_this.modelPath, dir, model.vtsModelName);
                    if (fs.existsSync(vts_file)) {
                        var buff = fs.readFileSync(vts_file).toString('utf-8');
                        try {
                            var data = JSON.parse(buff);
                            if (!data.hasOwnProperty('ModelID')) {
                                return false;
                            }
                            if (data['ModelID'] !== model.id) {
                                return false;
                            }
                            _this.loadedModels[model.id] = Express.static(path.join(_this.modelPath, dir));
                            return true;
                        }
                        catch (e) {
                            return false;
                        }
                    }
                });
                if (!res) {
                    this.promptError("Cannot find model path of " + model.vtsModelName);
                }
                return [2 /*return*/];
            });
        });
    };
    return Broadcaster;
}());
exports.Broadcaster = Broadcaster;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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SSxDQUFDLElBQUksQ0FBQyxLQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ2xFLElBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBQzt3QkFDdkIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ3ZELElBQUc7NEJBQ0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDNUIsSUFBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUM7Z0NBQy9CLE9BQU8sS0FBSyxDQUFDOzZCQUNoQjs0QkFDRCxJQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRSxFQUFDO2dDQUM1QixPQUFPLEtBQUssQ0FBQzs2QkFDaEI7NEJBQ0QsS0FBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzs0QkFDN0UsT0FBTyxJQUFJLENBQUM7eUJBQ2Y7d0JBQUMsT0FBTyxDQUFDLEVBQUM7NEJBQ1AsT0FBTyxLQUFLLENBQUM7eUJBQ2hCO3FCQUNKO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUcsQ0FBQyxHQUFHLEVBQUU7b0JBQ0wsSUFBSSxDQUFDLFdBQVcsQ0FBQywrQkFBNkIsS0FBSyxDQUFDLFlBQWMsQ0FBQyxDQUFDO2lCQUN2RTs7OztLQUNKO0lBQ0wsa0JBQUM7QUFBRCxDQTlQQSxBQThQQyxJQUFBO0FBOVBZLGtDQUFXIiwiZmlsZSI6ImJyb2FkY2FzdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgRXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCB7QnJvd3NlcldpbmRvdywgZGlhbG9nLCBpcGNNYWlufSBmcm9tIFwiZWxlY3Ryb25cIjtcbmltcG9ydCAqIGFzIEFsZXJ0IGZyb20gJ2VsZWN0cm9uLWFsZXJ0JztcbmltcG9ydCB7U2VydmVyfSBmcm9tIFwiaHR0cFwiO1xuaW1wb3J0IHtQbHVnaW4sIFdlYlNvY2tldEJ1cywgQXBpQ2xpZW50fSBmcm9tICd2dHViZXN0dWRpbyc7XG5pbXBvcnQgKiBhcyBXZWJTb2NrZXQgZnJvbSAnd3MnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgKiBhcyBld3MgZnJvbSBcImV4cHJlc3Mtd3NcIjtcbmltcG9ydCAqIGFzIG5ncm9rIGZyb20gXCJuZ3Jva1wiO1xuaW1wb3J0IHtSZXF1ZXN0SGFuZGxlcn0gZnJvbSBcImV4cHJlc3NcIjtcbmltcG9ydCBEaWN0ID0gTm9kZUpTLkRpY3Q7XG5pbXBvcnQge1dpdGhXZWJzb2NrZXRNZXRob2R9IGZyb20gXCJleHByZXNzLXdzXCI7XG5cbmNvbnN0IHN3YWwgPSBuZXcgQWxlcnQoW1wiPHN0eWxlPip7Zm9udC1mYW1pbHk6IHNhbnMtc2VyaWYgIWltcG9ydGFudDt9PC9zdHlsZT5cIl0pO1xuXG5pbnRlcmZhY2UgQnJvYWRjYXN0ZXJTZXR0aW5ncyB7XG4gICAgdnRzX3BvcnQ6IG51bWJlcjtcbiAgICBzZXJ2ZV9ob3N0OiBzdHJpbmc7XG4gICAgc2VydmVfcG9ydDogbnVtYmVyO1xuICAgIG1vZGVsX3BhdGg6IHN0cmluZztcbiAgICBuZ3JvazogYm9vbGVhbjtcbiAgICBuZ3Jva190b2tlbjogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQnJvYWRjYXN0ZXIge1xuICAgIHByb3RlY3RlZCB3aW5kb3c6IEJyb3dzZXJXaW5kb3c7XG4gICAgcHJvdGVjdGVkIGV4cHJlc3M6IEV4cHJlc3MuQXBwbGljYXRpb24gJiBXaXRoV2Vic29ja2V0TWV0aG9kO1xuICAgIHByb3RlY3RlZCBzZXJ2ZXI6IFNlcnZlcjtcbiAgICBwcm90ZWN0ZWQgcGx1Z2luOiBQbHVnaW47XG4gICAgcHJvdGVjdGVkIHdlYnNvY2tldDogV2ViU29ja2V0O1xuICAgIHByb3RlY3RlZCBpbnRlcnZhbDogTm9kZUpTLlRpbWVyO1xuICAgIHByb3RlY3RlZCBsb2FkZWRNb2RlbHM6IERpY3Q8UmVxdWVzdEhhbmRsZXI+ID0ge307XG4gICAgcHJvdGVjdGVkIG1vZGVsUGF0aDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCByZWxheURhdGE6IFZUU1JlbGF5LlJlbGF5RGF0YTtcbiAgICBwcm90ZWN0ZWQgbmdyb2tVcmw6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHdpbmRvdzogQnJvd3NlcldpbmRvdyl7XG4gICAgICAgIHRoaXMud2luZG93ID0gd2luZG93O1xuICAgICAgICB3aW5kb3cub24oJ2Nsb3NlJywgKCk9PnRoaXMuc3RvcCgpKTtcbiAgICAgICAgaXBjTWFpbi5vbignY29ubmVjdCcsIChldiwgc2V0dGluZ3M6IEJyb2FkY2FzdGVyU2V0dGluZ3MsIHZ0c190b2tlbjogc3RyaW5nKT0+dGhpcy5jb25uZWN0KHNldHRpbmdzLCB2dHNfdG9rZW4pKTtcbiAgICAgICAgaXBjTWFpbi5vbignYnJvd3NlJywgKCk9PnRoaXMuYnJvd3NlKCkpO1xuICAgIH1cblxuICAgIGJyb3dzZSgpe1xuICAgICAgICBkaWFsb2cuc2hvd09wZW5EaWFsb2codGhpcy53aW5kb3csIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkRpcmVjdG9yeSddXG4gICAgICAgIH0pLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgIHRoaXMud2luZG93LndlYkNvbnRlbnRzLnNlbmQoXG4gICAgICAgICAgICAgICAgJ2RvbmUtYnJvd3NlJyxcbiAgICAgICAgICAgICAgICByZXN1bHQuY2FuY2VsZWQgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbDogcmVzdWx0LmZpbGVQYXRoc1swXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSkuY2F0Y2goKCk9Pnt9KTtcbiAgICB9XG5cbiAgICBsb2codGV4dDogc3RyaW5nKXtcbiAgICAgICAgdGhpcy53aW5kb3cud2ViQ29udGVudHMuc2VuZCgnd3JpdGUtbG9nJywgdGV4dCk7XG4gICAgfVxuXG4gICAgYXN5bmMgY29ubmVjdChzZXR0aW5nczogQnJvYWRjYXN0ZXJTZXR0aW5ncywgdnRzX3Rva2VuOiBzdHJpbmcpe1xuICAgICAgICBpZih0aGlzLndlYnNvY2tldCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndpbmRvdy53ZWJDb250ZW50cy5zZW5kKCdkaXNhYmxlLWJ1dHRvbicsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoc2V0dGluZ3MsIHZ0c190b2tlbilcbiAgICAgICAgICAgICAgICAuZmluYWxseSgoKT0+e1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndpbmRvdy53ZWJDb250ZW50cy5zZW5kKCdkaXNhYmxlLWJ1dHRvbicsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHN0YXJ0KHNldHRpbmdzOiBCcm9hZGNhc3RlclNldHRpbmdzLCB2dHNfdG9rZW46IHN0cmluZykge1xuICAgICAgICB0aGlzLmxvYWRlZE1vZGVscyA9IHt9O1xuICAgICAgICB0aGlzLnJlbGF5RGF0YSA9IHttb2RlbElkOiBudWxsLCBmaWxlbmFtZTogbnVsbCwgcGFyYW1ldGVyczogW119O1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICB0aGlzLndlYnNvY2tldCA9IGF3YWl0IHRoaXMuY3JlYXRlV2Vic29ja2V0KGB3czovLzEyNy4wLjAuMToke3NldHRpbmdzLnZ0c19wb3J0fWApO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wcmVwYXJlUGx1Z2luKHZ0c190b2tlbik7XG4gICAgICAgICAgICB0aGlzLmV4cHJlc3MgPSBld3MoRXhwcmVzcygpKS5hcHA7XG4gICAgICAgICAgICB0aGlzLm1vZGVsUGF0aCA9IHNldHRpbmdzLm1vZGVsX3BhdGg7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNldHVwRXhwcmVzcyhzZXR0aW5ncyk7XG4gICAgICAgICAgICB0aGlzLnNlcnZlciA9IGF3YWl0IHRoaXMuc3RhcnRFeHByZXNzKHNldHRpbmdzLnNlcnZlX2hvc3QsIHNldHRpbmdzLnNlcnZlX3BvcnQpO1xuICAgICAgICAgICAgdGhpcy5sb2coYFdlYiBzZXJ2ZXIgc3RhcnRlZCwgbGlzdGVuaW5nIG9uOiAke3NldHRpbmdzLnNlcnZlX2hvc3R9OiR7c2V0dGluZ3Muc2VydmVfcG9ydH1gKTtcbiAgICAgICAgICAgIGlmKHNldHRpbmdzLm5ncm9rKXtcbiAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmdyb2tVcmwgPSBhd2FpdCBuZ3Jvay5jb25uZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3RvOiAnaHR0cCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyOiBzZXR0aW5ncy5zZXJ2ZV9wb3J0LFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aHRva2VuOiBzZXR0aW5ncy5uZ3Jva190b2tlbiA9PSAnJyA/IHVuZGVmaW5lZCA6IHNldHRpbmdzLm5ncm9rX3Rva2VuLFxuICAgICAgICAgICAgICAgICAgICAgICAgYmluUGF0aDogcGF0aCA9PiBwYXRoLnJlcGxhY2UoJ2FwcC5hc2FyJywgJ2FwcC5hc2FyLnVucGFja2VkJyksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZyhgTmdyb2sgdHVubmVsIHN0YXJ0ZWQgYXQ6ICR7dGhpcy5uZ3Jva1VybH1gKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9tcHRFcnJvcignRmFpbGVkIHRvIHN0YXJ0IG5ncm9rIHR1bm5lbC4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgdGhpcy5wcm9tcHRFcnJvcihlKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud2luZG93LndlYkNvbnRlbnRzLnNlbmQoJ2Rpc2FibGUtZm9ybScsIHRydWUpO1xuICAgICAgICB0aGlzLndpbmRvdy53ZWJDb250ZW50cy5zZW5kKCdyZW5hbWUtYnV0dG9uJywgJ1N0b3AnKTtcbiAgICB9XG5cbiAgICBzdG9wKCl7XG4gICAgICAgIGlmKHRoaXMuaW50ZXJ2YWwpe1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHZvaWQgMDtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLm5ncm9rVXJsKXtcbiAgICAgICAgICAgIG5ncm9rLmtpbGwoKS50aGVuKCgpPT50aGlzLmxvZygnU3RvcHBlZCBuZ3JvayB0dW5uZWwnKSk7XG4gICAgICAgICAgICB0aGlzLm5ncm9rVXJsID0gdm9pZCAwO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMud2Vic29ja2V0KXtcbiAgICAgICAgICAgIHRoaXMud2Vic29ja2V0LmNsb3NlKCk7XG4gICAgICAgICAgICB0aGlzLndlYnNvY2tldCA9IHZvaWQgMDtcbiAgICAgICAgICAgIHRoaXMubG9nKGBEaXNjb25uZWN0ZWQgZnJvbSBWdHViZSBTdHVkaW8uYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5wbHVnaW4pe1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4gPSB2b2lkIDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5zZXJ2ZXIpe1xuICAgICAgICAgICAgdGhpcy5zZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuZXhwcmVzcyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHRoaXMubG9nKGBXZWIgc2VydmVyIHN0b3BwZWQuYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53aW5kb3cud2ViQ29udGVudHMuc2VuZCgnZGlzYWJsZS1mb3JtJywgZmFsc2UpO1xuICAgICAgICB0aGlzLndpbmRvdy53ZWJDb250ZW50cy5zZW5kKCdyZW5hbWUtYnV0dG9uJywgJ0Nvbm5lY3QnKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcHJvbXB0RXJyb3IoZXJyb3I6IHN0cmluZyl7XG4gICAgICAgIHRoaXMubG9nKGVycm9yKTtcbiAgICAgICAgc3dhbC5maXJlRnJhbWVsZXNzKHtcbiAgICAgICAgICAgIHRpdGxlOiAnRXJyb3InLFxuICAgICAgICAgICAgaHRtbDogYDxzcGFuIGNsYXNzPVwic2Fucy1zZXJpZlwiPiR7ZXJyb3J9PC9zcGFuPmAsXG4gICAgICAgICAgICBpY29uOiAnZXJyb3InXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjcmVhdGVXZWJzb2NrZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlPFdlYlNvY2tldD57XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopPT57XG4gICAgICAgICAgICBsZXQgd3M6IFdlYlNvY2tldCA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIGxldCBvblN1Y2Nlc3MsIG9uRXJyb3I7XG4gICAgICAgICAgICB3cy5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgb25TdWNjZXNzID0gZnVuY3Rpb24gKCl7XG4gICAgICAgICAgICAgICAgd3MucmVtb3ZlRXZlbnRMaXN0ZW5lcignb3BlbicsIG9uU3VjY2Vzcyk7XG4gICAgICAgICAgICAgICAgd3MucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICAgICAgICAgICAgICByZXMod3MpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHdzLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKG9uRXJyb3IgPSAoKT0+e1xuICAgICAgICAgICAgICAgIHdzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29wZW4nLCBvblN1Y2Nlc3MpO1xuICAgICAgICAgICAgICAgIHdzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICAgICAgICAgICAgcmVqKFwiRmFpbGVkIHRvIGNvbm5lY3QgdG8gVnR1YmUgU3R1ZGlvXCIpO1xuICAgICAgICAgICAgfSkgYXMgYW55KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIHByZXBhcmVQbHVnaW4odnRzX3Rva2VuOiBzdHJpbmcpe1xuICAgICAgICBsZXQgYnVzID0gbmV3IFdlYlNvY2tldEJ1cyh0aGlzLndlYnNvY2tldCk7XG4gICAgICAgIGxldCBjbGllbnQgPSBuZXcgQXBpQ2xpZW50KGJ1cyk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgYXdhaXQgY2xpZW50LmFwaVN0YXRlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgdGhyb3cgXCJGYWlsZWQgdG8gY29ubmVjdCB0byBWdHViZSBTdHVkaW9cIjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvZygnQ29ubmVjdGVkIHRvIFZ0dWJlIFN0dWRpby4nKTtcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBuZXcgUGx1Z2luKFxuICAgICAgICAgICAgY2xpZW50LFxuICAgICAgICAgICAgXCJWdHViZSBTdHVkaW8gV2ViIFJlbGF5XCIsXG4gICAgICAgICAgICBcIjBuZXBlb3AxZVwiLFxuICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgdnRzX3Rva2VuLFxuICAgICAgICAgICAgKHRva2VuKSA9PiB0aGlzLndpbmRvdy53ZWJDb250ZW50cy5zZW5kKCdzdG9yZS12dHMtdG9rZW4nLCB0b2tlbilcbiAgICAgICAgKTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc3RhdGlzdGljcygpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIHRocm93IFwiRmFpbGVkIHRvIGF1dGhlbnRpY2F0ZSBwbHVnaW4uXCI7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlZnJlc2hEYXRhID0gYXN5bmMgKCk9PntcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBsZXQgbW9kZWwgPSBhd2FpdCB0aGlzLnBsdWdpbi5jdXJyZW50TW9kZWwoKTtcbiAgICAgICAgICAgICAgICBpZihtb2RlbCA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWxheURhdGEgPSB7bW9kZWxJZDogbnVsbCwgZmlsZW5hbWU6IG51bGwsIHBhcmFtZXRlcnM6IFtdfTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldFRpbWVvdXQocmVmcmVzaERhdGEsIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihtb2RlbC5pZCAhPSB0aGlzLnJlbGF5RGF0YS5tb2RlbElkKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2coYE1vZGVsIGxvYWRlZDogJHttb2RlbC52dHNNb2RlbE5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2V0dXBNb2RlbChtb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVsYXlEYXRhLm1vZGVsSWQgPSBtb2RlbC5pZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWxheURhdGEuZmlsZW5hbWUgPSBtb2RlbC52dHNNb2RlbE5hbWUucmVwbGFjZSgvXFwudnR1YmVcXC5qc29uJC9pLCAnLm1vZGVsMy5qc29uJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucmVsYXlEYXRhLnBhcmFtZXRlcnMgPSAoYXdhaXQgbW9kZWwubGl2ZTJEUGFyYW1ldGVycygpKS5tYXAoKHBhcmFtKT0+e1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge25hbWU6IHBhcmFtLm5hbWUsIHZhbHVlOiBwYXJhbS52YWx1ZX07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldFRpbWVvdXQocmVmcmVzaERhdGEsIDEwKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgICAgIGlmKHRoaXMud2Vic29ja2V0KXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9tcHRFcnJvcihcIkxvc3QgY29ubmVjdGlvbiB0byBWdHViZSBTdHVkaW8uXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRUaW1lb3V0KHJlZnJlc2hEYXRhLCAxMCk7XG4gICAgICAgIHRoaXMubG9nKCdQbHVnaW4gYXV0aGVudGljYXRlZC4nKVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBzZXR1cEV4cHJlc3Moc2V0dGluZ3M6IEJyb2FkY2FzdGVyU2V0dGluZ3Mpe1xuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKCcvbW9kZWxzLzptb2RlbElkJywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgICAgICBsZXQgaWQgPSByZXEucGFyYW1zLm1vZGVsSWQ7XG4gICAgICAgICAgICBpZih0aGlzLmxvYWRlZE1vZGVscy5oYXNPd25Qcm9wZXJ0eShpZCkpe1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYWRlZE1vZGVsc1tpZF0ocmVxLCByZXMsIG5leHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5leHByZXNzLndzKCcvcGFyYW1ldGVycycsICh3cyk9PntcbiAgICAgICAgICAgIHdzLm9uKCdtZXNzYWdlJywgKG1zZyk9PntcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG1zZyl7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3F1ZXJ5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IG1zZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLnJlbGF5RGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UncGluZyc6XG4gICAgICAgICAgICAgICAgICAgICAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBtc2csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogJ3BvbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHdzLnNlbmQoJ251bGwnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5leHByZXNzLnVzZSgnLycsIEV4cHJlc3Muc3RhdGljKHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9yZXMvd2ViJykpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc3RhcnRFeHByZXNzKGhvc3Q6IHN0cmluZywgcG9ydDogbnVtYmVyKTogUHJvbWlzZTxTZXJ2ZXI+e1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcyxyZWopPT57XG4gICAgICAgICAgICBsZXQgZXJyID0gKCk9PntcbiAgICAgICAgICAgICAgICByZWooXCJGYWlsZWQgdG8gc3RhcnQgd2Vic2VydmVyLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBzZXJ2ZXIgPSB0aGlzLmV4cHJlc3MubGlzdGVuKHBvcnQsIGhvc3QsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgc2VydmVyLm9mZignZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgICAgIHJlcyhzZXJ2ZXIpO1xuICAgICAgICAgICAgfSkub25jZSgnZXJyb3InLCBlcnIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgc2V0dXBNb2RlbChtb2RlbDoge2lkOiBzdHJpbmcsIHZ0c01vZGVsTmFtZTogc3RyaW5nfSl7XG4gICAgICAgIGlmKHRoaXMubG9hZGVkTW9kZWxzLmhhc093blByb3BlcnR5KG1vZGVsLmlkKSl7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlcyA9IGZzLnJlYWRkaXJTeW5jKHRoaXMubW9kZWxQYXRoKS5zb21lKChkaXIpPT57XG4gICAgICAgICAgICBsZXQgdnRzX2ZpbGUgPSBwYXRoLmpvaW4odGhpcy5tb2RlbFBhdGgsIGRpciwgbW9kZWwudnRzTW9kZWxOYW1lKTtcbiAgICAgICAgICAgIGlmKGZzLmV4aXN0c1N5bmModnRzX2ZpbGUpKXtcbiAgICAgICAgICAgICAgICBsZXQgYnVmZiA9IGZzLnJlYWRGaWxlU3luYyh2dHNfZmlsZSkudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoYnVmZik7XG4gICAgICAgICAgICAgICAgICAgIGlmKCFkYXRhLmhhc093blByb3BlcnR5KCdNb2RlbElEJykpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdGFbJ01vZGVsSUQnXSAhPT0gbW9kZWwuaWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGVkTW9kZWxzW21vZGVsLmlkXSA9IEV4cHJlc3Muc3RhdGljKHBhdGguam9pbih0aGlzLm1vZGVsUGF0aCwgZGlyKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYoIXJlcykge1xuICAgICAgICAgICAgdGhpcy5wcm9tcHRFcnJvcihgQ2Fubm90IGZpbmQgbW9kZWwgcGF0aCBvZiAke21vZGVsLnZ0c01vZGVsTmFtZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
