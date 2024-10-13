import { Graphics, FederatedPointerEvent } from 'pixi.js';
import { createCircle } from './utils';

let routers = [];
let lineStart: { x: number, y: number } | null = null;

// Agrega un nuevo router en una posición específica
export function addRouter(x: number, y: number, container: Graphics) {
    const routerInfo = {
        id: routers.length + 1,
        x,
        y,
        status: 'active',
        connections: Math.floor(Math.random() * 10),
    };

    const circle = createCircle(x, y);
    circle.on('click', () => showRouterInfo(routerInfo));
    routers.push(routerInfo);
    container.addChild(circle);
}

// Crea una conexión entre dos routers
export function handleConnection(e: FederatedPointerEvent, circle: Graphics, container: Graphics) {
    e.stopPropagation();
    if (lineStart === null) {
        lineStart = { x: circle.x, y: circle.y };
    } else {
        const line = new Graphics();
        line.lineStyle(2, 0x000000);
        line.moveTo(lineStart.x, lineStart.y);
        line.lineTo(circle.x, circle.y);
        container.addChild(line);
        lineStart = null;
    }
}

// Muestra información del router en el panel derecho
function showRouterInfo(routerInfo: any) {
    const infoContent = document.getElementById("info-content");
    if (infoContent) {
        infoContent.innerHTML = `
            <h3>Router Information</h3>
            <p>Router ID: ${routerInfo.id}</p>
            <p>Location: (${routerInfo.x}, ${routerInfo.y})</p>
            <p>Status: ${routerInfo.status}</p>
            <p>Connections: ${routerInfo.connections}</p>
        `;
    }
}
