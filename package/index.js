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
  try {
    // This takes a private token stored in .env file, and uses a public key (also in .env) to encrypt it. This encrypted token is then sent to the client.
    // We must save the public key as base64 encoded as an environment variable in the AWS Lambda because lambda does not preserve the line breaks
    // and formatting of the key. Thus, if we base64 encode it, then decode it in the lambda, the formatting is saved and it works.
    console.log(`Public Key base64: ${process.env.publicKey}`);
    const decodedPublicKey = Buffer.from(
      process.env.publicKey,
      "base64"
    ).toString("utf-8");
    // console.log(`Public Key decoded: ${decodedPublicKey}`);
    let token = publicEncrypt(
      {
        key: decodedPublicKey,
        oaepHash: "sha256",
      },
      Buffer.from(process.env.privateToken)
    );

    console.log(`Private token done`);

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
