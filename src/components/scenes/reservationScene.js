const { Scenes, Markup } = require('telegraf');
const CalendarHelper = require('../calendar/calendar-helper');
const { getMenuItemsByCategory, saveReservation, checkAvailability, getAvailableTimes, savePedido } = require('../../utils/dbUtils');

const reservationScene = new Scenes.BaseScene('reservation');
const calendarHelper = new CalendarHelper();
let timeout;

const startInactivityTimer = (ctx) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        ctx.reply('Tu sesión ha expirado debido a inactividad. Por favor, empieza de nuevo si deseas hacer una reserva.');
        ctx.scene.leave();
    }, 5 * 60 * 1000);
};

const resetSceneState = (ctx) => {
    ctx.scene.state = {};
    clearTimeout(timeout);
};

const showMainMenu = (ctx) => {
    ctx.reply('¿Qué te gustaría hacer ahora?', Markup.inlineKeyboard([
        [Markup.button.callback('Hacer una nueva reserva', 'new_reservation')],
        [Markup.button.callback('Ver el menú', 'view_menu')],
        [Markup.button.callback('Volver al inicio', 'start')]
    ]).resize());
};

reservationScene.enter((ctx) => {
    ctx.reply('¡Hola! Vamos a empezar con tu reserva. Por favor, elige una opción:', Markup.inlineKeyboard([
        [Markup.button.callback('Reserva sencilla', 'simple_reserve')],
        [Markup.button.callback('Reserva con pedido', 'order_reserve')],
        [Markup.button.callback('Cancelar', 'cancel')]
    ]).resize());
    startInactivityTimer(ctx);
});

reservationScene.action('simple_reserve', (ctx) => {
    ctx.scene.state.reserveType = 'simple';
    ctx.reply('¿Cuál es tu nombre?');
    ctx.scene.state.step = 'name';
    startInactivityTimer(ctx);
});

reservationScene.action('order_reserve', (ctx) => {
    ctx.scene.state.reserveType = 'order';
    ctx.reply('¿Cuál es tu nombre?');
    ctx.scene.state.step = 'name';
    startInactivityTimer(ctx);
});

reservationScene.on('text', async (ctx) => {
    startInactivityTimer(ctx);
    
    switch(ctx.scene.state.step) {
        case 'name':
            ctx.scene.state.name = ctx.message.text;
            ctx.reply('Gracias. ¿Cuántas personas serán?', Markup.inlineKeyboard([
                [Markup.button.callback('1', 'people-1'), Markup.button.callback('2', 'people-2')],
                [Markup.button.callback('3', 'people-3'), Markup.button.callback('4', 'people-4')],
                [Markup.button.callback('5 o más', 'people-more')]
            ]).resize());
            break;
        case 'peopleMore':
            const numberOfPeople = parseInt(ctx.message.text, 10);
            if (isNaN(numberOfPeople) || numberOfPeople <= 0) {
                ctx.reply('Por favor, ingresa un número válido de personas.');
                return;
            }
            ctx.scene.state.people = numberOfPeople;
            ctx.reply('Ahora, selecciona una fecha para tu reserva:', Markup.inlineKeyboard([
                [Markup.button.callback('Seleccionar fecha', 'calendar')]
            ]).resize());
            break;
        case 'menu':
            if (ctx.message.text === 'Finalizar pedido') {
                await confirmReservation(ctx);
            } else {
                ctx.scene.state.order = ctx.scene.state.order || [];
                ctx.scene.state.order.push(ctx.message.text);
                ctx.reply('Plato añadido. ¿Deseas agregar otro plato o finalizar el pedido?');
            }
            break;
    }
});

reservationScene.action(/people-(\d+)/, (ctx) => {
    ctx.scene.state.people = parseInt(ctx.match[1], 10);
    ctx.reply('Ahora, selecciona una fecha para tu reserva:', Markup.inlineKeyboard([
        [Markup.button.callback('Seleccionar fecha', 'calendar')]
    ]).resize());
});

reservationScene.action('people-more', (ctx) => {
    ctx.scene.state.step = 'peopleMore';
    ctx.reply('Por favor, ingresa el número exacto de personas:');
});

reservationScene.action('calendar', async (ctx) => {
    ctx.reply('Selecciona un mes:', calendarHelper.getMonthMarkup());
});

reservationScene.action(/calendar-month-(\d{4})-(\d+)/, async (ctx) => {
    const [, year, month] = ctx.match;
    ctx.reply('Selecciona el día:', calendarHelper.getCalendarMarkup(parseInt(year), parseInt(month)));
});

