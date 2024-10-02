const { getMenuItems } = require('../../utils/dbUtils');
const { getAssistantResponse } = require('../../services/OpenAIAssistant'); // Importa la función correcta

async function getRecommendationForMainDishes(ctx) {
    const menuItems = await getMenuItems();

    // Filtrar los platos fuertes
    const mainDishes = menuItems.filter(item => item.tipo === 'Plato fuerte');

    // Generar una descripción para OpenAI con los platos disponibles
    const menuList = mainDishes.map(dish => `${dish.nombre} - $${dish.precio}`).join(", ");
    
    const prompt = `
        Tengo los siguientes platos fuertes en el menú: ${menuList}.
        ¿Puedes recomendar algunos de estos platos a un cliente que busca una experiencia sabrosa y satisfactoria?
    `;

    // Usar OpenAI para generar la recomendación
    const recommendation = await getAssistantResponse(prompt);

    return recommendation;
}


async function getRecommendationForLightDishes(ctx) {
    const menuItems = await getMenuItems();

    // Filtrar los platos suaves
    const lightDishes = menuItems.filter(item => item.tipo === 'Plato suave');

    // Crear un prompt para OpenAI
    const menuList = lightDishes.map(dish => `${dish.nombre} - $${dish.precio}`).join(", ");

    const prompt = `
        Tengo los siguientes platos suaves en el menú: ${menuList}.
        ¿Puedes recomendar algunos de estos platos a un cliente que busca algo ligero pero delicioso?
    `;

    const recommendation = await getAssistantResponse(prompt);

    return recommendation;
}


async function getRandomRecommendation(ctx) {
    const menuItems = await getMenuItems();
    const menuList = menuItems.map(dish => `${dish.nombre} - $${dish.precio}`).join(", ");

    const prompt = `
        Tengo los siguientes platos en el menú: ${menuList}.
        ¿Puedes hacer una recomendación aleatoria que sorprenda al cliente?
    `;

    const recommendation = await getAssistantResponse(prompt);

    return recommendation;
}

async function getRecommendationBasedOnPreferences(ctx) {
    const { dishType, budget } = ctx.scene.state.userPreferences;
    const menuItems = await getMenuItems();

    // Filtrar los platos según las preferencias del usuario
    const filteredItems = menuItems.filter(item => {
        let matchesPreferences = true;
        if (dishType && item.tipo !== dishType) {
            matchesPreferences = false;
        }
        if (budget && item.precio > budget) {
            matchesPreferences = false;
        }
        return matchesPreferences;
    });

    // Si no hay platos que coincidan, devuelve un mensaje predeterminado
    if (filteredItems.length === 0) {
        return "Lo siento, no encontramos platos que coincidan con tus preferencias.";
    }

    const menuList = filteredItems.map(dish => `${dish.nombre} - $${dish.precio}`).join(", ");

    const prompt = `
        El cliente tiene un presupuesto de ${budget} y busca un plato tipo ${dishType}.
        Los siguientes platos coinciden con sus preferencias: ${menuList}.
        ¿Puedes recomendar algunos de estos platos basándote en sus gustos y presupuesto?
    `;

    const recommendation = await getAssistantResponse(prompt);

    return recommendation;
}


module.exports = {
    getRecommendationBasedOnPreferences,
    getRecommendationForMainDishes,
    getRecommendationForLightDishes,
    getRandomRecommendation
};