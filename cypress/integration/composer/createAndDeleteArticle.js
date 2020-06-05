import { setCookie } from "../../utils/networking";
import { checkVars } from "../../utils/vars";
import { inATemporaryArticle } from "../../utils/composer/inATemporaryArticle";

describe('Composer Basic Behaviour Tests', () => {
  beforeEach(() => {
    checkVars();
    setCookie(cy);
  });

  inATemporaryArticle(
      'Do nothing but create and delete',
      async () => {return cy},
      async () => {})
});
