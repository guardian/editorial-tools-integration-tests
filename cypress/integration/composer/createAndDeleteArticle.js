import { setCookie } from "../../utils/networking";
import { inATemporaryArticle } from "../../utils/composer/inATemporaryArticle";

describe('Composer Basic Behaviour Tests', () => {
  beforeEach(() => {
    setCookie(cy);
  });

  inATemporaryArticle('Do nothing but create and delete')

});
