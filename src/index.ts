import { Application, TextStyle, Rectangle, Text, Graphics, GraphicsContext, FederatedPointerEvent, Ticker } from 'pixi.js';
import './style.css';

// Clase para el nodo que se mueve
class MovingSquare {
    private square: Graphics;
    private lineStart: { x: number, y: number };
    private lineEnd: { x: number, y: number };
    private progress: number; // Para controlar la posición
    private speed: number;

    constructor(lineStart: { x: number, y: number }, lineEnd: { x: number, y: number }, speed: number) {
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
        this.speed = speed;
        this.progress = 0; // Comienza en el inicio

        // Crea el cuadrado azul
        this.square = new Graphics()
            .beginFill(0x0000ff) // Color azul
            .drawRect(-5, -5, 10, 10) // Cuadrado de 10x10
            .endFill();

        // Posiciona el cuadrado en el punto de inicio
        this.updatePosition();
    }

    public getSquare(): Graphics {
        return this.square;
    }

    public updatePosition() {
        // Calcular la posición actual del cuadrado
        this.square.x = this.lineStart.x + (this.lineEnd.x - this.lineStart.x) * this.progress;
        this.square.y = this.lineStart.y + (this.lineEnd.y - this.lineStart.y) * this.progress;
    }

    public move(delta: number) {
        // Actualizar la posición del cuadrado
        this.progress += this.speed * delta;
        // Invertir la dirección al llegar al final o al inicio
        if (this.progress >= 1) {
            this.progress = 1;
            this.speed = -Math.abs(this.speed); // Cambia a negativo
        } else if (this.progress <= 0) {
            this.progress = 0;
            this.speed = Math.abs(this.speed); // Cambia a positivo
        }
        this.updatePosition();
    }

    public setSpeed(speed: number) {
        this.speed = speed;
    }
}

// IIFE to avoid errors
(async () => {
    const app = new Application();

    await app.init({ width: window.innerWidth, height: window.innerHeight, resolution: devicePixelRatio });

    document.body.appendChild(app.canvas);

    let rect = new Graphics()
        .rect(0, 0, app.renderer.width, app.renderer.height)
        .fill(0xe3e2e1);

    const resizeRect = () => {
        rect.width = app.renderer.width;
        rect.height = app.renderer.height;
    }

    app.stage.addChild(rect);

    const circleContext = new GraphicsContext().circle(0, 0, 10).fill(0xff0000);

    let lineStart: { x: number, y: number } = null;
    const movingSquares: MovingSquare[] = []; // Array para almacenar los cuadrados en movimiento
    let squareCount = 0; // Contador de cuadrados

    const tooltips: Graphics[] = []; // Almacenar los tooltips

    const circleOnClick = (e: FederatedPointerEvent, circle: Graphics) => {
        console.log("clicked on circle", e);
        if (!e.altKey) {
            return;
        }
        e.stopPropagation();
        if (lineStart === null) {
            lineStart = { x: circle.x, y: circle.y };
        } else {
            const line = new Graphics()
                .moveTo(lineStart.x, lineStart.y)
                .lineTo(circle.x, circle.y)
                .stroke({ width: 2, color: 0 });
            rect.addChildAt(line, 0);

            // Crear un cuadrado azul que se moverá entre los puntos
            const movingSquare = new MovingSquare(lineStart, { x: circle.x, y: circle.y }, 0.01); // Velocidad ajustable
            movingSquares.push(movingSquare); // Agregar a la lista de cuadrados
            rect.addChild(movingSquare.getSquare()); // Añadir el cuadrado al escenario

            // Incrementar el contador de cuadrados
            squareCount++;

            lineStart = null;
        }
    };

    rect.on('click', (e) => {
        console.log("clicked on rect", e);
        if (!e.altKey) {
            const circle = new Graphics(circleContext);
            circle.x = e.globalX;
            circle.y = e.globalY;
            rect.addChild(circle);
            circle.on('click', (e) => circleOnClick(e, circle));
            circle.eventMode = 'static';
        }
    });

    rect.eventMode = 'static';

    let isPaused = false; // Estado de pausa

    // Crear el botón de pausa
    const pauseButton = document.createElement('button');
    pauseButton.innerText = 'Pausar';
    pauseButton.style.position = 'absolute';
    pauseButton.style.top = '10px';
    pauseButton.style.left = '10px';
    pauseButton.style.zIndex = '100'; // Asegura que el botón esté en la parte superior
    document.body.appendChild(pauseButton);

    pauseButton.onclick = () => {
        isPaused = !isPaused;
        pauseButton.innerText = isPaused ? 'Reanudar' : 'Pausar';
        tooltips.forEach(tooltip => tooltip.visible = false); // Ocultar tooltips al pausar
    };

    // Usar el ticker para animar los cuadrados
    app.ticker.add((ticker: Ticker) => {
        const delta = ticker.deltaTime;
        if (!isPaused) { // Solo mover si no está en pausa
            for (const square of movingSquares) {
                square.move(delta);
            }
        }
    });

    // Evento de hover para mostrar información
    app.stage.interactive = true;
    app.stage.on('pointermove', (event) => {
        if (isPaused) {
            const { x, y } = event.global;

            // Ocultar todos los tooltips primero
            tooltips.forEach(tooltip => tooltip.visible = false);

            // Mostrar texto en el tooltip
            const squareIndex = movingSquares.findIndex(square => {
                const squareGraphics = square.getSquare();
                const squareBounds = squareGraphics.getBounds(); // Obtener los límites del cuadrado
                const rect = new Rectangle(squareBounds.x, squareBounds.y, squareBounds.width, squareBounds.height);
                return rect.contains(event.global.x, event.global.y); // Comprobar si el puntero está dentro
            });

            if (squareIndex !== -1) {
                let tooltip = new Graphics();
                tooltip.beginFill(0xffffff); // Fondo blanco

                // Obtener el texto y su tamaño
                const text = `Soy el paquete número: ${squareIndex + 1}`;
                const style = new TextStyle({ fill: '#000000', fontSize: 16 });
                const label = new Text(text, style);

                // Calcular el tamaño del tooltip basado en el texto
                tooltip.drawRect(0, 0, label.width + 20, label.height + 20); // Agregar margen al tamaño

                tooltip.endFill();
                tooltip.x = x + 10; // Posicionar tooltip
                tooltip.y = y + 10; // Posicionar tooltip

                // Agregar texto al tooltip
                label.x = 10; // Margen del texto
                label.y = 10; // Margen del texto
                tooltip.addChild(label);

                // Agregar tooltip al escenario
                app.stage.addChild(tooltip);
                tooltips.push(tooltip); // Agregar a la lista de tooltips

                tooltip.visible = true;
            }
        }
    });

    function resize() {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        resizeRect();
    }

    window.addEventListener('resize', resize);
})();
