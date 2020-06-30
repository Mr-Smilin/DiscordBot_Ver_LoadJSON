try {
  var request = require('request');

  //攻略組表單第一頁，等級&重生點
  var levels = {
    'method': 'GET',
    'url': 'https://script.google.com/macros/s/AKfycbyh7McfrZwwueYEfWwEw8plfTgbTaxTPD-AuIUDLmtATVAQa6-F/exec',
    'headers': {
    }
  };

  //獲取等級&轉生點
  exports.getLevel = function (newLevel, range = 1, callback) {
    let backValue = new Array;
    request(levels, function (error, response) {
      //if (error) throw new Error(error);
      if (error) {
        callback(error);
      }
      else {
        if (response.body !== undefined && typeof (response.body) === 'string') {
          if (response.body.substring(0, 1) !== '{') {
            callback('出現意外錯誤~\n通常是google不開心了');
          }
        }
        else {
          callback('出現意外錯誤~\n通常是google不開心了');
        }
        let data = JSON.parse(response.body);
        let j = parseFloat(newLevel)
        for (var i = 0; i <= range - 1; i++) {
          backValue.push(data[i + j]);
        }
        callback(backValue);
      }
    });
  };


  //攻略組表單第二頁，各角色持有技能
  var skills = {
    'method': 'GET',
    'url': 'https://script.google.com/macros/s/AKfycbwFChkbTojMA_vDL9a7sljOUtt6QM1nuAB5Pr-Y-XTf-G3FPjo/exec',
    'headers': {
    }
  };

  //獲取技能列表
  exports.getSkill = function (name, callback) {
    errMsg = '```技能查詢\n語法:攻略組 技能 {角色名稱}\n\n根據角色名稱，反饋此角色已記錄技能與獲得條件\n\n角色名稱需與表單完全一致';
    //減少查詢消耗
    // if (name === undefined || name === '') {
    //   errMsg = errMsg+'```';
    //   callback(errMsg);
    // }

    request(skills, function (error, response) {
      if (error) throw new Error(error);
      if (response.body !== undefined && typeof (response.body) === 'string') {
        if (response.body.substring(0, 1) !== '{') {
          callback('出現意外錯誤~\n通常是google不開心了');
        }
      }
      else {
        callback('出現意外錯誤~\n通常是google不開心了');
      }
      let data = JSON.parse(response.body);
      if (data[name] !== undefined) {
        let skills = new Array;
        skills.push(0);
        skills.push(data[name].skill1);
        skills.push(data[name].skill2);
        skills.push(data[name].skill3);
        skills.push(data[name].skill4);
        skills.push(data[name].skill5);
        skills.push(data[name].skill6);
        skills.push(data[name].skill7);
        skills.push(data[name].skill8);

        let tasks = new Array;
        tasks.push(data[name].task1);
        tasks.push(data[name].task2);
        tasks.push(data[name].task3);
        tasks.push(data[name].task4);
        tasks.push(data[name].task5);
        tasks.push(data[name].task6);
        tasks.push(data[name].task7);
        tasks.push(data[name].task8);

        for (var i = 8; i >= 1; i--) {
          if (skills[i] !== '') {
            skills[0] = i;
            break;
          }
        }

        msg = '```';
        msg = msg + `角色  ${name}`;
        for (var i = 0; i < skills[0]; i++) {
          msg = msg + '\n技能' + (i + 1) + ' ' + paddingRightForCn(skills[i + 1], 8) + '| 獲取條件 ' + paddingRightForCn(tasks[i], 8);
        }
        msg = msg + '```';
        callback(msg);
      }
      else {
        msg = '\n目前的角色有~...\n';
        let names = Object.keys(data)
        for (var i = 0; i < names.length; i++) {
          msg = msg + `${paddingRightForCn(names[i], 7)}`;
          if (i % 6 == 5 && i != 0) {
            msg = msg + '\n';
          }
        }
        msg = msg + '```';
        errMsg = errMsg + msg;
        callback(errMsg)
      }
    });
  };

  //攻略組表單第一頁，等級&重生點
  var blackList = {
    'method': 'GET',
    'url': 'https://script.google.com/macros/s/AKfycbxHh0yq-irMpMuGZ3yVCutkw2FIIzJdoMlEwwp7v6NiMKaHpiSO/exec',
    'headers': {
    }
  };

  //獲取等級&轉生點
  exports.getBlackList = function (callback) {
    request(blackList, function (error, response) {
      //if (error) throw new Error(error);
      if (error) {
        callback(error);
      }
      else {
        if (response.body !== undefined && typeof (response.body) === 'string') {
          if (response.body.substring(0, 1) !== '{') {
            callback('出現意外錯誤~\n通常是google不開心了');
          }
        }
        else {
          callback('出現意外錯誤~\n通常是google不開心了');
        }
        let data = JSON.parse(response.body);
        let keys = Object.keys(data);

        range = keys.length - 5;
        if (range < 0) {
          range = 0;
        }
        var ran = Math.floor(Math.random() * range) + 1;//亂數
        //亂數不可在五個循環過後大於API資料本身(應該用不到)
        if (keys.length - ran < 0) {
          ran = keys.length - 5;
        }
        let msg = '```';
        for (var i = ran; i < ran + 5; i++) {
          if (data[i] !== undefined) {
            msg = msg + `暱稱 ${data[i].name}\n觀察狀態 ${data[i].type}\n主動殺人次數 ${data[i].count}\n備註 ${data[i].backup}\n\n`;
          }
        }
        msg = msg + '```';
        if (msg === '``````') {
          msg = '出現錯誤，請重新嘗試\n如果問題持續存在，請通知作者';
        }
        callback(msg);
      }
    });
  };

  //#region 字串補空白
  function paddingRightForCn(str, lenght) {
    if (str.length >= lenght)
      return str;
    else
      return paddingRightForCn(str + "　", lenght);
  }
} catch (error) {
  callback('出現意外錯誤~\n通常是google不開心了')
}
//#endregion