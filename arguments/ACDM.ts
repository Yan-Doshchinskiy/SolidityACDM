// [address _Token, uint256 _minBalance, uint256 _minimumQuorum, uint256 _proposalDuration, uint256 _requisiteMajority]
type argsArray = [string, number, number, number, number];

const DaoToken = process.env.DAO_TOKEN_ADDRESS as string;

const baseArgs = [5, 10, 86400, 50];

export const getDaoArguments = (token = DaoToken): argsArray => {
  return [token, ...baseArgs] as argsArray;
};

export default [DaoToken, ...baseArgs] as argsArray;
