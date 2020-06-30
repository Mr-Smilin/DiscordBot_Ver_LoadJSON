
const fs = require('fs'); //????

//Discord.js套件
const Discord = require('discord.js');
//不變的使用者
const client = new Discord.Client();

//繼承js
const messageManager = require('./messageManager.js');
const gasApi = require('./sideJS/gasGet.js');

//讀json
const auth = require('./jsonHome/auth.json');
const baseValue = require('./jsonHome/baseValue.json');
let romValue = require('./jsonHome/romValue.json');
const { exit } = require('process');

//#region 系統功能-修改romValue-前綴字
//此功能當前狀態
let nowUseTheEditRomValue = false;
//此功能當前使用者
let nowUseTheEditRomValueUserID = "";
//此功能使用之房間
let nowUseTheEditRomValueChannelID = "";
//哪些要顯示
const canLookRomValue = ["id", "name", "value"];
//哪些可修改
const canEditRomValue = ["value"];
//#endregion

//幸之心
const MyToken = auth.token;
client.login(MyToken);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

  //#region 前置偵錯
  try {
    //大分類判斷
    if (!msg.guild || !msg.member) return;
    //中分類判斷
    if (!msg.member.user) return;
    //小分類判斷
    if (msg.member.user.bot) return;
  }
  catch (err) {
    console.log(err, 'error#001')
  }
  //#endregion

  //宣告
  let args;
  const cmd = (msg.content.split(' '));

  if (cmd[1] !== undefined) {

    let baseBeforeText = romValue.beforeText.find(value => value.value == cmd[0]);
    if (baseBeforeText !== undefined) {
      baseBeforeText = baseBeforeText.value;
    } else {
      baseBeforeText = cmd[0];
    }

    if (msg.content.substring(0, cmd[0].length) === baseBeforeText) {
      // ID 1 FROM romValue
      args = msg.content.substring(baseBeforeText.length + cmd[1].length + 2).split(romValue.beforeText[1].value);
    }

    SelectFunctionFromBeforeText(msg, cmd, args);
  }
  else {
    if (cmd[0] !== undefined) {
      SelectFunctionFromBeforeText(msg, cmd);
    }
  }
});

//新增主要功能時，需要修改這邊的switchTemp與romValue
function SelectFunctionFromBeforeText(msg, cmd, args = [""]) {

  let temp = -1;
  for (let i = 0; i <= romValue.beforeText.length - 1; i++) {
    if (cmd[0] == romValue.beforeText[i].value) {
      temp = romValue.beforeText[i].id;
      break;
    }
  }

  switch (temp) {
    case 0: //系統指令
      DoBaseFunction(msg, cmd[1], args);
      break;
    case 2: //修改觸發句功能
      DoEditRomValue(msg, cmd[1], args);
      break;
    case 3: //攻略組查表
      DoGasFileGet(msg, cmd[1], args);
      break;
  }
}

//baseFunction
function DoBaseFunction(msg, cmd, args) {
  switch (cmd) {
    case 'help':
      messageManager.HelpMessage(Discord.RichEmbed, function (embed) {
        msg.channel.send(embed);
      })
      break;
    case '老婆':
      msg.reply('你沒有老婆!!');
      break;
    case '安安':
      msg.channel.send('午安');
      break;
    case 'myAvatar':
      const avatar = {
        files: [{
          attachment: msg.author.displayAvatarURL,
          name: 'avatar.jpg'
        }]
      };
      if (avatar.files) {
        msg.channel.send(`${msg.author}`, avatar);
      }
      break;
    case 'test':
      UpFileData(0, 0, args[0]);
      //EditRomValue(msg, cmd, args);
      break;
    case 'Alice': { //語音功能
      if (msg.member.voiceChannel) {
        if (!msg.guild.voiceConnection) {
          msg.member.voiceChannel.join().then(
            connection => {
            }
          ).catch(console.error);
          msg.channel.send('來了~');
        }
      } else {
        msg.reply('請先進入頻道:3...');
      }
      break;
    }
    case 'Alice休息': {
      if (msg.guild.voiceConnection) {
        msg.guild.voiceConnection.disconnect();
        msg.channel.send('晚安~');
      } else {
        msg.channel.send('可是..我還沒進來:3');
      }
      break;
    }
  }
}

