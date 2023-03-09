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

        let container = document.createElement("div")
        container.classList.add("bracket-container")

        bracketPage.appendChild(container)
        createBracketHTML(bracket, container)
    }
}

function createBracketHTML(b, container) {
    //let container = document.createElement("div")
    //container.classList.add("bracket-container")

    let table = document.createElement("table")
    table.classList.add("bracket")

    let tableBody = document.createElement("tbody")

    table.appendChild(tableBody)
    container.appendChild(table)

    if(/*b.elim === 1*/true) {
        let rounds = b.getRounds()

        generateFirstTwoRoundsHTML(tableBody, rounds, b)

        for(let i = 2; i < rounds.length; i++) {
            generateNextRound(tableBody, rounds[i], i * 3, b)
        }

        //console.log(tableBody.children[3])

        //tr.textContent = JSON.stringify(rounds.map((r) => Object.fromEntries(r)))

    } else {
        let tr = document.createElement("tr")
        tr.textContent = "Double Elim not implemented yet"
        tableBody.appendChild(tr)
    }

    return container
}

function generateFirstTwoRoundsHTML(tableBody, rounds, bracket) {
    if(rounds.length === 1) {
        generateReferenceRound(tableBody, rounds[0], 0)
    } else {
        if(rounds[0].size > rounds[1].size) {
            generateReferenceRound(tableBody, rounds[0], 0)
            generateNextRound(tableBody, rounds[1], 3, bracket)
        } else {
            generateReferenceRound(tableBody, rounds[1], 3)
            generatePreviousRound(tableBody, rounds[0], 0, bracket)
        }
    }
}

function generateReferenceRound(tableBody, round, tableCol) {
    let tableHeight = round.size * 3 - 1
    for(let i = 0; i < tableHeight; i++) {
        let row = document.createElement("tr")
        for(let j = 0; j <= tableCol; j++) {
            let cell = document.createElement("td")
            row.appendChild(cell)
        }
        tableBody.appendChild(row)
    }

    let counter = 0
    round.forEach((m) => {
        tableBody.children[counter].children[tableCol].classList.add("bracket-team")
        tableBody.children[counter].children[tableCol].textContent = m.par1.name
        tableBody.children[counter].children[tableCol].id = m.id
        counter++
        

        tableBody.children[counter].children[tableCol].classList.add("bracket-team")
        tableBody.children[counter].children[tableCol].textContent = m.par2.name
        tableBody.children[counter].children[tableCol].id = m.id
        counter++

        counter++
    })
}

function generateNextRound(tableBody, round, tableCol, bracket) {
    for (const entry of round.entries()) {
        let m = entry[1]
        if(m.round*3 - 3 === tableCol) {
            if(m.par1 instanceof Participant) prependRow(tableBody)
            break
        }
    }

    for(let i = 0; i < tableBody.children.length; i++) { // ensure there are enough columns in each row so we don't go out of bounds
        let tableRow = tableBody.children[i]
        for(let j = tableRow.children.length; j <= tableCol; j++) tableRow.appendChild(document.createElement("td"))
    }

    let counter = 0
    round.forEach((m) => {
        let firstLineRight = -1
        let lastLineRight = -1
        let prevMatchRoundTableIndex = tableCol
        if(m.par1 instanceof MatchReference && !m.par1.getLoser) {
            prevMatchRoundTableIndex = bracket.matches.get(m.par1.id).round*3
            while(tableBody.children[counter].children[prevMatchRoundTableIndex - 3].id !== m.par1.id) counter++
            tableBody.children[counter].children[prevMatchRoundTableIndex - 2].classList.add("line-below")
            firstLineRight = counter + 1
        }

        if(m.par2 instanceof MatchReference && !m.par2.getLoser) {
            prevMatchRoundTableIndex = bracket.matches.get(m.par2.id).round*3
            while(tableBody.children[counter].children[prevMatchRoundTableIndex - 3].id !== m.par2.id) counter++
            tableBody.children[counter].children[prevMatchRoundTableIndex - 2].classList.add("line-right-below")
            lastLineRight = counter - 1

            if(firstLineRight !== -1) {
                for(let j = firstLineRight; j <= lastLineRight; j++) {
                    tableBody.children[j].children[prevMatchRoundTableIndex - 2].classList.add("line-right")
                }

                let nextMatchIndex = Math.floor((firstLineRight + lastLineRight) / 2 + .5)
                for(let j = prevMatchRoundTableIndex - 1; j <= tableCol - 1; j++) {
                    tableBody.children[nextMatchIndex].children[j].classList.add("line-below")
                }
                tableBody.children[nextMatchIndex].children[tableCol].classList.add("bracket-team")
                tableBody.children[nextMatchIndex].children[tableCol].id = m.id
                tableBody.children[nextMatchIndex + 1].children[tableCol].classList.add("bracket-team")
                tableBody.children[nextMatchIndex + 1].children[tableCol].id = m.id
            } else {
                for(let j = prevMatchRoundTableIndex - 1; j <= tableCol - 1; j++) {
                    tableBody.children[lastLineRight].children[j].classList.add("line-below")
                }
                tableBody.children[lastLineRight].children[tableCol].classList.add("bracket-team")
                tableBody.children[lastLineRight].children[tableCol].id = m.id
                tableBody.children[lastLineRight].children[tableCol].textContent = m.par1.name
                tableBody.children[lastLineRight + 1].children[tableCol].classList.add("bracket-team")
                tableBody.children[lastLineRight + 1].children[tableCol].id = m.id
                counter++
            }
        } else {
            counter++
            tableBody.children[counter].children[tableCol].classList.add("bracket-team")
            tableBody.children[counter].children[tableCol].id = m.id
            tableBody.children[counter].children[tableCol].textContent = m.par1.name
            counter++
            tableBody.children[counter].children[tableCol].classList.add("bracket-team")
            tableBody.children[counter].children[tableCol].id = m.id
            tableBody.children[counter].children[tableCol].textContent = m.par2.name
            counter++
        }
    })
}

