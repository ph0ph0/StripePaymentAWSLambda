const stripe = require("stripe")(process.env.stripeKey);

exports.handler = async (event, context) => {
  console.log(`Event: ${JSON.stringify(event)}`);

  const token = event.token.token;

  console.log(`Token: ${JSON.stringify(token)}`);

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
    "X-Requested-With": "*",
  };

  //   Must be in cents
  const partialOptimiserPrice = 499;

  let response = {
    statusCode: 200,
    headers: headers,
    body: "",
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: partialOptimiserPrice,
      currency: "usd",
    });
    console.log(`Successfully created payment intent`);
    response["body"] = process.env.privateToken;
    console.log(`Sending success response: ${JSON.stringify(response)}`);
  } catch (error) {
    console.log(`Error creating payment intent: ${error}`);
    response["body"] = `${error}`;
    response["statusCode"] = 500;
  }

  return response;
};
