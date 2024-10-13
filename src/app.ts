import { Application, Sprite, Graphics } from 'pixi.js';
import Bunny from '../public/assets/bunny.png';
import { loadTexture } from './utils';

// Configura la aplicación PIXI y el canvas
export async function setupApp() {
    const app = new Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0xe3e2e1, // Fija el color de fondo en las opciones de Application
    });
    document.getElementById("canvas")?.replaceWith(app.view);

    // Fondo y configuración del canvas
    const background = new Graphics();
    background.rect(0, 0, app.renderer.width, app.renderer.height);
    app.stage.addChild(background);

    // Bunny (Conejo)
    const bunnyTexture = await loadTexture(Bunny);
    const bunny = new Sprite(bunnyTexture);
    bunny.anchor.set(0.5);
    bunny.x = app.renderer.width / 2;
    bunny.y = app.renderer.height / 2;
    app.stage.addChild(bunny);

    return { app, bunny, background };
}

// Redimensiona la aplicación cuando la ventana cambia de tamaño
export function resizeApp(app: Application) {
    app.renderer.resize(window.innerWidth, window.innerHeight);
}
