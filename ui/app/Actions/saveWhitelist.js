import Constants from 'AppConstants';

export default function saveWhitelist(whitelist) {
  return {
    type: Constants.SAVE_WHITELIST,
    payload: whitelist
  };
}
