let companyShareElement;

const getCompany = () => {
    axios.get("https://iporesult.cdsc.com.np/result/companyShares/fileUploaded").then(response => {
        // console.log(response);
        return response.data.body
    }).then(data => {
        // console.log(data);
        let conpanySelectElement = document.getElementById("companySelect");
        data.forEach(element => {
            let aOption = document.createElement('option');
            aOption.innerText = element.name
            aOption.setAttribute("value", element.id)
            conpanySelectElement.appendChild(aOption);
        });
    })
}

getCompany();

const viewResult = () => {
    clearResultAndError();
    console.log("viewResult");
    let boids = document.getElementById('boids').value;

    let company = document.getElementById("companySelect").value;

    let boidArray = [];
    let boidsA = boids.split(",")
    boidsA.forEach(element => {
        let id = element.trim();

        if (id.length == 16) {
            if (!isNaN(id)) {

                // let's validate that, the boid is valid
                let dpid = id.slice(0, 8);

                if (dpids[dpid]) {
                    boidArray.push(id);
                } else {
                    showError(id);
                }

            } else {
                showError(id);
            }
        } else {
            showError(id);
        }
    });

    if (boidArray.length > 0) {
        axios.post("/", {
            boidArray,
            companyShareId: company
        }).then(response => {
            return response.data
        }).then(data => {
            // console.log(data);
            data.results.forEach((element, index) => {
                if (!element.success) {
                    showNotAlloted(data.boidArray[index])
                }
                if (element.success) {
                    let allotedAmount = element.message.split(":")[1].trim();
                    showAlloted(data.boidArray[index], allotedAmount);
                }
            });
        }).catch(error => {
            console.log("error", error);
        })
    }

    // if we can bypass cors on browser no need of backend
    // boidArray.forEach(element => {
    //     console.log(element);
    //     axios.post("https://iporesult.cdsc.com.np/result/result/check", {
    //         boid: element,
    //         companyShareId: company
    //     }).then(response => {
    //         return response.data
    //     }).then(data => {
    //         console.log(data);
    //     }).catch(error => {
    //         console.log("error", error);
    //     })
    // });

}

const showError = (id) => {
    let message = `${id} is not a valid BOID.`
    let span = document.createElement('span');
    span.innerText = message;
    document.getElementById("error").appendChild(span);
}

const showAlloted = (id, quantity) => {
    message = `${id} - Alloted | Quantity: ${quantity}`;
    let span = document.createElement('span');
    span.setAttribute("class", "alloted")
    span.innerText = message;
    document.getElementById("result").appendChild(span);
}

const showNotAlloted = (id) => {
    message = `${id} - Not Alloted.`
    let span = document.createElement('span');
    span.setAttribute("class", "not-alloted")
    span.innerText = message;
    document.getElementById("result").appendChild(span);
}

const clearResultAndError = () => {
    document.getElementById("error").innerText = ""
    document.getElementById("result").innerText = ""
}