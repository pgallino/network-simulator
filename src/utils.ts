import { Graphics, Texture, Assets } from 'pixi.js';

// Crea un círculo rojo para representar un router
export function createCircle(x: number, y: number, color: number = 0xff0000, radius: number = 10): Graphics {
    const circle = new Graphics();
    circle.fill(color);
    circle.circle(0, 0, radius);
    circle.x = x;
    circle.y = y;
    return circle;
}

// Carga una textura de imagen y devuelve una promesa
export async function loadTexture(url: string): Promise<Texture> {
    return await Assets.load(url);
}
