const { Scenes, Markup } = require('telegraf');
const { getResponseFromHuggingFace } = require('../../services/huggingFaceServices');
const { getMenuItems } = require('../../utils/dbUtils');
const { getRecommendationForMainDishes, getRecommendationForLightDishes, getRandomRecommendation } = require('./menuRecommendations');

// Crear una nueva escena llamada 'menu'
const menuScene = new Scenes.BaseScene('menu');

// Cuando el usuario entra a la escena del menú
menuScene.enter((ctx) => {
    showMainMenu(ctx);
});

function showMainMenu(ctx) {
    ctx.reply('Bienvenido al menú principal. ¿Qué te gustaría hacer?', Markup.inlineKeyboard([
        [Markup.button.callback('Ver opciones de menú', 'view_menu')],
        [Markup.button.callback('Hacer una reserva', 'make_reservation')],
        [Markup.button.callback('Consultar disponibilidad "PRUEBA"', 'check_availability')],
        [Markup.button.callback('Hablar con IA "PRUEBA"', 'chat_with_ia')]
    ]).resize());
}

menuScene.action('view_menu', async (ctx) => {
    // Obtener los elementos del menú desde la base de datos
    const menuItems = await getMenuItems();

    if (menuItems.length > 0) {
        // Crear un objeto para agrupar los elementos del menú por categoría
        const groupedMenu = {
            "Platos fuertes": [],
            "Entradas": [],
            "Bebidas": [],
            "Postres": [],
            "Adicionales": []
        };

        // Agrupar los elementos del menú por categoría
        menuItems.forEach(item => {
            if (groupedMenu[item.categoria]) {
                groupedMenu[item.categoria].push(`${item.nombre}: $${item.precio}`);
            }
        });

        // Crear el texto del menú agrupado por categorías
        let menuText = '';
        for (const [category, items] of Object.entries(groupedMenu)) {
            if (items.length > 0) {
                menuText += `\n*${category}*:\n`;
                menuText += items.join('\n');
                menuText += '\n';
            }
        }

        // Enviar el menú al usuario con un botón para volver
        await ctx.replyWithMarkdown(`Los siguientes platillos están disponibles:\n${menuText}`, 
            Markup.inlineKeyboard([
                [Markup.button.callback('Volver al menú principal', 'return_to_main')]
            ])
        );
    } else {
        await ctx.reply('Lo siento, no hay elementos disponibles en el menú en este momento.', 
            Markup.inlineKeyboard([
                [Markup.button.callback('Volver al menú principal', 'return_to_main')]
            ])
        );
    }
});

// Acción para volver al menú principal
menuScene.action('return_to_main', (ctx) => {
    ctx.answerCbQuery(); // Responde al callback query
    showMainMenu(ctx);
});

// Acción para iniciar el proceso de reserva (puede redirigir a otra escena)
menuScene.action('make_reservation', (ctx) => {
    ctx.reply('Redirigiéndote a la escena de reserva...');
    ctx.scene.enter('reservation'); // Asumiendo que tienes una escena de reserva configurada
});

// Acción para consultar disponibilidad
menuScene.action('check_availability', async (ctx) => {
    const inputText = '¿Cuál es la disponibilidad actual?';
    const response = await getResponseFromHuggingFace(inputText);
    ctx.reply(response, Markup.inlineKeyboard([
        [Markup.button.callback('Volver al menú principal', 'return_to_main')]
    ]));
});

// Acción para iniciar una conversación con IA
menuScene.action('chat_with_ia', (ctx) => {
    ctx.reply('¡Hola! Soy la asistente virtual. ¿Qué tipo de platos te gustaría recomendar?', Markup.inlineKeyboard([
        [Markup.button.callback('Platos fuertes', 'recommend_main_dishes')],
        [Markup.button.callback('Platos suaves', 'recommend_light_dishes')],
        [Markup.button.callback('No lo sé, sorpréndeme', 'recommend_random')],
        [Markup.button.callback('Volver al menú principal', 'return_to_main')]
    ]).resize());
    ctx.scene.state.step = 'chat_with_ia';
    ctx.scene.state.userPreferences = {}; // Inicializar las preferencias del usuario
});
menuScene.action('recommend_main_dishes', async (ctx) => {
    const response = await getRecommendationForMainDishes(ctx);
    ctx.reply(response, Markup.inlineKeyboard([
        [Markup.button.callback('Volver a recomendaciones', 'chat_with_ia')],
        [Markup.button.callback('Volver al menú principal', 'return_to_main')]
    ]).resize());
});

menuScene.action('recommend_light_dishes', async (ctx) => {
    const response = await getRecommendationForLightDishes(ctx);
    ctx.reply(response, Markup.inlineKeyboard([
        [Markup.button.callback('Volver a recomendaciones', 'chat_with_ia')],
        [Markup.button.callback('Volver al menú principal', 'return_to_main')]
    ]).resize());
});

menuScene.action('recommend_random', async (ctx) => {
    const response = await getRandomRecommendation(ctx);
    ctx.reply(response, Markup.inlineKeyboard([
        [Markup.button.callback('Volver a recomendaciones', 'chat_with_ia')],
        [Markup.button.callback('Volver al menú principal', 'return_to_main')]
    ]).resize());
});

menuScene.on('text', async (ctx) => {
    if (ctx.scene.state.step === 'chat_with_ia') {
        switch (ctx.scene.state.userPreferences.step) {
            case undefined:
                ctx.reply('¿Tienes alguna preferencia de tipo de plato? (Ej: Vegetariano, sin gluten, picante, etc.)');
                ctx.scene.state.userPreferences.step = 'dish_type';
                break;
            case 'dish_type':
                ctx.scene.state.userPreferences.dishType = ctx.message.text;
                ctx.reply('¿Tienes algún rango de presupuesto en mente?');
                ctx.scene.state.userPreferences.step = 'budget';
                break;
            case 'budget':
                ctx.scene.state.userPreferences.budget = parseInt(ctx.message.text, 10);
                // Ahora que tenemos las preferencias, podemos generar las recomendaciones
                const recommendation = await getRecommendationBasedOnPreferences(ctx);
                ctx.reply(recommendation, Markup.inlineKeyboard([
                    [Markup.button.callback('Volver a recomendaciones', 'chat_with_ia')],
                    [Markup.button.callback('Volver al menú principal', 'return_to_main')]
                ]).resize());
                ctx.scene.state.userPreferences = {};
                ctx.scene.state.step = undefined;
                break;
        }
    }
});

module.exports = menuScene;