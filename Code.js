function doGet(request) {
  return HtmlService.createTemplateFromFile('index.html')
      .evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Functions')
    .addItem('updateSheets', 'updateSheets')
    .addToUi();
}

function createNewSheets() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  
  //creates new sheets
  let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  let periods = ["EB", "1", "2", "3", "4", "5", "6", "7", "8", "9", "AS"];
  for(let i = 0; i < days.length; i++) {
    for(let k = 0; k < periods.length; k++) {
        let name = days[i] + " " + periods[k];
        let sheet = ss.getSheetByName('Day Template').copyTo(ss);

        /* Before cloning the sheet, delete any previous copy */
        let old = ss.getSheetByName(name);
        if (old) ss.deleteSheet(old); // or old.setName(new Name);

        SpreadsheetApp.flush(); // Utilities.sleep(2000);
        sheet.setName(name);

        /* Make the new sheet active */
        ss.setActiveSheet(sheet);
    }
  }
}

let periodSubstitutionMap = {
  "Early Bird": "EB",
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  "After School": "AS"
}

let dayList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
let periodList = ["EB", "1", "2", "3", "4", "5", "6", "7", "8", "9", "AS"];

function clearSheets() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  
  //creates new sheets
  let template = ss.getSheetByName("Day Template")
  let values = template.getRange("A1:K1").getValues();
  for(let i = 0; i < dayList.length; i++) {
    for(let k = 0; k < periodList.length; k++) {
        let name = dayList[i] + " " + periodList[k];
        let sheet = ss.getSheetByName(name);
        sheet.clear();
        sheet.getRange("A1:K1").setValues(values);
    }
  }
}

function updateSheets() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  //goes through responses
  let responses = ss.getSheetByName("Form Responses 1");
  let row = 2;
  while(responses.getRange(row, 1).getValue() != "") {
    if(responses.getRange(row, 1).getBackground() != "#008000") {
      let studentDays = responses.getRange(row, 6).getValue().split(", ");
      let studentPeriods = responses.getRange(row, 7).getValue().toString().split(", ");
      let studentPeriodsSubstituted = []; // Student Periods with "Early Bird" and "After School" substituted with "EB" and "AS"
      studentPeriods.forEach((period) => {
        studentPeriodsSubstituted.push(periodSubstitutionMap[period]);
      });
      studentPeriods = studentPeriodsSubstituted;

      let layout = [2, 3, 4, 5, 8, 6, 7, 11, 12, 13, 14, 15];
      let data = responses.getRange(row, 1, 1, 17).getValues();
      
      let shiftedData = [[]];
      
      for(let l = 0; l < layout.length; l++) {
        shiftedData[0].push(data[0][layout[l]-1]);
      }

      //goes through each day and sets values
      for(let i = 0; i < studentDays.length; i++) {
        for(let k = 0; k < studentPeriods.length; k++) {
          let name = studentDays[i] + " " + studentPeriods[k];
          let sheet = ss.getSheetByName(name);
          
          let periodRow = 2;
          while(sheet.getRange(periodRow, 1).getValue() != "") {
            periodRow++
          }

          sheet.getRange(periodRow, 1, 1, 12).setValues(shiftedData);
        }
      }
    responses.getRange(row, 1).setBackground("#008000");
    row++;
    }
    else {
      row++;
    }
  }
}

function fetchStudents(days, periods) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (days == "Any") {
    days = dayList;
  } else {
    days = [days];
  }
  if (periods == "Any") {
    periods = periodList;
  } else {
    periods = [periods];
  }
  let activePeriods = [];
  days.forEach((day) => {
    periods.forEach((period) => {
      activePeriods.push(ss.getSheetByName(day + " " + period));
      //console.log(day + " " + period);
    })
  })
  let studentValues = [];
  let row = 2;
  let format = [1, 2, 5, 6, 7, 8, 9, 10, 11];
  let foundStudents = new Set();

  activePeriods.forEach((activePeriod) => {
    let currentValues = activePeriod.getRange(row, 1, 1, 12).getValues()[0];
    while (currentValues[0] != "") {
      if (foundStudents.has(currentValues[3])) {
        row++;
        currentValues = activePeriod.getRange(row, 1, 1, 12).getValues()[0];
        continue;
      }
      foundStudents.add(currentValues[3]);
      studentDetails = [];
      for(let i = 0; i < format.length; i++) {
        studentDetails.push(currentValues[format[i]]);
      }
      studentValues.push(studentDetails);
      row++;
      currentValues = activePeriod.getRange(row, 1, 1, 12).getValues()[0];
    }
    row = 2;
  })
  return studentValues;
}

function testFetchStudents() {
  console.log(fetchStudents("Monday", "Any"));
}

function testColor() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Form Responses 1");
  console.log(sheet.getRange(2, 1).getBackground());
}