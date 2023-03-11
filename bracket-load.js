let url = window.location.href
let id = url.substring(url.indexOf("?") + 1)

console.log(url)
console.log(id)

let bracketPage = document.querySelector(".bracket-page")

if(url === id) {
    bracketPage.textContent = "Error 404: No bracket ID provided."
} else {
    let bracket = JSON.parse(localStorage.getItem(id))
    //bracket = new Bracket(bracket.name, bracket.participants, bracket.elim, bracket.id, bracket.final,  bracket.matches, bracket.date)
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

        let table = document.createElement("table")
        table.classList.add("bracket")
        container.appendChild(table)

        let tableBodies = []

        bracket.brackets.forEach(b => {
            b.matches = bracket.matches


            tableBodies.push(createBracketHTML(b))
        })

        table.appendChild(mergeTableBodies(tableBodies))

        // let container = document.createElement("div")
        // container.classList.add("bracket-container")

        // bracket.brackets[1].matches = bracket.matches
        // createBracketHTML(bracket.brackets[1], container)

        bracket.matches = new Map(Object.entries(bracket.matches))
        if(bracket.elim > 1) addGrandFinal(table.children[0], bracket.final, table.children[0].children.length + 4, bracket)
    }
}

function mergeTableBodies(bodies) {
    let body = bodies.reduce((p, n) => mergeTwoTableBodies(p, n))
    return body
}

function mergeTwoTableBodies(body1, body2) {
    let body1width = body1.children[0].children.length
    let body2width = body2.children[0].children.length
    let bodyWidth = Math.max(body1width, body2width)

    Array.from(body1.children).forEach(row => {
        for(let i = body1width; i < bodyWidth; i++) {
            row.appendChild(document.createElement("td"))
        }
    })

    Array.from(body2.children).forEach(row => {
        for(let i = body2width; i < bodyWidth; i++) {
            row.appendChild(document.createElement("td"))
        }
    })

    for(let i = 0; i < bodyWidth; i++) {
        if(body1.children[body1.children.length - 1].children[i].classList.contains("bracket-team")
        && body2.children[0].children[i].classList.contains("bracket-team")) {
            prependRow(body2)
            break
        }
    }

    Array.from(body2.children).forEach(row => {
        body1.appendChild(row)
    })

    return body1
}

function createBracketHTML(bracket) {
    //let container = document.createElement("div")
    //container.classList.add("bracket-container")

    let tableBody = document.createElement("tbody")


    if(/*b.elim === 1*/true) {
        //let rounds = b.getRounds()
        let rounds = getRounds(bracket)

        generateFirstTwoRoundsHTML(tableBody, rounds, bracket)

        for(let i = 2; i < rounds.length; i++) {
            generateNextRound(tableBody, rounds[i], i * 3, bracket)
        }

        //console.log(tableBody.children[3])

        //tr.textContent = JSON.stringify(rounds.map((r) => Object.fromEntries(r)))

    } else {
        let tr = document.createElement("tr")
        tr.textContent = "Double Elim not implemented yet"
        tableBody.appendChild(tr)
    }

    return tableBody
}

function getRounds(bracket) {
    bracket.matches = new Map(Object.entries(bracket.matches))
    let rounds = []

    for(let i = 0; i < bracket.final.round; i++) {
        rounds.push(new Map())
    }

    populateRounds(rounds, bracket.matches, bracket.final)
    //bracket.matches.forEach(m => rounds[m[1].round - 1].set(m[1].id, m[1]))

    return rounds
}

