const fetch = require('node-fetch');

const webhookUrl = 'https://your-vercel-deployment-url.vercel.app/webhook';

const testCode = `
let currentTime = new Date();
let options = {
  timeZone: "Asia/Ho_Chi_Minh",
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};
let formattedTime = currentTime
  .toLocaleString("en-GB", options)
  .replace(",", "")
  .replace(/\//g, "-")
  .replace(/\./g, "");
let [date, time] = formattedTime.split(" ");
let [day, month, year] = date.split("-");
let formattedDate = \`\${day}-\${month}-\${year}\`;
output.set("timestamp", \`\${time} \${formattedDate}\`);
output.set("iso_date", \`\${formattedDate} \${time}\`);
console.log(\`\${time} \${formattedDate}\`);
`;

async function testWebhook() {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: testCode }),
    });

    const data = await response.json();
    console.log('Webhook response:', data);
  } catch (error) {
    console.error('Error testing webhook:', error);
  }
}

testWebhook();
