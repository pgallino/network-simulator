// Configura el botón para seleccionar archivo
export function handleFileInput(inputElement: HTMLInputElement, onLoad: (result: string) => void) {
    inputElement.type = 'file';
    inputElement.onchange = () => {
        const file = inputElement.files ? inputElement.files[0] : null;
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                onLoad(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
}

// Cambia el modo de la aplicación
export function setupModeButtons() {
    document.getElementById("navigate-button")?.addEventListener("click", () => console.log("Modo: Navegar"));
    document.getElementById("router-button")?.addEventListener("click", () => console.log("Modo: Router"));
    document.getElementById("connection-button")?.addEventListener("click", () => console.log("Modo: Conexión"));
}

// Configura el menú desplegable de capas
export function setupLayerSelect() {
    const layerSelect = document.getElementById("layer-select") as HTMLSelectElement;
    layerSelect?.addEventListener("change", (e) => {
        const selectedLayer = (e.target as HTMLSelectElement).value;
        console.log(`Estás viendo la capa: ${selectedLayer}`);
    });
}
