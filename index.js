// !!!!! Update these fields as required! !!!!!
//const portNumber = 5500
const clientID = '1b2620ab-674d-42e2-b760-66d1522bd22b'
const clientSecret = '62931929-d298-4bd4-954a-5ba1450ad94a'
const redirectURI = `http://dbsdemo.s3-website-ap-southeast-1.amazonaws.com/index.html`
const authURL = `https://www.dbs.com/sandbox/api/sg/v1/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&scope=Read&response_type=code&state=0399`
const authCode = btoa(`${clientID}:${clientSecret}`)

let accessCode = (() => {
  if((typeof (document.URL.split('=')[1])) == 'undefined') {
    return "na"
  } else {
    return (document.URL.split('=')[1]).split('&')[0]
  }
})()

document.getElementById('dbs-login').onclick = () => {
  location.href = authURL
}

async function getPartyID() {
    if (accessCode === "na") {
        console.log("no token, needs log in first")
    } 
    else {
        //fetch token from Oauth Server
        document.getElementById("loader").style.visibility = "visible";
        document.getElementById("loader-text").style.visibility = "visible";
        let fetchToken = {
            method: 'POST',
            body: `code=${accessCode}&grant_type=authorization_code&redirect_uri=${redirectURI}`,
            headers: {
              'authorization': `Basic ${authCode}`,
              'content-type': 'application/x-www-form-urlencoded',
              'cache-control': 'no-cache',
              'accept': 'application/json'
            }
          }
          let response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v1/oauth/tokens`, fetchToken)
          let body = await response.json()
          let accessToken = body.access_token
          console.log(accessToken)
          // Decoding the accessToken
          function parseJwt (token) {
            var base64Url = token.split('.')[1];
            var base64 = decodeURIComponent(atob(base64Url).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(base64);
          };
          // Get the partyID and call the Parties API
          //await sleep(2000)
          let partyID = parseJwt(accessToken).cin
          console.log(partyID)
          let fetchParties = {
            method: 'GET',
            headers: {
              'accessToken': accessToken,
              'clientID': clientID,
              'accept': 'application/json',
              'content-type': 'application/x-www-form-urlencoded',
              'cache-control': 'no-cache',
              'uuid': "9af4a89a-4c06-4588-82c3-1bc003889a49"
            }
          }
          let partyResponse = await fetch(
          `https://cors-anywhere.herokuapp.com/https://www.dbs.com/sandbox/api/sg/v2/parties/${partyID}`, fetchParties
          )
          let partyBody = await partyResponse.json()
          console.log(partyBody)
          //Update the Webpage
          document.getElementById('firstName').value = partyBody.retailParty.retailDemographic.partyName.fullName.split(' ')[0]
          document.getElementById('lastName').value = partyBody.retailParty.retailDemographic.partyName.fullName.split(' ')[1]
          document.getElementById('company').value = partyBody.retailParty.employmentDetl.employerName
          document.getElementById('email').value = partyBody.retailParty.contactDetl.emailDetl[0].emailAddressDetl.emailAddressType
          document.getElementById('phone').value = partyBody.retailParty.contactDetl.phoneDetl[0].phone.phoneNumber
          document.getElementById('areaCode').value = partyBody.retailParty.contactDetl.phoneDetl[0].phone.phoneCtryCode
          document.getElementById("loader").style.visibility = "hidden";
          document.getElementById("loader-text").style.visibility = "hidden";
    }
}

getPartyID()

function sleep(ms){
  return new Promise(resolve=>{
      setTimeout(resolve,ms)
  })
}



