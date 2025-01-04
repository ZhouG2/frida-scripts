var net = require('net');
// var request = require('request')
const axios = require('axios');

var host = 'scrm.wuuxiang.com',
	port = 443



let users = [{
		"data": {
			"mpId": "gh_f3e185d07694",
			"openId": "oNwnF4rz_XhE5TsOottxCM0lMbPI",
			"unionId": "opxMYxLAKgyUSu3DqYy_eqxySXRw",
			"data": {
				"gameId": "1000002786",
				"memberId": "1011096986",
				"cardId": "10021014345",
				"cardNo": "1201986",
				"from": 2
			}
		},
		"authorization": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvTnduRjRyel9YaEU1VHNPb3R0eENNMGxNYlBJIiwiYXBwaWQiOiJ3eGEyNDg2MjRlM2EwMGRlOTIiLCJpc3MiOiJtb2JpbGUiLCJleHAiOjE2NTIzNTQyNTksIm1waWQiOiJnaF9mM2UxODVkMDc2OTQifQ.rx7rAwcJNzps_jO23ep1Y4_BjLbsO-dUIUbEkShp52g",
	},
	{
		"data": {
			"mpId": "gh_f3e185d07694",
			"openId": "oNwnF4l8HhBisXNwmu0Br9jB8cY0",
			"unionId": "opxMYxIQPygNRXlhrhDR_nkIieDc",
			"data": {
				"gameId": "1000002786",
				"memberId": "1011096263",
				"cardId": "10021013623",
				"cardNo": "1564444",
				"from": 2
			}
		},
		"authorization": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvTnduRjRsOEhoQmlzWE53bXUwQnI5akI4Y1kwIiwiYXBwaWQiOiJ3eGEyNDg2MjRlM2EwMGRlOTIiLCJpc3MiOiJtb2JpbGUiLCJleHAiOjE2NTQ4MjUyNjAsIm1waWQiOiJnaF9mM2UxODVkMDc2OTQifQ.PnmBtKf1wIkho_woW-DmoxJatS3i1vBc6pGZPoDkZ44"
	},
	{
		"data":{"mpId":"gh_f3e185d07694","openId":"oNwnF4pTHTFRgQ-M78-HFqiQMk7I","unionId":"opxMYxKqRIoe6zMV34JYZoA9RaBs","data":{"gameId":"1000002786","memberId":"1177747135","from":2,"cardId":"10345750756","cardNo":"202008131449"}},
		"authorization": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvTnduRjRwVEhURlJnUS1NNzgtSEZxaVFNazdJIiwiYXBwaWQiOiJ3eGEyNDg2MjRlM2EwMGRlOTIiLCJpc3MiOiJtb2JpbGUiLCJleHAiOjE2NTQ5NDAwNzUsIm1waWQiOiJnaF9mM2UxODVkMDc2OTQifQ.7mZ8cLVceVVgXAcbSfRE1lXBca-kf0RLCWtniBIINp0"
	},
	{
		"data":{"mpId":"gh_f3e185d07694","openId":"oNwnF4pM0sxg3wdFKssFAh-9j224","unionId":"opxMYxE3kRYvuO_egxUi3Tra1LkE","data":{"gameId":"1000002786","memberId":"1495217613","cardId":"10683700319","cardNo":"202203121021","from":2}},
		"authorization":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvTnduRjRwTTBzeGczd2RGS3NzRkFoLTlqMjI0IiwiYXBwaWQiOiJ3eGEyNDg2MjRlM2EwMGRlOTIiLCJpc3MiOiJtb2JpbGUiLCJleHAiOjE2NTUwMjI4ODEsIm1waWQiOiJnaF9mM2UxODVkMDc2OTQifQ.qDIIgOf4VXMjC4VCL8gkmO33GXfHo6TFeOlp0-TctD8"
	}
]

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
// const GAMEID = "1000087059" 2023
const GAMEID = '1000145597'
module.exports = {

	
	siginWithToken: async function(token, openId, unionId ) {
		req.headers.authorization = token
		url = 'https://scrm.wuuxiang.com/crm7game-api/api/member/single'
		req.headers['content-type'] = "application/json;"
		
		req.data = JSON.stringify({"mpId":"gh_f3e185d07694",
		openId ,
		unionId,
		"data":{}})
		let res2 = await axios.post(url, req.data, {headers:req.headers} )
		console.log("res2::", JSON.stringify(res2))
		result = JSON.parse(res2.data.content)
		let cardId = result.cardId 
		let cardNo = result.cardNo 
		let memberId = result.id
		let signData =  {
			"mpId": "gh_f3e185d07694",
			openId ,
			unionId,
			"data": {
				"gameId": GAMEID,
				memberId,
				cardId,
				cardNo,
				"from": 2
			}
		}
		req.data = JSON.stringify(signData)
		console.log("signData:", req.data)
		url = "https://scrm.wuuxiang.com/crm7game-api/api/game/sign/signIn"
		return axios.post(url, req.data, {headers:req.headers} )
	},
	siginWithCode: async function(code, delay) {
		let url = 'https://wechat.wuuxiang.com/i5xforyou/auth/login'
		delay = delay || 0
		
		
		req.headers['content-type'] = 'application/x-www-form-urlencoded;charset=utf-8'
		
		req.data = `code=${code}&mpid=gh_f3e185d07694`
		console.log("data:::", req.data)
		let res = await axios.post(url, req.data, {headers:req.headers} )
		console.log("res:", JSON.stringify(res.data))
		
		
		if(res.status !=200 || res.data.status < 0 )
			return res
		if(delay >0){
			console.log(`等待${delay/1000}秒`)
			await new Promise(resolve => setTimeout(resolve, delay))
		}
		
		let result = res.data.result
		let r2 =  await this.siginWithToken(result.token, result.openId, result.unionId)
		console.log("siginWithToken:", JSON.stringify(r2))
		 return r2
	},
	start: async function(cbk) {
		let res = []
		for (let v of rawData) {
			var socket = net.connect(port, host, function() {

				var rawResponse = "";

				// send http request:
				socket.end(v);

				// assume utf-8 encoding:
				socket.setEncoding('utf-8');

				// collect raw http message:
				socket.on('data', function(chunk) {
					rawResponse += chunk;
					// console.log("rawResponse:", rawResponse)
				});
				socket.on('error',function(err){
					console.log(err)
				})
				socket.on('end', function() {
					console.log(rawResponse);
					res.push(rawResponse)
					cbk && res.length == rawData.length && cbk(res)
				});
			});
		}

	}
}
// 通过命令行参数获取并输出传递的参数
process.argv.forEach((val, index) => {
  console.log(`Argument ${index}: ${val}`);
});

if (process.argv.length > 2) {
  const code = process.argv[2];
  console.log("code:", code)
  module.exports.siginWithCode(code)
}


