import { FederatedPointerEvent, Graphics, Sprite } from "pixi.js";
import { drawConnection, getMode, updateConnections } from "./utils";
import { GraphNode, NetworkGraph, RouterNode } from "./networkgraph";

// Extiende Sprite para incluir la propiedad personalizada "dragging"
interface DraggableSprite extends Sprite {
    dragging: boolean;
}

let firstNode: GraphNode | null = null;

function showRouterInfo(routerNode: RouterNode) {
    let infoContent = document.getElementById("info-content");
    if (infoContent) {
        // Convertir `connectedTo` de `Set` a `Array` para usar `join` y verificar el tamaño
        const connectionsArray = Array.from(routerNode.connectedTo);
        const connectionsList = connectionsArray.length > 0 
            ? connectionsArray.join(", ")
            : "No connections";
        // Redondeo a 2 decimales en la interpolación de texto
        infoContent.innerHTML = `
            <h3>Router Information</h3>
            <p>Router ID: ${routerNode.id}</p>
            <p>Location: (${routerNode.x.toFixed(2)}, ${routerNode.y.toFixed(2)})</p>
            <p>Status: ${routerNode.status}</p>
            <p>Connections: ${routerNode.connections}</p>
            <p>Connected to: [${connectionsList}]</p>
        `;

    }

    // También puedes imprimir los valores redondeados en la consola para verificar
    console.log(
        `Router ID: ${routerNode.id}, Location: (${routerNode.x.toFixed(2)}, ${routerNode.y.toFixed(2)}), Status: ${routerNode.status}, Connections: ${routerNode.connections}, Connected to: ${routerNode.connectedTo}`
    );
}

export function handleRouterClick(e: MouseEvent, router: RouterNode, connectionLayer: Graphics, networkGraph: NetworkGraph) {
    console.log("clicked on router", e);
    if (getMode() === "connection") {
        if (!firstNode) {
            // Si no hay un primer router seleccionado, almacena el actual
            firstNode = router;
            // showRouterInfo(firstNode)
        } else {
            // Verifica si los routers son distintos antes de intentar conectar
            if (firstNode.id !== router.id) {
                // Dibuja una línea entre firstNode y el router actual
                drawConnection(connectionLayer, firstNode, router);
                // Añadir la arista al grafo
                networkGraph.addEdge(firstNode.id, router.id)
                console.log("Estado de las conexiones en el grafo:", networkGraph);
                showRouterInfo(router)
                firstNode = null;
            } else {
                console.log("Los nodos son el mismo, no se crea una conexión.");
            }
        }
    } else if (getMode() === "navigate") {
        showRouterInfo(router);
    }
}


export function handlePointerDown(sprite: DraggableSprite) {
    return (event: FederatedPointerEvent) => {
        if (getMode() === "navigate") {
            sprite.alpha = 0.5; // Cambia la opacidad durante el arrastre
            sprite.dragging = true;
        }
    };
}

export function handlePointerUp(sprite: DraggableSprite, connectionLayer: Graphics) {
    return () => {
        sprite.alpha = 1; // Restaura la opacidad
        sprite.dragging = false;

        // Llama a updateConnections al soltar el sprite
        // updateConnections(connectionLayer);
    };
}

export function handlePointerUpOutside(sprite: DraggableSprite, connectionLayer: Graphics) {
    return () => {
        sprite.alpha = 1;
        sprite.dragging = false;

        // Actualizar las líneas de conexión
        // updateConnections(connectionLayer);
    };
}

export function handlePointerMove(sprite: DraggableSprite, routerNode: RouterNode, connectionLayer: Graphics, networkGraph: NetworkGraph) {
    return (event: FederatedPointerEvent) => {
        if (getMode() === "navigate" && sprite.dragging) {
            const newPosition = event.global;
            sprite.x = newPosition.x;
            sprite.y = newPosition.y;
            
            // Actualizar la posición en routerNode
            routerNode.x = sprite.x;
            routerNode.y = sprite.y;

            updateConnections(connectionLayer, networkGraph);
        }
    };
}