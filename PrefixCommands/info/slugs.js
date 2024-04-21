const { EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const PerfilSchema = require('../../schemas/PerfilSchema');
const emojis = require('../../db/emojis.js');

module.exports = {
  name: 'lesmas',
  description: 'Exibe as lesmas possuídas',
  run: async (client, message, args) => {
    try {
      let user;

      if (message.mentions.users.size > 0) {
        user = message.mentions.users.first();
      } else if (args.length > 0 && args[0].toLowerCase() !== 'i' && args[0].toLowerCase() !== 'info') {
        user = await client.users.fetch(args[0]).catch(() => null);
      } else {
        user = message.author;
      }

      if (!user) {
        message.channel.send('Usuário não encontrado. Verifique se você mencionou corretamente um usuário ou forneceu um ID válido.');
        return;
      }

      if (user.bot) {
        message.channel.send('O usuário fornecido não parece ser um jogador humano. Talvez ele não tenha passado pelo CAPTCHA.');
        return;
      }

      const perfil = await PerfilSchema.findOne({ userId: user.id });

      if (!perfil) {
        message.channel.send('Perfil não encontrado. Use !aventura criar para começar sua jornada.');
        return;
      }

      if (perfil.lesmas.length === 0) {
        message.channel.send(`${user.tag} não possui nenhuma lesma.`);
        return;
      }

      if (args.length === 0 || (args[0].toLowerCase() !== 'i' && args[0].toLowerCase() !== 'info')) {
        const lesmasEmbed = new EmbedBuilder()
          .setTitle(`${user.tag} - Suas lesmas`)
          .setAuthor({ name: 'Lesmas', iconURL: client.user.displayAvatarURL({ dynamic: true }) })
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setColor('#FBDA13');

        perfil.lesmas.forEach((lesma, index) => {
          const emoji = emojis[lesma.nome];
          lesmasEmbed.addFields({ name: `\`${index + 1}\` - ${emoji} ${lesma.nome}`, value: `**Level:** *${lesma.level}/5* • **XP:** *${lesma.xp}/${Math.floor(lesma.level * 235)}*`, inline: false });
        });

        message.channel.send({ embeds: [lesmasEmbed] });
      } else if ((args[0].toLowerCase() === 'i' || args[0].toLowerCase() === 'info') && args.length === 2) {
        const index = parseInt(args[1]) - 1;

        if (!isNaN(index) && index >= 0 && index < perfil.lesmas.length) {
          const lesma = perfil.lesmas[index];
          const emoji = emojis[lesma.nome];
          // Carregando os dados do arquivo slugs.json
          const slugsFilePath = path.join(__dirname, '../../db/slugs.json');
          const slugsFileData = JSON.parse(await fs.readFile(slugsFilePath, 'utf-8'));

          // Encontrando o ícone com base no nome da lesma
          let lesmaIcon = null;
          for (const categoria in slugsFileData) {
            const index = slugsFileData[categoria].findIndex(lesmaData => lesmaData.nome === lesma.nome); // Corrigindo a comparação aqui
            if (index !== -1) {
              lesmaIcon = slugsFileData[categoria][index].icon;
              break;
            }
          }

          if (!lesmaIcon) {
            message.channel.send('Ícone da lesma não encontrado.');
            return;
          }

          const lesmaEmbed = new EmbedBuilder()
            .setTitle(`Detalhes da Lesma ${emoji} ${lesma.nome}`)
            .setColor('#FBDA13')
            .setImage(lesmaIcon)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: '**➠ Nome:**', value: `*${lesma.nome}*`, inline: true },
              { name: '**➠ Level:**', value: `*${lesma.level}/5*`, inline: true },
              { name: '**➠ EXp:**', value: `*${lesma.xp}/${Math.floor(lesma.level * 235)}*`, inline: true },
              { name: '**➠ Happiness:**', value: `*${lesma.happiness}%*`, inline: false },
              { name: '**➠ Habilidades:**', value: `*${lesma.habilidade}*`, inline: true },
              { name: '**➠ Elemento:**', value: `*${lesma.elemento}*`, inline: true },
              { name: '**➠ Fraqueza:**', value: `*${lesma.fraqueza}*`, inline: true },
              { name: '**➠ Status:**', value: `*Vida: ${lesma.vida} | Dano: ${lesma.poder} | Defesa: ${lesma.defesa}*`, inline: true }
            )
            .setFooter({ text: 'Infos', iconURL: client.user.displayAvatarURL({ dynamic: true }) });

          message.channel.send({ embeds: [lesmaEmbed] });
        } else {
          message.channel.send('Por favor, forneça um número de lesma válido.');
        }
      }
    } catch (erro) {
      console.error('Erro ao mostrar lesmas:', erro);
      message.channel.send('Ocorreu um erro ao mostrar as lesmas.');
    }
  },
};
