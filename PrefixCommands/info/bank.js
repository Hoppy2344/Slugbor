const { EmbedBuilder } = require('discord.js');
const PerfilSchema = require('../../schemas/PerfilSchema');
const emoji = require('../../db/emojis.js');

module.exports = {
  name: "bank",
  description: "Verifique o saldo da sua conta bancária",
  run: async (client, message, args) => {

    try {
      const user = message.author;
      const perfil = await PerfilSchema.findOne({ userId: user.id });
      if (!perfil) {
        message.reply({ content: 'Seu perfil não foi encontrado. Use !aventura criar para começar sua jornada', ephemeral: true });
        return;
      }

      const aliase = args[0]?.toLowerCase()

      if (aliase == 'depositar' || aliase == 'dep' || aliase == 'deposit') {
        let valor = args[1];

        if (args[1] == 'all' || args[1] == 'tudo') {
          valor = perfil.money;
        }
        
        if (!valor) {
          message.reply({ content: 'Você precisa especificar um valor para depositar' });
          return;
        } else if (isNaN(valor)) {
          message.reply({ content: 'O valor especificado não é um número válido'});
          return;
        } else if (valor <= 0) {
          message.reply({ content: 'O valor especificado não é válido. Use um valor maior que 0'});
          return;
        } else if (perfil.money < valor) {
          message.reply({ content: 'Você não tem dinheiro suficiente para depositar esse valor'});
          return;
        }
        perfil.money -= valor;
        perfil.bank += valor;

        const depositar = new EmbedBuilder()
          .setAuthor({ name: `Depositar`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
          .setDescription(`**Você depositou ${emoji.bajocoin}\`${valor.toLocaleString('pt-BR')}\` na sua conta bancária!**`)
          .setColor('#FBDA13')
          .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        await message.channel.send({ embeds: [depositar] })
        await perfil.save()
        
      } else if (aliase == 'sacar' || aliase == 'with' || aliase == 'withdraw') {
        let valor = args[1];

        if (args[1] == 'all' || args[1] == 'tudo') {
          valor = perfil.bank;
        }
        
        if (!valor) {
          message.reply({ content: 'Você precisa especificar um valor para sacar'});
          return;
        } else if (isNaN(valor)) {
          message.reply({ content: 'O valor especificado não é um número válido'})
          return;
        } else if (valor <= 0) {
          message.reply({ content: 'O valor especificado não é válido. Use um valor maior que 0' });
          return;
        } else if (perfil.bank < valor) {
          message.reply({ content: 'Você não tem dinheiro suficiente para sacar esse valor' });
          return;
        }
        perfil.bank -= valor;
        perfil.money += valor;

        const sacar = new EmbedBuilder()
          .setAuthor({ name: `Sacar`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
          .setDescription(`**Você sacou ${emoji.bajocoin}\`${valor.toLocaleString('pt-BR')}\` da sua conta bancária!**`)
          .setColor('#FBDA13')
          .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })

        await message.channel.send({ embeds: [sacar] })

        await perfil.save()
      }

      if (!aliase) {
        const helpEmbed = new EmbedBuilder()
            .setAuthor({ name: `Lista de Aliases Válidos`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`**Aliases Válidos:**\n> __**Sacar: \`with, withdraw, sacar\`**__\n> __**Depositar: \`dep, deposit, depositar\`**__\n\n**Como usar:**\n!bank (alias) (valor)`)
            .setColor('#FBDA13')
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })

          await message.reply({ embeds: [helpEmbed] });
      }
      
    } catch (error) {
      console.error('Erro ao fazer transação: ', error);
      message.channel.send('Ocorreu um erro ao fazer a transação');
    }
    
  }
}