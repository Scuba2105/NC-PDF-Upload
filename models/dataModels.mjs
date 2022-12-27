import history from '../data/history.json' assert { type: "json" };

export function find(searchDate) {
    return new Promise((resolve, reject) => {
        selectedDevice = history.importedData.find(data => {
            return data.Date == searchDate 
        })
        resolve(selectedDevice);
    })
}

export function addNew(newEntry) {
    return new Promise((resolve, reject) => {
        history.importedData.push(newEntry);
        const newJSON = JSON.stringify(history);
        resolve(newJSON);
    })
}