export function formatDate(inputDate) {
    const outputDate = inputDate.split('-').reverse().join('/');
    console.log(outputDate)
    return outputDate;
}