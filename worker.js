const {Client, Intents} = require('discord.js');
const config = require('./config.json')

const client = new Client({intents: [Intents.FLAGS.GUILDS]});

client.once('ready', async () => {
    console.log(`Ready!`);
    const roleData = config.roles[process.argv[3]];

    const guild = await client.guilds.resolve(config.guild);
    let role = await guild.roles.resolve(roleData.roleID);

    let colorIndex = 0;
    setInterval(async () => {
        role = await role.setColor(roleData.colors[colorIndex]);
        console.log(`Updated role color. New color: #${decimalToHex(role.color)}`)
        if (++colorIndex >= roleData.colors.length) colorIndex = 0;
    }, config.delay);
});

function decimalToHex(d) {
    let hex = Number(d).toString(16);
    hex = "000000".substr(0, 6 - hex.length) + hex;
    return hex.toUpperCase();
}

client.login(process.argv[2]);