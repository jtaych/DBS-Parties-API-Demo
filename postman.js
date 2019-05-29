/* global fetch:false */
/* eslint-env browser */
// https://crossorigin.me/
// https://cors-anywhere.herokuapp.com/
// Debugging Section
/*
const windowURL = document.URL
console.log(windowURL)

document.getElementById("url-check").addEventListener("click", () => {console.log(windowURL)}
)

document.getElementById("login-button").setAttribute ("onclick",authURL)

function urlChange () {
    console.log("redirected!")
}

// 1 FA - http://localhost:5500/index.html?code=BygxPZ0XNRQh6Fv4nsL5%2BFwUpAs%3D&state=0399
// 2FA - http://localhost:5500/index.html?state=null&code=DjR9y72zm9OxSwUoISDa4RDgI98%3D
window.onhashchange = urlChange

*/
// Code

document.getElementById('login-button').addEventListener('click', dbsAuth)
document.getElementById('get-info').addEventListener('click', getAction)
document.getElementById('get-acc').addEventListener('click', getAccount)
document.getElementById('2fa').addEventListener('click', twoFA)
document.getElementById('transfer').addEventListener('click', fundTransfer)
document.getElementById('postman-btn').addEventListener('click', postman)
document.getElementById('getPoints').addEventListener('click', getPoints)

var pointBalance
var point0
var point1
var userInfo
var twoFaCode
var twoFaToken
var partyID
var accessToken
var balanceData
const portNumber = 5500
const clientID = '9e8b5831-6ea9-4b62-8e4e-4bb671b17d5a'
const clientSecret = 'b55c828a-4ad6-4c9a-b8f9-98a1e88b1d87'
// http://localhost:${portNumber}/PostmanSub/postman.html
// `http%3A%2F%2Flocalhost%3A${portNumber}%2Findex.html`
const redirectURI = `http://localhost:${portNumber}/postman.html`
const authURL = `https://www.dbs.com/sandbox/api/sg/v1/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&scope=Read&response_type=code&state=0399`
const authCode = btoa(`${clientID}:${clientSecret}`)

reloadValues()

function dbsAuth () {
  location.href = authURL
  console.log(accessToken)
}

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = decodeURIComponent(atob(base64Url).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(base64);
};

async function getAction () {
  if (accessToken === undefined) {
    const url = document.URL
    const interim1 = (url.split('='))[1]
    let fetchToken = {
      method: 'POST',
      body: `code=${interim1}&grant_type=authorization_code&redirect_uri=${redirectURI}`,
      headers: {
        'authorization': `Basic ${authCode}`,
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache',
        'accept': 'application/json'
      }
    }
    let response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v1/oauth/tokens`, fetchToken)
    if (!response.ok) {
      console.log(response)
      document.getElementById('responseTextArea').value = 'Your token probably expired bro'
    } else {
      let parsed = await response.json()
      console.log(parsed)
      window.accessToken = parsed.access_token
      let tokenObj = parseJwt(parsed.access_token)
      console.log(tokenObj)
      window.partyID = tokenObj.cin
    }
  }
  let fetchbalanceData = {
    method: 'GET',
    headers: {
      'accessToken': accessToken,
      'clientID': clientID,
      'accept': 'application/json'
    }
  }
  console.log(partyID)
  let partyStream = await fetch(
    // BIG CHANGES WITH BUGS HERE OH MY GOD
    `https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v2/parties/${partyID}`, fetchbalanceData
  )
  console.log(partyStream)
  let partyObj = await partyStream.json()
  window.userInfo = partyObj
  updateHTML()
}

async function getAccount () {
  // console.log(`${clientID},${accessToken},${partyID}`)
  let fetchAcc = {
    method: 'GET',
    headers: {
      'accessToken': accessToken,
      'clientId': clientID,
      'content-type': 'application/json'
      // "uuid": "24516bf8-cd2b-4e21-ba85-7a89c670dc7c",
    }
  }
  const response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v1/parties/${partyID}/deposits`, fetchAcc)
  window.balanceData = await response.json()
  console.log(balanceData)
  // console.log(balanceData.currentAccounts.length)
  updateHTML()
}

