// tables object has all information needed to render all tables, update rows and even define which 
// fields cannot be change
const tables = {
    'Users_2021': {
        type: 'mssql',
        apiUrl: 'Users/getAllUsers',
        editUrl: 'Users',
        columns: {
            "Id": "int",
            "Email": "string",
            "Name": "string",
            "Surname": "string",
            "Password": "string",
            "PhoneNumber": "string",
            "Gender": "string",
            "DateOfBirth": "string",
            "Genre": "string",
            "Address": "string",
            "Type": "int",
            "Active": "int",
            "EmailActivated": "bool",
        },
        data: null,
        objTemplate: {
            "Id": "",
            "Name": "",
            "Surname": "",
            "Email": "",
            "Password": "",
            "PhoneNumber": "",
            "Gender": "",
            "DateOfBirth": "",
            "Genre": "",
            "Address": "",
            "Type": "",
            "EmailActivated": ""
        },
        tbl: null,
        disabled: ['Id', 'Email']
    },
    'TVShow_2021': {
        type: 'mssql',
        apiUrl: 'UserEpisodes/getAllTvShows',
        editUrl: 'UserEpisodes/UpdateTVShow',
        columns: {
            "Id": "int",
            "Name": "string",
            "Origin_country": "string",
            "Original_language": "string",
            "Popularity": "float",
            "Poster_path": "string",
            "First_air_date": "string",
        },
        data: null,
        objTemplate: {
        },
        tbl: null,
        disabled: ['Id']
    },
    'Episodes_2021': {
        type: 'mssql',
        apiUrl: 'UserEpisodes/getAllEpisodes',
        editUrl: 'UserEpisodes/UpdateEpisode',
        columns: {
            "Id": "int",
            "EpisodeName": "string",
            "SeasonNumber": "int",
            "EpisodeAirDate": "string",
            "TvshowId": "int",
            "EpisodeImg": "string",
        },
        data: null,
        objTemplate: {
        },
        tbl: null,
        disabled: ['Id', 'TvshowId']
    },
    'MessagesFB': {
        type: 'firebase',
        apiUrl: 'UserMessages/getAllMessages',
        editUrl: 'UserMessages',
        columns: {
            "msgId": "int",
            "msgText": "string",
            "datetime": "DateTime",
            "userId": "int",
            "tvShowId": "int",
            "parentId": "int",
        },
        data: null,
        objTemplate: {
            "msgId": "int",
            "msgText": "string",
            "datetime": "DateTime",
            "userId": "int",
            "tvShowId": "int",
            "parentId": "int",
        },
        tbl: null,
        disabled: ['tvShowId', 'userId', 'parentId', 'msgId', 'likes', 'dislikes']
    },
}

let expanded = false;
tableData = null;
test = null;

$(document).ready(function () {
    // if user isn't been logged in and try to enter the adminpanel page -> redirect to homepage
    if (localStorage.loggedUser == undefined)
        window.location.href = 'homepage.html';

    // if user is logged, get the user information, render the charts and drop down list
    user = JSON.parse(localStorage.loggedUser)
    showWelcomeText();
    generateChartData();
    renderCheckBoxes();
});

// renderCheckBoxes renders all tables from the tables global object into the drop-down list
const renderCheckBoxes = () => {
    checkboxesDiv = document.getElementById("checkboxes");
    checkboxes.innerHTML = "";
    Object.keys(tables).forEach(key => {
        checkboxesDiv.innerHTML += `
        <label for="${key}">
        <input onchange="toggleTable(this)" type="checkbox" id="${key}" />
        ${key}
        </label>
        `
    });
}

// showCheckboxes is an event listener function, when the user clicks on the select box -> it 
// renders a drop-down list with the avilable tables
function showCheckboxes() {
    var checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
        checkboxes.style.display = "block";
        expanded = true;
    } else {
        checkboxes.style.display = "none";
        expanded = false;
    }
}

