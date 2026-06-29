// ============================================================
// EcoSort — Configuracion de la API Gemini (Google AI Studio)
// ============================================================
// Este archivo contiene la configuracion necesaria para
// conectar el simulador con la API de Gemini, el modelo de
// inteligencia artificial de Google que genera los protocolos
// de clasificacion de residuos.
//
// USO:
//   1. Obtén una API key gratuita en https://aistudio.google.com/app/apikey
//   2. Reemplaza "AQUI_TU_API_KEY" con tu clave real en la línea 13
//   3. NUNCA subas este archivo con la key a un repositorio publico
//      (GitHub, GitLab, etc.) porque cualquier persona podria usarla.
//
// IMPORTANTE:
//   - La API key se usa exclusivamente para el simulador de clasificacion
//     de residuos industriales. No se utiliza para ningun otro proposito.
//   - Si la key no esta configurada, el simulador mostrara un error
//     indicando que falta la configuracion.
//   - El archivo js/simulador.js es el que consume esta configuracion
//     mediante la variable global GEMINI_CONFIG.
// ============================================================

var GEMINI_CONFIG = {
    // =========================================================
    // API Key de Google AI Studio
    // Reemplazar "AQUI_TU_API_KEY" con la key real obtenida en:
    // https://aistudio.google.com/app/apikey
    // =========================================================
    apiKey: "AQ.Ab8RN6LS5yrBVFm1Nd3LP2GG-UTj9ilA3u0UOA8SUQhWogMgIw",

    // =========================================================
    // Modelo de Gemini a utilizar
    // "gemini-2.0-flash-lite" es un modelo rapido y ligero,
    // ideal para tareas de clasificacion sin costo elevado.
    // =========================================================
    model: "gemini-2.0-flash-lite",

    // =========================================================
    // URL base de la API de Gemini
    // No modificar a menos que Google cambie su endpoints.
    // La URL completa se construye en simulador.js sumando
    // el modelo y la key: baseUrl + model + ":generateContent?key=" + apiKey
    // =========================================================
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/"
};
