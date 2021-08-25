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
  };

  try {
    await stripe.charges.create({
      amount: partialOptimiserPrice,
      currency: "usd",
      source: token.id,
      description: `Payment for partial optimiser vending machine`,
      metadata: {
        vendingMachine: "PO",
      },
    });
    console.log(`Successfully charged credit card`);
    response["body"] = "Payment Success";
  } catch (error) {
    console.log(`Error charging credit card: ${error}`);
    response["body"] = "Payment failure";
    response["statusCode"] = 500;
  }

  return response;
};
