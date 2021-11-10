const Discord = require("discord.js");
const client = new Discord.Client();
const ayarlar = require("./ayarlar.js");
const fs = require("fs");
const db = require("croxydb");
const chalk = require("chalk");
require("./util/eventLoader")(client);




//
const express = require("express");
const app = express();
const http = require("http");
app.get("/", (request, response) => {
  console.log(`Uptime Başarılı`);
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 60000);
//



var prefix = ayarlar.prefix;
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  console.log(`Toplamda ${files.length} Komut Var!`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    console.log(`${props.help.name} İsimli Komut Aktif!`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};


let cstoken;
if (ayarlar.TOKEN) {
  cstoken = ayarlar.TOKEN;
}
if (process.env.TOKEN) {
  cstoken = process.env.TOKEN;
}
if (cstoken) {
  client.login(ayarlar.TOKEN || process.env.TOKEN);
} else {
  console.log("Projeye Hiç Bir Bot Tokeni Yazılmamış!");
}


const cod = {
  code1: {
    codes: "t13",
    icerik:
      "https://test.com",
    video: "test video",
    isim: "test"
  },
    code2: {
    codes: "t123",
    icerik:
      "https://test.com",
    video: "test video",
    isim: "test"
  }
};

client.on("message", async message => {
  const ub = ayarlar.youtubeKanalLink
  if (!message.author.bot) {
    if (message.guild) {
      if (
        message.guild.id === ayarlar.sunucuID &&
        message.channel.id === ayarlar.mesajKanalID
      ) {
        const log = message.guild.channels.cache.get(ayarlar.logID);
        if (
          Object.entries(cod).some(val =>
            message.content.includes(val[1].codes)
          )
        ) {
          const obj = Object.entries(cod).find(val =>
            message.content.includes(val[1].codes)
          );
          const cdata = db.get(`${obj[1].codes}.${message.author.id}`);
          if (!cdata) {
            db.set("code." + message.author.id, "reg");
            message.author
              .send(
                new Discord.MessageEmbed()
                  .setTitle("Made By. Umut Bayraktar")
                  .setColor("BLUE")
                  .setThumbnail(message.author.avatarURL())
                  .setDescription(
                    "**Merhaba Dostum Görünüşe Göre `" +
                      obj[1].video +
                      "` İsimli Videodan Buraya Geldin!\nAlmak İstediğin Altyapının İsmi: `" +
                      obj[1].isim +
                      "`\n\nHer Kullanıcının Her Altyapıyı Birkere Alma Hakkı Vardır!\n\nBana 5 Dakika İçinde ["+ayarlar.youtubeKanalİsim+"](" +
                      ub +
                      ") Kanalına Abone Olduğuna ve Geldiğin Videoyu Beğendiğine Dair Bir Fotoğraf ve Altyapı Kodunu Atar İsen Altyapıya Erişe Bileceksin!\nErişim Süresi: `5 Dakika`\nAltyapı Kodu: `" +
                      obj[1].codes +
                      "`**"
                  )
                  .setFooter("Made By. Code Share")
                  .setTimestamp()
              )
              .then(mr => {
                setTimeout(() => {
                  mr.delete({ timeout: 100 });
                  db.delete("code." + message.author.id);
                }, 240000);
              })
              .catch(async err => {
                if (!log) return;
                else
                  return await log.send(
                    `<@${message.author.id}>, **Özel Mesaj Kutun Kapalı Olduğu İçin Sana Mesaj Atamıyorum Lütfen DM Aç ve Tekrar Dene!**`
                  );
              });
          } else {
            return await log.send(
              `<@${message.author.id}>, **Bu Altyapı Kodunu Zaten Daha Önce Kullanmışsın!**`
            );
          }
        } else {
          return await log.send(
            `<@${message.author.id}>, **Hatalı Bir Altyapı Kodu Girdin!**`
          );
        }
      }
    }
  }
});

client.on("message", async message => {
  const crdata = db.get("code." + message.author.id);
  const log = client.channels.cache.get(ayarlar.logID);
 const csm = client.guilds.cache.get(ayarlar.sunucuID).members.cache.get(message.author.id)
  if (crdata) {
    if (message.author.id === client.user.id) return;
    if (message.guild) return;
    if (
      Object.entries(cod).some(val => message.content.includes(val[1].codes)) &&
      message.attachments.size > 0
    ) {
      const obj = Object.entries(cod).find(val =>
        message.content.includes(val[1].codes)
      );

      const cdata = db.get(`${obj[1].codes}.${message.author.id}`);
      if (!cdata) {
        db.set(`${obj[1].codes}.${message.author.id}`, "🕒");
        db.delete(`code.${message.author.id}`);
        db.add("sayi", 1);
        csm.roles.add(ayarlar.aboneRolID)
        await log.send(
          "<@" +
            message.author +
            "> `(" +
            message.author.id +
            ")`, `" +
            obj[1].isim +
            "` Adlı Altyapıyı Aldı!"
        );
        return message.channel
          .send(
            new Discord.MessageEmbed()
              .setTitle("Made By. Umut Bayraktar")
              .setColor("BLUE")
              .setThumbnail(message.author.avatarURL())
              .setDescription(
                "Teşekkürler İşte Altyapı Linki: " + obj[1].icerik
              )
              .setFooter("Made By. Code Share")
              .setTimestamp()
          )
          .then(mr => {
            setTimeout(() => {
              mr.delete({ timeout: 100 });
            }, 300000);
          });
      } else {
        return;
      }
    } else {
      const atc = new Discord.MessageAttachment(
        "https://cdn.discordapp.com/attachments/798990296565284894/799706785916518460/20210115_212908.jpg"
      );
      return message.channel
        .send(
          "**Görüntüyü Atmadığın veya Altyapı Kodunu Doğru Girmediğin İçin İşlem İptal Edildi!\nÖrnek:**",
          atc
        )
        .then(mr => {
          setTimeout(() => {
            mr.delete({ timeout: 100 });
          }, 20000);
        });
    }
  } else {
    return;
  }
});

client.on("message", async message => {
  if (message.channel.id === ayarlar.mesajKanalID) {
    const logs = client.channels.cache.get(ayarlar.sistemLogID);
    if (
      Object.entries(cod).some(val => message.content.includes(val[1].codes))
    ) {
      const obj = Object.entries(cod).find(val =>
        message.content.includes(val[1].codes)
      );
      const cs = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL())
        .setColor("BLUE")
        .setDescription("`" + message.content + "`")
        .setFooter(obj[1].isim + " Adlı Altyapı İçin Mesaj Attı!")
        .setTimestamp();
      logs.send(cs);
    }
    await message.delete({ timeout: 100 });
  }
});
