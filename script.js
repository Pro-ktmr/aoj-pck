const csvUrl = 'list.txt';

window.addEventListener('load', (e) => {
    loadSearchParameters();
    showTable();
    setInterval(update, 30000);
});

function convertCsvtoArray(csv) {
    let res = [];
    let lines = csv.split('\n');
    for (let i = 0; i < lines.length; i++) {
        res[i] = lines[i].split(',');
    }
    return res;
}

function loadSearchParameters() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('my_id')) my_id.value = params.get('my_id');
    if (params.has('rival_id')) rival_id.value = params.get('rival_id');
    if (params.has('year_begin')) year_begin.value = params.get('year_begin');
    if (params.has('year_end')) year_end.value = params.get('year_end');
    if (params.has('my_id') && !params.has('yosen')) yosen.checked = false;
    if (params.has('my_id') && !params.has('honsen')) honsen.checked = false;
}

function getProblemArray() {
    let req = new XMLHttpRequest();
    req.open('GET', csvUrl, false);
    req.send(null);
    return convertCsvtoArray(req.responseText);
}

function getSubmissionDict(id) {
    if (id == '') return [];
    let req = new XMLHttpRequest();
    req.open('GET', `https://judgeapi.u-aizu.ac.jp/submission_records/users/${id}?size=99999999`, false);
    req.send(null);
    return JSON.parse(req.responseText);
}

function getStatus(submissions, problemId) {
    let status = 0;
    for (let submission of submissions) {
        if (submission['problemId'] == problemId) {
            if (submission['status'] == 4) {
                status = 1;
                break;
            }
            else {
                status = -1;
            }
        }
    }
    return status;
}

function showTable() {
    new Promise((resolve, reject) => {
        resolve(getProblemArray());
    }).then((problems) => {
        for (let problem of problems) {
            if (problem.length <= 1) continue;
            if (yosen.checked == false && problem[2] == 'yosen') continue;
            if (honsen.checked == false && problem[2] == 'honsen') continue;
            if (parseInt(problem[1]) < parseInt(year_begin.value)) continue;
            if (parseInt(problem[1]) > parseInt(year_end.value)) continue;

            let tr = problemTbody.insertRow(-1);

            let tdSource = tr.insertCell(-1);
            let compName = problem[2] == 'yosen' ? '予選' : '本選';
            tdSource.innerHTML = `${problem[1]}年 ${compName} ${problem[3]}`;

            let tdName = tr.insertCell(-1);
            tdName.innerHTML = `<a href="http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=${problem[0]}&lang=ja" target="_blank">${problem[4]}</a>`;
            if (problem[2] == 'yosen') tdName.innerHTML += ` (<a href="https://onlinejudge.u-aizu.ac.jp/challenges/sources/PCK/Prelim/${problem[0]}" target="_blank">β版</a>)`;
            if (problem[2] == 'honsen') tdName.innerHTML += ` (<a href="https://onlinejudge.u-aizu.ac.jp/challenges/sources/PCK/Final/${problem[0]}" target="_blank">β版</a>)`;

            let tdPoint = tr.insertCell(-1);
            tdPoint.innerHTML = problem[5];

            let tdRival = tr.insertCell(-1);
        }
        $('#problemTable').tablesorter();
        update();
    });
}

function update() {
    let rivalIds = rival_id.value.replace(' ', '').split(',');
    new Promise((resolve, reject) => {
        let mySubmissions = getSubmissionDict(my_id.value);
        let rivalsSubmissions = [];
        for (let id of rivalIds) {
            rivalsSubmissions[id] = getSubmissionDict(id);
        }
        resolve([mySubmissions, rivalsSubmissions]);
    }).then((result) => {
        let mySubmissions = result[0];
        let rivalsSubmissions = result[1];
        updateTable(mySubmissions, rivalsSubmissions);
        updateStatistics();
    });
}

function updateTable(mySubmissions, rivalsSubmissions) {
    for (let problemRow of problemTbody.rows) {
        updateRow(problemRow, mySubmissions, rivalsSubmissions);
    }
}

function updateRow(problemRow, mySubmissions, rivalsSubmissions) {
    let idx = problemRow.cells[1].innerHTML.search(/\d{4}/);
    if (idx == -1) return;
    let problemId = parseInt(problemRow.cells[1].innerHTML.substring(idx, idx + 4));

    problemRow.classList.remove('table-danger');
    problemRow.cells[3].innerHTML = '';

    let myStatus = getStatus(mySubmissions, problemId);
    if (myStatus == 1) problemRow.classList.add('table-success');
    else if (myStatus == -1) problemRow.classList.add('table-danger');

    for (let [id, submissions] of Object.entries(rivalsSubmissions)) {
        let status = getStatus(submissions, problemId);
        if (status == 1) problemRow.cells[3].innerHTML += `<span class="badge bg-success">${id}</span> `;
        else if (status == -1) problemRow.cells[3].innerHTML += `<span class="badge bg-danger">${id}</span> `;
    }
}

function updateStatistics() {
    statistics.innerHTML = '';

    let inner = '';
    if (yosen.checked) {
        inner += makeStatisticsHtml('予選');
        for (let i = parseInt(year_begin.value); i <= Math.min(2200, parseInt(year_end.value)); i++) {
            inner += makeStatisticsHtml(`${i}年 予選`);
        }
    }
    statistics.innerHTML += `<div class="row row-cols-6 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 row-cols-xxl-6 g-3 mb-3">${inner}</div>`;

    inner = '';
    if (honsen.checked) {
        inner += makeStatisticsHtml('本選');
        for (let i = parseInt(year_begin.value); i <= Math.min(2200, parseInt(year_end.value)); i++) {
            inner += makeStatisticsHtml(`${i}年 本選`);
        }
    }
    statistics.innerHTML += `<div class="row row-cols-6 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 row-cols-xxl-6 g-3 mb-3">${inner}</div>`;
}

function makeStatisticsHtml(compName) {
    let problemNum = 0;
    let problemNumAc = 0;
    let problemPoints = 0;
    let problemPointsAc = 0;
    for (let problemRow of problemTbody.rows) {
        if (problemRow.cells[0].innerHTML.indexOf(compName) != -1) {
            problemNum++;
            problemPoints += parseInt(problemRow.cells[2].innerHTML);
            if (problemRow.classList.contains('table-success')) {
                problemNumAc++;
                problemPointsAc += parseInt(problemRow.cells[2].innerHTML);
            }
        }
    }
    if (problemNum == 0) return '';

    let additionalClass = '';
    if (compName.indexOf('予選') != -1) {
        if (problemPointsAc / problemPoints >= 0.8) additionalClass += ' text-white bg-success';
        else if (problemPointsAc / problemPoints >= 0.6) additionalClass += ' bg-warning';
        else if (problemPointsAc > 0) additionalClass += ' text-white bg-danger';
    }
    else if (compName.indexOf('本選') != -1) {
        if (problemPointsAc / problemPoints >= 0.7) additionalClass += ' text-white bg-success';
        else if (problemPointsAc / problemPoints >= 0.5) additionalClass += ' bg-warning';
        else if (problemPointsAc > 0) additionalClass += ' text-white bg-danger';
    }
    return `<div class="col">
<div class="card${additionalClass}">
    <div class="card-body">
    <h5 class="card-title">${compName}</h5>
    <div class="row">
        <div class="col-5">問題数</div>
        <div class="col-7">${problemNumAc} / ${problemNum}</div>
    </div>
    <div class="row">
        <div class="col-5">得点</div>
        <div class="col-7">${problemPointsAc} / ${problemPoints}</div>
    </div>
    </div>
</div>
</div>`;
}
