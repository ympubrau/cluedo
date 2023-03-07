console.log('ingame')

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