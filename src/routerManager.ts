import { Graphics, Sprite } from "pixi.js";
import { drawConnection, getMode} from "./utils";
import { GraphNode, NetworkGraph, RouterNode } from "./networkgraph";

// Extiende Sprite para incluir la propiedad personalizada "dragging"
interface DraggableSprite extends Sprite {
    dragging: boolean;
}

export function showRouterInfo(routerNode: GraphNode) {
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