// toggleTable been called when the user clicks on a table from the drop-down list
// it simply creates a div inside 'tablesDiv', then calls to renderDataTable function with the table id
const toggleTable = (checkbox) => {
    if (checkbox.checked != true) {
        document.getElementById(checkbox.id + "Div").remove();
    }
    else {
        tablesDiv = document.getElementById("tablesDiv");
        tablesDiv.innerHTML +=
            `
        <div id="${checkbox.id}Div">
        </div>
        `
        renderDataTable(checkbox.id)
    }
}

// renderDataTable function is a async function which first fetches the table data and stores it a global variable.
// Then calls to 2 other functions. The first function called buildTableDiv, and the second one called fillTableRows.
// See those functions for more information.
const renderDataTable = async (tableName) => {
    tableData = null;
    switch (tables[tableName].type) {
        case 'mssql':
            $.ajax({
                url: `../api/${tables[tableName].apiUrl}/`,
                type: 'GET',
            }).then((data) => {
                console.log(data);
                // save the data into the global var
                tables[tableName].data = data;
                // create div
                buildTableDiv(tableName);
                // fill table
                fillTableRows(tableName, data);
            }).catch((error) => {
                console.log(error);
            })
            break;
        case 'firebase':
            let messagesArray = [];
            ref = firebase.database().ref("Messages");
            let x = await ref.once("value", snapshot => {
                Object.keys(snapshot.val()).forEach(key => {
                    Object.keys(snapshot.val()[key]).forEach(index => {
                        let msg = snapshot.val()[key][index];
                        msg["msgId"] = index;
                        msg["parentId"] = "none";
                        messagesArray.push(msg);
                        // if msg has replies -> add those messages into array
                        if (msg.replies) {
                            let counter = 0;
                            msg.replies.forEach(reply => {
                                reply["parentId"] = index;
                                reply["msgId"] = counter++;
                                messagesArray.push(reply);
                            });
                        }
                    });
                });
            });
            tables[tableName].data = messagesArray;
            // create div
            buildTableDiv(tableName);
            // // fill table
            fillTableRows(tableName, messagesArray);
            break;
        default:
            alert(`Something went wrong!, cannot ${tables[tableName].type} is out of range`);
    }
}

// fillTableRows function simply renders the information into the disired dataTable
const fillTableRows = (tableName, tableData) => {
    data = tableData;
    let myColumns = [];
    myColumns.push({
        render: function (data, type, row, meta) {
            let innerData;
            if (!row.parentId) {
                innerData = "data-rowId=" + row.Id + " data-tableName=" + tableName + " data-fieldname=" + Object.keys(tables[tableName].columns)[0];
            }
            else if (row.parentId == "none") {
                innerData = "data-rowId=" + row.msgId + " data-tableName=" + tableName + " data-fieldname=" + Object.keys(tables[tableName].columns)[0];
            }
            else {
                innerData = " data-rowId=" + row.msgId + " data-parentId=" + row.parentId + " data-tableName=" + tableName + " data-fieldname=" + Object.keys(tables[tableName].columns)[0];
            }
            if (row.Active != undefined) {
                if (row.Active == true) {
                    editBtn = "<button onclick='editRow(this)' type='button' class = 'editBtn btn btn-success' " + innerData + "> Edit </button>";
                    deleteBtn = "<button type='button' data-tvshowid='" + row.tvShowId + "' onclick='deleteUser(this)' class = 'deleteBtn btn btn-danger' " + innerData + "> Delete </button>";
                    return editBtn + deleteBtn;
                }
                else {
                    editBtn = "<button onclick='editRow(this)' type='button' class = 'editBtn btn btn-success' " + innerData + "> Edit </button>";
                    deleteBtn = "<button type='button' data-tvshowid='" + row.tvShowId + "' onclick='retriveUser(this)' class = 'deleteBtn btn blueBtn' " + innerData + "> Retrive </button>";
                    return editBtn + deleteBtn;
                }
            }
            if (tableName == "MessagesFB") {
                deleteBtn = "<button type='button' data-tvshowid='" + row.tvShowId + "' onclick='deleteRow(this)' class = 'deleteBtn btn btn-danger' " + innerData + "> Delete </button>";
                return editBtn + deleteBtn;
            }
            return editBtn;

        }
    })
    myColumns.push({
        render: function (data, type, row, meta) {
            if (row.likes)
                return row.likes.length;
            else return 0;
        }
    })
    myColumns.push({
        render: function (data, type, row, meta) {
            if (row.dislikes)
                return row.dislikes.length;
            else return 0;
        }
    })
    Object.keys(tables[tableName].columns).forEach(key => {
        myColumns.push({ data: key });
    });
    try {
        tables[tableName].tbl = $("#" + tableName + "Table").DataTable({
            data: tableData,
            pageLength: 5,
            columns: myColumns

        });
    }
    catch (err) {
        alert(err);
    }
}

