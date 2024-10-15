import { Application, Sprite, Assets, Graphics, GraphicsContext, FederatedPointerEvent, Texture } from 'pixi.js';
import RouterSvg from './assets/router.svg';
import ConnectionSvg from './assets/connection.svg';
import Click from './assets/click.svg'
import PC from './assets/computer.svg'
import './style.css';
import { setMode, getMode } from './utils';
import { clickHandler } from './canvaManager';
import { saveGraph, loadGraph } from './canvaManager';


export function clearNodeLayer(): void {

}
(async () => {


    const canvas = document.getElementById("canvas");
    const infoContent = document.getElementById("info-content");
    const layerSelect = document.getElementById("layer-select") as HTMLSelectElement | null;

    if (infoContent) {
        infoContent.innerHTML = "<p>No node selected</p>"; // Muestra un estado inicial
    }


    // PIXI.js setup
    const app = new Application();

    await app.init();

    canvas.replaceWith(app.canvas);
    app.canvas.style.float = "left";


    const nodeLayer = new Graphics();
    app.stage.addChild(nodeLayer);

    // Crear la capa de conexiones (connectionLayer)
    const connectionLayer = new Graphics();
    app.stage.addChild(connectionLayer);

    // Crear la capa de routers (nodeLayer)

    // Ajustar el tamaño de las capas en función del tamaño de la aplicación
    const resizeNodeLayer = () => {
        nodeLayer.clear();
        nodeLayer.rect(0, 0, app.renderer.width, app.renderer.height)
        nodeLayer.fill(0xe3e2e1);
    };

    resizeNodeLayer();

    // AÑADIR ROUTER
    nodeLayer.on('click', (e) => {
        clickHandler(nodeLayer, connectionLayer, e.globalX, e.globalY);
    });


    nodeLayer.eventMode = 'static';

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


    // ================================================ BOTONES DE SELECCION DE MODO =================================================

    // BOTONES DE SELECCIÓN DE MODO

    // Asignar imágenes dinámicamente a los botones
    const navigateButtonImg = document.getElementById("navigate-button-img") as HTMLImageElement;
    const routerButtonImg = document.getElementById("router-button-img") as HTMLImageElement;
    const pcButtonImg = document.getElementById("pc-button-img") as HTMLImageElement;
    const connectionButtonImg = document.getElementById("connection-button-img") as HTMLImageElement;

    if (navigateButtonImg) navigateButtonImg.src = Click;
    if (routerButtonImg) routerButtonImg.src = RouterSvg;
    if (pcButtonImg) pcButtonImg.src = PC;
    if (connectionButtonImg) connectionButtonImg.src = ConnectionSvg;
    
    const navigateButton = document.getElementById("navigate-button");
    const routerButton = document.getElementById("router-button");
    const connectionButton = document.getElementById("connection-button");
    const pcButton = document.getElementById("pc-button");
    
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

    if (pcButton) {
        pcButton.onclick = () => {
            setMode("pc");
            console.log("Modo: PC");
        };
    }
    
    if (connectionButton) {
        connectionButton.onclick = () => {
            setMode("connection");
            console.log("Modo: Conexión");
        };
    }

    // ================================================ BOTONES DE GUARDADO Y CARGADO =================================================

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
            const jsonData = readerEvent.target.result as string;
            if (infoContent) {
                infoContent.innerHTML = "<p>No node selected</p>"; // Muestra un estado inicial
            }
            loadGraph(jsonData, nodeLayer, connectionLayer, app.renderer.width, app.renderer.height);
        };
    };
    

    save_Button.onclick = () => {
        saveGraph();
    };

})();