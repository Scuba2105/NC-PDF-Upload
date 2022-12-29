const uploadButton = document.querySelector('.upload');
const searchButton = document.querySelector('.search')

uploadButton.addEventListener('click', pdfValidation);
searchButton.addEventListener('click', dateValidation);

function pdfValidation() {
    const uploadForm = document.querySelector('.uploadform')
    const fileUpload = document.querySelector('.fileupload');
    const value = fileUpload.value;

    if (value == '') {
        alert('There is currently no pdf file selected for upload. Please select the route summary pdf before uploading')
        return
    }

    const stringArray = value.replace(/\\/g,'%').split('%');
    const lastIndex = stringArray.length - 1;
    const filename = stringArray[lastIndex];
    const extension = filename.split('.')[1];
    const name = filename.split('.')[0];
    if (/^RouteListSummary/.test(name) && extension == 'pdf') {
        uploadForm.submit();
    }
    else {
        if (extension != 'pdf') {
            alert('You have not uploaded pdf file.');
        }
        else {
            alert('The pdf file you uploaded is not correct');
        }
    }
}

async function dateValidation() {
    const directory = window.location.href;
    const searchForm = document.querySelector('.searchform');
    const inputDate = document.querySelector('.searchdate').value;

    if (inputDate == '') {
        alert('The date field is currently empty. Please select a date before searching')
        return
    }

    console.log(`${directory}dates`);

    formattedDate = inputDate.split('-').reverse().join('/');
    
    const response = await fetch(`${directory}dates`);

    const dataObject  = await response.json();
    const dataArray = dataObject.importedData;
    const dates = dataArray.map(data => {
        return data.Date
    })
    
    console.log(dates);

    if (dates.includes(formattedDate)) {
        searchForm.submit();
    }    
    else {
        alert(`There is no data available for ${formattedDate}. Please select a valid date`);
    }
}