const { Telegraf, Markup, session, Scenes } = require('telegraf');
const { Pool } = require('pg');
const reservationScene = require('../components/scenes/reservationScene');
const menuScene = require('../components/scenes/menuScene');
const queryScene = require('../components/scenes/queryScene');

const getBotToken = () => {
    const token = process.env.BOT_TOKEN;
    if (!token) {
        console.error('No se encontró BOT_TOKEN en las variables de entorno.');
        process.exit(1);
    }
    return token;
};

const bot = new Telegraf(getBotToken());
console.log('Bot iniciado correctamente');

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error adquiriendo cliente', err.stack);
    }
    console.log('Conexión a la base de datos establecida');
    release();
});

const stage = new Scenes.Stage([reservationScene, menuScene, queryScene]);

// Middleware personalizado para manejar la sesión y el estado de la conversación
bot.use((ctx, next) => {
    const now = Date.now();
    ctx.session = ctx.session || {};
    
    // Verificar si es un nuevo chat o si el historial se borró
    if (!ctx.session.chatId || ctx.session.chatId !== ctx.chat.id) {
        ctx.session = {
            chatId: ctx.chat.id,
            lastActivityTime: now,
            conversationState: 'initial',
            lastMessageId: null
        };
    } else if (now - ctx.session.lastActivityTime > 1 * 60 * 1000) {
        // Si han pasado más de 5 minutos, reiniciar el estado
        ctx.session.conversationState = 'initial';
    }
    
    ctx.session.lastActivityTime = now;
    
    return next();
});

bot.use(session());
bot.use(stage.middleware());

const startKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Iniciar Reserva', 'start_reservation')]
]);

const mainKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Menú', 'menu')],
    [Markup.button.callback('Hacer una reserva', 'reserve')],
    [Markup.button.callback('Consultar reservas', 'query')],
    [Markup.button.callback('Ayuda', 'help')]
]);

const sendInitialMessage = async (ctx) => {
    const message = await ctx.reply('¡Bienvenido a nuestro bot de reservas! Para comenzar, por favor presiona el botón:', startKeyboard);
    ctx.session.lastMessageId = message.message_id;
    ctx.session.conversationState = 'initial';
};

bot.command('start', async (ctx) => {
    await sendInitialMessage(ctx);
});

bot.action('start_reservation', async (ctx) => {
    await ctx.answerCbQuery();
    const message = await ctx.reply('¡Bienvenido a nuestro bot de reservas! Por favor selecciona una opción:', mainKeyboard);
    ctx.session.lastMessageId = message.message_id;
    ctx.session.conversationState = 'main_menu';
});

bot.action('reserve', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('Has seleccionado hacer una reserva.');
    ctx.session.conversationState = 'reservation';
    await ctx.scene.enter('reservation');
});

bot.action('query', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('Has seleccionado consultar reservas.');
    ctx.session.conversationState = 'query';
    await ctx.scene.enter('query');
});

bot.action('help', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('Comandos disponibles:\n/start - Iniciar el bot\n/reserve - Hacer una reserva\n/help - Ver esta lista de comandos');
});

bot.action('menu', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('Accediendo al menú...');
    ctx.session.conversationState = 'menu';
    await ctx.scene.enter('menu');
});

bot.action('cancel', async (ctx) => {
    await ctx.answerCbQuery();
    await sendInitialMessage(ctx);
});

// Manejar todos los mensajes para detectar si el historial se borró
bot.on('message', async (ctx) => {
    if (ctx.session.lastMessageId && ctx.message.message_id < ctx.session.lastMessageId) {
        // Si el ID del mensaje actual es menor que el último ID guardado,
        // asumimos que el historial se borró
        await sendInitialMessage(ctx);
    } else {
        ctx.session.lastMessageId = ctx.message.message_id;
        // Manejar el mensaje normalmente según el estado actual
        switch (ctx.session.conversationState) {
            case 'initial':
                await sendInitialMessage(ctx);
                break;
            case 'main_menu':
                await ctx.reply('Por favor, selecciona una opción del menú principal:', mainKeyboard);
                break;
            // Agrega más casos según sea necesario para otros estados
            default:
                // Si no estamos en un estado conocido, volvemos al inicio
                await sendInitialMessage(ctx);
        }
    }
});

module.exports = bot;