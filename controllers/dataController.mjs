import {find, addNew} from '../models/dataModels.mjs';
import {writeDataToFile} from '../utils/writeDataToFile.mjs';
import {storeData} from '../utils/extractPDFData.mjs';

export async function findData(req, res) {
    try {
        model = req.url.split('/')[3];
               
        const equipment = await find(model);
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(equipment));
        res.end();
    } catch (error) {
        console.log(error);
    }
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

