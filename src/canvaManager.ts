
import { GraphNode, NetworkGraph, PCNode, RouterNode} from './networkgraph';
import { Graphics, Sprite, Texture, FederatedPointerEvent, Text} from 'pixi.js';
import { clearNodeLayer, drawConnection, getMode, updateConnections } from './utils';
import routerImage from './assets/router.svg';
import pcImage from './assets/computer.svg'
import { showPCInfo } from './pcManager';
import { showRouterInfo } from './routerManager';

let firstNode: GraphNode | null = null;

// Extiende Sprite para incluir la propiedad personalizada "dragging"
interface DraggableSprite extends Sprite {
    dragging: boolean;
}

const networkGraph = new NetworkGraph()

let routerTexture: Texture | null = null;
let pcTexture: Texture | null = null

export function clickHandler(nodeLayer: Graphics, connectionLayer: Graphics, x: number, y: number): void {
    let mode = getMode();

    if (mode === 'navigate') {
        return;
    }
    if (mode === 'connection') {
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

    if (mode === 'pc') {
        // Crear un nuevo PCNode
        const newPC: PCNode = {
            id: networkGraph.getNodes().length + 1,  // Genera un ID único basado en la cantidad de nodos actuales
            x: x,
            y: y,
            status: 'active',  // Estado inicial del router
            connections: 0,
            connectedTo: new Set(),
            type: 'pc'
        };

        // Agregar el RouterNode al grafo
        networkGraph.addNode(newPC);
        createPCSprite(newPC, nodeLayer, connectionLayer, networkGraph)

        // Representación visual u otras operaciones adicionales si es necesario
        console.log(`Router añadido con ID ${newPC.id} en la posición (${x}, ${y}).`);
    }
}

function createRouterSprite(routerInfo: RouterNode, nodeLayer: Graphics, connectionLayer: Graphics, networkGraph: NetworkGraph): void {
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

function createPCSprite(newPC: PCNode, nodeLayer: Graphics, connectionLayer: Graphics, networkGraph: NetworkGraph) {
    // Verificar si la textura ya fue cargada
    if (!pcTexture) {
        const img = new Image();
        img.src = pcImage;

        img.onload = () => {
            pcTexture = Texture.from(img);
            addPCSprite(newPC, nodeLayer, connectionLayer, networkGraph);
        };

        img.onerror = () => {
            console.error("No se pudo cargar la imagen del pc.");
        };
    } else {
        addPCSprite(newPC, nodeLayer, connectionLayer, networkGraph);
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
        sprite.on('click', (e) => handleClick(e, routerInfo, connectionLayer, networkGraph));
        sprite.on('pointerdown', handlePointerDown(sprite, routerInfo, connectionLayer));
    } else {
        console.error("La textura del router no está disponible.");
    }
}

function addPCSprite(newPC: PCNode, nodeLayer: Graphics, connectionLayer: Graphics, networkGraph: NetworkGraph) {
    if (pcTexture) {
        const sprite = new Sprite(pcTexture) as DraggableSprite;
        sprite.width = 40;
        sprite.height = 40;
        sprite.anchor.set(0.5, 0.5);
        sprite.x = newPC.x;
        sprite.y = newPC.y;

        nodeLayer.addChild(sprite);
        sprite.eventMode = 'static';
        sprite.interactive = true;
        sprite.dragging = false;

        // Configuración de eventos de interacción
        sprite.on('click', (e) => handleClick(e, newPC, connectionLayer, networkGraph));
        sprite.on('pointerdown', handlePointerDown(sprite, newPC, connectionLayer));
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
    let loadedNodes: Array<RouterNode | PCNode>;

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
        const { id, x, y, status, connections, connectedTo, type } = nodeData;

        // Verifica el tipo de nodo y crea el nodo correspondiente
        let newNode: RouterNode | PCNode;
        if (type === 'router') {
            newNode = {
                id,
                x,
                y,
                status,
                connections,
                connectedTo: new Set(connectedTo),
                type: 'router'
            } as RouterNode;
            createRouterSprite(newNode, nodeLayer, connectionLayer, networkGraph);  // Puedes adaptar la función para PCs también
        } else if (type === 'pc') {
            newNode = {
                id,
                x,
                y,
                status,
                connections,
                connectedTo: new Set(connectedTo),
                type: 'pc'
            } as PCNode;
            createPCSprite(newNode, nodeLayer, connectionLayer, networkGraph);  // Puedes adaptar la función para PCs también
        } else {
            console.warn(`Tipo de nodo desconocido: ${type}`);
            return;
        }

        // Agregar el nodo al grafo
        networkGraph.addNode(newNode);
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

export function handlePointerDown(sprite: DraggableSprite, graphNode: GraphNode, connectionLayer: Graphics) {

    let offsetX = 0;
    let offsetY = 0;

    return (event: FederatedPointerEvent) => {
        if (getMode() === "navigate") {
            sprite.alpha = 0.5; // Cambia la opacidad durante el arrastre
            sprite.dragging = true;

            // Calcula el desplazamiento entre el mouse y el sprite al iniciar el arrastre
            offsetX = event.clientX - sprite.getBounds().x;
            offsetY = event.clientY - sprite.getBounds().y;

            // Eventos globales para permitir arrastrar fuera del sprite
            document.addEventListener('pointermove', globalPointerMove);
            document.addEventListener('pointerup', globalPointerUp);
        }

        // Movimiento global del puntero
        function globalPointerMove(event: PointerEvent) {
            if (sprite.dragging) {

                // Calcula la nueva posición usando el desplazamiento
                const newPositionX = event.clientX - offsetX;
                const newPositionY = event.clientY - offsetY;
                sprite.x = newPositionX;
                sprite.y = newPositionY;

                // Actualiza las coordenadas en graphNode
                graphNode.x = sprite.x;
                graphNode.y = sprite.y;

                updateConnections(connectionLayer, networkGraph);
            }
        }

        // Soltar el puntero para finalizar el arrastre
        function globalPointerUp() {
            sprite.alpha = 1; // Restaurar opacidad
            sprite.dragging = false;

            // Remover eventos globales al soltar
            document.removeEventListener('pointermove', globalPointerMove);
            document.removeEventListener('pointerup', globalPointerUp);
        }
    };
}

export function handleClick(e: MouseEvent, node: GraphNode, connectionLayer: Graphics, networkGraph: NetworkGraph) {
    console.log("clicked on pc", e);
    if (getMode() === "connection") {
        if (!firstNode) {
            // Si no hay un primer pc seleccionado, almacena el actual
            firstNode = node;
            // showpcInfo(firstNode)
        } else {
            // Verifica si los pcs son distintos antes de intentar conectar
            if (firstNode.id !== node.id) {
                // Dibuja una línea entre firstNode y el pc actual
                drawConnection(connectionLayer, firstNode, node);
                // Añadir la arista al grafo
                networkGraph.addEdge(firstNode.id, node.id)

                if (node.type == 'pc') {
                    showPCInfo(node)
                } else if (node.type == 'router') {
                    showRouterInfo(node)
                }

                firstNode = null;
            } else {
                console.log("Los nodos son el mismo, no se crea una conexión.");
            }
        }
    } else if (getMode() === "navigate") {
        if (node.type == 'pc') {
            showPCInfo(node)
        } else if (node.type == 'router') {
            showRouterInfo(node)
        }
    }
}