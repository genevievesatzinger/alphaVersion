document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission from refreshing the page

    // access form fields
    var condition = document.getElementById('conditionSearch').value;
    var country = document.getElementById('countryFilter').value;
    var state = document.getElementById('stateFilter').value;
    var city = document.getElementById('cityFilter').value;
    var range = document.getElementById('rangeFromCity').value;
    var ageRange = document.getElementById('ageRange').value;
    var phases = [];

    // Collect the selected clinical trial phases
    var phase1Checkbox = document.getElementById('phase1');
    if (phase1Checkbox.checked) {
        phases.push(phase1Checkbox.value);
    }

    var phase2Checkbox = document.getElementById('phase2');
    if (phase2Checkbox.checked) {
        phases.push(phase2Checkbox.value);
    }

    var phase3Checkbox = document.getElementById('phase3');
    if (phase3Checkbox.checked) {
        phases.push(phase3Checkbox.value);
    }

    var location = city.split(",")
    var ageValues = ageRange.split("-");


    var searchQ = condition;
    if(country || state || city){
        searchQ += " AND SEARCH[Location](";
        searchQ += country ? "AREA[LocationCountry]" + country + " AND " : "";
        searchQ += state ? "AREA[LocationState]" + state + " AND " : "";
        searchQ += city ? "AREA[LocationCity]" + city : "";
        searchQ += ")";
        
    }
    // searchQ += " AND AREA[MinimumAge]" + ageValues[0];
    // searchQ += " AND AREA[MaximumAge]" + ageValues[1];

    console.log(searchQ);

    var query = "https://clinicaltrials.gov/api/query/study_fields?expr="; //heart+attack&field=Condition&expr=14&field=age&fmt=xml"
    query += escape(searchQ).replaceAll('%20','+');
    query += "&fields=NCTId%2CBriefTitle%2CCondition%2CLocationCity%2CLocationState%2CLocationCountry&min_rnk=1&max_rnk=10&fmt=xml";


    console.log(query)


    // Call a function to send an HTTP request with the form data
    sendData(query);

});


function sendData(query){
    fetch(query, {
        method: 'GET'
      })
        .then(response => response.text())
        .then(xmlContent => {
            parseXML(xmlContent)
        })
        .catch(error => {
          console.error('Error fetching URL:', error);
        });
}


function parseXML(xmlData) {
    // Parse the XML string
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlData, "text/xml");

    // Create table consts

    // Get the FieldList
    var fieldList = xmlDoc.getElementsByTagName("FieldList")[0];

    // Get the Field values
    var fields = fieldList.getElementsByTagName("Field");

    // Create an HTML table to display the fields
    var div1 = document.createElement('div');
    div1.className = 'shadow p-5 mt-5 mb-5 bg-white rounded';
    var table = document.createElement("table");
    table.className = "table";
    var tableHeader = document.createElement("thead");
    var tableBody = document.createElement("tbody");
    

    // Create table header row
    var headerRow = document.createElement("tr");
    for (const field of fields) {   
        var headerCell = document.createElement("th"); 
        headerCell.textContent = field.textContent;
        headerRow.appendChild(headerCell);
    }
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    // Get the StudyFieldsList
    var studyFieldsList = xmlDoc.getElementsByTagName("StudyFieldsList")[0];

    // Get the StudyFields values
    var studyFields = studyFieldsList.getElementsByTagName("StudyFields");


    // Create table rows for each field
    for (const studyField of studyFields) {
        var row = document.createElement("tr");
        var fieldValues = studyField.getElementsByTagName("FieldValues");
        for (const field of fields) {
            var cell = document.createElement("td");
            var fieldValue = studyField.querySelectorAll('[Field=' + field.textContent + ']')[0].getElementsByTagName("FieldValue")[0];
            cell.textContent = fieldValue.textContent;
            row.appendChild(cell);
        }
        tableBody.appendChild(row);
    }

    table.appendChild(tableBody);
    div1.appendChild(table);

    // Append the table to the document
    var parentDiv = document.querySelector('.container');
    parentDiv.appendChild(div1);
}
