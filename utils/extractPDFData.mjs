import {PdfReader} from 'pdfreader';

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
 
// Absolute difference calculator
function difference(a, b) {
  return Math.abs(a - b);
}

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
  const totalsIndex = numerics.length - 1;
  const totalCopies = numerics[totalsIndex].Supply;
  const totalBulk = numerics[totalsIndex].Bulk;
  const totalInKeys = numerics[totalsIndex]["Copies"];
  return (totalCopies - totalInKeys)/totalBulk;
}

function pdfParseData(file, dataArray) {
  return new Promise((resolve, reject) => {
    new PdfReader().parseBuffer(file, function(err, item){
      if (err)
        reject(err);
      else if (!item)
        resolve(dataArray);
      else if (item.text)
        dataArray.push(item);
    });
  });
};

export async function storeData(filename) {
  const parsedData = [];
  const pdfObject = await pdfParseData(filename, parsedData);
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
  
  // Find separated values that were not scanned properly. Need to refine spacing determination.
  const fixedGroupArray = groupedArray.map(array => {
    let joinCount = 0;
    return array.reduce((acc, curr, index) => {
      //console.log(acc, curr, index);
      const newIndex = index - joinCount; 
      const lastEntry = acc[newIndex - 1];

      if (index > 0) {
        const prevStart = lastEntry.x;
        const prevTextLength = lastEntry.text.length;
        const prevEnd = prevStart + prevTextLength * 0.378;
        //console.log(curr, prevEnd, curr.x);
        const previousText = lastEntry.text;
        const prevLength = previousText.length - 1; 
        const prevLetter = previousText[prevLength];
                
        if (difference(curr.x, prevEnd) < 0.5 || prevLetter == '.') {
          joinCount += 1;
          acc.pop();
          acc.push({"x": lastEntry.x, "y": lastEntry.y, "text": String(lastEntry.text) + String(curr.text)});
          return acc 
        }
        else {
          acc.push(curr);
          return acc
        }
      }      
      else {
        acc.push(curr);
        return acc
      }
    }, []);
  });
  
  // Join each sub array together.
  let joinedSubArrays = [];
  fixedGroupArray.forEach(subArray => {
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

  //console.log(splitStrings);

  // Determine the required routes based on day of week.
  const routes = determineRoutes(dayOfWeek);

  // Create an object for storing all data
  const dataObject = {};

  // Create an array for storing data for each route.
  const numericDataArray = [];

  // Obtain numeric data as last 6 entries of each array and 
  splitStrings.forEach((item,index) => {
    const numerics = item.slice(-6);
    const headers = ['Drops', 'Supply', 'Bulk', 'Keys', 'Copies', 'Weight'];
    const tempObject = {};
    numerics.forEach((numeric,index) => {
      return tempObject[headers[index]] = numeric;
    })
    tempObject.Route = routes[index]; 
    numericDataArray[index] = tempObject;
  });
  
  // Remove the Cental Coast Runs based on day of week and calculate trucks for NCHSAT
  if (dayOfWeek == 'Saturday') {
    numericDataArray.splice(14, 4); // 2nd parameter means remove 4 items only
    
    // Calculate truck 1 supply and add to the data Object
    const truck1 = Number(numericDataArray[0].Supply) + Number(numericDataArray[1].Supply);
    dataObject.Truck1 = truck1;
    
    // Calculate truck 2 supply by summing all relevant runs
    let truck2 = 0; 
    for (let i=2; i < numericDataArray.length; i++) {
      truck2 += Number(numericDataArray[i].Supply);
    } 

    // Add truck 2 supply to the data Object
    dataObject.Truck2 = truck2; 

    // Calculate total supply minus the central coast runs
    dataObject["TruckTotal"] = truck1 + truck2;
  }
  else {
    numericDataArray.splice(13, 3);
    
    let totalCount = 0; 
    for (let i=0; i < numericDataArray.length; i++) {
      totalCount += Number(numericDataArray[i].Supply);
    } 

    dataObject["TruckTotal"] = totalCount;
  }
  
  // Add data to the object
  dataObject["RouteData"] = numericDataArray

  // Add the date and day data to the object.
  dataObject["Date"] = dateString;
  dataObject["Day"] = dayOfWeek;

  // Calculate the bulk size based on total supply data and add to data object.
  const bulkSize = calculateBulkSize(numericDataArray);
  dataObject["BulkSize"] = bulkSize;

  // Determine publication code.
  const pubCode = `NCH${dayOfWeek.split('').slice(0,3).join('').toUpperCase()}`;
  dataObject["PublicationCode"] = pubCode;

  switch (dayOfWeek) {
    case 'Monday':
      dataObject["BackgroundColor"] = '#b8f2ba';
      break 
    case 'Tuesday':
      dataObject["BackgroundColor"] = '#eef0b9';
      break 
    case 'Wednesday':
      dataObject["BackgroundColor"] = '#b9c4f0';
      break 
    case 'Thursday':
      dataObject["BackgroundColor"] = '#f0e0b9';
      break 
    case 'Friday':
      dataObject["BackgroundColor"] = '#e2b9f0';
      break 
    default:
      dataObject["BackgroundColor"] = '#f0b9bd';
      break 
  }

  return dataObject;
}

//storeData("/home/steven/WebDevelopment/Route List Summary/pdf/RouteListSummary20221227_NCH_NCHTUE_NCHMFPRIM_221222093142_78.pdf")

