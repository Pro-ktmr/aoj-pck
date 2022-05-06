var csvUrl = "list.csv?ver=210729";

// GETのデータを配列にして返す
function GetQueryString() {
    var result = {};
    if (1 < window.location.search.length) {
        // 最初の1文字 (?記号) を除いた文字列を取得する
        var query = window.location.search.substring(1);
        // クエリの区切り記号 (&) で文字列を配列に分割する
        var parameters = query.split('&');

        for (var i = 0; i < parameters.length; i++) {
            // パラメータ名とパラメータ値に分割する
            var element = parameters[i].split('=');

            var paramName = decodeURIComponent(element[0]);
            var paramValue = decodeURIComponent(element[1]);

            // パラメータ名をキーとして連想配列に追加する
            result[paramName] = paramValue;
        }
    }
    return result;
}

// 読み込んだCSVデータを二次元配列に変換する関数convertCSVtoArray()の定義
function convertCSVtoArray(str) { // 読み込んだCSVデータが文字列として渡される
    var result = []; // 最終的な二次元配列を入れるための配列
    var tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成

    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
    for (var i = 0; i < tmp.length; ++i) {
        result[i] = tmp[i].split(',');
    }

    return result;
}

//=====以下オリジナル=====

function checkData(){
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
}
setInterval(checkData, 15000);//単位ミリ秒 1分=60000

window.onload = function () {

    //GETを表に反映
    var g = GetQueryString();
    if (g["aoj_id"]) aoj_id.value = g["aoj_id"];
    if (g["sta"] == "on") sta.checked = true;
    if (g["rival_aoj_id"]) rival_aoj_id.value = g["rival_aoj_id"];
    if (g["rival_sta"] == "on") rival_sta.checked = true;
    if (g["year_begin"]) year_begin.value = g["year_begin"];
    if (g["year_end"]) year_end.value = g["year_end"];
    if (g["yosen"] == "off") yosen.checked = false;
    if (g["honsen"] == "off") honsen.checked = false;

    //問題一覧を表示
    var req = new XMLHttpRequest();
    req.open("GET", csvUrl, false);
    req.send(null);

    var result = new Array();
    result = convertCSVtoArray(req.responseText);

    for (var i = 0; i < result.length; i++) {
        if (result[i].length <= 1) continue;
        if (yosen.checked == false && result[i][2] == "yosen") continue;
        if (honsen.checked == false && result[i][2] == "honsen") continue;
        if (result[i][1] < year_begin.value) continue;
        if (result[i][1] > year_end.value) continue;

        var tr = problem_table.insertRow(-1);

        var td1 = tr.insertCell(-1);
        td1.innerHTML = result[i][0];

        var td2 = tr.insertCell(-1);
        td2.innerHTML = result[i][1] + "年";
        if (result[i][2] == "yosen") td2.innerHTML += "予選";
        if (result[i][2] == "honsen") td2.innerHTML += "本選";
        td2.innerHTML += result[i][3];

        var td3 = tr.insertCell(-1);
        td3.innerHTML = '<a href="http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=' + result[i][0] + '&lang=ja" target="_blank">' + result[i][4] + '</a>';
        if (result[i][2] == "yosen") td3.innerHTML += ' (<a href="https://onlinejudge.u-aizu.ac.jp/challenges/sources/PCK/Prelim/' + result[i][0] + '" target="_blank">β</a>)';
        if (result[i][2] == "honsen") td3.innerHTML += ' (<a href="https://onlinejudge.u-aizu.ac.jp/challenges/sources/PCK/Final/' + result[i][0] + '" target="_blank">β</a>)';

        var td4 = tr.insertCell(-1);
        td4.innerHTML = result[i][5];

        var td5 = tr.insertCell(-1);
    }

    $("#problem_table_main").tablesorter(); 

    checkData();
}

function clock() {
    var weeks = new Array("Sun", "Mon", "Thu", "Wed", "Thr", "Fri", "Sat");

    var now = new Date();
    var y = now.getFullYear();
    var mo = now.getMonth() + 1;
    var d = now.getDate();
    var w = weeks[now.getDay()]; //0~6で日曜始まりで取得されるからweeks配列のインデックスとして指定
    var h = now.getHours();
    var mi = now.getMinutes();
    var s = now.getSeconds();

    //2ケタ処理
    if (mo < 10) mo = "0" + mo;
    if (d < 10) d = "0" + d;
    if (mi < 10) mi = "0" + mi;
    if (s < 10) s = "0" + s;

    document.getElementById("clock_date").innerHTML = y + "/" + mo + "/" + d + " (" + w + ")";
    document.getElementById("clock_time").innerHTML = h + ":" + mi + ":" + s;
}
setInterval(clock, 1000);