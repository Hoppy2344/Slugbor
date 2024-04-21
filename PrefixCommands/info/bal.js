const { EmbedBuilder } = require('discord.js');
const emoji = require('../../db/emojis.js');
const PerfilSchema = require('../../schemas/PerfilSchema');

module.exports = {
  name: "bal",
  description: "Confira sua carteira",
  run: async (client, message, args) => {

    try {
      const user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
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

      const embed = new EmbedBuilder()
        .setAuthor({ name: `Carteira de ${user.username}`, iconURL: user.displayAvatarURL({ dynamic: true }) }) 
        .addFields(
          { name: `Carteira`, value: `${emoji.bajocoin} **${perfil.money.toLocaleString('pt-BR')}**`, inline: true },
          { name: `Banco`, value: `💰 **${perfil.bank.toLocaleString('pt-BR')}**`, inline: true }
        )
        .setColor('#FBDA13')
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erro ao mostrar saldo:', error);
      message.channel.send('Ocorreu um erro ao mostrar o saldo.');
    }
    
  }
};