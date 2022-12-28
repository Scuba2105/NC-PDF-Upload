import {find, addNew} from '../models/dataModels.mjs';
import {writeDataToFile} from '../utils/writeDataToFile.mjs';
import {storeData} from '../utils/extractPDFData.mjs';
import fs from 'fs';
import path from 'path';

export async function findData(req, res) {
    try {
        const date = req.body.searchfordata;
        const content = await find(date);
        return content;
    } catch (error) {
        console.log(error);
    }
}

export async function createData(req, res, __dirname) {
    try {
        const pdf = req.files.pdftoparse
        const newData = await storeData(pdf.data);
        const content = await addNew(newData);
        const filePath = path.join(__dirname, 'data', 'history.json');
        writeDataToFile(filePath, content);
        return newData;
    }
    catch (error) {
        console.log(error);
    }
}

export async function getJSON(req, res, rootPath) {
    const dataPath = path.join(rootPath, 'data', 'history.json');
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            throw err;
        }
        res.send(data);
  });
}

