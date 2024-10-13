import { setupApp, resizeApp } from './app';
import { handleFileInput, setupModeButtons, setupLayerSelect } from './handlers';
import { addRouter, handleConnection } from './router';

(async () => {
    // Configuración inicial
    const { app, bunny, background } = await setupApp();

    // Configuración de eventos
    setupModeButtons();
    setupLayerSelect();

    // Configura el input de archivo
    const fileInput = document.createElement('input');
    handleFileInput(fileInput, (fileContent) => {
        console.log("Archivo cargado:", fileContent);
    });

    // Agrega un ejemplo de router al hacer clic en el fondo
    background.eventMode = 'static';
    background.on('click', (e) => {
        addRouter(e.globalX, e.globalY, background);
    });

    // Redimensiona la app al cambiar el tamaño de la ventana
    window.addEventListener('resize', () => resizeApp(app));
})();
