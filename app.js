const {Client, Intents} = require('discord.js');
const config = require('./config.json')
const {exec} = require('child_process');

const client = new Client({intents: [Intents.FLAGS.GUILDS]});

let workers = [];

client.once('ready', () => {
    console.log('MASTER: Rainbow master is ready!');
    console.log('MASTER: Launching workers...');

    for (let i = 0; i < config.roles.length; ++i) {
        let worker = exec(`node worker.js ${config.roles[i].workerToken} ${i}`);
        worker.stdout.on('data', (data) => {
            console.log(`WORKER ${i}: ${data.replace(/[\n\t\r]/g, "")}`);
        })
        worker.stderr.on('data', (data) => {
            console.warn(`WORKER ${i}: ${data.replace(/[\n\t\r]/g, "")}`);
        })
        worker.on('exit', (code, signal) => {
            let reason = code ? "Exited with code " + code : "Terminated with signal " + signal;
            console.error(`WORKER ${i}: ${reason}`);
        })

        workers.push(worker);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.user.id !== '261137595965243393') {
        await interaction.reply({content: 'Пока что эта команда недоступна', ephemeral: true})
        return;
    }

    const { commandName } = interaction;
    switch (commandName) {
        case "add":
            await add(interaction);
            break;
        case "remove":
            await remove(interaction);
            break;
        default:
            break;
    }
})

client.login(config.masterToken);

async function add(interaction) {
    const guild = await client.guilds.resolve(config.guild);
    let aliases = config.roles.map(role => role.alias);
    if (!aliases.includes(interaction.options.getString('role'))) {
        await interaction.reply({content: 'Неизвестное название роли :worried:', ephemeral: true})
        return;
    }
    let roleData = config.roles[aliases.indexOf(interaction.options.getString('role'))];

    // Remove all
    const member = interaction.member;
    for (let r of config.roles) {
        const role = await guild.roles.resolve(r.roleID);
        member.roles.remove(role);
    }

    const role = await guild.roles.resolve(roleData.roleID);
    member.roles.add(role);

    await interaction.reply({content: ':santa: Ура, теперь у тебя есть новогодняя роль!'});
}

async function remove(interaction) {
    const guild = await client.guilds.resolve(config.guild);
    const member = interaction.member;
    for (let r of config.roles) {
        const role = await guild.roles.resolve(r.roleID);
        member.roles.remove(role);
    }

    await interaction.reply({content: 'Успешно удалены все новогодние роли', ephemeral: true})
}