// buildTableDiv been called by renderDataTable, and responsible for creating the table tag for the information
// to be rendered in.
const buildTableDiv = (tableName) => {
    let tableDiv = document.getElementById(tableName + "Div");
    tableDiv.innerHTML = `
    <table id="${tableName}Table" class="display nowrap" style="width:100%">
        <thead>
            <tr id="${tableName}Row">
               <th>actions</th>
               <th>likes</th>
               <th>dislikes</th>
            </tr>
        </thead>
    </table>`;
    let tr = document.getElementById(tableName + "Row");
    Object.keys(tables[tableName].columns).forEach(key => {
        tr.innerHTML += `
        <th>${key}</th>
        `
    });
}

// editRow simply opens up the edit div for the desired row.
// this function is been called from the edit button who placed in each row of the dataTable.
const editRow = (btn) => {
    let rowId = btn.getAttribute("data-rowid");
    let tableName = btn.getAttribute("data-tablename");
    let fieldName = btn.getAttribute("data-fieldname");

    //open form below the table data
    if (document.getElementById(tableName + "Form")) {
        if (document.getElementById(tableName + "Form").getAttribute("data-rowid") == rowId) {
            document.getElementById(tableName + "Form").remove()
            return;
        }
        else {
            document.getElementById(tableName + "Form").remove()
        }
    }

    document.getElementById(tableName + "Div").innerHTML +=
        `
    <form id=${tableName + "Form"} data-rowid="${rowId}" action="/action_page.php" method="get">
    <input id="submitEdit" type="submit" value="Submit" />
    </form>
    `;
    $("#" + tableName + "Form").submit(submitRowChanges);

    // Dynamiclly create inputs
    let form = document.getElementById(tableName + "Form");
    let editRow = null;

    tables[tableName].data.forEach(row => {
        if (row[fieldName] == rowId) {
            editRow = row;
        }
    });
    for (const [key, value] of Object.entries(editRow)) {

        form.innerHTML +=
            `
        <div class="editInputs">
        <label for="${key}">${key}</label>
        <input ${tables[tableName].disabled.includes(key) ? "Disabled" : ""} type="text" id="${key + tableName}Input" name="${key}" value="${value}">
        </div>
        `
    };
}

// submitRowChanges calls to submitChanges with the data and returns false for the UserAgent(so it won't automaticly submit)
const submitRowChanges = (data) => {
    submitChanges(data["currentTarget"].id)
    return false;
}