// #region 參數參考
// //此功能當前狀態
// let nowUseTheEditRomValue = false;
// //此功能當前使用者
// let nowUseTheEditRomValueUserID = "";
// //此功能使用之房間
// let nowUseTheEditRomValueChannelID = "";
//#endregion
//系統功能-修改romValue-前綴字
function DoEditRomValue(msg, cmd, args) {

  //先判斷功能是否啟用
  if (nowUseTheEditRomValue) {

    //判斷指令使用方頻道是否正確
    if (nowUseTheEditRomValueChannelID === msg.channel.id) {
      switch (cmd) {
        case help:
          messageManager.EditRomValueMessage(Discord.RichEmbed, romValue, function (embed) {
            msg.channel.send(embed);
          });
          break;
        default:
          //正則
          const r = /^[0-9]*[1-9][0-9]*$/;
          if (cmd <= 9 && cmd >= 0) {
            if (r.test(cmd)) {
              let newValue = romValue.beforeText.find(value => value.id == cmd);
              if (newValue) {
                if (newValue.canEdit) {
                  newValue.value = args[0];
                }
              }
            }
          }
          break;
      }
      exit;
    } else {
      msg.channel.send('有其他人正在使用中!\n請稍等一下~');
      exit;
    }

  } else {
    nowUseTheEditRomValueChannelID = msg.channel.id;
    nowUseTheEditRomValueUserID = msg.member.user.id;
    nowUseTheEditRomValue = true;
    messageManager.EditRomValueMessage(Discord.RichEmbed, romValue, function (embed) {
      msg.channel.send(embed);
    });
  }
}

//google API 查表 & 寫表
function DoGasFileGet(msg, cmd, args) {
  switch (cmd) {
    case '轉生點':  //轉生點查詢
      if (args[0] === undefined || args[0] === '' || args[1] === '' || args[0] > 100 || args[0] < 1 || args[1] > 10 || args[1] < 1 || isNaN(args[0]) === true || (isNaN(args[1]) === true && args[1] !== undefined)) {
        msgs = '```轉生點查詢\n語法:攻略組 轉生點 {等級} [範圍]\n\n從選擇等級開始查詢，根據範圍返還查詢數量\n\n等級不可低於1，不可大於100\n範圍不可低於1，不可大於10(預設5)```'
        msg.channel.send(msgs);
      }
      else {
        if (args[1] === undefined) {
          args[1] = 5;
        }
        gasApi.getLevel(args[0], args[1], function (data) {
          getLevel(args[0], data, function (msgs) {
            msg.channel.send(msgs);
          })
        })
      }

      break;
    case '技能':
      gasApi.getSkill(args[1], function (msgs) {
        msg.channel.send(msgs);
      });

      break;
    case '黑特':
      gasApi.getBlackList(function (msgs) {
        msg.channel.send(msgs);
      });

      break;
  }
}

//攻略組轉生點，資料處理
function getLevel(level, data, callback) {
  let j = parseFloat(level);
  let msgs = '```';
  for (i = 0; i <= data.length - 1; i++) {
    if (data[i] !== undefined) {
      msgs = msgs + `等級${paddingLeft((i + j), 4)} | 等級所需經驗${paddingLeft(data[i].lat, 7)} | 累積轉生點${paddingLeft(data[i].lng, 3)} \n`;
    }
  }
  msgs = msgs + '```';
  if (msgs === '``````') {
    msgs = '你能不能正常打字?';
  }
  callback(msgs);
}

//字串補空白
function paddingLeft(str, lenght) {
  if (str.length >= lenght)
    return str;
  else
    return paddingLeft(" " + str, lenght);
}

//更新文件
function UpFileData(number, id, value) {
  switch (number) {
    case 0:
      // let result = JSON.parse(fs.readFileSync(".\\jsonHome\\baseValue.json"));
      // result.Power.tempPower = '2';
      console.log(romValue.beforeText[0].value);
      romValue.beforeText[id].value = value;
      //console.log(result.Power, 'test');
      fs.writeFileSync(".\\jsonHome\\romValue.json", JSON.stringify(romValue));
      romValue = require('./jsonHome/romValue.json');
      console.log(romValue.beforeText[0].value);
      break;
  }
}
