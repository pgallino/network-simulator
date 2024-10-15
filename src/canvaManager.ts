
import { NetworkGraph, RouterNode} from './networkgraph';
import { Graphics, Sprite, Texture, FederatedPointerEvent } from 'pixi.js';
import { clearNodeLayer, drawConnection, getMode } from './utils';
import routerImage from './assets/router.svg';
import { handlePointerDown, handlePointerMove, handlePointerUp, handlePointerUpOutside, handleRouterClick } from './routerManager';

// Extiende Sprite para incluir la propiedad personalizada "dragging"
interface DraggableSprite extends Sprite {
    dragging: boolean;
}

const networkGraph = new NetworkGraph()

let routerTexture: Texture | null = null;

export function clickHandler(nodeLayer: Graphics, connectionLayer: Graphics, x: number, y: number): void {
    let mode = getMode();

    if (mode === 'navigate') {
        return;
    }

    if (mode === 'router') {
        // Crear un nuevo RouterNode
        const newRouter: RouterNode = {
            id: networkGraph.getNodes().length + 1,  // Genera un ID único basado en la cantidad de nodos actuales
            x: x,
            y: y,
            status: 'active',  // Estado inicial del router
            connections: 0,
            connectedTo: new Set(),
            type: 'router'
        };

        // Agregar el RouterNode al grafo
        networkGraph.addNode(newRouter);
        createRouterSprite(newRouter, nodeLayer, connectionLayer, networkGraph)

        // Representación visual u otras operaciones adicionales si es necesario
        console.log(`Router añadido con ID ${newRouter.id} en la posición (${x}, ${y}).`);
    }
}

export function createRouterSprite(routerInfo: RouterNode, nodeLayer: Graphics, connectionLayer: Graphics, networkGraph: NetworkGraph): void {
    // Verificar si la textura ya fue cargada
    if (!routerTexture) {
        const img = new Image();
        img.src = routerImage;

        img.onload = () => {
            routerTexture = Texture.from(img);
            addRouterSprite(routerInfo, nodeLayer, connectionLayer, networkGraph);
        };

        img.onerror = () => {
            console.error("No se pudo cargar la imagen del router.");
        };
    } else {
        addRouterSprite(routerInfo, nodeLayer, connectionLayer, networkGraph);
    }
}

function addRouterSprite(routerInfo: RouterNode, nodeLayer: Graphics, connectionLayer: Graphics, networkGraph: NetworkGraph): void {
    // Crear el sprite solo si `routerTexture` está cargada
    if (routerTexture) {
        const sprite = new Sprite(routerTexture) as DraggableSprite;
        sprite.width = 40;
        sprite.height = 40;
        sprite.anchor.set(0.5, 0.5);
        sprite.x = routerInfo.x;
        sprite.y = routerInfo.y;

        nodeLayer.addChild(sprite);
        sprite.eventMode = 'static';
        sprite.interactive = true;
        sprite.dragging = false;

        // Configuración de eventos de interacción
        sprite.on('click', (e) => handleRouterClick(e, routerInfo, connectionLayer, networkGraph));
        sprite.on('pointerdown', handlePointerDown(sprite));
        sprite.on('pointerup', handlePointerUp(sprite, connectionLayer));
        sprite.on('pointerupoutside', handlePointerUpOutside(sprite, connectionLayer));
        sprite.on('pointermove', handlePointerMove(sprite, routerInfo, connectionLayer, networkGraph));
    } else {
        console.error("La textura del router no está disponible.");
    }
}

export function saveGraph() {
    const nodesData = networkGraph.getNodes().map(node => ({
        ...node,
        connectedTo: Array.from(node.connectedTo)  // Convertir `Set` a `Array` para serialización
    }));

    const data = JSON.stringify(nodesData, null, 2); // Convertir a JSON con formato legible
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "network_graph.json";
    a.click();
    URL.revokeObjectURL(url);
}

export function loadGraph(data: string, nodeLayer: Graphics, connectionLayer: Graphics, width: number, height: number) {
    let loadedNodes: RouterNode[];

    // Intenta parsear los datos y manejar errores si no es JSON válido
    try {
        loadedNodes = JSON.parse(data);
    } catch (error) {
        console.error("Error al parsear los datos del archivo:", error);
        return;
    }

    // Limpia el grafo actual
    networkGraph.clear()
    connectionLayer.clear(); // Limpiar conexiones actuales
    clearNodeLayer(nodeLayer, width, height)
    

    // Procesa cada nodo cargado
    loadedNodes.forEach(nodeData => {
        const { id, x, y, status, connections, connectedTo } = nodeData;
        
        // Crear un nuevo nodo y restaurar `connectedTo` como `Set`
        const newNode: RouterNode = {
            id,
            x,
            y,
            status,
            connections,
            connectedTo: new Set(connectedTo),
            type: 'router'
        };

        // Agregar el nodo al grafo
        networkGraph.addNode(newNode);
        createRouterSprite(newNode, nodeLayer, connectionLayer, networkGraph);
    });

    // Redibujar todas las conexiones
    loadedNodes.forEach(nodeData => {
        nodeData.connectedTo.forEach((connectedId: number) => {
            const targetNode = networkGraph.getNode(connectedId);
            const sourceNode = networkGraph.getNode(nodeData.id);
            if (targetNode && sourceNode) {
                drawConnection(connectionLayer, sourceNode, targetNode);
            }
        });
    });

    console.log("Grafo cargado exitosamente.");
}


