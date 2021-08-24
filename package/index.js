const stripe = require("stripe")(process.env.stripeKey);

exports.handler = async (event, context) => {
  console.log(`Event: ${event}`);
  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello there mate!"),
    headers: headers,
  };

  return response;
};
