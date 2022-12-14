const {  voice, mesaj2, star, miniicon } = require("../../configs/emojis.json");
const messageUserChannel = require("../../schemas/messageUserChannel");
const voiceUserChannel = require("../../schemas/voiceUserChannel");
const messageUser = require("../../schemas/messageUser");
const voiceUser = require("../../schemas/voiceUser");
const voiceUserParent = require("../../schemas/voiceUserParent");
const moment = require("moment");
const inviterSchema = require("../../schemas/inviter");
require("moment-duration-format");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const conf = require("../../configs/sunucuayar.json")
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    conf: {
      aliases: ["me","stat"],
      name: "stat",
      help: "stat"
    },
  
run: async (client, message, args, embed, prefix) => {

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    const inviterData = await inviterSchema.findOne({ guildID: message.guild.id, userID: member.user.id });
    const total = inviterData ? inviterData.total : 0;
    const regular = inviterData ? inviterData.regular : 0;
    const bonus = inviterData ? inviterData.bonus : 0;
    const leave = inviterData ? inviterData.leave : 0;
    const fake = inviterData ? inviterData.fake : 0;

    const category = async (parentsArray) => {
        const data = await voiceUserParent.find({ guildID: message.guild.id, userID: member.id });
        const voiceUserParentData = data.filter((x) => parentsArray.includes(x.parentID));
        let voiceStat = 0;
        for (var i = 0; i <= voiceUserParentData.length; i++) {
          voiceStat += voiceUserParentData[i] ? voiceUserParentData[i].parentData : 0;
        }
        return moment.duration(voiceStat).format("H [saat], m [dakika] s [saniye]");
      };
      
      const Active1 = await messageUserChannel.find({ guildID: message.guild.id, userID: member.id }).sort({ channelData: -1 });
      const Active2 = await voiceUserChannel.find({ guildID: message.guild.id, userID: member.id }).sort({ channelData: -1 });
      let messageTop;
      Active1.length > 0 ? messageTop = Active1.splice(0, 5).map(x => `<#${x.channelID}>: \`${Number(x.channelData).toLocaleString()} mesaj\``).join("\n") : messageTop = "Veri bulunmuyor."

      const messageData = await messageUser.findOne({ guildID: message.guild.id, userID: member.id });
      const voiceData = await voiceUser.findOne({ guildID: message.guild.id, userID: member.id });
      const messageWeekly = messageData ? messageData.weeklyStat : 0;
      const voiceWeekly = moment.duration(voiceData ? voiceData.weeklyStat : 0).format("H [saat], m [dakika]");
      const messageDaily = messageData ? messageData.dailyStat : 0;
      const voiceDaily = moment.duration(voiceData ? voiceData.dailyStat : 0).format("H [saat], m [dakika]");

      const row = new MessageActionRow()
      .addComponents(

  new MessageButton()
  .setCustomId("main")
  .setLabel("???? Ana Sayfa")
  .setStyle("SECONDARY"),

  new MessageButton()
  .setCustomId("ses")
  .setLabel("???? Ses Detaylar??")
  .setStyle("SECONDARY"),

  new MessageButton()
  .setCustomId("mes")
  .setLabel("?????? Mesaj Detaylar??")
  .setStyle("SECONDARY"),
  );


      embed.setDescription(`${member.toString()} ??yesinin \`${moment(Date.now()).format("LLL")}\` tarihinden  itibaren \`${message.guild.name}\` sunucusunda toplam ses ve mesaj bilgileri a??a????da belirtilmi??tir.`)
.addFields(
{ name: "__**Toplam Ses**__",  value: `
\`\`\`fix
${moment.duration(voiceData ? voiceData.topStat : 0).format("H [saat], m [dakika]")}
\`\`\`
`, inline: true },
{ name: "__**Toplam Mesaj**__",  value: `
\`\`\`fix
${messageData ? messageData.topStat : 0} mesaj
\`\`\`
`, inline: true },
{ name:"__**Toplam Davet**__",  value: `
\`\`\`fix
${inviterData ? `${total} regular`: "Veri bulunmuyor."} 
\`\`\`
`, inline: true },
 )

embed.addField(`${star} **Sesli Sohbet ??statisti??i**`, `

${voice} **Genel Toplam Ses :** \`${moment.duration(voiceData ? voiceData.topStat : 0).format("H [saat], m [dakika]")}\`
${mesaj2} **Genel Toplam Mesaj :** \`${messageData ? messageData.topStat : 0} mesaj\`

${voice} **Haftal??k Ses :** \`${voiceWeekly}\`
${mesaj2} **Haftal??k Chat :** \`${Number(messageWeekly).toLocaleString()} mesaj\`

${voice} **G??nl??k Ses :** \`${voiceDaily}\`
${mesaj2} **G??nl??k Chat :** \`${Number(messageDaily).toLocaleString()} mesaj\`

${star} **Davetleri :** **${total}** (**${regular}** ger??ek, **${bonus}** bonus, **${leave}** ayr??lm????, **${fake}** fake)
${star} **Daha geni?? ??apl?? bilgilere eri??mek i??in l??tfen a??a????daki butonlar?? kullan??n??z!** 
`, false);

      let msg = await message.channel.send({ embeds: [embed], components: [row]})

      const filter = (xd) => xd.user.id == message.author.id;
      let collector =  msg.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 99999999 })

