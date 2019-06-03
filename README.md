# DBS-Parties-API-Demo

This is a single page app which demonstrates how to call the DBS Parties API to fill in a registration form. The backend code can be found in **index.js**. This assumes that you have your clientID, clientSecret, and Redirect URI all correctly set up in the DBS Developers Portal

The process of how the information is called follows these steps

1. Redirection to DBS Authentication Page
2. Upon successful authentication, redirection back to the original page with an access code
3. Calling the Oauth API to obtain an **access token** using the provided access code
4. Decoding the access token to obtain the PartyID
5. Calling the Parties API using the obtained PartyID in the request path to pull the provided information

## Dummy Credentials

Login 1: iw036/123456
Login 2: iw040/234567