function generatePreviousRound(tableBody, round, tableCol, bracket) {
    for(let i = tableBody.children.length - 1; i >= 0; i--) {
        let cell = tableBody.children[i].children[tableCol + 3]
        if(cell.classList.contains("bracket-team")) {
            let m = bracket.matches.get(cell.id)
            if(m.par2 instanceof MatchReference) appendRow(tableBody)
            break
        }
    }

    let counter = 0
    round.forEach((m) => {
        let id = m.id

        for(let i = 0; i < tableBody.children.length; i++) {
            let cell = tableBody.children[i].children[tableCol + 3]
            if(cell.classList.contains("bracket-team")) {
                let m2 = bracket.matches.get(cell.id)
                if(m2.par1 instanceof MatchReference && !m2.par1.getLoser && m2.par1.id === id) {
                    // put m before and above m2!
                    tableBody.children[i].children[tableCol + 2].classList.add("line-below")
                    tableBody.children[i].children[tableCol + 1].classList.add("line-right")
                    tableBody.children[i - 1].children[tableCol + 1].classList.add("line-right")
                    tableBody.children[i - 2].children[tableCol + 1].classList.add("line-below")

                    tableBody.children[i - 1].children[tableCol].classList.add("bracket-team")
                    tableBody.children[i - 2].children[tableCol].classList.add("bracket-team")
                    tableBody.children[i - 1].children[tableCol].id = m.id
                    tableBody.children[i - 2].children[tableCol].id = m.id

                    if(m.par2 instanceof Participant) tableBody.children[i - 1].children[tableCol].textContent = m.par2.name
                    if(m.par1 instanceof Participant) tableBody.children[i - 2].children[tableCol].textContent = m.par1.name

                    break
                } else if(m2.par2 instanceof MatchReference && !m2.par2.getLoser && m2.par2.id === id) {
                    // put m before and below m2!
                    tableBody.children[i].children[tableCol + 2].classList.add("line-below")
                    tableBody.children[i + 1].children[tableCol + 1].classList.add("line-right-below")

                    tableBody.children[i + 1].children[tableCol].classList.add("bracket-team")
                    tableBody.children[i + 2].children[tableCol].classList.add("bracket-team")
                    
                    if(m.par1 instanceof Participant) tableBody.children[i + 1].children[tableCol].textContent = m.par1.name
                    if(m.par2 instanceof Participant) tableBody.children[i + 2].children[tableCol].textContent = m.par2.name

                    break
                }
            }
        }
    })
}

function prependRow(tableBody) {
    let row = document.createElement("tr")

    for(let i = 0; i < tableBody.children[0].children.length; i++) {
        row.appendChild(document.createElement("td"))
    }

    tableBody.insertBefore(row, tableBody.firstElementChild)
}

function appendRow(tableBody) {
    let row = document.createElement("tr")

    for(let i = 0; i < tableBody.children[0].children.length; i++) {
        row.appendChild(document.createElement("td"))
    }

    tableBody.appendChild(row)
}