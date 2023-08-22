# classifications-api-web-app
This demonstrates a web application I made to accomplish two things: generate "UTM" parameters for media stakeholders and dynamically upload those "UTM"s to Adobe Analytics via the 1.4 Classification API for processing. 

Please do not judge the front end. It's just a proof of concept. It is ugly. 

The user will input their campaign details. They will generate the clickthrough URL and use it in their campaigns. 

![UE](https://github.com/walexbarnes/classifications-api-web-app/main/user_experience.png)

When they click submit to Adobe Analytics, it is sent off for processing **via Adobe Analytics 1.4 Classifications API**. 

The calls need to be in a specific order - create import, populate import, and commit import. You cannot go out of order and the previous call needs to finish before the next one runs. 

I **built a series of promises** to ensure this would happen in order. Furthermore, I **created a called a function recursively** until it reaches an error or its base case. 

```
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
```
