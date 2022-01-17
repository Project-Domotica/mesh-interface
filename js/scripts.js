var connectionStatus = false;
var fetchUnprovisionedAllowed = false;
// wat een kut taal!!!!!!!1111111111!!!
var unprovisionedSelectedName, unprovisionedSelectedUUID, unprovisionedSelectedDate;
var provisionedSelectedName, provisionedSelectedUUID, provisionedSelectedDate;

var time = document.getElementById("time");
var today = new Date();
var currentTime;
var ledStatus;
var groupStatus = [true, true, true];
const groupAddress = ["c000", "c001", "c002"];

// Create fake data for testing: https://www.mockaroo.com/
const apiURL = "http://raspberrypi.local:8080/api/v2";

// Entry point (1 ms delay)
setTimeout(() => {
    executeTasks();
    groupButton(0);
    groupButton(1);
    groupButton(2);
}, 1);

const executeTasks = () => {
    setTime();

    setInterval(() => {
        console.log("Tasks running at second " + today.getSeconds() + " > ");

        setTime();
        fetchConnectionState();

        if (fetchUnprovisionedAllowed == true) {

        }
    }, 1000);
}

const setTime = () => {
    console.log("   Updating local time");

    today = new Date();
    currentTime = today.toLocaleTimeString('nl-NL').replace("AM", "").replace("PM", "");
    time.innerText = currentTime;
}

const fetchConnectionState = () => {
    connStatus = document.getElementById("conn-status");

    fetch(apiURL).then(() => {
        connectionStatus = true;

        console.log("   Fetching connection state: succes");
        document.getElementById("conn-status").innerText = "Connected";
        document.getElementById("time").style.width = "173px";
        document.getElementById("conn-status").style.color = "#4CAF50";
    }).catch(() => {
        connectionStatus = false;

        discoverButtonClick();

        console.log("   Fetching connection state: error");
        document.getElementById("conn-status").innerText = "Disconnected";
        document.getElementById("time").style.width = "220px";
        document.getElementById("conn-status").style.color = "#e02e22";
    });
}

const fetchUnprovisioned = () => {
    if (fetchUnprovisionedAllowed) {
        console.log("   Fetching uprovisioned devices from database.");

        fetch(apiURL + "/scan")
        .then(response => {
            return response.json();
        }).then(data => {  
            var list; 
            var div;
            var nameElement;
            var uuidElement;
            var dateElement;

            var name = "Unprovisioned-Device";
            var node = data.payload.uuid;
            var date = today.toLocaleTimeString('nl-NL').replace("AM", "").replace("PM", "");

            document.getElementById("panel-centered-unprovisioned").appendChild(document.createElement("ul")).setAttribute("id", "unprovisioned-list");

            list = document.getElementById("unprovisioned-list");
            div = list.appendChild(document.createElement("li")).appendChild(document.createElement("div"));

            div.setAttribute("onclick", "unprovisionedClick('" + name + "', '" + node + "', '" + date + "')");
            //div.setAttribute("onclick", "provisionedClick('" + node.name + "', '" + node.uuid + "', '" + node.date + "')");

            nameElement = div.appendChild(document.createElement("h1"));
            nameElement.textContent = name;

            uuidElement = div.appendChild(document.createElement("h3"));
            uuidElement.textContent = node;

            dateElement = div.appendChild(document.createElement("h4"));
            dateElement.textContent = date;
        });
    }
}

const fetchProvisioned = () => {
    console.log("   Fetching provisioned devices from database.");

    fetch(apiURL + "/db/device_key_list")
    .then(response => {
        return response.json();
    }).then(data => {  
        var list; 
        var div;
        var nameElement;
        var uuidElement;
        var dateElement;

        var name;
        var date = today.toLocaleTimeString('nl-NL').replace("AM", "").replace("PM", "");

        document.getElementById("panel-centered-provisioned").appendChild(document.createElement("ul")).setAttribute("id", "provisioned-list");

        for (const node of data.payload) {
            fetch(apiURL + "/db/type?device_key=" + node)
            .then(response => {
                return response.json();
            }).then(data => {  
                if (data.payload.type == "light") {
                    name = "JMJ-Light";
                } else if (data.payload.type == "switch") {
                    name = "JMJ-Switch";
                } else if (data.payload.type == "unconfigured") {
                    name = "Unconfigured-Node";
                }

                list = document.getElementById("provisioned-list");
                div = list.appendChild(document.createElement("li")).appendChild(document.createElement("div"));

                div.setAttribute("onclick", "provisionedClick('" + name + "', '" + node + "', '" + date + "')");
                //div.setAttribute("onclick", "provisionedClick('" + node.name + "', '" + node.uuid + "', '" + node.date + "')");

                nameElement = div.appendChild(document.createElement("h1"));
                nameElement.textContent = name;

                uuidElement = div.appendChild(document.createElement("h3"));
                uuidElement.textContent = node;

                dateElement = div.appendChild(document.createElement("h4"));
                dateElement.textContent = date;
            });
        }
    });
}

