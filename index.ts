import { BasedAppsSDK, chains } from "@ssv-labs/based-apps-sdk";
import * as dotenv from "dotenv";

const sdk = new BasedAppsSDK({
  chain: chains.holesky.id,
});

dotenv.config();

async function main(): Promise<void> {
  // calculate strategy-token weights via the SDK
  const strategyTokenWeights = await sdk.api.calculateParticipantWeights({
    bAppId: "0x64714cf5db177398729e37627be0fc08f43b17a6",
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

  /**
   ****** Combine with Arithmetic Weighted average ******
  **/
  console.info(`Using arithmetic weighted average to calculate Strategy weights.
    Validator Balance is 2 times more important than 0x68a8ddd7a59a900e0657e9f8bbe02b70c947f25f`);

  let simpleAverageStrategyWeights = new Map();
  for (const strategy of strategyTokenWeights) {
    // calculate the strategy weight, combining token weight and validator balance weight
    let strategyWeight =
      ((strategy.validatorBalanceWeight || 0) * validatorImportance +
        strategy.tokenWeights[0].weight * ssvTokenImportance) /
      (validatorImportance + ssvTokenImportance);
    // set the value in the mapping
    simpleAverageStrategyWeights.set(strategy.id, strategyWeight);
  }

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
      ((ssvTokenImportance / ssvTokenImportance + validatorImportance) /
        strategy.tokenWeights[0].weight +
        ((validatorImportance / ssvTokenImportance + validatorImportance) /
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
      2 * Math.log(strategy.tokenWeights[0].weight) +
      Math.log(strategy.validatorBalanceWeight || 0);
    let strategyWeight = Math.E ** (geom_numerator / 3);
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
