// Credit goes to Simon Plenderleith.  https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/


async function postFormDataAsJson({ url, formData }) {
    /**
     * We can't pass the `FormData` instance directly to `fetch`
     * as that will cause it to automatically format the request
     * body as "multipart" and set the `Content-Type` request header
     * to `multipart/form-data`. We want to send the request body
     * as JSON, so we're converting it to a plain object and then
     * into a JSON string.
     */
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJsonString = JSON.stringify(plainFormData);

    const fetchOptions = {
        // The default method for a request with fetch is GET, so we must tell it to use the POST HTTP method.
        method: "POST",
        /**
         * These headers will be added to the request and tell
         * the API that the request body is JSON and that we can
         * accept JSON responses.
         */
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        // The body of our POST request is the JSON string that we created above.
        body: formDataJsonString,
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }

    return response.json();
}

async function getDataAsJson(url) {

    const fetchOptions = {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    };
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
    return response.json();
}


async function deleteObject(url) {

    const fetchOptions = {
        method: "DELETE"
    };
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }

    listiraamatud();
}


async function handleFormSubmit(event) {
    // This prevents the default behaviour of the browser submitting the form so that we can handle things instead.
    event.preventDefault();

    // This gets the element which the event handler was attached to.
    const form = event.currentTarget;

    // This takes the API URL from the form's `action` attribute.
    const url = form.action;

    try {
        // This takes all the fields in the form and makes their values available through a `FormData` instance.
        const formData = new FormData(form);

        //We'll define the `postFormDataAsJson()` function in the next step.
        const responseData = await postFormDataAsJson({ url, formData });

        // we'll  log the response it to the console.
        console.log({ responseData });
        handleResponse(form, responseData);

    } catch (error) {
        console.error(error);
    }
}

async function listiraamatud() {
    try {
        // Fetch the books from the API
        const responseData = await getDataAsJson("https://raamatudmikroteenus-gzadavckfrcydubb.northeurope-01.azurewebsites.net/raamatud/");


        // Find the HTML element with ID "raamatud_result"
        const resultElement = document.getElementById("raamatud_result");

        // Clear the element content
        resultElement.innerHTML = "";

        // Check if responseData.raamatud exists and is an array
        if (responseData && Array.isArray(responseData.raamatud)) {
            // Loop through each book ID in the response and add links
            for (var raamat of responseData.raamatud) {
                resultElement.innerHTML +=
                    '<a href="https://raamatudmikroteenus-gzadavckfrcydubb.northeurope-01.azurewebsites.net/raamatud/' + raamat + '" download="' + raamat + '.txt" >' +
                    raamat + '.txt</a> ' +
                    '<a href="#" onclick="deleteObject(\'https://raamatudmikroteenus-gzadavckfrcydubb.northeurope-01.azurewebsites.net/raamatud/' + raamat + '\')" > [kustuta]</a>' +
                    "<br />";
            }
        } else if (responseData && typeof responseData === 'object') {
            // If responseData is an object but doesn't have a raamatud array property
            // Try to iterate over the response directly (it might be an array of books or have a different structure)
            const raamatud = Array.isArray(responseData) ? responseData : Object.keys(responseData);

            for (var raamat of raamatud) {
                resultElement.innerHTML +=
                    '<a href="https://raamatudmikroteenus-gzadavckfrcydubb.northeurope-01.azurewebsites.net/raamatud/' + raamat + '" download="' + raamat + '.txt" >' +
                    raamat + '.txt</a> ' +
                    '<a href="#" onclick="deleteObject(\'https://raamatudmikroteenus-gzadavckfrcydubb.northeurope-01.azurewebsites.net/raamatud/' + raamat + '\')" > [kustuta]</a>' +
                    "<br />";
            }
        } else {
            resultElement.innerHTML = "Ei leitud raamatuid või andmevorming on vale.";
        }
    } catch (error) {
        console.error("Viga raamatute laadimisel:", error);
        document.getElementById("raamatud_result").innerHTML = "Viga raamatute laadimisel: " + error.message;
    }
}

function handleResponse(form, responseData) {

    const resultElement = document.getElementById("tulemus");

    if(form.id == "frontform"){
        resultElement.innerHTML = responseData.tulemus;
        listiraamatud();
    }

    if(form.id === "otsinguform"){
        var output = "Sõne " + responseData.sone + " leiti järgmistest raamatutest:  <br/>"

        for (var tulemus of responseData.tulemused) {
            output += "Raamat " + tulemus.raamatu_id + " - " + tulemus.leitud + " korda! <br/>";
        }
        resultElement.innerHTML = output
    }
}
