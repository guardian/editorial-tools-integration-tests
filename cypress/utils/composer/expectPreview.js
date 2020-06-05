import { getDomain } from "../networking";
import { getContent } from "./getContent";

export async function expectPreview(id, regex) {
    const url = `${getDomain()}api/content/${id}/preview`;
    const data = await getContent(url);
    expect(data, "the data").to.not.be.null;
    const content1 = JSON.parse(data);
    expect(content1, "the json content").to.not.be.undefined;
    const content2 = content1.data;
    expect(content2, "the first data").to.not.be.undefined;
    const content3 = content2.blocks;
    expect(content3, "the blocks").to.not.be.undefined;
    const content4 = content3.data;
    expect(content4, "the second data").to.not.be.undefined;
    const content5 = content4[0];
    expect(content5, "the first data element").to.not.be.undefined;
    const content6 = content5.data;
    expect(content6, "the third data").to.not.be.undefined;
    const content7 = content6.elements;
    expect(content7, "the elements").to.not.be.undefined;
    const content8 = content7[0];
    expect(content8, "the first element").to.not.be.undefined;
    const content9 = content8.fields;
    expect(content9, "the fields").to.not.be.undefined;
    const content10 = content9.text;
    expect(content10, "the text").to.not.be.undefined;
    expect(content10, "preview").to.match(regex);
}