collector.on("collect", async (button) => {
if(button.customId === "ses") {
  await button.deferUpdate();

const embeds = new MessageEmbed()
.setDescription(`${member.toString()} ??yesinin \`${moment(Date.now()).format("LLL")}\` tarihinden  itibaren \`${message.guild.name}\` sunucusunda toplam ses bilgileri a??a????da belirtilmi??tir.`)
.addFields(
{ name: "__**Toplam Ses**__",  value: `
\`\`\`fix
${moment.duration(voiceData ? voiceData.topStat : 0).format("H [saat], m [dakika]")}
\`\`\`
`, inline: true },
{ name: "__**Haftal??k Ses**__",  value: `
\`\`\`fix
${voiceWeekly}
\`\`\`
`, inline: true },
{ name:"__**G??nl??k Ses**__",  value: `
\`\`\`fix
${voiceDaily}
\`\`\`
`, inline: true },
)

  embeds.addField(`${star} **Sesli Sohbet ??statisti??i**`, `
${miniicon} Toplam: \`${moment.duration(voiceData ? voiceData.topStat : 0).format("H [saat], m [dakika]")}\`
${miniicon} Public Odalar: \`${await category(conf.publicParents)}\`
${miniicon} Secret Odalar: \`${await category(conf.privateParents)}\`
${miniicon} Alone Odalar: \`${await category(conf.aloneParents)}\`
${miniicon} Y??netim Yetkili Odalar??: \`${await category(conf.funParents)}\`
${miniicon} Kay??t Odalar??: \`${await category(conf.registerParents)}\`
 `, false);

msg.edit({
  embeds: [embeds],
  components : [row]
})}
if(button.customId === "mes") {
  await button.deferUpdate();

const embeds = new MessageEmbed()
.setDescription(`${member.toString()} ??yesinin \`${moment(Date.now()).format("LLL")}\` tarihinden  itibaren \`${message.guild.name}\` sunucusunda toplam mesaj bilgileri a??a????da belirtilmi??tir.`)

.addFields(
{ name: "__**Toplam Mesaj**__",  value: `
\`\`\`fix
${messageData ? messageData.topStat : 0} mesaj
\`\`\`
`, inline: true },
{ name: "__**Haftal??k Mesaj**__",  value: `
\`\`\`fix
${Number(messageWeekly).toLocaleString()} mesaj
\`\`\`
`, inline: true },
{ name:"__**G??nl??k Mesaj**__",  value: `
\`\`\`fix
${Number(messageDaily).toLocaleString()} mesaj
\`\`\`
`, inline: true },
)
embeds.addField(`${star} **Mesaj ??statisti??i**`, `
${messageTop}
`, false);
msg.edit({
  embeds: [embeds],
  components : [row]
})}
if(button.customId === "main") {
  await button.deferUpdate();

msg.edit({
  embeds: [embed],
  components : [row]
})}
})
},
};
  
