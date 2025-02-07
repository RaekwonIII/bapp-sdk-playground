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

  console.info(`Using arithmetic weighted average to calculate Strategy weights.
    Validator Balance is 10 times more important than 0x68a8ddd7a59a900e0657e9f8bbe02b70c947f25f`);

  const validatorImportance = 10;
  const ssvTokenImportance = 1;
  
  let strategyWeights = new Map();
  //   const strategyWeights =
  for (const strategy of strategyTokenWeights) {
    // calculate the strategy weight, combining token weight and validator balance weight
    let strategyWeight =
      ((strategy.validatorBalanceWeight || 0) * validatorImportance +
        strategy.tokenWeights[0].weight * ssvTokenImportance) /
      (validatorImportance + ssvTokenImportance);
    // set the value in the mapping
    strategyWeights.set(strategy.id, strategyWeight);
  }

  console.info(
    `Final Strategy weights: ${JSON.stringify(
        strategyWeights,
      undefined,
      2
    )}`
  );
}

main();
