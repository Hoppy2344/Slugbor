const { EmbedBuilder } = require('discord.js');
const PerfilSchema = require('../../schemas/PerfilSchema');
const emojis = require('../../db/emojis.js');
const fs = require('fs');
const path = require('path');
const ms = require("ms")
const cooldowns = {}
const cavernas = require('../../db/cavernas.json');

function calculaXPNecessarioParaProximoNivel(level) {
  return level * 110;
}

module.exports = {
  name: 'explore',
  description: 'explore sua caverna',
  run: async (client, message, args) => {
    
    try {
      const perfil = await PerfilSchema.findOne({ userId: message.author.id });
      
      if (!perfil) {
        await message.reply({ content: `Desculpe! Procurei por todo canto mas não localizei o seu perfil. Tente criar um com !aventura criar`, ephemeral: true });
        return;
      }
      
      const cavernaAtual = cavernas[perfil.cavernaAtual];
      const slugsFile = path.resolve(__dirname, '../../db/slugs.json');
      const slugsData = JSON.parse(fs.readFileSync(slugsFile, 'utf8'));
      const slugsDisponiveis = cavernaAtual.lesmasDisponiveis;

      
      if (args[0] === 'status') {
        const exploreStats = new EmbedBuilder()
          .setAuthor({ name: 'Explore Status', iconURL: client.user.displayAvatarURL() })
          .setDescription(`**Caverna Atual:**\n${perfil.cavernaAtual}\n**Lesmas Disponiveis:**\n**\`${slugsDisponiveis.join(', ')}\`**\n**Dinheiro:**\n**\`Minimo de: 100; Máximo de: 500\`**\n**XP:**\n**\`Minimo de: 2; Máximo de: 22\`**`)
          .setColor('#fbd013')
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 128 }));

        await message.channel.send({ embeds: [exploreStats] });
        return;
      }

      if (!cooldowns[message.author.id]) cooldowns[message.author.id] = { lastCmd: null };
      let ultimoCmd = cooldowns[message.author.id].lastCmd;

     

       if (ultimoCmd && Date.now() - ultimoCmd < 0) {
        const tempoRestante = ms(ultimoCmd - Date.now(), { long: true });
        await message.reply({ content: `Você está em cooldown. Espere ${tempoRestante} antes de explorar novamente.`, ephemeral: true });
        return;
      }

      const cooldownTime = ms("1h"); // Tempo de cooldown em milissegundos

      if (ultimoCmd && Date.now() - ultimoCmd < cooldownTime) {
        const tempoRestante = ms(cooldownTime - (Date.now() - ultimoCmd), { long: true });
        await message.reply({ content: `Você está em cooldown. Espere ${tempoRestante} antes de explorar novamente.`, ephemeral: true });
        return;
      }

      cooldowns[message.author.id].lastCmd = Date.now() + cooldownTime;
      

      const chance = Math.floor(Math.random() * 100);
      let mensagem = '';

      if (chance < 40) { 
          let lesmaEncontrada = null;

        const lesmaAleatoria = slugsDisponiveis[Math.floor(Math.random() * slugsDisponiveis.length)];
        
        const raridades = ["Common", "Uncommon", "Rare", "Ultra Rare", "Extremely Rare"];
          for (const raridade of raridades) {
            
            const lesmasDoTipo = slugsData[raridade];
            lesmaEncontrada = lesmasDoTipo.find(lesma => lesma.nome === lesmaAleatoria);
            if (lesmaEncontrada) {
              break; 
            }
          }
          
          if (lesmaEncontrada) {
            perfil.lesmas.push(lesmaEncontrada);
            const emoji = emojis[lesmaEncontrada.nome];
            mensagem += `*\`⟨🔰⟩\` ➠ __Durante sua exploração uma lesma começou a te seguir, você ganhou uma nova lesma: ${emoji} \`${lesmaEncontrada.nome}\`__*`;
          } else {
            mensagem += `Lesma não encontrada.`;
          }
      } else if (chance < 90) { 
        const dinheiroEncontrado = Math.floor(Math.random() * 400) + 100; 
        perfil.money += dinheiroEncontrado;
        mensagem += `*\`⟨💰⟩\` ➠ __Você encontrou um saco estranho... Ao abri-lo você ganhou \`${dinheiroEncontrado}\` de bajocoin!__*`;
      } else { 
        const xpEncontrado = Math.floor(Math.random() * 20) + 2; 
        perfil.xp += xpEncontrado;
        mensagem += `*\`⟨💠⟩\` ➠ __Você caminhou pela caverna e fez o reconhecimento do local, você ganhou: \`${xpEncontrado}\` de EXP!__*`;

        if (perfil.xp >= calculaXPNecessarioParaProximoNivel(perfil.level)) {
          perfil.level++;
          perfil.pontos += 4;
          mensagem += `\n> *Parabéns ${message.author} você acabou de chegar ao nível \`⏫${perfil.level}\`*`;
          perfil.xp = 0;
        }
      }

      await perfil.save();

      const embed = new EmbedBuilder()
        .setAuthor({ name: 'Explore', iconURL: client.user.displayAvatarURL() })
        .setDescription(`${mensagem}`)
        .setColor('#fbd013')
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 128 }))
        .setTimestamp();
      await message.channel.send({ content: `${message.author}`, embeds: [embed] });
        
    } catch (error) {
      console.error(error);
      await message.reply({ content: `Ocorreu um erro ao tentar executar sua busca`, ephemeral: true });
    }
  }
};
