// [address _Token, uint256 _minBalance, uint256 _minimumQuorum, uint256 _proposalDuration, uint256 _requisiteMajority]
type argsArray = [string, string, string];

const AcdmContract = process.env.ACDM_CONTRACT as string;

const baseArgs = ["RofloCoin", "ROFL"];

export const getTokenArguments = (contract = AcdmContract): argsArray => {
  return [...baseArgs, contract] as argsArray;
};

export default getTokenArguments() as argsArray;
