import { BasedAppsSDK, chains } from "@ssv-labs/bapps-sdk";

const sdk = new BasedAppsSDK({
  chain: chains.holesky.id,
  env: 'stage'
});

async function main(): Promise<void> {
  const tokenCoefficients = [
    {
      token: "0x68a8ddd7a59a900e0657e9f8bbe02b70c947f25f",
      coefficient: 5,
    },
    {
      token: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      coefficient: 30,
    },
  ];
  const validatorCoefficient = 1;
  // calculate strategy-token weights via the SDK
  const strategyTokenWeights = await sdk.api.calculateParticipantWeights({
    bAppId: "0xaA184b86B4cdb747F4A3BF6e6FCd5e27c1d92c5c",
  });

  console.info(
    `Strategy-token weights: ${JSON.stringify(
      strategyTokenWeights,
      undefined,
      2
    )}`
  );

  console.info(`Weight coefficient for Validator Balance is ${validatorCoefficient}`);
  for (let tokenCoefficient of tokenCoefficients){
    console.info(`Weight coefficient for token ${tokenCoefficient.token} is ${tokenCoefficient.coefficient}`);
  }
  /**
   ****** Combine with Arithmetic Weighted average ******
   **/
  console.info(`Using arithmetic weighted average to calculate Strategy weights.`);

  let simpleAverageStrategyWeights = sdk.utils.calcSimpleStrategyWeights(
    strategyTokenWeights,
    {
      coefficients: tokenCoefficients,
      validatorCoefficient: validatorCoefficient,
    }
  );

  console.info(
    `Final Strategy weights: ${JSON.stringify(
      Object.fromEntries(simpleAverageStrategyWeights),
      undefined,
      2
    )}`
  );
  
  /**
  ****** Combine with harmonic weighted average ******
 **/
 console.info(`Using harmonic weighted average to calculate Strategy weights`)
 
 let harmonicAverageStrategyWeights = sdk.utils.calcHarmonicStrategyWeights(
  strategyTokenWeights,
  {
    coefficients: tokenCoefficients,
    validatorCoefficient: validatorCoefficient,
  })

 console.info(
   `Final Strategy weights: ${JSON.stringify(
     Object.fromEntries(harmonicAverageStrategyWeights),
     undefined,
     2
   )}`
 );

 /**
  ****** Combine with geometric average ******
 **/
 console.info(`Using weighted geometric average to calculate Strategy weights.`);

 let geometricAverageStrategyWeights = sdk.utils.calcGeometricStrategyWeights(
  strategyTokenWeights,
  {
    coefficients: tokenCoefficients,
    validatorCoefficient: validatorCoefficient,
  })

 console.info(
   `Final Strategy weights: ${JSON.stringify(
     Object.fromEntries(geometricAverageStrategyWeights),
     undefined,
     2
   )}`
 );
}

main();
