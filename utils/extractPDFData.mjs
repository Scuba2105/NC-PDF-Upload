import {PdfReader} from 'pdfreader';

const parsedData = [];

function bubbleSort(arr, coordinate){

  //Outer pass
  for(let i = 0; i < arr.length; i++){

      //Inner pass
      for(let j = 0; j < arr.length - i - 1; j++){

          //Value comparison using ascending order

          if(arr[j + 1][coordinate] < arr[j][coordinate]){

              //Swapping
              [arr[j + 1],arr[j]] = [arr[j],arr[j + 1]]
          }
      }
  };
  return arr;
};

function groupBy(ary, keyFunc) {
  var r = {};
  ary.forEach(x => {
    var newKey = keyFunc(x.y);
    r[newKey] = (r[newKey] || []).concat(x);
  });
  return Object.keys(r).map(newKey => {
    return r[newKey];
  });
};

function getDayOfWeek(dateString) {
  // Split date string to get day, month and year.
  const dateArray = dateString.split('/');
  const day = dateArray[0];
  const month = dateArray[1];
  const year = dateArray[2];

  // Create new date from the day, month, and year.
  const pubDate = new Date(+year, +month - 1, +day);

  // Determine day of the week from date. 
  const dayNumber = pubDate.getDay(); 

  // Lookup array for day of week based on day number above
  const dayOfWeekArray = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday','Friday','Saturday'];
  return dayOfWeekArray[dayNumber];
};

function determineRoutes(day) {
  if (day == 'Saturday') {
    return ['SATNDSNEW','SATNDSCC','SATB005N','SATB015N','SATB018N','SATB020N','SATB030N','SATB045N','SATB055N','SATB060N','SATB065N','SATB067N','SATB070N','SATB090N','SATCCEST','SATCCNTH','SATCCSTH','Totals'];
  }
  else {
    return ['MFNDSNEW','MFNDSCC','MFB010N','MFB015N','MFB020N','MFB060N','MFB065N','MFB070N','MFB075N','MFB080N','MFB085N','MFB090N','MFB095N','MFCCSTH','MFCCNTH','Totals']; 
  }
};

function calculateBulkSize(numerics) {
  const totalCopies = numerics.Totals[1].Supply;
  const totalBulk = numerics.Totals[2].Bulk;
  const totalInKeys = numerics.Totals[4]["Copies in Keys"];
  return (totalCopies - totalInKeys)/totalBulk;
}

function pdfParseData(file) {
  return new Promise((resolve, reject) => {
    new PdfReader().parseFileItems(file, function(err, item){
      if (err)
        reject(err);
      else if (!item)
        resolve(parsedData);
      else if (item.text)
        parsedData.push(item);
    });
  });
};

async function storeData(filename) {
  const pdfObject = await pdfParseData(filename);
  const transformedData = pdfObject.map(item => {
    return {"x": Number(item.x), "y": Number(item.y), "text": item.text};
  });
  const sortedYData = bubbleSort(transformedData, "y");
  
  // Extract the publication date from the headers.
  const dateString = sortedYData.filter(item => {
    return (item.x > 15 && item.x < 16 && item.y > 2 && item.y < 3);
  })[0].text;

  // Determine the day of the week. 
  const dayOfWeek = getDayOfWeek(dateString);

  // Remove unnecessary header data from the text data.
  const removedHeaders = sortedYData.filter(item => {
    return item.y > 8.75;
  });

  // Group the data into rows based on y position.
  const groupedArray = groupBy(removedHeaders, x => {
    return Math.floor(x);
  });
  
  // Check the number of rows in the output.
  //console.log(groupedArray.length);

  // Arrange each row into order based on x position. 
  groupedArray.forEach(subArray => {
    bubbleSort(subArray, "x");
  })

  // Join each sub array together.
  let joinedSubArrays = [];
  groupedArray.forEach(subArray => {
    let mappedSubArray = [];
    subArray.map(item => {
      mappedSubArray.push(item.text);
    });
    joinedSubArrays.push(mappedSubArray.join(';'));
  });
  
  // Remove spaces and commas from string before splitting.
  const splitStrings = joinedSubArrays.map(string => {
    return string.replace(/\s/g, '').replace(',;','').replace(',','').split(';');
  });

  // Determine the required routes based on day of week.
  const routes = determineRoutes(dayOfWeek);


  // Create an object for storing data for each route.
  const numericDataObject = {};

  // Obtain numeric data as last 6 entries of each array and 
  splitStrings.forEach((item,index) => {
    const numerics = item.slice(-6);
    const headers = ['Drops', 'Supply', 'Bulk', 'Keys', 'Copies in Keys', 'Weight (kg)'];
    const numericsWithHeaders = numerics.map((numeric,index) => {
      return {[headers[index]]: numeric}
    })
    
    numericDataObject[routes[index]] = numericsWithHeaders;
  });

  // Add the date and day data to the object.
  numericDataObject["Date"] = dateString;
  numericDataObject["Day"] = dayOfWeek;

  // Calculate the bulk size based on total supply data and add to data object.
  const bulkSize = calculateBulkSize(numericDataObject);
  numericDataObject["Bulk Size"] = bulkSize;

  // Determine publication code.
  const pubCode = `NCH${dayOfWeek.split('').slice(0,3).join('').toUpperCase()}`;
  numericDataObject["Publication Code"] = pubCode;

  console.log(numericDataObject);
  
  return numericDataObject;
}

storeData("/home/steven/WebDevelopment/Route List Summary/pdf/RouteListSummary20221224_NCH_NCHSAT_NCHSATPRIM_221221082147_58.pdf")



