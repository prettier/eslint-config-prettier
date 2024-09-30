/* eslint-disable quotes,max-len,curly,@typescript-eslint/indent */
"use strict";

// Prettier wants a newline after the condition, but `eslint-config-google` does not.
if (cart.items && cart.items[0] && cart.items[0].quantity === 0)
  updateCart(cart);
