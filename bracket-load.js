let url = window.location.href
let id = url.substring(url.indexOf("?") + 1)

console.log(url)
console.log(id)

let bracketPage = document.querySelector(".bracket-page")

if(url === id) {
    bracketPage.textContent = "Error 404: No bracket ID provided."
} else {
    let bracket = JSON.parse(localStorage.getItem(id))
    bracket = new Bracket(bracket.name, bracket.participants, bracket.elim, bracket.id, bracket.final,  bracket.matches, bracket.date)
    if(bracket === null) {
        bracketPage.textContent = "Error 404: Invalid bracket ID."
    } else {
        let title = bracket.name

        let titleEl = document.createElement("h1")
        titleEl.textContent = title

        bracketPage.textContent = ""
        bracketPage.appendChild(titleEl)
        bracketPage.appendChild(createBracketHTML(bracket))
    }
}

function createBracketHTML(b) {
    let container = document.createElement("div")
    container.classList.add("bracket-container")

    let table = document.createElement("table")
    table.classList.add("bracket")

    let tableBody = document.createElement("tbody")

    if(b.elim === 1) {
        let tr = document.createElement("tr")
        let rounds = b.getRounds()
        tr.textContent = JSON.stringify(rounds.map((r) => Object.fromEntries(r)))
        tableBody.appendChild(tr)
    } else {
        let tr = document.createElement("tr")
        tr.textContent = "Double Elim not implemented yet"
        tableBody.appendChild(tr)
    }

    table.appendChild(tableBody)
    container.appendChild(table)

    return container
}