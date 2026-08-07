import dotenv from 'dotenv';
dotenv.config();

export const sendSMS = async (mobileNumber, otpCode) => {
    const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
    const numbers = cleanMobile.length === 10 ? '91' + cleanMobile : cleanMobile;
    const formattedMobile = mobileNumber.startsWith('+') ? mobileNumber : `+${numbers}`;

    const messageBody = `Are you agree or not agree these terms and conditions? Your OTP is ${otpCode}`;

    // 1. Try Fast2SMS (India Bulk/OTP Route)
    if (process.env.FAST2SMS_API_KEY) {
        try {
            const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
                method: "POST",
                headers: {
                    "authorization": process.env.FAST2SMS_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "route": "otp",
                    "variables_values": otpCode,
                    "numbers": cleanMobile.slice(-10)
                })
            });
            const resData = await response.json();
            console.log("Fast2SMS Response:", resData);
            if (resData.return) {
                console.log(`✅ Real SMS OTP sent successfully via Fast2SMS to ${mobileNumber}`);
            }
        } catch (error) {
            console.error("Fast2SMS failed:", error);
        }
    }

    // 2. Try Twilio (Global SMS and WhatsApp API)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
        try {
            const sid = process.env.TWILIO_ACCOUNT_SID;
            const token = process.env.TWILIO_AUTH_TOKEN;
            const from = process.env.TWILIO_FROM_NUMBER;
            const auth = Buffer.from(`${sid}:${token}`).toString('base64');
            
            // Send SMS
            const smsResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    To: formattedMobile,
                    From: from,
                    Body: messageBody
                })
            });
            const smsResData = await smsResponse.json();
            console.log("Twilio SMS Response:", smsResData);
            if (!smsResData.error_code) {
                console.log(`✅ Real SMS OTP sent successfully via Twilio to ${mobileNumber}`);
            }

            // Send WhatsApp
            const whatsappResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    To: `whatsapp:${formattedMobile}`,
                    From: `whatsapp:${from}`,
                    Body: messageBody
                })
            });
            const waResData = await whatsappResponse.json();
            console.log("Twilio WhatsApp Response:", waResData);
            if (!waResData.error_code) {
                console.log(`✅ Real WhatsApp message sent successfully via Twilio to ${mobileNumber}`);
            }
        } catch (error) {
            console.error("Twilio failed:", error);
        }
    }

    // 3. Try Textbelt (Free fallback, 1 message per day, no registration required)
    const textbeltKey = process.env.TEXTBELT_API_KEY || "textbelt";
    try {
        console.log(`Attempting to send SMS via Textbelt (Key: ${textbeltKey})...`);
        const response = await fetch("https://textbelt.com/text", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone: formattedMobile,
                message: messageBody,
                key: textbeltKey
            })
        });
        const resData = await response.json();
        console.log("Textbelt Response:", resData);
        if (resData.success) {
            console.log(`✅ Real SMS OTP sent successfully via Textbelt to ${mobileNumber}`);
        } else {
            console.warn(`Textbelt failed: ${resData.error}`);
        }
    } catch (error) {
        console.error("Textbelt failed:", error);
    }

    console.log(`⚠️ SMS/WhatsApp execution done. OTP for ${mobileNumber} is: ${otpCode}`);
    return true;
};
