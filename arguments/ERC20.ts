// [address _Token, uint256 _minBalance, uint256 _minimumQuorum, uint256 _proposalDuration, uint256 _requisiteMajority]
type argsArray = [string, string, string];

const AcdmToken = process.env.ACDM_TOKEN as string;

const baseArgs = ["RofloCoin", "ROFL"];

export const getAcdmArguments = (token = AcdmToken): argsArray => {
  return [...baseArgs, token] as argsArray;
};

export default getAcdmArguments() as argsArray;