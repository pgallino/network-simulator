import { Graphics, Sprite } from "pixi.js";
import { drawConnection, getMode} from "./utils";
import { GraphNode, NetworkGraph, PCNode } from "./networkgraph";

// Extiende Sprite para incluir la propiedad personalizada "dragging"
interface DraggableSprite extends Sprite {
    dragging: boolean;
}

export function showPCInfo(pcNode: GraphNode) {
    let infoContent = document.getElementById("info-content");
    if (infoContent) {
        // Convertir `connectedTo` de `Set` a `Array` para usar `join` y verificar el tamaño
        const connectionsArray = Array.from(pcNode.connectedTo);
        const connectionsList = connectionsArray.length > 0 
            ? connectionsArray.join(", ")
            : "No connections";
        // Redondeo a 2 decimales en la interpolación de texto
        infoContent.innerHTML = `
            <h3>PC Information</h3>
            <p>PC ID: ${pcNode.id}</p>
            <p>Location: (${pcNode.x.toFixed(2)}, ${pcNode.y.toFixed(2)})</p>
            <p>Status: ${pcNode.status}</p>
            <p>Connections: ${pcNode.connections}</p>
            <p>Connected to: [${connectionsList}]</p>
        `;

    }

    // También puedes imprimir los valores redondeados en la consola para verificar
    console.log(
        `PC ID: ${pcNode.id}, Location: (${pcNode.x.toFixed(2)}, ${pcNode.y.toFixed(2)}), Status: ${pcNode.status}, Connections: ${pcNode.connections}, Connected to: ${pcNode.connectedTo}`
    );
}
