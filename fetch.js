const crypto = require("crypto")
const https = require('https')
const axios = require("axios")

const allowLegacyRenegotiationforNodeJsOptions = {
  httpsAgent: new https.Agent({
    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
  }),
};

module.exports = makeRequest = (receiptNumber)=>{
	return axios({
		...allowLegacyRenegotiationforNodeJsOptions,
		url: `https://egov.uscis.gov/csol-api/case-statuses/${receiptNumber}`,
		method: 'GET',
	})
}
