// Load it up
console.log('main.js loaded');

document.addEventListener("DOMContentLoaded", () => {
    // code...
});

// Step 1 Submit
const step1 = document.querySelector(".step-1 .submit");

step1.addEventListener("click", () => {
    console.log('Step 1 Submit Clicked');

    // Grab values of input fields
    const
        form = document.querySelector("#step-1"),
        step2 = document.querySelector(".url-results textarea");

    let finalURL = "";

    Array.from(form.elements).forEach((input) => {
        if (input.type != "checkbox" || input.checked) {
            finalURL += input.value + "_";
            //console.log(input.getAttribute("id") + " | " + input.value)
        }
    });

    console.log(finalURL);

    // Step 2 Display Results
    step2.innerHTML = finalURL;

    _satellite.track("step_1_click")
    window.myCampaign = finalURL
});

// Step 3 Send to Adobe Analytics
const sendToAdobeBtn = document.querySelector("#api-submit");
sendToAdobeBtn.addEventListener("click", function () {
    var first_body = {
        "check_divisions": true,
        "description": "testing out API capabilities",
        "element": "trackingcode",
        "email_address": "email@withheld.com",
        "export_results": true,
        "header": [
            "Key",
            "positionOne",
            "positionTwo",
            "positionThree",
            "positionFour"
        ],
        "overwrite_conflicts": true,
        "rsid_list": [
            "geo1xxlonprojectbubblewrap"
        ]
    }

    makeRequest("https://api.omniture.com/admin/1.4/rest/?method=Classifications.CreateImport", first_body, "step2")

    function makeRequest(request_url, request_body, what_next, job_id) {
var authToken = "Bearer withheldtoken"

        fetch(request_url, {
            method: 'POST',
            body: JSON.stringify(request_body),
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            },
            referrer: 'no-referrer'
        }).then(function (response) {
            // The API call was successful!
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(response);
            }
        }).then(function (data) {
            // This is the JSON from our response
            console.log(data);
            switch (what_next) {
                case "step2":
                    var jobId = data.job_id
                    var finalURLsplit = window.myCampaign.split("_")
                    var positionOne = finalURLsplit[1]
                    var positionTwo = finalURLsplit[2]
                    var positionThree = finalURLsplit[3]
                    var positionFour = finalURLsplit[finalURLsplit.length - 2]
                    var second_body = {
                        "job_id": jobId,
                        "page": 1,
                        "rows": [
                            {
                                "row": [window.myCampaign, positionOne, positionTwo, positionThree, positionFour]
                            },
                        ]
                    }

                    makeRequest("https://api.omniture.com/admin/1.4/rest/?method=Classifications.PopulateImport", second_body, "step3", jobId)
                    break;
                case "step3":

                    var jobId = job_id
                    var third_body = {
                        "job_id": jobId
                    }
                    makeRequest("https://api.omniture.com/admin/1.4/rest/?method=Classifications.CommitImport", third_body, "end")

                    break;
                default:
                    alert("SUCCESSFULLY SENT TO AA")
                    break;
            }
        }).catch(function (err) {
            // There was an error
            alert("I HAVE FAILED YOU")

            console.warn('Something went wrong.', err);
        });
    }
})