reservationScene.action(/calendar-date-(\d{4}-\d{2}-\d{2})/, async (ctx) => {
    const selectedDate = ctx.match[1];
    ctx.scene.state.date = selectedDate;
    const availableTimes = await getAvailableTimes(selectedDate);
    if (availableTimes.length === 0) {
        ctx.reply('Lo siento, no hay horarios disponibles para esa fecha. Por favor, selecciona otra fecha.');
    } else {
        ctx.reply('Fecha seleccionada. Ahora, selecciona una hora:', Markup.inlineKeyboard(
            availableTimes.map(time => Markup.button.callback(time, `time-${time}`))
        ).resize());
    }
});

reservationScene.action(/time-(\d{2}:\d{2})/, async (ctx) => {
    ctx.scene.state.time = ctx.match[1];
    if (ctx.scene.state.reserveType === 'simple') {
        await confirmReservation(ctx);
    } else {
        ctx.scene.state.step = 'category';
        ctx.reply('Selecciona una categoría del menú:', Markup.inlineKeyboard([
            [Markup.button.callback('Platos fuertes', 'category-Platos fuertes')],
            [Markup.button.callback('Entradas', 'category-Entradas')],
            [Markup.button.callback('Bebidas', 'category-Bebidas')],
            [Markup.button.callback('Postres', 'category-Postres')],
            [Markup.button.callback('Adicionales', 'category-Adicionales')],
            [Markup.button.callback('Cancelar pedido', 'cancel_order')]
        ]).resize());
    }
});

reservationScene.action(/category-(.*)/, async (ctx) => {
    const category = ctx.match[1];
    console.log(`Categoría seleccionada: ${category}`);
    const menuItems = await getMenuItemsByCategory(category);
    if (menuItems.length === 0) {
        ctx.reply(`No hay productos disponibles en la categoría "${category}".`);
    } else {
        const menuKeyboard = menuItems.map(item => Markup.button.text(`${item.nombre} - $${item.precio}`));
        ctx.reply(`Selecciona los platos para tu pedido en la categoría "${category}":`, 
            Markup.keyboard(menuKeyboard.concat(['Volver a categorías', 'Finalizar pedido'])).oneTime().resize());
    }
    ctx.scene.state.step = 'menu';
});

reservationScene.action('cancel_order', (ctx) => {
    ctx.reply('Pedido cancelado. Si deseas hacer algo más, selecciona una opción:', Markup.inlineKeyboard([
        [Markup.button.callback('Volver al inicio', 'start')]
    ]).resize());
    resetSceneState(ctx);
    ctx.scene.leave();
});

reservationScene.action('new_reservation', (ctx) => {
    resetSceneState(ctx);
    ctx.scene.reenter();
});

reservationScene.action('start', (ctx) => {
    resetSceneState(ctx);
    ctx.scene.leave();
    ctx.reply('¡Bienvenido de nuevo! Por favor selecciona una opción:', Markup.inlineKeyboard([
        [Markup.button.callback('Menú', 'menu')],
        [Markup.button.callback('Hacer una reserva', 'reserve')],
        [Markup.button.callback('Consultar reservas', 'query')],
        [Markup.button.callback('Ayuda', 'help')]
    ]).resize());
});

reservationScene.action('cancel', async (ctx) => {
    await ctx.answerCbQuery('Reserva cancelada');
    await ctx.reply('Tu reserva ha sido cancelada. No te preocupes, puedes hacer una nueva cuando quieras.');
    resetSceneState(ctx);
    showMainMenu(ctx);
});

async function confirmReservation(ctx) {
    const { name, date, time, people, order } = ctx.scene.state;
    console.log('Verificando disponibilidad para:', date, time, people);
    const isAvailable = await checkAvailability(date, time, people);
    console.log('Disponibilidad:', isAvailable);
    if (!isAvailable) {
        ctx.reply('Lo siento, no hay disponibilidad para esa fecha y hora. Por favor, elige otra.');
        return;
    }

    try {
        const reservationId = await saveReservation({ name, date, time, people, usuario_id: ctx.from.id.toString() });
        if (order && order.length > 0) {
            await savePedido(reservationId, order);
        }
        await ctx.reply(`¡Tu reserva ha sido confirmada! Número de reserva: ${reservationId}`);
        if (order && order.length > 0) {
            await ctx.reply(`Tu pedido: ${order.join(', ')}`);
        }
    } catch (err) {
        await ctx.reply('Hubo un error al procesar tu reserva. Por favor, inténtalo de nuevo más tarde.');
    }

    resetSceneState(ctx);
    showMainMenu(ctx);
}

module.exports = reservationScene;