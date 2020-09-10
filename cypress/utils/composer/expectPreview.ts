import { getDomain } from '../networking';
import { APPS } from '../values';
const app = APPS.composer;

export function expectPreview(id: string, regex: RegExp) {
  const url = `${getDomain({ app })}/api/content/${id}/preview`;
  cy.request('GET', url).then((res) => {
    const content1 = res.body;
    expect(content1, 'the json content').to.not.be.undefined;
    const content2 = content1.data;
    expect(content2, 'the first data').to.not.be.undefined;
    const content3 = content2.blocks;
    expect(content3, 'the blocks').to.not.be.undefined;
    const content4 = content3.data;
    expect(content4, 'the second data').to.not.be.undefined;
    const content5 = content4[0];
    expect(content5, 'the first data element').to.not.be.undefined;
    const content6 = content5.data;
    expect(content6, 'the third data').to.not.be.undefined;
    const content7 = content6.elements;
    expect(content7, 'the elements').to.not.be.undefined;
    const content8 = content7[0];
    expect(content8, 'the first element').to.not.be.undefined;
    const content9 = content8.fields;
    expect(content9, 'the fields').to.not.be.undefined;
    const content10 = content9.text;
    expect(content10, 'the text').to.not.be.undefined;
    expect(content10, 'preview').to.match(regex);
  });
}