const scanButtonClick = () => {
    console.log("Scan button clicked.");

    if (connectionStatus == true) { 
        if (document.getElementById("unprovisioned-list")) document.getElementById("unprovisioned-list").remove();

        fetchUnprovisionedAllowed = true;
        fetchUnprovisioned();

        document.getElementById("panel-centered-unprovisioned").style.display = "inherit";

        // Remove scan button
        document.getElementById("scan-button").style.display = "none";
        document.getElementById("scan-text-one").style.display = "none";
        document.getElementById("scan-text-two").style.display = "none";
    } else {
        window.alert("\nThe API can't be reached.\nCheck youre network connection or the API status.");
    }
}

const provisionButtonClick = (node) => {
    console.log("Provisioning device.");

    fetch(apiURL + "/provision?uuid=" + node)
    .then(response => {
        return response.json();
    }).then(data => {  
        console.log(data);
        networkButtonClick();
    });
}

const discoverButtonClick = () => {
    fetchUnprovisionedAllowed = false;

    document.getElementById("nav-discover").style.color = "#82e9f5";
    document.getElementById("nav-network").style.color = "#fff";

    document.getElementById("panel-centered-unprovisioned").style.display = "none";
    document.getElementById("panel-centered-scan").style.display = "inherit";
    document.getElementById("scan-button").style.display = "inherit";
    document.getElementById("scan-button").style.marginLeft = "105px";
    document.getElementById("scan-text-one").style.display = "inherit";
    document.getElementById("scan-text-two").style.display = "inherit";
    document.getElementById("panel-centered-unprovisioned-selected").style.display = "none";
    document.getElementById("panel-centered-unprovisioned-select").style.display = "inherit";
    document.getElementById("panel-centered-provisioned").style.display = "none";
    document.getElementById("panel-centered-provisioned-selected").style.display = "none";
}

const networkButtonClick = () => {
    if (connectionStatus == true) { 
        if (document.getElementById("provisioned-list")) document.getElementById("provisioned-list").remove();
        fetchUnprovisionedAllowed = false;
    
        document.getElementById("panel-centered-scan").style.display = "none";
        document.getElementById("panel-centered-unprovisioned").style.display = "none";
        document.getElementById("panel-centered-unprovisioned-selected").style.display = "none";
        document.getElementById("panel-centered-provisioned-selected").style.display = "none";
        document.getElementById("panel-centered-unprovisioned-select").style.display = "none";
        document.getElementById("panel-centered-provisioned-select").style.display = "inherit";
    
        document.getElementById("nav-discover").style.color = "#fff";
        document.getElementById("nav-network").style.color = "#82e9f5";
    
        fetchProvisioned();
        document.getElementById("panel-centered-provisioned").style.display = "inherit";
    } else {
        window.alert("\nThe API can't be reached.\nCheck youre network connection or the API status.");
    }
}

 const configureButtonClick = (node) => {
    console.log("Configuring device.");
    var test = prompt("Enter the group number (between 1 and 3)") - 1;
    if (test < 1 || test > 3){
        alert("Value is not correct! Please try again");
        return;
    }
    console.log("Filled group = " + test);

    fetch(apiURL + "/db/unconfigured/type?device_key=" + node)
    .then(response => {
        return response.json();
    }).then(data => {  
        if (data.payload.type == "light") {
            fetch(apiURL + "/conf/light?device_key=" + node + "&group=" + groupAddress[test])
            .then(response => {
                return response.json();
            }).then(data => {  
                networkButtonClick();
            });
        } else if (data.payload.type = "switch") {
            fetch(apiURL + "/conf/switch?device_key=" + node  + "&group=" + groupAddress[test])
            .then(response => {
                return response.json();
            }).then(data => {  
                networkButtonClick();
            });
        }
    });
}

const unprovisionButtonClick = (node) => {
    console.log("Unprovisioning device.");

    fetch(apiURL + "/unprovision?device_key=" + node)
    .then(response => {
        return response.json();
    }).then(data => {  
        console.log(data);
        networkButtonClick();
    });
}

const groupButton = (group) => {
    if (groupStatus[group] == true){
        console.log("Group " + groupAddress[group] + " turning off");
        fetch(apiURL + "/group/off?group=" + groupAddress[group])
        .then(response => {
            return response.json();
        }).then(data => {
            document.getElementById("group" + (group + 1) + "-button").style.borderColor = "#e02e22";
            groupStatus[group] = false;
        });
    }
    else {
        console.log("Group " + groupAddress[group] + " turning on");
        fetch(apiURL + "/group/on?group=" + groupAddress[group])
        .then(response => {
            return response.json();
        }).then(data => {
            document.getElementById("group" + (group + 1) + "-button").style.borderColor = "#4CAF50";
            groupStatus[group] = true;
        });
    }
}

