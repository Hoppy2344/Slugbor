const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const PerfilSchema = require('../../schemas/PerfilSchema');
const fs = require('fs');
const path = require('path');
const emojis = require('../../db/emojis.js');
const cavernasConfig = require('../../db/cavernas.json');

const getRandomValue = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomEnemyStatus = () => {
  const vida = getRandomValue(13, 25);
  const energia = getRandomValue(15, 25);
  const força = getRandomValue(2, 10);
  const destreza = getRandomValue(2, 12);

  return { vida, energia, força, destreza };
};

function calculaXPNecessarioParaProximoNivel(level) {
  return level * 100; // Ajuste conforme necessário
}

const getRandomValue2 = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const happinesAleatorio = getRandomValue2(1, 5);

const getRandomValue1 = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const dinheiroAleatorio = getRandomValue1(2, 15);
const expAleatoria = getRandomValue1(1, 10);

module.exports = {
  name: 'battle',
  description: 'Inicia uma batalha com um inimigo aleatório',
  run: async(client, message, args) => {
    const user = message.author;

    const perfil = await PerfilSchema.findOne({ userId: user.id });

    if (!perfil) {
      return message.channel.send({ content: 'Você não tem um perfil criado. Use o comando `!aventura criar` para criar um perfil.', ephemeral: true });
    }

    try {

      const salvarVida = perfil.vida;
      const salvarEnergia = perfil.energia;
      
      const nivelCavernaAtual = cavernasConfig[perfil.cavernaAtual];

      const npcsDisponiveis = nivelCavernaAtual.npcs;
      const inimigoName = npcsDisponiveis[Math.floor(Math.random() * npcsDisponiveis.length)];

      const lesmaPlayer = perfil.lesmas[0];
      const slugsFilePath = path.join(__dirname, '../../db/slugs.json');
const slugsFileData = JSON.parse(fs.readFileSync(slugsFilePath, 'utf-8'));

let playerLesmaIcon = null;
for (const categoria in slugsFileData) {
  const index = slugsFileData[categoria].findIndex(lesmaData => lesmaData.nome === lesmaPlayer.nome);
  if (index !== -1) {
    playerLesmaIcon = slugsFileData[categoria][index].icon;
    break;
  }
}

if (!playerLesmaIcon) {
  console.error('Ícone da lesma não encontrado.');
  return;
}
      

      if (!slugsFileData) {
        return message.channel.send({ content: 'Não foi possível carregar os dados do inimigo.', ephemeral: true });
      }

      let lesmaComum;
      const lesmasDoTipoComum = slugsFileData['Common'];
      lesmaComum = lesmasDoTipoComum[Math.floor(Math.random() * lesmasDoTipoComum.length)];

      const emojiN = emojis[lesmaComum.nome];
      const emojiP = emojis[lesmaPlayer.nome];

      const inimigoStatus = generateRandomEnemyStatus();

      var inimigo = {
        nome: inimigoName,
        vida: inimigoStatus.vida,
        força: inimigoStatus.força,
        destreza: inimigoStatus.destreza,
        energia: inimigoStatus.energia,
      };

      const acaoNpc = ['atacar', 'habilidade'];
      const acaoEscolhida = acaoNpc[Math.floor(Math.random() * acaoNpc.length)];

      let mensagemAcao = '';

      if (acaoEscolhida === 'atacar') {
        mensagemAcao = `${inimigo.nome} Atirou uma **${emojiN} \`${lesmaComum.nome}\`** em ${user.username}!`;
      } else if (acaoEscolhida === 'habilidade') {
        mensagemAcao = `${inimigo.nome} disparou uma **${emojiN} \`${lesmaComum.nome}\` que usou \`${lesmaComum.habilidade}\`** em ${user.username} e causou`;
      } else {
        mensagemAcao = 'Em breve você poderá escolher sua ação!';
      }

      const chanceEsquivaUsuario = perfil.destreza >= 10 ? Math.min(50, Math.floor(perfil.destreza / 10)) : 0;
const esquivouUsuario = Math.random() * 100 < chanceEsquivaUsuario;

const chanceEsquivaNpc = inimigo.destreza >= 10 ? Math.min(50, Math.floor(inimigo.destreza / 10)) : 0;

const esquivouNpc = Math.random() * 100 < chanceEsquivaNpc;

      
      const atacar = new ButtonBuilder()
        .setCustomId('atacar')
        .setLabel('Atacar')
        .setStyle(ButtonStyle.Primary);
      const habilidade = new ButtonBuilder()
        .setCustomId('habilidade')
        .setLabel('Habilidade')
        .setStyle(ButtonStyle.Secondary);
      const fugir = new ButtonBuilder()
        .setCustomId('fugir')
        .setLabel('Fugir')
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder()
        .addComponents(atacar, habilidade, fugir);

      const embed = new EmbedBuilder()
         .setAuthor({ name: 'Batalha', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
         .setDescription(`HoHoHo, ${user.username}! Você encontrou um ${inimigo.nome}!` + '\n' + 'Prepare-se para a batalha!' + '\n' + '\n' + '> ***Infos do seu inimigo:***' + '\n' + `**Caverna Atual:** *${perfil.cavernaAtual}*` + '\n' + `**Nome:** ${inimigo.nome}` + '\n' + `**Vida:** *${inimigo.vida}*` + '\n' + `**Energia:** *${inimigo.energia}*` + '\n' + `**Força:** *${inimigo.força}*` + '\n' + `**Destreza:** *${inimigo.destreza}*` + '\n' + `**Lesma:** *${emojiN} ${lesmaComum.nome}*` + '\n' + '\n' + 'Escolha uma ação:')
         .setColor('#FBDA13');

      const battleMessage = await message.channel.send({ embeds: [embed], components: [row] });

      const filter = (interaction) => interaction.user.id === user.id;

      const collector = battleMessage.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (interaction) => {


        if (interaction.customId === 'atacar') {
          const danoPlayer = Math.floor(perfil.força / 2 + lesmaPlayer.poder / 2);
          const danoInimigo = acaoEscolhida === 'atacar'
  ? Math.floor(inimigo.força / 2 + lesmaComum.poder / 2)
  : acaoEscolhida === 'habilidade'
    ? Math.floor(inimigo.força / 2 + lesmaComum.poder)
    : 0; 

          inimigo.vida -= danoPlayer;
          perfil.vida -= danoInimigo;
          perfil.energia -= 1;
          inimigo.energia -= 1;

          if (inimigo.vida <= 0) {
            const embedVitoria = new EmbedBuilder()
              .setAuthor({ name: 'Batalha', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
              .setDescription(`Parabéns, ${user.username}! Você derrotou o ${inimigo.nome}!` + '\n' + 'Você ganhou!')
              .addFields(
              { name: '**Recompensas**', value: `**\`💰\`Dinheiro:** ${dinheiroAleatorio}` + '\n' + `**\`💠\`XP:** ${expAleatoria}` + '\n' + `**\`✳️\`Happinnes: +${happinesAleatorio}**`, inline: true }
              )
              .setColor('#00ff00')
              .setFooter({ text: 'Vitória!', iconURL: user.displayAvatarURL({ dynamic: true }) });

            perfil.money += dinheiroAleatorio;
            perfil.xp + expAleatoria;
            lesmaPlayer.xp += expAleatoria;
            lesmaPlayer.happiness += happinesAleatorio;

            lesmaPlayer.happiness = Math.min(Math.max(happinesAleatorio, 0), 100);

  if (perfil.xp >= calculaXPNecessarioParaProximoNivel(perfil.level)) {
    perfil.level++;
    perfil.pontos += 4;
  }

  if (lesmaPlayer.xp >= calculaXPNecessarioParaProximoNivel(lesmaPlayer.level)) {
    lesmaPlayer.level++;
    lesmaPlayer.vida += 2;
    lesmaPlayer.poder += 2;
    lesmaPlayer.defesa += 2;
  }

            perfil.vida = salvarVida;
            perfil.energia = salvarEnergia;

  await perfil.save({ suppressWarning: true });
  await lesmaPlayer.save({ suppressWarning: true });
            await interaction.update({ embeds: [embedVitoria], components: [] });


          } else if (perfil.vida <= 0 || perfil.energia <= 0) {
            const embedDerrota = new EmbedBuilder()
              .setAuthor({ name: 'Batalha', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
              .setDescription(`HoHoHo, ${user.username}! Você foi derrotado pelo ${inimigo.nome}!` + '\n' + 'Você perdeu!')
              .addFields(
                { name: '**Você perdeu:**', value: `**\`💰\`Dinheiro:** -${dinheiroAleatorio}` + '\n' + `**\`✳️\`Felicidade:** -${happinesAleatorio}**`, inline: true }
              )
              .setColor('#ff0000')
              .setFooter({ text: 'Derrota!', iconURL: user.displayAvatarURL({ dynamic: true }) });

            perfil.money -= dinheiroAleatorio;
            lesmaPlayer.happiness -= happinesAleatorio;

            lesmaPlayer.happiness = Math.min(Math.max(happinesAleatorio, 0), 100);
            
            perfil.vida = salvarVida;
            perfil.energia = salvarEnergia;

            await perfil.save();

            await interaction.update({ embeds: [embedDerrota], components: [] });


          } else {
            
            const embedAtaque = new EmbedBuilder()
            .setAuthor({ name: 'Batalha', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`${user.username} atirou uma **${emojiP} \`${lesmaPlayer.nome}\`** em ${inimigo.nome} causando ***${danoPlayer}*** de dano!` + (esquivouNpc ? `\n${inimigo.nome} conseguiu esquivar do ataque de ${user.username}!` : '') + `\n${mensagemAcao} ***${danoInimigo}*** de dano` +
              (esquivouUsuario ? `\n${user.username} conseguiu esquivar do ataque de ${inimigo.nome}!` : ''))
            .addFields(
              { name: user.username, value: `**\`❤️\`Vida:** ${perfil.vida}` + '\n' + `**\`💠\`Energia:** ${perfil.energia}`, inline: true },
              { name: inimigo.nome, value: `**\`❤️\`Vida:** ${inimigo.vida}` + '\n' + `**\`💠\`Energia:** ${inimigo.energia}`, inline: true }
            )
            .setColor('#FBDA13');

            await interaction.update({ embeds: [embedAtaque], components: [row] });
          }
        } else if (interaction.customId === 'habilidade') {
          const danoHab = Math.floor(perfil.força / 2 + lesmaPlayer.poder);
          const danoInimigo = acaoEscolhida === 'atacar'
  ? Math.floor(inimigo.força / 2 + lesmaComum.poder / 2)
  : acaoEscolhida === 'habilidade'
    ? Math.floor(inimigo.força / 2 + lesmaComum.poder)
    : 0; 

            
          inimigo.vida -= danoHab;
          perfil.vida -= danoInimigo;
          perfil.energia -= 5;
          inimigo.energia -= 2;
          
          if (inimigo.vida <= 0) {
            const embedVitoria = new EmbedBuilder()
              .setAuthor({ name: 'Batalha', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
              .setDescription(`Parabéns, ${user.username}! Você derrotou o ${inimigo.nome}!` + '\n' + 'Você ganhou!')
              .addFields(
                { name: '**Recompensas**', value: `**\`💰\`Dinheiro:** ${dinheiroAleatorio}` + '\n' + `**\`💠\`XP:** ${expAleatoria}` + '\n' + `**\`✳️\`Happinnes: +${happinesAleatorio}**`, inline: true }
              )
              .setColor('#00ff00')
              .setFooter({ text: 'Vitória!', iconURL: user.displayAvatarURL({ dynamic: true }) });

            perfil.money += dinheiroAleatorio;
            perfil.xp += expAleatoria;
            lesmaPlayer.xp += expAleatoria;
            lesmaPlayer.happiness += happinesAleatorio;

            lesmaPlayer.happiness = Math.min(Math.max(happinesAleatorio, 0), 100);

  if (perfil.xp >= calculaXPNecessarioParaProximoNivel(perfil.level)) {
    perfil.level++;
    perfil.pontos += 4;
  }

  if (lesmaPlayer.xp >= calculaXPNecessarioParaProximoNivel(lesmaPlayer.level)) {
    lesmaPlayer.level++;
    lesmaPlayer.vida += 2;
    lesmaPlayer.poder += 2;
    lesmaPlayer.defesa += 2;
  }

      perfil.vida = salvarVida;
      perfil.energia = salvarEnergia;

            await perfil.save({ suppressWarning: true });
            await lesmaPlayer.save({ suppressWarning: true });

            await interaction.update({ embeds: [embedVitoria], components: [] });
                        
          } else if (perfil.vida <= 0 || perfil.energia <= 0) {
            const embedDerrota = new EmbedBuilder()
              .setAuthor({ name: 'Batalha', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
              .setDescription(`HoHoHo, ${user.username}! Você foi derrotado pelo ${inimigo.nome}!` + '\n' + 'Você perdeu!')
              .addFields(
                { name: '**Você perdeu:**', value: `**\`💰\`Dinheiro:** -${dinheiroAleatorio}` + '\n' + `**\`✳️\`Felicidade:** -${happinesAleatorio}**`, inline: true }
              )
              .setColor('#ff0000')
              .setFooter({ text: 'Derrota!', iconURL: user.displayAvatarURL({ dynamic: true }) });

            perfil.vida = salvarVida;
            perfil.energia = salvarEnergia;

            perfil.money -= dinheiroAleatorio;
            lesmaPlayer.happiness -= happinesAleatorio;

            lesmaPlayer.happiness = Math.min(Math.max(happinesAleatorio, 0), 100);

            await perfil.save();

            await interaction.update({ embeds: [embedDerrota], components: [] });

          } else {
            const embedHab = new EmbedBuilder()
            .setAuthor({ name: 'Batalha', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`${user.username} atirou uma **${emojiP} \`${lesmaPlayer.nome}\`** em ${inimigo.nome} que usou ${lesmaPlayer.habilidade} e causou ***${danoHab}*** de dano!` + (esquivouNpc ? `\n${inimigo.nome} conseguiu esquivar do ataque de ${user.username}!` : '') + `\n${mensagemAcao} ***${danoInimigo}*** de dano!` +
              (esquivouUsuario ? `\n${user.username} conseguiu esquivar do ataque de ${inimigo.nome}!` : ''))
            .addFields(
              { name: user.username, value: `**\`❤️\`Vida:** ${perfil.vida}` + '\n' + `**\`💠\`Energia:** ${perfil.energia}`, inline: true },
              { name: inimigo.nome, value: `**\`❤️\`Vida:** ${inimigo.vida}` + '\n' + `**\`💠\`Energia:** ${inimigo.energia}`, inline: true }
            )
            .setColor('#FBDA13');

            await interaction.update({ embeds: [embedHab], components: [row] });
          }
        } else if (interaction.customId === 'fugir') {
          const embedFuga = new EmbedBuilder()
            .setAuthor({ name: 'Batalha', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`Você fugiu da batalha!`)
            .setColor('#ff0000')
            .setFooter({ text: 'Derrota!', iconURL: user.displayAvatarURL({ dynamic: true }) });

            perfil.vida = salvarVida;
            perfil.energia = salvarEnergia;

            await perfil.save();

          await interaction.update({ embeds: [embedFuga], components: [] });

        }
      });

    } catch (error) {
      console.error(error);
      message.channel.send({ content: 'Ocorreu um erro ao iniciar a batalha.', ephemeral: true });
    }
  }
};