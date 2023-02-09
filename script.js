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
        console.log(token);
        window.location.href = ("roomState.html");
    }
}

function newGame() {
    const url = "https://sql.lavro.ru/call.php?";
    let form = new FormData(document.getElementById('createForm'));
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