function populateRounds(rounds, matches, m) {
    rounds[m.round - 1].set(m.id, m)

    if(m.par1.getLoser !== undefined && !m.par1.getLoser) populateRounds(rounds, matches, matches.get(m.par1.id))
    if(m.par2.getLoser !== undefined && !m.par2.getLoser) populateRounds(rounds, matches, matches.get(m.par2.id))
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

function addGrandFinal(tableBody, final, tableCol, bracket) {
    let firstLineRight = -1
    let lastLineRight = -1
    let prevMatchRoundTableIndex = tableCol
    let counter = 0

    Array.from(tableBody.children).forEach(row => {
        for(let i = row.children.length; i <= tableCol; i++) row.appendChild(document.createElement("td"))
    })

    prevMatchRoundTableIndex = bracket.matches.get(final.par1.id).round*3
    while(tableBody.children[counter].children[prevMatchRoundTableIndex - 3].id !== final.par1.id) counter++
    tableBody.children[counter].children[prevMatchRoundTableIndex - 2].classList.add("line-below")
    firstLineRight = counter + 1

    prevMatchRoundTableIndex = bracket.matches.get(final.par2.id).round*3
    while(tableBody.children[counter].children[prevMatchRoundTableIndex - 3].id !== final.par2.id) counter++
    tableBody.children[counter].children[prevMatchRoundTableIndex - 2].classList.add("line-right-below")
    lastLineRight = counter - 1
    
    for(let j = firstLineRight; j <= lastLineRight; j++) {
        tableBody.children[j].children[prevMatchRoundTableIndex - 2].classList.add("line-right")
    }

    let nextMatchIndex = Math.floor((firstLineRight + lastLineRight) / 2 + .5)
    for(let j = prevMatchRoundTableIndex - 1; j <= tableCol - 1; j++) {
        tableBody.children[nextMatchIndex].children[j].classList.add("line-below")
    }
    tableBody.children[nextMatchIndex].children[tableCol].classList.add("bracket-team")
    tableBody.children[nextMatchIndex].children[tableCol].id = final.id
    tableBody.children[nextMatchIndex + 1].children[tableCol].classList.add("bracket-team")
    tableBody.children[nextMatchIndex + 1].children[tableCol].id = final.id
}

function generateNextRound(tableBody, round, tableCol, bracket) {
    for (const entry of round.entries()) {
        let m = entry[1]
        if(m.round*3 - 3 === tableCol) {
            if(isParticipant(m.par1)) prependRow(tableBody)
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
        if(referencesMatch(m.par1) && !m.par1.getLoser) {
            prevMatchRoundTableIndex = bracket.matches.get(m.par1.id).round*3
            while(tableBody.children[counter].children[prevMatchRoundTableIndex - 3].id !== m.par1.id) counter++
            tableBody.children[counter].children[prevMatchRoundTableIndex - 2].classList.add("line-below")
            firstLineRight = counter + 1
        }

        if(referencesMatch(m.par2) && !m.par2.getLoser) {
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
            counter++
            addMatchHTML(tableBody, counter, tableCol, m)
            connectMatchFromAbove(tableBody, counter - 2, tableCol - 2, counter, tableCol - 1)
            counter++
        }
    })
}

function connectMatchFromAbove(tableBody, y1, x1, y2, x2) {
    expandTable(tableBody, y2, x2)

    tableBody.children[y1].children[x1].classList.add("line-below")
    for(let y = y1 + 1; y <= y2; y++) tableBody.children[y].children[x1].classList.add("line-right")
    tableBody.children[y2].children[x2].classList.add("line-below")
}

function addMatchHTML(tableBody, rowNum, colNum, m) {
    expandTable(tableBody, rowNum, colNum)

    tableBody.children[rowNum].children[colNum].classList.add("bracket-team")
    tableBody.children[rowNum].children[colNum].id = m.id
    if(isParticipant(m.par1)) tableBody.children[rowNum].children[colNum].textContent = m.par1.name
    rowNum++
    tableBody.children[rowNum].children[colNum].classList.add("bracket-team")
    tableBody.children[rowNum].children[colNum].id = m.id
    if(isParticipant(m.par2)) tableBody.children[rowNum].children[colNum].textContent = m.par2.name
}

function expandTable(tableBody, rowNum, colNum) {
    expandRows(tableBody, rowNum)
    expandCols(tableBody, colNum)
}

function expandCols(tableBody, colNum) {
    Array.from(tableBody.children).forEach(row => {
        for(let i = row.children.length; i <= colNum; i++) row.appendChild(document.createElement("td"))
    })
}

function expandRows(tableBody, rowNum) {
    for(let i = tableBody.children.length; i <= rowNum + 1; i++) tableBody.appendChild(document.createElement("tr"))
    expandCols(tableBody, tableBody.children[0].children.length)
}

function generatePreviousRound(tableBody, round, tableCol, bracket) {
    for(let i = tableBody.children.length - 1; i >= 0; i--) {
        let cell = tableBody.children[i].children[tableCol + 3]
        if(cell.classList.contains("bracket-team")) {
            let m = bracket.matches.get(cell.id)
            if(referencesMatch(m.par2)) appendRow(tableBody)
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
                if(referencesMatch(m2.par1) && !m2.par1.getLoser && m2.par1.id === id) {
                    // put m before and above m2!
                    tableBody.children[i].children[tableCol + 2].classList.add("line-below")
                    tableBody.children[i].children[tableCol + 1].classList.add("line-right")
                    tableBody.children[i - 1].children[tableCol + 1].classList.add("line-right")
                    tableBody.children[i - 2].children[tableCol + 1].classList.add("line-below")

                    tableBody.children[i - 1].children[tableCol].classList.add("bracket-team")
                    tableBody.children[i - 2].children[tableCol].classList.add("bracket-team")
                    tableBody.children[i - 1].children[tableCol].id = m.id
                    tableBody.children[i - 2].children[tableCol].id = m.id

                    if(isParticipant(m.par2)) tableBody.children[i - 1].children[tableCol].textContent = m.par2.name
                    if(isParticipant(m.par1)) tableBody.children[i - 2].children[tableCol].textContent = m.par1.name

                    break
                } else if(referencesMatch(m2.par2) && !m2.par2.getLoser && m2.par2.id === id) {
                    // put m before and below m2!
                    tableBody.children[i].children[tableCol + 2].classList.add("line-below")
                    tableBody.children[i + 1].children[tableCol + 1].classList.add("line-right-below")

                    tableBody.children[i + 1].children[tableCol].classList.add("bracket-team")
                    tableBody.children[i + 2].children[tableCol].classList.add("bracket-team")
                    
                    if(isParticipant(m.par1)) tableBody.children[i + 1].children[tableCol].textContent = m.par1.name
                    if(isParticipant(m.par2)) tableBody.children[i + 2].children[tableCol].textContent = m.par2.name

                    break
                }
            }
        }
    })
}

function referencesMatch(par) {
    return par.getLoser !== undefined
}

function isParticipant(par) {
    return par.getLoser === undefined
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