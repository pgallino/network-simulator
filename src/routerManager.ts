// routerManager.ts
import { FederatedPointerEvent, Graphics } from 'pixi.js';
import { getMode } from './utils';

export interface RouterInfo {
    id: number;
    x: number;
    y: number;
    status: string;
    connections: number;
}

export let routers: RouterInfo[] = [];
let firstRouter: RouterInfo | null = null;
const MIN_DISTANCE = 20; // Distancia mínima permitida entre routers

// Función para verificar si el nuevo router está cerca de algún router existente
function isNearExistingRouter(x: number, y: number): boolean {
    return routers.some(router => {
        const dx = router.x - x;
        const dy = router.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < MIN_DISTANCE;
    });
}

export function addRouter(rect: Graphics, x: number, y: number): void {

    if (isNearExistingRouter(x, y)) {
        console.log("La posición está demasiado cerca de otro router.");
        return; // Retorna
    }

    const circle = new Graphics().circle(0, 0, 10).fill(0xff0000);

    circle.x = x;
    circle.y = y;

    let routerInfo: RouterInfo = {
        id: routers.length + 1,
        x: circle.x,
        y: circle.y,
        status: 'active',
        connections: 0
    };

    routers.push(routerInfo);
    rect.addChild(circle);
    circle.eventMode = 'static';

    circle.on('click', (e) => handleRouterClick(e, routerInfo, rect));

}

export function showRouterInfo(routerInfo: RouterInfo) {
    let infoContent = document.getElementById("info-content");
    if (infoContent) {
        // Redondeo a 2 decimales en la interpolación de texto
        infoContent.innerHTML = `
            <h3>Router Information</h3>
            <p>Router ID: ${routerInfo.id}</p>
            <p>Location: (${routerInfo.x.toFixed(2)}, ${routerInfo.y.toFixed(2)})</p>
            <p>Status: ${routerInfo.status}</p>
            <p>Connections: ${routerInfo.connections}</p>
        `;

    }

    // También puedes imprimir los valores redondeados en la consola para verificar
    console.log(
        `Router ID: ${routerInfo.id}, Location: (${routerInfo.x.toFixed(2)}, ${routerInfo.y.toFixed(2)}), Status: ${routerInfo.status}, Connections: ${routerInfo.connections}`
    );
}

function handleRouterClick(e: MouseEvent, router: RouterInfo, rect: Graphics) {
    console.log("clicked on circle", e);
    if (getMode() === "connection") {
        if (!firstRouter) {
            // Si no hay un primer router seleccionado, almacena el actual
            firstRouter = router;
            showRouterInfo(firstRouter)
        } else {
            // Verifica si los routers son distintos antes de intentar conectar
            if (firstRouter.id !== router.id) {
                // Dibuja una línea entre firstRouter y el router actual
                drawConnection(rect, firstRouter, router);
                // Incrementar el número de conexiones en ambos routers
                firstRouter.connections += 1;
                router.connections += 1;
                showRouterInfo(router)
                firstRouter = null;
            } else {
                console.log("Los routers son el mismo, no se crea una conexión.");
            }
        }
    } else if (getMode() === "navigate") {
        showRouterInfo(router);
    }
}


export function drawConnection(rect: Graphics, router1: RouterInfo, router2: RouterInfo) {

    const line = new Graphics();
    line.moveTo(router1.x, router1.y);
    line.lineTo(router2.x, router2.y);
    line.stroke({ width: 2, color: 0 });
    rect.addChildAt(line, 0);
    
}


