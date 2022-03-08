// (uint256 _roundDuration, uint256 _roundSupply, uint256 _ethAmount, uint256 _tokenPriceRatio, address _TokenACDM)
type argsArray = [number, number, string, number, string, string];

const AcdmToken = process.env.ACDM_TOKEN as string;

const baseArgs = [259200, "100000", "1000000000000000000", 3, "4000000000000"];

export const getAcdmArguments = (token = AcdmToken): argsArray => {
  return [...baseArgs, token] as argsArray;
};

export default getAcdmArguments() as argsArray;
