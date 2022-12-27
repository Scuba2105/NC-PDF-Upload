export function removeDuplicates(array) {
    
    const newArray = [];
    let dateArray = [];
    
    array.forEach(entry => {
        if (!dateArray.includes(entry.Date)) {
            dateArray.push(entry.Date);
            newArray.push(entry);
        }
    });

    return newArray;

}