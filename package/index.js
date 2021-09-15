const stripe = require("stripe")(process.env.stripeKey);
const { publicEncrypt } = require("crypto");

exports.handler = async (event, context) => {
  console.log(`Event: ${JSON.stringify(event)}`);

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
  console.log(`Creating Private Token`);
  let token = publicEncrypt(
    {
      key: process.env.publicKey,
      oaepHash: "sha256",
    },
    Buffer.from(process.env.privateToken)
  );

  console.log(`Private token done`);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: partialOptimiserPrice,
      currency: "usd",
      description: `Payment for partial optimiser vending machine`,
      metadata: {
        vendingMachine: "PO",
      },
    });
    console.log(`Successfully created payment intent: ${paymentIntent}`);
    response["body"] = {
      token: token,
      paymentIntent: paymentIntent,
    };
    console.log(`Sending success response: ${JSON.stringify(response)}`);
  } catch (error) {
    console.log(`Error creating payment intent: ${error}`);
    response["body"] = `${error}`;
    response["statusCode"] = 500;
  }

  return response;
};
