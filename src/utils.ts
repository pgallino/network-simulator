import { Graphics } from "pixi.js";
import { GraphNode, NetworkGraph } from "./networkgraph";

// modeManager.js
export type Mode = "navigate" | "router" | "pc" | "connection";

export let mode: Mode = "navigate"; // El modo por defecto será "navegar"

export function setMode(newMode: Mode) {
    mode = newMode;
    console.log(`Modo: ${newMode}`);
}

export function getMode() {
    return mode;
}

export function drawConnection(layer: Graphics, node1: GraphNode, node2: GraphNode) {

    // Calcular el ángulo entre los dos routers
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    const angle = Math.atan2(dy, dx);

    // Ajustar el punto de inicio y fin para que estén en el borde del ícono
    const offsetX = (40 / 2) * Math.cos(angle); // Ajuste usando la mitad del ancho del ícono
    const offsetY = (40 / 2) * Math.sin(angle); // Ajuste usando la mitad del alto del ícono

    // Dibuja la línea desde el borde del ícono

    // Determinar el color de la conexión según los tipos de nodo
    let connectionColor;
    if (node1.type === 'pc' && node2.type === 'router' || node1.type === 'router' && node2.type === 'pc') {
        connectionColor = 0xFFA500; // Verde para conexiones entre pc y router
    } else if (node1.type === 'router' && node2.type === 'router') {
        connectionColor = 0x800000; // Bordo para conexiones entre routers
    } else if (node1.type === 'pc' && node2.type === 'pc') {
        connectionColor = 0x0000FF; // Azul para conexiones entre pcs
    } else {
        console.warn('Conexión desconocida entre tipos de nodo:', node1.type, node2.type);
        return;
    }
    
    layer.moveTo(node1.x + offsetX, node1.y + offsetY);
    layer.lineTo(node2.x - offsetX, node2.y - offsetY);
    layer.stroke({ width: 2, color:  connectionColor });

}

export function updateConnections(connectionLayer: Graphics, networkGraph: NetworkGraph): void {
    // Limpiar el `connectionLayer` antes de redibujar
    console.log("Limpieza de conexiones en connectionLayer...");
    connectionLayer.clear();

    // Obtener todos los nodos del grafo
    networkGraph.getNodes().forEach(node => {
        console.log(`Dibujando conexiones para el nodo ID: ${node.id} en (${node.x}, ${node.y})`);

        console.log(`EL NODO ESTA CONECTADO A: ${node.connectedTo}`);
        // Recorrer todas las conexiones de este nodo y dibujar la conexión
        networkGraph.getConnections(node.id).forEach(connectedId => {
            console.log(`Intentando dibujar conexión entre nodo ID: ${node.id} y nodo ID: ${connectedId}`);
            const targetNode = networkGraph.getNode(connectedId);
            
            if (targetNode) {
                console.log(`Dibujando conexión entre nodo ID: ${node.id} y nodo ID: ${connectedId}`);
                console.log(`Coordenadas nodo origen (${node.x}, ${node.y}), nodo destino (${targetNode.x}, ${targetNode.y})`);
                
                // Dibuja la conexión
                drawConnection(connectionLayer, node, targetNode);
            } else {
                console.warn(`No se encontró el nodo con ID: ${connectedId} para la conexión desde el nodo ID: ${node.id}`);
            }
        });
    });

    console.log("Finalizada la actualización de conexiones.");
}

export function clearNodeLayer(nodeLayer: Graphics, width: number, height: number): void {
    nodeLayer.clear();
    // Eliminar cada sprite hijo de `nodeLayer` si tiene sprites existentes
    while (nodeLayer.children.length > 0) {
        nodeLayer.removeChild(nodeLayer.children[0]);
    }
    nodeLayer.rect(0, 0, width, height)
    nodeLayer.fill(0xe3e2e1);
}