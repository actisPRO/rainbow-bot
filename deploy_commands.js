const {SlashCommandBuilder} = require('@discordjs/builders');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const {masterID, guild, masterToken} = require('./config.json');

const add = new SlashCommandBuilder()
    .setName('add')
    .setDescription('Добавляет новогоднюю радужную роль')
    .addStringOption(option =>
        option.setName('role')
            .setDescription('Название роли')
            .setRequired(true)
            .addChoice('Rainbow 1', '1'));

const remove = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Убирает новогоднюю радужную роль')

const commands = [
    add,
    remove
]
    .map(command => command.toJSON());

const rest = new REST({version: '9'}).setToken(masterToken);

rest.put(Routes.applicationGuildCommands(masterID, guild), {body: commands})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);