import {find, addNew} from '../models/dataModels.mjs';
import {writeDataToFile} from '../utils/writeDataToFile.mjs';
import {storeData} from '../utils/extractPDFData.mjs';

export async function findData(req, res) {
        const date = req.body.searchfordata;
        const content = await find(date);
        return content;
}

export async function createData(req, res) {
    try {
        const pdf = req.files.pdftoparse
        const newData = await storeData(pdf.data);
        const content = await addNew(newData);
        const filePath = '/home/steven/WebDevelopment/Route List Summary/data/history.json';
        writeDataToFile(filePath, content);
        return newData;
    }
    catch (error) {
        console.log(error);
    }
}

