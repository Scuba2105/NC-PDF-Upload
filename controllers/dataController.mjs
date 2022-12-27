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
        console.log(newData)
        const content = await addNew(newData);
        writeDataToFile('/home/steven/WebDevelopment/Route List Summary/data/history.json', content);
        return newData;
    }
    catch (error) {
        console.log(error);
    }
}

