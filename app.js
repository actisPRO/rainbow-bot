const {Client, Intents} = require('discord.js');
const config = require('./config.json')
const {exec} = require('child_process');
const util = require("util");

const client = new Client({intents: [Intents.FLAGS.GUILDS]});

client.once('ready', () => {
    console.log('MASTER: Rainbow master is ready!');
    console.log('MASTER: Launching workers...');

    for (let i = 0; i < config.roles.length; ++i) {
        createWorker(i);
    }
});

client.on('rateLimit', (rateLimitInfo) => {
    console.warn('MASTER: Hit ratelimit!');
    console.warn(util.inspect(rateLimitInfo))
})


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

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

function createWorker(roleIndex) {
    let worker = exec(`node worker.js ${config.roles[roleIndex].workerToken} ${roleIndex}`);
    worker.stdout.on('data', (data) => {
        console.log(`WORKER ${roleIndex}: ${data.replace(/[\n\t\r]/g, "")}`);
    })
    worker.stderr.on('data', (data) => {
        console.warn(`WORKER ${roleIndex}: ${data.replace(/[\n\t\r]/g, "")}`);
    })
    worker.on('exit', (code, signal) => {
        let reason = code ? "Exited with code " + code : "Terminated with signal " + signal;
        console.error(`WORKER ${roleIndex}: ${reason}.`);

        createWorker(roleIndex);
    })
}

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

    console.log(`MASTER: Fulfilled add request from user ${interaction.member.displayName}#${interaction.user.discriminator}`)
    await interaction.reply({content: ':santa: Ура, теперь у тебя есть новогодняя роль!'});
}

async function remove(interaction) {
    const guild = await client.guilds.resolve(config.guild);
    const member = interaction.member;
    for (let r of config.roles) {
        const role = await guild.roles.resolve(r.roleID);
        member.roles.remove(role);
    }

    console.log(`MASTER: Fulfilled remove request from user ${interaction.member.displayName}#${interaction.user.discriminator}`)
    await interaction.reply({content: 'Успешно удалены все новогодние роли', ephemeral: true})
}
