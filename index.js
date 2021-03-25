const { VK } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const fetch = require('node-fetch');
const chalk = require('chalk');

const config = require('./config.json');

const bot = new HearManager();

const vk = new VK ({
    pollingGroupId: config.vk.group_id, //айди группы, в которой будет стоять бот
    token: config.vk.group_token //токен группы, можно получить тут - https://vkhost.github.io
});

vk.updates.on('message_new', bot.middleware);

const utils = {
    sp: number => number.toLocaleString('ru-RU'),
    random: (x, y) => {
		return y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x);
	},
	pick: (array) => {
		return array[utils.random(array.length - 1)];
	}
};

bot.hear(/^стата?([0-9]+)?$/i, async msg => {
    await fetch(`https://pixel.w84.vkforms.ru/HappySanta/slaves/1.0.0/user?id=${msg.senderId}`, {
        method: 'GET',
        headers: {'Content-Type':'application/json', 'authorization': config.app.authorization},
    })
    .then(response => response.json())
    .then(res => {
    return msg.send(`
Баланс аккаунта: ${utils.sp(res.balance)}
Стоимость аккаунта: ${utils.sp(res.price)} (Продажа: ${utils.sp(res.sale_price)})
Позиция в рейтинге: ${utils.sp(res.rating_position)}
В рабстве у: ${res.master_id === 0 ? 'ни у кого' : `@id${res.master_id} | на работе: ${res.job.name} | доход: ${utils.sp(info.data.profit_per_min)}`}

Количество рабов: ${utils.sp(res.slaves_count)}
Доход рабов в минуту: ${utils.sp(res.slaves_profit_per_min)}`)
});
});

bot.hear(/^eval(.*)$/i, async msg => {
    if(msg.senderId != config.vk.user_id) return;
    try {
        let result = eval(msg.$match[1]);
        msg.send(result)
    } catch (e) {
        msg.send(`Error: ${e}`)
    }
});

bot.hear(/^старт$/i, async msg => {
    if(msg.senderId != config.vk.user_id) return;
    setInterval(buySlave, config.intervals.buySlave * 1000);
    msg.send(`Накрутка запущена!
    Разработчик бота https://vk.com/korn9kov`)
});

async function buySlave() {
    try {
    let rand_slave = utils.random(500000, 500000000);
    await fetch(`https://pixel.w84.vkforms.ru/HappySanta/slaves/1.0.0/buySlave`, {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'authorization': config.app.authorization},
        body: JSON.stringify({
            slave_id: rand_slave
        })
    })

    await fetch(`https://pixel.w84.vkforms.ru/HappySanta/slaves/1.0.0/jobSlave`, {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'authorization': config.app.authorization},
        body: JSON.stringify({
            slave_id: rand_slave,
            name: '@korn9kov'
        })
    });
    await fetch(`https://pixel.w84.vkforms.ru/HappySanta/slaves/1.0.0/user?id=${config.vk.user_id}`, {
        method: 'GET',
        headers: {'Content-Type':'application/json', 'authorization': config.app.authorization},
    })
    .then(response => response.json())
    .then(res => {
    vk.api.messages.send({peer_id: 2000000000 + config.vk.chat_id, random_id: utils.random(2000, 2020202020), message: `
    [БОТ]:
Раб vk.com/id${rand_slave} успешно куплен.
Купил на него цепь.
Установил ему работу.

Баланс: ${utils.sp(res.balance)}
Рабов: ${utils.sp(res.slaves_count)}
Место в топе: ${utils.sp(res.rating_position)}
    `})
    })
} catch (e) {
    vk.api.messages.send({peer_id: 2000000000 + config.vk.chat_id, random_id: utils.random(2000, 2020202020), message: `[БОТ]: Ошибка при покупке раба\n${e}`})
}
};

async function getStat() {
    await fetch(`https://pixel.w84.vkforms.ru/HappySanta/slaves/1.0.0/user?id=${config.vk.user_id}`, {
        method: 'GET',
        headers: {'Content-Type':'application/json', 'authorization': config.app.authorization},
    })
    .then(response => response.json())
    .then(res => {
    vk.api.messages.send({peer_id: 2000000000 + config.vk.chat_id, random_id: utils.random(2000, 2020202020), message: `
    [БОТ]:
Сводка за 30 минут:

Баланс аккаунта: ${utils.sp(res.balance)}
Стоимость аккаунта: ${utils.sp(res.price)} (Продажа: ${utils.sp(res.sale_price)})
Позиция в рейтинге: ${utils.sp(res.rating_position)}
В рабстве у: ${res.master_id === 0 ? 'ни у кого' : `@id${res.master_id} | на работе: ${res.job.name} | доход: ${utils.sp(res.profit_per_min)}`}

Количество рабов: ${utils.sp(res.slaves_count)}
Доход рабов в минуту: ${utils.sp(res.slaves_profit_per_min)}
`})
})
};

setInterval(getStat, config.intervals.getStat * 1000);

vk.updates.startPolling();


vk.api.messages.send({peer_id: 2000000000 + config.vk.chat_id, random_id: utils.random(2000, 2020202020), message: `[БОТ]: Успешно запущен!`})
console.log(chalk.blue('------------------'));
console.log(chalk.bgGreen(`BOT STARTED!`));
console.log(chalk.green(`Dev. by @korn9kov :)`));
console.log(chalk.blue('------------------'));
