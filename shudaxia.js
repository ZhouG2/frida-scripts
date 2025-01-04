var net = require('net');
var fs = require("fs")
// var request = require('request')
// const axios = require('axios');

var host = 'scrm.wuuxiang.com',
	port = 443


// host: wechat.wuuxiang.com
// content-type: application/x-www-form-urlencoded
// apicaller: wxxcx
// accept: */*
// x-requested-with: XMLHttpRequest
// accept-language: zh-CN,zh-Hans;q=0.9
// accept-encoding: gzip
// content-length: 58
// user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E217 MicroMessenger/6.8.0(0x16080000) NetType/WIFI Language/en Branch/Br_trunk MiniProgramEnv/Mac
// referer: https://servicewechat.com/wxa248624e3a00de92/3/page-frame.html
// xcx-version: 21.03.1
// pname: minigame
// Connection: close
// pragma: no-cache
// cache-control: no-cache
let req = {
	"headers": {
		// "host": "scrm.wuuxiang.com",
		// "content-type": "application/json",
		"apicaller": "wxxcx",
		"accept": "*/*",
		"x-requested-with": "XMLHttpRequest",
		"accept-language": "zh-cn",
		"accept-encoding": "gzip",
		// "content-length": "162",
		"user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E217 MicroMessenger/6.8.0(0x16080000) NetType/WIFI Language/en Branch/Br_trunk MiniProgramEnv/Mac",
		"referer": "https://servicewechat.com/wxa248624e3a00de92/3/page-frame.html",
		"xcx-version": "21.03.1",
		"pname": "minigame",
		"connection": "close",
		"pragma": "no-cache",
		"cache-control": "no-cache"
	},
	"method": "POST",
	// dataAsQueryString:false
	'dataType':'json',
}


// https://scrm.wuuxiang.com/crm7game-api/api/game/lot/list
// {"mpId":"gh_f3e185d07694","openId":"oNwnF4rz_XhE5TsOottxCM0lMbPI","unionId":"opxMYxLAKgyUSu3DqYy_eqxySXRw","data":{"pageNum":1,"pageSize":10}}


// const GAMEID = "1000087059" 2023
const GAMEID = '1000205655' // 2025

function log(txt){
	// var date = new Date();
    // const pad = (number) => (number < 10 ? `0${number}` : number);
	// const pad3 = (number) => {
	// 	if (number < 10) {
	// 	  return `00${number}`;
	// 	} else if (number < 100) {
	// 	  return `0${number}`;
	// 	} else {
	// 	  return number.toString();
	// 	}
	//   };

    // const hours = pad(date.getHours());
    // const minutes = pad(date.getMinutes());
    // const seconds = pad(date.getSeconds());
    // const milliseconds = pad3(date.getMilliseconds());
	
	fs.appendFileSync("/var/tmp/sdx_sign.log",`${new Date().toLocaleString()}: ${JSON.stringify(txt)} \n`)
	// fs.appendFileSync("/var/tmp/sdx_sign.log",`${hours}:${minutes}:${seconds}.${milliseconds}: ${JSON.stringify(txt)} \n`)
}
module.exports = {

	mfetch:async function(url, req){
		
		let res = {status:0}
		// if(res.status !=200 || res.data.status < 0 )
		
		await fetch(url, req).then(response => {
			res.status = response.status
			// 检查响应状态码
			if (response.ok) {
			  return response.json();
			} else {
			  throw new Error(`HTTP error! Status: ${response.status}`);
			}
		  })
		  .then(data => {
			
			res.data = data
			log(`mfetch:: ${url}\n ${JSON.stringify(res)}`)
		  })
		  .catch(error => {
			console.error('Error:', error.message);
		  });
		return res;
	},
	signIn: async function(signData ) {
		url = "https://scrm.wuuxiang.com/crm7game-api/api/game/sign/signIn"
		req.body = JSON.stringify(signData)
		
		let res3 = await this.mfetch(url, req)
		log(res3)
		let sucess = res3.data && (res3.data.code == 200 || res3.data.code == 415)
		
		// //神仙树
		// signData.data.gameId = "1000118535"
		// req.body = JSON.stringify(signData)
		
		// res4 = await  this.mfetch(url, req)
		// sucess = sucess && res4.data && (res4.data.code == 200 || res4.data.code == 415)
		
		// log(res4)
		log(`sucess:${sucess}`)
		if(sucess)
			console.log(" 签到成功")
		return sucess
	},
	loginWithToken: async function(token, openId, unionId ) {
		req.headers.authorization = token
		url = 'https://scrm.wuuxiang.com/crm7game-api/api/member/single'
		req.headers['content-type'] = "application/json;"
		
		req.data = JSON.stringify({"mpId":"gh_f3e185d07694",
		openId ,
		unionId,
		"data":{}})
		req.body = req.data

		return await this.mfetch(url, req)
		
		
	},
	getGameId: async function(openId, unionId ) {
		url = 'https://scrm.wuuxiang.com/crm7game-api/api/game/lot/list'
		req.body = JSON.stringify({
			"mpId":"gh_f3e185d07694",
			openId,
			unionId,
			"data":{"pageNum":1,"pageSize":10}
		})
		
		let res = await this.mfetch(url, req)
		// log(`getGameId response: ${JSON.stringify(res)}`)
		
		if(!res || res.status !== 200 || !res.data || !res.data.content) {
			log('获取gameId失败: 响应异常')
			return null
		}
		
		try {
			const content = JSON.parse(res.data.content)
			const signGame = content.list.find(game => game.name.includes('签到'))
			if(signGame) {
				return signGame.id
			}
			log('未找到签到活动')
			return null
		} catch(e) {
			log(`解析游戏列表失败: ${e.message}`)
			return null
		}
	},
	loginWithCode: async function(code) {
		let url = 'https://wechat.wuuxiang.com/i5xforyou/auth/login'
		
		req.headers['content-type'] = 'application/x-www-form-urlencoded;charset=utf-8'
		req.data = `code=${code}&mpid=gh_f3e185d07694`
		req.body = req.data
		
		let res = await this.mfetch(url, req)
		
		if(res.status == 200 && res.data.status >= 0) {
			
			return res
		} else {
			log(`loginWithCode: failed:: ${JSON.stringify(res)}`)
			return res
		}
	},
	siginWithCode: async function(code, delay) {
		let res = await this.loginWithCode(code)
		delay = delay || 0
		if(delay >0){
			
			await new Promise(resolve => setTimeout(resolve, delay))
		}
		
		let result = res.data.result
		let unionId = result.unionId
		let openId = result.openId
		let r2 =  await this.loginWithToken(result.token, openId, unionId)
		
		log(`loginWithToken: ${JSON.stringify(r2)}`)
		result = JSON.parse(r2.data.content)
		let cardId = result.cardId 
		let cardNo = result.cardNo 
		let memberId = result.id
		let gameId = await this.getGameId(openId, unionId)
		log(`gameId: ${gameId}`)
		let signData =  {
			"mpId": "gh_f3e185d07694",
			openId ,
			unionId,
			"data": {
				"gameId": gameId,
				memberId,
				cardId,
				cardNo,
				"from": 2
			}
		}
		await this.signIn(signData)
		return r2
	}
}
// 通过命令行参数获取并输出传递的参数
process.argv.forEach((val, index) => {
 
 
});

if (process.argv.length > 2) {
  const code = process.argv[2];
  log(process.argv)
  console.log("code:", code)
//   if(process.argv[4] == `${Math.floor(new Date()/1000/86400)}`){
// 	log("今日已经签到")
// 	return
//   }
  module.exports.siginWithCode(code)
}


