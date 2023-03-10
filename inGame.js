console.log('ingame')
let positions = [];
let game_won = false;
let myCell = document.getElementsByClassName('cell-94')[0];
let allCells = [];
for (let i = 1; i <= 94; i++){
    allCells.push(document.getElementsByClassName('cell-' + i)[0])
    allCells[i-1].addEventListener("click", function(){
        moveHere(i);
    },false);
}

window.onload = function (){
    const url = "https://sql.lavro.ru/call.php?";
    let fd = new FormData();
    fd.append('pname', 'game_state');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', getCookie('gameID'));
    fd.append('format', 'columns_compact');

    const interval = setInterval(function() {
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
                show_game(responseJSON)
            });
    }, 5000);

    if (game_won){
        clearInterval(interval);
    }
}

function show_game(e) {
    console.log(e)
    if (checkSqlErrors(e)) {
        let logins = e.RESULTS[1].login;
        let cells = e.RESULTS[1].cell_id;
        if (logins && cells) {
            if (positions[0]) {
                for (let i = 0; i < positions.length; i++) {
                    document.querySelector('.cell-' + positions[i]).innerHTML = positions[i];
                }
            }
            for (let i = 0; i < cells.length; i++) {
                document.querySelector('.cell-' + cells[i]).innerHTML += (logins[i] + "<br>");
            }

        }
        positions = [...cells];

        let notes_id = e.RESULTS[0].card_type_id;
        for (let q of notes_id) {
            let o = document.getElementById(q);
            o.classList.remove('minus');
            o.classList.add('plus');
            o.innerText = '+';
        }

        document.getElementsByClassName('current')[0].innerText = e.RESULTS[2].login;
        document.getElementsByClassName('time')[0].innerText = e.RESULTS[2].end[0].split(' ')[1];
    }
}

function throwDices(){
    document.getElementById('diceThrow').hidden = true;
    document.getElementById('divDices').hidden = false;
    const url = "https://sql.lavro.ru/call.php?";

    let fd = new FormData();
    fd.append('pname', 'Throw_dices');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', getCookie('gameID'));
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
        document.getElementById('divDices').innerText += responseJSON.RESULTS[0].dices[0];
        console.log(responseJSON)
        showAvailableCells(responseJSON.RESULTS[1].avaliable_cells);
    });
}

function showAvailableCells(e){

    for (let q of allCells)
        if (q.classList.contains('canChoose'))
            q.classList.remove('canChoose');


    for (let q of e){
        let o = document.getElementsByClassName('cell-' + q)[0];
        o.classList.add('canChoose');
    }
}

function moveHere(e) {
    if (!document.getElementsByClassName('cell-' + e)[0].classList.contains('canChoose')){
        return
    }

    const url = "https://sql.lavro.ru/call.php?";

    let fd = new FormData();
    fd.append('pname', 'make_move');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', getCookie('gameID'));
    fd.append('p3',e);
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
        console.log(responseJSON)
        showAvailableCells(responseJSON.RESULTS[1].avaliable_cells);
        console.log(myCell)
        if (myCell.classList.contains('currentCell')) myCell.classList.remove('currentCell');
        myCell.innerHTML = e;
        myCell = document.getElementsByClassName('cell-' + e)[0];
        myCell.classList.add('currentCell');
    });
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