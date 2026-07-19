export async function sendWhatsAppMessage(to: string, text: string): Promise<any> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    console.warn("[WhatsApp Service] Outbound credentials missing. Logging message instead:", { to, text })
    return { mock: true, success: true }
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "text",
    text: {
      preview_url: false,
      body: text
    }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    const data = (await response.json()) as any
    if (!response.ok) {
      console.error("[WhatsApp Service] Failed to send message:", data)
      throw new Error(data.error?.message || "WhatsApp sending failed")
    }

    console.log("[WhatsApp Service] Message sent successfully:", data)
    return data
  } catch (error) {
    console.error("[WhatsApp Service] Network error sending WhatsApp message:", error)
    throw error
  }
}
