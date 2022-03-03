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

    let users = parseInput(boids);

    users.forEach(element => {

        boidArray.push(element.boid);

    });

    // console.log({
    //     users,
    //     boidArray
    // })

    // boidArray.length = 0; // for test

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
                    showNotAlloted(data.boidArray[index], users[index])
                }
                if (element.success) {
                    let allotedAmount = element.message.split(":")[1].trim();
                    showAlloted(data.boidArray[index], allotedAmount, users[index]);
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

const showAlloted = (id, quantity, user) => {
    let name = "";
    if (id == user.boid) {
        name = user.name;
    }
    message = `${id} ${name} - Alloted | Quantity: ${quantity}`;
    let span = document.createElement('span');
    span.setAttribute("class", "alloted")
    span.innerText = message;
    document.getElementById("result").appendChild(span);
}

const showNotAlloted = (id, user) => {
    let name = "";
    if (id == user.boid) {
        name = user.name;
    }
    message = `${id} ${name} - Not Alloted.`
    let span = document.createElement('span');
    span.setAttribute("class", "not-alloted")
    span.innerText = message;
    document.getElementById("result").appendChild(span);
}

const clearResultAndError = () => {
    document.getElementById("error").innerText = ""
    document.getElementById("result").innerText = ""
}


const parseInput = (input) => {

    let boidsA = input.split(",");

    let users = [];

    boidsA.forEach((element, index) => {
        // we will check if this element is a vaid boid
        // if not ignore this.
        // if is valid we will get previous element,
        // if previous is a valid boid, this boid have no name
        // if previous element is not a valid boid, we set it as this boid's name

        element = element.trim();

        let name = "";
        if (isValidBOID(element)) {

            let preIndex = index - 1;
            let preElement = preIndex >= 0 ? boidsA[preIndex] : "";
            if (!isValidBOID(preElement)) {
                name = preElement;
            } else {
                name = "";
            }

            users.push({
                name,
                boid: element
            })
        }
    });

    return users;
}

const isValidBOID = (boid) => {
    if (boid.length != 16) {
        return false;
    }

    let dpid = boid.slice(0, 8);

    if (dpids[dpid]) {
        return true
    } else {
        return false
    }
}