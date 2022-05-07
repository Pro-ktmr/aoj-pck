const csvUrl = 'list.txt';

window.addEventListener('load', (e) => {
    loadSearchParameters();
    showTable();
    setInterval(updateTable, 30000);
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
            if (problem[2] == 'yosen') tdName.innerHTML += ` (<a href="https://onlinejudge.u-aizu.ac.jp/challenges/sources/PCK/Prelim/${problem[0]} target="_blank">β</a>)`;
            if (problem[2] == "honsen") tdName.innerHTML += ` (<a href="https://onlinejudge.u-aizu.ac.jp/challenges/sources/PCK/Final/${problem[0]} target="_blank">β</a>)`;

            let tdPoint = tr.insertCell(-1);
            tdPoint.innerHTML = problem[5];

            let tdRival = tr.insertCell(-1);
        }
        $('#problemTable').tablesorter();
        updateTable();
    });
}

function updateTable() {
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
        for (let problemRow of problemTbody.rows) {
            updateRow(problemRow, mySubmissions, rivalsSubmissions);
        }
    });
}

function updateRow(problemRow, mySubmissions, rivalsSubmissions) {
    let idx = problemRow.cells[1].innerHTML.search(/\d{4}/);
    if (idx == -1) return;
    let problemId = parseInt(problemRow.cells[1].innerHTML.substring(idx, idx + 4));

    problemRow.classList.remove('table-danger');
    problemRow.cells[3].innerHTML = '';

    let myStatus = 0;
    for (let submission of mySubmissions) {
        if (submission['problemId'] == problemId) {
            if (submission['status'] == 4) {
                myStatus = 1;
                break;
            }
            else {
                myStatus = -1;
            }
        }
    }
    if (myStatus == 1) problemRow.classList.add('table-success');
    else if (myStatus == -1) problemRow.classList.add('table-danger');

    for (let [id, submissions] of Object.entries(rivalsSubmissions)) {
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
        if (status == 1) problemRow.cells[3].innerHTML += `<span class="badge bg-success">${id}</span> `;
        else if (status == -1) problemRow.cells[3].innerHTML += `<span class="badge bg-danger">${id}</span> `;
    }
}

