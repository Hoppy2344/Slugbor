const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const PerfilSchema = require('../../schemas/PerfilSchema');
const emojis = require('../../db/emojis.js');
const Canvas = require('@napi-rs/canvas');

module.exports = {
  name: "perfil",
  description: "Veja seu perfil",
  run: async(client, message, args) => {

    message.channel.sendTyping();

    let user;

            if (message.mentions.users.size > 0) {
                user = message.mentions.users.first();
            } else if (args.length > 0) {
                user = await client.users.fetch(args[0]).catch(() => null);
            } else {
                user = message.author;
            }
          
            if (user && user.bot) {
                message.channel.send('O usuário fornecido não parece ser um jogador humano. Talvez ele não tenha passado pelo CAPTCHA.');
                return;
            }

    const perfil = await PerfilSchema.findOne({ userId: user.id });
    if (!perfil) {
      return message.reply({ content: `❌ | ${user.username} não tem um perfil criado. utilize \`!aventura criar\` para iniciar uma aventura.`, ephemeral: true })
    }

    const factionName = perfil.faction === "corrupted_slinger" ? "Ghoul Slinger" : perfil.faction;

    
    const canvas = new Canvas.createCanvas(2500, 1418);
    const context = canvas.getContext('2d');

    const colors = {
      background: "#000000",
      white: "#ffffff",
      
    };

    const background = await Canvas.loadImage('https://media.discordapp.net/attachments/976673860927754324/1220555951778693160/52cec7aece3c45c3efa7ea7786daa7bf.jpg?ex=660f5e4f&is=65fce94f&hm=87c4af3c26cb48d7bb2ffa5d2ae5de8a60ca01698daf57c963bf29d3ca02101d&');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    const div = await Canvas.loadImage('https://media.discordapp.net/attachments/976673860927754324/1220484514711867615/1711026347503.png?ex=660f1bc7&is=65fca6c7&hm=2ca0eb90480593cc0704aea2351376cf260667a0d017d304a61c5f5365a8694c&');
    context.save();
context.globalAlpha = 0.5;
    context.drawImage(div, 0, 0, canvas.width, canvas.height);

    context.restore();

    const layout = await Canvas.loadImage('https://media.discordapp.net/attachments/976673860927754324/1220484515223568404/1711026287026.png?ex=660f1bc7&is=65fca6c7&hm=2fb2577551f9215807f7193c21a8119f38d1609c182337dc8212ebb4ad50f435&');
    context.drawImage(layout, 0, 0, canvas.width, canvas.height);

    function drawImageWithRoundedCorners(image, x, y, width, height, radius) {
    context.save();
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.clip();
    context.drawImage(image, x, y, width, height);
    context.restore();
    }
    
const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png' })); 
const imageSize = 418; // Tamanho da imagem do avatar
const borderRadius = 10; // Raio das bordas arredondadas

drawImageWithRoundedCorners(avatar, 285, 177, imageSize, imageSize, borderRadius);

    context.font = 'bold 75px Arial';
    context.textAlign = 'start';
    context.textBaseline = 'top';

    context.fillStyle = colors.white;
    context.fillText(user.username, 730, 240);

    context.font = 'bold 40px Arial';
    context.textAlign = 'start';
    context.textBaseline = 'top';
    
    context.fillStyle = colors.white;
    context.fillText(`Level: ${perfil.level}`, 210, 750);

    context.font = 'bold 40px Arial';
    context.textAlign = 'start';
    context.textBaseline = 'top';
    
    context.fillStyle = colors.white;
    context.fillText(`XP: ${perfil.xp}/${Math.floor(perfil.level * 110)}`, 210, 800);

    context.font = 'bold 40px Arial';
    context.textAlign = 'start';
    context.textBaseline = 'top';
    
    context.fillStyle = colors.white;
    context.fillText(`Classe: ${perfil.classe}`, 210, 850);

    context.font = 'bold 40px Arial';
    context.textAlign = 'start';
    context.textBaseline = 'top';
    
    context.fillStyle = colors.white;
    context.fillText(`Raça: ${perfil.race}`, 210, 905);

    context.font = 'bold 40px Arial';
    context.textAlign = 'start';
    context.textBaseline = 'top';
    
    context.fillStyle = colors.white;
    context.fillText(`Facção: ${factionName}`, 210, 960);

    context.font = 'bold 40px Arial';
    context.textAlign = 'start';
    context.textBaseline = 'top';
    
    context.fillStyle = colors.white;
    context.fillText(`Vida: ${perfil.vida}`, 210, 1013);

    context.font = 'bold 40px Arial';
    context.textAlign = 'start';
    context.textBaseline = 'top';
    
    context.fillStyle = colors.white;
    context.fillText(`Energia: ${perfil.energia}`, 210, 1070);

    context.font = 'bold 40px Arial';
    context.textAlign = 'start';
    context.textBaseline = 'top';
    
    context.fillStyle = colors.white;
    context.fillText(`Força: ${perfil.força}`, 210, 1128);

    context.font = 'bold 40px Arial';
    context.textAlign = 'start';
    context.textBaseline = 'top';
    
    context.fillStyle = colors.white;
    context.fillText(`Destreza: ${perfil.destreza}`, 210, 1190);


    const buffer = await canvas.encode('png');
    const attachment = new AttachmentBuilder(buffer, { name: 'perfil.png' });

    await message.reply({ files: [attachment] });
    
  }
}