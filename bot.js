const config = require('./json/config.json')
const token = require('./json/token.json')
const Discord = require('discord.js')
const client = new Discord.Client();
const filtro = require('./json/filtro.json')

client.on('ready', () => {
    let count = 0;
    client.guilds.cache.forEach(function (data, index) {
        count += data.memberCount
    })
    console.log(`Bot: ${client.user.tag}\nNumero de Guilds: ${client.guilds.cache.size}\nNumero de Usuarios: ${count}`)
    client.user.setStatus('dnd')
    client.user.setActivity(`Meu Prefix: ${config.prefix} - Use ${config.prefix}help`)
})

client.on('message', msg => {
    if (!msg.guild.me.hasPermission('MANAGE_MESSAGES')) return;
    function removerAcento(palavra) {
        var palavraSemAcento = "";
        var caracterComAcento = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ";
        var caracterSemAcento = "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC";

        for (var i = 0; i < palavra.length; i++) {
            var char = palavra.substr(i, 1);
            var indexAcento = caracterComAcento.indexOf(char);
            if (indexAcento != -1) {
                palavraSemAcento += caracterSemAcento.substr(indexAcento, 1);
            } else {
                palavraSemAcento += char;
            }
        }

        return palavraSemAcento;
    }
    let text = msg.content.toLocaleLowerCase()
    text = removerAcento(text)
    let palavra = false
    Object.keys(filtro.palavras).forEach(chave => {
        if (text.indexOf(filtro.palavras[chave]) > -1) {
            palavra = true
        }
    })
    if (palavra) {
        let embed = new Discord.MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ format: "png" }))
            .setColor("#ff0000")
            .setDescription(`Por favor ${msg.author} não utilize palavras proibidas\n neste servidor. Visite o channel de regras !`)
            .setFooter("Palavra proibida encontrada!");
        msg.reply(embed)
        msg.delete()
    }
})

client.on('message', async msg => {
    if (msg.author.bot) return;
    if (msg.channel.type == 'dm') return;
    if (!msg.content.startsWith(config.prefix)) return;
    if (msg.content.startsWith(`<@!${client.user.id}`) || msg.content.startsWith(`<@${client.user.id}`)) return;
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const comando = args.shift().toLowerCase();
    try {
        let comandoFile = require(`./comandos/${comando}.js`)
        delete require.cache[require.resolve(`./comandos/${comando}.js`)]
        return comandoFile.run(client, msg, args)
    } catch (err) {
        console.error(`Erro: ${err}`)
    }
})

client.login(token.token)

