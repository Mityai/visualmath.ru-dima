export let token = state => {
  if (!state.auth.user) {
    return undefined;
  }

  return state.auth.user.token;
};
