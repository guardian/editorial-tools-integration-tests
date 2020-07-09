import { fetchAndSetCookie } from '../../utils/networking';
import { checkVars } from "../../utils/vars";
import { inATemporaryArticle } from "../../utils/composer/inATemporaryArticle";

describe('Composer Basic Behaviour Tests', () => {
  beforeEach(() => {
    checkVars();
    fetchAndSetCookie(true)
  });

  inATemporaryArticle('Do nothing but create and delete')

});
