const fs = require('fs');
const path = require('path');
const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const PerfilSchema = require('../../schemas/PerfilSchema');

module.exports = {
    name: 'aventura',
    description: 'Inicia a jornada',
    run: async (client, message, args) => {

      const user = message.author;

           const existingProfile = await PerfilSchema.findOne({ userId: user.id })
      
        
       if (args[0] === 'criar') {
            if (existingProfile) {
                return message.channel.send('Você já possui um perfil! Não é possível criar outro.');
            }
          
            const caminhoLesmas = path.join(__dirname, '../../db/slugs.json');
            const dados = fs.readFileSync(caminhoLesmas, 'utf8');
            const lesmas = JSON.parse(dados);

           const caminhoShooter = path.join(__dirname, '../../db/shooters.json');
            const dados2 = fs.readFileSync(caminhoShooter, 'utf8');
            const shooters = JSON.parse(dados2);

            if (!lesmas) {
                message.channel.send('Erro ao carregar as cartas.');
                return;
            }

            let perfil = await PerfilSchema.findOne({ userId: user.id });

            if (!perfil) {
                message.channel.send('Bem-vindo à sua jornada!');
                perfil = new PerfilSchema({
                    userId: user.id,
                    race: 'A escolher',
                    classe: 'A escolher',
                    faction: 'A escolher',
                    level: 1,
                    xp: 0,
                    vida: 20,
                    energia: 10,
                    força: 1,
                    destreza: 1,
                    money: 100,
                    lesmas: [],
                    inventario: [],
                    shooter: []
                });
            }

            await perfil.save();

            const initialEmbed = new EmbedBuilder()
              .setAuthor({ name: 'Registro', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`***╔══════════
    ↻  𝘐𝘥: ${user.id}
                  ══════════╝***

**➠ 𝘕𝘰𝘮𝘦:** *${user.username}*
**➠ Level:** *${perfil.level}*
**➠ XP:** *${perfil.xp}/${Math.floor(perfil.level * 100)}*
**➠ 𝘍𝘢𝘤çã𝘰:** *${perfil.faction}*
**➠ 𝘙𝘢ç𝘢:** *${perfil.race}*
**➠ 𝘊𝘭𝘢𝘴𝘴𝘦:** *${perfil.classe}*
**➠ 𝘓𝘢𝘯ç𝘢𝘥𝘰𝘳:** *Nenhum*
╭
       *✗  𝘝𝘪𝘥𝘢: ${perfil.vida}
       ✗  𝘌𝘯𝘦𝘳𝘨𝘪𝘢: ${perfil.energia}
       ✗  𝘍𝘰𝘳ç𝘢: ${perfil.força}
       ✗  𝘋𝘦𝘴𝘵𝘳𝘦𝘻𝘢: ${perfil.destreza}*
                                    ╯
**𝘓𝘦𝘴𝘮𝘢: Nenhuma
𝘋𝘪𝘯𝘩𝘦𝘪𝘳𝘰: ${perfil.money}**`)
              
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor('#FBDA13')

            const initialMessage = await message.channel.send({ embeds: [initialEmbed] });

            const raceSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('race')
                .setPlaceholder('Escolha sua raça')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Humano')
                        .setDescription('Raça humano\n+2 de vida\n+1 de energia')
                        .setValue('humano'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Cavernoide')
                        .setDescription('Raça Cavernoide\n+1 de vida\n+2 de destreza.')
                        .setValue('cavernoide'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Tecno Troll')
                        .setDescription('Raça Tecno Troll\n+2 de vida\n+2 de força')
                        .setValue('tecno')
                );

            const raceActionRow = new ActionRowBuilder().addComponents(raceSelectMenu);

            
            const chooseRaceEmbed = new EmbedBuilder()
                .setDescription('Escolha sua raça:')
                .setColor('#00ff00')
                .setFooter({ text: '1/4', iconURL: user.displayAvatarURL({ dynamic: true }) })

            const chooseRaceMessage = await message.channel.send({ embeds: [chooseRaceEmbed], components: [raceActionRow] });

            const collectorFilter = (interaction) => interaction.user.id === user.id && interaction.isStringSelectMenu();

            const collector = chooseRaceMessage.createMessageComponentCollector({
                filter: collectorFilter,
                time: 60000,
                max: 1 
            });

            collector.on('collect', async (interaction) => {
                const chosenRace = interaction.values[0];

              const raceRemap = {
        'humano': 'Humano',
        'cavernoide': 'Cavernoide',
        'tecno': 'Tecno Troll'
      };

                const races = raceRemap[chosenRace];

                switch (chosenRace) {
                    case 'humano':
                        perfil.vida += 2;
                        perfil.energia += 1;
                        break;
                    case 'cavernoide':
                        perfil.vida += 1;
                        perfil.destreza += 2;
                        break;
                    case 'tecno':
                        perfil.vida += 2;
                        perfil.força += 2;
                        break;
                    default:
                        break;
                }

                perfil.race = races;

                await perfil.save();

                
              const updatedEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Registro', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`***╔══════════
    ↻  𝘐𝘥: ${user.id}
                  ══════════╝***

**➠ 𝘕𝘰𝘮𝘦:** *${user.username}*
**➠ Level:** *${perfil.level}*
**➠ XP:** *${perfil.xp}/${Math.floor(perfil.level * 100)}*
**➠ 𝘍𝘢𝘤çã𝘰:** *${perfil.faction}*
**➠ 𝘙𝘢ç𝘢:** *${perfil.race}*
**➠ 𝘊𝘭𝘢𝘴𝘴𝘦:** *${perfil.classe}*
**➠ 𝘓𝘢𝘯ç𝘢𝘥𝘰𝘳:** *Nenhum*
╭
       *✗  𝘝𝘪𝘥𝘢: ${perfil.vida}
       ✗  𝘌𝘯𝘦𝘳𝘨𝘪𝘢: ${perfil.energia}
       ✗  𝘍𝘰𝘳ç𝘢: ${perfil.força}
       ✗  𝘋𝘦𝘴𝘵𝘳𝘦𝘻𝘢: ${perfil.destreza}*
                                    ╯
**𝘓𝘦𝘴𝘮𝘢: Nenhuma
𝘋𝘪𝘯𝘩𝘦𝘪𝘳𝘰: ${perfil.money}**`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor('#FBDA13')
              

    await initialMessage.edit({ embeds: [updatedEmbed], components: [] });

        chooseRaceMessage.delete().catch(console.error);
              

         const classSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('class')
                .setPlaceholder('Escolha sua classe')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Sniper')
                        .setDescription('Classe Sniper\n+5 de destreza')
                        .setValue('sniper'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Paladino')
                        .setDescription('Classe Paladino\n+5 de energia')
                        .setValue('paladino'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Guerreiro')
                        .setDescription('Classe Guerreiro\n+5 de força')
                        .setValue('guerreiro'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Tank')
                        .setDescription('Classe Tank\n+5 de vida')
                        .setValue('tank')
                );

            const classActionRow = new ActionRowBuilder().addComponents(classSelectMenu);

            const chooseClassEmbed = new EmbedBuilder()
                .setDescription('Escolha sua classe:')
                .setColor('#00ff00')
                .setFooter({ text: '2/4', iconURL: user.displayAvatarURL({ dynamic: true }) })

          const chooseClassMessage = await message.channel.send({ embeds: [chooseClassEmbed], components: [classActionRow] });

            const classCollectorFilter = (interaction) => interaction.user.id === user.id && interaction.isStringSelectMenu();

            const classCollector = chooseClassMessage.createMessageComponentCollector({
                filter: classCollectorFilter,
                time: 60000,
                max: 1
            });

            classCollector.on('collect', async (interaction) => {
                const chosenClass = interaction.values[0];

                switch (chosenClass) {
                    case 'sniper':
                        perfil.destreza += 5;
                        break;
                    case 'paladino':
                        perfil.energia += 5;
                        break;
                    case 'guerreiro':
                        perfil.força += 5;
                        break;
                    case 'tank':
                        perfil.vida += 5;
                        break;
                    default:
                        break;
                }

                perfil.classe = chosenClass;

                await perfil.save();

                
              const updatedEmbed2 = new EmbedBuilder()
                .setAuthor({ name: 'Registro', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`***╔══════════
    ↻  𝘐𝘥: ${user.id}
                  ══════════╝***

**➠ 𝘕𝘰𝘮𝘦:** *${user.username}*
**➠ Level:** *${perfil.level}*
**➠ XP:** *${perfil.xp}/${Math.floor(perfil.level * 100)}*
**➠ 𝘍𝘢𝘤çã𝘰:** *${perfil.faction}*
**➠ 𝘙𝘢ç𝘢:** *${perfil.race}*
**➠ 𝘊𝘭𝘢𝘴𝘴𝘦:** *${perfil.classe}*
**➠ 𝘓𝘢𝘯ç𝘢𝘥𝘰𝘳:** *Nenhum*
╭
       *✗  𝘝𝘪𝘥𝘢: ${perfil.vida}
       ✗  𝘌𝘯𝘦𝘳𝘨𝘪𝘢: ${perfil.energia}
       ✗  𝘍𝘰𝘳ç𝘢: ${perfil.força}
       ✗  𝘋𝘦𝘴𝘵𝘳𝘦𝘻𝘢: ${perfil.destreza}*
                                    ╯
**𝘓𝘦𝘴𝘮𝘢: Nenhuma
𝘋𝘪𝘯𝘩𝘦𝘪𝘳𝘰: ${perfil.money}**`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor('#FBDA13')

    await initialMessage.edit({ embeds: [updatedEmbed2], components: [] });

      chooseClassMessage.delete().catch(console.error);
              
              const factionSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('faction')
        .setPlaceholder('Escolha sua facção')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Slinger')
                .setDescription('Facção do bem, começa com uma lesma aleatória da classe Comum.')
                .setValue('slinger'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Corrupted Slinger')
                .setDescription('Ganhará uma cursed slug de começo e só poderá ter lesmas corrompidas.')
                .setValue('corrupted_slinger')
        );

    const factionActionRow = new ActionRowBuilder().addComponents(factionSelectMenu);

    const chooseFactionEmbed = new EmbedBuilder()
        .setDescription('Escolha sua facção:')
        .setColor('#00ff00')
        .setFooter({ text: '3/4', iconURL: user.displayAvatarURL({ dynamic: true }) })

      const chooseFactionMessage = await message.channel.send({ embeds: [chooseFactionEmbed], components: [factionActionRow] });

    const collectorFilterFaction = (interaction) => interaction.user.id === user.id && interaction.isStringSelectMenu();
    const factionCollector = chooseFactionMessage.createMessageComponentCollector({
        filter: collectorFilterFaction,
        time: 60000,
        max: 1
    });

    factionCollector.on('collect', async (interaction) => {
      const chosenFaction = interaction.values[0];
      let lesmaComum;

switch (chosenFaction) {
    case 'slinger':
        const lesmasDoTipoComum = lesmas['Common'];
            lesmaComum = lesmasDoTipoComum[Math.floor(Math.random() * lesmasDoTipoComum.length)];
            perfil.lesmas.push(lesmaComum);
        break;
    case 'corrupted_slinger':
        const lesmasDoTipoGComum = lesmas['Ghoul Common'];
            lesmaComum = lesmasDoTipoGComum[Math.floor(Math.random() * lesmasDoTipoGComum.length)];
            perfil.lesmas.push(lesmaComum);
        break;
    default:
        break;
}

perfil.faction = chosenFaction;

await perfil.save();

const updatedEmbed3 = new EmbedBuilder()
  .setAuthor({ name: 'Registro', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
    .setDescription(`***╔══════════
    ↻  𝘐𝘥: ${user.id}
                  ══════════╝***

**➠ 𝘕𝘰𝘮𝘦:** *${user.username}*
**➠ Level:** *${perfil.level}*
**➠ XP:** *${perfil.xp}/${Math.floor(perfil.level * 100)}*
**➠ 𝘍𝘢𝘤çã𝘰:** *${perfil.faction}*
**➠ 𝘙𝘢ç𝘢:** *${perfil.race}*
**➠ 𝘊𝘭𝘢𝘴𝘴𝘦:** *${perfil.classe}*
**➠ 𝘓𝘢𝘯ç𝘢𝘥𝘰𝘳:** *Nenhum*
╭
       *✗  𝘝𝘪𝘥𝘢: ${perfil.vida}
       ✗  𝘌𝘯𝘦𝘳𝘨𝘪𝘢: ${perfil.energia}
       ✗  𝘍𝘰𝘳ç𝘢: ${perfil.força}
       ✗  𝘋𝘦𝘴𝘵𝘳𝘦𝘻𝘢: ${perfil.destreza}*
                                    ╯
**𝘓𝘦𝘴𝘮𝘢: ${lesmaComum.nome}
𝘋𝘪𝘯𝘩𝘦𝘪𝘳𝘰: ${perfil.money}**`)
    .setThumbnail(lesmaComum.icon)
    .setColor('#00ff00');

    await initialMessage.edit({ embeds: [updatedEmbed3], components: [] });

      chooseFactionMessage.delete().catch(console.error);
        
      const shooterSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('shooter')
        .setPlaceholder('Escolha seu lançador')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Lançador azul')
                .setDescription('Um lançador inicial.')
                .setValue('azul'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Lançador ciano')
                .setDescription('Um lancador inicial.')
                .setValue('ciano'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Lançador amarelo')
                .setDescription('Um lancador inicial.')
                .setValue('amarelo'),
        );

    const shooterActionRow = new ActionRowBuilder().addComponents(shooterSelectMenu);

    const chooseShooterEmbed = new EmbedBuilder()
        .setDescription('Escolha seu lançador inicial\nLançadores iniciais são apenas cosméticos, sendo possível aprimora-los futuramente.')
        .setImage('https://media.discordapp.net/attachments/976673860927754324/1211827423939788840/7_Sem_Titulo_20240226185941.png')
        .setColor('#00ff00')
        .setFooter({ text: '4/4', iconURL: user.displayAvatarURL({ dynamic: true }) })

     const chooseShooterMessage = await message.channel.send({ embeds: [chooseShooterEmbed], components: [shooterActionRow] });

    const collectorFilterShooter = (interaction) => interaction.user.id === user.id && interaction.isStringSelectMenu();
    const shooterCollector = chooseShooterMessage.createMessageComponentCollector({
        filter: collectorFilterShooter,
        time: 60000,
        max: 1
    });

    shooterCollector.on('collect', async (interaction) => {
      const chosenShooter = interaction.values[0];

      const shooterRemap = {
        'azul': 'Lançador Azul',
        'ciano': 'Lançador Ciano',
        'amarelo': 'Lançador Amarelo'
      };
      
      const shootersData = shooters.inicial.find(shooter => shooter.nome === shooterRemap[chosenShooter]);
      
    switch (chosenShooter) {
        case 'azul':
            perfil.shooter.push(shootersData);
            break;
        case 'ciano':
            perfil.shooter.push(shootersData);
        case 'amarelo':
            perfil.shooter.push(shootersData);
            break;
        default:
            break;
    }

    await perfil.save();
      
const updatedEmbed4 = new EmbedBuilder()
  .setAuthor({ name: 'Registro Concluído', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
    .setDescription(`***╔══════════
    ↻  𝘐𝘥: ${user.id}
                  ══════════╝***

**➠ 𝘕𝘰𝘮𝘦:** *${user.username}*
**➠ Level:** *${perfil.level}*
**➠ XP:** *${perfil.xp}/${Math.floor(perfil.level * 100)}*
**➠ 𝘍𝘢𝘤çã𝘰:** *${perfil.faction}*
**➠ 𝘙𝘢ç𝘢:** *${perfil.race}*
**➠ 𝘊𝘭𝘢𝘴𝘴𝘦:** *${perfil.classe}*
**➠ 𝘓𝘢𝘯ç𝘢𝘥𝘰𝘳:** *${shootersData.nome}*
╭
       *✗  𝘝𝘪𝘥𝘢: ${perfil.vida}
       ✗  𝘌𝘯𝘦𝘳𝘨𝘪𝘢: ${perfil.energia}
       ✗  𝘍𝘰𝘳ç𝘢: ${perfil.força}
       ✗  𝘋𝘦𝘴𝘵𝘳𝘦𝘻𝘢: ${perfil.destreza}*
                                    ╯
**𝘓𝘦𝘴𝘮𝘢: ${lesmaComum.nome}
𝘋𝘪𝘯𝘩𝘦𝘪𝘳𝘰: ${perfil.money}**`)
    .setThumbnail(shootersData.icon)
    .setColor('#00ff00')
  
      await initialMessage.edit({ embeds: [updatedEmbed4], components: [] });
        chooseShooterMessage.delete().catch(console.error);

    });
    });

});

    });

      } else if (args[0] === 'resetar') {
        if (existingProfile) {
                await PerfilSchema.findOneAndDelete({ userId: user.id });
                return message.channel.send('Perfil resetado com sucesso!');
            } else {
                return message.channel.send('Você ainda não possui um perfil para resetar.');
      }
       }

      if (!args[0]) {
        const embed2 = new EmbedBuilder()
          .setTitle('Sintaxe inválida!')
          .setDescription('Use o comando corretamente:\n\n' + '`!aventura criar` - Cria um perfil\n' + '`!aventura resetar` - Reseta seu perfil')
          .setColor('#ff0000');

        message.channel.send({ embeds: [embed2] });
      }
    }
};