import history from '../data/history.json' assert { type: "json" };
import {removeDuplicates} from '../utils/removeDuplicates.mjs'
import {formatDate} from '../utils/formatDate.mjs'

export function find(searchDate) {
    return new Promise((resolve, reject) => {
        const formattedDate = formatDate(searchDate);
        const matchingEntry = history.importedData.find(data => {
            return data.Date == formattedDate; 
        })
        console.log(matchingEntry);
        resolve(matchingEntry);
    })
}

export function addNew(newEntry) {
    return new Promise((resolve, reject) => {
        history.importedData.push(newEntry);
        const updatedHistory = removeDuplicates(history.importedData);
        console.log(updatedHistory)
        const newObject = {};
        newObject["importedData"] = updatedHistory;
        const newJSON = JSON.stringify(newObject, null, 2);
        resolve(newJSON);
    })
}