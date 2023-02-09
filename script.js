let token;
let gamePass;

function sign_in() {
    const url = "https://sql.lavro.ru/call.php?";
    let form = new FormData(document.getElementById('logForm'));
    let fd = new FormData();
    fd.append('pname', 'sign_in');
    fd.append('db', '283909');
    fd.append('p1', form.get('user_name'));
    fd.append('p2', form.get('user_password'));
    fd.append('format', 'columns_compact');

    fetch(url, {
        method: "POST",
        body: fd
    }).then((response) => {
        if (response.ok){
            return response.json()
        }
        else {
            return show_error('ошибка сети)');
        }
    }).then((responseJSON) => {
            signInRes(responseJSON)
        });
}

function register() {
    const url = "https://sql.lavro.ru/call.php?";
    let form = new FormData(document.getElementById('regForm'));
    let fd = new FormData();
    fd.append('pname', 'register');
    fd.append('db', '283909');
    fd.append('p1', form.get('user_name'));
    fd.append('p2', form.get('user_password'));
    fd.append('format', 'columns_compact');

    fetch(url, {
        method: "POST",
        body: fd
    }).then((response) => {
        if (response.ok){
            return response.json()
        }
        else {
            return show_error('ошибка сети)');
        }
    }).then((responseJSON) => {
        signInRes(responseJSON)
    });
}

function signInRes(e){
    console.log(e)
    if (checkSqlErrors(e)){
        token = e.RESULTS[0].token[0];
        window.location.href = ("roomState.html");
        deleteCookies();
        setCookie('token',token)
        console.log(token);
    }
}


function newGame() {
    console.log(getCookie('token'))
    const url = "https://sql.lavro.ru/call.php?";
    var pass = document.getElementById('gamePassInput').value;
    let fd = new FormData();
    fd.append('pname', 'new_game');
    fd.append('db', '283909');
    fd.append('p1', token);
    fd.append('p2', pass);
    fd.append('format', 'columns_compact');
}


function show_game(e) {
    if (check_errors(e)) {
        let resp = JSON.parse(e.target.response);
        let logins = resp.RESULTS[0].login;
        let cells = resp.RESULTS[0].cell_id;
        if(logins && cells){
            for (let i = 1; i <= 4; i++){
                document.querySelector('.cell-' + i).innerHTML = ' ';
            }
            for (let i = 0; i < cells.length; i++){
                if (cells[i] >= 1 && cells[i] <= 4){
                    document.querySelector('.cell-' + cells[i]).innerHTML += (logins[i] + "<br>");
                }
            }
        }
    }
}

function show_error(s) {
    document.querySelector(".status").innerText = s;
}

function checkSqlErrors(e) {
    if(e.RESULTS[0].error){
        show_error(e.RESULTS[0].error);
    }
    else {
        return true;
    }
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}


function deleteCookies() {
    var allCookies = document.cookie.split(';');
    for (var i = 0; i < allCookies.length; i++)
        document.cookie = allCookies[i] + "=;expires="
            + new Date(0).toUTCString();
}

function setCookie(name, value, options = {}) {

    options = {
        path: '/',
        // при необходимости добавьте другие значения по умолчанию
        ...options
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }

    document.cookie = updatedCookie;
}


