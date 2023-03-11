console.log('ingame')
let positions = [];
let game_won = false;
let myCell = document.getElementsByClassName('cell-94')[0];
let allCells = [];
let dices_thrown = false;
let move_done = false;
let assumption_making = false;
let assumption_made = false;
const cell_names = ['Бильярдная','Библиотека','Кабинет','Кухня','Зимний сад','Гостинная','Бальный зал','Холл','Столовая']
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
    document.querySelector(".status").innerText = ' ';
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

        if (e.RESULTS[2].login[0] === getCookie('login')){
            document.getElementById('diceThrow').hidden = false;
            document.getElementById('openAssumption').hidden = false;
            document.getElementById('makeAccusation').hidden = false;
            document.getElementById('endTurn').hidden = false;

            if (dices_thrown || move_done && e.RESULTS[2].dice_number[0] === 7){
                document.getElementById('diceThrow').hidden = true;
                document.getElementById('divDices').hidden = true;
            }
            if (assumption_making){
                document.getElementById('diceThrow').hidden = true;
                document.getElementById('openAssumption').hidden = true;
                document.getElementById('makeAccusation').hidden = true;
                document.getElementById('endTurn').hidden = true;
            }
        }

        if (e.RESULTS[5].assuming_player[0] != null && e.RESULTS[5].assuming_player[0] !== undefined){
            document.getElementById('openAssumption').hidden = true;
            document.getElementById('assumption').innerText = '';
            document.getElementById('assumption').hidden = false;
            document.getElementById('assumption_commentary').hidden = false;
            if (e.RESULTS[5].assuming_player[0] === getCookie('login')){
                document.getElementById('assumption').innerText =
                    'Вы предположили, что ' +
                    e.RESULTS[5].supposed_persona[0] + ' убил жертву в ' +
                    e.RESULTS[5].room[0] + ' c помощью ' +
                    e.RESULTS[5].weapon[0] + '.'
            }
            else if(e.RESULTS[5].supposed_persona[0] === getCookie('login')){
                document.getElementById('assumption').innerText =
                    e.RESULTS[5].assuming_player[0] + ' предположил, что Вы убили жертву в ' +
                    e.RESULTS[5].room[0] + ' c помощью ' +
                    e.RESULTS[5].weapon[0] + '.'
            }
            else {
                document.getElementById('assumption').innerText =
                    e.RESULTS[5].assuming_player[0] + ' предположил, что ' +
                    e.RESULTS[5].supposed_persona[0] + ' убил жертву в ' +
                    e.RESULTS[5].room[0] + ' c помощью ' +
                    e.RESULTS[5].weapon[0] + '.'
            }
        } else document.getElementById('assumption').innerText = '';
    }
}

function throwDices(){
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
        if (responseJSON.RESULTS[0].e){
            console.log('Not your turn');
            show_error('Сейчас не ваш ход');
        }
        else {
            dices_thrown = true;
            console.log(responseJSON)
            document.getElementById('diceThrow').hidden = true;
            document.getElementById('divDices').hidden = false;
            document.getElementsByClassName('dices')[0].innerText = responseJSON.RESULTS[0].dices[0]
            showAvailableCells(responseJSON.RESULTS[1].avaliable_cells);

        }
    });
}

function endTurn(){
    move_done = true;
    showAvailableCells();
    document.getElementById('divDices').hidden = true;

    dices_thrown = false;
    move_done = false;

    document.getElementById('diceThrow').hidden = true;
    document.getElementById('divDices').hidden = true;
    document.getElementById('openAssumption').hidden = true;
    document.getElementById('assumption_commentary').hidden = true;
    document.getElementById('makeAccusation').hidden = true;
    document.getElementById('endTurn').hidden = true;

    const url = "https://sql.lavro.ru/call.php?";
    let fd = new FormData();
    fd.append('pname', 'end_turn');
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
        if (responseJSON.RESULTS[0].e){
            console.log('Not your turn');
            show_error('Сейчас не ваш ход');
        }
        else {
            document.getElementById('assumption').hidden = true;
            showAvailableCells([]);
        }
    });

}

function showAvailableCells(e){
    for (let q of allCells)
        if (q.classList.contains('canChoose'))
            q.classList.remove('canChoose');

    if (move_done || e === null || e === undefined) return;

    for (let q of e){
        let o = document.getElementsByClassName('cell-' + q)[0];
        o.classList.add('canChoose');
    }
}

function moveHere(e) {
    if (!document.getElementsByClassName('cell-' + e)[0].classList.contains('canChoose') || move_done){
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
        if (responseJSON.RESULTS[0].e){
            console.log('Not your turn');
            show_error('Сейчас не ваш ход');
        }
        else {
            if (responseJSON.RESULTS[2].dice_number[0] === 7){
                move_done = true;
                showAvailableCells();
                document.getElementById('divDices').hidden = true;
            }
            document.getElementsByClassName('dices')[0].innerText = responseJSON.RESULTS[2].dice_number[0];
            showAvailableCells(responseJSON.RESULTS[1].avaliable_cells);
            if (myCell.classList.contains('currentCell')) myCell.classList.remove('currentCell');
            myCell.innerText = e;
            console.log(myCell.classList)
            myCell = document.getElementsByClassName('cell-' + e)[0];
            myCell.classList.add('currentCell');
        }
    });
}

function openAssumption(){
    showAvailableCells();
    document.getElementById('divDices').hidden = true;
    assumption_making = true;
    document.getElementById('makeAssumption').hidden = false;
    document.getElementById('openAssumption').hidden = true;
    document.getElementById('divDices').hidden = true;
    document.getElementById('diceThrow').hidden = true;
    document.getElementById('makeAccusation').hidden = true;
    document.getElementById('endTurn').hidden = true;
}

function closeAssumption(){
    assumption_making = false;
    document.getElementById('makeAssumption').hidden = true;
}

function makeAssumption() {
    const url = "https://sql.lavro.ru/call.php?";
    let fd = new FormData();
    fd.append('pname', 'make_assumption');
    fd.append('db', '283909');
    fd.append('p1', getCookie('token'));
    fd.append('p2', getCookie('gameID'));
    fd.append('p3', document.getElementById('chPersona').value);
    fd.append('p4', document.getElementById('chWeapon').value);
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
        if (responseJSON.RESULTS[0].e){
            console.log('responseJSON');
            show_error('Сейчас не ваш ход');
        }
        else if (responseJSON.RESULTS[0].res){
            show_error(responseJSON.RESULTS[0].res[0])
            assumption_made = true;
            closeAssumption();
        }
        else {
            alert(`Вы получили новую карту: ${responseJSON.RESULTS[1].description[0]}`);
            assumption_made = true;
            closeAssumption();
        }
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