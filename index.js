document.addEventListener("DOMContentLoaded", function () {
    const searchbutton = document.getElementById("search_button");
    const usernameinput = document.getElementById("user_input");
    const easyprogresscircle = document.querySelector(".easy-progress");
    const mediumprogresscircle = document.querySelector(".medium-progress");
    const hardprogresscircle = document.querySelector(".high-progress");
    const easyLabel = document.getElementById("easy_label");
    const mediumLabel = document.getElementById("medium_label");
    const hardlabel = document.getElementById("high_label");
    const loader = document.getElementById("loader");
    const statscontainer = document.querySelector(".stats");
    function validateusername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regx = /^[a-zA-Z0-9_]+$/;
        return regx.test(username);
    }

    async function fetchuserdetail(username) {
        try {
            searchbutton.textContent = "Searching...";
            searchbutton.disabled = true;
            loader.style.display = "block";

            const proxyurl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql/';
            const myHeaders = new Headers();
            myHeaders.append('content-type', 'application/json');

            const graphQL = JSON.stringify({
                query: `
                    query userSessionProgress($username: String!) {
                        allQuestionsCount {
                            difficulty
                            count
                        }
                        matchedUser(username: $username) {
                            submitStats {
                                acSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                            }
                        }
                    }
                `,
                variables: { "username": username }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphQL,
                redirect: "follow"
            };

            const response = await fetch(proxyurl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch data");
            }

            const parsedata = await response.json();
            console.log("logging data: ", parsedata);
            displayuserdata(parsedata);
        } catch (error) {
            alert("Error fetching data");
        } finally {
            loader.style.display = "none";
            searchbutton.textContent = "Search";
            searchbutton.disabled = false;
        }
    }

    function progressUpdate(solved, total, label, circle) {
        const progressdegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressdegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayuserdata(parsedata) {
    const totalQuestions = parsedata.data.allQuestionsCount;
    const submissions = parsedata.data.matchedUser.submitStats.acSubmissionNum;

    progressUpdate(submissions[1].count, totalQuestions[1].count, easyLabel, easyprogresscircle);
    progressUpdate(submissions[2].count, totalQuestions[2].count, mediumLabel, mediumprogresscircle);
    progressUpdate(submissions[3].count, totalQuestions[3].count, hardlabel, hardprogresscircle);

    const carddata = [
        { label: "Total Submission", value: submissions[0].submissions },
        { label: "Total Easy Submission", value: submissions[1].submissions },
        { label: "Total Medium Submission", value: submissions[2].submissions },
        { label: "Total Hard Submission", value: submissions[3].submissions },
    ];

    console.log("card", carddata);

    const statsCardContainer = document.querySelector(".stats_card");
    statsCardContainer.innerHTML = carddata.map(data => {
        return `
            <div class="card">
                <h3>${data.label}</h3>
                <p>${data.value}</p>
            </div>
        `;
    }).join('');
}


    searchbutton.addEventListener('click', function () {
        const username = usernameinput.value;
        console.log("logging in", username);
        if (validateusername(username)) {
            fetchuserdetail(username);
        }
    });
});
