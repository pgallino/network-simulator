import { Application, Sprite, Assets, Graphics, GraphicsContext, FederatedPointerEvent, Texture } from 'pixi.js';
import Bunny from './assets/bunny.png';
import RouterSvg from './assets/router.svg';
import ConnectionSvg from './assets/connection.svg';
import Click from './assets/click.png'
import './style.css';
import { setMode, getMode } from './utils';
import { addRouter, saveRouters, loadRouters } from './routerManager';

(async () => {

    const load_button = document.getElementById("load-button");
    const save_Button = document.getElementById("save-button");


    const input = document.createElement('input');
    input.type = 'file';

    load_button.onclick = () => {
        input.click();
    };

    input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.readAsText(file); // Cambia a readAsText para archivos JSON de texto
    
        reader.onload = (readerEvent) => {
            const data = readerEvent.target.result as string;
            loadRouters(data, rect);
        };
    };
    

    save_Button.onclick = () => {
        saveRouters();
    };

    const leftBar = document.getElementById("left-bar");
    const canvas = document.getElementById("canvas");
    const infoContent = document.getElementById("info-content");
    const layerSelect = document.getElementById("layer-select") as HTMLSelectElement | null;

    // BOTONES DE SELECCIÓN DE MODO

    // Asignar imágenes dinámicamente a los botones
    const navigateButtonImg = document.getElementById("navigate-button-img") as HTMLImageElement;
    const routerButtonImg = document.getElementById("router-button-img") as HTMLImageElement;
    const connectionButtonImg = document.getElementById("connection-button-img") as HTMLImageElement;

    if (navigateButtonImg) navigateButtonImg.src = Click;
    if (routerButtonImg) routerButtonImg.src = RouterSvg;
    if (connectionButtonImg) connectionButtonImg.src = ConnectionSvg;
    
    const navigateButton = document.getElementById("navigate-button");
    const routerButton = document.getElementById("router-button");
    const connectionButton = document.getElementById("connection-button");


    // PIXI.js setup
    const app = new Application();

    await app.init();

    canvas.replaceWith(app.canvas);
    app.canvas.style.float = "left";

    let rect = new Graphics()
        .rect(0, 0, app.renderer.width, app.renderer.height)
        .fill(0xe3e2e1);

    const resizeRect = () => {
        rect.width = app.renderer.width;
        rect.height = app.renderer.height;
    }

    app.stage.addChild(rect);

    // AÑADIR ROUTER
    rect.on('click', (e) => {
        if (getMode() === "router") {
            addRouter(rect, e.globalX, e.globalY);
        }
    });


    rect.eventMode = 'static';

    if (layerSelect) {
        layerSelect.addEventListener('change', (e) => {
            const selectedLayer = (e.target as HTMLSelectElement).value;
            if (infoContent) {
                infoContent.innerHTML = `
                    <h3>Información de la Capa</h3>
                    <p>Estás viendo la: ${selectedLayer}</p>
                `;
            }
        });
    }


    // BOTONES DE SELECCIÓN DE MODO
    if (navigateButton) {
        navigateButton.onclick = () => {
            setMode("navigate");
            console.log("Modo: Navegar");
        };
    }
    
    if (routerButton) {
        routerButton.onclick = () => {
            setMode("router");
            console.log("Modo: Router");
        };
    }
    
    if (connectionButton) {
        connectionButton.onclick = () => {
            setMode("connection");
            console.log("Modo: Conexión");
        };
    }

})();