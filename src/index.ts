import { Application, Sprite, Assets, Graphics, GraphicsContext, FederatedPointerEvent } from 'pixi.js';
import Bunny from './bunny.png';
import RouterSvg from './router.svg';
import ConnectionSvg from './connection.svg';
import './style.css';


// IIFE to avoid errors
(async () => {
    const leftBarWidth = 50;
    // const topBar = document.getElementById("top-bar");
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
    leftBar.style.width = `${leftBarWidth}px`;

    const routerButton = document.createElement("button");
    leftBar.appendChild(routerButton);

    const routerImg = document.createElement("img");
    routerImg.src = RouterSvg;
    routerImg.style.minWidth = "32px";
    routerImg.style.height = "32px";
    routerButton.appendChild(routerImg);

    const connectionButton = document.createElement("button");
    leftBar.appendChild(connectionButton);

    const connectionImg = document.createElement("img");
    connectionImg.src = ConnectionSvg;
    connectionImg.style.minWidth = "32px";
    connectionImg.style.height = "32px";
    connectionButton.appendChild(connectionImg);

    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new Application();

    // Wait for the Renderer to be available
    await app.init();

    // The application will create a canvas element for you that you
    // can then insert into the DOM
    canvas.replaceWith(app.canvas);
    app.canvas.style.float = "left";

    await Assets.load(Bunny);

    const bunny = Sprite.from(Bunny);

    const resizeBunny = () => {
        // Setup the position of the bunny
        bunny.x = app.renderer.width / 5;
        bunny.y = app.renderer.height / 5;
        bunny.width = app.renderer.width / 5;
        bunny.height = app.renderer.height / 5;
    }

    resizeBunny();

    // Rotate around the center
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    let rect = new Graphics()
        .rect(0, 0, app.renderer.width, app.renderer.height)
        .fill(0xe3e2e1);

    const resizeRect = () => {
        rect.width = app.renderer.width;
        rect.height = app.renderer.height;
    }

    // Add the objects to the scene we are building
    app.stage.addChild(rect);
    app.stage.addChild(bunny);

    const circleContext = new GraphicsContext().circle(0, 0, 10).fill(0xff0000);

    let lineStart: { x: number, y: number } = null;

    const circleOnClick = (e: FederatedPointerEvent, circle: Graphics) => {
        console.log("clicked on circle", e);
        if (!e.altKey) {
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

    rect.on('click', (e) => {
        console.log("clicked on rect", e);
        if (!e.altKey) {
            const circle = new Graphics(circleContext);
            circle.x = e.globalX;
            circle.y = e.globalY;
            rect.addChild(circle);
            circle.on('click', (e) => circleOnClick(e, circle));
            circle.eventMode = 'static';
        }
    });

    rect.eventMode = 'static';

    // Listen for frame updates
    app.ticker.add(() => {
        // each frame we spin the bunny around a bit
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

        console.log(file);
        // setting up the reader
        const reader = new FileReader();
        reader.readAsDataURL(file); // this is reading as data url

        // here we tell the reader what to do when it's done reading...
        reader.onload = async (readerEvent) => {
            fileContent = readerEvent.target.result; // this is the content!
            const txt = await Assets.load(fileContent);
            bunny.texture = txt;
        }
    }
})();