const ledButtonClick = (node) => {
    // fetch(apiURL + "/light/status?device_key=" + node)
    // .then(response => {
    //     return response.json();
    // }).then(data => {  
    //     if (data.payload.enabled == "true") {
    //         ledStatus = true;
    //      } else if (data.payload.enabled == "false") {
    //         ledStatus = false;
    //     }
    // });

    if (ledStatus == false) {
        fetch(apiURL + "/light/on?device_key=" + node)
        .then(response => {
            return response.json();
        }).then(data => {  
            document.getElementById("led").style.display = "inherit";
            document.getElementById("led-button").innerText = "Led Off";
            document.getElementById("led-instructions").innerText = "Click the button above to turn off the led.";
            ledStatus = true;
        });
    } else if (ledStatus == true) {
        fetch(apiURL + "/light/off?device_key=" + node)
        .then(response => {
            return response.json();
        }).then(data => {  
            document.getElementById("led").style.display = "none";
            document.getElementById("led-button").innerText = "Led On";
            document.getElementById("led-instructions").innerText = "Click the button above to turn on the led.";
            ledStatus = false;
        });
    }
}

const unprovisionedClick = (name, uuid, date) => {
    console.log("Unprovisioned device selected.");

    unprovisionedSelectedName = name;
    unprovisionedSelectedUUID = uuid;
    unprovisionedSelectedDate = date;

    console.log(unprovisionedSelectedName);
    console.log(unprovisionedSelectedUUID);
    console.log(unprovisionedSelectedDate);

    document.getElementById("panel-centered-unprovisioned-select").style.display = "none";
    document.getElementById("panel-centered-provisioned-select").style.display = "none";
    document.getElementById("panel-centered-unprovisioned-selected").style.display = "inherit";
    document.getElementById("unprovisioned-selected-name").innerText = unprovisionedSelectedName;
    document.getElementById("unprovisioned-selected-uuid").innerText = "UUID: " + unprovisionedSelectedUUID;
    document.getElementById("unprovisioned-selected-date").innerText = "Datetime: " + unprovisionedSelectedDate;

    document.getElementById("provision-button").setAttribute("onclick", "provisionButtonClick('" + uuid + "')");
}

const provisionedClick = (name, uuid, date) => {
    console.log("Provisioned device selected.");

    if (name == "JMJ-Light") {
        document.getElementById("led-img").style.display = "inherit";
        document.getElementById("led-button").style.display = "inherit";
        document.getElementById("led-button").setAttribute("onclick", "ledButtonClick('" + uuid + "')");

        document.getElementById("unprovision-button").setAttribute("onclick", "unprovisionButtonClick('" + uuid + "')");

        document.getElementById("led-instructions").style.display = "inherit";

        document.getElementById("configure-button").style.display = "none";
        document.getElementById("configure-instructions").style.display = "none";

        fetch(apiURL + "/light/status?device_key=" + uuid)
        .then(response => {
            return response.json();
        }).then(data => {  
            if (data.payload.enabled == "true") {
                ledStatus = true;
                document.getElementById("led").style.display = "inherit";
                document.getElementById("led-button").innerText = "Led Off";
                document.getElementById("led-instructions").innerText = "Click the button above to turn off the led.";
            } else if (data.payload.enabled == "false") {
                ledStatus = false;
                document.getElementById("led").style.display = "none";
                document.getElementById("led-button").innerText = "Led On";
                document.getElementById("led-instructions").innerText = "Click the button above to turn on the led.";
            }
        });
    } else if (name == "JMJ-Switch") {
        document.getElementById("led-img").style.display = "none";
        document.getElementById("led-button").style.display = "none";
        document.getElementById("led-instructions").style.display = "none";

        document.getElementById("unprovision-button").setAttribute("onclick", "unprovisionButtonClick('" + uuid + "')");

        document.getElementById("configure-button").style.display = "none";
        document.getElementById("configure-instructions").style.display = "none";
    } else if (name == "Unconfigured-Node") {
        document.getElementById("led-img").style.display = "none";
        document.getElementById("led-button").style.display = "none";
        document.getElementById("led-instructions").style.display = "none";

        document.getElementById("unprovision-button").setAttribute("onclick", "unprovisionButtonClick('" + uuid + "')");

        document.getElementById("configure-button").setAttribute("onclick", "configureButtonClick('" + uuid + "')");
    }

    provisionedSelectedName = name;
    provisionedSelectedUUID = uuid;
    provisionedSelectedDate = date;

    console.log(provisionedSelectedName);
    console.log(provisionedSelectedUUID);
    console.log(provisionedSelectedDate);

    document.getElementById("panel-centered-provisioned-select").style.display = "none";
    document.getElementById("panel-centered-provisioned-selected").style.display = "inherit";
    document.getElementById("provisioned-selected-name").innerText = provisionedSelectedName;
    document.getElementById("provisioned-selected-uuid").innerText = "UUID: " + provisionedSelectedUUID;
    document.getElementById("provisioned-selected-date").innerText = "Datetime: " + provisionedSelectedDate;
}