// submitChanges updates the data after the admin changed it.
// by simply fetching all the information from the inputs.
// then sending it to the backend database -> firebase/mssql.
const submitChanges = async (data) => {
    templateObject = tables[data.replace('Form', '')];
    let tbl = templateObject.tbl;
    let repliesArray = [];


    // create the object
    inputs = document.getElementById(data).getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].name == "" || inputs[i].value == null)
            continue;
        templateObject.objTemplate[inputs[i].name] = inputs[i].value;
    }


    // check if the object is Message ( different access )
    if (templateObject.objTemplate.msgId) {
        if (templateObject.objTemplate.parentId == "none") {
            ref = firebase.database().ref("Messages").child(templateObject.objTemplate.tvShowId).child(templateObject.objTemplate.msgId)
                .update({
                    'msgText': templateObject.objTemplate.msgText,
                    'datetime': templateObject.objTemplate.datetime
                });
        }

        else {
            // get the replies array 
            ref = firebase.database().ref("Messages").child(templateObject.objTemplate.tvShowId).child(templateObject.objTemplate.parentId)
            let foo = await ref.once("value", snapshot => {
                repliesArray = snapshot.val().replies;
            });
            repliesArray[templateObject.objTemplate.msgId].msgText = templateObject.objTemplate.msgText;
            repliesArray[templateObject.objTemplate.msgId].datetime = templateObject.objTemplate.datetime;
            ref.update({
                'replies': repliesArray
            });
        }
        alert("Table has been updated!")
        renderDataTable(data.replace('Form', ''))
    }
    else {
        // send it to backend
        console.log(templateObject.objTemplate)
        $.ajax({
            url: `../api/${tables[data.replace('Form', '')].editUrl}`,
            type: 'PUT',
            data: templateObject.objTemplate
        }).then((data) => {
            // replace the old row with the updated one!
            templateObject.data.forEach(function (item, index) {
                if (templateObject.data[index].Id == templateObject.objTemplate.Id) {
                    templateObject.data[index] = templateObject.objTemplate;
                }
            });
            alert("Table has been updated!")
            renderDataTable(data);
        }).catch((error) => {
            console.log(error);
        })
        //ajax call to refresh object field!
    }

}

// redrawTable been callled when the information displayed on the datatable has been changed
// and needs to be rerendered
const redrawTable = (tbl, data) => {
    // somehow the clear and redrawing dosend work!
    tbl.clear();
    for (var i = 0; i < data.length; i++) {
        tbl.row.add(data[i]);
    }
    tbl.draw();

}

// deleteRow called when the admin choose the delete a row from the dataTable
const deleteRow = async (btn) => {
    let tableName = btn.getAttribute("data-tablename");
    let tvShowId = btn.getAttribute("data-tvshowid")
    let msgId = btn.getAttribute("data-rowid");

    // check if object is regular/reply
    //    reply 
    if (btn.getAttribute("data-parentid")) {
        let repliesArray;
        let parentId = btn.getAttribute("data-parentid");
        ref = firebase.database().ref("Messages").child(tvShowId).child(parentId)
        await ref.once("value", snapshot => {
            repliesArray = snapshot.val().replies;
        });
        repliesArray.splice(msgId, 1)
        ref.update({
            'replies': repliesArray
        });
    }
    //    regular message
    else {
        ref = firebase.database().ref("Messages").child(tvShowId).child(msgId)
        await ref.remove()
    }
    alert("Table has been updated!")
    renderDataTable(tableName)
}

// deleteUser isn't really deletes users, its only changes them into inactive, which disables them from loggin in
const deleteUser = (btn) => {
    // ajax call to backend and change the active field
    $.ajax({
        url: `../api/Users/deleteUser?userId=${btn.getAttribute("data-rowid")}`,
        type: 'GET',
    }).then((data) => {
        alert("DB has been updated!")
        renderDataTable(data);
    }).catch((error) => {
        console.log(error);
    })
}

// retriveUser changes the desired user field from inactive to active
const retriveUser = (btn) => {
    // ajax call to backend and change the active field
    $.ajax({
        url: `../api/Users/retriveUser?userId=${btn.getAttribute("data-rowid")}`,
        type: 'GET',
    }).then((data) => {
        alert("DB has been updated!")
        renderDataTable(data);
    }).catch((error) => {
        console.log(error);
    })
}