function updateHTML () {
  document.getElementById('responseTextArea').value = JSON.stringify(userInfo)
  document.getElementById('username').innerHTML = userInfo.retailParty.retailDemographic.partyName.fullName
  document.getElementById('user-email').innerHTML = userInfo.retailParty.contactDetl.emailDetl['0'].emailAddressDetl.emailAddressType
  document.getElementById('birthday').innerHTML = userInfo.retailParty.retailDemographic.dateOfBirth
  document.getElementById('occupation').innerHTML = userInfo.retailParty.employmentDetl.jobTitle
  document.getElementById('employer').innerHTML = userInfo.retailParty.employmentDetl.employerName
  if (balanceData !== undefined) {
    for (let i = 0; i < balanceData.currentAccounts.length; i++) {
      const accountTable = document.getElementById('accountTable')
      let newTableRow = document.createElement('tr')
      newTableRow.setAttribute('id', `row${i}`)
      accountTable.appendChild(newTableRow)
      let newDescriptor = document.createElement('td')
      newDescriptor.innerHTML = balanceData.currentAccounts[i].productDescription
      newTableRow.appendChild(newDescriptor)
      let newBalance = document.createElement('td')
      newBalance.innerHTML = balanceData.currentAccounts[i].balances.availableBalance.amount
      newTableRow.appendChild(newBalance)
    }
    for (let i = 0; i < balanceData.savingsAccounts.length; i++) {
      const accountTable = document.getElementById('savingsTable')
      let newTableRow = document.createElement('tr')
      newTableRow.setAttribute('id', `row${i}`)
      accountTable.appendChild(newTableRow)
      let newDescriptor = document.createElement('td')
      newDescriptor.innerHTML = balanceData.savingsAccounts[i].productDescription
      newTableRow.appendChild(newDescriptor)
      let newBalance = document.createElement('td')
      newBalance.innerHTML = balanceData.savingsAccounts[i].balances.availableBalance.amount
      newTableRow.appendChild(newBalance)
    }
  }
  if (pointBalance !== undefined) {
    for (let i = 0; i < pointBalance.cardRewardsAccounts.length; i++) {
      const accountTable = document.getElementById('cardTable')
      let newTableRow = document.createElement('tr')
      newTableRow.setAttribute('id', `card${i}`)
      accountTable.appendChild(newTableRow)
      let newDescriptor = document.createElement('td')
      newDescriptor.innerHTML = pointBalance.cardRewardsAccounts[i].cardDescription
      newTableRow.appendChild(newDescriptor)
      let newBalance = document.createElement('td')
      newBalance.innerHTML = point0[0].currentPoints
      newTableRow.appendChild(newBalance)
    }
  }
}

async function postman () {
  let fetchfx = {
    method: 'GET',
    headers: {
      'accessToken': accessToken,
      'clientId': clientID,
      'content-type': 'application/json'
      // "uuid": "24516bf8-cd2b-4e21-ba85-7a89c670dc7c",
    }
  }
  const response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v1/rates/exchangeRates?rateType=boardRate&quoteCurrency=INR&boardRateType=Telegraphic%20Transfer&baseCurrency=SGD`, fetchfx)
  const fxRate = await response.json()
  console.log(fxRate)
}

function saveValues () {
  console.log(accessToken)
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('balanceData', JSON.stringify(balanceData))
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
  localStorage.setItem('userInfo', JSON.stringify(pointBalance))
}

async function twoFA () {
  saveValues()
  let twoFaPayload = {
    method: 'POST',
    headers: {
      'accessToken': accessToken,
      'clientId': clientID,
      'content-type': 'application/json'
    },
    'fundTransferDetl': {
      'debitAccountId': balanceData.currentAccounts['0'].id,
      'creditAccountId': balanceData.currentAccounts['1'].id,
      'amount': 10
    }
  }
  console.log(balanceData.currentAccounts['0'].id)
  const response = await fetch('https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v1/transfers/adhocTransfer', twoFaPayload)
  const ftResult = await response.json()
  const codeInterim = (ftResult.Error.url).split('=')[1] + '=' + (ftResult.Error.url).split('=')[2]
  location.href = `https://www.dbs.com/sandbox/api/sg/v1/access/authorize?code=${codeInterim}&client_id=${clientID}&redirect_uri=${redirectURI}`
}

