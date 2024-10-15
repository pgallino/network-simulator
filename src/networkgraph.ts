// Nodo base con un campo discriminante
export interface GraphNode {
    id: number;
    x: number;
    y: number;
    status: string;
    connections: number;
    connectedTo: Set<number>;
    type: 'router' | 'pc';  // Campo discriminante
}

export interface RouterNode extends GraphNode {
    type: 'router';
}

export interface PCNode extends GraphNode {
    type: 'pc';
}


export class NetworkGraph {
    private adjacencyList: Map<number, GraphNode>;

    constructor() {
        this.adjacencyList = new Map();
    }

    // Agregar un nodo al grafo
    addNode(node: GraphNode) {
        if (!this.adjacencyList.has(node.id)) {
            this.adjacencyList.set(node.id, node);
            console.log(`Nodo añadido con ID ${node.id} en (${node.x}, ${node.y})`);
        } else {
            console.warn(`El nodo con ID ${node.id} ya existe en el grafo.`);
        }
    }

    // Agregar una conexión entre dos nodos
    addEdge(id1: number, id2: number) {
        const node1 = this.adjacencyList.get(id1);
        const node2 = this.adjacencyList.get(id2);

        if (node1 && node2) {
            node1.connections += 1;
            node2.connections += 1;
            node1.connectedTo.add(id2);
            node2.connectedTo.add(id1);
            console.log(`Conexión creada entre nodos ID: ${id1} y ID: ${id2}`);
            console.log(`Conexiones del nodo ID ${id1}:`, Array.from(node1.connectedTo));
            console.log(`Conexiones del nodo ID ${id2}:`, Array.from(node2.connectedTo));
        } else {
            if (!node1) {
                console.warn(`El nodo con ID ${id1} no existe en adjacencyList.`);
            }
            if (!node2) {
                console.warn(`El nodo con ID ${id2} no existe en adjacencyList.`);
            }
        }
    }

    // Obtener todas las conexiones de un nodo
    getConnections(id: number): number[] {
        const node = this.adjacencyList.get(id);
        return node ? Array.from(node.connectedTo) : [];
    }

    // Obtener un nodo específico por su ID
    getNode(id: number): GraphNode | undefined {
        return this.adjacencyList.get(id);
    }

    // Obtener todos los nodos en el grafo
    getNodes(): GraphNode[] {
        return Array.from(this.adjacencyList.values()).map(data => data);
    }

    // Limpiar el grafo
    clear() {
        this.adjacencyList.clear();
    }
}
