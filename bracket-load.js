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
        let rounds = b.getRounds()

        let maxNumMatches = rounds[0].size
        let maxNumMatchesIndex = 0

        if(rounds[1].size > maxNumMatches) {
            maxNumMatches = rounds[1].size
            maxNumMatchesIndex = 1
        }

        let tableHeight = maxNumMatches * 3 - 1
        
        for(let i = 0; i < tableHeight; i++) {
            let row = document.createElement("tr")
            tableBody.appendChild(row)
        }

        let counter = 0
        rounds[0].forEach((m) => {
            let row1 = document.createElement("td")
            row1.classList.add("bracket-team")
            row1.textContent = m.par1.name
            row1.id = m.id
            tableBody.children[counter++].appendChild(row1)
            let row2 = document.createElement("td")
            row2.classList.add("bracket-team")
            row2.textContent = m.par2.name
            row2.id = m.id
            tableBody.children[counter++].appendChild(row2)
            if(counter !== tableHeight) {
                let row3 = document.createElement("td")
                tableBody.children[counter++].appendChild(row3)
            }
        })

        for(let i = 1; i < rounds.length; i++) {
            for(let j = 0; j < tableBody.children.length; j++) {
                tableBody.children[j].appendChild(document.createElement("td"))
                tableBody.children[j].appendChild(document.createElement("td"))
                tableBody.children[j].appendChild(document.createElement("td"))
            }

            counter = 0
            rounds[i].forEach((m) => {
                let firstLineRight = -1
                let lastLineRight = -1
                if(m.par1 instanceof MatchReference) {
                    while(tableBody.children[counter].children[i*3 - 3].id !== m.par1.id) counter++
                    tableBody.children[counter].children[i*3 - 2].classList.add("line-below")
                    firstLineRight = counter + 1
                }

                while(tableBody.children[counter].children[i*3 - 3].id !== m.par2.id) counter++
                tableBody.children[counter].children[i*3 - 2].classList.add("line-right-below")
                lastLineRight = counter - 1

                if(firstLineRight !== -1) {
                    for(let j = firstLineRight; j <= lastLineRight; j++) {
                        tableBody.children[j].children[i*3 - 2].classList.add("line-right")
                    }

                    let nextMatchIndex = Math.floor((firstLineRight + lastLineRight) / 2 + .5)

                    tableBody.children[nextMatchIndex].children[i*3 - 1].classList.add("line-below")
                    tableBody.children[nextMatchIndex].children[i*3].classList.add("bracket-team")
                    tableBody.children[nextMatchIndex].children[i*3].id = m.id
                    tableBody.children[nextMatchIndex + 1].children[i*3].classList.add("bracket-team")
                    tableBody.children[nextMatchIndex + 1].children[i*3].id = m.id
                } else {
                    tableBody.children[lastLineRight].children[i*3 - 1].classList.add("line-below")
                    tableBody.children[lastLineRight].children[i*3].classList.add("bracket-team")
                    tableBody.children[lastLineRight].children[i*3].id = m.id
                    tableBody.children[lastLineRight].children[i*3].id = m.par1.name
                    tableBody.children[lastLineRight + 1].children[i*3].classList.add("bracket-team")
                    tableBody.children[lastLineRight + 1].children[i*3].id = m.id
                }


            })
        }

        //console.log(tableBody.children[3])

        //tr.textContent = JSON.stringify(rounds.map((r) => Object.fromEntries(r)))

    } else {
        let tr = document.createElement("tr")
        tr.textContent = "Double Elim not implemented yet"
        tableBody.appendChild(tr)
    }

    table.appendChild(tableBody)
    container.appendChild(table)

    return container
}