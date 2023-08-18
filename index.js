const { Telegraf, Markup } = require('telegraf')
const makeRequest = require('./fetch.js')
require('dotenv').config()
let sessionReceiptNumber = ""
const crypto = require("crypto")

const renderMessage = (data) => {
	const {CaseStatusResponse} = data
	sessionReceiptNumber = CaseStatusResponse.receiptNumber
	return `__Número de Recibo: __${CaseStatusResponse.receiptNumber}\n__Tipo de Formulario: __${CaseStatusResponse.detailsEs.formNum.replace("-", "\\-")}\n__Título de Formulario: __${CaseStatusResponse.detailsEs.formTitle}\n__Acción: __*${CaseStatusResponse.detailsEs.actionCodeText}*\n__Descripción: __${CaseStatusResponse.detailsEs.actionCodeDesc.replace("-", "\\-").replaceAll(".", "\\.")}\n__Código de Chequeo: __` + `\`/ch ${CaseStatusResponse.receiptNumber}\``
}

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Con este bot puedes hacer un seguimiento de tu caso de USCIS. Envía el comando /ch seguido de tu número de recibo. Solo es una alternativa a la página web oficial de USCIS. Espero te sea útil❤'))

bot.action("check_again", async (ctx)=>{
	const {data} = await makeRequest(sessionReceiptNumber)
	ctx.replyWithMarkdownV2(
		renderMessage(data),
		Markup.inlineKeyboard([
			Markup.button.callback("Revisar de nuevo", "plain"),
		])
	)
})

bot.command('ch', async (ctx) => {
	const receiptNumber = ctx.update.message.text.split(" ")[1]
	if(receiptNumber.length<13){
		return ctx.reply(`El número de recibo es un identificador único de 13 caracteres que se compone de tres letras y 10 números. Omita los guiones ("-") al ingresar un número de recibo. Sin embargo, puede incluir todos los demás caracteres, incluidos los asteriscos ("*"), si aparecen en su notificación como parte del número de recibo`)
	}
	const {data} = await makeRequest(receiptNumber)
	if(!data.CaseStatusResponse.isValid){
		return ctx.reply(`El número de recibo introducido no es válido`)	
	}
	ctx.replyWithMarkdownV2(
		renderMessage(data),
		Markup.inlineKeyboard([
			Markup.button.callback("Revisar de nuevo", "check_again"),
		])
	)
	
})

bot.command('ayuda', (ctx) => {
	ctx.reply("Para conocer el estado de su caso solo debe enviar el comando /ch seguido por el recibo de su caso. Ejemplo /ch IOE123456789")
})

//----Dev----
//bot.launch()

//----Production----
bot.launch({
  webhook: {
    // Public domain for webhook; e.g.: example.com
    domain: process.env.DOMAIN,

    // Port to listen on; e.g.: 8080
    port: process.env.PORT,
	secretToken: crypto.randomBytes(64).toString("hex"),
  },
});




