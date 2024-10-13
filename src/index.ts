import { Application, Sprite, Assets, Graphics, GraphicsContext, FederatedPointerEvent, Texture } from 'pixi.js';
import Bunny from './bunny.png';
import RouterSvg from './router.svg';
import ConnectionSvg from './connection.svg';
import Click from './click.png'
import './style.css';

(async () => {
    let mode = "navigate"; // El modo por defecto será "navegar"
    const leftBarWidth = 50;
    const button = document.getElementById("open-file-button");
    let fileContent = null;

    const input = document.createElement('input');
    input.type = 'file';

    button.onclick = () => {
        input.click();
    }

    const bottomScreen = document.getElementById("bottom-screen");
    const leftBar = document.getElementById("left-bar");
    const canvas = document.getElementById("canvas");
    const infoContent = document.getElementById("info-content");
    const layerSelect = document.getElementById("layer-select") as HTMLSelectElement | null;
    leftBar.style.width = `${leftBarWidth}px`;

    // Asignar imágenes dinámicamente a los botones
    const navigateButtonImg = document.getElementById("navigate-button-img") as HTMLImageElement;
    const routerButtonImg = document.getElementById("router-button-img") as HTMLImageElement;
    const connectionButtonImg = document.getElementById("connection-button-img") as HTMLImageElement;

    if (navigateButtonImg) navigateButtonImg.src = Click;
    if (routerButtonImg) routerButtonImg.src = RouterSvg;
    if (connectionButtonImg) connectionButtonImg.src = ConnectionSvg;

    // PIXI.js setup
    const app = new Application();

    await app.init();

    canvas.replaceWith(app.canvas);
    app.canvas.style.float = "left";

    await Assets.load(Bunny);
    const bunny = Sprite.from(Bunny);

    const resizeBunny = () => {
        bunny.x = app.renderer.width / 5;
        bunny.y = app.renderer.height / 5;
        bunny.width = app.renderer.width / 5;
        bunny.height = app.renderer.height / 5;
    }

    resizeBunny();

    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    let rect = new Graphics()
        .rect(0, 0, app.renderer.width, app.renderer.height)
        .fill(0xe3e2e1);

    const resizeRect = () => {
        rect.width = app.renderer.width;
        rect.height = app.renderer.height;
    }

    app.stage.addChild(rect);
    app.stage.addChild(bunny);

    // Evento de clic en el conejo
    bunny.eventMode = 'static';
    bunny.on('click', () => {
        if (infoContent) {
            infoContent.innerHTML = `
                <h3>Bunny Information</h3>
                <p>Este es un adorable conejo blanco. Es conocido por ser un animal muy tranquilo, amigable, y su pelaje es muy suave.</p>
            `;
        }
    });

    let routers = [];

    const circleContext = new GraphicsContext().circle(0, 0, 10).fill(0xff0000);

    let lineStart: { x: number, y: number } = null;

    const circleOnClick = (e: FederatedPointerEvent, circle: Graphics) => {
        console.log("clicked on circle", e);
        if (mode != "connection") {
            return;
        }
        e.stopPropagation();
        if (lineStart === null) {
            lineStart = { x: circle.x, y: circle.y };
        } else {
            const line = new Graphics()
                .moveTo(lineStart.x, lineStart.y)
                .lineTo(circle.x, circle.y)
                .stroke({ width: 2, color: 0 });
            rect.addChildAt(line, 0);
            lineStart = null;
        }
    };

    const showRouterInfo = (routerInfo: { id: any; x: any; y: any; status: any; connections: any; }) => {
        if (infoContent) {
            infoContent.innerHTML = `
                <h3>Router Information</h3>
                <p>Router ID: ${routerInfo.id}</p>
                <p>Location: (${routerInfo.x}, ${routerInfo.y})</p>
                <p>Status: ${routerInfo.status}</p>
                <p>Connections: ${routerInfo.connections}</p>
            `;
        }
    };

    rect.on('click', (e) => {
        if (mode != "router") return;
        if (!e.altKey) {
            const circle = new Graphics(circleContext);
            circle.x = e.globalX;
            circle.y = e.globalY;

            const routerInfo = {
                id: routers.length + 1,
                x: circle.x,
                y: circle.y,
                status: 'active',
                connections: Math.floor(Math.random() * 10)
            };

            routers.push(routerInfo);
            rect.addChild(circle);
            circle.on('click', () => showRouterInfo(routerInfo));
            circle.eventMode = 'static';
        }
    });

    rect.eventMode = 'static';

    app.ticker.add(() => {
        bunny.rotation += 0.005;
    });

    function resize() {
        app.renderer.resize(canvas.clientWidth, canvas.clientHeight);
        resizeBunny();
        resizeRect();
    }

    window.addEventListener('resize', resize);

    input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async (readerEvent) => {
            fileContent = readerEvent.target.result as string;
            const txt = await Assets.load(fileContent);
            bunny.texture = txt;
        }
    }

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

    if (navigateButtonImg) {
        navigateButtonImg.onclick = () => {
            mode = "navigate";
            console.log("Modo: Navegar");
        };
    }
    
    if (routerButtonImg) {
        routerButtonImg.onclick = () => {
            mode = "router";
            console.log("Modo: Router");
        };
    }
    
    if (connectionButtonImg) {
        connectionButtonImg.onclick = () => {
            mode = "connection";
            console.log("Modo: Conexión");
        };
    }

})();