// routerManager.ts
import { Graphics, Sprite, Texture, FederatedPointerEvent } from 'pixi.js';
import { getMode, setMode } from './utils';
import routerImage from './assets/router.svg';  // Cambia a la extensión de la imagen que necesitas (png o svg)

// Extiende Sprite para incluir la propiedad personalizada "dragging"
interface DraggableSprite extends Sprite {
    dragging: boolean;
}

export interface RouterInfo {
    id: number;
    x: number;
    y: number;
    status: string;
    connections: number;
    connectedTo: number[]; // Agrega para almacenar los IDs de routers conectados
}

export let routers: RouterInfo[] = [];
let firstRouter: RouterInfo | null = null;
const MIN_DISTANCE = 60; // Distancia mínima permitida entre routers

// Función para verificar si el nuevo router está cerca de algún router existente
function isNearExistingRouter(x: number, y: number): boolean {
    return routers.some(router => {
        const dx = router.x - x;
        const dy = router.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < MIN_DISTANCE;
    });
}

export function addRouter(routerLayer: Graphics, connectionLayer: Graphics, x: number, y: number): RouterInfo | null {
    if (isNearExistingRouter(x, y)) {
        console.log("La posición está demasiado cerca de otro router.");
        return null;
    }

    // Crear la estructura del router
    let routerInfo: RouterInfo = {
        id: routers.length + 1,
        x: x,
        y: y,
        status: 'active',
        connections: 0,
        connectedTo: []
    };

    // Añadir el router a la lista
    routers.push(routerInfo);

    // Configurar el sprite de imagen de router
    const img = new Image();
    img.src = routerImage;

    img.onload = () => {
        const routerTexture = Texture.from(img);
        const sprite = new Sprite(routerTexture) as DraggableSprite;
        sprite.width = 40;
        sprite.height = 40;
        sprite.anchor.set(0.5, 0.5);
        sprite.x = x;
        sprite.y = y;

        routerLayer.addChild(sprite);
        sprite.eventMode = 'static';
        sprite.interactive = true;
        sprite.dragging = false;

        sprite.on('click', (e) => handleRouterClick(e, routerInfo, routerLayer, connectionLayer));
        sprite.on('pointerdown', handlePointerDown(sprite));
        sprite.on('pointerup', handlePointerUp(sprite, connectionLayer));
        sprite.on('pointerupoutside', handlePointerUpOutside(sprite, connectionLayer));
        sprite.on('pointermove', handlePointerMove(sprite, routerInfo, connectionLayer));
    };

    img.onerror = () => {
        console.error("No se pudo cargar la imagen del router.");
    };

    return routerInfo;
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

function handleRouterClick(e: MouseEvent, router: RouterInfo, routerLayer: Graphics, connectionLayer: Graphics) {
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
                drawConnection(connectionLayer, firstRouter, router);
                // Incrementar el número de conexiones en ambos routers
                firstRouter.connections += 1;
                router.connections += 1;
                firstRouter.connectedTo.push(router.id); // Guarda la conexión
                router.connectedTo.push(firstRouter.id);
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


export function drawConnection(layer: Graphics, router1: RouterInfo, router2: RouterInfo) {

    // Calcular el ángulo entre los dos routers
    const dx = router2.x - router1.x;
    const dy = router2.y - router1.y;
    const angle = Math.atan2(dy, dx);

    // Ajustar el punto de inicio y fin para que estén en el borde del ícono
    const offsetX = (40 / 2) * Math.cos(angle); // Ajuste usando la mitad del ancho del ícono
    const offsetY = (40 / 2) * Math.sin(angle); // Ajuste usando la mitad del alto del ícono

    // Dibuja la línea desde el borde del ícono
    
    layer.moveTo(router1.x + offsetX, router1.y + offsetY);
    layer.lineTo(router2.x - offsetX, router2.y - offsetY);
    layer.stroke({ width: 2, color:  0x800000 });

}

export function saveRouters() {
    const data = JSON.stringify(routers);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "routers.json";
    a.click();
    URL.revokeObjectURL(url);
}

export function loadRouters(data: string | null, routerLayer: Graphics, connectionLayer: Graphics) {
    // Verifica si los datos existen y no están vacíos
    if (!data) {
        console.warn("No se cargaron datos; archivo vacío o carga cancelada.");
        return;
    }

    let loadedRouters: RouterInfo[];

    // Intenta parsear los datos y manejar errores si no es JSON válido
    try {
        loadedRouters = JSON.parse(data);
    } catch (error) {
        console.error("Error al parsear los datos del archivo:", error);
        return;
    }

    // Procesa cada router en los datos cargados
    loadedRouters.forEach(routerInfo => {
        setMode("router");
        const router = addRouter(routerLayer, connectionLayer, routerInfo.x, routerInfo.y);

        // Solo si `router` es válido, redibuja las conexiones
        if (router) {
            routerInfo.connectedTo.forEach(connectedId => {
                const targetRouter = loadedRouters.find(r => r.id === connectedId);
                if (targetRouter) {
                    setMode("connection");
                    drawConnection(connectionLayer, routerInfo, targetRouter);
                    router.connections += 1;
                    router.connectedTo.push(targetRouter.id);
                }
            });
        }
    });

    setMode("navigate");
}


function updateConnections(connectionLayer: Graphics) {
    // Eliminar todas las conexiones actuales
    connectionLayer.clear();

    // Redibujar las conexiones para cada router en `routers`
    routers.forEach(router => {
        router.connectedTo.forEach(connectedId => {
            const targetRouter = routers.find(r => r.id === connectedId);
            if (targetRouter) {
                drawConnection(connectionLayer, router, targetRouter);
            }
        });
    });
}


function handlePointerDown(sprite: DraggableSprite) {
    return (event: FederatedPointerEvent) => {
        if (getMode() === "navigate") {
            sprite.alpha = 0.8; // Cambia la opacidad durante el arrastre
            sprite.dragging = true;
        }
    };
}

function handlePointerUp(sprite: DraggableSprite, connectionLayer: Graphics) {
    return () => {
        sprite.alpha = 1; // Restaura la opacidad
        sprite.dragging = false;

        // Llama a updateConnections al soltar el sprite
        // updateConnections(connectionLayer);
    };
}

function handlePointerUpOutside(sprite: DraggableSprite, connectionLayer: Graphics) {
    return () => {
        sprite.alpha = 1;
        sprite.dragging = false;

        // Actualizar las líneas de conexión
        // updateConnections(connectionLayer);
    };
}

function handlePointerMove(sprite: DraggableSprite, routerInfo: RouterInfo, connectionLayer: Graphics) {
    return (event: FederatedPointerEvent) => {
        if (getMode() === "navigate" && sprite.dragging) {
            const newPosition = event.global;
            sprite.x = newPosition.x;
            sprite.y = newPosition.y;
            
            // Actualizar la posición en routerInfo
            routerInfo.x = sprite.x;
            routerInfo.y = sprite.y;

            updateConnections(connectionLayer);
        }
    };
}