function reloadValues () {
  if ((document.URL).includes('state=null')) {
    console.log('reloaded')
    window.accessToken = localStorage.getItem('accessToken')
    window.balanceData = JSON.parse(localStorage.getItem('balanceData'))
    window.userInfo = JSON.parse(localStorage.getItem('userInfo'))
    window.userInfo = JSON.parse(localStorage.getItem('pointBalance'))
    updateHTML()
  }
}

async function fundTransfer () {
  // Fetch 2Fa Token
  window.twoFaCode = (document.URL).split('=')[2]
  let fetchToken = {
    method: 'POST',
    body: `code=${twoFaCode}&grant_type=authorization_code&redirect_uri=${redirectURI}`,
    headers: {
      'authorization': `Basic ${authCode}`,
      'content-type': 'application/x-www-form-urlencoded',
      'cache-control': 'no-cache',
      'accept': 'application/json'
    }
  }
  let response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v1/oauth/tokens`, fetchToken)
  let parse = await response.json()
  window.twoFaToken = parse.access_token
  console.log(twoFaToken)
  // Update the balanceID
  /* let fetchbalanceData = {
    method: 'GET',
    headers: {
      'accessToken': accessToken,
      'clientID': clientID,
      'accept': 'application/json'
    }
  }
  const newBalanceDataRes = await fetch(
    `https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v1/parties/${partyID}/deposits`, fetchbalanceData
  )
  const newBalanceData = await newBalanceDataRes.json()
  console.log(newBalanceData) */
  // Initiate the fund transfer
  let ftPayload = {
    method: 'POST',
    headers: {
      'accessToken': twoFaToken,
      'clientId': clientID,
      'uuid': '7455d1e3-954e-4fe0-b478-baeeb9125e19'
      // '_ELEVATION': '3'
    },
    body: {
      'fundTransferDetl': {
        // 'debitAccountId': balanceData.currentAccounts[0].id,
        // 'debitAccountId': (balanceData.currentAccounts[0].id).toString(),
        // 'debitAccountId': 'abc123helloworld src=jackiechanwtf.png',
        'debitAccountId': '01970000890005',
        'creditAccountNumber': '123456',
        'amount': 11,
        'comments': ' ',
        'purpose': ' ',
        'transferType': 'INSTANT',
        'valueDate': '2018-09-13',
        'partyId': partyID,
        'referenceId': 'reference-id-123'
      }
    }
  }
  response = await fetch('https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v1/transfers/adhocTransfer', ftPayload)
  console.log(response)
  const ftResponse = await response.json()
  console.log(ftResponse)
}

async function getPoints () {
  // console.log(`${clientID},${accessToken},${partyID}`)
  let fetchPts = {
    method: 'GET',
    headers: {
      'accessToken': accessToken,
      'clientId': clientID,
      'content-type': 'application/json'
      // "uuid": "24516bf8-cd2b-4e21-ba85-7a89c670dc7c",
    }
  }
  const response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v1/parties/${partyID}/rewards`, fetchPts)
  console.log(response)
  window.pointBalance = await response.json()
  console.log(pointBalance)
  await getPointBalance()
  updateHTML()
}

async function getPointBalance () {
  let fetchPts = {
    method: 'GET',
    headers: {
      'accessToken': accessToken,
      'clientId': clientID,
      'content-type': 'application/json'
    }
  }
  /* for (let i = 0; i< pointBalance.length; i++) {
    var toString('card'+ i ) = pointBalance.cardRewardsAccounts[i].rewardsSchemes[0].id
  } */
  const response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v1/rewards/${pointBalance.cardRewardsAccounts[0].rewardsSchemes[0].id}/points`, fetchPts)
  window.point0 = await response.json()
  console.log(point0)
}

/* 'fundTransferDetl': {
        'debitAccountId': balanceData.currentAccounts[0].id,
        'creditAccountId': balanceData.currentAccounts[1].id,
        // 'creditAccountId': 123456789
        'amount': 10
      } */

/*
async function getTransactions () {
  let txnPayload = {
    method: 'GET',
    headers: {
      'accessToken': accessToken,
      'clientId': clientID,
      'content-type': 'application/json'
    }
  }
  const res = await fetch(`https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v1/accounts/${balanceData.savingsAccounts[1].id}/transactions?startDate=2017-11-22&endDate=2018-02-23`, txnPayload)
  console.log(res)
  const txnData = await res.json()
  console.log(txnData)
}
*/