/*function checkData(){
    //統計情報初期化
    statistic.innerHTML = "<h2>統計｜Statistic</h2>";

    //自分の提出状況を表示
    if (aoj_id.value != "") {
        var req_me = new XMLHttpRequest();
        //req_me.open("GET", "http://judge.u-aizu.ac.jp/onlinejudge/webservice/status_log?user_id=" + aoj_id.value, false);
        req_me.open("GET", "https://judgeapi.u-aizu.ac.jp/submission_records/users/" + aoj_id.value + "?size=99999999", false);
        req_me.send(null);

        var text = req_me.responseText;
        text = text.replace(/\r?\n/g, "");
        //var S = text.split('<run_id>');
        var S = text.split('},{');
        for (var i = 0; i < problem_table.rows.length; i++) {
            for (var j = 0; j < S.length; j++) {
                //if (S[j].indexOf('<problem_id>' + problem_table.rows[i].cells[0].innerHTML) != -1) {
                if (S[j].indexOf('"problemId":"' + problem_table.rows[i].cells[0].innerHTML + '"') != -1) {
                    //if (S[j].indexOf('Accepted') != -1) {
                    if (S[j].indexOf('"status":4') != -1) {
                        problem_table.rows[i].cells[0].className = "ac";
                        problem_table.rows[i].cells[1].className = "ac";
                        problem_table.rows[i].cells[2].className = "ac";
                        problem_table.rows[i].cells[3].className = "ac";
                        problem_table.rows[i].cells[4].className = "ac";
                        break;
                    }
                    else {
                        problem_table.rows[i].cells[0].className = "wa";
                        problem_table.rows[i].cells[1].className = "wa";
                        problem_table.rows[i].cells[2].className = "wa";
                        problem_table.rows[i].cells[3].className = "wa";
                        problem_table.rows[i].cells[4].className = "wa";
                    }
                }
            }
        }

        //自分の統計情報を表示
        if (sta.checked == true) {
            statistic.innerHTML += "<h3>" + aoj_id.value + "</h3>";
            statistic.innerHTML += '<table id="' + aoj_id.value + '" class="statistic_table"></table>';
            
            if (yosen.checked == true){
                var tr = document.getElementById(aoj_id.value).insertRow(-1);
                var tr2 = document.getElementById(aoj_id.value).insertRow(-1);
                var tr3 = document.getElementById(aoj_id.value).insertRow(-1);
                var tr4 = document.getElementById(aoj_id.value).insertRow(-1);
                tr.innerHTML = '<th class="p">問題</th><th class="p">【予選】</th>';
                tr2.innerHTML = '<th class="p">問題数</th>';
                tr3.innerHTML = '<th class="p">割合</th>';
                tr4.innerHTML = '<th class="p">得点</th>';
                var td2 = tr2.insertCell(-1);
                var td3 = tr3.insertCell(-1);
                var td4 = tr4.insertCell(-1);
                var all = 0;
                var ac = 0;
                var point_all = 0;
                var point = 0;
                for (var i = 0; i < problem_table.rows.length; i++) {
                    if (problem_table.rows[i].cells[1].innerHTML.indexOf("予選") != -1){
                        all++;
                        point_all += Number(problem_table.rows[i].cells[3].innerHTML);
                        if (problem_table.rows[i].cells[1].className == "ac"){
                            ac++;
                            point += Number(problem_table.rows[i].cells[3].innerHTML);
                        }
                    }
                }
                td2.innerHTML = ac + "/" + all;
                if (all == 0) td3.innerHTML = "0%";
                else td3.innerHTML = Math.round(100 * ac / all) + "%";
                td4.innerHTML = point + "/" + point_all;

                if(point_all != 0 && point/point_all >= 0.8){
                    td2.className = "ac";
                    td3.className = "ac";
                    td4.className = "ac";
                }
                else if(point_all != 0 && point/point_all >= 0.6){
                    td2.className = "tle";
                    td3.className = "tle";
                    td4.className = "tle";
                }
                else if(point != 0){
                    td2.className = "wa";
                    td3.className = "wa";
                    td4.className = "wa";
                }
                
                for (var i=0; i<year_end.value-year_begin.value+1; i++){
                    if ((i+1)%7 == 0){
                        tr = document.getElementById(aoj_id.value).insertRow(-1);
                        tr2 = document.getElementById(aoj_id.value).insertRow(-1);
                        tr3 = document.getElementById(aoj_id.value).insertRow(-1);
                        tr4 = document.getElementById(aoj_id.value).insertRow(-1);
                        tr.innerHTML = '<th class="p">問題</th>';
                        tr2.innerHTML = '<th class="p">問題数</th>';
                        tr3.innerHTML = '<th class="p">割合</th>';
                        tr4.innerHTML = '<th class="p">得点</th>';
                    }
                    tr.innerHTML += '<th class="p">' + (Number(year_begin.value) + i) + '年</th>';
                    td2 = tr2.insertCell(-1);
                    td3 = tr3.insertCell(-1);
                    td4 = tr4.insertCell(-1);
                    all = 0;
                    ac = 0;
                    point_all = 0;
                    point = 0;
                    for (var j = 0; j < problem_table.rows.length; j++) {
                        if (problem_table.rows[j].cells[1].innerHTML.indexOf((Number(year_begin.value) + i) + "年予選") != -1) {
                            all++;
                            point_all += Number(problem_table.rows[j].cells[3].innerHTML);
                            if (problem_table.rows[j].cells[1].className == "ac"){
                                ac++;
                                point += Number(problem_table.rows[j].cells[3].innerHTML);
                            }
                        }
                    }
                    td2.innerHTML = ac + "/" + all;
                    if (all == 0) td3.innerHTML = "0%";
                    else td3.innerHTML = Math.round(100 * ac / all) + "%";
                    td4.innerHTML = point + "/" + point_all;

                    if(point_all != 0 && point/point_all >= 0.8){
                        td2.className = "ac";
                        td3.className = "ac";
                        td4.className = "ac";
                    }
                    else if(point_all != 0 && point/point_all >= 0.6){
                        td2.className = "tle";
                        td3.className = "tle";
                        td4.className = "tle";
                    }
                    else if(point != 0){
                        td2.className = "wa";
                        td3.className = "wa";
                        td4.className = "wa";
                    }
                }
            }

            if (honsen.checked == true){
                var tr = document.getElementById(aoj_id.value).insertRow(-1);
                var tr2 = document.getElementById(aoj_id.value).insertRow(-1);
                var tr3 = document.getElementById(aoj_id.value).insertRow(-1);
                var tr4 = document.getElementById(aoj_id.value).insertRow(-1);
                tr.innerHTML = '<th class="p">問題</th><th class="p">【本選】</th>';
                tr2.innerHTML = '<th class="p">問題数</th>';
                tr3.innerHTML = '<th class="p">割合</th>';
                tr4.innerHTML = '<th class="p">得点</th>';
                var td2 = tr2.insertCell(-1);
                var td3 = tr3.insertCell(-1);
                var td4 = tr4.insertCell(-1);
                var all = 0;
                var ac = 0;
                var point_all = 0;
                var point = 0;
                for (var i = 0; i < problem_table.rows.length; i++) {
                    if (problem_table.rows[i].cells[1].innerHTML.indexOf("本選") != -1){
                        all++;
                        point_all += Number(problem_table.rows[i].cells[3].innerHTML);
                        if (problem_table.rows[i].cells[1].className == "ac"){
                            ac++;
                            point += Number(problem_table.rows[i].cells[3].innerHTML);
                        }
                    }
                }
                td2.innerHTML = ac + "/" + all;
                if (all == 0) td3.innerHTML = "0%";
                else td3.innerHTML = Math.round(100 * ac / all) + "%";
                td4.innerHTML = point + "/" + point_all;

                if(point_all != 0 && point/point_all >= 0.8){
                    td2.className = "ac";
                    td3.className = "ac";
                    td4.className = "ac";
                }
                else if(point_all != 0 && point/point_all >= 0.6){
                    td2.className = "tle";
                    td3.className = "tle";
                    td4.className = "tle";
                }
                else if(point != 0){
                    td2.className = "wa";
                    td3.className = "wa";
                    td4.className = "wa";
                }
                
                for (var i=0; i<year_end.value-year_begin.value+1; i++){
                    if ((i+1)%7 == 0){
                        tr = document.getElementById(aoj_id.value).insertRow(-1);
                        tr2 = document.getElementById(aoj_id.value).insertRow(-1);
                        tr3 = document.getElementById(aoj_id.value).insertRow(-1);
                        tr4 = document.getElementById(aoj_id.value).insertRow(-1);
                        tr.innerHTML = '<th class="p">問題</th>';
                        tr2.innerHTML = '<th class="p">問題数</th>';
                        tr3.innerHTML = '<th class="p">割合</th>';
                        tr4.innerHTML = '<th class="p">得点</th>';
                    }
                    tr.innerHTML += '<th class="p">' + (Number(year_begin.value) + i) + '年</th>';
                    td2 = tr2.insertCell(-1);
                    td3 = tr3.insertCell(-1);
                    td4 = tr4.insertCell(-1);
                    all = 0;
                    ac = 0;
                    point_all = 0;
                    point = 0;
                    for (var j = 0; j < problem_table.rows.length; j++) {
                        if (problem_table.rows[j].cells[1].innerHTML.indexOf((Number(year_begin.value) + i) + "年本選") != -1) {
                            all++;
                            point_all += Number(problem_table.rows[j].cells[3].innerHTML);
                            if (problem_table.rows[j].cells[1].className == "ac"){
                                ac++;
                                point += Number(problem_table.rows[j].cells[3].innerHTML);
                            }
                        }
                    }
                    td2.innerHTML = ac + "/" + all;
                    if (all == 0) td3.innerHTML = "0%";
                    else td3.innerHTML = Math.round(100 * ac / all) + "%";
                    td4.innerHTML = point + "/" + point_all;

                    if(point_all != 0 && point/point_all >= 0.7){
                        td2.className = "ac";
                        td3.className = "ac";
                        td4.className = "ac";
                    }
                    else if(point_all != 0 && point/point_all >= 0.5){
                        td2.className = "tle";
                        td3.className = "tle";
                        td4.className = "tle";
                    }
                    else if(point != 0){
                        td2.className = "wa";
                        td3.className = "wa";
                        td4.className = "wa";
                    }
                }
            }
        }
    }

    //ライバルの提出状況を表示
    for (var i = 0; i < problem_table.rows.length; i++) {
        problem_table.rows[i].cells[4].innerHTML = '';
    }
    if (rival_aoj_id.value != "") {
        var text = rival_aoj_id.value.split(',');
        for (var k = 0; k < text.length; k++) {
            var req_rival = new XMLHttpRequest();
            //req_rival.open("GET", "http://judge.u-aizu.ac.jp/onlinejudge/webservice/status_log?user_id=" + text[k], false);
            req_rival.open("GET", "https://judgeapi.u-aizu.ac.jp/submission_records/users/" + text[k] + "?size=99999999", false);
            req_rival.send(null);
            S = req_rival.responseText.replace(/\r?\n/g, "");
            //S = S.split('<run_id>');
            S = S.split('},{');
            for (var i = 0; i < problem_table.rows.length; i++) {
                var tmp = 0;
                for (var j = 0; j < S.length; j++) {
                    //if (S[j].indexOf('<problem_id>' + problem_table.rows[i].cells[0].innerHTML) != -1) {
                    if (S[j].indexOf('"problemId":"' + problem_table.rows[i].cells[0].innerHTML + '"') != -1) {
                        //if (S[j].indexOf('Accepted') != -1) {
                        if (S[j].indexOf('"status":4') != -1) {
                            tmp = 2;
                            break;
                        }
                        else {
                            tmp = 1;
                        }
                    }
                }
                if (tmp == 2) {
                    problem_table.rows[i].cells[4].innerHTML += '<span class="label-ac">' + text[k] + '</span> ';
                }
                else if (tmp == 1) {
                    problem_table.rows[i].cells[4].innerHTML += '<span class="label-wa">' + text[k] + '</span> ';
                }
            }

            //ライバルの統計情報を表示
            if (rival_sta.checked == true) {
                if (text[k] == aoj_id.value) continue;
                statistic.innerHTML += "<h3>" + text[k] + "</h3>";
                statistic.innerHTML += '<table id="' + text[k] + '" class="statistic_table"></table>';

                if (yosen.checked == true) {
                    var tr = document.getElementById(text[k]).insertRow(-1);
                    var tr2 = document.getElementById(text[k]).insertRow(-1);
                    var tr3 = document.getElementById(text[k]).insertRow(-1);
                    var tr4 = document.getElementById(text[k]).insertRow(-1);
                    tr.innerHTML = '<th class="p">問題</th><th class="p">【予選】</th>';
                    tr2.innerHTML = '<th class="p">問題数</th>';
                    tr3.innerHTML = '<th class="p">割合</th>';
                    tr4.innerHTML = '<th class="p">得点</th>';
                    var td2 = tr2.insertCell(-1);
                    var td3 = tr3.insertCell(-1);
                    var td4 = tr4.insertCell(-1);
                    var all = 0;
                    var ac = 0;
                    var point_all = 0;
                    var point = 0;
                    for (var i = 0; i < problem_table.rows.length; i++) {
                        if (problem_table.rows[i].cells[1].innerHTML.indexOf("予選") != -1) {
                            all++;
                            point_all += Number(problem_table.rows[i].cells[3].innerHTML);
                            if (problem_table.rows[i].cells[4].innerHTML.indexOf('<span class="label-ac">'+text[k]) != -1) {
                                ac++;
                                point += Number(problem_table.rows[i].cells[3].innerHTML);
                            }
                        }
                    }
                    td2.innerHTML = ac + "/" + all;
                    if (all == 0) td3.innerHTML = "0%";
                    else td3.innerHTML = Math.round(100 * ac / all) + "%";
                    td4.innerHTML = point + "/" + point_all;

                    if (point_all != 0 && point / point_all >= 0.8) {
                        td2.className = "ac";
                        td3.className = "ac";
                        td4.className = "ac";
                    }
                    else if (point_all != 0 && point / point_all >= 0.6) {
                        td2.className = "tle";
                        td3.className = "tle";
                        td4.className = "tle";
                    }
                    else if (point != 0) {
                        td2.className = "wa";
                        td3.className = "wa";
                        td4.className = "wa";
                    }

                    for (var i = 0; i < year_end.value - year_begin.value + 1; i++) {
                        if ((i + 1) % 7 == 0) {
                            tr = document.getElementById(text[k]).insertRow(-1);
                            tr2 = document.getElementById(text[k]).insertRow(-1);
                            tr3 = document.getElementById(text[k]).insertRow(-1);
                            tr4 = document.getElementById(text[k]).insertRow(-1);
                            tr.innerHTML = '<th class="p">問題</th>';
                            tr2.innerHTML = '<th class="p">問題数</th>';
                            tr3.innerHTML = '<th class="p">割合</th>';
                            tr4.innerHTML = '<th class="p">得点</th>';
                        }
                        tr.innerHTML += '<th class="p">' + (Number(year_begin.value) + i) + '年</th>';
                        td2 = tr2.insertCell(-1);
                        td3 = tr3.insertCell(-1);
                        td4 = tr4.insertCell(-1);
                        all = 0;
                        ac = 0;
                        point_all = 0;
                        point = 0;
                        for (var j = 0; j < problem_table.rows.length; j++) {
                            if (problem_table.rows[j].cells[1].innerHTML.indexOf((Number(year_begin.value) + i) + "年予選") != -1) {
                                all++;
                                point_all += Number(problem_table.rows[j].cells[3].innerHTML);
                                if (problem_table.rows[j].cells[4].innerHTML.indexOf('<span class="label-ac">'+text[k]) != -1) {
                                    ac++;
                                    point += Number(problem_table.rows[j].cells[3].innerHTML);
                                }
                            }
                        }
                        td2.innerHTML = ac + "/" + all;
                        if (all == 0) td3.innerHTML = "0%";
                        else td3.innerHTML = Math.round(100 * ac / all) + "%";
                        td4.innerHTML = point + "/" + point_all;

                        if (point_all != 0 && point / point_all >= 0.8) {
                            td2.className = "ac";
                            td3.className = "ac";
                            td4.className = "ac";
                        }
                        else if (point_all != 0 && point / point_all >= 0.6) {
                            td2.className = "tle";
                            td3.className = "tle";
                            td4.className = "tle";
                        }
                        else if (point != 0) {
                            td2.className = "wa";
                            td3.className = "wa";
                            td4.className = "wa";
                        }
                    }
                }

                if (honsen.checked == true) {
                    var tr = document.getElementById(text[k]).insertRow(-1);
                    var tr2 = document.getElementById(text[k]).insertRow(-1);
                    var tr3 = document.getElementById(text[k]).insertRow(-1);
                    var tr4 = document.getElementById(text[k]).insertRow(-1);
                    tr.innerHTML = '<th class="p">問題</th><th class="p">【本選】</th>';
                    tr2.innerHTML = '<th class="p">問題数</th>';
                    tr3.innerHTML = '<th class="p">割合</th>';
                    tr4.innerHTML = '<th class="p">得点</th>';
                    var td2 = tr2.insertCell(-1);
                    var td3 = tr3.insertCell(-1);
                    var td4 = tr4.insertCell(-1);
                    var all = 0;
                    var ac = 0;
                    var point_all = 0;
                    var point = 0;
                    for (var i = 0; i < problem_table.rows.length; i++) {
                        if (problem_table.rows[i].cells[1].innerHTML.indexOf("本選") != -1) {
                            all++;
                            point_all += Number(problem_table.rows[i].cells[3].innerHTML);
                            if (problem_table.rows[i].cells[4].innerHTML.indexOf('<span class="label-ac">'+text[k]) != -1) {
                                ac++;
                                point += Number(problem_table.rows[i].cells[3].innerHTML);
                            }
                        }
                    }
                    td2.innerHTML = ac + "/" + all;
                    if (all == 0) td3.innerHTML = "0%";
                    else td3.innerHTML = Math.round(100 * ac / all) + "%";
                    td4.innerHTML = point + "/" + point_all;

                    if (point_all != 0 && point / point_all >= 0.8) {
                        td2.className = "ac";
                        td3.className = "ac";
                        td4.className = "ac";
                    }
                    else if (point_all != 0 && point / point_all >= 0.6) {
                        td2.className = "tle";
                        td3.className = "tle";
                        td4.className = "tle";
                    }
                    else if (point != 0) {
                        td2.className = "wa";
                        td3.className = "wa";
                        td4.className = "wa";
                    }

                    for (var i = 0; i < year_end.value - year_begin.value + 1; i++) {
                        if ((i + 1) % 7 == 0) {
                            tr = document.getElementById(text[k]).insertRow(-1);
                            tr2 = document.getElementById(text[k]).insertRow(-1);
                            tr3 = document.getElementById(text[k]).insertRow(-1);
                            tr4 = document.getElementById(text[k]).insertRow(-1);
                            tr.innerHTML = '<th class="p">問題</th>';
                            tr2.innerHTML = '<th class="p">問題数</th>';
                            tr3.innerHTML = '<th class="p">割合</th>';
                            tr4.innerHTML = '<th class="p">得点</th>';
                        }
                        tr.innerHTML += '<th class="p">' + (Number(year_begin.value) + i) + '年</th>';
                        td2 = tr2.insertCell(-1);
                        td3 = tr3.insertCell(-1);
                        td4 = tr4.insertCell(-1);
                        all = 0;
                        ac = 0;
                        point_all = 0;
                        point = 0;
                        for (var j = 0; j < problem_table.rows.length; j++) {
                            if (problem_table.rows[j].cells[1].innerHTML.indexOf((Number(year_begin.value) + i) + "年本選") != -1) {
                                all++;
                                point_all += Number(problem_table.rows[j].cells[3].innerHTML);
                                if (problem_table.rows[j].cells[4].innerHTML.indexOf('<span class="label-ac">'+text[k]) != -1) {
                                    ac++;
                                    point += Number(problem_table.rows[j].cells[3].innerHTML);
                                }
                            }
                        }
                        td2.innerHTML = ac + "/" + all;
                        if (all == 0) td3.innerHTML = "0%";
                        else td3.innerHTML = Math.round(100 * ac / all) + "%";
                        td4.innerHTML = point + "/" + point_all;

                        if (point_all != 0 && point / point_all >= 0.7) {
                            td2.className = "ac";
                            td3.className = "ac";
                            td4.className = "ac";
                        }
                        else if (point_all != 0 && point / point_all >= 0.5) {
                            td2.className = "tle";
                            td3.className = "tle";
                            td4.className = "tle";
                        }
                        else if (point != 0) {
                            td2.className = "wa";
                            td3.className = "wa";
                            td4.className = "wa";
                        }
                    }
                }
            }
        }
    }
}*/