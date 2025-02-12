import { BasedAppsSDK, chains } from "@ssv-labs/bapps-sdk";

const sdk = new BasedAppsSDK({
  chain: chains.holesky.id,
});

async function main(): Promise<void> {
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

  // Arbitrarily defined weights, the bApp has to decide these for themselves
  const validatorImportance = 1;
  const ssvTokenImportance = 2;
  const ethTokenImportance = 30;
  /**
   ****** Combine with Arithmetic Weighted average ******
   **/
  console.info(`Using arithmetic weighted average to calculate Strategy weights.
    Validator Balance is 2 times more important than 0x68a8ddd7a59a900e0657e9f8bbe02b70c947f25f`);
    
    let simpleAverageStrategyWeights = sdk.utils.calcSimpleStrategyWeights({
      strategyTokenWeights: strategyTokenWeights,
      coefficients: [ {
        token: "0x68a8ddd7a59a900e0657e9f8bbe02b70c947f25f",
        coefficient: 5
      },
      {
        token: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        coefficient: 30
      }
      ],
      validatorCoefficient: 1
    })

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
  console.info(`Using harmonic weighted average to calculate Strategy weights.
    Validator Balance is 2 times more important than 0x68a8ddd7a59a900e0657e9f8bbe02b70c947f25f`);

  // define the harmonic function
  const harmonic = (strategy) => {
    return (
      1 /
      ((ssvTokenImportance / (ssvTokenImportance + ethTokenImportance +validatorImportance)) /
        strategy.tokenWeights[0].weight +
        (ethTokenImportance / (ethTokenImportance + ethTokenImportance + validatorImportance)) /
        strategy.tokenWeights[1].weight +
        ((validatorImportance / ssvTokenImportance + ethTokenImportance + validatorImportance) /
          strategy.validatorBalanceWeight || 0))
    );
  };
  
  let harmonicAverageStrategyWeights = new Map();
  // normalization coefficient
  let c_norm = strategyTokenWeights.reduce(
    (accumulator, strategy) => harmonic(strategy) + accumulator,
    0
  );
  for (const strategy of strategyTokenWeights) {
    let strategyWeight = harmonic(strategy) / c_norm;
    // set the value in the mapping
    harmonicAverageStrategyWeights.set(strategy.id, strategyWeight);
  }

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
  console.info(`Using weighted geometric average to calculate Strategy weights.
    Validator Balance is 2 times more important than 0x68a8ddd7a59a900e0657e9f8bbe02b70c947f25f`);

  let geometricAverageStrategyWeights = new Map();

  for (const strategy of strategyTokenWeights) {
    let geom_numerator =
      ssvTokenImportance * Math.log(strategy.tokenWeights[0].weight) +
      ethTokenImportance * Math.log(strategy.tokenWeights[1].weight) +
      validatorImportance * Math.log(strategy.validatorBalanceWeight || 0);
    let strategyWeight = Math.E ** (geom_numerator / ssvTokenImportance + ethTokenImportance + validatorImportance);
    // set the value in the mapping
    geometricAverageStrategyWeights.set(strategy.id, strategyWeight);
  }

  console.info(
    `Final Strategy weights: ${JSON.stringify(
      Object.fromEntries(geometricAverageStrategyWeights),
      undefined,
      2
    )}`
  );
}

main();
